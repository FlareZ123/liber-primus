# Word-shape alphabet: exact key-independent entropy obstruction

**Classification (11 November 2026): conditional-entropy invariant on original GP29 ciphertext, calibrated against three matched-word-length native GP-English sources. This is an exclusion for a specified reversible cipher family, not a recovered key, plaintext, or destination.**

## Why this is a plaintext-relevant architecture test

LP2 visibly preserves printed word lengths and boundaries, which could act as a cue for a human solver to restart or select a substitution alphabet. Instead of guessing a few word-length or page-dependent Vigenere keys, grant the entire **secret alphabet permutation at every word-shape state**. The three nested candidate models are

- **Word**: the output rune at a position in a word of length L is a fixed, secret permutation of the corresponding plaintext rune, keyed by (L, position).
- **Section**: additionally choose an independent secret permutation for each of the nine original text sections.
- **Physical page**: instead, additionally choose an independent secret permutation for every original rune-bearing physical page; a word crossing a printed page boundary uses the corresponding page's alphabet for each glyph.

There are no restrictions whatsoever on the 29-symbol permutation at a state. This covers all fixed Caesar/affine/Vigenere shifts keyed by these states, including keys unknown to the analyst, and any other secret monoalphabetic bijection per state. It **does not** cover changing-key use of word index, previous plaintext or ciphertext, hidden per-word state, non-bijective expansion, deleted/inserted runes, different segmentation, or unusual plaintext language.

## Key-independent proof

Let S(i) be the selected **source-visible** word-shape/section/page state at position i, P(i) its plaintext GP29 index and C(i) its observed ciphertext index. The candidate says

\[
C_i=\pi_{S(i)}(P_i),\qquad \pi_s:\{0,\ldots,28\}\to\{0,\ldots,28\}\text{ bijective.}
\]

In each state group, applying a bijection permutes the 29 empirical rune frequencies but never changes the frequency multiset. Consequently, for every imaginable set of unknown alphabet keys,

\[
H_{\mathrm{emp}}(C\mid S)=H_{\mathrm{emp}}(P\mid S)
\]

**exactly**. This is an invariant over *all* possible secret keys in the stated family; no model fitting, cipher-text-dependent parameter search or key recovery is required.

Original inputs: [canonical GP29 physical-page corpus](../resources/liber-primus/lp2-corpus.json), [line-preserving shared transcript](../resources/lp2-transcription.txt), both parsed by the same printed-word convention as [shared LP2 word parser](../sims/lp2_word_pages.cjs). They give 55 rune-bearing unresolved pages, **12,956 symbols**, **2,896 canonical printed words** and 105 distinct (L, position) states. End-of-line and physical page continuation remain intact; the original rune sequence is asserted byte-for-byte against the corpus.

## Original-cipher measurement and native controls

The native controls are Shakespeare, Gibran and Emerson in the repository's pinned reference files. Each control word is normalized into the **original 29 GP runes** with the documented QU→CW, V→U, K→C, Z→S, ING→NG conventions. For each corpus, **32 seeded samples** independently replace all 2,896 original cipher words with native GP-English words of the **exact corresponding rune length**, with replacement. Every original length from one through fourteen runes exists in all three reference corpora. Thus every sample has exactly the original printed word-boundary pattern and the same page/section assignment at every rune position; it is a deliberately permissive language *shape* control rather than a continuous quotation.

| Secret alphabet state | Number of states | Original LP2 H(C\|S), bits/rune | Highest of 96 native controls H(P\|S) |
| --- | ---: | ---: | ---: |
| Word length + letter position | 105 | **4.709187883** | **3.577683154** |
| Above + text section | 679 | **4.016715515** | **3.144884448** |
| Above + physical page instead | 3,023 | **2.349996913** | **2.004022674** |

These maxima are observed finite controls, **not** proven universal ceilings for English. A homogeneous GP29 stream would have entropy log₂29 ≈ 4.858 bits/rune; original ciphertext remains close to that limit even after conditioning on word shapes. The gap persists with the much more generous physical-page-specific 3,023-key-table model. The finding challenges word-boundary-driven simple substitution as a complete original LP2 cipher, conditional on native GP-English-like output and preserved printed lengths.

As an implementation positive control, the reproducer samples **12,956 native-GP symbols**, encrypts them using **3,023 independent, randomly generated secret 29-way permutations** chosen by (page, word length, position), and uses the exact inverse permutation for each state. All 12,956 symbols recover exactly. The measured planted-page conditional entropy remains invariant before and after encryption, 1.9469333633295804 and 1.9469333633295802 bits/rune, within floating-point error.

**Reproduction:** [single-file Node 22 test](../sims/lp2_wordshape_secret_alphabet_entropy_sft.cjs), [successful manual GitHub Actions run 43109222310](https://github.com/FlareZ123/liber-primus/actions/runs/43109222310). The SFT prints all exact input SHA-256 digests, group counts, 32-sample distributions by reference corpus, encrypted positive-control state count and exact recovery check. Manual workflow: [lp2-wordshape-secret-alphabet-gate.yml](../.github/workflows/lp2-wordshape-secret-alphabet-gate.yml).

## Decision and limits

Retire as a practical English-LP2 route every **fixed, length-preserving, separately keyed GP29 alphabet substitution whose complete state is solely a printed word's rune length and in-word position, optionally augmented by original physical page or one of the nine source text sections**. Thousands of otherwise arbitrary secret permutations cannot rescue the original source's group-frequency/entropy fingerprints in the native English controls.

No plaintext or source-selected key is supplied by this result. The much broader class of dynamically changing keys, cross-rune state, hidden word-index clocks, compressed representations and source-selected external keys remains live. Do not reinterpret this exclusion as evidence for a particular new cipher without an independent source clue and a complete original-cipher inverse.
