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
    exports.readFileSync        = function( finalurl, type )
    {
        var ajaxCall    = this.ajaxCall ? this.ajaxCall : new XMLHttpRequest();

        if( ajaxCall )
            this.ajaxCall = ajaxCall;

        ajaxCall.open( "GET", finalurl, false );
        ajaxCall.setRequestHeader( 'User-Agent','XMLHTTP/1.0' );

        mu.debug( 'loading schema : ' + finalurl );
        if( ajaxCall.readyState == 4 ) return false;

        ajaxCall.send( null );
        if( ajaxCall.readyState != 4 ) return false;
        if( ajaxCall.status != 200 &&
            ajaxCall.status != 304 &&
            ajaxCall.status != 0 )
        {
            mu.warn( 'db schema not present...we ll be db-less. going on' );
            mu.error( 'HTTP error ' + ajaxCall.status );
            return false;
        }

        return ajaxCall.responseText;
    };
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'fs' ] = { } : /*we avoid overriding node object*/null );