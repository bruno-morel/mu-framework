/**
 * User: bruno
 * Date: 2013-01-13
 * Time: 7:29 PM
 *
 * this empty driver is an empty driver that allow us to test the muStorage driver interface in BDD tests
 *
 * it respond to default function
 */
// ensure that mu framework is always present
if( typeof window === "undefined" && typeof global[ 'mu' ] == "undefined" )         require( '../../mu.js' );
else if( typeof window !== "undefined" && typeof window[ 'mu' ] == "undefined" )    console.error( "mu not present." );


// includes
mu.require( 'muStorage' );


( function ( exports )
{
    //this will be useful only for real driver to allow multiple host connections
    exports.Storages        = [ ];
    exports.prepare         = function( storagePathOrURI, userLogin, userPassword, params )
    {
        var     emptyDriver = this;

        //this function must set the driver local lastMuUID to the last Unique ID, and attach the current last MuUID to
        //the owned object instance
        emptyDriver.ownInstance       = emptyDrvItemAdd;
        //this function must release the object instance from the driver
        emptyDriver.relInstance       = emptyDrvItemDel;
        //this function must get the properties to the value specified in the storage engine
	    emptyDriver.relConnection      = emptyDrvDisconnect;
	    //this function must get the properties to the value specified in the storage engine
        emptyDriver.getItem           = emptyDrvGetterFnc;
        //this function must set the properties to the value specified in the storage engine
        emptyDriver.setItem           = emptyDrvSetterFnc;
        emptyDriver.lastMuUID         = { };

        emptyDriver.listAddItemFnc    = null;
        emptyDriver.listDelItemFnc    = null;
        emptyDriver.listGetterFnc     = null;
        emptyDriver.listSetterFnc     = null;

        return emptyDriver;
    };

    function emptyDrvItemAdd( objectStorageObject, objectPrototypeName, objectToOwn )
    {
	    /*
        if( objectStorageObject.driver.lastMuUID[ objectPrototypeName ] != null )
            objectStorageObject.driver.lastMuUID[ objectPrototypeName ]++;
        else
            objectStorageObject.driver.lastMuUID[ objectPrototypeName ] = 1;
		*/
        objectToOwn.muUID = objectStorageObject.generateMuUID();//objectStorageObject.driver.lastMuUID[ objectPrototypeName ];

        return objectToOwn.muUID;
    }

    function emptyDrvItemDel( )
    {// we must return true if we successfully removed the item
        //if( objectStorageObject.lastMuUID[ objectPrototypeName ] != 0 )
        //    objectStorageObject.lastMuUID[ objectPrototypeName ]--;

        return true;
    }

	function emptyDrvDisconnect( )
	{
		return true;
	}

    function emptyDrvGetterFnc( storagePrototype, objectURNEnd )
    {// we must return the object if we succeeded (the empty driver does nothing)
        return storagePrototype[ objectURNEnd ];
    }

    function emptyDrvSetterFnc( storagePrototype, objectURNEnd, newVal )
    {
        storagePrototype[ objectURNEnd ] = newVal;
    }


	return exports;
} )( typeof exports === 'undefined' ? this[ 'mu' ][ 'Drv.empty' ] = { }  : exports );//} )( typeof exports === 'undefined' ? { } : exports );