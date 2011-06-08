dump('entering util/print.js\n');

if (typeof util == 'undefined') util = {};
util.print = function (context) {

    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

    JSAN.use('util.error'); this.error = new util.error();
    JSAN.use('OpenILS.data'); this.data = new OpenILS.data(); this.data.init( { 'via':'stash' } );
    JSAN.use('util.window'); this.win = new util.window();
    JSAN.use('util.functional');
    JSAN.use('util.file');

    this.context = context || 'default';

    var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces['nsIPrefBranch']);
    var key = 'oils.printer.external.cmd.' + this.context;
    var has_key = prefs.prefHasUserValue(key);
    if(!has_key && this.context != 'default') {
        key = 'oils.printer.external.cmd.default';
        has_key = prefs.prefHasUserValue(key);
    }
    this.oils_printer_external_cmd = has_key ? prefs.getCharPref(key) : '';

    try {
        if (prefs.prefHasUserValue('print.always_print_silent')) {
            if (! prefs.getBoolPref('print.always_print_silent')) {
                prefs.clearUserPref('print.always_print_silent');
            }
        }
    } catch(E) {
        dump('Error in print.js trying to clear print.always_print_silent\n');
    }

    return this;
};

util.print.prototype = {

    'reprint_last' : function() {
        try {
            var obj = this; obj.data.init({'via':'stash'});
            if (!obj.data.last_print) {
                alert(
                    document.getElementById('offlineStrings').getString('printing.nothing_to_reprint')
                );
                return;
            }
            var msg = obj.data.last_print.msg;
            var params = obj.data.last_print.params; params.no_prompt = false;
            obj.simple( msg, params );
        } catch(E) {
            this.error.standard_unexpected_error_alert('util.print.reprint_last',E);
        }
    },

    'html2txt' : function(html) {
        JSAN.use('util.text');
        //dump('html2txt, before:\n' + html + '\n');
        var lines = html.split(/\n/);
        var new_lines = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line) {
                // This undoes the util.text.preserve_string_in_html call that spine_label.js does
                line = util.text.reverse_preserve_string_in_html(line);
                // This looks for @hex attributes containing 2-digit hex codes, and converts them into real characters
                line = line.replace(/(<.+?)hex=['"](.+?)['"](.*?>)/gi, function(str,p1,p2,p3,offset,s) {
                    var raw_chars = '';
                    var hex_chars = p2.match(/[0-9,a-f,A-F][0-9,a-f,A-F]/g);
                    for (var j = 0; j < hex_chars.length; j++) {
                        raw_chars += String.fromCharCode( parseInt(hex_chars[j],16) );
                    }
                    return p1 + p3 + raw_chars;
                });
                line = line.replace(/<head.*?>.*?<\/head>/gi, '');
                line = line.replace(/<br.*?>/gi,'\r\n');
                line = line.replace(/<table.*?>/gi,'');
                line = line.replace(/<tr.*?>/gi,'');
                line = line.replace(/<hr.*?>/gi,'\r\n');
                line = line.replace(/<p.*?>/gi,'');
                line = line.replace(/<block.*?>/gi,'');
                line = line.replace(/<li.*?>/gi,' * ');
                line = line.replace(/<.+?>/gi,'');
                if (line) { new_lines.push(line); }
            } else {
                new_lines.push(line);
            }
        }
        var new_html = new_lines.join('\n');
        //dump('html2txt, after:\n' + new_html + '\nhtml2txt, done.\n');
        return new_html;
    },

    'simple' : function(msg,params) {
        try {
            if (!params) params = {};
            params.msg = msg;

            var obj = this;

            obj.data.last_print = { 'msg' : msg, 'params' : params, 'context' : this.context};
            obj.data.stash('last_print');

            var silent = false;
            if ( params && params.no_prompt && (params.no_prompt == true || params.no_prompt == 'true') ) {
                silent = true;
            }

            var content_type;
            if (params && params.content_type) {
                content_type = params.content_type;
            } else {
                content_type = 'text/html';
            }

            var w;

            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            obj.data.init({'via':'stash'});

            if (typeof obj.data.print_strategy == 'undefined') {
                obj.data.print_strategy = {};
                obj.data.stash('print_strategy');
            }

            if (params.print_strategy || obj.data.print_strategy[obj.context] || obj.data.print_strategy['default']) {

                switch(params.print_strategy || obj.data.print_strategy[obj.context] || obj.data.print_strategy['default']) {
                    case 'dos.print':
                        params.dos_print = true;
                    case 'custom.print':
                        /* FIXME - this it a kludge.. we're going to sidestep window-based html rendering for printing */
                        /* I'm using regexps to mangle the html receipt templates; it'd be nice to use xsl but the */
                        /* templates aren't guaranteed to be valid xml.  The unadulterated msg is still preserved in */
                        /* params */
                        if (content_type=='text/html') {
                            w = obj.html2txt(msg);
                        } else {
                            w = msg;
                        }
                        if (! params.no_form_feed) { w = w + '\f'; }
                        obj.NSPrint(w, silent, params);
                        return;
                    break;
                }
            }

            switch(content_type) {
                case 'text/html' :
                    var jsrc = 'data:text/javascript,' + window.escape('var params = { "data" : ' + js2JSON(params.data) + ', "list" : ' + js2JSON(params.list) + '}; function my_init() { if (typeof go_print == "function") { go_print(); } else { setTimeout( function() { if (typeof go_print == "function") { alert("Please tell the developers that the 2-second go_print workaround executed, and let them know whether this job printed successfully.  Thanks!"); go_print(); } else { alert("Please tell the developers that the 2-second go_print workaround did not work.  We will try to print one more time; there have been reports of wasted receipt paper at this point.  Please check the settings in the print dialog and/or prepare to power off your printer.  Thanks!"); window.print(); } }, 2000 ); } /* FIXME - mozilla bug#301560 - xpcom kills it too */ }');
                    var print_url = 'data:text/html,'
                        + '<html id="top"><head><script src="/xul/0master_6da2b4e/server/main/JSAN.js"></script><script src="' + window.escape(jsrc) + '"></script></head>'
                        + '<body onload="try{my_init();}catch(E){alert(E);}">' + window.escape(msg) + '</body></html>';
                    w = obj.win.open(print_url,'receipt_temp','chrome,resizable');
                    w.minimize();
                    w.go_print = function() { 
                        try {
                            obj.NSPrint(w, silent, params);
                        } catch(E) {
                            obj.error.standard_unexpected_error_alert("Print Error in util.print.simple.  After this dialog we'll try a second print attempt. content_type = " + content_type,E);
                            w.print();
                        }
                        w.minimize(); w.close();
                    }
                break;
                default:
                    w = obj.win.open('data:' + content_type + ',' + window.escape(msg),'receipt_temp','chrome,resizable');
                    w.minimize();
                    setTimeout(
                        function() {
                            try {
                                obj.NSPrint(w, silent, params);
                            } catch(E) {
                                obj.error.standard_unexpected_error_alert("Print Error in util.print.simple.  After this dialog we'll try a second print attempt. content_type = " + content_type,E);
                                w.print();
                            }
                            w.minimize(); w.close();
                        }, 1000
                    );
                break;
            }

        } catch(E) {
            this.error.standard_unexpected_error_alert('util.print.simple',E);
        }
    },
    
    'tree_list' : function (params) { 
        try {
            dump('print.tree_list.params.list = \n' + this.error.pretty_print(js2JSON(params.list)) + '\n');
            dump('print.tree_list.params.data = \n' + this.error.pretty_print(js2JSON(params.data)) + '\n');
        } catch(E) {
            dump(E+'\n');
        }
        var cols = [];
        var s = '';
        if (params.header) s += this.template_sub( params.header, cols, params );
        if (params.list) {
            for (var i = 0; i < params.list.length; i++) {
                params.row = params.list[i];
                params.row_idx = i;
                s += this.template_sub( params.line_item, cols, params );
            }
        }
        if (params.footer) s += this.template_sub( params.footer, cols, params );

        if (params.sample_frame) {
            var jsrc = 'data:text/javascript,' + window.escape('var params = { "data" : ' + js2JSON(params.data) + ', "list" : ' + js2JSON(params.list) + '};');
            params.sample_frame.setAttribute('src','data:text/html,<html id="top"><head><script src="' + window.escape(jsrc) + '"></script></head><body>' + window.escape(s) + '</body></html>');
        } else {
            this.simple(s,params);
        }
    },

    'template_sub' : function( msg, cols, params ) {
        try {
            var obj = this;
            if (!msg) { dump('template sub called with empty string\n'); return; }
            JSAN.use('util.date');
            var s = msg; var b;

            try{b = s; s = s.replace(/%LINE_NO%/,Number(params.row_idx)+1);}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}

            try{b = s; s = s.replace(/%patron_barcode%/,params.patron_barcode);}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}

            try{b = s; s = s.replace(/%LIBRARY%/,params.lib.name());}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%PINES_CODE%/,params.lib.shortname());}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%SHORTNAME%/,params.lib.shortname());}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%STAFF_FIRSTNAME%/,params.staff.first_given_name());}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%STAFF_LASTNAME%/,params.staff.family_name());}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%STAFF_BARCODE%/,params.staff.barcode); }
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%STAFF_PROFILE%/,obj.data.hash.pgt[ params.staff.profile() ].name() ); }
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%PATRON_ALIAS_OR_FIRSTNAME%/,(params.patron.alias() == '' || params.patron.alias() == null) ? params.patron.first_given_name() : params.patron.alias());}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%PATRON_ALIAS%/,(params.patron.alias() == '' || params.patron.alias() == null) ? '' : params.patron.alias());}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%PATRON_FIRSTNAME%/,params.patron.first_given_name());}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%PATRON_LASTNAME%/,params.patron.family_name());}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s = s.replace(/%PATRON_BARCODE%/,typeof params.patron.card() == 'object' ? params.patron.card().barcode() : util.functional.find_id_object_in_list( params.patron.cards(), params.patron.card() ).barcode() ) ;}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}

            try{b = s; s=s.replace(/%TODAY%/g,(new Date()));}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s=s.replace(/%TODAY_m%/g,(util.date.formatted_date(new Date(),'%m')));}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s=s.replace(/%TODAY_TRIM%/g,(util.date.formatted_date(new Date(),'')));}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s=s.replace(/%TODAY_d%/g,(util.date.formatted_date(new Date(),'%d')));}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s=s.replace(/%TODAY_Y%/g,(util.date.formatted_date(new Date(),'%Y')));}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s=s.replace(/%TODAY_H%/g,(util.date.formatted_date(new Date(),'%H')));}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s=s.replace(/%TODAY_I%/g,(util.date.formatted_date(new Date(),'%I')));}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s=s.replace(/%TODAY_M%/g,(util.date.formatted_date(new Date(),'%M')));}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s=s.replace(/%TODAY_D%/g,(util.date.formatted_date(new Date(),'%D')));}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}
            try{b = s; s=s.replace(/%TODAY_F%/g,(util.date.formatted_date(new Date(),'%F')));}
                catch(E){s = b; this.error.sdump('D_WARN','string = <' + s + '> error = ' + js2JSON(E)+'\n');}

            try {
                if (typeof params.row != 'undefined') {
                    if (params.row.length >= 0) {
                        alert('debug - please tell the developers that deprecated template code tried to execute');
                        for (var i = 0; i < cols.length; i++) {
                            var re = new RegExp(cols[i],"g");
                            try{b = s; s=s.replace(re, params.row[i]);}
                                catch(E){s = b; this.error.standard_unexpected_error_alert('print.js, template_sub(): 1 string = <' + s + '>',E);}
                        }
                    } else { 
                        /* for dump_with_keys */
                        for (var i in params.row) {
                            var re = new RegExp('%'+i+'%',"g");
                            try{b = s; s=s.replace(re, params.row[i]);}
                                catch(E){s = b; this.error.standard_unexpected_error_alert('print.js, template_sub(): 2 string = <' + s + '>',E);}
                        }
                    }
                }

                if (typeof params.data != 'undefined') {
                    for (var i in params.data) {
                        var re = new RegExp('%'+i+'%',"g");
                        if (typeof params.data[i] == 'string') {
                            try{b = s; s=s.replace(re, params.data[i]);}
                                catch(E){s = b; this.error.standard_unexpected_error_alert('print.js, template_sub(): 3 string = <' + s + '>',E);}
                        }
                    }
                }
            } catch(E) { dump(E+'\n'); }

            // Date Format
            try {
                var match;
                var date_format_patt=/%DATE_FORMAT\(\s*([^,]*?)\s*,\s*([^)]*?)\s*\)%/
                while(match = date_format_patt.exec(s)) {
                    if(match[1] == '' || match[2] == '')
                        s = s.replace(match[0], '');
                    else
                        s = s.replace(match[0], util.date.formatted_date(match[1], match[2]));
                }
            } catch(E) { dump(E+'\n'); }

            // Substrings
            try {
                var match;
                // Pre-trim inside of substrings, and only inside of them
                // This keeps the trim commands from being truncated
                var substr_trim_patt=/(%SUBSTR\(-?\d+,?\s*(-?\d+)?\)%.*?)(\s*%-TRIM%|%TRIM-%\s*)(.*?%SUBSTR_END%)/;
                while(match = substr_trim_patt.exec(s))
                    s = s.replace(match[0], match[1] + match[4]);
                // Then do the substrings themselves
                var substr_patt=/%SUBSTR\((-?\d+),?\s*(-?\d+)?\)%(.*?)%SUBSTR_END%/;
                while(match = substr_patt.exec(s)) {
                    var substring_start = parseInt(match[1]);
                    if(substring_start < 0) substring_start = match[3].length + substring_start;
                    var substring_length = parseInt(match[2]);
                    if(substring_length > 0)
                        s = s.replace(match[0], match[3].substring(substring_start, substring_start + substring_length));
                    else if(substring_length < 0)
                        s = s.replace(match[0], match[3].substring(substring_start + substring_length, substring_start));
                    else
                        s = s.replace(match[0], match[3].substring(substring_start));
                }
            } catch(E) { dump(E+'\n'); }

            // Cleanup unwanted whitespace
            try {
                s = s.replace(/%TRIM-%\s*/g,'');
                s = s.replace(/\s*%-TRIM%/g,'');
            } catch(E) { dump(E+'\n'); }

            return s;
        } catch(E) {
            alert('Error in print.js, template_sub(): ' + E);
        }
    },


    'NSPrint' : function(w,silent,params) {
        if (!w) w = window;
        var obj = this;
        try {
            if (!params) params = {};

            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            obj.data.init({'via':'stash'});

            if (params.print_strategy || obj.data.print_strategy[obj.context] || obj.data.print_strategy['default']) {

                dump('params.print_strategy = ' + params.print_strategy
                    + ' || obj.data.print_strategy[' + obj.context + '] = ' + obj.data.print_strategy[obj.context] 
                    + ' || obj.data.print_strategy[default] = ' + obj.data.print_strategy['default'] 
                    + ' => ' + ( params.print_strategy || obj.data.print_strategy[obj.context] || obj.data.print_strategy['default'] ) + '\n');
                switch(params.print_strategy || obj.data.print_strategy[obj.context] || obj.data.print_strategy['default']) {
                    case 'dos.print':
                    case 'custom.print':
                        if (typeof w != 'string') {
                            try {
                                var temp_w = params.msg || w.document.firstChild.innerHTML;
                                if (!params.msg) { params.msg = temp_w; }
                                if (typeof temp_w != 'string') { throw(temp_w); }
                                w = obj.html2txt(temp_w);
                            } catch(E) {
                                dump('util.print: Could not use w.document.firstChild.innerHTML with ' + w + ': ' + E + '\n');
                                netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                                w.getSelection().selectAllChildren(w.document.firstChild);
                                w = w.getSelection().toString();
                            }
                        }
                        obj._NSPrint_custom_print(w,silent,params);
                    break;    
                    case 'window.print':
                        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                        var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces['nsIPrefBranch']);
                        var originalPrinter = false;
                        if (prefs.prefHasUserValue('print.print_printer')) {
                            // This is for restoring print.print_printer after any print dialog, so that when
                            // window.print gets used again, it uses the configured printer for the right context
                            // (which should only be default--window.print is a kludge and is in limited use),
                            // rather than the printer last used.
                            originalPrinter = prefs.getCharPref('print.print_printer');
                        }
                        if (typeof w == 'object') {
                            w.print();
                            if (originalPrinter) {
                                prefs.setCharPref('print.print_printer',originalPrinter);
                            }
                        } else {
                            if (params.content_type == 'text/plain') {
                                w = window.open('data:text/plain,'+escape(params.msg));
                            } else {
                                w = window.open('data:text/html,'+escape(params.msg));
                            }
                            setTimeout(
                                function() {
                                    w.print();
                                    if (originalPrinter) {
                                        prefs.setCharPref('print.print_printer',originalPrinter);
                                    }
                                    setTimeout(
                                        function() {
                                            w.close(); 
                                        }, 2000
                                    );
                                }, 0
                            );
                        }
                    break;    
                    case 'webBrowserPrint':
                    default:
                        if (typeof w == 'object') {
                            obj._NSPrint_webBrowserPrint(w,silent,params);
                        } else {
                            if (params.content_type == 'text/plain') {
                                w = window.open('data:text/plain,'+escape(params.msg));
                            } else {
                                w = window.open('data:text/html,'+escape(params.msg));
                            }
                            setTimeout(
                                function() {
                                    obj._NSPrint_webBrowserPrint(w,silent,params);
                                    setTimeout(
                                        function() {
                                            w.close(); 
                                        }, 2000
                                    );
                                }, 0
                            );
                        }
                    break;    
                }

            } else {
                //w.print();
                obj._NSPrint_webBrowserPrint(w,silent,params);
            }

        } catch (e) {
            alert('Probably not printing: ' + e);
            this.error.sdump('D_ERROR','PRINT EXCEPTION: ' + js2JSON(e) + '\n');
        }

    },

    '_NSPrint_custom_print' : function(w,silent,params) {
        var obj = this;
        try {

            var text = w;
            var html = params.msg || w;

            var txt_file = new util.file('receipt.txt');
            txt_file.write_content('truncate',text); 
            var text_path = '"' + txt_file._file.path + '"';
            txt_file.close();

            var html_file = new util.file('receipt.html');
            html_file.write_content('truncate',html); 
            var html_path = '"' + html_file._file.path + '"';
            html_file.close();
            
            var cmd = params.dos_print ?
                'copy ' + text_path + ' lpt1 /b\n'
                : obj.oils_printer_external_cmd.replace('%receipt.txt%',text_path).replace('%receipt.html%',html_path)
            ;

            file = new util.file('receipt.bat');
            file.write_content('truncate+exec',cmd);
            file.close();
            file = new util.file('receipt.bat');

            dump('print exec: ' + cmd + '\n');
            var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
            process.init(file._file);

            var args = [];

            dump('process.run = ' + process.run(true, args, args.length) + '\n');

            file.close();

        } catch (e) {
            //alert('Probably not printing: ' + e);
            this.error.sdump('D_ERROR','_NSPrint_custom_print PRINT EXCEPTION: ' + js2JSON(e) + '\n');
        }
    },

    '_NSPrint_webBrowserPrint' : function(w,silent,params) {
        var obj = this;
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            var webBrowserPrint = w
                .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                .getInterface(Components.interfaces.nsIWebBrowserPrint);
            this.error.sdump('D_PRINT','webBrowserPrint = ' + webBrowserPrint);
            if (webBrowserPrint) {
                var gPrintSettings = obj.GetPrintSettings();
                if (silent) gPrintSettings.printSilent = true;
                else gPrintSettings.printSilent = false;
                if (params) {
                    if (params.marginLeft) gPrintSettings.marginLeft = params.marginLeft;
                }
                webBrowserPrint.print(gPrintSettings, null);
                this.error.sdump('D_PRINT','Should be printing\n');
            } else {
                this.error.sdump('D_ERROR','Should not be printing\n');
            }
        } catch (e) {
            //alert('Probably not printing: ' + e);
            // Pressing cancel is expressed as an NS_ERROR_ABORT return value,
            // causing an exception to be thrown which we catch here.
            // Unfortunately this will also consume helpful failures
            this.error.sdump('D_ERROR','_NSPrint_webBrowserPrint PRINT EXCEPTION: ' + js2JSON(e) + '\n');
        }
    },

    'GetPrintSettings' : function() {
        try {
            //alert('entering GetPrintSettings');
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            var pref = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefBranch);
            //alert('pref = ' + pref);
            if (pref) {
                this.gPrintSettingsAreGlobal = pref.getBoolPref("print.use_global_printsettings", false);
                this.gSavePrintSettings = pref.getBoolPref("print.save_print_settings", false);
                //alert('gPrintSettingsAreGlobal = ' + this.gPrintSettingsAreGlobal + '  gSavePrintSettings = ' + this.gSavePrintSettings);
            }
 
            var printService = Components.classes["@mozilla.org/gfx/printsettings-service;1"]
                .getService(Components.interfaces.nsIPrintSettingsService);
            if (this.gPrintSettingsAreGlobal) {
                this.gPrintSettings = printService.globalPrintSettings;
                //alert('called setPrinterDefaultsForSelectedPrinter');
                this.setPrinterDefaultsForSelectedPrinter(printService);
            } else {
                this.gPrintSettings = printService.newPrintSettings;
                //alert('used printService.newPrintSettings');
            }
        } catch (e) {
            this.error.sdump('D_ERROR',"GetPrintSettings() "+e+"\n");
            //alert("GetPrintSettings() "+e+"\n");
        }
 
        return this.gPrintSettings;
    },

    'setPrinterDefaultsForSelectedPrinter' : function (aPrintService) {
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            if (this.gPrintSettings.printerName == "") {
                this.gPrintSettings.printerName = aPrintService.defaultPrinterName;
                //alert('used .defaultPrinterName');
            }
            //alert('printerName = ' + this.gPrintSettings.printerName);
     
            // First get any defaults from the printer 
            aPrintService.initPrintSettingsFromPrinter(this.gPrintSettings.printerName, this.gPrintSettings);
     
            // now augment them with any values from last time
            aPrintService.initPrintSettingsFromPrefs(this.gPrintSettings, true, this.gPrintSettings.kInitSaveAll);

            // now augment from our own saved settings if they exist
            this.load_settings();

        } catch(E) {
            this.error.sdump('D_ERROR',"setPrinterDefaultsForSelectedPrinter() "+E+"\n");
        }
    },

    'page_settings' : function() {
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            this.GetPrintSettings();
            var PO = Components.classes["@mozilla.org/gfx/printsettings-service;1"].getService(Components.interfaces.nsIPrintOptions);
            PO.ShowPrintSetupDialog(this.gPrintSettings);
        } catch(E) {
            this.error.standard_unexpected_error_alert("page_settings()",E);
        }
    },

    'load_settings' : function() {
        try {
            var error_msg = '';
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            var file = new util.file('gPrintSettings.' + this.context);
            if (file._file.exists()) {
                temp = file.get_object(); file.close();
                for (var i in temp) {
                    try { this.gPrintSettings[i] = temp[i]; } catch(E) { error_msg += 'Error trying to set gPrintSettings.'+i+'='+temp[i]+' : ' + js2JSON(E) + '\n'; }
                }
            }  else if (this.context != 'default') {
                var file = new util.file('gPrintSettings.default');
                if (file._file.exists()) {
                    temp = file.get_object(); file.close();
                    for (var i in temp) {
                        try { this.gPrintSettings[i] = temp[i]; } catch(E) { error_msg += 'Error trying to set gPrintSettings.'+i+'='+temp[i]+' : ' + js2JSON(E) + '\n'; }
                    }
                } else {
                    this.gPrintSettings.marginTop = 0;
                    this.gPrintSettings.marginLeft = 0;
                    this.gPrintSettings.marginBottom = 0;
                    this.gPrintSettings.marginRight = 0;
                    this.gPrintSettings.headerStrLeft = '';
                    this.gPrintSettings.headerStrCenter = '';
                    this.gPrintSettings.headerStrRight = '';
                    this.gPrintSettings.footerStrLeft = '';
                    this.gPrintSettings.footerStrCenter = '';
                    this.gPrintSettings.footerStrRight = '';
                }
            }
            if (error_msg) {
                this.error.sdump('D_PRINT',error_msg);
                this.error.yns_alert(
                    document.getElementById('offlineStrings').getString('load_printer_settings_error_description'),
                    document.getElementById('offlineStrings').getString('load_printer_settings_error_title'),
                    document.getElementById('offlineStrings').getString('common.ok'),
                    null,
                    null,
                    null
                );
            }
        } catch(E) {
            this.error.standard_unexpected_error_alert("load_settings()",E);
        }
    },

    'save_settings' : function() {
        try {
            var obj = this;
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            var file = new util.file('gPrintSettings.' + this.context);
            if (typeof obj.gPrintSettings == 'undefined') obj.GetPrintSettings();
            if (obj.gPrintSettings) file.set_object(obj.gPrintSettings); 
            file.close();
            if (this.context == 'default') {
                // print.print_printer gets used by bare window.print()'s.  We sometimes use window.print for the
                // WebBrowserPrint strategy to workaround bugs with the NSPrint xpcom, and only in the default context.
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces['nsIPrefBranch']);
                prefs.setCharPref('print.print_printer',obj.gPrintSettings.printerName);
            }
        } catch(E) {
            this.error.standard_unexpected_error_alert("save_settings()",E);
        }
    }
}

dump('exiting util/print.js\n');
