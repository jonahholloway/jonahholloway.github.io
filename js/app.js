(function(){
  'use strict';

  new WOW().init();
  
})();

// Fade cards in/out when entering/leaving viewport
(function() {
  var faders = document.querySelectorAll('.scroll-fade');
  if (!faders.length || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.2 });

  faders.forEach(function(el) { observer.observe(el); });
})();
