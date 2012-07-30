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


// TODO : plug-it inside a muORM object to sync
( function ( exports )
{

    exports.EndPoint                = function( port, browsable, muORM, keyPath, certPath )
    {
        this.serverPort     = port ? port : ( ( keyPath && certPath ) ? 443 : 80 );
        this.server         = null;
        this.browsable      = browsable ? browsable : false;
        this.ORM            = muORM ? muORM : null;
        this.keyPath        = keyPath ? keyPath : '';
        this.certPath       = certPath ? certPath : './';

        var that            = this;

        if( keyPath &&
            certPath )
            this.server = mu.https.createServer
                (
                    {
                        key: mu.fs.readFileSync( keyPath ),
                        cert: mu.fs.readFileSync( certPath )
                    },
                    function( request, response ){ defaultServerHandler( that, request, response ); }
                );

        else
            this.server = mu.http.createServer( function( request, response ){ defaultServerHandler( that, request, response ); } );

        this.server.listen( this.serverPort );
    };

    exports.EndPoint.prototype.stop = function(  )
    {
        this.server.close( );
    };

    var defaultServerHandler        = function( muSyncObject, request, response )
    {
        var data                = '';
        response.data           = '"' + request.url + '" service not implemented';
        response.code           = 501;
        response.type           = 'text/html';

        mu.log( 'Incoming Request : ' + request.url );

        request.on( 'data', function ( chunk )
        {
            data += chunk;
        });

        if( ( request.url == '/' || request.url == '' ) &&
            muSyncObject.browsable )
            browseObjectList( muSyncObject.ORM, response );

        else if( muSyncObject.ORM != null )
        {
            var leafObject      = request.url.substring( request.url.lastIndexOf( '/' ), request.url.length );
            response.type       = 'application/json';

            //TODO : make a reference for error code, 00 would be no error, obviously
            response.data       = JSON.stringify( { errorcode: 04, message: leafObject + ' does not exist in the synced schema.' } );;

            if( typeof muSyncObject.ORM.objectList[ leafObject ] !== 'undefined' )
            {
                response.data       = JSON.stringify( { errorcode: 00, message: 'data is : ' + data } );
                response.code       = 200;
            }
        }

        response.writeHead( response.code, { 'Content-Type': response.type } );
        response.end( response.data );
    };


    var browseObjectList = function( syncedORM, responseObject )
    {
        responseObject.type     = 'application/json';

        if( syncedORM != null )
        {
            responseObject.code     = 200;
            responseObject.data = JSON.stringify( { errorcode: 00, message: JSON.stringify( syncedORM.objectList ) } );
        }
        else
        {
            responseObject.code     = 503;
            responseObject.data     = JSON.stringify( { errorcode: 03, message: 'no muORM object to browse' } );
        }
    };


    return exports;
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'Sync' ] = { } : exports );