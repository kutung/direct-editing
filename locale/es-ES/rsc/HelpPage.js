define([], function helpLocaleLoader() {
    var locale = {
        'help.header.title': 'Online Proofing Help',
        'help.left.panel.quick.start': 'Quick Start',
        'help.left.panel.interface': 'Interface',
        'help.left.panel.queries': 'Queries',
        'help.left.panel.float.contexual.menu': 'Floating Contextual Menu',
        'help.left.panel.insert': 'Insert',
        'help.left.panel.instruct': 'Instruct',
        'help.left.panel.math.editing': 'Math Annotation',
        'help.left.panel.edit.log': 'Edit Log',
        'help.left.panel.save.submit': 'Save &amp; Submit',
        'help.right.panel.quick.start.heading': 'Before you submit please make sure that:',
        'help.right.panel.check.surname': "You check the authors' names (last names are highlighted teal) are correct - please leave instructions if any changes are required.",
        'help.right.panel.check.copyeditor.changes': 'You review your whole article and make any changes that are required.',
        'help.right.panel.answer.queries': 'You answer all the queries. You cannot submit your article without answering all the queries.',
        'help.right.panel.annotate.graphics': 'You provide replacement graphics if needed, or annotate the graphics with instructions for how they should be changed. Only minor changes to the figures (e.g. spelling errors, resizing) should be indicated using annotations. If extensive revisions are required, please attach a new version of the figure.',
        'help.right.panel.print.proof.part1': 'See your article as a print proof. Click on ',
        'help.right.panel.print.proof.part2': ' to generate it. The print proof updates inline changes you make in the Edit view. Toggle between the two views and satisfy yourself.',
        'help.right.panel.interface.help.content.point1': 'When you click',
        'help.right.panel.interface.help.content.point2': 'in the landing page of Proof Central, you are taken to your article, which has been styled to the Royal Society of Chemistry format, presented in a two-pane layout.',
        'help.right.panel.interface.left.pane': '(1) Left Pane',
        'help.right.panel.interface.left.pane.para.pane.house': 'The left larger pane houses the body of your article, under the Article tab. When you click any content on the left pane a floating contextual menu comes up with handles for insert & instruct and when you select any content on the left pane a floating contextual menu comes up with handles for styling  & deleting.',
        'help.right.panel.interface.left.pane.para.see.details': 'see details',
        'help.right.panel.interface.left.pane.para.supplementary': 'The left pane also supports ‘Researcher information & TOC’ tab under which Proof Central lists the ORCID, ResearcherID and funding details, as well as the contents entry submitted by you.',
        'help.right.panel.interface.right.pane': '(2) Right Pane',
        'help.right.panel.interface.right.pane.para.4.controls': 'The right pane has the controls. The topmost lets you address copyeditor queries. The next control tracks and lists all changes during the proof correction process. The third control may appear when you choose to insert or instruct. Insert option lets you insert content into the body of the article and Instruct option lets you leave instructions for your publisher to work on after you submit the proof. This is the best way to ask for changes to the layout of your article or to request a second version of the proof before final publication.',
        'help.right.panel.interface.right.pane.para.3.controls': 'The third control lets you leave instructions for your publisher to work on after you submit the proof. This is the best way to ask for changes to the layout of your article or to request a second version of the proof before final publication. The last control tracks and lists all changes during the proof correction process.',
        'help.right.panel.interface.controls': '(3) Controls to view the content',
        'help.right.panel.interface.controls.para.edit.mode': 'At the right top of the left pane, there are controls for you to view the content in two ways. The Edit mode presents the content in continuous scroll and in track-changes mode with inserted content shown highlighted in green and the deleted content shown struckthrough and in red, both with a yellow background.',
        'help.right.panel.interface.controls.para.proof.mode': 'The Proof mode updates the changes and presents the content as it is most likely to appear in print, with page division and numbers, footnotes placed as per print convention, and the floats placed appropriately. You can toggle between the Edit and Proof modes as much as you wish to.',
        'help.right.panel.queries.para.dialog': 'The Queries dialog at the top of the right pane is activated by default while loading the article, and can also be activated by clicking on the control. The queries are stacked Q1, Q2, Q3…, click on the query label or query text of any one query to view and act on it using the dialog below the query text. This response dialog has rich text formatting options for you to set your text in bold/italic/superscript/subscript/smallcaps/monospace.',
        'help.right.panel.queries.para.special.char': 'The Queries/Insert/Instruct dialog box also lets you access special characters that you may wish to insert. A palette of special characters to select from will be presented. Please note you have the option to select special characters not available in the palette through a link to an extensive Unicode table.',
        'help.right.panel.queries.para.special.char2': 'When using the ‘extensive Unicode table’ through the link: use ‘copy to clipboard’ option or select the character and copy it. Close the ‘Select Special Character’ palette and paste the character in the text box. The pasted character might be in the source format (large font, background color etc.). However the source formats are removed when inserted in the proof.',
        'help.right.panel.queries.para.attachment': 'You can respond to a query with an attachment* and provide remarks on how the attachment should be used by the publisher.',
        'help.right.panel.queries.para.attachment.note': 'Supports all formats other than: sh, asp, cgi, php, php3, ph3, php4, ph4, php5, ph5, phtm, phtml, js, cgi, pl. File size not exceeding 20mb per file.',
        'help.right.panel.queries.para.save.1': 'Once you have written your response to a query, click anywhere outside the text box.',
        'help.right.panel.queries.para.save.2': 'Your response is registered in our server. Please note that you must respond to every query before you are able to submit your final corrections. As you respond, the number of pending queries will count down till zero is reached.',
        'help.right.panel.floating.menu.formatting': 'The floating contextual menu comes up when you click/select content in the left pane.',
        'help.right.panel.floating.menu.editing.controls': 'When you click any content on the left pane a floating contextual menu comes up with handles for inserting & instructing.',
        'help.right.panel.floating.menu.selecting.controls': 'When you select any content on the left pane a floating contextual menu comes up with handles for in situ styling (bold, italic, superscript, subscript, smallcaps, monospace) & deleting.',
        'help.right.panel.insert.controls.cursor.text': 'To insert new content into your article, you must point your cursor to a specific location within the article where the new content should be inserted.',
        'help.right.panel.insert.controls.before.text': 'Invoke the Insert input box by clicking the Input control',
        'help.right.panel.insert.controls.after.text': 'available in the floating contextual menu. Key in the necessary content, style it as rich text using the formatting options.',
        'help.right.panel.insert.proceed.after.text': 'You must point your cursor to a specific location within the article where the new content should be inserted.',
        'help.right.panel.insert.save.inserted.text.1': 'Once you enter the content, click anywhere outside the text box, the content is autosaved,',
        'help.right.panel.insert.save.inserted.text.2': 'and it appears in the chosen place and in green with a yellow background, so you can keep an easy eye on the new content that you introduce.',
        'help.right.panel.insert.clear.before.text': 'In case you want to undo or edit the inserted content, click anywhere on the inserted content. The floating contextual menu with Undo and Edit options appears with Edit option active, that is the insert accordion with',
        'help.right.panel.insert.clear.after.text': 'the inserted content opens in the right pane.',
        'help.right.panel.insert.undo.clear.before.text': 'You can undo using the Undo control',
        'help.right.panel.insert.undo.clear.after.text': 'in the floating contextual menu.',
        'help.right.panel.insert.instruct.text': 'To add an instruction to inserted text click anywhere on the inserted content to bring up instruct control on the floating contextual menu.',
        'help.right.panel.instruct.pass.publisher': 'Proof Central lets you pass on an instruction to the Royal Society of Chemistry with changes that you are unable to make yourself.',
        'help.right.panel.instruct.controls.before.text': 'Click on the Instruct control',
        'help.right.panel.instruct.controls.after.text': 'through the floating contextual menu and launch the instruct dialog in the right pane to key in your instruction. Click anywhere outside the text box, the instructions are auto saved.',
        'help.right.panel.instruct.proceed.after.text': 'Similar to the Queries dialog, the instruct dialog permits attachment of files',
        'help.right.panel.instruct.edit.undo': 'Proof Central allows you to place an instruction on top of an edit. In such cases, please note that when you undo the edit, the instruction that is tethered to the edit will also be undone.',
        'help.right.panel.math.editing.option.one': 'Proof Central facilitates modifying scientific and technical equations before final publication.',
        'help.right.panel.math.editing.option.two': 'The equations that are written as part of the text can be edited using the edit options.',
        'help.right.panel.math.editing.option.three': 'The equations that are captured as images can be modified through annotated image instructions for the publisher to correct.',
        'help.right.panel.edit.log.edit.list': 'The second control on the right panel provides a list of all edits made by the authors. The edits are listed in the order of their appearance in the manuscript.',
        'help.right.panel.edit.log.edit.location': 'You can click on each list item in the Edit Log to get to the edit location in the left pane.',
        'help.right.panel.edit.log.floating.menu': 'The edit location flashes as you approach it. You may then choose to modify the edit as desired, using the available actions in the floating menu.',
        'help.right.panel.save.submit.save.button.before.text': 'When you make a change to the article, the Save button',
        'help.right.panel.save.submit.save.button.after.text': 'is activated for you to save the changes. Your changes are autosaved too.',
        'help.right.panel.save.submit.session.report.before.text': 'Proof Central creates a record of your actions while correcting your proof. You can generate and download this ‘Session Report’ by clicking on',
        'help.right.panel.save.submit.session.report.after.text': '.',
        'help.right.panel.save.submit.submit.button.before.text': 'Clicking on Submit ',
        'help.right.panel.save.submit.submit.button.after.text': ' sends your corrections to the Royal Society of Chemistry. You will not be able to make any further changes to your article after clicking submit. A consolidated Session Report is auto-generated and mailed to you after submission of your corrections.',

        'help.right.panel.quick.option.text': 'There are two options to submit your proof to the Royal Society of Chemistry.',
        'help.right.panel.quick.option.one': 'Online proofing within Proof Central. This guide provides detailed instructions on how to use the online tools within Proof Central to apply your proof corrections.',
        'help.right.panel.quick.option.two': '. If you would prefer not to use the HTML proofing tool, you can upload an annotated proof PDF of your article to Proof Central.',
        'help.right.panel.quick.interface.pdf.text': "You can download a typeset PDF proof for your article by clicking the 'PDF' link at the top of the screen. This PDF can be used to check the layout of the article while making your corrections in the HTML interface.",
        'help.left.panel.general.attachment': 'Generic Attachment',
        'help.right.panel.general.attachment.option': "Proof Central allows you to attach additional files using the 'Attach additional files' button in Researcher Information & TOC tab. This will invoke Instruct dialog in the right pane, where you can submit one or more attachments. Refer to section",
        'help.right.panel.general.attachment.option1': ' to find other ways to add attachments.',
        'help.right.panel.general.attachment.hyperlink': 'Queries',
        'help.left.panel.annotate.pdf': 'Annotate PDF',
        'help.right.panel.annotate.pdf.text.one': "If you prefer, you can add your instructions and annotations to a PDF by using the ‘PDF’ hyperlink at the top right of the Proof Central homepage.",
        'help.right.panel.annotate.pdf.text.two': 'Clicking on this hyperlink downloads a typeset PDF of your manuscript to your local drive. When you open this PDF the first page contains a link to annotatable PDF of your article.',
        'help.right.panel.annotate.pdf.text.three': 'Clicking on this hyperlink takes you to ‘PDF Proofing’ webpage. Follow the instructions provided on this page.',
        'help.left.panel.graphic.pdf': 'Graphics Annotation',
        'help.right.panel.graphic.pdf.text.one': "In addition to text, math and table regions, you can also annotate graphics in Proof Central.",
        'help.right.panel.graphic.pdf.text.two': "Note: Only minor changes to the figures (e.g. spelling errors, resizing) should be indicated using annotations. If extensive revisions are required, please attach a new version of the figure using ‘Attach additional files' option.",
        'help.right.panel.graphic.pdf.text.three': "Clicking on the figure opens the ‘Annotate Graphics’ dialog box, which has an area marker rectangle and an instruction box as shown below.",
        'help.right.panel.graphic.pdf.text.four': "The red-dash rectangle with yellow point indicates the point of the equation to which instructions can be attached. You can resize of the area marker rectangle by stretching at the yellow point.",
        'help.right.panel.graphic.pdf.text.five': "In the instruction box, provide your instruction and click ‘Save’.",
        'help.right.panel.graphic.pdf.text.six': "You can delete or modify your instructions at any point of time before submitting. When you place the mouse pointer on the area marker rectangle, the instruction box opens. To modify, edit the instruction in the instruction box and click ‘Save’. To delete, click ‘Delete’.",
        'help.right.panel.annotate.pdf.text.important': 'Important: If you choose to carry out your proofing through the PDF method, and if you have done any work on the HTML version of the manuscript in Proof Central, those prior corrections will be discarded and will not automatically carry over to the PDF. Therefore you must decide which method you are going to follow before you begin correcting the paper.'
    };

    return locale;
});
