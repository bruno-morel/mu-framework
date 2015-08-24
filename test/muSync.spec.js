/**
 * Created by bruno
 * 12-04-16 1:49 PM
 *
 * muSync BDD (muJasmine) specification file
 */

if( !mu.runinbrowser )
	mu.require( '../test/muSync.serv.spec.js' );
else
	//beware though that in the browser, due to inline injection during
	// page loading, this test will fail
	mu.require( '../test/muSync.client.spec.js' );

