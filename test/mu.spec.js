/**
 * Created by bruno
 * 12-03-16 3:41 PM
 */


describe( "mu", function()
{
    it( "is defined", function()
    {
        expect( mu ).toBeDefined( );
    });

    it( "defines muPath", function()
    {
        expect( mu.muPath ).toBeDefined( );
    });
    it( "defines runinbrowser", function()
    {
        expect( mu.runinbrowser ).toBeDefined( );
    });
    it( "defines runinmobile", function()
    {
        expect( mu.runinmobile ).toBeDefined( );
    });
    it( "defines runinsmartphone", function()
    {
        expect( mu.runinsmartphone ).toBeDefined( );
    });
    it( "defines runiniOS", function()
    {
        expect( mu.runiniOS ).toBeDefined( );
    });
    it( "defines runinAndroid", function()
    {
        expect( mu.runinAndroid ).toBeDefined( );
    });
    it( "defines debug", function()
    {
        expect( mu.debug ).toBeDefined( );
    });
    it( "defines warn", function()
    {
        expect( mu.warn ).toBeDefined( );
    });
    it( "defines error", function()
    {
        expect( mu.error ).toBeDefined( );
    });
    it( "defines log", function()
    {
        expect( mu.log ).toBeDefined( );
    });
    it( "defines dump", function()
    {
        expect( mu.dump ).toBeDefined( );
    });
    it( "defines activateDebug", function()
    {
        expect( mu.activateDebug ).toBeDefined( );
    });

    it( "defines mu constructor and set muPath from parameter", function()
    {
        var muMock = new mu.mu( );
        expect( muMock ).toBeDefined( );
        expect( muMock.muPath ).toBeDefined();

        var muMock = new mu.mu( 'testpath' );
        expect( muMock.muPath ).toBe( 'testpath' );
    });

    it( "defines require", function()
    {
        expect( mu.require ).toBeDefined( );
    });

});