define([
    'scripts/Helper', 'scripts/InstructCommand', 'scripts/RichTextEditor',
    'scripts/RequestBuilder', 'scripts/Panel', 'scripts/ConfigReader',
    'scripts/Util', 'scripts/Sanitizer', 'scripts/Dom2Xml', 'scripts/ErrorHandler',
    'scripts/FeatureToggle', 'scripts/UnwantedWrapper'
], function InstructPanelLoader(
    Helper, InstructCommand, RTE, RequestBuilder, Panel, Config, Util,
    Sanitizer, Dom2Xml, ErrorHandler, Features, UnwantedWrapper
) {

    var insEditTitle = 'Edit Instruct as';
    var insEditBtn   = 'Update instruction';

    var newInstructTemplate, saveErrorMessage, saveSuccessMessage, placeholderMessage,
        errorHandler, saveErrorReloadMessage,
        newInstructTemplate = [
                '<div class="editInstruct">',
                '<div class="instruct-header">',
                    '<p class="instructHeaderText">Add Instruct</p>',
                '</div>',
                '<div class="instruct-panel-inner">',

                    '<div class="instruct-textbox">',
                        '<div class="instructRTE"></div>',
                    '</div>',
                   
                '</div>',
                '<div class="uploda-wrapper">',
                    '<div class="info">Limit upto <span class="file-upload-limit">20 MB</span>/file</div>',
                    '<form class="query-file-form">',
                        '<input id="supportFormFileID" class="author-name fileUploadSupport" value="gij, png, jpg, docx, xls, ect" type="file">',
                    '</form>',
                    '<div class="duplicate-choose">Attach file<span></span><p class="limited-access-text">(Limit upto 20 mb)</p></div>',
                '</div>',
            
                '<ul class="query-file-list" id="showInsFileName">',
                '</ul>',
              
                '<div class="instruction-add-btnwrapper">',
                    '<span class="respond-btn addInstructBtn">Add instruction</span>',
                    '<span class="reset-btn instructCancelBtn">Cancel</span>',
                '</div>',
            '</div>'
        ];
    
    function initializeVariables(instance) {
        instance.rteContainer = null;
        instance.rte = {};
        instance.htmlDoc = null;
    }

    function rteErrorCallback(e) {
        errorHandler.handleErrors(e);
    }

    function getRTEData(instance) {
        return instance.rte.getData({
            'encodeHtml': true,
            'sanitize': true
        });
    }

    function clearRTE() {
        this.rte.clear();
    }

    function setRTEContent(className, value){
        var xiframe = document.querySelector('.'+className).querySelector('iframe');
        var insideContent = (xiframe.contentWindow || xiframe.contentDocument);
        if (insideContent.document)insideContent = insideContent.document;
        $(insideContent).find('body').focus();
        insideContent.body.innerHTML = value;
    }

    function instruction(newInstructContainer, eventBus, win, doc) {
        initializeVariables(this);
        this.container = newInstructContainer;
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;        
    }

    function clearInputFileds(formClassName){
        document.querySelectorAll('.'+formClassName+' input[type="text"],.'+formClassName+' input[type="email"], .'+formClassName+' textarea').forEach(function(singleElemet){
                singleElemet.value = '';
            });
    }
    function findAncestor (el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }

    function cancelInstructClick(){
        //Instruct Cancel
        instructCancelBtnClick  = document.querySelector('.instructCancelBtn');
        instructCancelBtnClick.addEventListener('click', function cancelFormAction(e) {
            setRTEContent('instructRTE', '');
            $('.visitorInstruct, .instructPointer, .editlog-instruct-listitems').removeClass('active');
            document.querySelector('.instructPanel').style.display="none";
            $( ".instructIcon" ).remove();
            $('#showInsFileName li').remove();
        }, false);

    }   

    function instructUploadClick(){

        $(document).on('change','.fileUploadSupport', function(e){ 
            $('#showInsFileName li').remove(); 
            var insFilename = document.getElementById("supportFormFileID").value;
            var lastIndex = insFilename.lastIndexOf("\\");
            if (lastIndex >= 0) {
                var filename = insFilename.substring(lastIndex + 1);
                var d1 = document.getElementById('showInsFileName');
                d1.insertAdjacentHTML('beforeend', '<li>'+filename+'</li>');
            }
            
        });

    }

    function addInstructClick(){
        var instructAddBtnClick  = document.querySelector('.addInstructBtn');
        var self = this;
        instructAddBtnClick.addEventListener('click', function instructFormAction(e) {

            var sNo = Math.round(Math.random()*1000) + 1
            //if(document.querySelectorAll('.instructIcon').length!='0'){
                document.querySelector('.instructIcon').style.display="none";
                 $('.instructIcon').attr('data-insPoint', sNo);
                document.querySelector('.instructIcon').classList.remove('instructIcon');
            //}
            
            //visitor instructor
            var newItem = document.createElement('span');
            newItem.className = "visitorInstruct";
            document.getElementsByClassName('cursor')[0].before(newItem);
            
            instructTextVal = getRTEData(self.newInstructInst);
            document.querySelector('.instructPanel').style.display="none";


            if(!$('.edit-summary-tab .tab-panel').hasClass('open')){
                $('.edit-summary-tab .header').trigger('click');
                $('.edit-summary-tab .tab-header li').eq(1).trigger('click');
            }

            var myColors = ["color1", "color2", "color3"];

            
            var addInstNotesTemp = [
                '<span class="instruct-varient-lbl">'+instructTextVal.charAt(0)+'</span>',
                '<p class="instruct-content instructContent">'+instructTextVal+'</p>',
                '<i class="arrow-action arrowBtn more"></i>',
                '<span class="instruct-edit editInstructBtn"></span>',
                '<span class="instruct-delete instructDel"></span>'
            ];

            var tempItem = document.createElement('li');
            tempItem.className = "editlog-instruct-listitems";
            tempItem.setAttribute('data-insPoint', sNo);
            tempItem.innerHTML = addInstNotesTemp.join('');
            document.getElementsByClassName('instructionPointNote')[0].appendChild(tempItem);
            var i = 0;
                    $('span.instruct-varient-lbl').each(function() {

                        $(this).addClass( myColors[i]);
                        i = (i + 1) % myColors.length;
                    });      
            setRTEContent('instructRTE', '');
            setTimeout(function(){
                document.querySelector('.insertSuccessAlert').style.display="block";
                    $('.successAlertMsg')[0].innerText = "Instruction added successfully";
                    setTimeout(function(){
                        document.querySelector('.insertSuccessAlert').style.display="none";
                    }, 3000);
            }, 700);

            instructListItemClick(this);
        }, false);

    }

    function editInstructClick(){
         $(document).off('click','.editInstructBtn').on('click','.editInstructBtn', function(e){
            document.querySelector('.instructPanel').style.display="block";
            $('#showInsFileName li').remove();
            $('.instructHeaderText')[0].innerText = insEditTitle;
            $('.addInstructBtn')[0].innerText = insEditBtn;
            cls = "editlog-instruct-listitems";
            elem = findAncestor (e.target, cls)
            insId  = $(elem).attr("data-inspoint");
            instructContent  = $(elem).find('.instructContent')[0].innerHTML;
            setRTEContent('instructRTE', instructContent);

            $(document).off('click','.addInstructBtn').on('click','.addInstructBtn', function(e){ 
                var instructTextVal = getRTEData(self.newInstructInst);
                elem.children[1].innerText = instructTextVal; 

                document.querySelector('.instructPanel').style.display="none";

                if(!$('.edit-summary-tab .tab-panel').hasClass('open')){
                    $('.edit-summary-tab .header').trigger('click');
                    $('.edit-summary-tab .tab-header li').eq(1).trigger('click');
                }
                $('.visitorInstruct, .editlog-instruct-listitems, .instructPointer').removeClass('active');
                setTimeout(function(){
                document.querySelector('.insertSuccessAlert').style.display="block";
                        $('.successAlertMsg')[0].innerText = "Instruction update successfully";
                        setTimeout(function(){
                            document.querySelector('.insertSuccessAlert').style.display="none";
                        }, 3000);
                }, 700);
            });
                
        });
    }

    function visitorInstructClick(){

        //editor side visitorIcon
        $(document).on('click','.visitorInstruct', function(e){
            var VisitPoint, showPoint; 

            $('.visitorInstruct, .editlog-instruct-listitems, .showPointInstruct').removeClass('active');
            $('.instructPointer').css('display', 'none'); 
            vistInstructLine = $(e.target).offset().top;
            $(e.target).addClass('active');

            $('.visitorInstruct').each(function(){
               if($(this).position().top == vistInstructLine - 40 ){
                   showPoint = $(this).prev();
                   showPoint[0].classList.add('showPointInstruct');
                   showPoint[0].style.display="inline";
                }
            })
        }); 
    }

    function instructPointerClick(){
        //editor side instructIcon
        $(document).on('click','.instructPointer', function(e){ 
            var getInsPoint, rcpInsPoint;

            if(!$('.edit-summary-tab .tab-panel').hasClass('open')){
                $('.edit-summary-tab .header').trigger('click');
                $('.edit-summary-tab .tab-header li').eq(1).trigger('click');
            }

            $('.editlog-instruct-listitems, .instructPointer, .showPointInstruct').removeClass('active');
            e.target.parentElement.classList.add('active')
            getInsPoint = e.target.parentElement.getAttribute('data-inspoint');

            $('.instructionPointNote li').each(function(){
                rcpInsPoint = $(this)[0].getAttribute('data-inspoint');
                if(rcpInsPoint == getInsPoint ){
                    $(this)[0].classList.add('active');
                }    
            })   
            $('.cursor').remove();
        });
    }

    function instructListItemClick(){
        //rcp side instruct details
        if(!$('.editlog-instruct-listitems').hasClass('active')){
            var list = $('.instructionPointNote');
            list.undelegate();
            list.off('click','li');
            list.on('click','li',handleInsPointer);
            function handleInsPointer(e){ 
                var getInsPoint, rcpInsPoint, currentInsPos;
                $('.instructPointer').attr('style', 'display:none');
                $('.editlog-instruct-listitems, .instructPointer, .showPointInstruct').removeClass('active');
                e.target.parentElement.classList.add('active')
                getInsPoint = e.target.parentElement.getAttribute('data-inspoint');
                $('.instructPointer[data-inspoint="'+getInsPoint+'"]').addClass('showPointInstruct active').attr('style', 'display:inline');
                
                currentInsPos = $('.instructPointer[data-inspoint="'+getInsPoint+'"]').offset().top;

                $('.editor').scrollTop( currentInsPos - 120);
            }

        }
    }

    function instructDeleteItemClick(){
        //rcp side instruction Delete
        $(document).on('click','.instructDel', function(e){ 
            var getInsPoint, rcpInsPoint;
            
            $('.editlog-instruct-listitems, .instructPointer').removeClass('active');
            getInsPoint = e.target.parentElement.getAttribute('data-inspoint');
            $('.instructPointer[data-inspoint="'+getInsPoint+'"]').remove();
            e.target.parentElement.remove();

        });
    }
    
    instruction.prototype.render = function render() {
        var tempHtmlWrapper,
        instance = this, placeholderMessage = 'Instruct',
        tempHtmlWrapper = document.createElement('span');
        tempHtmlWrapper.innerHTML = newInstructTemplate.join('');
        this.container.appendChild(tempHtmlWrapper);

        this.rteContainer = document.querySelector('.instructRTE');
        this.rte = new RTE(window, document, this.rteContainer,
            {
                'allowedContent': 'b i sub sup span(smallcaps,mono)',
                'placeholder': placeholderMessage,
                'height': '110px'
            }
        );
        this.rte.render();
        this.rte.setErrorCallback(rteErrorCallback);
        this.clearRTE = clearRTE.bind(this);
        
        instructUploadClick(this);
        addInstructClick(this);
        editInstructClick(this);
        cancelInstructClick(this);
        visitorInstructClick(this);
        instructPointerClick(this);
        instructDeleteItemClick(this);
    };
 
    return instruction;
});
