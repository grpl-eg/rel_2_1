<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:holdings="http://open-ils.org/spec/holdings/v1" xmlns:xhtml="http://www.w3.org/1999/xhtml" exclude-result-prefixes="xsl opensearch opensearchOld atom rss9 rss1 content dc xhtml holdings" >

<xsl:output omit-xml-declaration="yes" type="html" doctype-public="-//W3C/DTD HTML 4.01 Transitional//EN" doctype-system="http://www.w3.org/TR/html4/strict.dtd" encoding="UTF-8" media-type="text/html" />

<xsl:template match="atom:feed">

<xsl:variable name="bookbag_title" select="substring-before(substring-after(atom:title, '['), ']')"/>

<xsl:variable name="items" select="atom:entry"/>

<html>

<head >
	<title>GRPL Bookbag: <xsl:value-of select="$bookbag_title"/></title>
	<meta name="robots" content="noindex,nofollow,noarchive"/>
	<link rel="stylesheet" type="text/css" media="screen"><xsl:attribute name="href"><xsl:value-of select="concat($base_dir, '../skin/grpl/css/bookbag.css')"/></xsl:attribute></link>
	<link rel="stylesheet" type="text/css" href="http://www.grpl.org/js/slimbox/css/slimbox2.css"/>
	<script type="text/javascript"><xsl:attribute name="src"><xsl:value-of select="concat($base_dir, '../skin/grpl/js/bookbag.js')"/></xsl:attribute></script>
	<script type="text/javascript" src="http://www.grpl.org/js/jquery-1.6.3.min.js"></script>
	<script type="text/javascript" src="http://www.grpl.org/js/slimbox/js/slimbox2.js"></script>
	<script type="text/javascript" src="http://www.grpl.org/js/addressDisplay.js"></script>
</head>

<body onload="init();">
<div id="content">

<div id="header">
	<div id="nav" class="panel"><a href="http://www.grpl.org/"><img id="grpl"><xsl:attribute name="src"><xsl:value-of select="concat($base_dir, '../images/grpl/nav_logo.gif')"/></xsl:attribute></img></a><div id="wave"></div></div>
	<div id="bookbag-title">Bookbag: <xsl:value-of select="$bookbag_title"/> (<xsl:value-of select="count($items)"/> items)</div>
</div>

<div id="bookbag">

	<div id="sidebar" class="panel">
		Bookbags are collections of library materials that people can create and share.<br/><br/>Visit <a href="https://grpl.michiganevergreen.org/opac/en-US/skin/grpl/xml/myopac.xml?l=10">your account</a> on the catalog to create your own.
	</div><div id="bag" class="panel">

	<!-- item loop -->
	<xsl:for-each select="$items">

	<xsl:variable name="title" select="atom:title"/>
	<xsl:variable name="description" select="atom:summary"/>
	<xsl:variable name="categories" select="atom:category"/>
        <xsl:variable name="id" select="substring-before(substring-after(atom:id[2], 'biblio-record_entry/'), '/ME')"/>
        <xsl:variable name="opac">http://grpl-new.michiganevergreen.org/opac/en-US/skin/grpl/xml/rdetail.xml?r=<xsl:value-of select="$id"/></xsl:variable>

	<!-- TODO: remove discard/weed -->
	<xsl:variable name="copies" select="holdings:holdings/holdings:volumes//holdings:volume[contains(@lib, 'GRPL')]/holdings:copies"/>

	<div class="item shadow">

		<xsl:attribute name="id"><xsl:value-of select="$id"/></xsl:attribute>

		<!-- print identifiers for parsing by JS -->
		<xsl:for-each select="dc:identifier">
			<div style="display:none;" class="identifier">
				<xsl:attribute name="item"><xsl:value-of select="$id"/></xsl:attribute>
				<xsl:value-of select="current()"/>
			</div>
		</xsl:for-each>

		<div class="quick-info panel">
			<div class="image">
				<a href="#" rel="lightbox" class="image-link">
					<xsl:attribute name="item"><xsl:value-of select="$id"/></xsl:attribute>
				</a>
			</div>
			<div class="availability"><div class="available">
				<a><xsl:attribute name="href"><xsl:value-of select="$opac"/></xsl:attribute>
                                <xsl:choose>
					<xsl:when test="count($copies) > 1 or count($copies) = 0">
						<xsl:value-of select="count($copies)"/> Copies
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="count($copies)"/> Copy
					</xsl:otherwise>
				</xsl:choose>
                                </a>
			</div></div>
		</div><div class="info panel">

			<div class="title">
				<a><xsl:attribute name="href"><xsl:value-of select="$opac"/></xsl:attribute>
				
				<!-- remove [media-type] from title if present -->
				<xsl:choose>
					<xsl:when test="contains($title, '[')">
						<xsl:value-of select="substring-before($title, '[')" />
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="substring-before($title, '/')"/>
					</xsl:otherwise>
				</xsl:choose>

				</a><br />			
				<span class="authors">
				<xsl:for-each select="atom:author">
					<!-- remove 'prf' from author -->
					<xsl:choose>
						<xsl:when test="contains(current(), 'prf')">
							<div class="author"><a href="#"><xsl:value-of select="substring-before(current(), 'prf')"/></a></div>
						</xsl:when>
						<xsl:otherwise>
							<div class="author">
								<a>
									<xsl:attribute name="href">http://grpl-new.michiganevergreen.org/opac/en-US/skin/grpl/xml/rresult.xml?rt=author&amp;t=<xsl:value-of select="current()"/>.&amp;tp=author&amp;ol=9&amp;l=9&amp;d=1</xsl:attribute>
									<xsl:value-of select="current()"/>
								</a></div>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:for-each>
				</span>
			</div>

			<div class="description"><xsl:value-of select="$description"/></div>
			
			<xsl:if test="count($categories) > 0">	
			<div class="categories">Categories:
				<xsl:for-each select="$categories">
					<div class="category">
						<a>
							<xsl:attribute name="href">http://grpl-new.michiganevergreen.org/opac/en-US/skin/grpl/xml/rresult.xml?rt=subject&amp;tp=subject&amp;t=<xsl:value-of select="@term"/>.&amp;d=1&amp;l=9&amp;ol=9
							</xsl:attribute>
							<xsl:value-of select="@term"/>
						</a>
					</div>
				</xsl:for-each>
			</div>	
			</xsl:if>

		</div>
	</div>

	</xsl:for-each>
	<!-- /item loop -->

        <!--<div id="widgit-link-container">Get an embeddable widgit that links to this bookbag <a id="widgit-link" href="javascript:showWidgit();">here</a>.</div>
-->
	</div>
</div>

<div id="footer">
	<a href="http://www.grpl.org" id="footer-logo"><img border="0" alt="logo" src="http://www.grpl.org/img/footer_logo.gif" /></a>
	<div id="addressSelect">
		<h3>8 Urban Locations:</h3>
		<ul>
			<li id="main"><a href="http://www.grpl.org/about/main.php">Main Library</a></li>
			<li id="madison"><a href="http://www.grpl.org/about/madison.php">Madison Square Branch</a></li>
			<li id="seymour"><a href="http://www.grpl.org/about/seymour.php">Seymour Branch</a></li>
			<li id="ottawa"><a href="http://www.grpl.org/about/ottawa.php">Ottawa Hills Branch</a></li>
			<li id="leonard"><a href="http://www.grpl.org/about/westleonard.php">West Leonard Branch</a></li>
			<li id="valBelkum"><a href="http://www.grpl.org/about/vanbelkum.php">Van Belkum Branch</a></li>
			<li id="yankee"><a href="http://www.grpl.org/about/yankee.php">Yankee Clipper Branch</a></li>
			<li id="westSide"><a href="http://www.grpl.org/about/westside.php">West Side Branch</a></li>
		</ul>
	</div>
	 <div id="addressDisplay">
		<h3>Grand Rapids Public Library</h3>
		<p>111 Library Street NE<br />Grand Rapids, MI 49503<br />Phone (616) 988 5400</p>
	</div>
	<!--<div id="contact"><a href="http://grpl.org/cgi-bin/contact.cgi">Contact Us</a></div>-->
	<div id="navigation">
		<ul>
	        <li><a href="http://www.grpl.org/">Home</a></li>
	        <li><a href="http://www.grpl.orghttp://www.grpl.org/about/">About</a></li>
	        <li><a href="http://www.grpl.org/perl/events.pl">Classes and Events</a></li>
	        <li><a href="http://www.grpl.org/blog">Blog</a></li>

	        <li><a href="http://www.grpl.org/about/enews.php">Sign Up for eNewsletter</a></li>
	        <li><a href="http://www.grpl.org/involved/">Get Involved</a></li>
	        <li><a href="http://m.grpl.org/">Mobile</a></li>

	        <li>
	        	<a id="out-facebook" href="http://www.facebook.com/GrandRapidsPublicLibrary">
	        		<img src="http://www.grpl.org/img/fb.png" alt="Become a fan!" title="Become a fan!"/>
	        	</a>
	        	<a id="out-twitter" href="http://www.twitter.com/grpl">
	        		<img src="http://www.grpl.org/img/twitter.png" alt="Follow us!" title="Follow us!"/>
	        	</a>
	        	<a id="out-foursquare" href="http://foursquare.com/grpl">
	        		<img src="http://www.grpl.org/img/foursquare.png" alt="Check in!" title="Check in!"/>
	        	</a>
	        	<a id="out-youtube" href="http://www.youtube.com/user/grpublib">
	        		<img src="http://www.grpl.org/img/youtube.png" alt="Check out broadcasts!" title="Check out broadcasts!"/>
	        	</a>
	        	<a id="out-flickr" href="http://www.flickr.com/photos/grpl/">
	        		<img src="http://www.grpl.org/img/flickr.png" alt="See our photostream!" title="See our photostream!"/>
	        	</a>
	        	<a id="donate" href="http://www.grpl.org/involved/donate.php">
	        		<img src="http://www.grpl.org/img/donateicon.png"/>
	        	</a>
	        </li>

		</ul>
	</div>
</div>
<!-- /footer -->

</div>

<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-3119846-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

</body>

</html>

</xsl:template>

</xsl:stylesheet>
