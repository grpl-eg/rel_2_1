
        var address = [];

        function setAddress(id)
        {
                switch(id)
                {
                case "main":
                        address = ['Grand Rapids Public Library', '111 Library Street NE', 'Grand Rapids, MI 49503', '(616) 988 5400'];
                        break;
                case "madison":
                        address = ['Madison Square Branch', '1201 Madison SE', 'Grand Rapids, MI 49507', '(616) 988 5411'];
                        break;
                case "seymour":
                        address = ['Seymour Branch', '2350 Eastern SE', 'Grand Rapids, MI 49507', '(616) 988 5413'];
                        break;
                case "ottawa":
                        address = ['Ottawa Hills Branch', '1150 Giddings SE', 'Grand Rapids, MI 49506', '(616) 988 5412'];
                        break;
                case "leonard":
                        address = ['West Leonard Branch', '1017 Leonard NW ', 'Grand Rapids, MI 49504', '(616) 988 5416'];
                        break;
                case "vanBelkum":
                        address = ['Van Belkum Branch', '1563 Plainfield NE', 'Grand Rapids, MI 49505', '(616) 988 5410'];
                        break;
                case "yankee":
                        address = ['Yankee Clipper Branch', '2025 Leonard NE', 'Grand Rapids, MI 49505', '(616) 988 5415'];
                        break;
                case "westSide":
                        address = ['West Side Branch', '713 Bridge NW', 'Grand Rapids, MI 49504', '(616) 988 5414'];
                        break;
                };



                $('addressDisplay').innerHTML="<h3>" + address[0] + "</h3><p>" + address[1] + "<br />" + address[2] + "<br />Phone " + address[3] + "</p><div id='contact'> <a href='http://www.grpl.org/cgi-bin/contact.cgi'>Contact Us</a></div>";

        }


