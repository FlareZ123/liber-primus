# Wheatstone unequal-wheel cryptograph: native key recovery and LP2 rejection

Agent 10, 2026-11-24. Director task #2472. No original plaintext recovered.

## Historical mechanism and hypotheses

Wheatstone's cryptograph uses 27 plaintext positions (letters and a blank), 26 ciphertext positions and coupled hands advancing the same positive distance. His instructions encode word blanks and handle consecutive identical plaintext letters with a substitute such as Q. See [Wheatstone's 1879 Scientific Papers, pp. 342–347](https://archive.org/details/scientificpapers00whea), [Bletchley Park cryptographic dictionary](https://codesandciphers.org.uk/documents/cryptdict/page93.htm), and [Kaeding, Cryptanalysis of the Wheatstone Cipher, 2020](https://eprint.iacr.org/2020/1492.pdf). The historical construction predates LP2; the GP adaptation is a hypothesis, not a sourced Cicada instruction.

For 30 outer and 29 inner positions, write L for outer plaintext position and K for inner ciphertext position. Each advance is s = (L(P_i)-L(P_(i-1))) mod 30, restricted to 1..29. Then K(C_i)-K(C_(i-1)) = s mod 29. The inverse maps a zero inner difference to 29 steps, not zero. Thus adjacent equal ciphertext symbols occur exactly when consecutive prepared plaintext symbols move one position backwards around the outer wheel. This is a specific, key-independent equality mechanism. It does not universally forbid repeats.

## A: Preserve printed word boundaries, permit insertion of an extra repeat marker

[sims/lp2_wheatstone30_29_joint_inner_key_sft.cjs](../sims/lp2_wheatstone30_29_joint_inner_key_sft.cjs).

The 30th symbol is a lossless inserted marker before adjacent equal native runes, including a possible leading marker at a word seam. This is a GP adaptation rather than the exact historical blank-encoding convention. The 29-symbol outer GP chart is forward or reversed; allow all 29 cyclic locations of the extra marker. The inner permutation is wholly unknown. Do not assume any particular keyword.

For each lexical candidate, build its relative cumulative wheel advance vector z. Matching the equality partition of an original ciphertext word is necessary; each pair of distinct ciphertext symbols then imposes K(b)-K(a)=z_b-z_a mod 29. Intersect allowed difference masks across words and discard candidates violating any mask. Singleton edges identify K up to rotation; anchor K(0)=0. An empty candidate set is a proof of incompatibility with the fixed lexical constraints, not a heuristic score. Allow all 29 initial states and require a canonical filler grammar.

Lexicon: 29,079 distinct GP words from the repository's TextBlob frequencies and nine known solved-GP reference sections. Original transcription: 2,896 words, 12,956 runes. Donor words are included in the dictionary, so these are in-vocabulary recovery controls, not a claim of unseen lexical generalization.

| Plant | Training raw runes | Held-out raw runes | Inner positions recovered | Initial state | Exact whole message |
|---|---:|---:|---:|---|---|
| 0 | 1636 | 180 | 29/29 | 7 | yes |
| 1 | 2207 | 180 | 29/29 | 16 | yes |
| 2 | 2011 | 180 | 29/29 | 25 | yes |

All three recover the unique true initial state and exactly reencrypt, including the held-out genuine p56/p57 continuation. Original p0–2 and independently p15–22 each contradict **all 58 outer arrangements** under this lexical model, even when words without a dictionary signature are ignored. Per-layout missing lexical signatures across the full original are 34–44; 10 words have no candidate for any of the 58 arrangements (zero-based word indices 605,833,874,1476,1500,1758,1967,2089,2341,2752). The conventional forward chart with marker before F has zero missing lexical signatures on the opening and still fails at local word 20 on the first propagation pass. Four direct chart/reversed-chart wheel combinations x 29 initial states yield zero full canonical filler parses.

Native adjacent repeats across the nine source sections (2,979 native runes; 3,056 prepared symbols) range from 70 to 191 / 3,055 over the 58 outer rings, or 2.29–6.25%. LP2 original 86 / 12,955 = 0.664%. The conventional forward ring gives 109 / 3,055; reversed 172 / 3,055. Inner wheel cannot alter these counts. LP2's actual within-word count is 63 / 10,060 and cross-word count is 23 / 2,895. These are distributional evidence against the hypothesis, not a universal inequality on arbitrary plaintext.

## B: Encrypt blanks and replace repeats, closer to historical operation

[sims/lp2_wheatstone30_29_space_encoded_blind_sft.cjs](../sims/lp2_wheatstone30_29_space_encoded_blind_sft.cjs).

Fixed outer order SPACE, GP0..28. Encode a SPACE after every word, and replace a repeated prepared letter with EO (GP index 12), absent from all nine native reference sections. This is a declared restricted plaintext alphabet: genuine literal EO cannot be encoded unambiguously. Ignore original ciphertext word boundaries in this hypothesis. No unknown per-word state or arbitrary side information. Historical 26:27 known-answer example SECRET_MESQAGE_ -> YBRPUMDOGLMUTWA reproduced with published inner wheel.

The rotation-normalized relative ciphertext tetragram is a substitution key objective, since absolute inner rotation is a gauge. Train normalized tri/tetragrams on Gibran, Emerson, Shakespeare, Kybalion and non-donor native sections. 186,483 external words, 763,900 raw GP runes; approximately 952k prepared training symbols. Use 12 deterministic restarts x 24,000 swaps, coarse-to-fine trigrams/tetragrams, then choose the initial phase by a native prepared trigram score. Donor sections split by section index mod 3, excluded from their corresponding training fold.

| Blind donor | Prepared symbols | Wheel recovery | Raw message exact | Prepared trigram nats/symbol | Adjacent equal ciphertext |
|---|---:|---:|---|---:|---:|
| 0 | 1324 | 29/29 | yes | -7.016 | 33 |
| 1 | 1685 | 29/29 | yes | -7.158 | 53 |
| 2 | 710 | 1/29 chosen | no | -13.042 | 22 |

Calibration succeeds for the two longer controls; short control fails. The same algorithm attacks original p0–7 (1874 runes) and predicts p8–14 (1729 runes) with the recovered training key and continuous phase. Seeded iid ciphertext of the same lengths is an independently generated null.

| Recipient | Train trigram nats/symbol | Holdout | Train recognized words | Holdout recognized words |
|---|---:|---:|---:|---:|
| LP2 | -14.506 | -14.784 | 2/64 | 0/55 |
| iid | -14.496 | -14.768 | 6/61 | 2/70 |

Original and iid fail the canonical word/marker grammar. Both reencrypt exactly as prepared symbol streams, which is merely an inverse check. LP2 output has IC 0.033405 training, 0.033338 holdout and no connected text. Native longer controls recover substantially better than either null or original. This is a bounded statistical failed key recovery, not exhaustive exclusion for all wheel permutations.

## Decision

Neither adaptation explains the unusually low original repeat rate or yields actual original plaintext. Variant A rejects every tested printed-chart arrangement subject to the stated finite lexical vocabulary. Variant B shows a workable historical key recovery algorithm but no original success under one fixed chart and reserved rune. Do not spend more runs varying Wheatstone keys, gaps, marker alphabets, or reset schedules without independent source evidence. No reason to elevate this to an established LP2 decipherment or to reopen the family absent new evidence.

Reproduce from repository root:
```
node sims/lp2_wheatstone30_29_joint_inner_key_sft.cjs
node sims/lp2_wheatstone30_29_space_encoded_blind_sft.cjs
```

Both computations were executed in the tool runtime on current repository data; no separate CI execution claimed.
