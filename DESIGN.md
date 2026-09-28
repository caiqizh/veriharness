# Visual direction

The visual source of truth is the approved version in
`veriharness-paper/visualization_design/DESIGN_GUIDE.md` and its `after/` figures.
The website adopts its colors and their meanings without modifying the paper.

| Role | Figure hue | Light background | Small-text color |
| --- | --- | --- | --- |
| Candidate rollouts / comparison baseline | `#4285F4` | `#E8F0FE` | `#174EA6` |
| Disagreement resolver / single rollout | `#FBBC04` | `#FEF7E0` | `#8A4B00` |
| Consensus challenger / errors | `#EA4335` | `#FCE8E6` | `#B3261E` |
| Adjudication / VeriHarness / correct outcomes | `#34A853` | `#E6F4EA` | `#137333` |

Use the original hues for fills, rules, graph lines, and diagram outlines.
Chart fills and legend chips use an 85% mix over white, matching the approved
figure opacity; text is fully opaque. Do not replace the colors with muted
ochre, slate blue, dusty red, or gray green. Small colored text uses darker
variants so it remains readable.

The V3 page uses white, near-black text, and a near-black primary action.
The four letters of “Veri” use blue, red, yellow, and green respectively;
“Harness” is near-black. Navigation, headings, summary backgrounds, rules,
and controls have no dominant color. Green is reserved for semantic uses in
the method and its evidence (adjudication, correct outcomes, VeriHarness bars).
The approved green V1 remains unchanged in its saved preview and source archive.
V2's neutral design is also preserved in its named preview and source archive.
The split hero places the paper title beside a compact explanation of the
two investigations. The color comes from the method and evidence, with the
same visual vocabulary repeated in the interactive walkthrough and results.
Blue remains a semantic color for candidate rollouts and comparison methods.

V3 refines the neutral direction with a separate `refinement.css` stylesheet:

- Observation: a narrow introductory column beside two large, unboxed findings.
- Method: a quiet neutral surface around a white, lightly elevated workspace;
  explicit stage numbers, colored investigation symbols, and evidence panels.
- Results: open chart comparisons with the same axes and data as V2; a concise
  summary, rounded model controls, and no surrounding chart cards.
- Evolution: a small colored checking sequence alongside the library comparison.
- Citation: an editorial two-column layout that stacks on narrow screens.

V3's readability update uses 17–18px introductory text, 16–17px explanatory
paragraphs, 14px captions, and 15px buttons. Display headings keep their scale.
Chart labels are enlarged; result panels wrap to three columns on tablets and
one column on small phones. Candidate cards and observations stack on phones
so their text can stay legible. The original V3 is retained in commit `5eb8c15`.

The refinement takes cues from the typography, spacing, and restrained controls
of https://research.google/ and https://deepmind.google/research/. Hover feedback
is brief, works with keyboard focus, and respects reduced-motion preferences.
The main method walkthrough retains its explicit play/pause controls; there are
no new looping animations or automatic changes to the experimental data.

The main-results chart follows the paper's per-benchmark axis calculation:
`low = floor(min(values)) - 1.5`, `high = ceil(max(values)) + 2.5`; tick spacing
is 2 points for spans of at most 12 points and 5 otherwise. Each axis has tick
labels, a range label, and a break mark; the caption states that the axes start
above zero. An optional 0–100 view restores a common zero baseline. The page
continues to compare against the agentic verifier with revision; only the axis
design is borrowed from the paper's summary figure, which uses a different
comparison baseline. Data and comparison methods are unchanged.

The worked example remains illustrative. No data values or paper figures were
changed during the website visual revision.

After changing the site, rebuild the standalone file with:

```bash
python3 website/tools/build_preview.py VeriHarness-preview.html
```

Update any previously shared copy as well, particularly
`/tmp/veriharness-site-review/VeriHarness-preview.html`.
