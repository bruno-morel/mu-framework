/**
 * Created by bruno
 * 12-02-24 4:42 PM
 */


// cross-node/browser code
( function( exports )
{
//if( typeof window != "undefined" )
//    var exports = [ ];

    exports.mu = function( muPath )
    {
        this.muPath = '';
        if( muPath != null )
            this.muPath = muPath;

        else if( typeof window === "undefined" )
            this.muPath = __dirname;

        else
            this.muPath = '';

        this.softRequire = false;
    };

    exports.runinbrowser    = typeof window != "undefined";
    exports.runiniOS        = function( )
    {
        var uagent = navigator.userAgent.toLowerCase();

        if( uagent.indexOf( "iphone" ) !=- 1 ||
            uagent.indexOf( "ipod" ) !=- 1 )
            return true;

        return false;
    };
    exports.runinAndroid    = function( )
    {
        var uagent = navigator.userAgent.toLowerCase();

        if( uagent.indexOf( "android" ) !=- 1 )
            return true;

        return false;
    };
    exports.runinsmartphone = function( )
    {
        if( this.runinAndroid() ||
            this.runiniOS() )
            return true;

        return false;
    };
    exports.runinmobile     = function( )
    {
        if( this.runinsmartphone() )
            return true;

        var uagent = navigator.userAgent.toLowerCase();
        var mobileAgentList =
            [   "midp","240x320","blackberry","netfront","nokia","panasonic",
                "portalmmm","sharp","sie-","sonyericsson","symbian",
                "windows ce","benq","mda","mot-","opera mini",
                "philips","pocket pc","sagem","samsung","sda",
                "sgh-","vodafone","xda","palm" ];
        var isMobileAgent = false;

        for( var mobileAgentIndex = 0;
             mobileAgentIndex < mobileAgentList.length;
             mobileAgentIndex += 1 )
        {
            if( uagent.indexOf( mobileAgentList[ mobileAgentIndex ] ) !=- 1 )
                isMobileAgent = true;
        }
        return isMobileAgent;
    };
    exports.includes        = { };
    exports.debug           = function( )               { };
    exports.warn            = function( warnMessage )   { return console.warn( warnMessage ); };
    exports.error           = function( errorMessage )  { return console.error( errorMessage ); };
    exports.log             = function( logMessage )    { return console.log( logMessage ); };
    exports.dump            = function( object )        { return console.log( "%o", object ); };
    exports.activateDebug   = function( )
    {
        exports.debug = function( debugMessage ) { return console.log( debugMessage ) };
    };

    // some global function
    exports.included = function( src, dontWarn )
    {
        var filename = src.substring( src.lastIndexOf( '/' ) + 1 );
        if( filename.lastIndexOf( '.js' ) != -1 )
            filename = filename.substring( 0, filename.lastIndexOf( '.js') );

        if( this.includes[ filename ] )
            return true;

        // in node.js includes are internal only
        if( typeof window == "undefined" )
            return false;

        var finalSrcName = src.substring( src.lastIndexOf( '/' ) + 1 );
        if( finalSrcName.lastIndexOf( '.js' ) == -1 )
            finalSrcName += '.js';

        // in the browser, we check for a script element
        var isThere             = false;
        var headElementNumber   = document.getElementsByTagName( "head" )[ 0 ].childNodes.length;
        var currentHeadElement  = 0;
        var scriptElement       = '';

        while( currentHeadElement < headElementNumber && !isThere )
        {
            scriptElement = document.getElementsByTagName( "head" )[ 0 ].childNodes[ currentHeadElement ];
            if( scriptElement &&
                scriptElement.type == 'text/javascript' &&
                scriptElement.src.indexOf( finalSrcName ) !== -1 )
                isThere = true;

            currentHeadElement++;
        }

        if( !isThere )
        {
            if( !dontWarn ) this.warn( 'warning : ' + src + ' is missing.' );
            return false;
        }

        if( src.indexOf( 'http://' ) != 0 &&
            src.charAt( 0 ) != '/' &&
            src.charAt( 0 ) != '.' )
            this.includes[ filename ] = this.muPath + finalSrcName;

        else
            this.includes[ filename ] = finalSrcName;

        return true;
    };

    exports.require = function( src, loadedCallback )
    {
        if( this.included( src, true ) )
            return;

        var includename = src.substring( src.lastIndexOf( '/' ) + 1 );
        if( includename.lastIndexOf( '.js') != -1 )
            includename = includename.substring( 0, includename.lastIndexOf( '.js') );

        //we stip the 'mu' prefix for the framework lib, allowing a sane namespace
        if( includename.charAt( 0 ) == 'm' &&
            includename.charAt( 1 ) == 'u' &&
            includename.charAt( 2 ) != '.' )
            includename = includename.substring( 2, includename.length )

        var finalSrcPath    = src;

        if( typeof window != "undefined" &&
            src.lastIndexOf( '.js') == -1 )
            finalSrcPath += '.js';

        if( src.indexOf( 'http://' ) != 0 &&
            src.charAt( 0 ) != '/' &&
            src.charAt( 0 ) != '.' )
        {
            if( typeof window !== 'undefined' )
                finalSrcPath = this.muPath + finalSrcPath;

            else
            {
                try{ require.resolve( finalSrcPath ) }
                catch( e ){ finalSrcPath = this.muPath + finalSrcPath; }
            }
        }

        this.includes[ includename ] = finalSrcPath;

        //in node.js, we just use the system require
        if( typeof window === "undefined" )
        {
            var returnedFromRequire = require( finalSrcPath );

            // we setup a mu variable with the name of the script
            this[ includename ] = returnedFromRequire;
            if( loadedCallback )
                loadedCallback( );

            return returnedFromRequire;
        }
        //this is equivalent to an else statement

        /*
        //in the browser we load the file and eval it
        var ajaxCall = new XMLHttpRequest();

        ajaxCall.open( "GET", finalSrcPath, false );
        ajaxCall.setRequestHeader( 'User-Agent','XMLHTTP/1.0' );

        mu.debug( 'loading script : ' + finalSrcPath );
        if( ajaxCall.readyState == 4 ) return false;

        ajaxCall.send( null );
        if( ajaxCall.readyState != 4 ) return false;
        if( ajaxCall.status != 200 &&
            ajaxCall.status != 304 &&
            ajaxCall.status != 0 )
        {
            mu.warn( 'there were not script to load...' );
            mu.error( 'javascript loading error ' + ajaxCall.status );
            return false;
        }

        with( window )
        {
            try{ eval( ajaxCall.responseText ) }
            catch( e ){ mu.error( "javascript eval error : " + e.error + ' in ' + ajaxCall.responseText ); }
        }
        */
        if( this.softRequire )
            return this.warn( 'missing javascript : ' + finalSrcPath );

        //in the browser, we create a script element and return it
        var scriptElement   = document.createElement( 'script' );

        scriptElement.setAttribute( "type", "text/javascript" );
        scriptElement.setAttribute( "src", finalSrcPath );
        if( loadedCallback &&
            scriptElement.readyState ) // IE
            scriptElement.onreadystatechange = function ( )
                {
                    if( scriptElement.readyState == "loaded" ||
                        scriptElement.readyState == "complete" )
                    {
                        scriptElement.onreadystatechange = null;
                        loadedCallback( src );
                    }
                };
        else if( loadedCallback ) // Others browser
            scriptElement.onload = function(){ loadedCallback( ); };

        this.warn( "appending a script tag in head with source = " + finalSrcPath );
        document.getElementsByTagName( "head" )[ 0 ].appendChild( scriptElement );

        return includename;
    };


    // some local function
    var buildIncludes = function( )
    {
        // in node.js includes are unreachable
        if( typeof window == "undefined" )
            return '';

        var currentHeadElement  = 0;
        var headElementNumber   = document.getElementsByTagName( "head" )[ 0 ].childNodes.length;
        var scriptElement   = null;
        var includeName        = '';

        while( currentHeadElement < headElementNumber )
        {
            scriptElement = document.getElementsByTagName( "head" )[ 0 ].childNodes[ currentHeadElement ];
            if( scriptElement &&
                scriptElement.type == 'text/javascript' )
            {
                includeName = scriptElement.src.substring( scriptElement.src.lastIndexOf( '/' ) + 1 );
                if( includeName.lastIndexOf( '.js' ) != -1 )
                    includeName = includeName.substring( 0, includeName.lastIndexOf( '.js') );

                exports.includes[ includeName ] = scriptElement.src;
            }

            currentHeadElement++;
        }

        if( exports.includes[ 'mu' ] )
            return exports.includes[ 'mu' ].substring( 0, exports.includes[ 'mu' ].lastIndexOf( '/' ) + 1 );

        return '';
    };

    exports.muPath          = typeof window !== 'undefined' ? buildIncludes() : __dirname + '/';

    if( typeof global !== 'undefined' ) global[ 'mu' ] = exports;
} )( typeof exports === 'undefined' ? this[ 'mu' ] = { } : exports );