import{g as W}from"./gsap-SFc2wnMY.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&t(l)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();function Tn(i,e){for(var n=0;n<e.length;n++){var t=e[n];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(i,t.key,t)}}function Mn(i,e,n){return e&&Tn(i.prototype,e),i}/*!
 * Observer 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/var xe,Jr,Ue,Lt,Rt,lr,tn,Xt,dr,rn,_t,st,nn,on=function(){return xe||typeof window<"u"&&(xe=window.gsap)&&xe.registerPlugin&&xe},an=1,sr=[],T=[],gt=[],Er=Date.now,hi=function(e,n){return n},Pn=function(){var e=dr.core,n=e.bridge||{},t=e._scrollers,r=e._proxies;t.push.apply(t,T),r.push.apply(r,gt),T=t,gt=r,hi=function(l,s){return n[l](s)}},$t=function(e,n){return~gt.indexOf(e)&&gt[gt.indexOf(e)+1][n]},Cr=function(e){return!!~rn.indexOf(e)},Re=function(e,n,t,r,o){return e.addEventListener(n,t,{passive:r!==!1,capture:!!o})},Le=function(e,n,t,r){return e.removeEventListener(n,t,!!r)},zr="scrollLeft",Nr="scrollTop",vi=function(){return _t&&_t.isPressed||T.cache++},ii=function(e,n){var t=function r(o){if(o||o===0){an&&(Ue.history.scrollRestoration="manual");var l=_t&&_t.isPressed;o=r.v=Math.round(o)||(_t&&_t.iOS?1:0),e(o),r.cacheID=T.cache,l&&hi("ss",o)}else(n||T.cache!==r.cacheID||hi("ref"))&&(r.cacheID=T.cache,r.v=e());return r.v+r.offset};return t.offset=0,e&&t},ze={s:zr,p:"left",p2:"Left",os:"right",os2:"Right",d:"width",d2:"Width",a:"x",sc:ii(function(i){return arguments.length?Ue.scrollTo(i,de.sc()):Ue.pageXOffset||Lt[zr]||Rt[zr]||lr[zr]||0})},de={s:Nr,p:"top",p2:"Top",os:"bottom",os2:"Bottom",d:"height",d2:"Height",a:"y",op:ze,sc:ii(function(i){return arguments.length?Ue.scrollTo(ze.sc(),i):Ue.pageYOffset||Lt[Nr]||Rt[Nr]||lr[Nr]||0})},Ye=function(e,n){return(n&&n._ctx&&n._ctx.selector||xe.utils.toArray)(e)[0]||(typeof e=="string"&&xe.config().nullTargetWarn!==!1?console.warn("Element not found:",e):null)},Bn=function(e,n){for(var t=n.length;t--;)if(n[t]===e||n[t].contains(e))return!0;return!1},Ot=function(e,n){var t=n.s,r=n.sc;Cr(e)&&(e=Lt.scrollingElement||Rt);var o=T.indexOf(e),l=r===de.sc?1:2;!~o&&(o=T.push(e)-1),T[o+l]||Re(e,"scroll",vi);var s=T[o+l],p=s||(T[o+l]=ii($t(e,t),!0)||(Cr(e)?r:ii(function(S){return arguments.length?e[t]=S:e[t]})));return p.target=e,s||(p.smooth=xe.getProperty(e,"scrollBehavior")==="smooth"),p},mi=function(e,n,t){var r=e,o=e,l=Er(),s=l,p=n||50,S=Math.max(500,p*3),B=function(m,G){var N=Er();G||N-l>p?(o=r,r=m,s=l,l=N):t?r+=m:r=o+(m-o)/(N-s)*(l-s)},C=function(){o=r=t?0:r,s=l=0},g=function(m){var G=s,N=o,ne=Er();return(m||m===0)&&m!==r&&B(m),l===s||ne-s>S?0:(r+(t?N:-N))/((t?ne:l)-G)*1e3};return{update:B,reset:C,getVelocity:g}},xr=function(e,n){return n&&!e._gsapAllow&&e.cancelable!==!1&&e.preventDefault(),e.changedTouches?e.changedTouches[0]:e},Li=function(e){var n=Math.max.apply(Math,e),t=Math.min.apply(Math,e);return Math.abs(n)>=Math.abs(t)?n:t},sn=function(){dr=xe.core.globals().ScrollTrigger,dr&&dr.core&&Pn()},ln=function(e){return xe=e||on(),!Jr&&xe&&typeof document<"u"&&document.body&&(Ue=window,Lt=document,Rt=Lt.documentElement,lr=Lt.body,rn=[Ue,Lt,Rt,lr],xe.utils.clamp,nn=xe.core.context||function(){},Xt="onpointerenter"in lr?"pointer":"mouse",tn=Z.isTouch=Ue.matchMedia&&Ue.matchMedia("(hover: none), (pointer: coarse)").matches?1:"ontouchstart"in Ue||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0?2:0,st=Z.eventTypes=("ontouchstart"in Rt?"touchstart,touchmove,touchcancel,touchend":"onpointerdown"in Rt?"pointerdown,pointermove,pointercancel,pointerup":"mousedown,mousemove,mouseup,mouseup").split(","),setTimeout(function(){return an=0},500),Jr=1),dr||sn(),Jr};ze.op=de;T.cache=0;var Z=function(){function i(n){this.init(n)}var e=i.prototype;return e.init=function(t){Jr||ln(xe)||console.warn("Please gsap.registerPlugin(Observer)"),dr||sn();var r=t.tolerance,o=t.dragMinimum,l=t.type,s=t.target,p=t.lineHeight,S=t.debounce,B=t.preventDefault,C=t.onStop,g=t.onStopDelay,c=t.ignore,m=t.wheelSpeed,G=t.event,N=t.onDragStart,ne=t.onDragEnd,H=t.onDrag,he=t.onPress,E=t.onRelease,Ke=t.onRight,j=t.onLeft,w=t.onUp,Ae=t.onDown,Ne=t.onChangeX,h=t.onChangeY,ce=t.onChange,b=t.onToggleX,ht=t.onToggleY,oe=t.onHover,Te=t.onHoverEnd,Me=t.onMove,I=t.ignoreCheck,Q=t.isNormalizer,ee=t.onGestureStart,a=t.onGestureEnd,ae=t.onWheel,It=t.onEnable,Ct=t.onDisable,Je=t.onClick,vt=t.scrollSpeed,be=t.capture,te=t.allowClicks,Pe=t.lockAxis,we=t.onLockAxis;this.target=s=Ye(s)||Rt,this.vars=t,c&&(c=xe.utils.toArray(c)),r=r||1e-9,o=o||0,m=m||1,vt=vt||1,l=l||"wheel,touch,pointer",S=S!==!1,p||(p=parseFloat(Ue.getComputedStyle(lr).lineHeight)||22);var Dt,Be,Fe,L,U,je,He,d=this,Xe=0,mt=0,At=t.passive||!B&&t.passive!==!1,V=Ot(s,ze),xt=Ot(s,de),Tt=V(),zt=xt(),ue=~l.indexOf("touch")&&!~l.indexOf("pointer")&&st[0]==="pointerdown",Mt=Cr(s),K=s.ownerDocument||Lt,rt=[0,0,0],Ze=[0,0,0],bt=0,gr=function(){return bt=Er()},re=function(x,R){return(d.event=x)&&c&&Bn(x.target,c)||R&&ue&&x.pointerType!=="touch"||I&&I(x,R)},$r=function(){d._vx.reset(),d._vy.reset(),Be.pause(),C&&C(d)},wt=function(){var x=d.deltaX=Li(rt),R=d.deltaY=Li(Ze),u=Math.abs(x)>=r,k=Math.abs(R)>=r;ce&&(u||k)&&ce(d,x,R,rt,Ze),u&&(Ke&&d.deltaX>0&&Ke(d),j&&d.deltaX<0&&j(d),Ne&&Ne(d),b&&d.deltaX<0!=Xe<0&&b(d),Xe=d.deltaX,rt[0]=rt[1]=rt[2]=0),k&&(Ae&&d.deltaY>0&&Ae(d),w&&d.deltaY<0&&w(d),h&&h(d),ht&&d.deltaY<0!=mt<0&&ht(d),mt=d.deltaY,Ze[0]=Ze[1]=Ze[2]=0),(L||Fe)&&(Me&&Me(d),Fe&&(N&&Fe===1&&N(d),H&&H(d),Fe=0),L=!1),je&&!(je=!1)&&we&&we(d),U&&(ae(d),U=!1),Dt=0},Qt=function(x,R,u){rt[u]+=x,Ze[u]+=R,d._vx.update(x),d._vy.update(R),S?Dt||(Dt=requestAnimationFrame(wt)):wt()},er=function(x,R){Pe&&!He&&(d.axis=He=Math.abs(x)>Math.abs(R)?"x":"y",je=!0),He!=="y"&&(rt[2]+=x,d._vx.update(x,!0)),He!=="x"&&(Ze[2]+=R,d._vy.update(R,!0)),S?Dt||(Dt=requestAnimationFrame(wt)):wt()},Pt=function(x){if(!re(x,1)){x=xr(x,B);var R=x.clientX,u=x.clientY,k=R-d.x,v=u-d.y,y=d.isDragging;d.x=R,d.y=u,(y||(k||v)&&(Math.abs(d.startX-R)>=o||Math.abs(d.startY-u)>=o))&&(Fe||(Fe=y?2:1),y||(d.isDragging=!0),er(k,v))}},Nt=d.onPress=function(_){re(_,1)||_&&_.button||(d.axis=He=null,Be.pause(),d.isPressed=!0,_=xr(_),Xe=mt=0,d.startX=d.x=_.clientX,d.startY=d.y=_.clientY,d._vx.reset(),d._vy.reset(),Re(Q?s:K,st[1],Pt,At,!0),d.deltaX=d.deltaY=0,he&&he(d))},P=d.onRelease=function(_){if(!re(_,1)){Le(Q?s:K,st[1],Pt,!0);var x=!isNaN(d.y-d.startY),R=d.isDragging,u=R&&(Math.abs(d.x-d.startX)>3||Math.abs(d.y-d.startY)>3),k=xr(_);!u&&x&&(d._vx.reset(),d._vy.reset(),B&&te&&xe.delayedCall(.08,function(){if(Er()-bt>300&&!_.defaultPrevented){if(_.target.click)_.target.click();else if(K.createEvent){var v=K.createEvent("MouseEvents");v.initMouseEvent("click",!0,!0,Ue,1,k.screenX,k.screenY,k.clientX,k.clientY,!1,!1,!1,!1,0,null),_.target.dispatchEvent(v)}}})),d.isDragging=d.isGesturing=d.isPressed=!1,C&&R&&!Q&&Be.restart(!0),Fe&&wt(),ne&&R&&ne(d),E&&E(d,u)}},jt=function(x){return x.touches&&x.touches.length>1&&(d.isGesturing=!0)&&ee(x,d.isDragging)},it=function(){return(d.isGesturing=!1)||a(d)},nt=function(x){if(!re(x)){var R=V(),u=xt();Qt((R-Tt)*vt,(u-zt)*vt,1),Tt=R,zt=u,C&&Be.restart(!0)}},ot=function(x){if(!re(x)){x=xr(x,B),ae&&(U=!0);var R=(x.deltaMode===1?p:x.deltaMode===2?Ue.innerHeight:1)*m;Qt(x.deltaX*R,x.deltaY*R,0),C&&!Q&&Be.restart(!0)}},Yt=function(x){if(!re(x)){var R=x.clientX,u=x.clientY,k=R-d.x,v=u-d.y;d.x=R,d.y=u,L=!0,C&&Be.restart(!0),(k||v)&&er(k,v)}},tr=function(x){d.event=x,oe(d)},kt=function(x){d.event=x,Te(d)},hr=function(x){return re(x)||xr(x,B)&&Je(d)};Be=d._dc=xe.delayedCall(g||.25,$r).pause(),d.deltaX=d.deltaY=0,d._vx=mi(0,50,!0),d._vy=mi(0,50,!0),d.scrollX=V,d.scrollY=xt,d.isDragging=d.isGesturing=d.isPressed=!1,nn(this),d.enable=function(_){return d.isEnabled||(Re(Mt?K:s,"scroll",vi),l.indexOf("scroll")>=0&&Re(Mt?K:s,"scroll",nt,At,be),l.indexOf("wheel")>=0&&Re(s,"wheel",ot,At,be),(l.indexOf("touch")>=0&&tn||l.indexOf("pointer")>=0)&&(Re(s,st[0],Nt,At,be),Re(K,st[2],P),Re(K,st[3],P),te&&Re(s,"click",gr,!0,!0),Je&&Re(s,"click",hr),ee&&Re(K,"gesturestart",jt),a&&Re(K,"gestureend",it),oe&&Re(s,Xt+"enter",tr),Te&&Re(s,Xt+"leave",kt),Me&&Re(s,Xt+"move",Yt)),d.isEnabled=!0,d.isDragging=d.isGesturing=d.isPressed=L=Fe=!1,d._vx.reset(),d._vy.reset(),Tt=V(),zt=xt(),_&&_.type&&Nt(_),It&&It(d)),d},d.disable=function(){d.isEnabled&&(sr.filter(function(_){return _!==d&&Cr(_.target)}).length||Le(Mt?K:s,"scroll",vi),d.isPressed&&(d._vx.reset(),d._vy.reset(),Le(Q?s:K,st[1],Pt,!0)),Le(Mt?K:s,"scroll",nt,be),Le(s,"wheel",ot,be),Le(s,st[0],Nt,be),Le(K,st[2],P),Le(K,st[3],P),Le(s,"click",gr,!0),Le(s,"click",hr),Le(K,"gesturestart",jt),Le(K,"gestureend",it),Le(s,Xt+"enter",tr),Le(s,Xt+"leave",kt),Le(s,Xt+"move",Yt),d.isEnabled=d.isPressed=d.isDragging=!1,Ct&&Ct(d))},d.kill=d.revert=function(){d.disable();var _=sr.indexOf(d);_>=0&&sr.splice(_,1),_t===d&&(_t=0)},sr.push(d),Q&&Cr(s)&&(_t=d),d.enable(G)},Mn(i,[{key:"velocityX",get:function(){return this._vx.getVelocity()}},{key:"velocityY",get:function(){return this._vy.getVelocity()}}]),i}();Z.version="3.15.0";Z.create=function(i){return new Z(i)};Z.register=ln;Z.getAll=function(){return sr.slice()};Z.getById=function(i){return sr.filter(function(e){return e.vars.id===i})[0]};on()&&xe.registerPlugin(Z);/*!
 * ScrollTrigger 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/var f,or,A,O,qe,$,Ei,ni,Lr,Dr,wr,jr,Se,si,xi,Oe,Ri,$i,ar,dn,di,cn,$e,bi,un,pn,Ft,wi,Ci,cr,Di,Ar,ki,ci,Yr=1,Ee=Date.now,ui=Ee(),tt=0,kr=0,Oi=function(e,n,t){var r=Ve(e)&&(e.substr(0,6)==="clamp("||e.indexOf("max")>-1);return t["_"+n+"Clamp"]=r,r?e.substr(6,e.length-7):e},Ii=function(e,n){return n&&(!Ve(e)||e.substr(0,6)!=="clamp(")?"clamp("+e+")":e},Fn=function i(){return kr&&requestAnimationFrame(i)},zi=function(){return si=1},Ni=function(){return si=0},pt=function(e){return e},yr=function(e){return Math.round(e*1e5)/1e5||0},fn=function(){return typeof window<"u"},gn=function(){return f||fn()&&(f=window.gsap)&&f.registerPlugin&&f},Kt=function(e){return!!~Ei.indexOf(e)},hn=function(e){return(e==="Height"?Di:A["inner"+e])||qe["client"+e]||$["client"+e]},vn=function(e){return $t(e,"getBoundingClientRect")||(Kt(e)?function(){return ri.width=A.innerWidth,ri.height=Di,ri}:function(){return yt(e)})},Ln=function(e,n,t){var r=t.d,o=t.d2,l=t.a;return(l=$t(e,"getBoundingClientRect"))?function(){return l()[r]}:function(){return(n?hn(o):e["client"+o])||0}},Rn=function(e,n){return!n||~gt.indexOf(e)?vn(e):function(){return ri}},ft=function(e,n){var t=n.s,r=n.d2,o=n.d,l=n.a;return Math.max(0,(t="scroll"+r)&&(l=$t(e,t))?l()-vn(e)()[o]:Kt(e)?(qe[t]||$[t])-hn(r):e[t]-e["offset"+r])},Hr=function(e,n){for(var t=0;t<ar.length;t+=3)(!n||~n.indexOf(ar[t+1]))&&e(ar[t],ar[t+1],ar[t+2])},Ve=function(e){return typeof e=="string"},Ce=function(e){return typeof e=="function"},_r=function(e){return typeof e=="number"},Wt=function(e){return typeof e=="object"},br=function(e,n,t){return e&&e.progress(n?0:1)&&t&&e.pause()},rr=function(e,n,t){if(e.enabled){var r=e._ctx?e._ctx.add(function(){return n(e,t)}):n(e,t);r&&r.totalTime&&(e.callbackAnimation=r)}},ir=Math.abs,mn="left",xn="top",Ai="right",Ti="bottom",Vt="width",qt="height",Tr="Right",Mr="Left",Pr="Top",Br="Bottom",ie="padding",Qe="margin",pr="Width",Mi="Height",le="px",et=function(e){return A.getComputedStyle(e.nodeType===Node.DOCUMENT_NODE?e.scrollingElement:e)},$n=function(e){var n=et(e).position;e.style.position=n==="absolute"||n==="fixed"?n:"relative"},ji=function(e,n){for(var t in n)t in e||(e[t]=n[t]);return e},yt=function(e,n){var t=n&&et(e)[xi]!=="matrix(1, 0, 0, 1, 0, 0)"&&f.to(e,{x:0,y:0,xPercent:0,yPercent:0,rotation:0,rotationX:0,rotationY:0,scale:1,skewX:0,skewY:0}).progress(1),r=e.getBoundingClientRect?e.getBoundingClientRect():e.scrollingElement.getBoundingClientRect();return t&&t.progress(0).kill(),r},oi=function(e,n){var t=n.d2;return e["offset"+t]||e["client"+t]||0},bn=function(e){var n=[],t=e.labels,r=e.duration(),o;for(o in t)n.push(t[o]/r);return n},On=function(e){return function(n){return f.utils.snap(bn(e),n)}},Pi=function(e){var n=f.utils.snap(e),t=Array.isArray(e)&&e.slice(0).sort(function(r,o){return r-o});return t?function(r,o,l){l===void 0&&(l=.001);var s;if(!o)return n(r);if(o>0){for(r-=l,s=0;s<t.length;s++)if(t[s]>=r)return t[s];return t[s-1]}else for(s=t.length,r+=l;s--;)if(t[s]<=r)return t[s];return t[0]}:function(r,o,l){l===void 0&&(l=.001);var s=n(r);return!o||Math.abs(s-r)<l||s-r<0==o<0?s:n(o<0?r-e:r+e)}},In=function(e){return function(n,t){return Pi(bn(e))(n,t.direction)}},Xr=function(e,n,t,r){return t.split(",").forEach(function(o){return e(n,o,r)})},ge=function(e,n,t,r,o){return e.addEventListener(n,t,{passive:!r,capture:!!o})},fe=function(e,n,t,r){return e.removeEventListener(n,t,!!r)},Wr=function(e,n,t){t=t&&t.wheelHandler,t&&(e(n,"wheel",t),e(n,"touchmove",t))},Yi={startColor:"green",endColor:"red",indent:0,fontSize:"16px",fontWeight:"normal"},Gr={toggleActions:"play",anticipatePin:0},ai={top:0,left:0,center:.5,bottom:1,right:1},Zr=function(e,n){if(Ve(e)){var t=e.indexOf("="),r=~t?+(e.charAt(t-1)+1)*parseFloat(e.substr(t+1)):0;~t&&(e.indexOf("%")>t&&(r*=n/100),e=e.substr(0,t-1)),e=r+(e in ai?ai[e]*n:~e.indexOf("%")?parseFloat(e)*n/100:parseFloat(e)||0)}return e},Vr=function(e,n,t,r,o,l,s,p){var S=o.startColor,B=o.endColor,C=o.fontSize,g=o.indent,c=o.fontWeight,m=O.createElement("div"),G=Kt(t)||$t(t,"pinType")==="fixed",N=e.indexOf("scroller")!==-1,ne=G?$:t.tagName==="IFRAME"?t.contentDocument.body:t,H=e.indexOf("start")!==-1,he=H?S:B,E="border-color:"+he+";font-size:"+C+";color:"+he+";font-weight:"+c+";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";return E+="position:"+((N||p)&&G?"fixed;":"absolute;"),(N||p||!G)&&(E+=(r===de?Ai:Ti)+":"+(l+parseFloat(g))+"px;"),s&&(E+="box-sizing:border-box;text-align:left;width:"+s.offsetWidth+"px;"),m._isStart=H,m.setAttribute("class","gsap-marker-"+e+(n?" marker-"+n:"")),m.style.cssText=E,m.innerText=n||n===0?e+"-"+n:e,ne.children[0]?ne.insertBefore(m,ne.children[0]):ne.appendChild(m),m._offset=m["offset"+r.op.d2],Qr(m,0,r,H),m},Qr=function(e,n,t,r){var o={display:"block"},l=t[r?"os2":"p2"],s=t[r?"p2":"os2"];e._isFlipped=r,o[t.a+"Percent"]=r?-100:0,o[t.a]=r?"1px":0,o["border"+l+pr]=1,o["border"+s+pr]=0,o[t.p]=n+"px",f.set(e,o)},D=[],yi={},Rr,Hi=function(){return Ee()-tt>34&&(Rr||(Rr=requestAnimationFrame(St)))},nr=function(){(!$e||!$e.isPressed||$e.startX>$.clientWidth)&&(T.cache++,$e?Rr||(Rr=requestAnimationFrame(St)):St(),tt||Zt("scrollStart"),tt=Ee())},pi=function(){pn=A.innerWidth,un=A.innerHeight},Sr=function(e){T.cache++,(e===!0||!Se&&!cn&&!O.fullscreenElement&&!O.webkitFullscreenElement&&(!bi||pn!==A.innerWidth||Math.abs(A.innerHeight-un)>A.innerHeight*.25))&&ni.restart(!0)},Jt={},zn=[],wn=function i(){return fe(M,"scrollEnd",i)||Gt(!0)},Zt=function(e){return Jt[e]&&Jt[e].map(function(n){return n()})||zn},Ge=[],kn=function(e){for(var n=0;n<Ge.length;n+=5)(!e||Ge[n+4]&&Ge[n+4].query===e)&&(Ge[n].style.cssText=Ge[n+1],Ge[n].getBBox&&Ge[n].setAttribute("transform",Ge[n+2]||""),Ge[n+3].uncache=1)},yn=function(){return T.forEach(function(e){return Ce(e)&&++e.cacheID&&(e.rec=e())})},Bi=function(e,n){var t;for(Oe=0;Oe<D.length;Oe++)t=D[Oe],t&&(!n||t._ctx===n)&&(e?t.kill(1):t.revert(!0,!0));Ar=!0,n&&kn(n),n||Zt("revert")},_n=function(e,n){T.cache++,(n||!Ie)&&T.forEach(function(t){return Ce(t)&&t.cacheID++&&(t.rec=0)}),Ve(e)&&(A.history.scrollRestoration=Ci=e)},Ie,Ut=0,Xi,Nn=function(){if(Xi!==Ut){var e=Xi=Ut;requestAnimationFrame(function(){return e===Ut&&Gt(!0)})}},Sn=function(){$.appendChild(cr),Di=!$e&&cr.offsetHeight||A.innerHeight,$.removeChild(cr)},Wi=function(e){return Lr(".gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end").forEach(function(n){return n.style.display=e?"none":"block"})},Gt=function(e,n){if(qe=O.documentElement,$=O.body,Ei=[A,O,qe,$],tt&&!e&&!Ar){ge(M,"scrollEnd",wn);return}Sn(),Ie=M.isRefreshing=!0,Ar||yn();var t=Zt("refreshInit");dn&&M.sort(),n||Bi(),T.forEach(function(r){Ce(r)&&(r.smooth&&(r.target.style.scrollBehavior="auto"),r(0))}),D.slice(0).forEach(function(r){return r.refresh()}),Ar=!1,D.forEach(function(r){if(r._subPinOffset&&r.pin){var o=r.vars.horizontal?"offsetWidth":"offsetHeight",l=r.pin[o];r.revert(!0,1),r.adjustPinSpacing(r.pin[o]-l),r.refresh()}}),ki=1,Wi(!0),D.forEach(function(r){var o=ft(r.scroller,r._dir),l=r.vars.end==="max"||r._endClamp&&r.end>o,s=r._startClamp&&r.start>=o;(l||s)&&r.setPositions(s?o-1:r.start,l?Math.max(s?o:r.start+1,o):r.end,!0)}),Wi(!1),ki=0,t.forEach(function(r){return r&&r.render&&r.render(-1)}),T.forEach(function(r){Ce(r)&&(r.smooth&&requestAnimationFrame(function(){return r.target.style.scrollBehavior="smooth"}),r.rec&&r(r.rec))}),_n(Ci,1),ni.pause(),Ut++,Ie=2,St(2),D.forEach(function(r){return Ce(r.vars.onRefresh)&&r.vars.onRefresh(r)}),Ie=M.isRefreshing=!1,Zt("refresh")},_i=0,ei=1,Fr,St=function(e){if(e===2||!Ie&&!Ar){M.isUpdating=!0,Fr&&Fr.update(0);var n=D.length,t=Ee(),r=t-ui>=50,o=n&&D[0].scroll();if(ei=_i>o?-1:1,Ie||(_i=o),r&&(tt&&!si&&t-tt>200&&(tt=0,Zt("scrollEnd")),wr=ui,ui=t),ei<0){for(Oe=n;Oe-- >0;)D[Oe]&&D[Oe].update(0,r);ei=1}else for(Oe=0;Oe<n;Oe++)D[Oe]&&D[Oe].update(0,r);M.isUpdating=!1}Rr=0},Si=[mn,xn,Ti,Ai,Qe+Br,Qe+Tr,Qe+Pr,Qe+Mr,"display","flexShrink","float","zIndex","gridColumnStart","gridColumnEnd","gridRowStart","gridRowEnd","gridArea","justifySelf","alignSelf","placeSelf","order"],ti=Si.concat([Vt,qt,"boxSizing","max"+pr,"max"+Mi,"position",Qe,ie,ie+Pr,ie+Tr,ie+Br,ie+Mr]),jn=function(e,n,t){ur(t);var r=e._gsap;if(r.spacerIsNative)ur(r.spacerState);else if(e._gsap.swappedIn){var o=n.parentNode;o&&(o.insertBefore(e,n),o.removeChild(n))}e._gsap.swappedIn=!1},fi=function(e,n,t,r){if(!e._gsap.swappedIn){for(var o=Si.length,l=n.style,s=e.style,p;o--;)p=Si[o],l[p]=t[p];l.position=t.position==="absolute"?"absolute":"relative",t.display==="inline"&&(l.display="inline-block"),s[Ti]=s[Ai]="auto",l.flexBasis=t.flexBasis||"auto",l.overflow="visible",l.boxSizing="border-box",l[Vt]=oi(e,ze)+le,l[qt]=oi(e,de)+le,l[ie]=s[Qe]=s[xn]=s[mn]="0",ur(r),s[Vt]=s["max"+pr]=t[Vt],s[qt]=s["max"+Mi]=t[qt],s[ie]=t[ie],e.parentNode!==n&&(e.parentNode.insertBefore(n,e),n.appendChild(e)),e._gsap.swappedIn=!0}},Yn=/([A-Z])/g,ur=function(e){if(e){var n=e.t.style,t=e.length,r=0,o,l;for((e.t._gsap||f.core.getCache(e.t)).uncache=1;r<t;r+=2)l=e[r+1],o=e[r],l?n[o]=l:n[o]&&n.removeProperty(o.replace(Yn,"-$1").toLowerCase())}},qr=function(e){for(var n=ti.length,t=e.style,r=[],o=0;o<n;o++)r.push(ti[o],t[ti[o]]);return r.t=e,r},Hn=function(e,n,t){for(var r=[],o=e.length,l=t?8:0,s;l<o;l+=2)s=e[l],r.push(s,s in n?n[s]:e[l+1]);return r.t=e.t,r},ri={left:0,top:0},Gi=function(e,n,t,r,o,l,s,p,S,B,C,g,c,m){Ce(e)&&(e=e(p)),Ve(e)&&e.substr(0,3)==="max"&&(e=g+(e.charAt(4)==="="?Zr("0"+e.substr(3),t):0));var G=c?c.time():0,N,ne,H;if(c&&c.seek(0),isNaN(e)||(e=+e),_r(e))c&&(e=f.utils.mapRange(c.scrollTrigger.start,c.scrollTrigger.end,0,g,e)),s&&Qr(s,t,r,!0);else{Ce(n)&&(n=n(p));var he=(e||"0").split(" "),E,Ke,j,w;H=Ye(n,p)||$,E=yt(H)||{},(!E||!E.left&&!E.top)&&et(H).display==="none"&&(w=H.style.display,H.style.display="block",E=yt(H),w?H.style.display=w:H.style.removeProperty("display")),Ke=Zr(he[0],E[r.d]),j=Zr(he[1]||"0",t),e=E[r.p]-S[r.p]-B+Ke+o-j,s&&Qr(s,j,r,t-j<20||s._isStart&&j>20),t-=t-j}if(m&&(p[m]=e||-.001,e<0&&(e=0)),l){var Ae=e+t,Ne=l._isStart;N="scroll"+r.d2,Qr(l,Ae,r,Ne&&Ae>20||!Ne&&(C?Math.max($[N],qe[N]):l.parentNode[N])<=Ae+1),C&&(S=yt(s),C&&(l.style[r.op.p]=S[r.op.p]-r.op.m-l._offset+le))}return c&&H&&(N=yt(H),c.seek(g),ne=yt(H),c._caScrollDist=N[r.p]-ne[r.p],e=e/c._caScrollDist*g),c&&c.seek(G),c?e:Math.round(e)},Xn=/(webkit|moz|length|cssText|inset)/i,Vi=function(e,n,t,r){if(e.parentNode!==n){var o=e.style,l,s;if(n===$){e._stOrig=o.cssText,s=et(e);for(l in s)!+l&&!Xn.test(l)&&s[l]&&typeof o[l]=="string"&&l!=="0"&&(o[l]=s[l]);o.top=t,o.left=r}else o.cssText=e._stOrig;f.core.getCache(e).uncache=1,n.appendChild(e)}},En=function(e,n,t){var r=n,o=r;return function(l){var s=Math.round(e());return s!==r&&s!==o&&Math.abs(s-r)>3&&Math.abs(s-o)>3&&(l=s,t&&t()),o=r,r=Math.round(l),r}},Ur=function(e,n,t){var r={};r[n.p]="+="+t,f.set(e,r)},qi=function(e,n){var t=Ot(e,n),r="_scroll"+n.p2,o=function l(s,p,S,B,C){var g=l.tween,c=p.onComplete,m={};S=S||t();var G=En(t,S,function(){g.kill(),l.tween=0});return C=B&&C||0,B=B||s-S,g&&g.kill(),p[r]=s,p.inherit=!1,p.modifiers=m,m[r]=function(){return G(S+B*g.ratio+C*g.ratio*g.ratio)},p.onUpdate=function(){T.cache++,l.tween&&St()},p.onComplete=function(){l.tween=0,c&&c.call(g)},g=l.tween=f.to(e,p),g};return e[r]=t,t.wheelHandler=function(){return o.tween&&o.tween.kill()&&(o.tween=0)},ge(e,"wheel",t.wheelHandler),M.isTouch&&ge(e,"touchmove",t.wheelHandler),o},M=function(){function i(n,t){or||i.register(f)||console.warn("Please gsap.registerPlugin(ScrollTrigger)"),wi(this),this.init(n,t)}var e=i.prototype;return e.init=function(t,r){if(this.progress=this.start=0,this.vars&&this.kill(!0,!0),!kr){this.update=this.refresh=this.kill=pt;return}t=ji(Ve(t)||_r(t)||t.nodeType?{trigger:t}:t,Gr);var o=t,l=o.onUpdate,s=o.toggleClass,p=o.id,S=o.onToggle,B=o.onRefresh,C=o.scrub,g=o.trigger,c=o.pin,m=o.pinSpacing,G=o.invalidateOnRefresh,N=o.anticipatePin,ne=o.onScrubComplete,H=o.onSnapComplete,he=o.once,E=o.snap,Ke=o.pinReparent,j=o.pinSpacer,w=o.containerAnimation,Ae=o.fastScrollEnd,Ne=o.preventOverlaps,h=t.horizontal||t.containerAnimation&&t.horizontal!==!1?ze:de,ce=!C&&C!==0,b=Ye(t.scroller||A),ht=f.core.getCache(b),oe=Kt(b),Te=("pinType"in t?t.pinType:$t(b,"pinType")||oe&&"fixed")==="fixed",Me=[t.onEnter,t.onLeave,t.onEnterBack,t.onLeaveBack],I=ce&&t.toggleActions.split(" "),Q="markers"in t?t.markers:Gr.markers,ee=oe?0:parseFloat(et(b)["border"+h.p2+pr])||0,a=this,ae=t.onRefreshInit&&function(){return t.onRefreshInit(a)},It=Ln(b,oe,h),Ct=Rn(b,oe),Je=0,vt=0,be=0,te=Ot(b,h),Pe,we,Dt,Be,Fe,L,U,je,He,d,Xe,mt,At,V,xt,Tt,zt,ue,Mt,K,rt,Ze,bt,gr,re,$r,wt,Qt,er,Pt,Nt,P,jt,it,nt,ot,Yt,tr,kt;if(a._startClamp=a._endClamp=!1,a._dir=h,N*=45,a.scroller=b,a.scroll=w?w.time.bind(w):te,Be=te(),a.vars=t,r=r||t.animation,"refreshPriority"in t&&(dn=1,t.refreshPriority===-9999&&(Fr=a)),ht.tweenScroll=ht.tweenScroll||{top:qi(b,de),left:qi(b,ze)},a.tweenTo=Pe=ht.tweenScroll[h.p],a.scrubDuration=function(u){jt=_r(u)&&u,jt?P?P.duration(u):P=f.to(r,{ease:"expo",totalProgress:"+=0",inherit:!1,duration:jt,paused:!0,onComplete:function(){return ne&&ne(a)}}):(P&&P.progress(1).kill(),P=0)},r&&(r.vars.lazy=!1,r._initted&&!a.isReverted||r.vars.immediateRender!==!1&&t.immediateRender!==!1&&r.duration()&&r.render(0,!0,!0),a.animation=r.pause(),r.scrollTrigger=a,a.scrubDuration(C),Pt=0,p||(p=r.vars.id)),E&&((!Wt(E)||E.push)&&(E={snapTo:E}),"scrollBehavior"in $.style&&f.set(oe?[$,qe]:b,{scrollBehavior:"auto"}),T.forEach(function(u){return Ce(u)&&u.target===(oe?O.scrollingElement||qe:b)&&(u.smooth=!1)}),Dt=Ce(E.snapTo)?E.snapTo:E.snapTo==="labels"?On(r):E.snapTo==="labelsDirectional"?In(r):E.directional!==!1?function(u,k){return Pi(E.snapTo)(u,Ee()-vt<500?0:k.direction)}:f.utils.snap(E.snapTo),it=E.duration||{min:.1,max:2},it=Wt(it)?Dr(it.min,it.max):Dr(it,it),nt=f.delayedCall(E.delay||jt/2||.1,function(){var u=te(),k=Ee()-vt<500,v=Pe.tween;if((k||Math.abs(a.getVelocity())<10)&&!v&&!si&&Je!==u){var y=(u-L)/V,pe=r&&!ce?r.totalProgress():y,F=k?0:(pe-Nt)/(Ee()-wr)*1e3||0,J=f.utils.clamp(-y,1-y,ir(F/2)*F/.185),ke=y+(E.inertia===!1?0:J),q,Y,z=E,at=z.onStart,X=z.onInterrupt,We=z.onComplete;if(q=Dt(ke,a),_r(q)||(q=ke),Y=Math.max(0,Math.round(L+q*V)),u<=U&&u>=L&&Y!==u){if(v&&!v._initted&&v.data<=ir(Y-u))return;E.inertia===!1&&(J=q-y),Pe(Y,{duration:it(ir(Math.max(ir(ke-pe),ir(q-pe))*.185/F/.05||0)),ease:E.ease||"power3",data:ir(Y-u),onInterrupt:function(){return nt.restart(!0)&&X&&rr(a,X)},onComplete:function(){a.update(),Je=te(),r&&!ce&&(P?P.resetTo("totalProgress",q,r._tTime/r._tDur):r.progress(q)),Pt=Nt=r&&!ce?r.totalProgress():a.progress,H&&H(a),We&&rr(a,We)}},u,J*V,Y-u-J*V),at&&rr(a,at,Pe.tween)}}else a.isActive&&Je!==u&&nt.restart(!0)}).pause()),p&&(yi[p]=a),g=a.trigger=Ye(g||c!==!0&&c),kt=g&&g._gsap&&g._gsap.stRevert,kt&&(kt=kt(a)),c=c===!0?g:Ye(c),Ve(s)&&(s={targets:g,className:s}),c&&(m===!1||m===Qe||(m=!m&&c.parentNode&&c.parentNode.style&&et(c.parentNode).display==="flex"?!1:ie),a.pin=c,we=f.core.getCache(c),we.spacer?xt=we.pinState:(j&&(j=Ye(j),j&&!j.nodeType&&(j=j.current||j.nativeElement),we.spacerIsNative=!!j,j&&(we.spacerState=qr(j))),we.spacer=ue=j||O.createElement("div"),ue.classList.add("pin-spacer"),p&&ue.classList.add("pin-spacer-"+p),we.pinState=xt=qr(c)),t.force3D!==!1&&f.set(c,{force3D:!0}),a.spacer=ue=we.spacer,er=et(c),gr=er[m+h.os2],K=f.getProperty(c),rt=f.quickSetter(c,h.a,le),fi(c,ue,er),zt=qr(c)),Q){mt=Wt(Q)?ji(Q,Yi):Yi,d=Vr("scroller-start",p,b,h,mt,0),Xe=Vr("scroller-end",p,b,h,mt,0,d),Mt=d["offset"+h.op.d2];var hr=Ye($t(b,"content")||b);je=this.markerStart=Vr("start",p,hr,h,mt,Mt,0,w),He=this.markerEnd=Vr("end",p,hr,h,mt,Mt,0,w),w&&(tr=f.quickSetter([je,He],h.a,le)),!Te&&!(gt.length&&$t(b,"fixedMarkers")===!0)&&($n(oe?$:b),f.set([d,Xe],{force3D:!0}),$r=f.quickSetter(d,h.a,le),Qt=f.quickSetter(Xe,h.a,le))}if(w){var _=w.vars.onUpdate,x=w.vars.onUpdateParams;w.eventCallback("onUpdate",function(){a.update(0,0,1),_&&_.apply(w,x||[])})}if(a.previous=function(){return D[D.indexOf(a)-1]},a.next=function(){return D[D.indexOf(a)+1]},a.revert=function(u,k){if(!k)return a.kill(!0);var v=u!==!1||!a.enabled,y=Se;v!==a.isReverted&&(v&&(ot=Math.max(te(),a.scroll.rec||0),be=a.progress,Yt=r&&r.progress()),je&&[je,He,d,Xe].forEach(function(pe){return pe.style.display=v?"none":"block"}),v&&(Se=a,a.update(v)),c&&(!Ke||!a.isActive)&&(v?jn(c,ue,xt):fi(c,ue,et(c),re)),v||a.update(v),Se=y,a.isReverted=v)},a.refresh=function(u,k,v,y){if(!((Se||!a.enabled)&&!k)){if(c&&u&&tt){ge(i,"scrollEnd",wn);return}!Ie&&ae&&ae(a),Se=a,Pe.tween&&!v&&(Pe.tween.kill(),Pe.tween=0),P&&P.pause(),G&&r&&(r.revert({kill:!1}).invalidate(),r.getChildren?r.getChildren(!0,!0,!1).forEach(function(Bt){return Bt.vars.immediateRender&&Bt.render(0,!0,!0)}):r.vars.immediateRender&&r.render(0,!0,!0)),a.isReverted||a.revert(!0,!0),a._subPinOffset=!1;var pe=It(),F=Ct(),J=w?w.duration():ft(b,h),ke=V<=.01||!V,q=0,Y=y||0,z=Wt(v)?v.end:t.end,at=t.endTrigger||g,X=Wt(v)?v.start:t.start||(t.start===0||!g?0:c?"0 0":"0 100%"),We=a.pinnedContainer=t.pinnedContainer&&Ye(t.pinnedContainer,a),dt=g&&Math.max(0,D.indexOf(a))||0,ve=dt,me,ye,Ht,Or,_e,se,ct,li,Fi,vr,ut,mr,Ir;for(Q&&Wt(v)&&(mr=f.getProperty(d,h.p),Ir=f.getProperty(Xe,h.p));ve-- >0;)se=D[ve],se.end||se.refresh(0,1)||(Se=a),ct=se.pin,ct&&(ct===g||ct===c||ct===We)&&!se.isReverted&&(vr||(vr=[]),vr.unshift(se),se.revert(!0,!0)),se!==D[ve]&&(dt--,ve--);for(Ce(X)&&(X=X(a)),X=Oi(X,"start",a),L=Gi(X,g,pe,h,te(),je,d,a,F,ee,Te,J,w,a._startClamp&&"_startClamp")||(c?-.001:0),Ce(z)&&(z=z(a)),Ve(z)&&!z.indexOf("+=")&&(~z.indexOf(" ")?z=(Ve(X)?X.split(" ")[0]:"")+z:(q=Zr(z.substr(2),pe),z=Ve(X)?X:(w?f.utils.mapRange(0,w.duration(),w.scrollTrigger.start,w.scrollTrigger.end,L):L)+q,at=g)),z=Oi(z,"end",a),U=Math.max(L,Gi(z||(at?"100% 0":J),at,pe,h,te()+q,He,Xe,a,F,ee,Te,J,w,a._endClamp&&"_endClamp"))||-.001,q=0,ve=dt;ve--;)se=D[ve]||{},ct=se.pin,ct&&se.start-se._pinPush<=L&&!w&&se.end>0&&(me=se.end-(a._startClamp?Math.max(0,se.start):se.start),(ct===g&&se.start-se._pinPush<L||ct===We)&&isNaN(X)&&(q+=me*(1-se.progress)),ct===c&&(Y+=me));if(L+=q,U+=q,a._startClamp&&(a._startClamp+=q),a._endClamp&&!Ie&&(a._endClamp=U||-.001,U=Math.min(U,ft(b,h))),V=U-L||(L-=.01)&&.001,ke&&(be=f.utils.clamp(0,1,f.utils.normalize(L,U,ot))),a._pinPush=Y,je&&q&&(me={},me[h.a]="+="+q,We&&(me[h.p]="-="+te()),f.set([je,He],me)),c&&!(ki&&a.end>=ft(b,h)))me=et(c),Or=h===de,Ht=te(),Ze=parseFloat(K(h.a))+Y,!J&&U>1&&(ut=(oe?O.scrollingElement||qe:b).style,ut={style:ut,value:ut["overflow"+h.a.toUpperCase()]},oe&&et($)["overflow"+h.a.toUpperCase()]!=="scroll"&&(ut.style["overflow"+h.a.toUpperCase()]="scroll")),fi(c,ue,me),zt=qr(c),ye=yt(c,!0),li=Te&&Ot(b,Or?ze:de)(),m?(re=[m+h.os2,V+Y+le],re.t=ue,ve=m===ie?oi(c,h)+V+Y:0,ve&&(re.push(h.d,ve+le),ue.style.flexBasis!=="auto"&&(ue.style.flexBasis=ve+le)),ur(re),We&&D.forEach(function(Bt){Bt.pin===We&&Bt.vars.pinSpacing!==!1&&(Bt._subPinOffset=!0)}),Te&&te(ot)):(ve=oi(c,h),ve&&ue.style.flexBasis!=="auto"&&(ue.style.flexBasis=ve+le)),Te&&(_e={top:ye.top+(Or?Ht-L:li)+le,left:ye.left+(Or?li:Ht-L)+le,boxSizing:"border-box",position:"fixed"},_e[Vt]=_e["max"+pr]=Math.ceil(ye.width)+le,_e[qt]=_e["max"+Mi]=Math.ceil(ye.height)+le,_e[Qe]=_e[Qe+Pr]=_e[Qe+Tr]=_e[Qe+Br]=_e[Qe+Mr]="0",_e[ie]=me[ie],_e[ie+Pr]=me[ie+Pr],_e[ie+Tr]=me[ie+Tr],_e[ie+Br]=me[ie+Br],_e[ie+Mr]=me[ie+Mr],Tt=Hn(xt,_e,Ke),Ie&&te(0)),r?(Fi=r._initted,di(1),r.render(r.duration(),!0,!0),bt=K(h.a)-Ze+V+Y,wt=Math.abs(V-bt)>1,Te&&wt&&Tt.splice(Tt.length-2,2),r.render(0,!0,!0),Fi||r.invalidate(!0),r.parent||r.totalTime(r.totalTime()),di(0)):bt=V,ut&&(ut.value?ut.style["overflow"+h.a.toUpperCase()]=ut.value:ut.style.removeProperty("overflow-"+h.a));else if(g&&te()&&!w)for(ye=g.parentNode;ye&&ye!==$;)ye._pinOffset&&(L-=ye._pinOffset,U-=ye._pinOffset),ye=ye.parentNode;vr&&vr.forEach(function(Bt){return Bt.revert(!1,!0)}),a.start=L,a.end=U,Be=Fe=Ie?ot:te(),!w&&!Ie&&(Be<ot&&te(ot),a.scroll.rec=0),a.revert(!1,!0),vt=Ee(),nt&&(Je=-1,nt.restart(!0)),Se=0,r&&ce&&(r._initted||Yt)&&r.progress()!==Yt&&r.progress(Yt||0,!0).render(r.time(),!0,!0),(ke||be!==a.progress||w||G||r&&!r._initted)&&(r&&!ce&&(r._initted||be||r.vars.immediateRender!==!1)&&r.totalProgress(w&&L<-.001&&!be?f.utils.normalize(L,U,0):be,!0),a.progress=ke||(Be-L)/V===be?0:be),c&&m&&(ue._pinOffset=Math.round(a.progress*bt)),P&&P.invalidate(),isNaN(mr)||(mr-=f.getProperty(d,h.p),Ir-=f.getProperty(Xe,h.p),Ur(d,h,mr),Ur(je,h,mr-(y||0)),Ur(Xe,h,Ir),Ur(He,h,Ir-(y||0))),ke&&!Ie&&a.update(),B&&!Ie&&!At&&(At=!0,B(a),At=!1)}},a.getVelocity=function(){return(te()-Fe)/(Ee()-wr)*1e3||0},a.endAnimation=function(){br(a.callbackAnimation),r&&(P?P.progress(1):r.paused()?ce||br(r,a.direction<0,1):br(r,r.reversed()))},a.labelToScroll=function(u){return r&&r.labels&&(L||a.refresh()||L)+r.labels[u]/r.duration()*V||0},a.getTrailing=function(u){var k=D.indexOf(a),v=a.direction>0?D.slice(0,k).reverse():D.slice(k+1);return(Ve(u)?v.filter(function(y){return y.vars.preventOverlaps===u}):v).filter(function(y){return a.direction>0?y.end<=L:y.start>=U})},a.update=function(u,k,v){if(!(w&&!v&&!u)){var y=Ie===!0?ot:a.scroll(),pe=u?0:(y-L)/V,F=pe<0?0:pe>1?1:pe||0,J=a.progress,ke,q,Y,z,at,X,We,dt;if(k&&(Fe=Be,Be=w?te():y,E&&(Nt=Pt,Pt=r&&!ce?r.totalProgress():F)),N&&c&&!Se&&!Yr&&tt&&(!F&&L<y+(y-Fe)/(Ee()-wr)*N?F=1e-4:F===1&&U>y+(y-Fe)/(Ee()-wr)*N&&(F=.9999)),F!==J&&a.enabled){if(ke=a.isActive=!!F&&F<1,q=!!J&&J<1,X=ke!==q,at=X||!!F!=!!J,a.direction=F>J?1:-1,a.progress=F,at&&!Se&&(Y=F&&!J?0:F===1?1:J===1?2:3,ce&&(z=!X&&I[Y+1]!=="none"&&I[Y+1]||I[Y],dt=r&&(z==="complete"||z==="reset"||z in r))),Ne&&(X||dt)&&(dt||C||!r)&&(Ce(Ne)?Ne(a):a.getTrailing(Ne).forEach(function(Ht){return Ht.endAnimation()})),ce||(P&&!Se&&!Yr?(P._dp._time-P._start!==P._time&&P.render(P._dp._time-P._start),P.resetTo?P.resetTo("totalProgress",F,r._tTime/r._tDur):(P.vars.totalProgress=F,P.invalidate().restart())):r&&r.totalProgress(F,!!(Se&&(vt||u)))),c){if(u&&m&&(ue.style[m+h.os2]=gr),!Te)rt(yr(Ze+bt*F));else if(at){if(We=!u&&F>J&&U+1>y&&y+1>=ft(b,h),Ke)if(!u&&(ke||We)){var ve=yt(c,!0),me=y-L;Vi(c,$,ve.top+(h===de?me:0)+le,ve.left+(h===de?0:me)+le)}else Vi(c,ue);ur(ke||We?Tt:zt),wt&&F<1&&ke||rt(Ze+(F===1&&!We?bt:0))}}E&&!Pe.tween&&!Se&&!Yr&&nt.restart(!0),s&&(X||he&&F&&(F<1||!ci))&&Lr(s.targets).forEach(function(Ht){return Ht.classList[ke||he?"add":"remove"](s.className)}),l&&!ce&&!u&&l(a),at&&!Se?(ce&&(dt&&(z==="complete"?r.pause().totalProgress(1):z==="reset"?r.restart(!0).pause():z==="restart"?r.restart(!0):r[z]()),l&&l(a)),(X||!ci)&&(S&&X&&rr(a,S),Me[Y]&&rr(a,Me[Y]),he&&(F===1?a.kill(!1,1):Me[Y]=0),X||(Y=F===1?1:3,Me[Y]&&rr(a,Me[Y]))),Ae&&!ke&&Math.abs(a.getVelocity())>(_r(Ae)?Ae:2500)&&(br(a.callbackAnimation),P?P.progress(1):br(r,z==="reverse"?1:!F,1))):ce&&l&&!Se&&l(a)}if(Qt){var ye=w?y/w.duration()*(w._caScrollDist||0):y;$r(ye+(d._isFlipped?1:0)),Qt(ye)}tr&&tr(-y/w.duration()*(w._caScrollDist||0))}},a.enable=function(u,k){a.enabled||(a.enabled=!0,ge(b,"resize",Sr),oe||ge(b,"scroll",nr),ae&&ge(i,"refreshInit",ae),u!==!1&&(a.progress=be=0,Be=Fe=Je=te()),k!==!1&&a.refresh())},a.getTween=function(u){return u&&Pe?Pe.tween:P},a.setPositions=function(u,k,v,y){if(w){var pe=w.scrollTrigger,F=w.duration(),J=pe.end-pe.start;u=pe.start+J*u/F,k=pe.start+J*k/F}a.refresh(!1,!1,{start:Ii(u,v&&!!a._startClamp),end:Ii(k,v&&!!a._endClamp)},y),a.update()},a.adjustPinSpacing=function(u){if(re&&u){var k=re.indexOf(h.d)+1;re[k]=parseFloat(re[k])+u+le,re[1]=parseFloat(re[1])+u+le,ur(re)}},a.disable=function(u,k){if(u!==!1&&a.revert(!0,!0),a.enabled&&(a.enabled=a.isActive=!1,k||P&&P.pause(),ot=0,we&&(we.uncache=1),ae&&fe(i,"refreshInit",ae),nt&&(nt.pause(),Pe.tween&&Pe.tween.kill()&&(Pe.tween=0)),!oe)){for(var v=D.length;v--;)if(D[v].scroller===b&&D[v]!==a)return;fe(b,"resize",Sr),oe||fe(b,"scroll",nr)}},a.kill=function(u,k){a.disable(u,k),P&&!k&&P.kill(),p&&delete yi[p];var v=D.indexOf(a);v>=0&&D.splice(v,1),v===Oe&&ei>0&&Oe--,v=0,D.forEach(function(y){return y.scroller===a.scroller&&(v=1)}),v||Ie||(a.scroll.rec=0),r&&(r.scrollTrigger=null,u&&r.revert({kill:!1}),k||r.kill()),je&&[je,He,d,Xe].forEach(function(y){return y.parentNode&&y.parentNode.removeChild(y)}),Fr===a&&(Fr=0),c&&(we&&(we.uncache=1),v=0,D.forEach(function(y){return y.pin===c&&v++}),v||(we.spacer=0)),t.onKill&&t.onKill(a)},D.push(a),a.enable(!1,!1),kt&&kt(a),r&&r.add&&!V){var R=a.update;a.update=function(){a.update=R,T.cache++,L||U||a.refresh()},f.delayedCall(.01,a.update),V=.01,L=U=0}else a.refresh();c&&Nn()},i.register=function(t){return or||(f=t||gn(),fn()&&window.document&&i.enable(),or=kr),or},i.defaults=function(t){if(t)for(var r in t)Gr[r]=t[r];return Gr},i.disable=function(t,r){kr=0,D.forEach(function(l){return l[r?"kill":"disable"](t)}),fe(A,"wheel",nr),fe(O,"scroll",nr),clearInterval(jr),fe(O,"touchcancel",pt),fe($,"touchstart",pt),Xr(fe,O,"pointerdown,touchstart,mousedown",zi),Xr(fe,O,"pointerup,touchend,mouseup",Ni),ni.kill(),Hr(fe);for(var o=0;o<T.length;o+=3)Wr(fe,T[o],T[o+1]),Wr(fe,T[o],T[o+2])},i.enable=function(){if(A=window,O=document,qe=O.documentElement,$=O.body,f){if(Lr=f.utils.toArray,Dr=f.utils.clamp,wi=f.core.context||pt,di=f.core.suppressOverwrites||pt,Ci=A.history.scrollRestoration||"auto",_i=A.pageYOffset||0,f.core.globals("ScrollTrigger",i),$){kr=1,cr=document.createElement("div"),cr.style.height="100vh",cr.style.position="absolute",Sn(),Fn(),Z.register(f),i.isTouch=Z.isTouch,Ft=Z.isTouch&&/(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent),bi=Z.isTouch===1,ge(A,"wheel",nr),Ei=[A,O,qe,$],f.matchMedia?(i.matchMedia=function(B){var C=f.matchMedia(),g;for(g in B)C.add(g,B[g]);return C},f.addEventListener("matchMediaInit",function(){yn(),Bi()}),f.addEventListener("matchMediaRevert",function(){return kn()}),f.addEventListener("matchMedia",function(){Gt(0,1),Zt("matchMedia")}),f.matchMedia().add("(orientation: portrait)",function(){return pi(),pi})):console.warn("Requires GSAP 3.11.0 or later"),pi(),ge(O,"scroll",nr);var t=$.hasAttribute("style"),r=$.style,o=r.borderTopStyle,l=f.core.Animation.prototype,s,p;for(l.revert||Object.defineProperty(l,"revert",{value:function(){return this.time(-.01,!0)}}),r.borderTopStyle="solid",s=yt($),de.m=Math.round(s.top+de.sc())||0,ze.m=Math.round(s.left+ze.sc())||0,o?r.borderTopStyle=o:r.removeProperty("border-top-style"),t||($.setAttribute("style",""),$.removeAttribute("style")),jr=setInterval(Hi,250),f.delayedCall(.5,function(){return Yr=0}),ge(O,"touchcancel",pt),ge($,"touchstart",pt),Xr(ge,O,"pointerdown,touchstart,mousedown",zi),Xr(ge,O,"pointerup,touchend,mouseup",Ni),xi=f.utils.checkPrefix("transform"),ti.push(xi),or=Ee(),ni=f.delayedCall(.2,Gt).pause(),ar=[O,"visibilitychange",function(){var B=A.innerWidth,C=A.innerHeight;O.hidden?(Ri=B,$i=C):(Ri!==B||$i!==C)&&Sr()},O,"DOMContentLoaded",Gt,A,"load",Gt,A,"resize",Sr],Hr(ge),D.forEach(function(B){return B.enable(0,1)}),p=0;p<T.length;p+=3)Wr(fe,T[p],T[p+1]),Wr(fe,T[p],T[p+2])}else if(O){var S=function B(){i.enable(),O.removeEventListener("DOMContentLoaded",B)};O.addEventListener("DOMContentLoaded",S)}}},i.config=function(t){"limitCallbacks"in t&&(ci=!!t.limitCallbacks);var r=t.syncInterval;r&&clearInterval(jr)||(jr=r)&&setInterval(Hi,r),"ignoreMobileResize"in t&&(bi=i.isTouch===1&&t.ignoreMobileResize),"autoRefreshEvents"in t&&(Hr(fe)||Hr(ge,t.autoRefreshEvents||"none"),cn=(t.autoRefreshEvents+"").indexOf("resize")===-1)},i.scrollerProxy=function(t,r){var o=Ye(t),l=T.indexOf(o),s=Kt(o);~l&&T.splice(l,s?6:2),r&&(s?gt.unshift(A,r,$,r,qe,r):gt.unshift(o,r))},i.clearMatchMedia=function(t){D.forEach(function(r){return r._ctx&&r._ctx.query===t&&r._ctx.kill(!0,!0)})},i.isInViewport=function(t,r,o){var l=(Ve(t)?Ye(t):t).getBoundingClientRect(),s=l[o?Vt:qt]*r||0;return o?l.right-s>0&&l.left+s<A.innerWidth:l.bottom-s>0&&l.top+s<A.innerHeight},i.positionInViewport=function(t,r,o){Ve(t)&&(t=Ye(t));var l=t.getBoundingClientRect(),s=l[o?Vt:qt],p=r==null?s/2:r in ai?ai[r]*s:~r.indexOf("%")?parseFloat(r)*s/100:parseFloat(r)||0;return o?(l.left+p)/A.innerWidth:(l.top+p)/A.innerHeight},i.killAll=function(t){if(D.slice(0).forEach(function(o){return o.vars.id!=="ScrollSmoother"&&o.kill()}),t!==!0){var r=Jt.killAll||[];Jt={},r.forEach(function(o){return o()})}},i}();M.version="3.15.0";M.saveStyles=function(i){return i?Lr(i).forEach(function(e){if(e&&e.style){var n=Ge.indexOf(e);n>=0&&Ge.splice(n,5),Ge.push(e,e.style.cssText,e.getBBox&&e.getAttribute("transform"),f.core.getCache(e),wi())}}):Ge};M.revert=function(i,e){return Bi(!i,e)};M.create=function(i,e){return new M(i,e)};M.refresh=function(i){return i?Sr(!0):(or||M.register())&&Gt(!0)};M.update=function(i){return++T.cache&&St(i===!0?2:0)};M.clearScrollMemory=_n;M.maxScroll=function(i,e){return ft(i,e?ze:de)};M.getScrollFunc=function(i,e){return Ot(Ye(i),e?ze:de)};M.getById=function(i){return yi[i]};M.getAll=function(){return D.filter(function(i){return i.vars.id!=="ScrollSmoother"})};M.isScrolling=function(){return!!tt};M.snapDirectional=Pi;M.addEventListener=function(i,e){var n=Jt[i]||(Jt[i]=[]);~n.indexOf(e)||n.push(e)};M.removeEventListener=function(i,e){var n=Jt[i],t=n&&n.indexOf(e);t>=0&&n.splice(t,1)};M.batch=function(i,e){var n=[],t={},r=e.interval||.016,o=e.batchMax||1e9,l=function(S,B){var C=[],g=[],c=f.delayedCall(r,function(){B(C,g),C=[],g=[]}).pause();return function(m){C.length||c.restart(!0),C.push(m.trigger),g.push(m),o<=C.length&&c.progress(1)}},s;for(s in e)t[s]=s.substr(0,2)==="on"&&Ce(e[s])&&s!=="onRefreshInit"?l(s,e[s]):e[s];return Ce(o)&&(o=o(),ge(M,"refresh",function(){return o=e.batchMax()})),Lr(i).forEach(function(p){var S={};for(s in t)S[s]=t[s];S.trigger=p,n.push(M.create(S))}),n};var Ui=function(e,n,t,r){return n>r?e(r):n<0&&e(0),t>r?(r-n)/(t-n):t<0?n/(n-t):1},gi=function i(e,n){n===!0?e.style.removeProperty("touch-action"):e.style.touchAction=n===!0?"auto":n?"pan-"+n+(Z.isTouch?" pinch-zoom":""):"none",e===qe&&i($,n)},Kr={auto:1,scroll:1},Wn=function(e){var n=e.event,t=e.target,r=e.axis,o=(n.changedTouches?n.changedTouches[0]:n).target,l=o._gsap||f.core.getCache(o),s=Ee(),p;if(!l._isScrollT||s-l._isScrollT>2e3){for(;o&&o!==$&&(o.scrollHeight<=o.clientHeight&&o.scrollWidth<=o.clientWidth||!(Kr[(p=et(o)).overflowY]||Kr[p.overflowX]));)o=o.parentNode;l._isScroll=o&&o!==t&&!Kt(o)&&(Kr[(p=et(o)).overflowY]||Kr[p.overflowX]),l._isScrollT=s}(l._isScroll||r==="x")&&(n.stopPropagation(),n._gsapAllow=!0)},Cn=function(e,n,t,r){return Z.create({target:e,capture:!0,debounce:!1,lockAxis:!0,type:n,onWheel:r=r&&Wn,onPress:r,onDrag:r,onScroll:r,onEnable:function(){return t&&ge(O,Z.eventTypes[0],Ji,!1,!0)},onDisable:function(){return fe(O,Z.eventTypes[0],Ji,!0)}})},Gn=/(input|label|select|textarea)/i,Ki,Ji=function(e){var n=Gn.test(e.target.tagName);(n||Ki)&&(e._gsapAllow=!0,Ki=n)},Vn=function(e){Wt(e)||(e={}),e.preventDefault=e.isNormalizer=e.allowClicks=!0,e.type||(e.type="wheel,touch"),e.debounce=!!e.debounce,e.id=e.id||"normalizer";var n=e,t=n.normalizeScrollX,r=n.momentum,o=n.allowNestedScroll,l=n.onRelease,s,p,S=Ye(e.target)||qe,B=f.core.globals().ScrollSmoother,C=B&&B.get(),g=Ft&&(e.content&&Ye(e.content)||C&&e.content!==!1&&!C.smooth()&&C.content()),c=Ot(S,de),m=Ot(S,ze),G=1,N=(Z.isTouch&&A.visualViewport?A.visualViewport.scale*A.visualViewport.width:A.outerWidth)/A.innerWidth,ne=0,H=Ce(r)?function(){return r(s)}:function(){return r||2.8},he,E,Ke=Cn(S,e.type,!0,o),j=function(){return E=!1},w=pt,Ae=pt,Ne=function(){p=ft(S,de),Ae=Dr(Ft?1:0,p),t&&(w=Dr(0,ft(S,ze))),he=Ut},h=function(){g._gsap.y=yr(parseFloat(g._gsap.y)+c.offset)+"px",g.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+parseFloat(g._gsap.y)+", 0, 1)",c.offset=c.cacheID=0},ce=function(){if(E){requestAnimationFrame(j);var Q=yr(s.deltaY/2),ee=Ae(c.v-Q);if(g&&ee!==c.v+c.offset){c.offset=ee-c.v;var a=yr((parseFloat(g&&g._gsap.y)||0)-c.offset);g.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+a+", 0, 1)",g._gsap.y=a+"px",c.cacheID=T.cache,St()}return!0}c.offset&&h(),E=!0},b,ht,oe,Te,Me=function(){Ne(),b.isActive()&&b.vars.scrollY>p&&(c()>p?b.progress(1)&&c(p):b.resetTo("scrollY",p))};return g&&f.set(g,{y:"+=0"}),e.ignoreCheck=function(I){return Ft&&I.type==="touchmove"&&ce()||G>1.05&&I.type!=="touchstart"||s.isGesturing||I.touches&&I.touches.length>1},e.onPress=function(){E=!1;var I=G;G=yr((A.visualViewport&&A.visualViewport.scale||1)/N),b.pause(),I!==G&&gi(S,G>1.01?!0:t?!1:"x"),ht=m(),oe=c(),Ne(),he=Ut},e.onRelease=e.onGestureStart=function(I,Q){if(c.offset&&h(),!Q)Te.restart(!0);else{T.cache++;var ee=H(),a,ae;t&&(a=m(),ae=a+ee*.05*-I.velocityX/.227,ee*=Ui(m,a,ae,ft(S,ze)),b.vars.scrollX=w(ae)),a=c(),ae=a+ee*.05*-I.velocityY/.227,ee*=Ui(c,a,ae,ft(S,de)),b.vars.scrollY=Ae(ae),b.invalidate().duration(ee).play(.01),(Ft&&b.vars.scrollY>=p||a>=p-1)&&f.to({},{onUpdate:Me,duration:ee})}l&&l(I)},e.onWheel=function(){b._ts&&b.pause(),Ee()-ne>1e3&&(he=0,ne=Ee())},e.onChange=function(I,Q,ee,a,ae){if(Ut!==he&&Ne(),Q&&t&&m(w(a[2]===Q?ht+(I.startX-I.x):m()+Q-a[1])),ee){c.offset&&h();var It=ae[2]===ee,Ct=It?oe+I.startY-I.y:c()+ee-ae[1],Je=Ae(Ct);It&&Ct!==Je&&(oe+=Je-Ct),c(Je)}(ee||Q)&&St()},e.onEnable=function(){gi(S,t?!1:"x"),M.addEventListener("refresh",Me),ge(A,"resize",Me),c.smooth&&(c.target.style.scrollBehavior="auto",c.smooth=m.smooth=!1),Ke.enable()},e.onDisable=function(){gi(S,!0),fe(A,"resize",Me),M.removeEventListener("refresh",Me),Ke.kill()},e.lockAxis=e.lockAxis!==!1,s=new Z(e),s.iOS=Ft,Ft&&!c()&&c(1),Ft&&f.ticker.add(pt),Te=s._dc,b=f.to(s,{ease:"power4",paused:!0,inherit:!1,scrollX:t?"+=0.1":"+=0",scrollY:"+=0.1",modifiers:{scrollY:En(c,c(),function(){return b.pause()})},onUpdate:St,onComplete:Te.vars.onComplete}),s};M.sort=function(i){if(Ce(i))return D.sort(i);var e=A.pageYOffset||0;return M.getAll().forEach(function(n){return n._sortY=n.trigger?e+n.trigger.getBoundingClientRect().top:n.start+A.innerHeight}),D.sort(i||function(n,t){return(n.vars.refreshPriority||0)*-1e6+(n.vars.containerAnimation?1e6:n._sortY)-((t.vars.containerAnimation?1e6:t._sortY)+(t.vars.refreshPriority||0)*-1e6)})};M.observe=function(i){return new Z(i)};M.normalizeScroll=function(i){if(typeof i>"u")return $e;if(i===!0&&$e)return $e.enable();if(i===!1){$e&&$e.kill(),$e=i;return}var e=i instanceof Z?i:Vn(i);return $e&&$e.target===e.target&&$e.kill(),Kt(e.target)&&($e=e),e};M.core={_getVelocityProp:mi,_inputObserver:Cn,_scrollers:T,_proxies:gt,bridge:{ss:function(){tt||Zt("scrollStart"),tt=Ee()},ref:function(){return Se}}};gn()&&f.registerPlugin(M);W.registerPlugin(M);const De={logo:"/images/logo1.png",polrideHero:"/images/polride-rider-hero.png",polrideMini:"/images/polride-rider-mini.png",polsendPackaging:"/images/polsend-packaging.png",nitipBowl:"/images/nitip-bowl.png",nitipPlate:"/images/nitip-plate.png"},Zi=[{label:"Layanan Kami",href:"#services"},{label:"Tutor",href:"#how-it-works"},{label:"Fitur",href:"#features"}],Dn=[{id:"pol-ride",image:De.polrideMini,name:"Pol-Ride",tagline:"Antar Jemput Lokal",description:"Antar jemput lokal untuk aktivitas harian di Indramayu. Cepat, aman, dan terpercaya."},{id:"pol-send",image:De.polsendPackaging,name:"Pol-Send",tagline:"Kirim Barang & Paket",description:"Kirim barang, paket, dokumen, makanan, atau kebutuhan harian dengan cepat dan aman."},{id:"nitip-apa-aja",image:De.nitipBowl,name:"Nitip Apa Aja",tagline:"Errand & Titip Beli",description:"Titip beli makanan atau barang dari restoran, warung, toko, atau lokasi mana pun."}],Qi=[{number:"01",title:"Pilih Layanan",description:"Pilih antara Pol-Ride, Pol-Send, atau Nitip Apa Aja sesuai kebutuhan kamu."},{number:"02",title:"Tentukan Lokasi",description:"Atur titik jemput dan tujuan. Bisa custom lokasi dari mana saja di Indramayu."},{number:"03",title:"Driver Jalan",description:"Driver terdekat langsung meluncur. Pantau posisi secara real-time di aplikasi."}],qn=[{icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>`,title:"Real-time Tracking",description:"Pantau posisi driver secara langsung di peta. Tidak perlu tebak-tebakan kapan sampai."},{icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`,title:"Direct Chat",description:"Komunikasi langsung dengan driver via in-app chat. Koordinasi jadi lebih mudah."},{icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`,title:"Local Trust",description:"Driver lokal Indramayu yang terverifikasi. Aman, dekat, dan paham jalanan setempat."},{icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`,title:"Cepat & Tepat",description:"Estimasi waktu akurat. Driver langsung bergerak begitu order diterima."},{icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>`,title:"Harga Transparan",description:"Tarif jelas sebelum berangkat. Tidak ada biaya tersembunyi atau kejutan di akhir."},{icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,title:"Komunitas Lokal",description:"Dukung driver lokal Indramayu. Setiap order berkontribusi pada ekonomi daerah."}],Un=[{image:De.nitipBowl,title:"Restoran Mana Aja",subtitle:"Dari warung pinggir jalan sampai resto hits, semua bisa dititipkan."},{image:De.nitipPlate,title:"Makanan Favorit",subtitle:"Titip beli nasi, mie, kopi, camilan, atau menu favorit tanpa ribet."},{image:De.polsendPackaging,title:"Paket & Barang Kecil",subtitle:"Kirim dokumen, oleh-oleh, barang kecil, atau kebutuhan harian dengan aman."},{image:De.polrideMini,title:"Driver Lokal",subtitle:"Driver Sipolin siap bantu pickup, belanja, dan antar ke tujuan kamu."}],en={duration:.9,ease:"power3.out"},Et=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches,fr=()=>window.innerWidth<768,An="#",Kn="#";function Jn(i){return!i||i.trim()===""||i==="#"?!1:i.startsWith("#download")?!0:i.startsWith("http")||i.startsWith("/")||i.startsWith("./")}function lt(i,e,n,t="lazy"){return`
    <img
      src="${i}"
      alt="${e}"
      class="${n}"
      loading="${t}"
      decoding="async"
      onerror="this.style.opacity='0'"
    />
  `}function Zn(){return`
<div id="page-loader" class="page-loader" aria-hidden="true">
  <div class="page-loader-logo">
    <div class="page-loader-logo-icon">
      ${lt(De.logo,"Sipolin","h-7 w-7 object-contain")}
    </div>
    <span>Sipolin</span>
  </div>
  <div class="page-loader-spinner" role="status" aria-label="Memuat..."></div>
  <div class="page-loader-text">Menyiapkan layanan...</div>
</div>`}function Qn(){return`
<div id="download-modal-backdrop" class="download-modal-backdrop" role="dialog" aria-modal="true" aria-label="Notifikasi Download">
  <div class="download-modal" id="download-modal">
    <button id="download-modal-close" class="download-modal-close" aria-label="Tutup">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M12 4L4 12M4 4l8 8"/>
      </svg>
    </button>

    <div class="download-modal-icon">🚀</div>

    <h3>Aplikasi Sipolin<br/>segera tersedia</h3>

    <p>File APK dan Play Store sedang disiapkan. Pantau terus website ini ya — kita bakal kasih kabar pertama kali.</p>

    <button class="download-modal-cta" id="download-modal-ok">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M13 4L6 11 3 8"/>
      </svg>
      Siap, pantau terus!
    </button>
  </div>
</div>`}function eo(){return`
<nav id="navbar" class="fixed top-0 left-0 right-0 z-50">
  <div class="max-w-6xl mx-auto px-5 md:px-6 h-16 md:h-[70px] flex items-center justify-between gap-4">

    <!-- Logo -->
    <a href="/" class="flex items-center gap-3 font-black text-lg text-slate-900 flex-shrink-0">
      <span class="brand-logo grid h-10 w-10 place-items-center rounded-[14px] overflow-hidden"
            style="background: linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%); border: 1px solid #A7F3D0; box-shadow: 0 4px 12px rgba(16,185,129,0.15);">
        ${lt(De.logo,"Logo Sipolin","h-7 w-7 object-contain")}
      </span>
      <span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Sipolin</span>
    </a>

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- Desktop nav links -->
    <div class="hidden md:flex items-center gap-6 mr-6">
      ${Zi.map(i=>`<a href="${i.href}" class="nav-link">${i.label}</a>`).join("")}
    </div>

    <!-- Download button (desktop) -->
    <a
      href="#download"
      data-download-link
      class="magnetic-btn hidden md:inline-flex items-center gap-2 text-white font-bold text-sm px-5 py-2.5 rounded-full flex-shrink-0 transition-all duration-300"
      style="background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 8px 24px rgba(16,185,129,0.3);"
    >
      Download
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M8 2v8M5 7l3 3 3-3"/>
        <path d="M2 12h12"/>
      </svg>
    </a>

    <!-- Hamburger (mobile) -->
    <button id="menu-toggle" class="md:hidden flex flex-col gap-[5px] p-2 -mr-1" aria-label="Buka menu" aria-expanded="false">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </div>

  <!-- Mobile menu -->
  <div id="mobile-menu" class="hidden md:hidden bg-white/97 backdrop-blur-xl px-5 py-4 space-y-1 shadow-xl"
       style="border-top: 1px solid #E2E8F0;">
    ${Zi.map(i=>`<a href="${i.href}" class="mobile-nav-link">${i.label}</a>`).join("")}
    <div class="pt-3 pb-1">
      <a
        href="#download"
        data-download-link
        class="flex items-center justify-center gap-2 text-white font-bold text-sm px-5 py-3 rounded-full w-full transition-all duration-300"
        style="background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 6px 20px rgba(16,185,129,0.25);"
      >
        Download Sipolin
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <path d="M8 2v8M5 7l3 3 3-3"/>
          <path d="M2 12h12"/>
        </svg>
      </a>
    </div>
  </div>
</nav>`}function to(){return`
<div class="floating-status absolute left-0 top-12 z-30 bg-white/95 backdrop-blur-sm rounded-[1.75rem] shadow-xl px-4 py-3 flex items-center gap-3"
     style="border: 1px solid #A7F3D0;">
  <div class="grid w-12 h-12 place-items-center rounded-2xl overflow-hidden shadow-sm p-1"
       style="background: linear-gradient(135deg, #ECFDF5, #A7F3D0);">
    <div class="grid h-full w-full place-items-center overflow-hidden rounded-xl bg-white">
      ${lt(De.polrideMini,"Driver Sipolin","h-9 w-9 object-contain")}
    </div>
  </div>
  <div>
    <div class="text-[13px] font-black text-slate-800 leading-tight">Driver otw!</div>
    <div class="text-[11px] font-bold" style="color: #10B981;">2 menit lagi</div>
  </div>
</div>`}function ro(){return`
<section id="hero" class="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
  <div class="hero-noise"></div>

  <div class="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center w-full">
    <div class="fade-up">
      <div class="hero-label section-label mb-6">
        <span class="w-2 h-2 rounded-full animate-ping" style="background: #10B981;"></span>
        <span class="ml-2">Polindra dan sekitarnya</span>
      </div>

      <h1 class="hero-headline font-black text-slate-900 leading-[0.92] tracking-[-0.07em] mb-7"
          style="font-size: clamp(3.2rem, 7vw, 6.8rem);">
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-1 block">Sipolin:</span>
        </span>
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-2 block" style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Solusi</span>
        </span>
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-3 block" style="background: linear-gradient(135deg, #059669, #34D399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Mobilitas</span>
        </span>
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-4 block">Indramayu.</span>
        </span>
      </h1>

      <p class="hero-desc text-lg text-slate-500 leading-relaxed max-w-md mb-8">
        Layanan on-demand untuk antar jemput, kirim barang, dan titip kebutuhan harian warga Indramayu.
      </p>

      <div class="hero-cta flex flex-wrap gap-3">
        <a
          href="${An}"
          data-download-link
          class="group magnetic-btn text-white px-8 py-4 rounded-full font-bold text-base inline-flex items-center gap-2 transition-all duration-300"
          style="background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 16px 48px rgba(16,185,129,0.32);"
        >
          Download Now
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="group-hover:translate-y-0.5 transition-transform">
            <path d="M9 2v9M6 8l3 3 3-3"/>
            <path d="M2 14h14"/>
          </svg>
        </a>
        <a href="#services" class="border-2 font-bold text-base px-8 py-4 rounded-full inline-flex items-center gap-2 transition-all duration-300"
           style="border-color: #A7F3D0; color: #059669; background: transparent;"
           onmouseover="this.style.background='#ECFDF5';this.style.borderColor='#10B981';"
           onmouseout="this.style.background='transparent';this.style.borderColor='#A7F3D0';">
          Lihat Layanan
        </a>
      </div>

      <div class="hero-trust flex items-center gap-6 mt-10 pt-8" style="border-top: 1px solid #E2E8F0;">
        <div class="group cursor-pointer">
          <div class="font-black text-2xl text-slate-900 transition-colors" style="transition: color 0.2s;">Segera</div>
          <div class="text-xs text-slate-400 mt-0.5">Hadir</div>
        </div>
        <div class="w-px h-10" style="background: #E2E8F0;"></div>
        <div class="group cursor-pointer">
          <div class="font-black text-2xl text-slate-900 transition-colors" style="transition: color 0.2s;">Driver</div>
          <div class="text-xs text-slate-400 mt-0.5">Lokal</div>
        </div>
        <div class="w-px h-10" style="background: #E2E8F0;"></div>
        <div class="group cursor-pointer">
          <div class="font-black text-2xl text-slate-900 transition-colors" style="transition: color 0.2s;">IDM</div>
          <div class="text-xs text-slate-400 mt-0.5">Indramayu</div>
        </div>
      </div>
    </div>

    <div class="hero-phone relative flex items-center justify-center min-h-[460px] md:min-h-[560px]">
      <div class="absolute w-72 h-72 rounded-full opacity-50 blur-3xl right-0 top-14 pointer-events-none"
           style="background: rgba(16, 185, 129, 0.18);"></div>
      <div class="absolute w-44 h-44 rounded-full opacity-40 blur-2xl left-6 bottom-8 pointer-events-none"
           style="background: rgba(5, 150, 105, 0.14);"></div>

      <div class="hero-visual-card relative z-10 w-full max-w-[420px] rounded-[2.5rem] p-4 md:p-5 overflow-hidden"
           style="border: 1px solid #A7F3D0; background: white; box-shadow: 0 32px 80px rgba(16,185,129,0.12), 0 0 0 1px rgba(167,243,208,0.4);">
        ${lt(De.polrideHero,"Ilustrasi Driver Sipolin","hero-rider-img w-full max-h-[360px] md:max-h-[460px] object-contain rounded-[2rem]","eager")}
      </div>

      ${to()}

      <div class="floating-rating absolute right-0 bottom-16 z-30 bg-white/95 backdrop-blur-sm rounded-[1.5rem] shadow-xl px-4 py-3"
           style="border: 1px solid #A7F3D0;">
        <div class="text-[10px] text-slate-400 mb-1">Rating Driver</div>
        <div class="flex gap-0.5 text-yellow-400 text-xs">★★★★★</div>
        <div class="text-[11px] font-bold text-slate-800 mt-0.5">Budi S.</div>
      </div>
    </div>
  </div>
</section>`}function io(){const i=["Pol-Ride","Pol-Send","Nitip Apa Aja","Cepat","Aman","Lokal","Indramayu","Terpercaya"];return`
<div class="py-4 overflow-hidden" style="background: linear-gradient(90deg, #047857 0%, #059669 50%, #047857 100%);">
  <div class="ticker-inner whitespace-nowrap">
    ${[...i,...i].map(n=>`<span class="inline-block text-white font-black text-sm mx-4 uppercase tracking-[0.2em] hover:scale-110 transition-transform duration-300">${n}</span><span class="inline-block mx-2" style="color: #A7F3D0;">✦</span>`).join("")}
  </div>
</div>`}function no(){return`
<section id="services" class="py-24" style="background: linear-gradient(to bottom, #ffffff, #F8FAFC);">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
        <span class="ml-2">Layanan Kami</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mt-4">
        Tiga layanan,<br/><span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">satu aplikasi.</span>
      </h2>
    </div>

    <div class="grid md:grid-cols-3 gap-6 md:gap-8">
      ${Dn.map((i,e)=>`
      <article class="card-service reveal-card group cursor-pointer" style="--delay: ${e*.15}s;">
        <div class="mb-5 grid h-24 w-24 place-items-center overflow-hidden rounded-2xl transition-all duration-500"
             style="background: linear-gradient(135deg, #ECFDF5, #A7F3D0);"
             onmouseover="this.style.background='linear-gradient(135deg,#059669,#10B981)'"
             onmouseout="this.style.background='linear-gradient(135deg,#ECFDF5,#A7F3D0)'">
          ${lt(i.image,i.name,"h-16 w-16 object-contain rounded-xl bg-white p-2 transition-all duration-500 group-hover:scale-110")}
        </div>

        <div class="section-label text-xs mb-1">${i.tagline}</div>
        <h3 class="text-xl font-black text-slate-900 mb-2">${i.name}</h3>
        <p class="text-slate-500 text-sm leading-relaxed">${i.description}</p>

        <div class="mt-5 pt-4" style="border-top: 1px solid #E2E8F0;">
          <a href="#download" data-download-link class="font-bold text-sm flex items-center gap-1 transition-all group" style="color: #059669;">
            Coba Sekarang
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="group-hover:translate-x-1 transition-transform">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </a>
        </div>
      </article>`).join("")}
    </div>
  </div>
</section>`}function oo(){return`
<section id="how-it-works" class="py-24 bg-white overflow-hidden">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid md:grid-cols-2 gap-16 items-center">
      <div class="fade-right">
        <div class="section-label mb-6">
          <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
          <span class="ml-2">Cara Ngangoe</span>
        </div>

        <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mb-12">
          Semudah<br/><span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">tiga langkah.</span>
        </h2>

        <div class="space-y-8">
          ${Qi.map((i,e)=>`
          <div class="hiw-step flex gap-5 items-start group cursor-pointer" style="--i: ${e}">
            <div class="flex-shrink-0">
              <div class="font-black leading-none tracking-[-0.08em] group-hover:scale-110 transition-transform duration-300"
                   style="font-size: clamp(3rem, 5vw, 4.5rem); background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${i.number}</div>
            </div>
            <div class="pt-2">
              <h3 class="text-xl font-black text-slate-900 mb-1 transition-colors group-hover:text-emerald-600">${i.title}</h3>
              <p class="text-slate-500 leading-relaxed">${i.description}</p>
            </div>
          </div>
          ${e<Qi.length-1?'<div class="ml-8 w-px h-8" style="background: linear-gradient(to bottom, #10B981, #A7F3D0);"></div>':""}`).join("")}
        </div>
      </div>

      <div class="relative flex justify-center fade-left">
        <div class="absolute w-96 h-96 rounded-full opacity-40 blur-3xl pointer-events-none"
             style="background: radial-gradient(circle, rgba(16,185,129,0.2), rgba(5,150,105,0.1));"></div>

        <div class="relative z-10 grid grid-cols-2 gap-4 w-full max-w-md">
          <div class="bg-white rounded-3xl p-5 shadow-xl col-span-2 hover:shadow-2xl transition-shadow"
               style="border: 1px solid #A7F3D0;">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 rounded-xl text-white text-xs font-bold shadow-lg flex items-center justify-center"
                   style="background: linear-gradient(135deg, #059669, #10B981);">1</div>
              <span class="font-black text-slate-800 text-sm">Pol-Ride dipilih</span>
              <span class="ml-auto text-xs font-bold animate-pulse" style="color: #10B981;">✓ Aktif</span>
            </div>
            <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full w-1/3 rounded-full animate-pulse" style="background: linear-gradient(90deg, #059669, #10B981);"></div>
            </div>
          </div>

          <div class="driver-mini-card relative overflow-hidden rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all group cursor-pointer"
               style="background: linear-gradient(135deg, #047857, #059669);">
            <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl group-hover:scale-150 transition-transform"></div>

            <div class="relative mb-4 h-24 w-full overflow-hidden rounded-xl bg-white shadow-lg">
              ${lt(De.polrideMini,"Driver Sipolin","driver-mini-img absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 object-contain group-hover:scale-110 transition-transform duration-500")}
            </div>

            <div class="relative z-10 text-white font-black text-base leading-tight">Driver Siap</div>
            <div class="relative z-10 mt-1 text-sm font-semibold" style="color: #A7F3D0;">2 menit lagi</div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all" style="border: 1px solid #A7F3D0;">
            <div class="text-3xl mb-2">📍</div>
            <div class="text-slate-800 font-black text-sm">Lokasi</div>
            <div class="text-slate-400 text-xs">Indramayu Kota</div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-xl col-span-2 hover:shadow-2xl transition-all" style="border: 1px solid #A7F3D0;">
            <div class="flex justify-between items-center">
              <div>
                <div class="text-slate-400 text-xs mb-1">Estimasi tiba</div>
                <div class="text-slate-900 font-black text-lg">5 menit</div>
              </div>
              <div class="text-right">
                <div class="text-slate-400 text-xs mb-1">Tarif</div>
                <div class="font-black text-lg" style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Rp 8.000</div>
              </div>
              <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                   style="background: linear-gradient(135deg, #059669, #10B981);">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>`}function ao(){return`
<section id="showcase" class="py-24" style="background: linear-gradient(to bottom, #F8FAFC, #ffffff);">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
        <span class="ml-2">Showcase</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mt-4">
        Semua ada,<br/><span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">semua bisa.</span>
      </h2>
    </div>

    <div id="stack-container" class="relative min-h-[600px]">
      ${Dn.map((i,e)=>`
      <article class="stack-card-item bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-6 md:mb-0 hover:shadow-2xl transition-all duration-500"
        style="top: ${120+e*20}px; z-index: ${10+e}; border: 1px solid #E2E8F0;">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="flex-1">
            <div class="grid w-20 h-20 place-items-center overflow-hidden rounded-2xl mb-6"
                 style="background: linear-gradient(135deg, #ECFDF5, #A7F3D0);">
              ${lt(i.image,i.name,"h-14 w-14 object-contain rounded-xl bg-white p-2")}
            </div>
            <div class="section-label mb-2">${i.tagline}</div>
            <h3 class="text-3xl font-black text-slate-900 mb-3">${i.name}</h3>
            <p class="text-slate-500 leading-relaxed mb-6">${i.description}</p>
            <a href="#download" data-download-link class="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all hover:scale-105"
               style="background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 8px 24px rgba(16,185,129,0.22);">
              Download App
            </a>
          </div>

          <div class="flex-shrink-0">
            <div class="w-64 h-64 rounded-3xl flex items-center justify-center overflow-hidden p-4 hover:scale-105 transition-transform duration-500"
                 style="background: linear-gradient(135deg, #ECFDF5, #ffffff, #ECFDF5); border: 2px solid #A7F3D0;">
              ${lt(i.image,i.name,"w-48 h-48 object-contain rounded-2xl bg-white p-3")}
            </div>
          </div>
        </div>
      </article>`).join("")}
    </div>
  </div>
</section>`}function so(){return`
<section id="nitip" class="py-24 bg-white overflow-hidden">
  <div class="max-w-6xl mx-auto px-6 mb-10">
    <div class="section-label">
      <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
      <span class="ml-2">Nitip Apa Aja</span>
    </div>

    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em]">
        Nitip apa aja,<br/><span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">dari mana aja.</span>
      </h2>
      <p class="text-slate-500 max-w-xs leading-relaxed">
        Pesan dari restoran, warung, toko, kampus, rumah, atau titik custom manapun di Indramayu.
      </p>
    </div>
  </div>

  <div id="hscroll-outer" class="relative pl-6 md:pl-[calc((100vw-72rem)/2+1.5rem)] overflow-hidden">
    <div id="hscroll-track" class="horizontal-track flex gap-6">
      ${Un.map(i=>`
      <article class="flex-shrink-0 w-72 md:w-80 bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group cursor-pointer"
               style="border: 2px solid #E2E8F0;"
               onmouseover="this.style.borderColor='#A7F3D0'"
               onmouseout="this.style.borderColor='#E2E8F0'">
        <div class="mb-5 grid h-36 w-full place-items-center overflow-hidden rounded-2xl transition-all duration-500"
             style="background: linear-gradient(135deg, #ECFDF5, #A7F3D0);"
             onmouseover="this.style.background='linear-gradient(135deg,#059669,#10B981)'"
             onmouseout="this.style.background='linear-gradient(135deg,#ECFDF5,#A7F3D0)'">
          ${lt(i.image,i.title,"h-28 w-28 object-contain rounded-xl bg-white p-2 group-hover:scale-110 transition-transform duration-500")}
        </div>
        <h4 class="font-black text-slate-900 text-lg mb-2 transition-colors group-hover:text-emerald-600">${i.title}</h4>
        <p class="text-slate-500 text-sm leading-relaxed">${i.subtitle}</p>
      </article>`).join("")}
    </div>
  </div>
</section>`}function lo(){return`
<section id="features" class="py-24" style="background: linear-gradient(to bottom, #ffffff, #F8FAFC);">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
        <span class="ml-2">Fitur Unggulan</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mt-4">
        Didesain untuk<br/>kenyamanan <span style="color: #10B981;">kamu</span>
      </h2>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      ${qn.map((i,e)=>`
      <article class="feature-card bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-500 group cursor-pointer hover:-translate-y-1 reveal-card"
               style="--delay: ${e*.1}s; border: 1px solid #E2E8F0;"
               onmouseover="this.style.borderColor='#A7F3D0'"
               onmouseout="this.style.borderColor='#E2E8F0'">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110"
             style="background: linear-gradient(135deg, #ECFDF5, #A7F3D0);"
             onmouseover="this.style.background='linear-gradient(135deg,#059669,#10B981)'"
             onmouseout="this.style.background='linear-gradient(135deg,#ECFDF5,#A7F3D0)'">
          ${i.icon}
        </div>
        <h4 class="font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">${i.title}</h4>
        <p class="text-slate-500 text-sm leading-relaxed">${i.description}</p>
      </article>`).join("")}
    </div>
  </div>
</section>`}function co(i){return`
<div class="phone-mockup relative">
  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 rounded-b-xl z-10" style="background: #0F172A;"></div>
  <div class="phone-screen bg-white h-full overflow-hidden">
    ${i}
  </div>
</div>`}function uo(){const i=(e,n,t,r,o)=>`
    <div class="app-phone absolute transition-all duration-500 hover:z-50" style="transform: ${r} scale(${t}); z-index: ${o};">
      ${co(`
        <div class="h-full flex flex-col items-center justify-center gap-4 px-5" style="background: linear-gradient(180deg, #ECFDF5, #ffffff);">
          <div class="grid h-32 w-32 place-items-center overflow-hidden rounded-2xl shadow-xl"
               style="background: linear-gradient(135deg, #A7F3D0, #ECFDF5); border: 2px solid #A7F3D0;">
            ${lt(n,e,"h-24 w-24 object-contain rounded-xl bg-white p-2")}
          </div>
          <div class="text-slate-800 font-black text-base">${e}</div>
          <div class="flex gap-2">
            <div class="w-2 h-2 rounded-full animate-pulse" style="background: #10B981;"></div>
            <div class="w-2 h-2 rounded-full" style="background: #A7F3D0;"></div>
            <div class="w-2 h-2 rounded-full" style="background: #BBF7D0;"></div>
          </div>
          <div class="mt-4 w-full">
            <div class="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full w-2/3 rounded-full" style="background: linear-gradient(90deg, #059669, #10B981);"></div>
            </div>
          </div>
        </div>
      `)}
    </div>`;return`
<section id="app-preview" class="py-24 bg-white overflow-hidden">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-20">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
        <span class="ml-2">Aplikasi</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mt-4">
        Simpel dari genggaman,<br/><span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">kuat dalam layanan.</span>
      </h2>
    </div>

    <div class="relative flex justify-center items-center" style="height: 560px;">
      ${i("Pol-Send",De.polsendPackaging,"0.85","translateX(-200px) rotate(-12deg)","1")}
      ${i("Pol-Ride",De.polrideMini,"1.1","translateX(0) translateY(-20px)","3")}
      ${i("Nitip Apa Aja",De.nitipBowl,"0.85","translateX(200px) rotate(12deg)","1")}
      <div class="absolute w-96 h-96 rounded-full opacity-30 blur-3xl bottom-0 pointer-events-none"
           style="background: radial-gradient(circle, rgba(16,185,129,0.25), rgba(5,150,105,0.1));"></div>
    </div>
  </div>
</section>`}function po(){return`
<section id="download" class="relative py-24 overflow-hidden" style="background: linear-gradient(135deg, #0F172A 0%, #064E3B 60%, #022c22 100%);">
  <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 50% -10%, rgba(16,185,129,0.2), transparent 50%);"></div>
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse" style="background: #10B981;"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse" style="background: #059669; animation-delay: 1s;"></div>
  </div>
  <div class="absolute inset-0 pointer-events-none opacity-[0.04]"
       style="background-image: linear-gradient(rgba(167,243,208,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(167,243,208,0.4) 1px, transparent 1px); background-size: 56px 56px;"></div>

  <div class="relative max-w-4xl mx-auto px-6 text-center">
    <div class="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-widest mb-6" style="color: #A7F3D0;">
      <span class="w-2 h-2 rounded-full animate-ping" style="background: #10B981;"></span>
      <span>Download Sekarang</span>
    </div>

    <h2 class="text-4xl md:text-6xl font-black text-white tracking-[-0.06em] mb-6">
      Gerak lebih simpel<br/><span style="background: linear-gradient(135deg, #10B981, #34D399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">bersama Sipolin.</span>
    </h2>

    <p class="text-lg max-w-md mx-auto mb-10 leading-relaxed" style="color: #94A3B8;">
      Satu aplikasi untuk mobilitas, pengiriman, dan kebutuhan harian warga Indramayu.
    </p>

    <div class="flex flex-col sm:flex-row gap-5 justify-center">
      <a
        href="${An}"
        data-download-link
        class="group bg-white text-slate-900 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3 hover:scale-105"
        aria-label="Download Sipolin di Google Play"
        target="_blank"
      >
        <svg viewBox="0 0 48 48" class="h-8 w-8" aria-hidden="true">
          <path fill="#34A853" d="M7.6 4.7c-.7.8-1.1 2-1.1 3.4v31.8c0 1.4.4 2.6 1.1 3.4L25.8 24 7.6 4.7z"/>
          <path fill="#4285F4" d="M31.7 17.8 25.8 24 7.6 4.7c.9-.9 2.3-1 3.8-.2l20.3 13.3z"/>
          <path fill="#FBBC05" d="M31.7 30.2 25.8 24l5.9-6.2 7.2 4.7c2.1 1.4 2.1 3.6 0 5l-7.2 4.7z"/>
          <path fill="#EA4335" d="M7.6 43.3 25.8 24l5.9 6.2-20.3 13.3c-1.5.8-2.9.7-3.8-.2z"/>
        </svg>

        <div class="text-left leading-none">
          <div class="text-[10px] font-bold text-slate-500 mb-1">GET IT ON</div>
          <div class="text-base font-black tracking-tight">Google Play</div>
        </div>
      </a>

      <a
        href="${Kn}"
        data-download-link
        class="group px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3 hover:scale-105"
        style="background: linear-gradient(135deg, #059669, #10B981); color: white; box-shadow: 0 16px 48px rgba(16,185,129,0.3);"
        aria-label="Download Sipolin di App Store"
        target="_blank"
      >
        <svg viewBox="0 0 24 24" class="h-8 w-8 fill-white" aria-hidden="true">
          <path d="M17.05 12.56c-.03-3.01 2.46-4.45 2.57-4.52-1.4-2.05-3.58-2.33-4.36-2.36-1.85-.19-3.61 1.09-4.55 1.09-.94 0-2.39-1.06-3.93-1.03-2.02.03-3.88 1.17-4.92 2.98-2.1 3.64-.54 9.03 1.51 11.98 1 1.45 2.2 3.08 3.77 3.02 1.51-.06 2.08-.98 3.91-.98 1.82 0 2.34.98 3.94.95 1.63-.03 2.66-1.48 3.65-2.93 1.15-1.68 1.62-3.31 1.65-3.39-.04-.02-3.17-1.22-3.24-4.81z"/>
          <path d="M14.05 3.72c.83-1 1.39-2.39 1.24-3.78-1.2.05-2.66.8-3.52 1.8-.77.89-1.44 2.31-1.26 3.67 1.34.1 2.71-.68 3.54-1.69z"/>
        </svg>

        <div class="text-left leading-none">
          <div class="text-[10px] font-bold mb-1" style="color: #A7F3D0;">DOWNLOAD ON THE</div>
          <div class="text-base font-black tracking-tight">App Store</div>
        </div>
      </a>
    </div>

    <div class="mt-12 text-sm" style="color: #64748B;">
      Tersedia untuk Android dan iOS
    </div>
  </div>
</section>`}function fo(){return`
<footer id="about" class="py-16" style="background: #0F172A; border-top: 1px solid rgba(16,185,129,0.12);">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid md:grid-cols-4 gap-10 mb-12">
      <div class="md:col-span-1">
        <a href="/" class="flex items-center gap-3 font-black text-xl text-white mb-3">
          <span class="grid h-11 w-11 place-items-center rounded-2xl shadow-lg overflow-hidden"
                style="background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 8px 24px rgba(16,185,129,0.3);">
            ${lt(De.logo,"Logo Sipolin","h-8 w-8 object-contain")}
          </span>
          <span style="background: linear-gradient(135deg, #10B981, #34D399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Sipolin</span>
        </a>

        <p class="text-sm leading-relaxed" style="color: #64748B;">
          Layanan on-demand lokal untuk warga Indramayu, Indonesia.
        </p>

        <div class="flex gap-3 mt-6">
          <a
            href="#"
            class="social-btn social-facebook"
            aria-label="Facebook Sipolin"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white" aria-hidden="true">
              <path d="M14.2 8.5V6.7c0-.8.5-1.1 1.2-1.1h1.8V2.4c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v1.4H6.6V12h3.1v9.7h3.8V12h3l.5-3.5h-2.8z"/>
            </svg>
          </a>

          <a
            href="#"
            class="social-btn social-instagram"
            aria-label="Instagram Sipolin"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" stroke="white" stroke-width="2"/>
              <circle cx="17.5" cy="6.5" r="1.3" fill="white"/>
            </svg>
          </a>

          <a
            href="#"
            class="social-btn social-tiktok"
            aria-label="TikTok Sipolin"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white" aria-hidden="true">
              <path d="M16.6 2.5c.4 2.5 1.8 4.2 4.1 4.5v3.3c-1.4.1-2.7-.3-4-1.1v5.9c0 4-2.7 6.4-6.3 6.4-3.3 0-5.9-2.3-5.9-5.5 0-3.5 2.8-5.8 6.5-5.4v3.5c-1.8-.3-3 .6-3 1.9 0 1.2 1 2 2.3 2 1.4 0 2.4-.8 2.4-2.8V2.5h3.9z"/>
            </svg>
          </a>
        </div>
      </div>

      <div>
        <h5 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Aplikasi</h5>
        <ul class="space-y-2">
          ${["Pol-Ride","Pol-Send","Nitip Apa Aja","Routes"].map(i=>`<li><a href="#" class="text-sm transition-colors hover:translate-x-1 inline-block" style="color: #64748B;" onmouseover="this.style.color='#10B981'" onmouseout="this.style.color='#64748B'">${i}</a></li>`).join("")}
        </ul>
      </div>

      <div>
        <h5 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Perusahaan</h5>
        <ul class="space-y-2">
          ${["Tentang Kami","Blog","Karir","Press"].map(i=>`<li><a href="#" class="text-sm transition-colors hover:translate-x-1 inline-block" style="color: #64748B;" onmouseover="this.style.color='#10B981'" onmouseout="this.style.color='#64748B'">${i}</a></li>`).join("")}
        </ul>
      </div>

      <div>
        <h5 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Support</h5>
        <ul class="space-y-2">
          ${["Bantuan","Kontak","Kebijakan Privasi","Syarat & Ketentuan"].map(i=>`<li><a href="#" class="text-sm transition-colors hover:translate-x-1 inline-block" style="color: #64748B;" onmouseover="this.style.color='#10B981'" onmouseout="this.style.color='#64748B'">${i}</a></li>`).join("")}
        </ul>
      </div>
    </div>

    <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style="border-top: 1px solid rgba(255,255,255,0.06);">
      <p class="text-sm" style="color: #475569;">© ${new Date().getFullYear()} Sipolin. Hak cipta dilindungi.</p>
      <p class="text-xs" style="color: #334155;">Digawe ning Indramayu, Indonesia</p>
    </div>
  </div>
</footer>`}function go(){const i=document.getElementById("app");i&&(i.innerHTML=`
    ${Zn()}
    ${Qn()}
    <div id="cursor-glow" class="cursor-glow" aria-hidden="true"></div>
    ${eo()}
    <main>
      ${ro()}
      ${io()}
      ${no()}
      ${oo()}
      ${ao()}
      ${so()}
      ${lo()}
      ${uo()}
      ${po()}
    </main>
    ${fo()}
  `)}function ho(){const i=document.getElementById("page-loader");if(!i)return;const e=()=>{if(Et()){i.style.display="none";return}W.to(i,{opacity:0,duration:.5,ease:"power2.inOut",delay:.6,onComplete:()=>{i.style.display="none"}})};document.readyState==="complete"?e():(window.addEventListener("load",e,{once:!0}),setTimeout(e,3e3))}function vo(){if(fr()||Et())return;const i=document.getElementById("cursor-glow");if(!i)return;let e=0,n=0;document.addEventListener("mousemove",t=>{e=t.clientX,n=t.clientY,W.to(i,{x:e,y:n,duration:.6,ease:"power2.out"})}),document.addEventListener("mouseleave",()=>{W.to(i,{opacity:0,duration:.3})}),document.addEventListener("mouseenter",()=>{W.to(i,{opacity:1,duration:.3})})}function mo(){const i=document.getElementById("download-modal-backdrop"),e=document.getElementById("download-modal-close"),n=document.getElementById("download-modal-ok");if(!i)return;const t=()=>{i.classList.add("is-open")},r=()=>{i.classList.remove("is-open")};document.querySelectorAll("[data-download-link]").forEach(o=>{o.addEventListener("click",l=>{const s=o.getAttribute("href")||"";s!=="#download"&&(Jn(s)||(l.preventDefault(),t()))})}),e==null||e.addEventListener("click",r),n==null||n.addEventListener("click",r),i.addEventListener("click",o=>{o.target===i&&r()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&r()})}function xo(){const i=document.getElementById("navbar");if(!i)return;const e=document.getElementById("menu-toggle"),n=document.getElementById("mobile-menu");window.addEventListener("scroll",()=>{window.scrollY>20?i.classList.add("scrolled"):i.classList.remove("scrolled")},{passive:!0}),e==null||e.addEventListener("click",()=>{!(n!=null&&n.classList.contains("hidden"))?(n==null||n.classList.add("hidden"),e.classList.remove("is-open"),e.setAttribute("aria-expanded","false")):(n==null||n.classList.remove("hidden"),e.classList.add("is-open"),e.setAttribute("aria-expanded","true"))}),n==null||n.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>{n.classList.add("hidden"),e==null||e.classList.remove("is-open"),e==null||e.setAttribute("aria-expanded","false")})})}function bo(){Et()||fr()||document.querySelectorAll(".magnetic-btn").forEach(i=>{i.addEventListener("mousemove",e=>{const n=i.getBoundingClientRect(),t=e.clientX-n.left-n.width/2,r=e.clientY-n.top-n.height/2;W.to(i,{x:t*.2,y:r*.2,duration:.4,ease:"power2.out"})}),i.addEventListener("mouseleave",()=>{W.to(i,{x:0,y:0,duration:.6,ease:"elastic.out(1, 0.5)"})})})}function wo(){if(Et())return;W.set(".hero-line-1, .hero-line-2, .hero-line-3, .hero-line-4",{yPercent:110}),W.timeline({defaults:{ease:en.ease,duration:en.duration}}).from(".hero-label",{opacity:0,y:20,duration:.6}).to(".hero-line-1, .hero-line-2, .hero-line-3, .hero-line-4",{yPercent:0,stagger:.08,duration:1.05},"-=0.2").from(".hero-desc",{opacity:0,y:30,duration:.7},"-=0.55").from(".hero-cta",{opacity:0,y:20,duration:.6},"-=0.5").from(".hero-trust",{opacity:0,y:20,duration:.6},"-=0.4").from(".hero-visual-card",{opacity:0,x:48,scale:.94,duration:1},"-=1").from(".floating-status, .floating-rating",{opacity:0,y:24,stagger:.12},"-=0.5")}function ko(){Et()||fr()||W.to(".hero-rider-img",{y:-15,ease:"none",scrollTrigger:{trigger:"#hero",start:"top top",end:"bottom top",scrub:1.2}})}function yo(){Et()||(W.utils.toArray(".reveal-card").forEach(i=>{const e=parseFloat(i.style.getPropertyValue("--delay")||"0");W.from(i,{opacity:0,y:60,duration:.9,delay:e,ease:"power3.out",scrollTrigger:{trigger:i,start:"top 85%",once:!0}})}),W.utils.toArray(".hiw-step").forEach(i=>{W.from(i,{opacity:0,x:-50,duration:.8,ease:"power3.out",scrollTrigger:{trigger:i,start:"top 80%",once:!0}})}),W.utils.toArray(".feature-card").forEach((i,e)=>{W.from(i,{opacity:0,y:50,duration:.8,delay:e*.1,ease:"power3.out",scrollTrigger:{trigger:i,start:"top 85%",once:!0}})}),W.utils.toArray(".fade-right").forEach(i=>{W.from(i,{opacity:0,x:-60,duration:.8,ease:"power3.out",scrollTrigger:{trigger:i,start:"top 80%",once:!0}})}),W.utils.toArray(".fade-left").forEach(i=>{W.from(i,{opacity:0,x:60,duration:.8,ease:"power3.out",scrollTrigger:{trigger:i,start:"top 80%",once:!0}})}))}function _o(){if(fr()||Et())return;const i=document.querySelectorAll(".stack-card-item");i.forEach((e,n)=>{e.classList.add("stack-card"),n<i.length-1&&W.to(e,{scale:.96,transformOrigin:"top center",ease:"none",scrollTrigger:{trigger:i[n+1],start:"top 140px",end:"top 80px",scrub:!0}})})}function So(){const i=document.getElementById("hscroll-track"),e=document.getElementById("hscroll-outer");if(!i||!e)return;if(fr()||Et()){i.classList.remove("horizontal-track"),i.style.flexWrap="wrap",i.style.width="auto",i.style.justifyContent="center";return}const n=()=>{const t=i.scrollWidth-window.innerWidth+120;return Math.max(t,0)};W.to(i,{x:()=>-n(),ease:"none",scrollTrigger:{trigger:e,start:"top center",end:()=>`+=${n()}`,scrub:1.2,pin:!0,anticipatePin:1,invalidateOnRefresh:!0}})}function Eo(){if(Et()||fr())return;document.querySelectorAll(".app-phone").forEach((e,n)=>{const t=n===0?-1:n===2?1:0,r=n===1?-40:-20;W.to(e,{y:r,x:t*15,rotation:n===0?-2:n===2?2:0,ease:"none",scrollTrigger:{trigger:"#app-preview",start:"top bottom",end:"bottom top",scrub:1.5}})})}function Co(){document.querySelectorAll('a[href^="#"]').forEach(i=>{i.addEventListener("click",e=>{const n=i.getAttribute("href");if(!n||n==="#")return;const t=document.querySelector(n);if(t){e.preventDefault();const r=t.getBoundingClientRect().top+window.scrollY-80;window.scrollTo({top:r,behavior:"smooth"})}})})}function Do(){const i=document.createElement("style");i.textContent=`
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .animate-marquee {
      animation: marquee 20s linear infinite;
    }

    .delay-1000 {
      animation-delay: 1s;
    }

    .hover-lift {
      transition: all 0.3s ease;
    }

    .hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(16,185,129,0.12);
    }

    /* Smooth hero trust stat hover */
    .hero-trust > div:hover > div:first-child {
      color: #10B981 !important;
    }

    /* Feature icon color fix on hover */
    .feature-card:hover svg {
      stroke: white;
    }
  `,document.head.appendChild(i)}function Ao(){go(),ho(),xo(),Co(),Do(),vo(),mo(),requestAnimationFrame(()=>{wo(),ko(),bo(),yo(),_o(),So(),Eo(),M.refresh()})}document.addEventListener("DOMContentLoaded",Ao);
