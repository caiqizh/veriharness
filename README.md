# VeriHarness paper website

Preview of **VeriHarness: Scaling Agentic Verification for Long-Horizon Tasks**.
Plain HTML, CSS, and JavaScript; no npm installation or build step.

The current V3 variant uses neutral page chrome and a four-color “Veri” wordmark,
with editorial observation panels, layered white interactive surfaces, and
semantic color details. Its refinements are in `refinement.css`.
The original blue/yellow/red/green figure palette still identifies method stages
and chart series. The approved green V1 is preserved as `../VeriHarness-V1.html`,
with a complete source archive and screenshots in `../website-versions/v1/`.
V2 is also preserved as `../VeriHarness-V2.html` and `../website-versions/v2/`.
See `DESIGN.md` for exact colors and their roles.

## Preview

From the repository root:

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory website
```

Open http://localhost:4173. If working on a remote machine, forward port 4173
through your editor or SSH. Alternatively, open `index.html` directly; the
interactive examples and data work without a server. Clipboard access depends
on browser permissions, with a text-selection fallback.

For a single downloadable HTML file that embeds its scripts, styles, icon, and
paper PDF, run:

```bash
python3 website/tools/build_preview.py VeriHarness-preview.html
```

The only optional external resource is Google Fonts. System fonts take over
when the network is unavailable. There are no analytics, backend calls, model
requests, cookies, or API keys.

## Content and interaction

- Paper title, author order, affiliations, and citation follow the approved
  local Overleaf copy.
- The financial-report walkthrough reproduces the paper's illustrative
  example, clearly identified as an example, not a recorded experiment.
- Either investigation can be completed first. Both evidence records are
  required before adjudication. Playback can be paused, resumed, or reset.
- Table 2 contains all 13 method rows for each of the two models, including
  cross-seed standard deviations, CLI variants, and the selection oracle.
- The main bars compare the single rollout, agentic verifier with revision,
  and full VeriHarness. Default per-benchmark vertical limits and tick spacing
  follow `paper_figures/summary_bars.py`; ranges and axis breaks are explicit.
  A checkbox switches to shared 0–100 axes. The comparison methods and data
  stay the same in both views.
- The skill comparison reports final held-out scores, separately from the
  main full-benchmark evaluation.
- Keyboard focus, reduced-motion preferences, narrow screens, and clipboard
  fallback are supported.

`data.js` and `assets/paper.pdf` are a snapshot of the approved local paper.
Source hashes are recorded in `paper-snapshot.json`. To update them after the
paper is changed and its PDF is rebuilt:

```bash
python3 website/tools/update_paper.py /path/to/veriharness-paper/overleaf-review
```

The extractor reads the main results and the gain rows directly from LaTeX and
the final skill scores from `../paper_figures/four_libraries.py`. When changing the paper,
also review narrative claims, headline gains, author metadata, figure/section
numbers, and the BibTeX in `index.html` against the updated source.

## Publishing later

This version is local and has not been published. `CNAME` records the intended
domain `veriharness.com`; it does not configure DNS or make the site live.

The contents of this directory can be served by GitHub Pages. Deploy only
the website files, not the research repository or local run outputs. Before
publishing, confirm the paper PDF is the release version, add the public code
and arXiv links when available, and coordinate the domain records with the
collaborator who owns the domain. There are no placeholder public links.

## Preview validation

Checked in Chromium: both investigation orders and the adjudication gate;
reset and playback/pause; model and skill-benchmark switching; all result
rows; clipboard copy; local PDF/assets; keyboard operation; reduced motion;
and viewport widths 320, 375, 390, 768, 1024, and 1440 pixels. No JavaScript
errors or page-level horizontal overflow were observed.
