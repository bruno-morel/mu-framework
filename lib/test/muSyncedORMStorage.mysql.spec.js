/**
 * Date: 2013-07-01
 * User: bruno
 *
 *  This is the Jasmine BDD test for the muSynced ORM with MySQL Storage as back end
 *
 */

/**
 * User: bruno
 * Date: 12-05-17
 *
 * muSync using mysql storage Jasmine BDD specification
 */

mu.require( 'muSync' );
mu.require( 'muORM' );
mu.require( 'muStorage' );

mu.require( 'muBrowser' );

//mysql is server side specific
if( !mu.runinbrowser )
describe( "muSync with MySQL Storage linked", function()
{
	//mu.activateDebug( );
	var muBrowser;
	var muMySQLDrvStorageMock = new mu.Storage.Driver( 'persistent', 'mysql', 'localhost/test', 'muTestRW', 'mUt3ST' );
	//this is a special feature that allow us to make sure we keep this connection alive during the jasmin async tests
	muMySQLDrvStorageMock.driver.Storages[ muMySQLDrvStorageMock.storagePathOrURI ].keepAlive( );

	var muORMMock = new mu.ORM.Schema( './testschema/', muMySQLDrvStorageMock );

	//we use a different port because we would step on muSync and muSyncedStorage.mysql Jasmine BDD test EndPoint
	var muSyncMock = new mu.Sync.EndPoint( 'localhost', 8005, true, muORMMock );

	muSyncMock.start( );
	mu.debug( 'endpoint is connected at http://localhost:' + muSyncMock.endpointPort );

	muBrowser = new mu.Browser();

	it( "are defined and linked", function()
	{
		expect( muSyncMock ).toBeDefined( );
		expect( muMySQLDrvStorageMock ).toBeDefined( );
		expect( muORMMock.defaultStorage ).toEqual( muMySQLDrvStorageMock );
		expect( muSyncMock.objectList ).toEqual( muORMMock.objectList );
		expect( muSyncMock.objectInstances ).toEqual( muORMMock.objectInstances );
		expect( muSyncMock.APIName ).toEqual( muORMMock.SchemaName );

		expect( muBrowser ).toBeDefined( );
	});

	if( !mu.runinbrowser )
		it( "is returning 200 and the objects in HTML format when GETed for root '', '/', '/index', '/index.htm', '/index.html'", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();

			var testforRoot = function( urlRootVariant )
			{
				runs( function()
				      {
					      muBrowser.get
					      (
						      'http://localhost:8005/v1' + urlRootVariant,
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
					      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>testschema API</title></head><body><div><ul><li><a href="/v1/muORMTestMix">muORMTestMix</a></li></ul></div></body></html>' );
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

			expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();

			var testforRoot = function( urlRootVariant )
			{
				runs( function()
				      {
					      muBrowser.get
					      (
						      'http://localhost:8005/v1' + urlRootVariant,
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
					      expect( responseValue.grabbedDatas ).toEqual( '["muORMTestMix"]' );
				      } );
			};

			testforRoot( '?json' );
			testforRoot( '/?json' );
			testforRoot( '/.json' );
			testforRoot( '/index?json' );
			testforRoot( '/index.json' );
		});

	if( !mu.runinbrowser )
		it( "is returning 200 and the objects in HTML format when GETed for muORMTestMix root '/muORMTestMix'", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();

			//let's check that we got a normal default muORMTestMix object
			var muORMTestMixMock = new muORMTestMix();
			expect( muORMTestMixMock ).toBeDefined();
			expect( muORMTestMixMock.muORMTestMixString ).toEqual( "name value is a string with this as default" );
			expect( muORMTestMixMock.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
			expect( muORMTestMixMock.muORMTestMixNumeric ).toEqual( 15 );
			expect( muORMTestMixMock.muUID ).toEqual( 1 );

			runs( function()
			      {
				      muBrowser.get
				      (
					      'http://localhost:8005/v1/muORMTestMix',
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
				      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muORMTestMix list</title></head><body><div><ul><li><a href="/v1/muORMTestMix/1">1</a></li></ul></div></body></html>' );

				      muORMTestMixMock.relInstance( );
			      } );
		} );

	if( !mu.runinbrowser )
		it( "is returning 200 and the objects list in JSON format when GETed for muORMTestMix root '/muORMTestMix.json'", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();

			//let's check that we got a normal default muORMTestMix object
			var muORMTestMixMock1 = new muORMTestMix();
			expect( muORMTestMixMock1 ).toBeDefined();
			expect( muORMTestMixMock1.muORMTestMixString ).toEqual( "name value is a string with this as default" );
			expect( muORMTestMixMock1.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
			expect( muORMTestMixMock1.muORMTestMixNumeric ).toEqual( 15 );
			expect( muORMTestMixMock1.muUID ).toEqual( 2 );

			var muORMTestMixMock2 = new muORMTestMix();
			expect( muORMTestMixMock2 ).toBeDefined();
			expect( muORMTestMixMock2.muORMTestMixString ).toEqual( "name value is a string with this as default" );
			expect( muORMTestMixMock2.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
			expect( muORMTestMixMock2.muORMTestMixNumeric ).toEqual( 15 );
			expect( muORMTestMixMock2.muUID ).toEqual( 3 );

			runs( function()
			      {
				      muBrowser.get
				      (
					      'http://localhost:8005/v1/muORMTestMix.json',
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
				      expect( responseValue.grabbedDatas ).toEqual( '["1","2","3"]' );

				      muORMTestMixMock1.relInstance( );
				      muORMTestMixMock2.relInstance( );
			      } );
		} );

	if( !mu.runinbrowser )
		it( "is returning 200 and the object properties and values in HTML format when GETed with muORMTestNumeric/[id]", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();

			//let's check that we got a normal default muORMTestMix object
			var muORMTestMixMock = new muORMTestMix();
			expect( muORMTestMixMock ).toBeDefined();
			expect( muORMTestMixMock.muORMTestMixString ).toEqual( "name value is a string with this as default" );
			expect( muORMTestMixMock.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
			expect( muORMTestMixMock.muORMTestMixNumeric ).toEqual( 15 );
			expect( muORMTestMixMock.muUID ).toEqual( 4 );

			runs( function()
			      {
				      muBrowser.get
				      (
					      'http://localhost:8005/v1/muORMTestMix/1',
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
				      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muORMTestMix muUID=1 properties</title></head><body><h1>muUID<li>1</li></h1><div><ul>muORMTestMixString<li>name value is a string with this as default</li></ul><ul>muORMTestMixDate<li>Mon Mar 12 2012 00:00:00 GMT-0400 (EDT)</li></ul><ul>muORMTestMixNumeric<li>15</li></ul></div></body></html>' );

				      muORMTestMixMock.relInstance( );
			      } );
		} );

	if( !mu.runinbrowser )
		it( "is returning 200 and the object properties and values in JSON format when GETed with muORMTestMix/[id].json", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();

			var muORMTestMixMock = new muORMTestMix();
			expect( muORMTestMixMock ).toBeDefined();
			expect( muORMTestMixMock.muORMTestMixString ).toEqual( "name value is a string with this as default" );
			expect( muORMTestMixMock.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
			expect( muORMTestMixMock.muORMTestMixNumeric ).toEqual( 15 );
			expect( muORMTestMixMock.muUID ).toEqual( 5 );

			expect( muORMMock.objectInstances[ 'muORMTestMix' ][ 5 ] ).toEqual( muORMTestMixMock );
			expect( muORMMock.objectInstances[ 'muORMTestMix' ][ 5 ].muORMTestMixString ).toEqual( "name value is a string with this as default" );
			expect( muORMMock.objectInstances[ 'muORMTestMix' ][ 5 ].muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
			expect( muORMMock.objectInstances[ 'muORMTestMix' ][ 5 ].muORMTestMixNumeric ).toEqual( 15 );

			runs( function()
			      {
				      muBrowser.get
				      (
					      'http://localhost:8005/v1/muORMTestMix/1.json',
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

				      expect( muORMMock.objectInstances[ 'muORMTestMix' ][ 5 ].muORMTestMixString ).toEqual( "name value is a string with this as default" );
				      expect( muORMMock.objectInstances[ 'muORMTestMix' ][ 5 ].muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
				      expect( muORMMock.objectInstances[ 'muORMTestMix' ][ 5 ].muORMTestMixNumeric ).toEqual( 15 );

				      expect( responseValue.grabbedDatas ).toEqual( '{"muUID":1,"muORMTestMixString":"name value is a string with this as default","muORMTestMixDate":"2012-03-12T04:00:00.000Z","muORMTestMixNumeric":15}' );

				      muORMTestMixMock.relInstance( );
			      } );
		} );

	setTimeout( function( )
	            {
		            muSyncMock.stop( );
		            mu.debug( 'endpoint is closed' );

	            }, CONST_TEST_RUNLENGTH );

});