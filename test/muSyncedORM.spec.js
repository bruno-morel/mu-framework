/**
 * User: bruno
 * Date: 12-05-17
 *
 * muSync using muORM Jasmine BDD specification
 */

if( !mu.runinbrowser )
	mu.require( '../test/muSyncedORM.serv.spec.js' );

else
	mu.require( '../test/muSyncedORM.client.spec.js' );