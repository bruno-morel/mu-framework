/**
 * User: bruno
 * Date: 2012-11-26
 * Time: 7:29 PM
 *
 * muStore is the abstraction layer that allows different storage engine to interface into the mu framework
 *
 * it defines the minimum state stored by mu applications and the interface that every driver has to implement
 *
 * There's three type of storage driver in mu :
 *      - volatile : application-life based time span (example : memory, temp file, URL params [GET+POST]...)
 *      - session : client-session based time span (example : cookie, user session DB...)
 *      - persistent : hard store (database, distributed storage...)
 *
 *  Each storage driver can have multiple storage engine
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


// includes
mu.require( 'fs' );


// TODO : write function for :
// TODO :     - getting list of data
// TODO :     - setting data list (adding, updating list, removing from list, deleting list)
// TODO :     - getting data on specific ID / keys
// TODO :     - setting data on specific ID / keys
( function ( exports )
{
    exports.loadedStorage   = [ ];
    exports.Driver          = function( storageType, driverName, engineName, storagePathOrURI, userLogin, userPassword, params )
    {
        var newStorage      = this;
        newStorage.storageType        = storageType == null ? 'volatile' : storageType;
        newStorage.driverName         = driverName == null ? 'memory' : driverName;
        newStorage.engineName         = engineName == null ? '' : engineName;
        newStorage.storagePathOrURI   = storagePathOrURI == null ? '~/' : storagePathOrURI;
        newStorage.userLogin          = userLogin;
        newStorage.userPassword       = userPassword;
        newStorage.params             = params;

        newStorage.lastMuUID          = { };
        newStorage.newMuUID           = null; //new object UID constructor helper function
        newStorage.delMuUID           = null; //delete object helper function
        newStorage.getItem            = null; //storage engine default getter
        newStorage.setItem            = null; //storage engine default setter
        newStorage.storageURI         = this.driverName +
                                  ( newStorage.userLogin != null ? newStorage.userLogin : '' ) +
                                  ( newStorage.userPassword != null ? newStorage.userPassword : '' ) +
                                  '://' +
                                        newStorage.storagePathOrURI;
        newStorage.newMuUID           = function( objectStorageObject, objectPrototypeName )
            {
                if( objectStorageObject.lastMuUID[ objectPrototypeName ] != null )
                    objectStorageObject.lastMuUID[ objectPrototypeName ]++;
                else
                    objectStorageObject.lastMuUID[ objectPrototypeName ] = 1;

                return objectStorageObject.lastMuUID[ objectPrototypeName ];
            };

        if( newStorage.driverName != 'memory' && newStorage.engineName != '' )
        {
            //loading driver
            mu.require( driverName );
            var storageEngine = mu[ driverName ].load( engineName, storagePathOrURI, userLogin, userPassword, params );

            newStorage.newMuUID       = storageEngine.itemAddFnc;
            newStorage.delMuUID       = storageEngine.itemDelFnc;
            newStorage.getItem        = storageEngine.itemGetterFnc;
            newStorage.setItem        = storageEngine.itemSetterFnc;

            newStorage.addItemInList  = storageEngine.listAddItemFnc;
            newStorage.delItemInList  = storageEngine.listDelItemFnc;
            newStorage.getItemsList   = storageEngine.listGetterFnc;
            newStorage.setItemsList   = storageEngine.listSetterFnc;

            mu.Storage.loadedStorage[ newStorage.storageURI ] = this;
        }
        //these are the default storage engine 'provided' by the os / browser
        //      1- no storage   = which means the memory javascript model (browser and node)
        //      2- 'persistent' = which means the localStorage API (browser) or the OS filesystem (node)
        //      3- 'session'    = which means the sessionStorage API (browser) or the OS filesystem (node)
        else if( newStorage.storageType == 'persistent' )
        {
            // by default the storage engine will be a file synchronous write or localStorage (WebStorage)
            // by default the storage file will be in the current directory / storage
            newStorage.storagePathOrURI   = typeof window !== "undefined" ? '' : './';
            if( typeof window === "undefined" )
                newStorage.engineName = 'file';
            else
                newStorage.engineName = 'localStorage';

            newStorage.getItem            = function( storagePrototype, objectURNEnd )
                {
                    var finalPath = ( storagePrototype.storagePathOrURI != null ? storagePrototype.storagePathOrURI : '' ) + objectURNEnd;
                    return ( typeof window !== "undefined" ?
                                window.localStorage.getItem( finalPath ) :
                                mu.fs.readFileSync( finalPath, 'utf8' ) );
                };
            newStorage.setItem            = function( storagePrototype, objectURNEnd, newVal )
                {
                    var finalPath = ( storagePrototype.storagePathOrURI != null ? storagePrototype.storagePathOrURI : '' ) + objectURNEnd;
                    return ( typeof window !== "undefined" ?
                                window.localStorage.setItem( finalPath, newVal ) :
                                mu.fs.writeFileSync( finalPath, newVal, 'utf8' ) );
                };
        }
        else if( newStorage.storageType == 'session' )
        {
            // by default the storage engine will be a file synchronous write or sessionStorage (WebStorage)
            // by default the storage file will be in the /tmp directory
            newStorage.storagePathOrURI   = '/tmp/';
            if( typeof window === "undefined" )
                newStorage.engineName = 'file';
            else
                newStorage.engineName = 'sessionStorage';

            newStorage.getItem            = function( storagePrototype, objectURNEnd, muUID )
                {
                    var finalPath = ( storagePrototype.storagePathOrURI != null ? storagePrototype.storagePathOrURI : '' ) + objectURNEnd;
                    return ( typeof window !== "undefined" ?
                                window.sessionStorage.getItem( finalPath ) :
                                mu.fs.readFileSync( finalPath, 'utf8' ) );
                };
            newStorage.setItem            = function( storagePrototype, objectURNEnd, newVal )
                {
                    var finalPath = ( storagePrototype.storagePathOrURI != null ? storagePrototype.storagePathOrURI : '' ) + objectURNEnd;
                    return ( typeof window !== "undefined" ?
                                window.sessionStorage.setItem( finalPath, newVal ) :
                                mu.fs.writeFileSync( finalPath, newVal, 'utf8' ) );
                };
        }

        return newStorage;
    };

    /*
    exports.Storage.prototype.ownPrototype     = function( object, objectPrototypeName )
    {
        var storageEnginePrototype = this;
        var objectOldPrototype = Object.getPrototypeOf( object );
        var objectPrototypeName = ( objectPrototypeName == null ? object.constructor.name : objectPrototypeName );
        var newPrototype = null;

        if( storageEnginePrototype.newMuUID != null )
        {
            newPrototype = function( )
                {
                    var newMuIDFromStorage = storageEnginePrototype.newMuUID( storageEnginePrototype, objectPrototypeName );
                    var newObjectFromOldPrototype = objectOldPrototype.constructor.call( arguments );
                    newObjectFromOldPrototype.muUID = newMuIDFromStorage;
                };
        }

        if( storageEnginePrototype.delMuUID != null )
            newPrototype.delete      = function( )
                {
                    storageEnginePrototype.delMuUID( object.muUID );
                };

        for( var currentPropertyName in objectOldPrototype )
        {
            // TODO : check if creating anonymous function for getters / setter is mandatory in that case
            // TODO : check if toString() is mandatory to avoid object name collision
            // TODO : add UUID handling
            newPrototype.__defineGetter__
                (
                    currentPropertyName,
                    storageEnginePrototype.getItem == null ?
                        function() { return currentPropertyName; } :
                        function() { return storageEnginePrototype.getItem( objectPrototype, currentPropertyName + ':' + this.muUID ) }
                );
            newPrototype.__defineSetter__
                (
                    currentPropertyName,
                    storageEnginePrototype.setItem == null ?
                        function( newValue ) { currentPropertyName = newValue; } :
                        function( newValue ) { storageEnginePrototype.setItem( objectPrototype, currentPropertyName + ':' + this.muUID, newValue ) }
                );
        }
        storageEnginePrototype[ objectPrototypeName ] = newPrototype;
    };
    */

    exports.Driver.prototype.ownProperty = function( objectOrPrototype, propertyToOwn, uniqueName )
    {
        var storageEngine           = this;
        var propertyStorageID       = ( uniqueName == null ? objectOrPrototype.constructor.name : uniqueName ) +
                                      ':' + ( objectOrPrototype.muUID == null ? 'default' : objectOrPrototype.muUID ) +
                                      ':' + propertyToOwn;
        var propertyIsOwnable           = ( propertyToOwn != 'muUID' ) &&
                                      ( typeof objectOrPrototype[ propertyToOwn ] == 'number' ||
                                        typeof objectOrPrototype[ propertyToOwn ] == 'string' ||
                                        typeof objectOrPrototype[ propertyToOwn ] == 'boolean' );

        if( objectOrPrototype.muUID == null ||
            objectOrPrototype.muUID == 0 )
            mu.warn( 'muID is null or equal to zero. if you re not owning the prototype, it will be a problem ' );


        if( storageEngine.setItem != null &&
            propertyIsOwnable )
        {
            //var value = objectOrPrototype[ propertyToOwn ];
            storageEngine.setItem( storageEngine, propertyStorageID, objectOrPrototype[ propertyToOwn ] );
            objectOrPrototype.__defineSetter__
                (
                    propertyToOwn,
                    function( newValue ) { storageEngine.setItem( storageEngine, propertyStorageID, newValue ) }
                );
        }

        if( storageEngine.getItem != null &&
            propertyIsOwnable )
            objectOrPrototype.__defineGetter__
                (
                    propertyToOwn,
                    function() { return storageEngine.getItem( storageEngine, propertyStorageID ) }
                );
    };

    exports.Driver.prototype.ownObject     = function( objectToOwn, objectPrototypeName )
    {
        var storageEngine = this;
        var prototypeName = ( objectPrototypeName == null ? objectToOwn.constructor.name : objectPrototypeName );

        if( storageEngine.newMuUID == null )
            return;

        var newMuIDFromStorage = storageEngine.newMuUID( storageEngine, prototypeName );
        objectToOwn.muUID = newMuIDFromStorage;

        if( storageEngine.delMuUID != null )
            objectToOwn.delete           = function( ){ storageEngine.delMuUID( object.muUID ); };

        for( var currentPropertyName in objectToOwn )
            storageEngine.ownProperty( objectToOwn, currentPropertyName, prototypeName );
    };


    return exports;
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'Storage' ] = { } : exports );

