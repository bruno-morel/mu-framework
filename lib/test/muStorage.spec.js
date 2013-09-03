/**
 * User: bruno
 * Date: 2012-11-26
 * Time: 7:44 PM
 *
 * muStorage BDD (muJasmine) specification file
 */
mu.require( 'muStorage' );


describe( "muStorage", function()
{
    //mu.activateDebug( );
	function entityExistInStorage( path, fileName )
	{
		if( mu.runinbrowser )
			return ( path == '/tmp/' ?
			            window.sessionStorage[ fileName ] :
						window.localStorage[ fileName ] );

		try
		{
			mu.fs.statSync( path + fileName );
			return true;
		}
		catch( error ){ return false; }
	}

    it( "is defined and has default properties and set to default storage values", function()
    {
        var muDefaultStorageMock = new mu.Storage.Driver( );

        expect( muDefaultStorageMock ).toBeDefined( );
        expect( muDefaultStorageMock.storageType ).toEqual( 'volatile' );
        expect( muDefaultStorageMock.storagePathOrURI ).toEqual( '~/' );
        expect( muDefaultStorageMock.userLogin ).toBeUndefined( );
        expect( muDefaultStorageMock.userPassword ).toBeUndefined( );
        expect( muDefaultStorageMock.params ).toBeUndefined( );
        expect( muDefaultStorageMock.driver.enginePath ).toEqual( '' );
        expect( muDefaultStorageMock.driver.driverName ).toEqual( 'memory' );
        expect( muDefaultStorageMock.driver.lastMuUID ).toBeDefined( );
        expect( muDefaultStorageMock.driver.ownInstance ).toBeDefined( );
        expect( muDefaultStorageMock.driver.relInstance ).toBeDefined( );
	    expect( muDefaultStorageMock.driver.relConnection ).toBeDefined( );
        expect( muDefaultStorageMock.driver.getItem ).toBeDefined( );
        expect( muDefaultStorageMock.driver.setItem ).toBeDefined( );
    });

	it( "owns an object inside its constructor and respect any muUID already set", function()
	{
		var muDefaultStorageMock = new mu.Storage.Driver( );

		function mockPrototypeWithMuUID( constructParameterTest )
		{
			this.mockProperty = constructParameterTest;
			//muUID should always be unique so it's a very bad idea to put a static in the constructor
			// as we know that we will use this type only once, it's ok
			this.muUID = 1;

			muDefaultStorageMock.ownInstance( this );
		}

		var mockObject = new mockPrototypeWithMuUID( 'mockPropertyValue1' );
		expect( mockObject.mockProperty ).toEqual( 'mockPropertyValue1' );
		expect( mockObject.muUID ).toEqual( 1 );

		mockObject.relInstance( );

		expect( mockObject.muUID ).toBeUndefined( );
	});

    it( "owns an object inside its constructor and create the necessary UUID (anonymous function AND classic function as constructor)", function()
    {
        var muDefaultStorageMock = new mu.Storage.Driver( );

        var mockPrototypeAnonymous = function ( constructParameterTest )
            {
                this.mockProperty = constructParameterTest;
                muDefaultStorageMock.ownInstance( this, 'mockPrototypeAnonymous' );
            };
        mockPrototypeAnonymous.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

        var mockObjectFromAnonymous = new mockPrototypeAnonymous( 'mockPropertyValue' );
        expect( mockObjectFromAnonymous.mockProperty ).toEqual( 'mockPropertyValue' );
        expect( mockObjectFromAnonymous.mockFunction ).toBeDefined( );
        expect( mockObjectFromAnonymous.muUID ).toBeDefined( );

        var mockObjectFromAnonymous2 = new mockPrototypeAnonymous( 'mockPropertyValue2' );
        expect( mockObjectFromAnonymous2.mockProperty ).toEqual( 'mockPropertyValue2' );
        expect( mockObjectFromAnonymous2.mockFunction ).toBeDefined( );
        expect( mockObjectFromAnonymous2.muUID ).toBeDefined( );

	    mockObjectFromAnonymous.relInstance( );
	    mockObjectFromAnonymous2.relInstance( );

	    expect( mockObjectFromAnonymous.muUID ).toBeUndefined( );
	    expect( mockObjectFromAnonymous2.muUID ).toBeUndefined( );

        function mockPrototype( constructParameterTest )
        {
            this.mockProperty = constructParameterTest;
            muDefaultStorageMock.ownInstance( this );
        }
        mockPrototype.prototype.mockFunction = function( mockParameter ){ return mockParameter; };

        var mockObject = new mockPrototype( 'mockPropertyValue3' );
        expect( mockObject.mockProperty ).toEqual( 'mockPropertyValue3' );
        expect( mockObject.mockFunction ).toBeDefined( );
        expect( mockObject.muUID ).toBeDefined( );

        var mockObject2 = new mockPrototype( 'mockPropertyValue4' );
        expect( mockObject2.mockProperty ).toEqual( 'mockPropertyValue4' );
        expect( mockObject2.mockFunction ).toBeDefined( );
        expect( mockObject2.muUID ).toBeDefined( );

	    mockObject.relInstance( );
	    mockObject2.relInstance( );

	    expect( mockObject.muUID ).toBeUndefined( );
	    expect( mockObject2.muUID ).toBeUndefined( );
    });

    it( "owns an object outside its constructor and create all the necessary UUID (anonymous function AND classic function as constructor)", function()
    {
        var muDefaultStorageMock = new mu.Storage.Driver( );

        var mockPrototypeAnonymous = function ( constructParameterTest )
        {
            this.mockProperty = constructParameterTest;
        };
        mockPrototypeAnonymous.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

        var mockObjectFromAnonymous = new mockPrototypeAnonymous( 'mockPropertyValue' );

        muDefaultStorageMock.ownInstance( mockObjectFromAnonymous );

        expect( mockObjectFromAnonymous.mockProperty ).toEqual( 'mockPropertyValue' );
        expect( mockObjectFromAnonymous.mockFunction ).toBeDefined( );
        expect( mockObjectFromAnonymous.muUID ).toBeDefined( );

        var mockObjectFromAnonymous2 = new mockPrototypeAnonymous( 'mockPropertyValue2' );

        muDefaultStorageMock.ownInstance( mockObjectFromAnonymous2 );

        expect( mockObjectFromAnonymous2.mockProperty ).toEqual( 'mockPropertyValue2' );
        expect( mockObjectFromAnonymous2.mockFunction ).toBeDefined( );
        expect( mockObjectFromAnonymous2.muUID ).toBeDefined( );

	    mockObjectFromAnonymous.relInstance( );
	    mockObjectFromAnonymous2.relInstance( );

	    expect( mockObjectFromAnonymous.muUID ).toBeUndefined( );
	    expect( mockObjectFromAnonymous2.muUID ).toBeUndefined( );

        function mockPrototype( constructParameterTest )
        {
            this.mockProperty = constructParameterTest;
        }
        mockPrototype.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

        var mockObject = new mockPrototype( 'mockPropertyValue3' );

        muDefaultStorageMock.ownInstance( mockObject );

        expect( mockObject.mockProperty ).toEqual( 'mockPropertyValue3' );
        expect( mockObject.mockFunction ).toBeDefined( );
        expect( mockObject.muUID ).toBeDefined( );

        var mockObject2 = new mockPrototype( 'mockPropertyValue4' );

        muDefaultStorageMock.ownInstance( mockObject2 );

        expect( mockObject2.mockProperty ).toEqual( 'mockPropertyValue4' );
        expect( mockObject2.mockFunction ).toBeDefined( );
        expect( mockObject2.muUID ).toBeDefined( );

		mockObject.relInstance( );
	    mockObject2.relInstance( );

	    expect( mockObject.muUID ).toBeUndefined( );
	    expect( mockObject2.muUID ).toBeUndefined( );
    });

    it( "has a working default persistent storage engine", function()
    {
        var muPersistentStorageMock = new mu.Storage.Driver( 'persistent' );

        expect( muPersistentStorageMock.storageType ).toEqual( 'persistent' );
        expect( muPersistentStorageMock.storagePathOrURI ).toEqual( typeof window !== "undefined" ? '' : './' );
        expect( muPersistentStorageMock.userLogin ).toBeUndefined( );
        expect( muPersistentStorageMock.userPassword ).toBeUndefined( );
        expect( muPersistentStorageMock.params ).toBeUndefined( );
        expect( muPersistentStorageMock.driver.enginePath ).toEqual( typeof window !== "undefined"? 'localStorage' : 'file' );
        expect( muPersistentStorageMock.driver.driverName ).toEqual( 'memory' );
        expect( muPersistentStorageMock.driver.lastMuUID ).toBeDefined( );
        expect( muPersistentStorageMock.driver.ownInstance ).toBeDefined( );
        expect( muPersistentStorageMock.driver.relInstance ).toBeDefined( );
        expect( muPersistentStorageMock.driver.getItem ).toBeDefined( );
        expect( muPersistentStorageMock.driver.setItem ).toBeDefined( );
    });

    it( "has a working persistent default storage (owning the object from the constructor)", function()
    {
        var muPersistentStorageMock = new mu.Storage.Driver( 'persistent' );

        function mockPrototypePersistent( constructParameterTest )
        {
            this.mockProperty = constructParameterTest;
            muPersistentStorageMock.ownInstance( this, 'mockPrototypePersistent' );
        }
        mockPrototypePersistent.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

        var mockObject = new mockPrototypePersistent( 'mockPropertyValue3' );
        expect( mockObject.mockProperty ).toEqual( 'mockPropertyValue3' );
        expect( mockObject.mockFunction ).toBeDefined( );
        expect( mockObject.muUID ).toBeDefined( );

        var mockObject2 = new mockPrototypePersistent( 'mockPropertyValue4' );
        expect( mockObject2.mockProperty ).toEqual( 'mockPropertyValue4' );
        expect( mockObject2.mockFunction ).toBeDefined( );
        expect( mockObject2.muUID ).toBeDefined( );

	    expect( entityExistInStorage( './', 'mockPrototypePersistent:' + mockObject.muUID + ':mockProperty' ) ).toBeTruthy( );
		expect( entityExistInStorage( './', 'mockPrototypePersistent:' + mockObject2.muUID + ':mockProperty' ) ).toBeTruthy( );

	    mockObject.relInstance( );
	    mockObject2.relInstance( );

	    expect( mockObject.muUID ).toBeUndefined( );
	    expect( mockObject2.muUID ).toBeUndefined( );

	    expect( entityExistInStorage( './', 'mockPrototypePersistent:' + mockObject.muUID + ':mockProperty' ) ).toBeFalsy( );
	    expect( entityExistInStorage( './', 'mockPrototypePersistent:' + mockObject2.muUID + ':mockProperty' ) ).toBeFalsy( );
    });

    it( "has a working default session storage engine", function()
    {
        var muSessionStorageMock = new mu.Storage.Driver( 'session' );

        expect( muSessionStorageMock.storageType ).toEqual( 'session' );
        expect( muSessionStorageMock.storagePathOrURI ).toEqual( mu.runinbrowser ? '' : '/tmp/' );
        expect( muSessionStorageMock.userLogin ).toBeUndefined( );
        expect( muSessionStorageMock.userPassword ).toBeUndefined( );
        expect( muSessionStorageMock.params ).toBeUndefined( );
        expect( muSessionStorageMock.driver.enginePath ).toEqual( typeof window === "undefined"? 'file' : 'sessionStorage' );
        expect( muSessionStorageMock.driver.driverName ).toEqual( 'memory' );
        expect( muSessionStorageMock.driver.lastMuUID ).toBeDefined( );
        expect( muSessionStorageMock.driver.ownInstance ).toBeDefined( );
        expect( muSessionStorageMock.driver.relInstance ).toBeDefined( );
        expect( muSessionStorageMock.driver.getItem ).toBeDefined( );
        expect( muSessionStorageMock.driver.setItem ).toBeDefined( );
    });

    it( "has a working session default storage (owning the object from the constructor)", function()
    {
        var muSessionStorageMock = new mu.Storage.Driver( 'session' );

        function mockPrototypeSession( constructParameterTest )
        {
            this.mockProperty = constructParameterTest;
            muSessionStorageMock.ownInstance( this, 'mockPrototypeSession' );
        }
        mockPrototypeSession.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

        var mockObject = new mockPrototypeSession( 'mockPropertyValue5' );
        expect( mockObject.mockProperty ).toEqual( 'mockPropertyValue5' );
        expect( mockObject.mockFunction ).toBeDefined( );
        expect( mockObject.muUID ).toBeDefined( );

        var mockObject2 = new mockPrototypeSession( 'mockPropertyValue6' );
        expect( mockObject2.mockProperty ).toEqual( 'mockPropertyValue6' );
        expect( mockObject2.mockFunction ).toBeDefined( );
        expect( mockObject2.muUID ).toBeDefined( );

	    expect( entityExistInStorage( '/tmp/', 'mockPrototypeSession:' + mockObject.muUID + ':mockProperty' ) ).toBeTruthy( );
		expect( entityExistInStorage( '/tmp/', 'mockPrototypeSession:' + mockObject2.muUID + ':mockProperty' ) ).toBeTruthy( );

	    mockObject.relInstance( );
	    mockObject2.relInstance( );

	    expect( entityExistInStorage( '/tmp/', 'mockPrototypeSession:' + mockObject.muUID + ':mockProperty' ) ).toBeFalsy( );
	    expect( entityExistInStorage( '/tmp/', 'mockPrototypeSession:' + mockObject2.muUID + ':mockProperty' ) ).toBeFalsy( );
    });

    it( "accept a driver, load it, and use its functions", function()
    {
        var muEmptyDrvStorageMock = new mu.Storage.Driver( 'volatile', 'empty' );

        expect( muEmptyDrvStorageMock ).toBeDefined( );
        expect( muEmptyDrvStorageMock.driver.lastMuUID ).toBeDefined( );
        expect( muEmptyDrvStorageMock.driver.ownInstance ).toBeDefined( );
        expect( muEmptyDrvStorageMock.driver.relInstance ).toBeDefined( );
        expect( muEmptyDrvStorageMock.driver.getItem ).toBeDefined( );
        expect( muEmptyDrvStorageMock.driver.setItem ).toBeDefined( );
    });

});