/**
 * User: bruno
 * Date: 2013-02-23
 * Time: 10:21 PM
 *
 * MySQL muStorage driver BDD (muJasmine) specification file
 */

mu.require( 'muStorage' );


describe( "muStorageMySQL", function()
{
    //mu.activateDebug( );
    var muMySQLDrvStorageMock = new mu.Storage.Driver( 'persistent', 'mysql', 'localhost/test', 'muTest', 'mUt3ST' );

    it( "accept to load the mysql driver, and got all the driver capabilities", function()
    {
        expect( muMySQLDrvStorageMock ).toBeDefined( );
        expect( muMySQLDrvStorageMock.driver.lastMuUID ).toBeDefined( );
        expect( muMySQLDrvStorageMock.driver.ownInstance ).toBeDefined( );
        expect( muMySQLDrvStorageMock.driver.relInstance ).toBeDefined( );
        expect( muMySQLDrvStorageMock.driver.getItem ).toBeDefined( );
        expect( muMySQLDrvStorageMock.driver.setItem ).toBeDefined( );
    });

    it( "can create and own an object and INSERT it into the DB", function()
    {
        function mockPrototypeMySQLOwnedObject( constructParameterTest )
        {
            this.mockProperty = constructParameterTest;
            muMySQLDrvStorageMock.ownObject( this, 'mockPrototypeMySQLOwnedObject' );
        }
        mockPrototypeMySQLOwnedObject.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

        var mockObject1 = new mockPrototypeMySQLOwnedObject( 'mockPropertyValue1' );
        expect( mockObject1.mockProperty ).toEqual( 'mockPropertyValue1' );
        expect( mockObject1.mockFunction ).toBeDefined( );
        expect( mockObject1.muUID ).toEqual( 1 );

        var mockObject2 = new mockPrototypeMySQLOwnedObject( 'mockPropertyValue2' );
        expect( mockObject2.mockProperty ).toEqual( 'mockPropertyValue2' );
        expect( mockObject2.mockFunction ).toBeDefined( );
        expect( mockObject2.muUID ).toEqual( 2 );

        mockObject1.mockProperty = 'mockProperty1Changed';
        expect( mockObject1.mockProperty ).toEqual( 'mockProperty1Changed' );
        mockObject2.mockProperty = 'mockProperty2Changed';
        expect( mockObject2.mockProperty ).toEqual( 'mockProperty2Changed' );

    });

});