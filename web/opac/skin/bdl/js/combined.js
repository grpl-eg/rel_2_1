function $(id) { return getId(id); }
function getId(id) {
	return document.getElementById(id);
}

function swapCSSClass(obj, old, newc ) {
	removeCSSClass(obj, old );
	addCSSClass(obj, newc );
}


function addCSSClass(e,c) {
	if(!e || !c) return;

	var css_class_string = e.className;
	var css_class_array;

	if(css_class_string)
		css_class_array = css_class_string.split(/\s+/);

	var string_ip = ""; /*strip out nulls*/
	for (var css_class in css_class_array) {
		if (css_class_array[css_class] == c) { return; }
		if(css_class_array[css_class] !=null)
			string_ip += css_class_array[css_class] + " ";
	}
	string_ip += c;
	e.className = string_ip;
}

function removeCSSClass(e, c) {
	if(!e || !c) return;

	var css_class_string = '';

	var css_class_array = e.className;
	if( css_class_array )
		css_class_array = css_class_array.split(/\s+/);

	var first = 1;
	for (var css_class in css_class_array) {
		if (css_class_array[css_class] != c) {
			if (first == 1) {
				css_class_string = css_class_array[css_class];
				first = 0;
			} else {
				css_class_string = css_class_string + ' ' +
					css_class_array[css_class];
			}
		}
	}
	e.className = css_class_string;
}


/*returns the character code pressed that caused the event */
function grabCharCode(evt) {
   evt = (evt) ? evt : ((window.event) ? event : null); 
   if( evt ) {
      return (evt.charCode ? evt.charCode : 
         ((evt.which) ? evt.which : evt.keyCode ));
   } else { return -1; }
}       


/* returns true if the user pressed enter */
function userPressedEnter(evt) {
   var code = grabCharCode(evt);
   if(code==13||code==3) return true;
   return false;
}   


function goTo(url) {
	/* setTimeout because ie sux */
	setTimeout( function(){ location.href = url; }, 0 );
}


function removeChildren(dom) {
	if(!dom) return;
	while(dom.childNodes[0])
		dom.removeChild(dom.childNodes[0]);
}

function appendClear(node, child) {
	if(typeof child =='string') child = text(child);
	removeChildren(node);
	node.appendChild(child);
}


function instanceOf(object, constructorFunction) {

   if(!IE) {
      while (object != null) {
         if (object == constructorFunction.prototype)
            return true;
         object = object.__proto__;
      }
   } else {
      while(object != null) {
         if( object instanceof constructorFunction )
            return true;
         object = object.__proto__;
      }
   }
   return false;
}         


/* ------------------------------------------------------------------------------------------- */
/* detect my browser */
var isMac, NS, NS4, NS6, IE, IE4, IEmac, IE4plus, IE5, IE5plus, IE6, IEMajor, ver4, Safari;
function detect_browser() {       

   isMac = (navigator.appVersion.indexOf("Mac")!=-1) ? true : false;
   NS = (navigator.appName == "Netscape") ? true : false;
   NS4 = (document.layers) ? true : false;
   IE = (navigator.appName == "Microsoft Internet Explorer") ? true : false;
   IEmac = ((document.all)&&(isMac)) ? true : false;
   IE4plus = (document.all) ? true : false;
   IE4 = ((document.all)&&(navigator.appVersion.indexOf("MSIE 4.")!=-1)) ? true : false;
   IE5 = ((document.all)&&(navigator.appVersion.indexOf("MSIE 5.")!=-1)) ? true : false;
   IE6 = ((document.all)&&(navigator.appVersion.indexOf("MSIE 6.")!=-1)) ? true : false;
   ver4 = (NS4 || IE4plus) ? true : false;
   NS6 = (!document.layers) && (navigator.userAgent.indexOf('Netscape')!=-1)?true:false;
   Safari = navigator.userAgent.match(/Safari/);

   IE5plus = IE5 || IE6;
   IEMajor = 0;

   if (IE4plus) {
      var start = navigator.appVersion.indexOf("MSIE");
      var end = navigator.appVersion.indexOf(".",start);
      IEMajor = parseInt(navigator.appVersion.substring(start+5,end));
      IE5plus = (IEMajor>=5) ? true : false;
   }
}  
detect_browser();
/* ------------------------------------------------------------------------------------------- */


function text(t) {
	if(t == null) t = "";
	return document.createTextNode(t);
}

function elem(name, attrs, txt) {
    var e = document.createElement(name);
    if (attrs) {
        for (key in attrs) {
			  if( key == 'id') e.id = attrs[key];
			  else e.setAttribute(key, attrs[key]);
        }
    }
    if (txt) e.appendChild(text(txt));
    return e;
}                   


/* sel is the selector object, sets selected on the 
	option with the given value. case does not matter...*/
function setSelector( sel, value ) {
	if(sel && value != null) {
		for( var i = 0; i!= sel.options.length; i++ ) { 
			if( sel.options[i] ) {
				var val = sel.options[i].value;
				if( val == null || val == "" ) /* for IE */
					val = sel.options[i].innerHTML;
				value += ""; /* in case of number */ 
				if( val && val.toLowerCase() == value.toLowerCase() ) {
					sel.selectedIndex = i;
					sel.options[i].selected = true;
					return true;
				}
			}
		}
	}
	return false;
}

function setSelectorRegex( sel, regex ) {
	if(sel && regex != null) {
		for( var i = 0; i!= sel.options.length; i++ ) { 
			if( sel.options[i] ) {
				var val = sel.options[i].value;
				if( val == null || val == "" ) /* for IE */
					val = sel.options[i].innerHTML;
				value += ""; /* in case of number */ 
				if( val && val.match(regex) ) {
					sel.selectedIndex = i;
					sel.options[i].selected = true;
					return true;
				}
			}
		}
	}
	return false;
}

function getSelectorVal( sel ) {
	if(!sel) return null;
	var idx = sel.selectedIndex;
	if( idx < 0 ) return null;
	var o = sel.options[idx];
	var v = o.value; 
	if(v == null) v = o.innerHTML;
	return v;
}

function getSelectorName( sel ) {
	var o = sel.options[sel.selectedIndex];
	var v = o.name;
	if(v == null || v == undefined || v == "") v = o.innerHTML;
	return v;
}

function setSelectorByName( sel, name ) {
	for( var o in sel.options ) {
		var opt = sel.options[o];
		if( opt.name == name || opt.innerHTML == name ) {
			sel.selectedIndex = o;
			opt.selected = true;
		}
	}
}

function findSelectorOptByValue( sel, val ) {
	for( var i = 0; i < sel.options.length; i++ ) {
		var opt = sel.options[i];
		if( opt.value == val ) return opt;
	}
	return null;
}

function debugSelector(sel) {
	var s = 'Selector\n';
	for( var i = 0; i != sel.options.length; i++ ) {
		var o = sel.options[i];
		s += "\t" + o.innerHTML + "\n";
	}
	return s;
}

function findParentByNodeName(node, name) {
	while( ( node = node.parentNode) ) 
		if (node.nodeName == name) return node;
	return null;
}

/* returns only elements in nodes childNodes list, not sub-children */
function getElementsByTagNameFlat( node, name ) {
	var elements = [];
	for( var e in node.childNodes ) {
		var n = node.childNodes[e];
		if( n && n.nodeName == name ) elements.push(n);
	}
	return elements;
}

/* expects a tree with a id() method on each node and a 
children() method to get to each node */
function findTreeItemById( tree, id ) {
	if( tree.id() == id ) return tree;
	for( var c in tree.children() ) {
		var found = findTreeItemById( tree.children()[c], id );
		if(found) return found;
	}
	return null;
}

/* returns null if none of the tests are true.  returns sub-array of 
matching array items otherwise */
function grep( arr, func ) {
	var results = [];
	if(!arr) return null;
	if( arr.constructor == Array ) {
		for( var i = 0; i < arr.length; i++ ) {
			if( func(arr[i]) ) 
				results.push(arr[i]);
		}
	} else {
		for( var i in arr ) {
			if( func(arr[i]) ) 
				results.push(arr[i]);
		}
	}
	if(results.length > 0) return results;
	return null;
}

function ogrep( obj, func ) {
	var results = {};
	var found = false;
	for( var i in obj ) {
		if( func(obj[i]) ) {
			results[i] = obj[i];
			found = true;
		}
	}
	if(found) return results;
	return null;
}

function doSelectorActions(sel) {
	if((IE || Safari) && sel) { 
		sel.onchange = function() {
			var o = sel.options[sel.selectedIndex];
			if(o && o.onclick) o.onclick()
		}
	}
}

/* if index < 0, the item is pushed onto the end */
function insertSelectorVal( selector, index, name, value, action, indent ) {
	if( index < 0 ) index = selector.options.length;
	var a = [];
	for( var i = selector.options.length; i != index; i-- ) 
		a[i] = selector.options[i-1];

	var opt = setSelectorVal( selector, index, name, value, action, indent );

	for( var i = index + 1; i < a.length; i++ ) 
		selector.options[i] = a[i];

	return opt;
}

/* changes the value of the option at the specified index */
function setSelectorVal( selector, index, name, value, action, indent ) {
	if(!indent || indent < 0) indent = 0;
	indent = parseInt(indent);

	var option;

	if(IE) {
		var pre = elem("pre");
		for( var i = 0; i != indent; i++ )
			pre.appendChild(text("   "));

		pre.appendChild(text(name));
		option = new Option("", value);
		selector.options[index] = option;
		option.appendChild(pre);
	
	} else {
		indent = indent * 14;
		option= new Option(name, value);
		option.setAttribute("style", "padding-left: "+indent+'px;');
		selector.options[index] = option;
		if(action) option.onclick = action;
	}

	if(action) option.onclick = action;
	return option;
}


/* split on spaces.  capitalize the first /\w/ character in
   each substring */
function normalize(val) {
	return val; /* disable me for now */

   if(!val) return ""; 

   var newVal = '';
   try {val = val.split(' ');} catch(E) {return val;}
   var reg = /\w/;

   for( var c = 0; c < val.length; c++) {

      var string = val[c];
      var cap = false; 
      for(var x = 0; x != string.length; x++) {

         if(!cap) {
            var ch = string.charAt(x);
            if(reg.exec(ch + "")) {
               newVal += string.charAt(x).toUpperCase();
               cap = true;
               continue;
            }
         }

         newVal += string.charAt(x).toLowerCase();
      }
      if(c < (val.length-1)) newVal += " ";
   }

   newVal = newVal.replace(/\s*\.\s*$/,'');
   newVal = newVal.replace(/\s*\/\s*\/\s*$/,' / ');
   newVal = newVal.replace(/\s*\/\s*$/,'');

   return newVal;
}


/* returns true if n is null or stringifies to 'undefined' */
function isNull(n) {
	if( n == null || n == undefined || n.toString().toLowerCase() == "undefined" 
		|| n.toString().toLowerCase() == "null" )
		return true;
	return false;
}


/* find nodes with an attribute of 'name' that equals nodeName */

function $n( root, nodeName ) { return findNodeByName(root,nodeName); }

function findNodeByName(root, nodeName) {
	if( !root || !nodeName) return null;

	if(root.nodeType != 1) return null;

	if(root.getAttribute("name") == nodeName || root.name == nodeName ) 
		return root;

	var children = root.childNodes;

	for( var i = 0; i != children.length; i++ ) {
		var n = findNodeByName(children[i], nodeName);
		if(n) return n;
	}

	return null;
}


/* truncates the string at 'size' characters and appends a '...' to the end */
function truncate(string, size) {
	if(string && size != null && 
			size > -1 && string.length > size) 
		return string.substr(0, size) + "... "; 
	return string;
}


/* style sheets must have a 'name' attribute for these functions to work */
function setActivateStyleSheet(name) {
	var i, a, main;
	for (i = 0; (a = document.getElementsByTagName ("link")[i]); i++) {
		if (a.getAttribute ("rel").indexOf ("style") != -1 && a.getAttribute ("name")) {
			a.disabled = true;
			if (a.getAttribute ("name").indexOf(name) != -1)
				a.disabled = false;
		}
	}
}


/* ----------------------------------------------------- */
var currentFontSize;
function scaleFonts(type) {

	var size		= "";
	var ssize	= "";
	var size2	= "";
	var a;
	
	if(!currentFontSize) currentFontSize = 'regular';
	if(currentFontSize == 'regular' && type == 'regular' ) return;
	if( currentFontSize == type ) return;
	currentFontSize = type;

	switch(type) {
		case "large":  /* these are arbitrary.. but they seem to work ok in FF/IE */
			size = "142%"; 
			size2 = "107%"; 
			ssize = "94%";
			break;
	}

	document.getElementsByTagName('body')[0].style.fontSize = size;
	for (i = 0; (a = document.getElementsByTagName ("td")[i]); i++) a.style.fontSize = size;;
	for (i = 0; (a = document.getElementsByTagName ("div")[i]); i++) a.style.fontSize = ssize;
	for (i = 0; (a = document.getElementsByTagName ("option")[i]); i++) a.style.fontSize = ssize;
	for (i = 0; (a = document.getElementsByTagName ("li")[i]); i++) a.style.fontSize = ssize;
	for (i = 0; (a = document.getElementsByTagName ("span")[i]); i++) a.style.fontSize = ssize;
	for (i = 0; (a = document.getElementsByTagName ("select")[i]); i++) a.style.fontSize = ssize;
	for (i = 0; (a = document.getElementsByTagName ("a")[i]); i++) a.style.fontSize = size2;
}


function sortWordsIgnoreCase(a, b) {
	a = a.toLowerCase();
	b = b.toLowerCase();
	if(a>b) return 1;
	if(a<b) return -1;
	return 0;
}


function getSelectedList(sel) {
	if(!sel) return [];
	var vals = [];
	for( var i = 0; i != sel.options.length; i++ ) {
		if(sel.options[i].selected)
			vals.push(sel.options[i].value);
	}
	return vals;
}


function setEnterFunc(node, func) {
	if(!(node && func)) return;
	node.onkeydown = function(evt) {
		if( userPressedEnter(evt)) func();
	}
}

function iterate( arr, callback ) {
	for( var i = 0; arr && i < arr.length; i++ ) 
		callback(arr[i]);
}




/* taken directly from the JSAN util.date library */
/* but changed from the util.date.interval_to_seconds invocation, 
because JSAN will assume the whole library is already loaded if 
it sees that, and the staff client uses both this file and the
JSAN library*/
function interval_to_seconds( $interval ) {

	$interval = $interval.replace( /and/, ',' );
	$interval = $interval.replace( /,/, ' ' );
	
	var $amount = 0;
	var results = $interval.match( /\s*\+?\s*(\d+)\s*(\w{1})\w*\s*/g);  
	for( var i = 0; i < results.length; i++ ) {
		if(!results[i]) continue;
		var result = results[i].match( /\s*\+?\s*(\d+)\s*(\w{1})\w*\s*/ );
		if (result[2] == 's') $amount += result[1] ;
		if (result[2] == 'm') $amount += 60 * result[1] ;
		if (result[2] == 'h') $amount += 60 * 60 * result[1] ;
		if (result[2] == 'd') $amount += 60 * 60 * 24 * result[1] ;
		if (result[2] == 'w') $amount += 60 * 60 * 24 * 7 * result[1] ;
		if (result[2] == 'M') $amount += ((60 * 60 * 24 * 365)/12) * result[1] ;
		if (result[2] == 'y') $amount += 60 * 60 * 24 * 365 * result[1] ;
	}
	return $amount;
}


function openWindow( data ) {
	if( isXUL() ) {
		var data = window.escape(
			'<html><head><title></title></head><body>' + data + '</body></html>');

		xulG.window_open(
			'data:text/html,' + data,
			'', 
			'chrome,resizable,width=700,height=500'); 

	} else {
		win = window.open('','', 'resizable,width=700,height=500,scrollbars=1'); 
		win.document.body.innerHTML = data;
	}
}


/* alerts the innerhtml of the node with the given id */
function alertId(id) {
	var node = $(id);
	if(node) alert(node.innerHTML);
}

function alertIdText(id, text) {
	var node = $(id);
   if(!node) return;
   if(text)
      alert(text + '\n\n' + node.innerHTML);
   else 
	   alert(node.innerHTML);
}

function confirmId(id) {
	var node = $(id);
	if(node) return confirm(node.innerHTML);
}


function goBack() { history.back(); }
function goForward() { history.forward(); }


function uniquify(arr) {
	if(!arr) return [];
	var newarr = [];
	for( var i = 0; i < arr.length; i++ ) {
		var item = arr[i];
		if( ! grep( newarr, function(x) {return (x == item);}))
			newarr.push(item);
	}
	return newarr;
}

function contains(arr, item) {
	for( var i = 0; i < arr.length; i++ ) 
		if( arr[i] == item ) return true;
	return false;
}

function isTrue(i) {
	return (i && !(i+'').match(/f/i) );
}


/* builds a JS date object with the given info.  The given data
	has to be valid (e.g. months == 30 is not valid).  Returns NULL on 
	invalid date 
	Months are 1-12 (unlike the JS date object)
	*/

function buildDate( year, month, day, hours, minutes, seconds ) {

	if(!year) year = 0;
	if(!month) month = 1;
	if(!day) day = 1;
	if(!hours) hours = 0;
	if(!minutes) minutes = 0;
	if(!seconds) seconds = 0;

	var d = new Date(year, month - 1, day, hours, minutes, seconds);
	
	_debug('created date with ' +
		(d.getYear() + 1900) +'-'+
		(d.getMonth() + 1) +'-'+
		d.getDate()+' '+
		d.getHours()+':'+
		d.getMinutes()+':'+
		d.getSeconds());


	if( 
		(d.getYear() + 1900) == year &&
		d.getMonth()	== (month - 1) &&
		d.getDate()		== new Number(day) &&
		d.getHours()	== new Number(hours) &&
		d.getMinutes() == new Number(minutes) &&
		d.getSeconds() == new Number(seconds) ) {
		return d;
	}

	return null;
}

function mkYearMonDay(date) {
	if(!date) date = new Date();
	var y = date.getYear() + 1900;
	var m = (date.getMonth() + 1)+'';
	var d = date.getDate()+'';
	if(m.length == 1) m = '0'+m;
	if(d.length == 1) d = '0'+d;
	return y+'-'+m+'-'+d;
}


function debugFMObject(obj) {
	if(typeof obj != 'object' ) return obj;
	_debug("---------------------");
	var keys = fmclasses[obj.classname];
	if(!keys) { _debug(formatJSON(js2JSON(obj))); return; }

	keys.sort();
	for( var i = 0; i < keys.length; i++ ) {
		var key = keys[i];
		while( key.length < 12 ) key += ' ';
		var val = obj[keys[i]]();
		if( typeof val == 'object' ) {
			_debug(key+' :=\n');
			_debugFMObject(val);
		} else {
			_debug(key+' = ' +val);
		}

	}
	_debug("---------------------");
}


function getTableRows(tbody) {
    var rows = [];
    if(!tbody) return rows;

    var children = tbody.childNodes;
    if(!children) return rows;

    for(var i = 0; i < children.length; i++) {
        var child = children[i];
        if(child.nodeName.match(/^tr$/i)) 
            rows.push(child);
    }
    return rows;
}

function getObjectKeys(obj) {
    keys = []
    for(var k in obj)
        keys.push(k)
    return keys;
}
/* Export some constants  ----------------------------------------------------- */

var SHOW_MR_DEFAULT = false; /* true if we show metarecords by default */

//var DO_AUTHORITY_LOOKUPS = false;
var DO_AUTHORITY_LOOKUPS = true;

var STAFF_WEB_BASE_PATH = '/eg'; // root of the web-based staff interfaces

/* URL param names */
var PARAM_TERM			= "t";			/* search term */
var PARAM_FACET			= "ft";			/* facet term */
var PARAM_STYPE		= "tp";			/* search type */
var PARAM_LOCATION	= "l";			/* current location */
var PARAM_LASSO	= "sg";			/* current location */
var PARAM_DEPTH		= "d";			/* search depth */
var PARAM_FORM			= "f";			/* search format */
var PARAM_OFFSET		= "o";			/* search offset */
var PARAM_COUNT		= "c";			/* hits per page */
var PARAM_HITCOUNT	= "hc";			/* hits per page */
var PARAM_MRID			= "m";			/* metarecord id */
var PARAM_RID			= "r";			/* record id */
var PARAM_RLIST		= "rl";
var PARAM_ORIGLOC		= "ol";			/* the original location */
var PARAM_AUTHTIME	= "at";			/* inactivity timeout in seconds */
var PARAM_ADVTERM		= "adv";			/* advanced search term */
var PARAM_ADVTYPE		= "adt";			/* the advanced search type */
var PARAM_RTYPE		= "rt";
var PARAM_SORT			= "s";
var PARAM_SORT_DIR	= "sd";
var PARAM_DEBUG		= "dbg";
var PARAM_CN			= "cn";
var PARAM_LITFORM		= 'lf';
var PARAM_ITEMFORM	= 'if';
var PARAM_ITEMTYPE	= 'it';
var PARAM_BIBLEVEL	= 'bl';
var PARAM_AUDIENCE	= 'a';
var PARAM_SEARCHES	= 'ss';
var PARAM_LANGUAGE	= 'la';
var PARAM_TFORM		= 'tf'; /* temporary format for title result pages */
var PARAM_RDEPTH		= 'rd';
var PARAM_REDIR		= 're'; /* true if we have been redirected by IP (we're at a real lib) */
var PARAM_AVAIL     = 'av'; /* limit search results to available items */
var PARAM_COPYLOCS  = 'cl'; // copy (shelving) locations
var PARAM_PUBD_BEFORE = 'pdb';
var PARAM_PUBD_AFTER = 'pda';
var PARAM_PUBD_BETWEEN = 'pdt';
var PARAM_PUBD_DURING = 'pdd';
var PARAM_NOPERSIST_SEARCH = 'nps';

/* URL param values (see comments above) */
var TERM;  
var FACET;  
var STYPE;  
var LOCATION;  
var LASSO;  
var DEPTH;  
var FORM; 
var OFFSET;
var COUNT;  
var HITCOUNT;  
var RANKS; 
var FONTSIZE;
var ORIGLOC;
var AUTHTIME;
var ADVTERM;
var ADVTYPE;
var MRID;
var RID;
var RTYPE;
var SORT;
var SORT_DIR;
var RLIST;
var DEBUG;
var CALLNUM;
var LITFORM;
var ITEMFORM;
var ITEMTYPE;
var BIBLEVEL;
var AUDIENCE;
var SEARCHES;
var LANGUAGE;
var TFORM;
var RDEPTH;
var AVAIL;
var COPYLOCS;
var PUBD_BEFORE;
var PUBD_AFTER;
var PUBD_BETWEEN;
var PUBD_DURING;

/* cookie values */
var SBEXTRAS; 
var SKIN;

/* cookies */
var COOKIE_SB		= "sbe";
var COOKIE_SES		= "ses";
//var COOKIE_IDS		= "ids"; /* list of mrecord ids */
//var COOKIE_SRIDS	= "srids"; /* record ids cached from a search */
var COOKIE_FONT	= "fnt";
var COOKIE_SKIN	= "skin";
var COOKIE_RIDS	= "rids"; /* list of record ids */
var COOKIE_SEARCH = 'sr';

/* pages */
var MRESULT		= "mresult";
var RRESULT		= "rresult";
var RDETAIL		= "rdetail";
var MYOPAC		= "myopac";
var ADVANCED	= "advanced";
var HOME			= "home";
var BBAGS		= "bbags";
var REQITEMS	= "reqitems";
var CNBROWSE	= "cnbrowse";

/* search type (STYPE) options */
var STYPE_AUTHOR	= "author";
var STYPE_TITLE	= "title";
var STYPE_SUBJECT	= "subject";
var STYPE_SERIES	= "series";
var STYPE_KEYWORD	= "keyword";

/* record-level search types */
var RTYPE_MRID		= "mrid";
var RTYPE_COOKIE	= "cookie";
var RTYPE_AUTHOR	= STYPE_AUTHOR;
var RTYPE_SUBJECT	= STYPE_SUBJECT;
var RTYPE_TITLE	= STYPE_TITLE;
var RTYPE_SERIES	= STYPE_SERIES;
var RTYPE_KEYWORD	= STYPE_KEYWORD;
var RTYPE_LIST		= "list";
var RTYPE_MULTI	= 'multi';
var RTYPE_MARC		= 'marc';
var RTYPE_ISBN		= 'isbn';
var RTYPE_ISSN		= 'issn';
var RTYPE_TCN		= 'tcn';

var SORT_TYPE_REL			= "rel";
var SORT_TYPE_AUTHOR		= STYPE_AUTHOR; 
var SORT_TYPE_TITLE		= STYPE_TITLE;
var SORT_TYPE_PUBDATE	= "pubdate";
var SORT_DIR_ASC			= "asc";
var SORT_DIR_DESC			= "desc";

/* types of advanced search */
var ADVTYPE_MULTI = 'ml';
var ADVTYPE_MARC	= 'ma';

/*
var ADVTYPE_ISBN	= 'isbn';
var ADVTYPE_ISSN	= 'issn';
*/

var LOGOUT_WARNING_TIME = 30; /* "head up" for session timeout */

/* user preferences */
var PREF_HITS_PER		= 'opac.hits_per_page';
var PREF_DEF_FONT		= 'opac.default_font';
var PREF_HOLD_NOTIFY = 'opac.hold_notify';
var PREF_DEF_LOCATION = 'opac.default_search_location';
var PREF_DEF_DEPTH	= 'opac.default_search_depth';


/** If enabled, added content attribution links will be 
    made visible where appropriate.  The added content vendor name 
    and URL are defined in the entities in opac.dtd
    */
var ENABLE_ADDED_CONTENT_ATTRIB_LINKS = false;


/* container for global variables shared accross pages */
var G		= {};
G.user	= null; /* global user object */
G.ui		= {} /* cache of UI components */


/* regexes */
var REGEX_BARCODE = /^\d+/; /* starts with a number */
var REGEX_PHONE = /^\d{3}-\d{3}-\d{4}$/; /* 111-222-3333 */


/* call me after page init and I will load references 
	to all of the ui object id's defined below 
	They will be stored in G.ui.<page>.<thingy>
 */
function loadUIObjects() {
	for( var p in config.ids ) {
		G.ui[p] = {};
		for( var o in config.ids[p] ) 
			G.ui[p][o] = getId(config.ids[p][o]);
	}
}

/* try our best to free memory */
function clearUIObjects() {
	for( var p in config.ids ) {
		for( var o in config.ids[p] ) {
			if(G.ui[p][o]) {
				G.ui[p][o].onclick = null;
				G.ui[p][o].onkeydown = null;
				G.ui[p][o] = null;
			}
		}
		G.ui[p] = null;
	}
}

/* ---------------------------------------------------------------------------- 
	Set up ID's and CSS classes 
	Any new ids, css, etc. may be added by giving the unique names and putting 
	them into the correct scope 
/* ---------------------------------------------------------------------------- */

var config = {};

/* Set up the page names */
config.page = {};
config.page[HOME]			= "index.xml";
config.page[ADVANCED]	= "advanced.xml";
config.page[MRESULT]		= "mresult.xml";
config.page[RRESULT]		= "rresult.xml";
config.page[MYOPAC]		= "myopac.xml";
config.page[RDETAIL]		= "rdetail.xml";
config.page[BBAGS]		= "bbags.xml";
config.page[REQITEMS]	= "reqitems.xml";
config.page[CNBROWSE]	= "cnbrowse.xml";

/* themes */
config.themes = {};

/* set up images  */
config.images = {};
config.images.logo = "main_logo.png";


/* set up ID's, CSS, and node names */
config.ids				= {};
config.ids.result		= {};
config.ids.mresult	= {};
config.ids.advanced	= {};
config.ids.rresult	= {};
config.ids.myopac		= {};
config.ids.rdetail	= {};

config.css				= {};
config.css.result		= {};
config.css.mresult	= {};
config.css.advanced	= {};
config.css.rresult	= {};
config.css.myopac		= {};
config.css.rdetail	= {};

config.names			= {};
config.names.result	= {};
config.names.mresult = {};
config.names.advanced = {};
config.names.rresult = {};
config.names.myopac	= {};
config.names.rdetail = {};


/* id's shared accross skins. These *must* be defined */
config.ids.common = {};
config.ids.common.loading			= "loading_div";		
config.ids.common.canvas			= "canvas";				
config.ids.common.canvas_main		= "canvas_main";		
config.ids.common.org_tree			= "org_tree";			
config.ids.common.org_container	= "org_container";

config.ids.xul = {};


/* shared CSS */
config.css.hide_me = "hide_me";
config.css.dim = "dim";
config.css.dim2 = "dim2";


/* ---------------------------------------------------------------------------- */
/* These are pages that may replace the canvas */
/* ---------------------------------------------------------------------------- */
config.ids.altcanvas = {};



/* ---------------------------------------------------------------------------- */
/* Methods are defined as service:method 
	An optional 3rd component is when a method is followed by a :1, such methods
	have a staff counterpart and should have ".staff" appended to the method 
	before the method is called when in XUL mode */

var SEARCH_MRS						= 'open-ils.search:open-ils.search.metabib.multiclass:1';
var SEARCH_RS						= 'open-ils.search:open-ils.search.biblio.multiclass:1';
var SEARCH_MRS_QUERY			= 'open-ils.search:open-ils.search.metabib.multiclass.query:1';
var SEARCH_RS_QUERY             = 'open-ils.search:open-ils.search.biblio.multiclass.query:1';
var FETCH_SEARCH_RIDS			= "open-ils.search:open-ils.search.biblio.record.class.search:1";
var CREATE_MFHD_RECORD			= "open-ils.cat:open-ils.cat.serial.record.xml.create";
var DELETE_MFHD_RECORD			= "open-ils.cat:open-ils.cat.serial.record.delete";
var FETCH_MFHD_SUMMARY			= "open-ils.search:open-ils.search.serial.record.bib.retrieve";
var FETCH_MRMODS					= "open-ils.search:open-ils.search.biblio.metarecord.mods_slim.retrieve";
var FETCH_MODS_FROM_COPY		= "open-ils.search:open-ils.search.biblio.mods_from_copy";
var FETCH_MR_COPY_COUNTS		= "open-ils.search:open-ils.search.biblio.metarecord.copy_count:1";
var FETCH_RIDS						= "open-ils.search:open-ils.search.biblio.metarecord_to_records:1";
var FETCH_RMODS					= "open-ils.search:open-ils.search.biblio.record.mods_slim.retrieve";
var FETCH_R_COPY_COUNTS			= "open-ils.search:open-ils.search.biblio.record.copy_count:1";
var FETCH_FLESHED_USER			= "open-ils.actor:open-ils.actor.user.fleshed.retrieve";
var FETCH_SESSION					= "open-ils.auth:open-ils.auth.session.retrieve";
var LOGIN_INIT						= "open-ils.auth:open-ils.auth.authenticate.init";
var LOGIN_COMPLETE				= "open-ils.auth:open-ils.auth.authenticate.complete";
var LOGIN_DELETE					= "open-ils.auth:open-ils.auth.session.delete";
var FETCH_USER_PREFS				= "open-ils.actor:open-ils.actor.patron.settings.retrieve"; 
var UPDATE_USER_PREFS			= "open-ils.actor:open-ils.actor.patron.settings.update"; 
var FETCH_COPY_STATUSES			= "open-ils.search:open-ils.search.config.copy_status.retrieve.all";
var FETCH_COPY_LOCATION_COUNTS_SUMMARY	= "open-ils.search:open-ils.search.biblio.copy_location_counts.summary.retrieve";
var FETCH_COPY_COUNTS_SUMMARY	= "open-ils.search:open-ils.search.biblio.copy_counts.summary.retrieve";
//var FETCH_COPY_COUNTS_SUMMARY	= "open-ils.search:open-ils.search.biblio.copy_counts.location.summary.retrieve";
var FETCH_MARC_HTML				= "open-ils.search:open-ils.search.biblio.record.html";
var FETCH_CHECKED_OUT_SUM		= "open-ils.actor:open-ils.actor.user.checked_out";
var FETCH_HOLDS					= "open-ils.circ:open-ils.circ.holds.retrieve";
var FETCH_FINES_SUMMARY			= "open-ils.actor:open-ils.actor.user.fines.summary";
var FETCH_TRANSACTIONS			= "open-ils.actor:open-ils.actor.user.transactions.have_charge.fleshed";
var FETCH_MONEY_BILLING			= 'open-ils.circ:open-ils.circ.money.billing.retrieve.all';
var FETCH_CROSSREF				= "open-ils.search:open-ils.search.authority.crossref";
var FETCH_CROSSREF_BATCH		= "open-ils.search:open-ils.search.authority.crossref.batch";
var CREATE_HOLD					= "open-ils.circ:open-ils.circ.holds.create";
var CREATE_HOLD_OVERRIDE		= "open-ils.circ:open-ils.circ.holds.create.override";
var CANCEL_HOLD					= "open-ils.circ:open-ils.circ.hold.cancel";
var UPDATE_USERNAME				= "open-ils.actor:open-ils.actor.user.username.update";
var UPDATE_PASSWORD				= "open-ils.actor:open-ils.actor.user.password.update";
var UPDATE_EMAIL					= "open-ils.actor:open-ils.actor.user.email.update";
var RENEW_CIRC						= "open-ils.circ:open-ils.circ.renew";
var CHECK_SPELL					= "open-ils.search:open-ils.search.spellcheck";
var FETCH_REVIEWS					= "open-ils.search:open-ils.search.added_content.review.retrieve.all";
var FETCH_TOC						= "open-ils.search:open-ils.search.added_content.toc.retrieve";
var FETCH_ACONT_SUMMARY			= "open-ils.search:open-ils.search.added_content.summary.retrieve";
var FETCH_USER_BYBARCODE		= "open-ils.actor:open-ils.actor.user.fleshed.retrieve_by_barcode";
var FETCH_ADV_MARC_MRIDS		= "open-ils.search:open-ils.search.biblio.marc:1";
var FETCH_ADV_ISBN_RIDS			= "open-ils.search:open-ils.search.biblio.isbn:1";
var FETCH_ADV_ISSN_RIDS			= "open-ils.search:open-ils.search.biblio.issn:1";
var FETCH_ADV_TCN_RIDS			= "open-ils.search:open-ils.search.biblio.tcn";
var FETCH_CNBROWSE				= 'open-ils.search:open-ils.search.callnumber.browse';
var FETCH_CONTAINERS				= 'open-ils.actor:open-ils.actor.container.retrieve_by_class';
var FETCH_CONTAINERS				= 'open-ils.actor:open-ils.actor.container.retrieve_by_class';
var CREATE_CONTAINER				= 'open-ils.actor:open-ils.actor.container.create';
var DELETE_CONTAINER				= 'open-ils.actor:open-ils.actor.container.full_delete';
var CREATE_CONTAINER_ITEM		= 'open-ils.actor:open-ils.actor.container.item.create';
var DELETE_CONTAINER_ITEM		= 'open-ils.actor:open-ils.actor.container.item.delete';
var FLESH_CONTAINER				= 'open-ils.actor:open-ils.actor.container.flesh';
var FLESH_PUBLIC_CONTAINER		= 'open-ils.actor:open-ils.actor.container.public.flesh';
var UPDATE_CONTAINER				= 'open-ils.actor:open-ils.actor.container.update';
var FETCH_COPY						= 'open-ils.search:open-ils.search.asset.copy.retrieve';
var FETCH_FLESHED_COPY			= 'open-ils.search:open-ils.search.asset.copy.fleshed2.retrieve';
var CHECK_HOLD_POSSIBLE			= 'open-ils.circ:open-ils.circ.title_hold.is_possible';
var UPDATE_HOLD					= 'open-ils.circ:open-ils.circ.hold.update';
var FETCH_COPIES_FROM_VOLUME	= 'open-ils.search:open-ils.search.asset.copy.retrieve_by_cn_label:1';
var FETCH_VOLUME_BY_INFO		= 'open-ils.search:open-ils.search.call_number.retrieve_by_info'; /* XXX staff method? */
var FETCH_VOLUME					= 'open-ils.search:open-ils.search.asset.call_number.retrieve';
var FETCH_ISSUANCE					= 'open-ils.serial:open-ils.serial.issuance.pub_fleshed.batch.retrieve';
var FETCH_COPY_LOCATIONS		= 'open-ils.circ:open-ils.circ.copy_location.retrieve.all';
var FETCH_COPY_NOTES				= 'open-ils.circ:open-ils.circ.copy_note.retrieve.all';
var FETCH_COPY_STAT_CATS		= 'open-ils.circ:open-ils.circ.asset.stat_cat_entries.fleshed.retrieve_by_copy';

/* XXX deprecated.  Use ccvm's instead  */
var FETCH_LIT_FORMS             = 'open-ils.search:open-ils.search.biblio.lit_form_map.retrieve.all';
var FETCH_ITEM_FORMS            = 'open-ils.search:open-ils.search.biblio.item_form_map.retrieve.all';
var FETCH_ITEM_TYPES            = 'open-ils.search:open-ils.search.biblio.item_type_map.retrieve.all';
var FETCH_BIB_LEVELS            = 'open-ils.search:open-ils.search.biblio.bib_level_map.retrieve.all';
var FETCH_AUDIENCES             = 'open-ils.search:open-ils.search.biblio.audience_map.retrieve.all';
/* ----------------------------------- */

//var FETCH_HOLD_STATUS			= 'open-ils.circ:open-ils.circ.hold.status.retrieve';
var FETCH_HOLD_STATUS			= 'open-ils.circ:open-ils.circ.hold.queue_stats.retrieve';
var FETCH_NON_CAT_CIRCS			= 'open-ils.circ:open-ils.circ.open_non_cataloged_circulation.user';
var FETCH_NON_CAT_CIRC			= 'open-ils.circ:open-ils.circ.non_cataloged_circulation.retrieve';
var FETCH_NON_CAT_TYPES			= "open-ils.circ:open-ils.circ.non_cat_types.retrieve.all";
var FETCH_BRE						= 'open-ils.search:open-ils.search.biblio.record_entry.slim.retrieve';
var CHECK_USERNAME				= 'open-ils.actor:open-ils.actor.username.exists';
var FETCH_CIRC_BY_ID				= 'open-ils.circ:open-ils.circ.retrieve';
var FETCH_MR_DESCRIPTORS		= 'open-ils.search:open-ils.search.metabib.record_to_descriptors';
var FETCH_HIGHEST_PERM_ORG		= 'open-ils.actor:open-ils.actor.user.perm.highest_org.batch';
var FETCH_USER_NOTES				= 'open-ils.actor:open-ils.actor.note.retrieve.all';
var FETCH_ORG_BY_SHORTNAME		= 'open-ils.actor:open-ils.actor.org_unit.retrieve_by_shortname';
var FETCH_BIB_IDS_BY_BARCODE = 'open-ils.search:open-ils.search.multi_home.bib_ids.by_barcode';
var FETCH_ORG_SETTING = 'open-ils.actor:open-ils.actor.ou_setting.ancestor_default';
var TEST_PEER_BIBS				= 'open-ils.search:open-ils.search.peer_bibs.test';
var FETCH_PEER_BIBS				= 'open-ils.search:open-ils.search.peer_bibs';

/* ---------------------------------------------------------------------------- */


/* ---------------------------------------------------------------------------- */
/* event callback functions. Other functions may be appended to these vars to
	for added functionality.  */

G.evt				= {}; /* events container */

function runEvt(scope, name, a, b, c, d, e, f, g) {
	var evt = G.evt[scope][name];
	for( var i in evt ) {
		evt[i](a, b, c, d, e, f, g);	
	}
}

/* creates a new event if it doesn't already exist */
function createEvt(scope, name) {
	if(!G.evt[scope]) G.evt[scope] = {};
	if(G.evt[scope][name] == null)
		G.evt[scope][name] = []; 
}

function attachEvt(scope, name, action) {
	createEvt(scope, name);
	G.evt[scope][name].push(action);
}

function detachAllEvt(scope, name) {
	G.evt[scope][name] = [];
}


createEvt("common", "init");						/* f() : what happens on page init */
createEvt("common", "pageRendered");			/* f() : what happens when the page is done (up to the skin to call this even)*/
createEvt("common", "unload");					/* f() : what happens on window unload (clean memory, etc.)*/
createEvt("common", "locationChanged");		/* f() : what happens when the location has changed */
createEvt("common", "locationUpdated");		/* f() : what happens when the location has updated by the code */

createEvt("common", "run");						/* f() : make the page do stuff */
createEvt("result", "idsReceived");				/* f(ids) */
createEvt("rresult", "recordDrawn");			/* f(recordid, linkDOMNode) : after record is drawn, allow others (xul) to plugin actions */
createEvt("result", "preCollectRecords");		/* f() we're about to go and grab the recs */

createEvt("result", "hitCountReceived");		/* f() : display hit info, pagination, etc. */
createEvt("result", "recordReceived");			/* f(mvr, pagePosition, isMr) : display the record*/
createEvt("result", "recordDrawn");				/* f(recordid, linkDOMNode) : after record is drawn, allow others (xul) to plugin actions */
createEvt("result", "copyCountsReceived");	/* f(mvr, pagePosition, copyCountInfo) : display copy counts*/
createEvt("result", "allRecordsReceived");	/* f(mvrsArray) : add other page stuff, sidebars, etc.*/

createEvt("rdetail", "recordDrawn");			/* f() : the record has been drawn */

createEvt("common", "loggedIn");					/* f() : user has just logged in */
createEvt("common", "loginCanceled");					/* f() : user has just logged in */
createEvt('result', 'zeroHits');
createEvt('result', 'lowHits');
createEvt('rdetail', 'recordRetrieved');			/* we are about to draw the rdetail page */
createEvt('common', 'depthChanged');
createEvt('common', 'holdUpdated'); 
createEvt('common', 'holdUpdateCanceled'); 

createEvt('rdetail', 'nextPrevDrawn');





function CGI() {
	/* load up the url parameters */

	this._keys = new Array();
	this.data = new Object();

	var string = location.search.replace(/^\?/,"");
	this.server_name = location.href.replace(/^https?:\/\/([^\/]+).+$/,"$1");

	var key = ""; 
	var value = "";
	var inkey = true;
	var invalue = false;

	for( var idx = 0; idx!= string.length; idx++ ) {

		var c = string.charAt(idx);

		if( c == "=" )	{
			invalue = true;
			inkey = false;
			continue;
		} 

		if(c == "&" || c == ";") {
			inkey = 1;
			invalue = 0;
			if( ! this.data[key] ) this.data[key] = [];
			this.data[key].push(decodeURIComponent(value));
			this._keys.push(key);
			key = ""; value = "";
			continue;
		}

		if(inkey) key += c;
		else if(invalue) value += c;
	}

	if( ! this.data[key] ) this.data[key] = [];
	this.data[key].push(decodeURIComponent(value));
	this._keys.push(key);
}

/* returns the value for the given param.  If there is only one value for the
   given param, it returns that value.  Otherwise it returns an array of values
 */
CGI.prototype.param = function(p) {
	if(this.data[p] == null) return null;
	if(this.data[p].length == 1)
		return this.data[p][0];
	return this.data[p];
}

/* returns an array of param names */
CGI.prototype.keys = function() {
	return this._keys;
}

/* debuggin method */
CGI.prototype.toString = function() {
	var string = "";
	var keys = this.keys();

	for( var k in keys ) {
		string += keys[k] + " : ";
		var params = this.param(keys[k]);

		for( var p in params ) {
			string +=  params[p] + " ";
		}
		string += "\n";
	}
	return string;
}


/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */
function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }
function md5_vm_test()
{
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}
function core_hmac_md5(key, data)
{
  var bkey = str2binl(key);
  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
  return core_md5(opad.concat(hash), 512 + 128);
}
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}
function str2binl(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}
function binl2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
  return str;
}
function binl2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
  }
  return str;
}
function binl2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}
/*
var stpicopen	= '../../../../images/slimtree/folder.gif';
var stpicclose = '../../../../images/slimtree/folderopen.gif';
*/
var stpicopen	= '../../../../images/slimtree/folder2.gif';
var stpicclose = '../../../../images/slimtree/folderopen2.gif';
var stpicblank = '../../../../images/slimtree/page.gif';
var stpicline	= '../../../../images/slimtree/line.gif';
var stpicjoin	= '../../../../images/slimtree/join.gif';
var stpicjoinb = '../../../../images/slimtree/joinbottom.gif';

var stimgopen;
var stimgclose;
var stimgblank;
var stimgline;
var stimgjoin;

function _apc(root,node) { root.appendChild(node); }

function SlimTree(context, handle, rootimg) { 
	
	if(!stimgopen) {
		stimgopen       = elem('img',{src:stpicopen,border:0, style:'height:13px;width:31px;'});
		stimgclose      = elem('img',{src:stpicclose,border:0, style:'height:13px;width:31px;'});
		stimgblank      = elem('img',{src:stpicblank,border:0, style:'height:18px;width:18px;'});
		stimgline       = elem('img',{src:stpicline,border:0, style:'height:18px;width:18px;'});
		stimgjoin       = elem('img',{src:stpicjoin,border:0, style:'display:inline;height:18px;width:18px;'});
	}

	this.context	= context; 
	this.handle		= handle;
	this.cache		= new Object();
	if(rootimg) 
		this.rootimg = elem('img', 
			{src:rootimg,border:0,style:'padding-right: 4px;'});
}

SlimTree.prototype.addCachedChildren = function(pid) {
	var child;
	while( child = this.cache[pid].shift() ) 
		this.addNode( child.id, child.pid, 
			child.name, child.action, child.title );
	this.cache[pid] = null;
}

SlimTree.prototype.addNode = function( id, pid, name, action, title, cls ) {

	if( pid != -1 && !$(pid)) {
		if(!this.cache[pid]) this.cache[pid] = new Array();
		this.cache[pid].push(
			{id:id,pid:pid,name:name,action:action,title:title });
		return;
	}

	if(!action)
		action='javascript:'+this.handle+'.toggle("'+id+'");';

	var actionref;
	if( typeof action == 'string' )
		actionref = elem('a',{href:action}, name);
	else {
		actionref = elem('a',{href:'javascript:void(0);'}, name);
		actionref.onclick = action;
	}

	var div			= elem('div',{id:id});
	var topdiv		= elem('div',{style:'vertical-align:middle'});
	var link			= elem('a', {id:'stlink_' + id}); 
	var contdiv		= elem('div',{id:'stcont_' + id});

	if(cls) addCSSClass(actionref, cls);

	//actionref.setAttribute('href',action);
	if(title) actionref.setAttribute('title',title);
	else actionref.setAttribute('title',name);

	_apc(topdiv,link);
	_apc(topdiv,actionref);
	_apc(div,topdiv);
	_apc(div,contdiv);

	if( pid == -1 ) { 

		this.rootid = id;
		_apc(this.context,div);
		if(this.rootimg) _apc(link,this.rootimg.cloneNode(true));
		else _apc(link,stimgblank.cloneNode(true));

	} else {

		if(pid == this.rootid) this.open(pid);
		else this.close(pid);
		$(pid).setAttribute('haschild','1');
		_apc(link,stimgblank.cloneNode(true));
		div.style.paddingLeft = '18px';
		div.style.backgroundImage = 'url('+stpicjoinb+')';
		div.style.backgroundRepeat = 'no-repeat';
		_apc($('stcont_' + pid), div);
		if (div.previousSibling) stMakePaths(div);
	}
	if(this.cache[id]) this.addCachedChildren(id);
}

function stMakePaths(div) {
	_apc(div.previousSibling.firstChild,stimgjoin.cloneNode(true));
	_apc(div.previousSibling.firstChild,div.previousSibling.firstChild.firstChild);
	_apc(div.previousSibling.firstChild,div.previousSibling.firstChild.firstChild);
	div.previousSibling.firstChild.firstChild.style.marginLeft = '-18px';
	div.previousSibling.style.backgroundImage = 'url('+stpicline+')';
	div.previousSibling.style.backgroundRepeat = 'repeat-y';
}

SlimTree.prototype.expandAll = function() { this.flex(this.rootid, 'open'); }
SlimTree.prototype.closeAll = function() { this.flex(this.rootid,'close'); }
SlimTree.prototype.flex = function(id, type) {
	if(type=='open') this.open(id);
	else { if (id != this.rootid) this.close(id); }
	var n = $('stcont_' + id);
	for( var c = 0; c != n.childNodes.length; c++ ) {
		var ch = n.childNodes[c];
		if(ch.nodeName.toLowerCase() == 'div') {
			if($(ch.id).getAttribute('haschild') == '1') 
				this.flex(ch.id, type);
		}
	}
}

SlimTree.prototype.toggle = function(id) {
	if($(id).getAttribute('ostate') == '1') this.open(id);
	else if($(id).getAttribute('ostate') == '2') this.close(id);
}

SlimTree.prototype.open = function(id) {
	if($(id).getAttribute('ostate') == '2') return;
	var link = $('stlink_' + id);
	if(!link) return;
	if(id != this.rootid || !this.rootimg) {
		removeChildren(link);
		_apc(link,stimgclose.cloneNode(true));
	}
	link.setAttribute('href','javascript:' + this.handle + '.close("'+id+'");');
	unHideMe($('stcont_' + id));
	$(id).setAttribute('ostate','2');
}

SlimTree.prototype.close = function(id) {
	var link = $('stlink_' + id);
	if(!link) return;
	if(id != this.rootid || !this.rootimg) {
		removeChildren(link);
		_apc(link,stimgopen.cloneNode(true));
	}
	link.setAttribute('href','javascript:' + this.handle + '.open("'+id+'");');
	hideMe($('stcont_' + id));
	$(id).setAttribute('ostate','1');
}

/* - Request ------------------------------------------------------------- */


/* define it again here for pages that don't load RemoteRequest */
function isXUL() { try { if(IAMXUL) return true;}catch(e){return false;}; }


var __ilsEvent; /* the last event the occurred */

var DEBUGSLIM;
function Request(type) {

	var s = type.split(":");
	if(s[2] == "1" && isXUL()) s[1] += ".staff";
	this.request = new RemoteRequest(s[0], s[1]);
	var p = [];

	if(isXUL()) {
		if(!location.href.match(/^https:/))
			this.request.setSecure(false);

	} else {

		if( G.user && G.user.session ) {
			/* if the user is logged in, all activity resets the timeout 
				This is not entirely accurate in the sense that not all 
				requests will reset the server timeout - this should
				get close enough, however.
			*/
			var at = getAuthtime();
			if(at) new AuthTimer(at).run(); 
		}
	}

	for( var x = 1; x!= arguments.length; x++ ) {
		p.push(arguments[x]);
		this.request.addParam(arguments[x]);
	}

	if( getDebug() ) {
		var str = "";
		for( var i = 0; i != p.length; i++ ) {
			if( i > 0 ) str += ", "
			str += js2JSON(p[i]);
		}
		_debug('request ' + s[0] + ' ' + s[1] + ' ' + str );

	} else if( DEBUGSLIM ) {
		_debug('request ' + s[1]);
	}
}

Request.prototype.callback = function(cal) {this.request.setCompleteCallback(cal);}
Request.prototype.send		= function(block){this.request.send(block);}
Request.prototype.result	= function(){return this.request.getResultObject();}

function showCanvas() {
	for( var x in G.ui.altcanvas ) {
		hideMe(G.ui.altcanvas[x]);
	}
	hideMe(G.ui.common.loading);
	unHideMe(G.ui.common.canvas_main);
	try{G.ui.searchbar.text.focus();}catch(e){}
}

function swapCanvas(newNode) {
	for( var x in G.ui.altcanvas ) 
		hideMe(G.ui.altcanvas[x]);

	hideMe(G.ui.common.loading);
	hideMe(G.ui.common.canvas_main);
	unHideMe(newNode);
}

/* finds the name of the current page */
var currentPage = null;
function findCurrentPage() {
	if(currentPage) return currentPage;

	var pages = [];
	for( var p in config.page ) pages.push(config.page[p]);
	pages = pages.sort( function(a,b){ return - (a.length - b.length); } );

	var path = location.pathname;
	if(!path.match(/.*\.xml$/))
		path += "index.xml"; /* in case they go to  / */

	var page = null;
	for( var p = 0; p < pages.length; p++ ) {
		if( path.indexOf(pages[p]) != -1)
			page = pages[p];
	}

	for( var p in config.page ) {
		if(config.page[p] == page) {
			currentPage = p;
			return p;
		}
	}
	return null;
}


/* sets all of the params values  ----------------------------- */
function initParams() {
	var cgi	= new CGI();	

	/* handle the location var */
	var org;
	var loc = cgi.param(PARAM_LOCATION);
	var lasso = cgi.param(PARAM_LASSO);

    if ( lasso ) {
		lasso = findOrgLasso( lasso );
		LASSO = lasso ? lasso.id() : null;
	}

    if (loc) {
		org = findOrgUnit(loc);
		LOCATION = org ? org.id() : null;

		if ( !LOCATION ){
			org = findOrgUnit(loc);
			LOCATION = org ? org.id() : null;
		}
    }

	org = null;
	loc = cgi.param(PARAM_ORIGLOC);
	if( loc ) {
		org = findOrgUnit(loc);
		if(!org) org = findOrgUnitSN(loc);
	}
	ORIGLOC = (org) ? org.id() : null;


	DEPTH = parseInt(cgi.param(PARAM_DEPTH));
	if(isNaN(DEPTH)) DEPTH = null;


	FACET		= cgi.param(PARAM_FACET);
	TERM		= cgi.param(PARAM_TERM);
	STYPE		= cgi.param(PARAM_STYPE);
	FORM		= cgi.param(PARAM_FORM);
	//DEPTH		= parseInt(cgi.param(PARAM_DEPTH));
	OFFSET	= parseInt(cgi.param(PARAM_OFFSET));
	COUNT		= parseInt(cgi.param(PARAM_COUNT));
	HITCOUNT	= parseInt(cgi.param(PARAM_HITCOUNT));
	MRID		= parseInt(cgi.param(PARAM_MRID));
	RID		= parseInt(cgi.param(PARAM_RID));
	AUTHTIME	= parseInt(cgi.param(PARAM_AUTHTIME));
	ADVTERM	= cgi.param(PARAM_ADVTERM);
	ADVTYPE	= cgi.param(PARAM_ADVTYPE);
	RTYPE		= cgi.param(PARAM_RTYPE);
	SORT		= cgi.param(PARAM_SORT);
	SORT_DIR	= cgi.param(PARAM_SORT_DIR);
	DEBUG		= cgi.param(PARAM_DEBUG);
	CALLNUM	= cgi.param(PARAM_CN);
	LITFORM	= cgi.param(PARAM_LITFORM);
	ITEMFORM	= cgi.param(PARAM_ITEMFORM);
	ITEMTYPE	= cgi.param(PARAM_ITEMTYPE);
	BIBLEVEL	= cgi.param(PARAM_BIBLEVEL);
	AUDIENCE	= cgi.param(PARAM_AUDIENCE);
	SEARCHES = cgi.param(PARAM_SEARCHES);
	LANGUAGE	= cgi.param(PARAM_LANGUAGE);
	TFORM		= cgi.param(PARAM_TFORM);
	RDEPTH	= cgi.param(PARAM_RDEPTH);
    AVAIL   = cgi.param(PARAM_AVAIL);
    COPYLOCS   = cgi.param(PARAM_COPYLOCS);
    PUBD_BEFORE = cgi.param(PARAM_PUBD_BEFORE);
    PUBD_AFTER = cgi.param(PARAM_PUBD_AFTER);
    PUBD_BETWEEN = cgi.param(PARAM_PUBD_BETWEEN);
    PUBD_DURING = cgi.param(PARAM_PUBD_DURING);

    
	/* set up some sane defaults */
	//if(isNaN(DEPTH))	DEPTH		= 0;
	if(isNaN(RDEPTH))	RDEPTH	= 0;
	if(isNaN(OFFSET))	OFFSET	= 0;
	if(isNaN(COUNT))	COUNT		= 10;
	if(isNaN(HITCOUNT))	HITCOUNT	= 0;
	if(isNaN(MRID))		MRID		= 0;
	if(isNaN(RID))		RID		= 0;
	if(isNaN(ORIGLOC))	ORIGLOC	= 0; /* so we know it hasn't been set */
	if(isNaN(AUTHTIME))	AUTHTIME	= 0;
	if(ADVTERM==null)	ADVTERM	= "";
    if(isNaN(AVAIL))    AVAIL = 0;
}

function clearSearchParams() {
	TERM        = null;
	STYPE       = null;
	FORM        = null;
	OFFSET      = 0;
	HITCOUNT    = 0;  
	ADVTERM     = null;
	ADVTYPE     = null;
	MRID        = null;
	RID         = null;
	RTYPE       = null;
	SORT        = null;
	SORT_DIR    = null;
	RLIST       = null;
	CALLNUM	    = null;
	LITFORM	    = null;
	ITEMFORM    = null;
	ITEMTYPE    = null;
	BIBLEVEL    = null;
	AUDIENCE    = null;
	SEARCHES    = null;
	LANGUAGE    = null;
	RDEPTH      = null;
    AVAIL       = null;
    COPYLOCS    = null;
    PUBD_BEFORE = null;
    PUBD_AFTER  = null;
    PUBD_BETWEEN = null;
    PUBD_DURING = null;
}


function initCookies() {
    dojo.require('dojo.cookie');
	FONTSIZE = "regular";
	var font = dojo.cookie(COOKIE_FONT);
	scaleFonts(font);
	if(font) FONTSIZE = font;
	SKIN = dojo.cookie(COOKIE_SKIN);
    if(findCurrentPage() == HOME)
        dojo.cookie(COOKIE_SEARCH,null,{'expires':-1});
}

/* URL param accessors */
function getTerm(){return TERM;}
function getFacet(){return FACET;}
function getStype(){return STYPE;}
function getLocation(){return LOCATION;}
function getLasso(){return LASSO;}
function getDepth(){return DEPTH;}
function getForm(){return FORM;}
function getTform(){return TFORM;}
function getOffset(){return OFFSET;}
function getDisplayCount(){return COUNT;}
function getHitCount(){return HITCOUNT;}
function getMrid(){return MRID;};
function getRid(){return RID;};
function getOrigLocation(){return ORIGLOC;}
function getAuthtime() { return AUTHTIME; }
function getSearchBarExtras(){return SBEXTRAS;}
function getFontSize(){return FONTSIZE;};
function getSkin(){return SKIN;};
function getAdvTerm(){return ADVTERM;}
function getAdvType(){return ADVTYPE;}
function getRtype(){return RTYPE;}
function getSort(){return SORT;}
function getSortDir(){return SORT_DIR;}
function getDebug(){return DEBUG;}
function getCallnumber() { return CALLNUM; }
function getLitForm() { return LITFORM; }
function getItemForm() { return ITEMFORM; }
function getItemType() { return ITEMTYPE; }
function getBibLevel() { return BIBLEVEL; }
function getAudience() { return AUDIENCE; }
function getSearches() { return SEARCHES; }
function getLanguage() { return LANGUAGE; }
function getRdepth() { return RDEPTH; }
function getAvail() { return AVAIL; }
function getCopyLocs() { return COPYLOCS; }
function getPubdBefore() { return PUBD_BEFORE; }
function getPubdAfter() { return PUBD_AFTER; }
function getPubdBetween() { return PUBD_BETWEEN; }
function getPubdDuring() { return PUBD_DURING; }


function findBasePath() {
	var path = location.pathname;
	if(!path.match(/.*\.xml$/)) path += "index.xml"; 
	var idx = path.indexOf(config.page[findCurrentPage()]);
	return path.substring(0, idx);
}

function findBaseURL(ssl) {
	var path = findBasePath();
	var proto = (ssl) ? "https:" : "http:";

	/* strip port numbers.  This is necessary for browsers that
	send an explicit  <host>:80, 443 - explicit ports
	break links that need to change ports (e.g. http -> https) */
	var h = location.host.replace(/:.*/,''); 

	return proto + "//" + h + path;
}

/*
function buildISBNSrc(isbn) {
	return "http://" + location.host + "/jackets/" + isbn;
}
*/

function buildImageLink(name, ssl) {
	return findBaseURL(ssl) + "../../../../images/" + name;
}

function buildExtrasLink(name, ssl) {
	return findBaseURL(ssl) + "../../../../extras/" + name;
}

var consoleService;
function _debug(str) { 
	try { dump('dbg: ' + str + '\n'); } catch(e) {} 

	/* potentially useful, but usually just annoying */
	/*
	if(!IE) {
		if(!consoleService) {
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				this.consoleService = Components.classes['@mozilla.org/consoleservice;1']
					.getService(Components.interfaces.nsIConsoleService);
			} catch(e) {}
		}
	
		try {
			if(consoleService) {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				consoleService.logStringMessage(str + '\n');
			}
		} catch(e){}
	}
	*/
}

var forceLoginSSL; // set via Apache env variable
function  buildOPACLink(args, slim, ssl) {

	if(!args) args = {};
	var string = "";

    if( ssl == undefined && (
            location.protocol == 'https:' ||
            (forceLoginSSL && G.user && G.user.session))) {
        ssl = true;
    }

	if(!slim) {
		string = findBaseURL(ssl);
		if(args.page) string += config.page[args.page];
		else string += config.page[findCurrentPage()];
	}

	/* this may seem unnecessary.. safety precaution for now */
	/*
	if( args[PARAM_DEPTH] == null )
		args[PARAM_DEPTH] = getDepth();
		*/

	string += "?";

	for( var x in args ) {
		var v = args[x];
		if(x == "page" || v == null || v == undefined || v+'' == 'NaN' ) continue;
		if(x == PARAM_OFFSET && v == 0) continue;
		if(x == PARAM_COUNT && v == 10) continue;
		if(x == PARAM_FORM && v == 'all' ) continue;
		if( instanceOf(v, Array) && v.length ) {
			for( var i = 0; i < v.length; i++ ) {
				string += "&" + x + "=" + encodeURIComponent(v[i]);
			}
		} else {
			string += "&" + x + "=" + encodeURIComponent(v);
		}
	}

	if(getDebug())
		string += _appendParam(DEBUG,		PARAM_DEBUG, args, getDebug, string);
	if(getOrigLocation() != 1) 
		string += _appendParam(ORIGLOC,	PARAM_ORIGLOC, args, getOrigLocation, string);
	if(getTerm()) 
		string += _appendParam(TERM,		PARAM_TERM, args, getTerm, string);
	if(getFacet()) 
		string += _appendParam(FACET,		PARAM_FACET, args, getFacet, string);
	if(getStype()) 
		string += _appendParam(STYPE,		PARAM_STYPE, args, getStype, string);
	if(getLocation() != 1) 
		string += _appendParam(LOCATION, PARAM_LOCATION, args, getLocation, string);
	if(getLasso() != null) 
		string += _appendParam(LASSO, PARAM_LASSO, args, getLasso, string);
	if(getDepth() != null) 
		string += _appendParam(DEPTH,		PARAM_DEPTH, args, getDepth, string);
	if(getForm() && (getForm() != 'all') ) 
		string += _appendParam(FORM,		PARAM_FORM, args, getForm, string);
	if(getTform() && (getTform() != 'all') ) 
		string += _appendParam(TFORM,		PARAM_TFORM, args, getTform, string);
	if(getOffset() != 0) 
		string += _appendParam(OFFSET,	PARAM_OFFSET, args, getOffset, string);
	if(getDisplayCount() != 10) 
		string += _appendParam(COUNT,		PARAM_COUNT, args, getDisplayCount, string);
	if(getHitCount()) 
		string += _appendParam(HITCOUNT, PARAM_HITCOUNT, args, getHitCount, string);
	if(getMrid())
		string += _appendParam(MRID,		PARAM_MRID, args, getMrid, string);
	if(getRid())
		string += _appendParam(RID,		PARAM_RID, args, getRid, string);
	if(getAuthtime())
		string += _appendParam(AUTHTIME,	PARAM_AUTHTIME, args, getAuthtime, string);
	if(getAdvTerm())
		string += _appendParam(ADVTERM,	PARAM_ADVTERM, args, getAdvTerm, string);
	if(getAdvType())
		string += _appendParam(ADVTYPE,	PARAM_ADVTYPE, args, getAdvType, string);
	if(getRtype())
		string += _appendParam(RTYPE,		PARAM_RTYPE, args, getRtype, string);
	if(getItemForm())
		string += _appendParam(ITEMFORM,	PARAM_ITEMFORM, args, getItemForm, string);
	if(getItemType())
		string += _appendParam(ITEMTYPE,	PARAM_ITEMTYPE, args, getItemType, string);
	if(getBibLevel())
		string += _appendParam(BIBLEVEL,	PARAM_BIBLEVEL, args, getBibLevel, string);
	if(getLitForm())
		string += _appendParam(LITFORM,	PARAM_LITFORM, args, getLitForm, string);
	if(getAudience())
		string += _appendParam(AUDIENCE,	PARAM_AUDIENCE, args, getAudience, string);
	if(getSearches())
		string += _appendParam(SEARCHES,	PARAM_SEARCHES, args, getSearches, string);
	if(getLanguage())
		string += _appendParam(LANGUAGE,	PARAM_LANGUAGE, args, getLanguage, string);
	if(getRdepth() != null)
		string += _appendParam(RDEPTH,	PARAM_RDEPTH, args, getRdepth, string);
	if(getSort() != null)
		string += _appendParam(SORT,	PARAM_SORT, args, getSort, string);
	if(getSortDir() != null)
		string += _appendParam(SORT_DIR,	PARAM_SORT_DIR, args, getSortDir, string);
	if(getAvail())
		string += _appendParam(AVAIL, PARAM_AVAIL, args, getAvail, string);
	if(getCopyLocs())
		string += _appendParam(COPYLOCS, PARAM_COPYLOCS, args, getCopyLocs, string);
    if(getPubdBefore())
		string += _appendParam(PUBD_BEFORE, PARAM_PUBD_BEFORE, args, getPubdBefore, string);
    if(getPubdAfter())
		string += _appendParam(PUBD_AFTER, PARAM_PUBD_AFTER, args, getPubdAfter, string);
    if(getPubdBetween())
		string += _appendParam(PUBD_BETWEEN, PARAM_PUBD_BETWEEN, args, getPubdBetween, string);
    if(getPubdDuring())
		string += _appendParam(PUBD_DURING, PARAM_PUBD_DURING, args, getPubdDuring, string);


	return string.replace(/\&$/,'').replace(/\?\&/,"?");	
}

var xx = 1;
function _appendParam( fieldVar, fieldName, overrideArgs, getFunc, string ) {

	var ret = "";

	if(	fieldVar != null && 
			(fieldVar +'' != 'NaN') && 
			overrideArgs[fieldName] == null &&
			getFunc() != null &&
			getFunc()+'' != '' ) {

		ret = "&" + fieldName + "=" + encodeURIComponent(getFunc());
	}

	return ret;
}

/* ----------------------------------------------------------------------- */
function cleanISBN(isbn) {
   if(isbn) {
      isbn = isbn.toString().replace(/^\s+/,"");
      var idx = isbn.indexOf(" ");
      if(idx > -1) { isbn = isbn.substring(0, idx); }
   } else isbn = "";
   return isbn;
}       


/* builds a link that goes to the title listings for a metarecord */
function buildTitleLink(rec, link) {
	if(!rec) return;
	link.appendChild(text(normalize(truncate(rec.title(), 65))));
	var args = {};
	args.page = RRESULT;
	args[PARAM_OFFSET] = 0;
	args[PARAM_MRID] = rec.doc_id();
	args[PARAM_RTYPE] = RTYPE_MRID;
    var linkText = link.innerHTML; // IE
	link.setAttribute("href", buildOPACLink(args));
    link.innerHTML = linkText; // IE
}

function buildTitleDetailLink(rec, link) {
	if(!rec) return;
	link.appendChild(text(normalize(truncate(rec.title(), 65))));
	var args = {};
	args.page = RDETAIL;
	args[PARAM_RID] = rec.doc_id();
    // in IE, if the link text contains a '@', it replaces the innerHTML text 
    // with the value of the href attribute.  Wait, what?  Yes.  Capture the
    // innerHTML and put it back into place after the href is set
    var linkText = link.innerHTML; // IE
	link.setAttribute("href", buildOPACLink(args));
    link.innerHTML = linkText; // IE
}

/* 'type' is one of STYPE_AUTHOR, STYPE_SUBJECT, ... found in config.js 
	'trunc' is the number of characters to show in the string, defaults to 65 */
function buildSearchLink(type, string, linknode, trunc) {
	if(!trunc) trunc = 65;
	var args = {};
	if( SHOW_MR_DEFAULT || findCurrentPage() == MRESULT ) {
		args.page = MRESULT;
	} else {
		args.page = RRESULT;
		args[PARAM_RTYPE] = type;
	}
	args[PARAM_OFFSET] = 0;
	args[PARAM_TERM] = string;
	args[PARAM_STYPE] = type;
	linknode.appendChild(text(normalize(truncate(string, trunc))));
	linknode.setAttribute("href", buildOPACLink(args));
}

function setSessionCookie(ses) {
	dojo.cookie(COOKIE_SES, ses);
}



/* ----------------------------------------------------------------------- */
/* user session handling */
/* ----------------------------------------------------------------------- */
/* session is the login session.  If no session is provided, we attempt
	to find one in the cookies.  If 'force' is true we retrieve the 
	user from the server even if there is already a global user present.
	if ses != G.user.session, we also force a grab */
function grabUser(ses, force) {

    _debug("grabUser auth token = " + ses);
	if(!ses && isXUL()) {
		stash = fetchXULStash();
		ses = stash.session.key
		_debug("stash auth token = " + ses);
	}

	if(!ses) {
		ses = dojo.cookie(COOKIE_SES);
		/* https cookies don't show up in http servers.. */
		_debug("cookie auth token = " + ses);
	}

	if(!ses) return false;

	if(!force) 
		if(G.user && G.user.session == ses)
			return G.user;

	/* first make sure the session is valid */
	var request = new Request(FETCH_SESSION, ses);
	request.request.alertEvent = false;
	request.send(true);
	var user = request.result();

	if(!user || user.textcode == 'NO_SESSION') {

        if(isXUL()) {
            dojo.require('openils.XUL');
            dump('getNewSession in opac_utils.js\n');
            openils.XUL.getNewSession( 
                function(success, authtoken) { 
                    if(success) {
                        ses = authtoken;
                        var request = new Request(FETCH_SESSION, ses);
                        request.request.alertEvent = false;
                        request.send(true);
                        user = request.result();
                    }
                }
            );
        }

	    if(!user || user.textcode == 'NO_SESSION') {
		    doLogout();
		    return false; /* unable to grab the session */
        }
	}

	if( !(typeof user == 'object' && user._isfieldmapper) ) {
		doLogout();
		return false;
	}

	G.user = user;
	G.user.fleshed = false;
	G.user.session = ses;
	setSessionCookie(ses);

	grabUserPrefs();
	if(G.user.prefs['opac.hits_per_page'])
		COUNT = parseInt(G.user.prefs['opac.hits_per_page']);

	if(G.user.prefs[PREF_DEF_FONT]) 
		setFontSize(G.user.prefs[PREF_DEF_FONT]);

	var at = getAuthtime();
	//if(isXUL()) at = xulG['authtime'];

	if(at && !isXUL()) new AuthTimer(at).run(); 
	return G.user;
}


/* sets the 'prefs' field of the user object to their preferences 
	and returns the preferences */
function grabUserPrefs(user, force) {
	if(user == null) user = G.user;
	if(!force && user.prefs) return user.prefs;	
	var req = new Request(FETCH_USER_PREFS, G.user.session, user.id());
	req.send(true);
	user.prefs = req.result();
	return user.prefs;
}

function grabFleshedUser() {

	if(!G.user || !G.user.session) {
		grabUser();	
		if(!G.user || !G.user.session) return null;
	}

	if(G.user.fleshed) return G.user;

   var req = new Request(FETCH_FLESHED_USER, G.user.session);
  	req.send(true);

  	G.user = req.result();

	if(!G.user || G.user.length == 0) { 
		dojo.cookie(COOKIE_SES,null,{'expires':-1});
		G.user = null; return false; 
	}

	G.user.session = ses;
	G.user.fleshed = true;

	setSessionCookie(ses);
	return G.user;
}

function checkUserSkin(new_skin) {

	return; /* XXX do some debugging with this... */

	var user_skin = getSkin();
	var cur_skin = grabSkinFromURL();

	if(new_skin) user_skin = new_skin;

	if(!user_skin) {

		if(grabUser()) {
			if(grabUserPrefs()) {
				user_skin = G.user.prefs["opac.skin"];
				dojo.cookie( COOKIE_SKIN, user_skin, { 'expires' : 365 } );
			}
		}
	}

	if(!user_skin) return;

	if( cur_skin != user_skin ) {
		var url = buildOPACLink();
		goTo(url.replace(cur_skin, user_skin));
	}
}

function updateUserSetting(setting, value, user) {
	if(user == null) user = G.user;
	var a = {};
	a[setting] = value;
	var req = new Request( UPDATE_USER_PREFS, user.session, a );
	req.send(true);
	return req.result();
}

function commitUserPrefs() {
	var req = new Request( 
		UPDATE_USER_PREFS, G.user.session, null, G.user.prefs );
	req.send(true);
	return req.result();
}

function grabSkinFromURL() {
	var path = findBasePath();
	path = path.replace("/xml/", "");
	var skin = "";
	for( var i = path.length - 1; i >= 0; i-- ) {
		var ch = path.charAt(i);
		if(ch == "/") break;
		skin += ch;
	}

	var skin2 = "";
	for( i = skin.length - 1; i >= 0; i--)
		skin2 += skin.charAt(i);

	return skin2;
}


/* returns a fleshed G.user on success, false on failure */
function doLogin(suppressEvents) {

	abortAllRequests();

	var uname = G.ui.login.username.value;
	var passwd = G.ui.login.password.value;	

	var init_request = new Request( LOGIN_INIT, uname );
   init_request.send(true);
   var seed = init_request.result();

   if( ! seed || seed == '0') {
      alert( "Error Communicating with Authentication Server" );
      return null;
   }

	var args = {
		password : hex_md5(seed + hex_md5(passwd)), 
		type		: "opac", 
		org		: getOrigLocation()
	};

    r = fetchOrgSettingDefault(globalOrgTree.id(), 'opac.barcode_regex');
    if(r) REGEX_BARCODE = new RegExp(r);
    
    if( uname.match(REGEX_BARCODE) ) args.barcode = uname;
	else args.username = uname;

   var auth_request = new Request( LOGIN_COMPLETE, args );

	auth_request.request.alertEvent = false;
   auth_request.send(true);
   var auth_result = auth_request.result();

	if(!auth_result) {
		alertId('patron_login_failed');
		return null;
	}

	if( checkILSEvent(auth_result) ) {

		if( auth_result.textcode == 'PATRON_INACTIVE' ) {
			alertId('patron_inactive_alert');
			return;
		}

		if( auth_result.textcode == 'PATRON_CARD_INACTIVE' ) {
			alertId('patron_card_inactive_alert');
			return;
		}

		if( auth_result.textcode == 'LOGIN_FAILED' || 
				auth_result.textcode == 'PERM_FAILURE' ) {
			alertId('patron_login_failed');
			return;
		}
	}


	AUTHTIME = parseInt(auth_result.payload.authtime);
	var u = grabUser(auth_result.payload.authtoken, true);
	if(u && ! suppressEvents) 
		runEvt( "common", "locationChanged", u.ws_ou(), findOrgDepth(u.ws_ou()) );

	checkUserSkin();

	return u;
}

function doLogout() {

	/* cancel everything else */
	abortAllRequests();

	/* be nice and delete the session from the server */
	if(G.user && G.user.session) { 
		var req = new Request(LOGIN_DELETE, G.user.session);
      req.send(true);
		try { req.result(); } catch(E){}
    }

	G.user = null;

	/* remove any cached data */
    dojo.require('dojo.cookie');
    dojo.cookie(COOKIE_SES, null, {expires:-1});
    dojo.cookie(COOKIE_RIDS, null, {expires:-1});
    dojo.cookie(COOKIE_SKIN, null, {expires:-1});
    dojo.cookie(COOKIE_SEARCH, null, {expires:-1});


	checkUserSkin("default");
	COUNT = 10;


	var args = {};
	args[PARAM_TERM] = "";
	args[PARAM_LOCATION] = getOrigLocation();
    args[PARAM_DEPTH] = findOrgDepth(getOrigLocation() || globalOrgTree);
	args.page = "home";

	
	var nored = false;
	try{ if(isFrontPage) nored = true; } catch(e){nored = false;}
	if(!nored) goTo(buildOPACLink(args, false, false));
}


function hideMe(obj) { addCSSClass(obj, config.css.hide_me); } 
function unHideMe(obj) { removeCSSClass(obj, config.css.hide_me); }


/* ----------------------------------------------------------------------- */
/* build the org tree */
/* ----------------------------------------------------------------------- */
function drawOrgTree() {
	//setTimeout( 'buildOrgSelector(G.ui.common.org_tree, orgTreeSelector);', 10 );
	setTimeout( 'buildOrgSelector(G.ui.common.org_tree, orgTreeSelector);', 1 );
}

var checkOrgHiding_cached = false;
var checkOrgHiding_cached_context_org;
var checkOrgHiding_cached_depth;
function checkOrgHiding() {
    if (isXUL()) {
        return false; // disable org hiding for staff client
    }
    var context_org = getOrigLocation() || globalOrgTree.id();
    var depth;
    if (checkOrgHiding_cached) {
        if (checkOrgHiding_cached_context_org != context_org) {
            checkOrgHiding_cached_context_org = context_org;
            checkOrgHiding_cached_depth = undefined;
            checkOrgHiding_cached = false;
        } else {
            depth = checkOrgHiding_cached_depth;
        }
    } else {
        depth = fetchOrgSettingDefault( context_org, 'opac.org_unit_hiding.depth');
        checkOrgHiding_cached_depth = depth;
        checkOrgHiding_cached_context_org = context_org;
        checkOrgHiding_cached = true;
    }
    if ( findOrgDepth( context_org ) < depth ) {
        return false; // disable org hiding if Original Location doesn't make sense with setting depth (avoids disjointed org selectors)
    }
    if (depth) {
        return { 'org' : findOrgUnit(context_org), 'depth' : depth };
    } else {
        return false;
    }
}

var orgTreeSelector;
function buildOrgSelector(node) {
	var tree = new SlimTree(node,'orgTreeSelector');
	orgTreeSelector = tree;
	var orgHiding = checkOrgHiding();
	for( var i in orgArraySearcher ) { 
		var node = orgArraySearcher[i];
		if( node == null ) continue;
		if(!isXUL() && !isTrue(node.opac_visible())) continue; 
		if (orgHiding) {
			if ( ! orgIsMine( orgHiding.org, node, orgHiding.depth ) ) {
				continue;
			}
		}
		if(node.parent_ou() == null) {
			tree.addNode(node.id(), -1, node.name(), 
				"javascript:orgSelect(" + node.id() + ");", node.name());
		} else {
			if (orgHiding && orgHiding.depth == findOrgDepth(node)) {
				tree.addNode(node.id(), -1, node.name(), 
					"javascript:orgSelect(" + node.id() + ");", node.name());
			} else {
				tree.addNode(node.id(), node.parent_ou(), node.name(), 
					"javascript:orgSelect(" + node.id() + ");", node.name());
			}
		}
	}
	hideMe($('org_loading_div'));
	unHideMe($('org_selector_tip'));
	return tree;
}

function orgSelect(id) {
	showCanvas();
	runEvt("common", "locationChanged", id, findOrgDepth(id) );


	var loc = findOrgLasso(getLasso());
	if (!loc) loc = findOrgUnit(id);

	removeChildren(G.ui.common.now_searching);
	G.ui.common.now_searching.appendChild(text(loc.name()));
}

function setFontSize(size) {
	scaleFonts(size);
	dojo.cookie(COOKIE_FONT, size, { 'expires' : 365});
}

var resourceFormats = [
   "text",
   "moving image",
   "sound recording", "software, multimedia",
   "still image",
   "cartographic",
   "mixed material",
   "notated music",
   "three dimensional object" ];


function modsFormatToMARC(format) {
   switch(format) {
      case "text":
         return "at";
      case "moving image":
         return "g";
      case "sound recording":
         return "ij";
      case "sound recording-nonmusical":
         return "i";
      case "sound recording-musical":
         return "j";
      case "software, multimedia":
         return "m";
      case "still image":
         return "k";
      case "cartographic":
         return "ef";
      case "mixed material":
         return "op";
      case "notated music":
         return "cd";
      case "three dimensional object":
         return "r";
   }
   return "at";
}


function MARCFormatToMods(format) {
   switch(format) {
      case "a":
      case "t":
         return "text";
      case "g":
         return "moving image";
      case "i":
         return "sound recording-nonmusical";
      case "j":
         return "sound recording-musical";
      case "m":
         return "software, multimedia";
      case "k":
         return "still image";
      case "e":
      case "f":
         return "cartographic";
      case "o":
      case "p":
         return "mixed material";
      case "c":
      case "d":
         return "notated music";
      case "r":
         return "three dimensional object";
   }
   return "text";
}

function MARCTypeToFriendly(format) {
	var words = $('format_words');
	switch(format) {
		case 'a' :
		case 't' : return $n(words, 'at').innerHTML;
		default:
			var node = $n(words,format);
			if( node ) return node.innerHTML;
	}
	return "";
}

function setResourcePic( img, resource ) {
	img.setAttribute( "src", "../../../../images/tor/" + resource + ".jpg");
	img.title = resource;
}



function msg( text ) {
	try { alert( text ); } catch(e) {}
}

function findRecord(id,type) {
	try {
		for( var i = 0; i != recordsCache.length; i++ ) {
			var rec = recordsCache[i];
			if( rec && rec.doc_id() == id ) return rec;
		}
	} catch(E){}
	var meth = FETCH_RMODS
	if(type == 'M') meth = FETCH_MRMODS;
	var req = new Request(meth, id);
	req.request.alertEvent = false;
	req.send(true);
	var res = req.result();
	if( checkILSEvent(res) ) return null; 
	return res;
}

function Timer(name, node){
	this.name = name;
	this.count = 1;
	this.node = node;
}
Timer.prototype.start = 
	function(){_timerRun(this.name);}
Timer.prototype.stop = 
	function(){this.done = true;}
function _timerRun(tname) {
	var _t;
	eval('_t='+tname);
	if(_t.done) return;
	if(_t.count > 100) return;
	var str = ' . ';
	if( (_t.count % 5) == 0 ) 
		str = _t.count / 5;
	_t.node.appendChild(text(str));
	setTimeout("_timerRun('"+tname+"');", 200);
	_t.count++;
}

function checkILSEvent(obj) {
	if (obj && typeof obj == 'object' && typeof obj.ilsevent != 'undefined') {
        if (obj.ilsevent === '') {
            return true;
        } else if ( obj.ilsevent != null && obj.ilsevent != 0 ) {
            return parseInt(obj.ilsevent);
        }
    }
	return null;
}


function alertILSEvent(evt, msg) {
   if(!msg) msg = "";
	if(msg)
		alert(msg +'\n' + evt.textcode + '\n' + evt.desc );
	else 
		alert(evt.textcode + '\n' + evt.desc );
}


var __authTimer;
function AuthTimer(time) { 
	this.time = (time - LOGOUT_WARNING_TIME) * 1000; 
	if(__authTimer) 
		try {clearTimeout(__authTimer.id)} catch(e){}
	__authTimer = this;
}

AuthTimer.prototype.run = function() {
	this.id = setTimeout('_authTimerAlert()', this.time);
}

function _authTimerAlert() {
	alert( $('auth_session_expiring').innerHTML );
	if(!grabUser(null, true)) doLogout();
}


function grabUserByBarcode( authtoken, barcode ) {
	var req = new Request( FETCH_USER_BYBARCODE, authtoken, barcode );
	req.send(true);
	return req.result();
}


function goHome() {
	goTo(buildOPACLink({page:HOME}));
}


function buildOrgSel(selector, org, offset, namecol) {
    if(!namecol) namecol = 'name';
    if(!isXUL() && !isTrue(org.opac_visible())) return;
	insertSelectorVal( selector, -1, 
		org[namecol](), org.id(), null, findOrgDepth(org) - offset );
    var kids = org.children();
    if (kids) {
	    for( var c = 0; c < kids.length; c++ )
		    buildOrgSel( selector, kids[c], offset, namecol);
    }
}

function buildMergedOrgSel(selector, org_list, offset, namecol) {
    if(!namecol) namecol = 'name';
    for(var i = 0; i < org_list.length; i++) {
        var org = findOrgUnit(org_list[i]);
    	insertSelectorVal( selector, -1, 
		    org[namecol](), org.id(), null, findOrgDepth(org) - offset );
        var kids = org.children();
        if (kids) {
	        for( var c = 0; c < kids.length; c++ )
		        buildOrgSel( selector, kids[c], offset, namecol);
        }
    }
}


function parseForm(form) {
	if(!form) return {};

	var it = form.replace(/-\w+$/,"");
	var itf = null;
	var item_form;
	var item_type;

	if(form.match(/-/)) itf = form.replace(/^\w+-/,"");

	if(it) {
		item_type = [];
		for( var i = 0; i < it.length; i++ ) 
			item_type.push( it.charAt(i) );
	}

	if(itf) {
		item_form = [];
		for( var i = 0; i < itf.length; i++ ) 
			item_form.push( itf.charAt(i) );
	}

	return {item_type: item_type, item_form:item_form};
}


function isTrue(x) { return ( x && x != "0" && !(x+'').match(/^f$/i) ); }

function fetchPermOrgs() {
	var a = []; /* Q: why does arguments come accross as an object and not an array? A: because arguments is a special object, a collection */

	for( var i = 0; i < arguments.length; i++ ) 
		a.push(arguments[i])

	var preq = new Request(FETCH_HIGHEST_PERM_ORG, 
		G.user.session, G.user.id(), a );
	preq.send(true);
	return preq.result();
}


function print_tabs(t) {
	var r = '';
	for (var j = 0; j < t; j++ ) { r = r + "  "; }
	return r;
}
function formatJSON(s) {
	var r = ''; var t = 0;
	for (var i in s) {
		if (s[i] == '{' || s[i] == '[' ) {
			r = r + s[i] + "\n" + print_tabs(++t);
		} else if (s[i] == '}' || s[i] == ']') {
			t--; r = r + "\n" + print_tabs(t) + s[i];
		} else if (s[i] == ',') {
			r = r + s[i] + "\n" + print_tabs(t);
		} else {
			r = r + s[i];
		}
	}
	return r;
}
/* ------------------------------------------------------------------------------------------------------ */
/* org tree utilities */
/* ------------------------------------------------------------------------------------------------------ */

function fetchOrgSettingDefault(orgId, name) {
    var req = new Request(FETCH_ORG_SETTING, orgId, name);
    req.send(true);
    var res = req.result();
    return (res) ? res.value : null;
}

function fetchBatchOrgSetting(orgId, nameList, onload) {
    var req = new Request(
        'open-ils.actor:open-ils.actor.ou_setting.ancestor_default.batch', orgId, nameList);
    if(onload) {
        req.callback(function(r) { onload(r.getResultObject()); });
        req.send();
    } else {
        req.send(true);
        return req.result();
    }
}


/* takes an org unit or id and return the numeric depth */
function findOrgDepth(org_id_or_node) {
	var org = findOrgUnit(org_id_or_node);
	if(!org) return -1;
	var type = findOrgType(org.ou_type());
	if(type) return type.depth();
	return -1;
}

function findOrgTypeFromDepth(depth) {
	if( depth == null ) return null;
	for( var type = 0; type < globalOrgTypes.length; type++ ) {
		var t = globalOrgTypes[type];
		if( t.depth() == depth ) return t;
	}
}

/* takes the org type id from orgunit.ou_type() field and returns
	the org type object */
function findOrgType(type_id) {
	if(typeof type_id == 'object') return type_id;
	for(var type = 0; type < globalOrgTypes.length; type++) {
		var t =globalOrgTypes[type]; 
		if( t.id() == type_id || t.id() == parseInt(type_id) ) 
			return t;
	}
	return null;
}


/* returns an org unit by id.  if an object is passed in as the id,
	then the object is assumed to be an org unit and is returned */
function findOrgUnit(org_id) {
	return (typeof org_id == 'object') ? org_id : orgArraySearcher[org_id];
}

function findOrgLasso(lasso_id) {
	if (typeof lasso_id == 'object') return lasso_id;
    for (var i = 0; i < _lasso.length; i++) {
        if (_lasso[i].id() == lasso_id) return _lasso[i];
    }
    return null;
}

var orgArraySearcherSN = {};
function findOrgUnitSN(shortname) {
	if (typeof shortname == 'object') return shortname;
	if( orgArraySearcherSN[shortname] ) return orgArraySearcherSN[shortname];
	_debug("fetching org by shortname "+shortname);
	var req = new Request(FETCH_ORG_BY_SHORTNAME, shortname);
	req.request.alertEvent = false;
	req.send(true);
	return req.result();
}


/* builds a trail from the top of the org tree to the node provide.
	basically fleshes out 'my orgs' 
	Returns an array of [org0, org1, ..., myorg] */
function orgNodeTrail(node) {
	var na = new Array();
	while( node ) {
		na.push(node);
		node = findOrgUnit(node.parent_ou());
	}
	return na.reverse();
}

function findSiblingOrgs(node) { return findOrgUnit(node.parent_ou()).children(); }

/* true if 'org' is 'me' or a child of mine, or optionally, a child of an ancestor org within the specified depth */
function orgIsMine(me, org, depth) {
	if(!me || !org) {
		return false;
	}
	if(me.id() == org.id()) {
		return true;
	}
	if (depth) {
		while (depth < findOrgDepth(me)) {
			me = findOrgUnit( me.parent_ou() );
		}
		if(me.id() == org.id()) {
			return true;
		}
	}
	var kids = me.children();
	for( var i = 0; kids && i < kids.length; i++ ) {
		if(orgIsMine(kids[i], org, false)) {
			return true;
		}

	}
	return false;
}

function orgIsMineFromSet(meList, org) {
    org = findOrgUnit(org);
    for(var i = 0; i < meList.length; i++) {
        if(orgIsMine(findOrgUnit(meList[i]), org))
            return true;
    }
    return false;
}

var orgArraySearcher = {};
var globalOrgTree;
for (var i = 0; i < _l.length; i++) {
	var x = new aou();
	x.id(_l[i][0]);
	x.ou_type(_l[i][1]);
	x.parent_ou(_l[i][2]);
	x.name(_l[i][3]);
    x.opac_visible(_l[i][4]);
    x.shortname(_l[i][5]);
	orgArraySearcher[x.id()] = x;
}
for (var i in orgArraySearcher) {
	var x = orgArraySearcher[i];
	if (x.parent_ou() == null || x.parent_ou() == '') {
		globalOrgTree = x;
		continue;
	} 

	var par = findOrgUnit(x.parent_ou());
	if (!par.children()) par.children(new Array());
	par.children().push(x);
}

function _tree_killer () {
	for (var i in orgArraySearcher) {
		x=orgArraySearcher[i];
		x.children(null);
		x.parent_ou(null);
		orgArraySearcher[i]=null;
	}
	globalOrgTree = null;
	orgArraySearcher = null;
	globalOrgTypes = null;
}



var XML_HTTP_GATEWAY = "osrf-gateway-v1";
var XML_HTTP_SERVER = "";


/* This object is thrown when network failures occur */
function NetworkFailure(stat, url) { 
	this._status = stat; 
	this._url = url;
}

NetworkFailure.prototype.status = function() { return this._status; }
NetworkFailure.prototype.url = function() { return this._url; }
NetworkFailure.prototype.toString = function() { 
	return "Network Failure: status = " + this.status() +'\n'+this.url(); 
}



function isXUL() { try { if(IAMXUL) return true;}catch(e){return false;}; }
var _allrequests = {};

// If the legacy JSON gateway is needed by the staff client, uncomment this
/* 
if(isXUL()) {
    XML_HTTP_GATEWAY = 'gateway';
}
*/

function cleanRemoteRequests() {
	for( var i in _allrequests ) 
		destroyRequest(_allrequests[i]);
}

function abortAllRequests() {
	for( var i in _allrequests ) {
		var r = _allrequests[i];
		if(r) {	
			r.abort();
			destroyRequest(r);
		}
	}
}

function destroyRequest(r) {
	if(r == null) return;

	if( r.xmlhttp ) {
		r.xmlhttp.onreadystatechange = function(){};
		r.xmlhttp = null;
	}

	r.callback				= null;
	r.userdata				= null;
	_allrequests[r.id] 	= null;
}

/* ----------------------------------------------------------------------- */
/* Request object */
var rrId = 0;
function RemoteRequest( service, method ) {

	/* dojo is currently only available in the OPAC */
	try {
		/* We want OpenSRF.locale for xx-YY format */
		this.locale	= OpenSRF.locale;
	}
	catch (e) {
		this.locale = null;
	}
	this.service	= service;
	this.method		= method;
	this.xmlhttp	= false;
	this.name		= null;
	this.alertEvent = true; /* only used when isXUL is false */

	this.type		= "POST"; /* default */
	this.id			= rrId++;
	this.cancelled = false;

	this.setSecure(false);
	if(isXUL()) this.setSecure(true);

	_allrequests[this.id] = this;

	var i = 2;
	this.params = ""; 

	while(i < arguments.length) {
		var object = js2JSON(arguments[i++]);
		this.params += "&param=" + encodeURIComponent(object);
	}

	if(!this.params) { this.params = ""; }

	this.param_string = "service=" + service + "&method=" + method + this.params;
	if (this.locale != null) {
		this.param_string = this.param_string + "&locale=" + this.locale;
	}
	if( this.buildXMLRequest() == null ) alert("Browser is not supported!");

}


RemoteRequest.prototype.timeout = function(t) {
	t *= 1000
	var req = this;
	req.timeoutFunc = setTimeout(
		function() {
			if( req && req.xmlhttp ) {
				req.cancelled = true;
				req.abort();
				if( req.abtCallback ) {
					req.abtCallback(req);
				}
			}
		},
		t
	);
}

RemoteRequest.prototype.abortCallback = function(func) {
	this.abtCallback = func;
}

RemoteRequest.prototype.event = function(evt) {
	if( arguments.length > 0 )
		this.evt = evt;
	return this.evt;
}

RemoteRequest.prototype.abort = function() {
	if( this.xmlhttp ) {
		/* this has to come before abort() or IE will puke on you */
		this.xmlhttp.onreadystatechange = function(){};
		this.xmlhttp.abort();
	}
}

/* constructs our XMLHTTPRequest object */
RemoteRequest.prototype.buildXMLRequest = function() {
	this.xmlhttp = buildXMLRequest();
	return true;
}


function buildXMLRequest() {
    try {
	    return new XMLHttpRequest();
    } catch(e) {
	    try { 
		    return new ActiveXObject("Msxml2.XMLHTTP"); 
	    } catch (e2) {
		    try { 
			    return new ActiveXObject("Microsoft.XMLHTTP"); 
		    } catch (e3) {
		        alert("NEEDS NEWER JAVASCRIPT for XMLHTTPRequest()");
                return null;
		    }
	    }
    }
}


function _remoteRequestCallback(id) {

	var object = _allrequests[id];
	if(object.cancelled) return;

	if( object.xmlhttp.readyState == 4 ) {

        try {
            object.duration = new Date().getTime() - object.sendTime;
            dump('request ' + object.id + ': duration = ' + object.duration + ' ms\n');
        } catch(ee){}

		try {
			object.callback(object);
		} catch(E) {
            throw E
		} finally { 
			destroyRequest(object); 
			object = null; 
		}  
	}
}


/* define the callback we use when this request has received
	all of its data */
RemoteRequest.prototype.setCompleteCallback = function(callback) {
	if(this.cancelled) return;
	this.callback = callback;
	var id = this.id;
	this.xmlhttp.onreadystatechange = function() { _remoteRequestCallback(id); }
}


/* http by default.  This makes it https. *ONLY works when
	embedded in a XUL app. */
RemoteRequest.prototype.setSecure = function(bool) {
	this.secure = bool; 
}

RemoteRequest.prototype.send = function(blocking) {

	if(this.cancelled) return;

	/* determine the xmlhttp server dynamically */
	var url = location.protocol + "//" + location.host + "/" + XML_HTTP_GATEWAY;

	if(isXUL()) {
		if( XML_HTTP_SERVER ) 
			url = 'http://'+XML_HTTP_SERVER+'/'+XML_HTTP_GATEWAY;

		if( url.match(/^http:/) && 
				(this.secure || location.href.match(/^https:/)) ) {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			url = url.replace(/^http:/, 'https:');
		}
	}

	var data = null;
	if( this.type == 'GET' ) url +=  "?" + this.param_string; 

	this.url = url;

   //if( isXUL() ) dump('request URL = ' + url + '?' + this.param_string + '\n');

	try {

		if(blocking) this.xmlhttp.open(this.type, url, false);
		else this.xmlhttp.open(this.type, url, true);
		
	} catch(E) {
		alert("Fatal error opening XMLHTTPRequest for URL:\n" + url + '\n' + E);
		return;
	}

	if( this.type == 'POST' ) {
		data = this.param_string;
		this.xmlhttp.setRequestHeader('Content-Type',
				'application/x-www-form-urlencoded');
	}

	try {
		var auth;
		try { dojo.require('dojo.cookie'); auth = dojo.cookie(COOKIE_SES) } catch(ee) {}
		if( isXUL() ) auth = fetchXULStash().session.key;
		if( auth ) 
			this.xmlhttp.setRequestHeader('X-OILS-Authtoken', auth);

	} catch(e) {}

	if(data && data.match(/param=undefined/)) {
		/* we get a bogus param .. replace with NULL */
		try{dump('!+! UNDEFINED PARAM IN QUERY: ' + this.service + ' : ' + this.method+'\n');}catch(r){}
		data = data.replace(/param=undefined/g,'param=null');
	}


    this.sendTime = new Date().getTime();
	try{ this.xmlhttp.send( data ); } catch(e){}

	return this;
}

/* returns the actual response text from the request */
RemoteRequest.prototype.getText = function() {
	return this.xmlhttp.responseText;
}

RemoteRequest.prototype.isReady = function() {
	return this.xmlhttp.readyState == 4;
}


/* returns the JSON->js result object  */
RemoteRequest.prototype.getResultObject = function() {

	if(this.cancelled) return null;
	if(!this.xmlhttp) return null;

	var failed = false;
	var status = null;
	this.event(null);

	/*
	try {
		dump(this.url + '?' + this.param_string + '\n' +
			'Returned with \n\tstatus = ' + this.xmlhttp.status + 
			'\n\tpayload= ' + this.xmlhttp.responseText + '\n');
	} catch(e) {}
	*/

	try {
		status = this.xmlhttp.status;
		if( status != 200 ) failed = true;
	} catch(e) { failed = true; }

	if( failed ) {
		if(!status) status = '<unknown>';
		try{dump('! NETWORK FAILURE.  HTTP STATUS = ' +status+'\n'+this.param_string+'\n');}catch(e){}
		if(isXUL()) 
			throw new NetworkFailure(status, this.param_string);
		else return null;
	}

	var text = this.xmlhttp.responseText;

	//try{if(getDebug()) _debug('response: ' + text + '\n')}catch(e){}

	if(text == "" || text == " " || text == null) {
		try { dump('dbg: Request returned no text!\n'); } catch(E) {}
		if(isXUL()) 
			throw new NetworkFailure(status, this.param_string);
		return null;
	}

	var obj = JSON2js(text);
	if(!obj) return null;

	if( obj.status != 200 ) {

		var str = 'A server error occurred. Debug information follows: ' +
					'\ncode = '		+ obj.status + 
					'\ndebug: '		+ obj.debug + 
					'\npayload: '	+ js2JSON(obj.payload); 

		if(isXUL()) {
			dump(str);
			throw obj;

		} else {
			_debug(str);
			throw str;
		}
	}

	var payload = obj.payload;
	if(!payload || payload.length == 0) return null;
	payload = (payload.length == 1) ? payload[0] : payload;

	if(!isXUL()) {
		if( checkILSEvent(payload) ) {
			this.event(payload);
			if( this.alertEvent ) {
				alertILSEvent(payload);
				return null;
			}
		} 
	}

	return payload;
}

/* adds a new parameter to the request */
RemoteRequest.prototype.addParam = function(param) {
	var string = encodeURIComponent(js2JSON(param));
	this.param_string += "&param=" + string;
}

function fetchXULStash() {
	if( isXUL() ) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var __OILS = new Components.Constructor("@mozilla.org/openils_data_cache;1", "nsIOpenILS");
			var data_cache = new __OILS( );
			return data_cache.wrappedJSObject.OpenILS.prototype.data;
	
		} catch(E) {
			_debug('Error in OpenILS.data._debug_stash(): ' + js2JSON(E) );
		}
	}
	return {};
}



/* these events should be used by all */

window.onunload = windowUnload;

attachEvt("common", "init", loadUIObjects);
//attachEvt("common", "init", initParams);
attachEvt("common", "init", initCookies);

attachEvt("common", "unload", _tree_killer);
try{ attachEvt("common", "unload", cleanRemoteRequests);} catch(e){}

function init() {

	initParams();

	if( getLocation() == null && getOrigLocation() != null )
		LOCATION = getOrigLocation();

	if( getLocation() == null && getOrigLocation() == null )
		LOCATION = globalOrgTree.id();

	/* if they click on the home page and the origlocation is set
		take the opac back to the origlocation */
	if( findCurrentPage() == HOME && getOrigLocation() != null )
		LOCATION = getOrigLocation();

	if(getDepth() == null) DEPTH = findOrgDepth(getLocation());


	runEvt('common','init');

	var cgi = new CGI();
	if( grabUser() ) {
		if( cgi.param(PARAM_LOCATION) == null ) {
			var org = G.user.prefs[PREF_DEF_LOCATION];
			var depth = G.user.prefs[PREF_DEF_DEPTH];

			if(org == null) org = G.user.ws_ou();
			if(depth == null) depth = findOrgDepth(org);

			LOCATION = org;
			DEPTH = depth;
		}
	}

	runEvt("common", "run");
	//checkUserSkin();

	var loc = findOrgLasso(getLasso());
	if (!loc) loc = findOrgUnit(getLocation());

	if (getLasso()) G.ui.common.now_searching.appendChild(text('Search group: '));
	G.ui.common.now_searching.appendChild(text(loc.name()));
}

function windowUnload() { runEvt("common", "unload"); }
/**
* This function should return a URL which points to the book cover image based on ISBN.
*/


function buildISBNSrc(isbn, size) {
	size = (size) ? size : 'small';
	var protocol = (OILS_OPAC_STATIC_PROTOCOL) ? OILS_OPAC_STATIC_PROTOCOL + ':' : location.protocol;
    if(OILS_OPAC_IMAGES_HOST)
        return protocol + '//' + OILS_OPAC_IMAGES_HOST + size + '/' + isbn;
	return '../../../../extras/ac/jacket/'+size+'/'+isbn;
}      


function acMakeURL(type, key) {
	return '../../../../extras/ac/' + type + '/html/' + key;
}


function acCollectData( key, callback ) {
	var context = { key : key, callback: callback, data : {} };
	acCollectItem(context, 'summary');
	acCollectItem(context, 'reviews');
	acCollectItem(context, 'toc');
	acCollectItem(context, 'excerpt');
	acCollectItem(context, 'anotes');
}

function acCheckDone(context) {
	if(	context.data.reviews && context.data.reviews.done &&
			context.data.toc		&& context.data.toc.done &&
			context.data.excerpt && context.data.excerpt.done &&
			context.data.anotes	&& context.data.anotes.done ) {

		if(context.callback) context.callback(context.data);
	}
}

function acCollectItem(context, type) {
	var req = buildXMLRequest();
	req.open('GET', acMakeURL(type, context.key), true);
	req.onreadystatechange = function() {
		if( req.readyState == 4 ) {
			context.data[type] = { done : true }

			if(IE) {

				/* Someone please explain why IE treats status 404 as status 200?? 
					On second thought, don't bother.
				*/
				if( ! req.responseText.match(
					/The requested URL.*was not found on this server/) )
					context.data[type].html = req.responseText;

			} else {
				if( req.status != 404 ) 
					context.data[type].html = req.responseText;
			}
			acCheckDone(context);
		}
	}
	req.send(null);
}


