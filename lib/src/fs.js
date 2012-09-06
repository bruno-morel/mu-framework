/**
 * User: bruno
 * Date: 12-04-18
 * Time: 6:22 PM
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


// cross-node/browser code
( function( exports )
{
    exports.ajaxCall            = null;
    var ajaxXMLHTTPRequest      = function( finalurl, errorMsg )
    {
        var ajaxCall    = this.ajaxCall ? this.ajaxCall : new XMLHttpRequest();

        if( ajaxCall )
            this.ajaxCall = ajaxCall;

        ajaxCall.open( "GET", finalurl, false );
        ajaxCall.setRequestHeader( 'User-Agent','XMLHTTP/1.0' );

        mu.debug( 'loading : ' + finalurl );
        if( ajaxCall.readyState == 4 ) return false;

        ajaxCall.send( null );
        if( ajaxCall.readyState != 4 ) return false;
        if( ajaxCall.status != 200 &&
            ajaxCall.status != 304 &&
            ajaxCall.status != 0 )
        {
            mu.warn( errorMsg );
            mu.error( 'HTTP error ' + ajaxCall.status );
            return false;
        }

        return ajaxCall.responseText;
    }
    exports.readFileSync        = function( finalurl, type )
    {
        return ajaxXMLHTTPRequest( finalurl, 'db schema not present...we ll be db-less. going on' );
    };
    exports.readdirSync        = function( finalurl )
    {
        var schemaList = ajaxXMLHTTPRequest( finalurl + 'browse', 'no schema file list present...we ll be db-less. going on' );

        return schemaList.split( '\n' );
    };
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'fs' ] = { } : /*we avoid overriding node object*/null );