/**
 * User: bruno
 * Date: 2013-02-13
 * Time: 10:15 PM
 *
 * mysql muStorage driver is the driver for MySQL database
 *
 * the driver is dependant on node-mysql (https://github.com/felixge/node-mysql) so you should have installed it first
 * npm install git://github.com/felixge/node-mysql.git
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../../../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


// includes
mu.require( 'timers' );
mu.require( 'mysql' );

( function ( exports )
{
    //for mysql, these will be servers access (server + account credentials)
    exports.Storages        = { };
    exports.prepare         = function( storagePathOrURI, userLogin, userPassword, params )
    {
        var     mySQLDrv        = this;
        var     storageURL      = ( storagePathOrURI.indexOf( 'mysql://' ) != -1 ? storagePathOrURI :
                                    ( 'mysql://' +
                                        ( userLogin != null ? userLogin : '' ) +
                                        ( userPassword != null ? ':' + userPassword : '' ) +
                                        ( userLogin != null ? '@' : '' ) +
                                        ( storagePathOrURI == null ? 'localhost' : storagePathOrURI ) ) );

	    mySQLDrv.driverName = "mysql";
	    mySQLDrv.enginePath = ( mu.runinbrowser ? 'muDrv.mysql.js' : __filename );

        if( mySQLDrv.ownInstance == null )
            mySQLDrv.ownInstance = mysqlDrvInstanceInit;
        if( mySQLDrv.relInstance == null )
            mySQLDrv.relInstance  = mysqlDrvInstanceRelease;
        if( mySQLDrv.getItem == null )
            mySQLDrv.getItem  = mysqlDrvItemGet;
        if( mySQLDrv.setItem == null )
            mySQLDrv.setItem = mysqlDrvItemSet;

        mySQLDrv.listAddItemFnc    = null;
        mySQLDrv.listDelItemFnc    = null;
        mySQLDrv.listGetterFnc     = null;
        mySQLDrv.listSetterFnc     = null;


        if( mySQLDrv.Storages[ storageURL ] == null )
        {
            mySQLDrv.lastStorageURL = storageURL;
	        mu.debug( 'Storage -> connecting to MySQL : ' + storageURL );
            mySQLDrv.Storages[ storageURL ] = mu.mysql.createPool( storageURL );
            mySQLDrv.Storages[ storageURL ].lastTransactionID = { };
            mySQLDrv.Storages[ storageURL ].transactionsCursor = { };
            //this will allow synchronization to happen
	        mySQLDrv.Storages[ storageURL ].lastState = { };
			//this will allow a locking mechanism to allowed handling of unwanted async disconnect
	        mySQLDrv.Storages[ storageURL ].keepAliveFlag = true;
	        mySQLDrv.Storages[ storageURL ].curRetries = 0;
	        mySQLDrv.Storages[ storageURL ].maxRetries = 0;
	        mySQLDrv.Storages[ storageURL ].readPool = null;

	        if( mySQLDrv.relConnection == null )
		        mySQLDrv.Storages[ storageURL ].relConnection = function( ){
			        mysqlDrvDisconnect( mySQLDrv.Storages[ storageURL ] );
		        };

	        if( mySQLDrv.keepAlive == null )
		        mySQLDrv.Storages[ storageURL ].keepAlive = function( maxRetries )
		            {
			            if( maxRetries ) mySQLDrv.Storages[ storageURL ].maxRetries = maxRetries;

			            mySQLDrv.Storages[ storageURL ].keepAliveFlag = true;
		            };

	        if( mySQLDrv.freeToDie == null )
		        mySQLDrv.Storages[ storageURL ].freeToDie = function( )
		            {
			            mySQLDrv.Storages[ storageURL ].maxRetries = 0;
			            mySQLDrv.Storages[ storageURL ].keepAliveFlag = false;
		            };

	        //we wait at least 1 second to let anybody kill us (this avoid race condition with asynchronous code
	        setTimeout( function( ){ mySQLDrv.Storages[ storageURL ].freeToDie( ) }, 1000 );
        }

	    if( mySQLDrv.Storages[ storageURL ].readPool == null &&
	        params &&
	        params.readPoolLogin )
	    {
		    var     readPoolStorageURL= 'mysql://' +
		                                params.readPoolLogin +
		                                ( params.readPoolPassword != null ? ':' + params.readPoolPassword : '' ) +
		                                '@' +
		                                ( params.readPoolStoragePathOrURI == null ?
		                                  ( storagePathOrURI == null ? 'localhost' : storagePathOrURI ) :
		                                  params.readPoolStoragePathOrURI );

		    mySQLDrv.Storages[ storageURL ].readPool = mu.mysql.createPool( readPoolStorageURL );
	    }

        return mySQLDrv;
    };

	exports.waitForTransactionOnObjectToFinish = function( objectStorageObject, prototypeURN, callbackToCallWhenFinished, callBackParams )
	{
		var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];

		if( storageContent.transactionsCursor[ prototypeURN ] &&
		    storageContent.transactionsCursor[ prototypeURN ] < storageContent.lastTransactionID[ prototypeURN ] )
			//the object has a modification happening, we wait for next tick to retry
			process.nextTick( function( ){  exports.waitForTransactionOnObjectToFinish
											(
												objectStorageObject,
												prototypeURN,
												callbackToCallWhenFinished,
												callBackParams
											); } );

		else
			callbackToCallWhenFinished( callBackParams );
	};

	function mysqlDrvDisconnect( storageContent )
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
			storageContent.end( );

			if( storageContent.readPool )
				storageContent.readPool.end( );
		}
		else//we must wait for the next IO event queue to be emptied to try again
			mu.timers.setImmediate( function( )
			              {
				              mysqlDrvDisconnect( storageContent );
			              } );
	}

    function mysqlDrvAddTransaction( storageContent, objectOrPropertyURN )
    {
        if( !storageContent.transactionsCursor[ objectOrPropertyURN ] )
        {
            storageContent.lastTransactionID[ objectOrPropertyURN ] = 0;
            storageContent.transactionsCursor[ objectOrPropertyURN ] = 0;
        }
        else if( !storageContent.lastTransactionID[ objectOrPropertyURN ] )
            mu.error( 'mysql driver : we have a transaction cursor withtout a last transactionID' );

        else
            storageContent.lastTransactionID[ objectOrPropertyURN ]++;

        return storageContent.lastTransactionID[ objectOrPropertyURN ];
    }

    function mysqlDrvDelTransaction( storageContent, objectOrPropertyURN, transactionID )
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

	function mysqlDrvRetryOnError( objectStorageObject, objectOrPropertyURN, fnToCallAfterPoolRetrieval, transactionID,
	                               errorMessage, connectionError )
	{
		var curStorage = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];

		if( curStorage.curRetries > curStorage.maxRetries )
			return mu.error( errorMessage + ' - max retry done : ' + connectionError );

		else
		{
			//if we didn't specify infinite retries
			if( curStorage.maxRetries != 0 )
				curStorage.curRetries++;

			mu.warn( errorMessage + ' - retry n°' + curStorage.curRetries + ' because of : ' + connectionError );
			mu.timers.setImmediate( function( )
			              {
				              mysqlDrvGetPoolConnectionAndCall
				              (
					              objectStorageObject,
					              objectOrPropertyURN,
					              fnToCallAfterPoolRetrieval,
					              transactionID
				              );
			              } );
		}
	}

    function mysqlDrvGetPoolConnectionAndCall( objectStorageObject, objectOrPropertyURN, fnToCallAfterPoolRetrieval, transactionID )
    {
	    var poolToUse = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];

	    if( poolToUse.readPool &&
	        ( fnToCallAfterPoolRetrieval == mysqlDrvGetPropertyValue ) )
	    	poolToUse = poolToUse.readPool;

        poolToUse.getConnection( function( connectionError, connectionFromPool )
        {
	        if( connectionError )
	        {
		        mu.error
			    (
				    'mysql driver connection problem : '+ connectionError +
				    ' - detail : ' + objectStorageObject.storagePathOrURI + ' ' +
			        mu.dump( objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ] )
			    );
		        mu.timers.setImmediate( function( )
		                                {
			                                mysqlDrvGetPoolConnectionAndCall
			                                (
				                                objectStorageObject,
				                                objectOrPropertyURN,
				                                fnToCallAfterPoolRetrieval,
				                                null
			                                );
		                                } );
		        return;
	        }

            var prototypeURN = objectOrPropertyURN.split( ':' )[ 0 ];

            var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
            var currentTransactionID = transactionID;

            if( transactionID == null &&
                fnToCallAfterPoolRetrieval != mysqlDrvPrototypeAdd )
                //this is a new transaction, we create a transaction ID
                currentTransactionID = mysqlDrvAddTransaction( storageContent, objectOrPropertyURN );

            if( fnToCallAfterPoolRetrieval == mysqlDrvPrototypeAdd )
                //we want to create the table, proceed, this is a the first transaction
                mysqlDrvPrototypeAdd
                (
                    objectStorageObject,
                    objectOrPropertyURN,
                    connectionFromPool,
                    mysqlDrvAddTransaction( storageContent, prototypeURN )
                );

            else if( ( storageContent.transactionsCursor[ prototypeURN ] &&
                       storageContent.transactionsCursor[ prototypeURN ] < storageContent.lastTransactionID[ prototypeURN ] ) ||
                     currentTransactionID != storageContent.transactionsCursor[ objectOrPropertyURN ] )
            {//the object has a meta modification happening, or this is not our transaction ID's turn
                //we release the pool and wait for next tick to retry
                connectionFromPool.release( );
                process.nextTick( function( )
                {
                    mysqlDrvGetPoolConnectionAndCall(   objectStorageObject,
                                                        objectOrPropertyURN,
                                                        fnToCallAfterPoolRetrieval,
                                                        currentTransactionID );
                } );
            }
            else
                fnToCallAfterPoolRetrieval( objectStorageObject,
                                            objectOrPropertyURN,
                                            connectionFromPool,
                                            currentTransactionID );
        } );
    }


    function mysqlDrvInstanceInit( objectStorageObject, prototypeURN, objectToOwn )
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

        storageContent.lastState[ objectURNToAdd ] = objectToOwn;

	    if( !storageContent.lastTransactionID[ prototypeURN ] )
            //no database table is present for this prototype
            mysqlDrvGetPoolConnectionAndCall( objectStorageObject, objectURNToAdd, mysqlDrvPrototypeAdd );

	    mu.debug( 'INSERTING a new object with URN' + objectURNToAdd );
        mysqlDrvGetPoolConnectionAndCall( objectStorageObject, objectURNToAdd, mysqlDrvInstanceAdd );

        return objectToOwn.muUID;
    }

	function mysqlDrvInstanceRelease( objectStorageObject, prototypeURN, objectToDelete, callback )
	{
        mysqlDrvGetPoolConnectionAndCall( objectStorageObject, prototypeURN + ':' + objectToDelete.muUID, mysqlDrvInstanceDel );

		exports.waitForTransactionOnObjectToFinish
		(
			objectStorageObject,
			prototypeURN,
			callback
		);
	}

    function mysqlDrvPrototypeAdd( objectStorageObject, objectURN, connectionFromPool, transactionID )
    {
        var storageContent  = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var objectToSync    = objectURN.split( ':' );
        var prototypeName   = objectToSync[ 0 ];
        var muUID           = objectToSync[ 1 ];

        var createQueryString= 'CREATE TABLE IF NOT EXISTS ' + mu.mysql.escapeId( prototypeName ) +
                                    '( muUID CHAR(36) NOT NULL, PRIMARY KEY( muUID ), ';
        var propertyType    = '';

        var enumerableProperties = Object.keys( storageContent.lastState[ objectURN ] );
        var muUIDisLast = ( enumerableProperties[ enumerableProperties.length - 1 ] == 'muUID' );

        for( var currentPropertyIndex in enumerableProperties )
        {
            if( enumerableProperties[ currentPropertyIndex ] != 'muUID' )
            {
	            propertyType = Object.prototype.toString.call( enumerableProperties[ currentPropertyIndex ] ).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

	            if( propertyType == "string" )
		            createQueryString += enumerableProperties[ currentPropertyIndex ] + ' TEXT CHARACTER SET utf8 COLLATE utf8_general_ci';

	            else if( propertyType == "number" )
		            createQueryString += enumerableProperties[ currentPropertyIndex ] + ' INTEGER';

	            else if( propertyType == "boolean" )
		            createQueryString += enumerableProperties[ currentPropertyIndex ] + ' BIT';

	            else if( propertyType == "object" )
		            createQueryString += enumerableProperties[ currentPropertyIndex ] + ' INTEGER';

	            if( muUIDisLast && currentPropertyIndex != ( enumerableProperties.length - 2 ) ||
	                ( !muUIDisLast && currentPropertyIndex != ( enumerableProperties.length - 1 ) ) )
		            createQueryString += ', ';
            }
        }

	    createQueryString += ' );';
        connectionFromPool.query
        (
	        createQueryString,
            function( queryError, queryRows )
            {
                if( queryError )
                {
                    //TODO : in case of an error during the creation phase we need to retry and make all pending transaction wait for success
                    //for now we go to the next transaction
                    mysqlDrvDelTransaction( storageContent, objectURN, transactionID );
                    connectionFromPool.release( );

                    return mu.error( 'mysql driver says : query has an error : ' + queryError + ' query : ' + createQueryString );
                }
                mysqlDrvDelTransaction( storageContent, objectURN, transactionID );

                mu.debug( 'mysql driver created the table for the object ' + prototypeName );
                connectionFromPool.release( );
            }
        );
    }

    function mysqlDrvInstanceAdd( objectStorageObject, objectURN, connectionFromPool, transactionID )
    {
        var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var objectToSync = objectURN.split( ':' );
        var prototypeName = objectToSync[ 0 ];
        var muUID = objectToSync[ 1 ];

        var insertString = 'INSERT INTO ' + mu.mysql.escapeId( prototypeName ) +
                           ' SET muUID=' + "'" + muUID + "'" + ',?';


	    if( !muUID )
		    mu.error( 'muUID is undefined in query ' + insertString );

        //if( !storageContent.lastTransactionID[ prototypeName ] ||
        //    storageContent.lastTransactionID[ prototypeName ] == 0 )
            //the table has not been created yet or the table is BEING created ! we loop until the nextProcessTick
        //    process.nextTick( function( ){ return mysqlDrvInstanceAdd( objectStorageObject, objectURN, connectionFromPool ); } );

        connectionFromPool.query
        (   insertString,
            storageContent.lastState[ objectURN ],
            function( queryError, queryRows )
            {
                if( queryError ) mu.warn( 'mysql driver says : insert query has a problem : ' + queryError );

                mysqlDrvDelTransaction( storageContent, objectURN, transactionID );

                mu.debug( 'mysql driver insert the object with muUID' + muUID +
                          ' into the table for the objects type : ' + prototypeName );
                // And done with the connection.
                connectionFromPool.release( );
            }
        );
    }


    function mysqlDrvInstanceDel( objectStorageObject, objectURN, connectionFromPool, transactionID )
    {
	    var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
	    var objectToSync = objectURN.split( ':' );
	    var prototypeName = objectToSync[ 0 ];
	    var muUID = objectToSync[ 1 ];

	    var deleteString = 'DELETE FROM ' + mu.mysql.escapeId( prototypeName ) + ' WHERE muUID = ' + "'" + muUID + "'";

	    //if( !storageContent.lastTransactionID[ prototypeName ] ||
	    //    storageContent.lastTransactionID[ prototypeName ] == 0 )
	    //the table has not been created yet or the table is BEING created ! we loop until the nextProcessTick
	    //    process.nextTick( function( ){ return mysqlDrvInstanceAdd( objectStorageObject, objectURN, connectionFromPool ); } );

	    connectionFromPool.query
	    (   deleteString,
	        function( queryError, queryRows )
	        {
		        if( queryError ) mu.warn( 'mysql driver says : delete query has a problem ' + queryError );

		        mysqlDrvDelTransaction( storageContent, objectURN, transactionID );

		        mu.debug( 'mysql driver deleted the object with muUID' + muUID +
		                  ' into the table for the objects type : ' + prototypeName );
		        // And done with the connection.
		        connectionFromPool.release( );

		        delete storageContent.lastState[ objectURN ];
	        }
	    );
    }

    function mysqlDrvItemGet( objectStorageObject, propertyURN )
    {   // we trigger the select query transaction, return the value that we have right now in memory,
        // the transaction will synchronise with any modification in the BD later, this basically is THE synchronisation mechanism

        mysqlDrvGetPoolConnectionAndCall( objectStorageObject, propertyURN, mysqlDrvGetPropertyValue );

        return objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ];
    }

    function mysqlDrvGetPropertyValue( objectStorageObject, propertyURN, connectionFromPool, transactionID )
    {
        mysqlDrvSyncProperty( objectStorageObject, propertyURN, connectionFromPool, transactionID, false );
    }

    function mysqlDrvApplyGet( objectStorageObject, propertyURN, valueToSet )
    {
        objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ] = valueToSet;
    }

    function mysqlDrvSyncProperty( objectStorageObject, propertyURN, connectionFromPool, transactionID, isUpdate )
    {
        var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var propertyToSync = propertyURN.split( ':' );
        var prototypeName = propertyToSync[ 0 ];
        var muUID = propertyToSync[ 1 ];
        var propertyName = propertyToSync[ 2 ];
        var muUIDTransactionIndex = 0;

        var queryString = '';
        var fnToApplyResultTo = null;


        if( isUpdate )
            queryString = 'UPDATE ' + prototypeName +
                           ' SET ' + propertyName + '=' + mu.mysql.escape( storageContent.lastState[ propertyURN ] ) +
                           ' WHERE muUID = ' + "'" + muUID + "'";
        else
        {
            fnToApplyResultTo = mysqlDrvApplyGet;
            queryString = 'SELECT ' + propertyName +
                          ' FROM ' + prototypeName +
                          ' WHERE muUID = ' + "'" + muUID + "'";
        }

	    if( !muUID )
		    mu.error( 'muUID is undefined in query ' + queryString );


        connectionFromPool.query
        (   queryString,
            function( queryError, queryRows )
            {
                if( queryError ) mu.warn( 'mysql driver says : select query has a problem' + queryError + ' - with query : ' + queryString );

                mysqlDrvDelTransaction( storageContent, propertyURN, transactionID );

                if( queryRows && queryRows.length == 0 &&
                    queryRows[ 0 ] &&
                    fnToApplyResultTo )
                    fnToApplyResultTo( objectStorageObject, propertyURN, queryRows[ 0 ][ propertyName ] );

                mu.debug( 'mysql driver has refresh the value ' +
                          ' of property ' + propertyName +
                          ' for the object with muUID=' + muUID +
                          ' from the table ' + prototypeName + ' in memory with value ' +
                          storageContent.lastState[ propertyURN ] );

                // And done with the connection.
                connectionFromPool.release( );
            }
        );
    }

	function mysqlDrvItemSet( objectStorageObject, propertyURN, newVal )
	{   // we trigger the select query transaction, return the value that we have right now in memory,
		// the transaction will synchronise with any modification in the BD later, this basically is THE synchronisation mechanism

		objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ] = newVal;

		mysqlDrvGetPoolConnectionAndCall( objectStorageObject, propertyURN, mysqlDrvSetPropertyValue );
	}

    function mysqlDrvSetPropertyValue( objectStorageObject, propertyURN, connectionFromPool, transactionID )
    {
        mysqlDrvSyncProperty( objectStorageObject, propertyURN, connectionFromPool, transactionID, true );
    }



    return exports;
} ) ( typeof exports === 'undefined' ? this[ 'mu' ][ 'Drv.mysql' ] = { } : exports );