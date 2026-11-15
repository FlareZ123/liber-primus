# Complete unknown-key test of word-length-specific affine Hill mixing in LP2

**Agent 36, 15 November 2026. Classification:** original-source all-key obstruction for a bounded, genuinely invertible word-block cipher family. **No unknown LP2 plaintext, creator key, mechanism or destination recovered.** Windows Node.js 22 source run: [43777245473](https://github.com/FlareZ123/liber-primus/actions/runs/43777245473). Executable: [word-length Hill SFT](../sims/lp2_wordlength_hill_allsecret_sft.cjs).

## Why test this inverse?

The signed 2016 Cicada message says that Liber Primus's “words are the map” and its “numbers are the direction”; the source itself prints 2,896 complete rune words and contains a 4×4 mathematical square. A possible high-entropy, word-preserving cipher, not covered by the existing stationary per-glyph substitution bounds, is an independent unknown dense affine Hill matrix for each printed word length. It might hide the strong native-GP letter-frequency structure without damaging word breaks. This is a **testable hypothesis**, not an author-attested instruction: no source selects Hill multiplication or a matrix for each word length.

For each complete printed GP29 word of length L, the candidate family is

    C_w = M_L P_w + b_L (mod 29),

where M_L may be **any** secret invertible L×L matrix over GF(29), and b_L any secret L-vector. Each word of the same length must share that pair. The different lengths have completely independent keys. Physical page breaks and line wraps do not cut words. A model with a new key for each word or page, nonlinear word mixing, altered segmentation or a hidden state is outside the test.

## Key elimination by an exact projective search

Each unknown plaintext coordinate is an affine linear form in the observed ciphertext word. Therefore **regardless of every secret key**, one true plaintext-coordinate histogram must occur among the one-dimensional original-cipher projections

    z_w = a · C_w (mod 29),  a ≠ 0,

up to a fixed alphabet rotation or multiplication by a nonzero field constant. Compute the shift- and scalar-invariant 29-bin histogram contrast

    D(a) = 29 × sum_{r=0}^{28} (count(z=r)/N)^2 − 1.

Enumerate all coefficient directions by fixing the *first nonzero coefficient* to 1. This covers every possible secret inverse row with no optimization shortcut, guessed matrix, word crib, or plaintext scoring. The number of projective directions for length L is (29^L−1)/28.

Original inputs: unchanged [source LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) and [printed word parser](../sims/lp2_word_pages.cjs) of [original transcript](../resources/lp2-transcription.txt), giving exactly **12,956 unresolved runes and 2,896 words**, including words spanning physical pages. The fixed independent native-GP control is the repository's pinned [Shakespeare text](../resources/control/shakespeare_first300k.txt), encoded using the source GP29 orthographic conventions. For each tested word length, use **two disjoint batches**, each containing exactly as many same-length source words as the original. The minimum D across all true source-coordinate positions in both batches is a necessary control threshold for every unknown invertible matrix.

| Printed rune-word length | Original words | All secret projective directions | Original maximum possible inverse-coordinate D | Smallest native-English control-coordinate D |
| ---: | ---: | ---: | ---: | ---: |
| **2** | **448** | **30** | **0.093799825** | **2.127660635** |
| **3** | **720** | **871** | **0.099918981** | **1.869791667** |
| **4** | **513** | **25,260** | **0.130494093** | **1.022194863** |

Every matrix and bias fails the necessary language-register contrast against both same-length native-English control batches. The full 30+871+25,260 unknown-row directions are exhausted, rather than sampling guessed matrices. This is an exact conditional all-key exclusion for the tested controls and original word framing; the controls are **examples of source-native English**, not mathematical ceilings for every possible English work.

A separate frozen first-half selection/second-half holdout looks for an actual recovering direction. The selected rows and their heldout D values are length2 **[1,6] / 0.106227**, length3 **[1,21,10] / 0.125988**, and length4 **[1,1,6,25] / 0.118306**. Their respective heldout iid-uniform reference means are **0.125000, 0.077778, 0.108949**. The small length-three excess is far below source-native language concentration; it is not identified plaintext or a key.

## Positive inverse and research consequence

For each length, independently construct an original-sized synthetic corpus of same-length English-GP words, encrypt with a dense-enough invertible upper-bidiagonal GF29 matrix, recover **every source plaintext coordinate exactly by inverse triangular substitution**, and assert the cipher's complete projective spectrum retains the required source histogram contrast. All three controls pass, with planted maximum contrasts **5.5081812, 3.1069907, 2.9012460**. Thus the attack detects a real, reversible word-block Hill cipher without access to its original plaintext during keyless direction enumeration.

**Decision:** A single affine GP29 mixing matrix and bias per exact printed word length cannot directly explain ordinary native-English plaintext on the original length-2, length-3 or length-4 LP2 words, no matter what those keys are. This is distinct from earlier word-shape positional substitution (which does not grant cross-letter linear mixing) and from earlier fixed-size continuous Hill-block searches (which ignore original complete word boundaries). Retire the stationary length-only model and seek a **source-specified evolving word key, a non-GP intermediate, a different segmentation, or an independently recoverable external key** before further polynomial generalizations. The three source-native controls and full original input remain reproducible in [the SFT](../sims/lp2_wordlength_hill_allsecret_sft.cjs); the script and manual-only [Windows workflow](../.github/workflows/agent36-wordlength-hill-allsecret-manual.yml) introduce no scheduled CI.
