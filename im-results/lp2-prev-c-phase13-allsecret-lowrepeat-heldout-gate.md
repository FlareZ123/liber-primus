# A lossless low-repeat GP29 cipher and the original 13-phase all-secret decoder gate

**17 November 2026 · Agent10. Classification: new fully reversible constructive positive with the original anti-doublet rate, followed by an independently held-out original LP2 plaintext attack which fails.** **No authentic unknown plaintext, original key, selected operator, or continuation endpoint was recovered.**

## What the original artifact suggests, and what it does not

The original LP2 source contains 55 rune-bearing unknown pages, exactly **12,956** GP29 runes, **12,901** within-page successor positions and **86** same-rune successors (**0.6666%**). Distinctive **13-dot marks** recur on the original artwork. These facts make a source-shaped question worth answering: can a **fully reversible** plaintext-to-GP29 transducer with a **13-phase / preceding-ciphertext** key state generate an English-like source while nearly eliminating ciphertext doublets, and can we actually recover such a key from the available original ciphertext?

**Weakest premise:** neither 13-dot punctuation nor the 86-doublet anomaly is an original instruction to use the specific state machine or a source-derived key. This is a constructive rival to previously proposed lossy collision-overwrite systems, followed by an original-input attempted inverse. The ratio used to construct the positive was **chosen after seeing** the manuscript's low doublet rate; its similarity is a demonstration of possibility, **not a probability of Cicada design**.

## Complete bijective transmitter

Use a clock `t=i mod13` that restarts at every original physical page. Let the page-initial ciphertext rune be an arbitrary IV and let `s=(t,C[i−1])` be one of **13×29=377** states. For each state, an unconstrained unknown **permutation of all 29 GP rune symbols** `π_s` transmits one plaintext rune:

```text
Forward:  C[i] = π_(i mod13, C[i−1])(P[i])
Inverse:  P[i] = π⁻¹_(i mod13, C[i−1])(C[i])
```

This is an exact **one-rune-in/one-rune-out bijection for every fixed state**, so it neither overwrites plaintext nor needs an auxiliary sidecar. All 29 possible plaintext symbols, including F and the authentic GP digraphs, remain representable. Ciphertext repeats are permitted, unlike a universal no-repeat coder.

A deterministic low-repeat construction chooses the ciphertext **repeat-output position** in each state to stand for an infrequent **plaintext rune**. Specifically choose `π_s(NG)=C[i−1]` for 3/4 of independently seeded secret states and `π_s(J)=C[i−1]` for the remaining 1/4; fill the other 28 outputs uniformly by a state-specific Fisher–Yates secret permutation. For the canonical original-source English test (63,114 Gibran GP29 runes), the empirical marginal probabilities are `Pr(NG)=523/63114≈0.008287` and `Pr(J)=141/63114≈0.002234`. Their three-to-one mixture gives **0.00677346** expected repeat probability per step under a hypothetical independent stationary plaintext/source-state distribution, or **87.38 expected doublets in 12,901 positions**, close to the original **86**.

Importantly, the structural identity is *exact*, regardless of an independence assumption:

```text
C[i] = C[i−1]  if and only if  P[i] = rare(i mod13, C[i−1]).
```

The actual source-native positive, with a fixed `0x33011313` xorshift32 seed, generates **78** ciphertext doublets in **12,901** successors while recovering all **12,901/12,901** planted genuine GP-English runes under its independently generated known inversion table. Original ciphertext has **86**. The construction thereby gives a concrete counterexample to any claim that anti-repeat by itself forces a lossy mapping or a 326-bit external sidecar: that counting lower bound applies to **universal encoders whose outputs are restricted for every possible input**, whereas this bijection can transmit highly repetitive atypical plaintext as highly repetitive ciphertext and suppresses repeats **probabilistically only for selected English distributions**.

The source-native plant **does not reproduce** the other two structural features in this deterministic original-length trial:

| Original secondary statistic | Authentic original LP2 | Independent bijective low-doublet GP-English positive |
|---|---:|---:|
| Within-word, five-apart equal glyphs | **104 / 2,105** | **79 / 2,105** |
| Correlation of consecutive inter-doublet gaps | **+0.3800196892** | **−0.0720162765** |

The previous study's original +0.380 gap correlation is affected by physical printed-line occupancy and is **not** established as a cipher-only feature. These are diagnostics on one fixed plant, rather than formal distribution-level exclusions of the 13-phase family. The plant is **not** a complete explanation of Liber Primus encryption.

## Actual blind key-recovery attack on all 55 original pages

A key hypothesis is useful only if it helps derive plaintext. This experiment therefore grants **every one of the 377 state substitution tables an arbitrary 29-symbol bijection**, a much stronger model than an additive shift (29 possibilities) or rank28 no-repeat map. For each hidden table, fit its *exact maximum-likelihood inverse under independent authentic-English GP unigram frequencies* using solely the training pages:

- Count original ciphertext successor symbols separately in each observed preceding-ciphertext/13-phase state.
- Sort that state's 29 output symbols by training frequency.
- Sort the independently established 29 plaintext rune frequencies from the untouched 63,114-symbol English control.
- Pair frequency ranks. The rearrangement inequality proves this maximizes the **whole 29! substitution-family unigram likelihood** exactly, requiring no permutation brute force.
- Freeze the resulting 377 complete inverse tables and score **disjoint original held-out pages**, without refitting, fitting a plaintext word, tuning the phase, changing a word boundary, or altering the source.
- Apply the *identical* blind attack to the reversible **low-doublet English plant** described above. All original page lengths, first-runic IV slots and per-page 13-phase resets are reproduced.

| Source-fixed held-out split | Training / holdout successor runes | Original LP2 held-out improvement, nats/rune | Source-native reversible low-repeat plant |
|---|---:|---:|---:|
| Even original page indices train, odd indices held out | **6,314 / 6,587** | **+0.01105430** | **+0.63111328** |
| First 28 rune-bearing pages train, later 27 held out | **6,733 / 6,168** | **+0.00179456** | **+0.64562540** |

The third held-out split, odd source pages train and even pages held out, is likewise **+0.00991956 nats/rune** for the original versus **+0.62756338** for its independent genuine GP-English plant. The original 13-phase unknown-table inference learns **no transferable original English codebook**. Its gains are only hundredths or thousandths of a nat per rune on genuinely unseen pages, whereas the exact same inference detects a powerful **+0.63–0.65 nats/rune** gain in a real English encryptor with **78 original-scale doublets**. The readable English plant is held out from parameter estimation, and the true secret codebook is never made available to the blind inference. This is evidence against this specific *shared fixed 13-phase table* as the unknown original's direct native-English decoder. The random fitted codebook trivially improves in-sample likelihood on original ciphertext, which is why untouched-page scores are essential.

Unlike the earlier [13-phase rank28 all-secret capacity test](lp2-rank28-period13-allsecret-original-gate.md), this uses **all 29 GP symbols** in a provably bijective full 29-symbol cipher, does not reserve repeated outputs, does not assume a particular GP29 alphabet permutation across rows, and attempts actual original key learning. Unlike [the earlier predecessor-only entropy gate](lp2-cipher-feedback-conditional-entropy-gate.md), period 13 escapes that report's definitive **period≤10** invariant and needs a held-out inference experiment. The [sister 377-additive-shift model](lp2-prev-c-state13-original-heldout-decryption.md) is a different, much narrower finite source test.

## Cryptanalytic decision

**Do not treat 86 low doublets as a requirement for a lossy collision-repair side channel.** A naturally reversible English-biased GP29 state mapping demonstrably produces almost that rate without losing a rune. Conversely, with no original-source key or operator, this particular arbitrary-state phase13 inverse gains essentially nothing on untouched LP2 pages despite detecting its independent planted positive. Neither demonstration supplies an authored direction or destination, and the separate five-back/gap anomalies remain a real obstacle to a complete mechanism.

Reproduce from canonical repository root: [source-exact dependency-free Windows/Node22 CommonJS test](../sims/lp2_prev_c_state13_allsecret_english_holdout_sft.cjs). All original rune indices from [canonical GP29 LP2 corpus](../resources/liber-primus/lp2-corpus.json), all printed-word boundaries from [original transcription](../resources/lp2-transcription.txt) through [existing word parser](../sims/lp2_word_pages.cjs), genuine independent GP-English control from [Gibran](../resources/control/gibran_prophet_58585.txt). The test asserts a bijection for **all 377 secret states**, all 12,901 independent genuine-English forward/reverse steps, original 86 vs planted 78 doublets, matched-source 55-page exact original lengths, three disjoint-page holdout key-learning runs, and the original within-word five-back count **104/2,105**, the seeded positive's **79/2,105**, and original/plant adjacent-gap correlations **+0.3800196892 / −0.0720162765**. The exact committed test also passed under an independent deterministic V8 virtual-Node harness loading the five live source files directly from GitHub; Windows/Node22 CI was dispatched separately.
