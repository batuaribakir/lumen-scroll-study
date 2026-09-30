// Builds the page's DOM from content.js: the 15 beats, the chart and quote labels, the
// chrome (brand, music button, hint), and the end-state furniture (backed strip, docs
// toggle and panel, lead sheet). Layout lives in styles.css.

import { BRAND, HINT, CHART, VOICES, BEATS, DISCIPLINES, TEAM, BACKED, DOCS, LEAD } from './content.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Inline markup: [hl:..] highlight, [ac:..] accent, [flip:x] mirroring letter, \n line break. */
export function rich(text, { flipId = null } = {}) {
  let out = '', i = 0;
  const re = /\[(hl|ac|flip):([^\]]*)\]/g;
  let m;
  while ((m = re.exec(text))) {
    out += esc(text.slice(i, m.index));
    const body = esc(m[2]);
    if (m[1] === 'hl') out += `<span class="hl">${body}</span>`;
    else if (m[1] === 'ac') out += `<span class="accent">${body}</span>`;
    else out += `<span class="flip${flipId ? '' : ' on'}"${flipId ? ` id="${flipId}"` : ''}>${body}</span>`;
    i = re.lastIndex;
  }
  out += esc(text.slice(i));
  // a space before each break keeps words apart where portrait hides the <br>
  return out.replace(/\n/g, ' <br>');
}

const svg = (vb, body, cls = '') => `<svg viewBox="${vb}" ${cls ? `class="${cls}"` : ''} aria-hidden="true" focusable="false">${body}</svg>`;

// Original line icons (1.5 px strokes on a 20 px grid).
const ICON_SPEAKER = svg('0 0 20 20',
  '<path class="spk-body" d="M3.5 7.5h2.8L10 4.2v11.6L6.3 12.5H3.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
  '<g class="spk-wave"><path class="w1" d="M12.6 7.6a3.4 3.4 0 0 1 0 4.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
  '<path class="w2" d="M14.9 5.4a6.6 6.6 0 0 1 0 9.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></g>' +
  '<g class="spk-mute"><path d="M13 7.8l4.4 4.4M17.4 7.8L13 12.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></g>', 'spk');
const ICON_CHEVRON = svg('0 0 12 12', '<path d="M2.5 7.5L6 4l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>');
const ICON_ARROW = svg('0 0 16 16', '<path d="M4.5 11.5l7-7M6 4.5h5.5V10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>', 'arrow');

function beatInner(b) {
  switch (b.layout) {
    case 'hero':
      return `<h1>${rich(b.title)}</h1><p class="sub">${rich(b.sub)}</p>`;
    case 'market':
      return `<div class="market-right"><div class="kicker">${esc(b.kicker)}</div>` +
        `<p class="statement">${rich(b.statement)}</p><p class="sub">${rich(b.sub)}</p></div>`;
    case 'statement': {
      const flipId = b.num === '10' ? 'flipE' : null;
      return `<p class="statement">${rich(b.statement, { flipId })}</p>` + (b.sub ? `<p class="sub">${rich(b.sub)}</p>` : '');
    }
    case 'choice':
      return `<div class="choice-cols"><div class="col left"><div class="tag">${esc(b.left.tag)}</div><p>${rich(b.left.text)}</p></div>` +
        `<div class="col right"><div class="tag">${esc(b.right.tag)}</div><p>${rich(b.right.text)}</p></div></div>`;
    case 'trava':
      return `<p class="statement" id="turnLine">${esc(b.lead)}<br><span id="turnWord">${esc(b.word)}</span>` +
        `<span id="turnNew" class="hl"> ${esc(b.struck)}</span></p>`;
    case 'nots':
      return `<p class="statement">${rich(b.statement)}</p><div class="nots">${b.nots.map(n => `<span>${esc(n)}</span>`).join('')}</div>`;
    case 'disciplines':
      return `<div class="disc-wrap"><div class="disc-head"><p class="statement">${rich(b.statement)}</p></div>` +
        `<div class="fb"><div class="fb-chips" id="teamChips" role="tablist">` +
        DISCIPLINES.map((d, k) => `<button class="fb-chip${k === 0 ? ' on' : ''}" type="button" role="tab" aria-selected="${k === 0}" data-d="${d.id}"><span class="cidx">${esc(d.index)}</span><span>${esc(d.name)}</span></button>`).join('') +
        `</div><div class="fb-board" id="teamBoard">` +
        TEAM.map(m => `<div class="fb-col"><div class="head"><div class="nm">${esc(m.name)}</div><div class="role">${esc(m.role)}</div></div>` +
          DISCIPLINES.filter(d => m.frags[d.id]).map(d => `<div class="fb-frag" data-d="${d.id}"><div class="tx">${esc(m.frags[d.id])}</div></div>`).join('') + `</div>`).join('') +
        `</div></div></div>`;
    case 'cta':
      return `<p class="statement">${rich(b.statement)}</p><p class="sub">${rich(b.sub)}</p>` +
        `<a class="btn" href="#lead" id="ctaBtn"><span>${rich(b.button)}</span><span aria-hidden="true">→</span></a>` +
        `<p class="fineline">${rich(b.fineline)}</p>`;
    default:
      return '';
  }
}

/** Chart label positions: offsets from the chart point they annotate (config.chartLabelOffset). */
export function chartLabelLayout(cfg) {
  const { values, vMax, labelIndex } = CHART, n = values.length, ch = cfg.chart;
  const X = i => ch.x0 + (ch.x1 - ch.x0) * i / (n - 1), Y = v => ch.yBase - (ch.yBase - ch.yTop) * v / vMax;
  const at = k => { const i = labelIndex[k], [dx, dy] = cfg.chartLabelOffset[k]; return [Math.round(X(i) + dx), Math.round(Y(values[i]) + dy)]; };
  return { first: at('first'), mid: at('mid'), today: at('today'), projected: at('projected') };
}

export function buildDom(stage, cfg) {
  // beats, inserted before the end-state furniture so the stacking order matches
  stage.querySelectorAll('section.beat').forEach(s => s.remove());
  const anchor = stage.querySelector('#backedStrip');
  for (const b of BEATS) {
    const s = document.createElement('section');
    s.className = 'beat' + (b.layout === 'market' ? ' market' : b.layout === 'disciplines' ? ' disciplinas' : '');
    s.dataset.num = b.num;
    s.dataset.name = b.name;
    s.dataset.layout = b.layout;
    s.innerHTML = beatInner(b);
    stage.insertBefore(s, anchor);
  }

  const pos = chartLabelLayout(cfg), yr = cfg.chartYears;
  stage.querySelector('#chartLabels').innerHTML =
    `<span class="num" style="left:${pos.first[0]}px;top:${pos.first[1]}px">${esc(CHART.labels.first)}</span>` +
    `<span class="num" style="left:${pos.mid[0]}px;top:${pos.mid[1]}px">${esc(CHART.labels.mid)}</span>` +
    `<span class="num today" style="left:${pos.today[0]}px;top:${pos.today[1]}px">${esc(CHART.labels.today)}</span>` +
    `<span class="num" style="left:${pos.projected[0]}px;top:${pos.projected[1]}px">${esc(CHART.labels.projected)}</span>` +
    CHART.years.map((y, k) => `<span class="yr" style="left:${yr.x[k]}px;top:${yr.y}px">${esc(y)}</span>`).join('');
  stage.querySelector('.market-label').textContent = CHART.caption;

  stage.querySelector('#opsLabels').innerHTML = VOICES.map(v => `<div class="vgrp">` +
    (v.statement ? `<div class="vq stmt">${esc(v.statement)}</div>` : `<div class="vq">${esc(v.left)}</div><div class="vq r">${esc(v.right)}</div>`) + `</div>`).join('');

  stage.querySelector('.brand').textContent = BRAND.name;
  stage.querySelector('#bgmBtn').innerHTML = ICON_SPEAKER;
  stage.querySelector('#hint').innerHTML = `<span>${esc(HINT)}</span><div class="mouse"></div>`;

  stage.querySelector('#backedStrip').innerHTML =
    `<div class="by"><span class="lead">${esc(BACKED.lead)}</span><span class="name">${esc(BACKED.name)}</span></div><span class="sep"></span>` +
    `<div class="pf"><span class="lbl">${esc(BACKED.label)}</span><span class="cos">${BACKED.partners.map(esc).join('<i>·</i>')}</span></div>`;

  stage.querySelector('#docsToggle').innerHTML = `<span>${esc(DOCS.toggle)}</span>${ICON_CHEVRON}`;
  stage.querySelector('#docsPanel').innerHTML = `<ul>${DOCS.links.map(l => `<li><a href="${esc(l.href)}" tabindex="-1"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(l.text)}${ICON_ARROW}</a></li>`).join('')}</ul>`;

  stage.querySelector('#leadSheet').innerHTML =
    `<div class="shade"></div><div class="sheet"><button class="x" type="button" aria-label="Close">×</button>` +
    `<form novalidate><div class="shTitle" id="leadTitle">${esc(LEAD.title)}</div><div class="shSub">${esc(LEAD.sub)}</div>` +
    LEAD.fields.map(f => `<div class="fld"><label for="f-${f.id}">${esc(f.label)}</label><input id="f-${f.id}" name="${f.id}" type="${f.type}" autocomplete="${f.autocomplete}"></div>`).join('') +
    `<button class="btn" type="submit"><span>${esc(LEAD.submit)}</span><span aria-hidden="true">→</span></button>` +
    `<div class="ok" hidden>${esc(LEAD.ok)}</div></form></div>`;
}
