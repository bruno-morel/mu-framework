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
	var oldSyncStamp = new Date().getTime();
	var muSyncMock;
	var muORMMock;

	muORMMock = new mu.ORM.Schema( 'testschemawithsync/' );
    muORMMock.loadAllDBSchema( );

    muSyncMock = new mu.Sync.EndPoint( 'testsync/', 80, true, muORMMock );
    //muSyncMock.start( );
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
		muORMMock.loadDBSchema( 'muORMWithSyncTestNumeric' );
	});

	it( "get the full object list of the ORMed object and their current instances", function()
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
			      expect( muSyncMock.objectList[ "muORMWithSyncTestMix" ] ).toBeDefined();
			      expect( muSyncMock.objectList[ "muORMWithSyncTestNumeric" ] ).toBeDefined();

			      expect( Object.keys( muSyncMock.objectInstances ).length ).toEqual( 2 );
			      expect( Object.keys( muSyncMock.objectInstances[ 'muORMWithSyncTestMix' ] ).length ).toEqual( 0 );
			      expect( Object.keys( muSyncMock.objectInstances[ 'muORMWithSyncTestNumeric' ] ).length ).toEqual( 2 );
			      expect( muSyncMock.objectInstances[ "muORMWithSyncTestNumeric" ] ).toEqual(
				      {
					      "22a02f3d-0218-b8d6-8e99-b6ba7aa65674":
						      {
							      "muORMWithSyncTestNumeric1":    1,
							      "muORMWithSyncTestNumeric2":    2,
							      "muORMWithSyncTestNumeric3":    3
						      },
					      "3995306d-61a8-8b33-7a8d-8f8b77807a6f":
						      {
							      "muORMWithSyncTestNumeric1":    4,
							      "muORMWithSyncTestNumeric2":    5,
							      "muORMWithSyncTestNumeric3":    6
						      }
				      });
			      expect( muSyncMock.objectInstances[ "muORMWithSyncTestNumeric" ][ '22a02f3d-0218-b8d6-8e99-b6ba7aa65674' ].muSyncStamp ).toBeDefined( );
			      expect( muSyncMock.objectInstances[ "muORMWithSyncTestNumeric" ][ '3995306d-61a8-8b33-7a8d-8f8b77807a6f' ].muSyncStamp ).toBeDefined( );
			      expect( muSyncMock.objectInstances[ "muORMWithSyncTestNumeric" ][ '22a02f3d-0218-b8d6-8e99-b6ba7aa65674' ].muSyncStamp ).not.toBeLessThan( oldSyncStamp );
			      expect( muSyncMock.objectInstances[ "muORMWithSyncTestNumeric" ][ '3995306d-61a8-8b33-7a8d-8f8b77807a6f' ].muSyncStamp ).not.toBeLessThan( oldSyncStamp );

			      // let's make sure we didn't messed up with other muORM objects
			      expect( muSyncMock.objectList[ "muORMTestDate" ] ).toBeUndefined();
			      expect( muSyncMock.objectList[ "muORMTestRelationship11" ] ).toBeUndefined();
			      expect( muSyncMock.objectList[ "muORMTestRelationship1N" ] ).toBeUndefined();
			      expect( muSyncMock.objectList[ "muORMTestRelationshipNN" ] ).toBeUndefined();
			      expect( muSyncMock.objectList[ "muORMTestRelationshipNN2" ] ).toBeUndefined();
			      expect( muSyncMock.objectList[ "muORMTestStoragePersistent" ] ).toBeUndefined();
			      expect( muSyncMock.objectList[ "muORMTestStoragePersistentWithPath" ] ).toBeUndefined();
			      expect( muSyncMock.objectList[ "muORMTestStorageSession" ] ).toBeUndefined();
			      expect( muSyncMock.objectList[ "muORMTestStorageVolatile" ] ).toBeUndefined();
			      expect( muSyncMock.objectList[ "muORMTestString" ] ).toBeUndefined();

			      muSyncMock.stop( );

			      expect( Object.keys( muSyncMock.objectInstances[ 'muORMWithSyncTestMix' ] ).length ).toEqual( 0 );
			      expect( Object.keys( muSyncMock.objectInstances[ 'muORMWithSyncTestNumeric' ] ).length ).toEqual( 0 );
		      } );
	});

	it( "add new object to the object instance list", function()
	{
		var mockTestMixWithSync = new muORMWithSyncTestMix( );

		expect( mockTestMixWithSync.muORMWithSyncTestMixString ).toEqual( "name value is a string with this as default" );
		expect( mockTestMixWithSync.muORMWithSyncTestMixDate ).toBeDefined( );
		expect( mockTestMixWithSync.muORMWithSyncTestMixNumeric ).toEqual( 15 );
		expect( mockTestMixWithSync.muSyncStamp ).toBeDefined( );

		expect( Object.keys( muSyncMock.objectInstances[ 'muORMWithSyncTestMix' ] ).length ).toEqual( 1 );
		expect( muSyncMock.objectInstances[ 'muORMWithSyncTestMix' ][ mockTestMixWithSync.muUID ] ).toEqual( mockTestMixWithSync );
		expect( muSyncMock.objectInstances[ 'muORMWithSyncTestMix' ][ mockTestMixWithSync.muUID ].muSyncStamp ).toEqual( mockTestMixWithSync.muSyncStamp );
	});

	it( "has the right default values for constructors", function()
	{
		var mockTestNumericWithSync = new muORMWithSyncTestNumeric( );

		expect( mockTestNumericWithSync.muORMWithSyncTestNumeric1 ).toEqual( 15 );
		expect( mockTestNumericWithSync.muORMWithSyncTestNumeric2 ).toBeDefined( );
		expect( mockTestNumericWithSync.muORMWithSyncTestNumeric3 ).toEqual( 15 );
		expect( mockTestNumericWithSync.muSyncStamp ).toBeDefined( );
		expect( mockTestNumericWithSync.muSyncStamp ).not.toBeLessThan( oldSyncStamp );

		expect( Object.keys( muSyncMock.objectInstances[ 'muORMWithSyncTestNumeric' ] ).length ).toEqual( 1 );
		//expect( muSyncMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ "22a02f3d-0218-b8d6-8e99-b6ba7aa65674" ] ).toEqual({ "muORMWithSyncTestNumeric1":1,"muORMWithSyncTestNumeric2":2,"muORMWithSyncTestNumeric3":3});
		//expect( muSyncMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ "3995306d-61a8-8b33-7a8d-8f8b77807a6f" ] ).toEqual({ "muORMWithSyncTestNumeric1":4,"muORMWithSyncTestNumeric2":5,"muORMWithSyncTestNumeric3":6});
		expect( muSyncMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ mockTestNumericWithSync.muUID ] ).toEqual( mockTestNumericWithSync );

		//expect( muSyncMock.objectInstances[ 'muORMWithSyncTestMix' ][ "22a02f3d-0218-b8d6-8e99-b6ba7aa65674" ].muSyncStamp ).not.toBeLessThan( oldSyncStamp );
		//expect( muSyncMock.objectInstances[ 'muORMWithSyncTestMix' ][ "3995306d-61a8-8b33-7a8d-8f8b77807a6f" ].muSyncStamp ).not.toBeLessThan( oldSyncStamp );
		expect( muSyncMock.objectInstances[ 'muORMWithSyncTestNumeric' ][ mockTestNumericWithSync.muUID ].muSyncStamp ).toEqual( mockTestNumericWithSync.muSyncStamp );
	});
});