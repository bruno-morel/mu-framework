/**
 * User: bruno
 * Date: 12-05-17
 * Time: 11:00 AM
 */


mu.require( 'muSync' );
mu.require( 'muORM' );


describe( "muSync with ORM schema linked", function()
{
    //mu.activateDebug( );

    var muSyncMock;
    var muORMMock;

    beforeEach( function( )
    {
        muSyncMock = new mu.Sync.EndPoint( 8000 );
        mu.log( 'server is running at http://localhost:' + muSyncMock.serverPort );

        muORMMock = new mu.ORM.Schema( './testschema/' );

        muSyncMock.ORM = muORMMock;
    });

    it( "are defined and linked", function()
    {
        expect( muSyncMock ).toBeDefined( );
        expect( muORMMock ).toBeDefined( );
        expect( muSyncMock.ORM ).toEqual( muORMMock );
    });

    it( "load the schema and verify the connection to the server", function()
    {
        muORMMock.loadDBSchema( 'muORMTestNumeric' );
    });

    afterEach( function() { muSyncMock.stop( ); mu.log( 'server is closed' ); } );
});