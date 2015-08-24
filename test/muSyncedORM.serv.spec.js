/**
 * Date: 2013-08-25
 * User: bruno
 *
 *
 * muSync using ORM BDD (muJasmine) specification file for the server side
 *
 */
mu.require( '../src/muSync' );
mu.require( '../src/muORM' );
mu.require( '../src/muBrowser' );


describe( "muSync with ORM schema linked", function()
{
	//mu.activateDebug( );
    var apiURL = 'localhost';
	var oldSyncStamp = new Date().getTime();
	var muSyncMock;
	var muORMMock;
	var muBrowser;

	beforeEach( function( )
	            {
		            muORMMock = new mu.ORM.Schema( 'test/testschemawithsync/' );
		            muORMMock.loadAllDBSchema( );

		            muSyncMock = new mu.Sync.EndPoint( apiURL, 8000, true, muORMMock );
		            muSyncMock.start( );
		            mu.debug( 'endpoint is connected at http://' + apiURL + ':' + muSyncMock.endpointPort );

		            muBrowser = new mu.Browser();
	            });

	it( "are defined and linked", function()
	{
		expect( muSyncMock ).toBeDefined( );
		expect( muORMMock ).toBeDefined( );
		expect( muSyncMock.objectList ).toEqual( muORMMock.objectList );
		expect( muSyncMock.objectInstances ).toEqual( muORMMock.objectInstances );
		expect( muSyncMock.APIName ).toEqual( muORMMock.SchemaName );

		expect( muBrowser ).toBeDefined( );
	});

	it( "load the schema and verify the connection to the endpoint", function()
	{
		muORMMock.loadDBSchema( 'muORMWithSyncTestNumeric' );
	});

	it( "is returning 200 and the object list in HTML format when GETed for root '', '/', '/index', '/index.htm', '/index.html'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var testforRoot = function( urlRootVariant )
		{
			runs( function()
			      {
				      muBrowser.get
				      (
					      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1' + urlRootVariant,
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
				      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>testschemawithsync API</title></head><body><details><dl><dt><dfn>muORMWithSyncTestMix</dfn></dt><dd><a href="/v1/muORMWithSyncTestMix">/v1/muORMWithSyncTestMix</a></dd><dt><dfn>muORMWithSyncTestNumeric</dfn></dt><dd><a href="/v1/muORMWithSyncTestNumeric">/v1/muORMWithSyncTestNumeric</a></dd></dl></details></body></html>' );
			      } );
		};

		testforRoot( '' );
		testforRoot( '/' );
		testforRoot( '/index' );
		testforRoot( '/index.htm' );
		testforRoot( '/index.html' );
	});

	it( "is returning 200 and the object list in JSON format when GETed for root '?json', '/?json, '/.json', '/index?json', '/index.json'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		var testforRoot = function( urlRootVariant )
		{
			runs( function()
			      {
				      muBrowser.get
				      (
                          'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1' + urlRootVariant,
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
				      expect( responseValue.grabbedDatas ).toEqual( '["muORMWithSyncTestMix","muORMWithSyncTestNumeric"]' );
			      } );
		};

		testforRoot( '?json' );
		testforRoot( '/?json' );
		testforRoot( '/.json' );
		testforRoot( '/index?json' );
		testforRoot( '/index.json' );
	});

// TODO : make the push on Root working and answer an error
	it( "is returning 405 and an error code in JSON format when POSTed in the root '/v1/?json'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		runs( function( )
		      {
			      muBrowser.post
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/?json',
				      JSON.stringify( { 'fakepostdata' : 'fake' } ),
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 405 );
			      expect( responseValue.contentType ).toEqual( 'application/json' );
			      expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":6,"message":"\\"/v1/?json\\" method not allowed on URI"}' );
		      } );
	});

	it( "is returning 200 and the objects in HTML format when GETed for muORMWithSyncTestNumeric root '/muORMWithSyncTestNumeric'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		//let's check that we got a normal default muORMWithSyncTestNumeric object
		var muORMWithSyncTestNumericMock = new muORMWithSyncTestNumeric();
		expect( muORMWithSyncTestNumericMock.muUID ).toBeDefined( );
		var currentMuUID = muORMWithSyncTestNumericMock.muUID;

		expect( muORMWithSyncTestNumericMock ).toBeDefined();
		expect( muORMWithSyncTestNumericMock.muORMWithSyncTestNumeric1 ).toEqual( 15 );
		expect( muORMWithSyncTestNumericMock.muORMWithSyncTestNumeric2 ).toBeDefined(  );
		expect( muORMWithSyncTestNumericMock.muORMWithSyncTestNumeric3 ).toEqual( 15 );
		expect( muORMWithSyncTestNumericMock.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMWithSyncTestNumeric',
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 200 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );
			      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muORMWithSyncTestNumeric list</title></head><body><details><dl><dt><dfn>' + muORMWithSyncTestNumericMock.muUID + '</dfn></dt><dd><a href="/v1/muORMWithSyncTestNumeric/' + muORMWithSyncTestNumericMock.muUID + '">/v1/muORMWithSyncTestNumeric/' + muORMWithSyncTestNumericMock.muUID +'</a></dd></dl></details></body></html>' );

			      muORMWithSyncTestNumericMock.relInstance( );

			      expect( muORMWithSyncTestNumericMock.muUID ).toBeUndefined( );
			      expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID ] ).toBeUndefined( );
		      } );
	} );

	it( "is returning 200 and the objects list in JSON format when GETed for muORMWithSyncTestNumeric root '/muORMWithSyncTestNumeric.json'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		//let's check that we got well-defined default muORMWithSyncTestNumeric object
		var muORMWithSyncTestNumericMock1 = new muORMWithSyncTestNumeric();
		expect( muORMWithSyncTestNumericMock1.muUID ).toBeDefined( );
		var currentMuUID1 = muORMWithSyncTestNumericMock1.muUID;

		expect( muORMWithSyncTestNumericMock1 ).toBeDefined();
		expect( muORMWithSyncTestNumericMock1.muORMWithSyncTestNumeric1 ).toEqual( 15 );
		expect( muORMWithSyncTestNumericMock1.muORMWithSyncTestNumeric2 ).toBeDefined(  );
		expect( muORMWithSyncTestNumericMock1.muORMWithSyncTestNumeric3 ).toEqual( 15 );
		expect( muORMWithSyncTestNumericMock1.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

		var muORMWithSyncTestNumericMock2 = new muORMWithSyncTestNumeric();
		expect( muORMWithSyncTestNumericMock2.muUID ).toBeDefined( );
		var currentMuUID2 = muORMWithSyncTestNumericMock2.muUID;

		expect( muORMWithSyncTestNumericMock2 ).toBeDefined();
		expect( muORMWithSyncTestNumericMock2.muORMWithSyncTestNumeric1 ).toEqual( 15 );
		expect( muORMWithSyncTestNumericMock2.muORMWithSyncTestNumeric2 ).toBeDefined(  );
		expect( muORMWithSyncTestNumericMock2.muORMWithSyncTestNumeric3 ).toEqual( 15 );
		expect( muORMWithSyncTestNumericMock2.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMWithSyncTestNumeric.json',
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick                     = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 200 );
			      expect( responseValue.contentType ).toEqual( 'application/json' );
			      expect( responseValue.grabbedDatas ).toEqual( '["' + currentMuUID1 + '","' + currentMuUID2 + '"]' );

			      muORMWithSyncTestNumericMock1.relInstance( );
			      muORMWithSyncTestNumericMock2.relInstance( );

			      expect( muORMWithSyncTestNumericMock1.muUID ).toBeUndefined( );
			      expect( muORMWithSyncTestNumericMock2.muUID ).toBeUndefined( );
			      expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID1 ] ).toBeUndefined( );
			      expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID2 ] ).toBeUndefined( );
		      } );
	} );

	it( "is returning 200, the new object muUID and the object data passed in HTML format when POSTed in muORMWithSyncTestNumeric root '/v1/muORMWithSyncTestNumeric'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		runs( function( )
		      {
			      muBrowser.post
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMWithSyncTestNumeric',
				      JSON.stringify( {
					                      "muORMWithSyncTestNumeric1":    1,
					                      "muORMWithSyncTestNumeric2":    2,
					                      "muORMWithSyncTestNumeric3":    3
				                      } ),
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 200 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );
			      var splittedResponse = responseValue.grabbedDatas.split( '<dt>' );
			      expect( splittedResponse[ 2 ] ).toEqual( '<dfn>muORMWithSyncTestNumeric1</dfn></dt><dd>1</dd>' );
			      expect( splittedResponse[ 3 ] ).toEqual( '<dfn>muORMWithSyncTestNumeric2</dfn></dt><dd>2</dd>' );
			      expect( splittedResponse[ 4 ] ).toEqual( '<dfn>muORMWithSyncTestNumeric3</dfn></dt><dd>3</dd></dl></details></body></html>' );
		      } );
	});

	it( "is returning 200, the new object muUID and the object data passed in JSON format when POSTed in muORMWithSyncTestNumeric root '/v1/muORMWithSyncTestNumeric.json'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		runs( function( )
		      {
			      muBrowser.post
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMWithSyncTestNumeric.json',
				      JSON.stringify( {
					                      "muORMWithSyncTestNumeric1":    1,
					                      "muORMWithSyncTestNumeric2":    2,
					                      "muORMWithSyncTestNumeric3":    3
				                      } ),
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 200 );
			      expect( responseValue.contentType ).toEqual( 'application/json' );

			      var parsedDatas = null;
			      try{ parsedDatas = JSON.parse( responseValue.grabbedDatas ); }
			      catch( parseError ){ expect( parseError ).toBeUndefined( ); }
			      expect( parsedDatas.muUID ).toBeDefined( );
			      expect( parsedDatas.muORMWithSyncTestNumeric1 ).toEqual( 1 );
			      expect( parsedDatas.muORMWithSyncTestNumeric2 ).toEqual( 2 );
			      expect( parsedDatas.muORMWithSyncTestNumeric3 ).toEqual( 3 );
		      } );
	});

	it( "is returning 200 and the object properties and values in HTML format when GETed with muORMWithSyncTestNumeric/[id]", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		//let's check that we got well-defined default muORMWithSyncTestNumeric object
		var muORMWithSyncTestNumericMock1 = new muORMWithSyncTestNumeric();
		expect( muORMWithSyncTestNumericMock1.muUID ).toBeDefined( );
		var currentMuUID = muORMWithSyncTestNumericMock1.muUID;

		expect( muORMWithSyncTestNumericMock1 ).toBeDefined();
		expect( muORMWithSyncTestNumericMock1.muORMWithSyncTestNumeric1 ).toEqual( 15 );
		expect( muORMWithSyncTestNumericMock1.muORMWithSyncTestNumeric2 ).toBeDefined( );
		expect( muORMWithSyncTestNumericMock1.muORMWithSyncTestNumeric3 ).toEqual( 15 );

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMWithSyncTestNumeric/' + currentMuUID,
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick                     = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 200 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );
			      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muORMWithSyncTestNumeric muUID=' + currentMuUID + ' properties</title></head><body><h1>' + currentMuUID + '</h1><details><dl><dt><dfn>muSyncStamp</dfn></dt><dd>' + muORMWithSyncTestNumericMock1.muSyncStamp + '</dd><dt><dfn>muORMWithSyncTestNumeric1</dfn></dt><dd>15</dd><dt><dfn>muORMWithSyncTestNumeric2</dfn></dt><dd>0</dd><dt><dfn>muORMWithSyncTestNumeric3</dfn></dt><dd>15</dd></dl></details></body></html>' );

			      muORMWithSyncTestNumericMock1.relInstance( );

			      expect( muORMWithSyncTestNumericMock1.muUID ).toBeUndefined( );
			      expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID ] ).toBeUndefined( );
		      } );
	} );

	it( "is returning 200 and the object properties and values in JSON format when GETed with muORMWithSyncTestNumeric/[id].json", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		//let's check that we got well-defined default muORMWithSyncTestNumeric object
		var muORMWithSyncTestNumericMock1 = new muORMWithSyncTestNumeric();
		expect( muORMWithSyncTestNumericMock1.muUID ).toBeDefined( );
		var currentMuUID = muORMWithSyncTestNumericMock1.muUID;

		expect( muORMWithSyncTestNumericMock1 ).toBeDefined();
		expect( muORMWithSyncTestNumericMock1.muORMWithSyncTestNumeric1 ).toEqual( 15 );
		expect( muORMWithSyncTestNumericMock1.muORMWithSyncTestNumeric2 ).toBeDefined( );
		expect( muORMWithSyncTestNumericMock1.muORMWithSyncTestNumeric3 ).toEqual( 15 );

		expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID ] ).toEqual( muORMWithSyncTestNumericMock1 );
		expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID ].muORMWithSyncTestNumeric1 ).toEqual( 15 );
		expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID ].muORMWithSyncTestNumeric2 ).toBeDefined( );
		expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID ].muORMWithSyncTestNumeric3 ).toEqual( 15 );

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMWithSyncTestNumeric/' + currentMuUID + '.json',
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick                     = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 200 );
			      expect( responseValue.contentType ).toEqual( 'application/json' );

			      expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID ].muORMWithSyncTestNumeric1 ).toEqual( 15 );
			      expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID ].muORMWithSyncTestNumeric2 ).toBeDefined( );
			      expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID ].muORMWithSyncTestNumeric3 ).toEqual( 15 );

			      expect( responseValue.grabbedDatas ).toEqual( '{"muUID":"' + currentMuUID + '","muORMWithSyncTestNumeric1":15,"muORMWithSyncTestNumeric2":0,"muORMWithSyncTestNumeric3":15}' );

			      muORMWithSyncTestNumericMock1.relInstance( );

			      expect( muORMWithSyncTestNumericMock1.muUID ).toBeUndefined( );
			      expect( muORMMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ currentMuUID ] ).toBeUndefined( );
		      } );
	} );

	it( "is returning 404 and an error message in HTML format when GETed for an unknown noun '/blabla'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/blabla',
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 404 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );
			      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>blabla list</title></head><body><details><dl><dt><dfn>errorcode</dfn></dt><dd>3</dd><dt><dfn>message</dfn></dt><dd>blabla list does not exist in the synced schema</dd></dl></details></body></html>' );
		      } );
	} );

	it( "is returning 404 and an error message in JSON format when GETed for an unknown noun '/blabla.json'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/blabla.json',
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 404 );
			      expect( responseValue.contentType ).toEqual( 'application/json' );
			      expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":3,"message":"blabla list does not exist in the synced schema"}' );
		      } );
	} );

	it( "is returning 415 and an error message in HTML format when GETed for an unknown noun and an unknown extension '/blabla.bla'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/blabla.bla',
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 415 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );
			      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/blabla.bla</title></head><body><details><dl><dt><dfn>errorcode</dfn></dt><dd>5</dd><dt><dfn>message</dfn></dt><dd>.bla format is not supported</dd></dl></details></body></html>' );
		      } );
	} );

	it( "is returning 415 and an error message in HTML format when GETed for a known noun and an unknown extension '/muORMWithSyncTestNumeric.bla'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMWithSyncTestNumeric.bla',
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 415 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );
			      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/muORMWithSyncTestNumeric.bla</title></head><body><details><dl><dt><dfn>errorcode</dfn></dt><dd>5</dd><dt><dfn>message</dfn></dt><dd>.bla format is not supported</dd></dl></details></body></html>' );
		      } );
	} );

	it( "is returning 415 and an error message in JSON format when GETed for a known noun and an unknown extension '/muORMWithSyncTestNumeric.bla?json'", function()
	{
		var asyncTick = false;
		var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

		runs( function()
		      {
			      muBrowser.get
			      (
                      'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMWithSyncTestNumeric.bla?json',
				      function( statusCode, contentType, grabbedDatas )
				      {
					      responseValue.statusCode      = statusCode;
					      responseValue.contentType     = contentType;
					      responseValue.grabbedDatas    = grabbedDatas;
					      asyncTick = true;
				      }
			      );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( responseValue.statusCode ).toEqual( 415 );
			      expect( responseValue.contentType ).toEqual( 'application/json' );
			      expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":5,"message":".bla?json format is not supported"}' );
		      } );
	} );

	afterEach( function() { muSyncMock.stop( ); mu.debug( 'endpoint is closed' ); } );
});