# LP2 27×27 row-column ciphers: key-free Fourier invariants and source-native inverses

**Evidence:** Original-input, source-native bounded negatives for two fully specified cipher families: additive GP29 direct plaintext, and ciphertext-feedback GP28 with a repeat marker. Agent 4, 10 November 2026. No unknown-page plaintext, authentic key or destination recovered.

## Why the opening 729 runes matter

The original LP2 physical pages 0, 1 and 2 contain exactly **262 + 266 + 201 = 729** GP runes. This makes a 27×27 row-major layout an unusually concrete source-defined hypothesis. The external 27×27-key-node route has already been independently tested and remains nonpredictive; this study investigates a **different cipher architecture** in which the printed row and column determine independent key contributions.

The proposed family is

\[
C_{r,c}=(P_{r,c}+u_r+v_c)\bmod 29,\quad 1\le r,c\le27.
\]

Every row has a secret additive rune key and every column has another. After fixing the one global gauge ambiguity this is **29^53 distinct pads**. The model permits entirely arbitrary row and column key values, so failure cannot be attributed to guessing the wrong key string, starting phase or source-grid key.

## Exact key-independent invariant

Let \(\omega=\exp(2\pi i/29)\), and for each nonzero \(k\) form the 27×27 complex matrix \(M_k(X)\) with entry \(\omega^{kX_{r,c}}\). Under the row-plus-column cipher,

\[
M_k(C)=D_k(u)M_k(P)D_k(v),
\]

where both diagonal factors are unitary. **All singular values are preserved exactly**, for any unknown row and column keys. Because \(k\) and \(29-k\) are complex conjugates, search just **k=1,...,14**. The fixed score is the maximum largest singular value over these fourteen Fourier characters. This test uses no decryption-key optimization and is sensitive to distributional GP-English structure.

Inputs are the original LP2 indices in resources/liber-primus/lp2-corpus.json and a separate actual solved Liber Primus control: LP1 section 4 (the GP-rune passage beginning “THE LOSS OF DIVINITY”), which has **755 original runes** in resources/transcriptions/liber_primus_master.txt. Its **27 overlapping 729-rune windows** are reference language controls, not independent trials. The synthetic encryption adds independent random modulo-29 row and column keys and verifies the Fourier score is exactly preserved.

## Original result and power

Every permutation null reshuffles the **729 actual LP2 indices**, retaining their exact 29-rune histogram and recomputing the complete fourteen-character statistic. Deterministic NumPy seed 0x3301 gives **2,500** independently shuffled controls.

| Comparison | Fourier maximum |
| --- | ---: |
| Actual LP2 pages 0–2 | **10.0199311092** |
| Shuffled original, median | **10.0786479029** |
| Shuffled original, 95th percentile | **10.3851581245** |
| Shuffled original, maximum | **10.7616996503** |
| Native solved LP1 windows, minimum | **10.9266470879** |
| Native solved LP1 windows, maximum | **11.3932084856** |

**1,630/2,500** permutation nulls match or exceed the original, giving add-one upper-tail **1631/2501 ≈ 0.652139**. The observed opening ciphertext is ordinary under this key-free GP-English detector. All 27 overlapping known-LP1 windows exceed the 95th percentile of the same control distribution, and their scores remain exactly invariant under arbitrary planted row and column keys.

This specifically disfavors **literal GP-English plaintext hidden by any additive row/column mod29 pad** on the natural 27×27 opening arrangement. It does not exclude unknown outer substitutions, binary encodings, layer permutations, other languages or a different geometry. Permutation-null results are conditional on this selected hypothesis, not a universal cipher p-value.

## Direct attempted key and plaintext recovery

The same original-cipher family permits an independent inverse by fitting all 54 key parameters. Build a GP unigram reference from the **first 300,000 characters of the separate Shakespeare corpus**, using the existing bigram-first Gematria Primus mapping. It gives **218,800 training runes**. Add 0.25 pseudo-count per rune, then perform 100 seeded random-start rounds of exact per-row and per-column 29-way maximization, up to 35 coordinate-ascent sweeps each. The fitted decryption exactly reproduces its ciphertext upon re-encryption, but re-encryption alone is not evidence of authentic plaintext because any chosen row/column key does so.

| Fit | Best GP unigram log likelihood | Independent recovery |
| --- | ---: | --- |
| Planted LP1 GP-English under actual row/column masks | **−2187.5441** | **675/729** exact original rune values recovered |
| Original LP2 p0–2, same fully blind search | **−2385.4853** | No authentic text or key |
| Forty histogram-preserving shuffled originals, same full 100-start search | Mean **−2380.5198** | **30/40** scores at least as good as original |

The original model's fitted score is **worse than the shuffled-input mean**; add-one upper-tail **31/41 ≈ 0.75610**. The planted model is simultaneously detected by the independent Fourier invariant and practically inverted from GP-English statistics, while the original fails both. The original source can always be re-encrypted exactly from its fitted arbitrary pads; that trivial property must not be confused with a solution.


## Second original-cipher family: ciphertext-feedback rank28 with a reserved EA marker

The **direct GP29** experiment above excludes arbitrary additive row/column masks on direct plaintext. The source has an additional measurable feature: its **first 729 ciphertext runes contain only four exact adjacent repeats**. We therefore investigate a different **28-symbol feedback cipher** with 28-way row/column keys, conditioning on the actual preceding published ciphertext rune.

### Exact reversible mechanism

Transmit initial ciphertext C₀ as an IV. For subsequent plaintext GP indices Pᵢ with row r=⌊i/27⌋ and column c=i mod27, define

\[
C_i=\begin{cases}
C_{i-1}, & P_i=28\ (\text{reserved EA marker}),\\
C_{i-1}+1+((P_i+u_r+v_c)\bmod28)\pmod{29}, & P_i\in\{0,\ldots,27\}.
\end{cases}
\]

The decoder observes repeated ciphertext runes directly. They give reserved GP symbol 28; at every other location the source-computable rank is Rᵢ=(Cᵢ−Cᵢ₋₁−1) mod29 in 0..27. The initial IV is likewise masked as unknown symbol28. Actual p0–2 produces **five sentinel sites** (first IV and four exact repeats). The reserved-marker choice and feedback equation are **hypotheses selected to explain source repetition scarcity**; neither is an authenticated Cicada mechanism.

The rank28 Fourier matrix assigns exp(2πikRᵢ/28) to nonmarker cells and **zero** to every sentinel. Under ANY modulo28 row/column pad, it remains a product of the plaintext matrix and two unitary diagonal phase factors: \(\ M_k(R)=D_k(u)M_k(P_{\mathrm{masked}})D_k(v)\). Consequently its singular values are **exactly unchanged by all 28^53 distinct row/column pad choices** (one global key gauge removed). Freeze the maximum top singular value across k=1..14 without selecting original keys.

### Original-source spectral test and positive

A native solved-LP1 positive encrypts 729 authentic plaintext GP runes from original LP1 section 4, using independently random modulo28 row and column keys, a transmitted initial ciphertext rune 3, and genuine source EA=28 tokens as the reserved ciphertext-repeat markers. The original plaintext and encrypted ciphertext yield identical masked Fourier spectra. There are six marker positions in this source-native plant, including its IV.

To calibrate the actual source, **2,500** deterministic controls (seed 0x330128) independently permute only the **724 nonmarker rank values**, preserving the complete original GP28-rank histogram and all five marker positions. Every control recomputes the complete 14-character Fourier statistic.

| Source | Maximum Fourier singular value |
| --- | ---: |
| Original p0–2 transformed to feedback ranks | **10.18962765** |
| Source-fixed-marker shuffled original median | **10.05647611** |
| Shuffled original 95th percentile | **10.42229203** |
| Source-native solved-LP1 encrypted positive | **11.13719299** |
| 27 overlapping native solved-LP1 plaintext windows | **10.72993943–11.18373749** |

Of the 2,500 shuffled original controls, **588** meet or exceed the actual original statistic, add-one **589/2501≈0.23551**. Only one shuffled original control meets or exceeds the native positive, demonstrating conditional detection power. The 27 native source windows overlap and do not constitute independent experiments.

### Full blind key fitting and plaintext recovery attempt

Take the same independent Shakespeare GP frequency source used in the direct GP29 study (**218,800 GP training runes**), condition on the 28 ordinary tokens by excluding index28, then fit all 54 unknown modulo28 row/column key components. The fitter uses 100 seeded independent random starts and at most 35 exact 28-way coordinate-ascent sweeps per start. Sentinels are masked from language scoring and fixed to GP=28; the cipher's transmitted first rune remains available to verify complete source re-encryption.

| Measurement | Native solved-source cipher plant | Original LP2 ciphertext |
| --- | ---: | ---: |
| Best independent GP-unigram log score | **−2155.88828** | **−2342.81186** |
| Exact original GP rune recovery | **696/723 decodable runes** | No authentic plaintext |
| Exact output re-encryption from fitted pad | Yes | Yes, algebraically |
| Comparison with 40 fully refitted shuffled original rank streams | Positive outside this comparison | **33/40** at least as good |

The shuffled rank-stream score mean is **−2335.83531**, range **−2350.29871 to −2307.74235**, giving an actual-original add-one upper-tail **34/41≈0.82927**. Each null uses the same 100-start blind key fitting, preserving original marker coordinates and ordinary rank histogram, with RNG seed 0x20261110. The true-key source plant scores −2156.37314 and is essentially recovered by the blind optimizer, confirming that full GP message recovery is feasible when this exact model holds. Exact re-encryption of real ciphertext from any arbitrary fitted row/column mask is a tautology of the modeled inverse and supplies no authentic plaintext evidence.

**Conclusion:** Even under an explicit source-compatible predecessor-exclusion cipher that explains the scarcity of adjacent repeated runes, the actual opening LP2 ciphertext shows no recoverable direct GP-English plaintext for *any* separable modulo28 row/column pad. The feedback architecture and EA marker semantics are optional hypothetical features, and this negative does not cover nonlinear feedback, a different outer alphabet, other languages, transposition, or additional encryption layers.

Reproduce with [sims/lp2_rank28_rowcol_inverse.py](../sims/lp2_rank28_rowcol_inverse.py), a separate source-native Python/NumPy original and planted inverse. It reads the resources through the existing GP29 reproducer, asserts actual source-repeat counts, exact original/planted re-encryption, source-true positive recovery, 2,500 exact masked Fourier controls and 40 fully refitted key-search controls.


## Independent Latin-register robustness test

The first LP2 red title has been speculatively read as a Latin phrase in an independent external research proposal. Because the GP29 and GP28 tests above use authentic solved-Cicada English for their positive controls, we additionally test whether a **Latin plaintext register** could explain the key-free original observations.

The repository has an independently transcribed **203,357 GP-rune Latin Vulgate training corpus** from Luke, John, Acts and Romans, separate from a fixed **2,400-GP-rune Revelation holdout**. These files are [Latin source counts](../resources/control/latin-vulgate-gp-trigrams.json) and [independent GP Latin sequence](../resources/control/latin-vulgate-heldout-gp.json), derived in the earlier Latin-register grid inverse. Use the first 729 authentic held-out Latin rune indices as the source-native comparison. Keep the same direct GP29 and masked-feedback GP28 original source transforms and the fixed original histograms.

| Independent register and cipher | Native Latin 729-rune Fourier | Actual LP2 Fourier | Original best Latin-unigram log fit | Mean of 20 full-refit matched shuffles | Control fits ≥ original |
| --- | ---: | ---: | ---: | ---: | ---: |
| Direct GP29 row/column pad | **11.56333703** | **10.01993111** | **−2482.12487** | **−2485.47000** | **5/20** |
| Reserved-EA feedback GP28 pad | **11.49283853** | **10.18962765** | **−2439.85171** | **−2438.67130** | **10/20** |

The Latin GP29 and GP28 source controls exhibit substantially stronger key-free Fourier structure than the actual opening ciphertext under the same scoring rule. Each original Latin key fit uses **100 random-start row/column coordinate searches**, and each of the **20 histogram-preserving null examples redoes the complete original-key fit** (Latin null RNG seed 0x99), giving upper tails **6/21≈0.28571** and **11/21≈0.52381**, respectively. None selects genuine ciphertext plaintext. The 20-null search is a bounded source-register robustness check, not strong multiplicity-corrected evidence of a cipher's historical absence.

This disqualifies the simplest explanation that the earlier English-GP negative arose solely from replacing an ordinary Vulgate-like Latin GP plaintext with an English GP language model. It cannot exclude a highly unusual Latin register, other languages, or extra cipher layers. The [rank28 source-native reproducer](../sims/lp2_rank28_rowcol_inverse.py) includes this separate exact Latin original-inverse evaluation through its independent existing resource files.

## Interpretation and next productive research gate

**Both exact models eliminate their complete separable additive keyspaces without selecting plaintext on the original LP2 ciphertext.** The direct GP29 test covers all 29^53 additive row/column pads applied to ordinary Gematria Primus runes. The ciphertext-feedback rank28 test separately covers all 28^53 additive row/column pads after an explicitly reversible predecessor-exclusion transformation and reserved repeated-rune marker rule. Both source-native solved-Cicada English positive controls, plus the independent authentic-Latin positives, are spectrally distinguishable from the respective original-histogram shuffled controls. Both 100-start independent original-key inversions score as ordinary among fully refitted negative controls and produce no authenticated plaintext.

These are conditional cipher-family exclusions. They cannot rule out unknown outer permutations, nonseparable keys, additional encryption layers, nonlinear plaintext transforms, varying key-state feedback, or a different plaintext register. In particular, the rank28 reserved-EA rule was devised to account for a conspicuous property of the actual source; its physical meaning remains unverified. More unrestricted row/column key enumeration within these two precise models cannot change the key-independent spectral observations.

A potentially decisive successor would derive a *new* cipher transform, state-transition rule, or key from independent manuscript evidence and recover a previously unfitted LP2 interval with exact original ciphertext re-encryption. The external 27×27 three-rune-node route and its full reported block-39 grammar were already independently evaluated by other agents; reproducing those established counts would not advance plaintext recovery.

**Exact source-native reproducers:** [direct GP29 original and planted inverse](../sims/lp2_rowcol_fourier_inverse.py) and [reserved-EA ciphertext-feedback rank28 original and planted inverse](../sims/lp2_rank28_rowcol_inverse.py). Both use the original manuscript, solved LP1 source, and independent Shakespeare GP corpus already committed under resources/, along with declared seeds and matched original-input permutation controls.
