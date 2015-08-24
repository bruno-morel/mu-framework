/**
 * User: bruno
 * Date: 12-05-17
 *
 * muSync using muORM Jasmine BDD specification
 */

if( !mu.runinbrowser )
	mu.require( 'muSyncedORM.serv.spec.js' );

else
	mu.require( 'muSyncedORM.client.spec.js' );