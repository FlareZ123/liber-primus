# Eight-rune plaintext-fed autokey with transparent F: original-input decision

**Decision, 24 November 2026 (Agent7, Director #2549).** No unknown LP2 plaintext or authentic primer was recovered. Exact native-GP lexical inversions recover three independently planted short primers and all 1,285 held-out runes, but reject the fixed p0–2 target. The recurrence itself has legal original inverse paths without a lexical constraint; it is not mathematically impossible.

## Fixed candidate and completeness

Use the ordered GP29 alphabet (F=0), an arbitrary eight-rune starting queue (the length of the historical DIUINITY key, not a source instruction selecting autokey), and a continuous consuming-rune clock. Plaintext F emits 0 and leaves the queue unchanged. Otherwise emit C=(P+queue[0]) mod29, pop the oldest value and append P. For a ciphertext zero, both a literal F hold and a nonzero consuming plaintext are possible; a consuming plaintext may never be zero. No word, punctuation or page resets.

The fixed native vocabulary contains 38,920 distinct GP29 spellings from the repository TextBlob spelling-frequency file, every legal GP tokenization with the stated spelling normalizations, and the nine solved native GP records. The controls' individual word types are therefore available to the solver, but their order, plaintext and primers are not supplied to the recovery routines. This is a finite intact-printed-group model, not an open-vocabulary linguistic proof.

Direct exact trie traversal learns initial key entries only while an unknown queue slot is popped. After eight non-F plaintext runes, the remaining traversal is determined except at visible ciphertext zero. An exact long-word anchor avoids the combinatorial explosion from several short initial words: select the first complete printed group in the training prefix with at least eight nonzero ciphertext runes, preceded by at least eight nonzero ciphertext runes. Enumerate every same-length dictionary form. Its first eight consuming symbols determine the incoming queue completely; all subsequent consuming symbols must agree with feedback. The incoming queue cannot contain zero because eight earlier nonzero outputs necessarily consumed eight nonzero plaintext values. Decode the prefix backwards (the last queue value is the consumed P; recover old first value C-P) and the rest of the training prefix forwards, branching on all legal F holds. The backward nonzero-queue constraint is applied only when at least eight earlier nonzero outputs establish it. Every surviving training path replays exactly. Freeze all training paths, then decode the untouched continuation without learning another primer. No score-based key selection.

## Executed controls and original target

| Native plant | Train / withheld runes | Exact result |
| --- | ---: | --- |
| WELCOME | 101 / 414 | Direct traversal: unique planted primer and exact full continuation. 254,965 training visits. |
| First KOAN | 104 / 676 | Direct traversal capped at 8,000,001 visits after six runes; no eligible long anchor in this frozen training prefix. Unresolved; not a failed cipher or exact exclusion. |
| Second KOAN (jpg107-167) | 103 / 216 | Long anchor 9 runes at offset24; 110 anchor candidates, unique exact training primer and withheld continuation, 650 visits total. |
| LOSS OF DIVINITY | 100 / 655 | Long anchor 13 runes at offset18; one candidate, unique exact primer and continuation, 941 visits total. |

Total successful blind planted key recoveries: 3/4; 1,285/1,285 withheld runes on the three successful plants. Exact forward re-emission checked for each. This is synthetic encryption of actual solved GP spellings under the proposed law, not a claim that the historical solved ciphertext used autokey.

The original p0–2 chapter is 729 runes / 158 intact groups. Frozen training prefix = 201 runes, untouched continuation = 528. Direct enumeration of all first-group candidates leaves 5,421 possible paths after eight runes and **zero after the second group at offset13** (34,082 visits, uncapped). The independent bidirectional solver chooses the first eligible long anchor at offset23, length11, one compatible anchor state; that state has no legal next printed-group continuation. No primer survives the training prefix, so no original holdout plaintext is claimed.

Rubric robustness: remove the exactly 13 red heading runes, and grant the black body an independent completely arbitrary starting queue, preserving the same training/holdout split in physical coordinates. The first eligible anchor is offset10 in the body, length11. Again one compatible anchor, zero surviving training paths, uncapped. This excludes the stated native vocabulary + intact printed boundaries + continuous q8 additive plaintext-autokey/F-hold law on this source target, even if the heading is encoded separately.

## Spacing-free exact reachability: constructive original inverse, not a decryption

For a fixed choice of ciphertext-zero holds, the eight queue lanes evolve independently. Each lane has a domain of 29 possible values. A consuming step C updates its first lane by the bijection k -> C-k while removing k=C (the prohibited consuming F). A hold leaves every lane unchanged. Between visible zeros, precompute each lane's affine end map and all forbidden starting values. Search the complete hold/consume tree with exact Cartesian product domains and memoize dead states. A witness gives a specific hold mask and a compatible primer, which are checked by forward replay. A capped search is unresolved. This method does not use printed boundaries or vocabulary.

- Original p0–2: 729 runes, 34 ciphertext zeros. Legal mask found after 38 visits, 31 literal holds; two primers compatible with that mask. This is a witness, not a count over all masks.
- Original p54–55: 308 runes, six ciphertext zeros. Legal mask found after seven visits, all six literal holds; 20,995,200 primers compatible with that mask.
- Original p40–53: 3,008 runes, 125 ciphertext zeros. Forward searches with 1.5M/2M caps remain unresolved. Reverse search of the suffix after the first eight nonzero outputs (2,999 runes) starts with an arbitrary nonzero terminal queue, because all slots must have been overwritten by then. Its reverse queue operation recovers the old key from the last consumed plaintext, and the output of that reverse operation is not itself forward plaintext. In 1,866,650 visits it finds a legal reversed suffix. Reconstruct the actual forward plaintext from the reverse queue head, extend backwards over the nine-rune prefix with its one zero held, and verify all **3,008/3,008** ciphertext runes exactly. Recovered arbitrary witness primer [21,9,6,9,24,24,2,16], 72 literal holds; output IoC **0.0346573863**, near the uniform 1/29 rate. No linguistic evidence supports the witness; it is a nonlinguistic inverse permitted by the model.

Thus an exact round trip cannot authenticate this cipher, and the lexical exclusion must not be generalized to all possible plaintexts or spacing-free receivers. The symbolic block-domain algorithm provides a reusable construction for exact state feasibility and an eventual independently constrained language search, not evidence that an original key has been found.

## Exact spacing-free trigram inverse: all primers and all terminal masks

An independent extension removes the intact-word assumption entirely. For each fixed F-hold mask, each consuming position is assigned to a queue lane modulo eight; the lane plaintext is an affine alternating trajectory of its unknown initial key value. Exclude initial values that ever emit consuming plaintext zero. A physical trigram spans at most three consecutive consuming lanes, even across literal F holds. Aggregate its log-probability into cyclic unary, binary and ternary factors. Conditioning on the first two lane values, dynamic programming over the last two values maximizes the complete cyclic factor graph, including both wraparound factors. This optimizes all 29^8 possible primers (subject to legality) for each mask without heuristic pruning. Recompute the winning score from the decoded runes and check forward replay.

Training uses 217,106 Shakespeare runes, 62,492 Gibran runes, and five non-target native sections of lengths 184,157,89,85,95 (including solved LP2 p56/p57). All four targeted native sections are excluded from training. The score is a backed-off trigram log-likelihood, not a universal definition of prose. Synthetic controls use deterministic xorshift primers and a ciphertext-visible mask-count eligibility cap (at most eight prefix zeros and twelve suffix zeros, at least one consuming zero in the prefix); if the initial window is ineligible, take the first eligible 308-rune window in steps of sixteen. Eligibility is assessed before key recovery, not by plaintext recovery quality.

| Native control | Prefix/holdout | Exact prefix | Exact holdout | Fitted primer | Prefix / holdout score (nats/rune) |
| --- | --- | --- | --- | --- | --- |
| First KOAN | 205/103 | 205 | 103 | Exact | -2.228 / -2.137 |
| Second KOAN | 205/103 | 205 | 103 | Exact | -2.273 / -2.056 |
| LOSS (offset 16) | 205/103 | 196 | 103 | Different | -2.414 / -2.462 |
| WELCOME | — | — | — | No eligible window | — |

The three eligible controls recover 606/615 prefix runes and 309/309 withheld runes, with exact ciphertext replay. Two of three recover their entire initial primer. LOSS illustrates genuine ambiguity: the fitted mask/primer differs, but the queue converges and the heldout plaintext is exact. WELCOME could not satisfy the declared eligibility cap and is not counted as a success or failure of inference.

Original p54–55, fixed 205/103 split: all eight prefix masks admit legal primers. The exact prefix optimum is -5.121855339508181 nats/rune, primer [14,17,19,14,4,6,19,25], literal hold offsets 41 and 195 (zero-based). It replays the prefix exactly. Freezing the fitted end state and enumerating all eight suffix masks gives **zero legal continuations**. No original holdout score or plaintext exists for that fitted state.

A separate retrospective full-308-rune optimum enumerates all 64 masks; all are mathematically feasible. Its globally optimal score is **-5.292708029970063 nats/rune** with primer [3,24,20,14,22,6,27,4], holds 247 and 273, exact 308/308 replay, and nonlinguistic output. This is a model-conditional all-primer MAP result, not merely a failure to guess a key; it is not an all-primer feasibility exclusion or a proof against arbitrary plaintext distributions. Neither original result authenticates a primer. Retire this fixed eight-lane additive plaintext-feedback/F-hold spacing-free prose route on p54–55, in addition to the intact-word route on p0–2.

[Exact cyclic trigram SFT](../sims/lp2_plaintext_autokey_q8_fhold_spacingfree_trigram_sft.cjs), executed in connected JS; no independent CI run claimed.

## Fixed reversible outer wrapper

The previously frozen [zero-F moving-exception layer](lp2-zeroF-periodic-fhold-layer.md) has a distinct inner-periodic-key negative. Apply the exact same whole-book inverse at global phase zero, without selecting an offset, marker, or interpretation from the autokey results. The canonical 256-cell token rule selects marker zero when the token starts with zero, otherwise [0,2,12,21,22,25,27,28] indexed by the byte's low three bits. At each noninitial position undo the transposition of the previous emitted ciphertext rune and that marker. Exact whole-book forward replay and the published 549/12,956 edits are checked, including 11/308 on p54–55.

Reuse the spacing-free exact q8 additive plaintext-feedback inner solver and fixed 205/103 split. Four prefix masks are legal; the exact best prefix score is **-5.160476654944627** nats/rune. The fitted primer [4,24,8,26,3,25,13,4] with literal holds 20 and 41 has **zero legal continuations** across both suffix masks. All eight full-unit masks are legal; the exact retrospective maximum is **-5.4790152751939205** nats/rune, primer [21,24,14,15,3,10,10,25], literal holds 20,41,257. The complete inner tape replays exactly, and the outer inverse was checked on the full original tape. Output is nonprose, worse than the raw model's maximum. This fixed composite does not provide a receiver or authenticate the outer transform. The inner solver's existing independent control recovery and the separately checked outer bijection are reused, not presented as new independent native controls.

Run the same [SFT](../sims/lp2_plaintext_autokey_q8_fhold_spacingfree_trigram_sft.cjs) with `--wrapped`. Retire this frozen composite; do not tune its wrapper or primer to rescue it.

## Scope and next decision

Retire the fixed q8 intact-group native lexical route on p0–2 and the fixed q8 spacing-free native-prose route on p54–55. Do not tune primer length, feedback sign or reset policy to rescue them. A different linguistic attack needs an independently selected crib or state constraint that distinguishes a candidate from the demonstrated legal nonprose witnesses. Earlier no-F autokey invariants and q13 F-hold anchor tests address distinct models.

Reproducers: [exact primer/anchor SFT](../sims/lp2_plaintext_autokey_q8_fhold_primer_exact_sft.cjs) and [spacing-free block-domain SFT](../sims/lp2_plaintext_autokey_q8_fhold_spacingfree_reach_sft.cjs). Inputs: canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, intact transcription 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, native solved reference 1b064ef6d85819b7d96adaff31a82d1ec551598f, spelling lexicon 140e1d22b5f8c45deddd2e8b25549d9d6307d938. Actual connected JS execution; no independent CI execution claimed.
