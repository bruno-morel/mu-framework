/**
 * User: bruno
 * Date: 12-05-22
 * Time: 3:54 PM
 *
 * muBrowser is an abstraction of a browser for server testing purpose with muJasmine
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] === "undefined" ) require( '../src/mu.js' );
else if( typeof window !== "undefined" ) console.error( "mu Browser can't work on the browser..." );


//includes
mu.require( 'fs' );
mu.require( 'http' );
mu.require( 'url' );


// cross-node/browser object code

var muBrowser                = function(  )
{
    this.blabla = '';
};

muBrowser.prototype.get    = function ( urlToGrab, callWhenGrabbed )
{
    var urlObject = '';

    if( !mu.runinbrowser )
        urlObject = mu.url.parse( urlToGrab );

    urlObject.agent = false;

    var grabRequest = mu.http.get
        (
            urlObject,
            function( response )
            {
                var grabbedDatas = null;

                response.setEncoding( 'utf8' );
                response.on
                (
                    'data',
                    function( datas )
                    {
                        if( grabbedDatas != null )
                            grabbedDatas += datas;
                        else
                            grabbedDatas = datas;
                        //mu.warn( datas );
                    }
                );
                response.on
                (
                    'end',
                    function( )
                    {
                        mu.debug( grabbedDatas );
                        if( callWhenGrabbed !== undefined )
                            callWhenGrabbed
                            (
                                response.statusCode,
                                response.headers[ 'content-type' ],
                                grabbedDatas
                            );
                    }
                );
            }
        );
    mu.catchError( grabRequest, 'Impossible to GET ' + urlToGrab );
};

muBrowser.prototype.post    = function ( urlToPostTo, postData, callWhenPosted )
{
	var urlObject = '';

	if( !mu.runinbrowser )
		urlObject = mu.url.parse( urlToPostTo );

	urlObject.agent = false;


	var postRequest = new mu.http.ClientRequest
	(
		{
			protocol: urlObject.protocol,
			hostname: urlObject.hostname,
			port    : urlObject.port,
			path    : urlObject.path,
			method  : 'POST',
			data    : postData
		},
		function( response )
		{
			var grabbedDatas = null;

			response.setEncoding( 'utf8' );
			response.on
			(
				'data',
				function( datas )
				{
					if( grabbedDatas != null )
						grabbedDatas += datas;
					else
						grabbedDatas = datas;
					//mu.warn( datas );
				}
			);
			response.on
			(
				'end',
				function( )
				{
					mu.debug( grabbedDatas );
					if( callWhenPosted !== undefined )
						callWhenPosted
						(
							response.statusCode,
							response.headers[ 'content-type' ],
							grabbedDatas
						);
				}
			);
		}
	);
	postRequest.end();

	mu.catchError( postRequest, 'Impossible to POST ' + urlToPostTo );
};


muBrowser.prototype.push    = function ( urlToPushTo, callWhenPushed )
{
    var urlObject = '';

    if( !mu.runinbrowser )
        urlObject = mu.url.parse( urlToPushTo );

    urlObject.agent = false;

    var pushRequest = new mu.http.ClientRequest
        (
            {
                protocol: urlObject.protocol,
                hostname: urlObject.hostname,
                port    : urlObject.port,
                path    : urlObject.path,
                method  : 'PUSH'
            },
            function( response )
            {
                var grabbedDatas = null;

                response.setEncoding( 'utf8' );
                response.on
                (
                    'data',
                    function( datas )
                    {
                        if( grabbedDatas != null )
                            grabbedDatas += datas;
                        else
                            grabbedDatas = datas;
                        //mu.warn( datas );
                    }
                );
                response.on
                (
                    'end',
                    function( )
                    {
                        mu.debug( grabbedDatas );
                        if( callWhenPushed !== undefined )
                            callWhenPushed
                                (
                                    response.statusCode,
                                    response.headers[ 'content-type' ],
                                    grabbedDatas
                                );
                    }
                );
            }
        );
    pushRequest.end();

    mu.catchError( pushRequest, 'Impossible to PUSH ' + urlToPushTo );
};



if( mu.runinbrowser )
    window[ 'mu' ][ 'Browser' ] = muBrowser;
else
{
    global[ 'mu' ][ 'Browser' ] = muBrowser;
    module.exports = muBrowser;
}
