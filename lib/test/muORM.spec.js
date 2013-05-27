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
    });

    it( "load muORMTestNumeric schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestNumeric' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestNumeric' ] ).toBeDefined( );

        var muORMTestNumericMock = new muORMTestNumeric();
        expect( muORMTestNumericMock ).toBeDefined();
        expect( muORMTestNumericMock.muORMTestNumeric1 ).toEqual( 15 );
        expect( muORMTestNumericMock.muORMTestNumeric2 ).toBeDefined(  );
        expect( muORMTestNumericMock.muORMTestNumeric3 ).toEqual( 15 );

        expect( muORMTestNumericMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestNumeric' ] ).toEqual( { 1 : muORMTestNumericMock } );

        var muORMTestNumericMockPrototype = Object.getPrototypeOf( muORMTestNumericMock );
        expect( muORMTestNumericMockPrototype.Storage.storageType ).toEqual( "volatile" );
    });

    it( "load muORMTestString schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestString' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestString' ] ).toBeDefined( );

        var muORMTestStringMock = new muORMTestString();
        expect( muORMTestStringMock ).toBeDefined();
        expect( muORMTestStringMock.muORMTestString1 ).toEqual( "name value is a string with this as default" );
        expect( muORMTestStringMock.muORMTestString2 ).toBeDefined(  );
        expect( muORMTestStringMock.muORMTestString3 ).toEqual( "name value is a string with this as default" );

        expect( muORMTestStringMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestString' ] ).toEqual( { 1 : muORMTestStringMock } );

        var muORMTestStringMockPrototype = Object.getPrototypeOf( muORMTestStringMock );
        expect( muORMTestStringMockPrototype.Storage.storageType ).toEqual( "volatile" );
    });

    it( "load muORMTestDate schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestDate' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestDate' ] ).toBeDefined( );

        var muORMTestDateMock = new muORMTestDate();
        expect( muORMTestDateMock ).toBeDefined();
        expect( muORMTestDateMock.muORMTestDate1 ).toEqual( new Date( "06/20/2012" ) );
        expect( muORMTestDateMock.muORMTestDate2 ).toBeDefined(  );

        expect( muORMTestDateMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestDate' ] ).toEqual( { 1 : muORMTestDateMock } );

        var muORMTestDateMockPrototype = Object.getPrototypeOf( muORMTestDateMock );
        expect( muORMTestDateMockPrototype.Storage.storageType ).toEqual( "volatile" );
        //can't test 'now' without having a locking problem :)expect( ormTestDateMock.ormTestDate3 ).toEqual( new Date(  ) );
    });

    it( "load muORMTestMix schema, defines object, set default value/type and set the default storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestMix' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestMix' ] ).toBeDefined( );

        var muORMTestMixMock = new muORMTestMix();
        expect( muORMTestMixMock ).toBeDefined();
        expect( muORMTestMixMock.muORMTestMixString ).toEqual( "name value is a string with this as default" );
        expect( muORMTestMixMock.muORMTestMixDate ).toEqual( new Date( "03/12/2012" ) );
        expect( muORMTestMixMock.muORMTestMixNumeric ).toEqual( 15 );

        expect( muORMTestMixMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestMix' ] ).toEqual( { 1 : muORMTestMixMock } );

        var muORMTestMixMockPrototype = Object.getPrototypeOf( muORMTestMixMock );
        expect( muORMTestMixMockPrototype.Storage.storageType ).toEqual( "volatile" );
    });

    it( "load muORMTestStorageVolatile schema, defines object, set default value/type and set the volatile storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestStorageVolatile' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestStorageVolatile' ] ).toBeDefined( );

        var muORMTestStorageVolatileMock = new muORMTestStorageVolatile();
        expect( muORMTestStorageVolatileMock ).toBeDefined();
        expect( muORMTestStorageVolatileMock.muORMTestStorageTypeVolatileProperty1 ).toEqual( "volatile property 1 string" );
        expect( muORMTestStorageVolatileMock.muORMTestStorageTypeVolatileProperty2 ).toEqual( "volatile property 2 string" );
        expect( muORMTestStorageVolatileMock.muORMTestStorageTypeVolatileProperty3 ).toEqual( "volatile property 3 string" );

        expect( muORMTestStorageVolatileMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestStorageVolatile' ] ).toEqual( { 1 : muORMTestStorageVolatileMock } );

        var muORMTestStorageVolatileMockPrototype = Object.getPrototypeOf( muORMTestStorageVolatileMock );
        expect( muORMTestStorageVolatileMockPrototype.Storage.storageType ).toEqual( "volatile" );
    });

    it( "load muORMTestStorageSession schema, defines object, set default value/type and set the session storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestStorageSession' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestStorageSession' ] ).toBeDefined( );

        var muORMTestStorageSessionMock = new muORMTestStorageSession();
        expect( muORMTestStorageSessionMock ).toBeDefined();
        expect( muORMTestStorageSessionMock.muORMTestStorageTypeSessionProperty1 ).toEqual( "session property 1 string" );
        expect( muORMTestStorageSessionMock.muORMTestStorageTypeSessionProperty2 ).toEqual( "session property 2 string" );
        expect( muORMTestStorageSessionMock.muORMTestStorageTypeSessionProperty3 ).toEqual( "session property 3 string" );

        expect( muORMTestStorageSessionMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestStorageSession' ] ).toEqual( { 1 : muORMTestStorageSessionMock } );

        var muORMTestStorageSessionMockPrototype = Object.getPrototypeOf( muORMTestStorageSessionMock );
        expect( muORMTestStorageSessionMockPrototype.Storage.storageType ).toEqual( "session" );


        if( typeof window === "undefined" )
        {
            mu.fs.unlinkSync( '/tmp/muORMTestStorageSession:1:muORMTestStorageTypeSessionProperty1' );
            mu.fs.unlinkSync( '/tmp/muORMTestStorageSession:1:muORMTestStorageTypeSessionProperty2' );
            mu.fs.unlinkSync( '/tmp/muORMTestStorageSession:1:muORMTestStorageTypeSessionProperty3' );
        }
    });

    it( "load muORMTestStoragePersistent schema, defines object, set default value/type and set the persistent storage type", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestStoragePersistent' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestStoragePersistent' ] ).toBeDefined( );

        var muORMTestStoragePersistentMock = new muORMTestStoragePersistent();
        expect( muORMTestStoragePersistentMock ).toBeDefined();
        expect( muORMTestStoragePersistentMock.muORMTestStorageTypePersistentProperty1 ).toEqual( "persistent property 1 string" );
        expect( muORMTestStoragePersistentMock.muORMTestStorageTypePersistentProperty2 ).toEqual( "persistent property 2 string" );
        expect( muORMTestStoragePersistentMock.muORMTestStorageTypePersistentProperty3 ).toEqual( "persistent property 3 string" );

        expect( muORMTestStoragePersistentMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestStoragePersistent' ] ).toEqual( { 1 : muORMTestStoragePersistentMock } );

        var muORMTestStoragePersistentMockPrototype = Object.getPrototypeOf( muORMTestStoragePersistentMock );
        expect( muORMTestStoragePersistentMockPrototype.Storage.storageType ).toEqual( "persistent" );


        if( typeof window === "undefined" )
        {
            mu.fs.unlinkSync( './muORMTestStoragePersistent:1:muORMTestStorageTypePersistentProperty1' );
            mu.fs.unlinkSync( './muORMTestStoragePersistent:1:muORMTestStorageTypePersistentProperty2' );
            mu.fs.unlinkSync( './muORMTestStoragePersistent:1:muORMTestStorageTypePersistentProperty3' );
        }
    });

/*
    it( "load muORMTestStoragePersistentWithPath schema, defines object and init the storage type on the object", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestStoragePersistentWithPath' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestStoragePersistentWithPath' ] ).toBeDefined( );

        var muORMTestStoragePersistentWithPathMock = new muORMTestStoragePersistentWithPath();
        expect( muORMTestStoragePersistentWithPathMock ).toBeDefined();
        expect( muORMTestStoragePersistentWithPathMock.muORMTestStorageTypePersistentProperty1 ).toEqual( "persistent property 1 string" );
        expect( muORMTestStoragePersistentWithPathMock.muORMTestStorageTypePersistentProperty2 ).toEqual( "persistent property 2 string" );
        expect( muORMTestStoragePersistentWithPathMock.muORMTestStorageTypePersistentProperty3 ).toEqual( "persistent property 3 string" );

        expect( muORMTestStoragePersistentWithPathMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestStorageType' ] ).toEqual( { 1 : muORMTestStoragePersistentWithPathMock } );

        var muORMTestStoragePersistentWithPathMockPrototype = Object.getPrototypeOf( muORMTestStoragePersistentWithPathMock );
        expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.storageType ).toEqual( "persistent" );
        expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.driverName).toEqual( "test" );
        expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.storagePathOrURI ).toEqual( "/tmp/testWithPath/" );
        expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.userLogin ).toEqual( "testLogin" );
        expect( muORMTestStoragePersistentWithPathMockPrototype.Storage.userPassword).toEqual( "testPassword" );

    });
*/
    it( "load muORMTestRelationship 1 on 1 schema, defines object and init a relationship", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestRelationship11' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestRelationship11' ] ).toBeDefined( );

        var muORMTestRelationshipMock = new muORMTestRelationship11();
        expect( muORMTestRelationshipMock ).toBeDefined();
        expect( muORMTestRelationshipMock.muORMTestObjectProperty ).toEqual( "1 to 1 default string value" );

        expect( muORMTestRelationshipMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestRelationship11' ] ).toEqual( { 1 : muORMTestRelationshipMock } );

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
    });

    it( "load muORMTestRelationship 1 on N schema, defines object and init a relationship", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestRelationship1N' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestRelationship1N' ] ).toBeDefined( );

        var muORMTestRelationshipMock = new muORMTestRelationship1N();
        expect( muORMTestRelationshipMock ).toBeDefined();
        expect( muORMTestRelationshipMock.muORMTestObjectProperty ).toEqual( "1 to N default string value" );

        expect( muORMTestRelationshipMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestRelationship1N' ] ).toEqual( { 1 : muORMTestRelationshipMock } );

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
    });

    it( "load muORMTestRelationship N on N schema, defines one default object and init a relationship", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestRelationshipNN' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestRelationshipNN' ] ).toBeDefined( );

        var muORMTestRelationshipMock = new muORMTestRelationshipNN();
        expect( muORMTestRelationshipMock ).toBeDefined();
        expect( muORMTestRelationshipMock.muORMTestObjectProperty ).toEqual( "N to N default string value" );

        expect( muORMTestRelationshipMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestRelationshipNN' ] ).toEqual( { 1 : muORMTestRelationshipMock } );

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
    });

    it( "load muORMTestRelationship N on N schema with 2 children, defines two default object and init all relationships", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestRelationshipNN2' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestRelationshipNN2' ] ).toBeDefined( );

        var muORMTestRelationshipMock = new muORMTestRelationshipNN2();
        expect( muORMTestRelationshipMock ).toBeDefined();
        expect( muORMTestRelationshipMock.muORMTestObjectProperty ).toEqual( "N to N default string value" );

        expect( muORMTestRelationshipMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestRelationshipNN2' ] ).toEqual( { 1 : muORMTestRelationshipMock } );

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
    });

    it( "increment muUID correctly and put them in the Schema objectInstances hash table", function()
    {
        expect( muORMMock.loadDBSchema( 'muORMTestNumeric' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestNumeric' ] ).toBeDefined( );

        //first one
        var muORMTestNumericMock1 = new muORMTestNumeric();
        expect( muORMTestNumericMock1 ).toBeDefined();
        expect( muORMTestNumericMock1.muORMTestNumeric1 ).toEqual( 15 );
        expect( muORMTestNumericMock1.muORMTestNumeric2 ).toBeDefined(  );
        expect( muORMTestNumericMock1.muORMTestNumeric3 ).toEqual( 15 );
        expect( muORMTestNumericMock1.muUID ).toEqual( 2 );

        //second
        var muORMTestNumericMock2 = new muORMTestNumeric();
        expect( muORMTestNumericMock2 ).toBeDefined();
        expect( muORMTestNumericMock2.muORMTestNumeric1 ).toEqual( 15 );
        expect( muORMTestNumericMock2.muORMTestNumeric2 ).toBeDefined(  );
        expect( muORMTestNumericMock2.muORMTestNumeric3 ).toEqual( 15 );
        expect( muORMTestNumericMock2.muUID ).toEqual( 3 );

        expect( muORMMock.objectInstances[ 'muORMTestNumeric' ] ).toEqual( { 1 : { muORMTestNumeric1 : 15, muUID : 1, muORMTestNumeric2 : 0, muORMTestNumeric3 : 15 }, 2 : muORMTestNumericMock1, 3 : muORMTestNumericMock2 } );
    });

});