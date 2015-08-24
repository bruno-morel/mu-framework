/**
 * User: bruno
 * Date: 2014-03-08
 *
 * Redis muStorage driver BDD (muJasmine) specification file
 */
mu.require( '../src/muStorage' );

//redis is server side specific
if( !mu.runinbrowser )
describe( "muStorageRedis", function()
{
    //mu.activateDebug( );
    var muRedisDrvStorageMock = new mu.Storage.Driver( 'persistent', 'redis', 'localhost' );

    //this is a special feature that allow us to make sure we keep this connection alive during the jasmin async tests
    muRedisDrvStorageMock.driver.Storages[ muRedisDrvStorageMock.storagePathOrURI ].keepAlive( );

    it( "accept to load the redis driver, and got all the driver capabilities", function()
    {
        expect( muRedisDrvStorageMock ).toBeDefined( );
        expect( muRedisDrvStorageMock.driver.ownInstance ).toBeDefined( );
        expect( muRedisDrvStorageMock.driver.relInstance ).toBeDefined( );
        expect( muRedisDrvStorageMock.driver.getItem ).toBeDefined( );
        expect( muRedisDrvStorageMock.driver.setItem ).toBeDefined( );
    });

    it( "can create and own an object, INSERT it into the DB, UPDATE it and remove it", function()
    {
        function mockRedisOwnedObjectPrototype( constructParameterTest )
        {
            this.mockProperty = constructParameterTest;
            muRedisDrvStorageMock.ownInstance( this, 'mockRedis' );
        }
        mockRedisOwnedObjectPrototype.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

        var mockObject1 = new mockRedisOwnedObjectPrototype( 'mockPropertyValue1' );
        expect( mockObject1.muUID ).toBeDefined( );
        var currentMuUID1 = mockObject1.muUID;

        expect( mockObject1.mockProperty ).toEqual( 'mockPropertyValue1' );
        expect( mockObject1.mockFunction ).toBeDefined( );

        var mockObject2 = new mockRedisOwnedObjectPrototype( 'mockPropertyValue2' );
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