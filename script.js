// ===== Dark mode =====
var modeBtn = document.getElementById('modeToggle');
var modeIcon = document.getElementById('modeIcon');
var SUN = '<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><circle cx="12" cy="12" r="5"/>';
var MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';

function applyMode(mode){
  if(mode === 'dark'){
    document.body.classList.add('drK');
    modeIcon.innerHTML = SUN;
  } else {
    document.body.classList.remove('drK');
    modeIcon.innerHTML = MOON;
  }
}
// Always start in light mode. Dark mode is only ever applied once the
// person explicitly clicks the toggle (and is then remembered for next time).
var savedMode = localStorage.getItem('siteMode') || 'light';
applyMode(savedMode);

modeBtn.addEventListener('click', function(){
  var next = document.body.classList.contains('drK') ? 'light' : 'dark';
  applyMode(next);
  localStorage.setItem('siteMode', next);
});

// ===== Sidebar toggle =====
// The sidebar always starts closed (icon rail only) on every page load.
// Clicking the hamburger expands it; icons stay put, only the labels appear.
var sidebarToggle = document.getElementById('sidebarToggle');
sidebarToggle.addEventListener('click', function(){
  document.body.classList.toggle('sidebar-open');
});

// ===== Dropdown menus in sidebar =====
document.querySelectorAll('[data-toggle]').forEach(function(el){
  el.addEventListener('click', function(){
    var id = el.getAttribute('data-toggle');
    var sub = document.getElementById(id);
    var parentLi = el.closest('.drp');
    if(sub){
      sub.classList.toggle('open');
    }
    if(parentLi){
      parentLi.classList.toggle('open');
    }
  });
});

// ===== Footer year =====
var y = document.getElementById('getYear');
if(y){ y.textContent = new Date().getFullYear(); }

// ===== Lazy YouTube embeds (click-to-play) =====
document.querySelectorAll('.lazyYt1').forEach(function(el){
  var embed = el.dataset.embed;
  var thumb = el.dataset.thumbnailUrl || ('https://img.youtube.com/vi/' + embed + '/hqdefault.jpg');
  var img = document.createElement('img');
  img.src = thumb;
  img.alt = 'Video thumbnail';
  img.loading = 'lazy';
  el.insertBefore(img, el.firstChild);

  el.addEventListener('click', function(){
    var iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    // Fixes YouTube's "Error 153: Video player configuration error" — that
    // error happens when the embedding page doesn't send YouTube a valid
    // referrer/origin. It shows up most often when a page is opened straight
    // from disk (file://) instead of served over http(s); setting this
    // attribute (and the <meta name="referrer"> tag in <head>) makes sure a
    // proper referrer is sent once the site is actually hosted (e.g. on
    // GitHub Pages), which is when this will fully resolve.
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.src = 'https://www.youtube.com/embed/' + embed + '?autoplay=1&rel=0';
    el.innerHTML = '';
    el.appendChild(iframe);
  });
});
