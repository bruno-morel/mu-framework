/**
 * Date: 2014-03-08
 * User: bruno
 *
 * Jasmine BDD test for muORM with Redis Storage backend
 *
 */


mu.require( '../src/muStorage' );
mu.require( '../src/muORM' );

if( !mu.runinbrowser )
    describe( "muORM with Redis as storage backend", function()
    {
        //mu.activateDebug( );
        var muRedisDrvStorageMock = new mu.Storage.Driver( 'persistent', 'redis', 'localhost' );
        //this is a special feature that allow us to make sure we keep this connection alive during the jasmin async tests
        muRedisDrvStorageMock.driver.Storages[ muRedisDrvStorageMock.storagePathOrURI ].keepAlive( );

        var muORMMock = new mu.ORM.Schema( './testschema/', muRedisDrvStorageMock );

        it( "is defined", function()
        {
            expect( muORMMock ).toBeDefined( );
            expect( muRedisDrvStorageMock ).toBeDefined( );
            expect( muORMMock.defaultStorage ).toEqual( muRedisDrvStorageMock );
        });

        it( "defines pathSchemas", function()
        {
            expect( muORMMock.pathSchemas ).toBeDefined( );
            expect( muORMMock.pathSchemas ).toEqual( './testschema/' );
        });

        it( "load muORMTestNumeric schema, defines object, set default value/type and use Redis storage", function()
        {
            expect( muORMMock.loadDBSchema( 'muORMTestNumeric' ) ).toBeTruthy();
            expect( muORMMock.objectList[ 'muORMTestNumeric' ] ).toBeDefined( );

            var muORMTestNumericMock = new muORMTestNumeric();
            expect( muORMTestNumericMock.muUID ).toBeDefined( );
            var currentMuUID = muORMTestNumericMock.muUID;

            expect( muORMTestNumericMock ).toBeDefined();
            expect( muORMTestNumericMock.muORMTestNumeric1 ).toEqual( 15 );
            expect( muORMTestNumericMock.muORMTestNumeric2 ).toBeDefined(  );
            expect( muORMTestNumericMock.muORMTestNumeric3 ).toEqual( 15 );

            expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ currentMuUID ] ).toEqual( muORMTestNumericMock );

            muORMTestNumericMock.muORMTestNumeric1 = 1;
            muORMTestNumericMock.muORMTestNumeric2 = 2;
            muORMTestNumericMock.muORMTestNumeric3 = 3;

            expect( muORMTestNumericMock.muORMTestNumeric1 ).toEqual( 1 );
            expect( muORMTestNumericMock.muORMTestNumeric2 ).toEqual( 2 );
            expect( muORMTestNumericMock.muORMTestNumeric3 ).toEqual( 3 );

            var muORMTestNumericMockPrototype = Object.getPrototypeOf( muORMTestNumericMock );
            expect( muORMTestNumericMockPrototype.Storage.storageType ).toEqual( "persistent" );

            muORMTestNumericMock.relInstance( );

            expect( muORMTestNumericMock.muUID ).toBeUndefined( );
            expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ currentMuUID ] ).toBeUndefined( );
        });

    });