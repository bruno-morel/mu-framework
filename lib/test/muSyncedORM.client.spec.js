/**
 * Date: 2013-08-25
 * User: bruno
 *
 * muSync using ORM BDD (muJasmine) specification file for the server side
 *
 */

mu.require( 'muSync' );
mu.require( 'muORM' );

describe( "muSync with ORM schema linked", function()
{
	//mu.activateDebug( );
	var muSyncMock;
	var muORMMock;

	muORMMock = new mu.ORM.Schema( 'testschema/' );
    muORMMock.loadAllDBSchema( );

    muSyncMock = new mu.Sync.EndPoint( 'testsync/', 80, true, muORMMock );
    muSyncMock.start( );
    mu.debug( 'endpoint is configured at file://localhost:' + muSyncMock.endpointPort );


	it( "are defined and linked", function()
	{
		expect( muSyncMock ).toBeDefined( );
		expect( muORMMock ).toBeDefined( );
		expect( muSyncMock.objectList ).toEqual( muORMMock.objectList );
		expect( muSyncMock.objectInstances ).toEqual( muORMMock.objectInstances );
		expect( muSyncMock.APIName ).toEqual( muORMMock.SchemaName );
	});

	it( "load the schema and verify the connection to the endpoint", function()
	{
		muORMMock.loadDBSchema( 'muORMTestNumeric' );
	});

	it( "get the full object list of the ORMed object", function()
	{
		var asyncTick = false;

		runs( function()
		      {
			      muSyncMock.start( function( currentMuSync )
			                        {
				                        asyncTick = true;
			                        } );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( muSyncMock.objectList[ "muORMTestDate" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestMix" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestNumeric" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestRelationship11" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestRelationship1N" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestRelationshipNN" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestRelationshipNN2" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestStoragePersistent" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestStoragePersistentWithPath" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestStorageSession" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestStorageVolatile" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMTestString" ] ).toBeDefined();
		      } );
	});

	/*
	it( "has the right default values and is linked with syncable object instance", function()
	{
		var mockTestNumeric = new muORMTestNumeric( );

		expect( mockTestNumeric.muORMTestNumeric1 ).toEqual( 15 );
		expect( mockTestNumeric.muORMTestNumeric2 ).toBeDefined( );
		expect( mockTestNumeric.muORMTestNumeric3 ).toEqual( 15 );

		expect( muSyncMock.objectInstances[ 'muORMTestNumeric' ][ mockTestNumeric.muUID ] ).toEqual( mockTestNumeric );
	});
*/
	it( "get the full object list of the ORMed object", function()
	{
		expect( muSyncMock ).toBeDefined();
	});

});