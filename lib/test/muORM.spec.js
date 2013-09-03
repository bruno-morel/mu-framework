/**
 * Created by bruno
 * 12-03-20 1:25 PM
 */


mu.require( 'fs' );
mu.require( 'muORM' );


describe( "muORM", function()
{
    //mu.activateDebug( );

    var muORMMock = new mu.ORM.Schema( './testschema/' );

	function entityExistInStorage( path, fileName )
	{
		if( mu.runinbrowser )
			return ( path == '/tmp/' ?
			         window.sessionStorage[ fileName ] :
			         window.localStorage[ fileName ] );

		//this is a else :)
		try
		{
			mu.fs.statSync( path + fileName );
			return true;
		}
		catch( error ){ return false; }
	}


    it( "is defined", function()
    {
        expect( muORMMock ).toBeDefined( );
    });

    it( "defines pathSchemas", function()
    {
        expect( muORMMock.pathSchemas ).toBeDefined( );
        expect( muORMMock.pathSchemas ).toEqual( './testschema/' );
    });

    it( "defines objectList", function()
    {
        expect( muORMMock.objectList ).toBeDefined( );
    });

    it( "defines setPathSchemas()", function()
    {
        expect( muORMMock.setPathSchemas ).toBeDefined( );
        muORMMock.setPathSchemas( 'test' );
        expect( muORMMock.pathSchemas ).toBe( 'test' );

        muORMMock.setPathSchemas( './testschema/' );
        expect( muORMMock.pathSchemas ).toBe( './testschema/' );
    });

    it( "defines loadDBSchema( )", function()
    {
        expect( muORMMock.loadDBSchema ).toBeDefined( );
    });

    it( "is not a singleton", function()
    {
        var muORMMock2 = new mu.ORM.Schema( 'testinvalidpath' );

        expect( muORMMock.pathSchemas ).toEqual( './testschema/' );

        expect( muORMMock2.pathSchemas ).toEqual( 'testinvalidpath' );
    });

    it( "is loading all DB schema from directory", function()
    {
        var muORMMockDirectoryLoad = new mu.ORM.Schema( './testschema/' );

        muORMMockDirectoryLoad.loadAllDBSchema( );

        expect( muORMTestMix ).toBeDefined( );
        expect( muORMTestString ).toBeDefined( );
        expect( muORMTestDate ).toBeDefined( );
        expect( muORMTestNumeric ).toBeDefined( );
        expect( muORMTestStorageVolatile ).toBeDefined( );
        expect( muORMTestStorageSession ).toBeDefined( );
        expect( muORMTestStoragePersistent ).toBeDefined( );
	    expect( muORMTestStoragePersistentWithPath ).toBeDefined( );
        expect( muORMTestRelationship1N ).toBeDefined( );
        expect( muORMTestRelationship11 ).toBeDefined( );
        expect( muORMTestRelationshipNN ).toBeDefined( );
        expect( muORMTestRelationshipNN2 ).toBeDefined( );

	    if( !mu.runinbrowser )
		    expect( muORMTestStoragePersistentMySQL ).toBeDefined( );
    });

    it( "load muORMTestNumeric schema, defines object, set default value/type and set the default storage type", function()
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

        var muORMTestNumericMockPrototype = Object.getPrototypeOf( muORMTestNumericMock );
        expect( muORMTestNumericMockPrototype.Storage.storageType ).toEqual( "volatile" );

	    muORMTestNumericMock.relInstance( );

	    expect( muORMTestNumericMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ currentMuUID ] ).toBeUndefined( );
    });

    it( "load muORMTestString schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestString' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestString' ] ).toBeDefined( );

        var muORMTestStringMock = new muORMTestString();
	    expect( muORMTestStringMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestStringMock.muUID;

	    expect( muORMTestStringMock ).toBeDefined();
        expect( muORMTestStringMock.muORMTestString1 ).toEqual( "name value is a string with this as default" );
        expect( muORMTestStringMock.muORMTestString2 ).toBeDefined(  );
        expect( muORMTestStringMock.muORMTestString3 ).toEqual( "name value is a string with this as default" );
        expect( muORMMock.objectInstances[ 'muORMTestString' ][ currentMuUID ] ).toEqual( muORMTestStringMock );

        var muORMTestStringMockPrototype = Object.getPrototypeOf( muORMTestStringMock );
        expect( muORMTestStringMockPrototype.Storage.storageType ).toEqual( "volatile" );

	    muORMTestStringMock.relInstance( );

	    expect( muORMTestStringMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestString' ][ currentMuUID ] ).toBeUndefined( );
    });

    it( "load muORMTestDate schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestDate' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestDate' ] ).toBeDefined( );

        var muORMTestDateMock = new muORMTestDate();
	    expect( muORMTestDateMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestDateMock.muUID;

	    expect( muORMTestDateMock ).toBeDefined();
        expect( muORMTestDateMock.muORMTestDate1 ).toEqual( new Date( "06/20/2012" ) );
        expect( muORMTestDateMock.muORMTestDate2 ).toBeDefined(  );
        expect( muORMMock.objectInstances[ 'muORMTestDate' ][ currentMuUID ] ).toEqual( muORMTestDateMock );

        var muORMTestDateMockPrototype = Object.getPrototypeOf( muORMTestDateMock );
        expect( muORMTestDateMockPrototype.Storage.storageType ).toEqual( "volatile" );
        //can't test 'now' without having a locking problem :)expect( ormTestDateMock.ormTestDate3 ).toEqual( new Date(  ) );

	    muORMTestDateMock.relInstance( );

	    expect( muORMTestDateMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestDate' ][ currentMuUID ] ).toBeUndefined( );
    });

    it( "load muORMTestMix schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestMix' ] ).toBeDefined( );

        var muORMTestMixMock = new muORMTestMix();
	    expect( muORMTestMixMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestMixMock.muUID;

	    expect( muORMTestMixMock ).toBeDefined();
        expect( muORMTestMixMock.muORMTestMixString ).toEqual( "name value is a string with this as default" );
        expect( muORMTestMixMock.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
        expect( muORMTestMixMock.muORMTestMixNumeric ).toEqual( 15 );
        expect( muORMMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ] ).toEqual( muORMTestMixMock );

        var muORMTestMixMockPrototype = Object.getPrototypeOf( muORMTestMixMock );
        expect( muORMTestMixMockPrototype.Storage.storageType ).toEqual( "volatile" );

	    muORMTestMixMock.relInstance( );

	    expect( muORMTestMixMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestMix' ][ currentMuUID ] ).toBeUndefined( );
    });

    it( "load muORMTestStorageVolatile schema, defines object, set default value/type and set the volatile storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestStorageVolatile' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestStorageVolatile' ] ).toBeDefined( );

        var muORMTestStorageVolatileMock = new muORMTestStorageVolatile();
	    expect( muORMTestStorageVolatileMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestStorageVolatileMock.muUID;

	    expect( muORMTestStorageVolatileMock ).toBeDefined();
        expect( muORMTestStorageVolatileMock.muORMTestStorageTypeVolatileProperty1 ).toEqual( "volatile property 1 string" );
        expect( muORMTestStorageVolatileMock.muORMTestStorageTypeVolatileProperty2 ).toEqual( "volatile property 2 string" );
        expect( muORMTestStorageVolatileMock.muORMTestStorageTypeVolatileProperty3 ).toEqual( "volatile property 3 string" );
        expect( muORMMock.objectInstances[ 'muORMTestStorageVolatile' ][ currentMuUID ] ).toEqual( muORMTestStorageVolatileMock );

        var muORMTestStorageVolatileMockPrototype = Object.getPrototypeOf( muORMTestStorageVolatileMock );
        expect( muORMTestStorageVolatileMockPrototype.Storage.storageType ).toEqual( "volatile" );

	    muORMTestStorageVolatileMock.relInstance( );

	    expect( muORMTestStorageVolatileMock.muUID );
	    expect( muORMMock.objectInstances[ 'muORMTestStorageVolatile' ][ currentMuUID ] ).toBeUndefined( );
    });

    it( "load muORMTestStorageSession schema, defines object, set default value/type and set the session storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestStorageSession' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestStorageSession' ] ).toBeDefined( );

        var muORMTestStorageSessionMock = new muORMTestStorageSession();
	    expect( muORMTestStorageSessionMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestStorageSessionMock.muUID;

	    expect( muORMTestStorageSessionMock ).toBeDefined();
        expect( muORMTestStorageSessionMock.muORMTestStorageTypeSessionProperty1 ).toEqual( "session property 1 string" );
        expect( muORMTestStorageSessionMock.muORMTestStorageTypeSessionProperty2 ).toEqual( "session property 2 string" );
        expect( muORMTestStorageSessionMock.muORMTestStorageTypeSessionProperty3 ).toEqual( "session property 3 string" );
	    expect( entityExistInStorage( '/tmp/', 'muORMTestStorageSession:' + currentMuUID + ':muORMTestStorageTypeSessionProperty1' ) ).toBeTruthy( );
	    expect( entityExistInStorage( '/tmp/', 'muORMTestStorageSession:' + currentMuUID + ':muORMTestStorageTypeSessionProperty2' ) ).toBeTruthy( );
	    expect( entityExistInStorage( '/tmp/', 'muORMTestStorageSession:' + currentMuUID + ':muORMTestStorageTypeSessionProperty3' ) ).toBeTruthy( );
        expect( muORMMock.objectInstances[ 'muORMTestStorageSession' ][ currentMuUID ] ).toEqual( muORMTestStorageSessionMock );

        var muORMTestStorageSessionMockPrototype = Object.getPrototypeOf( muORMTestStorageSessionMock );
        expect( muORMTestStorageSessionMockPrototype.Storage.storageType ).toEqual( "session" );

		muORMTestStorageSessionMock.relInstance( );

	    expect( muORMTestStorageSessionMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestStorageSession' ][ currentMuUID ] ).toBeUndefined( );
	    expect( entityExistInStorage( '/tmp/', 'muORMTestStorageSession:' + currentMuUID + ':muORMTestStorageTypeSessionProperty1' ) ).toBeFalsy( );
		expect( entityExistInStorage( '/tmp/', 'muORMTestStorageSession:' + currentMuUID + ':muORMTestStorageTypeSessionProperty2' ) ).toBeFalsy( );
		expect( entityExistInStorage( '/tmp/', 'muORMTestStorageSession:' + currentMuUID + ':muORMTestStorageTypeSessionProperty3' ) ).toBeFalsy( );
    });

    it( "load muORMTestStoragePersistent schema, defines object, set default value/type and set the persistent storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestStoragePersistent' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestStoragePersistent' ] ).toBeDefined( );

        var muORMTestStoragePersistentMock = new muORMTestStoragePersistent();
	    expect( muORMTestStoragePersistentMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestStoragePersistentMock.muUID;

        expect( muORMTestStoragePersistentMock ).toBeDefined();
        expect( muORMTestStoragePersistentMock.muORMTestStorageTypePersistentProperty1 ).toEqual( "persistent property 1 string" );
        expect( muORMTestStoragePersistentMock.muORMTestStorageTypePersistentProperty2 ).toEqual( "persistent property 2 string" );
        expect( muORMTestStoragePersistentMock.muORMTestStorageTypePersistentProperty3 ).toEqual( "persistent property 3 string" );
	    expect( entityExistInStorage( './', 'muORMTestStoragePersistent:' + currentMuUID + ':muORMTestStorageTypePersistentProperty1' ) ).toBeTruthy( );
	    expect( entityExistInStorage( './', 'muORMTestStoragePersistent:' + currentMuUID + ':muORMTestStorageTypePersistentProperty2' ) ).toBeTruthy( );
	    expect( entityExistInStorage( './', 'muORMTestStoragePersistent:' + currentMuUID + ':muORMTestStorageTypePersistentProperty3' ) ).toBeTruthy( );
	    expect( muORMMock.objectInstances[ 'muORMTestStoragePersistent' ][ currentMuUID ] ).toEqual( muORMTestStoragePersistentMock );

        var muORMTestStoragePersistentMockPrototype = Object.getPrototypeOf( muORMTestStoragePersistentMock );
        expect( muORMTestStoragePersistentMockPrototype.Storage.storageType ).toEqual( "persistent" );

		muORMTestStoragePersistentMock.relInstance( );

	    expect( muORMTestStoragePersistentMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestStoragePersistent' ][ currentMuUID ] ).toBeUndefined( );
	    expect( entityExistInStorage( './', 'muORMTestStoragePersistent:' + currentMuUID + ':muORMTestStorageTypePersistentProperty1' ) ).toBeFalsy( );
	    expect( entityExistInStorage( './', 'muORMTestStoragePersistent:' + currentMuUID + ':muORMTestStorageTypePersistentProperty2' ) ).toBeFalsy( );
	    expect( entityExistInStorage( './', 'muORMTestStoragePersistent:' + currentMuUID + ':muORMTestStorageTypePersistentProperty3' ) ).toBeFalsy( );
    });

	//we have a MySQL driver ONLY on the server side
	if( !mu.runinbrowser )
	it( "load muORMTestStoragePersistentMySQL schema, defines object and init the storage type on the object", function()
	{
		expect( muORMMock.loadDBSchema( 'muORMTestStoragePersistentMySQL' ) ).toBeTruthy();
		expect( muORMMock.objectList[ 'muORMTestStoragePersistentMySQL' ] ).toBeDefined( );

		var muORMTestStoragePersistentMySQLMock = new muORMTestStoragePersistentMySQL();
		expect( muORMTestStoragePersistentMySQLMock.muUID ).toBeDefined( );
		var currentMuUID = muORMTestStoragePersistentMySQLMock.muUID;

		expect( muORMTestStoragePersistentMySQLMock ).toBeDefined();
		expect( muORMTestStoragePersistentMySQLMock.muORMTestStorageTypePersistentMySQLProperty1 ).toEqual( "persistent mysql property 1 string" );
		expect( muORMTestStoragePersistentMySQLMock.muORMTestStorageTypePersistentMySQLProperty2 ).toEqual( "persistent mysql property 2 string" );
		expect( muORMTestStoragePersistentMySQLMock.muORMTestStorageTypePersistentMySQLProperty3 ).toEqual( "persistent mysql property 3 string" );
		expect( muORMMock.objectInstances[ 'muORMTestStoragePersistentMySQL' ][ currentMuUID ] ).toEqual( muORMTestStoragePersistentMySQLMock );

		var muORMTestStoragePersistentMySQLMockPrototype = Object.getPrototypeOf( muORMTestStoragePersistentMySQLMock );
		expect( muORMTestStoragePersistentMySQLMockPrototype.Storage.storageType ).toEqual( "persistent" );
		expect( muORMTestStoragePersistentMySQLMockPrototype.Storage.driver.driverName ).toEqual( "mysql" );
		expect( muORMTestStoragePersistentMySQLMockPrototype.Storage.driver.enginePath ).toBeDefined( );
		expect( muORMTestStoragePersistentMySQLMockPrototype.Storage.storagePathOrURI ).toEqual( "mysql://muTestRW:mUt3ST@localhost/test" );
		expect( muORMTestStoragePersistentMySQLMockPrototype.Storage.userLogin ).toEqual( "muTestRW" );
		expect( muORMTestStoragePersistentMySQLMockPrototype.Storage.userPassword).toEqual( "mUt3ST" );

		muORMTestStoragePersistentMySQLMock.relInstance( );

		expect( muORMTestStoragePersistentMySQLMock.muUID ).toBeUndefined( );
		expect( muORMMock.objectInstances[ 'muORMTestStoragePersistentMySQL' ][ currentMuUID ] ).toBeUndefined( );
	});

    it( "load muORMTestStoragePersistentWithPath schema, defines object and init the storage type on the object", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestStoragePersistentWithPath' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestStoragePersistentWithPath' ] ).toBeDefined( );

        var muORMTestStoragePersistentWithPathMock = new muORMTestStoragePersistentWithPath();
	    expect( muORMTestStoragePersistentWithPathMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestStoragePersistentWithPathMock.muUID;

        expect( muORMTestStoragePersistentWithPathMock ).toBeDefined();
        expect( muORMTestStoragePersistentWithPathMock.muORMTestStorageTypePersistentProperty1 ).toEqual( "persistent property 1 string" );
        expect( muORMTestStoragePersistentWithPathMock.muORMTestStorageTypePersistentProperty2 ).toEqual( "persistent property 2 string" );
        expect( muORMTestStoragePersistentWithPathMock.muORMTestStorageTypePersistentProperty3 ).toEqual( "persistent property 3 string" );
        expect( muORMMock.objectInstances[ 'muORMTestStoragePersistentWithPath' ][ currentMuUID ] ).toEqual( muORMTestStoragePersistentWithPathMock );

        var muORMTestStoragePersistentWithPathMockPrototype = Object.getPrototypeOf( muORMTestStoragePersistentWithPathMock );
        expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.storageType ).toEqual( "persistent" );
        expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.driver.driverName ).toEqual( "memory" );
	    expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.driver.enginePath ).toEqual( mu.runinbrowser ? 'localStorage' : 'file' );
        expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.storagePathOrURI ).toEqual( "/tmp/testWithPath/" );
        expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.userLogin ).toBeUndefined( );
        expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.userPassword).toBeUndefined( );

	    muORMTestStoragePersistentWithPathMock.relInstance( );

	    expect( muORMTestStoragePersistentWithPathMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestStoragePersistentWithPath' ][ currentMuUID ] ).toBeUndefined( );

	    if( !mu.runinbrowser )
		    mu.fs.rmdirSync( "/tmp/testWithPath/" );
    });

    it( "load muORMTestRelationship 1 on 1 schema, defines object and init a relationship", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestRelationship11' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestRelationship11' ] ).toBeDefined( );

        var muORMTestRelationshipMock = new muORMTestRelationship11();
	    expect( muORMTestRelationshipMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestRelationshipMock.muUID;

	    expect( muORMTestRelationshipMock ).toBeDefined();
        expect( muORMTestRelationshipMock.muORMTestObjectProperty ).toEqual( "1 to 1 default string value" );
        expect( muORMMock.objectInstances[ 'muORMTestRelationship11' ][ currentMuUID ] ).toEqual( muORMTestRelationshipMock );
        expect( typeof muORMTestRelationshipMock.muORMTestRelationshipObject ).toEqual( 'object' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ] ).toBeDefined(  );
        expect( typeof muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ] ).toEqual( 'object' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].cardinality ).toEqual( 11 );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].destination ).toEqual( 'muORMTestNumeric' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].inverse ).toBeNull( );
        expect( muORMTestRelationshipMock.muORMTestRelationshipObject ).toEqual( {  "muORMTestNumeric1":    15,
                                                                                     "muORMTestNumeric2":    0,
                                                                                     "muORMTestNumeric3":    15} );

        var muORMTestRelationshipMockPrototype = Object.getPrototypeOf( muORMTestRelationshipMock );
        expect( muORMTestRelationshipMockPrototype.Storage.storageType ).toEqual( "volatile" );

	    muORMTestRelationshipMock.relInstance( );

	    expect( muORMTestRelationshipMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestRelationship11' ][ currentMuUID ] ).toBeUndefined( );
    });

    it( "load muORMTestRelationship 1 on N schema, defines object and init a relationship", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestRelationship1N' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestRelationship1N' ] ).toBeDefined( );

        var muORMTestRelationshipMock = new muORMTestRelationship1N();
	    expect( muORMTestRelationshipMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestRelationshipMock.muUID;

	    expect( muORMTestRelationshipMock ).toBeDefined();
        expect( muORMTestRelationshipMock.muORMTestObjectProperty ).toEqual( "1 to N default string value" );
        expect( muORMMock.objectInstances[ 'muORMTestRelationship1N' ][ currentMuUID ] ).toEqual( muORMTestRelationshipMock );
        expect( typeof muORMTestRelationshipMock.muORMTestRelationshipObject ).toEqual( 'object' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ] ).toBeDefined(  );
        expect( typeof muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ] ).toEqual( 'object' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].cardinality ).toEqual( 10 );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].destination ).toEqual( 'muORMTestNumeric' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].inverse ).toBeNull( );
        expect( Object.prototype.toString.apply( muORMTestRelationshipMock.muORMTestRelationshipObject ) ).toEqual( '[object Array]' );
        expect( muORMTestRelationshipMock.muORMTestRelationshipObject ).toEqual
            ( new Array(
                {
                    "muORMTestNumeric1":    15,
                     "muORMTestNumeric2":    0,
                     "muORMTestNumeric3":    15
                } )
            );

        var muORMTestRelationshipMockPrototype = Object.getPrototypeOf( muORMTestRelationshipMock );
        expect( muORMTestRelationshipMockPrototype.Storage.storageType ).toEqual( "volatile" );

	    muORMTestRelationshipMock.relInstance( );

	    expect( muORMTestRelationshipMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestRelationship1N' ][ currentMuUID ] ).toBeUndefined( );
    });

    it( "load muORMTestRelationship N on N schema, defines one default object and init a relationship", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestRelationshipNN' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestRelationshipNN' ] ).toBeDefined( );

        var muORMTestRelationshipMock = new muORMTestRelationshipNN();
	    expect( muORMTestRelationshipMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestRelationshipMock.muUID;

        expect( muORMTestRelationshipMock ).toBeDefined();
        expect( muORMTestRelationshipMock.muORMTestObjectProperty ).toEqual( "N to N default string value" );
        expect( muORMMock.objectInstances[ 'muORMTestRelationshipNN' ][ currentMuUID ] ).toEqual( muORMTestRelationshipMock );
        expect( typeof muORMTestRelationshipMock.muORMTestRelationshipObject ).toEqual( 'object' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ] ).toBeDefined(  );
        expect( typeof muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ] ).toEqual( 'object' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].cardinality ).toEqual( 0 );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].destination ).toEqual( 'muORMTestNNRelationShip' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].inverse ).toEqual( 'muORMTestNNInverse' );
        expect( Object.prototype.toString.apply( muORMTestRelationshipMock.muORMTestRelationshipObject ) ).toEqual( '[object Array]' );
        expect( muORMTestRelationshipMock.muORMTestRelationshipObject ).toEqual
            ( new Array(
                {
                    "muORMTestNNObjectInChild":     15,
                    "muORMTestNNInverse":           new Array( muORMTestRelationshipMock )
                } )
            );
        expect( muORMTestRelationshipMock.muORMTestRelationshipObject[ 0 ] ).toBeDefined( );
        var inverseRelation = muORMTestRelationshipMock.muORMTestRelationshipObject[ 0 ][ muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].inverse ];
        expect( Object.prototype.toString.apply( inverseRelation ) ).toEqual( '[object Array]' );

        var muORMTestRelationshipMockPrototype = Object.getPrototypeOf( muORMTestRelationshipMock );
        expect( muORMTestRelationshipMockPrototype.Storage.storageType ).toEqual( "volatile" );

	    muORMTestRelationshipMock.relInstance( );

	    expect( muORMTestRelationshipMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestRelationshipNN' ][ currentMuUID ] ).toBeUndefined( );
    });

    it( "load muORMTestRelationship N on N schema with 2 children, defines two default object and init all relationships", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestRelationshipNN2' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestRelationshipNN2' ] ).toBeDefined( );

        var muORMTestRelationshipMock = new muORMTestRelationshipNN2();
	    expect( muORMTestRelationshipMock.muUID ).toBeDefined( );
	    var currentMuUID = muORMTestRelationshipMock.muUID;

	    expect( muORMTestRelationshipMock ).toBeDefined();
        expect( muORMTestRelationshipMock.muORMTestObjectProperty ).toEqual( "N to N default string value" );
        expect( muORMMock.objectInstances[ 'muORMTestRelationshipNN2' ][ currentMuUID ] ).toEqual( muORMTestRelationshipMock );
        expect( typeof muORMTestRelationshipMock.muORMTestRelationshipObject ).toEqual( 'object' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ] ).toBeDefined(  );
        expect( typeof muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ] ).toEqual( 'object' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].cardinality ).toEqual( 0 );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].destination ).toEqual( 'muORMTestNNRelationShip' );
        expect( muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].inverse ).toEqual( 'muORMTestNNInverse' );

        expect( Object.prototype.toString.apply( muORMTestRelationshipMock.muORMTestRelationshipObject ) ).toEqual( '[object Array]' );
        expect( muORMTestRelationshipMock.muORMTestRelationshipObject ).toEqual
            ( new Array
                  (
                    {
                        "muORMTestNNObjectInChild":     0,
                        "muORMTestNNInverse":           new Array( muORMTestRelationshipMock )
                    },
                    {
                        "muORMTestNNObjectInChild":     1,
                        "muORMTestNNInverse":           new Array( muORMTestRelationshipMock )
                    }
                  )
            );
        expect( muORMTestRelationshipMock.muORMTestRelationshipObject[ 0 ] ).toBeDefined( );
        var inverseRelation = muORMTestRelationshipMock.muORMTestRelationshipObject[ 0 ][ muORMTestRelationshipMock.relationship[ "muORMTestRelationshipObject" ].inverse ];
        expect( Object.prototype.toString.apply( inverseRelation ) ).toEqual( '[object Array]' );

        var muORMTestRelationshipMockPrototype = Object.getPrototypeOf( muORMTestRelationshipMock );
        expect( muORMTestRelationshipMockPrototype.Storage.storageType ).toEqual( "volatile" );

	    muORMTestRelationshipMock.relInstance( );

	    expect( muORMTestRelationshipMock.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestRelationshipNN2' ][ currentMuUID ] ).toBeUndefined( );
    });

    it( "increment muUID correctly and put them in the Schema objectInstances hash table", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestNumeric' ) ).toBeTruthy( );
        expect( muORMMock.objectList[ 'muORMTestNumeric' ] ).toBeDefined( );

        //first one
        var muORMTestNumericMock1 = new muORMTestNumeric();
	    expect( muORMTestNumericMock1.muUID ).toBeDefined( );
	    var currentMuUID1 = muORMTestNumericMock1.muUID;
        expect( muORMTestNumericMock1 ).toBeDefined();
        expect( muORMTestNumericMock1.muORMTestNumeric1 ).toEqual( 15 );
        expect( muORMTestNumericMock1.muORMTestNumeric2 ).toBeDefined(  );
        expect( muORMTestNumericMock1.muORMTestNumeric3 ).toEqual( 15 );

        //second
        var muORMTestNumericMock2 = new muORMTestNumeric();
	    expect( muORMTestNumericMock2.muUID ).toBeDefined( );
	    var currentMuUID2 = muORMTestNumericMock2.muUID;
        expect( muORMTestNumericMock2 ).toBeDefined();
        expect( muORMTestNumericMock2.muORMTestNumeric1 ).toEqual( 15 );
        expect( muORMTestNumericMock2.muORMTestNumeric2 ).toBeDefined(  );
        expect( muORMTestNumericMock2.muORMTestNumeric3 ).toEqual( 15 );

	    expect( Object.keys( muORMMock.objectInstances[ 'muORMTestNumeric' ] ).length ).toEqual( 2 );
	    expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ currentMuUID1 ] ).toEqual( muORMTestNumericMock1 );
	    expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ currentMuUID2 ] ).toEqual( muORMTestNumericMock2 );

	    muORMTestNumericMock1.relInstance( );
	    muORMTestNumericMock2.relInstance( );

	    expect( muORMTestNumericMock1.muUID ).toBeUndefined( );
	    expect( muORMTestNumericMock2.muUID ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ currentMuUID1 ] ).toBeUndefined( );
	    expect( muORMMock.objectInstances[ 'muORMTestNumeric' ][ currentMuUID2 ] ).toBeUndefined( );
    });

	afterEach( function( ) { muORMMock.unloadAllDBSchema( ); } );

});