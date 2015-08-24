/**
 * Date: 2013-09-03
 * User: bruno
 *
 * MuSync muStorage driver BDD (muJasmine) specification file
 */
mu.require( '../src/muStorage' );

//musync is client side specific
if( mu.runinbrowser )
describe( "muStorageMuSync", function()
{
	//mu.activateDebug( );
	var muMuSyncDrvStorageMock = new mu.Storage.Driver( 'persistent',
	                                                    'musync',
                                                        './testsync',
	                                                    'muTestRW',
	                                                    'mUt3ST' );

	//this is a special feature that allow us to make sure we keep this connection alive during the jasmin async tests
	muMuSyncDrvStorageMock.driver.Storages[ muMuSyncDrvStorageMock.storagePathOrURI ].keepAlive( );

	it( "accept to load the musync driver, and got all the driver capabilities", function()
	{
		expect( muMuSyncDrvStorageMock ).toBeDefined( );
		expect( muMuSyncDrvStorageMock.driver.ownInstance ).toBeDefined( );
		expect( muMuSyncDrvStorageMock.driver.relInstance ).toBeDefined( );
		expect( muMuSyncDrvStorageMock.driver.getItem ).toBeDefined( );
		expect( muMuSyncDrvStorageMock.driver.setItem ).toBeDefined( );
	});

	it( "can create and own an object, PUSH it in a collection, UPDATE it and DELETE it", function()
	{
		function muSyncTestMix( constructParameterTest )
		{
			this.muSyncTestMixString = "name value is a string with this as default";
			this.muSyncTestMixDate   = "03/12/2012";
			this.muSyncTestMixNumeric = 15;

			muMuSyncDrvStorageMock.ownInstance( this, 'muSyncTestMix' );
		}
		muSyncTestMix.prototype.mockFunction = function( mockParameter ){ return mockParameter; }

		var mockObject1 = new muSyncTestMix( 'mockPropertyValue1' );
        var currentMuUID1 = mockObject1.muUID;

		expect( mockObject1.muSyncTestMixString ).toEqual( 'name value is a string with this as default' );
		expect( mockObject1.muSyncTestMixDate ).toEqual( '03/12/2012' );
		expect( mockObject1.muSyncTestMixNumeric ).toEqual( 15 );
		expect( mockObject1.mockFunction ).toBeDefined( );

		var mockObject2 = new muSyncTestMix( 'mockPropertyValue2' );
		expect( mockObject2.muUID ).toBeDefined( );
		var currentMuUID2 = mockObject2.muUID;
		expect( mockObject2.muSyncTestMixString ).toEqual( 'name value is a string with this as default' );
		expect( mockObject2.muSyncTestMixDate ).toEqual( '03/12/2012' );
		expect( mockObject2.muSyncTestMixNumeric ).toEqual( 15 );
		expect( mockObject2.mockFunction ).toBeDefined( );

		mockObject1.muSyncTestMixString = 'muSyncTestMixString1Changed';
		expect( mockObject1.muSyncTestMixString ).toEqual( 'muSyncTestMixString1Changed' );
		mockObject2.muSyncTestMixString = 'muSyncTestMixString2Changed';
		expect( mockObject2.muSyncTestMixString ).toEqual( 'muSyncTestMixString2Changed' );

		mockObject1.relInstance( );
		mockObject2.relInstance( );

		expect( mockObject1.muUID ).toBeUndefined( );
		expect( mockObject2.muUID ).toBeUndefined( );
    });
});