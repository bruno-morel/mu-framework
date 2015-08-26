/**
 * Created by bruno
 * 12-03-22 5:26 PM
 */


var jasmineClient       = require( './jasmine-1.1.0.js' );
var jasmine             = jasmineClient.jasmine;
//var jasmineReporters    = require('./jasmine-mu.js');
//var jasmineNode         = jasmineReporters.jasmine;


jasmine.TrivialReporter = require('jasmine-mu.js');

/*
function removeJasmineFrames( text )
{
    var lines = [ ];
    text.split( /\n/ ).forEach( function( line )
        {
            if( line.indexOf(filename) == -1 )
                lines.push(line);
        } );
    return lines.join( '\n' );
}
*/

/*
jasmine.asyncSpecWait = function()
{
    var wait = jasmine.asyncSpecWait;
    wait.start = Date.getTime();
    wait.done = false;
    ( function innerWait(){
        waits(10);
        runs(function() {
            if ( wait.start + wait.timeout < Date.getTime( ) )
                expect('timeout waiting for spec').toBeNull();

            else if( wait.done )
                wait.done = false;

            else
                innerWait();
        });
    })();
};

jasmine.asyncSpecWait.timeout = 4 * 1000;
jasmine.asyncSpecDone = function( )
{
    jasmine.asyncSpecWait.done = true;
};
*/
for ( var key in jasmine )
{
    exports[ key ] = jasmine[ key ];
}

for ( var key in jasmineClient )
{
    global[ key ] = jasmineClient[ key ];
}

