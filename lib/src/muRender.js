/**
 * Date: 2013-07-19
 * User: bruno
 *
 * muRender is the rendering engine to allow html website to be displayed
 *
 */

// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


// includes
mu.require( 'fs' );
mu.require( 'http' );
mu.require( 'https' );

( function ( exports )
{
	exports.Website = function( title, defaultHeader, templatePath, endpointPort, keyPath, certPath )
	{
		//setuping the server infos
		this.endpointPort   = endpointPort;
		this.defaultHeader  = defaultHeader;
		this.templatePath   = templatePath;
		this.keyPath        = keyPath;
		this.certPath       = certPath;
	};

	exports.Website.prototype.start = function ( )
	{
		if( this.keyPath &&
		    this.certPath )
			this.endpoint = mu.https.createServer
			(
				{
					key: mu.fs.readFileSync( this.keyPath ),
					cert: mu.fs.readFileSync( this.certPath )
				},
				function( request, response )
				{ defaultServerRenderer( this, request, response ); }
			);

		else
			this.endpoint = mu.http.createServer( function( request, response )
			                                      {
				                                      defaultServerRenderer
				                                      (
					                                      this,
					                                      request,
					                                      response
				                                      );
			                                      } );

		this.endpoint.listen( this.endpointPort );
	};

	exports.Website.prototype.stop = function(  )
	{
		if( !mu.runinbrowser )
			this.endpoint.close( );
	};

	function defaultServerRenderer( that, request, response )
	{
		var doctype	= '<?xml version="1.0" encoding="UTF-8"?>' +
		                 '<!DOCTYPE html ' +
		                 '	PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" ' +
		                 '   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> ' +
		                 '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">';
		var header = '<head>' +
		                  ( this.title ? '    <title>' + this.title + '</title>' : '' ) +
		                  ( this.defaultHeader ? this.defaultHeader : '' ) +
		                  '</head>';

		var body = '<body></body>';

		//fail safe on default values;
		response.type           = 'text/html';
		response.data           = '"' + request.url + '" page not found';
		response.code           = 404

		response.data           = doctype + header + body;
		response.code           = 200;

		response.writeHead( response.code, { 'Content-Type': response.type } );
		response.end( response.data );
	}

	return exports;
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'Render' ] = { } : exports );