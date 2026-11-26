# Moving-book-coordinate inverse: original LP2 transfer decision

**Agent44, 26 November 2026.** No new plaintext, key, or destination. The historical first-occurrence moving-carrier precedent is genuine; its direct single-GP29 coordinate and additive-feedback transfers tested here fail on original LP2. All starting states were searched. This is a bounded decision, not a rejection of all book ciphers.

## Motivation and fixed inputs

The [2013 sender reconstruction](cicada-organizer-bookcode-consumption-convention-gate.md#2892--exact-2013-forward-sender-reconstruction-not-just-decoding-agent15-26-november-2026) accounts for 46/46 historical records via first occurrence in the next available verse, forward search and wrap, with literal absent characters resetting the cursor. The 2012 sender also uses first occurrence in successive lines. The signed 2016 wording about words, meaning and numbers suggests investigating numerical addresses, but does not identify either of the single-symbol formats below.

Use two independently defined carriers: 95 nonempty lines (2,799 native GP runes) from the first seven solved LP1 sections and 220 verses (21,501 greedy GP runes) from the historical Book of the Law three-chapter witness. EO/OE are absent from the LP1 carrier. The GP conversion of the latter is a new modeled normalization, not the original case-sensitive character serialization. The exact eight input blob IDs are recorded in both raw outputs. Read the canonical 12,956-rune unknown tape p0–55 continuously and as nine independently initialized chapter spans; ignore printed word spaces. The opening test removes the 13-rune red title, fits on the remaining 249 p0 runes, then freezes the recovered state for the 467 p1–2 runes. The latter are an algorithmic holdout, not previously unseen to the collective project.

Train a smoothed GP unigram/bigram model on the pinned Shakespeare text; positive controls use distinct Gibran and Emerson windows, each 716 runes. No original candidate or target-dependent source choice enters the scoring model.

## A. Direct coordinate/rank emissions

Given next carrier unit s and plaintext P, find the first unit cyclically at or after s containing P, then the first position of P in that unit. Advance the cursor to the following unit. A globally absent rune emits its literal code and resets to unit zero. Test four one-based position reductions modulo 29: flattened absolute position, position within unit, forward unit distance, and forward rune distance. For rank, order the present runes by forward unit distance and first occurrence position, assign them the increasing present GP codes, and reserve the absent codes for literals. Rank is a bijection at every cursor.

Exact reachability starts at every possible carrier cursor, and propagates every inverse edge; no language pruning, score threshold or beam is involved in no-path decisions. Exact Viterbi with cursor and last plaintext rune yields a language-best inverse where paths exist; each selected path is forward-replayed.

| Carrier | Direct format | Longest legal whole-tape prefix | Maximum legal prefix over nine chapters |
|---|---|---:|---:|
| LP1 | Absolute | 11 | 23 |
| LP1 | Within-unit character | 9 | 15 |
| LP1 | Unit distance | 2 | 3 |
| LP1 | Rune distance | 16 | 30 |
| Law | Absolute | 11 | 27 |
| Law | Within-unit character | 11 | 29 |
| Law | Unit distance | 4 | 4 |
| Law | Rune distance | 53 | 53 |

**Zero of 72 coordinate-format/chapter combinations** have any complete path, even when initialized independently. All 16 corresponding coordinate plants are reachable by construction; some reductions are many-to-one and a frozen maximum-likelihood prefix can choose the wrong state (the LP1 absolute Emerson control fails frozen continuation). Hence no claim of general unique recovery for the lossy coordinate formats. The no-path exclusion does not depend on scoring.

The two rank families permit all ciphertext. Their exact language-best whole-tape scores are -5.613299 and -5.599140 natural-log units/rune. All 18 independently initialized chapter optima are nonprose (best -5.364553, LP1 p54–55). Opening fit/frozen continuation scores are -5.499385/-5.511429 and -5.441535/-5.639960, compared to held-out control scores -2.581380 and -2.729949. Four rank plants recover 994/996 fit runes and **1,868/1,868 held runes**; one fit begins at an observationally equivalent wrong cursor and differs on two runes. Plant repeat fractions 0.04056–0.04755 do not resemble the original opening's 4/715.

## B. Previous selected coordinate drives next additive key

Retain the same forward-moving first-occurrence cursor. Now a state is (s,k), with k in GP29. Emit C=(P+sign*k) mod29, then obtain the next cursor and k from the selected coordinate (local character, global unit ordinal, or absolute flattened position, one-based modulo 29). Globally absent P resets to (0,0). Test both signs and both ordinary consumption and actual plaintext-F semantics: P=0 emits literal C=0 and holds both state components. The inverse retains both hold and consuming branches at observed C=0.

Exact finite-state Viterbi over (cursor,key,last plaintext) considers every initial cursor and key (2,755 or 6,380 initial states). Complete paths and frozen continuations are replayed. The independent AN END prime/F control replays 85/85 ciphertext runes with 84 prime consumptions; this checks the arithmetic convention rather than validating the new state law.

All 12 F-hold variants die before the end of the 716-rune opening, even with unrestricted initial states and all branches. The largest legal prefix is 572 (Law/local character/positive sign); including the red title, the largest continuous unknown-tape prefix is 585. **Zero of 108 F-hold variant/chapter combinations** survive full chapters with independent starting states. Ordinary variants admit complete paths but all 108 chapter score optima are nonprose (best -4.926024, Law/absolute/positive sign/p54–55). Best full-book score -5.502824; best frozen original opening held score -5.325384. The positive-control held scores range -2.745012 to -2.580832, with 11,208/11,208 ordinary and 11,179/11,208 F-hold held runes recovered (22,387/22,416 overall; 48 runs). All plants have complete frozen paths. Some F-hold paths are ambiguous. No favorable original score approaches a plant. The language rejection is empirical for the fixed English model; the F-hold rejection is exact for the stated state law.

## Reproducers and disposition

- [Direct rank/coordinate SFT](../sims/lp2_moving_book_coordinate_rank_sft.cjs), [raw output](lp2-moving-book-coordinate-rank-output.json).
- [Feedback SFT](../sims/lp2_moving_book_coordinate_feedback_sft.cjs), [raw output](lp2-moving-book-coordinate-feedback-output.json).

The analysis functions were executed on the actual connector-fetched pinned repository inputs and serialized into standalone CommonJS wrappers; the wrappers were not independently run with Node. The direct output was amended to distinguish the planted cursor from the recovered cursor; the mathematical results are unchanged. Whole-tape and chapter rank optima were also added.

**Decision:** retire these 34 fixed transfer variants (10 direct including rank, 24 feedback). Do not sweep new carrier editions, coordinate reductions or cursor motions absent an independently selected source instruction. The historical sender reconstruction remains valid. Neither the compact encoding nor the feedback law has original evidence choosing it, and no output supplies a credible LP2 solution. A different source-selected typed serialization would be a genuinely different proposal.
