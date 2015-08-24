/**
 * User: bruno
 * Date: 2014-03-08
 *
 * redis muStorage driver is the driver for Redis key-value store
 *
 * the driver is dependant on node-redis (https://github.com/mranney/node_redis/) so you should have installed it first
 * npm install redis
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../../../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


// includes
mu.require( 'url' );
mu.require( 'timers' );
mu.require( 'redis' );

( function ( exports )
{
    //for redis, these will be servers access (server + account credentials)
    exports.Storages        = { };
    exports.prepare         = function( storagePathOrURI, userLogin, userPassword, params )
    {
        var     mySQLDrv        = this;
        var     storageURL      = ( storagePathOrURI.indexOf( 'redis://' ) != -1 ? storagePathOrURI :
            ( 'redis://' +
                ( userLogin != null ? userLogin : '' ) +
                ( userPassword != null ? ':' + userPassword : '' ) +
                ( userLogin != null ? '@' : '' ) +
                ( storagePathOrURI == null ? 'localhost' : storagePathOrURI ) ) );

        if( !mu.support_redis )
        {
            mu.error( 'No Redis driver present - skipping ' + storageURL );
            return;
        }

        mySQLDrv.driverName = "redis";
        mySQLDrv.enginePath = ( mu.runinbrowser ? 'muDrv.redis.js' : __filename );

        if( mySQLDrv.ownInstance == null )
            mySQLDrv.ownInstance = redisDrvInstanceInit;
        if( mySQLDrv.relInstance == null )
            mySQLDrv.relInstance  = redisDrvInstanceRelease;
        if( mySQLDrv.getItem == null )
            mySQLDrv.getItem  = redisDrvItemGet;
        if( mySQLDrv.setItem == null )
            mySQLDrv.setItem = redisDrvItemSet;

        mySQLDrv.listAddItemFnc    = null;
        mySQLDrv.listDelItemFnc    = null;
        mySQLDrv.listGetterFnc     = null;
        mySQLDrv.listSetterFnc     = null;


        if( mySQLDrv.Storages[ storageURL ] == null )
        {
            var redisURL = mu.url.parse( storageURL );

            mySQLDrv.lastStorageURL = storageURL;
            mu.debug( 'Storage -> connecting to Redis : ' + storageURL );
            mySQLDrv.Storages[ storageURL ] = mu.redis.createClient( redisURL.port, redisURL.host );
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
                    redisDrvDisconnect( mySQLDrv.Storages[ storageURL ] );
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
            var     redisReadURL = mu.url.parse( params.readPoolStoragePathOrURI );
            var     readPoolStorageURL= 'redis://' +
                params.readPoolLogin +
                ( params.readPoolPassword != null ? ':' + params.readPoolPassword : '' ) +
                '@' +
                ( params.readPoolStoragePathOrURI == null ?
                    ( storagePathOrURI == null ? 'localhost' : storagePathOrURI ) :
                    params.readPoolStoragePathOrURI );

            mySQLDrv.Storages[ storageURL ].readPool = mu.redis.createClient( redisReadURL.port, redisReadURL.host );
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

    function redisDrvDisconnect( storageContent )
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
            storageContent.quit( );

            if( storageContent.readPool )
                storageContent.readPool.quit( );
        }
        else//we must wait for the next IO event queue to be emptied to try again
            mu.timers.setImmediate( function( )
            {
                redisDrvDisconnect( storageContent );
            } );
    }

    function redisDrvAddTransaction( storageContent, objectOrPropertyURN )
    {
        if( !storageContent.transactionsCursor[ objectOrPropertyURN ] )
        {
            storageContent.lastTransactionID[ objectOrPropertyURN ] = 0;
            storageContent.transactionsCursor[ objectOrPropertyURN ] = 0;
        }
        else if( !storageContent.lastTransactionID[ objectOrPropertyURN ] )
            mu.error( 'redis driver : we have a transaction cursor without a last transactionID' );

        else
            storageContent.lastTransactionID[ objectOrPropertyURN ]++;

        return storageContent.lastTransactionID[ objectOrPropertyURN ];
    }

    function redisDrvDelTransaction( storageContent, objectOrPropertyURN, transactionID )
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


    function redisDrvGetClientAndCall( objectStorageObject, objectOrPropertyURN, fnToCallAfterPoolRetrieval, transactionID )
    {
        var clientToUse = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];

        if( clientToUse.readPool &&
            ( fnToCallAfterPoolRetrieval == redisDrvGetPropertyValue ) )
            clientToUse = clientToUse.readPool;


        var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var currentTransactionID = transactionID;

        if( transactionID == null )
            //this is a new transaction, we create a transaction ID
            currentTransactionID = redisDrvAddTransaction( storageContent, objectOrPropertyURN );

        fnToCallAfterPoolRetrieval
        (
            objectStorageObject,
            objectOrPropertyURN,
            currentTransactionID
        );
    }


    function redisDrvInstanceInit( objectStorageObject, prototypeURN, objectToOwn )
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

        mu.debug( 'SETTING a new object with URN' + objectURNToAdd );
        redisDrvGetClientAndCall( objectStorageObject, objectURNToAdd, redisDrvInstanceAdd );

        return objectToOwn.muUID;
    }

    function redisDrvInstanceRelease( objectStorageObject, prototypeURN, objectToDelete, callback )
    {
        redisDrvGetClientAndCall( objectStorageObject, prototypeURN + ':' + objectToDelete.muUID, redisDrvInstanceDel );

        exports.waitForTransactionOnObjectToFinish
            (
                objectStorageObject,
                prototypeURN,
                callback
            );
    }


    function redisDrvInstanceAdd( objectStorageObject, objectURN, transactionID )
    {
        var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];

        storageContent.hmset
        (   objectURN,
            storageContent.lastState[ objectURN ],
            function( commandError, commandRes )
            {
                if( commandError ) mu.warn( 'redis driver says : hmset command has a problem : ' + commandError );

                redisDrvDelTransaction( storageContent, objectURN, transactionID );
                mu.debug( 'redis driver hmset the object with hash ' + objectURN );
            }
        );
    }


    function redisDrvInstanceDel( objectStorageObject, objectURN, connectionFromPool, transactionID )
    {
        var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];

        storageContent.del
        (   objectURN,
            function( commandError, commandRes )
            {
                if( commandError ) mu.warn( 'redis driver says : del command has a problem ' + commandError );

                redisDrvDelTransaction( storageContent, objectURN, transactionID );
                mu.debug( 'redis driver del the object with hash ' + objectURN );

                delete storageContent.lastState[ objectURN ];
            }
        );
    }

    function redisDrvItemGet( objectStorageObject, propertyURN )
    {   // we trigger the select query transaction, return the value that we have right now in memory,
        // the transaction will synchronise with any modification in the BD later, this basically is THE synchronisation mechanism

        redisDrvGetClientAndCall( objectStorageObject, propertyURN, redisDrvGetPropertyValue );

        return objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ];
    }

    function redisDrvGetPropertyValue( objectStorageObject, propertyURN, transactionID )
    {
        var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var propertyToSync = propertyURN.split( ':' );
        var prototypeName = propertyToSync[ 0 ];
        var muUID = propertyToSync[ 1 ];
        var propertyName = propertyToSync[ 2 ];

        var objectURN = prototypeName + ':' + muUID;

        storageContent.hget
        (   objectURN,
            propertyName,
            function( commandError, commandRes )
            {
                if( commandError ) mu.warn( 'redis driver says : hget command has a problem' + commandError );

                redisDrvDelTransaction( storageContent, propertyURN, transactionID );

                if( commandRes )
                    redisDrvApplyGet( objectStorageObject, propertyURN, commandRes );

                mu.debug( 'redis driver has send get command for the hash ' + objectURN +
                            ' for property ' + propertyName +
                            ' in memory with value ' + commandRes );
            }
        );
    }

    function redisDrvApplyGet( objectStorageObject, propertyURN, valueToSet )
    {
        var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];

        var realValue = valueToSet;

        //as redis only store strings, we have to get back our original datatype...
        var propertyToSync = propertyURN.split( ':' );
        var prototypeName = propertyToSync[ 0 ];
        var muUID = propertyToSync[ 1 ];
        var propertyName = propertyToSync[ 2 ];
        var objectInstance = objectStorageObject.objectInstances[ prototypeName ][ muUID ];

        if( objectInstance &&
            typeof objectInstance[ propertyName ] == "number" )
        {
            var objectNumeric = valueToSet;
            if( isNaN( parseFloat( objectNumeric ) ) ||
                !isFinite( objectNumeric ) )
            {
                mu.error( defaultValue + ' is not a valid numeric default value.' )
                return null;
            }
            realValue = parseInt( objectNumeric );
        }

        storageContent.lastState[ propertyURN ] = realValue;
    }


    function redisDrvItemSet( objectStorageObject, propertyURN, newVal )
    {   // we trigger the select query transaction, return the value that we have right now in memory,
        // the transaction will synchronise with any modification in the BD later, this basically is THE synchronisation mechanism
        objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ] = newVal;

        redisDrvGetClientAndCall( objectStorageObject, propertyURN, redisDrvSetPropertyValue );
    }

    function redisDrvSetPropertyValue( objectStorageObject, propertyURN, transactionID )
    {
        var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var propertyToSync = propertyURN.split( ':' );
        var prototypeName = propertyToSync[ 0 ];
        var muUID = propertyToSync[ 1 ];
        var propertyName = propertyToSync[ 2 ];

        var objectURN = prototypeName + ':' + muUID;

        storageContent.hset
        (   objectURN,
            propertyName,
            storageContent.lastState[ propertyURN ],
            function( commandError, commandRes )
            {
                if( commandError ) mu.warn( 'redis driver says : hset command has a problem' + commandError );

                redisDrvDelTransaction( storageContent, propertyURN, transactionID );

                mu.debug( 'redis driver has send command set for the hash' + objectURN +
                            ' for property ' + propertyName +
                            ' in memory with value ' + storageContent.lastState[ propertyURN ] );
            }
        );
    }



    return exports;
} ) ( typeof exports === 'undefined' ? this[ 'mu' ][ 'Drv.redis' ] = { } : exports );