/*
 *    BDL change on 2008-10-29 by John Rucker to add
 *        page numbers to results pages
 */

function replace_offset(value)
/*
 *     changes the offset in the URL query string to a new value
 */
{
    var query = window.location.search.substring(1);

    if (query.search(/o=\d{1,}/) == -1)
    {
        query = query.concat('&o=' + value);
    }
    else
    {
        query = query.replace(/o=\d{1,}/g, 'o=' + value);
    }

    return query;

}

function remove_whitespace(str)
{
     str = str.replace(/^\s*|\s*$/g,'');

     return str;
}

function add_page_numbers()
/*
 *    adds google-style page numbers between the next and previous arrows
 */
{
    // edit the variables below to fit your needs
    var offset_show        = 4;    // the number of results pages on either side of the current page to show when in truncated view
    var truncate_page_list = true; // set to false to always show all pages

    var truncate_limit = offset_show * 2 + 3;

    // get the current offset start and end, and page number info from the results set
    var page_num_offset_start = Number(remove_whitespace(document.getElementById('offset_start').innerHTML));
    var page_num_offset_end   = Number(remove_whitespace(document.getElementById('offset_end').innerHTML));
    var page_num_result_count = Number(remove_whitespace(document.getElementById('result_count').innerHTML));
    var page_num_current_page = Number(remove_whitespace(document.getElementById('current_page').innerHTML));
    var page_num_num_pages    = Number(remove_whitespace(document.getElementById('num_pages').innerHTML.replace(')', '')));

    var results_per_page = COUNT; // constant from common/js/config.js

    var page_number_HTML = '';

    // set up the page number HTML
    for (i = 1; i <= page_num_num_pages; i++)
    {
        // set up the links to have the correct offset
        var query = replace_offset(results_per_page * (i -1));

        // if number of pages is > than the limit, truncate the display
        if (page_num_num_pages > truncate_limit && truncate_page_list)
        {
            // always show page 1, linked when appropriate
            if (i == 1 && page_num_current_page == 1)
            {
                page_number_HTML = page_number_HTML + i + ' ';
            }
            else if (i == 1 && page_num_current_page != 1)
                 {
                    page_number_HTML = page_number_HTML + '<a href="?' + query + '">' + i + '</a> ';
                 }

            // displaying numbers left of the current page
            if (i < page_num_current_page)
            {
                // display an ellipsis when needed
                if (i == page_num_current_page - offset_show - 1 && i != 1)
                {
                    page_number_HTML = page_number_HTML + " &hellip; ";
                }

                // display only numbers within the offset_show range
                if (i + offset_show >= page_num_current_page && i != 1)
                {
                    page_number_HTML = page_number_HTML + '<a href="?' + query + '">' + i + '</a> ';
                }
            }

            // display the number of the current page
            if (i == page_num_current_page && page_num_current_page != 1 && page_num_current_page != page_num_num_pages)
            {
                page_number_HTML = page_number_HTML + i + ' ';
            }

            // displaying page numbers to the right of the current page
            if (i > page_num_current_page)
            {
                // display only numbers within the offset_show range
                if (i - page_num_current_page <= offset_show && i != page_num_num_pages)
                {
                    page_number_HTML = page_number_HTML + '<a href="?' + query + '">' + i + '</a> ';
                }

                // display an ellipsis when needed
                if (i == page_num_current_page + offset_show + 2)
                {
                    page_number_HTML = page_number_HTML + " &hellip; ";
                }
            }

            // always show last page, linked when appropriate
            if (i == page_num_num_pages && page_num_current_page == page_num_num_pages)
            {
                page_number_HTML = page_number_HTML + i + ' ';
            }
            else if (i == page_num_num_pages && page_num_current_page != page_num_num_pages)
                 {
                    page_number_HTML = page_number_HTML + '<a href="?' + query + '">' + i + '</a> ';
                 }

        }
        else // less than the truncate_limit or truncating disabled
        {
            // don't display a link for the current page
            if (i != page_num_current_page)
            {
                page_number_HTML = page_number_HTML + '<a href="?' + query + '">' + i + '</a> ';
            }
            else
            {
                page_number_HTML = page_number_HTML + i + ' ';
            }
        }
    }

    // add the page numbers to the screen
    document.getElementById('page_numbers').innerHTML = page_number_HTML;
    document.getElementById('page_numbers2').innerHTML = page_number_HTML;
}

/*
 *    END BDL change on 2008-10-29 by John Rucker to add
 *        page numbers to results pages
 */

