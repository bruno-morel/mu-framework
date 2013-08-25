/**
 * User: bruno
 * Date: 12-05-17
 *
 * muSync using default storage Jasmine BDD specification
 */


mu.require( 'muSync' );
mu.require( 'muStorage' );
mu.require( 'muBrowser' );


describe( "muSync with Storage linked", function()
{
    //mu.activateDebug( );
    var muSyncMock = new mu.Sync.EndPoint( 'localhost', 8000, true );
    var muStorageMock;
    var muBrowser;

	var mockObject1FromAnonymous;
	var mockObject2FromAnonymous;

    beforeEach( function( )
    {
	    muSyncMock.setAPIName( 'mySyncedStorageMockSchema' );

	    muStorageMock = new mu.Storage.Driver( );
        var mockPrototypeAnonymous = function ( optionalParam )
        {
	        this.mockProperty = ( optionalParam ? optionalParam : '' );

	        muStorageMock.ownInstance( this, 'mockPrototypeAnonymous', muSyncMock.objectInstances );
        };
	    mockPrototypeAnonymous.prototype.mockFunction = function( mockParameter ){ return mockParameter; };
	    mockPrototypeAnonymous.prototype.mockProperty = '';

		//we add a non-anonymous prototype, but we wont sync its instances
	    function mockPrototype( optionalParam )
	    {
		    this.mockProperty = ( optionalParam ? optionalParam : '' );

		    muStorageMock.ownInstance( this );
	    }

	    mockObject1FromAnonymous = new mockPrototypeAnonymous( 'mockPropertyValue1' );
	    mockObject2FromAnonymous = new mockPrototypeAnonymous( 'mockPropertyValue2' );

	    muSyncMock.addObjectTypeToSync( mockPrototype );
	    muSyncMock.addObjectTypeToSync( mockPrototypeAnonymous, 'mockPrototypeAnonymous' );
//	    muSyncMock.addObjectInstanceToSync( mockObject1FromAnonymous, 'mockPrototypeAnonymous' );
//	    muSyncMock.addObjectInstanceToSync( mockObject2FromAnonymous, 'mockPrototypeAnonymous' );

	    muSyncMock.start( );
        mu.debug( 'endpoint is connected at http://localhost:' + muSyncMock.endpointPort );

        muBrowser = new mu.Browser();
    });

    it( "are defined and linked", function()
    {
        expect( muSyncMock ).toBeDefined( );
        expect( muStorageMock ).toBeDefined( );
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

	            asyncTick = false;

                runs( function()
                {
                    expect( responseValue.statusCode ).toEqual( 200 );
                    expect( responseValue.contentType ).toEqual( 'text/html' );
                    expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mySyncedStorageMockSchema API</title></head><body><div><ul><li><a href="/v1/mockPrototype">mockPrototype</a></li></ul><ul><li><a href="/v1/mockPrototypeAnonymous">mockPrototypeAnonymous</a></li></ul></div></body></html>' );

	                mockObject1FromAnonymous.relInstance( );
	                mockObject2FromAnonymous.relInstance( );

	                expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	                expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	                expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	                expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );

	                asyncTick = true;
                } );

		        waitsFor( function() { return asyncTick; } );
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

	            asyncTick = false;

	            runs( function()
                {
                    expect( responseValue.statusCode ).toEqual( 200 );
                    expect( responseValue.contentType ).toEqual( 'application/json' );
                    expect( responseValue.grabbedDatas ).toEqual( '["mockPrototype","mockPrototypeAnonymous"]' );

	                mockObject1FromAnonymous.relInstance( );
	                mockObject2FromAnonymous.relInstance( );

	                expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	                expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	                expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	                expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );

	                asyncTick = true;
                } );

	            waitsFor( function() { return asyncTick; } );
            };

            testforRoot( '?json' );
            testforRoot( '/?json' );
            testforRoot( '/.json' );
            testforRoot( '/index?json' );
            testforRoot( '/index.json' );
        });

    if( !mu.runinbrowser )
        it( "is returning 200 and the objects in HTML format when GETed for mockPrototypeAnonymous root '/mockPrototypeAnonymous'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
            {
                muBrowser.get
                (
                    'http://localhost:8000/v1/mockPrototypeAnonymous',
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

	        asyncTick = false;

            runs( function()
            {
                expect( responseValue.statusCode ).toEqual( 200 );
                expect( responseValue.contentType ).toEqual( 'text/html' );
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mockPrototypeAnonymous list</title></head><body><div><ul><li><a href="/v1/mockPrototypeAnonymous/1">1</a></li></ul><ul><li><a href="/v1/mockPrototypeAnonymous/2">2</a></li></ul></div></body></html>' );

	            mockObject1FromAnonymous.relInstance( );
	            mockObject2FromAnonymous.relInstance( );

	            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );

	            asyncTick = true;
            } );

	        waitsFor( function() { return asyncTick; } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 200 and the objects list in JSON format when GETed for mockPrototypeAnonymous root '/mockPrototypeAnonymous.json'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
            {
                muBrowser.get
                (
                    'http://localhost:8000/v1/mockPrototypeAnonymous.json',
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

	        asyncTick = false;

            runs( function()
            {
                expect( responseValue.statusCode ).toEqual( 200 );
                expect( responseValue.contentType ).toEqual( 'application/json' );
                expect( responseValue.grabbedDatas ).toEqual( '["1","2"]' );

	            mockObject1FromAnonymous.relInstance( );
	            mockObject2FromAnonymous.relInstance( );

	            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );

	            asyncTick = true;
            } );

	        waitsFor( function() { return asyncTick; } );
        } );

	if( !mu.runinbrowser )
		it( "is returning 200, the new object muUID and the object data passed in HTML format when POSTed in mockPrototypeAnonymous root '/v1/mockPrototypeAnonymous'", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			runs( function( )
			      {
				      muBrowser.post
				      (
					      'http://localhost:8000/v1/mockPrototypeAnonymous',
					      JSON.stringify( {
						                      "mockProperty":    "value injected from API"
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
				      expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mockPrototypeAnonymous muUID=3 properties</title></head><body><h1>muUID<li>3</li></h1><div><ul>mockProperty<li>value injected from API</li></ul></div></body></html>' );
			      } );
		});

	if( !mu.runinbrowser )
		it( "is returning 200, the new object muUID and the object data passed in JSON format when POSTed in mockPrototypeAnonymous root '/v1/mockPrototypeAnonymous.json'", function()
		{
			var asyncTick = false;
			var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

			runs( function( )
			      {
				      muBrowser.post
				      (
					      'http://localhost:8000/v1/mockPrototypeAnonymous.json',
					      JSON.stringify( {
						                      "mockProperty":    "value injected from API"
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
				      expect( responseValue.grabbedDatas ).toEqual( '{"muUID":3,"mockProperty":"value injected from API"}' );

				      expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '3' ] ).toBeDefined( );

			      } );
		});

    if( !mu.runinbrowser )
        it( "is returning 200 and the object properties and values in HTML format when GETed with mockPrototypeAnonymous/[id]", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
            {
                muBrowser.get
                (
                    'http://localhost:8000/v1/mockPrototypeAnonymous/1',
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

	        asyncTick = false;

            runs( function()
            {
                expect( responseValue.statusCode ).toEqual( 200 );
                expect( responseValue.contentType ).toEqual( 'text/html' );
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mockPrototypeAnonymous muUID=1 properties</title></head><body><h1>muUID<li>1</li></h1><div><ul>mockProperty<li>mockPropertyValue1</li></ul></div></body></html>' );

	            mockObject1FromAnonymous.relInstance( );
	            mockObject2FromAnonymous.relInstance( );

	            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );

	            asyncTick = true;
            } );

	        waitsFor( function() { return asyncTick; } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 200 and the object properties and values in JSON format when GETed with muORMTestNumeric/[id].json", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
            {
                muBrowser.get
                (
                    'http://localhost:8000/v1/mockPrototypeAnonymous/1.json',
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

	        asyncTick = false;

            runs( function()
            {
                expect( responseValue.statusCode ).toEqual( 200 );
                expect( responseValue.contentType ).toEqual( 'application/json' );

                expect( responseValue.grabbedDatas ).toEqual( '{"muUID":1,"mockProperty":"mockPropertyValue1"}' );

	            mockObject1FromAnonymous.relInstance( );
	            mockObject2FromAnonymous.relInstance( );

	            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );

	            asyncTick = true;
            } );

	        waitsFor( function() { return asyncTick; } );
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

	        asyncTick = false;

            runs( function()
            {
                expect( responseValue.statusCode ).toEqual( 404 );
                expect( responseValue.contentType ).toEqual( 'text/html' );
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>blabla list</title></head><body><div><ul>errorcode<li>3</li></ul><ul>message<li>blabla list does not exist in the synced schema</li></ul></div></body></html>' );

	            mockObject1FromAnonymous.relInstance( );
	            mockObject2FromAnonymous.relInstance( );

	            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );

	            asyncTick = true;
            } );

	        waitsFor( function() { return asyncTick; } );
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

	        asyncTick = false;

            runs( function()
            {
                expect( responseValue.statusCode ).toEqual( 404 );
                expect( responseValue.contentType ).toEqual( 'application/json' );
                expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":3,"message":"blabla list does not exist in the synced schema"}' );

	            mockObject1FromAnonymous.relInstance( );
	            mockObject2FromAnonymous.relInstance( );

	            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );

	            asyncTick = true;
            } );

	        waitsFor( function() { return asyncTick; } );
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

	        asyncTick = false;

            runs( function()
            {
                expect( responseValue.statusCode ).toEqual( 415 );
                expect( responseValue.contentType ).toEqual( 'text/html' );
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/blabla.bla</title></head><body><div><ul>errorcode<li>5</li></ul><ul>message<li>.bla format is not supported</li></ul></div></body></html>' );

	            mockObject1FromAnonymous.relInstance( );
	            mockObject2FromAnonymous.relInstance( );

	            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );

	            asyncTick = true;
            } );

	        waitsFor( function() { return asyncTick; } );
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

	        asyncTick = false;

	        runs( function()
            {
                expect( responseValue.statusCode ).toEqual( 415 );
                expect( responseValue.contentType ).toEqual( 'text/html' );
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/muORMTestNumeric.bla</title></head><body><div><ul>errorcode<li>5</li></ul><ul>message<li>.bla format is not supported</li></ul></div></body></html>' );

	            mockObject1FromAnonymous.relInstance( );
	            mockObject2FromAnonymous.relInstance( );

	            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );


	            asyncTick = true;
            } );

	        waitsFor( function() { return asyncTick; } );
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

	        asyncTick = false;

            runs( function()
            {
                expect( responseValue.statusCode ).toEqual( 415 );
                expect( responseValue.contentType ).toEqual( 'application/json' );
                expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":5,"message":".bla?json format is not supported"}' );

	            mockObject1FromAnonymous.relInstance( );
	            mockObject2FromAnonymous.relInstance( );

	            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
	            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '1' ] ).toBeUndefined( );
	            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ '2' ] ).toBeUndefined( );

	            asyncTick = true;
            } );

	        waitsFor( function() { return asyncTick; } );
        } );

    afterEach( function()
    {
	    muSyncMock.stop( );
	    mu.debug( 'endpoint is closed' );
    } );

});