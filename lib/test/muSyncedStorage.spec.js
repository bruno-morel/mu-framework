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
    var muSyncMock = new mu.Sync.EndPoint( 8000, true );
    var muStorageMock;
    var muBrowser;

	var mockObject1FromAnonymous;
	var mockObject2FromAnonymous;

    beforeEach( function( )
    {
	    muSyncMock.setAPIName( 'mySyncedStorageMockSchema' );

	    muStorageMock = new mu.Storage.Driver( );
        var mockPrototypeAnonymous = function ( constructParameterTest )
        {
            this.mockProperty = constructParameterTest;
	        muStorageMock.ownInstance( this, 'mockPrototypeAnonymous', muSyncMock.objectInstances );
        };
	    //we add a non-anonymous prototype, but we wont sync its instances
	    function mockPrototype( constructParameterTest )
	    {
		    this.mockProperty = constructParameterTest;
		    muStorageMock.ownInstance( this );
	    }
        mockPrototypeAnonymous.prototype.mockFunction = function( mockParameter ){ return mockParameter; };

	    mockObject1FromAnonymous = new mockPrototypeAnonymous( 'mockPropertyValue1' );
	    mockObject2FromAnonymous = new mockPrototypeAnonymous( 'mockPropertyValue2' );

	    muSyncMock.addObjectTypeToSync( mockPrototype );
	    muSyncMock.addObjectTypeToSync( mockPrototypeAnonymous, 'mockPrototypeAnonymous' );
	    muSyncMock.addObjectInstanceToSync( mockObject1FromAnonymous, 'mockPrototypeAnonymous' );
	    muSyncMock.addObjectInstanceToSync( mockObject2FromAnonymous, 'mockPrototypeAnonymous' );

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

// TODO : make the push on Root working and answer an error
    /*    if( !mu.runinbrowser )
     it( "is returning 504 and an errorcode in JSON format when PUSHed in the root '/?json'", function()
     {
     var asyncTick = false;
     var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

     runs( function( )
     {
     muBrowser.push
     (
     'http://localhost:8000/?json',
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
     expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":0,"result":["muORMTestDate","muORMTestMix","muORMTestNumeric","muORMTestRelationship11","muORMTestRelationship1N","muORMTestRelationshipNN","muORMTestRelationshipNN2","muORMTestStorageType","muORMTestString"]}' );
     } );
     });
     */

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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mockPrototypeAnonymous properties</title></head><body><div><ul>mockProperty<li>mockPropertyValue1</li></ul></div></body></html>' );

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

                expect( responseValue.grabbedDatas ).toEqual( '{"mockProperty":"mockPropertyValue1"}' );

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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>blabla list</title></head><body><div><ul>errorcode<li>2</li></ul><ul>message<li>blabla does not exist in the synced schema</li></ul></div></body></html>' );

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
                expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":2,"message":"blabla does not exist in the synced schema"}' );

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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/blabla.bla </title></head><body><div><ul>errorcode<li>4</li></ul><ul>message<li>.bla format is not supported</li></ul></div></body></html>' );

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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/muORMTestNumeric.bla </title></head><body><div><ul>errorcode<li>4</li></ul><ul>message<li>.bla format is not supported</li></ul></div></body></html>' );

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
                expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":4,"message":".bla?json format is not supported"}' );

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