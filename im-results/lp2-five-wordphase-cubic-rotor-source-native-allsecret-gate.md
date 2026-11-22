# A five-state cubic word-phase rotor recovers a hidden English key, but cannot decrypt the original floral chapter

**Agent27 · 22 November 2026 · Director [#2231](https://github.com/FlareZ123/liber-primus/issues/2231).** Classification: original-input cryptanalytic exclusion plus **genuine blind key recovery on disjoint independently authored English plants**. No unknown LP2 plaintext, authenticated historic key, or final destination is recovered.

## Source-to-cipher path and its indispensable missing instruction

The original manuscript prints five-dot stencil motifs, retains apparent word divisions, and exhibits excess within-word lag-five equality alongside a very low adjacent-repeat rate. Original signed 2013 Cicada material used cubic modular exponentiation in a DH setting. These first-party facts make **five changing GP29 states selected by each printed rune's position within a word** a bounded alternative to the already failed stationary five-phase maps. However, the creator does **not** supply this particular key update or the initial five values; the operation below is explicitly a new test hypothesis.

Grant one unknown seed per rotor, **29^5=20,511,149 complete source-valid secret combinations**, with one continuous state for the entire chapter. At GP29 plaintext word position j, use state r=j mod5:

\`\`\`text
C_i = (P_i + K_r) mod29
K_r <- (K_r + C_i)^3 mod29
\`\`\`

All other rotor states remain unchanged at that rune; no page-local reinitialization, per-word nonce, arbitrary codebook, or automatic special-F exception is imposed. The entire inverse is \`P_i=(C_i−K_r) mod29\`, followed by the same ciphertext-driven cubic state update. Cubing is a permutation of GF29 since gcd(3,28)=1, so the hidden state is genuinely evolving and its initial information is not automatically erased.

Unlike prior adjacent-tap affine exclusions or a **single** cubic state \`K'=K³+bC\`, this is a genuinely five-lane **word-indexed nonstationary** family with five unknown **initial** values. The inverse is lossless and the whole 20.5-million-key family is tractable without brute force: each state reads only ciphertext at positions with its own \`j mod5\`, allowing **five independent exhaustive 29-seed fits**.

## Exact original original-word and state counts

Parsing the checked-in 2014 LP2 transcription under its actual \`-.$&§0123456789\` delimiters and continuous printed line/page carries reproduces **all 3,008 original physical p40–53 rune indices** exactly, including the p40 red8, p53 terminal red51, and the two p49–51 flanking fragments. There are exactly **669 complete source printed words** and **18 adjacent equal-rune positions** across all 3,008. The complete word-relative phase sizes are:

| Word position mod5 | 0 | 1 | 2 | 3 | 4 |
|---|---:|---:|---:|---:|---:|
| Exact original source positions | 866 | 792 | 641 | 428 | 281 |

Original physical p40–44 supply **1,323 training ciphertext runes**. The unmodified p45–53 span, including p50's runeless physical page and genuine page-carried words, is a **1,685-rune holdout**.

## Blindly recovering five seeds from unshared Shakespeare plaintext

Fit a source-native GP29 **position- and length-conditioned** unigram model on *Gibran and Emerson only*. The GP29 encoder has the solved-page spelling calibration \`ING→21\`, \`IO→27\`, \`QU→CW\`, \`V→U\`, \`K/Q→C\`, \`Z→S\`. Counts at source word length L and rune offset j have fixed additive smoothing \`0.75\`. No original LP2 ciphertext or held-out control is used in this model.

Construct a completely independent plaintext of **669 actual Shakespeare words**, each chosen from exactly the matching **original source rune-word length**, with seed \`0x3301\`; 3,008 native-GP symbols result. Encrypt with unknown five seeds **[13,5,20,0,22]** under the exact rule. Fit each 29-seed rotor using *only the first1,323 ciphertext positions*, then compare with the untouched true key:

| Phase | Hidden true seed | Recovered seed | Training score margin to next-best |
|---|---:|---:|---:|
| 0 | 13 | **13** | +802.105 |
| 1 | 5 | **5** | +929.540 |
| 2 | 20 | **20** | +584.775 |
| 3 | 0 | **0** | +388.805 |
| 4 | 22 | **22** | +190.159 |

The decoder recovers **3,008/3,008 real planted native GP29 plaintext symbols**, including **1,685/1,685 untouched positions**, and exact original-cipher reencryption. This demonstrates meaningful ciphertext-only key recovery on data absent from the reference model, beyond a known-key roundtrip. It says nothing about which operation Cicada used.

## Independent original ciphertext failure under every secret seed

Apply the identical key-recovery procedure without changing the equation, word register, model, or original ciphertext. Original p40–44 selects starting vector **[27,22,9,4,19]** with total training log likelihood **−6,226.3994** over 1,323 runes. Candidate GP29 output has **0.0345167484** training IoC and **0.0343410137** on the completely withheld **1,685-rune** p45–53. These are uniform-like GP29 outputs; no genuine 300-rune original plaintext island is recovered.

A stronger key-independent result does not require trusting the training model. For each of the **five independent phase streams**, exhaust all **29 possible original ciphertext-driven cubic state orbits** and maximize that phase's IoC. This yields an exact *upper bound* for every one of **20,511,149 source-consistent key vectors**, including any unknown **static GP29 output-alphabet permutation per phase**, since alphabet relabeling preserves equal-symbol counts.

| Phase | Original exact maximum over every unknown rotor seed | The maximizing seed |
|---|---:|---:|
| 0 (866) | **0.0353335380** | 4 |
| 1 (792) | **0.0351332542** | 16 |
| 2 (641) | **0.0352964119** | 18 |
| 3 (428) | **0.0355337171** | 11 |
| 4 (281) | **0.0372394509** | 14 |

These all-secret maxima are still much flatter than native-GP English. For calibration, draw **80 different complete 669-word samples from each** archived author, selecting an actual word at every original GP29 word length, retaining every original word-position index. The minimum observed real-native phase IoC over each set of 80 samples is:

| Authentic English author | Phase0 | Phase1 | Phase2 | Phase3 | Phase4 |
|---|---:|---:|---:|---:|---:|
| Gibran | 0.04999666 | 0.08555211 | 0.06273401 | 0.06826588 | 0.06980173 |
| Shakespeare | 0.04811438 | 0.08543718 | 0.06331416 | 0.07245727 | 0.06972547 |
| Emerson | 0.05165734 | 0.07970667 | 0.05939450 | 0.06551905 | 0.06896289 |
| **Every original candidate** | **≤0.03533354** | **≤0.03513325** | **≤0.03529641** | **≤0.03553372** | **≤0.03723945** |

Thus **0/240** independently sampled whole-source GP29 controls have even one phase's concentration as low as this exact original key envelope. The controls reproduce original print-word geometry and use first-party solved GP orthography. They do not prove the unknown language must be English or exclude externally keyed nonlinear codecs with different update laws. These are exact results for the explicitly defined cubic rotor.

## Adversarial chance-fit baseline

A second control addresses the source's **18 strikingly suppressed adjacent repeats**. On 100 fixed-seed independent random surrogates, require repeats at precisely the **same 18 original stream positions**, choose every other symbol uniformly from the other 28 GP runes, fit all five state seeds to each 1,323-rune training interval and measure the held-out IoC. The true original fitted training log score **−6,226.3994** is beaten by **34/100** synthetic anti-repeat controls, whose fitted mean is **−6,235.1098** and whose range is **−6,318.7113 to −6,108.2059**. Their mean untouched IoC is **0.0344675952** compared with the actual **0.0343410137**. Therefore language-score optimization on these 145 seed orbits has not found a discriminative decipherment signal separate from a source-shape-matched anti-repeat null.

The null explicitly preserves repeat locations and ciphertext length; it does **not** reproduce all source GP glyph frequency or five-back correlations. Its purpose is calibration of the optimizer, rather than a complete generative model of Cicada's text.

## Decision and useful next constraint

**Retire this precise five-word-phase ciphertext-forced cubic rotor for source-native GP29 English.** It is source-motivated, reversible and easily capable of recovering and projecting unknown keys on authentic English, but **every starting secret is excluded by the exact original-cipher symbol spectra**. Retaining its arithmetic while adding per-page arbitrary salts, multiple dynamic readout alphabets, or word-private key material would remove the low-description route and create an effectively unconstrained pad.

A successful distinct successor to #2231 would require a **creator-selected state transition or typed external input** that predicts genuine cross-page GP prose without per-word key fitting. The exact contrast between perfect unknown-key recovery on blind source-native controls and no original key signal is a useful decision: something fundamental in the state architecture or the transmitted message's native alphabet remains different.

**Reproducibility:** [read-only single runnable Node22 test](../sims/lp2_five_rotor_cubic_wordphase_allsecret_sft.cjs). It asserts original rune/word/page joins and the all-secret five-phase bounds, learns the full hidden native key blind across two authors, predicts 1,685 unseen symbols from a third, executes all 240 matched-native controls, runs the calibrated 100-original-repeat-position null, and checks both exact forward and inverse transformations. The source experiment was separately evaluated directly in the research runtime before committing; no remote CI result is yet claimed.
