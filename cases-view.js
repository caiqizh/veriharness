'use strict';

(() => {
  const root = document.querySelector('#case-study');
  const tabs = document.querySelector('#case-tabs');
  if (!root || !tabs || typeof CASE_DATA === 'undefined') return;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const score = value => value.toFixed(2);
  const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
  let active = 0;

  function recordFields(entry, fields) {
    return `<dl class="case-record">${fields.filter(([key]) => entry[key]).map(([key, label]) =>
      `<div><dt>${label}</dt><dd>${escapeHtml(entry[key])}</dd></div>`).join('')}</dl>`;
  }

  function entries(list, kind) {
    const fields = kind === 'resolver'
      ? [['question', 'Question'], ['checked', 'Checked'], ['found', 'Found'], ['verdict', 'Verdict']]
      : [['claim', 'Shared claim'], ['tried', 'Tried'], ['found', 'Found'], ['because', 'Verdict']];
    return list.map((entry, index) => {
      const chip = kind === 'resolver'
        ? `<span class="case-chip">${escapeHtml(entry.outcome)}</span>`
        : entry.holds === false ? '<span class="case-chip refuted">Refuted</span>'
          : entry.holds === true ? '<span class="case-chip holds">Holds</span>'
            : '<span class="case-chip">Left open</span>';
      return `<details class="case-entry">
        <summary><span class="case-entry-text">${escapeHtml(entry.summary)}</span>${chip}<span class="case-toggle" aria-hidden="true"></span></summary>
        <p class="case-record-label">From the verification record</p>
        ${recordFields(entry, fields)}
      </details>`;
    }).join('');
  }

  function pool(data) {
    return data.groups.map(group => `<div class="pool-group">
      <p class="pool-label">${escapeHtml(group.label)}</p>
      <div class="pool-tiles">${group.rollouts.map(rollout => {
        const base = rollout.id === data.base;
        return `<div class="pool-tile${base ? ' base' : ''}" title="${rollout.id}: score ${score(rollout.score)}${base ? ', selected as the base' : ''}">
          <span class="pool-id">${rollout.id}${base ? '<em>base</em>' : ''}</span>
          <strong>${score(rollout.score)}</strong>
          <span class="pool-bar" aria-hidden="true"><i style="--value:${rollout.score}"></i></span>
        </div>`;
      }).join('')}</div>
    </div>`).join('');
  }

  function scoreTrack(scores) {
    const items = [['mean', 'Average rollout'], ['best', 'Best rollout'], ['delivered', 'Delivered']];
    return `<div class="score-track" role="img" aria-label="Average rollout ${score(scores.mean)}, best rollout ${score(scores.best)}, delivered ${score(scores.delivered)}">
      <div class="score-line" aria-hidden="true">
        <span class="score-fill" style="--from:${scores.mean};--to:${scores.delivered}"></span>
        ${items.map(([key]) => `<i class="score-dot ${key}" style="--value:${scores[key]}"></i>`).join('')}
      </div>
      <div class="score-legend">${items.map(([key, label]) =>
        `<div class="score-item ${key}"><strong>${score(scores[key])}</strong><span>${label}</span></div>`).join('')}</div>
    </div>`;
  }

  function delivery(data) {
    const revised = data.work_total > 0;
    const work = data.work.map(item => `<div class="work-item">
      <p class="work-what">${escapeHtml(item.what)}</p>
      <p class="work-to"><span aria-hidden="true">→</span> ${escapeHtml(item.to)}</p>
    </div>`).join('');
    const changes = data.changes.map(item =>
      `<p class="change"><code>${escapeHtml(item.file)}</code> ${escapeHtml(item.what)}</p>`).join('');
    const open = data.open.map(item => `<div class="open-item">
      <p class="open-title">${escapeHtml(item.item)}</p>
      <ul>${item.readings.map(reading => `<li>${escapeHtml(reading)}</li>`).join('')}</ul>
      <p class="open-prefer"><strong>Preferred:</strong> ${escapeHtml(item.prefer)}</p>
    </div>`).join('');
    return `<div class="case-delivery">
      <div class="delivery-head">
        <p class="eyebrow"><span class="step-number delivery-step">3</span> Adjudication → delivery</p>
        <p class="delivery-decision">Base <strong>${data.base}</strong> · ${revised
          ? `revised with ${plural(data.work_total, 'supported change')}` : 'delivered unchanged'}</p>
      </div>
      <p class="delivery-notes">${escapeHtml(data.notes)}</p>
      <div class="delivery-grid">
        ${revised ? `<div><h4>Work order</h4>${work}${changes ? `<h4>Change made</h4>${changes}` : ''}</div>` : ''}
        ${open ? `<div><h4>Left open in the record <span>${data.open.length} of ${data.open_total}</span></h4>${open}</div>` : ''}
      </div>
    </div>`;
  }

  function render(index, focus) {
    active = (index + CASE_DATA.length) % CASE_DATA.length;
    const data = CASE_DATA[active];
    const count = data.groups.reduce((total, group) => total + group.rollouts.length, 0);
    tabs.querySelectorAll('button').forEach((button, position) => {
      const selected = position === active;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    });
    root.setAttribute('aria-labelledby', `case-tab-${data.id}`);
    root.innerHTML = `<div class="case-panel">
      <header class="case-header">
        <div class="case-summary">
          <p class="case-meta"><span>${escapeHtml(data.benchmark)}</span><span>${escapeHtml(data.model)}</span><span>${escapeHtml(data.deliverable)}</span></p>
          <h3>${escapeHtml(data.title)}</h3>
          <p class="case-task"><strong>Task</strong> ${escapeHtml(data.task)}</p>
        </div>
        ${scoreTrack(data.scores)}
      </header>
      <div class="case-body">
        <section class="case-stage">
          <p class="stage-label"><span class="step-number candidate-step">1</span> The pool <span class="stage-description">${plural(count, 'rollout')} from ${escapeHtml(data.model)}, scored by the benchmark</span></p>
          <div class="pool">${pool(data)}</div>
        </section>
        <section class="case-stage">
          <p class="stage-label"><span class="step-number investigation-step">2</span> Independent investigations <span class="stage-description">Separate contexts, same model</span></p>
          <div class="case-branches">
            <article class="case-branch resolver">
              <header><span class="icon" aria-hidden="true">≠</span><div><h4>Disagreement resolver</h4><p>${plural(data.counts.disagreements, 'disagreement')} examined · ${data.resolver.length} shown · select one to read the record</p></div></header>
              ${entries(data.resolver, 'resolver')}
            </article>
            <article class="case-branch challenger">
              <header><span class="icon" aria-hidden="true">=</span><div><h4>Consensus challenger</h4><p>${plural(data.counts.challenges, 'shared claim')} tested · ${data.counts.refuted} refuted · ${data.challenger.length} shown · select one to read the record</p></div></header>
              ${entries(data.challenger, 'challenger')}
            </article>
          </div>
        </section>
        <section class="case-stage">${delivery(data)}</section>
        <p class="case-takeaway">${escapeHtml(data.takeaway)}</p>
        <div class="case-nav"><button class="button small" type="button" data-step="-1">← Previous case</button><span>${active + 1} / ${CASE_DATA.length}</span><button class="button small" type="button" data-step="1">Next case →</button></div>
      </div>
    </div>`;
    root.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
      render(active + Number(button.dataset.step));
      tabs.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }));
  }

  tabs.innerHTML = CASE_DATA.map((data, index) => `<button type="button" role="tab" id="case-tab-${data.id}" aria-controls="case-study" aria-selected="false" tabindex="-1">
    <span class="tab-index">0${index + 1}</span>
    <span class="tab-name">${escapeHtml(data.benchmark)}</span>
    <span class="tab-kind">${escapeHtml(data.deliverable)}</span>
    <span class="tab-gain">${score(data.scores.mean)} → ${score(data.scores.delivered)}</span>
  </button>`).join('');
  tabs.querySelectorAll('button').forEach((button, index) => button.addEventListener('click', () => render(index)));
  tabs.addEventListener('keydown', event => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (event.key === 'Home') render(0, true);
    else if (event.key === 'End') render(CASE_DATA.length - 1, true);
    else if (step) render(active + step, true);
    else return;
    event.preventDefault();
  });
  render(0);
})();
