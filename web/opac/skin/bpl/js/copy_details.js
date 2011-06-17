var cpdTemplate;
var cpdCounter = 0;
var cpdNodes = {};

/* showDueDate will show the due date in the OPAC */
var showDueDate = false;
/* showDueTime will show the due time (hours and minutes) in the OPAC;
   if showDueDate is false, then showDueTime has no effect
*/
var showDueTime = false;

function cpdBuild( contextTbody, contextRow, record, callnumber, orgid, depth, copy_location, already_fetched_copies, peer_types ) {
	var i = cpdCheckExisting(contextRow);
	if(i) return i;

	var counter = cpdCounter++;

	/* yank out all of the template rows */
	if(!cpdTemplate) cpdTemplate = $('rdetail_volume_details_row');
	var templateRow = cpdTemplate.cloneNode(true);
	templateRow.id = 'cpd_row_' + counter;

	/* shove a dummy a tag in before the context previous sibling */
	/*
	contextTbody.insertBefore( 
		elem('a',{name:'slot_'+templateRow.id}), contextRow.previousSibling);
	goTo('#slot_'+templateRow.id);
	*/

	if(isXUL()) {
		/* unhide before we unhide/clone the parent */
		unHideMe($n(templateRow, 'age_protect_label'));
		unHideMe($n(templateRow, 'create_date_label'));
		unHideMe($n(templateRow, 'holdable_label'));
	}

	if (isXUL() || showDueDate) {
		unHideMe($n(templateRow, 'due_date_label'));
	}

	unHideMe(templateRow);

	var print = $n(templateRow,'print');
	print.onclick = function() { cpdBuildPrintPane(
		contextRow, record, callnumber, orgid, depth) };
    if (callnumber == null) {
        addCSSClass(print,'hide_me');
    }

	var mainTbody = $n(templateRow, 'copies_tbody');
	var extrasRow = mainTbody.removeChild($n(mainTbody, 'copy_extras_row'));

    var request_args = {
        peer_types      : peer_types, /* indexed the same as already_fetched_copies */
        contextTbody	: contextTbody, /* tbody that holds the contextrow */
        contextRow		: contextRow, /* the row our new row will be inserted after */
        record			: record,
        callnumber		: callnumber, 
        orgid				: orgid,
        depth				: depth,
        templateRow		: templateRow, /* contains everything */
        copy_location		: copy_location,
        mainTbody		: mainTbody, /* holds the copy rows */
        extrasRow		: extrasRow, /* wrapper row for all extras */
        counter			: counter
    }

    if (! already_fetched_copies) {
        var req = new Request(FETCH_COPIES_FROM_VOLUME, record.doc_id(), callnumber, orgid);
        req.callback(cpdDrawCopies);

        req.request.args = request_args;

        req.send();
    } else {
        setTimeout(
            function() {
                delete request_args['copy_location'];
                cpdDrawCopies({
                    'args' : request_args,
                    'getResultObject' : function() { return already_fetched_copies; }
                });
            }, 0
        );
    }

	if( contextRow.nextSibling ) 
		contextTbody.insertBefore( templateRow, contextRow.nextSibling );
	else
		contextTbody.appendChild( templateRow );
	_debug('creating new details row with id ' + templateRow.id);
	cpdNodes[templateRow.id] = { templateRow : templateRow };
	return templateRow.id;
}


function cpdBuildPrintWindow(record, orgid) {
	var div = $('rdetail_print_details').cloneNode(true);
	div.id = "";

	$n(div, 'lib').appendChild(text(findOrgUnit(orgid).name()));
	$n(div, 'title').appendChild(text(record.title()));
	$n(div, 'author').appendChild(text(record.author()));
	$n(div, 'edition').appendChild(text(record.edition()));
	$n(div, 'pubdate').appendChild(text(record.pubdate()));
	$n(div, 'publisher').appendChild(text(record.publisher()));
	$n(div, 'phys').appendChild(text(record.physical_description()));

	return div;
}

function cpdStylePopupWindow(div) {
	var tds = div.getElementsByTagName('td');
	for( var i = 0; i < tds.length ; i++ ) {
		var td = tds[i];
		var sty = td.getAttribute('style');
		if(!sty) sty = "";
		td.setAttribute('style', sty + 'padding: 2px; border: 1px solid #F0F0E0;');
		if( td.className && td.className.match(/hide_me/) ) 
			td.parentNode.removeChild(td);
	}
}


/* builds a friendly print window for this CNs data */
function cpdBuildPrintPane(contextRow, record, cn, orgid, depth) {

	var div = cpdBuildPrintWindow( record, orgid);

    var whole_cn_text = (cn[0] ? cn[0] + ' ' : '') + cn[1] + (cn[2] ? ' ' + cn[2] : '');
	$n(div, 'cn').appendChild(text(whole_cn_text));

	unHideMe($n(div, 'copy_header'));

	var subtbody = $n(contextRow.nextSibling, 'copies_tbody');
	var rows = subtbody.getElementsByTagName('tr');

	for( var r = 0; r < rows.length; r++ ) {
		var row = rows[r];
		if(!row) continue;
		var name = row.getAttribute('name');
		if( name.match(/extras_row/) ) continue; /* hide the copy notes, stat-cats */
		var clone = row.cloneNode(true);
		var links = clone.getElementsByTagName('a');
		for( var i = 0; i < links.length; i++ ) 
			links[i].style.display = 'none';

		$n(div, 'tbody').appendChild(clone);
	}

	cpdStylePopupWindow(div);
	openWindow( div.innerHTML);
}



/* hide any open tables and if we've already 
	fleshed this cn, just unhide it */
function cpdCheckExisting( contextRow ) {

	var existingid;
	var next = contextRow.nextSibling;

	if( next && next.getAttribute('templateRow') ) {
		var obj = cpdNodes[next.id];
		if(obj.templateRow.className.match(/hide_me/)) 
			unHideMe(obj.templateRow);
		else hideMe(obj.templateRow);
		existingid = next.id;
	}

	if(existingid) _debug('row exists with id ' + existingid);

	for( var o in cpdNodes ) {
		var node = cpdNodes[o];
		if( existingid && o == existingid ) continue;
		hideMe(node.templateRow);
		removeCSSClass(node.templateRow.previousSibling, 'rdetail_context_row');
	}

	addCSSClass(contextRow, 'rdetail_context_row');
	if(existingid) return existingid;
	return null;
}

/*
function cpdFetchCopies(r) {
	var args = r.args;
	args.cn	= r.getResultObject();
	var req = new Request(FETCH_COPIES_FROM_VOLUME, args.cn.id());
	req.request.args = args;
	req.callback(cpdDrawCopies);
	req.send();
}
*/

function cpdDrawCopies(r) {

	var copies		= r.getResultObject();
	var args			= r.args;
	var copytbody	= $n(args.templateRow, 'copies_tbody');
	var copyrow		= copytbody.removeChild($n(copytbody, 'copies_row'));

	if(isXUL()) {
		/* unhide before we unhide/clone the parent */
		unHideMe($n(copyrow, 'age_protect_value'));
		unHideMe($n(copyrow, 'create_date_value'));
		unHideMe($n(copyrow, 'copy_holdable_td'));
	}

	if(isXUL() || showDueDate) {
		unHideMe($n(copyrow, 'copy_due_date_td'));
	}

	for( var i = 0; i < copies.length; i++ ) {
		var row = copyrow.cloneNode(true);
		var copyid = copies[i];
        var pt; if (args.peer_types) pt = args.peer_types[i];
        if (typeof copyid != 'object') {
            var req = new Request(FETCH_FLESHED_COPY, copyid);
            req.callback(cpdDrawCopy);
            req.request.args = r.args;
            req.request.row = row;
            req.send();
        } else {
            setTimeout(
                function(copy,row,pt) {
                    return function() {
                        cpdDrawCopy({
                            'getResultObject' : function() { return copy; },
                            'args' : r.args,
                            'peer_type' : pt,
                            'row' : row
                        });
                    };
                }(copies[i],row,pt), 0
            );
        }
		copytbody.appendChild(row);
	}
}

function cpdDrawCopy(r) {
	var copy = r.getResultObject();
	var row  = r.row;
	var pt   = r.peer_type;
    var trow = r.args.templateRow;

    if (r.args.copy_location && copy.location().name() != r.args.copy_location) {
        hideMe(row);
        return;
    }

    // Make barcode more useful for staff client usage
    if(isXUL()) {
        var my_a = document.createElement('a');
        my_a.appendChild(text(copy.barcode()));
        my_a.setAttribute("href","javascript:void(0);");
        my_a.onclick = function() {
            xulG.new_tab(xulG.urls.XUL_COPY_STATUS, {}, {'from_item_details_new': true, 'barcodes': [copy.barcode()]});
		};
        $n(row, 'barcode').appendChild(my_a);
    }
    else {
    	$n(row, 'barcode').appendChild(text(copy.barcode()));
    }

    /* show the peer type*/
    if (pt) {
        $n(row, 'barcode').appendChild(text(' :: ' + pt));
    }

	$n(row, 'location').appendChild(text(copy.location().name()));
	$n(row, 'status').appendChild(text(copy.status().name()));

    // append comma-separated list of part this copy is linked to
    if(copy.parts() && copy.parts().length) {
        unHideMe($n(trow, 'copy_part_label'));
        unHideMe($n(row, 'copy_part'));
        for(var i = 0; i < copy.parts().length; i++) {
            var part = copy.parts()[i];
            var node = $n(row, 'copy_part');
            if(i > 0) node.appendChild(text(','));
            node.appendChild(text(part.label()));
        }
    }

    /* show the other bibs link */
    if (copy.peer_record_maps().length > 0) {
        var l = $n(row, 'copy_multi_home');
        unHideMe(l);
        var link_args = {};
        link_args.page = RRESULT;
        link_args[PARAM_RTYPE] = RTYPE_LIST;
        link_args[PARAM_RLIST] = new Array();
        for (var i = 0; i < copy.peer_record_maps().length; i++) {
            link_args[PARAM_RLIST].push( copy.peer_record_maps()[i].peer_record() );
        }
        l.setAttribute('href',buildOPACLink(link_args));
    }

	if(isXUL()) {
		/* show the hold link */
		var l = $n(row, 'copy_hold_link');
		unHideMe(l);
		l.onclick = function() {
			holdsDrawEditor( 
				{ 
					type			: 'C',
					copyObject	: copy,
					onComplete	: function(){}
				}
			);
		}

		/* show the book now link */
		l = $n(row, 'copy_reserve_link');
		unHideMe(l);
		l.onclick = function() {
			// XXX FIXME this duplicates things in cat/util.js
			// Also needs i18n
			dojo.require("fieldmapper.Fieldmapper");
			var r = fieldmapper.standardRequest(
				["open-ils.booking",
					"open-ils.booking.resources.create_from_copies"],
				[G.user.session, [copy.id()]]
			);
			if (!r) {
				alert("No response from server!");
			} else if (r.ilsevent != undefined) {
				alert("Error from server:\n" + js2JSON(r));
			} else {
				xulG.auth = {"session": {"key": G.user.session}};
				xulG.bresv_interface_opts = {"booking_results": r};
				location.href = "/eg/booking/reservation";
			}
		}

		if( copy.age_protect() ) 
			appendClear($n(row, 'age_protect_value'), text(copy.age_protect().name()));

		var cd = copy.create_date();
		cd = cd.replace(/T.*/, '');
		$n(row, 'create_date_value').appendChild(text(cd));

		var yes = $('rdetail.yes').innerHTML;
		var no = $('rdetail.no').innerHTML;

		if( isTrue(copy.holdable()) &&
				isTrue(copy.location().holdable()) &&
				isTrue(copy.status().holdable()) ) {
			$n(row, 'copy_is_holdable').appendChild(text(yes));	
		} else {
			$n(row, 'copy_is_holdable').appendChild(text(no));	
		}
	}

	if (isXUL() || showDueDate) {
		var circ;
		if( copy.circulations() ) {
			circ = copy.circulations()[0];
			if( circ ) {
                                var due_time = dojo.date.stamp.fromISOString(circ.due_date());
                                if( showDueTime ) {
                                        $n(row, 'copy_due_date').appendChild(text(dojo.date.locale.format(due_time, {"formatLength": "medium"})));
                                } else {
                                        $n(row, 'copy_due_date').appendChild(text(dojo.date.locale.format(due_time, {"selector": "date", "formatLength": "medium"})));
                                }
			}
		}
	}

	r.args.copy = copy;
	r.args.copyrow = row;
	cpdShowNotes(copy, r.args)
	cpdShowStats(copy, r.args);

}

function _cpdExtrasInit(args) {

	var newrid	= 'extras_row_' + args.copy.barcode();
	var newrow	= $(newrid);
	if(!newrow) newrow = args.extrasRow.cloneNode(true);
	var tbody	= $n(newrow, 'extras_tbody');
	var rowt		= $n(tbody, 'extras_row');
	newrow.id	= newrid;

	var cr = args.copyrow;
	var nr = cr.nextSibling;
	var np = args.mainTbody;

	/* insert the extras row into the main table */
	if(nr) np.insertBefore( newrow, nr );
	else np.appendChild(newrow);

	var link = $n(args.copyrow, 'details_link');
	var link2 = $n(args.copyrow, 'less_details_link');
	var id = newrow.id;
	link.id = id + '_morelink';
	link2.id = id + '_lesslink';
	unHideMe(link);
	hideMe(link2);

	link.setAttribute('href', 
			'javascript:unHideMe($("'+link2.id+'")); hideMe($("'+link.id+'"));unHideMe($("'+newrow.id+'"));');

	link2.setAttribute('href', 
			'javascript:unHideMe($("'+link.id+'")); hideMe($("'+link2.id+'"));hideMe($("'+newrow.id+'"));');

	return [ tbody, rowt ];
}

function cpdShowNotes(copy, args) {
	var notes = copy.notes();
	if(!notes || notes.length == 0) return;

	var a = _cpdExtrasInit(args);
	var tbody = a[0];
	var rowt = a[1];

	for( var n in notes ) {
		var note = notes[n];
		if(!isTrue(note.pub())) continue;
		var row = rowt.cloneNode(true);
		$n(row, 'key').appendChild(text(note.title()));
		$n(row, 'value').appendChild(text(note.value()));
		unHideMe($n(row, 'note'));
		unHideMe(row);
		tbody.appendChild(row);
	}
}


function cpdShowStats(copy, args) {
	var entries = copy.stat_cat_entry_copy_maps();
	if(!entries || entries.length == 0) return;

	var visibleStatCat = false;

	/*
		check all copy stat cats; if we find one that's OPAC visible,
		set the flag and break the loop. If we've found one, or we're
		in the staff client, build the table. if not, we return doing
		nothing, as though the stat_cat_entry_copy_map was empty or null
	*/

	for( var n in entries )
	{
			var entry = entries[n];
			if(isTrue(entry.stat_cat().opac_visible()))
			{
				visibleStatCat = true;
				break;
			}
	}

	if(!(isXUL() || visibleStatCat)) return;

	var a = _cpdExtrasInit(args);
	var tbody = a[0];
	var rowt = a[1];

	for( var n in entries ) {
		var entry = entries[n];
		if(!(isXUL() || isTrue(entry.stat_cat().opac_visible()))) continue;
		var row = rowt.cloneNode(true);
		$n(row, 'key').appendChild(text(entry.stat_cat().name()));
		$n(row, 'value').appendChild(text(entry.stat_cat_entry().value()));
		unHideMe($n(row, 'cat'));
		unHideMe(row);
		tbody.appendChild(row);
	}
}

