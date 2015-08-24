/**
 * Created by bruno on 11/17/2013.
 *
 * MongoDB muStorage driver is the driver for MongoDB NoSQL database
 *
 * the driver is dependant on node-mongodb so you should have installed it first
 * npm install mongodb
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../../../src/mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );
//TODO BROKEN, has to be redone

// includes
mu.require( 'timers' );
mu.require( 'url' );
mu.require( 'mongodb' );


( function ( exports )
{
    //for mongodb, these will be servers access (server + account credentials)
    exports.Storages        = { };
    exports.prepare         = function( storagePathOrURI, userLogin, userPassword, params )
    {
        var     mongoDBDrv      = this;
        var     storageURL      = ( storagePathOrURI.indexOf( 'mongodb://' ) != -1 ? storagePathOrURI :
            ( 'mongodb://' +
                ( userLogin != null ? userLogin : '' ) +
                ( userPassword != null ? ':' + userPassword : '' ) +
                ( userLogin != null ? '@' : '' ) +
                ( storagePathOrURI == null ? 'localhost' : storagePathOrURI ) ) );

        mongoDBDrv.driverName = "mongodb";
        mongoDBDrv.enginePath = ( mu.runinbrowser ? 'muDrv.mongo.js' : __filename );

        if( mongoDBDrv.ownInstance == null )
            mongoDBDrv.ownInstance = mongodbDrvInstanceInit;
        if( mongoDBDrv.relInstance == null )
            mongoDBDrv.relInstance  = mongodbDrvInstanceRelease;
        if( mongoDBDrv.getItem == null )
            mongoDBDrv.getItem  = mongodbDrvItemGet;
        if( mongoDBDrv.setItem == null )
            mongoDBDrv.setItem = mongodbDrvItemSet;

        mongoDBDrv.listAddItemFnc    = null;
        mongoDBDrv.listDelItemFnc    = null;
        mongoDBDrv.listGetterFnc     = null;
        mongoDBDrv.listSetterFnc     = null;


        if( mongoDBDrv.Storages[ storageURL ] == null )
        {
            var serverURL = mu.url.parse( storageURL );
            serverURL.port = serverURL.port != null ? serverURL.port : 27017;
            var dbName  = serverURL.path.substring( 1 );

            mongoDBDrv.lastStorageURL = storageURL;
            mu.debug( 'Storage -> connecting to MongoDB : ' + storageURL );
            mongoDBDrv.Storages[ storageURL ] = new mu.mongodb.Db( dbName, new mu.mongodb.Server( serverURL.host, serverURL.port, { safe : false/*, auto_reconnect: true */ } ) );
            mongoDBDrv.Storages[ storageURL ].open( function( openErr, openDB )
                {
                    if( openErr )
                    {
                        mu.error( 'mongodb driver : unable to open db' + openDB );
                        delete mongoDBDrv.Storages[ storageURL ];
                    }
                } );

            mongoDBDrv.Storages[ storageURL ].lastTransactionID = { };
            mongoDBDrv.Storages[ storageURL ].transactionsCursor = { };
            //this will allow synchronization to happen
            mongoDBDrv.Storages[ storageURL ].lastState = { };
            //this will allow a locking mechanism to allowed handling of unwanted async disconnect
            mongoDBDrv.Storages[ storageURL ].curRetries = 0;
            mongoDBDrv.Storages[ storageURL ].readPool = null;


            if( mongoDBDrv.relConnection == null )
                mongoDBDrv.Storages[ storageURL ].relConnection = function( ){
                    //mongodbDrvDisconnect( mongoDBDrv.Storages[ storageURL ] );
                };


            if( mongoDBDrv.keepAlive == null )
                mongoDBDrv.Storages[ storageURL ].keepAlive = function( maxRetries ){};

            if( mongoDBDrv.freeToDie == null )
                mongoDBDrv.Storages[ storageURL ].freeToDie = function( ){ };

        }

        if( mongoDBDrv.Storages[ storageURL ].readPool == null &&
            params &&
            params.readPoolLogin )
        {
            var     readPoolStorageURL= 'mongodb://' +
                params.readPoolLogin +
                ( params.readPoolPassword != null ? ':' + params.readPoolPassword : '' ) +
                '@' +
                ( params.readPoolStoragePathOrURI == null ?
                    ( storagePathOrURI == null ? 'localhost' : storagePathOrURI ) :
                    params.readPoolStoragePathOrURI );

            var readServerURL = mu.url.parse( readPoolStorageURL );
            readServerURL.port = readServerURL.port != null ? readServerURL.port : 27017;

            mongoDBDrv.Storages[ storageURL ].readPool = new mu.mongodb.Db( readServerURL.path.substring( 1 ), new mu.mongodb.Server( readServerURL.host, readServerURL.port, { safe:true/*, auto_reconnect: true*/ } ) );
            mongoDBDrv.Storages[ storageURL ].readPool.open( function( openErr, openDB ){ if( openErr ) mu.error( 'mongodb driver : unable to open read db' + openDB ); } );
        }

        return mongoDBDrv;
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
/*
    function mongodbDrvDisconnect( storageContent )
    {
        //we have to make sure we HAD a connection already
        if( storageContent.openCalled == false )
        {
            mu.timers.setImmediate( function( )
            {//we call ourselves back and try again
                mongodbDrvDisconnect( storageContent );
            } );
            return;
        }

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

        if( noTransactionLeft )
        {
            storageContent.close( true );

            if( storageContent.readPool )
                storageContent.readPool.close( true );
        }
        else//we must wait for the next IO event queue to be emptied to try again
            mu.timers.setImmediate( function( )
            { mongodbDrvDisconnect( storageContent ); } );
    }
*/
    function mongodbDrvAddTransaction( storageContent, objectOrPropertyURN )
    {
        if( !storageContent.transactionsCursor[ objectOrPropertyURN ] )
        {
            storageContent.lastTransactionID[ objectOrPropertyURN ] = 0;
            storageContent.transactionsCursor[ objectOrPropertyURN ] = 0;
        }
        else if( !storageContent.lastTransactionID[ objectOrPropertyURN ] )
            mu.error( 'mongodb driver : we have a transaction cursor withtout a last transactionID' );

        else
            storageContent.lastTransactionID[ objectOrPropertyURN ]++;

        return storageContent.lastTransactionID[ objectOrPropertyURN ];
    }

    function mongodbDrvDelTransaction( storageContent, objectOrPropertyURN, transactionID )
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


    function mongodbDrvGetPoolConnectionAndCall( objectStorageObject, objectOrPropertyURN, fnToCallAfterPoolRetrieval, transactionID )
    {
        var poolToUse = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];

        if( poolToUse.readPool &&
            ( fnToCallAfterPoolRetrieval == mongodbDrvGetPropertyValue ) )
            poolToUse = poolToUse.readPool;

        if( poolToUse )
        {
            if( poolToUse.openCalled == null )
            {//our socket is not ready
                mu.debug( 'mongodb driver connection not ready : '+ objectStorageObject.storagePathOrURI );
                //mu.timers.setImmediate( function( )
                process.nextTick( function( )
                {
                    mongodbDrvGetPoolConnectionAndCall
                    (
                        objectStorageObject,
                        objectOrPropertyURN,
                        fnToCallAfterPoolRetrieval,
                        currentTransactionID );
                } );
                return;
            }

            var prototypeURN = objectOrPropertyURN.split( ':' )[ 0 ];

            var storageContent = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
            var currentTransactionID = transactionID;

            if( transactionID == null &&
                fnToCallAfterPoolRetrieval != mongodbDrvPrototypeAdd )
                //this is a new transaction, we create a transaction ID
                currentTransactionID = mongodbDrvAddTransaction( storageContent, objectOrPropertyURN );

            if( fnToCallAfterPoolRetrieval == mongodbDrvPrototypeAdd )
                //we want to create the table, proceed, this is a the first transaction
                mongodbDrvPrototypeAdd
                (
                    objectStorageObject,
                    objectOrPropertyURN,
                    poolToUse,
                    mongodbDrvAddTransaction( storageContent, prototypeURN )
                );

            else if( (  storageContent.transactionsCursor[ prototypeURN ] &&
                        storageContent.transactionsCursor[ prototypeURN ] < storageContent.lastTransactionID[ prototypeURN ] ) ||
                    currentTransactionID != storageContent.transactionsCursor[ objectOrPropertyURN ] )
            {//the object has a meta modification happening, or this is not our transaction ID's turn
                //we release the pool and wait for next tick to retry
                process.nextTick( function( )
                {
                    mongodbDrvGetPoolConnectionAndCall
                    (
                        objectStorageObject,
                        objectOrPropertyURN,
                        fnToCallAfterPoolRetrieval,
                        currentTransactionID );
                } );
            }
            else
                fnToCallAfterPoolRetrieval
                (
                    objectStorageObject,
                    objectOrPropertyURN,
                    poolToUse,
                    currentTransactionID
                );
        }
    }


    function mongodbDrvInstanceInit( objectStorageObject, prototypeURN, objectToOwn )
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

        if( storageContent.collectionNames( prototypeURN, { strict:true } ) == null )
            //no collection is present for this prototype
            mongodbDrvGetPoolConnectionAndCall( objectStorageObject, objectURNToAdd, mongodbDrvPrototypeAdd );

        mu.debug( 'INSERTING a new object with URN' + objectURNToAdd );
        mongodbDrvGetPoolConnectionAndCall( objectStorageObject, objectURNToAdd, mongodbDrvInstanceAdd );

        return objectToOwn.muUID;
    }

    function mongodbDrvInstanceRelease( objectStorageObject, prototypeURN, objectToDelete, callback )
    {
        mongodbDrvGetPoolConnectionAndCall( objectStorageObject, prototypeURN + ':' + objectToDelete.muUID, mongodbDrvInstanceDel );

        exports.waitForTransactionOnObjectToFinish
            (
                objectStorageObject,
                prototypeURN,
                callback
            );
    }

    function mongodbDrvPrototypeAdd( objectStorageObject, objectURN, connectionFromPool, transactionID )
    {
        var storageContent  = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var objectToSync    = objectURN.split( ':' );
        var prototypeName   = objectToSync[ 0 ];
        var muUID           = objectToSync[ 1 ];

        connectionFromPool.createCollection
        (
            prototypeName,
            { w : 1 },
            function( errCollCreate, resCollCreate )
            {
                if( errCollCreate )
                {
                    //TODO : in case of an error during the creation phase we need to retry and make all pending transaction wait for success
                    //for now we go to the next transaction
                    mongodbDrvDelTransaction( storageContent, objectURN, transactionID );

                    return mu.error( 'mongodb driver says : collection create has an error : ' + errCollCreate );
                }
                connectionFromPool.ensureIndex
                (
                    'muUID',
                    { unique:true, background:true },
                    function( indexErr, indexName ){
                        if( indexErr ) mu.error( 'mongodb driver says : collection index creation has an error : ' + indexErr );
                    }
                );
                mongodbDrvDelTransaction( storageContent, objectURN, transactionID );

                mu.debug( 'mongodb driver created the table for the object ' + prototypeName );
            }
        );
    }

    function mongodbDrvInstanceAdd( objectStorageObject, objectURN, connectionFromPool, transactionID )
    {
        var storageContent  = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var objectToSync    = objectURN.split( ':' );
        var prototypeName   = objectToSync[ 0 ];
        var muUID           = objectToSync[ 1 ];

        if( !muUID ) mu.error( 'muUID is undefined in object ' + objectURN );

        var objectToInsert = storageContent.lastState[ objectURN ];

        objectToInsert.muUID = muUID;

        var collectionObject = connectionFromPool.collection( prototypeName );

        collectionObject.update
        (
            { muUID : muUID },
            objectToInsert,
            { upsert : true, w : 1 },
            function( insertError, insertObject )
            {
                if( insertError ) mu.warn( 'mongodb driver says : insert has a problem : ' + insertError );

                mongodbDrvDelTransaction( storageContent, objectURN, transactionID );

                mu.debug( 'mongodb driver insert the object with muUID' + muUID +
                            ' into the collection : ' + prototypeName );
            }
        );
    }


    function mongodbDrvInstanceDel( objectStorageObject, objectURN, connectionFromPool, transactionID )
    {
        var storageContent  = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var objectToSync    = objectURN.split( ':' );
        var prototypeName   = objectToSync[ 0 ];
        var muUID           = objectToSync[ 1 ];

        if( !muUID ) mu.error( 'muUID is undefined in object ' + objectURN );

        var collectionObject = connectionFromPool.collection( prototypeName );

        collectionObject.remove
        (
            { muUID : muUID },
            { w : 1 },
            function( remErr, remNumber )
            {
                if( remErr ) mu.warn( 'mongodb driver says : remove has a problem ' + remErr );
                if( remNumber == 0 ) mu.warn( 'mongodb driver says : object with muUID : ' + muUID + ' didnt exist' );
                if( remNumber > 1 ) mu.warn( 'mongodb driver says : removed more than 1 object with muUID : ' + muUID );

                mongodbDrvDelTransaction( storageContent, objectURN, transactionID );

                mu.debug( 'mongodb driver deleted the object with muUID' + muUID +
                            ' from the collection : ' + prototypeName );

                delete storageContent.lastState[ objectURN ];
            }
        );
    }

    function mongodbDrvItemGet( objectStorageObject, propertyURN )
    {   // we trigger the select query transaction, return the value that we have right now in memory,
        // the transaction will synchronise with any modification in the BD later, this basically is THE synchronisation mechanism

        mongodbDrvGetPoolConnectionAndCall( objectStorageObject, propertyURN, mongodbDrvGetPropertyValue );

        return objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ];
    }

    function mongodbDrvGetPropertyValue( objectStorageObject, propertyURN, connectionFromPool, transactionID )
    {
        var storageContent  = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var propertyToSync  = propertyURN.split( ':' );
        var prototypeName   = propertyToSync[ 0 ];
        var muUID           = propertyToSync[ 1 ];
        var propertyName    = propertyToSync[ 2 ];

        if( !muUID ) mu.error( 'muUID is undefined in object ' + objectURN );

        var collectionObject = connectionFromPool.collection( prototypeName );
        var valueConcerned      = { };

        valueConcerned[ propertyName ] = storageContent.lastState[ propertyURN ];

        collectionObject.findOne
        (
            { muUID : muUID },
            { fields : valueConcerned },
            function( actionError, actionResult )
            {
                if( actionError ) mu.warn( 'mongodb driver says : action has a problem' + actionError );

                mongodbDrvDelTransaction( storageContent, propertyURN, transactionID );

                if( actionResult )
                    mongodbDrvApplyGet( objectStorageObject, propertyURN, actionResult[ propertyName ] );

                mu.debug( 'mongodb driver has find the value ' +
                    ' of property ' + propertyName +
                    ' for the object with muUID=' + muUID +
                    ' in the collection ' + prototypeName + ' in memory with value ' +
                    storageContent.lastState[ propertyURN ] );
            }
        );
    }

    function mongodbDrvApplyGet( objectStorageObject, propertyURN, valueToSet )
    {
        objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ] = valueToSet;
    }

    function mongodbDrvItemSet( objectStorageObject, propertyURN, newVal )
    {   // we trigger the select query transaction, return the value that we have right now in memory,
        // the transaction will synchronise with any modification in the BD later, this basically is THE synchronisation mechanism

        objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ].lastState[ propertyURN ] = newVal;

        mongodbDrvGetPoolConnectionAndCall( objectStorageObject, propertyURN, mongodbDrvSetPropertyValue );
    }

    function mongodbDrvSetPropertyValue( objectStorageObject, propertyURN, connectionFromPool, transactionID )
    {
        var storageContent  = objectStorageObject.driver.Storages[ objectStorageObject.storagePathOrURI ];
        var propertyToSync  = propertyURN.split( ':' );
        var prototypeName   = propertyToSync[ 0 ];
        var muUID           = propertyToSync[ 1 ];
        var propertyName    = propertyToSync[ 2 ];

        if( !muUID ) mu.error( 'muUID is undefined in object ' + objectURN );

        var collectionObject = connectionFromPool.collection( prototypeName );

        var valueConcerned      = { };

        valueConcerned[ propertyName ] = storageContent.lastState[ propertyURN ];

        collectionObject.update
        (
            { muUID : muUID },
            { $set: valueConcerned },
            { w: 1 },
            function( actionError, actionResult )
            {
                if( actionError ) mu.warn( 'mongodb driver says : action has a problem' + actionError );

                mongodbDrvDelTransaction( storageContent, propertyURN, transactionID );

                mu.debug( 'mongodb driver has refresh the value ' +
                    ' of property ' + propertyName +
                    ' for the object with muUID=' + muUID +
                    ' in the collection ' + prototypeName + ' in memory with value ' +
                    storageContent.lastState[ propertyURN ] );
            }
        );
    }


    return exports;
} ) ( typeof exports === 'undefined' ? this[ 'mu' ][ 'Drv.mongodb' ] = { } : exports );