#!/usr/bin/env python3
"""Build cases.js from recorded verification runs.

Record text (questions, checks, findings, verdicts, work orders) is copied from
the run's ledger files and only shortened at sentence boundaries, marked […].
Titles, task summaries, group labels, and takeaways are written for the site.
"""
import argparse
import json
from pathlib import Path
import re

SITE = Path(__file__).resolve().parents[1]
MARK = ' […]'

CASES = [
    {
        'id': 'apex', 'cell': 'apex_opus', 'data': 'apex/opus', 'task_key': '419_MC',
        'benchmark': 'APEX-Agents', 'model': 'Claude Opus 4.8', 'deliverable': 'Consulting analysis',
        'tags': ['Resolve', 'Challenge', 'Revise'],
        'title': 'A fork and a shared error in the same pool.',
        'task': 'From a client’s SKU data, report the top four customers by three-year revenue, their gross margin '
                'by product family, and their hybrid and EV order volume with its growth rate.',
        'groups': [
            ('Used the sample the client team had rejected', ['r06', 'r08', 'r09']),
            ('Merged all three data files', ['r01', 'r04']),
            ('Used the corrected dataset', ['r02', 'r03', 'r05', 'r07']),
        ],
        'resolver': [
            (0, '4 of 9 stand', 'Which data file is the basis? The email thread shows the client team rejected the '
                                'earlier sample and sent a corrected list.'),
            (2, '4 of 9 stand', 'Who are the top four customers? The corrected file gives one ranking and the other '
                                'files give another.'),
        ],
        'challenger': [
            (0, 'Every rollout on the corrected dataset reports revenue in euros. The workbook’s own formula '
                'divides by 100, because the prices are in cents.'),
            (4, 'Growth is computed point to point. The task asks for growth over the period, so the shared '
                'reading stands.'),
        ],
        'work': [0], 'changes': [0], 'open': [1],
        'takeaway': 'The best rollout in the pool scores 0.40. The delivered answer scores 0.80, because the revision '
                    'corrects a unit error that every rollout on the right dataset shares.',
    },
    {
        'id': 'law', 'cell': 'apex_flash', 'data': 'apex/flash', 'task_key': '265_Law',
        'benchmark': 'APEX-Agents', 'model': 'Gemini 3.5 Flash', 'deliverable': 'Legal opinion',
        'tags': ['Resolve', 'Challenge', 'Revise'],
        'title': 'Ten rollouts answer yes. The case file says no.',
        'task': 'A landlord settled a tenant’s flooding claim for $50,000 and expects to spend $8,000 more suing '
                'its subcontractor under an indemnity clause. Is it likely to recover all $58,000? Answer yes or '
                'no, with one or two sentences of explanation.',
        'groups': [
            ('Answered yes', ['r01', 'r02', 'r03', 'r05', 'r06', 'r07', 'r08', 'r09', 'r10']),
            ('Answered yes, and noted when the fees would be recoverable', ['r04']),
        ],
        'resolver': [
            (0, 'None stands', 'Are the $8,000 in fees recoverable? In the court opinion in the case file, such fees '
                               'were allowed only because that contract had a separate fee clause.'),
            (2, '5 of 10 stand', 'Does the answer follow the requested format? Five rollouts use the two numbered '
                                 'parts. One submits a long memorandum.'),
        ],
        'challenger': [
            (0, 'All ten say the indemnity clause covers both amounts. The court opinion, read from the scanned '
                'file, says the fees for suing under the indemnity are not covered.'),
            (1, 'All ten say no proof of fault is needed to recover the settlement. The opinion confirms it.'),
        ],
        'work': [0, 1], 'changes': [0], 'open': [],
        'limits': {'found': 560, 'to': 520, 'notes': 700},
        'takeaway': 'Every rollout gives the same answer, so there is nothing to select. The challenger reads the '
                    'court opinion in the case file and finds the sentence that decides the question. Every rollout '
                    'scored 0.33, and the revised answer scores 1.00.',
    },
    {
        'id': 'sb2', 'cell': 'sb2_opus', 'data': 'sb2/opus', 'task_key': 'Debugging__01_01',
        'benchmark': 'SpreadsheetBench 2', 'model': 'Claude Opus 4.8', 'deliverable': 'Financial model workbook',
        'tags': ['Resolve', 'Challenge', 'Select'],
        'title': 'One rollout in ten is right, and the evidence finds it.',
        'task': 'Audit a leveraged-buyout model workbook and fix the errors in its formulas.',
        'groups': [
            ('Left the cash double count in place', ['r08', 'r10']),
            ('Fixed the cash double count only', ['r01', 'r02', 'r03', 'r04', 'r06', 'r07', 'r09']),
            ('Fixed both double counts', ['r05']),
        ],
        'resolver': [
            (0, '8 of 10 stand', 'The returns table subtracts net debt and then adds cash again. Eight rollouts '
                                 'fix this.'),
            (2, '1 of 10 stands', 'The acquisition totals add the prior year to sums that are already cumulative. '
                                  'The sibling tables show the intended formula.'),
        ],
        'challenger': [
            (2, 'Eight rollouts treat the acquisition totals as correct. Every sibling table uses a plain sum, and '
                'the pattern appears nowhere else in the workbook.'),
            (1, 'The cash fix that eight rollouts made is recomputed from the inputs and confirmed.'),
        ],
        'work': [], 'changes': [], 'open': [0],
        'takeaway': 'Eight of ten workbooks miss the second error, so agreement points the wrong way. The verifier '
                    'compares the formula with its sibling tables and delivers the one complete workbook unchanged.',
    },
    {
        'id': 'wb', 'cell': 'wb_opus', 'data': 'wb/opus',
        'task_key': 'code__repo_understanding-hard-interface_http_flow',
        'benchmark': 'WorkBuddy Bench', 'model': 'Claude Opus 4.8', 'deliverable': 'Code analysis',
        'tags': ['Resolve', 'Challenge', 'Revise'],
        'title': 'Ten analyses agree. None measured the summary limit.',
        'task': 'Without changing any code, explain how an HTTP client library turns a Java interface call into a '
                'request and decodes the response. Deliver a JSON file with a summary of at most 200 characters '
                'and a file and line number for every fact.',
        'groups': [
            ('Leanest analysis', ['r03']),
            ('Complete, with less detail', ['r05', 'r06', 'r07', 'r08', 'r09', 'r10']),
            ('Most detailed', ['r01', 'r02', 'r04']),
        ],
        'resolver': [
            (1, '10 of 10 stand', 'Are the cited files and line numbers real? Every cited file exists. The lines on '
                                  'the core request path are checked, and they match.'),
            (3, 'r04 goes deepest', 'How much of the request path does each analysis cover? All ten cover every '
                                    'required topic. They differ in depth.'),
        ],
        'challenger': [
            (0, 'Every rollout treats its summary as short enough. Counted as total characters, all ten exceed '
                'the limit of 200. Counted as Chinese characters only, all ten are within it.'),
            (2, 'Every cited path and line is taken to be real. A check of all paths and a sample of lines '
                'confirms it.'),
        ],
        'work': [0, 1], 'changes': [0, 1], 'open': [],
        'limits': {'to': 230, 'because': 330},
        'takeaway': 'The ten analyses agree on the substance. The challenger measures each summary against the '
                    'length limit. The revision shortens it to satisfy both ways of counting, adds verified facts '
                    'from two other rollouts, and scores above every rollout in the pool.',
    },
    {
        'id': 'jb', 'cell': 'jb_opus', 'data': 'jb/opus', 'task_key': 'mechanical_engineering_technicians__task2',
        'benchmark': 'JobBench', 'model': 'Claude Opus 4.8', 'deliverable': 'Engineering report',
        'tags': ['Resolve', 'Challenge', 'Revise'],
        'title': 'The task named a standard. One rollout in ten read it.',
        'limits': {'found': 760, 'notes': 640},
        'task': 'Assess a pump’s vibration retest against the contract and the applicable standards, recommend '
                'acceptance, and deliver a report, a non-conformance record, and two plots.',
        'groups': [
            ('Treated the cover-sheet limit as governing', ['r10']),
            ('Used the contract limit', ['r01', 'r02', 'r03', 'r06', 'r07', 'r08', 'r09']),
            ('Used the contract limit and the table for this pump type', ['r04', 'r05']),
        ],
        'resolver': [
            (1, '9 of 10 stand', 'Which limit governs acceptance? The contract sets 3.8 mm/s. The 4.5 mm/s figure '
                                 'is a note on the test cover sheet.'),
            (2, 'r04 and r05 stand', 'Which table of the guideline applies? The pump is horizontal and overhung, so '
                                     'the table for that geometry applies.'),
        ],
        'challenger': [
            (2, 'The task names a guideline to consult. A copy sits in the workspace and no rollout opened it. '
                'Only r05 found the document online.'),
            (0, 'All ten recommend conditional acceptance. Recomputing the retest readings against the contract '
                'limit confirms it.'),
        ],
        'work': [0], 'changes': [0], 'open': [0],
        'takeaway': 'All ten rollouts reach the same recommendation, and it holds. The challenger still checks what '
                    'the recommendation rests on, and finds that only one rollout read the standard the task named.',
    },
]

LIMITS = {'question': 360, 'claim': 360, 'checked': 400, 'tried': 400, 'found': 440, 'verdict': 340,
          'because': 400, 'what': 320, 'to': 400, 'evidence': 320, 'item': 240, 'prefer': 280, 'reading': 220,
          'notes': 330}


def abridge(text, limit):
    text = str(text).replace('\\\textit', '\\textit')  # a tab left by an unescaped backslash in the record
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) <= limit:
        return text
    window = text[:limit]
    ends = [m.end() for m in re.finditer(r'\.(?=\s)', window) if m.end() > 40]
    ends = ends or [m.end() for m in re.finditer(r';(?=\s)', window) if m.end() > limit * 0.5]
    cut = ends[-1] if ends else window.rfind(' ')
    return text[:cut].rstrip() + MARK


def field(record, name, limits):
    value = record.get(name)
    return None if value in (None, '') else abridge(value, limits[name])


def build(case, runs, data):
    run = runs / case['cell'] / case['task_key']
    elim, fals, finish, repair = (json.loads((run / f).read_text()) for f in
                                  ('ledger_elim.json', 'ledger_fals.json', 'finish.json', 'repair.json'))
    scores = json.loads((runs / case['cell'] / 'repair_scores.json').read_text())[case['task_key']]
    meta = json.loads((data / case['data'] / 'meta.json').read_text())[case['task_key']]['rollouts']
    pool = {name: rollout['score'] for name, rollout in meta.items() if rollout.get('score') is not None}
    grouped = [name for _, members in case['groups'] for name in members]
    assert sorted(grouped) == sorted(pool), (case['id'], sorted(set(pool) ^ set(grouped)))
    assert finish['base'] == scores['pick'], case['id']
    delivered = scores['pick_archived'] + scores['repaired'] - scores['pick_regraded']
    assert 0 <= delivered <= 1, (case['id'], delivered)
    challenges = fals['challenges']
    limits = {**LIMITS, **case.get('limits', {})}
    return {
        'id': case['id'], 'benchmark': case['benchmark'], 'model': case['model'],
        'deliverable': case['deliverable'], 'tags': case['tags'], 'title': case['title'], 'task': case['task'],
        'takeaway': case['takeaway'], 'base': finish['base'],
        'scores': {'mean': sum(pool.values()) / len(pool), 'best': max(pool.values()), 'delivered': delivered},
        'groups': [{'label': label, 'rollouts': [{'id': name, 'score': pool[name]} for name in members]}
                   for label, members in case['groups']],
        'counts': {'disagreements': len(elim['disagreements']), 'challenges': len(challenges),
                   'refuted': sum(item.get('holds') is False for item in challenges)},
        'resolver': [{'outcome': outcome, 'summary': summary,
                      **{name: field(elim['disagreements'][index], name, limits)
                         for name in ('question', 'checked', 'found', 'verdict')}}
                     for index, outcome, summary in case['resolver']],
        'challenger': [{'holds': challenges[index]['holds'], 'summary': summary,
                        **{name: field(challenges[index], name, limits) for name in ('claim', 'tried', 'found', 'because')}}
                       for index, summary in case['challenger']],
        'work': [{name: field(finish['work'][index], name, limits) for name in ('what', 'to', 'evidence')}
                 for index in case['work']],
        'changes': [{'file': repair['changes'][index]['file'].removeprefix('out/deliverables/'),
                     'what': field(repair['changes'][index], 'what', {'what': 420})} for index in case['changes']],
        'open': [{'item': field(finish['open'][index], 'item', limits),
                  'readings': [abridge(reading, limits['reading']) for reading in finish['open'][index]['readings']],
                  'prefer': field(finish['open'][index], 'prefer', limits)} for index in case['open']],
        'notes': field(finish, 'notes', limits),
        'work_total': len(finish.get('work') or []), 'open_total': len(finish.get('open') or []),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project', type=Path, help='research project root containing runs/v42 and data/')
    args = parser.parse_args()
    root = args.project.resolve()
    cases = [build(case, root / 'runs/v42', root / 'data') for case in CASES]
    text = json.dumps(cases, ensure_ascii=False, indent=1)
    (SITE / 'cases.js').write_text('// Excerpts from recorded verification runs; see tools/build_cases.py.\n'
                                   f'const CASE_DATA = {text};\n')
    print(f'Wrote cases.js ({len(text):,} characters, {len(cases)} cases)')


if __name__ == '__main__':
    main()
