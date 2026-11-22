# Two-back GP29 rotor: original-cipher counterexample and exhaustive affine-key decision

**Decision, 15 November 2026.** The September 2026 external [28-step chain-cipher report](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md) correctly observes 86 original unsolved LP2 adjacent doublets and a near-flat nonzero ciphertext-difference histogram. Its strong further inference that only a long aperiodic 28-symbol key can create these first-order statistics is **not identified by those observations**. A concrete lossless, **keyless, two-back GP29 ciphertext-feedback transducer** reproduces the headline statistics on **2,979 actual solved Cicada GP29 plaintext runes**. This is a structural counterexample to uniqueness, **not an LP2 decryption**. The initial keyless direct original-cipher replay is nonlinguistic. A subsequent complete 784-key affine extension was tested against original p0–39 and an untouched 3,008-rune p40–53 holdout. Every affine-key output is likewise nonlinguistic, despite exact blind recovery on three genuine solved-text plants (full details below).

## One exact reversible alternative

Let all rune indices be in GP29 (0..28), with rare plaintext EA at index28. Let u=C[i−1] and v=C[i−2], initialized to F=0 at each independent original plaintext section. Set:

- **Encoder**: s=0 if P=28; otherwise s=1+((P+v) mod28). Emit C=(u+s) mod29, update v←u, u←C.
- **Decoder**: s=(C−u) mod29; output P=28 when s=0, otherwise P=(s−1−v) mod28. Update the same state.

At any state, P=28 maps to step0 and the other 28 possible P indices map bijectively to every step1..28. Thus every one of the 29 original cipher glyphs is supported **without dropped zeros, implicit exception flags, or an aperiodic key**. The previous-two-cipher-symbol feedback scrambles the English step histogram while leaving its zero rate equal to the actual plaintext EA rate. The model is non-additive and data-dependent; its apparent step stream is an **emission derived from plaintext and state**, not a separate key.

The exact independent control consists of the nine publicly solved native GP29 texts from [relikd/LiberPrayground](https://github.com/relikd/LiberPrayground/tree/main/pages), preserved with original source blob hashes and punctuation in [source resource](../resources/external/relikd-solved-gp29-native-v1.json). The code checks all 2,979 authentic solved runes and does not transcribe English via a substitute alphabet. It also runs on our source-original LP2 indices, 55 rune-bearing physical pages. [Standalone CommonJS SFT](../sims/lp2_keyless_two_back_rotor_sft.cjs).

| Statistic | 2,979 actual solved runes encrypted by the keyless rotor | Original LP2 source (our per-physical-page conditioning) |
|---|---:|---:|
| Same-page/section adjacent opportunities | 2,970 | 12,901 |
| Adjacent identical emitted runes | 20 | 86 |
| Doublet rate | 0.6734% | 0.6666% |
| Cipher GP29 normalized IoC | 0.995716 | 0.999874 |
| Nonzero-step GP29 normalized IoC | 1.036994 | 1.036931 |
| Nonzero-step 29×28 conditional χ² given previous cipher rune | 797.886 | 813.922 |
| Nominal conditional degrees of freedom | 783 | 783 |

**Calibration caveat:** The control's contingency cells average only ~3.6 counts. The χ² figures are descriptive, with different control/target sample sizes, not directly comparable significance probabilities. The construction was identified after comparing both the simpler one-back and two-back versions. The one-back version had χ²≈3,211, making the two-back version a chosen counterexample, not a statistically pre-registered historical hypothesis. A full original generator diagnosis would also need within-word lag-five behavior, layout and independent source cues.

## Source-original replay and where it fails

Using the same fixed zero/zero starting state per physical page, decoding **all 12,956** original ciphertext runes produces a valid GP29 rune at every position, with exact forward reconstruction including all **86** original same-page doublets. The resulting text has native normalized IoC **1.02355** rather than plausible solved-English ~1.78; p0 begins with GP29 indices \`14 21 22 5 12 9 1 10 ...\`, rather than readable prose. Exactly **88** recovered EA instances arise under per-page starts; two first-position candidates come from initializing the output state, illustrating why a first-rune boundary seed matters. This direct candidate **does not solve LP2**, and a full trivial roundtrip is never evidence of a historical correct key in a bijective family.

The relevant original identifiability point is structural. The external report's purported key is defined operationally as ΔC=C[i]−C[i−1], which is already observable and does not, by itself, carry or recover the unknown plaintext. To make an *encoder*, one must specify how P affects ΔC, and a *decoder* must invert that map including zero events. The keyless two-back transducer does precisely that and generates a highly similar one-back fingerprint. Thus the narrow inference “flat steps force a long unavailable key” is invalid. This does **not** refute that a genuine external key may ultimately be required.

## Affine two-back key family: independent blind inverse and original holdout (22 November 2026)

A natural generalization asks whether a **single two-parameter secret**, rather than the fixed keyless rule, provides the missing decryption state. Freeze the source-native GP29 alphabet and reset \`u=v=0\` at each physical page. Let \`a,b∈{0,…,27}\`. For each plaintext rune \`P\`, emit \`s=0\` if \`P=28\`; otherwise emit \`s=1+((P+a·v+b) mod28)\`, followed by \`C=(u+s) mod29\`, then \`(v,u)←(u,C)\`. Its full inverse reads \`s=(C−u) mod29\`, returns \`P=28\` if \`s=0\` and otherwise returns \`P=(s−1−a·v−b) mod28\`, then updates the same state. All **784** combinations are exact bijections at every state, including repeated ciphertext runes; no missing escape symbol is hidden.

The [standalone 784-key GP29 test](../sims/lp2_two_back_affine_rank28_blind_sft.cjs) trains a Laplace-smoothed original native-rune unigram model from the nine publicly solved source records (2,979 genuine GP29 runes). Before any original-cipher search, it performs three independent **blind-key planted controls** using native solved passages withheld from each plant's language-model training. The exact hidden keys are recovered in rank one from all 784 candidates, followed by byte-exact inverse reencryption:

| Held-out genuine source plant | Rune count | Hidden and blindly recovered \`(a,b)\` |
| --- | ---: | --- |
| \`0_koan_1\` | 780 | \`(5,17)\` |
| \`0_loss_of_divinity\` | 755 | \`(11,3)\` |
| \`0_welcome\` | 515 | \`(19,9)\` |

The same frozen key ranking is then applied to **9,640 original p0–39 ciphertext runes**, selecting \`(25,6)\` with GP-native unigram mean log probability **−4.015855879** and normalized IoC **1.024553088**. Its **untouched** 3,008-rune p40–53 holdout gives score **−4.059732297**, IoC **1.022197983**; independently unselected p54–55 (308 runes) gives IoC **1.004124540**. Across **every one of the 784 keys**, original training IoC remains **1.022131–1.024553** and p40–53 IoC remains **1.020691–1.032131**. Genuine native source controls have normalized IoC **1.780215031** and self-trained mean log unigram likelihood **−2.957642505**; their independent leave-one-section-out scores lie between **−3.09695 and −2.92704**. Every tested original inverse therefore remains extremely far from the native plaintext distribution, even after fitting the two-key parameters. All original rune input, physical page resets, and the exact 86 original doublets are preserved; the original ciphertext reencryption identity is expected for any chosen key.

**Decision:** retire precisely the **GP29 rank28/EA-sentinel affine-two-back law with one shared \`(a,b)\` and original physical-page resets**, as a full-book native plaintext decoder. This is a stronger finite-key test than the earlier keyless counterexample; it remains a conditional family, because the images and authenticated Cicada instructions do **not** specify its cipher opcode, key source or state reset. It cannot exclude nonlinear two-back updates, a different plaintext alphabet, source-supplied side information or a heterogeneous chapter cipher. **Unknown LP2 plaintext, authentic key and intended destination recovered: none.** The test was evaluated on the exact repository resources, with positive hidden-key controls; the file above preserves the complete executable assertions.

## All-key EA word-final prediction: original lexical source gate (22 November 2026)

The strongest objection to the entire *EA-as-zero-step* family is now **key-independent**. At every non-page-initial glyph the inverse identity \`P_i=EA ⇔ C_i=C_(i−1)\` holds for **all 784 affine keys**, and also for its earlier keyless member. This lets original punctuation and word boundaries test a precise plaintext prediction without decoding or selecting an affine key.

The exact source-preserving 2,896-word parser (12,956 unknown GP29 runes) identifies **86** same-page equal-adjacent events. Of these, **19 occur at the last rune of a printed word**, forcing 19 word-final plaintext \`EA\` symbols under this family. The original p27 12-rune word (global rune offset 6606, full word index1476) has the frozen mask \`nnnnnEnnnnnE\`: it would contain \`EA\` twice, including a word-final \`EA\`, regardless of every other plaintext letter or secret key. Four other original source words have exact EA-position masks absent from the 29,157-term checked English lexicon; five mask-absent word indices are **167, 444, 1390, 1476, 1697**. These finite-lexicon absences alone are not mathematical impossibilities for rare English vocabulary, names or a non-English register.

The [complete original-word and source-calibrated English census](../sims/lp2_ea_sentinel_wordend_frequency_original_sft.cjs) uses the already-tested source-native \`ING\`, \`IO\`, \`TH\`, \`EA\` GP29 orthography, all 29,157 exact TextBlob word-frequency records and the 2014 source word lengths (preserving page-carry words). Independent genuinely solved GP29 passages contain **0 word-final EA symbols in 740 words**, despite **20 EA symbols elsewhere**. Under independent English word draws *matched to each original word's GP rune length and weighted by its reference frequency*, the expected word-final EA count is **1.518752**; the exact Poisson-binomial tail for observing **at least 19** is **4.844395×10⁻¹⁵**. This is a **conditional source-language diagnostic**, since textual words are not independent and the dictionary frequency register may differ from the creator's. **Sensitivity check:** granting every *distinct dictionary word equal weight*, the expected count rises to **17.081858** and the tail becomes **0.351692**, so there is **no lexicon-free impossibility theorem**. The five absent masks remain an exact statement only about the fixed 29,157-word list and source orthography.

**Decision:** this word-position evidence sharply disfavors assigning **every ciphertext doublet to plaintext EA** in an English manuscript with printed word boundaries preserved, including any secret affine parameters of this rank28 architecture. The size of the conditional language mismatch cannot authenticate a different sentinel, erase the original page carries or establish real plaintext. A future lossless decoder needs a specifically evidenced variable escape/channel, a different source language or a source-authored boundary/rune transformation. **No unknown LP2 text, authentic cipher key or continuation was recovered.**

## Next independent discriminator

The keyless member predicts **strong second-order dependence of step emissions on C[i−2] conditioned on C[i−1]**, reflecting the rotated plaintext distribution. A test comparing a fixed, pre-chosen second-order statistic on original LP2 against the exact solved-native control and fixed word/page geometry could reject this specific state law. A different source-selected rotor or key schedule would need its own falsifiable prediction. The causal priority is to find a visible **two-back update rule or authentic decoding operand**; there is no justification for declaring that all keyless or low-state alternatives have been exhausted by the external report's first-order tests.

**Status:** source-calibrated architectural counterexample, 784-key affine negative, and all-key EA word-position source diagnostic; **unknown-page plaintext/key recovered: none**. SFT and exact sources are included above. This result informs [Director Issue #1120](https://github.com/FlareZ123/liber-primus/issues/1120) and can be handed to the owner of #1101 without competing in its finite-state sweep.
