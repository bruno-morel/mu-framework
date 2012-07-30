/**
 * User: bruno
 * Date: 12-04-19
 * Time: 11:22 AM
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


// cross-node/browser code
( function( exports )
{
    var basePath = '../test/jasmine/';

    if( typeof window == "undefined" )
    {
        var jasmineGlobal       = require( basePath + 'jasmine-1.1.0.js' );
        for ( var key in jasmineGlobal )
            global[ key ] = jasmineGlobal[ key ];

        jasmine.TrivialReporter = require( basePath + 'jasmine-mu.js' );
    }

    exports.browseSpecs = function( specsToTest, specsPath, nextIndex )
    {
        var currentIndex = nextIndex ? nextIndex : 0;

        if( currentIndex < specsToTest.length )
        {
            var finalSpecPath = specsPath ?
                                    specsPath + specsToTest[ currentIndex ] :
                                    specsToTest[ currentIndex ];

            if( typeof window === "undefined" )
                finalSpecPath = require.resolve( finalSpecPath );

            mu.require( finalSpecPath, function() { exports.browseSpecs( specsToTest, specsPath, currentIndex + 1 ); } );
        }
        else
        {
            jasmine.getEnv( ).addReporter( new jasmine.TrivialReporter( null, { verbose : true } ) );
            jasmine.getEnv( ).execute( );
        }
    };

} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'Jasmine' ] = { } : exports );