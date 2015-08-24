/**
 * User: bruno
 * Date: 2013-02-23
 * Time: 10:21 PM
 *
 * MySQL muStorage driver BDD (muJasmine) specification file
 */

//WARNING : for this test to run, a mysql user must be configured with access to the schema 'test' on localhost,
//          or you must change line 18 connection parameters
mu.require( '../src/muStorage' );

//mysql is server side specific
if( !mu.runinbrowser )
describe( "muStorageMySQL", function()
{
    //mu.activateDebug( );
	var muMySQLDrvStorageMock = new mu.Storage.Driver( 'persistent', 'mysql', 'localhost/test', 'muTestRW', 'mUt3ST' );

	//this is a special feature that allow us to make sure we keep this connection alive during the jasmin async tests
	muMySQLDrvStorageMock.driver.Storages[ muMySQLDrvStorageMock.storagePathOrURI ].keepAlive( );

    it( "accept to load the mysql driver, and got all the driver capabilities", function()
    {
	    expect( muMySQLDrvStorageMock ).toBeDefined( );
        expect( muMySQLDrvStorageMock.driver.ownInstance ).toBeDefined( );
        expect( muMySQLDrvStorageMock.driver.relInstance ).toBeDefined( );
        expect( muMySQLDrvStorageMock.driver.getItem ).toBeDefined( );
        expect( muMySQLDrvStorageMock.driver.setItem ).toBeDefined( );
    });

    it( "can create and own an object, INSERT it into the DB, UPDATE it and remove it", function()
    {
        function mockMySQLOwnedObjectPrototype( constructParameterTest )
        {
            this.mockProperty = constructParameterTest;
            muMySQLDrvStorageMock.ownInstance( this, 'mockMySQL' );
        }
	    mockMySQLOwnedObjectPrototype.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

        var mockObject1 = new mockMySQLOwnedObjectPrototype( 'mockPropertyValue1' );
	    expect( mockObject1.muUID ).toBeDefined( );
	    var currentMuUID1 = mockObject1.muUID;

        expect( mockObject1.mockProperty ).toEqual( 'mockPropertyValue1' );
        expect( mockObject1.mockFunction ).toBeDefined( );

        var mockObject2 = new mockMySQLOwnedObjectPrototype( 'mockPropertyValue2' );
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