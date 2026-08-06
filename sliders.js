/* ===== DESIGN PROJECTS slider logic (from original site) ===== */

function prjNav(btn,dir){
  var pages=btn.closest('.prjSide').querySelectorAll('.prjPg'),cur,idx=-1;
  pages.forEach(function(p,i){if(p.classList.contains('active')){cur=p;idx=i}});
  var next=(idx+dir+pages.length)%pages.length;
  if(next===idx)return;
  var nxt=pages[next];
  nxt.classList.add(dir>0?'prjL':'prjR');
  void nxt.offsetWidth;
  cur.classList.remove('active');
  cur.classList.add(dir>0?'prjR':'prjL');
  nxt.classList.remove(dir>0?'prjL':'prjR');
  nxt.classList.add('active');
  setTimeout(function(){cur.classList.remove('prjL','prjR')},500);
}


/* ===== VIDEO PRODUCTION slider logic (from original site) ===== */

(function(){
function filmCurrentX(track){
  var st=getComputedStyle(track).transform;
  if(!st||st==='none')return 0;
  var m=st.match(/matrix\(([^)]+)\)/);
  if(!m)return 0;
  var parts=m[1].split(',');
  return parseFloat(parts[4])||0;
}
function filmBuildDots(wrap,real){
  var dotsWrap=wrap.querySelector('.vidDots');
  if(!dotsWrap)return;
  dotsWrap.innerHTML='';
  for(var i=0;i<real;i++){
    var d=document.createElement('span');
    d.className='vidDot'+(i===0?' active':'');
    d.setAttribute('aria-label','Slide '+(i+1));
    d.setAttribute('data-i',i);
    d.addEventListener('click',(function(idx){return function(e){filmDot(e.currentTarget,idx)}})(i));
    dotsWrap.appendChild(d);
  }
}
function filmUpdateDots(wrap,idx){
  var n=parseInt(wrap.getAttribute('data-n')||'0');
  var clones=parseInt(wrap.getAttribute('data-clones')||'0');
  if(!n)return;
  var dots=wrap.querySelectorAll('.vidDot');
  var real=((idx-clones)%n+n)%n;
  for(var i=0;i<dots.length;i++){dots[i].classList.toggle('active',i===real)}
}
function filmGoTo(wrap,idx,animate){
  var track=wrap.querySelector('.vidTrkIn');
  var trackO=wrap.querySelector('.vidTrk');
  var child=track.children[idx];
  if(!child)return;
  if(animate===false){track.style.transition='none'}
  var trackRect=trackO.getBoundingClientRect();
  var childRect=child.getBoundingClientRect();
  var current=filmCurrentX(track);
  var newX=current-(childRect.left-trackRect.left);
  track.style.transform='translateX('+newX+'px)';
  if(animate===false){void track.offsetWidth;track.style.transition=''}
  wrap.setAttribute('data-idx',idx);
  filmUpdateDots(wrap,idx);
}
function filmInit(wrap){
  if(wrap.getAttribute('data-init'))return;
  var track=wrap.querySelector('.vidTrkIn');
  var reals=Array.prototype.slice.call(track.children);
  var real=reals.length;
  wrap.setAttribute('data-n',real);
  wrap.setAttribute('data-init','1');
  filmBuildDots(wrap,real);
  if(real<2){wrap.setAttribute('data-idx','0');wrap.setAttribute('data-clones','0');return}
  /* Clone enough cards on each side to cover however many are visible at once (up to 3
     on desktop), so wrapping around never runs the strip out of cards to show. */
  var cloneCount=Math.min(2,real-1);
  wrap.setAttribute('data-clones',cloneCount);
  var leadFrag=document.createDocumentFragment();
  for(var i=real-cloneCount;i<real;i++){
    var c=reals[i].cloneNode(true);
    c.setAttribute('aria-hidden','true');
    leadFrag.appendChild(c);
  }
  track.insertBefore(leadFrag,track.firstChild);
  var trailFrag=document.createDocumentFragment();
  for(var j=0;j<cloneCount;j++){
    var c2=reals[j].cloneNode(true);
    c2.setAttribute('aria-hidden','true');
    trailFrag.appendChild(c2);
  }
  track.appendChild(trailFrag);
  filmGoTo(wrap,cloneCount,false);
}
function filmStep(wrap,dir){
  var n=parseInt(wrap.getAttribute('data-n'));
  if(n<2)return;
  var clones=parseInt(wrap.getAttribute('data-clones')||'0');
  var idx=parseInt(wrap.getAttribute('data-idx')||String(clones))+dir;
  var track=wrap.querySelector('.vidTrkIn');
  filmGoTo(wrap,idx,true);
  var onEnd=function(e){
    if(e&&e.propertyName&&e.propertyName!=='transform')return;
    track.removeEventListener('transitionend',onEnd);
    if(idx<=clones-1){filmGoTo(wrap,idx+n,false)}
    else if(idx>=clones+n){filmGoTo(wrap,idx-n,false)}
  };
  track.addEventListener('transitionend',onEnd);
}
function filmNav(btn,dir){
  var wrap=btn.closest('.filmSld');
  filmInit(wrap);
  filmStep(wrap,dir);
}
function filmDot(btn,realIdx){
  var wrap=btn.closest('.filmSld');
  filmInit(wrap);
  var clones=parseInt(wrap.getAttribute('data-clones')||'0');
  filmGoTo(wrap,realIdx+clones,true);
}
window.filmNav=filmNav;
window.filmDot=filmDot;
function filmBindDrag(wrap){
  var track=wrap.querySelector('.vidTrkIn');
  var trackO=wrap.querySelector('.vidTrk');
  var startX=0,startY=0,startTX=0,dragging=false,locked=null,moved=false,pid=null;
  track.addEventListener('pointerdown',function(e){
    if(e.button!==undefined&&e.button!==0)return;
    filmInit(wrap);
    dragging=true;moved=false;locked=null;pid=e.pointerId;
    startX=e.clientX;startY=e.clientY;
    startTX=filmCurrentX(track);
    track.style.transition='none';
  });
  window.addEventListener('pointermove',function(e){
    if(!dragging||e.pointerId!==pid)return;
    var dx=e.clientX-startX,dy=e.clientY-startY;
    if(locked===null){
      if(Math.abs(dx)<6&&Math.abs(dy)<6)return;
      locked=Math.abs(dx)>Math.abs(dy)?'x':'y';
      if(locked==='x'){track.classList.add('dragging')}
    }
    if(locked==='y')return;
    e.preventDefault();
    moved=true;
    track.style.transform='translateX('+(startTX+dx)+'px)';
  });
  function finish(e){
    if(!dragging||(e.pointerId!==undefined&&e.pointerId!==pid))return;
    dragging=false;
    track.style.transition='';
    track.classList.remove('dragging');
    var wasX=locked==='x'&&moved;
    locked=null;
    if(!wasX)return;
    var dx=(e.clientX||startX)-startX;
    var threshold=Math.max(40,trackO.getBoundingClientRect().width*0.12);
    var idx=parseInt(wrap.getAttribute('data-idx')||wrap.getAttribute('data-clones')||'1');
    if(dx<=-threshold){filmStep(wrap,1)}
    else if(dx>=threshold){filmStep(wrap,-1)}
    else{filmGoTo(wrap,idx,true)}
  }
  window.addEventListener('pointerup',finish);
  window.addEventListener('pointercancel',finish);
}
function filmReady(){
  var wraps=document.querySelectorAll('.filmSld');
  for(var i=0;i<wraps.length;i++){filmInit(wraps[i]);filmBindDrag(wraps[i])}
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',filmReady)}else{filmReady()}
})();


/* ===== SHORT FORM slider logic (from original site) ===== */

(function(){
function shortCurrentX(track){
  var st=getComputedStyle(track).transform;
  if(!st||st==='none')return 0;
  var m=st.match(/matrix\(([^)]+)\)/);
  if(!m)return 0;
  var parts=m[1].split(',');
  return parseFloat(parts[4])||0;
}
function shortBuildDots(wrap,real){
  var dotsWrap=wrap.querySelector('.vidDots');
  if(!dotsWrap)return;
  dotsWrap.innerHTML='';
  for(var i=0;i<real;i++){
    var d=document.createElement('span');
    d.className='vidDot'+(i===0?' active':'');
    d.setAttribute('aria-label','Slide '+(i+1));
    d.setAttribute('data-i',i);
    d.addEventListener('click',(function(idx){return function(e){shortDot(e.currentTarget,idx)}})(i));
    dotsWrap.appendChild(d);
  }
}
function shortUpdateDots(wrap,idx){
  var n=parseInt(wrap.getAttribute('data-n')||'0');
  var clones=parseInt(wrap.getAttribute('data-clones')||'0');
  if(!n)return;
  var dots=wrap.querySelectorAll('.vidDot');
  var real=((idx-clones)%n+n)%n;
  for(var i=0;i<dots.length;i++){dots[i].classList.toggle('active',i===real)}
}
function shortGoTo(wrap,idx,animate){
  var track=wrap.querySelector('.vidTrkIn');
  var trackO=wrap.querySelector('.vidTrk');
  var child=track.children[idx];
  if(!child)return;
  if(animate===false){track.style.transition='none'}
  var trackRect=trackO.getBoundingClientRect();
  var childRect=child.getBoundingClientRect();
  var current=shortCurrentX(track);
  var newX=current-(childRect.left-trackRect.left);
  track.style.transform='translateX('+newX+'px)';
  if(animate===false){void track.offsetWidth;track.style.transition=''}
  wrap.setAttribute('data-idx',idx);
  shortUpdateDots(wrap,idx);
}
function shortInit(wrap){
  if(wrap.getAttribute('data-init'))return;
  var track=wrap.querySelector('.vidTrkIn');
  var reals=Array.prototype.slice.call(track.children);
  var real=reals.length;
  wrap.setAttribute('data-n',real);
  wrap.setAttribute('data-init','1');
  shortBuildDots(wrap,real);
  if(real<2){wrap.setAttribute('data-idx','0');wrap.setAttribute('data-clones','0');return}
  /* Clone enough cards on each side to cover however many are visible at once (up to 3
     on desktop), so wrapping around never runs the strip out of cards to show. */
  var cloneCount=Math.min(2,real-1);
  wrap.setAttribute('data-clones',cloneCount);
  var leadFrag=document.createDocumentFragment();
  for(var i=real-cloneCount;i<real;i++){
    var c=reals[i].cloneNode(true);
    c.setAttribute('aria-hidden','true');
    leadFrag.appendChild(c);
  }
  track.insertBefore(leadFrag,track.firstChild);
  var trailFrag=document.createDocumentFragment();
  for(var j=0;j<cloneCount;j++){
    var c2=reals[j].cloneNode(true);
    c2.setAttribute('aria-hidden','true');
    trailFrag.appendChild(c2);
  }
  track.appendChild(trailFrag);
  shortGoTo(wrap,cloneCount,false);
}
function shortStep(wrap,dir){
  var n=parseInt(wrap.getAttribute('data-n'));
  if(n<2)return;
  var clones=parseInt(wrap.getAttribute('data-clones')||'0');
  var idx=parseInt(wrap.getAttribute('data-idx')||String(clones))+dir;
  var track=wrap.querySelector('.vidTrkIn');
  shortGoTo(wrap,idx,true);
  var onEnd=function(e){
    if(e&&e.propertyName&&e.propertyName!=='transform')return;
    track.removeEventListener('transitionend',onEnd);
    if(idx<=clones-1){shortGoTo(wrap,idx+n,false)}
    else if(idx>=clones+n){shortGoTo(wrap,idx-n,false)}
  };
  track.addEventListener('transitionend',onEnd);
}
function shortNav(btn,dir){
  var wrap=btn.closest('.shortSld');
  shortInit(wrap);
  shortStep(wrap,dir);
}
function shortDot(btn,realIdx){
  var wrap=btn.closest('.shortSld');
  shortInit(wrap);
  var clones=parseInt(wrap.getAttribute('data-clones')||'0');
  shortGoTo(wrap,realIdx+clones,true);
}
window.shortNav=shortNav;
window.shortDot=shortDot;
function shortBindDrag(wrap){
  var track=wrap.querySelector('.vidTrkIn');
  var trackO=wrap.querySelector('.vidTrk');
  var startX=0,startY=0,startTX=0,dragging=false,locked=null,moved=false,pid=null;
  track.addEventListener('pointerdown',function(e){
    if(e.button!==undefined&&e.button!==0)return;
    shortInit(wrap);
    dragging=true;moved=false;locked=null;pid=e.pointerId;
    startX=e.clientX;startY=e.clientY;
    startTX=shortCurrentX(track);
    track.style.transition='none';
  });
  window.addEventListener('pointermove',function(e){
    if(!dragging||e.pointerId!==pid)return;
    var dx=e.clientX-startX,dy=e.clientY-startY;
    if(locked===null){
      if(Math.abs(dx)<6&&Math.abs(dy)<6)return;
      locked=Math.abs(dx)>Math.abs(dy)?'x':'y';
      if(locked==='x'){track.classList.add('dragging')}
    }
    if(locked==='y')return;
    e.preventDefault();
    moved=true;
    track.style.transform='translateX('+(startTX+dx)+'px)';
  });
  function finish(e){
    if(!dragging||(e.pointerId!==undefined&&e.pointerId!==pid))return;
    dragging=false;
    track.style.transition='';
    track.classList.remove('dragging');
    var wasX=locked==='x'&&moved;
    locked=null;
    if(!wasX)return;
    var dx=(e.clientX||startX)-startX;
    var threshold=Math.max(40,trackO.getBoundingClientRect().width*0.12);
    var idx=parseInt(wrap.getAttribute('data-idx')||wrap.getAttribute('data-clones')||'1');
    if(dx<=-threshold){shortStep(wrap,1)}
    else if(dx>=threshold){shortStep(wrap,-1)}
    else{shortGoTo(wrap,idx,true)}
  }
  window.addEventListener('pointerup',finish);
  window.addEventListener('pointercancel',finish);
}
function shortReady(){
  var wraps=document.querySelectorAll('.shortSld');
  for(var i=0;i<wraps.length;i++){shortInit(wraps[i]);shortBindDrag(wraps[i])}
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',shortReady)}else{shortReady()}
})();
