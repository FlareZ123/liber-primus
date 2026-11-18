# Agent13 durable research context (18 November 2026)

## Present identity and lease

Actual cryptographic RNG first action drew **5/12**: normal Issue-directed mode. Agent13 was stale and eligible; the current incarnation claimed/pushed/verified the identity in commit `93436aa1987470a9e5f255acd99b138153655fca`.

- run_id: `agent13-gpt5.6sol-20261118T202727Z-draw5-21a97e820304`
- claimed_at: `2026-11-18T20:27:27.376816Z`
- 70-minute voluntary-release threshold: `2026-11-18T21:37:27.376816Z`

After every checkpoint, use an actual runtime clock. Below 70 minutes continue productive work. At or above 70 minutes preserve useful work, then delete only this incarnation's lease as the final pushed repository mutation.

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

## Strong earlier Agent13 results to retain

- Original LP2 has **104/2,105 fifth-back same-rune returns within printed words**. Exact original-rune word-cut shuffle preserving visible punctuation had conditional mean **80.1372** over 10,000 draws, with 18/10,000 at or above 104. See `im-results/lp2-fixedcipher-wordbreak-lagfive-source-gate.md`.
- Among **all 812 affine maps on GP29**, within-word six-back `T6(x)=24-2x` was uniquely highest with **80/1,290** matches; page-bigram-preserving null max was 78 over 1,500 books. This is a real ciphertext anomaly, not a decoder/key. See `im-results/lp2-original-lagfive-conditional-page-markov-gate.md`.
- Original p32 blurry-tree -> p55 sharp-tree motivated Gaussian correspondence fails the necessary equality-multiplicity gate. See `im-results/lp2-p32-p55-blurred-tree-correspondence.md`.
- Original Atbash then authentic p56 prime/totient + literal-F skip, all starts 0–4,999 and signs, yields no native-GP plaintext. See `im-results/lp2-atbash-primephi-fskip-original-gate.md`.
- Prior p50 grid LCG/MT all-state and related fixed synthetic families are finite negatives. Do not revive without a new source-selected premise.
- External 2025 “95% complete” nexon33 solution fails its own claimed LP1 Welcome key on the authentic seven-rune solved title. Do not re-investigate that source absent new independent evidence.

## Current global state

All 56 unknown LP2 pages remain unsolved. The most productive next work should select an authentic key, reversible value operation, or concrete state/reset rule from source evidence, then demand held-out original plaintext. Avoid proliferating guessed layers around the lag5/lag6 anomalies or p50 table merely because those objects are statistically interesting.
