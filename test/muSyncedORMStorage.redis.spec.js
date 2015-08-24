/**
 * Date: 2013-07-01
 * User: bruno
 *
 *  This is the Jasmine BDD test for the muSynced ORM with Redis Storage as back end
 *
 */

mu.require( '../src/muSync' );
mu.require( '../src/muORM' );
mu.require( '../src/muStorage' );

mu.require( '../src/muBrowser' );

//redis is server side specific
if( !mu.runinbrowser )
    describe( "muSync with Redis Storage linked", function()
    {
        //mu.activateDebug( );
        var apiURL = 'localhost';
        var oldSyncStamp = new Date().getTime();
        var muBrowser;
        var muRedisDrvStorageMock = new mu.Storage.Driver( 'persistent', 'redis', 'localhost' );
        //this is a special feature that allow us to make sure we keep this connection alive during the jasmin async tests
        muRedisDrvStorageMock.driver.Storages[ muRedisDrvStorageMock.storagePathOrURI ].keepAlive( );

        var muORMMock = new mu.ORM.Schema( './testschema/', muRedisDrvStorageMock );

        //we use a different port because we would step on muSync and muSyncedStorage.redis Jasmine BDD test EndPoint
        var muSyncMock = new mu.Sync.EndPoint( apiURL, 8006, true, muORMMock );

        muSyncMock.start( );
        mu.debug( 'endpoint is connected at http://' + apiURL + ':' + muSyncMock.endpointPort );

        muBrowser = new mu.Browser();

        it( "are defined and linked", function()
        {
            expect( muSyncMock ).toBeDefined( );
            expect( muRedisDrvStorageMock ).toBeDefined( );
            expect( muORMMock.defaultStorage ).toEqual( muRedisDrvStorageMock );
            expect( muSyncMock.objectList ).toEqual( muORMMock.objectList );
            expect( muSyncMock.objectInstances ).toEqual( muORMMock.objectInstances );
            expect( muSyncMock.objectList ).toEqual( muRedisDrvStorageMock.objectList );
            expect( muSyncMock.objectInstances ).toEqual( muRedisDrvStorageMock.objectInstances );
            expect( muSyncMock.APIName ).toEqual( muORMMock.SchemaName );

            expect( muBrowser ).toBeDefined( );
        });

        if( !mu.runinbrowser )
            it( "is returning 200 and the objects in HTML format when GETed for root '', '/', '/index', '/index.htm', '/index.html'", function()
            {
                var asyncTick = false;
                var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

                expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();
                expect( muSyncMock.objectList ).toEqual( muORMMock.objectList );
                expect( muSyncMock.objectInstances ).toEqual( muORMMock.objectInstances );
                expect( muSyncMock.objectList ).toEqual( muRedisDrvStorageMock.objectList );
                expect( muSyncMock.objectInstances ).toEqual( muRedisDrvStorageMock.objectInstances );

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
                        expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>testschema API</title></head><body><details><dl><dt><dfn>muORMTestMix</dfn></dt><dd><a href="/v1/muORMTestMix">/v1/muORMTestMix</a></dd></dl></details></body></html>' );
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
                expect( muORMTestMixMock.muUID ).toBeDefined( );
                var currentMuUID = muORMTestMixMock.muUID;

                expect( muORMTestMixMock ).toBeDefined();
                expect( muORMTestMixMock.muORMTestMixString ).toEqual( "name value is a string with this as default" );
                expect( muORMTestMixMock.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
                expect( muORMTestMixMock.muORMTestMixNumeric ).toEqual( 15 );
                expect( muORMTestMixMock.muSyncStamp ).toBeDefined( );
                expect( muORMTestMixMock.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

                runs( function()
                {
                    muBrowser.get
                    (
                        'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMTestMix',
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
                    expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muORMTestMix list</title></head><body><details><dl><dt><dfn>' + currentMuUID + '</dfn></dt><dd><a href="/v1/muORMTestMix/' + currentMuUID + '">/v1/muORMTestMix/' + currentMuUID + '</a></dd></dl></details></body></html>' );

                    muORMTestMixMock.relInstance( );

                    expect( muORMTestMixMock.muUID ).toBeUndefined( );
                    expect( muSyncMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ] ).toBeUndefined( );
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
                expect( muORMTestMixMock1.muUID ).toBeDefined( );
                var currentMuUID1 = muORMTestMixMock1.muUID;

                expect( muORMTestMixMock1 ).toBeDefined();
                expect( muORMTestMixMock1.muORMTestMixString ).toEqual( "name value is a string with this as default" );
                expect( muORMTestMixMock1.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
                expect( muORMTestMixMock1.muORMTestMixNumeric ).toEqual( 15 );
                expect( muORMTestMixMock1.muSyncStamp ).toBeDefined( );
                expect( muORMTestMixMock1.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

                var muORMTestMixMock2 = new muORMTestMix();
                expect( muORMTestMixMock2.muUID ).toBeDefined( );
                var currentMuUID2 = muORMTestMixMock2.muUID;

                expect( muORMTestMixMock2 ).toBeDefined();
                expect( muORMTestMixMock2.muORMTestMixString ).toEqual( "name value is a string with this as default" );
                expect( muORMTestMixMock2.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
                expect( muORMTestMixMock2.muORMTestMixNumeric ).toEqual( 15 );
                expect( muORMTestMixMock2.muSyncStamp ).toBeDefined( );
                expect( muORMTestMixMock2.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

                runs( function()
                {
                    muBrowser.get
                    (
                        'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMTestMix.json',
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

                    muORMTestMixMock1.relInstance( );
                    muORMTestMixMock2.relInstance( );

                    expect( muORMTestMixMock1.muUID ).toBeUndefined( );
                    expect( muSyncMock.objectInstances[ 'muORMTestMix' ][ currentMuUID1 ] ).toBeUndefined( );
                    expect( muORMTestMixMock2.muUID ).toBeUndefined( );
                    expect( muSyncMock.objectInstances[ 'muORMTestMix' ][ currentMuUID2 ] ).toBeUndefined( );
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
                expect( muORMTestMixMock.muUID ).toBeDefined( );
                var currentMuUID = muORMTestMixMock.muUID;

                expect( muORMTestMixMock ).toBeDefined();
                expect( muORMTestMixMock.muORMTestMixString ).toEqual( "name value is a string with this as default" );
                expect( muORMTestMixMock.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
                expect( muORMTestMixMock.muORMTestMixNumeric ).toEqual( 15 );
                expect( muORMTestMixMock.muSyncStamp ).toBeDefined( );
                expect( muORMTestMixMock.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

                runs( function()
                {
                    muBrowser.get
                    (
                        'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMTestMix/' + currentMuUID,
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
                    expect( responseValue.grabbedDatas ).toEqual( '<!DOCTYPE html><html><head><title>muORMTestMix muUID=' + currentMuUID + ' properties</title></head><body><h1>' + currentMuUID + '</h1><details><dl><dt><dfn>muSyncStamp</dfn></dt><dd>' + muORMTestMixMock.muSyncStamp + '</dd><dt><dfn>muORMTestMixString</dfn></dt><dd>name value is a string with this as default</dd><dt><dfn>muORMTestMixDate</dfn></dt><dd>Mon Mar 12 2012 00:00:00 GMT-0400 (EDT)</dd><dt><dfn>muORMTestMixNumeric</dfn></dt><dd>15</dd></dl></details></body></html>' );

                    muORMTestMixMock.relInstance( );

                    expect( muORMTestMixMock.muUID ).toBeUndefined( );
                    expect( muSyncMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ] ).toBeUndefined( );
                } );
            } );

        if( !mu.runinbrowser )
            it( "is returning 200 and the object properties and values in JSON format when GETed with muORMTestMix/[id].json", function()
            {
                var asyncTick = false;
                var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

                expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();

                var muORMTestMixMock = new muORMTestMix();
                expect( muORMTestMixMock.muUID ).toBeDefined( );
                var currentMuUID = muORMTestMixMock.muUID;

                expect( muORMTestMixMock ).toBeDefined();
                expect( muORMTestMixMock.muORMTestMixString ).toEqual( "name value is a string with this as default" );
                expect( muORMTestMixMock.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
                expect( muORMTestMixMock.muORMTestMixNumeric ).toEqual( 15 );
                expect( muORMTestMixMock.muSyncStamp ).toBeDefined( );
                expect( muORMTestMixMock.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

                expect( muORMMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ] ).toEqual( muORMTestMixMock );
                expect( muORMMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ].muORMTestMixString ).toEqual( "name value is a string with this as default" );
                expect( muORMMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ].muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
                expect( muORMMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ].muORMTestMixNumeric ).toEqual( 15 );
                expect( muORMMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ].muSyncStamp ).toEqual( muORMTestMixMock.muSyncStamp );

                runs( function()
                {
                    muBrowser.get
                    (
                        'http://' + apiURL + ':' + muSyncMock.endpointPort + '/v1/muORMTestMix/' + currentMuUID + '.json',
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

                    expect( muORMMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ].muORMTestMixString ).toEqual( "name value is a string with this as default" );
                    expect( muORMMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ].muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
                    expect( muORMMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ].muORMTestMixNumeric ).toEqual( 15 );

                    expect( responseValue.grabbedDatas ).toEqual( '{"muUID":"' + currentMuUID + '","muORMTestMixString":"name value is a string with this as default","muORMTestMixDate":"2012-03-12T04:00:00.000Z","muORMTestMixNumeric":15}' );

                    muORMTestMixMock.relInstance( );

                    expect( muORMTestMixMock.muUID ).toBeUndefined( );
                    expect( muSyncMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ] ).toBeUndefined( );
                } );
            } );

        setTimeout( function( )
        {
            muSyncMock.stop( );
            mu.debug( 'endpoint is closed' );

        }, CONST_TEST_RUNLENGTH );

    });