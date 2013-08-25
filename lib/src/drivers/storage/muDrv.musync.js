/**
 * Date: 2013-08-05
 * User: bruno
 *
 * This is the driver for the front-end side API client as a muStorage client
 *
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../../../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


( function ( exports )
{
	//for an api, these will be client access (server url + account credentials)
	exports.Storages        = [ ];
	exports.prepare         = function( storagePathOrURI, userLogin, userPassword, params )
	{
		var     muSyncDrv        = this;
		var     storageURL      = 'http://' +
		                          ( userLogin != null ? userLogin : '' ) +
		                          ( userPassword != null ? ':' + userPassword : '' ) +
		                          ( userLogin != null ? '@' : '' ) +
		                          ( storagePathOrURI == null ? 'localhost' : storagePathOrURI );

		muSyncDrv.driverName = "musync";
		muSyncDrv.enginePath = '';//__filename;

		if( muSyncDrv.ownInstance == null )
			muSyncDrv.ownInstance = musyncDrvInstanceInit;
		if( muSyncDrv.relInstance == null )
			muSyncDrv.relInstance  = musyncDrvInstanceRelease;
		if( muSyncDrv.getItem == null )
			muSyncDrv.getItem  = musyncDrvItemGet;
		if( muSyncDrv.setItem == null )
			muSyncDrv.setItem = musyncDrvItemSet;

		muSyncDrv.listAddItemFnc    = null;
		muSyncDrv.listDelItemFnc    = null;
		muSyncDrv.listGetterFnc     = null;
		muSyncDrv.listSetterFnc     = null;


		if( muSyncDrv.Storages[ storageURL ] == null )
		{
			muSyncDrv.lastStorageURL = storageURL;
			mu.debug( 'Storage -> connecting to muSync : ' + storageURL );
			muSyncDrv.Storages[ storageURL ] = storageURL;
			muSyncDrv.Storages[ storageURL ].objectOrPropertyLastTransactionID = { };
			muSyncDrv.Storages[ storageURL ].objectOrPropertyTransactionsCursor = { };
			//this will allow synchronization to happen
			muSyncDrv.Storages[ storageURL ].lastState = { };
			//this will allow a locking mechanism to allowed handling of unwanted async disconnect
			muSyncDrv.Storages[ storageURL ].keepAliveFlag = true;
			muSyncDrv.Storages[ storageURL ].curRetries = 0;
			muSyncDrv.Storages[ storageURL ].maxRetries = 0;
			muSyncDrv.Storages[ storageURL ].readPool = null;

			if( muSyncDrv.relConnection == null )
				muSyncDrv.Storages[ storageURL ].relConnection = function( ){
					//mysqlDrvDisconnect( mySQLDrv.Storages[ storageURL ] );
				};

			if( muSyncDrv.keepAlive == null )
				muSyncDrv.Storages[ storageURL ].keepAlive = function( maxRetries )
				{

				};

			if( muSyncDrv.freeToDie == null )
				muSyncDrv.Storages[ storageURL ].freeToDie = function( )
				{

				};

			//we wait at least 1 second to let anybody kill us (this avoid race condition with asynchronous code
			setTimeout( function( ){ muSyncDrv.Storages[ storageURL ].freeToDie( ) }, 1000 );
		}

		if( muSyncDrv.Storages[ storageURL ].readPool == null &&
		    params &&
		    params.readPoolLogin )
		{
			var     readPoolStorageURL= 'http://' +
			                            params.readPoolLogin +
			                            ( params.readPoolPassword != null ? ':' + params.readPoolPassword : '' ) +
			                            '@' +
			                            ( params.readPoolStoragePathOrURI == null ?
			                              ( storagePathOrURI == null ? 'localhost' : storagePathOrURI ) :
			                              params.readPoolStoragePathOrURI );

			muSyncDrv.Storages[ storageURL ].readPool = readPoolStorageURL;
		}

		if( this.lastMuUID != null )
			muSyncDrv.lastMuUID = this.lastMuUID;

		else
			muSyncDrv.lastMuUID = { };

		return muSyncDrv;
	};

	function musyncDrvInstanceInit( objectStorageObject, prototypeURN, objectToOwn )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
		var driverLastMuIDTable = objectStorageObject.driver.lastMuUID;

		if( driverLastMuIDTable[ prototypeURN ] )
			driverLastMuIDTable[ prototypeURN ]++;

		else
			driverLastMuIDTable[ prototypeURN ] = 1;

		objectToOwn.muUID = driverLastMuIDTable[ prototypeURN ];
		Object.defineProperty
		(
			objectToOwn,
			'muUID',
			{
				writable    : false,
				enumerable  : false,
				configurable: true
			}
		);

		var objectURNToAdd = prototypeURN + ':' + driverLastMuIDTable[ prototypeURN ];

		storageContent.lastState[ objectURNToAdd ] = objectToOwn;

		if( !storageContent.objectOrPropertyLastTransactionID[ prototypeURN ] )
			//no prototype is present yet for this object : we retrieve it
			musyncDrvGetPrototype( objectStorageObject, objectURNToAdd );

		//musyncDrvGetPrototype( objectStorageObject, objectURNToAdd, mysqlDrvInstanceAdd );

		return objectToOwn.muUID;
	}



	return exports;
} )( typeof exports === 'undefined' ? { } : exports );