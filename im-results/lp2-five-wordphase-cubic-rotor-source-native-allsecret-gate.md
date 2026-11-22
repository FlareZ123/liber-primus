# Five-state cubic word-phase rotor: blind English key recovery and all-nine-chapter original exclusion

**Agent27 · 22 November 2026 · Director [#2231](https://github.com/FlareZ123/liber-primus/issues/2231).** Classification: all-nine-chapter original-input cryptanalytic exclusion plus **genuine blind key recovery on disjoint independently authored English plants**. No unknown LP2 plaintext, authenticated historic key, or final destination is recovered.

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

## Full-book transfer: nine independent chapters cannot rescue the same five-rotor law

The local floral result is robust to the substantially stronger rival that **every red-heading-delimited chapter begins with its own completely independent five-state key**. Reconstruct the **2,896 authentic complete words and all 12,956 original rune positions** across physical p0–55, including all 32 genuine physical-page-carried words and the rune-free p50. Preserve each rune's original word-local j mod5. Treat the nine previously established visual chapter intervals as independent possible key resets: pp0–2,3–7,8–14,15–22,23–26,27–32,33–39,40–53,54–55.

There is a particularly cheap **secret-independent necessary gate**: each chapter's phase0 uses just one of its five key states, and it sees only actual ciphertext symbols at the same source word position. Exhaust **all 29 possible phase0 starting secrets** separately for each of the nine chapters. A secret static output alphabet bijection cannot change the resulting collision counts. Accordingly the following source-original maxima cover *all* 29^(5×9) independently chapter-rekeyed seed assignments without guessing any key. Their absence of source-native GP29 concentration in **phase0 alone** precludes the proposed whole-chapter language decoder.

| Original visual chapter | Phase0 runes | Original maximum phase0 IoC across all29 secrets | Minimum real-GP phase0 IoC in 240 controls |
|---|---:|---:|---:|
| pp0–2 | 216 | **0.03854436** | 0.04737295 |
| pp3–7 | 337 | **0.03569662** | 0.04784866 |
| pp8–14 | 502 | **0.03607128** | 0.04905726 |
| pp15–22 | 563 | **0.03522689** | 0.04883599 |
| pp23–26 | 293 | **0.03592968** | 0.04782832 |
| pp27–32 | 417 | **0.03518723** | 0.04859574 |
| pp33–39 | 485 | **0.03540939** | 0.04773792 |
| pp40–53 | 866 | **0.03533354** | 0.04950540 |
| pp54–55 | 89 | **0.04034729** | 0.04136874 |

Each native reference again samples **80 complete matched-word-length source books from each of Gibran, Shakespeare and Emerson**, mapping every one of the 2,896 original print-word lengths onto native GP spellings and respecting the same nine chapter regions. The control column reports the smallest phase0 IoC from any of the resulting **240 source-native corpus samples**, not a fitted cipher candidate. The final 89-rune terminal phase is a small sample with a narrow empirical margin, and no cross-chapter p-value should be inferred from these reused controls. Nevertheless all **nine** independently isolated original source chapters fail even this favorable all-secret bound; the more populated eight have broad separation.

A new full-book positive encrypts **12,956 GP-native Shakespeare symbols with all original word lengths** under distinct five-state seed vectors at every one of the nine chapter boundaries, then decrypts **12,956/12,956** with the same source rule. The [read-only full-book CJS SFT](../sims/lp2_nine_chapter_cubic_fiverotor_phase0_allsecret_sft.cjs) asserts every original rune/page/word transition, all nine finite phase0 maxima, the 240 source-native controls, and the complete constructive inverse. This is a genuine original-input cross-chapter transfer test, distinct from restarting an unsuccessful search with postselected new ciphertext weights.

## An exact optimal-adaptive-state intervention bound: 537 extra reseeds

The remaining loophole for this **specific** cube-rotor law is an extra changing secret seed supplied throughout the floral chapter. A stronger countermodel grants the decoder **an arbitrary new GP29 rotor state at any position on any of the five independent phase clocks**, even where the original prints no key-change instruction. Both each reset value and each reset location may be optimized with hindsight against the original ciphertext. The ordinary no-reset state evolution applies between interventions. We do **not** require all five rotors to reset simultaneously, which makes this bound substantially more permissive than a plausible artistically selected page or word boundary reset.

For each of the five separate ciphertext phase streams, an exact dynamic program optimizes the **maximum** source-native conditional unigram log likelihood with exactly \`r\` additional resets. It tracks all 29 possible current GP29 state values for every reset count, using \`state'=(state+C)^3 mod29\` on continuing steps and all 29 replacement values at an optional extra reset. Complexity is \`O(29 × n²)\` per phase, so every reset pattern and every secret reset value is covered exactly, without guessing the reset positions. The first GP29 state in each phase is freely unknown and is **not counted** as an extra reset.

The target is deliberately generous: the **lowest** GP-native position/length-conditioned log likelihood of *any* of the earlier **240 completely source-length-matched native-English controls**, computed separately per phase using the same Gibran+Emerson-trained model. Each phase has a precise first \`r\` at which its original optimistically reseeded decoder can match this unusually low control score.

| Word phase | Source symbols | Best zero-extra-reset original log score | Worst (lowest) authentic native log score over all 240 samples | **Minimum extra independent state interventions** |
|---|---:|---:|---:|---:|
| 0 | 866 | −4,235.301 | −2,448.906 | **132** |
| 1 | 792 | −4,076.522 | −1,949.937 | **190** |
| 2 | 641 | −2,953.166 | −1,760.885 | **105** |
| 3 | 428 | −1,998.777 | −1,191.750 | **68** |
| 4 | 281 | −1,321.828 | −783.327 | **42** |
| **All five** | **3,008** | | | **537** |

Each of these counts is a **necessary condition for this exact empirical five-phase English score threshold**, conditional on the already-defined cube law. An intervention changes exactly one current phase's GP29 state. A literal original-table consumer that spends **one of p50's 256 printed cells for each independent new phase-state input**, never reusing, deriving, or expanding entries, therefore cannot supply the **537 necessary state changes** even if allowed the best *unknown* reset positions. Were all such values fresh and independently coded as 29 choices, they would represent approximately **2,609 bits** of nominal state entries, beyond the conventional 256-byte table's **2,048 raw bits**. **This is a conditional key-budget comparison, not an unconditional information-theoretic key entropy bound:** a short seeded PRNG, multi-state decoding of a cell, plaintext drawn from an atypical register, or a different update equation escapes it.

The constructive positive encrypts **3,008 authentic source-native Shakespeare GP29 runes** with zero extra reseeds and exactly decrypts all 3,008. The original and every original source boundary are asserted by the dedicated [complete read-only DP SFT](../sims/lp2_five_cubic_rotor_minimum_adaptive_reseeds_sft.cjs). The result gives a useful concrete design decision: *this state equation only becomes native-looking after many ad hoc changes to the purported small secret*. The visible red8, red51 and p50's 256 table cells do not independently specify the 537 replacement operands or event locations.

## Decision and useful next constraint

**Retire this precise five-word-phase ciphertext-forced cubic rotor as a source-native GP29 English encoder for every original visual chapter, including freely independent chapter starting keys.** It is source-motivated, reversible and easily capable of recovering and projecting unknown keys on authentic English, but **every starting secret is excluded by the exact original-cipher symbol spectra**. The exact adaptive-state experiment now quantifies this loss of parsimony: the fixed cubic law needs at least **537** freely placed one-state interventions to reach the most lenient native-GP score baseline in all five floral phase streams. This does not exclude other source-selected evolutions or deterministic state generators.

A successful distinct successor to #2231 would require a **creator-selected state transition or typed external input** that predicts genuine cross-page GP prose without per-word key fitting. The exact contrast between perfect unknown-key recovery on blind source-native controls and no original key signal is a useful decision: something fundamental in the state architecture or the transmitted message's native alphabet remains different.

**Reproducibility:** [read-only single runnable Node22 test](../sims/lp2_five_rotor_cubic_wordphase_allsecret_sft.cjs). It asserts original rune/word/page joins and the all-secret five-phase bounds, learns the full hidden native key blind across two authors, predicts 1,685 unseen symbols from a third, executes all 240 matched-native controls, runs the calibrated 100-original-repeat-position null, and checks both exact forward and inverse transformations. The source experiment was separately evaluated directly in the research runtime before committing; no remote CI result is yet claimed.
