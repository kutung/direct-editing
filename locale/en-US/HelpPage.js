define([], function helpLocaleLoader() {
    var locale = {
        'help.header.title': 'Online Proofing Help',
        'help.left.panel.quick.start': 'Quick Start',
        'help.left.panel.interface': 'Interface',
        'help.left.panel.queries': 'Queries',
        'help.left.panel.float.contexual.menu': 'Floating Contextual Menu',
        'help.left.panel.insert': 'Insert',
        'help.left.panel.instruct': 'Instruct',
        'help.left.panel.math.editing': 'Math Editing',
        'help.left.panel.edit.log': 'Edit Log',
        'help.left.panel.toc': 'Quick Links',
        'help.left.panel.save.submit': 'Save &amp; Submit',
        'help.right.panel.quick.start.heading': 'Make sure before you submit that',
        'help.right.panel.check.surname': 'You check Surnames (highlighted teal) - If our highlighting is incorrect, please instruct.',
        'help.right.panel.check.copyeditor.changes': 'You check all copyeditor changes that are highlighted green/red with a grey background.',
        'help.right.panel.answer.queries': 'You answer all the Queries. You cannot submit your article without answering all the queries.',
        'help.right.panel.annotate.graphics': 'You annotate the graphics if and as needed (We will edit and replace the graphics as per your annotation).',
        'help.right.panel.print.proof.part1': 'See your article as a print proof. Click on ',
        'help.right.panel.print.proof.part2': ' to generate it. The print proof updates inline changes you make in the Edit view. Toggle between the two views and satisfy yourself.',
        'help.right.panel.interface.help.content.point1': 'When you click',
        'help.right.panel.interface.help.content.point2': 'in the landing page of Proof Central, you are taken to your copyedited, typeset article presented in a two-pane layout.',
        'help.right.panel.interface.left.pane': '(1) Left Pane',
        'help.right.panel.interface.left.pane.para.pane.house': 'The left larger pane houses the body of your article, under the Article tab as a default in the edit view. When you click any content on the left pane a floating contextual menu comes up with handles for inserting & instructing and when you select any content on the left pane a floating contextual menu comes up with handles for styling and editing',
        'help.right.panel.interface.left.pane.para.see.details': 'see details',
        'help.right.panel.interface.left.pane.para.supplementary': 'The left pane supports a ‘Supplementary’ tab under which Proof Central lists the supplementary materials, highlights, graphical abstracts submitted by you.',
        'help.right.panel.interface.right.pane': '(2) Right Pane',
        'help.right.panel.interface.right.pane.para.4.controls.quicklinkoff': 'The right pane has the controls. The topmost lets you address copyeditor Queries. The next control tracks and lists all changes during the proof correction process. The third control may appear when you choose to insert or instruct. Insert option lets you Insert content into the body of the article and Instruct option lets you put in Instructions for your publisher to work on after you submit the proof. The last control tracks and Lists all changes done by the copyeditor and you.',
        'help.right.panel.interface.right.pane.para.4.controls.quicklinkon': 'The right pane has the controls. The topmost control provides the quick links that allow you to navigate the proof through the sections and view the images and tables in the proof quickly. The next control lets you address copyeditor Queries. The third control tracks and lists all changes during the proof correction process. The forth control may appear when you choose to insert or instruct. Insert option lets you insert content into the body of the article and Instruct option lets you put in instructions for your publisher to work on after you submit the proof.',
        'help.right.panel.interface.right.pane.para.3.controls': '',
        'help.right.panel.interface.controls': '(3) Controls to view the content',
        'help.right.panel.interface.controls.para.edit.mode': 'At the right top of the left pane, there are controls for you to view the content in two ways. The Edit mode presents the content in continuous scroll and in track-changes mode with inserted content shown highlighted in green and the deleted content shown struckthrough and in red, both with a yellow background.',
        'help.right.panel.interface.controls.para.proof.mode': 'The Proof mode updates the changes and presents the content as it is most likely to appear in print, with page division and numbers, footnotes placed as per print convention, and the floats placed appropriately. You can toggle between the Edit and Proof modes as much as you wish to.',
        'help.right.panel.queries.para.dialog': 'The Queries dialog at the top of the right pane is activated by default while loading the article, also activated by clicking on the control. The queries are stacked Q1, Q2, Q3…, Click on (query identifier or query text) any one query to view and act on it using the associated dialog below. This response dialog has rich text formatting options for you to set your text in bold/italic/superscript/subscript.',
        'help.right.panel.queries.para.special.char': 'The queries/insert/instruct dialog box also lets you access special characters that you may wish to insert. A palette of special characters to select from will be presented. Please note you have the option to select special characters not available in the palette through a link to a Unicode table.',
        'help.right.panel.queries.para.attachment': 'Your response are autosaved, however you can come back and edit your response any time before submission. ',
        'help.right.panel.queries.para.attachment.2': 'You can respond to a Query with an attachment* and provide remarks on how the attachment should be used by the publisher.',
        'help.right.panel.queries.para.attachment.note': 'Supports all formats other than: sh, asp, cgi, php, php3, ph3, php4, ph4, php5, ph5, phtm, phtml, js, cgi, pl. File size not exceeding 20mb per file.',
        'help.right.panel.queries.para.save': 'Once your response to a query is composed, click anywhere outside the text box, your response are autosaved. Please note that it is imperative for you to respond to every query. As you respond, the number of pending queries will count down till Zero is reached.',
        'help.right.panel.floating.menu.formatting': 'The floating contextual menu comes up when you select/click content in the left pane.',
        'help.right.panel.floating.menu.editing.controls.1': 'When you click any content on the left pane a floating contextual menu comes up with handles for inserting & instructing.',
        'help.right.panel.floating.menu.editing.controls': 'When you select any content on the left pane a floating contextual menu comes up with handles for in situ styling (bold, italic, superscript, subscript) and deleting.',
        'help.right.panel.insert.controls.text': 'To insert new content into your article, You must point your cursor to a specific location within the article where the new content should be inserted.',
        'help.right.panel.insert.controls.before.text': 'Invoke the Insert input box through Input control',
        'help.right.panel.insert.controls.after.text': 'available in the floating contexual menu. Key in the necessary content, style it as rich text using the formatting options.',
        'help.right.panel.insert.proceed.after.text': 'You must point your cursor to a specific location within the article where the new content should be inserted.',
        'help.right.panel.insert.save.inserted.text': 'Once you enter the content, click anywhere outside the text box, the content are autosaved and it appears in the chosen place and in green with a yellow background, so you can keep an easy eye on the new content that you introduce.',
        'help.right.panel.insert.clear.before.text': 'In case you want to undo or edit the inserted content, click anywhere on the inserted content. The floating contextual menu with Undo and Edit options appears with Edit option active, that is the insert accordion with the inserted content opens in the right pane.',
        'help.right.panel.insert.clear.after.text': ' You can undo your insert using the Undo control',
        'help.right.panel.insert.undo.clear.after.text': 'in the floating contextual menu. Please note the available controls in the floating menu vary according to the change type.',
        'help.right.panel.instruct.pass.publisher': 'Proof Central lets you pass on an instruction to the publisher for the latter to do what you are unable to do yourself.',
        'help.right.panel.instruct.controls.before.text': 'Click on Instruct control',
        'help.right.panel.instruct.controls.after.text': 'through the floating contextual menu and launch the instruct dialog in the right pane to key in your instruction.',
        'help.right.panel.instruct.proceed.after.text': 'Click anywhere outside the text box, the instructions are auto saved. Similar to the queries dialog, the instruction dialog permits attachment of files',
        'help.right.panel.instruct.edit.undo': '',
        'help.right.panel.math.editing.option': 'Proof Central facilitates modifying scientific and technical equations through 3 modes. 1) WYSIWYG Math editing, 2) LaTeX import, and 3) annotated image instructions for publisher to correct offline.',
        'help.right.panel.edit.log.edit.list': 'The bottom most control on the right panel provides a list of all edits, categorized by the actor - Author and Copy Editor. The edits are listed in the order of their appearance in the manuscript.',
        'help.right.panel.edit.log.edit.location.1': 'You can view the edits based on the type using',
        'help.right.panel.edit.log.edit.location': 'You can click on each list item in the Edit Log to get to the edit location in the left pane.',
        'help.right.panel.edit.log.floating.menu': 'The edit location flashes as you approach it. You may then choose to modify the edit as desired, using the available actions in the floating menu.',
        'help.right.panel.toc.help.content.overview': 'Quick Links is the first control in the right pane. It contains two tabs, the first tab lists the section headings of the chapter and allows you to navigate the proof through the sections.',
        'help.right.panel.toc.help.content.initial.view': 'The initial view shows only the first-order headings. The heading with subheadings is preceded by a black right-pointing triangle \'&#9658;\'.',
        'help.right.panel.toc.help.content.controls.expand': 'Clicking the black right-pointing triangle \'&#9658;\' of a heading expands the heading by showing its subheadings. The triangle changes to down-pointing \'&#9660;\'. The subheadings are indented by 2 or 3 characters with respect to the heading.',
        'help.right.panel.toc.help.content.point1': 'Clicking on a heading takes you to the corresponding section in the proof.',
        'help.right.panel.toc.help.content.point2': 'Clicking the black down-pointing triangle \'&#9660;\' collapses the heading and the triangle changes to right-pointing \'&#9658;\'.',
        'help.right.panel.toc.help.content.point3': 'The headings are truncated. The truncated headings are followed by the ellipsis.',
        'help.right.panel.toc.help.content.point4': 'The headings contain the final text after copy editing and it gets updated when you make edits in the proof.',
        'help.right.panel.toc.help.image.panel': 'Quick Links Panel',
        'help.right.panel.toc.help.image.keyboard.shortcut.title': 'Keyboard Shortcuts',
        'help.right.panel.toc.help.image.multilevel.panel': 'Quick Links Panel With Multilevel',
        'help.right.panel.toc.help.image.ellipsis.panel': 'Quick Links Ellipsis',
        'help.right.panel.toc.help.image.keyboard.shorcut': 'Quick Links Keyboard Shortcut',
        'help.right.panel.toc.help.content.figure.and.table.overview': 'The second tab lists the icons of the tables and figures present in the proof.',
        'help.right.panel.toc.help.content.figure.and.table.navigate': 'Clicking on an icon takes you to the corresponding image/table in the proof.',
        'help.right.panel.toc.help.image.figure.and.table': 'Quicklinks figures and tables',
        'help.right.panel.toc.help.image.figure.and.table.navigate': 'Quicklinks figures and tables navigation',
        'help.right.panel.save.submit.save.button.before.text': 'When you introduce a change in the article, the Save button',
        'help.right.panel.save.submit.save.button.after.text': 'is activated for you to save the changes. Your changes are autosaved too.',
        'help.right.panel.save.submit.session.report.before.text': 'Proof Central creates a record of your actions over the content. You can generate and download this ‘Session Report’ by clicking on this',
        'help.right.panel.save.submit.session.report.after.text': 'icon, each time before you log out.',
        'help.right.panel.save.submit.submit.button.before.text': 'Clicking on Submit ',
        'help.right.panel.save.submit.submit.button.after.text': ' pushes the article to the next stage in the process, which, by this time should be ready and free of queries and corrections. At Submit a consolidated Session Report is auto-generated and mailed to you.',
        'help.right.panel.author.help': 'For General Author Help, ',
        'help.right.panel.print.proof.error': '. Please also request assistance if your proof contains major pagination errors (e.g., incorrect display of formulas, misalignment of columns, etc).',
        'help.right.panel.click.here': 'click here'
    };

    return locale;
});
