/**
 * Created by bruno on 11/18/2013.
 *
 * MongoDB muStorage driver BDD (muJasmine) specification file
 */

//WARNING : for this test to run, the mongodb user must have access to the schema 'test' on localhost,
//          OR you must change line 18 connection parameters
mu.require( 'muStorage' );

//mongodb is server side specific
if( !mu.runinbrowser )
    describe( "muStorageMongoDB", function()
    {
        var muMongoDBDrvStorageMock = null;
        muMongoDBDrvStorageMock = new mu.Storage.Driver( 'persistent', 'mongodb', 'localhost/test', 'muTestRW', 'mUt3ST' )

        //mu.activateDebug( );


        it( "accept to load the mongodb driver, and got all the driver capabilities", function()
        {
            expect( muMongoDBDrvStorageMock ).toBeDefined( );
            expect( muMongoDBDrvStorageMock.driver.ownInstance ).toBeDefined( );
            expect( muMongoDBDrvStorageMock.driver.relInstance ).toBeDefined( );
            expect( muMongoDBDrvStorageMock.driver.getItem ).toBeDefined( );
            expect( muMongoDBDrvStorageMock.driver.setItem ).toBeDefined( );
            expect( muMongoDBDrvStorageMock.driver.Storages[ muMongoDBDrvStorageMock.storagePathOrURI ] ).toBeDefined( );
        });

        it( "can create and own an object, INSERT it into the DB, UPDATE it and remove it", function()
        {
            function mockMongoDBOwnedObjectPrototype( constructParameterTest )
            {
                this.mockProperty = constructParameterTest;
                muMongoDBDrvStorageMock.ownInstance( this, 'mockMongoDB' );
            }
            mockMongoDBOwnedObjectPrototype.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

            var mockObject1 = new mockMongoDBOwnedObjectPrototype( 'mockPropertyValue1' );
            expect( mockObject1.muUID ).toBeDefined( );
            var currentMuUID1 = mockObject1.muUID;

            expect( mockObject1.mockProperty ).toEqual( 'mockPropertyValue1' );
            expect( mockObject1.mockFunction ).toBeDefined( );

            var mockObject2 = new mockMongoDBOwnedObjectPrototype( 'mockPropertyValue2' );
            expect( mockObject2.muUID ).toBeDefined( );
            var currentMuUID2 = mockObject2.muUID;
            expect( mockObject2.mockProperty ).toEqual( 'mockPropertyValue2' );
            expect( mockObject2.mockFunction ).toBeDefined( );

            mockObject1.mockProperty = 'mockProperty1Changed';
            expect( mockObject1.mockProperty ).toEqual( 'mockProperty1Changed' );
            mockObject2.mockProperty = 'mockProperty2Changed';
            expect( mockObject2.mockProperty ).toEqual( 'mockProperty2Changed' );

            mockObject1.relInstance( );
            mockObject2.relInstance( );

            expect( mockObject1.muUID ).toBeUndefined( );
            expect( mockObject2.muUID ).toBeUndefined( );
        });


    });