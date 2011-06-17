var records = new Array();
var table;
var rowtemplate;
var rresultLimit = 200;
var resultFacetKey;

var rresultIsPaged = false;

function rresultUnload() { removeChildren(table); table = null;}

attachEvt("common", "unload", rresultUnload);
attachEvt("common", "run", rresultDoSearch);
attachEvt("result", "idsReceived", rresultCollectRecords); 
attachEvt("result", "recordDrawn", rresultLaunchDrawn); 

hideMe($('copyright_block')); 

function rresultDoSearch() {

	swapCanvas($('loading_alt'));

	table = G.ui.result.main_table;
	hideMe(G.ui.result.row_template);
	if( table && table.parentNode ) {
		while( table.parentNode.rows.length <= (getDisplayCount() +1) ) 
			hideMe(table.appendChild(G.ui.result.row_template.cloneNode(true)));
	}
	rresultCollectIds();
}

function rresultCollectIds() {
	var ids;


    var holdTarget = new CGI().param('hold_target');
    if(holdTarget != null) {
        rresultHandlePlaceHold(holdTarget);
        return;
    }

    var rtype = getRtype();
    if (rtype && rtype.indexOf('|') > -1)
        rtype = rtype.substring(0,rtype.indexOf('|'));

	switch(rtype) {

		case RTYPE_COOKIE:
			ids = JSON2js(dojo.cookie(COOKIE_RIDS));
			_rresultHandleIds( ids, ids.length );
			break;

		case RTYPE_TITLE:
		case RTYPE_AUTHOR:
		case RTYPE_SUBJECT:
		case RTYPE_SERIES:
		case RTYPE_KEYWORD:
			rresultDoRecordSearch();
			break;

		case RTYPE_MULTI:
			rresultDoRecordMultiSearch();
			break;
			
		case RTYPE_LIST :
			rresultHandleList();
			break;

		case RTYPE_MARC :
			rresultCollectMARCIds();
			break;

		case RTYPE_ISBN :
			rresultCollectISBNIds();
			break;

		case RTYPE_TCN :
			rresultCollectTCNIds();
			break;

		case RTYPE_ISSN :
			rresultCollectISSNIds();
			break;


		case RTYPE_MRID :
		case null :
		case "" :
		default:
			var form = rresultGetForm();
			var args = { format : form, org : getLocation(), depth : rresultGetDepth() };

			var lasso = getLasso();
			if (lasso) args.org = -lasso;

			var req = new Request(FETCH_RIDS, getMrid(), args);
			req.callback( rresultHandleRIds );
			req.send();

			if( rresultGetDepth() != findOrgDepth(globalOrgTree) ) {
				var link = $('rresult_show_all_link');
				if(link) {
					unHideMe($('rresult_show_all'));
					link.appendChild( text(
						findOrgType(globalOrgTree.ou_type()).opac_label()));
				}

			} else {
				if( rresultGetDepth() != getDepth() ) { /* inside a limited display */
					var link = $('rresult_show_here_link');
					if(link) {
						link.appendChild( text(
							findOrgType(findOrgUnit(getLocation()).ou_type()).opac_label()));
						unHideMe($('rresult_show_here'));
					}
				}
			}
	}
}

function rresultExpandSearch() {
	var args = {};
	args[PARAM_RDEPTH] = findOrgDepth(globalOrgTree);
	goTo(buildOPACLink(args));
}

function rresultContractSearch() {
	var args = {};
	RDEPTH = null;
	args[PARAM_OFFSET] = 0;
	goTo(buildOPACLink(args));
}


function rresultGetDepth() {
	if( getRdepth() != null) return getRdepth();
	return getDepth();
}


function rresultGetForm() {
	var form;

	if(getTform())  /* did the user select a format from the icon list (temporary) */
		form = (getTform() == 'all') ? null : getTform();
	else  /* did the use select a format from simple search dropdown */
		form = (getForm() == 'all') ? null : getForm();

	if(!form) { /* did the user select a format from the advanced search */
		form = getItemType();
		var f = getItemForm();

		if(form) {
			form = form.replace(/,/,'');
			if(f) form += '-' + f;
		} else {
			if(f) form = '-' + f;
		}
	}

	return form;
}


function rresultCollectMARCIds() {

	var args			= {};
	args.searches	= JSON2js(getSearches());
	args.limit		= 200;
	args.org_unit	= globalOrgTree.id();
	args.depth		= 0;

	rresultIsPaged = true;
	var req = new Request(FETCH_ADV_MARC_MRIDS, args, getDisplayCount(), getOffset());
	req.callback(rresultHandleRIds);
	req.request.noretry = true;
	req.send();
}


function rresultCollectISBNIds() {
	var req = new Request(FETCH_ADV_ISBN_RIDS, getAdvTerm() );
	req.callback(
		function(r) {
			var blob = r.getResultObject();
			_rresultHandleIds(blob.ids, blob.count);
		}
	);
	req.send();
}

function rresultCollectTCNIds() {
	var req = new Request(FETCH_ADV_TCN_RIDS, getAdvTerm() );
	req.callback(
		function(r) {
			var blob = r.getResultObject();
			_rresultHandleIds(blob.ids, blob.count);
		}
	);
	req.send();
}

function rresultCollectISSNIds() {
	var req = new Request(FETCH_ADV_ISSN_RIDS, getAdvTerm() );
	req.callback(
		function(r) {
			var blob = r.getResultObject();
			_rresultHandleIds(blob.ids, blob.count);
		}
	);
	req.send();
}

function rresultHandleList() {
	var ids = new CGI().param(PARAM_RLIST);
    var count;
    if(!dojo.isArray(ids)) {
        count = 1;
        ids = [ids];
    } else {
        count = ids.length;
    }
	if(ids) _rresultHandleIds(ids, count);
}

var rresultTries = 0;
function rresultHandleRIds(r) {
	var res = r.getResultObject();

	if(!res) res = {count:0,ids:[]};

	if( res.count == 0 && rresultTries == 0 && ! r.noretry) {

		rresultTries++;
		var form = rresultGetForm();
		var args = { format : form, org : getLocation(), depth : findOrgDepth(globalOrgTree) };

		var lasso = getLasso();
		if (lasso) args.org = -lasso;

		var req = new Request(FETCH_RIDS, getMrid(), args );
		req.callback( rresultHandleRIds );
		req.send();
		unHideMe($('no_formats'));
		hideMe($('rresult_show_all'));

	} else {

		_rresultHandleIds(res.ids, res.count);
	}
}

function _rresultHandleIds(ids, count) {
	//var json = js2JSON({ids:ids,count:count});
	/*
	dojo.cookie(COOKIE_SRIDS, json, {'expires':1});
	*/

	HITCOUNT = parseInt(count);
	runEvt('result', 'hitCountReceived');
	runEvt('result', 'idsReceived', ids, getOffset());
}

/*
function rresultCollectRecords(ids) {
	runEvt("result", "preCollectRecords");
	var x = 0;
	for( var i = getOffset(); i!= getDisplayCount() + getOffset(); i++ ) {
		if(ids[i] == null) break;
		var req = new Request(FETCH_RMODS, parseInt(ids[i]));
		req.callback(rresultHandleMods);
		req.request.userdata = x++;
		req.send();
	}
}
*/


function rresultCollectRecords(ids, base) {
	runEvt("result", "preCollectRecords");
	var x = 0;

    // don't perform rdetail redirect if user was on rdetail and cliecked Back
    if(findCurrentPage() == RRESULT && isXUL()) {
        if(ids.length == 1 && !xulG.fromBack) {
            var args = {};
            args.page = RDETAIL;
            args[PARAM_OFFSET] = 0;
            args[PARAM_RID] = ids[0];
            location.href = buildOPACLink(args);
        }
    }

	if (!base) base = 0;
	if( rresultIsPaged )  base = 0;

	for( var i = base; i!= getDisplayCount() + base; i++ ) {
		if(ids[i] == null) break;
		var req = new Request(FETCH_RMODS, parseInt(ids[i]));
		req.callback(rresultHandleMods);
		req.request.userdata = x++;
		req.send();
	}
}


var recsReceivedCalled = false;
function rresultHandleMods(r) {
	var rec = r.getResultObject();
	runEvt('result', 'recordReceived', rec, r.userdata, false);
	resultCollectCopyCounts(rec, r.userdata, FETCH_R_COPY_COUNTS);
	if(resultPageIsDone() && !recsReceivedCalled) {
        recsReceivedCalled = true;
		runEvt('result', 'allRecordsReceived', recordsCache);
		unHideMe($('copyright_block')); 
	}
}

function rresultLaunchDrawn(id, node) {
	runEvt("rresult", "recordDrawn", id, node);
}


function rresultDoRecordSearch() { 
	rresultIsPaged = true;
	resultCollectSearchIds(true, SEARCH_RS_QUERY, rresultFilterSearchResults ); 
}

function rresultDoRecordMultiSearch() { 
	rresultIsPaged = true;
	resultCollectSearchIds(false, SEARCH_RS_QUERY, rresultFilterSearchResults ); 
}


function rresultFilterSearchResults(r) {
	var result = r.getResultObject();
	var ids = [];
	if( result.count > 0 ) {
		for( var i = 0; i != result.ids.length; i++ ) 
			ids.push(result.ids[i][0]);
	}

    resultFacetKey = result.facet_key;
    resultCompiledSearch = result.compiled_search;
    dojo.require('dojo.cookie');
    dojo.cookie(COOKIE_SEARCH, js2JSON(result.compiled_search));
	_rresultHandleIds( ids, result.count );
}


function rresultHandlePlaceHold(target) {
    function reload() {
        location.href = location.href.replace(/&hold_target=\d+/, '');
    }
    attachEvt("common", "holdUpdated", reload);
    attachEvt("common", "holdUpdateCanceled", reload);
    attachEvt("common", "loginCanceled", reload);
    holdsDrawEditor({record:target, type: 'T'});
}

