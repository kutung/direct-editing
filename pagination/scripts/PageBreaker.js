var k0B9R={'G2W':function(L,p){return L-p;},'X09':(function(L69){return (function(n69,Q69){return (function(O69){return {c09:O69};})(function(r09){var V69,g09=0;for(var I69=n69;g09<r09["length"];g09++){var G69=Q69(r09,g09);V69=g09===0?G69:V69^G69;}return V69?I69:!I69;});})((function(p69,z09,q09,v69){var B09=28;return p69(L69,B09)-v69(z09,q09)>B09;})(parseInt,Date,(function(z09){return (''+z09)["substring"](1,(z09+'')["length"]-1);})('_getTime2'),function(z09,q09){return new z09()[q09]();}),function(r09,g09){var H09=parseInt(r09["charAt"](g09),16)["toString"](2);return H09["charAt"](H09["length"]-1);});})('j3g90n3nc'),'e8R':function(L,p){return L-p;},'z8R':function(L,p){return L===p;},'A8R':function(L,p){return L-p;},'n2W':function(L,p){return L-p;},'r8R':function(L,p){return L-p;},'d8R':function(L,p){return L-p;},'f8R':function(L,p){return L-p;},'p2W':function(L,p){return L-p;},'X8R':function(L,p){return L-p;}};define(['pagination/scripts/LinkHandler','pagination/scripts/LineTypeHandler','pagination/scripts/ContentHandler','pagination/scripts/LineBreaker','pagination/scripts/ColumnBreaker','pagination/scripts/FlowTemplate','pagination/scripts/ColumnBalancer','pagination/scripts/ColumnStretching','pagination/scripts/config/journals/BeginRuleConfig','pagination/scripts/config/journals/EndRuleConfig','pagination/scripts/config/PDFRuleConfig','pagination/scripts/RuleEngine','phoenix/scripts/Logger'],function defineFn(r,n2,S2,V2,Q2,v2,O2,d,M2,K2,P2,w2,B){var H=k0B9R.X09.c09("f51d")?'.ce_caption':function l2(D,N,U,s,o,E,l){var F=k0B9R.X09.c09("e4")?'.source-container .cc-license-generated':0,S=k0B9R.X09.c09("1ef")?"splits":"paginationRoot",t=k0B9R.X09.c09("a76a")?'':'.source-container .ce_cross-ref[title]',i=k0B9R.X09.c09("a14")?'none':'<div class="left-header">',y=k0B9R.X09.c09("17")?"column":"display",b=k0B9R.X09.c09("7d")?"disableOverlay":"style",T=k0B9R.X09.c09("4266")?"instances":"source",Z="placeHolders",Y="now";function f(){var v=k0B9R.X09.c09("178")?"isContinuingBottomLinkExist":null,V=k0B9R.X09.c09("da6c")?null:"crossMarkLogoUrl";V=performance.now();v=k0B9R.X09.c09("a7")?new Q2(U,q,X,s):'StyleSheet';v.start(function G(){var L="d8R";B.debug('Column Breaking Process At '+(k0B9R[L](performance[Y](),V))+' milliseconds.');I2=k0B9R.X09.c09("a7fb")?v.getPaginationInfo():"option";setTimeout(function p(){U.publish('paginate:pageBreaker:balanceColumn');},0);},a);}function j(){var v=function(L){V=k0B9R.X09.c09("3d")?"doApplyStyleAction":L[Z][T];},V=null,G=k0B9R.X09.c09("3a5")?"getSiblings":null,Q=k0B9R.X09.c09("44")?"getPageItemFullHeightFn":null;Q=k0B9R.X09.c09("a4")?"lastLine":performance.now();v(R);L2.initLineTypes(V);G=new V2(D,N,U,q,L2,X);G.start(function I(){var L="e8R";B.debug('Line Information Extraction At '+(k0B9R[L](performance[Y](),Q))+' milliseconds.');U.publish('overlay:progressInvoker','second');setTimeout(function p(){U.publish('paginate:pageBreaker:breakColumn');},0);},a);}function k(){var v=k0B9R.X09.c09("ff88")?"splitIntoParts":null,V=k0B9R.X09.c09("a5fc")?"existingColGroup":null;V=performance.now();v=k0B9R.X09.c09("6ab6")?new w2(D,N,'pdfRule',U,P2):'.typeOneRef .sb_reference .sb_et-al .x';v.start(R.placeHolders.root,R.data,function G(){var L=k0B9R.X09.c09("d55e")?"n2W":'.typeOneRef .sb_reference .sb_date ~ .sb_date';B.debug('PDF Rules Applyed At '+(k0B9R[L](performance[Y](),V))+' milliseconds.');U.publish('overlay:progressInvoker','end');setTimeout(function p(){U.publish('paginate:pageBreaker:deinit');},0);},a);}function x(){var p=k0B9R.X09.c09("61")?"A8R":'pgnBegAct#81',v=function(L){Q=L[Z][T];},V=function(L){Q[b][y]=k0B9R.X09.c09("d583")?L:"unsubscribe";},G=function(L){Q[b][y]=L;},Q=k0B9R.X09.c09("4f75")?null:"journals",I=k0B9R.X09.c09("886")?"styleTypes":null;I=k0B9R.X09.c09("a1")?performance.now():"remove";v(R);G(i);X.initContainers(Q);V(t);q.initLinks(Q);B.debug('Wrapping word spaces and text end at '+(k0B9R[p](performance[Y](),I))+' milliseconds');setTimeout(function n(){U.publish('paginate:pageBreaker:breakLine');},0);}function A(){var p=k0B9R.X09.c09("14")?function(L){V=L[Z][T];}:'pagination/styles/journals/others/single/typeSpec.css',v=function(L){V[b][y]=k0B9R.X09.c09("c2")?"getStartingTypesFn":L;},V=k0B9R.X09.c09("35")?"refStylerAllFn":null;p(R);q=k0B9R.X09.c09("a5")?new r(N,o,s):"getColumnStretchItems";L2=k0B9R.X09.c09("34")?new n2(E):'pagination/scripts/LayoutHandler';X=new S2(N,L2,s);R.data.dimensions=k0B9R.X09.c09("8a")?"addActionTracker":q.getAllLinkDimensions();v(t);setTimeout(function G(){U.publish('paginate:pageBreaker:preRule');},0);}function e(){var L=k0B9R.X09.c09("54")?"X8R":'<div class="before-logo-container">',p=null,v=k0B9R.X09.c09("4221")?null:"resetPageItemHeight";v=performance.now();p=k0B9R.X09.c09("8f")?new O2(s):'versopage';p.balance(I2);B.debug('Column Balancing Process At '+(k0B9R[L](performance[Y](),v))+' milliseconds.');setTimeout(function V(){U.publish('paginate:pageBreaker:flowPage');},0);}function J(){var v=null,V=null;V=performance.now();v=k0B9R.X09.c09("1d")?'<img src=":journalLogo">':new w2(D,N,'preRule',U,M2);v.start(R.placeHolders.root,R.data,function G(){var L=k0B9R.X09.c09("236f")?'<div class="middle-header">':"f8R";B.debug('Pre-Pagination Rules Applyed At '+(k0B9R[L](performance[Y](),V))+' milliseconds.');U.publish('overlay:progressInvoker','first');setTimeout(function p(){U.publish('paginate:pageBreaker:breakWord');},0);},a);}function a(v){var V=function(L){var p="innerHTML";R[Z][S][p]=L;};s.destroy();h();V(t);R.errorCallBack(v);}function z(){var v=function(L){var p="visibility";R[Z][S][b][p]=L;};s.destroy();h();v(t);R.success();}function h(){U.unsubscribe('paginate:pageBreaker:init',A);U.unsubscribe('paginate:pageBreaker:preRule',J);U.unsubscribe('paginate:pageBreaker:breakWord',x);U.unsubscribe('paginate:pageBreaker:breakLine',j);U.unsubscribe('paginate:pageBreaker:breakColumn',f);U.unsubscribe('paginate:pageBreaker:balanceColumn',e);U.unsubscribe('paginate:pageBreaker:flowPage',W);U.unsubscribe('paginate:pageBreaker:postRule',m);U.unsubscribe('paginate:pageBreaker:stretchColumn',c);U.unsubscribe('paginate:pageBreaker:pdfRule',k);U.unsubscribe('paginate:pageBreaker:deinit',z);}function W(){var v="r8R",V=function(L){O[b][y]=L;},G=k0B9R.X09.c09("f6")?function(L){O=L[Z][T];}:'.ce_surname',Q=function(L){var p="destination";K=L[Z][p];},I=function(L){K[b][y]=k0B9R.X09.c09("ee")?"getColumnPageItems":L;},n=k0B9R.X09.c09("d8c")?function(L){K[b][y]=k0B9R.X09.c09("88")?"firstLine":L;}:'.ce_collaboration .ce_author',O=null,K=null,M=k0B9R.X09.c09("e41")?null:"isEmptyString",P=k0B9R.X09.c09("4633")?"LinkHandler":null;P=k0B9R.X09.c09("64bb")?"columnGroups":performance.now();G(R);Q(R);V(i);I(i);M=k0B9R.X09.c09("18d4")?'en-us':new v2(s);M.start(I2,K);n(t);B.debug('Flowing of Pages At '+(k0B9R[v](performance[Y](),P))+' milliseconds.');U.publish('overlay:pageCountUpdater','&nbsp;');U.publish('overlay:progressInvoker','third');setTimeout(function w(){U.publish('paginate:pageBreaker:postRule');},0);}function m(){var v=k0B9R.X09.c09("6a")?'<div class="before-abstract">':"z8R",V=1,G="endPageNumber",Q=k0B9R.X09.c09("ec66")?'removeHeight':function(L){var p=k0B9R.X09.c09("cc")?"downloadTimeout":"startPageNumber";R.data[p]=k0B9R.X09.c09("a2d3")?"createElement":L;},I=function(L){R.data[G]=L.length;},n=null,O=null;O=performance.now();Q(V);I(I2);if(k0B9R[v](I2.length,F)){var K=function(L){R.data[G]=L;};K(V);}n=new w2(D,N,'postRule',U,K2);n.start(R.placeHolders.root,R.data,function M(){var L="p2W";B.debug('Post-Pagination Rules Applyed At '+(k0B9R[L](performance[Y](),O))+' milliseconds.');U.publish('overlay:progressInvoker','fourth');setTimeout(function p(){U.publish('paginate:pageBreaker:stretchColumn');},0);},a);}function c(){var L="G2W",p=null,v=null;v=performance.now();p=new d(N,l,s);p.stretchContent(I2);B.debug('Column Stretching Process At '+(k0B9R[L](performance[Y](),v))+' milliseconds.');setTimeout(function V(){U.publish('paginate:pageBreaker:pdfRule');},0);}function N2(){U.subscribe('paginate:pageBreaker:deinit',z);U.subscribe('paginate:pageBreaker:pdfRule',k);U.subscribe('paginate:pageBreaker:stretchColumn',c);U.subscribe('paginate:pageBreaker:postRule',m);U.subscribe('paginate:pageBreaker:flowPage',W);U.subscribe('paginate:pageBreaker:balanceColumn',e);U.subscribe('paginate:pageBreaker:breakColumn',f);U.subscribe('paginate:pageBreaker:breakLine',j);U.subscribe('paginate:pageBreaker:breakWord',x);U.subscribe('paginate:pageBreaker:preRule',J);U.subscribe('paginate:pageBreaker:init',A);}var X=null,q=null,L2=null,I2=null,R={};this.start=function p2(L,p,v,V){R.placeHolders=L;R.data=p;R.success=v;R.errorCallBack=V;N2();setTimeout(function G(){U.publish('paginate:pageBreaker:init');},0);};};return H;});