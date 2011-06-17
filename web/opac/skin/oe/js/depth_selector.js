
attachEvt( "common", "locationChanged", updateLoc );

var _ds;
var _libselspan;
var _libselslink;
var _dselspan;
var _newlocation = null;

function depthSelInit() {
	_ds = $('depth_selector'); 
	_ds.onchange = depthSelectorChanged;
	_libselspan = $('lib_selector_span');
	_libsellink = $('lib_selector_link');
	_dselspan = $('depth_selector_span');

	if( getLocation() == globalOrgTree.id() ) {
		unHideMe( _libselspan );
		_libsellink.onclick = _opacHandleLocationTagClick;
	} else {
		unHideMe( _dselspan );
		buildLocationSelector();
	}

	setSelector(_ds,	getDepth());
	_newlocation = getLocation();
}


var orgTreeIsBuilt = false;
function _opacHandleLocationTagClick() {

	swapCanvas(G.ui.common.org_container);

	if(!orgTreeIsBuilt) {
		drawOrgTree();
		orgTreeIsBuilt = true;
	}

}

function depthSelGetDepth() {
	var depth = parseInt(_ds.options[_ds.selectedIndex].value);
	if(isNaN(depth)) depth = 0;
	return depth;
}

function depthSelectorChanged() {
	var i = _ds.selectedIndex;
	if( i == _ds.options.length - 1 ) {
		setSelector( _ds, getDepth() );
		_opacHandleLocationTagClick();
	} else { 
		/* this re-submits the search when they change the search range
			disabled for testing...
			*/
		/*runEvt('common', 'depthChanged');*/ 
	}
}

var chooseAnotherNode;
function buildLocationSelector(newLoc) {

	var loc;
	if(newLoc != null) loc = newLoc;
	else loc = getLocation();

	if( loc == globalOrgTree.id() ) return;

	var selector = _ds;
	if(!chooseAnotherNode) 
		chooseAnotherNode = selector.removeChild(
			selector.getElementsByTagName("option")[0]);
	var node = chooseAnotherNode;
	removeChildren(selector);
	
	var location = findOrgUnit(loc);
	var type;
	if (location) type = findOrgType(location.ou_type());

	var orgHiding = checkOrgHiding();
	while( type && location ) {
		var n = node.cloneNode(true);	
		n.setAttribute("value", type.depth());
		removeChildren(n);
		n.appendChild(text(type.opac_label()));
		selector.appendChild(n);
		location = findOrgUnit(location.parent_ou());
		if(location) {
			type = findOrgType(location.ou_type());
			if (orgHiding && orgHiding.depth > type.depth()) {
				type = null;
			}
		} else {
			type = null;
		}
	}

	selector.appendChild(node);
}

function getNewSearchDepth() { return newSearchDepth; }
function getNewSearchLocation() { return (isNull(_newlocation)) ? LOCATION : _newlocation; }
function depthSelGetNewLoc() { return getNewSearchLocation(); }

function updateLoc(location, depth) {
	if( depth != null ) {
		if(depth != 0 ){
			_libsellink.onclick = _opacHandleLocationTagClick;
			if( location == globalOrgTree.id() ) {
				hideMe( _dselspan );
				unHideMe( _libselspan );
			} else {
				buildLocationSelector(location);
				hideMe( _libselspan );
				unHideMe( _dselspan );
			}
		}

		setSelector(_ds, depth);
		newSearchDepth = depth;
	}

	_newlocation = location;
	runEvt('common','locationUpdated', location);
}



