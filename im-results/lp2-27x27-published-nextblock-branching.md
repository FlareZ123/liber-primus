# The published 27×27 route leaves many admissible next words after block 38

**Agent 49, 11 November 2026. Classification:** exact original-source enumeration of an *external, unverified* candidate decryption scheme. This is a constructive next-step ambiguity certificate, **not an authenticated LP2 plaintext recovery**. The script below searches only source-admissible placements and matches their complete decoded output against a fixed independent GP-encoded Shakespeare vocabulary.

## Full 38-block original-cipher audit (Agent 22, 11 November 2026)

An independent numerical reconstruction of **all 38 externally selected blocks** uses the canonical 729 original GP29 runes from physical pp0–2 and the published source-node and ciphertext coordinates. Every aligned three-rune key is obtainable from one of the annotated source triplets by either keeping the center rune or applying Euler's totient to it, followed by the specified Möbius-derived left rotation. All **115 individual ciphertext readings** reproduce the proposed GP runes exactly under subtraction mod29 and exactly re-encrypt under addition mod29. This confirms *arithmetic consistency conditional on the selected route*; it supplies no independent selection rule and therefore authenticates no unknown plaintext. The C/K glyph is transcribed C in the reproducible GP register, so the proposed English KEY and ASK render CEY and ASC in the test.

Only **103 of 729 source cells** are used as ciphertext across the 38 blocks. **Eleven ciphertext cells are revisited**, creating twelve additional readings; nine of those cells receive *different proposed plaintext rune labels* across visits. For example, original cell (14,16) reads TH in block 02 WEATHER but F in block 28 MAP LIFE; cell (14,19) reads T in block 03 TURNS but TH in block 07 NOW THE; cell (25,16) reads S, U and S in blocks 14–16. These contradictions reject an interpretation where each matrix location has one invariant decoded plaintext rune. The proposed algorithm permits differing keys between blocks, so these overlaps do **not** refute its context-dependent inverse.

**p0 opening-seed candidate (source-derived, provisional):** the original p0 annotation fixes a red span of 13 runes followed by the red 13-dot mark; the red heading is horizontal. The 13 runes have GP-prime weights `53,23,67,7,17,71,107,2,53,103,67,79,13`, summing to **662**. Agent43 had already documented the two red words (lengths 8 and 5; prime sums 347 and 315), their total 662 and mean 331, and the negative 480-model raw-331 PRNG-seed inverse ([prior arithmetic report](red-prime-totient-crosslink.md)). The present hypothesis is different: apply the historically signalled totient directly to the full sum, φ(662)=330, then reduce mod29 to obtain **11 = J**. Agent12 independently noted this simpler expression ([cross-check](../communications/agent22/20261111T120748Z_agent12_phi662_opening-selector-check.md)). This is not the failed raw-331 seed construction.

The 729 original GP29 runes on pp0–2 form 27² cells. Under the candidate one-based row-major layout, the 13 red runes select row 13 and φ(13)=12 selects center column 12. The horizontal heading selects a horizontal node centered at (13,12), flat indices 334–336, whose original symbols are **AE–J–EA**. The φ(662) mod29 result predicts its central J. Applying the candidate center transform φ(11)=10 gives key **AE–I–EA**. The three-rune node size has only weak visual support: Agent42's source-first stave audit counts three separated projections on each p0 marginal mark and a three-projection p22 control, but finds the projections irregular/nonparallel and the p22 object only a loose analogue; this is a possible count cue, not a proven node segmentation ([geometry audit](original-visual-clue-operation-map.md), [reproducer](../sims/lp2_opening_stave_geometry_sft.py)).

The first black line after the red 13-dot marker has exactly **7** runes (two printed words of lengths 4+3), selecting block length 7. The two opposed p0 marginal stave-like marks provide a possible factor 2, so **2×7=14** selects the rightward offset from the node's first cell. This is independently reproduced by the key arithmetic φ(11)+φ(10)=10+4=**14**. The p0 marks are a repeated 180°-opposed pair, not six independent page-specific symbols; Agent42's full registered image audit reports p0 pair IoU **0.961925** and documents the p1/p2 reuse. (The earlier 0.985 figure was a tighter fixed-crop threshold comparison, not the same registered-mask measurement.) The candidate path therefore starts at original flat index **348** and has seven cells, 348–354: **L–AE–N–TH–P–U–X**. Repeating AE–I–EA subtraction mod29 gives **A–S–I–G–O–TH–E** (ASIGOTHE). The decoded phrase was not used to choose the coordinate, node, key, path or length.

A page-0 cyclic-rotation null preserving the 13-rune window position gives the exact prime sum 662 at **2/262** shifts; the broader direct condition φ(sum) mod29=11 occurs at **15/262** shifts. These are descriptive conditional rates, not discovery-wide p-values: the arithmetic relation was noticed after examining the source and the transformation family was not preregistered. They caution against treating the J match alone as decisive.

**Archived Onion7 133/331 as a possible original-address shorthand (retrospective, not an independently validated decoder).** The 2014 delivery HTML contains `<title>133</title>` and `<div id="331">`; the first 13 red source runes have prime sum **662=2×331**. These exact historical relationships were already documented in [the original Onion7 source gate](onion7-html-red331-source-inversion.md), so the new hypothesis concerns their *coordinate use*. On the source-supported 729=27² opening grid, divide the HTML numbers by 27: **133=4×27+25** and **331=12×27+7**. Combining the red-heading count **13** for a row and the quotient **12** for a horizontal three-rune source-node column selects original cells **334–336 (AE–J–EA)**. Replacing its center J11 with φ(11)=I10 gives the key **AE–I–EA**; title remainder **25** locates original ciphertext (row13,col25), and div remainder **7** fixes its run length. Original positions 348–354 decrypt by GP29 subtraction to **ASIGOTHE**. The title quotient **4** also equals the resulting run's endpoint column. This is an exact arithmetic fit to the *already published* first block, and the combination of quotient, remainder and key rules was proposed after that reading was available. It is **not** a successful blind plaintext prediction.

A further constrained *retrospective* path fits the next three published blocks without altering original runes. Use the first run's final ciphertext rune as the first member of the following three-rune key source: positions 354–356 are X–OE–X, becoming X–X–I after center φ and Möbius rotation; the unique center of 27×27 is position 364. The residue **(133+331) mod27=5**, also the source red-heading second-word length, sets the run 364–368, yielding **WEATHER**. One cell further right begins the third cipher at position369, (14,19). The derived preceding I10 gives **φ(10)=4** columns right to source center (14,23), with a radius of ten up/down selecting raw vertical **H–NG–C** at positions 103,373,643. Under the untransformed key, the five-position **upward** path 369,342,315,288,261 gives **TURNS**; the same fixed key on down/right/left five-cell controls gives **TCPYX/TXLMF/TYIARNG**, respectively. The next source center is twelve rows below (14,19), because φ(NG21)=12, exactly the div-ID quotient. The raw vertical H–TH–H at positions 666,693,720 gives aligned U–H–H under center φ and Möbius rotation. Moving twelve columns left from (14,19) yields (14,7), consistent with the div-ID remainder **7**; a four-position upward run, the title quotient **4**, gives **COLD**. The explicit original-cipher SFT is [onion7_133331_27square_opening_chain_sft.cjs](../sims/onion7_133331_27square_opening_chain_sft.cjs). Its 21 decoded runes are the same first four segments already chosen by the external author, with exact inverse/re-encryption by construction.

**Decision:** this provides a potentially simpler *human-visible numeric address story* for the already known opening route. Its source-first value remains uncertain: the HTML may be a participant-preserved rendering rather than an authenticated author instruction; quotient/remainder assignments, use of horizontal/vertical keys, totient-versus-literal centers, direction of third/fourth reading and later source jumps were recognized after seeing the external plaintext. The 133/331 coordinate coincidences reuse already selected numeric cues and therefore cannot be multiplied into an independent success probability. It does **not** supply an unused, source-fixed original LP2 prediction, nor resolve the 21,818 admissible block39 continuations described below. Promote it only if a historical clue uniquely fixes this coordinate convention or if it predicts a **previously unselected original ciphertext segment** with authentic language and a comparably fixed wrong-rule control.

**First transition consistency check:** from AE–I–EA, the external Report01 initial state (S=0,a=0) predicts next phase 2 and outer value 1 from block01 ciphertext positions 349–355, hence next key signature (+1,0,+1). The natural three-cell continuation at 354–356 is X–OE–X; applying φ(22)=10 gives unrotated X–I–X, with exactly that signature, phase 2, and aligned key X–X–I. External Report03 with B=(13,25), E=(14,4), M=(13,12), h=11 gives A=717, G=5, q=0 and τ=1, predicting a horizontal next block read leftmost-first. The published block02 cells 364–368 are row 14, columns 14–18, matching those features. The [p0 seed-selector SFT](../sims/lp2_27x27_p0_seed_selector_sft.py) reproduces this check. It predicts next-key signature, axis and boundary, **not** exact start or length; moreover these transition rules are from the same external proposal and this comparison is not blind. A further φ(22)=10 step / φ(22)/2=5 length formula matches block02 but is post-hoc and not accepted as a rule.

This candidate narrows the earlier five-way opening-key ambiguity to one published first key **if** the 27×27 row-major layout, (row,column) convention, three-rune node and two-stave displacement interpretation are accepted. It is not yet an authenticated cipher. The 27×27 layout and coordinate convention remain assumptions; the three-projection clue is weak; and the block02 check is internal consistency, not independent validation. The 52-word block39 ambiguity remains. The proposed Latin **SECUENDI RATIO** is not an independent opening crib: the external walkthrough derives its RATIO key from the proposed block28 MAP source and ciphertext, and its opening word uses a different four-rune rectangle key. It is a conditional consistency check. The external block18 walkthrough also drops its initial coordinate selector and CENTER/OUTER heuristic after THEN. Therefore the 38-block plaintext remains a conditional candidate, not established decryption.
### First-successor enumeration: block02 remains underdetermined

The p0 seed-selector SFT gives a provisional opening state: source node **AE–J–EA**, derived key **AE–I–EA**, phase 0 and outer state 0; original cells 348–354 decrypt to **ASIGOTHE**. Agent17's existing first-transition check shows that the frozen external Reports 01 and 03 predict block02's key signature, ciphertext axis and reading boundary. The following test asks a stricter question: do the published successor constraints select block02's exact source node and ciphertext path without using English?

Using block01's original coordinates and the published Reports **01–15**, the frozen successor constraints are:

| Constraint | Prediction from block01 | Published block02 |
|---|---|---|
| Report 01 | Next phase 2; unrotated signature (+1,0,+1) | X–OE–X → X–I–X, signature (+1,0,+1), aligned X–X–I |
| Reports 02–03 | Horizontal ciphertext, leftmost-first | Row 14, columns 14–18 |
| Reports 04–05 | Next key center even-row/odd-column; next ciphertext endpoint and leftmost rows even | Center (14,5); both ciphertext endpoints on row 14 |
| Reports 06 and 12 | Exact ray-offset score 0 from current leftmost cell (14,1) | Next beginning (14,14), score 0 |
| Report 07 | Next original node is a mirror | X–OE–X has equal outer runes |
| Report 09 | Next ciphertext's leftmost column is even | Column 14 |
| Report 10 | Four squarefree-GCD conditions | All four GCDs are 1 |
| Report 11 | Phase 2 does not skip a multiple of 7 from S=0 | S advances 0→2 |
| Reports 13–14 | Next original source axis horizontal | X–OE–X is horizontal |
| Report 15 | Next source radius odd | Radius 1 |

These matches establish **internal consistency** of the proposed transition system, not independent validation: the reports belong to the same external route and do not specify an exact next center or block length.

The bounded enumeration then considered every next horizontal three-rune source node satisfying the predicted center parity, mirror status, odd radius and signature (+1,0,+1), allowing either an unchanged center or the published φ(center) transform. It paired those nodes with every horizontal, leftmost-first ciphertext path satisfying the predicted row/column parities, exact ray-offset condition and minimum length of two runes, then applied all four Report 10 GCD tests.

| Enumeration stage | Count |
|---|---:|
| Derived-key node variants | 6 |
| Candidate ciphertext paths | 169 |
| Node/path assignments | 1,014 |
| Assignments passing all four GCD tests | 730 |
| Assignments segmentable into complete words | 9 |
| Distinct word outputs | 6 |

The word filter uses the repository's independent resources/control/english_wordfreq_textblob.txt, retaining entries with frequency ≥10, normalizing QU→CW, V→U, K→C and Z→S, and allowing one-rune words only for A and I. The six outputs are **BE** (1 assignment), **GO** (2), **IV** (2), **OF** (1), **RD** (2) and **WEATHER** (1). IV and RD are weak abbreviation/lexical hits; even excluding them, BE, GO, OF and WEATHER remain. The published WEATHER node/path is included, but it is **not uniquely selected**. WEATHER is the only five-rune single-word output; none of Reports 01–15 independently predicts a five-rune length.

Agent42's independent block03 check also rejects the tempting post-hoc extension that uses φ(center)/2 as block length and φ(center) as the next start displacement: it predicts block03 start 380 and length 6, whereas the published path starts at 369 and has length 5. Do not tune this rule to rescue block02.

**Decision:** preserve the p0 opening as a provisional source-derived candidate, but do not promote the 38-block text to established plaintext. The first successor still needs an original-source selector for its exact node location and ciphertext length. Do not continue dictionary sweeps or add new arithmetic exceptions in the absence of such a clue.

Reproducer: [block02 successor ambiguity SFT](../sims/lp2_27x27_p0_block02_ambiguity_sft.cjs). The external proposal is linked for context; its repository declares no license, and no external code is copied here.

### SOON's three source states and the parity rule that distinguishes them

The published [block16 SOON walkthrough](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/f2090da0a4470a3fec648a684171b452a9ada3ae/plaintext-i-found/16-soon.md) gives **three original key nodes**. All produce exactly the same φ-transformed key `L–R–EA`, aligned `EA–L–R`, and the same original four-rune ciphertext `X–D–W–H` at (25,16)–(25,19), yielding SOON. Under the published next-axis Report 03, the original key-center coordinate `M` still matters: `A=n₂(B)+n₀(M)`, `G=gcd(n₁(E),n₂(E))=3`, and `q=μ(A)+μ(G)`. The three source nodes give:

| SOON original center | Original node | A | μ(A) | Report 03 next-axis forecast |
| --- | --- | ---: | ---: | --- |
| (25,7) C/K | L–C–EA | 721 | +1 | Horizontal |
| (20,15) I | L–I–EA | 594 | 0 | Diagonal |
| (25,14) EO | L–EO–EA | 728 | 0 | Diagonal |

**Crucial full-rule reconciliation:** The external [Report 04](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/f2090da0a4470a3fec648a684171b452a9ada3ae/Start-reading-here/04-predicting-next-key-center-parity.md) supplies the previously omitted source selector. Applied to the preceding block15 YOU (`B=(27,18), E=(25,16), M=(16,16)`), it calculates `n₂(B)=10, μ(10)=+1` and predicts **odd row / odd column** for the SOON key center. Of the three nodes, **only (25,7)** satisfies that parity, and its Report 03 forecast is horizontal, matching the published block17 THEN. Therefore this three-way ambiguity is **resolved inside the complete published Reports 01–16 set**. It must not be cited as an enduring contradiction. It does illustrate a nontrivial *dependency*: decryption of SOON alone gives no unique original source center; the retrospective fitted cross-block parity constraint selects it. The actual unresolved provenance question is whether this parity rule was determined independently, or fitted from the same 17 selected blocks.

The [independent original-cipher SFT](../sims/lp2_27x27_first38_original_audit_sft.cjs) asserts all three Report03 forecasts, the Report04 parity result, and the sole surviving center. The earlier restricted opening-selector gate still has five candidates; the p0 source candidate above narrows them to the published first key if its assumptions are accepted, but it is not yet an authenticated selector. The block01-to-block02 check is internal consistency under the external reports, not an independent solve.

**Exact independent reproducer:** [`sims/lp2_27x27_first38_original_audit_sft.cjs`](../sims/lp2_27x27_first38_original_audit_sft.cjs) under Node.js 22/CommonJS. It preserves the original corpus, freezes each selected key and ordered path, independently checks collinear/equally spaced annotated source nodes and φ/μ key alignment, verifies all 38 selected plaintext outputs and exact forward re-encryption, and asserts the 115/103/11/9 original-source counts plus the five-way red-heading-first-key ambiguity. The reported route and original-key choices originate in the [external public walkthrough](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/f2090da0a4470a3fec648a684171b452a9ada3ae); original code is independently authored. Independent controls over *the admissible next step*, already provided below, retain the crucial 52-word ambiguity.

## Source and the decision question

The [2retooz270703 27×27 map proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption) lays physical LP2 pp0–2's **729 ciphertext runes** into a 27×27 row-major grid. Its reported route uses independently chosen source *three-rune key nodes* and selected ciphertext runs to produce English words. Reports [00–16](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/main/Start-reading-here) introduce deterministic cross-block constraints involving the Möbius function, Euler's totient, original rune weights, grid rotations and parity. The author's stated remaining obstacle is selecting the exact next cells. [SECRA's 15 October audit](https://secra.tech/research/liber-primus-strongest-findings/) reproduced the earlier route arithmetic but did not authenticate an independently selected path; the public route has since expanded through block 38. **The proposed words have not been established as Cicada plaintext.**

An especially constructive test is to freeze the published last block **38, `I ASK`**, and enumerate every immediate continuation admitted by the author's *own* rules. No target next word is specified. The source last block is fixed as:

- Original source node `(11,13) (12,13) (13,13)` with indices `[16,19,28]`, center `M=(12,13)` and unrotated phase 0.
- Four-cell ciphertext run down `(5,17)` through `(8,17)`, with first/last `B=(5,17), E=(8,17)` and geometrically leftmost `L=(8,17)`.
- Published accumulated phase `S=32`, outer signature bit `a=0`; the next update uses its declared cyclic four-mode extension.

All enumerated symbols come from the repo's **unchanged canonical original ciphertext**, not from the published route's derived words or proposed plaintext.

## Frozen prediction from Reports 01–15

Applying the published cross-block formulas to those *fixed previous-block inputs* gives the following prospective constraints on block 39, before examining any putative next plaintext:

| Required next-block property | Source-derived forecast |
| --- | --- |
| Derived key signature / phase | `(0,+1,0)` / `p=1` |
| Accumulated state | `S=33`; no multiple-of-seven threshold is skipped |
| Original key node | **Horizontal**, non-mirror, even center row, even center column, **even radius** |
| Ciphertext run | **Diagonal**, beginning at its geometrically leftmost cell |
| Cipher start | Odd row, even column, on one of the eight rays through prior `L=(8,17)` (**zero** offset) |
| Cipher endpoint | Odd row |
| Cipher local mode | Direct; `μ(n₁(L′))` must be 0 or +1 |
| Source/cipher joint conditions | All four published squarefree-GCD tests on rotated coordinate indices |
| Plaintext block | At least two runes, all accounted for by complete English word(s) |

Because diagonal source ciphertext runs advance one row per column, both the first and final row are required odd, so their lengths must be **odd**. The natural shortest permitted block therefore has **three runes**. For the source node, both the unchanged and center-totient key readings are allowed, and either node reading direction is permitted, just as in Report 00. The key's canonical phase is computed *before* rotation.

## Exact exhaustive original-cipher enumeration

| Frozen-search statistic | Observed |
| --- | ---: |
| Admissible original three-rune source key assignments | **172** |
| Contiguous original ciphertext paths satisfying geometric rules | **132** |
| Source×path combinations before GCD gate | **22,704** |
| Combinations after all four GCD tests | **21,818** |
| GP-encodable distinct Shakespeare word types, length 3/5/7/9 | **2,547** |
| Original-decoded assignments yielding one complete Shakespeare word | **60** |
| **Different complete English words possible** | **52** |

The fixed Shakespeare corpus serves only as an independently available word vocabulary, not a learned key, probability calibration, or evidence that the hidden LP2 language must be Shakespearean. The test deliberately counts **single complete words**; allowing multiword segmentations expands the candidate set. The 52 distinct outputs are therefore a **lower bound on the many-to-one ambiguity of this publicly specified continuation exercise under this declared dictionary**.

Three constructive examples, with GP arithmetic done on original grid cells and the matching source-derived three-key aligned stream:

| Full next word | Original source center / radius | Ciphertext path | Aligned three-rune key |
| --- | --- | --- | --- |
| **HOW** | `(24,16)`, radius10, unchanged | `(5,20)→(3,22)` | `[18,24,10]` |
| **WHO** | `(22,18)`, radius2, center-totient | `(21,4)→(23,6)` | `[2,27,17]` |
| **DIE** | `(18,14)`, radius4, unchanged | `(3,22)→(5,24)` | `[23,27,5]` |

Each of these words is a complete GP-encodable English token, meets the same frozen forecast and exact squarefree-GCD tests, and reenciphers its three original ciphertext runes under its derived aligned key. No word was inserted as a target or used to select the forecast. They are **alternative completions** of the proposed route, not candidate authenticated plaintext assertions.

## Cryptanalytic decision

The published formulas, including recent exact-axis and exact-radius-parity forecasts, **do not uniquely determine the next decoded block**. They select a limited but still broad space of original symbol paths and source-node keys. A coherent English continuation can be found under several incompatible choices without changing those rules. The p0 candidate above supplies a plausible source-visible selector for block01, but it does not authenticate the 27×27 architecture or the later transition rules. The 52-word block39 ambiguity remains; the first seed alone does not fix the next source position. Until a frozen rule predicts a held-out transition without English-based choice, the 38-block plaintext remains a conditional candidate, not an established decryption.

This does not mathematically refute a more constrained 27×27 cipher or the possibility that a correct path exists among the alternatives. It identifies the currently missing selection mechanism and makes the prospective original-cipher challenge concrete: publish a rule selecting **one** placement from the finite candidate space without looking at the resulting text, and then predict the next several blocks with the rule frozen.

**Reproduction:** [Node.js 22/CommonJS standalone SFT](../sims/lp2_external27x27_nextstep_gate.cjs), which independently computes the source-derived block 39 forecast, enumerates exact original pp0–2 source/cipher geometry, evaluates all four squarefree-GCD tests, converts the repo's existing Shakespeare reference to GP, checks each decrypted word, verifies forward reencryption, and asserts all exact counts above. The external repository is credited and no original ciphertext is modified.
