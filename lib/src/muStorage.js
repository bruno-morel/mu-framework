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

( function ( exports )
{
    exports.Drivers   = [ ];
    exports.Driver          = function( storageType, driverName, storagePathOrURI, userLogin, userPassword, params )
    {
        var newStorage              = this;

        newStorage.storageType          = storageType == null ? 'volatile' : storageType;
        newStorage.storagePathOrURI     = storagePathOrURI == null ? '~/' : storagePathOrURI;
        newStorage.userLogin            = userLogin;
        newStorage.userPassword         = userPassword;
        newStorage.params               = params;
	    newStorage.generateMuUID        = function ( )
		    {// based on http://slavik.meltser.info/the-efficient-way-to-create-guid-uuid-in-javascript-with-explanation/
			    /**
			     * Generates a GUID string, according to RFC4122 standards.
			     * @returns {String} The generated GUID.
			     * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
			     * @author Slavik Meltser (slavik@meltser.info).
			     * @link http://slavik.meltser.info/?p=142
			     */
			    function _p8(s)
			    {
				    var p = (Math.random().toString(16)+"000000000").substr(2,8);
				    return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
			    }
			    return _p8() + _p8(true) + _p8(true) + _p8();
		    };

	    //this allow advanced driver to separate connection / credentials for read
	    newStorage.readPool             = null;

        var enginePath                  = '';

        if( params != null && params.enginePath != null )
            enginePath = params.enginePath;

        else if( driverName != null )
            enginePath = '../src/drivers/storage/muDrv.' + driverName;

        else
            enginePath = '';

        if( newStorage.driver == null )
        {
            newStorage.driver               = { };
            newStorage.driver.driverName    = driverName == null ? 'memory' : driverName;
            newStorage.driver.enginePath    = enginePath == null ? '' : enginePath;
            newStorage.driver.lastMuUID     = { };
	        newStorage.driver.relConnection = null;
            newStorage.driver.relInstance   = null; //release the object instance from the engine
	        newStorage.driver.keepAlive     = null; //force the driver to wait until disconnecting the storage
	        newStorage.driver.freeToDie     = null; //free the driver to disconnect the storage
            newStorage.driver.getItem       = null; //storage engine default getter
            newStorage.driver.setItem       = null; //storage engine default setter
	        newStorage.driver.delItem       = null; //storage engine default delete
            //the default engine function to take ownership of an object
            newStorage.driver.ownInstance   = function( objectStorageObject, objectPrototypeName, objectToOwn )
	            {
		            /*
	                if( objectStorageObject.driver.lastMuUID[ objectPrototypeName ] != null )
	                    objectStorageObject.driver.lastMuUID[ objectPrototypeName ]++;
	                else
	                    objectStorageObject.driver.lastMuUID[ objectPrototypeName ] = 1;
					*/
	                objectToOwn.muUID = objectStorageObject.generateMuUID();//objectStorageObject.driver.lastMuUID[ objectPrototypeName ];
	                Object.defineProperty
	                (
	                    objectToOwn,
	                    'muUID',
	                    {
	                        writable    : false,
	                        enumerable  : false,
	                        configurable: true
	                    }
	                );

	                return objectStorageObject.driver.lastMuUID[ objectPrototypeName ];
	            };
        }

        if( newStorage.driver.driverName != 'memory' && newStorage.enginePath != '' )
        {
            //loading driver if it is not already
            if(  mu.Storage.Drivers[ driverName ] == null )
                mu.Storage.Drivers[ driverName ] = mu.require( enginePath );

            var storageEngine = mu.Storage.Drivers[ driverName ].prepare( storagePathOrURI, userLogin, userPassword, params );

            newStorage.driver           = storageEngine;

            if( storageEngine.lastStorageURL != null )
                newStorage.storagePathOrURI = storageEngine.lastStorageURL;
        }
        //these are the default storage engine 'provided' by the os / browser
        //      1- no storage   = which means the memory javascript model (browser and node)
        //      2- 'persistent' = which means the localStorage API (browser) or the OS filesystem (node)
        //      3- 'session'    = which means the sessionStorage API (browser) or the OS filesystem (node)
        else if( newStorage.storageType == 'persistent' )
        {
            // by default the storage engine will be a file synchronous write or localStorage (WebStorage)
            // by default the storage file will be in the current directory / storage
            if( !storagePathOrURI )
                newStorage.storagePathOrURI   = mu.runinbrowser ? '' : './';
            else if( !mu.runinbrowser )
            {
	            try
	            {
					if( !mu.fs.statSync( newStorage.storagePathOrURI ).isDirectory() )
			            mu.fs.mkdirSync( newStorage.storagePathOrURI );
	            }
	            catch( error ){ mu.fs.mkdirSync( newStorage.storagePathOrURI ); }
            }

            if( mu.runinbrowser )
	            newStorage.driver.enginePath = 'localStorage';
            else
	            newStorage.driver.enginePath = 'file';

            newStorage.driver.getItem = function( storagePrototype, objectURNEnd )
                {
                    var finalPath = ( storagePrototype.storagePathOrURI != null ? storagePrototype.storagePathOrURI : '' ) + objectURNEnd;
                    return ( mu.runinbrowser ?
                                window.localStorage.getItem( finalPath ) :
                                mu.fs.readFileSync( finalPath, 'utf8' ) );
                };
            newStorage.driver.setItem = function( storagePrototype, objectURNEnd, newVal )
                {
                    var finalPath = ( storagePrototype.storagePathOrURI != null ? storagePrototype.storagePathOrURI : '' ) + objectURNEnd;
                    return ( mu.runinbrowser ?
                                window.localStorage.setItem( finalPath, newVal ) :
                                mu.fs.writeFileSync( finalPath, newVal, 'utf8' ) );
                };
	        newStorage.driver.delItem = function( storagePrototype, objectURNEnd )
		        {
			        var finalPath = ( storagePrototype.storagePathOrURI != null ? storagePrototype.storagePathOrURI : '' ) + objectURNEnd;
			        return ( mu.runinbrowser ?
			                 window.localStorage.removeItem( finalPath ) :
			                 mu.fs.unlinkSync( finalPath ) );
		        };
        }
        else if( newStorage.storageType == 'session' )
        {
            // by default the storage engine will be a file synchronous write or sessionStorage (WebStorage)
            // by default the storage file will be in the /tmp directory
            if( !storagePathOrURI )
                newStorage.storagePathOrURI   = mu.runinbrowser ? '' : '/tmp/';
            else
            {
                if( !mu.path.exists( newStorage.storagePathOrURI ) )
                    mu.fs.mkdir( newStorage.storagePathOrURI );
            }

            if( mu.runinbrowser )
	            newStorage.driver.enginePath = 'sessionStorage';
            else
		        newStorage.driver.enginePath = 'file';

            newStorage.driver.getItem = function( storagePrototype, objectURNEnd, muUID )
                {
                    var finalPath = ( storagePrototype.storagePathOrURI != null ? storagePrototype.storagePathOrURI : '' ) + objectURNEnd;
                    return ( mu.runinbrowser ?
                                window.sessionStorage.getItem( finalPath ) :
                                mu.fs.readFileSync( finalPath, 'utf8' ) );
                };
            newStorage.driver.setItem = function( storagePrototype, objectURNEnd, newVal )
                {
                    var finalPath = ( storagePrototype.storagePathOrURI != null ? storagePrototype.storagePathOrURI : '' ) + objectURNEnd;
                    return ( mu.runinbrowser ?
                                window.sessionStorage.setItem( finalPath, newVal ) :
                                mu.fs.writeFileSync( finalPath, newVal, 'utf8' ) );
                };
	        newStorage.driver.delItem = function( storagePrototype, objectURNEnd )
		        {
			        var finalPath = ( storagePrototype.storagePathOrURI != null ? storagePrototype.storagePathOrURI : '' ) + objectURNEnd;
			        return ( mu.runinbrowser ?
			                 window.sessionStorage.removeItem( finalPath ) :
			                 mu.fs.unlinkSync( finalPath ) );
		        };
        }
	    else
            newStorage.driver.releaseConnection = function( )
                {
	                for( var curObjectInList in newStorage.driver.lastMuUID )
		                delete newStorage.driver.lastMuUID[ curObjectInList ];
                };

        return newStorage;
    };

	//TODO : see how we can 'replace' a prototype (is it even possible ?)
    exports.Driver.prototype.ownPrototype      = function( object, objectPrototypeName )
    {
        var storageEngine           = this;
        var oldPrototype            = object.prototype;
        var newPrototype            = function( )
            { //new constructor
                var newObject = oldPrototype.constructor( arguments );

                if( newObject.muUID == null )
                    storageEngine.ownInstance( newObject, objectPrototypeName );

                return newObject;
            };

        for( var enumerableProperty in oldPrototype )
            newPrototype[ enumerableProperty ] = oldPrototype[ enumerableProperty ];

        object.prototype = newPrototype;
    };


    exports.Driver.prototype.ownInstance     = function( objectToOwn, objectPrototypeName, optionalObjectInstanceList )
    {
        var storageEngine = this;
        var prototypeName = ( objectPrototypeName == null ? objectToOwn.constructor.name : objectPrototypeName );

        if( storageEngine.driver.ownInstance != null )
            storageEngine.driver.ownInstance( storageEngine, prototypeName, objectToOwn );

	    if( storageEngine.driver.relInstance != null )
		    objectToOwn.relInstance = function( ){ storageEngine.driver.relInstance( storageEngine, prototypeName, objectToOwn, optionalObjectInstanceList ); };

	    else if( storageEngine.driver.delItem != null )
	    {
	        objectToOwn.relInstance = function( )
		        {
			        for( var currentPropertyName in objectToOwn )
			        {
				        if( ( currentPropertyName != 'muUID' ) &&
				            ( typeof objectToOwn[ currentPropertyName ] == 'number' ||
				              typeof objectToOwn[ currentPropertyName ] == 'string' ||
				              typeof objectToOwn[ currentPropertyName ] == 'boolean' ) )
				        {
					        var propertyStorageID       = ( objectPrototypeName == null ? objectToOwn.constructor.name : objectPrototypeName ) +
					                                      ':' + ( objectToOwn.muUID == null ? 'default' : objectToOwn.muUID ) +
					                                      ':' + currentPropertyName;
					        storageEngine.driver.delItem( storageEngine, propertyStorageID );
				        }
			        }

			        if( optionalObjectInstanceList )
				        delete optionalObjectInstanceList[ prototypeName ][ objectToOwn.muUID ];

			        delete objectToOwn.muUID;
		        };
        }
	    else
	    {
		    objectToOwn.relInstance = function( )
			    {
				    for( var currentPropertyName in objectToOwn )
				        delete objectToOwn[ currentPropertyName ];

				    if( optionalObjectInstanceList )
					    delete optionalObjectInstanceList[ prototypeName ][ objectToOwn.muUID ];

				    delete objectToOwn.muUID;
			    };
	    }
	    Object.defineProperty
	    (
		    objectToOwn,
		    'relInstance',
		    {
			    writable    : false,
			    enumerable  : false,
			    configurable: true
		    }
	    );

        for( var currentPropertyName in objectToOwn )
            storageEngine.ownProperty( objectToOwn, currentPropertyName, prototypeName );

	    if( optionalObjectInstanceList )
	    {
		    if( !optionalObjectInstanceList[ prototypeName ] )
			    optionalObjectInstanceList[ prototypeName ] = { };

		    optionalObjectInstanceList[ prototypeName ][ objectToOwn.muUID ] = objectToOwn;
	    }
    };

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
            mu.warn( 'muUID is null or equal to zero. if you re not owning the prototype, it will be a problem ' );


        if( storageEngine.driver.setItem != null &&
            propertyIsOwnable )
        {
            //var value = objectOrPrototype[ propertyToOwn ];
            storageEngine.driver.setItem( storageEngine, propertyStorageID, objectOrPrototype[ propertyToOwn ] );
            objectOrPrototype.__defineSetter__
                (
                    propertyToOwn,
                    function( newValue ) { storageEngine.driver.setItem( storageEngine, propertyStorageID, newValue ) }
                );
        }

        if( storageEngine.driver.getItem != null &&
            propertyIsOwnable )
            objectOrPrototype.__defineGetter__
                (
                    propertyToOwn,
                    function() { return storageEngine.driver.getItem( storageEngine, propertyStorageID ) }
                );
    };

    return exports;
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'Storage' ] = { } : exports );

