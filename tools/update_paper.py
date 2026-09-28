#!/usr/bin/env python3
"""Copy the approved PDF and extract Table 2 without manually transcribing scores."""
import argparse
import ast
import hashlib
import json
from pathlib import Path
import re
import shutil

SITE = Path(__file__).resolve().parents[1]
NAMES = [
    ('Single rollout', 'single', 'Single rollout'),
    ('Majority voting', 'majority', 'Majority voting'),
    ('Best-of-', 'best_of_n', 'Best-of-N with judge'),
    ('Pairwise tournament', 'pairwise', 'Pairwise tournament'),
    ('LLM-as-a-Verifier', 'llm_verifier', 'LLM-as-a-Verifier'),
    ('Agentic verifier (env. access)', 'agentic', 'Agentic verifier (env. access)'),
    ('\\harnessname{} (select)', 'ours_select', 'VeriHarness (select)'),
    ('\\harnessname{} in Gemini CLI', 'cli_gemini', 'VeriHarness in Gemini CLI'),
    ('\\harnessname{} in Claude Code', 'cli_claude', 'VeriHarness in Claude Code'),
    ('\\harnessname{} in Codex', 'cli_codex', 'VeriHarness in Codex'),
    ('Selection oracle', 'oracle', 'Selection oracle'),
    ('Aggregation over the pool', 'aggregation', 'Aggregation over the pool'),
    ('Agentic verifier + revision', 'agentic_revision', 'Agentic verifier + revision'),
    ('\\harnessname{}', 'ours_revision', 'VeriHarness'),
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('overleaf', type=Path)
    args = parser.parse_args()
    source = args.overleaf.resolve()
    table_path = source / 'sections/05-experiments.tex'
    table = table_path.read_text().split('\\label{tab:main}', 1)[1].split('\\end{table}', 1)[0]
    data = {'models': {}, 'libraries': {}}
    current = None
    for line in table.splitlines():
        for name, key in [('Gemini 3.5 Flash', 'gemini'), ('Claude Opus 4.8', 'opus')]:
            if name in line:
                current = {'name': name, 'rows': []}
                data['models'][key] = current
        if current is None or '&' not in line:
            continue
        cells = line.split('&')
        if len(cells) != 7:
            continue
        if 'gain over' in line:
            gains = [float(re.findall(r'[+-]\d+\.\d+', cell)[-1]) for cell in cells[1:]]
            current['rows'][-1]['gain'] = {'avg': gains[0], 'values': gains[1:]}
            continue
        for match, key, name in NAMES:
            if match not in cells[0]:
                continue
            avg = float(re.findall(r'\d+\.\d+', cells[1])[-1])
            values = []
            for cell in cells[2:]:
                numbers = [float(n) for n in re.findall(r'\d+\.\d+', cell)]
                assert len(numbers) in (1, 2), cell
                values.append({'mean': numbers[0], 'std': numbers[1] if len(numbers) == 2 else None})
            group = ('CLI deployments' if key.startswith('cli_') else
                     'Selection oracle (grader-informed)' if key == 'oracle' else
                     'With revision' if key in ('aggregation', 'agentic_revision', 'ours_revision') else
                     'Primary selection comparison')
            current['rows'].append({'name': name, 'key': key, 'group': group, 'avg': avg, 'values': values})
            break
    assert set(data['models']) == {'gemini', 'opus'}
    for model in data['models'].values():
        assert len(model['rows']) == 13, (model['name'], len(model['rows']))
        assert {row['key'] for row in model['rows'] if 'gain' in row} == {'ours_select', 'ours_revision'}
        assert len({row['key'] for row in model['rows']}) == 13
    library_path = source.parent / 'paper_figures/four_libraries.py'
    for node in ast.parse(library_path.read_text()).body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'SCORES' for t in node.targets):
            scores = ast.literal_eval(node.value)
            for name, key in [('APEX-Agents', 'apex'), ('SpreadsheetBench 2', 'sb2')]:
                data['libraries'][key] = [scores[name][letter] for letter in 'ABCD']
    assert set(data['libraries']) == {'apex', 'sb2'}
    (SITE / 'data.js').write_text('// Extracted from the approved paper; see tools/update_paper.py.\nconst PAPER_DATA = ' + json.dumps(data, indent=2) + ';\n')
    assets = SITE / 'assets'
    assets.mkdir(exist_ok=True)
    pdf = source / 'build/main.pdf'
    shutil.copyfile(pdf, assets / 'paper.pdf')
    sources = [source / 'main.tex', table_path, library_path, pdf]
    manifest = {'description': 'Preview snapshot of the approved local Overleaf paper.',
                'sources': [{'file': str(p.relative_to(source.parent)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sources]}
    (SITE / 'paper-snapshot.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print('Updated 26 method rows, two library comparisons, and the paper PDF.')


if __name__ == '__main__':
    main()
