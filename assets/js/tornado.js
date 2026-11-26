(function () {
  var canvas = document.getElementById('tornado');
  var stage = document.getElementById('stage');
  var typed = document.getElementById('typed');
  if (!canvas || !stage) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dark = window.matchMedia('(prefers-color-scheme: dark)');
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890';
  var strands = 13;
  var perStrand = 80;
  var data = [];
  for (var s = 0; s < strands; s++) {
    data.push({ offset: Math.random() * 2 * Math.PI, speed: 0.05 + Math.random() * 0.1, mult: 5 + Math.random() * 10 });
  }
  var angle = 0;
  var w = 0, h = 0, scale = 1, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = stage.clientWidth;
    h = stage.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    scale = Math.max(Math.min(w, h) / 500, 0.6);
    draw();
  }

  function draw() {
    var ink = dark.matches ? '255,255,255' : '0,0,0';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var cx = w / 2, cy = h / 2;
    for (var s = 0; s < strands; s++) {
      var d = data[s];
      for (var i = 0; i < perStrand; i++) {
        var a = angle * d.speed - i * 0.25 + d.offset;
        var r = d.mult * i * scale;
        var x = cx + r * Math.cos(a) + Math.sin(i * 0.3 + angle) * 5;
        var y = cy + r * Math.sin(a) + Math.cos(i * 0.5 + angle) * 5;
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;
        ctx.font = ((12 + 8 * Math.sin(angle + i)) * Math.max(scale, 0.7)) + 'px monospace';
        ctx.fillStyle = 'rgba(' + ink + ',' + (0.4 + 0.6 * (i / perStrand)) + ')';
        ctx.fillText(chars.charAt(Math.floor(Math.random() * chars.length)), x, y);
      }
    }
  }

  var last = 0, running = false, raf = 0;
  function frame(t) {
    if (!running) return;
    if (t - last >= 50) {
      draw();
      angle += 0.05;
      last = t;
    }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running && !reduced) { running = true; raf = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  window.addEventListener('resize', resize);
  if (dark.addEventListener) dark.addEventListener('change', draw);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(stage);
  } else {
    start();
  }

  var text = stage.getAttribute('data-text') || '';
  if (!typed) return;
  if (reduced) {
    typed.textContent = text;
  } else {
    var n = 0;
    (function type() {
      typed.textContent = text.slice(0, n);
      if (n++ < text.length) setTimeout(type, 150);
    })();
  }
})();
