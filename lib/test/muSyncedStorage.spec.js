/**
 * Created with JetBrains WebStorm.
 * User: bruno
 * Date: 2013-05-06
 *
 * muSyncedStorage BDD specification
 */


mu.require( 'muSync' );
mu.require( 'muStorage' );
mu.require( 'muBrowser' );


describe( "muSync with Storage linked", function()
{
    //mu.activateDebug( );
    var muSyncMock;
    var muStorage;
    var muBrowser;

    beforeEach( function( )
    {
        var muDefaultStorageMock = new mu.Storage.Driver( );
        var mockPrototypeAnonymous = function ( constructParameterTest )
        {
            this.mockProperty = constructParameterTest;
            muDefaultStorageMock.ownInstance( this, 'mockPrototypeAnonymous' );
        };
        mockPrototypeAnonymous.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

        var mockObjectFromAnonymous = new mockPrototypeAnonymous( 'mockPropertyValue' );

        muSyncMock = new mu.Sync.EndPoint( 8000, true );
        mu.debug( 'endpoint is connected at http://localhost:' + muSyncMock.endpointPort );

        muBrowser = new mu.Browser();
    });

    it( "are defined and linked", function()
    {
        expect( muSyncMock ).toBeDefined( );
        expect( muORMMock ).toBeDefined( );
        expect( muSyncMock.ORMSchema ).toEqual( muORMMock );

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
                    expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>testschema API</title></head><body><div><ul><li><a href="/v1/muORMTestDate">muORMTestDate</a></li></ul><ul><li><a href="/v1/muORMTestMix">muORMTestMix</a></li></ul><ul><li><a href="/v1/muORMTestNumeric">muORMTestNumeric</a></li></ul><ul><li><a href="/v1/muORMTestRelationship11">muORMTestRelationship11</a></li></ul><ul><li><a href="/v1/muORMTestRelationship1N">muORMTestRelationship1N</a></li></ul><ul><li><a href="/v1/muORMTestRelationshipNN">muORMTestRelationshipNN</a></li></ul><ul><li><a href="/v1/muORMTestRelationshipNN2">muORMTestRelationshipNN2</a></li></ul><ul><li><a href="/v1/muORMTestStorageType">muORMTestStorageType</a></li></ul><ul><li><a href="/v1/muORMTestString">muORMTestString</a></li></ul></div></body></html>' );
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
                    expect( responseValue.grabbedDatas ).toEqual( '["muORMTestDate","muORMTestMix","muORMTestNumeric","muORMTestRelationship11","muORMTestRelationship1N","muORMTestRelationshipNN","muORMTestRelationshipNN2","muORMTestStorageType","muORMTestString"]' );
                } );
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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muORMTestNumeric properties</title></head><body><div><ul>muORMTestNumeric1<li>15</li></ul><ul>muORMTestNumeric2<li>0</li></ul><ul>muORMTestNumeric3<li>15</li></ul><ul>muUID<li>1</li></ul></ul></ul></ul></ul></div></body></html>' );
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

                expect( responseValue.grabbedDatas ).toEqual( '{"muORMTestNumeric1":15,"muORMTestNumeric2":0,"muORMTestNumeric3":15,"muUID":1}' );
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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>blabla list</title></head><body><div><ul>errorcode<li>2</li></ul><ul>message<li>blabla does not exist in the synced schema</li></ul></div></body></html>' );
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
                expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":2,"message":"blabla does not exist in the synced schema"}' );
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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/blabla.bla </title></head><body><div><ul>errorcode<li>4</li></ul><ul>message<li>.bla format is not supported</li></ul></div></body></html>' );
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
                expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>/v1/muORMTestNumeric.bla </title></head><body><div><ul>errorcode<li>4</li></ul><ul>message<li>.bla format is not supported</li></ul></div></body></html>' );
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
                expect( responseValue.grabbedDatas ).toEqual( '{"errorcode":4,"message":".bla?json format is not supported"}' );
            } );
        } );

    afterEach( function() { muSyncMock.stop( ); mu.debug( 'endpoint is closed' ); } );

});