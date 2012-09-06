/**
 * Created by bruno
 * 12-04-16 1:49 PM
 */


mu.require( 'muSync' );
mu.require( 'muBrowser' );


describe( "muSync", function()
{
    //mu.activateDebug( );
    var muSyncMock;

    beforeEach( function( )
    {
        muSyncMock = new mu.Sync.EndPoint( 8000 );
        mu.debug( 'endpoint is connected at http://localhost:' + muSyncMock.endpointPort );
    } );


    it( "is defined", function()
    {
        expect( muSyncMock ).toBeDefined( );
    });

    it( "defines endpoint", function()
    {
        expect( muSyncMock.endpoint ).toBeDefined( );
    });

    it( "defines endpointPort to the default process port or 8000", function()
    {
        expect( muSyncMock.endpointPort ).toEqual( 8000 );
    });

    it( "defines browsable to false", function()
    {
        expect( muSyncMock.browsable ).toBeFalsy( );
    });

    it( "defines ORM object to null", function()
    {
        expect( muSyncMock.ORMSchema ).toBeNull( );
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
        expect( muSyncMock.ORMSchema ).toBeNull( );
        expect( muSyncMock.keyPath ).toEqual( '' );
        expect( muSyncMock.certPath ).toEqual( './' );

        expect( muSyncMock2.endpointPort ).toEqual( 8001 );
        expect( muSyncMock2.browsable ).toBeTruthy( );
        expect( muSyncMock2.ORMSchema ).toEqual( 'test' );

        muSyncMock2.stop( );
    });

    it( "is exposing objects in html by default (depends on muBrowser)", function()
    {
        var muBrowser = new mu.Browser();
        expect( muBrowser ).toBeDefined( );

        muSyncMock.browsable = true;
    });

    if( !mu.runinbrowser )
        it( "is returning 501 when root is not browsable", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            var muBrowser = new mu.Browser();

            expect( muBrowser ).toBeDefined( );

            muSyncMock.browsable    = false;

            runs( function()
                  {
                      muBrowser.get
                          (
                              'http://localhost:8000',
                              function( statusCode, contentType, grabbedDatas )
                              {
                                  responseValue.statusCode = statusCode;
                                  responseValue.contentType = contentType;
                                  responseValue.grabbedDatas = grabbedDatas;
                                  asyncTick = true;
                              }
                          );
                  } );

            waitsFor( function() { return asyncTick; } );

            runs( function()
                  {
                      expect( responseValue.statusCode ).toEqual( 501 );
                      expect( responseValue.contentType ).toEqual( 'text/html' );
                  } );
        });

    if( !mu.runinbrowser )
        it( "is returning 503 when root is browsable but there's no object", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            var muBrowser = new mu.Browser();

            expect( muBrowser ).toBeDefined( );

            muSyncMock.browsable    = true;

            runs( function()
                  {
                      muBrowser.get
                      (
                          'http://localhost:8000',
                          function( statusCode, contentType, grabbedDatas )
                          {
                              responseValue.statusCode = statusCode;
                              responseValue.contentType = contentType;
                              responseValue.grabbedDatas = grabbedDatas;
                              asyncTick = true;
                          }
                      );
                  } );

            waitsFor( function() { return asyncTick; } );

            runs( function()
                  {
                      expect( responseValue.statusCode ).toEqual( 503 );
                      expect( responseValue.contentType ).toEqual( 'text/html' );
                      expect( responseValue.grabbedDatas ).toBeDefined( );
                  } );
        });

    if( !mu.runinbrowser )
        it( "is returning 501 when root is not browsable in JSON format", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            var muBrowser = new mu.Browser();

            expect( muBrowser ).toBeDefined( );

            muSyncMock.browsable    = false;

            runs( function()
                  {
                      muBrowser.get
                      (
                          'http://localhost:8000/?json',
                          function( statusCode, contentType, grabbedDatas )
                          {
                              responseValue.statusCode = statusCode;
                              responseValue.contentType = contentType;
                              responseValue.grabbedDatas = grabbedDatas;
                              asyncTick = true;
                          }
                      );
                  } );

            waitsFor( function() { return asyncTick; } );

            runs( function()
                  {
                      expect( responseValue.statusCode ).toEqual( 501 );
                      expect( responseValue.contentType ).toEqual( 'application/json' );
                  } );
        });

    if( !mu.runinbrowser )
        it( "is returning 503 when root is browsable but there's no object in JSON format", function()
        {
            var asyncTick = false;
            var responseValue = { statusCode : 0, contentType : '', grabbedDatas : '' };

            var muBrowser = new mu.Browser();

            expect( muBrowser ).toBeDefined( );

            muSyncMock.browsable    = true;

            runs( function()
                  {
                      muBrowser.get
                      (
                          'http://localhost:8000/?json',
                          function( statusCode, contentType, grabbedDatas )
                          {
                              responseValue.statusCode = statusCode;
                              responseValue.contentType = contentType;
                              responseValue.grabbedDatas = grabbedDatas;
                              asyncTick = true;
                          }
                      );
                  } );

            waitsFor( function() { return asyncTick; } );

            runs( function()
                  {
                      expect( responseValue.statusCode ).toEqual( 503 );
                      expect( responseValue.contentType ).toEqual( 'application/json' );
                      expect( responseValue.grabbedDatas ).toBeDefined( );
                  } );
        });

    afterEach( function() { muSyncMock.stop( ); mu.debug( 'endpoint is closed' ); } );
});