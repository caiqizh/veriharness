'use strict';

const $ = (selector) => document.querySelector(selector);
const state = { resolved: false, challenged: false, delivered: false, playing: false, timers: [] };

function cancelPlayback() {
  state.timers.forEach(clearTimeout);
  state.timers = [];
  state.playing = false;
  $('#play-button').textContent = '▶ Play walkthrough';
}

function updateDemo() {
  const checks = Number(state.resolved) + Number(state.challenged);
  $('#resolver-evidence').textContent = state.resolved
    ? 'Version history: final supersedes draft.\nFinal report: FY2025 revenue = 120m.\nVerdict: 100m cites a superseded source.'
    : 'A check that separates the alternatives:\ninspect the report’s version history.';
  $('#challenger-evidence').textContent = state.challenged
    ? 'Source metadata: currency = EUR.\nAll three candidates label it USD.\nVerdict: a shared currency error.'
    : 'A check that tests the shared assumption:\ninspect the report’s currency metadata.';
  $('#resolver-evidence').classList.toggle('revealed', state.resolved);
  $('#challenger-evidence').classList.toggle('revealed', state.challenged);
  $('#resolve-button').disabled = state.resolved;
  $('#challenge-button').disabled = state.challenged;
  $('#resolve-button').textContent = state.resolved ? '✓ Version evidence recorded' : 'Inspect version history ↗';
  $('#challenge-button').textContent = state.challenged ? '✓ Currency evidence recorded' : 'Inspect currency metadata ↗';
  for (const id of ['a', 'b']) {
    $(`#candidate-${id}`).classList.toggle('rejected', state.resolved);
    $(`#candidate-${id} .candidate-status`).textContent = state.resolved ? 'Superseded revenue source' : state.challenged ? 'Shared currency error' : `Agrees with ${id === 'a' ? 'B' : 'A'}`;
  }
  $('#candidate-c').classList.toggle('selected', state.resolved);
  $('#candidate-c .candidate-status').textContent = state.resolved ? (state.challenged ? 'Correct amount · wrong currency' : 'Amount supported by final report') : state.challenged ? 'Shared currency error' : 'A different revenue figure';
  $('#adjudicate-button').disabled = checks < 2 || state.delivered;
  $('#adjudicate-button').textContent = state.delivered ? '✓ Artifact revised' : 'Combine the findings →';
  $('#delivery').classList.toggle('complete', state.delivered);
  $('#delivery-result').textContent = state.delivered ? 'EUR 120m' : 'What should be delivered?';
  $('#delivery-description').textContent = state.delivered ? 'Use rollout C as the base. Correct USD to EUR using the source metadata. Attach both evidence records.' : checks === 2 ? 'Both records are ready. Adjudication can now select a base and specify the revision.' : 'Gather both evidence records to select a base and make a supported revision.';
  $('#ledger').hidden = !state.delivered;
  $('#demo-status').textContent = state.delivered ? 'Delivered with an evidence-backed revision' : `${checks} of 2 evidence checks complete`;
}

function resetDemo() {
  cancelPlayback();
  state.resolved = state.challenged = state.delivered = false;
  $('#ledger').open = false;
  updateDemo();
}

$('#resolve-button').addEventListener('click', () => { cancelPlayback(); state.resolved = true; updateDemo(); });
$('#challenge-button').addEventListener('click', () => { cancelPlayback(); state.challenged = true; updateDemo(); });
$('#adjudicate-button').addEventListener('click', () => { cancelPlayback(); state.delivered = true; updateDemo(); });
$('#reset-button').addEventListener('click', resetDemo);
$('#play-button').addEventListener('click', () => {
  if (state.playing) { cancelPlayback(); return; }
  if (state.delivered) resetDemo();
  state.playing = true;
  $('#play-button').textContent = 'Ⅱ Pause walkthrough';
  const steps = [];
  if (!state.resolved) steps.push(() => { state.resolved = true; });
  if (!state.challenged) steps.push(() => { state.challenged = true; });
  steps.push(() => { state.delivered = true; });
  steps.forEach((step, index) => {
    state.timers.push(setTimeout(() => {
      step(); updateDemo();
      if (index === steps.length - 1) cancelPlayback();
    }, 600 + index * 2000));
  });
});
document.addEventListener('visibilitychange', () => { if (document.hidden) cancelPlayback(); });

const colors = ['#FBBC04', '#4285F4', '#34A853'];
const benchmarks = ['APEX-Agents', 'Workspace-Bench Lite', 'WorkBuddy Bench', 'SpreadsheetBench 2', 'JobBench'];
let activeModel = 'gemini';

function benchmarkPlot(rows, index, zeroBaseline) {
  const values = rows.map(row => row.values[index].mean);
  // Same limits and tick-spacing rule as paper_figures/summary_bars.py.
  const low = zeroBaseline ? 0 : Math.floor(Math.min(...values)) - 1.5;
  const high = zeroBaseline ? 100 : Math.ceil(Math.max(...values)) + 2.5;
  const step = zeroBaseline ? 25 : high - low <= 12 ? 2 : 5;
  const y = value => 191 - (value - low) / (high - low) * 169;
  const ticks = [];
  for (let tick = Math.ceil(low / step) * step; tick <= high; tick += step) {
    ticks.push(`<g class="plot-tick"><line x1="32" x2="206" y1="${y(tick)}" y2="${y(tick)}"/><text x="26" y="${y(tick) + 3.5}" text-anchor="end">${tick}</text></g>`);
  }
  return `<svg class="benchmark-plot" viewBox="0 0 214 213" aria-hidden="true" data-min="${low}" data-max="${high}">
    ${ticks.join('')}
    <path class="plot-axis" d="M32 18V191H206"/>
    ${values.map((value, j) => {
      const x = 45 + j * 56;
      return `<g class="plot-bar" data-score="${value}"><title>${rows[j].name}: ${value.toFixed(1)}</title><rect x="${x}" y="${y(value)}" width="37" height="${191 - y(value)}" fill="${colors[j]}" fill-opacity=".85" rx="1"/><text x="${x + 18.5}" y="${y(value) - 7}" text-anchor="middle">${value.toFixed(1)}</text></g>`;
    }).join('')}
    ${zeroBaseline ? '' : '<path class="axis-break" d="m28 196 8-4m-8 9 8-4"/>'}
    <text class="plot-range" x="120" y="210" text-anchor="middle">${low}–${high}</text>
  </svg>`;
}

function renderResults(modelKey) {
  activeModel = modelKey;
  const model = PAPER_DATA.models[modelKey];
  const baseline = model.rows.find(row => row.key === 'single');
  const agentic = model.rows.find(row => row.key === 'agentic_revision');
  const ours = model.rows.find(row => row.key === 'ours_revision');
  document.querySelectorAll('[data-model]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.model === modelKey)));
  $('#result-summary').innerHTML = `Average native benchmark score: <b>${baseline.avg.toFixed(1)} → ${ours.avg.toFixed(1)}</b><br>Single rollout → VeriHarness with evidence-backed revision`;
  $('#result-gain').textContent = `+${ours.gain.avg.toFixed(1)} pts`;
  const zeroBaseline = $('#zero-baseline').checked;
  $('#axis-description').textContent = zeroBaseline
    ? 'Native benchmark score · shared 0–100 axes'
    : 'Native benchmark score · per-benchmark axes, non-zero origins';
  $('#result-chart').setAttribute('aria-label', `${model.name}: single rollout, agentic verifier with revision, and VeriHarness scores. ${zeroBaseline ? 'All axes span 0–100.' : 'Each benchmark has its own labeled, non-zero axis range.'} Exact values follow in the table.`);
  $('#result-chart').replaceChildren();
  benchmarks.forEach((name, index) => {
    const group = document.createElement('div');
    group.className = 'chart-group';
    group.innerHTML = `<h3>${name}</h3>${benchmarkPlot([baseline, agentic, ours], index, zeroBaseline)}<p class="chart-gain">+${ours.gain.values[index].toFixed(1)} pts over single</p>`;
    $('#result-chart').append(group);
  });
  $('#table-caption').textContent = `All methods, ${model.name}. Mean and cross-seed standard deviation.`;
  $('#results-body').replaceChildren();
  let group = '';
  for (const row of model.rows) {
    if (row.group !== group) {
      group = row.group;
      const heading = document.createElement('tr');
      heading.className = 'group-row';
      heading.innerHTML = `<th colspan="7" scope="colgroup">${group}</th>`;
      $('#results-body').append(heading);
    }
    const tr = document.createElement('tr');
    if (row.key.startsWith('ours')) tr.className = 'ours-row';
    tr.innerHTML = `<th scope="row">${row.name}</th><td>${row.avg.toFixed(1)}</td>${row.values.map(value => `<td>${value.mean.toFixed(1)}${value.std === null ? '' : `<span class="std">± ${value.std.toFixed(1)}</span>`}</td>`).join('')}`;
    $('#results-body').append(tr);
  }
}
document.querySelectorAll('[data-model]').forEach(button => button.addEventListener('click', () => renderResults(button.dataset.model)));
$('#zero-baseline').addEventListener('change', () => renderResults(activeModel));

function renderLibraries() {
  const data = PAPER_DATA.libraries[$('#evolution-benchmark').value];
  const labels = ['A · Empty library', 'B · Human-authored', 'C · Evolved from empty', 'D · Evolved from human'];
  const libraryColors = ['#FBBC04', '#4285F4', '#34A853', '#EA4335'];
  $('#library-bars').innerHTML = data.map((score, i) => `<div class="library-row"><span>${labels[i]}</span><div class="library-track" aria-hidden="true"><div class="library-fill" style="--score:${score};--color:${libraryColors[i]}"></div></div><strong>${score.toFixed(1)}</strong></div>`).join('');
  $('#library-note').innerHTML = `Evolving from the human-authored library adds <strong>${(data[3] - data[1]).toFixed(1)} points</strong>; evolving from empty adds <strong>${(data[2] - data[0]).toFixed(1)} points</strong>.`;
}
$('#evolution-benchmark').addEventListener('change', renderLibraries);
$('#copy-citation').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('#bibtex').textContent);
    $('#copy-status').textContent = 'BibTeX copied to clipboard.';
    $('#copy-citation').textContent = '✓ Copied';
  } catch {
    const range = document.createRange();
    range.selectNodeContents($('#bibtex'));
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    $('#copy-status').textContent = 'BibTeX selected. Press Ctrl+C or ⌘C to copy.';
  }
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-15% 0px -65% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}

renderResults('gemini');
renderLibraries();
