﻿/*
 Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.plugins.add("floatpanel",{requires:"panel"});
(function(){function v(a,b,c,l,h){h=CKEDITOR.tools.genKey(b.getUniqueId(),c.getUniqueId(),a.lang.dir,a.uiColor||"",l.css||"",h||"");var g=f[h];g||(g=f[h]=new CKEDITOR.ui.panel(b,l),g.element=c.append(CKEDITOR.dom.element.createFromHtml(g.render(a),b)),g.element.setStyles({display:"none",position:"absolute"}));return g}var f={};CKEDITOR.ui.floatPanel=CKEDITOR.tools.createClass({$:function(a,b,c,l){function h(){e.hide()}c.forceIFrame=1;c.toolbarRelated&&a.elementMode==CKEDITOR.ELEMENT_MODE_INLINE&&
(b=CKEDITOR.document.getById("cke_"+a.name));var g=b.getDocument();l=v(a,g,b,c,l||0);var m=l.element,p=m.getFirst(),e=this;m.disableContextMenu();this.element=m;this._={editor:a,panel:l,parentElement:b,definition:c,document:g,iframe:p,children:[],dir:a.lang.dir,showBlockParams:null};a.on("mode",h);a.on("resize",h);g.getWindow().on("resize",function(){this.reposition()},this)},proto:{addBlock:function(a,b){return this._.panel.addBlock(a,b)},addListBlock:function(a,b){return this._.panel.addListBlock(a,
b)},getBlock:function(a){return this._.panel.getBlock(a)},showBlock:function(a,b,c,l,h,g){var m=this._.panel,p=m.showBlock(a);this._.showBlockParams=[].slice.call(arguments);this.allowBlur(!1);var e=this._.editor.editable();this._.returnFocus=e.hasFocus?e:new CKEDITOR.dom.element(CKEDITOR.document.$.activeElement);this._.hideTimeout=0;var k=this.element,e=this._.iframe,e=CKEDITOR.env.ie&&!CKEDITOR.env.edge?e:new CKEDITOR.dom.window(e.$.contentWindow),f=k.getDocument(),r=this._.parentElement.getPositionedAncestor(),
t=b.getDocumentPosition(f),f=r?r.getDocumentPosition(f):{x:0,y:0},q="rtl"==this._.dir,d=t.x+(l||0)-f.x,n=t.y+(h||0)-f.y;!q||1!=c&&4!=c?q||2!=c&&3!=c||(d+=b.$.offsetWidth-1):d+=b.$.offsetWidth;if(3==c||4==c)n+=b.$.offsetHeight-1;this._.panel._.offsetParentId=b.getId();k.setStyles({top:n+"px",left:0,display:""});k.setOpacity(0);k.getFirst().removeStyle("width");this._.editor.focusManager.add(e);this._.blurSet||(CKEDITOR.event.useCapture=!0,e.on("blur",function(a){function u(){delete this._.returnFocus;
this.hide()}this.allowBlur()&&a.data.getPhase()==CKEDITOR.EVENT_PHASE_AT_TARGET&&this.visible&&!this._.activeChild&&(CKEDITOR.env.iOS?this._.hideTimeout||(this._.hideTimeout=CKEDITOR.tools.setTimeout(u,0,this)):u.call(this))},this),e.on("focus",function(){this._.focused=!0;this.hideChild();this.allowBlur(!0)},this),CKEDITOR.env.iOS&&(e.on("touchstart",function(){clearTimeout(this._.hideTimeout)},this),e.on("touchend",function(){this._.hideTimeout=0;this.focus()},this)),CKEDITOR.event.useCapture=!1,
this._.blurSet=1);m.onEscape=CKEDITOR.tools.bind(function(a){if(this.onEscape&&!1===this.onEscape(a))return!1},this);CKEDITOR.tools.setTimeout(function(){var a=CKEDITOR.tools.bind(function(){var a=k;a.removeStyle("width");if(p.autoSize){var b=p.element.getDocument(),b=(CKEDITOR.env.webkit||CKEDITOR.env.edge?p.element:b.getBody()).$.scrollWidth;CKEDITOR.env.ie&&CKEDITOR.env.quirks&&0<b&&(b+=(a.$.offsetWidth||0)-(a.$.clientWidth||0)+3);a.setStyle("width",b+10+"px");b=p.element.$.scrollHeight;CKEDITOR.env.ie&&
CKEDITOR.env.quirks&&0<b&&(b+=(a.$.offsetHeight||0)-(a.$.clientHeight||0)+3);a.setStyle("height",b+"px");m._.currentBlock.element.setStyle("display","none").removeStyle("display")}else a.removeStyle("height");q&&(d-=k.$.offsetWidth);k.setStyle("left",d+"px");var b=m.element.getWindow(),a=k.$.getBoundingClientRect(),b=b.getViewPaneSize(),c=a.width||a.right-a.left,e=a.height||a.bottom-a.top,l=q?a.right:b.width-a.left,h=q?b.width-a.right:a.left;q?l<c&&(d=h>c?d+c:b.width>c?d-a.left:d-a.right+b.width):
l<c&&(d=h>c?d-c:b.width>c?d-a.right+b.width:d-a.left);c=a.top;b.height-a.top<e&&(n=c>e?n-e:b.height>e?n-a.bottom+b.height:n-a.top);CKEDITOR.env.ie&&(b=a=new CKEDITOR.dom.element(k.$.offsetParent),"html"==b.getName()&&(b=b.getDocument().getBody()),"rtl"==b.getComputedStyle("direction")&&(d=CKEDITOR.env.ie8Compat?d-2*k.getDocument().getDocumentElement().$.scrollLeft:d-(a.$.scrollWidth-a.$.clientWidth)));var a=k.getFirst(),f;(f=a.getCustomData("activePanel"))&&f.onHide&&f.onHide.call(this,1);a.setCustomData("activePanel",
this);k.setStyles({top:n+"px",left:d+"px"});k.setOpacity(1);g&&g()},this);m.isLoaded?a():m.onLoad=a;CKEDITOR.tools.setTimeout(function(){var a=CKEDITOR.env.webkit&&CKEDITOR.document.getWindow().getScrollPosition().y;this.focus();p.element.focus();CKEDITOR.env.webkit&&(CKEDITOR.document.getBody().$.scrollTop=a);this.allowBlur(!0);this._.editor.fire("panelShow",this)},0,this)},CKEDITOR.env.air?200:0,this);this.visible=1;this.onShow&&this.onShow.call(this)},reposition:function(){var a=this._.showBlockParams;
this.visible&&this._.showBlockParams&&(this.hide(),this.showBlock.apply(this,a))},focus:function(){if(CKEDITOR.env.webkit){var a=CKEDITOR.document.getActive();a&&!a.equals(this._.iframe)&&a.$.blur()}(this._.lastFocused||this._.iframe.getFrameDocument().getWindow()).focus()},blur:function(){var a=this._.iframe.getFrameDocument().getActive();a&&a.is("a")&&(this._.lastFocused=a)},hide:function(a){if(this.visible&&(!this.onHide||!0!==this.onHide.call(this))){this.hideChild();CKEDITOR.env.gecko&&this._.iframe.getFrameDocument().$.activeElement.blur();
this.element.setStyle("display","none");this.visible=0;this.element.getFirst().removeCustomData("activePanel");if(a=a&&this._.returnFocus)CKEDITOR.env.webkit&&a.type&&a.getWindow().$.focus(),a.focus();delete this._.lastFocused;this._.showBlockParams=null;this._.editor.fire("panelHide",this)}},allowBlur:function(a){var b=this._.panel;void 0!==a&&(b.allowBlur=a);return b.allowBlur},showAsChild:function(a,b,c,f,h,g){if(this._.activeChild!=a||a._.panel._.offsetParentId!=c.getId())this.hideChild(),a.onHide=
CKEDITOR.tools.bind(function(){CKEDITOR.tools.setTimeout(function(){this._.focused||this.hide()},0,this)},this),this._.activeChild=a,this._.focused=!1,a.showBlock(b,c,f,h,g),this.blur(),(CKEDITOR.env.ie7Compat||CKEDITOR.env.ie6Compat)&&setTimeout(function(){a.element.getChild(0).$.style.cssText+=""},100)},hideChild:function(a){var b=this._.activeChild;b&&(delete b.onHide,delete this._.activeChild,b.hide(),a&&this.focus())}}});CKEDITOR.on("instanceDestroyed",function(){var a=CKEDITOR.tools.isEmpty(CKEDITOR.instances),
b;for(b in f){var c=f[b];a?c.destroy():c.element.hide()}a&&(f={})})})();