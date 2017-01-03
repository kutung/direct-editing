define([], function errorLocaleLoader() {
    var locale = {
        'article.not.found': 'Article Not Found or Invalid Token.',
        'queue.failed.after.max.retries': 'The server is unavailable at ' +
        'the moment. The article will be in <strong>read-only' +
        '</strong> mode until its ready. Please try refreshing' +
        ' after a while.',
        'error.math_editing.math_empty': 'Math cannot be empty.',
        'insertion.empty.text': 'Please enter the text to insert.',
        'query.panel.empty.answer': 'Response cannot be empty.',
        'instruct.text.empty': 'Please enter the text to instruct.',
        'upload.file.max.size': 'File size has exceeded the limit.',
        'upload.file.min.size': 'File size should be more than 0 bytes.',
        'upload.file.type': 'Attachment type is not acceptable.',
        'upload.file.already.exists': 'File already exists.',
        'query.editor.panel.empty.select.empty': 'Click the location where you want to create a query.',
        'query.editor.panel.empty.problemtype': 'Please select problem type.',
        'query.editor.panel.empty.question': 'Question cannot be empty.',
        'query.editor.panel.empty.reply': 'Response cannot be empty.',
        'query.editor.panel.empty.query': 'Please select query for problem type.',
        'superscriptmenuitem.no.selection': 'Please select the content to perform the Superscript action.',
        'boldmenuitem.no.selection': 'Please select the content to perform the Bold action.',
        'italicmenuitem.no.selection': 'Please select the content to perform the Italic action.',
        'subscriptmenuitem.no.selection': 'Please select the content to perform the Subscript action.',
        'deletemenuitem.no.selection': 'Please select the content to perform the Delete action.',
        'instructmenuitem.no.selection': 'Please select the content to perform the Instruct action.',
        'rejectmenuitem.no.selection': 'Please select the content to perform the Reject action.',
        'monospace.menuitem.no.selection': 'Please select the content to perform the Monospace action.',
        'smallcaps.menuitem.no.selection': 'Please select the content to perform the Small caps action.',
        'selectionStorage.no.selection': 'Please select the content to perform any action.',
        'browser.support.message': 'Online Proofing works only in Firefox {{FIREFOX}}+, IE {{IE}}+, Google Chrome {{CHROME}}+. To correct your proof online, please upgrade your browser.',
        'server.save.error': 'We are unable to save your corrections. Please retry after sometime.',
        'error.multiple.para.selection': 'Please limit the selection to textual content not exceeding a single paragraph or table cell.',
        'error.table.cell.selection': 'Please limit the selection to textual content not exceeding a single paragraph or table cell.',
        'error.auto.generated.text.selection': 'This text is auto-generated and cannot be modified. Please leave an instruction if you need any changes.',
        'error.search_keyword_missing': 'Provide text to search',
        'error.item_mismatch': 'No items match your search request',
        'error.replace_keyword_missing': 'Provide text to replace',
        'error.no_more_items': 'No items for your search request',
        'html.report.not.found': 'Download html report failed, please try after 5 mints....',
        'session.report.not.found': 'Download session report failed, please try after 5 mints....',
        'server.save.reload': 'Something went wrong. Some of your changes might not be saved.',
        'error.selection.alert.not.allowed': 'Your selection contains edit(s). This is not allowed!',
        'error.selection.alert.undo.edits': 'Either undo the edit(s) and try again or perform your action by selecting the texts before and after edit(s) separately.',
        'submit.article.invalid.user': 'Article already submitted'
    };

    return locale;
});
