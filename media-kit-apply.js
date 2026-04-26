/**
 * Applies MEDIA_KIT_DATA to the DOM. Requires media-kit-data.js first.
 */
(function () {
  const BAR = {
    accent: 'var(--accent)',
    green: 'var(--green)',
    purple: 'var(--purple)',
  };

  const SPARK_COLORS = {
    followers: '#bd8274',
    views: '#1e180d',
    engagement: '#8a6d62',
    collabs: '#b8957a',
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function drawSparkline(id, values, color) {
    const svg = document.getElementById(id);
    if (!svg || !values || !values.length) return;
    const W = 200;
    const H = 28;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pts = values.map((v, i) => [
      (i / (values.length - 1)) * W,
      H - ((v - min) / range) * (H - 6) - 3,
    ]);
    const path = 'M' + pts.map((p) => p.join(',')).join(' L');
    const gid = 'g' + id.replace(/[^a-z0-9]/gi, '');
    svg.innerHTML =
      `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.25"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>` +
      `<path d="${path} L${W},${H} L0,${H} Z" fill="url(#${gid})"/>` +
      `<path d="${path}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="2.5" fill="${color}"/>`;
  }

  function renderCollabRows(rows) {
    return rows
      .map((r) => {
        const bar = BAR[r.barColor] || BAR.accent;
        const nameStyle = r.nameAccent ? ' style="color:var(--accent)"' : '';
        const viewsStyle =
          r.nameAccent ? ' style="color:var(--accent)"' : ' style="color:var(--text)"';
        const rankStyle = r.rank === '★' ? ' style="color:var(--yellow)"' : '';
        return (
          `<tr>` +
          `<td class="col-rank"${rankStyle}>${esc(r.rank)}</td>` +
          `<td class="col-emoji">${r.emoji}</td>` +
          `<td><div class="col-name"${nameStyle}>${esc(r.name)}</div></td>` +
          `<td><span class="post-tag tag-${esc(r.tag)}">${esc(r.tagLabel)}</span></td>` +
          `<td><div class="col-bar-wrap"><div class="col-bar-track">` +
          `<div class="col-bar-fill" style="width:${r.barPct}%;background:${bar}"></div>` +
          `</div></div></td>` +
          `<td><span class="col-views"${viewsStyle}>${esc(r.views)}</span></td>` +
          `</tr>`
        );
      })
      .join('');
  }

  /** Map tag key to label for snapshot (viral -> Viral, organic -> Organic) */
  function snapshotTagLabel(key) {
    const m = { viral: 'Viral', organic: 'Organic', collab: 'Collab', lifestyle: 'Lifestyle' };
    return m[key] || key;
  }

  function renderSnapshotFixed(posts) {
    return posts
      .map(
        (p) =>
          `<div class="post-card">` +
          `<div class="post-card-top">` +
          `<span class="post-icon" aria-hidden="true">${p.icon}</span>` +
          `<span class="post-views">${esc(p.views)}</span>` +
          `</div>` +
          `<div class="post-label">${esc(p.label)}</div>` +
          `<span class="post-tag tag-${esc(p.tag)}">${esc(snapshotTagLabel(p.tag))}</span>` +
          `</div>`
      )
      .join('');
  }

  function renderNiche(cards) {
    return cards
      .map(
        (c) =>
          `<div class="niche-card">` +
          `<div class="niche-icon">${c.icon}</div>` +
          `<div class="niche-name">${esc(c.title)}</div>` +
          `<div class="niche-desc">${esc(c.desc)}</div>` +
          `</div>`
      )
      .join('');
  }

  function renderAgeRows(ages) {
    return ages
      .map((a) => {
        let fill = 'var(--purple)';
        let labelAttr = '';
        let pctAttr = '';
        if (a.pct < 1) fill = 'var(--text3)';
        if (a.highlight === 'accent') {
          labelAttr = ' style="color:var(--accent);font-weight:600"';
          pctAttr = ' style="color:var(--accent);font-weight:600"';
          fill = 'var(--accent)';
        } else if (a.highlight === 'text') {
          labelAttr = ' style="color:var(--text);font-weight:500"';
          pctAttr = ' style="color:var(--blue)"';
          fill = 'var(--blue)';
        }
        const pctStr =
          typeof a.pct === 'number' ? a.pct.toFixed(1).replace(/\.0$/, '') + '%' : esc(String(a.pct));
        let pctStyle = '';
        if (a.highlight === 'accent' || a.highlight === 'text') pctStyle = pctAttr;
        else if (a.pct < 1) pctStyle = ' style="color:var(--text3)"';
        return (
          `<div class="bar-row"><span class="bar-label"${labelAttr}>${esc(a.label)}</span>` +
          `<div class="bar-track"><div class="bar-fill" style="width:${a.pct}%;background:${fill}"></div></div>` +
          `<span class="bar-pct"${pctStyle}>${pctStr}</span></div>`
        );
      })
      .join('');
  }

  function renderLocations(locations, barWidths) {
    return locations
      .map((loc, i) => {
        const w = barWidths[i] != null ? barWidths[i] : loc.pct;
        const hl = loc.highlight;
        const nameCls = hl ? ' style="color:var(--accent);font-weight:600"' : '';
        const pctCls = hl ? ' style="color:var(--accent);font-weight:600"' : '';
        const fill = hl ? 'var(--accent)' : 'var(--blue)';
        return (
          `<div class="location-row"><span class="location-flag">${loc.flag}</span>` +
          `<span class="location-name"${nameCls}>${esc(loc.name)}</span>` +
          `<div class="location-bar"><div class="location-bar-fill" style="width:${w}%;background:${fill}"></div></div>` +
          `<span class="location-pct"${pctCls}>${loc.pct}%</span></div>`
        );
      })
      .join('');
  }

  function updateDonut(womenPct, menPct) {
    const pctEl = document.getElementById('donut-pct-main');
    if (pctEl) pctEl.textContent = `${womenPct}%`;
    const lw = document.getElementById('legend-women-pct');
    const lm = document.getElementById('legend-men-pct');
    if (lw) lw.textContent = `${womenPct}%`;
    if (lm) lm.textContent = `${menPct}%`;
    const svg = document.getElementById('audience-donut-svg');
    if (!svg) return;
    const circles = svg.querySelectorAll('circle');
    const C = 239;
    if (circles.length >= 3) {
      const wArc = Math.round(C * (womenPct / 100));
      const mArc = Math.round(C * (menPct / 100));
      circles[1].setAttribute('stroke-dasharray', `${wArc} ${C}`);
      circles[2].setAttribute('stroke-dasharray', `${mArc} ${C}`);
    }
  }

  window.applyMediaKitData = function (D) {
    if (!D) return;

    const m = D.meta || {};
    if (m.dataVerified) {
      const tb = document.getElementById('topbar-subtitle');
      if (tb) {
        const handle = (window.config && window.config.creator_handle) || '@montrealbites';
        tb.textContent = `${handle} · Instagram · Data verified ${m.dataVerified}`;
      }
    }

    const k = D.kpi || {};
    function setKpi(key) {
      const card = document.querySelector(`[data-kpi="${key}"]`);
      if (!card) return;
      const f = k[key];
      if (!f) return;
      const val = card.querySelector('.kpi-value');
      const badge = card.querySelector('.kpi-badge');
      const sub = card.querySelector('.kpi-sub');
      if (val && f.value != null) val.textContent = f.value;
      if (badge && f.badge != null) badge.textContent = f.badge;
      if (sub) {
        if (f.subHtml != null) sub.innerHTML = f.subHtml;
        else if (f.sub != null) sub.textContent = f.sub;
      }
    }
    ['followers', 'avgViews', 'engagement', 'collabs'].forEach(setKpi);

    const sp = D.sparklines || {};
    if (sp.followers) drawSparkline('spark-followers', sp.followers, SPARK_COLORS.followers);
    if (sp.views) drawSparkline('spark-views', sp.views, SPARK_COLORS.views);
    if (sp.engagement) drawSparkline('spark-eng', sp.engagement, SPARK_COLORS.engagement);
    if (sp.collabs) drawSparkline('spark-collabs', sp.collabs, SPARK_COLORS.collabs);

    const v = D.viral || {};
    if (v.views != null) {
      const el = document.getElementById('viral-views');
      if (el) el.textContent = v.views;
    }
    if (v.sends != null) {
      const el = document.getElementById('viral-sends');
      if (el) el.textContent = v.sends;
    }
    ['likes', 'comments', 'reshares'].forEach((key) => {
      if (v[key] != null) {
        const el = document.getElementById('viral-' + key);
        if (el) el.textContent = v[key];
      }
    });

    const tbody = document.getElementById('collab-tbody');
    if (tbody && D.collabRows) tbody.innerHTML = renderCollabRows(D.collabRows);

    const snap = document.getElementById('snapshot-grid');
    if (snap && D.snapshotPosts) snap.innerHTML = renderSnapshotFixed(D.snapshotPosts);

    const niche = document.getElementById('niche-grid');
    if (niche && D.nicheCards) niche.innerHTML = renderNiche(D.nicheCards);

    const aud = D.audience || {};
    if (aud.gender) {
      updateDonut(aud.gender.women, aud.gender.men);
    }

    const ageBars = document.getElementById('audience-age-bars');
    if (ageBars && aud.ages) ageBars.innerHTML = renderAgeRows(aud.ages);

    const locList = document.getElementById('audience-location-list');
    if (locList && aud.locations) {
      locList.innerHTML = renderLocations(aud.locations, aud.locationBarWidth || []);
    }

    const ageH = document.getElementById('audience-age-hbox');
    if (ageH && aud.ageInsight) {
      const strong = ageH.querySelector('strong');
      const span = ageH.querySelector('span');
      if (strong) strong.textContent = aud.ageInsight;
      if (span && aud.ageInsightSub) span.textContent = aud.ageInsightSub;
    }

    const locH = document.getElementById('audience-location-hbox');
    if (locH && aud.locations && aud.locations[0]) {
      const strong = locH.querySelector('strong');
      const span = locH.querySelector('span');
      if (strong) strong.textContent = `✅ ${aud.locations[0].pct}% Canadian audience`;
      if (span) span.textContent = 'Ideal for Canadian & Québec-based brands wanting real local reach';
    }

    const cs = document.getElementById('contact-summary');
    if (cs && D.contact && D.contact.summary) cs.textContent = D.contact.summary;

    const c = D.callouts || {};
    if (c.collabPerformance) {
      const box = document.getElementById('callout-collab-performance');
      if (box) {
        const strong = box.querySelector('strong');
        const span = box.querySelector('span');
        if (strong) strong.textContent = c.collabPerformance.title;
        if (span) span.textContent = c.collabPerformance.sub;
      }
    }
    if (c.snapshotFoot) {
      const box = document.getElementById('callout-snapshot-foot');
      if (box) {
        const strong = box.querySelector('strong');
        const span = box.querySelector('span');
        if (strong) strong.textContent = c.snapshotFoot.title;
        if (span) span.textContent = c.snapshotFoot.sub;
      }
    }
    if (c.gender) {
      const box = document.getElementById('callout-gender');
      if (box) {
        const strong = box.querySelector('strong');
        const span = box.querySelector('span');
        if (strong) strong.textContent = c.gender.title;
        if (span) span.textContent = c.gender.sub;
      }
    }
  };
})();
