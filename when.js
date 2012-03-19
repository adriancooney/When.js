var EventManager = {
	events: {},
	DOMEvents: {},
	
	addEvent: function(type, event, selector, callback) {
		switch(type) {
		  	case 1: //Dom event
		   	  if(!EventManager.DOMEvents[selector]) EventManager.DOMEvents[selector] = [];
			  EventManager.DOMEvents[selector].push([event, callback]);
			break;

			case 2:
			  callback = selector;
			  if(!EventManager.events[event]) EventManager.events[event] = [];
			  EventManager.events[event].push(callback);
			break;
		}
	},

	isEvent: function(str) {
		//TODO: Check to see if DOM event
		//Also requires DOM Event firing using event.initMouseEvent and event.initKeyEvent
		return (EventManager.events[str]) ? EventManager.events[str] : false;
	}
};

function Log(msg) {
	if(false) { //Change to false to exit out of development mode
		console.log(msg);
	}
}

var WhenEvent = function(event) {
	Log("Processing Event: " + event);
	var _specials = {},
	    _keywords = ["click", "mousein", "mouseover", "mouseout", "dblclick", "load", "keydown", "keypress", "keyup", "abort", "error", "resize", "scroll", "resize", "blur", "change", "focus", "reset", "select", "submit"];

	this.do = function(callback) {
		Log( this);
		Log("SELECTOR: " + this._selector);
		if(this._special) {
			this._interpretSpecial(callback);
		//Been interpretted and compiled, bind event
		} else if(this._selector.length >= 1) {
			this._bindDOMEvent(this._selector.join(" "), this._event, callback);
		} else {
			this._bindCustomEvent(this._event, callback);
		}	 
	};

	this.once = function() {};

	this._interpretEvents = function(event) {
		//Split the events up by ,
		var that = this,
		    events = event.split(",");

		//Loop through each event
		events.forEach(function(event) {

			var _selector = [], //If any
			    _event, 
			//Split up by words
			words = event.split(" ");

			console.log(words);
			//Loop through each word
			words.forEach(function(word) {
				word = word.replace(/\s*/, "");
				var interpretation = that._interpretWord(word);

				//Addressing some scope issues
				switch(interpretation[0]) {
					case 1:
					  //Is a tag
					  _selector.push(word);
					break;
					
					case 2:
					  //Selector
					  _selector.push(word);
					break;

					case 3:
					  //event
					  _event = interpretation[1];
					break;
					
					case 4:
					  //Special keyword
					  that._special = true;	
					
					  if(!that._specialKeywords) that._specialKeywords = [];
					  that._specialKeywords.push(word);			
					break;

					case 5:
					  //Custom event
					  _event = word;
					break;
					
					case 6:
					  //Ignore it;
					  return;
					break;

					default:
					throw new TypeError("Error Parsing the event string. Are you sure it's correct?");
				}
			});
			
			//If it's a special one, send all the data over to be interpretted manually
			if(that._special) {
				that._specialData = words;
			}

			that._selector = _selector;
			that._event = _event;


		});
	};

	this._interpretWord = function(word) {
		var ignore = ["is"];
		//Check if event and return which event
		//Messy use of arrays here
		var _check = this._isEvent(word);
		if(ignore.indexOf(word) !== -1) return [6] //DENIED
		else if(this._isTag(word)) return [1]; //Tag
		else if(this._isSelector(word)) return [2]; //Selector
		else if(_check[0]) return [3, _check[1]]; //Event
		else if(this._isSpecial(word)) return [4]; //Special keyword
		else return [5]; //Custom event
	};
		

	this._bindDOMEvent = function(selector, event, callback) {
		var nodes = document.querySelectorAll(selector);

		if(nodes.length < 1) throw new TypeError("Can't find any nodes with the selector: " + selector);

		Array.prototype.forEach.call(nodes, function(el) {
			console.log(el);
			console.log("AM I EVEN BEING CALLED LIKE?");			
			el.addEventListener(event, callback, false);
		});

		EventManager.addEvent(1, event, selector, callback);
	};

	this._bindCustomEvent = function(event, callback) {
		Log("Binding Custom Event..")
		EventManager.addEvent(2, event, callback);
	};

	this._isTag = function(str) {
		var tags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "keygen", "kbd", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
		return (tags.indexOf(str) !== -1) ? true : false;
	};

	this._isSelector = function(str) {
		//TODO: Better selector detection
		//Basic selector detection. Basic.
		return /^\.|^#/.test(str.replace(" ", ""));
	};

	this._isEvent = function(str) {
		var ret = [false];
		//Using RegExp to loosely test is event
		//Allows for usage such as "document loadED" or "document loadS"
		_keywords.forEach(function(v) {
			if((new RegExp(v)).test(str)) ret = [true, v];
		});

		return ret;
	};


	this._isSpecial = function(str) {
		var specials = ["window", "document", "hover"],
		    ret = false;

		specials.forEach(function(v) {
			if((new RegExp(v)).test(str)) ret = true;
		});

		return ret;
	};

	this._interpretSpecial = function(callback) {
		//Some words just dont play along
		//Override the _seletor and _event
		//With specials
		//Example, say you want to bind to the "window"
		//Binding to the document will not work (obviously)
		//Only way to do this is loop through specials
		Log(this._specialKeywords);	
		if(this._specialKeywords.indexOf("document") !== -1) {
			document.addEventListener((this._event === "load") ? "DOMContentLoaded" : this._event, callback, false);
			EventManager.addEvent(1, this._event, "document", callback);
		}
		
	};

	//---------------------
	this._interpretEvents(event);
};

var when = function(event) {
	return new WhenEvent(event);
};

var trigger = function(event) {
	var _events = event.split(","); //For multiple event triggering
	_events.forEach(function(v) {
		var e = EventManager.isEvent(v);
		if(e) e.forEach(function(v) { v.call(window); });
	});
};


//Arguments: Event object, current event count
console.log(when("hello!"));
