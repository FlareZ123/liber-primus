# Printed-group order: independent corrected-source adjudication (#2670)

## Decision
Reproduces the Round45 W1 **whole-book absence of detectable adjacent length-order structure** on the same manuscript, using a separately written parser, image-corrected punctuation, a new language model, and strictly within-scope adjacent pairs. This is evidence against the intact, ordered ordinary-English length model, not a proof that every printed group is a decoy or that the underlying plaintext itself has been permuted. Native p56/p57 individually demonstrate insufficient short-page power. No unknown plaintext, key, or cipher operation recovered.

## Inputs and exact segmentation
[Original images](../resources/liber-primus/) are primary. Visually spot-checked archive 17/18 (p0/p1, wrapping and actual printed markers) and 73/74 (p56/p57, known plaintext controls and line carries); existing [original-image adjudication](lp2-layout-order-solved-source-gate.md) establishes the compositor and physical line behavior. This is a spot check plus an existing image-audited transcription, not a fresh manual transcription of all 75 scans. Use `resources/transcriptions/lp2-image-corrected.txt` (blob f7b534a33edeb212d427329798438325307463d7), `resources/transcriptions/lp1_wulfic_canonical.txt` (37c96b816495c5f93ca658a01c9918bf92598316) and canonical `lp2-corpus.json` (054f2a0f780b7d46901acbe3d9bf4f0ac1801165). The independent regex parser removes /, % and whitespace while preserving original physical coordinates on every retained character, then matches maximal GP29 runs. Other characters delimit groups. Insert runeless p50 in the physical page mapping; compare **all 58 physical page rune arrays** against the JSON. It gives 12,956 unsolved runes, 2,896 groups, 32 spanning pages, 420 spanning physical line IDs including those 32, and 173 periods. 694 LP1 groups; p56 25 groups/85 runes, p57 20/95. These are printed rune lengths, not editor-normalized Latin word lengths.

## Experiment
[CommonJS SFT](../sims/lp2_r45_word_order_independent_sft.cjs) · [raw JSON with input blob pins](lp2-r45-word-order-independent-output.json). Train the 8-class (1–7, 8+) transition log-odds on the first 37,356 words of the Gutenberg Emerson source using greedy ING/TH/EO/NG/OE/AE/IA/IO/EA rendering. Evaluate mean log-odds (LLR) and plug-in adjacent length MI. Use 1,999 seeded Fisher–Yates permutations with identical per-scope inventories. Unlike external W1's global-pair statistic under restricted permutations, here only pairs whose two group starts share the scope are included. No adjacent pair crosses a tested scope boundary. The external W1 source [RESULTS](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round45/W1-spaces/RESULTS.md) blob 9b4f58267f898f1d56d41d10879c7c04cbd73ad9 and [q1_scope.py](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round45/W1-spaces/q1_scope.py) blob 4b77ea979b198d5882789df12b23e21eaaceb620 were read to distinguish the two methods.

| Scope | Pairs | LLR z | upper p | MI z | upper p |
|---|---:|---:|---:|---:|---:|
| Global | 2895 | -0.632 | .7350 | +0.077 | .4460 |
| Sentence | 2723 | -0.751 | .7745 | -0.967 | .8345 |
| Line (group-start) | 2304 | -0.058 | .5220 | -1.612 | .9585 |
| Paragraph | 2879 | -0.727 | .7675 | -0.131 | .5360 |
| Physical page (group-start) | 2841 | -0.963 | .8390 | -0.308 | .5975 |
| Section | 2888 | -0.781 | .7785 | -0.022 | .4865 |

Global original MI .008644645 vs permutation mean .008513786 nats. Global LLR -.040652099 vs null -.037779363 nats/pair. No test significant even without multiple-comparison correction. The 8-bin histogram is [83,448,720,513,317,256,216,343]. No language or plaintext inference follows from its shape.

| Genuine solved reference | Groups | LLR z/p | MI z/p |
|---|---:|---:|---:|
| LP1 | 694 | +3.332/.001 | +2.819/.007 |
| LP2 p56 | 25 | +1.387/.075 | +0.753/.2275 |
| LP2 p57 | 20 | +0.979/.156 | -0.696/.7555 |
| LP2 p56+p57 | 45 | +1.468/.066 | -0.092/.518 |
| Combined LP1/LP2 | 739 | +3.589/.0005 | +2.794/.0045 |

The combined test concatenates the two books, including the single artificial join; the separate LP1 result is the relevant native positive. The p56/p57 combined test is likewise a descriptive concatenation, with individual results provided. The small native controls genuinely preserve word order despite nonsignificant tests. Thus no claim that *each* unknown page or short ordered patch lacks true word order is warranted.

Full-length controls: 16 nonoverlapping 2,896-word windows (6 Emerson held-out, 4 Gibran, 6 Shakespeare), each with 399 permutations. All 16 intact windows have both global p=.0025 (the finite Monte Carlo floor), LLR z 3.943–13.892, MI z 6.225–22.404. Their independently scrambled same-inventory companions have no p<=.005 result; at nominal .05, one LLR and one MI false positive. This is 16/16 global power on this finite control collection, not a universal 100% power assertion, nor an independent calibration of all six strict scopes. The native text and donor controls do not share manuscript provenance; no new held-out original ciphertext exists for the book-wide structural test.

## Three-way interpretation and what changes
1. **Intact plaintext words in order:** disfavored at whole-book scale for the solved/native-literary registers and the measured length-order feature. A different register, ordered short passages or a length-changing mapping can defeat this test. The native short controls demonstrate that limitation directly.
2. **Intact words permuted:** compatible. If the plaintext words were permuted before encryption and their lengths preserved, an arbitrary permutation destroys order but retains word-local lexical constraints. If a cipher word is permuted after encryption, global state/continuity changes; this is a different receiver and is disfavored for large-scale ciphertext rearrangement by the separately scoped doublet evidence.
3. **Arbitrary separators:** compatible when lengths have a plausible inventory. Conditional on a fixed multiset M with multiplicities m_l, both a uniform permutation of genuine word lengths and a decoy generator uniformly drawing an arrangement of M assign exactly prod(m_l!)/n! to each distinct length tape. Every length-only statistic has the same distribution in those two constructions. No extra statistic on the same length tape can distinguish those mechanisms without an independently specified nonexchangeable law. Geometric independent spacing is a narrower hypothesis externally rejected, not the entire decoy class.

**Attack consequences:** #2656 joint semantic running-key inference should remain spacing-free; #2665–2668 explicitly use continuous rune tape and remain valid without word order. #2273 may use printed punctuation/group locations as physical side information without assuming linguistic word order; it must not assume that they are plaintext-word boundaries when calibrating exception or word-reset rules. Historical word-indexed tests such as #2617 (q8 difference lexical gate), #2650 (prime-residue lexical gate), and #2631 (word-local Latin renderer) remain valid under their stated intact-group assumptions, but cannot exclude resegmented plaintext; group ordinal keyed by physical print is a different premise from ordinal in unpermuted plaintext. Spacing-free inverse tests are unaffected by relocating separators alone; their power under a changed plaintext order or reset clock is a separate question. Q4's adjacency statistic does not rule out a key reset coexisting with a continuous output constraint. [Critic audit](../communications/broadcast/2026-11-25T0212Z_critic_q4_boundary_identifiability.md). Do not reopen a family solely because it used a printed group position: ask if that is a physical key selector or a claim about true plaintext syntax.

**Next decision:** prioritize an independently selected spacing-free full inverse and infer its plaintext boundaries afterward. A candidate should predict unknown prose and, if it hypothesizes true boundaries, test its inferred boundary agreement on independent original material. No standalone re-permutation search or arbitrary resegmentation enumeration follows from W1. The local earlier [order experiment](word_length_order_20261110.md) already established adjacent MI null; the substantive additions are strict same-scope tests on corrected source, the genuine short native negative controls, and the explicit conditional identifiability obstruction. No new CI.

Core executed twice in V8 on pinned fetched source text, including once from the committed script; the standalone Node filesystem entry point was not separately executed. No independent all-image transcription was performed.
