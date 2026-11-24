# Blind native-GP family discriminator: no family selected

**Status (24 November 2026):** The bounded blind discriminator fails its preregistered selection gate. The original p16–22 and p40–53 streams score almost identically as native plaintext and as the restricted word-affine family; the solved p56/p57 plaintext controls do too. The p15 Hill31 family scores lower, but held-out family accuracy is insufficient to use that difference as a reliable original-cipher selector. No original key search or decryption is justified by this result.

## Question and admissible family set

Issue #2465 asks whether ciphertext-only observables can distinguish a small set of reversible native-GP architectures on synthetic plants, then select a family for a fixed original-cipher attempt. The following set was frozen before applying the classifier to original LP2:

1. **Global word-integer affine (restricted subfamily of #2461).** Each printed word is interpreted as a base-29 integer P of width L, then C=(aP+b) mod 29^L. The same key pair is used at every word length. The synthetic key budget is deliberately small: a in [1,28], b in [0,28], i.e. 812 keys (9.67 bits). Word separators and stops are preserved. The inverse is the modular affine inverse at each width.
2. **Source p15 Hill-4 over GF(31) (the #2278 family).** The 29 GP runes plus literal hyphen and full stop form the 31-symbol alphabet. The printed p15 grid reduces to:

       [ 3 29 21  0 ]
       [23 13 12 17 ]
       [ 2  8 10 23 ]
       [21 28 26 22 ]  mod 31

   The four tested orientations are M, M-transpose, M-inverse, and transpose(M-inverse), applied to successive four-symbol blocks. The inverse matrices are exact; the orientation budget is 2 bits.
3. **Native plaintext control.** This is required to detect a classifier that merely mistakes natural word boundaries for evidence of the affine family.

The #2273 constrained no-repeat/enumerative family is not admitted as a complete reversible class yet: Agent13's latest source-locked combined-channel result grants 291.1334514 bits from anchored red spans plus fixed-site punctuation, and a further 32.3013908 bits from movable comma forms, for 323.4348422 bits against a 325.450254-bit universal same-length bound. At least 3 additional bits remain unsupplied by an independently selected source channel. This is a conditional capacity exclusion, not a plaintext result. The running-key branch (#2459) is excluded from this finite-state comparison until it has a source-selected key source; otherwise it is an unconstrained high-entropy operand. The coupled transposition branch (#2463) is not included until its exact forward map, partition, and inverse are frozen. Closed rotor and fixed-phase variants are not reintroduced.

## Blind plant design

The reproducer is sims/lp2_blind_family_discriminator_2465.cjs.

- Source register: 34 paragraphs from resources/liber-primus/lp1-plaintext-reference.txt, spanning pages 1, 3–16, 56 and 57. The reference is an editor-normalized Latin transliteration; it is mapped through the repository GP29 transliteration table using the explicit normalization in the script. This is a limitation, not a canonical-rune claim.
- Split: pages below 11 train; pages 11 and above are held out. No source paragraph is shared between train and test.
- For each paragraph, eight synthetic plants are generated under each encrypted family using a deterministic PRNG seed 2465. The affine key is hidden and varies by plant; the Hill plant uses the four source orientations twice. The discriminator sees only ciphertext feature vectors, not keys or plaintext paragraphs.
- Feature vector: 31-symbol unigram and bigram distributions, word-length histogram, separator and stop rates, empty-word rate, adjacent-equality rate, mean and standard deviation of word length, within-word unique-symbol ratio, and unigram/bigram entropies.
- Classifier: nearest-centroid cosine similarity. A two-family affine/Hill run is reported as a diagnostic; the selection decision uses the three-class affine/Hill/plain control.
- Preregistered gate: held-out accuracy at least 90%, and original top-vs-runner-up cosine margin at least 0.20. No feature or threshold was changed after inspecting the original.

## Results

Training plants: 160 affine, 160 Hill, 20 native. Held-out plants: 112 affine, 112 Hill, 14 native.

| Test | Result |
|---|---:|
| Two-family affine/Hill held-out accuracy | 84.82% |
| Two-family median margin | 0.0933 |
| Three-class held-out accuracy | 73.53% |
| Native control correct | 6/14 |
| Affine plants correct | 91/112 |
| Hill plants correct | 78/112 |

Original-cipher classification:

| Original stream | Native plaintext score | Word-affine score | Hill31 score | Top margin |
|---|---:|---:|---:|---:|
| p16–22 | 0.978632 | 0.983623 | 0.856500 | 0.004991 |
| p40–53 | 0.979879 | 0.984747 | 0.856821 | 0.004868 |

Solved LP2 controls:

| Control | Native plaintext score | Word-affine score | Hill31 score | Top margin |
|---|---:|---:|---:|---:|
| p56 | 0.948071 | 0.956070 | 0.775635 | 0.007999 |
| p57 | 0.989288 | 0.990728 | 0.908465 | 0.001440 |

The original ciphertext's nominal affine preference is not meaningful: the known solved plaintext controls receive the same affine-over-plain prediction, with margins of the same tiny order. The held-out accuracy also fails the 90% gate. The Hill31 score is lower, but this weak discriminator cannot promote the remaining score difference to a cipher-family decision.

## Decision and exact ambiguity

**No family clears the gate. No blind key-recovery attempt is authorized on the original.** The current observable ambiguity is:

- a word-boundary-preserving operation such as the restricted global word-affine family; versus
- native-looking GP text under the editor-normalized source register; with
- the p15 Hill31 space-changing family less similar under these features, but not reliably excluded by a classifier whose held-out accuracy is only 73.53%.

The minimum independent source information is a first-party boundary-semantics instruction: **are hyphens/stops literal plaintext delimiters preserved by the operation, or are they members of the encrypted 31-symbol stream?** If the former, a global affine key pair or deterministic derivation is still required. If the latter, the Hill31 branch additionally needs an authenticated block phase and orientation. A source-selected rule is necessary; ciphertext-only feature tuning is not.

The #2273 no-repeat branch separately needs at least three additional bits from a source-authenticated carrier beyond the currently granted channels. The near-capacity result is not evidence that Cicada used that code.

## Limitations

- The LP1 plaintext reference is editorial-normalized, not a direct original-rune plaintext stream. The script records its lossy transliteration normalization.
- The affine plants test only an 812-key subfamily of #2461, not every possible global affine key width.
- The Hill31 plants use the p15 source matrix and four orientations, with paragraph-start block alignment. This is a bounded synthetic family, not proof that Cicada selected that alignment.
- Nearest-centroid cosine similarity is deliberately simple. Its failure is decisive for this registered gate; it is not a theorem that every possible classifier fails.

**Next action:** wait for a source-authenticated boundary/key selector or for the active agents to freeze materially new reversible families. Do not tune features against the original or expand the key space without an independent selector.
