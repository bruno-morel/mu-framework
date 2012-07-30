/**
 * User: bruno
 * Date: 12-05-22
 * Time: 3:54 PM
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] === "undefined" ) require( '../src/mu.js' );
else console.error( "mu Browser can't work on the browser..." );


//includes
mu.require( 'fs' );
mu.require( 'http' );


// cross-node/browser object code

var muBrowser                = function(  )
{
    this.blabla = '';
};

muBrowser.prototype.grab    = function ( urlToGrab )
{

}

if( mu.runinbrowser )
    window[ 'mu' ][ 'Browser' ] = muBrowser;
else
{
    global[ 'mu' ][ 'Browser' ] = muBrowser;
    module.exports = muBrowser;
}
