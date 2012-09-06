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

    exports.Schema                          = function( pathSchemas )
    {
        this.pathSchemas        = '';
        this.objectList         = { };
        this.objectInstances    = { };
        this.lastMuUID          = { };

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
    };


    exports.Schema.prototype.setPathSchemas = function( pathSchemas )
    {
        this.pathSchemas = '';
        if( pathSchemas != null )
            this.pathSchemas = pathSchemas;
    };

    exports.Schema.prototype.getSchemaName  = function( )
    {
        var splittedPath = this.pathSchemas.split( '.jschema' );

        splittedPath = splittedPath[ splittedPath.length - 1 ].split( '/' );

        return splittedPath[ splittedPath.length - ( splittedPath[ splittedPath.length - 1 ] == '' ? 2 : 1 ) ];
    }


    /**
     * load the all DB schema, either from the default / specified directory
     *
     */
    exports.Schema.prototype.loadAllDBSchema = function( )
    {
        var fileList = mu.fs.readdirSync( this.pathSchemas );

        for( var currentFileIndex = 0;
             currentFileIndex < fileList.length;
             currentFileIndex++ )
        {
            var extensionJSchemaIndex = fileList[ currentFileIndex ].indexOf( '.jschema' );
            if( extensionJSchemaIndex == fileList[ currentFileIndex ].length - 8 )
                this.loadDBSchema( fileList[ currentFileIndex ].substring( 0, fileList[ currentFileIndex ].indexOf( '.jschema' ) ) );
        }
    }


    /**
     * load the db schema, either from one file
     *
     * @param   {String} [schemaObjectName]   the directory to browse for the db scheme
     */
    exports.Schema.prototype.loadDBSchema   = function( schemaObjectName )
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
     * @param {String}                  muORMSchema     the schema object
     * @param {String}                  jsonSnippet     a string containing the json data to be translated
     * @param {String}                  jsObjectname    the name of the resulting Object
     */
    var loadDbSchemaFromCode            = function( muORMSchema, jsonSnippet, jsObjectname )
    {
        var objectGlobal        = null;
        var parsedObject        = null;
        var shafactory          = '';//crypto.createHash( 'sha256' );

        //shafactory.update( jsonSnippet );
        //snippethash = shafactory.digest( 'hex' );
        //mu.log( 'object hash is : ' + snippethash );

        // we check by inputting that into JSON.parse
        mu.debug( 'building global object ' + jsObjectname );
        var scope = ( mu.runinbrowser ? window : global );

        with( scope )
        {
            this[ jsObjectname ] = function( optionalObject )
                {   //this is the auto-generated dynamic constructor for the new prototype (javascript 'class')
                    var objectPrototype = Object.getPrototypeOf( this );

                    for( var prototypeAttributeName in objectPrototype )
                    {
                        if( prototypeAttributeName == 'constraint' ||
                            prototypeAttributeName == 'defaultValue' ||
                            prototypeAttributeName == 'storageType' ||
                            prototypeAttributeName == 'relationship' )
                            mu.debug( 'skipping property table in prototype' );

                        else if( objectPrototype[ "constraint" ] != null &&
                            objectPrototype[ "constraint" ][ prototypeAttributeName ] != null )
                            objectPrototype[ "constraint" ][ prototypeAttributeName ]( this, muORMSchema, prototypeAttributeName, objectPrototype, objectPrototype[ "defaultValue" ][ prototypeAttributeName ] );

                        else if( typeof( objectPrototype[ "defaultValue" ][ prototypeAttributeName ] ) !== 'undefined' )
                            this[ prototypeAttributeName ] = objectPrototype[ "defaultValue" ][ prototypeAttributeName ];

                        else//no default, we create an empty string to be sure to  have a property
                            this[ prototypeAttributeName ] = '';

                        /*if( objectPrototype[ 'relationship' ].indexOf( prototypeAttributeName ) != -1 &&
                            typeof( optionalObject ) !== 'undefined' &&
                            optionalObject != null )
                        {
                            for( var forcedValue in optionalObject )
                                this[ forcedValue ] = optionalObject[ forcedValue ];
                        }*/

                        if( this[ prototypeAttributeName ] == null )
                            this[ prototypeAttributeName ] = '';
                    }


                    //to avoid ID escalation, we increment the lastMuUID before using it
                    // to assign the new object muUID
                    var currentLastMuUID    = muORMSchema.lastMuUID[ jsObjectname ];
                    muORMSchema.lastMuUID[ jsObjectname ]++;
                    this.muUID              = currentLastMuUID + 1;

                    //we add the new object in the ORM Schema hash table
                    muORMSchema.objectInstances[ jsObjectname ][ this.muUID ] = this;
                };
        }
        objectGlobal        = scope[ jsObjectname ];

        try{ parsedObject = JSON.parse( jsonSnippet ); }
        catch( e ){ return mu.error( jsObjectname + ' is not a valid json schema file. aborting : ' + e.message ); }

        //jscodesnippet = 'function ' + jsObjectname + '() { ';
        //jscodesnippet += 'this.' + jsObjectname + 'objectversionhash = ' + "'" + snippethash + "'" + '; ';

        for( var objectProperty in parsedObject )
        {
            objectGlobal[ "prototype" ][ objectProperty ] = objectProperty;

            if( objectProperty.length != 0 )
                mapObjectPropertiesForProperty( muORMSchema, jsObjectname, objectGlobal, objectProperty, parsedObject[ objectProperty ] );
        }
        mu.debug( 'resulting javascript prototype : ' + objectGlobal );

        return true;
    };


    /**
     * translate an array of properties into constraint and default value for an object prototype
     *
     * @param {String}                  objectName      the name of the object to prototype
     * @param {String}                  objectGlobal    the address of the resulting object in the global address space
     * @param {String}                  objectProperty  the property we are mapping
     * @param {String}                  objectPropertyProperties    the mapping of properties for this objectName property
     */
    var mapObjectPropertiesForProperty  = function( muORMSchema, objectName, objectGlobal, objectProperty, objectPropertyProperties )
    {
        //setting the default array if they don't exist already
        if( objectGlobal.prototype[ "defaultValue" ] == null )
            objectGlobal.prototype[ "defaultValue" ] = [ ];

        if( objectGlobal.prototype[ "storageType" ] == null )
            objectGlobal.prototype[ "storageType" ] = [ ];

        if( objectGlobal.prototype[ "constraint" ] == null )
            objectGlobal.prototype[ "constraint" ] = [ ];

        if( objectGlobal.prototype[ "relationship" ] == null )
            objectGlobal.prototype[ "relationship" ] = [ ];

        //setting up default initiator if the property has a type
        if( objectPropertyProperties[ "type" ] != null )
            objectGlobal.prototype[ "constraint" ][ objectProperty ] = setInitiator( objectPropertyProperties[ "type" ] );


        //setting up default value
        if( objectPropertyProperties[ "defaultValue" ] != null )
            objectGlobal.prototype[ "defaultValue" ][ objectProperty ] = objectPropertyProperties[ "defaultValue" ];

        //setting up relationship object and cleaning up the non-useful bits
        if( objectPropertyProperties[ "type" ] == 'relationship' )
        {
            objectGlobal.prototype[ "relationship" ].push( objectProperty );
            objectGlobal.prototype[ "relationship" ][ objectProperty ] = objectPropertyProperties;
            delete objectPropertyProperties[ 'defaultValue' ];
            delete objectPropertyProperties[ 'type' ];
        }

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
                        if( objectPropertyProperties[ "type" ] != 'relationship' )
                            objectProperty = newVal;

                        else
                            setNewObjectWithRelationship( objectProperty, objectPropertyProperties, newVal );
                    } );
        }
        //seting up the storage type or "volatile", if it's not specified
        if( objectPropertyProperties[ "storageType" ] != null )
            objectGlobal.prototype[ "storageType" ][ objectProperty ] = objectPropertyProperties[ "storageType" ];

        else
            objectGlobal.prototype[ "storageType" ][ objectProperty ] = "volatile";

        //we instantiate the global ORM hash table
        muORMSchema.objectList[ objectName ]        = objectGlobal;
        muORMSchema.objectInstances[ objectName ]   = { };
        muORMSchema.lastMuUID[ objectName ]         = 0;
    };


    /**
     * set a new object into a relationship, either by adding it to the array or simply by removing the old value
     *
     * @param {String}                  objectGlobal    the address of the resulting object in the global address space
     * @param {String}                  objectProperty  the property we are mapping
     * @param {String}                  objectPropertyProperties    the mapping of properties for this objectName property
     */
    var setNewObjectWithRelationship    = function( valuePlaceholder, objectPrototypeProperties, objectToSetOrAdd )
    {
        switch( objectPrototypeProperties[ "cardinality" ] )
        {
            case 0:
                //this is a N-N relationship, so our placeholder should be an array
                //we will then push the new value into the array

                if( typeof( objectToSetOrAdd ) !== 'object' )
                    mu.warn( 'N-N relationship : the value to add is not an object' );

                if( typeof( objectPrototypeProperties[ 'destination' ] ) === 'undefined' )
                    //there's no related relationship object prototype, we just push it in the array
                    valuePlaceholder.push( objectToSetOrAdd );

                else if( Object.prototype.toString.apply( objectToSetOrAdd ) == objectPrototypeProperties[ 'destination' ] )
                {   //we got the right prototype of object to add,
                    //we add ourselves in the inverse relationship
                    objectToSetOrAdd[ objectPrototypeProperties[ 'inverse' ] ].push( this );
                    valuePlaceholder.push( objectToSetOrAdd );
                }
                else
                    mu.warn( 'N-N relationship : destination was not of the right prototype.');

                break;

            case 10:
                //this is a 1-N relationship, so our placeholder should be an array
                //we will then push the new value into the array
                //and replace the old value in the inverse relationship if there s one

                if( typeof( objectToSetOrAdd ) !== 'object' )
                    mu.warn( '1-N relationship : the value to add is not an object' );

                if( typeof( objectPrototypeProperties[ 'destination' ] ) === 'undefined' )
                    //there's no related relationship object prototype, we just push it in the array
                    valuePlaceholder.push( objectToSetOrAdd );

                else if( Object.prototype.toString.apply( objectToSetOrAdd ) == objectPrototypeProperties[ 'destination' ] )
                {   //we got the right prototype of object to add,
                    //we put ourselves in the inverse relationship
                    //and remove the link with the old related object
                    if( typeof( objectToSetOrAdd[ objectPrototypeProperties[ 'inverse' ] ] ) !== 'undefined' ||
                        objectToSetOrAdd[ objectPrototypeProperties[ 'inverse' ] ] != null )
                        objectToSetOrAdd[ objectPrototypeProperties[ 'inverse' ] ][ oldValue ] = null;

                    objectToSetOrAdd[ objectPrototypeProperties[ 'inverse' ] ] = this;
                    valuePlaceholder.push( objectToSetOrAdd );
                }
                else
                    mu.warn( '1-N relationship : destination was not of the right prototype.');
                break;

            default:
                //this is a 1-1 relationship
                //we will then move the new values
                //and replace the old value in the inverse relationship if there s one

                if( typeof( objectToSetOrAdd ) !== 'object' )
                    mu.warn( '1-N relationship : the value to add is not an object' );

                if( typeof( objectPrototypeProperties[ 'destination' ] ) === 'undefined' )
                    //there's no related relationship object prototype, we just push it in the array
                    this[ objectProperty ] = objectToSetOrAdd;

                else if( Object.prototype.toString.apply( objectToSetOrAdd ) == objectPrototypeProperties[ 'destination' ] )
                {   //we got the right prototype of object to add,
                    //we put ourselves in the inverse relationship
                    //and remove the link with the old related object
                    if( typeof( objectToSetOrAdd[ objectPrototypeProperties[ 'inverse' ] ] ) !== 'undefined' ||
                        objectToSetOrAdd[ objectPrototypeProperties[ 'inverse' ] ] != null )
                        objectToSetOrAdd[ objectPrototypeProperties[ 'inverse' ] ][ oldValue ] = null;

                    objectToSetOrAdd[ objectPrototypeProperties[ 'inverse' ] ] = this;
                    valuePlaceholder = objectToSetOrAdd;
                }
                else
                    mu.warn( '1-N relationship : destination was not of the right prototype.');

                break;
        }

    }


    /**
     * translate a JSON db schema code into a javascript object prototype
     *
     * @param {String}                  objectGlobal     a string containing the json data to be translated
     * @param {String}                  objectPropertyProperties    the name of the resulting prototype
     */
    var setInitiator                    = function ( propertyType )
    {
        switch( propertyType )
        {
            case "date":
                return dateInitiator;

            case "numeric":
                return numericInitiator;

            case "relationship":
                return relatedObjectInitiator;

            default:
                return defaultInitiator;
        }
    };


    /**
     * check if defaultValue is an object of the type specified (the object type must exist other we display a warning)
     *
     * @param {String}                  defaultValue     the default object value to init
     */
    var relatedObjectInitiator          = function ( that, muORMSchema, prototypeAttributeName, objectPrototype, defaultValue )
    {
        if( defaultValue == null )
            that[ prototypeAttributeName ] = null;

        else
        {
            var currentRelationship = objectPrototype[ "relationship" ][ prototypeAttributeName ];
            if( typeof currentRelationship === 'undefined' ||
                currentRelationship == null )
                return mu.warn( 'relationship initiator : there was no relationship with that name' );

            var destinationObjectPrototypeName = currentRelationship[ 'destination' ];
            if( typeof destinationObjectPrototypeName === 'undefined' ||
                destinationObjectPrototypeName == null )
                mu.warn( 'relationship initiator : there was no destination prototype specified in the relationship definition' );

            var destinationObjectConstructor = muORMSchema.objectList[ destinationObjectPrototypeName ];
            if( typeof destinationObjectConstructor === 'undefined' ||
                destinationObjectConstructor == null )
                mu.warn( 'relationship initiator : there was no destination prototype constructor' );

            if( currentRelationship.cardinality == 11 ||
                ( currentRelationship.cardinality == 0 &&
                  Object.prototype.toString.apply( defaultValue ) == '[object Array]' ) )
                //it's a one-on-one relationship, we just set the object to the defaultValue or
                // a many-to-many relationship with an array as default value
            {
                that[ prototypeAttributeName ] = defaultValue;

                if( currentRelationship.cardinality == 0 )
                {   //this is a many-to-many relationship with an array as default value
                    // we must push ourselves into each of the child inverse array
                    var inverseRelName = objectPrototype[ "relationship" ][ prototypeAttributeName ].inverse;
                    for( var inverseIndex = 0; inverseIndex < defaultValue.length; inverseIndex++ )
                        defaultValue[ inverseIndex ][ inverseRelName ].push( that );
                }
            }
            else if( currentRelationship.cardinality == 10 ||
                  ( currentRelationship.cardinality == 0 &&
                    Object.prototype.toString.apply( defaultValue ) != '[object Array]' ) )
                //it's a one-to-many relationship or a many-to-many relationship with one object by default,
                // we create an array and add the default value in the first index
            {
                var defaultArray = [ ];
                defaultArray.push( defaultValue );

                var inverseRelName = objectPrototype[ "relationship" ][ prototypeAttributeName ].inverse;
                if( inverseRelName != null )
                {   //there's an inverse relationship defined, we force ourselves into the relationship
                    // either by replacing the current value (one-to-many) or by adding ourselves into
                    // the relationship array
                    if( currentRelationship.cardinality == 10 )
                        defaultValue[ inverseRelName ] = that;

                    else
                        defaultValue[ inverseRelName ].push( that );
                }

                that[ prototypeAttributeName ] = defaultArray;
            }
            else
                mu.error( 'relationship initiator : this type of cardinality do not exist !' );
        }
    };

    /**
     * check if defaultValue is a date
     *
     * @param {String}                  defaultValue     the default date value to init
     */
    var dateInitiator                   = function ( that, muORMSchema, prototypeAttributeName, objectPrototype, defaultValue )
    {
        if( defaultValue == null )
            return that[ prototypeAttributeName ] = new Date();

        var newDateObject = null;
        try{ newDateObject = new Date( defaultValue ); }
        catch( e ){ return mu.log( defaultValue + ' is not a valid date default value.' ); }

        if ( Object.prototype.toString.call( newDateObject ) !== "[object Date]" ||
            isNaN( Date.parse( defaultValue ) ) ||
            newDateObject.__proto__ === 'Invalid Date' )
        {
            mu.error( defaultValue + ' is not a valid numeric default value.' );
            return null;
        }

        that[ prototypeAttributeName ] = newDateObject;
    };


    /**
     * check if defaultValue is a number (real or natural)
     *
     * @param {String}                  defaultValue     the default numeric value to init
     */
    var numericInitiator                = function ( that, muORMSchema, prototypeAttributeName, objectPrototype, defaultValue )
    {
        if( defaultValue == null )
            that[ prototypeAttributeName ] = 0;

        var objectNumeric = defaultValue;
        if( isNaN( parseFloat( objectNumeric ) ) ||
            !isFinite( objectNumeric ) )
        {
            mu.error( defaultValue + ' is not a valid numeric default value.' )
            return null;
        }

        that[ prototypeAttributeName ] = objectNumeric;
    };


    /**
     * initiate any value with the default variable, as a string
     *
     * @param {String}                  objectGlobal     a string containing the json data to be translated
     */
    var defaultInitiator                = function( that, muORMSchema, prototypeAttributeName, objectPrototype, defaultValue )
    {
        if( defaultValue == null )
            that[ prototypeAttributeName ] = '';

        that[ prototypeAttributeName ] = defaultValue;
    };

} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'ORM' ] = { } : exports );
