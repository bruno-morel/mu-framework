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
        expect( muORMTestNumericMockPrototype.storageType[ "muORMTestNumeric1" ] ).toEqual( "volatile" );
        expect( muORMTestNumericMockPrototype.storageType[ "muORMTestNumeric2" ] ).toEqual( "volatile" );
        expect( muORMTestNumericMockPrototype.storageType[ "muORMTestNumeric3" ] ).toEqual( "volatile" );
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
        expect( muORMTestStringMockPrototype.storageType[ "muORMTestString1" ] ).toEqual( "volatile" );
        expect( muORMTestStringMockPrototype.storageType[ "muORMTestString2" ] ).toEqual( "volatile" );
        expect( muORMTestStringMockPrototype.storageType[ "muORMTestString3" ] ).toEqual( "volatile" );
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
        expect( muORMTestDateMockPrototype.storageType[ "muORMTestDate1" ] ).toEqual( "volatile" );
        expect( muORMTestDateMockPrototype.storageType[ "muORMTestDate2" ] ).toEqual( "volatile" );
        expect( muORMTestDateMockPrototype.storageType[ "muORMTestDate3" ] ).toEqual( "volatile" );
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
        expect( muORMTestMixMockPrototype.storageType[ "muORMTestMixString" ] ).toEqual( "volatile" );
        expect( muORMTestMixMockPrototype.storageType[ "muORMTestMixDate" ] ).toEqual( "volatile" );
        expect( muORMTestMixMockPrototype.storageType[ "muORMTestMixNumeric" ] ).toEqual( "volatile" );
    });

    it( "load muORMTestStorageType schema, defines object and init the storage type on the object", function()
    {
        muORMMock.persistentStorage.storagePath = '/tmp/';

        expect( muORMMock.persistentStorage.storagePath ).toEqual( '/tmp/' );
        expect( muORMMock.sessionStorage.storagePath ).toEqual( '/tmp/' );

        expect( muORMMock.loadDBSchema( 'muORMTestStorageType' ) ).toBeTruthy();
        expect( muORMMock.objectList[ 'muORMTestStorageType' ] ).toBeDefined( );

        var muORMTestStorageTypeMock = new muORMTestStorageType();
        expect( muORMTestStorageTypeMock ).toBeDefined();
        expect( muORMTestStorageTypeMock.muORMTestStorageTypeVolatile ).toEqual( "volatile string" );
        expect( muORMTestStorageTypeMock.muORMTestStorageTypeSession ).toEqual( "session string" );
        expect( muORMTestStorageTypeMock.muORMTestStorageTypePersistent ).toEqual( "persistent string" );

        expect( muORMTestStorageTypeMock.muUID ).toEqual( 1 );
        expect( muORMMock.objectInstances[ 'muORMTestStorageType' ] ).toEqual( { 1 : muORMTestStorageTypeMock } );

        var muORMTestStorageTypeMockPrototype = Object.getPrototypeOf( muORMTestStorageTypeMock );
        expect( muORMTestStorageTypeMockPrototype.storageType[ "muORMTestStorageTypeVolatile" ] ).toEqual( "volatile" );
        expect( muORMTestStorageTypeMockPrototype.storageType[ "muORMTestStorageTypeSession" ] ).toEqual( "session" );
        expect( muORMTestStorageTypeMockPrototype.storageType[ "muORMTestStorageTypePersistent" ] ).toEqual( "persistent" );
    });

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
        expect( muORMTestRelationshipMockPrototype.storageType[ "muORMTestObjectProperty" ] ).toEqual( "volatile" );
        expect( muORMTestRelationshipMockPrototype.storageType[ "muORMTestRelationshipObject" ] ).toEqual( "volatile" );
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
        expect( muORMTestRelationshipMockPrototype.storageType[ "muORMTestObjectProperty" ] ).toEqual( "volatile" );
        expect( muORMTestRelationshipMockPrototype.storageType[ "muORMTestRelationshipObject" ] ).toEqual( "volatile" );
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
        expect( muORMTestRelationshipMockPrototype.storageType[ "muORMTestObjectProperty" ] ).toEqual( "volatile" );
        expect( muORMTestRelationshipMockPrototype.storageType[ "muORMTestRelationshipObject" ] ).toEqual( "volatile" );
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
        expect( muORMTestRelationshipMockPrototype.storageType[ "muORMTestObjectProperty" ] ).toEqual( "volatile" );
        expect( muORMTestRelationshipMockPrototype.storageType[ "muORMTestRelationshipObject" ] ).toEqual( "volatile" );
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
        expect( muORMTestNumericMock1.muUID ).toEqual( 1 );

        //second
        var muORMTestNumericMock2 = new muORMTestNumeric();
        expect( muORMTestNumericMock2 ).toBeDefined();
        expect( muORMTestNumericMock2.muORMTestNumeric1 ).toEqual( 15 );
        expect( muORMTestNumericMock2.muORMTestNumeric2 ).toBeDefined(  );
        expect( muORMTestNumericMock2.muORMTestNumeric3 ).toEqual( 15 );
        expect( muORMTestNumericMock2.muUID ).toEqual( 2 );

        expect( muORMMock.objectInstances[ 'muORMTestNumeric' ] ).toEqual( { 1 : muORMTestNumericMock1, 2 : muORMTestNumericMock2 } );
    });

});