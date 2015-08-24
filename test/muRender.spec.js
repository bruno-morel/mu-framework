/**
 * Date: 2013-07-25
 * User: bruno
 *
 * muRender Jasmine BDD specification file
 *
 */

mu.require( 'muRender' );
mu.require( 'muBrowser' );


describe( "muRender", function()
{
	//mu.activateDebug( );
	var muRenderMock;

	beforeEach( function( )
	            {
		            muRenderMock = new mu.Render.Website( 'muRender HTML test', null, './testtemplates/', 8000 );
		            muRenderMock.start( );

		            mu.debug( 'render is connected at http://localhost:' + muRenderMock.endpointPort );
	            } );


	it( "is defined", function()
	{
		expect( muRenderMock ).toBeDefined( );
	});

	it( "defines endpoint", function()
	{
		expect( muRenderMock.endpoint ).toBeDefined( );
	});

	it( "defines endpointPort to the default process port or 8000", function()
	{
		expect( muRenderMock.endpointPort ).toEqual( 8000 );
	});

	it( "is not a singleton", function()
	{
		var muRenderMock2 = new mu.Render.Website( 'muRender HTML test not singleton', null, './testtemplates/', 8001 );
		muRenderMock2.start( );

		expect( muRenderMock2.endpointPort ).toEqual( 8001 );

		muRenderMock2.stop( );
	});

	it( "is exposing objects in html by default (depends on muBrowser)", function()
	{
		var muBrowser = new mu.Browser();
		expect( muBrowser ).toBeDefined( );
	});

	if( !mu.runinbrowser )
		it( "is returning the index template when called on /", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			var muBrowser = new mu.Browser();

			expect( muBrowser ).toBeDefined( );

			runs( function()
			      {
				      muBrowser.get
				      (
					      'http://localhost:8000',
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
				      //expect( responseValue.grabbedDatas ).toEqual( 'text/html' );
			      } );
		});

	afterEach( function() { muRenderMock.stop( ); mu.debug( 'renderer is closed' ); } );
});