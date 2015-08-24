/**
 * User: bruno
 * Date: 12-05-22
 * Time: 4:08 PM
 */
mu.require( '../src/muBrowser' );
mu.require( 'http' );


describe( "muBrowser", function()
{
    var muBrowser       = new mu.Browser();
    var responseValue   = { statusCode : 0, contentType : '', grabbedDatas : '' };

    it( "is defined", function()
    {
        expect( muBrowser ).toBeDefined( );
    });

    if( !mu.runinbrowser )
        //we don't need to test if the browser can grab a HTML file :)
        it( "can grab a html page (dependency with http)", function()
        {
            var testHTML    = '<html><head><title></title></head><body>Test Text</body></html>';
            var asyncTick   = false;
            var mockServer;

            expect( mu.http ).toBeDefined( );

            runs( function()
                  {
                      //we create a server and expose a very basic simple html5 file
                      mockServer = mu.http.createServer( function ( req, res )
                                                         {
                                                             res.writeHead( 200, { 'Content-Type': 'text/html' } );
                                                             res.write( testHTML );
                                                             res.end( );
                                                         });
                      mockServer.listen( 65000 );
                      muBrowser.get
                      (
                          'http://localhost:65000/',
                          function( statusCode, contentType, grabbedDatas )
                          {
                              responseValue.statusCode = statusCode;
                              responseValue.contentType = contentType;
                              responseValue.grabbedDatas = grabbedDatas;
                              asyncTick = true;
                          }
                      );
                  } );

            waitsFor( function() { return asyncTick; } );

            runs( function()
                  {
                      expect( responseValue.statusCode ).toEqual( 200 );
                      expect( responseValue.contentType ).toEqual( 'text/html' );
                      expect( responseValue.grabbedDatas ).toBeDefined( );
                      expect( responseValue.grabbedDatas ).toEqual( testHTML );

                      mockServer.close( );
                  } );
        } );

} );