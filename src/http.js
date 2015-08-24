/**
 * User: bruno
 * Date: 12-05-24
 * Time: 12:01 PM
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


//includes
mu.require( 'fs' );


( function( exports )
{
    exports.get                 = function( urlOrObject, callback )
    {
        var finalUrl;

        if( typeof urlOrObject == 'String' )
            finalUrl = urlOrObject;

        else if( typeof urlOrObject.host !== 'undefined' &&
                    typeof urlOrObject.port !== 'undefined' &&
                    typeof urlOrObject.path !== 'undefined' &&
                    typeof urlOrObject.method !== 'undefined' )
            finalUrl = urlOrObject.host + ':' + urlOrObject.port + urlOrObject.path;

        mu.fs.readFileSync( finalUrl, 'utf8' );
    };
    //exports.ajaxCall            = null;
    exports.listen              = function( portNumber ){};
    exports.createServer        = function( requestListener ) { };
/*    {
        EWS.enable( true );
        return EWS.registerHandler( '*', serverCallbackWrapper( '/', requestListener ) );
    };

    var serverCallbackWrapper   = function( requestURL, callback )
    {
        var responseValue;

        if( typeof callback === 'undefined' )
            callback( { url:'/', method: 'GET', statusCode: 200 }, reponseValue );


    }
*/

} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'http' ] = { } : /*we avoid overriding node object*/null );