// Interactive behaviour for project pages (_layouts/project.html)
(function() {
  'use strict';

  var COLORS = { tf: '#3B6FD8', rj: '#8A4FD1', rk: '#C2448F', accent: '#6A3D8C', ink: '#2E2547', muted: '#6E6585', grid: '#EFEBF4' };
  var PHASE_NAMES = { tf: 'Turbofan + AB', rj: 'Ramjet', rk: 'Rocket' };
  var data = window.projectData || {};

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function fmt(n, d) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }

  // Tab groups: one .on button at a time, calls onPick(button)
  function tabs(container, onPick) {
    var buttons = $$('button', container);
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        buttons.forEach(function(b) { b.classList.toggle('on', b === btn); });
        onPick(btn);
      });
    });
  }

  /* ---------- Table of contents with scroll spy ---------- */
  (function() {
    var list = $('#project-toc');
    if (!list) return;
    var headings = $$('.project-content > h2[id]');
    headings.forEach(function(h) {
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      list.appendChild(li);
    });
    if (!('IntersectionObserver' in window)) return;
    var links = $$('a', list);
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function(a) { a.classList.toggle('on', a.getAttribute('href') === '#' + entry.target.id); });
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    headings.forEach(function(h) { observer.observe(h); });
  })();

  /* ---------- Equations ---------- */
  if (window.renderMathInElement) {
    $$('.eq').forEach(function(el) { window.renderMathInElement(el); });
  }

  /* ---------- Lightbox ---------- */
  (function() {
    var box = $('#lightbox');
    if (!box) return;
    var img = $('img', box), cap = $('.lightbox-caption', box);
    function close() { box.hidden = true; document.body.classList.remove('no-scroll'); }
    document.addEventListener('click', function(e) {
      var target = e.target;
      if (target.matches && target.matches('img[data-zoom]')) {
        img.src = target.src;
        var fc = target.parentNode.querySelector('figcaption');
        cap.textContent = fc ? fc.textContent : '';
        box.hidden = false;
        document.body.classList.add('no-scroll');
      } else if (!box.hidden && (target === box || target.closest('.lightbox-close'))) {
        close();
      }
    });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') close(); });
  })();

  /* ---------- Image comparison tabs ---------- */
  $$('[data-compare]').forEach(function(block) {
    var img = $('figure img', block), cap = $('figure figcaption', block);
    tabs($('.compare-tabs', block), function(btn) {
      img.src = btn.getAttribute('data-src');
      cap.textContent = btn.getAttribute('data-caption');
    });
  });

  $$('[data-timestep]').forEach(function(block) {
    var imgs = $$('figure img', block);
    tabs($('.viz-tabs', block), function(btn) {
      var t = btn.getAttribute('data-t');
      imgs[0].src = '/img/projects/odonata/velocity-t' + t + '.jpg';
      imgs[1].src = '/img/projects/odonata/streamlines-t' + t + '.jpg';
    });
  });

  /* ---------- Engine stations + 1-D schematic ---------- */
  (function() {
    var wrap = $('#stations'), info = $('#station-info');
    if (!wrap) return;
    var buttons = $$('button', wrap), zones = $$('#engine [data-zone]'), pointer = $('#engine-pointer');
    function select(i) {
      var btn = buttons[i], zone = zones[i];
      buttons.forEach(function(b) { b.classList.toggle('on', b === btn); });
      zones.forEach(function(z) { z.classList.toggle('on', z === zone); });
      info.textContent = btn.getAttribute('data-info');
      if (zone && pointer) {
        var x = +zone.getAttribute('x') + zone.getAttribute('width') / 2;
        pointer.style.transform = 'translate(' + x + 'px, 6px)';
      }
    }
    buttons.forEach(function(b, i) {
      b.addEventListener('click', function() { select(i); });
      b.addEventListener('mouseenter', function() { select(i); });
    });
    zones.forEach(function(z, i) { z.addEventListener('mouseenter', function() { select(i); }); });
    select(0);
  })();

  /* ---------- Solid motor trade calculator ---------- */
  (function() {
    var calc = $('#srm-calc');
    if (!calc) return;
    var input = $('input', calc), out = $('output', calc);
    function update() {
      var isp = +input.value, mass = 135500 * 300 / isp, delta = mass - 135500;
      out.textContent = isp + ' s';
      $('[data-out=mass]', calc).textContent = fmt(Math.round(mass / 10) * 10) + ' kg';
      $('[data-out=delta]', calc).textContent = (delta >= 0 ? '+' : '−') + fmt(Math.abs(Math.round(delta / 10) * 10)) + ' kg';
    }
    input.addEventListener('input', update);
    update();
  })();

  /* ---------- Mass breakdown bar ---------- */
  (function() {
    var bar = $('#massbar'), info = $('#massbar-info');
    if (!bar || !data.mass) return;
    var total = data.mass.reduce(function(s, d) { return s + d.kg; }, 0);
    data.mass.forEach(function(d) {
      var seg = document.createElement('button');
      seg.type = 'button';
      seg.style.flexGrow = d.kg;
      seg.style.background = d.color;
      seg.setAttribute('aria-label', d.name);
      var text = '<b>' + d.name + '</b> · ' + fmt(d.kg) + ' kg · ' + (100 * d.kg / total).toFixed(1) + '% of takeoff mass';
      ['mouseenter', 'focus', 'click'].forEach(function(ev) {
        seg.addEventListener(ev, function() {
          $$('button', bar).forEach(function(b) { b.classList.toggle('on', b === seg); });
          info.innerHTML = text;
        });
      });
      bar.appendChild(seg);
    });
    $('button', bar).dispatchEvent(new Event('mouseenter'));
  })();

  /* ---------- Charts ---------- */
  if (!window.Chart) return;
  Chart.defaults.font.family = "'Open Sans', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = COLORS.muted;
  Chart.defaults.borderColor = COLORS.grid;
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.maintainAspectRatio = false;

  function axisTitle(text) { return { display: true, text: text, color: COLORS.ink, font: { weight: 600 } }; }

  // Draws a dashed cursor at the x value returned by getCursor()
  function cursorPlugin(getCursor) {
    return {
      id: 'cursor',
      afterDatasetsDraw: function(chart) {
        var c = getCursor();
        if (!c) return;
        var ctx = chart.ctx, area = chart.chartArea;
        var x = chart.scales.x.getPixelForValue(c.x), y = chart.scales.y.getPixelForValue(c.y);
        ctx.save();
        if (c.vertical) {
          ctx.strokeStyle = COLORS.accent;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(x, area.top); ctx.lineTo(x, area.bottom); ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = '#fff'; ctx.strokeStyle = COLORS.accent; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
    };
  }

  // Slider + play button that drive an index from 0 to max
  function scrubber(root, max, onChange, loop) {
    var input = $('.viz-scrub input', root), play = $('.viz-play', root), icon = $('i', play);
    var timer = null;
    input.max = max;
    function set(i) { input.value = i; onChange(+i); }
    function stop() { cancelAnimationFrame(timer); timer = null; icon.className = 'fa fa-play'; }
    input.addEventListener('input', function() { stop(); onChange(+input.value); });
    play.addEventListener('click', function() {
      if (timer) return stop();
      if (+input.value >= max && !loop) set(0);
      icon.className = 'fa fa-pause';
      var last = performance.now(), pos = +input.value;
      (function step(now) {
        pos += (now - last) / 1000 * max / (loop ? 6 : 8);
        last = now;
        if (pos >= max) { if (loop) pos = 0; else { set(max); return stop(); } }
        set(Math.floor(pos));
        timer = requestAnimationFrame(step);
      })(last);
    });
    set(0);
  }

  /* Dual-mode: mission trajectory explorer */
  (function() {
    var root = $('#trajectory-viz');
    if (!root || !data.trajectory) return;
    var T = data.trajectory, n = T.t.length, idx = 0, mode = 'h';
    var modes = {
      h:  { x: 't', y: 'h', xt: 'Time (s)', yt: 'Altitude (km)' },
      v:  { x: 't', y: 'v', xt: 'Time (s)', yt: 'Velocity (m/s)' },
      M:  { x: 't', y: 'M', xt: 'Time (s)', yt: 'Mach number' },
      m:  { x: 't', y: 'm', xt: 'Time (s)', yt: 'Vehicle mass (tonnes)' },
      Mh: { x: 'M', y: 'h', xt: 'Mach number', yt: 'Altitude (km)' }
    };
    function series(phase) {
      var m = modes[mode], pts = [];
      for (var i = 0; i < n; i++) {
        // include the next point so phase segments join up
        if (T.phase[i] === phase || (i > 0 && T.phase[i - 1] === phase)) pts.push({ x: T[m.x][i], y: T[m.y][i] });
      }
      return pts;
    }
    var chart = new Chart($('canvas', root), {
      type: 'line',
      data: { datasets: ['tf', 'rj', 'rk'].map(function(p) {
        return { label: PHASE_NAMES[p], data: series(p), borderColor: COLORS[p], borderWidth: 3, pointRadius: 0, tension: 0.2 };
      }) },
      options: {
        animation: false, parsing: false,
        interaction: { mode: 'nearest', intersect: false },
        plugins: { tooltip: { enabled: false } },
        scales: { x: { type: 'linear', title: axisTitle(modes.h.xt) }, y: { title: axisTitle(modes.h.yt) } }
      },
      plugins: [cursorPlugin(function() {
        var m = modes[mode];
        return { x: T[m.x][idx], y: T[m.y][idx], vertical: m.x === 't' };
      })]
    });
    function readout() {
      $('.viz-readout', root).innerHTML =
        '<span>t <b>' + fmt(T.t[idx]) + ' s</b></span>' +
        '<span>Altitude <b>' + T.h[idx].toFixed(1) + ' km</b></span>' +
        '<span>Velocity <b>' + fmt(T.v[idx]) + ' m/s</b></span>' +
        '<span>Mach <b>' + T.M[idx].toFixed(2) + '</b></span>' +
        '<span>Mass <b>' + fmt(T.m[idx], 1) + ' t</b></span>' +
        '<span>Engine <b class="ph-' + T.phase[idx] + '">' + PHASE_NAMES[T.phase[idx]] + '</b></span>';
    }
    tabs($('.viz-tabs', root), function(btn) {
      mode = btn.getAttribute('data-key');
      chart.data.datasets.forEach(function(ds, i) { ds.data = series(['tf', 'rj', 'rk'][i]); });
      chart.options.scales.x.title = axisTitle(modes[mode].xt);
      chart.options.scales.y.title = axisTitle(modes[mode].yt);
      chart.update();
    });
    scrubber(root, n - 1, function(i) { idx = i; readout(); chart.draw(); });
    // Scrub by hovering over the chart too
    chart.canvas.addEventListener('mousemove', function(e) {
      if (modes[mode].x !== 't') return;
      var t = chart.scales.x.getValueForPixel(e.offsetX), best = 0;
      for (var i = 0; i < n; i++) if (Math.abs(T.t[i] - t) < Math.abs(T.t[best] - t)) best = i;
      $('.viz-scrub input', root).value = best;
      idx = best; readout(); chart.draw();
    });
  })();

  /* Dual-mode: specific thrust and TSFC vs Mach */
  (function() {
    var root = $('#performance-viz');
    if (!root || !data.performance) return;
    var P = data.performance;
    new Chart($('canvas', root), {
      type: 'line',
      data: {
        datasets: [
          { label: 'Specific thrust (m/s)', data: P.map(function(p) { return { x: p.M, y: p.Fs }; }), yAxisID: 'y', borderColor: COLORS.ink, backgroundColor: P.map(function(p) { return COLORS[p.phase]; }), pointRadius: 6, pointHoverRadius: 8, borderWidth: 2 },
          { label: 'TSFC (g/s/kN)', data: P.map(function(p) { return { x: p.M, y: p.tsfc }; }), yAxisID: 'y2', borderColor: '#ADA3C2', borderDash: [5, 4], backgroundColor: P.map(function(p) { return COLORS[p.phase]; }), pointStyle: 'rectRot', pointRadius: 6, pointHoverRadius: 8, borderWidth: 2 }
        ]
      },
      options: {
        parsing: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { usePointStyle: true } },
          tooltip: { callbacks: { title: function(items) { return P[items[0].dataIndex].label; } } }
        },
        scales: {
          x: { type: 'linear', min: 0, max: 4.5, title: axisTitle('Flight Mach number') },
          y: { min: 0, title: axisTitle('Specific thrust F/ṁₐ (m/s)') },
          y2: { position: 'right', min: 0, grid: { drawOnChartArea: false }, title: axisTitle('TSFC (g/s/kN)') }
        }
      }
    });
  })();

  /* Dual-mode: propellant share vs impulse share */
  (function() {
    var root = $('#impulse-viz');
    if (!root || !data.impulse) return;
    var I = data.impulse;
    var mp = I.reduce(function(s, d) { return s + d.propellant; }, 0), imp = I.reduce(function(s, d) { return s + d.impulse; }, 0);
    new Chart($('canvas', root), {
      type: 'bar',
      data: {
        labels: ['Share of propellant burned', 'Share of total impulse'],
        datasets: I.map(function(d) {
          return { label: d.name, data: [100 * d.propellant / mp, 100 * d.impulse / imp], backgroundColor: COLORS[d.phase], borderWidth: 0, barThickness: 34 };
        })
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: { callbacks: { label: function(c) { return c.dataset.label + ': ' + c.raw.toFixed(1) + '%'; } } }
        },
        scales: { x: { stacked: true, max: 100, ticks: { callback: function(v) { return v + '%'; } } }, y: { stacked: true, grid: { display: false } } }
      }
    });
  })();

  /* Odonata: static polar explorer */
  (function() {
    var root = $('#polar-viz');
    if (!root || !data.odonata) return;
    var O = data.odonata;
    var LD = O.CL.map(function(cl, i) { return +(cl / O.CD[i]).toFixed(3); });
    function argmax(a) { return a.indexOf(Math.max.apply(null, a)); }
    var modes = {
      CL: { xs: O.alpha, ys: O.CL, xt: 'Angle of attack α (deg)', yt: 'Lift coefficient C_L', hi: argmax(O.CL),
            note: 'Lift peaks at C_L = 0.824 at 28°, well past the ≈15° stall of a smooth airfoil. Note the secondary peak at 14° and the brief recovery at 56°.' },
      CD: { xs: O.alpha, ys: O.CD, xt: 'Angle of attack α (deg)', yt: 'Drag coefficient C_D', hi: null,
            note: 'Drag rises steadily from 0.14 to about 0.88 at 50°, then climbs sharply as the flow separates.' },
      LD: { xs: O.alpha, ys: LD, xt: 'Angle of attack α (deg)', yt: 'Lift-to-drag ratio C_L/C_D', hi: argmax(LD),
            note: 'Efficiency is best at low angles of attack (L/D ≈ 3), so a gliding dragonfly is most efficient at shallow angles.' },
      polar: { xs: O.CD, ys: O.CL, xt: 'Drag coefficient C_D', yt: 'Lift coefficient C_L', hi: argmax(O.CL),
            note: 'The drag polar: each point is one angle of attack. Hover over a point to see its α.' }
    };
    var mode = 'CL';
    function points() { var m = modes[mode]; return m.xs.map(function(x, i) { return { x: x, y: m.ys[i] }; }); }
    function radii() { var m = modes[mode]; return O.alpha.map(function(_, i) { return i === m.hi ? 8 : 4; }); }
    function fills() { var m = modes[mode]; return O.alpha.map(function(_, i) { return i === m.hi ? COLORS.accent : '#fff'; }); }
    var chart = new Chart($('canvas', root), {
      type: 'line',
      data: { datasets: [{ data: points(), borderColor: COLORS.tf, borderWidth: 2.5, pointRadius: radii(), pointHoverRadius: 8, pointBackgroundColor: fills(), pointBorderColor: COLORS.tf, pointBorderWidth: 2, tension: 0 }] },
      options: {
        parsing: false,
        interaction: { mode: 'nearest', intersect: false },
        plugins: { tooltip: { callbacks: {
          title: function(items) { return 'α = ' + O.alpha[items[0].dataIndex] + '°'; },
          label: function(c) { var i = c.dataIndex; return ['C_L = ' + O.CL[i].toFixed(3), 'C_D = ' + O.CD[i].toFixed(3), 'L/D = ' + LD[i].toFixed(2)]; }
        } } },
        scales: { x: { type: 'linear', title: axisTitle(modes.CL.xt) }, y: { title: axisTitle(modes.CL.yt) } }
      }
    });
    function caption() { $('#polar-caption').textContent = modes[mode].note; }
    tabs($('.viz-tabs', root), function(btn) {
      mode = btn.getAttribute('data-key');
      var ds = chart.data.datasets[0];
      ds.data = points(); ds.pointRadius = radii(); ds.pointBackgroundColor = fills();
      chart.options.scales.x.title = axisTitle(modes[mode].xt);
      chart.options.scales.y.title = axisTitle(modes[mode].yt);
      chart.update();
      caption();
    });
    caption();
  })();

  /* Odonata: flapping wing animation synced to C_L(t) */
  (function() {
    var root = $('#flap-viz');
    if (!root || !data.odonata) return;
    var O = data.odonata, n = O.t.length, idx = 0;
    var wing = $('.flap-wing', root), read = $('.flap-readout', root);
    var chart = new Chart($('canvas', root), {
      type: 'line',
      data: { datasets: [{ data: O.t.map(function(t, i) { return { x: t, y: O.CL_t[i] }; }), borderColor: COLORS.tf, borderWidth: 2, pointRadius: 0, tension: 0.3 }] },
      options: {
        animation: false, parsing: false,
        plugins: { tooltip: { enabled: false } },
        scales: { x: { type: 'linear', min: 0, max: 0.2, title: axisTitle('Time (s)') }, y: { min: -0.4, max: 0.4, title: axisTitle('Lift coefficient C_L') } }
      },
      plugins: [cursorPlugin(function() { return { x: O.t[idx], y: O.CL_t[idx], vertical: true }; })]
    });
    scrubber(root, n - 1, function(i) {
      idx = i;
      var phi = 15 * Math.sin(2 * Math.PI * 30 * O.t[i]);
      wing.setAttribute('transform', 'rotate(' + (-phi).toFixed(2) + ')');
      read.innerHTML = '<span>t <b>' + O.t[i].toFixed(4) + ' s</b></span><span>φ <b>' + phi.toFixed(1) + '°</b></span><span>C<sub>L</sub> <b>' + O.CL_t[i].toFixed(2) + '</b></span>';
      chart.draw();
    }, true);
  })();
})();
