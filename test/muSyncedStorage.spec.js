/**
 * User: bruno
 * Date: 12-05-17
 *
 * muSync using default storage Jasmine BDD specification
 */


mu.require( '../src/muSync' );
mu.require( '../src/muStorage' );
mu.require( '../src/muBrowser' );

if( !mu.runinbrowser )
describe( "muSync with Storage linked", function()
{
    //mu.activateDebug( );
    var muSyncMock = new mu.Sync.EndPoint( 'localhost', 8000, true );
    var muStorageMock;
    var muBrowser;

	var mockObject1FromAnonymous;
	var mockObject2FromAnonymous;

	muStorageMock = new mu.Storage.Driver( );
	var mockPrototypeAnonymous = function ( optionalParam )
	{
		this.mockProperty = ( optionalParam ? optionalParam : '' );

		muStorageMock.ownInstance( this, 'mockPrototypeAnonymous' );
	};
	mockPrototypeAnonymous.prototype.mockFunction = function( mockParameter ){ return mockParameter; };
	mockPrototypeAnonymous.prototype.mockProperty = '';

	//we add a non-anonymous prototype, but we wont sync its instances
	function mockPrototype( optionalParam )
	{
		this.mockProperty = ( optionalParam ? optionalParam : '' );

		muStorageMock.ownInstance( this );
	}

    //we will test both static and dynamically declared prototype in the sync

    //we add link the storage to get dynamic instantiation
    muSyncMock.linkStorageORMSchema( muStorageMock );

    //we add a static declaration for the mockPrototype
    // that we will NEVER instantiate during the tests
    muSyncMock.addObjectTypeToSync( mockPrototype );

	muBrowser = new mu.Browser();

	beforeEach( function( )
    {
	    mockObject1FromAnonymous = new mockPrototypeAnonymous( 'mockPropertyValue1' );
	    mockObject2FromAnonymous = new mockPrototypeAnonymous( 'mockPropertyValue2' );

	    muSyncMock.start( );
        mu.debug( 'endpoint is connected at http://localhost:' + muSyncMock.endpointPort );

    });

    it( "are defined and linked", function()
    {
        expect( muSyncMock ).toBeDefined( );
        expect( muStorageMock ).toBeDefined( );
        expect( muSyncMock.objectList ).toBeDefined( );
	    expect( muSyncMock.objectInstances ).toBeDefined( );
	    expect( muSyncMock.APIName ).toBeDefined( );

        expect( muBrowser ).toBeDefined( );

	    mockObject1FromAnonymous.relInstance( );
	    mockObject2FromAnonymous.relInstance( );

    });

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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>Unknown unmanaged API</title></head><body><details><dl><dt><dfn>mockPrototype</dfn></dt><dd><a href="/v1/mockPrototype">/v1/mockPrototype</a></dd><dt><dfn>mockPrototypeAnonymous</dfn></dt><dd><a href="/v1/mockPrototypeAnonymous">/v1/mockPrototypeAnonymous</a></dd></dl></details></body></html>' );

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
            var currentMuUID1 = mockObject1FromAnonymous.muUID;
            var currentMuUID2 = mockObject2FromAnonymous.muUID;

            expect( responseValue.statusCode ).toEqual( 200 );
            expect( responseValue.contentType ).toEqual( 'text/html' );
            expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mockPrototypeAnonymous list</title></head><body><details><dl><dt><dfn>' + currentMuUID1 + '</dfn></dt><dd><a href="/v1/mockPrototypeAnonymous/' + currentMuUID1 + '">/v1/mockPrototypeAnonymous/' + currentMuUID1 + '</a></dd><dt><dfn>' + currentMuUID2 + '</dfn></dt><dd><a href="/v1/mockPrototypeAnonymous/' + currentMuUID2 + '">/v1/mockPrototypeAnonymous/' + currentMuUID2 + '</a></dd></dl></details></body></html>' );

            mockObject1FromAnonymous.relInstance( );
            mockObject2FromAnonymous.relInstance( );

            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );

            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID1 ] ).toBeUndefined( );
            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID2 ] ).toBeUndefined( );

            asyncTick = true;
        } );

        waitsFor( function() { return asyncTick; } );
    } );

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
            var currentMuUID1 = mockObject1FromAnonymous.muUID;
            var currentMuUID2 = mockObject2FromAnonymous.muUID;

            expect( responseValue.statusCode ).toEqual( 200 );
            expect( responseValue.contentType ).toEqual( 'application/json' );
            expect( responseValue.grabbedDatas ).toEqual( '["' + currentMuUID1 + '","' + currentMuUID2 + '"]' );

            mockObject1FromAnonymous.relInstance( );
            mockObject2FromAnonymous.relInstance( );

            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID1 ] ).toBeUndefined( );
            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID2 ] ).toBeUndefined( );

            asyncTick = true;
        } );

        waitsFor( function() { return asyncTick; } );
    } );

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
			      var currentMuUID1 = mockObject1FromAnonymous.muUID;
			      var currentMuUID2 = mockObject2FromAnonymous.muUID;

			      expect( responseValue.statusCode ).toEqual( 200 );
			      expect( responseValue.contentType ).toEqual( 'text/html' );
			      var splittedResponse = responseValue.grabbedDatas.split( '<details>' );
			      expect( splittedResponse[ 1 ] ).toEqual( '<dl><dt><dfn>mockProperty</dfn></dt><dd>value injected from API</dd></dl></details></body></html>' );

			      mockObject1FromAnonymous.relInstance( );
			      mockObject2FromAnonymous.relInstance( );

			      expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
			      expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
			      expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID1 ] ).toBeUndefined( );
			      expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID2 ] ).toBeUndefined( );
		      } );
	});

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
			      var currentMuUID1 = mockObject1FromAnonymous.muUID;
			      var currentMuUID2 = mockObject2FromAnonymous.muUID;

			      expect( responseValue.statusCode ).toEqual( 200 );
			      expect( responseValue.contentType ).toEqual( 'application/json' );

			      var parsedDatas = null;
			      try{ parsedDatas = JSON.parse( responseValue.grabbedDatas ); }
			      catch( parseError ){ expect( parseError ).toBeUndefined( ); }
			      expect( parsedDatas.muUID ).toBeDefined( );
			      expect( parsedDatas.mockProperty ).toEqual( "value injected from API" );

			      mockObject1FromAnonymous.relInstance( );
			      mockObject2FromAnonymous.relInstance( );

			      expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
			      expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
			      expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID1 ] ).toBeUndefined( );
			      expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID2 ] ).toBeUndefined( );
		      } );
	});

    it( "is returning 200 and the object properties and values in HTML format when GETed with mockPrototypeAnonymous/[id]", function()
    {
        var asyncTick = false;
        var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };
        var currentMuUID1 = mockObject1FromAnonymous.muUID;

        runs( function()
        {
            muBrowser.get
            (
                'http://localhost:8000/v1/mockPrototypeAnonymous/' + currentMuUID1,
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
            var currentMuUID1 = mockObject1FromAnonymous.muUID;
            var currentMuUID2 = mockObject2FromAnonymous.muUID;

            expect( responseValue.statusCode ).toEqual( 200 );
            expect( responseValue.contentType ).toEqual( 'text/html' );
            expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mockPrototypeAnonymous muUID=' + currentMuUID1 + ' properties</title></head><body><h1>' + currentMuUID1 + '</h1><details><dl><dt><dfn>mockProperty</dfn></dt><dd>mockPropertyValue1</dd></dl></details></body></html>' );

            mockObject1FromAnonymous.relInstance( );
            mockObject2FromAnonymous.relInstance( );

            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID1 ] ).toBeUndefined( );
            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID2 ] ).toBeUndefined( );

            asyncTick = true;
        } );

        waitsFor( function() { return asyncTick; } );
    } );

    it( "is returning 200 and the object properties and values in JSON format when GETed with muORMTestNumeric/[id].json", function()
    {
        var asyncTick = false;
        var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };
        var currentMuUID1 = mockObject1FromAnonymous.muUID;
        var currentMuUID2 = mockObject2FromAnonymous.muUID;


        runs( function()
        {
            muBrowser.get
            (
                'http://localhost:8000/v1/mockPrototypeAnonymous/' + currentMuUID1 + '.json',
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

            expect( responseValue.grabbedDatas ).toEqual( '{"muUID":"' + currentMuUID1 + '","mockProperty":"mockPropertyValue1"}' );

            mockObject1FromAnonymous.relInstance( );
            mockObject2FromAnonymous.relInstance( );

            expect( mockObject1FromAnonymous.muUID ).toBeUndefined( );
            expect( mockObject2FromAnonymous.muUID ).toBeUndefined( );
            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID1 ] ).toBeUndefined( );
            expect( muSyncMock.objectInstances[ 'mockPrototypeAnonymous' ][ currentMuUID2 ] ).toBeUndefined( );

            asyncTick = true;
        } );

        waitsFor( function() { return asyncTick; } );
    } );

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
            expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>blabla list</title></head><body><details><dl><dt><dfn>errorcode</dfn></dt><dd>3</dd><dt><dfn>message</dfn></dt><dd>blabla list does not exist in the synced schema</dd></dl></details></body></html>' );

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
            expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/blabla.bla</title></head><body><details><dl><dt><dfn>errorcode</dfn></dt><dd>5</dd><dt><dfn>message</dfn></dt><dd>.bla format is not supported</dd></dl></details></body></html>' );

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
            expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/muORMTestNumeric.bla</title></head><body><details><dl><dt><dfn>errorcode</dfn></dt><dd>5</dd><dt><dfn>message</dfn></dt><dd>.bla format is not supported</dd></dl></details></body></html>' );

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