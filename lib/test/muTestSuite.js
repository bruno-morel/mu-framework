/**
 * Created by bruno
 * 12-03-26 3:46 PM
 */
if( typeof window === 'undefined' )
    global[ 'mu' ] = require( '../src/mu.js' );

mu.require( 'muJasmine' );


// cross-node/browser code
( function( exports )
{
    var specToTest =
        [
            'mu.spec',
            'muStore.spec',
            'muORM.spec',
            'muBrowser.spec',
            'muSync.spec',
            'muSyncedORM.spec'
        ];

    var specPath = mu.runinbrowser ? './' : __dirname + '/';

    mu.Jasmine.browseSpecs( specToTest, specPath );

})( typeof exports === 'undefined' ? this[ 'muTestSuite' ]={ } : exports );

