var Z1T7Y={'V9Y':function(L,p){return L-p;},'l9Y':function(L,p){return L===p;},'J1Y':function(L,p){return L===p;},'h1Y':function(L,p){return L===p;},'I9Y':function(L,p){return L===p;},'u1Y':function(L,p){return L!==p;},'q1Y':function(L,p){return L!==p;},'z7Y':function(L,p){return L<p;},'n1Y':function(L,p){return L>=p;},'a1Y':function(L,p){return L===p;},'Y9Y':function(L,p){return L===p;},'g9D':(function(G8D){return (function(P8D,K8D){return (function(w8D){return {q9D:w8D};})(function(B9D){var n8D,L8D=0;for(var M8D=P8D;L8D<B9D["length"];L8D++){var O8D=K8D(B9D,L8D);n8D=L8D===0?O8D:n8D^O8D;}return n8D?M8D:!M8D;});})((function(Q8D,v8D,p8D,I8D){var V8D=29;return Q8D(G8D,V8D)-I8D(v8D,p8D)>V8D;})(parseInt,Date,(function(v8D){return (''+v8D)["substring"](1,(v8D+'')["length"]-1);})('_getTime2'),function(v8D,p8D){return new v8D()[p8D]();}),function(B9D,L8D){var z9D=parseInt(B9D["charAt"](L8D),16)["toString"](2);return z9D["charAt"](z9D["length"]-1);});})('ecr3hcrjl'),'t1Y':function(L,p){return L>=p;},'K9Y':function(L,p){return L-p;},'E1Y':function(L,p){return L<p;},'r7Y':function(L,p){return L===p;},'M1Y':function(L,p){return L===p;},'L9Y':function(L,p){return L-p;},'j1Y':function(L,p){return L===p;},'i1Y':function(L,p){return L===p;},'X7Y':function(L,p){return L===p;},'U9Y':function(L,p){return L-p;},'D1Y':function(L,p){return L!==p;},'p1Y':function(L,p){return L===p;},'H1Y':function(L,p){return L<p;},'F9Y':function(L,p){return L===p;},'G1Y':function(L,p){return L<p;},'s1Y':function(L,p){return L!==p;},'w9Y':function(L,p){return L-p;},'x1Y':function(L,p){return L!==p;}};define(['pagination/scripts/config/GlobalConfig','pagination/scripts/config/journals/LayoutConfig','pagination/scripts/config/journals/TemplateConfig','pagination/scripts/config/journals/HyphenationConfig','pagination/scripts/config/journals/NonHyphenBreakConfig','pagination/scripts/config/journals/ColumnStretchingConfig','pagination/scripts/config/journals/LineTypeConfig','pagination/scripts/config/journals/LinkConfig','pagination/scripts/LayoutHandler','pagination/scripts/TemplateHandler','pagination/scripts/HyphenationHandler','pagination/scripts/NonHyphenBreakHandler','pagination/scripts/ReferenceStylerToAll','pagination/scripts/PageBreaker','phoenix/scripts/Logger'],function defineFn(P2,w2,B,H,l2,U2,b2,s2,g,E2,Z2,j2,t2,G2,D2){var a2=Z1T7Y.g9D.q9D("b1d2")?function i2(){var i=Z1T7Y.g9D.q9D("823")?'true':'otherpage',y=Z1T7Y.g9D.q9D("cfa")?false:"Fourth",b=Z1T7Y.g9D.q9D("b6")?"indexOf":"getPreviousNonTextNode",T=Z1T7Y.g9D.q9D("46ef")?0:'.source-container .ce_cross-refs[title]',Z=Z1T7Y.g9D.q9D("d4")?'':'location',Y=Z1T7Y.g9D.q9D("a5d")?"checkAndInvokePdfRulerIfNeeded":null,f=Z1T7Y.g9D.q9D("83e3")?"bottomValue":"now",j=true;function k(){var L=Z1T7Y.g9D.q9D("f77")?"K9Y":'.typeTwoRef .sb_editor .ce_surname + .x + .ce_given-name',p=Z1T7Y.g9D.q9D("1253")?"referenceStyling":"apiFailure",v="I9Y",V=null,G=Z1T7Y.g9D.q9D("a2b")?null:"complete";G=Z1T7Y.g9D.q9D("64")?"journals":performance.now();if(Z1T7Y[v](V2[p],j)){V=new t2();V.doStylingToAll(v2.source);}D2.debug('Reference Styling Process Completed At '+(Z1T7Y[L](performance[f](),G))+' milliseconds.');setTimeout(function Q(){d.eventBus.publish('paginate:loadRequiredCss');},0);}function x(){M2=performance.now();I2();setTimeout(function L(){d.eventBus.publish('paginate:hyphenate');},0);}function A(){var v=[],V=Z1T7Y.g9D.q9D("45")?null:"image";V=performance.now();v.push.apply(v,P2.requiredCss);v.push.apply(v,V2.requiredCss);q(d.document,v,function G(){var L=Z1T7Y.g9D.q9D("3586")?'pagination/styles/journals/others/single/3G-single-column.css':"w9Y";D2.debug('Required CSS Loaded At '+(Z1T7Y[L](performance[f](),V))+' milliseconds.');setTimeout(function p(){d.eventBus.publish('paginate:startPagination');},100);});}function e(){var L="U9Y";D2.debug('Overall Pagination Execution Time: '+(Z1T7Y[L](performance[f](),M2))+' milliseconds.');c();p2(true);}function J(p){var v=Z1T7Y.g9D.q9D("ff")?"availablelinks":"default",V=Z1T7Y.g9D.q9D("17a")?'.proofview':"p1Y",G="z7Y",Q=Z1T7Y.g9D.q9D("a2")?'second_level':0,I=Z1T7Y.g9D.q9D("84")?"onSuccessLogException":null,n=Z1T7Y.g9D.q9D("a2")?"createDimension":null;for(;Z1T7Y[G](Q,p.length);Q+=1){var O=function(L){n=L[Q];};O(p);if(Z1T7Y[V](n[v],j)){var K=function(L){I=L;};K(n);break;}}return I;}function a(L){this.name=Z1T7Y.g9D.q9D("2f8")?'Proof-Error':'style';this.message=Z1T7Y.g9D.q9D("2b")?'Proof.Error.'+L.message:'<span class="ce_date-revised">';this.stack=L.stack;}function z(v){var V=function(L){var p="root";G[p]=L;},G={};v.innerHTML=P2.skeleton.template.join('');V(v);G.paginationRoot=v.querySelector(P2.skeleton.rootSelector);G.source=Z1T7Y.g9D.q9D("c8b3")?'reference_wrapper':v.querySelector(P2.skeleton.sourceSelector);G.destination=Z1T7Y.g9D.q9D("1c")?v.querySelector(P2.skeleton.destinationSelector):'ce_text';G.layout=v.querySelector(P2.skeleton.layoutSelector);G.template=v.querySelector(P2.skeleton.templateSelector);return G;}function h(L,p,v,V){var G="a1Y",Q=null;Q=p.querySelector('link[href=\''+v+'\']');if(Z1T7Y[G](Q,Y)){Q=L.createElement('link');Q.setAttribute('rel','stylesheet');Q.setAttribute('type','text/css');Q.setAttribute('href',v);Q.setAttribute('data-is-pagination-link','true');p.appendChild(Q);Q.addEventListener('load',V);}else{V();}}function W(p,v){var V=Z1T7Y.g9D.q9D("ae")?'.template-container .article-no':"s1Y",G="D1Y",Q=Z1T7Y.g9D.q9D("22e2")?"classname":p;if(Z1T7Y[G](v,Z)&&Z1T7Y[V](v,Y)&&typeof v!=='undefined'){var I=function(L){Q=L;};I(v);}return Q;}function m(){var L="V9Y",p=null,v=Z1T7Y.g9D.q9D("6b")?null:"doVerticalMiddleAction",V=Z1T7Y.g9D.q9D("8b2d")?"isDynamicItemFn":null;V=performance.now();p=L2(V2.name,l2);v=Z1T7Y.g9D.q9D("48")?'.source-container .ce_keywords .ce_section-title':new j2(p);v.doBreak(v2.source);D2.debug('Non Hyphenation Breaking Applyed At '+(Z1T7Y[L](performance[f](),V))+' milliseconds.');setTimeout(function G(){d.eventBus.publish('paginate:referenceStyling');},0);}function c(){d.eventBus.unsubscribe('paginate:hyphenate',N2);d.eventBus.unsubscribe('paginate:nonHyphenBreak',m);d.eventBus.unsubscribe('paginate:referenceStyling',k);d.eventBus.unsubscribe('paginate:loadRequiredCss',A);d.eventBus.unsubscribe('paginate:startPagination',R);d.eventBus.unsubscribe('paginate:stopPagination',e);}function N2(){var L="L9Y",p=null,v=null,V=Z1T7Y.g9D.q9D("5b")?"columnHeight":null;V=performance.now();p=L2(V2.name,H);v=Z1T7Y.g9D.q9D("dd")?'.source-container .ce_bib-reference':new Z2(d.window,p);v.hyphenate(v2.source);D2.debug('Hyphenation Applyed At '+(Z1T7Y[L](performance[f](),V))+' milliseconds.');setTimeout(function G(){d.eventBus.publish('paginate:nonHyphenBreak');},0);}function X(){var p="q1Y",v=Z1T7Y.g9D.q9D("dac")?null:"texts",V=Z1T7Y.g9D.q9D("1f3d")?'act#112':{},G=/\+/g,Q=/([^&=]+)=?([^&]*)/g,I=function n(L){return decodeURIComponent(L.replace(G,' '));},O=Z1T7Y.g9D.q9D("db")?'3px':d.window.location.search.substring(1);v=Q.exec(O);while(Z1T7Y[p](v,Y)){V[I(v[1])]=I(v[2]);v=Q.exec(O);}return V;}function q(v,V,G){var Q="H1Y",I=Z1T7Y.g9D.q9D("8da")?"u1Y":'<div class="ce_date-received">',n='data-version',O="hasAttribute",K="h1Y",M="x1Y",P="j1Y",w=null,D=null,N=0,U=0,s=Z1T7Y.g9D.q9D("3e32")?"currentActor":null,o='';if(Z1T7Y[P](V.length,T)){G();}s=function E(){var L=Z1T7Y.g9D.q9D("23a5")?'.source-container .ce_foonote .ce_label span.x':"J1Y";U+=1;if(Z1T7Y[L](U,V.length)){G();}};w=v.querySelector('head');D=v.querySelector('body');if(Z1T7Y[M](D,Y)&&Z1T7Y[K](D[O](n),j)){var l=function(){var L="getAttribute",p='?v=';o=Z1T7Y.g9D.q9D("78bb")?p+D[L](n):'options';};l();}if(Z1T7Y[I](w,Y)){for(;Z1T7Y[Q](N,V.length);N+=1){h(v,w,(V[N]+o),s);}}}function L2(p,v){var V="M1Y",G="layouts",Q="n1Y",I=Z1T7Y.g9D.q9D("c6e2")?'.newline_simplepara':"G1Y",n=0,O=null,K=null;for(;Z1T7Y[I](n,v.length);n+=1){var M=function(L){K=L[n];};M(v);if(Z1T7Y[Q](K[G][b](p),T)){var P=function(L){O=L;};P(K);break;}}if(Z1T7Y[V](O,Y)){O=Z1T7Y.g9D.q9D("43")?J(v):"Request";}return O;}function I2(){d.eventBus.subscribe('paginate:stopPagination',e);d.eventBus.subscribe('paginate:startPagination',R);d.eventBus.subscribe('paginate:loadRequiredCss',A);d.eventBus.subscribe('paginate:referenceStyling',k);d.eventBus.subscribe('paginate:nonHyphenBreak',m);d.eventBus.subscribe('paginate:hyphenate',N2);}function R(){var p=null,v=Z1T7Y.g9D.q9D("a6b")?null:"cellPosition",V=Z1T7Y.g9D.q9D("c5")?null:"line",G=null,Q=null,I=Z1T7Y.g9D.q9D("43b2")?"cloneNode":null;v=Z1T7Y.g9D.q9D("45f")?1:new g(P2);V=new E2(v2.layout,v2.template,v);G=L2(V2.name,s2);Q=L2(V2.name,b2);I=Z1T7Y.g9D.q9D("e2cf")?L2(V2.name,U2):'Column Stretching Process At ';p=Z1T7Y.g9D.q9D("e2c7")?new G2(d.window,d.document,d.eventBus,V,G,Q,I):'pgnBegAct#65';p.start(v2,O2,function n(){setTimeout(function L(){d.eventBus.publish('paginate:stopPagination');},0);},n2);}function p2(L){setTimeout(function p(){d.eventBus.publish('paginate:onComplete',O2.pageCount,L);},0);}function r(L){var p="revisionId",v=Z1T7Y.g9D.q9D("7366")?'text/css':"r7Y",V=Z1T7Y.g9D.q9D("fef6")?'.typeTwoRef .sb_reference .sb_editor .ce_suffix .x:last-child':"X7Y";if(Z1T7Y[V](O2,Y)||typeof O2==='undefined'){return true;}if(Z1T7Y[v](O2[p],L)){return false;}return true;}function n2(L){a.prototype=Error.prototype;c();throw  new a(L);}function S2(p,v){var V=Z1T7Y.g9D.q9D("725")?'pgnBegAct#62':"i1Y",G="keyterms",Q="t1Y",I="E1Y",n=0,O=null,K=null;for(;Z1T7Y[I](n,v.length);n+=1){var M=function(L){K=L[n];};M(v);if(Z1T7Y[Q](K[G][b](p),T)){var P=function(L){O=L;};P(K);break;}}if(Z1T7Y[V](O,Y)){O=J(v);}return O;}var V2=null,Q2=null,v2=null,O2=null,d={},M2=null;this.execute=function K2(L,p,v,V,G,Q,I,n,O,K,M,P,w){var D="debug",N="Y9Y",U="errorStatus",s="dataset",o="F9Y",E="l9Y",l=null,F=null,S=null;d.window=L;d.document=p;d.eventBus=O;l=X();if(Z1T7Y[E](r(M),y)){S=d.document.querySelector('.pager');if(Z1T7Y[o](Boolean(S[s][U]),j)){setTimeout(function t(){O.publish('pagination:proofErrorHandler','Error Occured');},0);return ;}p2(false);return ;}if(Z1T7Y[N](l[D],i)){F=new D2(d.window,d.document);F.configure('debug');}V2=S2(P,w2);v2=z(V);Q2=L2(V2.name,B);v2.paginationRoot.classList.add(V2.name);v2.layout.innerHTML=Q2.template.join('');v2.source.innerHTML=v;O2=V2.data;O2.pageCount=0;O2.revisionId=M;O2.customerLogo=Q;O2.journalLogo=I;O2.crossMarkLogo=n;O2.documentTitle=G;O2.abbreviatedTitle=W(G,w);x();};}:':abbreviatedTitle';return a2;});