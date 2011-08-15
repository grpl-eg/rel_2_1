dojo.require('dojo.data.ItemFileReadStore');
dojo.require('dijit.form.Form');
dojo.require('dijit.form.Textarea');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dijit.form.ComboBox');
dojo.require('dijit.form.NumberSpinner');
dojo.require('fieldmapper.IDL');
dojo.require('openils.PermaCrud');
dojo.require('openils.widget.AutoGrid');
dojo.require('openils.widget.AutoFieldWidget');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.form.Button');
dojo.require('dojo.date');
dojo.require('openils.CGI');
dojo.require('openils.XUL');
dojo.require('openils.Util');
dojo.require('openils.Event');

dojo.requireLocalization('openils.actor', 'register');
var localeStrings = dojo.i18n.getLocalization('openils.actor', 'register');


var pcrud;
var fmClasses = ['au', 'ac', 'aua', 'actsc', 'asv', 'asvq', 'asva'];
var fieldDoc = {};
var statCats;
var statCatTemplate;
var surveys;
var staff;
var patron;
var uEditUsePhonePw = false;
var widgetPile = [];
var uEditCardVirtId = -1;
var uEditAddrVirtId = -1;
var orgSettings = {};
var userSettings = {};
var userSettingsToUpdate = {};
var userSettingTypes;
var tbody;
var addrTemplateRows;
var cgi;
var cloneUser;
var cloneUserObj;
var stageUser;
var optInSettings;
var allCardsTemplate;
var uEditCloneCopyAddr; // if true, copy addrs on clone instead of link
var homeOuTypes = {};

var dupeUsrname = false;
var dupeBarcode = false;

if(!window.xulG) var xulG = null;
var lock_ready = false;
var already_locked = false;

function load() {
    staff = new openils.User().user;
    pcrud = new openils.PermaCrud();
    cgi = new openils.CGI();
    cloneUser = cgi.param('clone');
    var userId = cgi.param('usr');
    var stageUname = cgi.param('stage');

    saveButton.attr("label", localeStrings.SAVE);
    saveCloneButton.attr("label", localeStrings.SAVE_CLONE);
    replaceBarcode.attr("label", localeStrings.REPLACE_BARCODE);
    dojo.byId('uedit-show-required').innerHTML = localeStrings.SHOW_REQUIRED;
    dojo.byId('uedit-show-suggested').innerHTML = localeStrings.SHOW_SUGGESTED;
    dojo.byId('uedit-show-all').innerHTML = localeStrings.SHOW_ALL;
    dojo.byId('uedit-dupe-barcode-warning').innerHTML = localeStrings.BARCODE_IN_USE;
    allCards.attr("label", localeStrings.SEE_ALL);
    dojo.byId('uedit-dupe-username-warning').innerHTML = localeStrings.DUPE_USERNAME;
    generatePassword.attr("label", localeStrings.RESET_PASSWORD);
    dojo.byId('verifyPassword').innerHTML = localeStrings.VERIFY_PASSWORD;
    dojo.byId('parentGuardian').innerHTML = localeStrings.PARENT_OR_GUARDIAN;
    dojo.byId('userSettings').innerHTML = localeStrings.USER_SETTINGS;
    dojo.byId('statCats').innerHTML = localeStrings.STAT_CATS;

    dojo.query("td[name='addressHeader']").forEach( function(item) { item.innerHTML = localeStrings.ADDRESS_HEADER; });
    dojo.query("span[name='mailingAddress']").forEach( function(item) { item.innerHTML = localeStrings.ADDRESS_MAILING; });
    dojo.query("span[name='billingAddress']").forEach( function(item) { item.innerHTML = localeStrings.ADDRESS_BILLING; });
    dojo.query("span[name='addressPending']").forEach( function(item) { item.innerHTML = localeStrings.ADDRESS_PENDING; });
    dojo.query("button[name='approve-button']").forEach( function(item) { item.innerHTML = localeStrings.ADDRESS_APPROVE; });
    dojo.query("span[name='address-already-owned']").forEach( function(item) { item.innerHTML = localeStrings.ADDRESS_OWNED; });
    dojo.query("button[name='addressNew']").forEach( function(item) { item.innerHTML = localeStrings.ADDRESS_NEW; });

    if(xulG) {
	    if(xulG.ses) openils.User.authtoken = xulG.ses;
	    if(typeof xulG.clone != 'undefined') cloneUser = xulG.clone;
        if(typeof xulG.usr != 'undefined') userId = xulG.usr
        if(typeof xulG.params != 'undefined') {
            var parms = xulG.params;
	        if(typeof parms.ses != 'undefined') 
                openils.User.authtoken = parms.ses;
	        if(typeof parms.clone != 'undefined') 
                cloneUser = parms.clone;
            if(typeof parms.usr != 'undefined')
                userId = parms.usr;
            if(typeof parms.stage != 'undefined')
                stageUname = parms.stage
        }
    }

    orgSettings = fieldmapper.aou.fetchOrgSettingBatch(staff.ws_ou(), [
        'global.password_regex',
        'global.juvenile_age_threshold',
        'patron.password.use_phone',
        'ui.patron.default_inet_access_level',
        'ui.patron.default_ident_type',
        'ui.patron.default_country',
        'ui.patron.registration.require_address',
        'circ.holds.behind_desk_pickup_supported',
        'circ.patron_edit.clone.copy_address',
        'ui.patron.edit.au.second_given_name.show',
        'ui.patron.edit.au.second_given_name.suggest',
        'ui.patron.edit.au.suffix.show',
        'ui.patron.edit.au.suffix.suggest',
        'ui.patron.edit.au.alias.show',
        'ui.patron.edit.au.alias.suggest',
        'ui.patron.edit.au.dob.require',
        'ui.patron.edit.au.dob.show',
        'ui.patron.edit.au.dob.suggest',
        'ui.patron.edit.au.dob.calendar',
        'ui.patron.edit.au.juvenile.show',
        'ui.patron.edit.au.juvenile.suggest',
        'ui.patron.edit.au.ident_value.show',
        'ui.patron.edit.au.ident_value.suggest',
        'ui.patron.edit.au.ident_value2.show',
        'ui.patron.edit.au.ident_value2.suggest',
        'ui.patron.edit.au.email.require',
        'ui.patron.edit.au.email.show',
        'ui.patron.edit.au.email.suggest',
        'ui.patron.edit.au.email.regex',
        'ui.patron.edit.au.email.example',
        'ui.patron.edit.au.day_phone.require',
        'ui.patron.edit.au.day_phone.show',
        'ui.patron.edit.au.day_phone.suggest',
        'ui.patron.edit.au.day_phone.regex',
        'ui.patron.edit.au.day_phone.example',
        'ui.patron.edit.au.evening_phone.require',
        'ui.patron.edit.au.evening_phone.show',
        'ui.patron.edit.au.evening_phone.suggest',
        'ui.patron.edit.au.evening_phone.regex',
        'ui.patron.edit.au.evening_phone.example',
        'ui.patron.edit.au.other_phone.require',
        'ui.patron.edit.au.other_phone.show',
        'ui.patron.edit.au.other_phone.suggest',
        'ui.patron.edit.au.other_phone.regex',
        'ui.patron.edit.au.other_phone.example',
        'ui.patron.edit.phone.regex',
        'ui.patron.edit.phone.example',
        'ui.patron.edit.au.active.show',
        'ui.patron.edit.au.active.suggest',
        'ui.patron.edit.au.barred.show',
        'ui.patron.edit.au.barred.suggest',
        'ui.patron.edit.au.master_account.show',
        'ui.patron.edit.au.master_account.suggest',
        'ui.patron.edit.au.claims_returned_count.show',
        'ui.patron.edit.au.claims_returned_count.suggest',
        'ui.patron.edit.au.claims_never_checked_out_count.show',
        'ui.patron.edit.au.claims_never_checked_out_count.suggest',
        'ui.patron.edit.au.alert_message.show',
        'ui.patron.edit.au.alert_message.suggest',
        'ui.patron.edit.aua.post_code.regex',
        'ui.patron.edit.aua.post_code.example',
        'ui.patron.edit.aua.county.require',
        'format.date',
        'ui.patron.edit.default_suggested'
    ]);

    for(k in orgSettings)
        if(orgSettings[k])
            orgSettings[k] = orgSettings[k].value;

    uEditCloneCopyAddr = orgSettings['circ.patron_edit.clone.copy_address'];
    uEditUsePhonePw = orgSettings['patron.password.use_phone'];
    uEditFetchUserSettings(userId);

    if(userId) {
        patron = uEditLoadUser(userId);
    } else {
        if(stageUname) {
            patron = uEditLoadStageUser(stageUname);
        } else {
            patron = uEditNewPatron();
            if(cloneUser) 
                uEditCopyCloneData(patron);
        }
    }


    var list = pcrud.search('fdoc', {fm_class:fmClasses});
    for(var i in list) {
        var doc = list[i];
        if(!fieldDoc[doc.fm_class()])
            fieldDoc[doc.fm_class()] = {};
        fieldDoc[doc.fm_class()][doc.field()] = doc;
    }

    list = pcrud.search('aout', {can_have_users: 'true'});
    for(var i in list) {
        var type = list[i];
        homeOuTypes[type.id()] = true;
    }

    tbody = dojo.byId('uedit-tbody');

    if(orgSettings['ui.patron.edit.default_suggested'])
        uEditToggleRequired(2);

    addrTemplateRows = dojo.query('tr[type=addr-template]', tbody);
    dojo.forEach(addrTemplateRows, function(row) { row.parentNode.removeChild(row); } );
    statCatTemplate = tbody.removeChild(dojo.byId('stat-cat-row-template'));
    surveyTemplate = tbody.removeChild(dojo.byId('survey-row-template'));
    surveyQuestionTemplate = tbody.removeChild(dojo.byId('survey-question-row-template'));

    checkGrpAppPerm(); // to do the initial load
    loadStaticFields();


    if(patron.isnew() && patron.addresses().length == 0) 
        uEditNewAddr(null, uEditAddrVirtId, true);
    else loadAllAddrs();
    loadStatCats();
    loadSurveys();
    checkClaimsReturnCountPerm();
    checkClaimsNoCheckoutCountPerm();

    dojo.connect(replaceBarcode, 'onClick', replaceCardHandler);
    dojo.connect(allCards, 'onClick', drawAllCards);
    dojo.connect(clearAlert, 'onClick', clearMessage);
    dojo.connect(genISM, 'onClick', replaceISMCard);
    dojo.connect(suffixSelector, 'onChange', updateSuffix);

    if(patron.cards().length > 1)
        dojo.removeClass(dojo.byId('uedit-all-barcodes'), 'hidden');

    var input = findWidget('ac', 'barcode');
    if (patron.isnew()) {
        replaceBarcode.attr('disabled', true);
    } else {
        input.widget.attr('disabled', true).attr('readOnly', true);
    }

	dojo.connect(generatePassword, 'onClick', generatePasswordHandler);

    if(!patron.isnew() && !checkGrpAppPerm(patron.profile()) && patron.id() != openils.User.user.id()) {
        // we are not allowed to edit this user, so disable the save option
        saveButton.attr('disabled', true);
        saveCloneButton.attr('disabled', true);
    }
        
    lock_ready = true;

    // we'll use this to hide features between systems
    if (staff.ws_ou() > 9 && staff.ws_ou() < 18)
	dojo.removeClass(dojo.byId('ISMbutton'),"hidden");
	
}

var permGroups;
var noPermGroups = [];
// Returns true if the user is allowed to edit the selected group
function checkGrpAppPerm(grpId) {

    if(!permGroups) {

        // get the groups
        permGroups = new openils.PermaCrud().retrieveAll('pgt');
        var permGroupPerms = []

        // collect the group permissions
        dojo.forEach(permGroups, 
            function(grp) {
                if(grp.application_perm())
                    permGroupPerms.push(grp.application_perm());
            }
        );

        // see which of the group application perms I do not have
        var myPerms = fieldmapper.standardRequest(
            ['open-ils.actor', 'open-ils.actor.user.has_work_perm_at.batch'],
            [openils.User.authtoken, permGroupPerms]
        );

        var failedPerms = [];
        for(var p in myPerms) { 
            if(myPerms[p].length == 0) 
                failedPerms.push(p); 
        }

        // identify which groups I cannot edit because I do not have permisssion

        function checkTree(grp, failed) {
            failed = failed || failedPerms.indexOf(grp.application_perm()) > -1;
            if(failed) noPermGroups.push(grp.id()+'');
            dojo.forEach(
                permGroups.filter(function(g) { return g.parent() == grp.id() } ),
                function(child) {
                    checkTree(child, failed);
                }
            );
        }

        checkTree(permGroups.filter(function(g) { return g.parent() == null })[0]);
    }

    return noPermGroups.indexOf(grpId+'') == -1;
}


function drawAllCards() {

    var tbody = dojo.byId('uedit-all-cards-tbody');
    if(!allCardsTemplate) {
        allCardsTemplate = tbody.removeChild(dojo.byId('uedit-all-cards-tr-template'));
    } else {
        while(tbody.childNodes[0])
            tbody.removeChild(tbody.childNodes[0]);
    }

    var first = true;
    dojo.forEach(
        [patron.card()].concat(patron.cards()), // grab the main card first
        function(card) {
            if(!first) {
                if(card.id() == patron.card().id())
                    return;
            }
            var row = allCardsTemplate.cloneNode(true);
            getByName(row, 'barcode').innerHTML = card.barcode();
	    getByName(row, 'creator').innerHTML = card.creator();
	    getByName(row, 'create_date').innerHTML = card.create_date();
            getByName(row, 'active').appendChild(
                openils.Util.isTrue(card.active()) ? 
                    dojo.byId('true').cloneNode(true) :
                    dojo.byId('false').cloneNode(true)
            ); 
            if (openils.Util.isTrue(card.active())){
                var act = new dijit.form.ToggleButton({label:"Disable", onClick: function() {disableCard(card.id());} },"disableButton");
                getByName(row, 'state').appendChild(act.domNode);
            }else{
                var act = new dijit.form.Button({label:"Enable", onClick: function() {enableCard(card.id());} },"enableButton");
                getByName(row, 'state').appendChild(act.domNode);
            }
            if (!first) {
                var pri = new dijit.form.Button({label:"Make Primary", onClick: function() {makePrimaryCard(card.id());} },"primaryButton");
                getByName(row, 'primary').appendChild(pri.domNode);
            }


            tbody.appendChild(row);
            first = false;
        }
    );

    allCardsDialog.show();
}

function disableCard(id) {
    var old = patron.cards().filter(function(c){return (c.id() == id)})[0];
    old.active('f');
    old.ischanged(1);
    dojo.removeClass(dojo.byId('changesPending'),"hidden");
}

function enableCard(id) {
    var old = patron.cards().filter(function(c){return (c.id() == id)})[0];
    old.active('t');
    old.ischanged(1);
    dojo.removeClass(dojo.byId('changesPending'),"hidden");
}

function makePrimaryCard(id) {
    patron.card().id(id);
    patron.ischanged(1);
    dojo.removeClass(dojo.byId('changesPending'),"hidden");
}


function clearMessage(){
    var input = findWidget('au', 'alert_message');
    input.widget.attr('disabled', false).attr('readOnly', false).attr('value', null).focus();
}

function updateSuffix(){
    var suffix = findWidget('au', 'suffix');
    suffix.widget.attr('value',dojo.byId("suffixSelector").value);
}

function replaceISMCard(){
    var input = findWidget('ac', 'barcode');
    var rnd = Math.floor(Math.random()*999999);
    rnd = '555'+rnd;
    input.widget.attr('disabled', false).attr('readOnly', true).attr('value', rnd).focus();

    var profile = findWidget('au', 'profile');
    profile.widget.attr('value',71);

    var old = patron.cards().filter(function(c){return (c.id() == patron.card().id())})[0];
    old.active('f');
    old.ischanged(1);

    var newc = new fieldmapper.ac();
    newc.id(uEditCardVirtId--);
    newc.isnew(1);
    newc.active('t');
    patron.card(newc);
    var t = patron.cards();
        if (!t) { t = []; }
        t.push(newc);
        patron.cards(t);
}

/**
 * Mark the current card inactive, create a new primary card
 */
function replaceCardHandler() {
    var input = findWidget('ac', 'barcode');
    input.widget.attr('disabled', false).attr('readOnly', false).attr('value', null).focus();
    replaceBarcode.attr('disabled', true);
    
    // pull old card off the cards list so we don't have a dupe sitting in there
    var old = patron.cards().filter(function(c){return (c.id() == patron.card().id())})[0];
    old.active('f');
    old.ischanged(1);

    var newc = new fieldmapper.ac();
    newc.id(uEditCardVirtId--);
    newc.isnew(1);
    newc.active('t');
    patron.card(newc);
    var t = patron.cards();
        if (!t) { t = []; }
        t.push(newc);
        patron.cards(t);
}

/**
 * Generate a random password for the patron.
 */
function generatePasswordHandler() {
	uEditMakeRandomPw(patron);
	var f = findWidget('au', 'passwd');
	f.widget.attr('value', patron.passwd());
	f = findWidget('au', 'passwd2');
	f.widget.attr('value', patron.passwd());
}

/**
 * Loads a staged user and turns them into something the editor can understand
 */
function uEditLoadStageUser(stageUname) {

    var data = fieldmapper.standardRequest(
        ['open-ils.actor', 'open-ils.actor.user.stage.retrieve.by_username'],
        { params : [openils.User.authtoken, stageUname] }
    );

    stageUser = data.user;
    patron = uEditNewPatron();

    if(!stageUser) 
        return patron;

    // copy the data into our new user object
    for(var key in fieldmapper.IDL.fmclasses.stgu.field_map) {
        if(fieldmapper.IDL.fmclasses.au.field_map[key] && !fieldmapper.IDL.fmclasses.stgu.field_map[key].virtual) {
            if(data.user[key]() !== null)
                patron[key]( data.user[key]() );
        }
    }

    // copy the data into our new address objects
    // TODO: uses the first mailing address only
    if(data.mailing_addresses.length) {

        var mail_addr = new fieldmapper.aua();
        mail_addr.id(-1); // virtual ID
        mail_addr.usr(-1);
        mail_addr.isnew(1);
        patron.mailing_address(mail_addr);
        var t = patron.addresses();
            if (!t) { t = []; }
            t.push(mail_addr);
            patron.addresses(t);

        for(var key in fieldmapper.IDL.fmclasses.stgma.field_map) {
            if(fieldmapper.IDL.fmclasses.aua.field_map[key] && !fieldmapper.IDL.fmclasses.stgma.field_map[key].virtual) {
                if(data.mailing_addresses[0][key]() !== null)
                    mail_addr[key]( data.mailing_addresses[0][key]() );
            }
        }
    }
    
    // copy the data into our new address objects
    // TODO uses the first billing address only
    if(data.billing_addresses.length) {

        var bill_addr = new fieldmapper.aua();
        bill_addr.id(-2); // virtual ID
        bill_addr.usr(-1);
        bill_addr.isnew(1);
        patron.billing_address(bill_addr);
        var t = patron.addresses();
            if (!t) { t = []; }
            t.push(bill_addr);
            patron.addresses(t);

        for(var key in fieldmapper.IDL.fmclasses.stgba.field_map) {
            if(fieldmapper.IDL.fmclasses.aua.field_map[key] && !fieldmapper.IDL.fmclasses.stgba.field_map[key].virtual) {
                if(data.billing_addresses[0][key]() !== null)
                    bill_addr[key]( data.billing_addresses[0][key]() );
            }
        }
    }

    // TODO: uses the first card only
    if(data.cards.length) {
        var card = new fieldmapper.ac();
        card.id(-1); // virtual ID
        patron.card().barcode(data.cards[0].barcode());
    }

    return patron;
}

/*
 * clone the home org, phone numbers, and billing/mailing address
 */
function uEditCopyCloneData(patron) {
    cloneUserObj = uEditLoadUser(cloneUser);

    var cloneFields = [
        'home_ou', 
        'day_phone', 
        'evening_phone', 
        'other_phone',
        'usrgroup'
    ];

    if(!uEditCloneCopyAddr) 
        cloneFields = cloneFields.concat(['mailing_address', 'billing_address']);

    dojo.forEach(
        cloneFields, 
        function(field) {
            patron[field](cloneUserObj[field]());
        }
    );

    if(uEditCloneCopyAddr) {
        var billAddr, mailAddr;

        // copy the billing and mailing addresses into new addresses
        function cloneAddr(addr) {
            var newAddr = addr.clone();
            newAddr.isnew(true);
            newAddr.id(uEditAddrVirtId--);
            newAddr.usr(patron.id());
            patron.addresses().push(newAddr);
            return newAddr;
        }

        if(billAddr = cloneUserObj.billing_address()) 
            patron.billing_address(cloneAddr(billAddr));

        if(mailAddr = cloneUserObj.mailing_address()) {
            if (billAddr && billAddr.id() == mailAddr.id()) {
                patron.mailing_address(patron.billing_address());
            } else {
                patron.mailing_address(cloneAddr(mailAddr));
            }
        }

        if(!billAddr) // if there was no billing addr, use the mailing addr
            patron.billing_address(patron.mailing_address());

    } else {

        // link the billing and mailing addresses
        if(patron.billing_address()) {
            var t = patron.addresses();
                if (!t) { t = []; }
                t.push(patron.billing_address());
                patron.addresses(t);
        }

        if(patron.mailing_address() && (
                patron.addresses().length == 0 || 
                patron.mailing_address().id() != patron.billing_address().id()) ) {
            var t = patron.addresses();
                if (!t) { t = []; }
                t.push(patron.mailing_address());
                patron.addresses(t);
        }
    }
}


function uEditFetchUserSettings(userId) {
    
    var baseNode = fieldmapper.aou.findOrgUnit(staff.ws_ou());
    var orgs = fieldmapper.aou.orgNodeTrail(baseNode);
    orgs = orgs.map(function(node) { return node.id(); });

    /* fetch any user setting types we need + any that offer opt-in */
    userSettingTypes = pcrud.search('cust', {
        '-or' : [
            {name:['circ.holds_behind_desk']}, 
            {name : {
                'in': {
                    select : {atevdef : ['opt_in_setting']}, 
                    from : 'atevdef',
                    // we only care about opt-in settings for event_defs our users encounter
                    where : {'+atevdef' : {owner : orgs}}
                }
            }}
        ]
    });

    var names = userSettingTypes.map(function(obj) { return obj.name() });

    /* fetch any values set for this user */
    if(userId) {
        userSettings = fieldmapper.standardRequest(
            ['open-ils.actor', 'open-ils.actor.patron.settings.retrieve.authoritative'],
            {params : [openils.User.authtoken, userId, names]});
    }
}


function uEditLoadUser(userId) {
    var patron = fieldmapper.standardRequest(
        ['open-ils.actor', 'open-ils.actor.user.fleshed.retrieve.authoritative'],
        {params : [openils.User.authtoken, userId]}
    );
    openils.Event.parse_and_raise(patron);
    return patron;
}

function loadStaticFields() {
    for(var idx = 0; tbody.childNodes[idx]; idx++) {
        var row = tbody.childNodes[idx];
        if(row.nodeType != row.ELEMENT_NODE) continue;
        var fmcls = row.getAttribute('fmclass');
        if(fmcls) {
            fleshFMRow(row, fmcls);
        } else {

            if(row.id == 'uedit-settings-divider') {

                var template = tbody.removeChild(dojo.byId('uedit-user-setting-template'));
                dojo.forEach(userSettingTypes, function(type) { uEditDrawSettingRow(tbody, row, template, type); } );

                if(userSettingTypes.length > 1 || orgSettings['circ.holds.behind_desk_pickup_supported']) {
                    openils.Util.show('uedit-settings-divider', 'table-row');
                }
            }
        }
    }
}

function uEditDrawSettingRow(tbody, dividerRow, template, stype) {
    var row = template.cloneNode(true);
    row.setAttribute('user_setting', stype.name());
    getByName(row, 'label').innerHTML = stype.label();
    var cb = new dijit.form.CheckBox({scrollOnFocus:false}, getByName(row, 'widget'));
    cb.attr('value', userSettings[stype.name()]);
    dojo.connect(cb, 'onChange', function(newVal) { userSettingsToUpdate[stype.name()] = newVal; });
    tbody.insertBefore(row, dividerRow.nextSibling);
    openils.Util.show(row, 'table-row');
}

function uEditUpdateUserSettings(userId) {
    return fieldmapper.standardRequest(
        ['open-ils.actor', 'open-ils.actor.patron.settings.update'],
        {params : [openils.User.authtoken, userId, userSettingsToUpdate]});
}

function loadAllAddrs() {
    dojo.forEach(patron.addresses(),
        function(addr) {
            uEditNewAddr(null, addr.id());
        }
    );
}

function loadStatCats() {

    statCats = fieldmapper.standardRequest(
        ['open-ils.circ', 'open-ils.circ.stat_cat.actor.retrieve.all'],
        {params : [openils.User.authtoken, staff.ws_ou()]}
    );

    // draw stat cats
    for(var idx in statCats) {
        var stat = statCats[idx];
        var row = statCatTemplate.cloneNode(true);
        row.id = 'stat-cat-row-' + idx;
        row.setAttribute('stat_cat_owner',stat.owner());
        row.setAttribute('stat_cat_name',stat.name());
        row.setAttribute('stat_cat_id',stat.id());
        if (stat.id() == 19 || stat.id() == 20 ) //MIEG:  GRPL requires these two
                row.setAttribute('required','required');
        tbody.appendChild(row);
        getByName(row, 'name').innerHTML = stat.name();
        var valtd = getByName(row, 'widget');
        var span = valtd.appendChild(document.createElement('span'));
        var store = new dojo.data.ItemFileReadStore(
                {data:fieldmapper.actsc.toStoreData(stat.entries())});
        var comboBox = new dijit.form.ComboBox({store:store,scrollOnFocus:false,fetchProperties:{sort:[{attribute: 'value'}]}}, span);
        comboBox.labelAttr = 'value';
        comboBox.searchAttr = 'value';

        comboBox._wtype = 'statcat';
        comboBox._statcat = stat.id();
        widgetPile.push(comboBox); 

        // populate existing cats
        var map = patron.stat_cat_entries().filter(
            function(mp) { return (mp.stat_cat() == stat.id()) })[0];
        if(map) comboBox.attr('value', map.stat_cat_entry()); 

    }
}

function loadSurveys() {

    surveys = fieldmapper.standardRequest(
        ['open-ils.circ', 'open-ils.circ.survey.retrieve.all'],
        {params : [openils.User.authtoken]}
    );

    // draw surveys
    for(var idx in surveys) {
        var survey = surveys[idx];
        var required = openils.Util.isTrue(survey.required());
        var srow = surveyTemplate.cloneNode(true);
        if(required) srow.setAttribute('required','required');
        tbody.appendChild(srow);
        getByName(srow, 'name').innerHTML = survey.name();

        for(var q in survey.questions()) {
            var quest = survey.questions()[q];
            var qrow = surveyQuestionTemplate.cloneNode(true);
            if(required) qrow.setAttribute('required','required');
            tbody.appendChild(qrow);
            getByName(qrow, 'question').innerHTML = quest.question();

            var span = getByName(qrow, 'answers').appendChild(document.createElement('span'));
            var store = new dojo.data.ItemFileReadStore(
                {data:fieldmapper.asva.toStoreData(quest.answers())});
            var select = new dijit.form.FilteringSelect({store:store,scrollOnFocus:false}, span);
            if (! required ) {
                select.isValid = function() { return true; };
            }
            select.labelAttr = 'answer';
            select.searchAttr = 'answer';

            select._wtype = 'survey';
            select._survey = survey.id();
            select._question = quest.id();
            widgetPile.push(select); 
        }
    }
}


function fleshFMRow(row, fmcls, args) {
    var fmfield = row.getAttribute('fmfield');
    var wclass = row.getAttribute('wclass');
    var wstyle = row.getAttribute('wstyle');
    var wconstraints = row.getAttribute('wconstraints');
    /* use CSS to set the zindex for widgets you want to disable. */
    var disabled = dojo.style(row, 'zIndex') == -1 ? true : false;
    var isphone = (fmcls == 'au') && (fmfield.search('_phone') != -1);

    var isPasswd2 = (fmfield == 'passwd2');
    if(isPasswd2) fmfield = 'passwd';
    var fieldIdl = fieldmapper.IDL.fmclasses[fmcls].field_map[fmfield];
    if(!args) args = {};

    var existing = dojo.query('td', row);
    var htd = existing[0] || row.appendChild(document.createElement('td'));
    var ltd = existing[1] || row.appendChild(document.createElement('td'));
    var wtd = existing[2] || row.appendChild(document.createElement('td'));
    var ftd = existing[3] || row.appendChild(document.createElement('td'));

    openils.Util.addCSSClass(htd, 'uedit-help');
    if(fieldDoc[fmcls] && fieldDoc[fmcls][fmfield]) {
        var link = dojo.byId('uedit-help-template').cloneNode(true);
        link.id = '';
        link.onclick = function() { ueLoadContextHelp(fmcls, fmfield) };
        openils.Util.removeCSSClass(link, 'hidden');
        htd.appendChild(link);
    }

    if(!ltd.textContent) {
        ltd.appendChild(document.createTextNode(fieldIdl.label));
    }

    if(!ftd.textContent) {
        if(orgSettings['ui.patron.edit.' + fmcls + '.' + fmfield + '.example']) {
            ftd.appendChild(document.createTextNode(localeStrings.EXAMPLE + orgSettings['ui.patron.edit.' + fmcls + '.' + fmfield + '.example']));
        }
        else if(isphone && orgSettings['ui.patron.edit.phone.example']) {
            ftd.appendChild(document.createTextNode(localeStrings.EXAMPLE + orgSettings['ui.patron.edit.phone.example']));
        }
        else if(fieldIdl.datatype == 'timestamp') {
            ftd.appendChild(document.createTextNode(localeStrings.EXAMPLE + dojo.date.locale.format(new Date(1970,0,31),{selector: "date", fullYear: true, datePattern: (orgSettings['format.date'] ? orgSettings['format.date'] : null)})));
        }
    }

    var span = document.createElement('span');
    wtd.appendChild(span);

    var fmObject = null;
    switch(fmcls) {
        case 'au' : fmObject = patron; break;
        case 'ac' : fmObject = patron.card(); break;
        case 'aua' : 
            fmObject = patron.addresses().filter(
                function(i) { return (i.id() == args.addr) })[0];
            if(fmObject && fmObject.usr() != patron.id())
                disabled = true;
            break;
    }

    // Adjust required value by org settings
    var curRequired = row.getAttribute('required');
    var required = curRequired == 'required';
    if(orgSettings['ui.patron.edit.' + fmcls + '.' + fmfield + '.require']) {
        row.setAttribute('required', 'required');
        required = true;
    }
    else if (curRequired != 'required' && orgSettings['ui.patron.edit.' + fmcls + '.' + fmfield + '.show']) {
        row.setAttribute('required', 'show');
    }
    else if (curRequired != 'required' && curRequired != 'show' && orgSettings['ui.patron.edit.' + fmcls + '.' + fmfield + '.suggest']) {
        row.setAttribute('required', 'suggested');
    }

    // password data is not fetched/required/displayed for existing users
    if(!patron.isnew() && 'passwd' == fmfield)
        required = false;

    var dijitArgs = {
        style: wstyle, 
        required : required,
        constraints : (wconstraints) ? eval('('+wconstraints+')') : {}, // the ()'s prevent Invalid Label errors with eval
        disabled : disabled
    };

    // Org settings provided regex?
    if(orgSettings['ui.patron.edit.' + fmcls + '.' + fmfield + '.regex']) {
        dijitArgs.regExp = orgSettings['ui.patron.edit.' + fmcls + '.' + fmfield + '.regex'];
    }
    else if(isphone && orgSettings['ui.patron.edit.phone.regex']) {
        dijitArgs.regExp = orgSettings['ui.patron.edit.phone.regex'];
    }

    if(fmcls == 'au' && fmfield == 'passwd') {
        if (orgSettings['global.password_regex']) {
            dijitArgs.regExp = orgSettings['global.password_regex'];
        }
    }

    if(fmcls == 'au' && fmfield == 'dob' && !orgSettings['ui.patron.edit.au.dob.calendar'])
        dijitArgs.popupClass = "";

    var value = row.getAttribute('wvalue');
    if(value !== null)
        dijitArgs.value = value;

    var wargs = {
        idlField : fieldIdl,
        fmObject : fmObject,
        fmClass : fmcls,
        parentNode : span,
        widgetClass : wclass,
        dijitArgs : dijitArgs,
        orgDefaultsToWs : true,
        orgLimitPerms : ['UPDATE_USER'],
    };

    if(fmfield == 'profile') {
        // fetch profile groups non-async so existing expire_date is
        // not overwritten when the profile groups arrive and update
        wargs.forceSync = true;
        wargs.disableQuery = {usergroup : 'f'};
        if(!patron.isnew() && !checkGrpAppPerm(patron.profile()))
            wargs.readOnly = true;
    } else {
        wargs.forceSync = false;
    }

    var widget = new openils.widget.AutoFieldWidget(wargs);
    widget.build(
        function(w, ww) {
            if(fmfield == 'profile') { trimGrpTree(ww); }
        }
    );

    // now put it back before we register the widget
    if(isPasswd2) fmfield = 'passwd2';

    widget._wtype = fmcls;
    widget._fmfield = fmfield;
    widget._addr = args.addr;
    widgetPile.push(widget);
    attachWidgetEvents(fmcls, fmfield, widget);
    return widget;
}

function trimGrpTree(autoWidget) {
    var store = autoWidget.widget.store;
    if(!store) return;
    // remove all groups that this user are not allowed to edit, 
    // except the profile group of an existing user
    store.fetch({onItem : 
        function(item) {
            if(!checkGrpAppPerm(item.id[0]) && patron.profile() != item.id[0])
                store.deleteItem(item);
        }
    });
}

function findWidget(wtype, fmfield, callback) {
    return widgetPile.filter(
        function(i){
            if(i._wtype == wtype && i._fmfield == fmfield) {
                if(callback) return callback(i);
                return true;
            }
        }
    ).pop();
}

/**
 * if the user does not have the UPDATE_PATRON_CLAIM_RETURN_COUNT, 
 * they are not allowed to directly alter the claim return count. 
 * This function checks the perm and disable/enables the widget.
 */
function checkClaimsReturnCountPerm() {
    new openils.User().getPermOrgList(
        'UPDATE_PATRON_CLAIM_RETURN_COUNT',
        function(orgList) { 
            var cr = findWidget('au', 'claims_returned_count');
            if(orgList.indexOf(patron.home_ou()) == -1) 
                cr.widget.attr('disabled', true);
            else
                cr.widget.attr('disabled', false);
        },
        true, 
        true
    );
}


function checkClaimsNoCheckoutCountPerm() {
    new openils.User().getPermOrgList(
        'UPDATE_PATRON_CLAIM_NEVER_CHECKED_OUT_COUNT',
        function(orgList) { 
            var cr = findWidget('au', 'claims_never_checked_out_count');
            if(orgList.indexOf(patron.home_ou()) == -1) 
                cr.widget.attr('disabled', true);
            else
                cr.widget.attr('disabled', false);
        },
        true, 
        true
    );
}


function attachWidgetEvents(fmcls, fmfield, widget) {

    dojo.connect(
        widget.widget,
        'onKeyPress',
        function(ev){
            netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
            if (!(ev.altKey || ev.ctrlKey || ev.metaKey)) {
                if (lock_ready && xulG && typeof xulG.lock_tab == 'function') {
                    if (! already_locked) {
                        xulG.lock_tab();
                        already_locked = true;
                    }
                }
            }
        }
    );
    dojo.connect(
        widget.widget,
        'onChange',
        function(){
            if (lock_ready && xulG && typeof xulG.lock_tab == 'function') {
                if (! already_locked) {
                    xulG.lock_tab();
                    already_locked = true;
                }
            }
        }
    );


    if(fmcls == 'ac') {
        if(fmfield == 'barcode') {
            dojo.connect(widget.widget, 'onChange',
                function() {
                    var barcode = this.attr('value');
//MIEG: TADL Michigan ID to barcode voodo
if (barcode.length > 22){
	if (barcode.length == 25) {var bc = barcode.substr(0,13);}
	if (barcode.length == 23) {var bc = barcode.substr(0,11);}
	var dob = findWidget('au', 'dob');
	var ident = findWidget('au', 'ident_value');
	var id_type = findWidget('au', 'ident_type');
	if (barcode.length == 25) {
		var bc = barcode.substr(0,13);
		if (!dob.widget.attr('value')){
			var y = barcode.substr(13,4);
			var m = barcode.substr(17,2);
			var d = barcode.substr(19,2);
			var bdate = new Date(y,m-1,d);
			dob.widget.attr('value',bdate);
		}
		if (!ident.widget.attr('value'))
                	ident.widget.attr('value',bc);
        	id_type.widget.attr('value',1);	
	}
	if (barcode.length == 23) {
		var bc = barcode.substr(0,11);
		if (!dob.widget.attr('value')){
                        var y = barcode.substr(11,4);
                        var m = barcode.substr(15,2);
                        var d = barcode.substr(17,2);
			var bdate = new Date(y,m-1,d);
                        dob.widget.attr('value',bdate);
                }
                if (!ident.widget.attr('value'))
                        ident.widget.attr('value',bc);
                id_type.widget.attr('value',4);
	}
	bc = bc.toLowerCase();
	this.attr('value',bc);
}
                    dupeBarcode = false;
                    dojo.addClass(dojo.byId('uedit-dupe-barcode-warning'), 'hidden');
                    fieldmapper.standardRequest(
                        ['open-ils.actor', 'open-ils.actor.barcode.exists'],
                        {
                            params: [openils.User.authtoken, barcode],
                            oncomplete : function(r) {
                                var res = openils.Util.readResponse(r);
                                if(res == '1') {
                                    dupeBarcode = true;
                                    dojo.removeClass(dojo.byId('uedit-dupe-barcode-warning'), 'hidden');
                                } else {
                                    dupeBarcode = false;
                                    dojo.addClass(dojo.byId('uedit-dupe-barcode-warning'), 'hidden');
                                    var un = findWidget('au', 'usrname');
                                    if(!un.widget.attr('value'))
                                        un.widget.attr('value', barcode);
                                }
                            }
                        }
                    );
                }
            );
            return;
        }
    }

    if(fmcls == 'au') {
        switch(fmfield) {

            case 'usrname':
                dojo.connect(widget.widget, 'onChange', 
                    function() {
                        var input = findWidget('au', 'usrname');
                        var usrname = input.widget.attr('value');

                        if(!usrname) {
                            dupeUsrname = false;
                            dojo.addClass(dojo.byId('uedit-dupe-username-warning'), 'hidden');
                            return;
                        }

                        fieldmapper.standardRequest(
                            ['open-ils.actor', 'open-ils.actor.username.exists'],
                            {
                                params: [openils.User.authtoken, usrname],
                                oncomplete : function(r) {
                                    var res = openils.Util.readResponse(r);
                                    if(res) {
                                        dupeUsrname = true;
                                        dojo.removeClass(dojo.byId('uedit-dupe-username-warning'), 'hidden');
                                    } else {
                                        dupeUsrname = false;
                                        dojo.addClass(dojo.byId('uedit-dupe-username-warning'), 'hidden');
                                    }
                                }
                            }
                        );
                    }   
                );

                return;

            case 'profile': // when the profile changes, update the expire date
                dojo.connect(widget.widget, 'onChange', 
                    function() {
                        var self = this;
                        var expireWidget = findWidget('au', 'expire_date');
                        function found(items) {
                            if(items.length == 0) return;
                            var item = items[0];
                            var interval = self.store.getValue(item, 'perm_interval');
                            expireWidget.widget.attr('value', dojo.date.add(new Date(), 
                                'second', openils.Util.intervalToSeconds(interval)));
                        }
                        this.store.fetch({onComplete:found, query:{id:this.attr('value')}});
                    }
                );
                return;
//MIEG: GRPL 3 year max expire limit
	   case 'expire_date':
		dojo.connect(widget.widget, 'onChange',
		    function() {
			//MIEG: change to suit
			if (staff.ws_ou() < 10 || staff.ws_ou() > 17) return;
			var now = new Date();
			var maxExpire = new Date();
			maxExpire.setDate(maxExpire.getDate() + 1100);
			var expireWidget = findWidget('au', 'expire_date');
			if (expireWidget.widget.attr('value') > maxExpire){
        			alert('Please set expiration date to 3 years or less.');
				expireWidget.widget.attr('value',now);
			}

		    }
		);
		return;

            case 'dob':
                widget.widget.isValid = function() {
                    return this.attr("value") < new Date();
                };
                dojo.connect(widget.widget, 'onChange',
                    function(newDob) {
                        if(!newDob) return;
                        var oldDob = patron.dob();
                        if(dojo.date.stamp.fromISOString(oldDob) == newDob) return;

                        var juvInterval = orgSettings['global.juvenile_age_threshold'] || '18 years';
                        var juvWidget = findWidget('au', 'juvenile');
                        var base = new Date();
                        base.setTime(base.getTime() - Number(openils.Util.intervalToSeconds(juvInterval) + '000'));

                        if(newDob <= base) // older than global.juvenile_age_threshold
                            juvWidget.widget.attr('value', false);
                        else
                            juvWidget.widget.attr('value', true);
                    }
                );
                return;

            case 'first_given_name':
            case 'family_name':
                dojo.connect(widget.widget, 'onChange',
                    function(newVal) { uEditDupeSearch('name', newVal); });
                return;

            case 'email':
                dojo.connect(widget.widget, 'onChange',
                    function(newVal) { uEditDupeSearch('email', newVal); });
                return;

            case 'ident_value':
		dojo.connect(widget.widget, 'onChange',
                    function(newVal) { uEditDupeSearch('ident_value', newVal); 
//MIEG: TADL Michigan ID - reused for ID and dob population
if (newVal.length > 22){
        if (newVal.length == 25) {var bc = newVal.substr(0,13);}
        if (newVal.length == 23) {var bc = newVal.substr(0,11);}
        var dob = findWidget('au', 'dob');
        var ident = findWidget('au', 'ident_value');
        var id_type = findWidget('au', 'ident_type');
        if (newVal.length == 25) {
                var bc = newVal.substr(0,13);
                if (!dob.widget.attr('value')){
                        var y = newVal.substr(13,4);
                        var m = newVal.substr(17,2);
                        var d = newVal.substr(19,2);
                        var bdate = new Date(y,m-1,d);
                        dob.widget.attr('value',bdate);
                }
                if (!ident.widget.attr('value'))
                        ident.widget.attr('value',bc);
                id_type.widget.attr('value',1);
        }
        if (newVal.length == 23) {
                var bc = newVal.substr(0,11);
                if (!dob.widget.attr('value')){
                        var y = newVal.substr(11,4);
                        var m = newVal.substr(15,2);
                        var d = newVal.substr(17,2);
                        var bdate = new Date(y,m-1,d);
                        dob.widget.attr('value',bdate);
                }
                if (!ident.widget.attr('value'))
                        ident.widget.attr('value',bc);
                id_type.widget.attr('value',4);
        }
	this.attr('value',bc);
}
			}
	   	    );
		return;

            case 'ident_value2':
                dojo.connect(widget.widget, 'onChange',
                    function(newVal) { uEditDupeSearch('ident', newVal); });
                return;

            case 'day_phone':
                    dojo.connect(widget.widget, 'onChange',
                        function(newVal) {
			    if(uEditUsePhonePw && patron.isnew()) {
				// if configured, use the last four digits of the day phone number as the password
                                if(newVal && newVal.length >= 4) {
                                    var pw1 = findWidget('au', 'passwd').widget;
                                    var pw2 = findWidget('au', 'passwd2').widget;
                                    pw1.attr('value', newVal.substring(newVal.length - 4));
                                    pw2.attr('value', newVal.substring(newVal.length - 4));
                                }
			    }
			    if(newVal && newVal.length == 10) {
 				newVal = newVal.substr(0,3)+'-'+newVal.substr(3,3)+'-'+newVal.substr(6,4);
				var dayPhone = findWidget('au', 'day_phone');	
				dayPhone.widget.attr('value',newVal);
			    }
                        }
                    );
		    return;
            case 'evening_phone':
                dojo.connect(widget.widget, 'onChange',
                    function(newVal) {
                        uEditDupeSearch('phone', newVal);
                            if(newVal && newVal.length == 10) {
                                newVal = newVal.substr(0,3)+'-'+newVal.substr(3,3)+'-'+newVal.substr(6,4);
                                var eveningPhone = findWidget('au', 'evening_phone');
                                eveningPhone.widget.attr('value',newVal);
                            }
                    }
                );
                return;

            case 'other_phone':
                dojo.connect(widget.widget, 'onChange',
                    function(newVal) { 
			uEditDupeSearch('phone', newVal); 
			    if(newVal && newVal.length == 10) {
                                newVal = newVal.substr(0,3)+'-'+newVal.substr(3,3)+'-'+newVal.substr(6,4);
                                var otherPhone = findWidget('au', 'other_phone');
                                otherPhone.widget.attr('value',newVal);
                            }
		    }
		);
                return;

            case 'home_ou':
                widget.widget.isValid = function() {
                    if(this.item) {
                        if(homeOuTypes[this.store.getValue(this.item, 'ou_type')]) {
                            return true;
                        }
                        return false;
                    }
                    return true;
                };
                dojo.connect(widget.widget, 'onChange',
                    function(newVal) { 
                        checkClaimsReturnCountPerm(); 
                        checkClaimsNoCheckoutCountPerm();
                    }
                );
                return;

            case 'passwd':
                dojo.connect(widget.widget, 'onChange',
                    function(newVal) {
                        var pw1 = findWidget('au', 'passwd').widget;
                        var pw2 = findWidget('au', 'passwd2').widget;
                        var preserved_value = pw2.attr('value');
                        // Ensure that the pw2 field match the pw1 field to validate
                        pw2.regExp = newVal.replace(/([.\\^$*+?\(\)\[\]\{\}])/g, '\\$1');
                        pw2.reset();
                        pw2.attr('value',preserved_value);
                    });
                return;
        }
    }

    if(fmclass = 'aua') {
        switch(fmfield) {
            case 'post_code':
                dojo.connect(widget.widget, 'onChange',
                    function(e) { 
                        fieldmapper.standardRequest(
                            ['open-ils.search', 'open-ils.search.zip'],
                            {   async: true,
                                params: [e],
                                oncomplete : function(r) {
                                    var res = openils.Util.readResponse(r);
                                    if(!res) return;
                                    var callback = function(w) { return w._addr == widget._addr; };
                                    if(res.city) findWidget('aua', 'city', callback).widget.attr('value', res.city);
                                    if(res.state) findWidget('aua', 'state', callback).widget.attr('value', res.state);
                                    if(res.county) findWidget('aua', 'county', callback).widget.attr('value', res.county);
                                    if(res.alert) alert(res.alert);
                                }
                            }
                        );
                    }
                );
                return;

            case 'street1':
                dojo.connect(widget.widget, 'onChange',
                    function(e) {
			//MIEG:  GRPL address formatting
			if (staff.ws_ou() < 10 || staff.ws_ou() > 17) return;
			e = e.toUpperCase(); 
 	                e = e.replace(/\.|\,|\#/g,""); 
 	                e = e.replace(/\s+/g," ");	
			var street1 = findWidget('aua', 'street1');
			street1.widget.attr('value',e);
		    }
		);
		return;

            case 'street2':
                dojo.connect(widget.widget, 'onChange',
                    function(e) {
                        //MIEG:  GRPL address formatting
                        if (staff.ws_ou() < 10 || staff.ws_ou() > 17) return;
                        e = e.toUpperCase();                  
                        e = e.replace(/\.|\,|\#/g,"");                                                                                                                    
                        e = e.replace(/\s+/g," ");                                                                                                                     
                        var street2 = findWidget('aua', 'street2');
                        street2.widget.attr('value',e);
                    }   
                );
                return;

            case 'city':
                dojo.connect(widget.widget, 'onChange',
                    function(e) {
                        var callback = function(w) { return w._addr == widget._addr; };
                        var args = {
                            street1 : findWidget('aua', 'street1', callback).widget.attr('value'),
                            street2 : findWidget('aua', 'street2', callback).widget.attr('value'),
                            city : findWidget('aua', 'city', callback).widget.attr('value'),
                            post_code : findWidget('aua', 'post_code', callback).widget.attr('value')
                        };
                        if(args.street1 && args.city && args.post_code)
                            uEditDupeSearch('address', args); 
                        //MIEG:  GRPL address formatting
                        if (staff.ws_ou() < 10 || staff.ws_ou() > 17) return;
			var city = findWidget('aua', 'city');
                        e = e.toUpperCase();
			city.widget.attr('value',e);
                    }
                );
		return;

            case 'state':
                dojo.connect(widget.widget, 'onChange',
                    function(e) {
                        var callback = function(w) { return w._addr == widget._addr; };
                        var args = {
                            street1 : findWidget('aua', 'street1', callback).widget.attr('value'),
                            street2 : findWidget('aua', 'street2', callback).widget.attr('value'),
                            state : findWidget('aua', 'state', callback).widget.attr('value'),
                            post_code : findWidget('aua', 'post_code', callback).widget.attr('value')
                        };
                        if(args.street1 && args.state && args.post_code)
                            uEditDupeSearch('address', args);
                        //MIEG:  GRPL address formatting
                        if (staff.ws_ou() < 10 || staff.ws_ou() > 17) return;
                        var state = findWidget('aua', 'state');
                        e = e.toUpperCase();
                        state.widget.attr('value',e);
                    }
                );
                return;
        }
    }
}

function uEditDupeSearch(type, value) {
    if(!value) return;
    var search;
    switch(type) {

        case 'name':
            openils.Util.hide('uedit-dupe-names-link');
            var fname = findWidget('au', 'first_given_name').widget.attr('value');
            var lname = findWidget('au', 'family_name').widget.attr('value');
            if( !(fname && lname) ) return;
            search = {
                first_given_name : {value : fname, group : 0},
                family_name : {value : lname, group : 0},
            };
            break;

        case 'email':
            openils.Util.hide('uedit-dupe-email-link');
            search = {email : {value : value, group : 0}};
            break;

        case 'ident':
            openils.Util.hide('uedit-dupe-ident-link');
            search = {ident : {value : value, group : 2}};
            break;

        case 'phone':
            openils.Util.hide('uedit-dupe-phone-link');
            search = {phone : {value : value, group : 2}};
            break;

        case 'address':
            openils.Util.hide('uedit-dupe-address-link');
            search = {};
            dojo.forEach(['street1', 'street2', 'city', 'post_code'],
                function(field) {
                    if(value[field])
                        search[field] = {value : value[field], group: 1};
                }
            );
            break;
    }

    // find possible duplicate patrons
    fieldmapper.standardRequest(
        ['open-ils.actor', 'open-ils.actor.patron.search.advanced'],
        {   async: true,
            params: [openils.User.authtoken, search],
            oncomplete : function(r) {
                var resp = openils.Util.readResponse(r);
                resp = resp.filter(function(id) { return (id != patron.id()); });

                if(resp && resp.length > 0) {

                    openils.Util.hide('uedit-help-div');
                    openils.Util.show('uedit-dupe-div');
                    var link;

                    switch(type) {
                        case 'name':
                            link = dojo.byId('uedit-dupe-names-link');
                            link.innerHTML = dojo.string.substitute(localeStrings.DUPE_PATRON_NAME, [resp.length]);
                            break;
                        case 'email':
                            link = dojo.byId('uedit-dupe-email-link');
                            link.innerHTML = dojo.string.substitute(localeStrings.DUPE_PATRON_EMAIL, [resp.length]);
                            break;
                        case 'ident':
                            link = dojo.byId('uedit-dupe-ident-link');
                            link.innerHTML = dojo.string.substitute(localeStrings.DUPE_PATRON_IDENT, [resp.length]);
                            break;
                        case 'phone':
                            link = dojo.byId('uedit-dupe-phone-link');
                            link.innerHTML = dojo.string.substitute(localeStrings.DUPE_PATRON_PHONE, [resp.length]);
                            break;
                        case 'address':
                            link = dojo.byId('uedit-dupe-address-link');
                            link.innerHTML = dojo.string.substitute(localeStrings.DUPE_PATRON_ADDR, [resp.length]);
                            break;
                    }

                    openils.Util.show(link);
                    link.onclick = function() {
                        search.search_sort = js2JSON(["penalties", "family_name", "first_given_name"]);
                        if(window.xulG)
                            window.xulG.spawn_search(search);
                        else
                            console.log("running XUL patron search " + js2JSON(search));
                    }
                }
            }
        }
    );
}

function getByName(node, name) {
    return dojo.query('[name='+name+']', node)[0];
}


function ueLoadContextHelp(fmcls, fmfield) {
    openils.Util.hide('uedit-dupe-div');
    openils.Util.show('uedit-help-div');
    dojo.byId('uedit-help-field').innerHTML = fieldmapper.IDL.fmclasses[fmcls].field_map[fmfield].label;
    dojo.byId('uedit-help-text').innerHTML = fieldDoc[fmcls][fmfield].string();
}


/* creates a new patron object with card attached */
function uEditNewPatron() {
    patron = new au();
    patron.isnew(1);
    patron.id(-1);
    card = new ac();
    card.id(uEditCardVirtId--);
    card.isnew(1);
    patron.active(1);
    patron.card(card);
    patron.cards([card]);
    patron.net_access_level(orgSettings['ui.patron.default_inet_access_level'] || 1);
    patron.ident_type(orgSettings['ui.patron.default_ident_type']);
    patron.stat_cat_entries([]);
    patron.survey_responses([]);
    patron.addresses([]);
    uEditMakeRandomPw(patron);
    return patron;
}

function uEditMakeRandomPw(patron) {
    var rand  = Math.random();
    rand = parseInt(rand * 10000) + '';
    while(rand.length < 4) rand += '0';
/*
    appendClear($('ue_password_plain'),text(rand));
    unHideMe($('ue_password_gen'));
*/
    patron.passwd(rand);
    return rand;
}

function uEditWidgetVal(w) {
    var val = (w.getFormattedValue) ? w.getFormattedValue() : w.attr('value');
    if(val === '') val = null;
    return val;
}

function uEditSave() { _uEditSave(); }
function uEditSaveClone() { _uEditSave(true); }

function _uEditSave(doClone) {

    if ( (! myForm.isValid()) || dupeUsrname || dupeBarcode ) {
        alert(localeStrings.INVALID_FORM);
        return;
    }

    for(var idx in widgetPile) {
        var w = widgetPile[idx];
        var val = uEditWidgetVal(w);

        switch(w._wtype) {
            case 'au':
                if(w._fmfield != 'passwd2')
                    patron[w._fmfield](val);
                break;

            case 'ac':
                patron.card()[w._fmfield](val);
                break;

            case 'aua':
                var addr = patron.addresses().filter(function(i){return (i.id() == w._addr)})[0];
                if(!addr) {
                    addr = new fieldmapper.aua();
                    addr.id(w._addr);
                    addr.isnew(1);
                    addr.usr(patron.id());
                    addr.country(orgSettings['ui.patron.default_country']);
                    var t = patron.addresses();
                        if (!t) { t = []; }
                        t.push(addr);
                        patron.addresses(t);
                } else {
                    if(addr[w._fmfield]() != val)
                        addr.ischanged(1);
                }
                addr[w._fmfield](val);

                if(dojo.byId('uedit-billing-address-' + addr.id()).checked) 
                    patron.billing_address(addr.id());

                if(dojo.byId('uedit-mailing-address-' + addr.id()).checked)
                    patron.mailing_address(addr.id());

                break;

            case 'survey':
                if(val == null) break;
                var resp = new fieldmapper.asvr();
                resp.isnew(1);
                resp.survey(w._survey)
                resp.usr(patron.id());
                resp.question(w._question)
                resp.answer(val);
                var t = patron.survey_responses();
                    if (!t) { t = []; }
                    t.push(resp);
                    patron.survey_responses(t);
                break;

            case 'statcat':
                var map = patron.stat_cat_entries().filter(
                    function(m){
                        return (m.stat_cat() == w._statcat) })[0];

                if(map) {
                    if(map.stat_cat_entry() == val) 
                        break;
                    if(val == null) {
                        val = '';
                        map.isdeleted(1);
                    } else {
                        map.ischanged(1);
                    }
                } else {
                    if(val == null)
                        break;
                    map = new fieldmapper.actscecm();
                    map.isnew(1);
                }

                map.stat_cat(w._statcat);
                map.stat_cat_entry(val);
                map.target_usr(patron.id());
                var t = patron.stat_cat_entries();
                    if (!t) { t = []; }
                    t.push(map);
                    patron.stat_cat_entries(t);
                break;
        }
    }

    patron.ischanged(1);
    fieldmapper.standardRequest(
        ['open-ils.actor', 'open-ils.actor.patron.update'],
        {   async: true,
            params: [openils.User.authtoken, patron],
            oncomplete: function(r) {
                lock_ready = false;
                if (xulG && typeof xulG.unlock_tab == 'function') {
                    xulG.unlock_tab();
                    already_locked = false;
                }
                newPatron = openils.Util.readResponse(r);
                if(newPatron) {
                    uEditUpdateUserSettings(newPatron.id());
                    if(stageUser) uEditRemoveStage();
                    uEditFinishSave(newPatron, doClone);
                }
            }
        }
    );
}

function uEditRemoveStage() {
    var resp = fieldmapper.standardRequest(
        ['open-ils.actor', 'open-ils.actor.user.stage.delete'],
        { params : [openils.User.authtoken, stageUser.row_id()] }
    )
}

function uEditFinishSave(newPatron, doClone) {

    if(doClone && cloneUser == null)
        cloneUser = newPatron.id();

	if( doClone ) {

		if(xulG && typeof xulG.spawn_editor == 'function' && !patron.isnew() ) {
            window.xulG.spawn_editor({ses:openils.User.authtoken,clone:cloneUser});
            uEditRefresh();

		} else {
			location.href = location.href.replace(/\?.*/, '') + '?clone=' + cloneUser;
		}

	} else {

		uEditRefresh();
	}

	uEditRefreshXUL(newPatron);
}

function uEditRefresh() {
    var usr = cgi.param('usr');
    var href = location.href.replace(/\?.*/, '');
    href += ((usr) ? '?usr=' + usr : '');
    location.href = href;
}

function uEditRefreshXUL(newuser) {
	if (window.xulG && typeof window.xulG.on_save == 'function') 
		window.xulG.on_save(newuser);
}


/**
 * Create a new address and insert it into the DOM
 * @param evt ignored
 * @param id The address id
 * @param mkLinks If true, set the new address as the 
 *  mailing/billing address for the user
 */
function uEditNewAddr(evt, id, mkLinks) {

    if(id == null) 
        id = --uEditAddrVirtId; // new address

    var addr =  patron.addresses().filter(
        function(i) { return (i.id() == id) })[0];

    dojo.forEach(addrTemplateRows, 
        function(row) {

            row = tbody.insertBefore(row.cloneNode(true), dojo.byId('new-addr-row'));
            row.setAttribute('type', '');
            row.setAttribute('addr', id+'');

            if(row.getAttribute('fmclass')) {
                var widget = fleshFMRow(row, 'aua', {addr:id});

                // make new addresses a default address type
                if(id < 0 && row.getAttribute('fmfield') == 'address_type') 
                    widget.widget.attr('value', localeStrings.DEFAULT_ADDRESS_TYPE); 

                // make new addresses valid by default
                if(id < 0 && row.getAttribute('fmfield') == 'valid') 
                    widget.widget.attr('value', true); 

                // make new addresses use the org setting for default country 
                if(id < 0 && row.getAttribute('fmfield') == 'country') 
                    widget.widget.attr('value',orgSettings['ui.patron.default_country']);

            } else if(row.getAttribute('name') == 'uedit-addr-pending-row') {

                // if it's a pending address, show the 'approve' button
                if(addr && openils.Util.isTrue(addr.pending())) {
                    openils.Util.show(row, 'table-row');
                    dojo.query('[name=approve-button]', row)[0].onclick = 
                        function() { uEditApproveAddress(addr); };

                    if(addr.replaces()) {
                        var div = dojo.query('[name=replaced-addr]', row)[0]
                        var replaced =  patron.addresses().filter(
                            function(i) { return (i.id() == addr.replaces()) })[0];

                        div.innerHTML = dojo.string.substitute(localeStrings.REPLACED_ADDRESS, [
                            replaced.address_type() || '',
                            replaced.street1() || '',
                            replaced.street2() || '',
                            replaced.city() || '',
                            replaced.state() || '',
                            replaced.post_code() || ''
                        ]);

                    } else {
                        openils.Util.hide(dojo.query('[name=replaced-addr-div]', row)[0]);
                    }
                }

            } else if(row.getAttribute('name') == 'uedit-addr-owner-row') {
                // address is owned by someone else.  provide option to load the
                // user in a different tab
                
                if(addr && addr.usr() != patron.id()) {
                    openils.Util.show(row, 'table-row');
                    var link = getByName(row, 'addr-owner');

                    // fetch the linked user so we can present their name in the UI
                    var addrUser;
                    if(cloneUserObj && cloneUserObj.id() == addr.usr()) {
                        addrUser = [
                            cloneUserObj.first_given_name(), 
                            cloneUserObj.second_given_name(), 
                            cloneUserObj.family_name()
                        ];
                    } else {
                        addrUser = fieldmapper.standardRequest(
                            ['open-ils.actor', 'open-ils.actor.user.retrieve.parts'],
                            {params: [
                                openils.User.authtoken, 
                                addr.usr(), 
                                ['first_given_name', 'second_given_name', 'family_name']
                            ]}
                        );
                    }

                    link.innerHTML = (addrUser.map(function(name) { return (name) ? name+' ' : '' })+'').replace(/,/g,''); // TODO i18n
                    link.onclick = function() {
                        if(openils.XUL.isXUL()) { 
                            window.xulG.spawn_editor({ses:openils.User.authtoken, usr:addr.usr()})
                        } else {
                            parent.location.href = location.href.replace(/clone=\d+/, 'usr=' + addr.usr());
                        }
                    }
                }

            } else if(row.getAttribute('name') == 'uedit-addr-divider') {
                // link up the billing/mailing address and give the inputs IDs so we can access the later
                
                // billing address
                var ba = getByName(row, 'billing_address');
                ba.id = 'uedit-billing-address-' + id;
                if(mkLinks || (patron.billing_address() && patron.billing_address().id() == id))
                    ba.checked = true;

                // mailing address
                var ma = getByName(row, 'mailing_address');
                ma.id = 'uedit-mailing-address-' + id;
                if(mkLinks || (patron.mailing_address() && patron.mailing_address().id() == id))
                    ma.checked = true;

                var btn = dojo.query('[name=delete-button]', row)[0];
                if(btn) btn.onclick = function(){ uEditDeleteAddr(id) };
            }
        }
    );
}

function uEditApproveAddress(addr) {
    fieldmapper.standardRequest(
        ['open-ils.actor', 'open-ils.actor.user.pending_address.approve'],
        {   async: true,
            params:  [openils.User.authtoken, addr],

            oncomplete : function(r) {
                var oldId = openils.Util.readResponse(r);
                    
                // remove addrs from UI
                dojo.forEach(
                    patron.addresses(), 
                    function(addr) { uEditDeleteAddr(addr.id(), true); }
                );

                if(oldId != null) {
                    
                    // remove the replaced address 
                    if(oldId != addr.id()) {
		                patron.addresses(
                            patron.addresses().filter(
				                function(i) { return (i.id() != oldId); }
			                )
		                );
                    }
                    
                    // fix the the new address
                    addr.id(oldId);
                    addr.replaces(null);
                    addr.pending('f');

                }

                // redraw addrs
                loadAllAddrs();
            }
        }
    );
}


function uEditDeleteAddr(id, noAlert) {
    if (patron.isnew() && orgSettings['ui.patron.registration.require_address']) {
        if (dojo.query('tr[name=uedit-addr-divider]').length < 2) {
            alert(localeStrings.NEED_ADDRESS);
            return;
        }
    }
    if(!noAlert) {
        if(!confirm(dojo.string.substitute(localeStrings.DELETE_ADDRESS, [id]))) return;
    }
    var addr = patron.addresses().filter(function(i){return (i.id() == id)})[0];
    if (addr) { addr.isdeleted(1); }
    var m_a = patron.mailing_address();
        if (typeof m_a == 'object' && m_a != null) { m_a = m_a.id(); }
        if (m_a == id) { patron.mailing_address(null); }
    var b_a = patron.billing_address();
        if (typeof b_a == 'object' && b_a != null) { b_a = b_a.id(); }
        if (b_a == id) { patron.billing_address(null); }

    var rows = dojo.query('tr[addr='+id+']', tbody);
    for(var i = 0; i < rows.length; i++)
        rows[i].parentNode.removeChild(rows[i]);
    widgetPile = widgetPile.filter(function(w){return (w._addr != id)});
}

function uEditToggleRequired(level) {
    openils.Util.removeCSSClass(tbody, 'hide-non-required');
    openils.Util.removeCSSClass(tbody, 'hide-non-suggested');
    openils.Util.show('uedit-show-required');
    openils.Util.show('uedit-show-required-br');
    openils.Util.show('uedit-show-suggested');
    openils.Util.show('uedit-show-suggested-br');
    openils.Util.show('uedit-show-all');
    switch(level) {
        case 1:
            openils.Util.hide('uedit-show-required');
            openils.Util.hide('uedit-show-required-br');
            openils.Util.addCSSClass(tbody, 'hide-non-required');
            break;
        case 2:
            openils.Util.hide('uedit-show-suggested');
            openils.Util.hide('uedit-show-suggested-br');
            openils.Util.addCSSClass(tbody, 'hide-non-suggested');
            break;
        default:
            openils.Util.hide('uedit-show-all');
            break;
    } 
}

function printable_output() {
    var temp; var s = '=-=-=-=\r\n';
    for (var idx in widgetPile) {
        var w = widgetPile[idx];
        var val = uEditWidgetVal(w);
        var label;
        if (typeof w.idlField == 'undefined') {
            label = w._wtype;
            if (w._wtype == 'statcat') {
                var stat = statCats.filter(
                    function(m){
                        return (m.id() == w._statcat) })[0];
                label = stat.name();
            } else if (w._wtype == 'survey') {
                var survey = surveys.filter(
                    function(m){
                        return (m.id() == w._survey) })[0];
                var question = survey.questions().filter(
                    function(m){
                        return (m.id() == w._question) })[0];
                label = survey.name() + ' : ' + question.question();
            } else {
                label = 'FIXME';
            }
        } else {
            label = w.idlField.label;
        }
        if (temp != w._wtype) {
            temp = w._wtype;
            s += '-------\r\n';
        }
        s += label + ':\t' + (typeof val == 'object' ? '' : val) + '\r\n';
    }
    s += '=-=-=-=\r\n';
    return s;
}

openils.Util.addOnLoad(load);
