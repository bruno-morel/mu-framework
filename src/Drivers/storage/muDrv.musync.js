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
	exports.Storages        = { };
	exports.prepare         = function( storagePathOrURI,
	                                    defaultUserLogin,
	                                    defaultUserPassword,
	                                    isSecure,
	                                    syncVersion,
	                                    params )
	{
		var     muSyncDrv       = this;
        var     realPathName    = window.location.pathname.split( '/' );

        if( realPathName[ realPathName.length - 1 ].indexOf( '.' ) != -1 )
            delete realPathName[ realPathName.length - 1 ];

        realPathName = realPathName.join( '/' );

		var     storageURL      = ( storagePathOrURI.indexOf( '://' ) != -1 ?
                                        storagePathOrURI :
                                        (   ( !isSecure ? window.location.protocol + '//' : 'https://' ) +
                                            ( defaultUserLogin != null ? defaultUserLogin : '' ) +
                                            ( defaultUserPassword != null ? ':' + defaultUserPassword : '' ) +
                                            ( defaultUserLogin != null ? '@' : '' ) +
                                            ( storagePathOrURI == null ?
                                                window.location.host :
                                                ( storagePathOrURI.indexOf( '.' ) == 0 ?
                                                    window.location.host + realPathName + storagePathOrURI :
                                                    storagePathOrURI) ) ) );


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
			muSyncDrv.Storages[ storageURL ] = { };
			muSyncDrv.Storages[ storageURL ].rootURL = storageURL;
			muSyncDrv.Storages[ storageURL ].version = ( syncVersion ? syncVersion : 1 );
			muSyncDrv.Storages[ storageURL ].defaultUserLogin = ( defaultUserLogin ? defaultUserLogin : null );
			muSyncDrv.Storages[ storageURL ].defaultUserPassword = ( defaultUserPassword ? defaultUserPassword : null );
			muSyncDrv.Storages[ storageURL ].lastTransactionID = { };
			muSyncDrv.Storages[ storageURL ].transactionsCursor = { };
			//this will allow synchronization to happen
			muSyncDrv.Storages[ storageURL ].lastState = { };
			//this will allow a locking mechanism to allowed handling of unwanted async disconnect
			muSyncDrv.Storages[ storageURL ].keepAliveFlag = true;
			muSyncDrv.Storages[ storageURL ].curRetries = 0;
			muSyncDrv.Storages[ storageURL ].maxRetries = 0;
			muSyncDrv.Storages[ storageURL ].readPool   = null;
            muSyncDrv.Storages[ storageURL ].objectList     = { };
            muSyncDrv.Storages[ storageURL ].objectInstances = { };

			if( muSyncDrv.relConnection == null )
				muSyncDrv.Storages[ storageURL ].relConnection = function( ){
					musyncDrvDisconnect( muSyncDrv.Storages[ storageURL ] );
				};

			if( muSyncDrv.keepAlive == null )
				muSyncDrv.Storages[ storageURL ].keepAlive = function( maxRetries )
				{//this is the long-polling technique
					//TODO use real long-polling
					if( maxRetries ) muSyncDrv.Storages[ storageURL ].maxRetries = maxRetries;
					muSyncDrv.Storages[ storageURL ].keepAliveFlag = true;
				};

			if( muSyncDrv.freeToDie == null )
				muSyncDrv.Storages[ storageURL ].freeToDie = function( )
				{//we disable long-polling
					muSyncDrv.Storages[ storageURL ].maxRetries = 0;
					muSyncDrv.Storages[ storageURL ].keepAliveFlag = false;
				};

			//we wait at least 1 second before letting anybody kill us
			// (this avoid race condition with asynchronous code)
			setTimeout( function( ){ muSyncDrv.Storages[ storageURL ].freeToDie( ) }, 1000 );
		}

		if( muSyncDrv.Storages[ storageURL ].readPool == null &&
		    params && ( params.readPoolLogin || params.readPoolStoragePathOrURI ) )
		{
			var     readPoolStorageURL= ( params.readPoolStoragePathOrURI.indexOf( '://' ) != -1 ?
			                                params.readPoolStoragePathOrURI :
			                                ( ( !params.readPoolIsSecure ? 'http://' : 'https://' ) +
			                                    ( params.readPoolLogin ? params.readPoolLogin : '' )+
			                                    ( params.readPoolPassword ? ':' + params.readPoolPassword : '' ) +
			                                    '@' +
			                                    ( params.readPoolStoragePathOrURI == null ?
			                                        'localhost' : params.readPoolStoragePathOrURI ) ) );

			muSyncDrv.Storages[ storageURL ].readPool = { };
			muSyncDrv.Storages[ storageURL ].readPool.rootURL = readPoolStorageURL;
		}

		return muSyncDrv;
	};

	exports.waitForTransactionOnObjectToFinish = function( objectStorageObject,
	                                                       prototypeURN,
	                                                       callbackToCallWhenFinished,
	                                                       callBackParams )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];

		if( storageContent.transactionsCursor[ prototypeURN ] &&
		    storageContent.transactionsCursor[ prototypeURN ] < storageContent.lastTransactionID[ prototypeURN ] )
		//the object has a modification happening, we wait for next tick to retry
			process.nextTick( function( )
			                  {
				                  exports.waitForTransactionOnObjectToFinish
					                  (
						                  objectStorageObject,
						                  prototypeURN,
						                  callbackToCallWhenFinished,
						                  callBackParams
					                  );
			                  } );

		else
			callbackToCallWhenFinished( callBackParams );
	};

	function musyncDrvDisconnect( storageContent )
	{
		//we have to wait for all transaction for all owned object by the driver to be finished !
		var noTransactionLeft = true;

		for( var transactionPending in storageContent.lastTransactionID )
		{
			if( storageContent.lastTransactionID[ transactionPending ] != 0 )
			{
				noTransactionLeft = false;
				break;
			}
		}

		if( noTransactionLeft &&
		    !storageContent.keepAliveFlag )
		{
			storageContent.release( );

			if( storageContent.readPool )
				storageContent.readPool.release( );
		}
		else//we must wait for the next IO event queue to be emptied to try again
			mu.timers.setImmediate( function( )
			                        {
				                        musyncDrvDisconnect( storageContent );
			                        } );
	}

	function musyncDrvAddTransaction( storageContent, objectOrPropertyURN )
	{
		if( !storageContent.transactionsCursor[ objectOrPropertyURN ] )
		{
			storageContent.lastTransactionID[ objectOrPropertyURN ] = 0;
			storageContent.transactionsCursor[ objectOrPropertyURN ] = 0;
		}
		else if( !storageContent.lastTransactionID[ objectOrPropertyURN ] )
			my.error( 'musync driver : we have a transaction cursor withtout a last transactionID' );

		else
			storageContent.lastTransactionID[ objectOrPropertyURN ]++;

		return storageContent.lastTransactionID[ objectOrPropertyURN ];
	}

	function musyncDrvDelTransaction( storageContent, objectOrPropertyURN, transactionID )
	{
		storageContent.transactionsCursor[ objectOrPropertyURN ]++;

		if( storageContent.transactionsCursor[ objectOrPropertyURN ] > storageContent.lastTransactionID[ objectOrPropertyURN ] )
		{
			var prototypeURN = objectOrPropertyURN.split( ':' )[ 0 ];

			if( objectOrPropertyURN != prototypeURN )
			{
				delete storageContent.lastTransactionID[ objectOrPropertyURN ];
				delete storageContent.transactionsCursor[ objectOrPropertyURN ];
			}
			else
			{
				storageContent.lastTransactionID[ objectOrPropertyURN ] = 0;
				storageContent.transactionsCursor[ objectOrPropertyURN ] = 0;
			}
		}
	}


	function musyncDrvGetPoolConnectionAndCall( objectStorageObject,
	                                            objectOrPropertyURN,
	                                            optionalObjectInstanceList,
	                                            fnToCallAfterPoolRetrieval,
	                                            transactionID )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
		var prototypeURN = objectOrPropertyURN.split( ':' )[ 0 ];

		var currentTransactionID = transactionID;

		if( transactionID == null &&
		    fnToCallAfterPoolRetrieval != musyncDrvPrototypeAddTrigger )
			//this is a new transaction, we create a transaction ID
			currentTransactionID = musyncDrvAddTransaction( storageContent, objectOrPropertyURN );

		if( fnToCallAfterPoolRetrieval == musyncDrvPrototypeAddTrigger )
			//we want to retrieve the object instance list, proceed, this is the first transaction
			musyncDrvPrototypeAddTrigger
			(
				objectStorageObject,
				objectOrPropertyURN,
				optionalObjectInstanceList,
				musyncDrvAddTransaction( storageContent, prototypeURN )
			);

		else if( ( storageContent.transactionsCursor[ prototypeURN ] &&
		           storageContent.transactionsCursor[ prototypeURN ] < storageContent.lastTransactionID[ prototypeURN ] ) ||
		         currentTransactionID != storageContent.transactionsCursor[ objectOrPropertyURN ] )
		{   //the object has a meta modification happening, or this is not our transaction ID's turn
			//we release the pool and wait for next tick to retry
			setTimeout( function( )
			            {
				            musyncDrvGetPoolConnectionAndCall( objectStorageObject,
				                                               objectOrPropertyURN,
				                                               optionalObjectInstanceList,
				                                               fnToCallAfterPoolRetrieval,
				                                               currentTransactionID );
			            }, 100 );
		}
		else
			fnToCallAfterPoolRetrieval( objectStorageObject,
			                            objectOrPropertyURN,
			                            optionalObjectInstanceList,
			                            currentTransactionID );
	}


	function musyncDrvInstanceInit( objectStorageObject, prototypeURN, objectToOwn, optionalObjectInstanceList )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];

		if( !objectToOwn.muUID )
			objectToOwn.muUID = objectStorageObject.generateMuUID( );

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

		var objectURNToAdd = prototypeURN + ':' + objectToOwn.muUID;

/*
        if( storageContent.objectList &&
            !storageContent.objectList[ prototypeURN ] )
            storageContent.objectList[ prototypeURN ] = objectToOwn.constructor;

        if( storageContent.objectInstances &&
            !storageContent.objectInstances[ prototypeURN ] )
            storageContent.objectInstances[ prototypeURN ] = { };

        if( storageContent.objectInstances &&
            !storageContent.objectInstances[ prototypeURN ][ objectToOwn.muUID ] )
            storageContent.objectInstances[ prototypeURN ][ objectToOwn.muUID ] = objectToOwn;
*/
        storageContent.lastState[ objectURNToAdd ] = objectToOwn;

		if( !storageContent.lastTransactionID[ prototypeURN ] )
			//no object table is present for this prototype we
            //  go for the first sync and retrieve all current objects
			musyncDrvGetPoolConnectionAndCall( objectStorageObject,
			                                   objectURNToAdd,
			                                   optionalObjectInstanceList,
			                                   musyncDrvPrototypeAddTrigger );

		mu.debug( 'INSERTING a new object with URN' + objectURNToAdd );
		musyncDrvGetPoolConnectionAndCall( objectStorageObject,
		                                   objectURNToAdd,
		                                   optionalObjectInstanceList,
		                                   musyncDrvInstanceAdd );

		return objectToOwn.muUID;
	}

	function musyncDrvInstanceRelease( objectStorageObject, prototypeURN, objectToDelete, callback )
	{
		musyncDrvGetPoolConnectionAndCall( objectStorageObject,
		                                   prototypeURN + ':' + objectToDelete.muUID,
		                                   optionalObjectInstanceList,
		                                   musyncDrvInstanceDel );

		exports.waitForTransactionOnObjectToFinish
		(
			objectStorageObject,
			prototypeURN,
			callback
		);
	}

	function musyncDrvPrototypeAddTrigger( objectStorageObject, objectURN, optionalObjectInstanceList, transactionID )
	{
		var storageContent  = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
		var objectToSync    = objectURN.split( ':' );
		var prototypeName   = objectToSync[ 0 ];
		var muUID           = objectToSync[ 1 ];

		var objectListRequest = new XMLHttpRequest( );

		objectListRequest.onreadystatechange = function( )
			{
				musyncDrvPrototypeAddHandle( objectStorageObject,
				                             prototypeName,
				                             optionalObjectInstanceList,
				                             objectListRequest,
				                             transactionID );
			};

		objectListRequest.open
		(
			'GET',
			storageContent.rootURL + '/v' + storageContent.version + '/' + prototypeName + '.json',
			true,
			storageContent.defaultUserLogin,
			storageContent.defaultUserPassword
		);
		objectListRequest.send( );
	}

	function musyncDrvPrototypeAddHandle( objectStorageObject,
	                                      prototypeNameToAdd,
	                                      optionalObjectInstanceList,
	                                      objectListRequest,
	                                      transactionID
		)
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
		if( objectListRequest.readyState == 4 )
		{
			if( objectListRequest.status != 200 &&
			    objectListRequest.status != 0 )
				mu.warn
					(
						'An error has occured retrieving ' + prototypeNameToAdd +
						' object instances list : ' + objectListRequest.statusText +
						' : ' + objectListRequest.statusText +
						' - ' + objectListRequest.responseText
					);

			else
			{
				var idList;

				if( !objectListRequest.responseText &&
				    objectListRequest.responseText == '' )
				{
					delete objectListRequest;
					musyncDrvDelTransaction( storageContent, prototypeNameToAdd, transactionID );

					return;
				}

				try{ idList = JSON.parse( objectListRequest.responseText ); }
				catch( errorParsing )
				{
					mu.warn
						(
							'error parsing ' + prototypeNameToAdd +
							' object instances list'
						);
				}

				for( var currentIdIndex in idList )
					musyncObjectInstanceTrigger
					(
						objectStorageObject,
						prototypeNameToAdd,
						optionalObjectInstanceList,
						transactionID,
						idList[ currentIdIndex ]
					);
			}
		}
	}


	function musyncObjectInstanceTrigger( objectStorageObject,
	                                      objectToGet,
	                                      optionalObjectInstanceList,
	                                      transactionID,
	                                      idToGet )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
		var instanceRequest = new XMLHttpRequest( );

		instanceRequest.onreadystatechange = function( )
			{
				musyncObjectInstanceHandle( objectStorageObject,
				                            objectToGet,
				                            optionalObjectInstanceList,
				                            instanceRequest,
				                            transactionID,
				                            idToGet );
			};

		instanceRequest.open
			(
				'GET',
				storageContent.rootURL + '/v' + storageContent.version + '/' + objectToGet + '/' + idToGet + '.json',
				true,
				storageContent.defaultUserLogin,
				storageContent.defaultUserPass
			);
		instanceRequest.send( );
	}

	function musyncObjectInstanceHandle( objectStorageObject,
	                                     objectToGet,
	                                     optionalObjectInstanceList,
	                                     instanceRequest,
	                                     transactionID,
	                                     idToGet )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
		if( instanceRequest.readyState == 4 )
		{
			if( instanceRequest.status != 200 &&
			    instanceRequest.status != 0 )
				mu.warn
					(
						'An error has occurred making the object property request for : ' + objectToGet +
						' with id : ' + idToGet
					);

			else
			{
				var objectPropertiesAndValue;
				try{ objectPropertiesAndValue = JSON.parse( instanceRequest.responseText ); }
				catch( errorParsing )
				{
					mu.warn
						(
							'error parsing ' + objectToGet +
							'object properties for muUID :' + idToGet
						);
				}
				if( ( mu.runinbrowser && window[ objectToGet ] ) ||
                    !optionalObjectInstanceList )
				{
					delete instanceRequest;
					musyncDrvDelTransaction( storageContent, objectToGet + ':' + idToGet, transactionID );
					return;
				}
                var newObject = new window[ objectToGet ]( idToGet );

				var createNew = !optionalObjectInstanceList[ objectToGet ] ||
				                !optionalObjectInstanceList[ objectToGet ][ idToGet ];

				if( optionalObjectInstanceList &&
                    !optionalObjectInstanceList[ objectToGet ] )
					optionalObjectInstanceList[ objectToGet ] = { };

				if( optionalObjectInstanceList )
					optionalObjectInstanceList[ objectToGet ][ idToGet ] = newObject;

				if( createNew ||
					    //we agressively update the object if the remote object has no timestamp
					( newObject.muSyncStamp &&
					  !objectPropertiesAndValue.muSyncStamp ) ||
				    ( newObject.muSyncStamp &&
				      objectPropertiesAndValue.muSyncStamp &&
                        newObject.muSyncStamp <= objectPropertiesAndValue.muSyncStamp ) )
				{
					for( var propertyName in objectPropertiesAndValue )
                        newObject[ propertyName ] = objectPropertiesAndValue[ propertyName ];

					if( !objectPropertiesAndValue.muSyncStamp )
					{
                        newObject.muSyncStamp = new Date().getTime();
						Object.defineProperty
						(
                            newObject,
							'muSyncStamp',
							{
								writable    : true,
								enumerable  : false,
								configurable: false
							}
						);
					}
				}

				delete instanceRequest;
				musyncDrvDelTransaction( storageContent, objectToGet + ':' + idToGet, transactionID );
			}
		}
	}

	function musyncDrvInstanceAdd( objectStorageObject, objectURN, optionalObjectInstanceList, transactionID )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
		var objectToSync = objectURN.split( ':' );
		var prototypeName = objectToSync[ 0 ];
		var muUID = objectToSync[ 1 ];

		var postInstanceRequest = new XMLHttpRequest( );

		postInstanceRequest.onreadystatechange = function( )
		{
			if( postInstanceRequest.readyState == 4 )
			{
				//TODO : respond to 'not modified' HTTP response
				if( postInstanceRequest.status != 200 &&
				    postInstanceRequest.status != 304 &&
				    postInstanceRequest.status != 0 )
					mu.warn
					(
						'An error has occurred POSTing an instance of the object : ' + prototypeName +
						' with id : ' + muUID
					);

				else
				{
					var objectPropertiesAndValue;
					try{ objectPropertiesAndValue = JSON.parse( postInstanceRequest.responseText ); }
					catch( errorParsing )
					{
						mu.warn
						(
							'error POSTing ' + prototypeName +
							'object properties for muUID :' + muUID
						);
					}
					if( !optionalObjectInstanceList )
					{
						delete postInstanceRequest;
						musyncDrvDelTransaction( storageContent, objectURN, transactionID );
						return;
					}
					var notModified = postInstanceRequest.status == 304;

					//there was already an instance and its info was fresher than ours
					if( notModified &&
					    objectPropertiesAndValue.muSyncStamp &&
					    optionalObjectInstanceList[ prototypeName ] &&
					    optionalObjectInstanceList[ prototypeName ][ muUID ] &&
					    optionalObjectInstanceList[ prototypeName ][ muUID ].muSyncStamp <= objectPropertiesAndValue.muSyncStamp )
					{
						for( var propertyName in objectPropertiesAndValue )
							optionalObjectInstanceList[ prototypeName ][ muUID ][ propertyName ] = objectPropertiesAndValue[ propertyName ];
					}
					else
						mu.warn
						(
							'error POSTing ' + prototypeName +
							'object properties for muUID :' + muUID
						);

					delete postInstanceRequest;
					musyncDrvDelTransaction( storageContent, objectURN, transactionID );
				}
			}
		};

		postInstanceRequest.open
			(
				'POST',
				storageContent.rootURL + '/v' + storageContent.version + '/' + prototypeName + '.json',
				true,
				storageContent.defaultUserLogin,
				storageContent.defaultUserPass
			);
		postInstanceRequest.send( );
	}


	function musyncDrvInstanceDel( objectStorageObject, objectURN, optionalObjectInstanceList, transactionID )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
		var objectToSync = objectURN.split( ':' );
		var prototypeName = objectToSync[ 0 ];
		var muUID = objectToSync[ 1 ];

		var deleteInstanceRequest = new XMLHttpRequest( );

		deleteInstanceRequest.onreadystatechange = function( )
		{
			if( deleteInstanceRequest.readyState == 4 )
			{
				if( deleteInstanceRequest.status != 200 &&
				    deleteInstanceRequest.status != 0 )
					mu.warn
					(
						'An error has occurred DELETing an instance of the object : ' + prototypeName +
						' with id : ' + muUID
					);

				else
				{
					var objectPropertiesAndValue;
					try{ objectPropertiesAndValue = JSON.parse( deleteInstanceRequest.responseText ); }
					catch( errorParsing )
					{
						mu.warn
							(
								'error DELETing ' + prototypeName +
								'object properties for muUID :' + muUID
							);
					}
					if( !optionalObjectInstanceList )
					{
						delete deleteInstanceRequest;
						musyncDrvDelTransaction( storageContent, objectURN, transactionID );
						return;
					}


					delete deleteInstanceRequest;
					musyncDrvDelTransaction( storageContent, objectURN, transactionID );
				}
			}
		};

		deleteInstanceRequest.open
			(
				'DELETE',
				storageContent.rootURL + '/v' + storageContent.version + '/' + prototypeName + '/' + muUID + '.json',
				true,
				storageContent.defaultUserLogin,
				storageContent.defaultUserPass
			);
		deleteInstanceRequest.send( );
	}

	function musyncDrvItemGet( objectStorageObject, propertyURN, optionalObjectInstanceList )
	{   // we trigger the select query transaction, return the value that we have right now in memory,
		// the transaction will synchronise with any modification in the BD later, this basically is THE synchronisation mechanism
		var nowStamp = new Date().getTime() + 1500;
		var propertyToSync = propertyURN.split( ':' );
		var objectURN = propertyToSync[ 0 ] + ':' + propertyToSync[ 1 ];

		if( !objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ objectURN ].muSyncStamp ||
		    objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ objectURN ].muSyncStamp > nowStamp )
		{
			musyncDrvGetPoolConnectionAndCall( objectStorageObject,
			                                   propertyURN,
			                                   optionalObjectInstanceList,
			                                   musyncDrvGetPropertyValue );
			objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ objectURN ].muSyncStamp = nowStamp;
		}

		return objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ];
	}

	function musyncDrvGetPropertyValue( objectStorageObject, propertyURN, optionalObjectInstanceList, transactionID )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
		var propertyToSync = propertyURN.split( ':' );
		var prototypeName = propertyToSync[ 0 ];
		var muUID = propertyToSync[ 1 ];
		var propertyName = propertyToSync[ 2 ];

		var getInstanceRequest = new XMLHttpRequest( );

		getInstanceRequest.onreadystatechange = function( )
		{
			if( getInstanceRequest.readyState == 4 )
			{
				//TODO : respond to 'not modified' HTTP response
				if( getInstanceRequest.status != 200 &&
				    getInstanceRequest.status != 304 &&
				    getInstanceRequest.status != 0 )
					mu.warn
					(
						'An error has occurred GETing an instance of the object : ' + prototypeName +
						' with id : ' + muUID
					);

				else
				{
					var objectPropertiesAndValue;
					try{ objectPropertiesAndValue = JSON.parse( getInstanceRequest.responseText ); }
					catch( errorParsing )
					{
						mu.warn
						(
							'error GETing property ' + propertyName + ' value for object ' +
							prototypeName + ' with muUID :' + muUID
						);
					}
					if( !optionalObjectInstanceList )
					{
						delete getInstanceRequest;
						musyncDrvDelTransaction( storageContent, propertyURN, transactionID );
						return;
					}

					objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ] = objectPropertiesAndValue[ propertyName ];

					if( objectPropertiesAndValue.muSyncStamp &&
					    optionalObjectInstanceList[ prototypeName ] &&
					    optionalObjectInstanceList[ prototypeName ][ muUID ] &&
					    optionalObjectInstanceList[ prototypeName ][ muUID ].muSyncStamp <= objectPropertiesAndValue.muSyncStamp )
						optionalObjectInstanceList[ prototypeName ][ muUID ][ propertyName ] = objectPropertiesAndValue[ propertyName ];

					else
						mu.warn
						(
							'error GETing property ' + propertyName + ' value for object ' +
							prototypeName + ' with muUID :' + muUID
						);

					delete getInstanceRequest;
					musyncDrvDelTransaction( storageContent, propertyURN, transactionID );
				}
			}
		};

		getInstanceRequest.open
			(
				'GET',
				( storageContent.readPool ? storageContent.readPool : storageContent.rootURL ) +
					'/v' + storageContent.version + '/' + prototypeName +
					'/' + muUID + '.json?field=' + propertyName,
				true,
				storageContent.defaultUserLogin,
				storageContent.defaultUserPass
			);
		getInstanceRequest.send( );
	}

	function musyncDrvItemSet( objectStorageObject, propertyURN, newVal, optionalObjectInstanceList )
	{   // we trigger the select query transaction, return the value that we have right now in memory,
		// the transaction will synchronise with any modification in the BD later,
		// this basically IS the synchronisation mechanism
		objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ] = newVal;

		musyncDrvGetPoolConnectionAndCall( objectStorageObject,
		                                   propertyURN,
		                                   optionalObjectInstanceList,
		                                   musyncDrvSetPropertyValue );
	}

	function musyncDrvSetPropertyValue( objectStorageObject, propertyURN, optionalObjectInstanceList, transactionID )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
		var propertyToSync = propertyURN.split( ':' );
		var prototypeName = propertyToSync[ 0 ];
		var muUID = propertyToSync[ 1 ];
		var propertyName = propertyToSync[ 2 ];

		var putInstanceRequest = new XMLHttpRequest( );

		putInstanceRequest.onreadystatechange = function( )
		{
			if( putInstanceRequest.readyState == 4 )
			{
				//TODO : respond to 'not modified' HTTP response
				if( putInstanceRequest.status != 200 &&
				    putInstanceRequest.status != 304 &&
				    putInstanceRequest.status != 0 )
					mu.warn
						(
							'An error has occurred PUTing an instance of the object : ' + prototypeName +
							' with id : ' + muUID
						);

				else
				{
					var objectPropertiesAndValue;
					try{ objectPropertiesAndValue = JSON.parse( putInstanceRequest.responseText ); }
					catch( errorParsing )
					{
						mu.warn
							(
								'error PUTing property ' + propertyName + ' value for object ' +
								prototypeName + ' with muUID :' + muUID
							);
					}
					delete putInstanceRequest;
					musyncDrvDelTransaction( storageContent, propertyURN, transactionID );

				}
			}
		};

		putInstanceRequest.open
		(
			'PUT',
			storageContent.rootURL + '/v' + storageContent.version + '/' + prototypeName +
			'/' + muUID + '.json?field=' + propertyName,
			true,
			storageContent.defaultUserLogin,
			storageContent.defaultUserPass
		);
		var dataToSend =
			{
				propertyName : objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ],
				muSyncStamp : new Date().getTime( )
			};

		putInstanceRequest.send( JSON.stringify( dataToSend ) );
	}


	return exports;
} ) ( typeof exports === 'undefined' ? this[ 'mu' ][ 'Drv.musync' ] = { } : exports );