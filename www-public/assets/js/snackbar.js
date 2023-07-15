function SnackBar(e){var t,s,n,a,i,c,r,o,l,d,p,u,m,f=this;function b(){switch(_Options.position){case"bl":return"js-snackbar-container--bottom-left";case"tl":return"js-snackbar-container--top-left";case"tr":return"js-snackbar-container--top-right";case"tc":case"tm":return"js-snackbar-container--top-center";case"bc":case"bm":return"js-snackbar-container--bottom-center";default:return"js-snackbar-container--bottom-right"}}this.Open=function(){var e=function e(){let t=window.getComputedStyle(m);return u.scrollHeight+parseFloat(t.getPropertyValue("padding-top"))+parseFloat(t.getPropertyValue("padding-bottom"))}();d.style.height=e+"px",d.style.opacity=1,d.style.marginTop="5px",d.style.marginBottom="5px",d.addEventListener("transitioned",function(){d.removeEventListener("transitioned",arguments.callee),d.style.height=null})},this.Close=function(){l&&clearInterval(l);var e=d.scrollHeight,t=d.style.transition;d.style.transition="",requestAnimationFrame(function(){d.style.height=e+"px",d.style.opacity=1,d.style.marginTop="0px",d.style.marginBottom="0px",d.style.transition=t,requestAnimationFrame(function(){d.style.height="0px",d.style.opacity=0})}),setTimeout(function(){p.removeChild(d)},1e3)},_Options={message:e?.message??"Operation performed successfully.",dismissible:e?.dismissible??!0,timeout:e?.timeout??5e3,status:e?.status?e.status.toLowerCase().trim():"",actions:e?.actions??[],fixed:e?.fixed??!1,position:e?.position??"br",container:e?.container??document.body,width:e?.width,speed:e?.speed,icon:e?.icon},void 0===(t="object"==typeof _Options.container?_Options.container:document.getElementById(_Options.container))&&(console.warn("SnackBar: Could not find target container "+_Options.container),t=document.body),p=function e(t){for(var s,n,a=b(),i=0;i<t.children.length;i++)if(1===(n=t.children.item(i)).nodeType&&n.classList.length>0&&n.classList.contains("js-snackbar-container")&&n.classList.contains(a))return n;return s=t,(container=document.createElement("div")).classList.add("js-snackbar-container"),_Options.fixed&&container.classList.add("js-snackbar-container--fixed"),s.appendChild(container),container}(t),p.classList.add(b()),s="js-snackbar-container--fixed",_Options.fixed?p.classList.add(s):p.classList.remove(s),d=(r=(n=document.createElement("div"),n.classList.add("js-snackbar__wrapper"),n.style.height="0px",n.style.opacity="0",n.style.marginTop="0px",n.style.marginBottom="0px",a=n,_Options.width&&(a.style.width=_Options.width),function e(t){let{speed:s}=_Options;switch(typeof s){case"number":t.style.transitionDuration=s+"ms";break;case"string":t.style.transitionDuration=s}}(n),n),o=(i=document.createElement("div"),i.classList.add("js-snackbar","js-snackbar--show"),function e(t){if(_Options.status){var s=document.createElement("span");s.classList.add("js-snackbar__status"),function e(t){switch(_Options.status){case"success":case"green":t.classList.add("js-snackbar--success");break;case"warning":case"alert":case"orange":t.classList.add("js-snackbar--warning");break;case"danger":case"error":case"red":t.classList.add("js-snackbar--danger");break;default:t.classList.add("js-snackbar--info")}}(s),function e(t){if(_Options.icon){var s=document.createElement("span");switch(s.classList.add("js-snackbar__icon"),_Options.icon){case"exclamation":case"warn":case"danger":s.innerText="!";break;case"info":case"question":case"question-mark":s.innerText="?";break;case"plus":case"add":s.innerText="+";break;default:_Options.icon.length>1&&console.warn("Invalid icon character provided: ",_Options.icon),s.innerText=_Options.icon.substr(0,1)}t.appendChild(s)}}(s),t.appendChild(s)}}(i),c=i,(m=document.createElement("div")).classList.add("js-snackbar__message-wrapper"),(u=document.createElement("span")).classList.add("js-snackbar__message"),u.innerHTML=_Options.message,m.appendChild(u),c.appendChild(m),function e(t){if("object"==typeof _Options.actions)for(var s=0;s<_Options.actions.length;s++)n(t,_Options.actions[s]);function n(e,t){var s=document.createElement("span");s.classList.add("js-snackbar__action"),s.textContent=t.text,"function"==typeof t.function?!0===t.dismiss?s.onclick=function(){t.function(),f.Close()}:s.onclick=t.function:s.onclick=f.Close,e.appendChild(s)}}(i),function e(t){if(_Options.dismissible){var s=document.createElement("span");s.classList.add("js-snackbar__close"),s.innerText="\xd7",s.onclick=f.Close,t.appendChild(s)}}(i),i),r.appendChild(o),r),p.appendChild(d),!1!==_Options.timeout&&_Options.timeout>0&&(l=setTimeout(f.Close,_Options.timeout)),f.Open()}