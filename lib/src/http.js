/**
 * User: bruno
 * Date: 12-05-24
 * Time: 12:01 PM
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


//includes
mu.require( 'fs' );


// this code will only be loaded on the browser but we make it compatible with node execution
// this code is HEAVILY inspired by ewsjs, all original copyright to them and thanks
( function( exports )
{
    //exports.ajaxCall            = null;
    exports.createServer        = function( requestListener )
    {
        return this.httpServer( requestListener );
    };

    /*
     * Embedded Web server. Receives requests for PUT/POST/GET/DELETE and figures out what to do.
     * Useful when there is no real server to use.
     *
     * Switch from intercepting framework to the browser - special credit to Yotam Rabinerson for his idea
     */
    exports.httpServer              = function ( requestListener )
    {
        // hold data across calls
        var db = {};

        // handlers
        var handlers = { path: {}, regex: [] },
            rewrites = [ ],
            auto = false,
            autoIndex = false,
            isEnabled = false,
            processCall,
            isDirListing;
        var originalXmlHttp = window.XMLHttpRequest,
            originalActiveX = window.ActiveXObject;

        var ajax = function( config )
        {
            // get the file via [s|a]jax, and respond with results
            var xmlHttp, method = "GET",
                url,
                async,
                cb,
                ret;
            config = config || { };

            async = config.async || false;
            url = config.url;
            cb = config.cb;

            // asynch most of the time
            try
            {
                // Firefox, Opera 8.0+, Safari
                xmlHttp = new originalXmlHttp( );
            }
            catch( e0 )
            {
                // Internet Explorer
                try
                {
                    xmlHttp = new originalActiveX( "Msxml2.XMLHTTP" );
                }
                catch ( e1 )
                {
                    try
                    {
                        xmlHttp = new originalActiveX( "Microsoft.XMLHTTP" );
                    } catch( e2 )
                    {
                        // no ajax support!
                        return( { status: 404 } );
                    }
                }
            }

            if( async )
            {
                xmlHttp.onreadystatechange = function( )
                {
                    if( xmlHttp.readyState==4 )
                    {
                        if( xmlHttp.status === 200 )
                            cb( { status: 200, responseText: xmlHttp.responseText, responseXML: xmlHttp.responseXML } );
                        else
                            cb( { status: xmlHttp.status } );
                    }
                };
            }
            try
            {
                // open the request
                xmlHttp.open( method, url, async );
                xmlHttp.send( null );
                ret = { status: 200, responseText: xmlHttp.responseText, responseXML: xmlHttp.responseXML };
            }
            catch( e3 ) { ret = { status: 404 }; }

            // if not async, return it directly
            if( !async )
                return( ret );
        };

        var replaceXmlHttp = function()
        {
            var UNSENT = 0;
            var OPENED = 1;
            //var HEADERS_RECEIVED = 2;
            //var LOADING = 3;
            var DONE = 4;

            var params = {},
                reqHeaders = {},
                resHeaders = {},
                abort = false,
                that = this;
            params.cb = function( res )
            {
                that.readyState = DONE;
                that.status = res.status;
                that.responseText = res.response;
                // what if it was xml?
                res.headers = res.headers || {};
                if( res.headers[ "Content-Type" ] &&
                    res.headers[ "Content-Type" ] === "text/xml" )
                    that.responseXML = res.response;

                if( that.onreadystatechange &&
                    typeof( that.onreadystatechange ) === "function" &&
                    !abort )
                    that.onreadystatechange();
            };
            this.readyState = UNSENT;
            this.open = function( method, url, async, user, password )
            {
                params.method = method || "GET";
                params.url = url;
                params.async = async || true;
                if( user )
                    params.user = user;

                if( password )
                    params.password = password;

                this.readyState = OPENED;
            };
            this.setRequestHeader = function( header,value )
            {
                reqHeaders[ header ] = value;
            };
            this.send = function( data )
            {
                var d = {},
                    u,
                    ret;
                data = data || "";
                this.readyState = OPENED;
                // break apart the url appropriately - do we have a query?
                u = params.url.split( "?" );
                params.url = u[ 0 ];
                // take the query
                if( u.length > 1 )
                    d = paramSplitter( u[ 1 ],d );

                d = paramSplitter( data, d );
                if( params.async )
                {
                    // ajax as async, so fork it
                    ret = null;
                    fork( { scope: this, arg: [ params, reqHeaders, d ], fn: processCall } );
                }
                else
                    ret = processCall.call(this, params, reqHeaders, d);

                return( ret );
            };
            this.abort = function()
            {
                abort = true;
            };
            this.getResponseHeader = function( header )
            {
                return resHeaders[ header ];
            };
            this.getAllResponseHeaders = function()
            {
                var i, ret = [];
                for( i in resHeaders )
                {
                    if( resHeaders.hasOwnProperty( i ) )
                        ret.push( i + ":" + resHeaders[ i ] );
                }
                return( ret.join( "\n" ) );
            };
        };
        var replaceActiveX = function( type )
        {
            if( type.indexOf( "Msxml2.XMLHTTP" ) > -1 ||
                type.indexOf( "Microsoft.XMLHTTP" ) > -1 )
                return ( new replaceXmlHttp( ) );
        };
        var fork = function( )
        {
            var fn, window = this;
            if( window && window.setTimeout )
                fn = function( f ) { window.setTimeout( f, 1 ); };
            else
                fn = null;

            return ( fn ?
                        function( conf )
                        {
                            var f = conf.fn,
                                scope = conf.scope,
                                arg = [ ].concat(conf.arg);

                            fn( function( ) { f.apply( scope, arg ); } );
                        } :
                        fn );
        }( );
        var paramSplitter = function( param, d2 )
            {
                var d = param.split( "&" ),
                    parts,
                    key,
                    value,
                    i;
                d2 = d2 || { };
                for( i = 0; i < d.length; i++ )
                {
                    parts = d[ i ].split( "=" );
                    if( parts.length > 0 )
                        key = parts[ 0 ].replace("+"," ");

                    value = parts.length > 1 ?
                        parts[ 1 ].replace( /\+/g," " ) :
                        "";
                    if( key && key !== "" )
                        d2[ key ] = value;
                }
                return( d2 );
            };

        // for parsing paths
        // do a little intelligent parsing - thanks to Aaron Quint, of SammyJS, for this code: http://code.quirkey.com/sammy/
        var PATH_REPLACER = "([^\/]+)",
            PATH_NAME_MATCHER = /:([\w\d]+)/g;

        return {
            enable: function( enable )
            {
                if( enable )
                {
                    // replace with our functions
                    window.XMLHttpRequest = replaceXmlHttp;
                    window.ActiveXObject = replaceActiveX;

                    // mark as enabled
                    isEnabled = true;
                }
                else if( isEnabled )
                {
                    // restore the originals
                    window.XMLHttpRequest = originalXmlHttp;
                    window.ActiveXObject = originalActiveX;
                    // mark as no longer enabled
                    isEnabled = false;
                }
            },
            disable: function()
            {
                this.enable( false );
            },
            registerHandler: function( url, handler )
            {
                // Needs to be explicitly set because IE will maintain the index unless NULL is returned,
                // which means that with two consecutive routes that contain params, the second set of params will not be found and end up in splat instead of params
                // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/RegExp/lastIndex
                PATH_NAME_MATCHER.lastIndex = 0;

                // find the names
                var path_match, param_names = [], path = url;
                while( ( path_match = PATH_NAME_MATCHER.exec( path ) ) !== null )
                    param_names.push( path_match[ 1 ] );

                // replace with the path replacement
                if( param_names.length > 0 )
                {
                    path = new RegExp( "^" + path.replace( /\./g,"\\." ).replace( PATH_NAME_MATCHER, PATH_REPLACER ) + "$" );
                    // we have a regex
                    handlers.regex.push( { fn: handler, path: path, params: param_names } );
                }
                else // we have a straight path
                    handlers.path[ path ] = handler;
            },
            registerRewrite: function( re,path )
            {
                // do a simple rewrite
                rewrites.push( { re:re, path:path } );
            },
            // to handle for any path
            registerAuto: function( handler )
            {
                auto = handler;
            },
            registerDb: function( newdb )
            {
                db = newdb;
            },
            // sets to use /index if none is available
            setAutoIndex: function( newAutoIndex )
            {
                autoIndex = newAutoIndex;
            },
            load: function( path, cb, async )
            {
                return ( async ? null : ajax( { url: path, async: async, cb: cb } ) );
            }
        };
    }( );

} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'http' ] = { } : /*we avoid overriding node object*/null );