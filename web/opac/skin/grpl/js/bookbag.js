var URL_THUMBS = "https://grpl.michiganevergreen.org//opac/extras/ac/jacket/small/";
var URL_LARGE  = "https://grpl.michiganevergreen.org//opac/extras/ac/jacket/large/";

var TRACK = {
	"#out-facebook":"/outgoing/facebook",
	"#out-twitter":"/outgoing/twitter",
	"#out-foursquare":"/outgoing/foursquare",
	"#out-flickr":"/outgoing/flickr",
};

function init() {
	// create image URLs from provided ISBNs
	var isbnExp = /URN:ISBN:([0-9]{10})($|[^[0-9]])/;
	$(".identifier").each(function(){
		var match = isbnExp.exec($(this).html())
		if (match){
			var isbn = match[1];
			$("a.image-link[item='"+$(this).attr("item")+"']")
				.html("<img src='"+URL_THUMBS+isbn+"'/>")
				.attr("href", URL_LARGE+isbn);
		}
	});

	// set up outgoing link tracking
	for (var id in TRACK) {
		$(id).click(function(){
			pageTracker._trackPageview(TRACK[id]);	
		});
	}
}