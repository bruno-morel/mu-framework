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
    var apiURL = 'localhost';
	var oldSyncStamp = new Date().getTime();
	var muSyncMock;

	beforeEach( function( )
	            {
		            muSyncMock = new mu.Sync.EndPoint( apiURL, 8000 );
		            muSyncMock.start( );
		            mu.debug( 'endpoint is connected at http://' + apiURL + ':' + muSyncMock.endpointPort );
	            } );

	it( "is defined", function()
	{
		expect( muSyncMock ).toBeDefined( );
	});

	it( "defines url", function()
	{
		expect( muSyncMock.rootURL ).toBeDefined( );
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
		expect( muSyncMock.keyPath ).toBeUndefined( );
	});

	it( "defines certPath", function()
	{
		expect( muSyncMock.certPath ).toBeUndefined( );
	});

	it( "defines defaultUserLogin", function()
	{
		expect( muSyncMock.defaultUserLogin ).toBeUndefined( );
	});

	it( "defines defaultUserPass", function()
	{
		expect( muSyncMock.defaultUserPass ).toBeUndefined( );
	});

	it( "defines isSecure", function()
	{
		expect( muSyncMock.isSecure ).toBeFalsy( );
	});

	it( "defines stop()", function()
	{
		expect( muSyncMock.stop ).toBeDefined( );
	});


	it( "is not a singleton", function()
	{
		var muSyncMock2 = new mu.Sync.EndPoint( apiURL, 8001, true, 'test', 2 );

		muSyncMock2.start();

		expect( muSyncMock2.browsable ).toBeTruthy( );
		expect( muSyncMock2.version ).toEqual( 2 );
		expect( muSyncMock2.keyPath ).toBeUndefined( );
		expect( muSyncMock2.certPath).toBeUndefined( );

		expect( muSyncMock2.endpointPort ).toEqual( 8001 );

		var muBrowser = new mu.Browser();
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		expect( muBrowser ).toBeDefined( );

		runs( function()
		      {
			      muBrowser.get
			      (
				      'http://' + apiURL + ':' + muSyncMock2.endpointPort + '/v2/',
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

			      muSyncMock2.stop( );
		      } );
	});

	it( "allow credentials", function()
	{
		var muSyncMock3 = new mu.Sync.EndPoint( apiURL, 8001, true, 'test', 3, 'test', 'test' );
		muSyncMock3.start( );


		expect( muSyncMock3.defaultUserLogin ).toEqual( 'test' );
		expect( muSyncMock3.defaultUserPass ).toEqual( 'test' );
		expect( muSyncMock3.keyPath ).toBeUndefined( );
		expect( muSyncMock3.certPath).toBeUndefined( );

		var muBrowser = new mu.Browser();
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		expect( muBrowser ).toBeDefined( );

		runs( function()
		      {
			      muBrowser.get
			      (
				      'http://test:test@' + apiURL + ':' + muSyncMock3.endpointPort + '/v3',
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

			      muSyncMock3.stop( );
		      } );
	});

	it( "really check credentials validity", function()
	{
		var muSyncMock3 = new mu.Sync.EndPoint( apiURL, 8001, true, 'test', 3, 'test', 'test' );
		muSyncMock3.start( );

		expect( muSyncMock3.defaultUserLogin ).toEqual( 'test' );
		expect( muSyncMock3.defaultUserPass ).toEqual( 'test' );
		expect( muSyncMock3.keyPath ).toBeUndefined( );
		expect( muSyncMock3.certPath).toBeUndefined( );

		var muBrowser = new mu.Browser();
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		expect( muBrowser ).toBeDefined( );

		runs( function()
		      {
			      muBrowser.get
			      (
				      'http://bla:bla@' + apiURL + ':' + muSyncMock3.endpointPort + '/v3',
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
			      expect( responseValue.statusCode ).toEqual( 401 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );

			      muSyncMock3.stop( );
		      } );
	});

	it( "is exposing objects in html by default (depends on muBrowser)", function()
	{
		var muBrowser = new mu.Browser();
		expect( muBrowser ).toBeDefined( );

		muSyncMock.browsable = true;
	});

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
				      'http://' + apiURL + ':' + muSyncMock.endpointPort,
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
				      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v2',
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
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1',
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
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1',
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
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/?json',
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
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/?json',
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

	it( "is returning 200 and the object list when root is browsable", function()
	{
		muSyncMock.browsable    = true;

		//we create some prototype and object to sync
		var muSyncTestMix = function ( )
		{
			this.muSyncTestMixString = "name value is a string with this as default"
			this.muSyncTestMixDate = new Date( "03/12/2012" );
			this.muSyncTestMixNumeric = 15;
		};
		function muSyncTestNumeric( )
		{
			this.muSyncTestNumeric1 = 15;
			this.muSyncTestNumeric2 = 15;
			this.muSyncTestNumeric3 = 15;
		}

		var mockTestMix1 = new muSyncTestMix( );
		mockTestMix1.muUID = '83d946e6-288a-2444-9187-23c8387ae597';

		muSyncMock.setAPIName( 'muSyncServerTest' );
		muSyncMock.addObjectTypeToSync( muSyncTestMix, 'muSyncTestMix' );
		muSyncMock.addObjectInstanceToSync( mockTestMix1, 'muSyncTestMix' );
		muSyncMock.addObjectTypeToSync( muSyncTestNumeric );

		expect( mockTestMix1.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();

		expect( muBrowser ).toBeDefined( );

		muSyncMock.browsable    = true;

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/',
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
			      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muSyncServerTest API</title></head><body><details><dl><dt><dfn>muSyncTestMix</dfn></dt><dd><a href="/v1/muSyncTestMix">/v1/muSyncTestMix</a></dd><dt><dfn>muSyncTestNumeric</dfn></dt><dd><a href="/v1/muSyncTestNumeric">/v1/muSyncTestNumeric</a></dd></dl></details></body></html>' );
		      } );
	});

	it( "is returning 200 and the object list when root is browsable in JSON format", function()
	{
		muSyncMock.browsable    = true;

		//we create some prototype and object to sync
		var muSyncTestMix = function ( )
		{
			this.muSyncTestMixString = "name value is a string with this as default"
			this.muSyncTestMixDate = new Date( "03/12/2012" );
			this.muSyncTestMixNumeric = 15;
		};
		function muSyncTestNumeric( )
		{
			this.muSyncTestNumeric1 = 15;
			this.muSyncTestNumeric2 = 15;
			this.muSyncTestNumeric3 = 15;
		}

		var mockTestMix1 = new muSyncTestMix( );
		mockTestMix1.muUID = '83d946e6-288a-2444-9187-23c8387ae597';

		//we use a different port because we would step on muSync Jasmine BDD test EndPoint
		muSyncMock.setAPIName( 'muSyncServerTest' );
		muSyncMock.addObjectTypeToSync( muSyncTestMix, 'muSyncTestMix' );
		muSyncMock.addObjectInstanceToSync( mockTestMix1, 'muSyncTestMix' );
		muSyncMock.addObjectTypeToSync( muSyncTestNumeric );

		expect( mockTestMix1.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();

		expect( muBrowser ).toBeDefined( );

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/?json',
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
			      expect( responseValue.contentType ).toEqual( 'application/json' );
			      expect( responseValue.grabbedDatas ).toEqual( '["muSyncTestMix","muSyncTestNumeric"]' );
		      } );
	});

	it( "is returning 200 and the object instance in HTML format", function()
	{
		//we create some anonymous prototype and object to sync
		var muSyncTestMix = function ( )
		{
			this.muSyncTestMixString = "name value is a string with this as default"
			this.muSyncTestMixDate = new Date( "03/12/2012" );
			this.muSyncTestMixNumeric = 15;
		};

		var mockTestMix1 = new muSyncTestMix( );
		var mockTestMix2 = new muSyncTestMix( );
		mockTestMix1.muUID = '83d946e6-288a-2444-9187-23c8387ae597';
		mockTestMix2.muUID = 'a4eebc70-5d1e-519b-64aa-0aabdd02fe2b';

		//we use a different port because we would step on muSync Jasmine BDD test EndPoint
		muSyncMock.setAPIName( 'muSyncServerTest' );
		muSyncMock.addObjectTypeToSync( muSyncTestMix, 'muSyncTestMix' );
		muSyncMock.addObjectInstanceToSync( mockTestMix1, 'muSyncTestMix' );
		muSyncMock.addObjectInstanceToSync( mockTestMix2, 'muSyncTestMix' );

		expect( mockTestMix1.muSyncStamp ).not.toBeLessThan( oldSyncStamp );
		expect( mockTestMix2.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();
		expect( muBrowser ).toBeDefined( );

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muSyncTestMix',
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
			      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muSyncTestMix list</title></head><body><details><dl><dt><dfn>83d946e6-288a-2444-9187-23c8387ae597</dfn></dt><dd><a href="/v1/muSyncTestMix/83d946e6-288a-2444-9187-23c8387ae597">/v1/muSyncTestMix/83d946e6-288a-2444-9187-23c8387ae597</a></dd><dt><dfn>a4eebc70-5d1e-519b-64aa-0aabdd02fe2b</dfn></dt><dd><a href="/v1/muSyncTestMix/a4eebc70-5d1e-519b-64aa-0aabdd02fe2b">/v1/muSyncTestMix/a4eebc70-5d1e-519b-64aa-0aabdd02fe2b</a></dd></dl></details></body></html>' );
		      } );
	});

	it( "is returning 200 and the object instance in JSON format", function()
	{
		//we create some anonymous prototype and object to sync
		var muSyncTestMix = function ( )
		{
			this.muSyncTestMixString = "name value is a string with this as default"
			this.muSyncTestMixDate = new Date( "03/12/2012" );
			this.muSyncTestMixNumeric = 15;
		};

		var mockTestMix1 = new muSyncTestMix( );
		var mockTestMix2 = new muSyncTestMix( );
		mockTestMix1.muUID = '83d946e6-288a-2444-9187-23c8387ae597';
		mockTestMix2.muUID = 'a4eebc70-5d1e-519b-64aa-0aabdd02fe2b';

		//we use a different port because we would step on muSync Jasmine BDD test EndPoint
		muSyncMock.setAPIName( 'muSyncServerTest' );
		muSyncMock.addObjectTypeToSync( muSyncTestMix, 'muSyncTestMix' );
		muSyncMock.addObjectInstanceToSync( mockTestMix1, 'muSyncTestMix' );
		muSyncMock.addObjectInstanceToSync( mockTestMix2, 'muSyncTestMix' );

		expect( mockTestMix1.muSyncStamp ).not.toBeLessThan( oldSyncStamp );
		expect( mockTestMix2.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();
		expect( muBrowser ).toBeDefined( );

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muSyncTestMix.json',
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
			      expect( responseValue.contentType ).toEqual( 'application/json' );
			      expect( responseValue.grabbedDatas ).toEqual( '["83d946e6-288a-2444-9187-23c8387ae597","a4eebc70-5d1e-519b-64aa-0aabdd02fe2b"]' );
		      } );
	});

	it( "is returning 200 and the object instance in JSON format", function()
	{
		//we create some anonymous prototype and object to sync
		var muSyncTestMix = function ( )
		{
			this.muSyncTestMixString = "name value is a string with this as default"
			this.muSyncTestMixDate = new Date( "03/12/2012" );
			this.muSyncTestMixNumeric = 15;
		};

		var mockTestMix1 = new muSyncTestMix( );
		var mockTestMix2 = new muSyncTestMix( );
		mockTestMix1.muUID = '83d946e6-288a-2444-9187-23c8387ae597';

		//we use a different port because we would step on muSync Jasmine BDD test EndPoint
		muSyncMock.setAPIName( 'muSyncServerTest' );
		muSyncMock.addObjectTypeToSync( muSyncTestMix, 'muSyncTestMix' );
		muSyncMock.addObjectInstanceToSync( mockTestMix1, 'muSyncTestMix' );
		muSyncMock.addObjectInstanceToSync( mockTestMix2, 'muSyncTestMix' );

		expect( mockTestMix1.muSyncStamp ).not.toBeLessThan( oldSyncStamp );
		expect( mockTestMix2.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();

		expect( muBrowser ).toBeDefined( );

		muSyncMock.browsable    = true;

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muSyncTestMix/83d946e6-288a-2444-9187-23c8387ae597',
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
			      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muSyncTestMix muUID=83d946e6-288a-2444-9187-23c8387ae597 properties</title></head><body><h1>83d946e6-288a-2444-9187-23c8387ae597</h1><details><dl><dt><dfn>muSyncStamp</dfn></dt><dd>' + mockTestMix1.muSyncStamp + '</dd><dt><dfn>muSyncTestMixString</dfn></dt><dd>name value is a string with this as default</dd><dt><dfn>muSyncTestMixDate</dfn></dt><dd>Mon Mar 12 2012 00:00:00 GMT-0400 (EDT)</dd><dt><dfn>muSyncTestMixNumeric</dfn></dt><dd>15</dd><dt><dfn>muUID</dfn></dt><dd>83d946e6-288a-2444-9187-23c8387ae597</dd></dl></details></body></html>' );
		      } );
	});

	it( "is returning 200 and the object instance in JSON format", function()
	{
		//we create some anonymous prototype and object to sync
		var muSyncTestMix = function ( )
		{
			this.muSyncTestMixString = "name value is a string with this as default"
			this.muSyncTestMixDate = new Date( "03/12/2012" );
			this.muSyncTestMixNumeric = 15;
		};

		var mockTestMix1 = new muSyncTestMix( );
		var mockTestMix2 = new muSyncTestMix( );
		mockTestMix1.muUID = '83d946e6-288a-2444-9187-23c8387ae597';

		//we use a different port because we would step on muSync Jasmine BDD test EndPoint
		muSyncMock.setAPIName( 'muSyncServerTest' );
		muSyncMock.addObjectTypeToSync( muSyncTestMix, 'muSyncTestMix' );
		muSyncMock.addObjectInstanceToSync( mockTestMix1, 'muSyncTestMix' );
		muSyncMock.addObjectInstanceToSync( mockTestMix2, 'muSyncTestMix' );

		expect( mockTestMix1.muSyncStamp ).not.toBeLessThan( oldSyncStamp );
		expect( mockTestMix2.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var muBrowser = new mu.Browser();

		expect( muBrowser ).toBeDefined( );

		muSyncMock.browsable    = true;

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muSyncTestMix/83d946e6-288a-2444-9187-23c8387ae597.json',
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
			      expect( responseValue.contentType ).toEqual( 'application/json' );
			      expect( responseValue.grabbedDatas ).toEqual( '{"muUID":"83d946e6-288a-2444-9187-23c8387ae597","muSyncTestMixString":"name value is a string with this as default","muSyncTestMixDate":"2012-03-12T04:00:00.000Z","muSyncTestMixNumeric":15}' );
		      } );
	});

	afterEach( function() { muSyncMock.stop( ); mu.debug( 'endpoint is closed' ); } );
});