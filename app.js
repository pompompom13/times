(function () {
  var OPEN = 14, CLOSE = 27; // ежедневно 14:00–03:00
  var root = document.documentElement;

  // --- 18+ ---
  document.getElementById('ageYes').addEventListener('click', function () {
    try { localStorage.setItem('times-age', 'yes'); } catch (e) {}
    root.classList.add('age-ok');
  });
  document.getElementById('ageNo').addEventListener('click', function () {
    document.getElementById('ageAsk').hidden = true;
    document.getElementById('ageDeny').hidden = false;
  });

  // --- night city skyline (как в логотипе) ---
  var cv = document.getElementById('city');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), wins = [], W, H, dpr;
    var build = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wins = [];
      var x = 0, seed = 7;
      var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      while (x < W) {
        var bw = 40 + rnd() * 70, bh = H * (0.25 + rnd() * 0.55);
        var b = { x: x, w: bw, h: bh };
        for (var wy = H - bh + 14; wy < H - 10; wy += 11) {
          for (var wx = x + 8; wx < x + bw - 10; wx += 9) {
            if (rnd() < 0.42) wins.push({ x: wx, y: wy, on: rnd() < 0.8, t: rnd() });
          }
        }
        b.gap = 4 + rnd() * 10; x += bw + b.gap;
        wins.push({ build: b });
      }
    };
    var draw = function () {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < wins.length; i++) {
        var w = wins[i];
        if (w.build) {
          ctx.fillStyle = 'rgba(20, 24, 34, .95)';
          ctx.fillRect(w.build.x, H - w.build.h, w.build.w, w.build.h);
          ctx.fillStyle = 'rgba(255, 255, 255, .08)';
          ctx.fillRect(w.build.x, H - w.build.h, w.build.w, 2);
        }
      }
      for (var j = 0; j < wins.length; j++) {
        var v = wins[j];
        if (v.build || !v.on) continue;
        ctx.fillStyle = v.t > 0.86 ? 'rgba(233, 176, 64, .9)' : 'rgba(240, 238, 230, .55)';
        ctx.fillRect(v.x, v.y, 4, 5);
      }
    };
    build(); draw();
    window.addEventListener('resize', function () { build(); draw(); });
    if (!reduce) setInterval(function () {
      for (var k = 0; k < 6; k++) {
        var w = wins[Math.floor(Math.random() * wins.length)];
        if (w && !w.build) w.on = !w.on;
      }
      draw();
    }, 700);
  }

  // --- menu ---
  var body = document.getElementById('menuBody');
  var tabs = document.querySelectorAll('.tab');
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(p) { return p.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; }
  function render(key) {
    body.innerHTML = window.TIMES_MENU[key].map(function (g) {
      return '<section class="mgroup"><h3>' + esc(g.title) + '</h3><ul>' +
        g.items.map(function (it) {
          return '<li><div class="mrow"><span>' + esc(it[0]) + '</span><i aria-hidden="true"></i><b>' + fmt(it[1]) + '</b></div>' +
            (it[2] ? '<small>' + esc(it[2]) + '</small>' : '') + '</li>';
        }).join('') + '</ul></section>';
    }).join('');
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
      t.classList.add('is-active'); t.setAttribute('aria-selected', 'true');
      render(t.dataset.tab);
    });
  });
  render('tea');

  // --- open status (Moscow time) ---
  var msk = new Date(Date.now() + (new Date().getTimezoneOffset() + 180) * 60000);
  var h = msk.getHours() + msk.getMinutes() / 60;
  var open = h >= OPEN || h < CLOSE - 24;
  var st = document.getElementById('status');
  st.textContent = '3-я Парковая, 57 · ' + (open ? 'открыто до 03:00' : 'откроемся в 14:00');
  st.classList.add(open ? 'is-open' : 'is-closed');

  // --- header ---
  var top = document.querySelector('.top');
  var onScroll = function () { top.classList.toggle('is-solid', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = document.getElementById('burger'), nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var o = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', o);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { document.body.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  // --- reveal ---
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
