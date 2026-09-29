// Excerpts from recorded verification runs; see tools/build_cases.py.
const CASE_DATA = [
 {
  "id": "apex",
  "benchmark": "APEX-Agents",
  "model": "Claude Opus 4.8",
  "deliverable": "Consulting analysis",
  "tags": [
   "Resolve",
   "Challenge",
   "Revise"
  ],
  "title": "A fork and a shared error in the same pool.",
  "task": "From a client’s SKU data, report the top four customers by three-year revenue, their gross margin by product family, and their hybrid and EV order volume with its growth rate.",
  "takeaway": "The best rollout in the pool scores 0.40. The delivered answer scores 0.80, because the revision corrects a unit error that every rollout on the right dataset shares.",
  "base": "r05",
  "scores": {
   "mean": 0.1888888888888889,
   "best": 0.4,
   "delivered": 0.8000000000000002
  },
  "groups": [
   {
    "label": "Used the sample the client team had rejected",
    "rollouts": [
     {
      "id": "r06",
      "score": 0.1
     },
     {
      "id": "r08",
      "score": 0.1
     },
     {
      "id": "r09",
      "score": 0.1
     }
    ]
   },
   {
    "label": "Merged all three data files",
    "rollouts": [
     {
      "id": "r01",
      "score": 0.1
     },
     {
      "id": "r04",
      "score": 0.1
     }
    ]
   },
   {
    "label": "Used the corrected dataset",
    "rollouts": [
     {
      "id": "r02",
      "score": 0.0
     },
     {
      "id": "r03",
      "score": 0.4
     },
     {
      "id": "r05",
      "score": 0.4
     },
     {
      "id": "r07",
      "score": 0.4
     }
    ]
   }
  ],
  "counts": {
   "disagreements": 6,
   "challenges": 6,
   "refuted": 1
  },
  "resolver": [
   {
    "outcome": "4 of 9 stand",
    "summary": "Which data file is the basis? The email thread shows the client team rejected the earlier sample and sent a corrected list.",
    "question": "Which SKU dataset is the intended basis for the analysis: Helios_SKU_Rebuilt_ICE70plus.xlsx (2,500 SKUs), Master_Reworked+Additional_2000 (2,400 SKUs), or all three combined (4,900 SKUs)?",
    "checked": "Read the 'Lurching Consulting EV Transition Study: Data Request' email thread in .apps_data/mail (msgs 49-60) and computed the revenue mix (Vol2025xASP) of each raw file with openpyxl. SKU ranges: Master_Reworked=SKU-2000..2399 (400), Additional_2000=SKU-5000..6999 (2000), Rebuilt_ICE70plus=SKU-10000..12499 (2500). […]",
    "found": "In msg 53 Armen rejects the earlier sample: it showed a ~33/33/33 ICE/Hybrid/EV mix with near-identical margins, contradicting leadership's baseline of ICE >70% with EV a minor low-margin wedge. Msg 50 Hale then sends 'the total list of SKUs' (the corrected census). […]",
    "verdict": "Rebuilt_ICE70plus (2,500 SKUs) is correct -> r02, r03, r05, r07. r06/r08/r09 used exactly the 33/33/33 sample Armen rejected (their ~28% flat margins are the tell). r01/r04 combined the rejected sample into a 4,900-SKU set. Wrong dataset for r01,r04,r06,r08,r09."
   },
   {
    "outcome": "4 of 9 stand",
    "summary": "Who are the top four customers? The corrected file gives one ranking and the other files give another.",
    "question": "Who are the top 4 customers and their cumulative-revenue ranking (2023-2025, Active only)?",
    "checked": "openpyxl sum of (Vol2023+2024+2025)xASP over Rebuilt Raw Data, Active status only, platforms mapped MQB+MLB Evo->VW etc.",
    "found": "Rebuilt ranking: 1 VW, 2 Volvo, 3 Hyundai, 4 BYD (then Toyota, Stellantis, Ford, GM). Ranking is scale-invariant so cents vs euros does not change it. Wrong-dataset rollouts got a different top 4: r06/r08/r09 and r04 report VW, Volvo, Toyota, GM.",
    "verdict": "VW / Volvo / Hyundai / BYD is correct (r02,r03,r05,r07). The Toyota/GM top-4 of r04,r06,r08,r09 is an artifact of the rejected dataset. r01 also uses wrong dataset (its top4 VW/Volvo/Toyota/GM)."
   }
  ],
  "challenger": [
   {
    "holds": false,
    "summary": "Every rollout on the corrected dataset reports revenue in euros. The workbook’s own formula divides by 100, because the prices are in cents.",
    "claim": "Cumulative revenue is reported directly in euros from the ASP column, so the top-4 figures are VW ~€26.5bn, Volvo/Hyundai/BYD ~€13.7bn each (shared by the correct-dataset base candidates r02, r03, r05, r07).",
    "tried": "Read the ASP/COGS convention in the workspace's own working artifacts. In Helios_SKU_Rebuilt_ICE70plus.xlsx sheet 'Calcs Added': M1/N1 = 'Average Selling Price (€ cents)' / 'Average COGS per Unit (€ cents)', and O2 (LTM Revenue €) = '=M2*L2/100'. Confirmed the same in the team's latest analysis file 'Product Roadmap/Helios SKU Analysis v3.xlsx' (M1 '€ cents', O2 '=M2*L2/100', SKU-10000..12499). […]",
    "found": "Armen msg 49: 'I will assume the ASPs and COGs are in euro cents since that way the revenues seem to tie to our prior discussions.' The raw 'From Client' header literally says '(€)', but the team's own Calcs Added / v3 formula divides by 100 and relabels the columns '€ cents'. […]",
    "because": "The workspace convention (Calcs Added formula in the very file used, corroborated in v3, plus Armen's explicit email decision) is euro cents: revenue must be divided by 100. The base candidates report figures 100x too large. Correct top-4 cumulative revenue is VW €265.2M / Volvo €137.3M / Hyundai €136.9M / BYD €136.9M. Ranking is scale-invariant so the top-4 identity is unaffected. […]"
   },
   {
    "holds": true,
    "summary": "Growth is computed point to point. The task asks for growth over the period, so the shared reading stands.",
    "claim": "Volume growth rate = simple point-to-point (2025-2023)/2023.",
    "tried": "Recomputed both simple point-to-point growth and 2-year CAGR for the combined top-4 and each customer.",
    "found": "Combined: simple -1.6% vs CAGR -0.8%. Per customer: VW +5.4%/+2.7%, Volvo -4.8%/-2.5%, Hyundai -12.1%/-6.2%, BYD -1.0%/-0.5%.",
    "because": "'volume growth rate over that period' most naturally means the total change across the window, which is the simple point-to-point figure the pool used; CAGR would be an 'annual' rate the task did not ask for. Defensible; recording the CAGR alternative for completeness."
   }
  ],
  "work": [
   {
    "what": "Cumulative-revenue figures for the top 4 are reported ~100x too high (ASP/COGS read as euros, not euro cents).",
    "to": "Divide the four figures by 100: Volkswagen €265,204,113; Volvo €137,283,980; Hyundai €136,925,595; BYD €136,877,569 (rounded to nearest whole euro). Ranking is unchanged (VW > Volvo > Hyundai > BYD; next Toyota €130.3M).",
    "evidence": "Reproduced with openpyxl over Rebuilt Raw Data (Active only, 2023+2024+2025 volume × ASP). […]"
   }
  ],
  "changes": [
   {
    "file": "answer.md",
    "what": "Divided the four top-4 cumulative-revenue figures (and the 'next closest' reference figures) by 100 to reflect the euro-cent convention: Volkswagen €265,204,113; Volvo €137,283,980; Hyundai €136,925,595; BYD €136,877,569; Toyota €130.3M / Stellantis €115.4M / Ford €113.6M / GM €95.2M. Added a one-line note stating the cents convention."
   }
  ],
  "open": [
   {
    "item": "Averaging method for gross profit margin by product family.",
    "readings": [
     "Simple mean of per-SKU (ASP-COGS)/ASP (r05's primary): VW EV 12.9/Hyb 26.9/ICE 33.3; Volvo 13.8/29.4/33.6; Hyundai 15.7/27.5/33.9; BYD 13.4/26.2/33.4",
     "Revenue-weighted 1-ΣCOGS/ΣRev (the workbook's own 'Average Gross Margin %' convention): differs by up to ~2.6pp, mainly EV (e.g. Hyundai EV 13.1% vs 15.7% simple)"
    ],
    "prefer": "Simple mean — 'average gross profit margin' most naturally reads as the per-SKU mean, and the ICE>Hybrid>EV story is identical either way. r05 already prints both, so the deliverable can carry the weighted figures in parentheses."
   }
  ],
  "notes": "Base r05 over r03: numerically identical and both use the correct canonical dataset, but r05 additionally documents both margin methods (simple + revenue-weighted) inline, which covers the live margin fork; r03 is otherwise an equally strong fallback. […]",
  "work_total": 1,
  "open_total": 3
 },
 {
  "id": "law",
  "benchmark": "APEX-Agents",
  "model": "Gemini 3.5 Flash",
  "deliverable": "Legal opinion",
  "tags": [
   "Resolve",
   "Challenge",
   "Revise"
  ],
  "title": "Ten rollouts answer yes. The case file says no.",
  "task": "A landlord settled a tenant’s flooding claim for $50,000 and expects to spend $8,000 more suing its subcontractor under an indemnity clause. Is it likely to recover all $58,000? Answer yes or no, with one or two sentences of explanation.",
  "takeaway": "Every rollout gives the same answer, so there is nothing to select. The challenger reads the court opinion in the case file and finds the sentence that decides the question. Every rollout scored 0.33, and the revised answer scores 1.00.",
  "base": "r04",
  "scores": {
   "mean": 0.33333333333333337,
   "best": 0.3333333333333333,
   "delivered": 1.0
  },
  "groups": [
   {
    "label": "Answered yes",
    "rollouts": [
     {
      "id": "r01",
      "score": 0.3333333333333333
     },
     {
      "id": "r02",
      "score": 0.3333333333333333
     },
     {
      "id": "r03",
      "score": 0.3333333333333333
     },
     {
      "id": "r05",
      "score": 0.3333333333333333
     },
     {
      "id": "r06",
      "score": 0.3333333333333333
     },
     {
      "id": "r07",
      "score": 0.3333333333333333
     },
     {
      "id": "r08",
      "score": 0.3333333333333333
     },
     {
      "id": "r09",
      "score": 0.3333333333333333
     },
     {
      "id": "r10",
      "score": 0.3333333333333333
     }
    ]
   },
   {
    "label": "Answered yes, and noted when the fees would be recoverable",
    "rollouts": [
     {
      "id": "r04",
      "score": 0.3333333333333333
     }
    ]
   }
  ],
  "counts": {
   "disagreements": 3,
   "challenges": 3,
   "refuted": 2
  },
  "resolver": [
   {
    "outcome": "None stands",
    "summary": "Are the $8,000 in fees recoverable? In the court opinion in the case file, such fees were allowed only because that contract had a separate fee clause.",
    "question": "Are the $8,000 in attorney's fees incurred to prosecute the indemnity action recoverable under the subcontract's general indemnity clause according to California law and Continental Heller?",
    "checked": "Extracted text of workspace/world/filesystem/Legal Research/Continental Heller Corp v Amtech.pdf (pages 4-5) via pdftoppm and Tesseract OCR to read the court's exact ruling on enforcement attorney's fees.",
    "found": "The court in Continental Heller held that a general indemnity clause covering fees 'arising out of or in any way connected with the performance of work' does NOT cover attorney's fees incurred in prosecuting the indemnity action itself, and only allowed them because of a separate breach-of-contract attorney's fee clause in that specific subcontract. Since the prompt's subcontract only contains the general indemnity clause, MGR cannot recover the $8,000 prosecuting fees, making the correct decision 'No' (as All $58,000 cannot be recovered). […]",
    "verdict": "none of them (all incorrectly concluded 'Yes' and asserted MGR is likely to recover all $58,000, though r04 is the most legally accurate since it correctly identified the legal exception/condition for prosecuting fees while r01, r02, r03, r05, r06, r07, r08, r09, and r10 unconditionally and erroneously stated that the general clause […]"
   },
   {
    "outcome": "5 of 10 stand",
    "summary": "Does the answer follow the requested format? Five rollouts use the two numbered parts. One submits a long memorandum.",
    "question": "Did the candidates adhere to the formatting instruction of returning a '1) Yes/No decision' and a '2) 1-2 sentence explanation'?",
    "checked": "Read and compared the deliverables answer.md files for all candidates under rollouts/r*/deliverables/answer.md against the formatting constraints in spec/task.md.",
    "found": "The specification required '1) \"Yes/No\" decision; and 2) 1-2 sentence explanation.' Rollouts r02, r03, r07, r09, and r10 followed both the '1)' and '2)' numbering and the 1-2 sentence length constraints. Rollouts r01, r04, r05, and r08 followed the 1-2 sentence length constraint but did not use explicit '1)' and '2)' labels. Rollout r06 completely violated the format and length instructions by submitting a long legal memorandum with 5 sections and a matrix table.",
    "verdict": "r02, r03, r07, r09, r10 (they adhered to both the numbering and length constraints; r01, r04, r05, r08 adhered to the length constraint only; r06 failed both)"
   }
  ],
  "challenger": [
   {
    "holds": false,
    "summary": "All ten say the indemnity clause covers both amounts. The court opinion, read from the scanned file, says the fees for suing under the indemnity are not covered.",
    "claim": "MGR is likely to prevail in recovering all $58,000 in costs because under Continental Heller, the broad indemnity clause covers both the underlying $50,000 settlement and the $8,000 in attorney's fees incurred to prosecute the indemnity enforcement action.",
    "tried": "Extracted and OCR'd 'workspace/world/filesystem/Legal Research/Continental Heller Corp v Amtech.pdf' using pdftoppm (at 150 DPI) and pytesseract, and read pages 4-5 to verify whether a subcontractor's indemnity clause covers the contractor's attorney's fees incurred to prosecute an indemnity enforcement action.",
    "found": "If this was the extent of the contract's provision for attorney fees, we would agree with Amtech that Continental is not entitled to attorney fees incurred in prosecuting this action for breach of the indemnity agreement. There is, however, an additional provision on attorney fees.",
    "because": "Under California law, a broad indemnity clause covering 'losses including attorney's fees' arising from the performance of work only covers third-party defense fees, not attorney's fees incurred to prosecute the enforcement action itself against the subcontractor. […]"
   },
   {
    "holds": true,
    "summary": "All ten say no proof of fault is needed to recover the settlement. The opinion confirms it.",
    "claim": "Under California law and Continental Heller, proof of subcontractor negligence or fault is not required to recover the underlying $50,000 settlement under a broad indemnity clause that covers losses 'arising out of or in any way connected with' the performance of the subcontracted work.",
    "tried": "Extracted and OCR'd 'workspace/world/filesystem/Legal Research/Continental Heller Corp v Amtech.pdf' using pdftoppm and pytesseract, and read the court's ruling on pages 1 and 3 on the fault/negligence requirement.",
    "found": "In this case, we hold an agreement by a subcontractor to indemnify a general contractor for loss 'which arises out of or is in any way connected' with the subcontractor's 'acts or omissions' in the performance of its work does not require a showing the subcontractor was at fault in causing the general contractor's loss or that its performance was a 'substantial' or 'predominating' cause of the loss.",
    "because": "The broad-form indemnity clause covering losses 'arising out of or in any way connected with' the performance of work allocates risk to the subcontractor regardless of fault, requiring only a causal connection. […]"
   }
  ],
  "work": [
   {
    "what": "The decision in answer.md",
    "to": "1) No",
    "evidence": "Continental Heller Corp v Amtech (pages 4-5) shows that prosecuting fees are not recoverable without an express fee-shifting clause, meaning all $58,000 cannot be recovered."
   },
   {
    "what": "The explanation and formatting in answer.md",
    "to": "2) Under California law (specifically Continental Heller Corp. v. Amtech Mechanical Services, Inc.), while MGR can recover the $50,000 settlement under the broad indemnity clause without proving subcontractor negligence, it cannot recover the $8,000 in attorney's fees incurred to prosecute the indemnity action itself because the subcontract lacks an express fee-shifting or breach-of-contract attorney's fee provision.",
    "evidence": "Continental Heller Corp v Amtech (pages 4-5) and Otis Elevator Co. v. Toda Construction (1994) 27 Cal.App.4th 559, 564 show that a performance-of-work indemnity clause does not cover the attorney's fees of prosecuting an enforcement action."
   }
  ],
  "changes": [
   {
    "file": "answer.md",
    "what": "Changed the decision from Yes to 1) No, and updated and formatted the explanation to follow the 1) and 2) labels with a 1-sentence explanation."
   }
  ],
  "open": [],
  "notes": "All ten candidates incorrectly answered 'Yes' to recovering the full $58,000. Under California law, a broad performance-of-work indemnity clause covers the settlement of third-party claims without proving subcontractor negligence (Continental Heller), but does NOT cover attorney's fees incurred in a subsequent action to enforce the indemnity agreement itself. For the latter, a separate fee-shifting or breach-of-contract provision is required, which this subcontract lacks. […]",
  "work_total": 2,
  "open_total": 0
 },
 {
  "id": "sb2",
  "benchmark": "SpreadsheetBench 2",
  "model": "Claude Opus 4.8",
  "deliverable": "Financial model workbook",
  "tags": [
   "Resolve",
   "Challenge",
   "Select"
  ],
  "title": "One rollout in ten is right, and the evidence finds it.",
  "task": "Audit a leveraged-buyout model workbook and fix the errors in its formulas.",
  "takeaway": "Eight of ten workbooks miss the second error, so agreement points the wrong way. The verifier compares the formula with its sibling tables and delivers the one complete workbook unchanged.",
  "base": "r05",
  "scores": {
   "mean": 0.1,
   "best": 1.0,
   "delivered": 1.0
  },
  "groups": [
   {
    "label": "Left the cash double count in place",
    "rollouts": [
     {
      "id": "r08",
      "score": 0.0
     },
     {
      "id": "r10",
      "score": 0.0
     }
    ]
   },
   {
    "label": "Fixed the cash double count only",
    "rollouts": [
     {
      "id": "r01",
      "score": 0.0
     },
     {
      "id": "r02",
      "score": 0.0
     },
     {
      "id": "r03",
      "score": 0.0
     },
     {
      "id": "r04",
      "score": 0.0
     },
     {
      "id": "r06",
      "score": 0.0
     },
     {
      "id": "r07",
      "score": 0.0
     },
     {
      "id": "r09",
      "score": 0.0
     }
    ]
   },
   {
    "label": "Fixed both double counts",
    "rollouts": [
     {
      "id": "r05",
      "score": 1.0
     }
    ]
   }
  ],
  "counts": {
   "disagreements": 7,
   "challenges": 5,
   "refuted": 1
  },
  "resolver": [
   {
    "outcome": "8 of 10 stand",
    "summary": "The returns table subtracts net debt and then adds cash again. Eight rollouts fix this.",
    "question": "In the LBO Returns Analysis, what should the '(-) Debt' row (Ex 1 - LBO!X20:AC20) reference — Total Net Debt (row 91) or gross ending debt balances?",
    "checked": "Traced the equity-value build in workspace input cells.tsv: Ex 1 - LBO!X22:AC22 = row19(Exit TEV) - row20('(-) Debt') + row21('(+) Cash'); input row20 = row91 'Total Net Debt' (=SUM(ending balances)-cash row89). Recomputed: net-debt already subtracts cash, so TEV - netdebt + cash double-counts cash. […]",
    "found": "This is the core 'double counting' bug (cash added twice). Only AC (2030) is numerically affected because cash flow is 0 until debt payoff: AC20 -130.666 -> 0, AC22 19804.61 -> 19673.94, AC28 MOIC 2.4445 -> 2.4283, AC29 IRR 0.19574 -> 0.19416. Fixed by r01,r02,r03,r04,r05,r06,r07,r09 (all use SUM of ending balances; column order differs but equivalent). […]",
    "verdict": "r01,r02,r03,r04,r05,r06,r07,r09 are right; r08 and r10 are wrong (bug left in place). The primary intended fix."
   },
   {
    "outcome": "1 of 10 stands",
    "summary": "The acquisition totals add the prior year to sums that are already cumulative. The sibling tables show the intended formula.",
    "question": "In the M&A schedule (Ex 5 - M&A), should the 'Total' rows 42/52/62/72 for the active case (cols D:G) add the prior-year total ('+C42', '+D42', ...)?",
    "checked": "Compared to the sibling Base/Upside/Downside sub-tables in the same rows: J42=+SUM(J36:J41), K42=+SUM(K36:K41), ... J62=+SUM(J56:J61), J72=+SUM(J66:J71) — none add the prior column. Also verified cohort rows carry each cohort's contribution across all years (e.g. 2028 EBITDA cohort E58=6.9, F58=14.628, G58=15.506), so the column SUM already is the year total; adding the prior year double-counts.",
    "found": "A second, independent double-counting bug (matches the file name). Input active D62=+SUM+C62 giving F62=28.428, G62=65.46168; correct (no +prev) = 21.528, 37.03368. Sub-tables prove the intended formula omits +prev. Fixed FULLY by r05 (rows 42,52,62,72). r10 fixed rows 42,52,72 but LEFT row 62 with +prev (F62 still 28.428, G62 65.46168). All other rollouts (r01,r02,r03,r04,r06,r07,r08,r09) never touched this — bug left in place.",
    "verdict": "r05 is right (complete); r10 is partially right (misses row 62 Total EBITDA); r01,r02,r03,r04,r06,r07,r08,r09 miss this bug entirely."
   }
  ],
  "challenger": [
   {
    "holds": false,
    "summary": "Eight rollouts treat the acquisition totals as correct. Every sibling table uses a plain sum, and the pattern appears nowhere else in the workbook.",
    "claim": "Shared blind spot of the 8-rollout majority (r01,r02,r03,r04,r06,r07,r08,r09): the only injected double-count is the LBO row-20 cash issue; the M&A schedule Total rows (Ex 5 - M&A rows 42/52/62/72) are correct and need no change.",
    "tried": "Read the M&A cohort block (rows 36-72) and its Base/Upside/Downside sub-tables. Compared the active-case Total formulas (cols C:G) against the sub-table Totals; the active case is Downside (C4=3), so col G must equal the downside sub-table col AB. grep of ='+SUM(...)+cell' across the whole workbook to enumerate the accumulation pattern.",
    "found": "Active totals use '=+SUM(range)+prevcol' (G62 =+SUM(G56:G61)+F62 = 65.46168) while every sub-table Total uses plain '=+SUM(range)' with no +prev (AB62 =+SUM(AB56:AB61) = 37.03368). Cohort rows already carry each cohort forward across years (G58=15.50568, G59=14.628, G60=6.9 => SUM=37.03368), so +prev double-counts. The '=+SUM(...)+cell' pattern occurs ONLY at M&A rows 42/52/62/72 (12 cells) — nowhere else in the workbook.",
    "because": "There is a second injected double-count (the file is literally named 'Double Counting'): the M&A active-case Total rows accumulate the prior year on top of already-cumulative cohort sums. The correct total is the plain column SUM (active col G must equal downside sub-table col AB=37.03368), as r05 did fully and r10 did for rows 42/52/72 only (leaving G62=65.46168). […]"
   },
   {
    "holds": true,
    "summary": "The cash fix that eight rollouts made is recomputed from the inputs and confirmed.",
    "claim": "The LBO returns bridge double-counts cash: '(-) Debt' row (Ex 1 - LBO!X20:AC20) referenced Total Net Debt (row 91 = gross ending balances - cash) while row 21 '(+) Cash' adds cash again, so the fix is to point row 20 at gross ending debt = SUM of the three ending balances (revolver r65 / TLB r76 / PIK r85). 8/10 rollouts made exactly this change.",
    "tried": "Traced X22:AC22 = row19(Exit TEV) - row20 + row21 in the input cells.tsv; row20=P91:U91, row91=SUM(ending balances)-row89(cash). Recomputed AC: 19543.276 - (-130.666) + 130.666 = 19804.61 (input, cash counted twice) vs gross-debt fix 19543.276 - 0 + 130.666 = 19673.94. Also tested the alternative reading (leave net debt, zero the cash row).",
    "found": "AC20 U91=-130.666, AC21=130.666, AC19=19543.276 => input AC22=19804.61. Gross-debt fix gives 0 for AC20 and AC22=19673.94 (r05 cached AC22=19673.942137323, AC28=2.4283, AC29=0.19416). The alt reading (Equity=TEV-net debt) yields the identical 19673.94, but the '(-) Debt' / '(+) Cash' labels make gross-debt-in-row-20 the correct minimal fix.",
    "because": "The double-count is real and the gross-debt fix reproduces the intended equity value and honours the row labels; the two rollouts that left row 20 = net debt (r08, r10) retain the double-count. This is a disagreement adjudicated by elim; the majority's fix is sound."
   }
  ],
  "work": [],
  "changes": [],
  "open": [
   {
    "item": "Ex 1 - LBO!AC21 '(+) Cash' — cumulative (=AB21+U89, input) vs single-year (=U89) to match siblings Y21:AB21",
    "readings": [
     "keep =AB21+U89 (input): value 130.666, more-correct cumulative-cash logic and least departure from input",
     "change to =U89: value 130.666, makes row 21 uniform with single-year siblings"
    ],
    "prefer": "keep =AB21+U89 — value-neutral (both = 130.666 since Q89:T89=0), and r05/input already carry it; least departure from input"
   }
  ],
  "notes": "r05 is the base by a clear margin and needs no work. […]",
  "work_total": 0,
  "open_total": 3
 },
 {
  "id": "wb",
  "benchmark": "WorkBuddy Bench",
  "model": "Claude Opus 4.8",
  "deliverable": "Code analysis",
  "tags": [
   "Resolve",
   "Challenge",
   "Revise"
  ],
  "title": "Ten analyses agree. None measured the summary limit.",
  "task": "Without changing any code, explain how an HTTP client library turns a Java interface call into a request and decodes the response. Deliver a JSON file with a summary of at most 200 characters and a file and line number for every fact.",
  "takeaway": "The ten analyses agree on the substance. The challenger measures each summary against the length limit. The revision shortens it to satisfy both ways of counting, adds verified facts from two other rollouts, and scores above every rollout in the pool.",
  "base": "r04",
  "scores": {
   "mean": 0.74,
   "best": 0.9333,
   "delivered": 1.0
  },
  "groups": [
   {
    "label": "Leanest analysis",
    "rollouts": [
     {
      "id": "r03",
      "score": 0.8
     }
    ]
   },
   {
    "label": "Complete, with less detail",
    "rollouts": [
     {
      "id": "r05",
      "score": 0.6667
     },
     {
      "id": "r06",
      "score": 0.7333
     },
     {
      "id": "r07",
      "score": 0.6667
     },
     {
      "id": "r08",
      "score": 0.9333
     },
     {
      "id": "r09",
      "score": 0.6667
     },
     {
      "id": "r10",
      "score": 0.5333
     }
    ]
   },
   {
    "label": "Most detailed",
    "rollouts": [
     {
      "id": "r01",
      "score": 0.9333
     },
     {
      "id": "r02",
      "score": 0.6667
     },
     {
      "id": "r04",
      "score": 0.8
     }
    ]
   }
  ],
  "counts": {
   "disagreements": 5,
   "challenges": 4,
   "refuted": 1
  },
  "resolver": [
   {
    "outcome": "10 of 10 stand",
    "summary": "Are the cited files and line numbers real? Every cited file exists. The lines on the core request path are checked, and they match.",
    "question": "Are the path+line evidence citations in each analysis.json actually correct against workspace/repo core Feign source?",
    "checked": "Extracted every {path,line} from all 10 files and printed the actual repo line content; cross-checked the core flow lines independently: Feign.java:36/208/212/213/217/240, ReflectiveFeign.java:50/55/58/60/63/86/104/140/169, Contract.java:49/91/106, DefaultContract.java:32/48/64/94, RequestTemplateFactoryResolver.java:40/85/107/235/274, […]",
    "found": "All cited files exist (0 missing across 61/42/43/61/43/45/48/33/44/51 evidence entries for r01..r10) and every cited line I inspected matches the claim it supports. No out-of-bounds lines, no misattributions found in any rollout. A few citations point to weak anchor lines (e.g. r01 uses ReflectiveFeign.java:85 '@Override' and r05/r10 use ReflectiveFeign.java:62 '(T)'), but each is paired with a substantive line.",
    "verdict": "all correct; no rollout can be eliminated on evidence accuracy. This is a homogeneous, high-quality set."
   },
   {
    "outcome": "r04 goes deepest",
    "summary": "How much of the request path does each analysis cover? All ten cover every required topic. They differ in depth.",
    "question": "How deep/complete is the coverage of the required flow points (proxy creation, annotation->metadata, dispatch, param fill + URL overlay, interceptors, encoder, client, decode, errorDecoder, retry)?",
    "checked": "Read facts, request_flow and extension_points arrays of all 10; compared coverage of each mandated topic and counted facts/flow-steps/extension-points",
    "found": "All 10 cover every mandated topic. Depth varies: r04 is the richest (23 facts, 61 evidence, 15-step request_flow, 12 extension points; uniquely adds RequestTemplate.resolve()/request(), DefaultMethodHandler.bindTo, Encoder/Decoder interface anchors, QueryMapEncoder). r01 (21 facts,61 ev,11 flow) also very thorough incl. Capability. r02 (22 facts) and r05/r09 add body-index detection and DefaultErrorDecoder->RetryableException (r09). […]",
    "verdict": "cannot rank as right/wrong (all correct); on completeness r04 > r01 ~ r02 > r05/r09/r10/r07/r06/r08 > r03. Difference is depth/richness, not correctness."
   }
  ],
  "challenger": [
   {
    "holds": false,
    "summary": "Every rollout treats its summary as short enough. Counted as total characters, all ten exceed the limit of 200. Counted as Chinese characters only, all ten are within it.",
    "claim": "The summary satisfies the delivery constraint \"summary 不超过 200 字\" stated in the spec's JSON template.",
    "tried": "python3: json.load each rollout's analysis.json and measured len(summary) (total chars), CJK-only count, and non-space count for all 10.",
    "found": "Total characters: r01=582, r02=456, r03=397, r04=262, r05=362, r06=425, r07=279, r08=563, r09=451, r10=443 — every one exceeds 200. CJK-only characters: 82–103 for all (r01=90 … r06/r07=103) — every one is under 200.",
    "because": "The spec sets an explicit '不超过 200 字' limit and, under the plain total-character reading, all 10 summaries overrun it (238–582 chars), so the whole pool shares this over-run. […]"
   },
   {
    "holds": true,
    "summary": "Every cited path and line is taken to be real. A check of all paths and a sample of lines confirms it.",
    "claim": "Every evidence path cited across all 10 analyses is a real file in the repo, and the cited line numbers point at the described code.",
    "tried": "python3 os.path.exists on all evidence paths (61,42,43,61,43,45,48,33,44,51 entries); then spot-verified ~25 (path,line) pairs against the files with sed/grep.",
    "found": "0 missing paths for all 10 rollouts. Spot-checked citations were accurate to within one line (e.g. r01 ReflectiveFeign 58/60/63 vs actual 59/60/63; DefaultClient.java:89 = 'public Response execute(...)'; Client.java:43 = execute() interface decl; BaseBuilder.java:49 = default Contract field, :374 build()).",
    "because": "The citations are grounded in the actual repository; no fabricated path or grossly wrong line was found — the evidence layer is trustworthy across the pool."
   }
  ],
  "work": [
   {
    "what": "summary field exceeds the '不超过 200 字' limit (262 total chars)",
    "to": "Trim to a summary that is safe under both readings of 字 (<=200 total characters, which is also well under 200 CJK). […]",
    "evidence": "ledger_elim + ledger_fals both measured all 10 summaries at 238-582 total chars (r04=262); I confirmed r04=262 total/85 CJK. A <=200-total trim complies under either interpretation of 字 and loses no required detail because the class names and path+line evidence live in facts/request_flow."
   },
   {
    "what": "MethodInterceptor is missing from r04's extension_points (r04 lists RequestInterceptor/ResponseInterceptor but not the outermost per-call MethodInterceptor chain)",
    "to": "Add extension point: \"MethodInterceptor：包裹整个方法调用（含重试）的最外层链 (core/src/main/java/feign/SynchronousMethodHandler.java:59)\" (from r07)",
    "evidence": "Verified SynchronousMethodHandler.java:59 = 'MethodInterceptor.Chain endOfChain = inv -> runWithRetry(inv, options);' with the interceptor-reduce chain at 60-64. Distinct from RequestInterceptor; a real extension point relevant to the task's 拦截器 question."
   }
  ],
  "changes": [
   {
    "file": "agent.patch",
    "what": "Trimmed analysis.json summary from 262 to 181 total characters (77 CJK), so it complies under both readings of '不超过 200 字'; still names the load-bearing components, full detail stays in facts/request_flow."
   },
   {
    "file": "agent.patch",
    "what": "Added extension_point 'MethodInterceptor：包裹整个方法调用（含重试）的最外层链 ... SynchronousMethodHandler.java:59' (from r07)."
   }
  ],
  "open": [],
  "notes": "Homogeneous, high-quality pool: both records verified all 10 deliverables are single-file patches creating only analysis.json (no business code touched), all parse as valid contract-shaped JSON, and every load-bearing evidence citation is accurate against workspace/repo. […]",
  "work_total": 3,
  "open_total": 0
 },
 {
  "id": "jb",
  "benchmark": "JobBench",
  "model": "Claude Opus 4.8",
  "deliverable": "Engineering report",
  "tags": [
   "Resolve",
   "Challenge",
   "Revise"
  ],
  "title": "The task named a standard. One rollout in ten read it.",
  "task": "Assess a pump’s vibration retest against the contract and the applicable standards, recommend acceptance, and deliver a report, a non-conformance record, and two plots.",
  "takeaway": "All ten rollouts reach the same recommendation, and it holds. The challenger still checks what the recommendation rests on, and finds that only one rollout read the standard the task named.",
  "base": "r05",
  "scores": {
   "mean": 0.13999999999999999,
   "best": 0.5142857142857142,
   "delivered": 0.657142857142857
  },
  "groups": [
   {
    "label": "Treated the cover-sheet limit as governing",
    "rollouts": [
     {
      "id": "r10",
      "score": 0.08571428571428572
     }
    ]
   },
   {
    "label": "Used the contract limit",
    "rollouts": [
     {
      "id": "r01",
      "score": 0.08571428571428572
     },
     {
      "id": "r02",
      "score": 0.0
     },
     {
      "id": "r03",
      "score": 0.11428571428571428
     },
     {
      "id": "r06",
      "score": 0.0
     },
     {
      "id": "r07",
      "score": 0.08571428571428572
     },
     {
      "id": "r08",
      "score": 0.11428571428571428
     },
     {
      "id": "r09",
      "score": 0.0
     }
    ]
   },
   {
    "label": "Used the contract limit and the table for this pump type",
    "rollouts": [
     {
      "id": "r04",
      "score": 0.4
     },
     {
      "id": "r05",
      "score": 0.5142857142857142
     }
    ]
   }
  ],
  "counts": {
   "disagreements": 7,
   "challenges": 4,
   "refuted": 2
  },
  "resolver": [
   {
    "outcome": "9 of 10 stand",
    "summary": "Which limit governs acceptance? The contract sets 3.8 mm/s. The 4.5 mm/s figure is a note on the test cover sheet.",
    "question": "Which vibration limit governs the accept/reject decision — the contractual datasheet's API 610 Table 8 value (≤3.8 mm/s RMS overall, ≤2.5 mm/s peak discrete) or the 4.5 mm/s 'ISO 10816-7 Zone A/B (Group 2)' figure printed on the vibration test cover sheet?",
    "checked": "pump_specification_CP150.xlsx.cells.tsv Test Requirements!C10/D10 = '≤ 3.8 mm/s RMS (for BH vibration)' / 'API 610 Table 8', and C11 = '≤ 2.5 mm/s peak' discrete; vs the header line of workspace vibration_test_data.csv 'ISO 10816-7 Zone A/B Limit: 4.5 mm/s RMS (Group 2 - Medium machines rigid foundation)'. […]",
    "found": "The contractual purchase spec (Test Requirements sheet) states the FAT vibration acceptance criterion as ≤3.8 mm/s RMS per API 610 Table 8. The 4.5 mm/s is only a note on the test-bay cover sheet and is the looser figure. r01,r02,r03,r06,r07,r08,r09 treat API 610 3.8 mm/s as the governing/contractual limit (correct) and use ISO zones diagnostically. r04 and r05 go further and apply the geometry-specific Europump/ISO figures (overhung, bearing-housing: POR 3.0 / AOR 3.9 mm/s) alongside the 3.8 contract limit. r10 alone states the 4.5 mm/s 'governs the accept/reject decision ... the contractually agreed acceptance threshold' and demotes API 610 3.8 to an 'engineering target, not the commercial gate'.",
    "verdict": "r10 is wrong on the required reconciliation: nothing in the workspace designates 4.5 mm/s as contractually agreed — it is a test-lab cover-sheet note, while the datasheet (the contract) explicitly sets the tighter 3.8 mm/s per API 610 Table 8. The other nine treat 3.8 as binding, which is correct. […]"
   },
   {
    "outcome": "r04 and r05 stand",
    "summary": "Which table of the guideline applies? The pump is horizontal and overhung, so the table for that geometry applies.",
    "question": "Which table of the Europump guideline supplies the applicable ISO 10816-7 zone/limit for this pump?",
    "checked": "europump_vibration_guidelines.pdf page 11 (pdf_words + pdf_tables): section a) 'overhung and between bearings pumps, power up to 300 kW/stage, speed up to 3600 r/min, all bearing types, measured on the bearing housing' -> POR 3.0 / AOR 3.9 (overall), 2.0/2.6 (discrete); section c) 'vertically suspended pumps' -> POR 5.0 / AOR 6.5. […]",
    "found": "This pump is overhung/horizontal with ball bearings measured on the bearing housing, so Europump table a) (POR 3.0 / AOR 3.9) is the directly applicable one, and it brackets the datasheet's 3.8 mm/s. r04 and r05 identify and apply table a) correctly. r10 cites B/C ≈ 5.0 mm/s for 'Category 2', which is the vertically-suspended-pump table c) — the wrong geometry. r01/r02/r03/r06/r07 use the test-sheet 'Group 2 = 4.5 mm/s' as their ISO reference (that label is ISO 10816-3 terminology, not 10816-7, but they still evaluate against the correct 3.8 contract limit). r08/r09 pick Category-1/Category-II zone numbers that don't map cleanly to any single table.",
    "verdict": "r04 and r05 are the most rigorous and correct on the standards mapping. r10 additionally errs here by classifying against the vertical-pump table. […]"
   }
  ],
  "challenger": [
   {
    "holds": false,
    "summary": "The task names a guideline to consult. A copy sits in the workspace and no rollout opened it. Only r05 found the document online.",
    "claim": "The Europump pump-vibration guideline that the task requires to be consulted as an external source was consulted.",
    "tried": "grep for 'files_required_to_search' across all 10 trajectory.txt (0 hits in every rollout); inspected each rollout's Europump handling and the reported directory link counts. The rollout workspace root had link-count 4 (= exactly two subdirs: task_folder and files_required_to_search), yet no rollout ever listed the workspace root. Traced r05's web activity.",
    "found": "No rollout accessed workspace/files_required_to_search/europump_vibration_guidelines.pdf. r01's report even states the guideline 'is not currently posted as a free download ... verified 2025' and reconstructs content from ISO memory. Nine of ten searched online and either failed or pulled unrelated Europump PDFs (ATEX/PFAS). Only r05 located the genuine document online ('Guidelines on Pump Vibration First edition Final July 2013') and its extract matches the provided PDF byte-for-content (e.g. 'C/L height <= 225 mm 3.00 5.50 7.10', p.6), then correctly cited both Category zone rows and API 610 POR 3.0/AOR 3.9.",
    "because": "The provided document (workspace/files_required_to_search/europump_vibration_guidelines.pdf) is the authoritative source the task named and it went unopened by 9 of 10 rollouts. This is the root cause of the reconciliation errors above. […]"
   },
   {
    "holds": true,
    "summary": "All ten recommend conditional acceptance. Recomputing the retest readings against the contract limit confirms it.",
    "claim": "The retest data warrants CONDITIONAL ACCEPT (all 10 rollouts agree; matches the vibration_test_data.csv Section-5 recommendation).",
    "tried": "Recomputed the worst retest readings per flow condition from vibration_test_data.csv Section 4, and compared against the contractual limit on Test Requirements!C10 (API 610 Table 8 overall = 3.8 mm/s RMS). At the contractual acceptance points within the operating band: 90-col (BEP) max = 1.92 (PDE_H); 100-col (rated) max = 2.68 (MDE_A); both well below 3.8. […]",
    "found": "Retest max at rated/BEP = 2.68/1.92 mm/s << 3.8 mm/s contractual overall; original 5.20 (PDE_H@110) and 5.50 (PNDE_V@60) both dropped into Zone B. Section-5 of the input itself states 'RECOMMENDATION: Conditional acceptance. Pump meets acceptance criteria at rated and BEP conditions.'",
    "because": "The conditional-accept outcome is independently reproducible from the raw data against the contractual API 610 limit and is unaffected by which secondary standard is invoked; the pass at rated/BEP holds under every defensible reading of the limits. The consensus is sound on the headline recommendation."
   }
  ],
  "work": [
   {
    "what": "Add a retest-coverage-gap non-conformance (missing from r05's NCR set and report)",
    "to": "Add one NCR row / report note recording that the 17-Jan-2025 retest matrix is incomplete: the 80% flow condition was not re-acquired at all, motor-end (MDE) and NDE (MNDE) points were dropped at 90% and 60% flow (only the 6 pump-end points taken), and MNDE was dropped at 110%. […]",
    "evidence": "elim disagreement #5 (r02 NCR-2401A-008 and r08 NCR-2401A-005 raise this; r05 does not) and my recount of vibration_test_data.csv Section 4."
   }
  ],
  "changes": [
   {
    "file": "Non_Conformance_Report.csv",
    "what": "Added NCR-P2401A-006 recording the retest coverage gap (retest re-acquired only 33 of 60 original point/flow combinations: 80% flow not re-measured, motor/NDE dropped at 90%/60%, MNDE dropped at 110%); disposition rework."
   }
  ],
  "open": [
   {
    "item": "ISO 10816-7 pump category (drives the diagnostic zone bands and alarm/trip setpoints; does NOT change the accept/reject outcome, which rests on the API 610 / contract limit).",
    "readings": [
     "Category 1 (≤200 kW): Zone A 2.5 / B 4.0 / C 6.6 mm/s, Alarm 5.0 / Trip 8.3 — justified by petrochemical/critical service (guideline p.8 Cat I = oil & gas, special chemical, critical application). […]",
     "Category 2 (≤200 kW): Zone A 3.2 / B 5.1 / C 8.5 mm/s, Alarm 6.4 / Trip 10.6 — justified by the medium being non-hazardous cooling water (guideline p.8 Cat II = non-hazardous liquids; […]"
    ],
    "prefer": "Category 1 — it is the base's choice, is the more conservative (tighter) frame for a critical petrochemical installation, and does not affect the governing pass/fail (API 610 3.8/3.9 mm/s). […]"
   }
  ],
  "notes": "Base is r05 because it is the only rollout that actually consulted the Europump guideline the task explicitly required as an external source (found the genuine 2013 document; its numbers match workspace/files_required_to_search/europump_vibration_guidelines.pdf, which I re-verified: p.9 Cat 1 ≤200 kW A2.5/B4.0/C6.6, FAT POR 3.3/AOR 4.0, Alarm 5.0/Trip 8.3; p.11 overhung bearing-housing API 610 overall POR 3.0/AOR 3.9, discrete 2.0/2.6, displacement ≤50 µm). […]",
  "work_total": 1,
  "open_total": 2
 }
];
