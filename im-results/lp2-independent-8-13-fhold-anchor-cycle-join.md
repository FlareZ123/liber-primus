# Independent q8/q13 transparent-F layers: all-key original anchor-cycle rejection

**Decision:** the original first 222 runes (49 complete printed words) of p54–55 admit no two-stage additive GP29 inverse with independent period-8 and period-13 plaintext-F hold clocks, in either order, with at most three words outside the fixed expanded 215,093-form lexicon. This is a conditional finite-register obstruction; it is not a universal language theorem, proof against other layer mechanisms, or recovered unknown plaintext.

## Motivation and exact model

The known LP1 periods 8 and 13, and the known transparent plaintext-F behavior, motivate a genuinely distinct composition from the earlier shared-clock q8+q13 CRT decision (#2613) and the earlier literal-key two-layer tests. No authenticated instruction selects this composition for LP2. Freeze both orders, arbitrary secret keys (k_a,h_b\in\mathbb Z_{29}), and independent consuming clocks. Arbitrary initial rotations are absorbed into the unknown keys. For plaintext (p=0), both layers hold and (c=0). For (p\ne0), the inner layer consumes and emits (m=p+k_a\pmod{29}); if (m=0), the outer layer holds and (c=0), otherwise it consumes and emits (c=m+h_b\pmod{29}). There are exactly three possible zero types: both hold (0), inner consumes only (1), both consume (2). Every nonzero ciphertext rune forces type 2. This includes encrypted non-F plaintext producing ciphertext F.

The physical p54–55 source is exactly 308 GP29 runes, checked against the canonical page arrays and transcription. The first 49 complete words end at offset 222, before the page break at 232; the next word crosses the page break. Freeze the remaining 86 runes as holdout; no original holdout plaintext scoring is performed because every training schedule fails the gate. Training ciphertext zeros are at zero-based offsets 41, 65, 195: precisely 27 masks per order, 54 total. The alphabet is the repository's canonical GP29. The same 40,596-form native GP word register as the dictionary-carry work is expanded by at most one internal adjacent swap of distinct non-F runes in a word of length at least five (indices 1 through length−3). It produces 215,093 forms. The reference contains all nine solved native sources, including control holdout vocabulary.

## Exact graph constraints

For each fixed mask, compute phases before every position. Use 22 potential vertices: the 21 key components (x_a=k_a), (x_{q+b}=-h_b), and a reference vertex (z=0). A type-2 position gives an edge (x_a-x_{q+b}=c-p), type 1 gives (x_a-z=-p), and type 0 has no edge and forces (p=0). Types 1 and 2 force (p\ne0). A type-2 intermediate must also be nonzero, but the original impossibility relaxes that extra condition, making rejection stronger. A set of edge differences is consistent exactly when all oriented cycle sums vanish. Construct a spanning forest; each non-tree edge supplies one fundamental cycle. For two words, split the cycle sums into each word's contribution; exact matching of one contribution vector to the negative of the other is an efficient all-key hash join, independent of any guessed key value. This includes cycles involving a repeated phase pair.

Every one of 27 masks for 8→13 and 27 for 13→8 has a zero-match pair. The most constraining pair has 6–8 independent cycles. The six masks with the strongest first pair having a single accidental match are rejected by the next pair. More generally, a contradiction on any set of words requires at least one of them to be outside the lexicon.

## Robust OOV search

The lazy exact branch-and-bound solver first collects pair contradictions with at least four cycles, then branches on a currently unmet conflict (one word must be removed). It may prune on any family of disjoint conflicts or on the remaining OOV budget. For a candidate removed set, it performs incremental exact cycle joins on all active word relations, choosing the next relation by cycle count minus log-base-29 domain size. An empty join yields a new contradiction core. The 10,000 intermediate-tuple cap originally left 13 masks unresolved; pairwise arc consistency resolves those branches by deleting unsupported word candidates. Every domain reduction tracks its dependency set, and any subsequent learned contradiction includes the union of these dependencies. This is essential: a contradiction found after pruning must not be applied to a branch that removed the word responsible for the pruning. Earlier exploratory core handling lacked this dependency expansion; it was corrected before the final targeted executions.

At OOV budget 3, all 54 masks are certified (27/27 per order), with zero remaining caps or relaxed survivors. The original 41 non-capped cases and all 13 formerly capped cases were executed; the corrected arc fallback was run on all formerly capped cases. A separate streaming exhaustive fallback timed out and is not relied on. The certificate is relative to the stated lexicon and intact word boundaries. It requires at least four OOV words among the 49 training words for either order; it does not rule out an independently justified larger OOV budget, altered segmentation, or different transformations.

## Positive controls and withheld prediction

Two deterministic planted independent key pairs use the authentic native WELCOME and LOSS OF DIVINITY word streams. Their training masks are supplied to the key-recovery solver (26 and 14 ciphertext-zero events, respectively); they are not fully blind clock-recovery tests. Exact cycle joining, potential reconstruction and legal gauge checking recover one solution per plant, including both complete original keys and the 215/215 and 221/221 training runes. Freeze the keys and end phases, then solve the next 84 complete-word runes per plant without their hold schedules. Both yield exactly one legal lexical continuation, 84/84 each. The lexicon is fixed in advance but includes those solved source words; this is a ciphertext holdout and exact model-inversion calibration, not out-of-source language generalization.

| Order | Training | Withheld | Exact key pair | Original masks with ≤3 OOV |
|---|---:|---:|---|---:|
| 8→13 | 215/215 | 84/84 | Unique | 0/27 |
| 13→8 | 221/221 | 84/84 | Unique | 0/27 |

## Reproduction and next decision

[SFT](../sims/lp2_independent_fhold_anchor_cycle_join_sft.cjs). Execute with Node.js from the repository root; the optional JSON selection restricts order, masks and OOV budget. Default runs both controls and all original masks with budget 3. The actual experiments were executed through JavaScript Code Mode using fetched repository input bytes. No independent Windows CI run is claimed. The revised dependency-safe source is commit `fd6a26e52198bf2b3714f26044755b15289e8005`. Retire this finite intact-word layered receiver on the p54 training prefix unless a genuinely independent source cue specifies a different register or a different mechanism. Do not select a key against original p55 holdout. No authenticated unknown LP2 plaintext is obtained.

## Opening-page extension: visible 8+5 periods with arbitrary keys

The p0 original red rubric contains two words of 8 and 5 GP runes before the 13-dot mark. The prior [literal red-key test](lp2-p0-red8-red5-two-layer-fhold-original-gate.md) covered the exact printed key digits but not arbitrary unknown keys with those two periods. Use only the visible lengths as a conjectural clock cue; no source selects the two-layer construction.

### Both holds, outer-only hold, and ordinary/shared clocks

The longest complete-word interval in the 716-rune black p0–2 body with at most three ciphertext F events is selected without a plaintext score: physical opening offsets **512–629**, 118 runes in 23 words. Arbitrary incoming key phases are absorbed into the unknown cyclic keys. The remaining 598 black-body runes are untouched.

The same exact modular graph engine, expanded 215,093-form lexicon, and dependency-safe OOV branch solver give:

| Architecture | 8→5 original schedules excluded | 5→8 original schedules excluded | OOV allowance |
|---|---:|---:|---:|
| Both layers hold their own plaintext F | 27/27 | 27/27 | 2 of 23 |
| Inner ordinary, outer holds intermediate F | 8/8 | 8/8 | 2 of 23 |

In the outer-only case the inner clock always advances; each ciphertext zero independently allows an outer hold or a consuming emission. Plaintext F is allowed in either type, including nonzero ciphertext positions. The graph relaxation drops the intermediate-nonzero condition. Consequently the all-consuming schedule also covers ordinary double addition, and the corresponding subset of the both-hold relaxation covers a shared plaintext-F clock. Both outer-only planted controls recover both full keys from supplied training schedules and then uniquely recover their 84-rune withheld continuations with no supplied withheld mask.

### Inner-only hold: blind word-profile key recovery

Here the outer layer advances at every position, while the inner clock advances only on nonzero plaintext. Ciphertext F no longer identifies the hold sites. Instead, group each possible lexical word by its exact plaintext-F bit mask. For the first anchor absorb the unknown incoming inner phase into the key rotation; for the second grant all inner phases. The outer phase is fixed by the original absolute rune offset. Every F position gives a constraint on the outer key alone: set the inner potential to fixed zero; other positions give the same two-potential difference equation as above. Every pair profile therefore yields an exact finite cycle join; no global clock mask is supplied.

On the first 248 black-body runes (56 complete words), the two longest anchors are body word indices 3 and 11, length 11 each, offsets 10 and 49. Their domains contain 24 F profiles each. Across all 4,608 profile/relative-phase combinations for 8→5 and 2,880 for 5→8, there are **zero compatible anchor tuples**, with 9–12 fundamental cycles and no caps. This is a necessary constraint, not a dictionary-free rejection.

The same algorithm on the authentic LOSS OF DIVINITY donor, first 244 runes and 85 withheld, is **blind to both keys and all F-hold positions**. The two longest training words (13 and 10 runes) generate one and two distinct complete candidate keys respectively. Exact whole-training inverse selects one key/path per order, recovering the full correct plaintext and keys up to inner rotation; freezing these keys and end phases recovers both 85-rune withheld continuations uniquely. The reference lexicon includes the donor words.

### Two-OOV opening robustness and frozen continuation

Freeze the first 512 black-body runes in 118 complete words (the last complete boundary before physical p1 ends), leaving the remaining 204 runes untouched. Take the six longest complete training words and balance them into three disjoint pairs by pairing longest with shortest. Any plaintext with at most two OOV words has at least one pair entirely in the reference lexicon. Thus an exact all-profile key enumeration for each pair followed by a legal training decoder suffices to reject or recover every such key.

| Pair, zero-based black-body word indices | Lengths | 8→5 profile combinations / key count | 5→8 profile combinations / key count |
|---|---|---:|---:|
| 3,93 | 11,9 | 4,224 / 0 | 2,640 / 0 |
| 11,65 | 11,9 | 4,224 / 0 | 2,640 / 0 |
| 53,88 | 9,10 | 3,520 / 1 | 2,200 / 2 |

All profile combinations and gauge freedoms in these six searches were resolved, with no caps. The three complete keys from the last pair fail exact training decoding with two OOV words, granting every incoming inner phase. The 204-rune original continuation was never used to select a key.

**Decision:** retire the stated finite intact-word additive 8+5 two-stage receiver, in all four hold configurations and shared plaintext-F variant, conditional on the specified OOV budgets and source-visible period premise. This is substantially broader than the literal red-word key test, but not an exclusion of other layer lengths, changes in segmentation, other alphabet conventions or unrelated nonlinear mechanisms. No original key or plaintext recovered.

Reproduction, using the [same SFT](../sims/lp2_independent_fhold_anchor_cycle_join_sft.cjs), optional JSON configuration after the repository root argument:
- Both-hold: `node sims/lp2_independent_fhold_anchor_cycle_join_sft.cjs . '{"target":"p0","budget":2}'`.
- Outer-only: same command with `"mode":"outerHold","controls":true`.
- Inner-only basic and donor: `{"target":"p0","mode":"innerHold","inner":8,"budget":2}` (repeat with inner 5).
- Inner-only OOV: `{"target":"p0","mode":"innerHold","inner":8,"budget":2,"trainMax":515,"pairIndex":0,"controls":false}` (repeat pairIndex 0–2 and inner 8/5).

Executed on repository inputs in JavaScript Code Mode. The opening extension is preserved through SFT commit 1b9d275140f99f13b2a424976ef26176f5b90a40; no independent CI is claimed.

### All nonzero affine products: projective cycle-space recovery

The inner-only hold family also admits two arbitrary nonzero affine slopes. If the inner consuming law is (m=aP+K_j) and the ordinary outer law is (C=bm+H_l), normalize to the single effective slope (s=ab\ne0), effective inner key (k=bK), and outer key (h=H). A held plaintext F still emits (C=h); all consuming positions obey (C=sP+k+h). Individual factors (a,b) are algebraically unidentifiable in this model; recover the effective slope and key pair.

For each fixed pair profile and relative phase, let (C_i) and (P_i) be the oriented sums of ciphertext and plaintext on fundamental cycle (i). Potential consistency requires (C_i=sP_i) for every cycle. If (C_r\ne0), project both word signatures onto the quotient by the ciphertext vector using coordinates (C_rP_i-C_iP_r) for all (i\ne r). These coordinates are linear in each word's contribution, so a single exact hash join covers **all 28 nonzero slopes**, rather than enumerating 28 separate key spaces. On a match, require (P_r\ne0) and infer (s=C_r/P_r); if every ciphertext cycle sum is zero, require every plaintext cycle sum zero and grant all 28 slopes. Reconstruct exact graph potentials for every matched tuple, including all unresolved gauge values up to the declared cap; no cap was encountered on these experiments.

The original two 11-rune anchors yield zero compatible tuples under any nonzero slope, both orders, over the same 4,608 and 2,880 profile/phase combinations. Two blind LOSS OF DIVINITY controls planted effective slopes 7 and 13. Each recovers the unique correct effective slope/key/path from 244 training runes, with no supplied hold masks, then predicts all 85 withheld runes uniquely. The fixed lexicon includes the donor words.

For the same three disjoint anchor pairs and 512-rune/118-word training split, the all-slope candidate census is:

| Pair | 8→5 slope/tuple matches | 8→5 complete effective keys | 5→8 slope/tuple matches | 5→8 complete effective keys |
|---|---:|---:|---:|---:|
| 3,93 | 3 | 3 | 1 | 29 |
| 11,65 | 1 | 1 | 0 | 0 |
| 53,88 | 72 | 436 | 38 | 150 |
| Total | 76 | 440 | 39 | 179 |

All **619 complete slope/key candidates, counted per anchor search**, fail exact training decoding with up to two OOV words and every incoming inner phase. No unresolved gauge, profile cap or decoder cap remains. This extends the inner-hold/ordinary-outer opening rejection from addition to **every nonzero stationary affine product**; it does not extend the other hold configurations to all slopes. The original 204-rune holdout remains unscored.

Reproduce using the same SFT, mode `innerHoldAffine`; the donor command uses `{"target":"p0","mode":"innerHoldAffine","inner":8,"budget":2}` (repeat inner5). The OOV command additionally sets `"trainMax":515,"pairIndex":0,"controls":false` (repeat all three indices and both orders). Actual JavaScript original-input executions, SFT commit 2caad2bc07e467839a3da1683669b8c8ebe64248. No independent CI claimed. Retire this finite-register opening receiver absent a new independent clue, rather than extending the slope or anchor search.
