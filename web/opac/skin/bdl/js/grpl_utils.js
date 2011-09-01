function show_reset_pw() {
    unHideMe($('reset_pw_block'));
    hideMe($('reset_pw_link'));
    hideMe($('login_table'));
    hideMe($('reset_pw_fail'));
    hideMe($('reset_pw_success'));
}

function hide_pw_result() {
    hideMe($('reset_pw_fail'));
    hideMe($('reset_pw_success'));
}

function reset_pw(){

    var b = $('reset_pw_bcode').value;
    var e = $('reset_pw_email').value;
    var result=null;

    var request = false;
    var self = this;
    var url = '/cgi-bin/utils/public/reset_passwd.cgi';
    var qstr = 'barcode='+b+'&email='+e;

    self.request = new XMLHttpRequest();
    self.request.open("POST", url, false);
    self.request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    self.request.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
    self.request.setRequestHeader('Pragma','no-cache');

    self.request.onreadystatechange = function() {
        if (self.request.readyState == 4) {
            result = self.request.responseText;
        }
    }
    self.request.send(qstr);
//    self = null;


  if (self.request.responseText == 1 ){
    unHideMe($('login_table'));
    hideMe($('reset_pw_block'));
    unHideMe($('reset_pw_success'));
    result = null;
  }else{
    unHideMe($('reset_pw_fail'));
    result = null;
  }
}



function getHoldCount(id){
  var holdCount = null;
  var result = null;

  if (window.XMLHttpRequest) {
    // Code for all new browsers
    holdCount = new XMLHttpRequest();
  } else if ( window.ActiveXObject ) {
    // Code for IE 5 and 6
    holdCount = new ActiveXObject( "Microsoft.XMLHTTP" );
  }

   holdCount.open( "GET", "/cgi-bin/utils/public/hold_count_bdl.cgi?id=" + id, false )
   holdCount.onreadystatechange = function() {
        if (holdCount.readyState == 4) {
            result = holdCount.responseText;
        }
    }
    holdCount.send(null);

    if (holdCount.responseText)
       return  holdCount.responseText;

}

function txtCallNumber(tit,cn){
	tit = tit.replace(/'/g,'');
	cn = cn.replace(/'/g,'');

	dojo.require('dojo.cookie');
	var carrier = dojo.cookie('txtCarrier') || '';
	var number = dojo.cookie('txtNumber') || '';		

	var win = window.open('','',"location=no,width=450,height=230,scrollbars");
	var content = "<body>";
	content += '<link type="text/css" rel="stylesheet" href="http://grpl-new.michiganevergreen.org//opac//common/css/mediumfont.css">';
	content += "<span>Call number and title information can be sent via text message to certain mobile devices.  Please select your carrier and enter your 10-digit mobile number.</span><br/>&nbsp;";
	content += "<form method='post' action='/cgi-bin/utils/txtCallNumber.cgi'>";
	content += "<select name='carrier' id='carrier'><option>"+carrier;
	content += "<option>Alltel<option>AT&T<option>BoostMobile<option>MetroPCS<option>Sprint/Nextel<option>T-Mobile<option>USCellular<option>VirginMobile<option>Verizon</select>";
	content += "<input type='text' name='number' id='number' size='15' value='" + number + "'/>";
	content += "<input type='hidden' name='title' value=\"" + tit + "\"/>";
	content += "<input type='hidden' name='callnumber' value=\"" + cn + "\"/>";
	content += "<input type='submit' value='Send' onClick='storeValues()'/></form>";
	content += "<ul><span><b>" + tit + " : " + cn + "</b></span></ul>";
	content += "<p><br/>** Standard text messaging rates apply.<br/></p>";
	content += '<script type="text/javascript" src="/js/dojo/dojo/dojo.js"></script><script language="javascript" type="text/javascript">dojo.require("dojo.cookie");dojo.require("dojo.date");';
	content += 'function clearIt() {dojo.cookie("txtCarrier","",{expire: -1});dojo.cookie("txtNumber","",{expire: -1});document.getElementById("carrier").value="";document.getElementById("number").value="";}';
	content += 'function storeValues() {document.body.style.opacity = ".3"; var c = document.getElementById("carrier").value; var n = document.getElementById("number").value; var now = new Date(); var exp = dojo.date.add(now,"minute",3); dojo.cookie("txtCarrier",c,{expires: exp}); dojo.cookie("txtNumber",n,{expires: exp}); } </script>';
	content += "<div align='right'><input type='button' value='Clear' onclick='clearIt();'/></div>";

	content += "</body>";

	win.document.write(content);
}
