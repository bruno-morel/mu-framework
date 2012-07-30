/**
 * Created by bruno
 * 12-03-20 1:25 PM
 */


mu.require( 'muORM' );


describe( "muORM", function()
{
    //mu.activateDebug( );

    var muORMMock = new mu.ORM.Schema( './testschema/' );


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

    it( "load muORMTestMix schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();

        var muORMTestMixMock = new muORMTestMix();
        expect( muORMTestMixMock ).toBeDefined();
        expect( muORMTestMixMock.muORMTestMixString ).toEqual( "name value is a string with this as default" );
        expect( muORMTestMixMock.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
        expect( muORMTestMixMock.muORMTestMixNumeric ).toEqual( 15 );

        var muORMTestMixMockPrototype = Object.getPrototypeOf( muORMTestMixMock );
        expect( muORMTestMixMockPrototype.storageType[ "muORMTestMixString" ] ).toEqual( "volatile" );
        expect( muORMTestMixMockPrototype.storageType[ "muORMTestMixDate" ] ).toEqual( "volatile" );
        expect( muORMTestMixMockPrototype.storageType[ "muORMTestMixNumeric" ] ).toEqual( "volatile" );
    });

    it( "load muORMTestString schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestString' ) ).toBeTruthy();

        var muORMTestStringMock = new muORMTestString();
        expect( muORMTestStringMock ).toBeDefined();
        expect( muORMTestStringMock.muORMTestString1 ).toEqual( "name value is a string with this as default" );
        expect( muORMTestStringMock.muORMTestString2 ).toBeDefined(  );
        expect( muORMTestStringMock.muORMTestString3 ).toEqual( "name value is a string with this as default" );

        var muORMTestStringMockPrototype = Object.getPrototypeOf( muORMTestStringMock );
        expect( muORMTestStringMockPrototype.storageType[ "muORMTestString1" ] ).toEqual( "volatile" );
        expect( muORMTestStringMockPrototype.storageType[ "muORMTestString2" ] ).toEqual( "volatile" );
        expect( muORMTestStringMockPrototype.storageType[ "muORMTestString3" ] ).toEqual( "volatile" );
    });

    it( "load muORMTestDate schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestDate' ) ).toBeTruthy();

        var muORMTestDateMock = new muORMTestDate();
        expect( muORMTestDateMock ).toBeDefined();
        expect( muORMTestDateMock.muORMTestDate1 ).toEqual( new Date( "06/20/2012" ) );
        expect( muORMTestDateMock.muORMTestDate2 ).toBeDefined(  );

        var muORMTestDateMockPrototype = Object.getPrototypeOf( muORMTestDateMock );
        expect( muORMTestDateMockPrototype.storageType[ "muORMTestDate1" ] ).toEqual( "volatile" );
        expect( muORMTestDateMockPrototype.storageType[ "muORMTestDate2" ] ).toEqual( "volatile" );
        expect( muORMTestDateMockPrototype.storageType[ "muORMTestDate3" ] ).toEqual( "volatile" );
        //can't test 'now' without having a locking problem :)expect( ormTestDateMock.ormTestDate3 ).toEqual( new Date(  ) );
    });

    it( "load muORMTestNumeric schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestNumeric' ) ).toBeTruthy();

        var muORMTestNumericMock = new muORMTestNumeric();
        expect( muORMTestNumericMock ).toBeDefined();
        expect( muORMTestNumericMock.muORMTestNumeric1 ).toEqual( 15 );
        expect( muORMTestNumericMock.muORMTestNumeric2 ).toBeDefined(  );
        expect( muORMTestNumericMock.muORMTestNumeric3 ).toEqual( 15 );

        var muORMTestNumericMockPrototype = Object.getPrototypeOf( muORMTestNumericMock );
        expect( muORMTestNumericMockPrototype.storageType[ "muORMTestNumeric1" ] ).toEqual( "volatile" );
        expect( muORMTestNumericMockPrototype.storageType[ "muORMTestNumeric2" ] ).toEqual( "volatile" );
        expect( muORMTestNumericMockPrototype.storageType[ "muORMTestNumeric3" ] ).toEqual( "volatile" );
    });

    it( "load muORMTestStorageType schema, defines object and init the storage type on the object", function()
    {
        muORMMock.persistentStorage.storagePath = '/tmp/';

        expect( muORMMock.persistentStorage.storagePath ).toEqual( '/tmp/' );
        expect( muORMMock.sessionStorage.storagePath ).toEqual( '/tmp/' );

        expect( muORMMock.loadDBSchema( 'muORMTestStorageType' ) ).toBeTruthy();
        var muORMTestStorageTypeMock = new muORMTestStorageType();
        expect( muORMTestStorageTypeMock ).toBeDefined();
        expect( muORMTestStorageTypeMock.muORMTestStorageTypeVolatile ).toEqual( "volatile string" );
        expect( muORMTestStorageTypeMock.muORMTestStorageTypeSession ).toEqual( "session string" );
        expect( muORMTestStorageTypeMock.muORMTestStorageTypePersistent ).toEqual( "persistent string" );

        var muORMTestStorageTypeMockPrototype = Object.getPrototypeOf( muORMTestStorageTypeMock );
        expect( muORMTestStorageTypeMockPrototype.storageType[ "muORMTestStorageTypeVolatile" ] ).toEqual( "volatile" );
        expect( muORMTestStorageTypeMockPrototype.storageType[ "muORMTestStorageTypeSession" ] ).toEqual( "session" );
        expect( muORMTestStorageTypeMockPrototype.storageType[ "muORMTestStorageTypePersistent" ] ).toEqual( "persistent" );
    });

    it( "is not a singleton", function()
    {
        var muORMMock2 = new mu.ORM.Schema( 'testinvalidpath' );

        expect( muORMMock.pathSchemas ).toEqual( './testschema/' );

        expect( muORMMock2.pathSchemas ).toEqual( 'testinvalidpath' );
    });
});