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
    exports.Storage         = function( storageType, driverName, engineName, storagePathOrURI, params )
    {
        this.storageType        = storageType == null ? 'volatile' : storageType;
        this.driverName         = driverName == null ? '' : driverName;
        this.engineName         = engineName == null ? 'file' : engineName;
        this.storagePathOrURI   = storagePathOrURI == null ? '' : storagePathOrURI;
        this.params             = params == null ? '' : params;
        this.getItem            = null;
        this.setItem            = null;

        if( driverName != '' )
        {
            //loading driver
            mu.require( driverName );
            var localConnector = mu[ driverName ].load( engineName, storagePathOrURI, params );

            this.getItemsList   = localConnector.listGetterFnc;
            this.setItemsList   = localConnector.listSetterFnc;
            this.addItemInList  = localConnector.listAddItemFnc;
            this.delItemInList  = localConnector.listDelItemFnc;
            this.getItem        = localConnector.itemGetterFnc;
            this.setItem        = localConnector.itemSetterFnc;

            return;
        }

        //this is a else
        if( this.storageType == 'persistent' )
        {
            // by default the storage engine will be a file synchronous write or localStorage
            // by default the storage file will be in the current directory / storage
            this.storagePathOrURI   = typeof window !== "undefined" ? '' : './';
            this.getItem            = function( keyUUID )
            {
                return typeof window !== "undefined" ?
                    window.localStorage.getItem( ( this.storagePathOrURI != null ? this.storagePathOrURI : '' ) + keyUUID ) :
                    mu.fs.readFileSync( ( this.storagePathOrURI != null ? this.storagePathOrURI : '' ) + keyUUID, 'utf8' );
            };
            this.setItem            = function( keyUUID, newVal )
            {
                return typeof window !== "undefined" ?
                    window.localStorage.setItem( ( this.storagePathOrURI != null ? this.storagePathOrURI : '' ) + keyUUID, newVal ) :
                    mu.fs.writeFileSync( ( this.storagePathOrURI != null ? this.storagePathOrURI : '' ) + keyUUID, newVal, 'utf8' );
            };
        }
        else if( this.storageType == 'session' )
        {
            this.storagePathOrURI   = '/tmp/';
            this.getItem            = function( keyUUID )
            {
                return typeof window !== "undefined" ?
                    window.sessionStorage.getItem( this.storagePathOrURI + keyUUID ) :
                    mu.fs.readFileSync( this.storagePathOrURI + keyUUID, 'utf8' );
            };
            this.setItem            = function( keyUUID, newVal )
            {
                typeof window !== "undefined" ?
                    window.sessionStorage.setItem( this.storagePathOrURI + keyUUID, newVal ) :
                    mu.fs.writeFileSync( this.storagePathOrURI + keyUUID, newVal, 'utf8' );
            };
        }
    };


    exports.Storage.prototype.ownObject     = function( object )
    {
        var objectPrototype = Object.getPrototypeOf( object );

        for( var currentPropertyName in objectPrototype )
        {
            // TODO : check if creating anonymous function for getters / setter is mandatory in that case
            // TODO : check if toString() is mandatory to avoid object name collision
            // TODO : add UUID handling
            object.prototype.__defineGetter__
                (
                    currentPropertyName,
                    this.getItem == null ?
                        function() { return currentPropertyName; } :
                        function() { return this.getItem( object + ':' + currentPropertyName ) }
                );
            object.prototype.__defineSetter__
                (
                    currentPropertyName,
                    this.getItem == null ?
                        function( newValue ) { currentPropertyName = newValue; } :
                        function( newValue ) { this.setItem( object + ':' + currentPropertyName, newValue ) }
                );
        }
    };


    return exports;
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'Store' ] = { } : exports );

