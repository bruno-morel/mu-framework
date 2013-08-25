/**
 * Created by bruno
 * 12-04-16 1:17 PM
 *
 * muSync expose transparently mu framework compatible object on client AND server side and ensure proper sync of their
 * datas
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


// includes
mu.require( 'fs' );
mu.require( 'http' );
mu.require( 'https' );
mu.require( 'timers' );


( function ( exports )
{
    exports.EndPoint                = function( url, port, browsable, muORMSchema, version, keyPathOrUser, certPathOrPass )
    {
	    this.url            = url ? url : 'localhost';
        this.endpointPort   = port ? port : ( ( keyPath && certPath ) ? 443 : 80 );
        this.endpoint       = null;
        this.version        = version ? version : 1;
        this.browsable      = browsable ? browsable : false;
        //this.ORMSchema      = muORMSchema ? muORMSchema : null;
	    this.objectList     = muORMSchema ?
	                          //TODO : create a new muORM Schema object if the parameter given is a path
	                            ( muORMSchema.objectList ? muORMSchema.objectList : { } ) :
	                            { };
	    this.objectInstances= muORMSchema ?
	                            ( muORMSchema.objectInstances ? muORMSchema.objectInstances : { } ) :
	                            { };
	    this.APIName        = muORMSchema ? muORMSchema.SchemaName : null;
        this.keyPathOrUser  = keyPathOrUser ? keyPathOrUser : '';
        this.certPathOrPass = certPathOrPass ? certPathOrPass : './';


	    return this;
    };

	exports.EndPoint.prototype.setORMSchema = function( muORMSchema )
	{
		this.objectList     = muORMSchema ? muORMSchema.objectList : null;
		this.objectInstances= muORMSchema ? muORMSchema.objectInstances : null;
		this.APIName        = muORMSchema ? muORMSchema.SchemaName : null;
	};

	exports.EndPoint.prototype.addObjectTypeToSync = function( objectType, objectTypeName )
	{
		if( !this.objectList )
			this.objectList = { };

		var typeName = ( objectTypeName ? objectTypeName : objectType.name.toString() );

		this.objectList[ typeName ]     = objectType;
	};

	exports.EndPoint.prototype.addObjectInstanceToSync = function( objectInstance, objectTypeName )
	{
		if( !this.objectInstances )
			this.objectInstances = { };

		var typeName = ( objectTypeName ? objectTypeName : objectInstance.constructor.name );

		if( !this.objectInstances[ typeName ] )
			this.objectInstances[ typeName ] = { };

		this.objectInstances[ typeName ][ objectInstance.muUID ] = objectInstance;
	};

	exports.EndPoint.prototype.delObjectInstanceToSync = function( objectInstance, objectTypeName )
	{
		if( !this.objectInstances )
			this.objectInstances = { };

		var typeName = ( objectTypeName ? objectTypeName : objectInstance.constructor.name );

		if( !this.objectInstances[ typeName ] )
			this.objectInstances[ typeName ] = { };

		delete this.objectInstances[ typeName ][ objectInstance.muUID ];
	};

	exports.EndPoint.prototype.setAPIName = function( APIName )
	{
		this.APIName        = APIName;
	};

	exports.EndPoint.prototype.start = function( callbackFunctionWhenFinishedSync )
	{
		if( mu.runinbrowser )
			startSyncClient( this, callbackFunctionWhenFinishedSync );

		else
			startSyncServer( this, callbackFunctionWhenFinishedSync );
	};

    exports.EndPoint.prototype.stop = function(  )
    {
        if( !mu.runinbrowser )
            this.endpoint.close( );
    };


    //
    // we are forced to separate the code path because of the asymmetry in synchronizing (client / server)
    //

    /* the synchronisation setup on the client side, we use ajax to list data objects
     * @param
     */
    function startSyncClient( that, callbackFunctionWhenFinishedSync )
    {//we are on the browser, we start the sync by retrieving the current active objects
	    if( Object.keys( that.objectList ).length == 0 )
		    return;

	    that.endpoint = { };
	    that.syncInProgress = { };

	    for( var currentObject in that.objectList )
	        syncClientObjectInstances( that, currentObject, callbackFunctionWhenFinishedSync );
    }

	function syncClientObjectInstances( that, objectToGet, callbackFunctionWhenFinishedSync )
	{
		that.endpoint[ objectToGet ] = new XMLHttpRequest( );

		if( !that.endpoint[ objectToGet ].onreadystatechange )
			that.endpoint[ objectToGet ].onreadystatechange = function( )
				{
					if( that.endpoint[ objectToGet ].readyState == 4 )
					{
						if( that.endpoint[ objectToGet ].status != 200 &&
						    that.endpoint[ objectToGet ].status != 0 )
							mu.warn
							(
								'An error has occured making ' + objectToGet +
								' object instances list request : ' + that.endpoint.statusText +
								' : ' + that.endpoint.statusText +
							    ' - ' + that.endpoint.responseText
							);

						else
						{
							var idList;

							try{ idList = JSON.parse( that.endpoint[ objectToGet ].responseText ); }
							catch( errorParsing )
							{
								mu.warn
								(
									'error parsing ' + objectToGet +
									' object instances list'
								);
							}

							that.endpoint[ objectToGet ].syncInProgress = { };

							for( var currentIdIndex in idList )
								syncClientObjectValue
								(
									that,
									objectToGet,
									idList[ currentIdIndex ],
									callbackFunctionWhenFinishedSync
								);
						}
					}
				};

		that.endpoint[ objectToGet ].open
			(
				'GET',
				that.url + '/v' + that.version + '/' + objectToGet + '.json',
				true,
				that.keyPathOrUser,
				that.certPathOrPass
			);
		//ajaxCall.setRequestHeader( 'Content-type', 'application/json' );
		that.endpoint[ objectToGet ].send( );
	}

	function syncClientObjectValue( that, objectToGet, idToGet, callbackFunctionWhenFinishedSync )
	{
		that.endpoint[ objectToGet ].syncInProgress[ idToGet ] = new XMLHttpRequest( );

		if( !that.endpoint[ objectToGet ].syncInProgress[ idToGet ].onreadystatechange )
			that.endpoint[ objectToGet ].syncInProgress[ idToGet ].onreadystatechange = function( )
			{
				if( that.endpoint[ objectToGet ].syncInProgress[ idToGet ].readyState == 4 )
				{
					if( that.endpoint[ objectToGet ].syncInProgress[ idToGet ].status != 200 &&
					    that.endpoint[ objectToGet ].syncInProgress[ idToGet ].status != 0 )
						mu.warn
						(
							'An error has occured making the object property request for : ' + objectToGet +
						    ' with id : ' + idToGet
						);

					else
					{
						var objectPropertiesAndValue;
						try{ objectPropertiesAndValue = JSON.parse( that.endpoint[ objectToGet ].syncInProgress[ idToGet ].responseText ); }
						catch( errorParsing )
						{
							mu.warn
								(
									'error parsing ' + objectToGet +
									'object properties for muUID :' + idToGet
								);
						}
						for( var propertyName in objectPropertiesAndValue )
							that.objectInstances[ objectToGet ][ idToGet ][ propertyName ] = objectPropertiesAndValue[ propertyName ];

						delete that.endpoint[ objectToGet ].syncInProgress[ idToGet ];

						if( Object.keys( that.endpoint[ objectToGet ].syncInProgress ).length == 0 )
							delete that.endpoint[ objectToGet ];

						if( Object.keys( that.endpoint ).length == 0 &&
						    callbackFunctionWhenFinishedSync )
							callbackFunctionWhenFinishedSync( that );

					}
				}
			};

		that.endpoint[ objectToGet ].syncInProgress[ idToGet ].open
		(
			'GET',
			that.url + '/v' + that.version + '/' + objectToGet + '/' + idToGet + '.json',
			true,
			that.keyPathOrUser,
			that.certPathOrPass
		);
		//ajaxCall.setRequestHeader( 'Content-type', 'application/json' );
		that.endpoint[ objectToGet ].syncInProgress[ idToGet ].send( );
	}


     /* the synchronisation setup on the server side
     * @param
     */
    function startSyncServer( that, callbackFunctionWhenFinishedSync )
    {
        if( that.keyPathOrUser &&
            that.certPathOrPass )
            that.endpoint = mu.https.createServer
                (
                    {
                        key: mu.fs.readFileSync( that.keyPathOrUser ),
                        cert: mu.fs.readFileSync( that.certPathOrPass )
                    },
                    function( request, response ){ defaultServerHandler( that, request, response ); }
                );

        else
            that.endpoint = mu.http.createServer( function( request, response ){ defaultServerHandler( that, request, response ); } );

        that.endpoint.listen( that.endpointPort );

	    if( callbackFunctionWhenFinishedSync )
		    callbackFunctionWhenFinishedSync( that );
    }


    function defaultServerHandler( muSyncObject, request, response )
    {
        var inJson              = ( request.url.lastIndexOf( '?json' ) != -1 ||
                                    request.url.lastIndexOf( '.json' ) != -1 );
	    var immediateResponse   = true;

        //fail safe on default values
        response.data           = '"' + request.url + '" service not implemented';
        response.code           = 405;
        response.type           = inJson ? 'application/json' : 'text/html';


        // TODO : allow multiple version API serving
        if( request.url.lastIndexOf( '/v' + muSyncObject.version ) == -1 )
	        immediateResponse = malformedRequestError( muSyncObject, request, response, inJson );

        else
	        immediateResponse = extractLeafOrRoot( muSyncObject, request, response, inJson );

	    if( immediateResponse )
	        sendResponse( response );
    }

	function sendResponse( response )
	{
		response.writeHead( response.code, { 'Content-Type': response.type } );
		response.end( response.data );
	}

    function extractLeafOrRoot( muSyncObject, request, response, inJson )
    {
        var versionString       = '/v' + muSyncObject.version;
        var isRoot              = ( request.url == versionString ||
                                    request.url == versionString + '/' ||
                                    request.url == versionString + '/index' ||
                                    request.url == versionString + '/index.htm' ||
                                    request.url == versionString + '/index.html' ||
                                    request.url == versionString + '?json' ||
                                    request.url == versionString + '/?json' ||
                                    request.url == versionString + '/.json' ||
                                    request.url == versionString + '/index?json' ||
                                    request.url == versionString + '/index.json' );

        mu.log( 'Incoming Request : ' + request.method + ' - ' + request.url );

        if( isRoot &&
            muSyncObject.browsable &&
	        request.method == "GET" )
            return getObjectsList( muSyncObject, response, inJson );

        if( !isRoot &&
            muSyncObject.objectList != null )
	        return parseRequest( muSyncObject, request, response, inJson );

	    if( isRoot &&
	        !muSyncObject.browsable )
		         //non-browsable root with GET attempt
			return unauthorizedRequestError( muSyncObject, request, response, inJson );

	    if( request.method == 'POST' ||
	        request.method == 'PUT' )
	        return unauthorizedRequestError( muSyncObject, request, response, inJson );

        //malformed request
		return true;
    }


    function getObjectsList( muSyncObject, responseObject, inJson )
    {
	    if( muSyncObject.objectList == null ||
            Object.keys( muSyncObject.objectList ).length == 0 ||
	        muSyncObject.objectInstances == null ||
            Object.keys( muSyncObject.objectInstances ).length == 0 )
        {
            responseObject.code     = 204;
            responseObject.data     =   renderObject
                                        (
	                                        muSyncObject.APIName != null ? muSyncObject.APIName + ' API' : 'Unknown API',
                                            '/v' + muSyncObject.version,
                                            generateErrorMessage
                                                (
                                                    9,
                                                    muSyncObject.APIName != null ?
                                                        muSyncObject.APIName :
                                                        '<unknown>'
                                                ),
                                            inJson
                                        );
        }
        else
        {
            responseObject.code     = 200;
            responseObject.data     =   renderObject
                                        (
	                                        muSyncObject.APIName + ' API',
                                            '/v' + muSyncObject.version,
                                            renderObjectListAsArray( muSyncObject.objectList ),
                                            inJson
                                        );
        }

	    return true;
    }


    function parseRequest( muSyncObject, request, response, inJson )
    {
        var leafObjectSplit = '';
        var leafObject      = request.url;

        if( leafObject.indexOf( '.json' ) != -1 )
        {
            leafObjectSplit = leafObject.split( '.json' );
            leafObject = leafObjectSplit[ leafObjectSplit.length - 2 ];
        }

        if( !( leafObject.indexOf( '.' ) == -1 ||
               leafObject.indexOf( '.html' ) != -1 ||
               leafObject.indexOf( '.htm' ) != -1 ) )
           //we only recognize .json and .html / htm request for now
	        //as it is neither, we return an error
	        return unsupportedFormatError( muSyncObject, request, response, inJson, leafObject );


        leafObjectSplit = leafObject.split( '/' );
	    var hasSlashInEnd = leafObjectSplit[ leafObjectSplit.length - 1 ] == '';
	    leafObject = leafObjectSplit[ hasSlashInEnd ?
                                      leafObjectSplit.length - 2 :
                                      leafObjectSplit.length - 1 ];

        var objectNumeric = leafObject;
        if( isNaN( parseFloat( objectNumeric ) ) ||
            !isFinite( objectNumeric ) )
            //we got a non-numerical value => this is an object instance listing request
            return parseObjectListRequest( muSyncObject, leafObject, request, response, inJson );

        else
        {   //we got a numerical value => this is an object description request
            leafObject = leafObjectSplit[ hasSlashInEnd ? leafObjectSplit.length - 3 : leafObjectSplit.length - 2 ];
	        if( leafObject != ( 'v' + muSyncObject.version ) )
	            return parseObjectInstanceRequest( muSyncObject, leafObject, objectNumeric, request, response, inJson );

	        else
	        {
		        response.code       = 504;
		        response.data       =   renderObject
		        (
			        muSyncObject.APIName + ' API',
			        '/v' + muSyncObject.version,
			        generateErrorMessage( 7, '' ),
			        inJson
		        );

		        return true;
	        }
        }
    }

    function parseObjectListRequest( muSyncObject, objectTypeName, request, response, inJson )
    {
        if( request.method == "GET" &&
            typeof( muSyncObject.objectList[ objectTypeName ] ) === 'undefined' )
            return resourceNotFoundError( muSyncObject, request, response, inJson, objectTypeName + ' list' );

        //we have a /[objectName] request
        switch( request.method )
        {
	        case "GET":
		        var leafObjectList  = muSyncObject.objectInstances[ objectTypeName ];
		        response.code       = 200;
		        response.data       =   renderObject
		        (
			        objectTypeName + ' list',
			        request.url,
			        renderObjectListAsArray( leafObjectList ),
			        inJson
		        );
		        return true;

	        case "POST":
		        //TODO : handle POST - creation of a new item
		        return  parseObjectCreationRequest
		                (
					        muSyncObject,
				            objectTypeName,
				            request,
				            response,
				            inJson
				        );
		        break;


	        case "PUSH":
		        //TODO : handle PUSH - creation of a new item

		        break;


	        default:
		        break;
        }
    }

    function parseObjectInstanceRequest( muSyncObject, objectTypeName, objectID, request, response, inJson )
    {
        //default error is an unknown resource
        response.code       = 404;
        if( typeof( muSyncObject.objectList[ objectTypeName ] ) === 'undefined' )
           response.data       =   renderObject
                (
                    objectTypeName + ' ID : ' + objectID,
                    request.url,
                    generateErrorMessage( 3, objectTypeName ),
                    inJson
                );
        else if( typeof( muSyncObject.objectInstances[ objectTypeName ][ objectID ] ) === 'undefined' )
            response.data       =   renderObject
                (
                    objectTypeName + ' ID : ' + objectID,
                    request.url,
                    generateErrorMessage( 4, objectTypeName + ':' + objectID ),
                    inJson
                );

        else
        {
            var objectToListProperties  = muSyncObject.objectInstances[ objectTypeName ][ objectID ];

	        response.code       = 200;
	        response.data       =   renderObject
                (
                    objectTypeName + ' muUID=' + objectToListProperties.muUID + ' properties',
                    request.url,
                    objectToListProperties,
                    inJson
                );
        }

	    return true;
    }

	function parseObjectCreationRequest( muSyncObject, objectTypeName, request, response, inJson )
	{
		var valueSetAndRequestEnd = false;

		var newObject = new muSyncObject.objectList[ objectTypeName ];

		request.on( 'data', function( dataChunk )
		{
			var jsonData = dataChunk.toString( );
			var arrValueToSet = JSON.parse( jsonData );
			var newObjectPrototype = Object.getPrototypeOf( newObject );

			for( var valueToSet in arrValueToSet )
			{
				if( typeof newObject[ valueToSet ] !== "undefined" ||
				    typeof newObjectPrototype[ valueToSet ] !== "undefined" )
					newObject[ valueToSet ] = arrValueToSet[ valueToSet ];
			}
		} );

		request.on( 'end', function( ) {
			valueSetAndRequestEnd = true;
		});

		if( !newObject )
		{
			//default error is an unauthorized method invocation on resource
			response.code       = 405;
			response.data       = renderObject
			(
				muSyncObject.APIName != null ? muSyncObject.APIName + ' API' : 'Unknown API',
				request.url,
				generateErrorMessage( 6, '"' + request.url + '"' ),
				inJson
			);

			return true;
		}
		else
		{
			var retryForValueToBeSetAndRequestEnded = function( ) {
				if( valueSetAndRequestEnd )
					waitForValueToBeSetAndRequestEnded( objectTypeName, request, response, inJson, newObject );
				else
					mu.timers.setImmediate( function( ) { retryForValueToBeSetAndRequestEnded( objectTypeName, request, response, inJson, newObject ); } );
			};
			retryForValueToBeSetAndRequestEnded( objectTypeName, request, response, inJson, newObject );

			return false;
		}
	}

	function waitForValueToBeSetAndRequestEnded( objectTypeName, request, response, inJson, newObject )
	{
		response.code       = 200;
		response.data       =   renderObject
		(
			objectTypeName + ' muUID=' + newObject.muUID + ' properties',
			request.url,
			newObject,
			inJson
		);
		sendResponse( response );
	}



    function renderObjectListAsArray( objectList )
    {
        var objectListArray = new Array( );

        for( var currentValueName in objectList  )
            objectListArray.push( currentValueName );

        return objectListArray;
    }

    function renderObject( htmlTitle, parentURL, object, inJson )
    {
        if( inJson )
        {
	        if( object.muUID )
	        {
		        var copiedObject = { };

		        copiedObject.muUID = object.muUID;

		        for( var propertyInObject in object )
			        copiedObject[ propertyInObject ] = object[ propertyInObject ];

		        return JSON.stringify( copiedObject );
	        }
	        else
	            return JSON.stringify( object );
        }
        else
        {
            var html = '<!DOCTYPE html><html><head><title>' + htmlTitle + '</title></head><body>';

	        if( object.muUID &&
	            Object.prototype.toString.apply( object ) != '[object Array]' )
		        html += '<h1>muUID<li>' + object.muUID + '</li></h1>';

	        html += '<div>';


            for( var currentValueName in object )
            {
	            if( currentValueName != 'constraint' &&
                    currentValueName != 'defaultValue' &&
                    currentValueName != 'storageType' &&
                    currentValueName != 'relationship'&&
                    ( typeof object[ currentValueName ] == 'number' ||
	                  typeof object[ currentValueName ] == 'string' ||
	                  typeof object[ currentValueName ] == 'boolean'||
                      typeof object[ currentValueName ] == 'object' ) )
				{
                    if( Object.prototype.toString.apply( object ) == '[object Array]' )
                        html += '<ul><li>' +
                                '<a href="' + parentURL + ( parentURL.charAt( parentURL.length - 1 ) == '/' ? '' : '/' ) + object[ currentValueName ] + '">' +
                                object[ currentValueName ] +
                                '</a></li>';
                    else
                    {
                        html += '<ul>' + currentValueName;

                        if( typeof( object[ currentValueName ] ) == 'object' &&
                            Object.prototype.toString.apply( object[ currentValueName ] ) == '[object Array]' )
                        {
                            for( var objectChild in object[ currentValueName ] )
                            {
                                html += '<li>';
                                html += '<a href="' + parentURL + ( parentURL.charAt( parentURL.length - 1 ) == '/' ? '' : '/' ) + object[ currentValueName ][ objectChild ] + '">' +
                                        object[ currentValueName ][ objectChild ] + '</a>';
                                html += '</li>';
                            }
                        }
                        /*
                        else if( typeof( object[ currentValueName ] ) == 'object' &&

                                 Object.prototype.toString.apply( object[ currentValueName ] ) == '[object Date]' )
	                        html += '<li>' +
	                                object[ currentValueName ].() + '-' +
	                                object[ currentValueName ].getUTCMonth() + '-' +
	                                object[ currentValueName ].getUTCDay( ) + ' ' +
	                                object[ currentValueName ].getUTCHours( ) + ':' +
	                                object[ currentValueName ].getUTCMinutes( ) + ':' +
	                                object[ currentValueName ].getUTCSeconds( ) +
	                                '</li>';
							//Mon Mar 12 2012 00:00:00 GMT-0400 (EDT)
                        */
                        else
                            html += '<li>' + object[ currentValueName ] + '</li>';
                    }

					html += '</ul>';
                }

            }

            html += '</div>';

            html += '</body></html>';

            return html;
        }
    }

	function resourceNotFoundError( muSyncObject, request, response, inJson, resourceDescription )
	{
		response.code       = 404;
		response.data       =   renderObject
		(
			resourceDescription,
			request.url,
			generateErrorMessage( 3, resourceDescription ),
			inJson
		);

		return true;
	}

	function malformedRequestError( muSyncObject, request, response, inJson )
	{
		response.code       = 400;
		response.data       = renderObject
		(
			muSyncObject.APIName != null ? muSyncObject.APIName + ' API' : 'Unknown API',
			request.url,
			generateErrorMessage( 8, '"' + request.url + '"' ),
			inJson
		);

		return true;
	}

	function unsupportedFormatError( muSyncObject, request, response, inJson, formatDemanded )
	{
		response.code       = 415;
		response.data       = renderObject
		(
			formatDemanded,
			request.url,
			generateErrorMessage( 5, formatDemanded.substring( formatDemanded.indexOf( '.' ) ) ),
			inJson
		);

		return true;
	}

	function unauthorizedRequestError( muSyncObject, request, response, inJson )
	{
		response.code       = 405;
		response.data       = renderObject
		(
			muSyncObject.APIName != null ? muSyncObject.APIName + ' API' : 'Unknown API',
			request.url,
			generateErrorMessage( 6, '"' + request.url + '"' ),
			inJson
		);

		return true;
	}

    var errorCodeMessage =
    {
        0 : ' ok',
	    1 : ' API version must be specified',
        2 : ' schema does not exist',
        3 : ' does not exist in the synced schema',
        4 : ' no instance with this muUID known',
        5 : ' format is not supported',
	    6 : ' method not allowed on URI',
	    7 : ' no object given to search for radical',
	    8 : ' malformed request',
	    9 : " schema exist but there's no data"
    };

    function generateErrorMessage( errorCode, optionalElementToDetail )
    {
        return  {
                    errorcode: errorCode,
                    message: ( optionalElementToDetail == null ? '<element unknown>' : optionalElementToDetail ) +
                            errorCodeMessage[ errorCode ]
                };
    }


    return exports;
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'Sync' ] = { } : exports );