/**
 * Created by bruno
 * 12-03-26 3:46 PM
 */
if( typeof window === 'undefined' )
    global[ 'mu' ] = require( '../src/mu.js' );

mu.require( 'muJasmine' );

//how much time the test takes to run (to be able to do some cleanup afterward)
var scope = ( typeof window === 'undefined' ? global : window );
scope[ 'CONST_TEST_RUNLENGTH' ] = 1100;

// cross-node/browser code
( function( exports )
{
    var specToTest =
        [
            'mu.spec',
            'muStorage.spec',
            'muStorage.mysql.spec',
            'muORM.spec',
            'muORM.mysql.spec',
            'muBrowser.spec',
            'muSync.spec',
            'muSyncedORM.spec',
            'muSyncedStorage.spec',
            'muSyncedStorage.mysql.spec',
            'muSyncedORMStorage.mysql.spec'//,
//            'muRender.spec'
        ];

    var specPath = mu.runinbrowser ? './' : __dirname + '/';

    mu.Jasmine.browseSpecs( specToTest, specPath );

	if( !mu.runinbrowser )
		//we wait enough for the test to run and then we kill the connection (otherwise the pool will stay alive)
		setTimeout( function( )
		            {//we close all storage drivers and connections
						for( var curDriver in mu.Storage.Drivers )
						{
							mu.debug( 'closing driver : ' + curDriver );
							for( var curStorage in mu.Storage.Drivers[ curDriver ].Storages )
							{
								mu.debug( curDriver + ' - closing storage : ' + curStorage );
								mu.Storage.Drivers[ curDriver ].Storages[ curStorage ].relConnection( );
							}
						}
					},
		            CONST_TEST_RUNLENGTH + 100 );

})( typeof exports === 'undefined' ? this[ 'muTestSuite' ]={ } : exports );

