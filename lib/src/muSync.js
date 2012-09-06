/**
 * Created by bruno
 * 12-04-16 1:17 PM
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


// includes
mu.require( 'fs' );
mu.require( 'http' );
mu.require( 'https' );


// TODO : plug-it inside a muORM Schema object to sync
( function ( exports )
{

    exports.EndPoint                = function( port, browsable, muORMSchema, keyPath, certPath )
    {
        this.endpointPort   = port ? port : ( ( keyPath && certPath ) ? 443 : 80 );
        this.endpoint       = null;
        this.browsable      = browsable ? browsable : false;
        this.ORMSchema      = muORMSchema ? muORMSchema : null;
        this.keyPath        = keyPath ? keyPath : '';
        this.certPath       = certPath ? certPath : './';

        var that            = this;

        if( mu.runinbrowser )
            syncEndPointClientSide( that, port, browsable, muORMSchema, keyPath, certPath );

        else
            syncEndPointServerSide( that, port, browsable, muORMSchema, keyPath, certPath );
    };


    exports.EndPoint.prototype.stop = function(  )
    {
        if( !mu.runinbrowser )
            this.endpoint.close( );
    };


    //
    // we are forced to separate the code path because of the asymmetry in synchronizing (client / server)
    //

    /* the synchronisation setup on the client side
     * @param
     */
    function syncEndPointClientSide( that, port, browsable, muORMSchema, keyPath, certPath )
    {

    };


     /* the synchronisation setup on the server side
     * @param
     */
    function syncEndPointServerSide( that, port, browsable, muORMSchema, keyPath, certPath )
    {
        if( keyPath &&
            certPath )
            that.endpoint = mu.https.createServer
                (
                    {
                        key: mu.fs.readFileSync( keyPath ),
                        cert: mu.fs.readFileSync( certPath )
                    },
                    function( request, response ){ defaultServerHandler( that, request, response ); }
                );

        else
            that.endpoint = mu.http.createServer( function( request, response ){ defaultServerHandler( that, request, response ); } );

        that.endpoint.listen( that.endpointPort );
    };


    var defaultServerHandler        = function( muSyncObject, request, response )
    {
        var isRoot              = ( request.url == '' ||
                                    request.url == '/' ||
                                    request.url == '/index' ||
                                    request.url == '/index.htm' ||
                                    request.url == '/index.html' ||
                                    request.url == '?json' ||
                                    request.url == '/?json' ||
                                    request.url == '/.json' ||
                                    request.url == '/index?json' ||
                                    request.url == '/index.json' );
        var inJson              = ( request.url.lastIndexOf( '?json' ) != -1 ||
                                    request.url.lastIndexOf( '.json' ) != -1 );
        var data                = '';

        //fail safe on default values
        response.data           = '"' + request.url + '" service not implemented';
        response.code           = 501;
        response.type           = inJson ? 'application/json' : 'text/html';

        mu.log( 'Incoming Request : ' + request.url );

        request.on( 'data', function( chunk ) { data += chunk; } );

        if( isRoot &&
            muSyncObject.browsable )
            browseObjectsList( muSyncObject.ORMSchema, response, inJson );

        else if( !isRoot &&
                 muSyncObject.ORMSchema != null )
            browseObjectsData( muSyncObject, request, response, inJson );

        response.writeHead( response.code, { 'Content-Type': response.type } );
        response.end( response.data );
    };


    var browseObjectsList = function( syncedORMSchema, responseObject, inJson )
    {
        if( syncedORMSchema == null ||
            syncedORMSchema.objectList == null ||
            syncedORMSchema.objectList.length == 0 )
        {
            responseObject.code     = 503;
            responseObject.data     =   renderObject
                                        (
                                            syncedORMSchema != null ? syncedORMSchema.getSchemaName( ) + ' API' : 'Unknown API',
                                            '',
                                            generateErrorMessage( 1, syncedORMSchema != null ? syncedORMSchema.getSchemaName( ) : '<unknown>' ),
                                            inJson
                                        );
        }
        else
        {
            responseObject.code     = 200;
            responseObject.data     =   renderObject
                                        (
                                            syncedORMSchema.getSchemaName( ) + ' API',
                                            '',
                                            renderObjectListAsArray( syncedORMSchema.objectList ),
                                            inJson
                                        );
        }
    };


    var browseObjectsData = function( muSyncObject, request, response, inJson )
    {
        var leafObjectSplit = '';
        var leafObject      = request.url;

        if( leafObject.indexOf( '.json' ) != -1 )
        {
            leafObjectSplit = leafObject.split( '.json' );
            leafObject = leafObjectSplit[ leafObjectSplit.length - 2 ];
        }

        leafObjectSplit = leafObject.split( '/' );
        leafObject = leafObjectSplit[ leafObjectSplit.length - 1 ];

        var objectNumeric = leafObject;
        if( isNaN( parseFloat( objectNumeric ) ) ||
            !isFinite( objectNumeric ) )
            browseObjectInstancesList( muSyncObject, leafObject, request, response, inJson );

        else
        {
            leafObject = leafObjectSplit[ leafObjectSplit.length - 2 ];
            browseObjectInstance( muSyncObject, leafObject, objectNumeric, request, response, inJson );
        }
    };


    var browseObjectInstancesList = function( muSyncObject, objectTypeName, request, response, inJson )
    {
        if( typeof( muSyncObject.ORMSchema.objectList[ objectTypeName ] ) === 'undefined' )
            response.data       =   renderObject
                (
                    objectTypeName + ' list',
                    request.url,
                    generateErrorMessage( 2, objectTypeName ),
                    inJson
                );

        else
        {
            var leafObjectList  = muSyncObject.ORMSchema.objectInstances[ objectTypeName ];
            response.data       =   renderObject
                                    (
                                        objectTypeName + ' list',
                                        request.url,
                                        renderObjectListAsArray( leafObjectList ),
                                        inJson
                                    );
            response.code       = 200;
        }
    };


    var browseObjectInstance = function( muSyncObject, objectTypeName, objectID, request, response, inJson )
    {
        if( typeof( muSyncObject.ORMSchema.objectList[ objectTypeName ] ) === 'undefined' )
           response.data       =   renderObject
                (
                    objectTypeName + ' ID : ' + objectID,
                    request.url,
                    generateErrorMessage( 2, objectTypeName ),
                    inJson
                );
        else if( typeof( muSyncObject.ORMSchema.objectInstances[ objectTypeName ][ objectID ] ) === 'undefined' )
            response.data       =   renderObject
                (
                    objectTypeName + ' ID : ' + objectID,
                    request.url,
                    generateErrorMessage( 3, objectTypeName + ':' + objectID ),
                    inJson
                );

        else
        {
            var objectToListProperties  = muSyncObject.ORMSchema.objectInstances[ objectTypeName ][ objectID ];
            response.data       =   renderObject
                (
                    objectTypeName + ' properties',
                    request.url,
                    objectToListProperties,
                    inJson
                );
            response.code       = 200;
        }
    }


    var renderObjectListAsArray = function( objectList )
    {
        var objectListArray = new Array( );

        for( var currentValueName in objectList  )
            objectListArray.push( currentValueName );

        return objectListArray;
    };

    var renderObject = function( htmlTitle, parentURL, object, inJson )
    {
        if( inJson )
            return JSON.stringify( object );

        else
        {
            var html = '<!DOCTYPE html><html><head><title>' + htmlTitle + '</title></head><body>';

            html += '<div>';

            for( var currentValueName in object )
            {
                if( currentValueName == 'constraint' ||
                    currentValueName == 'defaultValue' ||
                    currentValueName == 'storageType' ||
                    currentValueName == 'relationship' )
                    break;

                if( Object.prototype.toString.apply( object ) == '[object Array]' )
                    html += '<ul><li>' +
                            '<a href="' + parentURL + '/' + object[ currentValueName ] + '">' +
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
                            html += '<a href="' + parentURL + '/' + object[ currentValueName ][ objectChild ] + '">' +
                                        object[ currentValueName ][ objectChild ].toString() + '</a>';
                            html += '</li>';
                        }
                    }
                    else
                        html += '<li>' + object[ currentValueName ].toString() + '</li>';
                }

                html += '</ul>';
            }

            html += '</div>';

            html += '</body></html>';

            return html;
        }
    };

    var errorCodeMessage =
    {
        0 : ' ok',
        1 : ' schema does not exist or is empty',
        2 : ' does not exist in the synced schema',
        3 : ' no instance with this muUID known'
    };

    var generateErrorMessage = function( errorCode, optionalElementToDetail )
    {
        return  {
                    errorcode: errorCode,
                    message: ( optionalElementToDetail == null ? '<element unknown>' : optionalElementToDetail ) +
                            errorCodeMessage[ errorCode ]
                };
    };


    return exports;
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'Sync' ] = { } : exports );