/**
 * User: bruno
 * Date: 2012-11-26
 * Time: 7:44 PM
 *
 * muStore BDD (muJasmine) specification file
 */


mu.require( 'muStore' );


describe( "muSync", function()
{
    //mu.activateDebug( );
    var muStoreMock = new mu.Store.Storage( );



    it( "is defined", function()
    {
        expect( muStoreMock ).toBeDefined( );
    });

    it( "has default properties and set to default value", function()
    {
        expect( muStoreMock.storageType ).toEqual( 'volatile' );
        expect( muStoreMock.driverName ).toEqual( '' );
        expect( muStoreMock.engineName ).toEqual( 'file' );
        expect( muStoreMock.storagePathOrURI ).toEqual( '' );
        expect( muStoreMock.params ).toEqual( '' );
    });

    it( "getting a list of data", function()
    {
        expect( muStoreMock.driverName ).toEqual( 'volatile' );
    });


});