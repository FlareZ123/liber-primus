# LP2 English-looking GP word starts: independent lexicon and exact-digram decision

**Decision, 14 November 2026:** The source-visible word-start signal is insufficiently independent of lexical selection and does not identify unknown plaintext, a creator key or a decipherment operation. This report replaces the earlier single-dictionary framing with the complete two-period-dictionary original-corpus test. Source data are physical LP2 pp0–55: **12,956 GP29 runes on 55 rune-bearing pages, 2,896 complete printed words, including 32 across physical-page breaks**.

## Exact source and original hypothesis

The earlier p32 HOMEX search incidentally found **68** four-rune English-like word starts in the original unknown-page ciphertext. The original word starts and punctuation follow `resources/liber-primus/lp2-transcription.txt`, cross-checked rune-for-rune against `lp2-corpus.json` by `parse_pages` in `sims/lp2_p32_home_english_prefix_familywise_sft.py`. The pre-existing broad dictionary, cmudict==1.1.3, was selected during the retrospective HOME study; its 68 hits cannot authenticate p32 as a message. A 2,500-sample shuffled outgoing-edge Euler surrogate (original source transition matrices preserved, but uniformity unproved) found 20 results at least 68, plus-one **p=0.008397**. An independent exhaustive cyclic rephasing of all 12,956 original runes gave 193/12,956 shifts at least 68, **p=0.014897**. The specific 174 post-period original word starts gave six hits and unexceptional p≈0.07–0.08; the separate HOME look-elsewhere gate rejects an original HOME endpoint.

To test retrospective lexical selection, two **fixed before inspecting their unknown-page word-start outputs** period English word lists were chosen: 2007 CMUdict v0.7a (115,791 alphabetic unique words, SHA256 `7aed56e1e05c8499a49230045f06ee2ae3b343129d45d4b897bc503a40f945bd`) and January 2011 SCOWL Rev7.1 English+American levels 10/20/35/40/50/55/60 (76,015 words; exact 14 constituent SHA256 hashes printed by the SFT). The SCOWL archive endpoint failed ZIP validation, so the already-fixed 2011 Debian source mirror supplied those exact-level files. No later dictionary optimization occurred. Word normalization in both: K and Q→C, V→U, Z→S; greedy historical GP29 TH/NG/EO/OE/AE/IA/EA digraphs. Four prefix lengths **3–6** were frozen, yielding eight comparisons.

## Original hits and null probabilities

All probabilities are one-sided tails for **at least the original number of matches**; p-values do not quantify the probability of an encryption method. For the finite randomized controls, use plus-one estimates. The exact global phase controls rotate the unchanged concatenated corpus against the exact fixed word-start mask; the page-rotation controls independently rotate each original page while keeping its original word slots. The final null samples exactly the set of valid page-local original directed-digram Euler trails, retaining original start/end runes, all 29×29 directed transition counts, original word lengths and original word-start positions.

| Frozen dictionary / width | Original matches | Exact 12,956-phase tail | 1,500 page-rotation tail | 1,200 uniform original-digram tail |
| --- | ---: | ---: | ---: | ---: |
| CMU2007 k3 | 477 | 0.050633 | 0.059294 | 0.030808 |
| **CMU2007 k4** | **68** | **0.013276** | **0.009993** | **0.008326** |
| CMU2007 k5 | 3 | 0.490429 | 0.465023 | 0.452123 |
| CMU2007 k6 | 1 | 0.122028 | 0.116589 | 0.069942 |
| SCOWL2011 k3 | 276 | 0.184471 | 0.189873 | 0.203164 |
| **SCOWL2011 k4** | **29** | **0.241587** | **0.222518** | **0.139883** |
| SCOWL2011 k5 | 1 | 0.699985 | 0.695536 | 0.654455 |
| SCOWL2011 k6 | 1 | 0.122028 | 0.116589 | 0.028310 |

Bonferroni-correcting the minimum tail over the **eight frozen dictionary×width choices** yields respectively **0.1062056** (global phase), **0.0799467** (page rotations) and **0.0666112** (uniform exact digrams). None is below 0.05. These adjustments do not include the multiplicity of historical exploratory runs that led to this hypothesis, so they favor the signal if anything. The specific CMU2007 k4 original count 68 persists as a suggestive finite single-test anomaly; **SCOWL2011 k4 does not corroborate it**. The SCOWL k6 one-event tail is likewise too sparse and multiplicity-sensitive to support a key.

## Uniform original-digram sampler: proof and diagnostics

The old Hierholzer random-outgoing-order sampler generated legal same-digram trails without proving uniformity. The replacement in `sims/lp2_gp4_two_period_lexicons_source_sft.py` samples a **uniform directed spanning in-arborescence rooted at the page's authentic terminal rune** via Wilson's loop-erased directed random walk on individually labeled original edges. Every non-root vertex holds its tree edge as its final departure; its remaining outgoing edges are uniformly permuted, while the root uniformly permutes all departures. Deterministic edge traversal from the authentic first rune then constructs a legal complete trail.

Each labeled Euler trail has a **unique** set of vertex departure orders and corresponding last-exit tree. For fixed degree counts, the number of departure-order choices is constant across trees. Wilson's directed construction is uniform over labeled arborescences because every vertex draws each individually labeled outgoing edge with equal probability. The resulting distribution is therefore uniform over labeled Euler trails. Forgetting edge labels retains uniformity over distinct rune trails: each such trail has the same `product(m_uv!)` number of parallel-edge labelings. The original page start/end runes and every page's exact directed digram histogram are verified on generated source specimens.

An exhaustive small multigraph fixture has six distinct rune trails; 6,000 independently sampled originals had frequencies **975, 980, 997, 1000, 1019, 1029**, consistent with the exact target 1,000 each. The 1,200 full-book uniform sampler uses seed **3301839** and original full-source word slots; original CMU k4 null mean **50.37417**, nine of 1,200 draws at least 68; SCOWL k4 null mean **23.44417**, 167 of 1,200 at least 29. The separate prior nonuniform sampler's mean 50.8028 did not account for all selection effects.

## Positive controls and decryption decision

Original solved p57 is checked rune-by-rune using **authentic GP spelling**, retaining the single NG rune in TUNNELNG. Both frozen historical lexicons match **15/15** eligible p57 three-rune word starts, **12/12** four-rune, **8/8** five-rune and **6/7** six-rune starts. Replacing the first four original glyphs at 25 eligible printed word starts with HOME raises the independent original k4 counts **68→92 (CMU)** and **29→53 (SCOWL)**. These controls demonstrate the statistic detects genuine word-initial source-English structure when present.

**Decision:** retire the unselected GP4 lexical excess as an independent decryption selector. Its single-dictionary finite excess survives two controls, but the independent period SCOWL source and correction for eight frozen comparisons fail to corroborate a robust signal. There is no contiguous 40-rune original plaintext, no independently selected word-initial cipher, and no source-given key. A future original-authenticated instruction naming word beginnings and an invertible operation would justify testing a new prospective chapter, not re-optimizing dictionaries or p32 HOME.

**Reproduction:** `sims/lp2_gp4_two_period_lexicons_source_sft.py` (Python3.11, numpy2.1.3; historical dictionary retrieval and SHA outputs), manual-only `.github/workflows/lp2-gp4-two-period-lexicons-source.yml`. Earlier two-period source test [Windows PASS 43545234553](https://github.com/FlareZ123/liber-primus/actions/runs/43545234553); new exact-uniform control [Windows PASS 43560078079](https://github.com/FlareZ123/liber-primus/actions/runs/43560078079). Earlier single-dictionary source parser, first-order legal trail and exact global-phase studies remain readable in their linked SFTs. Nothing in these tests recovers an unknown LP2 rune.
