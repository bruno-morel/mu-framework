/**
 * Created by bruno
 * 12-04-16 1:49 PM
 */


mu.require( 'muSync' );


describe( "muSync", function()
{
    //mu.activateDebug( );

    var muSyncMock ;
    beforeEach( function( )
    {
        muSyncMock = new mu.Sync.EndPoint( 8000 );
        mu.log( 'server is running at http://localhost:' + muSyncMock.serverPort );
    } );


    it( "is defined", function()
    {
        expect( muSyncMock ).toBeDefined( );
    });

    it( "defines server", function()
    {
        expect( muSyncMock.server ).toBeDefined( );
    });

    it( "defines serverPort to the default process port or 8000", function()
    {
        expect( muSyncMock.serverPort ).toEqual( 8000 );
    });

    it( "defines browsable to false", function()
    {
        expect( muSyncMock.browsable ).toBeFalsy( );
    });

    it( "defines ORM object to null", function()
    {
        expect( muSyncMock.ORM ).toBeNull( );
    });

    it( "defines keyPath", function()
    {
        expect( muSyncMock.keyPath ).toEqual( '' );
    });

    it( "defines certPath", function()
    {
        expect( muSyncMock.certPath ).toEqual( './' );
    });

    it( "defines stop()", function()
    {
        expect( muSyncMock.stop ).toBeDefined( );
    });

    it( "is not a singleton", function()
    {
        var muSyncMock2 = new mu.Sync.EndPoint( 8001, true, 'test' );

        expect( muSyncMock.browsable ).toBeFalsy( );
        expect( muSyncMock.ORM ).toBeNull( );
        expect( muSyncMock.keyPath ).toEqual( '' );
        expect( muSyncMock.certPath ).toEqual( './' );

        expect( muSyncMock2.serverPort ).toEqual( 8001 );
        expect( muSyncMock2.browsable ).toBeTruthy( );
        expect( muSyncMock2.ORM ).toEqual( 'test' );
    });

    afterEach( function() { muSyncMock.stop( ); mu.log( 'server is closed' ); } );
});