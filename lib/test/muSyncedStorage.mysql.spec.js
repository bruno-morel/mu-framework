/**
 * User: bruno
 * Date: 12-05-17
 *
 * muSync using mysql storage Jasmine BDD specification
 */

mu.require( 'muSync' );
mu.require( 'muStorage' );
mu.require( 'muBrowser' );


describe( "muSync with MySQL Storage linked", function()
{
	//mu.activateDebug( );
	var muSyncMock;
	var muMySQLDrvStorageMock = new mu.Storage.Driver( 'persistent', 'mysql', 'localhost/test', 'muTest', 'mUt3ST' );

	//this is a special feature that allow us to make sure we keep this connection alive during the jasmin async tests
	muMySQLDrvStorageMock.driver.Storages[ muMySQLDrvStorageMock.storagePathOrURI ].keepAlive( );

	var muMySQLDrvStorageMock;
	var muBrowser;

    var mockSyncStorageMySQLPrototypeAnonymous = function ( constructParameterTest )
    {
        this.mockProperty = constructParameterTest;
        muMySQLDrvStorageMock.ownInstance( this, 'mockSyncStorageMySQLPrototypeAnonymous' );
    };
    //we add a non-anonymous prototype
    function mockSyncStorageMySQLPrototype( constructParameterTest )
    {
        this.mockProperty = constructParameterTest;
        muMySQLDrvStorageMock.ownInstance( this );
    }
	mockSyncStorageMySQLPrototype.prototype.mockFunction = function( mockParameter ){ return mockParameter; };

	var mockObject1 = new mockSyncStorageMySQLPrototype( 'mockPropertyValue1');
	var mockObject1FromAnonymous = new mockSyncStorageMySQLPrototypeAnonymous( 'mockPropertyAnonymousValue1' );
	var mockObject2FromAnonymous = new mockSyncStorageMySQLPrototypeAnonymous( 'mockPropertyAnonymousValue2' );

	//we use a different port because we would step on muSync Jasmine BDD test EndPoint
    muSyncMock = new mu.Sync.EndPoint( 8002, true );
    muSyncMock.setAPIName( 'mySyncStorageMySQLSchema' );
    muSyncMock.addObjectTypeToSync( mockSyncStorageMySQLPrototype );
	muSyncMock.addObjectInstanceToSync( mockObject1 );
    muSyncMock.addObjectTypeToSync( mockSyncStorageMySQLPrototypeAnonymous, 'mockSyncStorageMySQLPrototypeAnonymous' );
    muSyncMock.addObjectInstanceToSync( mockObject1FromAnonymous, 'mockSyncStorageMySQLPrototypeAnonymous' );
    muSyncMock.addObjectInstanceToSync( mockObject2FromAnonymous, 'mockSyncStorageMySQLPrototypeAnonymous' );

    muSyncMock.start( );
    mu.debug( 'endpoint is connected at http://localhost:' + muSyncMock.endpointPort );

    muBrowser = new mu.Browser();

	it( "are defined and linked", function()
	{
		expect( muSyncMock ).toBeDefined( );
		expect( muMySQLDrvStorageMock ).toBeDefined( );
		expect( muSyncMock.objectList ).toBeDefined( );
		expect( muSyncMock.objectInstances ).toBeDefined( );
		expect( muSyncMock.APIName ).toBeDefined( );

		expect( muBrowser ).toBeDefined( );
	});

	if( !mu.runinbrowser )
		it( "is returning 200 and the objects in HTML format when GETed for root '', '/', '/index', '/index.htm', '/index.html'", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			var testforRoot = function( urlRootVariant )
			{
				runs( function()
				      {
					      muBrowser.get
					      (
						      'http://localhost:8002/v1' + urlRootVariant,
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
					      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mySyncStorageMySQLSchema API</title></head><body><div><ul><li><a href="/v1/mockSyncStorageMySQLPrototype">mockSyncStorageMySQLPrototype</a></li></ul><ul><li><a href="/v1/mockSyncStorageMySQLPrototypeAnonymous">mockSyncStorageMySQLPrototypeAnonymous</a></li></ul></div></body></html>' );
				      } );
			};

			testforRoot( '' );
			testforRoot( '/' );
			testforRoot( '/index' );
			testforRoot( '/index.htm' );
			testforRoot( '/index.html' );
		});

	if( !mu.runinbrowser )
		it( "is returning 200 and the objects in JSON format when GETed for root '?json', '/?json, '/.json', '/index?json', '/index.json'", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			var testforRoot = function( urlRootVariant )
			{
				runs( function()
				      {
					      muBrowser.get
					      (
						      'http://localhost:8002/v1' + urlRootVariant,
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
					      expect( responseValue.grabbedDatas ).toEqual( '["mockSyncStorageMySQLPrototype","mockSyncStorageMySQLPrototypeAnonymous"]' );
				      } );
			};

			testforRoot( '?json' );
			testforRoot( '/?json' );
			testforRoot( '/.json' );
			testforRoot( '/index?json' );
			testforRoot( '/index.json' );
		});

	if( !mu.runinbrowser )
		it( "is returning 200 and the objects in HTML format when GETed for mockSyncStorageMySQLPrototypeAnonymous root '/mockSyncStorageMySQLPrototypeAnonymous'", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			runs( function()
			      {
				      muBrowser.get
				      (
					      'http://localhost:8002/v1/mockSyncStorageMySQLPrototypeAnonymous',
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
				      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mockSyncStorageMySQLPrototypeAnonymous list</title></head><body><div><ul><li><a href="/v1/mockSyncStorageMySQLPrototypeAnonymous/1">1</a></li></ul><ul><li><a href="/v1/mockSyncStorageMySQLPrototypeAnonymous/2">2</a></li></ul></div></body></html>' );
			      } );
		} );

	if( !mu.runinbrowser )
		it( "is returning 200 and the objects list in JSON format when GETed for mockSyncStorageMySQLPrototypeAnonymous root '/mockSyncStorageMySQLPrototypeAnonymous.json'", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			runs( function()
			      {
				      muBrowser.get
				      (
					      'http://localhost:8002/v1/mockSyncStorageMySQLPrototypeAnonymous.json',
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
				      expect( responseValue.grabbedDatas ).toEqual( '["1","2"]' );
			      } );
		} );

	if( !mu.runinbrowser )
		it( "is returning 200 and the object properties and values in HTML format when GETed with mockSyncStorageMySQLPrototypeAnonymous/[id]", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			runs( function()
			      {
				      muBrowser.get
				      (
					      'http://localhost:8002/v1/mockSyncStorageMySQLPrototypeAnonymous/1',
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
				      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mockSyncStorageMySQLPrototypeAnonymous properties</title></head><body><div><ul>mockProperty<li>mockPropertyAnonymousValue1</li></ul></div></body></html>' );
			      } );
		} );

	if( !mu.runinbrowser )
		it( "is returning 200 and the object properties and values in JSON format when GETed with mockSyncStorageMySQLPrototypeAnonymous/[id].json", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			runs( function()
			      {
				      muBrowser.get
				      (
					      'http://localhost:8002/v1/mockSyncStorageMySQLPrototypeAnonymous/1.json',
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

				      expect( responseValue.grabbedDatas ).toEqual( '{"mockProperty":"mockPropertyAnonymousValue1"}' );
			      } );
		} );

	setTimeout( function( )
	            {
		            muSyncMock.stop( );
		            mu.debug( 'endpoint is closed' );
		            mockObject1.relInstance( );
		            mockObject1FromAnonymous.relInstance( );
		            mockObject2FromAnonymous.relInstance( );
	            }, 600 );

});