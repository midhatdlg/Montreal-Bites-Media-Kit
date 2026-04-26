/**
 * Applies MEDIA_KIT_DATA to the DOM.
 * Load after media-kit-data.js, call applyMediaKitData() before counter animation.
 */
(function () {
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.applyMediaKitData = function (D) {
    if (!D) return;
    var m = D.meta || {};

    // --- Verified dates ---
    if (m.dataVerified) {
      document.querySelectorAll('[data-bind="verified"]').forEach(function (el) {
        el.textContent = m.dataVerified;
      });
      var sa = document.getElementById('stats-aside');
      if (sa) sa.textContent = 'All figures verified ' + m.dataVerified + ' via Instagram Insights.';
      var fv = document.getElementById('footer-verified');
      if (fv) fv.textContent = 'Data verified ' + m.dataVerified + ' via Instagram Insights';
    }

    // --- §01 Stats (update data-count for counter animation) ---
    var s = D.stats || {};
    function updateStat(id, data) {
      if (!data) return;
      var box = document.getElementById(id);
      if (!box) return;
      var n = box.querySelector('.n');
      if (n && data.count != null) {
        n.dataset.count = String(data.count);
        if (data.raw) n.dataset.raw = '1';
        if (data.decimals) n.dataset.decimals = String(data.decimals);
      }
      if (data.delta) {
        var delta = box.querySelector('.delta');
        if (delta) delta.textContent = data.delta;
      }
    }
    updateStat('stat-followers', s.followers);
    updateStat('stat-peakviews', s.peakViews);
    updateStat('stat-engagement', s.engagement);
    updateStat('stat-collabs', s.collabs);

    // --- §02 Platform cards ---
    function updateCard(id, data, keys) {
      if (!data) return;
      var card = document.getElementById(id);
      if (!card) return;
      var big = card.querySelector('.p-big');
      if (big && data.value != null) {
        big.innerHTML = esc(data.value) + (data.unit ? '<span class="unit">' + esc(data.unit) + '</span>' : '');
      }
      var vals = card.querySelectorAll('.p-row .v');
      if (vals[0] && keys[0] && data[keys[0]] != null) vals[0].textContent = data[keys[0]];
      if (vals[1] && keys[1] && data[keys[1]] != null) vals[1].textContent = data[keys[1]];
    }

    var ig = D.instagram || {};
    updateCard('ig-followers', ig.followers, ['growth', 'since']);
    updateCard('ig-views', ig.avgViews, ['peak', 'hits']);
    updateCard('ig-engagement', ig.engagement, ['benchmark', 'multiplier']);
    updateCard('ig-viral', ig.viral, ['source', 'month']);

    var tt = D.tiktok || {};
    updateCard('tt-views', tt.postViews, ['day28Views', 'day28Growth']);
    updateCard('tt-likes', tt.likes, ['shares', 'comments']);
    updateCard('tt-viewers', tt.viewers, ['newViewers', 'gender']);
    updateCard('tt-discovery', tt.discovery, ['search', 'profile']);

    // --- §03 Audience ---
    var aud = D.audience || {};

    // Age bars
    var ageBlock = document.getElementById('demo-age');
    if (ageBlock && aud.ages) {
      var maxPct = Math.max.apply(null, aud.ages.map(function (a) { return a.pct; }));
      var h = '<h3>Age distribution</h3>';
      aud.ages.forEach(function (a) {
        var w = maxPct > 0 ? (a.pct / maxPct) * 100 : 0;
        h += '<div class="bar-row"><span class="lbl">' + esc(a.label) + '</span>' +
          '<div class="bar"><div class="fill" style="width:' + w.toFixed(1) + '%"></div></div>' +
          '<span class="pct">' + a.pct + '%</span></div>';
      });
      ageBlock.innerHTML = h;
    }

    // Location bars
    var locBlock = document.getElementById('demo-locations');
    if (locBlock && aud.locations) {
      var maxLoc = Math.max.apply(null, aud.locations.map(function (l) { return l.pct; }));
      var h = '<h3>Top locations</h3>';
      aud.locations.forEach(function (l) {
        var w = maxLoc > 0 ? (l.pct / maxLoc) * 100 : 0;
        h += '<div class="bar-row"><span class="lbl">' + esc(l.name) + '</span>' +
          '<div class="bar"><div class="fill" style="width:' + w.toFixed(1) + '%"></div></div>' +
          '<span class="pct">' + l.pct + '%</span></div>';
      });
      locBlock.innerHTML = h;
    }

    // Gender donut
    if (aud.gender) {
      var w = aud.gender.women;
      var mn = aud.gender.men;
      var center = document.querySelector('#demo-gender .donut-center');
      if (center) center.innerHTML = w + ' / ' + mn + '<small>Women / Men</small>';
      var legends = document.querySelectorAll('#demo-gender .legend .pct');
      if (legends[0]) legends[0].textContent = w + '%';
      if (legends[1]) legends[1].textContent = mn + '%';
      var circles = document.querySelectorAll('#demo-gender .donut svg circle');
      if (circles.length >= 3) {
        circles[1].setAttribute('stroke-dasharray', w + ' 100');
        circles[2].setAttribute('stroke-dasharray', mn + ' 100');
        circles[2].setAttribute('stroke-dashoffset', '-' + w);
      }
    }

    // Audience section aside
    if (aud.ages && aud.locations && aud.gender) {
      var core = 0;
      aud.ages.forEach(function (a) {
        if (a.label.indexOf('25') >= 0 || a.label.indexOf('35') >= 0) core += a.pct;
      });
      var canPct = aud.locations[0] ? aud.locations[0].pct : 0;
      var aside = document.getElementById('audience-aside');
      if (aside) {
        aside.textContent = 'Core demo 25\u201344 (' + core.toFixed(1) + '%) \u00b7 ' +
          canPct + '% Canadian \u00b7 ' + aud.gender.women + '% women.';
      }
    }
  };
})();
