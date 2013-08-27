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
	var muSyncMock;

	//we create some prototype and object to sync
	var muSyncTestMix = function ( )
	{
		this.muORMTestMixString = "name value is a string with this as default"
		this.muORMTestMixDate = new Date( "03/12/2012" );
		this.muORMTestMixNumeric = 15;
	};
	function muSyncTestNumeric( )
	{
		this.muORMTestNumeric1 = 15;
		this.muORMTestNumeric2 = 15;
		this.muORMTestNumeric3 = 15;
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

	it( "defines url", function()
	{
		expect( muSyncMock.url ).toBeDefined( );
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
		expect( muSyncMock.keyPathOrUser ).toEqual( '' );
	});

	it( "defines certPath", function()
	{
		expect( muSyncMock.certPathOrPass ).toEqual( './' );
	});

	it( "defines the object list and got test objects in it", function()
	{
		expect( muSyncMock.objectList ).toEqual( { 'muSyncTestMix' : muSyncTestMix, 'muSyncTestNumeric' : muSyncTestNumeric } );
	});


	it( "defines the object instances list and got test instances in it", function()
	{
		expect( muSyncMock.objectInstances ).toEqual(
			{
				'muSyncTestMix' :
				{
					'83d946e6-288a-2444-9187-23c8387ae597' : mockTestMix1,
					'a4eebc70-5d1e-519b-64aa-0aabdd02fe2b' : mockTestMix2
				},
				'muSyncTestNumeric' :
				{
					'0b945338-494d-ff61-201d-99a014e46e95' : mockTestNumeric1,
					'0ba93991-e4cc-b30e-1d7b-796c1d54aa19' : mockTestNumeric2
				}
			} );
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
		expect( muSyncMock2.keyPathOrUser ).toEqual( '' );
		expect( muSyncMock2.certPathOrPass ).toEqual( './' );

		expect( muSyncMock2.endpointPort ).toEqual( 80 );
		expect( muSyncMock2.objectList ).toBeDefined(  );
		expect( muSyncMock2.objectInstances ).toBeDefined(  );

		muSyncMock2.stop( );
	});

	it( "is getting the list of object's muUIDs", function()
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
			      expect( mockTestMix1.muORMTestMixString ).toEqual( "first muSyncTestMixString" );
			      expect( mockTestMix1.muORMTestMixDate ).toEqual( "03/12/2012" );
			      expect( mockTestMix1.muORMTestMixNumeric ).toEqual( 15 );

			      expect( mockTestMix2.muORMTestMixString ).toEqual( "second muSyncTestMixString" );
			      expect( mockTestMix2.muORMTestMixDate ).toEqual( "04/12/2012" );
			      expect( mockTestMix2.muORMTestMixNumeric ).toEqual( 16 );

			      expect( mockTestNumeric1.muORMTestNumeric1 ).toEqual( 1 );
			      expect( mockTestNumeric1.muORMTestNumeric2 ).toEqual( 2 );
			      expect( mockTestNumeric1.muORMTestNumeric3 ).toEqual( 3 );

			      expect( mockTestNumeric2.muORMTestNumeric1 ).toEqual( 4 );
			      expect( mockTestNumeric2.muORMTestNumeric2 ).toEqual( 5 );
			      expect( mockTestNumeric2.muORMTestNumeric3 ).toEqual( 6 );
		      } );
	});

});