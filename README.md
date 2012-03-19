###When.js
When.js is a simple event manager that's lightweight and extremely user friendly. What's different about When.js is the fact that it takes users input, manipulates it and bind events accordingly. 

For example, lets bind a click event to a button:
	
	when(".button clicked").do(function() {
		alert("Button clicked!");	
	});

Simple as. Currently it supports most DOM events and binding custom events.

##Custom Events
Customs events are extremely simple with When.js.

	//Bind the event
	when("bang").do(function() {
		alert("Bang!");
	});

	trigger("bang");

##RoadMap
* Removing events (this is kinda biggie)
* Binding custom events to namespaces e.g "app go", "app stop"
* Full browser support. (Only tested in Chrome)
* Calling event once (need to add support for removing events first)
