/**
 * Date: 2013-08-13
 * User: bruno
 *
 * muSync BDD (muJasmine) specification file for the client side
 *
 */
mu.require( 'muSync' );


describe( "muSync", function()
{
	//mu.activateDebug( );
	var oldSyncStamp = new Date().getTime();
	var muSyncMock;

	//we create some prototype and object to sync
	var muSyncTestMix = function ( )
	{
		this.muSyncTestMixString = "name value is a string with this as default"
		this.muSyncTestMixDate = new Date( "03/12/2012" );
		this.muSyncTestMixNumeric = 15;
	};
	function muSyncTestNumeric( )
	{
		this.muSyncTestNumeric1 = 15;
		this.muSyncTestNumeric2 = 15;
		this.muSyncTestNumeric3 = 15;
	}

	muSyncMock = new mu.Sync.EndPoint( 'testsync', 80 );

	var mockTestMix1 = new muSyncTestMix( );
	var mockTestMix2 = new muSyncTestMix( );
	mockTestMix1.muUID = '83d946e6-288a-2444-9187-23c8387ae597';
	mockTestMix2.muUID = 'a4eebc70-5d1e-519b-64aa-0aabdd02fe2b';

	var mockTestNumeric1 = new muSyncTestNumeric( );
	var mockTestNumeric2 = new muSyncTestNumeric( );
	mockTestNumeric1.muUID = '0b945338-494d-ff61-201d-99a014e46e95';
	mockTestNumeric2.muUID = '0ba93991-e4cc-b30e-1d7b-796c1d54aa19';


	//we use a different port because we would step on muSync Jasmine BDD test EndPoint
	muSyncMock.setAPIName( 'muSyncClientTest' );
	muSyncMock.addObjectTypeToSync( muSyncTestMix, 'muSyncTestMix' );
	muSyncMock.addObjectInstanceToSync( mockTestMix1, 'muSyncTestMix' );
	muSyncMock.addObjectInstanceToSync( mockTestMix2, 'muSyncTestMix' );
	muSyncMock.addObjectTypeToSync( muSyncTestNumeric );
	muSyncMock.addObjectInstanceToSync( mockTestNumeric1 );
	muSyncMock.addObjectInstanceToSync( mockTestNumeric2 );

	mu.debug( 'endpoint is connected at file://localhost:' + muSyncMock.endpointPort );


	it( "is defined", function()
	{
		expect( muSyncMock ).toBeDefined( );
	});

	it( "defines rootURL", function()
	{
		expect( muSyncMock.rootURL ).toBeDefined( );
	});

	it( "defines endpoint", function()
	{
		expect( muSyncMock.endpoint ).toBeDefined( );
	});

	it( "defines endpointPort to the default process port or 80", function()
	{
		expect( muSyncMock.endpointPort ).toEqual( 80 );
	});

	it( "defines browsable to false", function()
	{
		expect( muSyncMock.browsable ).toBeFalsy( );
	});

	it( "defines an object list", function()
	{
		expect( muSyncMock.objectList ).toBeDefined( );
	});

	it( "defines an object instances list", function()
	{
		expect( muSyncMock.objectInstances ).toBeDefined( );
	});

	it( "defines an API Name", function()
	{
		expect( muSyncMock.APIName ).toBeDefined( );
	});

	it( "defines keyPath", function()
	{
		expect( muSyncMock.keyPath ).toBeUndefined( );
	});

	it( "defines certPath", function()
	{
		expect( muSyncMock.certPath ).toBeUndefined( );
	});

	it( "defines defaultUserLogin", function()
	{
		expect( muSyncMock.defaultUserLogin ).toBeUndefined( );
	});

	it( "defines defaultUserPass", function()
	{
		expect( muSyncMock.defaultUserPass ).toBeUndefined( );
	});

	it( "defines isSecure", function()
	{
		expect( muSyncMock.isSecure ).toBeFalsy( );
	});

	it( "defines the object list and got test objects in it", function()
	{
		expect( Object.keys( muSyncMock.objectList ).length ).toEqual( 2 );
		expect( muSyncMock.objectList[ 'muSyncTestMix' ] ).toEqual( muSyncTestMix );
		expect( muSyncMock.objectList[ 'muSyncTestNumeric' ] ).toEqual( muSyncTestNumeric );
	});

	it( "has assigned a timestamp for each synched objects", function()
	{
		expect( mockTestMix1.muSyncStamp ).not.toBeLessThan( oldSyncStamp );
		expect( mockTestMix2.muSyncStamp ).not.toBeLessThan( oldSyncStamp  );
		expect( mockTestNumeric1.muSyncStamp ).not.toBeLessThan( oldSyncStamp  );
		expect( mockTestNumeric2.muSyncStamp ).not.toBeLessThan( oldSyncStamp  );
	});

	it( "defines the object instances list and got test instances in it", function()
	{
		expect( Object.keys( muSyncMock.objectInstances ).length ).toEqual( 2 );
		expect( Object.keys( muSyncMock.objectInstances[ 'muSyncTestMix' ] ).length ).toEqual( 2 );
		expect( Object.keys( muSyncMock.objectInstances[ 'muSyncTestNumeric' ] ).length ).toEqual( 2 );
		expect( muSyncMock.objectInstances[ 'muSyncTestMix' ][ '83d946e6-288a-2444-9187-23c8387ae597' ]).toEqual( mockTestMix1 );
		expect( muSyncMock.objectInstances[ 'muSyncTestMix' ][ 'a4eebc70-5d1e-519b-64aa-0aabdd02fe2b' ]).toEqual( mockTestMix2 );
		expect( muSyncMock.objectInstances[ 'muSyncTestNumeric' ][ '0b945338-494d-ff61-201d-99a014e46e95' ]).toEqual( mockTestNumeric1 );
		expect( muSyncMock.objectInstances[ 'muSyncTestNumeric' ][ '0ba93991-e4cc-b30e-1d7b-796c1d54aa19' ]).toEqual( mockTestNumeric2 );
	});

	it( "defines stop()", function()
	{
		expect( muSyncMock.stop ).toBeDefined( );
	});

	it( "is not a singleton", function()
	{
		var muSyncMock2 = new mu.Sync.EndPoint( 'testsync', 80 );

		muSyncMock2.start();

		expect( muSyncMock2.browsable ).toBeFalsy( );
		expect( muSyncMock2.keyPath ).toBeUndefined( );
		expect( muSyncMock2.certPath).toBeUndefined( );

		expect( muSyncMock2.endpointPort ).toEqual( 80 );
		expect( muSyncMock2.objectList ).toBeDefined(  );
		expect( muSyncMock2.objectInstances ).toBeDefined(  );

		muSyncMock2.stop( );
	});

	it( "allow credentials", function()
	{
		var muSyncMock2 = new mu.Sync.EndPoint( 'testsync', 80 );

		muSyncMock2.start();

		expect( muSyncMock2.browsable ).toBeFalsy( );
		expect( muSyncMock2.keyPath ).toBeUndefined( );
		expect( muSyncMock2.certPath).toBeUndefined( );

		expect( muSyncMock2.endpointPort ).toEqual( 80 );
		expect( muSyncMock2.objectList ).toBeDefined(  );
		expect( muSyncMock2.objectInstances ).toBeDefined(  );

		muSyncMock2.stop( );
	});

	it( "is getting the list of object's muUIDs and instances values when starting", function()
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
			      expect( mockTestMix1.muSyncTestMixString ).toEqual( "first muSyncTestMixString" );
			      expect( mockTestMix1.muSyncTestMixDate ).toEqual( "03/12/2012" );
			      expect( mockTestMix1.muSyncTestMixNumeric ).toEqual( 15 );

			      expect( mockTestMix2.muSyncTestMixString ).toEqual( "second muSyncTestMixString" );
			      expect( mockTestMix2.muSyncTestMixDate ).toEqual( "04/12/2012" );
			      expect( mockTestMix2.muSyncTestMixNumeric ).toEqual( 16 );

			      expect( mockTestNumeric1.muSyncTestNumeric1 ).toEqual( 1 );
			      expect( mockTestNumeric1.muSyncTestNumeric2 ).toEqual( 2 );
			      expect( mockTestNumeric1.muSyncTestNumeric3 ).toEqual( 3 );

			      expect( mockTestNumeric2.muSyncTestNumeric1 ).toEqual( 4 );
			      expect( mockTestNumeric2.muSyncTestNumeric2 ).toEqual( 5 );
			      expect( mockTestNumeric2.muSyncTestNumeric3 ).toEqual( 6 );
		      } );
	});


	it( "allow to force refreshing and update the timestamp accordingly", function()
	{
		var asyncTick = false;
		var timeStampBeforeUpdate;

		runs( function()
		      {
			      timeStampBeforeUpdate = mockTestNumeric1.muSyncStamp;
			      mockTestNumeric1.muSyncTestNumeric1 = 11;
			      mockTestNumeric1.muSyncTestNumeric2 = 12;
			      mockTestNumeric1.muSyncTestNumeric3 = 13;

			      expect( mockTestNumeric1.muSyncTestNumeric1 ).toEqual( 11 );
			      expect( mockTestNumeric1.muSyncTestNumeric2 ).toEqual( 12 );
			      expect( mockTestNumeric1.muSyncTestNumeric3 ).toEqual( 13 );

			      muSyncMock.refresh( function( currentMuSync )
			                          {
				                          asyncTick = true;
			                          } );
		      } );
		waitsFor( function() { return asyncTick; } );
		runs( function()
		      {
			      expect( mockTestNumeric1.muSyncTestNumeric1 ).toEqual( 1 );
			      expect( mockTestNumeric1.muSyncTestNumeric2 ).toEqual( 2 );
			      expect( mockTestNumeric1.muSyncTestNumeric3 ).toEqual( 3 );
			      expect( mockTestNumeric1.muSyncStamp ).not.toBeLessThan( timeStampBeforeUpdate );
		      } );
	});

});