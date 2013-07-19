/**
 * Date: 2013-07-18
 * User: bruno
 *
 * muAPI is a helper class that encapsulate mu libraries in a neat handler
 *
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );

mu.require( 'muSync' );
mu.require( 'muORM' );
mu.require( 'muStorage' );

// cross-node/browser code
( function( exports )
{
		//mu.activateDebug();

	exports.Node           = function
	(
		schemaPath,
		defaultStorageType,
		defaultStorageDriver,
		defaultStorageURI,
		defaultStorageLogin,
		defaultStoragePassword,
		defaultStorageParams,
		apiPort,
		apiIsBrowsable,
		apiVersion,
		apiKeyPath,
		apiCertPath
	)
	{
		this.DefaultStorage = new mu.Storage.Driver
			(
				defaultStorageType,
				defaultStorageDriver,
				defaultStorageURI,
				defaultStorageLogin,
				defaultStoragePassword,
				defaultStorageParams
			);

		this.Schemas = new mu.ORM.Schema( schemaPath, this.DefaultStorage );
		this.Schemas.loadAllDBSchema( );

		this.EndPoint = new mu.Sync.EndPoint
			(
				apiPort,
				apiIsBrowsable,
				this.Schemas,
				apiVersion,
				apiKeyPath,
				apiCertPath
			);
	};

	exports.Node.prototype.start = function( )
	{
		this.EndPoint.start( );
		mu.debug( this.EndPoint.APIName + ' API is connected at ' + this.EndPoint.endpoint + ':' + this.EndPoint.endpointPort );
	};

	exports.Node.prototype.stop = function( )
	{
		this.EndPoint.stop( );
		mu.debug( this.EndPoint.APIName + ' API stopped at ' + this.EndPoint.endpoint + ':' + this.EndPoint.endpointPort );
	};

	return exports;
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'API' ] = { } : exports );
