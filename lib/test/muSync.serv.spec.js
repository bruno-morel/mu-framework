/**
 * Date: 2013-08-13
 * User: bruno
 *
 * muSync BDD (muJasmine) specification file for the server side
 *
 */


mu.require( 'muSync' );
mu.require( 'muBrowser' );


describe( "muSync", function()
{
	//mu.activateDebug( );
	var muSyncMock;

	beforeEach( function( )
	            {
		            muSyncMock = new mu.Sync.EndPoint( 'localhost', 8000 );
		            muSyncMock.start( );
		            mu.debug( 'endpoint is connected at http://localhost:' + muSyncMock.endpointPort );
	            } );


	it( "is defined", function()
	{
		expect( muSyncMock ).toBeDefined( );
	});


	it( "defines url", function()
	{
		expect( muSyncMock.url ).toBeDefined( );
	});

	it( "defines endpoint", function()
	{
		expect( muSyncMock.endpoint ).toBeDefined( );
	});

	it( "defines endpointPort to the default process port or 8000", function()
	{
		expect( muSyncMock.endpointPort ).toEqual( 8000 );
	});

	it( "defines browsable to false", function()
	{
		expect( muSyncMock.browsable ).toBeFalsy( );
	});

	it( "defines an object list", function()
	{
		expect( muSyncMock.objectList ).toBeDefined( );
	});

	it( "defines an object instances list", function()
	{
		expect( muSyncMock.objectInstances ).toBeDefined( );
	});

	it( "defines an API Name", function()
	{
		expect( muSyncMock.APIName ).toBeDefined( );
	});

	it( "defines keyPath", function()
	{
		expect( muSyncMock.keyPathOrUser ).toEqual( '' );
	});

	it( "defines certPath", function()
	{
		expect( muSyncMock.certPathOrPass ).toEqual( './' );
	});

	it( "defines stop()", function()
	{
		expect( muSyncMock.stop ).toBeDefined( );
	});

	it( "is not a singleton", function()
	{
		var muSyncMock2 = new mu.Sync.EndPoint( 'localhost', 8001, true, 'test' );

		muSyncMock2.start();

		expect( muSyncMock2.browsable ).toBeTruthy( );
		expect( muSyncMock2.keyPathOrUser ).toEqual( '' );
		expect( muSyncMock2.certPathOrPass ).toEqual( './' );

		expect( muSyncMock2.endpointPort ).toEqual( 8001 );
		expect( muSyncMock2.browsable ).toBeTruthy( );

		muSyncMock2.stop( );
	});

	it( "is exposing objects in html by default (depends on muBrowser)", function()
	{
		var muBrowser = new mu.Browser();
		expect( muBrowser ).toBeDefined( );

		muSyncMock.browsable = true;
	});

	if( !mu.runinbrowser )
		it( "is returning 400 when version is not specified", function()
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
				      expect( responseValue.statusCode ).toEqual( 400 );
				      expect( responseValue.contentType ).toEqual( 'text/html' );
			      } );
		});

	it( "is returning 400 when version is not right", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();

		expect( muBrowser ).toBeDefined( );

		runs( function()
		      {
			      muBrowser.get
			      (
				      'http://localhost:8000/v2',
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
			      expect( responseValue.statusCode ).toEqual( 400 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );
		      } );
	});

	it( "is returning 405 when root is not browsable", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();

		expect( muBrowser ).toBeDefined( );

		muSyncMock.browsable    = false;

		runs( function()
		      {
			      muBrowser.get
			      (
				      'http://localhost:8000/v1',
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
			      expect( responseValue.statusCode ).toEqual( 405 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );
		      } );
	});

	it( "is returning 204 when root is browsable but there's no mu object", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();

		expect( muBrowser ).toBeDefined( );

		muSyncMock.browsable    = true;

		runs( function()
		      {
			      muBrowser.get
			      (
				      'http://localhost:8000/v1',
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
			      expect( responseValue.statusCode ).toEqual( 204 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );
			      expect( responseValue.grabbedDatas ).toBeDefined( );
		      } );
	});

	it( "is returning 405 when root is not browsable in JSON format", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();

		expect( muBrowser ).toBeDefined( );

		muSyncMock.browsable    = false;

		runs( function()
		      {
			      muBrowser.get
			      (
				      'http://localhost:8000/v1/?json',
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
			      expect( responseValue.statusCode ).toEqual( 405 );
			      expect( responseValue.contentType ).toEqual( 'application/json' );
		      } );
	});

	it( "is returning 204 when root is browsable but there's no mu object in JSON format", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();

		expect( muBrowser ).toBeDefined( );

		muSyncMock.browsable    = true;

		runs( function()
		      {
			      muBrowser.get
			      (
				      'http://localhost:8000/v1/?json',
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
			      expect( responseValue.statusCode ).toEqual( 204 );
			      expect( responseValue.contentType ).toEqual( 'application/json' );
			      expect( responseValue.grabbedDatas ).toBeDefined( );
		      } );
	});

	afterEach( function() { muSyncMock.stop( ); mu.debug( 'endpoint is closed' ); } );
});