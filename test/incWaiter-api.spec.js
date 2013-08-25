/**
 * Date: 2013-07-14
 * User: bruno
 *
 * the muJasmine BDD test for Incredible Waiter API
 *
 */

describe( "Incredible Waiter", function()
{
	var incWaiter = mu.require( '../../src/incWaiter.js' );

	it( "mu is defined and working", function()
	{
		expect( mu ).toBeDefined( );
		expect( mu.require ).toBeDefined( );
	});

	it( "the schema is loaded and works", function()
	{
		expect( Dish ).toBeDefined( );
		expect( Ingredient ).toBeDefined( );
	});

	it( "the schema create the right type of objects (we just test Dish and Ingredient)", function()
	{
		var newDish = new Dish( { 'name' : "testName", 'longdescription' : "testLongDescription" } );
		var newIngredient = new Ingredient( );

		expect( newDish.containBerry ).toBeDefined( );
		expect( newDish.containNut ).toBeDefined( );
		expect( newDish.name ).toEqual( "testName" );
		expect( newIngredient.name ).toEqual( "no name given" );

		newDish.relInstance( );
		newIngredient.relInstance( );
	});

});