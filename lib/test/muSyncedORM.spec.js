/**
 * User: bruno
 * Date: 12-05-17
 *
 * muSync Jasmine BDD specification
 */


mu.require( 'muSync' );
mu.require( 'muORM' );
mu.require( 'muBrowser' );


describe( "muSync with ORM schema linked", function()
{
    //mu.activateDebug( );
    var muSyncMock;
    var muORMMock;
    var muBrowser;

    beforeEach( function( )
    {
        muORMMock = new mu.ORM.Schema( './testschema/' );
        muORMMock.loadAllDBSchema( );

        muSyncMock = new mu.Sync.EndPoint( 8000, true, muORMMock );
	    muSyncMock.start( );
        mu.debug( 'endpoint is connected at http://localhost:' + muSyncMock.endpointPort );

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
        muORMMock.loadDBSchema( 'muORMTestNumeric' );
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
                                  'http://localhost:8000/v1' + urlRootVariant,
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
                          expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>testschema API</title></head><body><div><ul><li><a href="/v1/muORMTestDate">muORMTestDate</a></li></ul><ul><li><a href="/v1/muORMTestMix">muORMTestMix</a></li></ul><ul><li><a href="/v1/muORMTestNumeric">muORMTestNumeric</a></li></ul><ul><li><a href="/v1/muORMTestRelationship11">muORMTestRelationship11</a></li></ul><ul><li><a href="/v1/muORMTestRelationship1N">muORMTestRelationship1N</a></li></ul><ul><li><a href="/v1/muORMTestRelationshipNN">muORMTestRelationshipNN</a></li></ul><ul><li><a href="/v1/muORMTestRelationshipNN2">muORMTestRelationshipNN2</a></li></ul><ul><li><a href="/v1/muORMTestStoragePersistent">muORMTestStoragePersistent</a></li></ul><ul><li><a href="/v1/muORMTestStoragePersistentMySQL">muORMTestStoragePersistentMySQL</a></li></ul><ul><li><a href="/v1/muORMTestStoragePersistentWithPath">muORMTestStoragePersistentWithPath</a></li></ul><ul><li><a href="/v1/muORMTestStorageSession">muORMTestStorageSession</a></li></ul><ul><li><a href="/v1/muORMTestStorageVolatile">muORMTestStorageVolatile</a></li></ul><ul><li><a href="/v1/muORMTestString">muORMTestString</a></li></ul></div></body></html>' );
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
                                  'http://localhost:8000/v1' + urlRootVariant,
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
                          expect( responseValue.grabbedDatas ).toEqual( '["muORMTestDate","muORMTestMix","muORMTestNumeric","muORMTestRelationship11","muORMTestRelationship1N","muORMTestRelationshipNN","muORMTestRelationshipNN2","muORMTestStoragePersistent","muORMTestStoragePersistentMySQL","muORMTestStoragePersistentWithPath","muORMTestStorageSession","muORMTestStorageVolatile","muORMTestString"]' );
                      } );
            };

            testforRoot( '?json' );
            testforRoot( '/?json' );
            testforRoot( '/.json' );
            testforRoot( '/index?json' );
            testforRoot( '/index.json' );
        });

// TODO : make the push on Root working and answer an error
    if( !mu.runinbrowser )
        it( "is returning 504 and an error code in JSON format when POSTed in the root '/v1/?json'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function( )
                  {
                      muBrowser.post
                      (
                          'http://localhost:8000/v1/?json',
                          { 'fakepostdata' : 'fake' },
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
                      expect( responseValue.statusCode ).toEqual( 504 );
                      expect( responseValue.contentType ).toEqual( 'application/json' );
                      expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":6,"message":"\\"/v1/?json\\" method not allowed on URI"}' );
                  } );
        });

	if( !mu.runinbrowser )
		it( "is returning 200, the new object muUID and the object data passed in HTML format when POSTed in muORMTestNumeric root '/v1/muORMTestNumeric'", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			runs( function( )
			      {
				      muBrowser.post
				      (
					      'http://localhost:8000/v1/muORMTestNumeric',
					      {
						      "muORMTestNumeric1":    1,
						      "muORMTestNumeric2":    2,
						      "muORMTestNumeric3":    3
					      },
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
				      expect( responseValue.statusCode ).toEqual( 504 );
				      expect( responseValue.contentType ).toEqual( 'application/json' );
				      expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":6,"message":"\\"/v1/?json\\" method not allowed on URI"}' );
			      } );
		});

    if( !mu.runinbrowser )
        it( "is returning 200 and the objects in HTML format when GETed for muORMTestNumeric root '/muORMTestNumeric'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            //let's check that we got a normal default muORMTestNumeric object
            var muORMTestNumericMock = new muORMTestNumeric();
            expect( muORMTestNumericMock ).toBeDefined();
            expect( muORMTestNumericMock.muORMTestNumeric1 ).toEqual( 15 );
            expect( muORMTestNumericMock.muORMTestNumeric2 ).toBeDefined(  );
            expect( muORMTestNumericMock.muORMTestNumeric3 ).toEqual( 15 );
            expect( muORMTestNumericMock.muUID ).toEqual( 1 );

            runs( function()
                  {
                      muBrowser.get
                          (
                              'http://localhost:8000/v1/muORMTestNumeric',
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
                      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muORMTestNumeric list</title></head><body><div><ul><li><a href="/v1/muORMTestNumeric/1">1</a></li></ul></div></body></html>' );

	                  muORMTestNumericMock.relInstance( );
	                  expect( muORMTestNumericMock.muUID ).toBeUndefined( );
	                  expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ '1' ] ).toBeUndefined( );
                  } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 200 and the objects list in JSON format when GETed for muORMTestNumeric root '/muORMTestNumeric.json'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            //let's check that we got well-defined default muORMTestNumeric object
            var muORMTestNumericMock1 = new muORMTestNumeric();
            expect( muORMTestNumericMock1 ).toBeDefined();
            expect( muORMTestNumericMock1.muORMTestNumeric1 ).toEqual( 15 );
            expect( muORMTestNumericMock1.muORMTestNumeric2 ).toBeDefined(  );
            expect( muORMTestNumericMock1.muORMTestNumeric3 ).toEqual( 15 );
            expect( muORMTestNumericMock1.muUID ).toEqual( 1 );

            var muORMTestNumericMock2 = new muORMTestNumeric();
            expect( muORMTestNumericMock2 ).toBeDefined();
            expect( muORMTestNumericMock2.muORMTestNumeric1 ).toEqual( 15 );
            expect( muORMTestNumericMock2.muORMTestNumeric2 ).toBeDefined(  );
            expect( muORMTestNumericMock2.muORMTestNumeric3 ).toEqual( 15 );
            expect( muORMTestNumericMock2.muUID ).toEqual( 2 );

            runs( function()
                  {
                      muBrowser.get
                          (
                              'http://localhost:8000/v1/muORMTestNumeric.json',
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

	                  muORMTestNumericMock1.relInstance( );
	                  muORMTestNumericMock2.relInstance( );
	                  expect( muORMTestNumericMock1.muUID ).toBeUndefined( );
	                  expect( muORMTestNumericMock2.muUID ).toBeUndefined( );
	                  expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ '1' ] ).toBeUndefined( );
	                  expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ '2' ] ).toBeUndefined( );
                  } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 200 and the object properties and values in HTML format when GETed with muORMTestNumeric/[id]", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            //let's check that we got well-defined default muORMTestNumeric object
            var muORMTestNumericMock1 = new muORMTestNumeric();
            expect( muORMTestNumericMock1 ).toBeDefined();
            expect( muORMTestNumericMock1.muORMTestNumeric1 ).toEqual( 15 );
            expect( muORMTestNumericMock1.muORMTestNumeric2 ).toBeDefined( );
            expect( muORMTestNumericMock1.muORMTestNumeric3 ).toEqual( 15 );
            expect( muORMTestNumericMock1.muUID ).toEqual( 1 );

            runs( function()
                  {
                      muBrowser.get
                          (
                              'http://localhost:8000/v1/muORMTestNumeric/1',
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
                      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muORMTestNumeric properties</title></head><body><div><ul>muORMTestNumeric1<li>15</li></ul><ul>muORMTestNumeric2<li>0</li></ul><ul>muORMTestNumeric3<li>15</li></ul></div></body></html>' );

	                  muORMTestNumericMock1.relInstance( );
	                  expect( muORMTestNumericMock1.muUID ).toBeUndefined( );
	                  expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ '1' ] ).toBeUndefined( );
                  } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 200 and the object properties and values in JSON format when GETed with muORMTestNumeric/[id].json", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            //let's check that we got well-defined default muORMTestNumeric object
            var muORMTestNumericMock1 = new muORMTestNumeric();
            expect( muORMTestNumericMock1 ).toBeDefined();
            expect( muORMTestNumericMock1.muORMTestNumeric1 ).toEqual( 15 );
            expect( muORMTestNumericMock1.muORMTestNumeric2 ).toBeDefined( );
            expect( muORMTestNumericMock1.muORMTestNumeric3 ).toEqual( 15 );
            expect( muORMTestNumericMock1.muUID ).toEqual( 1 );

            expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ 1 ] ).toEqual( muORMTestNumericMock1 );
            expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ 1 ].muORMTestNumeric1 ).toEqual( 15 );
            expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ 1 ].muORMTestNumeric2 ).toBeDefined( );
            expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ 1 ].muORMTestNumeric3 ).toEqual( 15 );

            runs( function()
                  {
                      muBrowser.get
                          (
                              'http://localhost:8000/v1/muORMTestNumeric/1.json',
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

                      expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ 1 ].muORMTestNumeric1 ).toEqual( 15 );
                      expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ 1 ].muORMTestNumeric2 ).toBeDefined( );
                      expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ 1 ].muORMTestNumeric3 ).toEqual( 15 );

                      expect( responseValue.grabbedDatas ).toEqual( '{"muORMTestNumeric1":15,"muORMTestNumeric2":0,"muORMTestNumeric3":15}' );

	                  muORMTestNumericMock1.relInstance( );
	                  expect( muORMTestNumericMock1.muUID ).toBeUndefined( );
	                  expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ '1' ] ).toBeUndefined( );
                  } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 404 and an error message in HTML format when GETed for an unknown noun '/blabla'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
                  {
                      muBrowser.get
                          (
                              'http://localhost:8000/v1/blabla',
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
                      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>blabla list</title></head><body><div><ul>errorcode<li>3</li></ul><ul>message<li>blabla does not exist in the synced schema</li></ul></div></body></html>' );
                  } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 404 and an error message in JSON format when GETed for an unknown noun '/blabla.json'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
                  {
                      muBrowser.get
                          (
                              'http://localhost:8000/v1/blabla.json',
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
                      expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":3,"message":"blabla does not exist in the synced schema"}' );
                  } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 415 and an error message in HTML format when GETed for an unknown noun and an unknown extension '/blabla.bla'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
                  {
                      muBrowser.get
                          (
                              'http://localhost:8000/v1/blabla.bla',
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
                      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/blabla.bla </title></head><body><div><ul>errorcode<li>5</li></ul><ul>message<li>.bla format is not supported</li></ul></div></body></html>' );
                  } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 415 and an error message in HTML format when GETed for a known noun and an unknown extension '/muORMTestNumeric.bla'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
                  {
                      muBrowser.get
                          (
                              'http://localhost:8000/v1/muORMTestNumeric.bla',
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
                      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/muORMTestNumeric.bla </title></head><body><div><ul>errorcode<li>5</li></ul><ul>message<li>.bla format is not supported</li></ul></div></body></html>' );
                  } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 415 and an error message in JSON format when GETed for a known noun and an unknown extension '/muORMTestNumeric.bla?json'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
                  {
                      muBrowser.get
                          (
                              'http://localhost:8000/v1/muORMTestNumeric.bla?json',
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