/**
 * Date: 2013-07-01
 * User: bruno
 *
 * Jasmine BDD test for muORM with MySQL Storage backend
 *
 */


mu.require( 'muStorage' );
mu.require( 'muORM' );

if( !mu.runinbrowser )
describe( "muORM with MySQL as storage backend", function()
{
	//mu.activateDebug( );
	var muMySQLDrvStorageMock = new mu.Storage.Driver( 'persistent', 'mysql', 'localhost/test', 'muTestRW', 'mUt3ST' );
	//this is a special feature that allow us to make sure we keep this connection alive during the jasmin async tests
	muMySQLDrvStorageMock.driver.Storages[ muMySQLDrvStorageMock.storagePathOrURI ].keepAlive( );

	var muORMMock = new mu.ORM.Schema( './testschema/', muMySQLDrvStorageMock );

	it( "is defined", function()
	{
		expect( muORMMock ).toBeDefined( );
		expect( muMySQLDrvStorageMock ).toBeDefined( );
		expect( muORMMock.defaultStorage ).toEqual( muMySQLDrvStorageMock );
	});

	it( "defines pathSchemas", function()
	{
		expect( muORMMock.pathSchemas ).toBeDefined( );
		expect( muORMMock.pathSchemas ).toEqual( './testschema/' );
	});

	it( "load muORMTestNumeric schema, defines object, set default value/type and use MySQL storage", function()
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