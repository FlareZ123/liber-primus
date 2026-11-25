# Exact all-key q8 single inserted null under intact shuffled GP29 groups

**Agent12, 25 November 2026. Decision: every one of nine original LP2 chapters is excluded independently under the precise conditional model below. No unknown plaintext, authentic key or destination recovered.**

## Why this changes the next decision

The published R4 description in [pnotisdev findings](https://github.com/pnotisdev/cicada3301/blob/main/docs/FINDINGS.md) proposes one inserted symbol in approximately 45% of printed groups, separately from the collision-repair channel. The local intact-group q8 exclusions (#2684/#2710) do not automatically transfer to inserted nulls; the [external crosswalk](pnotisdev-pinned-20261024-crosswalk.md) already records the source-selected R4 composite negatives. This experiment tests the distinct **all-secret q8 plus optional one null** submodel, granting arbitrary null value/location and arbitrary phase in each group. It does not implement the separate T6 repair or M04 hold/spend channel. The eight-rune period is historically motivated by WELCOME/DIVINITY, but neither it nor this insertion receiver is authenticated for LP2.

## Frozen model

For each genuine nonempty lexical group P, apply C_i=P_i+K_phase mod29 with a single unknown periodic length-8 vector per chapter. Literal plaintext F emits F and does not advance the phase; a nonzero plaintext symbol consumes one key digit, including when it emits zero. After this, optionally insert one arbitrary symbol at any of the length+1 positions without consuming key state. Allow any starting phase for every group, arbitrary group order, every possible null value (including repeats), and at most floor(5% of groups) arbitrarily OOV groups. The union lexicon is exactly the prior 35,944 GP forms from pinned native/donor/control text and TextBlob, with every singleton admitted. This deliberately relaxed vocabulary/phase/insertion gate is a necessary condition, not a sufficient grammar or global trail condition. Use canonical image-corrected segmentation, all 12,956 unknown runes, 2,896 complete printed groups, nine image chapters. No solved page is included in the target. Native p56 replay verifies the literal-F convention on 85/85 actual runes.

## Complete key nomination and inverse

A group with at least nine nonzero observed symbols has at least eight nonzero symbols after any one deletion. Its lexical inverse therefore consumes at least eight key digits and fixes the complete cyclic key up to rotation. Enumerate every deletion position and no deletion, every compatible vocabulary spelling, derive the eight digits from consecutive consuming positions, check subsequent periodic consistency and exact literal-F emission. Deduplicate keys within each group; their support counts give an exact upper bound on number of these anchors covered. A chapter with A such anchors and OOV budget B must have a key supported by at least A-B anchors. Every key passing the anchor gate is then checked against all groups with exact all-phase, all-deletion, all-literal-F decoding. The evaluation short-circuits on B+1 missing groups; the raw field bestPartialCoverage is a partial count before that cutoff, not an optimum complete coverage value.

| Physical pages | Groups | Strong anchors | OOV budget | Required anchor support | Maximum actual support | Keys passing full coverage |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 0–2 | 158 | 10 | 7 | 3 | 1 | 0 |
| 3–7 | 255 | 14 | 12 | 2 | 1 | 0 |
| 8–14 | 383 | 26 | 19 | 7 | 2 | 0 |
| 15–22 | 437 | 19 | 21 | — | — | See seven-digit bound below |
| 23–26 | 224 | 13 | 11 | 2 | 2 | 0 (one anchor-passing key checked) |
| 27–32 | 326 | 19 | 16 | 3 | 1 | 0 |
| 33–39 | 378 | 23 | 18 | 5 | 2 | 0 |
| 40–53 | 669 | 35 | 33 | 2 | 1 | 0 |
| 54–55 | 66 | 4 | 3 | 1 | 1 | 0 (all 3,275 nominees checked) |

Three independently hidden q8 keys were planted using separate held-out Gibran, Shakespeare, Emerson word pools, 80 words each, enriched for long anchors (16 long words), random independent group phases, optional random null (~45%) and shuffled groups. All three cyclic keys recovered uniquely among full-coverage candidates. The exact decoder includes all 240 true words and true deletion choices and can replay all 240 observed groups exactly. Only 33/37/43 of the respective 80 words are uniquely lexical (113/240), so recovery of a key is not recovery of a unique plaintext or inserted-null map. Controls are vocabulary-assisted and anchor-enriched, not matched natural consecutive prose, and the phaseAndCut field denotes existence of a phase with true word/cut and exact replay; it is not proof of unique phase recovery.

## Completing p15–22: seven-digit cyclic capacity

The 19 strong anchors alone cannot force one covered anchor with 21 OOV allowed. Enlarge the anchor class to groups with at least **eight nonzero observed symbols**. Any allowed deletion leaves at least seven nonzero ciphertext symbols, hence at least seven consuming key positions. For each anchor independently enumerate the same exact inverse spelling/deletion hypotheses, retaining just the first seven consuming key digits, and rejecting any repeated-slot contradiction among the further digits. Every actual cyclic q8 key has at most eight distinct consecutive length-seven windows. If tuple t supports n(t) distinct anchors, then every full key covers at most the sum of the eight largest n(t) values. This union bound grants each tuple independent phase and eighth digit, so is conservative even when several tuples cover the same group.

Original p15–22 has **44 anchors, 21 OOV allowance, hence requires at least 23 covered anchors**. Exactly 1,277,857 distinct seven-tuples are generated. 1,277,806 support one anchor and 51 support two; none support three. The eight largest support counts sum to **16**, strictly below 23. Therefore no q8 key can satisfy the same 5% OOV budget on the remaining chapter, even without enforcing mutual consistency of the eight tuple windows. Three separate 60-word hidden-key donor plants retain every eligible true tuple and pass the necessary bound (required/upper 52/56, 53/56, 55/58). No original keys or plaintext are produced.

## Necessary substitution-repair capacity

For k=3..7, use groups with at least k+1 observed nonzero symbols. An unaltered in-vocabulary group admits a lexical inverse after zero or one non-consuming null deletion and has at least k consuming positions. Enumerate the first k digits of every compatible spelling, checking repeated-slot consistency, and count distinct group support per tuple. A q8 key contains at most eight cyclic k-windows: the sum of the eight largest support counts upper-bounds the number of clean covered anchors. Subtract that bound from the number of anchors, then subtract the chapter's OOV budget, truncating at zero. Maximize over k or use disjoint strata by maximum eligible k to avoid double counting. Every remaining deficient group requires at least one actual repair. Independently chosen group starting phases absorb earlier hold/spend clock differences; groups containing a repair may be arbitrary.

| Physical pages | Native F hold | Either consuming or holding F |
| --- | ---: | ---: |
| 0–2 | 13 | 13 |
| 3–7 | 30 | 29 |
| 8–14 | 43 | 43 |
| 15–22 | 51 | 48 |
| 23–26 | 19 | 19 |
| 27–32 | 31 | 31 |
| 33–39 | 48 | 46 |
| 40–53 | 98 | 98 |
| 54–55 | 0 | 0 |
| Total | **333** | **327** |

All three clean controls in each convention have zero lower bound; random substitutions affecting 17–18 groups yield lower bounds 0–5, never exceeding actual alterations. These are soundness checks, not sensitivity guarantees. The lower bound holds for arbitrary group shuffle and repair values including T6 as long as a repair-free group follows the stipulated receiver. It does not exclude deterministic or high-rate repairs.

### Independent repair-coin model

For the specific ordered checked-null collision model with independent repair probability q and every failed repair visible as adjacent equality, select printed length class >=k+1. Eligibility is known before repair coin outcomes because group membership and null count do not change with repair. The selected collision coins are Bernoulli(q), even if attempt times are adaptive. Count all adjacent equalities in those groups including their initial seam as an upper bound F on failures. The cumulative tuple deficit R is a lower bound on successes within that length class after per-chapter OOV allowances.

To avoid treating observed R,F thresholds as preselected, use the mixture likelihood-ratio martingale E=mean over j=1..9 of (r_j/q)^R ((1-r_j)/(1-q))^F, where r_j=q+(1-q)j/10. Each component is monotone in successes and failures in the required directions, so the observed E lower-bounds the actual stopped likelihood ratio. Ville's inequality gives an anytime bound 1/E, with a five-class Bonferroni correction. For k=5 there are 815 length>=6 groups, 6,180 runes, at most 37 failures and at least 332 (native) or 325 (either F) successes. At fixed q=.81 the corrected bounds are 0.000289255 and **0.000588274** respectively. At q=.85 they are .3263 and .4754; at q=.9 neither is informative. The binomial fixed-threshold joint-event tails in raw output are descriptive, not calibrated adaptive p-values. This tests specified fixed q, not a rate fitted from the same ciphertext. It does not reject arbitrary R4 variants, shuffled output, hidden failed collisions, consuming nulls, repair-dependent lengths, or mechanisms whose clean groups do not follow q8.

Run `node sims/lp2_q8_single_null_repair_capacity_sft.cjs` and again with `--either-f`, then `node sims/lp2_q8_single_null_repair_rate_sft.cjs` with and without `--either-f`. All four runs executed in connected V8. Raw [native capacity](lp2-q8-single-null-repair-capacity-output.json), [either-F capacity](lp2-q8-single-null-repair-capacity-either-f-output.json), [native rate](lp2-q8-single-null-repair-rate-output.json), [either-F rate](lp2-q8-single-null-repair-rate-either-f-output.json).

## Disposition and reproducibility

Retire the exact one-null insertion-only q8 shared additive receiver under this finite vocabulary and intact group membership, including arbitrary post-encryption group shuffle and independent group phases. The repair-capacity extension additionally rejects the narrowly specified probabilistic repair receiver at q=.81, but does not rule out T6 substitution repairs in general, more nulls, consuming inserted key steps, other periods, H-decoy, or different spelling/register. Do not interpret the 113 unique control words as unique reconstruction of the remaining groups or use this result to infer the historical model. No source-selected mechanism or original language candidate passed.

Run from repository root:
- `node sims/lp2_q8_single_null_postshuffle_sft.cjs` ([raw output](lp2-q8-single-null-postshuffle-output.json)).
- `node sims/lp2_q8_single_null_7tuple_capacity_sft.cjs` (p15–22 exact necessary bound; stdout).

Both actually executed in connected V8 against repository inputs. Standalone Windows/Node CI execution was not performed. The scripts preserve the source loaders and deterministic controls. No expensive duplicate CI dispatch.
