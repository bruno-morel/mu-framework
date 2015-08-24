/**
 * Created by bruno
 * 12-03-26 3:46 PM
 *
 * Main Jasmine BDD javascript loading, both client and server side
 */
if( typeof window === 'undefined' )
    global[ 'mu' ] = require( '../src/mu.js' );

mu.require( '../src/muJasmine' );

//how much time the test takes to run (to be able to do some cleanup afterward)
var scope = ( typeof window === 'undefined' ? global : window );
scope[ 'CONST_TEST_RUNLENGTH' ] = 1100;

//mu.activateDebug();

// cross-node/browser code
( function( exports )
{
    var specToTest =
        [
            'mu.spec',
            'muStorage.spec',
            //'muStorage.mongodb.spec',
            'muStorage.musync.spec',
            'muORM.spec',
            'muBrowser.spec',
            'muSyncedStorage.spec',
            //due to HTTP client/server asymmetry we have to load different spec
            ( mu.runinbrowser ? 'muSync.client.spec' : 'muSync.serv.spec' ),
            ( mu.runinbrowser ? 'muSyncedORM.client.spec' : 'muSyncedORM.serv.spec' )/*,

            'muStorage.mysql.spec',
            'muORM.mysql.spec',
            'muSyncedStorage.mysql.spec',
            'muSyncedORMStorage.mysql.spec',

            'muStorage.redis.spec',
            'muORM.redis.spec',
            'muSyncedStorage.redis.spec',
            'muSyncedORMStorage.redis.spec'*/
            //,
//            'muRender.spec'
        ];

    try{
        require.resolve( 'mysql' );
        specToTest.push( [
            'muStorage.mysql.spec',
            'muORM.mysql.spec',
            'muSyncedStorage.mysql.spec',
            'muSyncedORMStorage.mysql.spec'
        ] );
    }
    catch( errorMySQL ){ console.log( 'NO MYSQL library present - mysql support will be ignored' ); }

    try
    {
        require.resolve( 'redis' );
        specToTest.push( [
            'muStorage.redis.spec',
            'muORM.redis.spec',
            'muSyncedStorage.redis.spec',
            'muSyncedORMStorage.redis.spec'//,
        ] );
    }
    catch( errorMySQL ){ console.log( 'NO REDIS library present - redis support will be ignored' ); }


    var specPath = mu.runinbrowser ? './' : __dirname + '/';

    mu.Jasmine.browseSpecs( specToTest, specPath );

    //muStorage clean up
	if( !mu.runinbrowser &&
	    mu.Storage )
		//we wait enough for the test to run and then we kill the connection (otherwise the pool will stay alive)
		setTimeout
        (
            function( ){//we close all storage drivers and connections
                for( var curDriver in mu.Storage.Drivers )
                {
                    mu.log( 'closing driver : ' + curDriver );
                    for( var curStorage in mu.Storage.Drivers[ curDriver ].Storages )
                    {
                        mu.log( curDriver + ' - closing storage : ' + curStorage );
                        mu.Storage.Drivers[ curDriver ].Storages[ curStorage ].relConnection( );
                    }
                }
            },
		    CONST_TEST_RUNLENGTH + 100
        );

    else mu.debug( 'no storage driver to test it seems' );


})( typeof exports === 'undefined' ? this[ 'muTestSuite' ]={ } : exports );

