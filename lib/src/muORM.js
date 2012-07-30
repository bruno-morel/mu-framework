/**
 * Created by bruno
 * 12-02-24 4:42 PM
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


// includes
mu.require( 'crypto' );
mu.require( 'fs' );


// TODO : add a hash to handle schema upgrades
// TODO : add setter and getter trap when changing the storage.type
( function ( exports )
{

    exports.Schema = function( pathSchemas )
    {
        this.pathSchemas = '';
        if( pathSchemas != null )
            this.pathSchemas = pathSchemas;

        // by default the storage engine will be a file synchronous write or localStorage
        // by default the storage file will be in the current directory / storage
        this.persistentStorage      =
        {
            type            : 'file-sync',
            storagePath     : typeof window !== "undefined" ? '' : './',
            getItem : function( muORMPersistentStoragePath, keyUUID )
            {
                return typeof window !== "undefined" ?
                        window.localStorage.getItem( ( muORMPersistentStoragePath != null ? muORMPersistentStoragePath : '' ) + keyUUID ) :
                        mu.fs.readFileSync( ( muORMPersistentStoragePath != null ? muORMPersistentStoragePath : '' ) + keyUUID, 'utf8' );
            },

            setItem : function( muORMPersistentStoragePath, keyUUID, newVal )
            {
                return typeof window !== "undefined" ?
                        window.localStorage.setItem( ( muORMPersistentStoragePath != null ? muORMPersistentStoragePath : '' ) + keyUUID, newVal ) :
                        mu.fs.writeFileSync( ( muORMPersistentStoragePath != null ? muORMPersistentStoragePath : '' ) + keyUUID, newVal, 'utf8' );
            }
        };
        this.sessionStorage          =
        {
            type            : 'file-sync',
            storagePath     : '/tmp/',
            getItem : function( muORMSessionStoragePath, keyUUID )
            {
                return typeof window !== "undefined" ?
                        window.sessionStorage.getItem( muORMSessionStoragePath + keyUUID ) :
                        mu.fs.readFileSync( muORMSessionStoragePath + keyUUID, 'utf8' );
            },
            setItem : function( muORMSessionStoragePath, keyUUID, newVal )
            {
                typeof window !== "undefined" ?
                    window.sessionStorage.setItem( muORMSessionStoragePath + keyUUID, newVal ) :
                    mu.fs.writeFileSync( muORMSessionStoragePath + keyUUID, newVal, 'utf8' );
            }
        };
        this.objectList = {};
    };


    exports.Schema.prototype.setPathSchemas = function( pathSchemas )
    {
        this.pathSchemas = '';
        if( pathSchemas != null )
            this.pathSchemas = pathSchemas;
    };


    /**
     * load the db scheme, either from one file or from a set of file into the default / specified directory
     *
     * @param   {String} [schemaObjectName]   the directory to browse for the db scheme
     */
    exports.Schema.prototype.loadDBSchema = function( schemaObjectName )
    {
        var finalurl = '';
        if( this.pathSchemas != null )
            finalurl = this.pathSchemas;
        finalurl += schemaObjectName + '.jschema';

        var schemacode = '';

        mu.debug( 'loading schema : ' + finalurl );
        schemacode = mu.fs.readFileSync( finalurl, 'utf8' );

        if( schemacode == '' )
        {
            mu.warn('db schema not present...we ll be db-less. going on' );
            return false;
        }

        return loadDbSchemaFromCode( this, schemacode, schemaObjectName );
    };


    /**
     * translate a JSON db schema code into a javascript object prototype
     *
     * @param {String}                  jsonSnippet     a string containing the json data to be translated
     * @param {String}                  jsObjectname    the name of the resulting Object
     */
    var loadDbSchemaFromCode = function( muORMSchema, jsonSnippet, jsObjectname )
    {
        var objectGlobal        = null;
        var parsedObject        = null;
        var shafactory          = '';//crypto.createHash( 'sha256' );

        //shafactory.update( jsonSnippet );
        //snippethash = shafactory.digest( 'hex' );
        //mu.log( 'object hash is : ' + snippethash );

        // we check by inputting that into JSON.parse
        mu.log( 'building global object ' + jsObjectname );
        var scope = ( mu.runinbrowser ? window : global );

        with( scope )
        {
            this[ jsObjectname ] = function ( )
            {
                var objectPrototype = Object.getPrototypeOf( this );

                for( var defaultValueName in objectPrototype )
                {
                    if( defaultValueName == 'constraint' ||
                        defaultValueName == 'defaultValue' ||
                        defaultValueName == 'storageType' )
                        mu.debug( 'skipping property table in prototype' );

                    else if( objectPrototype[ "constraint" ] != null &&
                        objectPrototype[ "constraint" ][ defaultValueName ] != null )
                        this[ defaultValueName ] = objectPrototype[ "constraint" ][ defaultValueName ]( objectPrototype[ "defaultValue" ][ defaultValueName ] );

                    else
                        this[ defaultValueName ] = objectPrototype[ "defaultValue" ][ defaultValueName ];
                }
            };
        }
        objectGlobal        = scope[ jsObjectname ];

        try{ parsedObject = JSON.parse( jsonSnippet ); }
        catch( e ){ return mu.error( 'this is not a valid json schema file. aborting.' ); }

        //jscodesnippet = 'function ' + jsObjectname + '() { ';
        //jscodesnippet += 'this.' + jsObjectname + 'objectversionhash = ' + "'" + snippethash + "'" + '; ';

        for( var objectProperty in parsedObject )
        {
            if( objectProperty.length != 0 )
                mapObjectPropertiesForProperty( muORMSchema, jsObjectname, objectGlobal, objectProperty, parsedObject[ objectProperty ] );

            objectGlobal[ "prototype" ][ objectProperty ] = objectProperty;
        }
        mu.debug( 'resulting javascript prototype : ' + objectGlobal );

        muORMSchema.objectList[ jsObjectname ] = objectGlobal;

        return true;
    };


    /**
     * translate an array of properties into constraint and default value for an object
     *
     * @param {String}                  objectName      the name of the object to prototype
     * @param {String}                  objectGlobal    the adress of the resulting object in the global adress space
     * @param {String}                  objectProperty  the property we are mapping
     * @param {String}                  objectPropertyProperties    the mapping of properties for this objectName property
     */
    var mapObjectPropertiesForProperty = function( muORMSchema, objectName, objectGlobal, objectProperty, objectPropertyProperties )
    {
        //setting the default array if they don't exist already
        if( objectGlobal.prototype[ "defaultValue" ] == null )
            objectGlobal.prototype[ "defaultValue" ] = [ ];

        if( objectGlobal.prototype[ "storageType" ] == null )
            objectGlobal.prototype[ "storageType" ] = [ ];

        if( objectGlobal.prototype[ "constraint" ] == null )
            objectGlobal.prototype[ "constraint" ] = [ ];

        //seting up default initiator if the property has a type
        if( objectPropertyProperties[ "type" ] != null )
            objectGlobal.prototype[ "constraint" ][ objectProperty ] = setInitiator( objectPropertyProperties[ "type" ] );


        //seting up default value
        if( objectPropertyProperties[ "defaultValue" ] != null )
            objectGlobal.prototype[ "defaultValue" ][ objectProperty ] = objectPropertyProperties[ "defaultValue" ];


        //setting up getter depending of the storage type
        switch( objectPropertyProperties[ "storageType" ] )
        {
            case 'persistent':
                objectGlobal.prototype.__defineGetter__( objectProperty, function()
                    {
                        return muORMSchema.persistentStorage.getItem( muORMSchema.persistentStorage.storagePath, objectName + ':' + objectProperty );
                    } );
                break;

            case 'session':
                objectGlobal.prototype.__defineGetter__( objectProperty, function()
                    {
                        return muORMSchema.sessionStorage.getItem( muORMSchema.sessionStorage.storagePath, objectName + ':' + objectProperty );
                    } );
                break;

            default:
                objectGlobal.prototype.__defineGetter__( objectProperty, function()
                    {
                        return objectProperty;
                    } );
        }
        //setting up setter depending of the storage type
        switch( objectPropertyProperties[ "storageType" ] )
        {
            case 'persistent':
                objectGlobal.prototype.__defineSetter__( objectProperty, function( newVal )
                    {
                        muORMSchema.persistentStorage.setItem( muORMSchema.persistentStorage.storagePath, objectName + ':' + objectProperty, newVal );
                    } );
                break;

            case 'session':
                objectGlobal.prototype.__defineSetter__( objectProperty, function( newVal )
                    {
                        muORMSchema.sessionStorage.setItem( muORMSchema.sessionStorage.storagePath, objectName + ':' + objectProperty, newVal );
                    } );
                break;

            default:
                objectGlobal.prototype.__defineSetter__( objectProperty, function( newVal )
                    {
                        objectProperty = newVal;
                    } );
        }
        //seting up the storage type or "volatile", if it's not specified
        if( objectPropertyProperties[ "storageType" ] != null )
            objectGlobal.prototype[ "storageType" ][ objectProperty ] = objectPropertyProperties[ "storageType" ];

        else
            objectGlobal.prototype[ "storageType" ][ objectProperty ] = "volatile";
    };


    /**
     * translate a JSON db schema code into a javascript object prototype
     *
     * @param {String}                  objectGlobal     a string containing the json data to be translated
     * @param {String}                  objectPropertyProperties    the name of the resulting prototype
     */
    var setInitiator = function ( propertyType )
    {
        switch( propertyType )
        {
            case "date":
                return dateInitiator;

            case "numeric":
                return numericInitiator;

            default:
                return defaultInitiator;
        }
    };


    /**
     * check if defaultValue is a date
     *
     * @param {String}                  objectGlobal     a string containing the json data to be translated
     */
    var dateInitiator = function ( defaultValue )
    {
        if( defaultValue == null )
            return new Date();

        var newDateObject = null;
        try{ newDateObject = new Date( defaultValue ); }
        catch( e ){ return mu.log( defaultValue + ' is not a valid date default value.' ); }

        if ( Object.prototype.toString.call( newDateObject ) !== "[object Date]" ||
            isNaN( Date.parse( defaultValue ) ) ||
            newDateObject.__proto__ === 'Invalid Date' )
        {
            mu.error( objectPropertyProperties[ "defaultValue" ] + ' is not a valid date default value.' );
            return null;
        }

        return newDateObject;
    };


    /**
     * check if defaultValue is a number (real or natural)
     *
     * @param {String}                  objectGlobal     a string containing the json data to be translated
     */
    var numericInitiator = function ( defaultValue )
    {
        if( defaultValue == null )
            return 0;

        var objectNumeric = defaultValue;
        if( isNaN( parseFloat( objectNumeric ) ) ||
            !isFinite( objectNumeric ) )
        {
            mu.error( objectPropertyProperties[ "defaultValue" ] + ' is not a valid numeric default value.' )
            return null;
        }

        return objectNumeric;
    };


    /**
     * initiate any value with the default variable, as a string
     *
     * @param {String}                  objectGlobal     a string containing the json data to be translated
     */
    var defaultInitiator = function( defaultValue )
    {
        if( defaultValue == null )
            return '';

        return defaultValue;
    };

} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'ORM' ] = { } : exports );

