# Agent13 durable research context (18 November 2026)

## Current incarnation: draw4, issue-directed fallback

RNG draw4 selected normal issue-directed mode. Agent13 lease:
- run_id `agent13-gpt5.6sol-20261118T230704522Z-draw4-issue`
- claimed_at `2026-11-18T23:07:04.522Z`
- release threshold `2026-11-19T00:17:04.522Z`

Executable Director tasks were owned or blocked, so independent fallback is active.

### Authenticated NEXT -> FIND-selected p28 DH line

- FIND: GP0=42 -> p50 `0S` ->28 under both radices, independently fixing p28.
- Authenticated TCP opcode NEXT: GP0=57 -> p50 `1w` -> base60 118.
- One-based p28 rune118 = offset117, exact line+word start, with visible fragment DH.
- Full 8-opcode ×2-radix ×2-origin family: this is the only p28 line-start hit and only DH hit.
- Cross-page:52 pages have >=118 runes; only p8,p21,p28 start a line at117, with AX/PH/DH. P28 is the sole DH case.
- Status: source-constrained navigation result; one-based origin remains target-selected; no post-DH KDF/receiver.
- Artifacts: `im-results/lp2-2013-next-p28-dh-pointer.md`, `sims/lp2_2013_next_p28_dh_pointer_sft.cjs`, broadcast `communications/broadcast/20261118T2340Z_agent13_next-p28-dh-pointer.md`.

### P0 receiver exact radix gate: base60 wins over source-missing-f base59

Frozen rule: authenticated signed word -> canonical GP0 sum -> original p50 token -> decode -> p0 zero-based rune offset. Exhausted all 42 adjacent signed-word pairs under both source-supported radices.

- Both radices: EMPTY/EPIPHANY is the unique consecutive-output adjacency.
- base59: outputs232/233, both inside p0 word51; across all42 pairs, zero adjacent-word-boundary crossings, zero dual-word-end bracket candidates, zero phrase-vector matches.
- base60: outputs236/237 exactly end(word52)/start(word53), the 2/7 boundary.
- base60 bracket census: SEEKS/THE -> 108/102 encloses [2,4], with unique signed phrase match THE ROAD; THE/DIRECTION is the only other bracket and matches no signed phrase.

Decision: **conditional on p0 as receiver**, exact source geometry selects conventional base60 over missing-f base59 for this signed-2016 pointer grammar. This addresses radix choice within p0, not receiver choice or global radix semantics. The independent DJU/BEI circuit still selects base59 on its route; a first-party rule deciding when each radix applies remains missing. p57 SHED as a base59 cue is only a hypothesis.

Artifacts:
- `im-results/lp2-2016-p0-radix59-vs60-receiver-gate.md`
- `sims/lp2_2016_p0_radix59_vs60_receiver_gate_sft.cjs`
- broadcast `communications/broadcast/20261118T2327Z_agent13_p0-base60-radix-gate.md`

### Three physical p0 crib islands exclude source-period stationary affine GP29

The first checkpoint was retracted immediately because it incorrectly placed 27×27 traversal text at contiguous physical offsets13..29. Invalid workflow run **44418682582** must not be cited.

Valid current test uses only source-internal physically placed candidate phrases:
- p0:0..12 `EPIPHANY SEEKS`;
- p0:103..108 `THE ROAD`;
- p0:235..243 `THE DEVOTED`.

For `C=aP+K[i mod d] mod29`, all a=1..28, source periods 13,27,29,32,43,58,60,76,229 all fail exact compatibility across the three islands. In particular d27 leaves slope14 on title+ROAD and then gets 0/6 forced DEVOTED positions; d43 gets at most1/3.

Artifacts:
- `im-results/lp2-p0-clause-crib-sourceperiod-affine-gate.md`
- `sims/lp2_p0_clause_crib_sourceperiod_affine_sft.cjs`
- broadcast `communications/broadcast/20261118T2322Z_agent13_threecrib-affine-exclusion.md`

## Director Issue #1529: historical control/value numeral grammar NEGATIVE

Claimed unclaimed Director Issue #1529 and completed its bounded source audit. Report: `im-results/cicada2013-2014-numeral-control-value-source-gate.md`.

**Decision:** no authenticated/contemporaneous 2013–2014 Cicada operation was found in which the first digit/quotient of a multi-character numeral acts as a control state while the following digit/remainder supplies the value.

- The authenticated 2013 TCP `BASE29 3301 -> 3QO` converts the **whole integer positionally**; the control is the explicit `BASE29` opcode.
- The 2013 reconstructed `NUMBER` service is not part of the authenticated signed protocol; even contextually it reverses/operates on the whole integer rather than splitting a leading control digit.
- The 2014 magic-square form uses explicit labeled fields: `53301` means visible “Order 5 Square, 3301”, etc. The boundary is protocol syntax, not an overloaded numeral digit.
- The May 2014 p49–51 base60 conversion is participant-produced. It decodes each token positionally as `60*high+low`; Cicada's signed release supplies no parser or digit-role instruction.
- The signed 2014 Onion5 structured payload uses textual labels and colon-separated numeric fields, again explicit syntax rather than a hidden digit-role split.

Thus the p50 first-digit-control / second-digit-value interpretation may remain source-visible, but **must not be supported by an asserted historical Cicada convention**. #1521's exact second-digit additive consumer independently failed its original-language gate, so this audit gives no reason to reopen it.

## Director Issue #1542: p50 low60 semantics favor a discrete state

Claimed and completed Director Issue #1542 using the exact #1508 phase-zero nine-chapter leave-one-out inventory.

Frozen predictor totals against the same one-rate training null:
- binary `B<60`: **+4.5848931753 nats**;
- one-term raw-B logistic: **+1.2338102322**;
- categorical `floor(B/60)`: **+2.5041493473**.

The binary predictor beats raw-B in **9/9** held-out chapters and the five-level categorical model in **7/9**. The raw-B slope remains negative in all nine training folds, so magnitude carries a weaker directional tendency. Full observed repeat rates by first-digit class 0..4 are **1.0909%, 0.4101%, 0.5199%, 0.6726%, 0.5848%**, concentrating the excess in class0.

**Decision:** prefer the exact **discrete 60-cell state** for mechanism work over a smooth value gradient or general five-class high-digit state. Printed leading zero and numerical `B<60` remain exactly the same source predicate, so this experiment cannot distinguish which equivalent wording the author intended.

Artifacts:
- `sims/lp2_p50_low60_semantics_loco_sft.cjs`
- `im-results/lp2-p50-low60-semantics-loco-gate.md`
- `results/README.md` synthesis block
- Issue #1542 closed with completion comment.

## Director Issue #1561: p50 low60 class is not a 0..59 permutation

Claimed and completed Director Issue #1561 on the canonical 60 leading-zero p50 cells.

- Conventional base60: **60 cells, 36 distinct values**. Missing 0..59 values: `1,2,3,7,8,9,11,12,17,23,24,26,27,29,30,37,41,43,44,45,48,50,53,55`. Repeats include `54×4`, `32/33/52/59×3`, and `0×2`.
- Documented drop-f base59: also **36 distinct values**, with extensive duplication; its low-digit domain is 0..58.

**Decision:** reject the complete-domain/rank-map interpretation. The validated 60-cell class remains a binary/discrete source category and does not enumerate a complete low-value alphabet.

Artifacts:
- `sims/lp2_p50_low60_domain_sft.cjs`
- `im-results/lp2-p50-low60-domain-gate.md`
- authoritative `results/README.md` synthesis
- Issue #1561 closed.

## Director Issue #1558: zeroF structural normalization is mostly from its unsupported branch

Claimed and completed #1558 using the committed zeroF rule unchanged.

Exact p0-p55 attribution:
- low60/leading-zero control: **3,036/12,955 = 23.43%** of controlled positions, **144/549 = 26.23%** of edits, edit rate 4.7431%;
- non-low60 byte-mod8 branch: **9,919** positions, **405/549 = 73.77%** of edits, edit rate 4.0831%;
- low/non-low edit-rate ratio only **1.1616×**.

Original adjacent repeats split 33 low60 / 53 non-low60; zeroF edits 32/33 and 49/53 repeat-owner positions respectively. After the frozen inverse, adjacent repeats split 114 low60 / 364 non-low60. The net 86→478 increase is **+81 low60 versus +311 non-low60**, so the non-low60 mod8 branch supplies **79.34%** of the net normalization.

**Decision:** zeroF remains a reproducible structural normalizer, but its causal path from the independently validated low60 clue is weak. Require independent source selection of the eight-symbol exception alphabet and `byte mod 8` selector before further mechanism work.

Artifacts:
- `sims/lp2_zeroF_low60_edit_attribution_sft.cjs`
- `im-results/lp2-zeroF-low60-edit-attribution.md`
- authoritative `results/README.md` synthesis
- Issue #1558 closed.

## Director Issue #1556: p55 43-byte / 43-interior count is ordinary

Claimed and completed #1556 using the exact #865 267-window family and canonical word parser.

Every candidate window trims a 45-byte frame to 43 bytes. Exact source census:
- **23/267 windows across 10 pages** have exactly 43 strict interior runes;
- p55 phase1 is one of those 23;
- its 16 complete body-word lengths are `4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3`, giving 43 strict interior runes.

The #1525 matched null shuffles rune labels inside each page while fixing every word/line/punctuation boundary. This statistic is therefore invariant in every null draw: 23 exact matches/book and familywise any-match rate 1.0.

**Decision:** remove the 43-to-43 equality from the packet evidence stack. Preserve the separately calibrated header/footer conjunction at its existing scope.

Artifacts:
- `sims/lp2_p55_43byte_interior_count_calibration_sft.cjs`
- consolidated `im-results/lp2-terminal-quintet-overflow-channel.md`
- authoritative `results/README.md`
- Issue #1556 closed.

## Director Issue #1579: no historical p55 first-selector / trailing-length frame precedent

Claimed and completed #1579 with a bounded authenticated/source-pinned 2012-2014 protocol audit.

No recovered Cicada-authored byte format combines both p55 candidate roles:
- leading byte repeats an external selector/type/index; and
- terminal byte encodes total or payload length.

2012 uses OutGuess/JPEG clues, signed text, book codes, RSA/OAEP and MIDI. 2013's signed TCP challenge is a textual opcode/status/delimiter protocol. 2014 uses equal-length XOR shares, rune/text transforms, OpenPuff, book-code coordinates, named URL-encoded form fields and signed/static web content. Binary packet/container framing in these chains belongs to standard third-party formats rather than a custom Cicada frame.

**Decision:** retain the calibrated p55 header/footer conjunction only as a source-statistical event. Its selector/length packet semantics remain unexplained and should not be promoted without a first-party transport/receiver.

Artifacts:
- `im-results/cicada2012-2014-firstselector-trailinglength-frame-source-gate.md`
- consolidated `im-results/lp2-terminal-quintet-overflow-channel.md`
- authoritative `results/README.md`
- Issue #1579 closed.

## Independent p50 low60 second-character bit gate

After the Director queue saturated, a finite source-defined operand exploration tested only the six binary digits of the second printed character inside the already validated 60 leading-zero cells, under both documented source-compatible alphabets.

Nine visual-chapter held-out gains over one common low60 repeat rate:
- conventional base60 bit0: **+5.4980226561 nats**, positive 7/9 chapters; groups 29/1809 versus 4/1216 repeats;
- drop-f59 bit0: **+2.1935964834 nats**, positive 7/9; groups 23/1510 versus 10/1515;
- every other tested bit is substantially weaker under both readings.

Finite-family null: permute the observed 60 token labels over fixed selected physical cells, recompute all 12 bit features and retain the maximum. Seed `0x33011313`, 20,000 trials: 364 maxima >= observed, add-one **p=0.0182490875**.

**Decision:** preserve second-character bit0 as an intermediate/predeclared operand diagnostic only. The creator-selected radix is unresolved and no cipher operation is implied. A justified successor needs source support for the parity meaning or one bounded reversible self-transition mechanism.

Artifacts:
- `sims/lp2_p50_low60_secondchar_bits_sft.cjs`
- `im-results/lp2-p50-low60-secondchar-bits.md`
- authoritative `results/README.md`
- broadcast `communications/broadcast/20261118T210500Z_agent13_p50-low60-secondchar-bit0.md`.

## p50 low60 parity refinement and hold-state falsification

The low60 second-character bit result was refined into a compact binary selector and then given an independent mechanism consequence test.

### Compact selector

Under conventional base60, the book-wide state `leading zero AND second-character bit0=0` has **29/1,809 = 1.6031%** repeats versus **57/11,092 = 0.5139%** elsewhere and **+10.374652 held-out nats** over one common rate, positive 7/9 chapters. The drop-f analogue gives **+6.833298 nats**.

Corrected family: six bits × two alphabets × both bit states = 24 selectors. Permuting the observed 60 token labels over the fixed low60 cells for 10,000 trials gives 213 null maxima >= observed, add-one **p=0.0213979**.

Artifact: `sims/lp2_p50_low60_even_conjunction_sft.cjs`; consolidated report `im-results/lp2-p50-low60-secondchar-bits.md`.

### Simple additive key-hold interpretation fails

A key-hold state predicts the selected positions should preserve the entire plaintext adjacent-difference law, not only delta0. Using the frozen six clear-LP1 GP sections, remove delta0 and score the remaining 28-way ciphertext-difference distribution.

- base60 selected-vs-other-low60 advantage **+0.021643 nats/rune**, fixed-size 20,000-subset upper-tail **p=0.124494**;
- drop-f advantage **−0.032297**, **p=0.962602**.

**Decision:** keep the parity/conjunction as a repeat-state diagnostic. Do not assign a simple additive hold/advance opcode. A useful successor needs another reversible operation that specifically changes self-transition probability or an independent first-party parser.

Artifact: `sims/lp2_p50_low60_hold_transition_consequence_sft.cjs`; authoritative `results/README.md` updated.

## Strong earlier Agent13 results to retain

- Original LP2 has **104/2,105 fifth-back same-rune returns within printed words**. Exact original-rune word-cut shuffle preserving visible punctuation had conditional mean **80.1372** over 10,000 draws, with 18/10,000 at or above 104. See `im-results/lp2-fixedcipher-wordbreak-lagfive-source-gate.md`.
- Among **all 812 affine maps on GP29**, within-word six-back `T6(x)=24-2x` was uniquely highest with **80/1,290** matches; page-bigram-preserving null max was 78 over 1,500 books. This is a real ciphertext anomaly, not a decoder/key. See `im-results/lp2-original-lagfive-conditional-page-markov-gate.md`.
- Original p32 blurry-tree -> p55 sharp-tree motivated Gaussian correspondence fails the necessary equality-multiplicity gate. See `im-results/lp2-p32-p55-blurred-tree-correspondence.md`.
- Original Atbash then authentic p56 prime/totient + literal-F skip, all starts 0–4,999 and signs, yields no native-GP plaintext. See `im-results/lp2-atbash-primephi-fskip-original-gate.md`.
- Prior p50 grid LCG/MT all-state and related fixed synthetic families are finite negatives. Do not revive without a new source-selected premise.
- External 2025 “95% complete” nexon33 solution fails its own claimed LP1 Welcome key on the authentic seven-rune solved title. Do not re-investigate that source absent new independent evidence.

## Current global state

All 56 unknown LP2 pages remain unsolved. The most productive next work should select an authentic key, reversible value operation, or concrete state/reset rule from source evidence, then demand held-out original plaintext. Avoid proliferating guessed layers around the lag5/lag6 anomalies or p50 table merely because those objects are statistically interesting.
