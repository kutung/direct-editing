Steps In Multi-column approach

Content Information Extraction Process
1. Template configuration and CSS file for the current JID must be retrived.
2. Flow the HTML content given into the source container, which desolves all the css definition for this HTML content.
3. Identify and Wrap the text breaks [like space and hard hyphen], hidden breaks [like soft hyphen and zero width space] and text ends in flowed HTML content with span tags with 'tb', 'hb' and 'te' class attribute respectivily.
4. Identify and move the linked anchores like floats, footnotes etc., into separate container.
5. Identify the possible containers and its width from the template configuration [For example: head content should render in single column, and body content should render in multiple columns].
6. Split the flowed HTML content based on the container identified and Change its width accordingly.
7. Identify the line-ends within each source containers and build them into a JSON object.
8. As the height and co-ordinate information of each lines and linked target items are extracted into the JSON objects, the visibility of source containers are no more required, so all the source containers are made as hidden, which increases the performance of pagination process.

Pagination Information Generation Process
9. Render the template HTML of template configuration for doing pagination process.
10. Pick the respective page based on the current position from rendered template HTML.
11. Pick all the page-items within that page, and identify the corresponding container JSON object. 
12. For each page-items within the page increase its height one by one based on the corresponding container JSON object's lines, and identify the column break.
13. Line JSON object also contains information about the linked anchores, so any line object is considered for page-item's height, than those linked anchors targets are marked for pending placement.
14. In case of placement of any linked target item, we need to reset the heights of all running page-items within that page, and reflow the running page-items once again and check for pre-existance of linked anchores.
15. Once the page got fit by its page-items within its page-margin, than build the page JSON object with respective page-item childs along with column break information should be created.
16. Reset all the page-items height to zero, for paginating next page.
17. Do this process until all the lines got placed.
18. Remove the rendered template HTML.

Flowing the Content
19. Render the respective page for the current position from template configuration.
20. Append the lines one by one into each page-item until column break or empty line object occure in corresponding container JSON object.
21. continue this process until all the page JSON object got rendered.
