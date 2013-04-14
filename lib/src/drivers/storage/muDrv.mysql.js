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
mu.require( 'events' );
mu.require( '../dep/node_modules/mysql' );

( function ( exports )
{
    //for mysql, these will be servers access (server + account credentials)
    exports.Storages        = [ ];
    exports.prepare         = function( storagePathOrURI, userLogin, userPassword, params )
    {
        var     mySQLDrv        = this;
        var     storageURL      = 'mysql://' +
                                 ( userLogin != null ? userLogin : '' ) +
                                 ( userPassword != null ? ':' + userPassword : '' ) +
                                 ( userLogin != null ? '@' : '' ) +
                                 ( storagePathOrURI == null ? 'localhost' : storagePathOrURI );

        if( mySQLDrv.ownInstance == null )
            mySQLDrv.ownInstance = mysqlDrvItemInit;
        if( mySQLDrv.relInstance == null )
            mySQLDrv.relInstance  = mysqlDrvItemDel;
        if( mySQLDrv.getItem == null )
            mySQLDrv.getItem  = mysqlDrvGetterFnc;
        if( mySQLDrv.setItem == null )
            mySQLDrv.setItem = mysqlDrvSetterFnc;

        mySQLDrv.listAddItemFnc    = null;
        mySQLDrv.listDelItemFnc    = null;
        mySQLDrv.listGetterFnc     = null;
        mySQLDrv.listSetterFnc     = null;


        if( mySQLDrv.Storages[ storageURL ] == null )
        {
            mySQLDrv.lastStorageURL = storageURL;
            mySQLDrv.Storages[ storageURL ] = mu.mysql.createPool( storageURL );
            mySQLDrv.Storages[ storageURL ].objectOrPropertyLastTransactionID = { };
            mySQLDrv.Storages[ storageURL ].objectOrPropertyTransactionsCursor = { };
            mySQLDrv.Storages[ storageURL ].lastState = { };
        }
        if( this.lastMuUID != null )
            mySQLDrv.lastMuUID = this.lastMuUID;

        else
            mySQLDrv.lastMuUID = { };

        return mySQLDrv;
    };

    function mysqlDrvAddTransaction( storageContent, objectOrPropertyURN )
    {
        if( !storageContent.objectOrPropertyTransactionsCursor[ objectOrPropertyURN ] )
        {
            storageContent.objectOrPropertyLastTransactionID[ objectOrPropertyURN ] = 0;
            storageContent.objectOrPropertyTransactionsCursor[ objectOrPropertyURN ] = 0;
        }
        else if( !storageContent.objectOrPropertyLastTransactionID[ objectOrPropertyURN ] )
            my.error( 'mysql driver : we have a transaction cursor withtou a last transactionID' );

        else
            storageContent.objectOrPropertyLastTransactionID[ objectOrPropertyURN ]++;

        return storageContent.objectOrPropertyLastTransactionID[ objectOrPropertyURN ];
    }

    function mysqlDrvDelTransaction( storageContent, objectOrPropertyURN, transactionID )
    {
        storageContent.objectOrPropertyTransactionsCursor[ objectOrPropertyURN ]++;

        if( storageContent.objectOrPropertyTransactionsCursor[ objectOrPropertyURN ] > storageContent.objectOrPropertyLastTransactionID[ objectOrPropertyURN ] )
        {
            var prototypeURN = objectOrPropertyURN.split( ':' )[ 0 ];

            if( objectOrPropertyURN != prototypeURN )
            {
                delete storageContent.objectOrPropertyLastTransactionID[ objectOrPropertyURN ];
                delete storageContent.objectOrPropertyTransactionsCursor[ objectOrPropertyURN ];
            }
            else
            {
                storageContent.objectOrPropertyLastTransactionID[ objectOrPropertyURN ] = 0;
                storageContent.objectOrPropertyTransactionsCursor[ objectOrPropertyURN ] = 0;
            }
        }
    }

    function mysqlDrvGetPoolConnectionAndCall( objectStorageObject, objectOrPropertyURN, fnToCallAfterPoolRetrieval, transactionID )
    {
        objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].getConnection( function( connectionError, connectionFromPool )
        {
            if( connectionError ) return mu.error( 'mysql driver connection problem : ' + connectionError );

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

            else if( ( storageContent.objectOrPropertyTransactionsCursor[ prototypeURN ] &&
                       storageContent.objectOrPropertyTransactionsCursor[ prototypeURN ] < storageContent.objectOrPropertyLastTransactionID[ prototypeURN ] ) ||
                     currentTransactionID != storageContent.objectOrPropertyTransactionsCursor[ objectOrPropertyURN ] )
            {//the object has a meta modification happening, or this is not our transaction ID's turn
                //we release the pool and wait for next tick to retry
                connectionFromPool.end( );
                process.nextTick( function( )
                {
                    mysqlDrvGetPoolConnectionAndCall( objectStorageObject, objectOrPropertyURN, fnToCallAfterPoolRetrieval, currentTransactionID );
                } );
            }
            else
                fnToCallAfterPoolRetrieval( objectStorageObject, objectOrPropertyURN, connectionFromPool, currentTransactionID );
        } );
    }


    function mysqlDrvItemInit( objectStorageObject, prototypeURN, objectToOwn )
    {
        var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var driverLastMuIDTable = objectStorageObject.driver.lastMuUID;

        if( driverLastMuIDTable[ prototypeURN ] )
            driverLastMuIDTable[ prototypeURN ]++;

        else
            driverLastMuIDTable[ prototypeURN ] = 1;

        objectToOwn.muUID = driverLastMuIDTable[ prototypeURN ];

        var objectURNToAdd = prototypeURN + ':' + driverLastMuIDTable[ prototypeURN ];

        storageContent.lastState[ objectURNToAdd ] = objectToOwn;

        if( !storageContent.objectOrPropertyLastTransactionID[ prototypeURN ] )
            mysqlDrvGetPoolConnectionAndCall( objectStorageObject, objectURNToAdd, mysqlDrvPrototypeAdd );

        mysqlDrvGetPoolConnectionAndCall( objectStorageObject, objectURNToAdd, mysqlDrvItemAdd );

        return objectToOwn.muUID;
    }

    function mysqlDrvPrototypeAdd( objectStorageObject, objectURN, connectionFromPool, transactionID )
    {
        var storageContent  = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var objectToSync    = objectURN.split( ':' );
        var prototypeName   = objectToSync[ 0 ];
        var muUID           = objectToSync[ 1 ];

        var createQueryString= 'muUID INTEGER UNSIGNED NOT NULL, PRIMARY KEY( muUID ), ';
        var propertyType    = '';

        var enumerableProperties = Object.keys( storageContent.lastState[ objectURN ] );
        var muUIDisLast = ( enumerableProperties[ enumerableProperties.length - 1 ] == 'muUID' );

        for( var currentPropertyIndex in enumerableProperties )
        {
            if( enumerableProperties[ currentPropertyIndex ] == 'muUID' )
                break;

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

        connectionFromPool.query
        (   'CREATE TABLE IF NOT EXISTS ' + mu.mysql.escapeId( prototypeName ) + '( ' + createQueryString + ');',
            function( queryError, queryRows )
            {
                if( queryError )
                {
                    //TODO : in case of an error during the creation phase we need to retry and make all pending transaction wait for success
                    //for now we go to the next transaction
                    mysqlDrvDelTransaction( storageContent, objectURN, transactionID );
                    connectionFromPool.end( );

                    return mu.error( 'mysql driver says : query has an error : ' + queryError + ' query : ' + createQueryString );
                }
                mysqlDrvDelTransaction( storageContent, objectURN, transactionID );

                mu.debug( 'mysql driver created the table for the object ' + prototypeName );
                connectionFromPool.end( );
            }
        );
    }

    function mysqlDrvItemAdd( objectStorageObject, objectURN, connectionFromPool, transactionID )
    {
        var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var objectToSync = objectURN.split( ':' );
        var prototypeName = objectToSync[ 0 ];
        var muUID = objectToSync[ 1 ];

        var insertString = 'INSERT INTO ' + mu.mysql.escapeId( prototypeName ) + ' SET ?';

        //if( !storageContent.objectOrPropertyLastTransactionID[ prototypeName ] ||
        //    storageContent.objectOrPropertyLastTransactionID[ prototypeName ] == 0 )
            //the table has not been created yet or the table is BEING created ! we loop until the nextProcessTick
        //    process.nextTick( function( ){ return mysqlDrvItemAdd( objectStorageObject, objectURN, connectionFromPool ); } );

        connectionFromPool.query
        (   insertString,
            storageContent.lastState[ objectURN ],
            function( queryError, queryRows )
            {
                if( queryError ) mu.warn( 'mysql driver says : insert query has a problem' + queryError );

                mysqlDrvDelTransaction( storageContent, objectURN, transactionID );

                mu.debug( 'mysql driver insert the object with muUID' + muUID +
                          ' into the table for the objects type : ' + prototypeName );
                // And done with the connection.
                connectionFromPool.end( );
            }
        );
    }


    function mysqlDrvItemDel( )
    {// we must return true if we successfully removed the item
        //if( objectStorageObject.driver.lastMuUID[ objectPrototypeName ] != 0 )
        //    objectStorageObject.driver.lastMuUID[ objectPrototypeName ]--;

        return true;
    }

    function mysqlDrvGetterFnc( objectStorageObject, propertyURN )
    {   // we trigger the select query transaction, return the value that we have right now in memory,
        // the transaction will synchronise with any modification in the BD later, this basically is THE synchronisation mechanism

        mysqlDrvGetPoolConnectionAndCall( objectStorageObject, propertyURN, mysqlDrvGetItem );

        return objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ];
    }

    function mysqlDrvGetItem( objectStorageObject, propertyURN, connectionFromPool, transactionID )
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
                           ' WHERE muUID = ' + muUID;
        else
        {
            fnToApplyResultTo = mysqlDrvApplyGet;
            queryString = 'SELECT ' + propertyName +
                          ' FROM ' + prototypeName +
                          ' WHERE muUID = ' + muUID;
        }

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
                          'of property ' + propertyName +
                          'for the object with muUID' + muUID +
                          ' from the table ' + prototypeName + ' in memory' );

                // And done with the connection.
                connectionFromPool.end( );
            }
        );
    }


    function mysqlDrvSetItem( objectStorageObject, propertyURN, connectionFromPool, transactionID )
    {
        mysqlDrvSyncProperty( objectStorageObject, propertyURN, connectionFromPool, transactionID, true );
    }

    function mysqlDrvSetterFnc( objectStorageObject, propertyURN, newVal )
    {   // we trigger the select query transaction, return the value that we have right now in memory,
        // the transaction will synchronise with any modification in the BD later, this basically is THE synchronisation mechanism

        objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ] = newVal;

        mysqlDrvGetPoolConnectionAndCall( objectStorageObject, propertyURN, mysqlDrvSetItem );
    }


    return exports;
} )( typeof exports === 'undefined' ? { } : exports );