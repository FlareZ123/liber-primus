# Word-shape alphabet: exact key-independent entropy obstruction

**Classification (11 November 2026): conditional-entropy invariant on original GP29 ciphertext, calibrated against three matched-word-length native GP-English sources and an independently GP29-encoded word-preserving Latin Vulgate corpus. This is an exclusion for a specified reversible cipher family, not a recovered key, plaintext, or destination.**

## Why this is a plaintext-relevant architecture test

LP2 visibly preserves printed word lengths and boundaries, which could act as a cue for a human solver to restart or select a substitution alphabet. Instead of guessing a few word-length or page-dependent Vigenere keys, grant the entire **secret alphabet permutation at every word-shape state**. The three nested candidate models are

- **Word**: the output rune at a position in a word of length L is a fixed, secret permutation of the corresponding plaintext rune, keyed by (L, position).
- **Section**: additionally choose an independent secret permutation for each of the nine original text sections.
- **Physical page**: instead, additionally choose an independent secret permutation for every original rune-bearing physical page; a word crossing a printed page boundary uses the corresponding page's alphabet for each glyph.

There are no restrictions whatsoever on the 29-symbol permutation at a state. This covers all fixed Caesar/affine/Vigenere shifts keyed by these states, including keys unknown to the analyst, and any other secret monoalphabetic bijection per state. It **does not** cover changing-key use of word index, previous plaintext or ciphertext, hidden per-word state, non-bijective expansion, deleted/inserted runes, different segmentation, or unusual plaintext language.

**Historical manuscript-internal control for the word-boundary premise.** The solved, genuinely enciphered LP2 p56 *AN END* has **25 printed ciphertext words** and **25 independently known plaintext words**, whose GP29 word-length vectors match *exactly*: `[2,3,5,2,4,3,4,6,1,4,3,6,2,2,2,2,4,2,5,7,2,4,3,3,4]` (85 runes). The original ciphertext source is `resources/lp2-transcription.txt`; its known inverse and plaintext are pinned in [the authentic decryption regression](../sims/authentic_decryption_regression.cjs), also used in [p56's original-phrase gate](../sims/p56_mobius_interrupter_selector_sft.cjs). This is direct evidence that *at least one* encrypted page in this same LP2 artifact retains true plaintext word lengths and word boundaries. It makes that premise worth testing on the other pages while still providing no assurance that every unknown page uses the same segmentation or plaintext language.

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

**Stronger two-layer result: arbitrary secret fixed in-word position transposition.** For any visible context `A` (book-wide, text section, or physical page of **the word's first rune**) and word length `L`, grant an entirely unknown fixed permutation `σ_(A,L)` of positions `0..L−1`. Also grant a completely independent unknown 29-way symbol bijection `π_(A,L,j)` for every output coordinate. Each cipher word may be formed as

\[
C_{w,j}=\pi_{A,L,j}\big(P_{w,\sigma_{A,L}(j)}\big).
\]

Because every word in a fixed `(A,L)` class contributes **one symbol at each of its L positions**, the positional permutation only **reorders entire frequency-histogram groups**. The arbitrary symbol bijections then relabel rune bins. The weighted sum of group entropies remains **exactly equal for plaintext and ciphertext**, regardless of *both* secret permutation families. All nine source sections split at true word boundaries (zero words cross sections). **32 words cross physical pages**, so the mathematically exact page-transposition variant keys its context to the **word-start page**. This differs from the separate original per-glyph-physical-page substitution model, for which no within-word rearrangement was granted. There is also a **stronger one-sided form**. If each `π_(A,L,j)` is allowed to be *any deterministic 29→29 mapping*, including lossy symbol mergers, the fixed position permutation still only permutes source groups, and Shannon entropy can only decrease under a deterministic map. Therefore

\[
H_{\mathrm{emp}}(C\mid S)\le H_{\mathrm{emp}}(P\mid S).
\]

The observed original ciphertext violates even this necessary upper bound for every sampled native GP-English and Latin control. A putative decoder that introduces new variability through word-specific keys, nonstationary state or a variable-length source code is outside the one-sided bound's fixed-state assumptions. A different permutation for each individual word, or a hidden word-index clock, escapes this invariant.

**Universal hidden-binary-alphabet corollary (same word-shape state).** Even if an independent additional secret bit `Z_i∈{0,1}` is permitted at **every rune** and is allowed to depend arbitrarily on the entire source plaintext or previous cipher history, any deterministic alphabet map `C_i=f_(L,j,Z_i)(P_i)` satisfies the exact Shannon-chain bound

\[
H_{\mathrm{emp}}(C\mid L,j)\le H_{\mathrm{emp}}(P\mid L,j)+H_{\mathrm{emp}}(Z\mid L,j)\le H_{\mathrm{emp}}(P\mid L,j)+1.
\]

The highest word-shape entropy among **all 128 matched GP29 English/Latin controls** is **3.577683154** bits/rune, whereas the original is **4.709187883**. Therefore at least **1.131504729 bits/rune** of additional *empirical state variation* would be required to reach the observed original distribution. Any selector taking **two possible rune-map states** is ruled out under these precise native-plaintext and original-word-length assumptions, regardless of how its binary state sequence is chosen, whether its state change is deterministic, or which two secret maps are used. At least **three latent rune-alphabet states** are necessary (`ceil(2^1.131504729)=3`). This cardinality bound does **not** demand a secret key of that many independent random bits per rune: a short deterministic seeded state machine may generate high-entropy empirical variation across symbols. Nor does it apply to hidden states that themselves reorder plaintext positions differently at each occurrence, alter segmentation, or emit multiple output glyphs per source rune.

Original inputs: [canonical GP29 physical-page corpus](../resources/liber-primus/lp2-corpus.json), [line-preserving shared transcript](../resources/lp2-transcription.txt), both parsed by the same printed-word convention as [shared LP2 word parser](../sims/lp2_word_pages.cjs). They give 55 rune-bearing unresolved pages, **12,956 symbols**, **2,896 canonical printed words** and 105 distinct (L, position) states. End-of-line and physical page continuation remain intact; the original rune sequence is asserted byte-for-byte against the corpus.

## Original-cipher measurement and native controls

The English controls are Shakespeare, Gibran and Emerson in the repository's pinned reference files. A fourth, distinct source is the pinned Latin Vulgate New Testament in [word-preserving GP29 form](../resources/control/latin-vulgate-gp-wholewords.txt), comprising **39,835** independently encoded Latin words. Each control word is normalized into the **original 29 GP runes** with the documented QU→CW, V→U, K→C, Z→S, ING→NG conventions. For each corpus, **32 seeded samples** independently replace all 2,896 original cipher words with reference GP29 words of the **exact corresponding rune length**, with replacement. Every original length from one through fourteen runes exists in all four reference corpora. The Latin corpus is already encoded as digits `0123456789ABCDEFGHIJKLMNOPQRS` for rune indices 0–28, one original Latin word per line. It is loaded without reinterpreting its word breaks, and its seeded draws use an independent fixed seed. Thus every sample has exactly the original printed word-boundary pattern and the same page/section assignment at every rune position; it is a deliberately permissive language *shape* control rather than a continuous quotation.

| Secret alphabet state | Number of states | Original LP2 H(C\|S), bits/rune | Highest of 128 native controls H(P\|S) |
| --- | ---: | ---: | ---: |
| Word length + letter position | 105 | **4.709187883** | **3.577683154** |
| Above + text section | 679 | **4.016715515** | **3.144884448** |
| Above + physical page of the individual glyph (symbol substitution only) | 3,023 | **2.349996913** | **2.004022674** |
| Above + **word-start** physical page (fixed secret within-word transposition allowed) | **3,030** | **2.348294420** | **2.002896144** |

Across the fourth Latin Vulgate control, 32 exact-word-length samples have respective conditional entropy ranges **3.238350–3.278733**, **2.864150–2.901721**, and **1.858101–1.891327** bits/rune for the first three rows; the fourth word-start-page model ranges **1.856120–1.890541**. The maxima across all **128** reference samples remain those of the original three English corpora, displayed in the table. This additionally disfavors the word-shape secret-alphabet family under the tested Latin GP29 plaintext model.

These maxima are observed finite controls, **not** proven universal ceilings for English. A homogeneous GP29 stream would have entropy log₂29 ≈ 4.858 bits/rune; original ciphertext remains close to that limit even after conditioning on word shapes. The gap persists with the much more generous physical-page-specific models, including 3,030 wholly unknown rune-permutation tables plus additional secret positional shuffles. The finding challenges word-boundary-driven simple substitution as a complete original LP2 cipher, conditional on source-like native GP29 English or Latin output and preserved printed lengths.

Two complete native-GP encryption/decryption controls are included. First, **3,023 arbitrary 29-way secret symbol permutations** keyed by original physical page, word length and coordinate recover **12,956/12,956** symbols; empirical entropy is preserved, **1.9469333633295804** versus **1.9469333633295802** bits/rune. Second, the stronger cipher randomly chooses **526 independent secret within-word position permutations** (each distinct word-start-page/length group), then **3,030 independently random 29-way secret symbol permutations** for all word-start-page/length/output-position states. The exact inverse again recovers **12,956/12,956** planted native-GP symbols. Conditional entropy is **1.9480062760584052** before and **1.9480062760584050** after encryption, despite these 3,556 secret tables.

**Reproduction:** [single-file Node 22 test](../sims/lp2_wordshape_secret_alphabet_entropy_sft.cjs), [successful manual GitHub Actions run 43109222310](https://github.com/FlareZ123/liber-primus/actions/runs/43109222310). The SFT prints all exact input SHA-256 digests, group counts, 32-sample distributions for each of four reference corpora, encrypted positive-control state count and exact recovery check. The expanded within-word-transposition plus Latin-source CI run is [43114911022](https://github.com/FlareZ123/liber-primus/actions/runs/43114911022), confirming both 12,956/12,956 positive-control inverses. Manual workflow: [lp2-wordshape-secret-alphabet-gate.yml](../.github/workflows/lp2-wordshape-secret-alphabet-gate.yml).

## Decision and limits

Retire as a practical English- or Latin-LP2 route every **fixed, length-preserving secret in-word position permutation plus output-position-specific deterministic GP29 rune map, when both depend only on word length and optionally text section or word-start physical page**. This necessary-entropy exclusion also covers **non-injective** rune maps. Exact entropy equality is asserted only for the bijective subset. The no-transposition case also excludes arbitrary per-glyph-physical-page alphabet substitutions. Even thousands of secret alphabet keys and hundreds of unknown positional transpositions cannot rescue the original's grouped entropy under the four tested native-language source registers.

No plaintext or source-selected key is supplied by this result. The much broader class of dynamically changing keys, cross-rune state, hidden word-index clocks, compressed representations and source-selected external keys remains live. Do not reinterpret this exclusion as evidence for a particular new cipher without an independent source clue and a complete original-cipher inverse.
