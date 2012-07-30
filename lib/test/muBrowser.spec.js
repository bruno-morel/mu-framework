/**
 * User: bruno
 * Date: 12-05-22
 * Time: 4:08 PM
 */


mu.require( 'muBrowser' );
mu.require( 'http' );


describe( "muBrowser", function()
{

    var muBrowser = new mu.Browser();

    it( "is defined", function()
    {
        expect( muBrowser ).toBeDefined( );
    });

    it( "can grab a html page (dependency with fs and http)", function()
    {
        expect( mu.fs ).toBeDefined( );

        //we create a server and expose a very basic simple html5 file
        var mockServer = mu.http.createServer( function ( req, res )
        {
            res.writeHead( 200, {'Content-Type': 'text/html' } );
            res.write( '<!DOCTYPE html><html><head><title></title></head><body>Test Text</body></html>' );
            res.end( index );
        });

        mockServer.listen( 65000 );

        muBrowser.grab( 'http://localhost:65000/' );

        mockServer.close( );
    });

});