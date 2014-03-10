/**
 * User: bruno
 * Date: 2014-03-08
 *
 * muSync using Redis storage Jasmine BDD specification
 */

mu.require( 'muSync' );
mu.require( 'muStorage' );
mu.require( 'muBrowser' );


//redis is server side specific
if( !mu.runinbrowser )
describe( "muSync with Redis Storage linked", function()
{
    //mu.activateDebug( );
    var apiURL  = 'localhost';
    var muBrowser;
    var muSyncMock;
    var muRedisDrvStorageMock = new mu.Storage.Driver( 'persistent', 'redis', apiURL );

    //this is a special feature that allow us to make sure we keep this connection alive during the jasmin async tests
    muRedisDrvStorageMock.driver.Storages[ muRedisDrvStorageMock.storagePathOrURI ].keepAlive( );

    //we create some prototype and object to sync
    var mockSyncedRedisAnonymous = function ( optionalParam )
    {
        this.mockProperty = optionalParam;

        muRedisDrvStorageMock.ownInstance( this, 'mockSyncedRedisAnonymous' );
    };
    //we add a non-anonymous prototype
    function mockSyncedRedis( optionalParam )
    {
        this.mockProperty = optionalParam;

        muRedisDrvStorageMock.ownInstance( this );
    }
    mockSyncedRedis.prototype.mockFunction = function( mockParameter ){ return mockParameter; };

    var mockObject1 = new mockSyncedRedis( 'mockPropertyValue1');
    var mockObject1FromAnonymous = new mockSyncedRedisAnonymous( 'mockPropertyAnonymousValue1' );
    var mockObject2FromAnonymous = new mockSyncedRedisAnonymous( 'mockPropertyAnonymousValue2' );

    //we use a different port because we would step on other muSync Jasmine BDD test EndPoint
    muSyncMock = new mu.Sync.EndPoint( apiURL, 8004, true );
    muSyncMock.setAPIName( 'mySyncStorageRedisSchema' );
    muSyncMock.addObjectTypeToSync( mockSyncedRedis );
    muSyncMock.addObjectInstanceToSync( mockObject1 );
    muSyncMock.addObjectTypeToSync( mockSyncedRedisAnonymous, 'mockSyncedRedisAnonymous' );
    muSyncMock.addObjectInstanceToSync( mockObject1FromAnonymous, 'mockSyncedRedisAnonymous' );
    muSyncMock.addObjectInstanceToSync( mockObject2FromAnonymous, 'mockSyncedRedisAnonymous' );

    muSyncMock.start( );
    mu.debug( 'endpoint is connected at http://' + apiURL + ':' + muSyncMock.endpointPort );

    muBrowser = new mu.Browser();

    it( "are defined and linked", function()
    {
        expect( muSyncMock ).toBeDefined( );
        expect( muRedisDrvStorageMock ).toBeDefined( );
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
                    expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mySyncStorageRedisSchema API</title></head><body><details><dl><dt><dfn>mockSyncedRedis</dfn></dt><dd><a href="/v1/mockSyncedRedis">/v1/mockSyncedRedis</a></dd><dt><dfn>mockSyncedRedisAnonymous</dfn></dt><dd><a href="/v1/mockSyncedRedisAnonymous">/v1/mockSyncedRedisAnonymous</a></dd></dl></details></body></html>' );
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
                    expect( responseValue.grabbedDatas ).toEqual( '["mockSyncedRedis","mockSyncedRedisAnonymous"]' );
                } );
            };

            testforRoot( '?json' );
            testforRoot( '/?json' );
            testforRoot( '/.json' );
            testforRoot( '/index?json' );
            testforRoot( '/index.json' );
        });

    if( !mu.runinbrowser )
        it( "is returning 200 and the objects in HTML format when GETed for mockSyncedRedisAnonymous root '/mockSyncedRedisAnonymous'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
            {
                muBrowser.get
                (
                    'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/mockSyncedRedisAnonymous',
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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mockSyncedRedisAnonymous list</title></head><body><details><dl><dt><dfn>' + currentMuUID1 + '</dfn></dt><dd><a href="/v1/mockSyncedRedisAnonymous/' + currentMuUID1 +'">/v1/mockSyncedRedisAnonymous/' + currentMuUID1 +'</a></dd><dt><dfn>' + currentMuUID2 +'</dfn></dt><dd><a href="/v1/mockSyncedRedisAnonymous/' + currentMuUID2 + '">/v1/mockSyncedRedisAnonymous/' + currentMuUID2 + '</a></dd></dl></details></body></html>' );
            } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 200 and the objects list in JSON format when GETed for mockSyncedRedisAnonymous root '/mockSyncedRedisAnonymous.json'", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            runs( function()
            {
                muBrowser.get
                (
                    'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/mockSyncedRedisAnonymous.json',
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
                var currentMuUID1 = mockObject1FromAnonymous.muUID;
                var currentMuUID2 = mockObject2FromAnonymous.muUID;

                expect( responseValue.statusCode ).toEqual( 200 );
                expect( responseValue.contentType ).toEqual( 'application/json' );
                expect( responseValue.grabbedDatas ).toEqual( '["' + currentMuUID1 + '","' + currentMuUID2 + '"]' );
            } );
        } );


    if( !mu.runinbrowser )
        it( "is returning 200 and the object properties and values in HTML format when GETed with mockSyncedRedisAnonymous/[id]", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };
            var currentMuUID1 = mockObject1FromAnonymous.muUID;


            runs( function()
            {
                muBrowser.get
                (
                    'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/mockSyncedRedisAnonymous/' + currentMuUID1,
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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>mockSyncedRedisAnonymous muUID=' + currentMuUID1 + ' properties</title></head><body><h1>' + currentMuUID1 + '</h1><details><dl><dt><dfn>muSyncStamp</dfn></dt><dd>' + mockObject1FromAnonymous.muSyncStamp + '</dd><dt><dfn>mockProperty</dfn></dt><dd>mockPropertyAnonymousValue1</dd></dl></details></body></html>' );
            } );
        } );

    if( !mu.runinbrowser )
        it( "is returning 200 and the object properties and values in JSON format when GETed with mockSyncedRedisAnonymous/[id].json", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };
            var currentMuUID1 = mockObject1FromAnonymous.muUID;
            var currentMuUID2 = mockObject2FromAnonymous.muUID;

            runs( function()
            {
                muBrowser.get
                (
                    'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/mockSyncedRedisAnonymous/' + currentMuUID1 + '.json',
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
                expect( responseValue.grabbedDatas ).toEqual( '{"muUID":"' + currentMuUID1 + '","mockProperty":"mockPropertyAnonymousValue1"}' );
            } );
        } );

    setTimeout( function( )
    {
        muSyncMock.stop( );
        mu.debug( 'endpoint is closed' );
        mockObject1.relInstance( );
        mockObject1FromAnonymous.relInstance( );
        mockObject2FromAnonymous.relInstance( );
    }, CONST_TEST_RUNLENGTH );

});