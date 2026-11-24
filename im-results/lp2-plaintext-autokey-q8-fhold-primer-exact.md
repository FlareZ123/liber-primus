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

## Scope and next decision

Retire only the fixed q8 intact-group native lexical route on p0–2. Do not tune primer length, feedback sign or reset policy to rescue it. A broader spacing-free linguistic attack needs an independently selected crib or state constraint that distinguishes a candidate from the demonstrated legal nonprose witnesses. Earlier no-F autokey invariants and q13 F-hold anchor tests address distinct models.

Reproducers: [exact primer/anchor SFT](../sims/lp2_plaintext_autokey_q8_fhold_primer_exact_sft.cjs) and [spacing-free block-domain SFT](../sims/lp2_plaintext_autokey_q8_fhold_spacingfree_reach_sft.cjs). Inputs: canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, intact transcription 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, native solved reference 1b064ef6d85819b7d96adaff31a82d1ec551598f, spelling lexicon 140e1d22b5f8c45deddd2e8b25549d9d6307d938. Actual connected JS execution; no independent CI execution claimed.
