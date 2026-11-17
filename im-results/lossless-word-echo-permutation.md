# A lossless permutation architecture for the original word-echo anomalies

**Current status, 17 November 2026: exactly reversible conditional cipher family; its fixed S and EA source symbols now fail unreversed GP-native whole-word checks. Original unknown LP2 plaintext and key remain unrecovered.** The hypotheses are **deliberately source-guided by previously observed anomaly counts**, so reproducing those counts is a model-capacity witness, not discovery-independent evidence of Cicada's mechanism. All original heldout decryption results remain GP-uniform. This is a useful lossless alternative to earlier collision-repair surrogates that could match runic echoes only by overwriting plaintext.

## Reversible assignment and manuscript inputs

Fix the 29 GP indices and identify index 28 with the rare rune EA as a zero step. Choose generator \(g=15\), proven primitive root modulo 29 and independently selected by the existing red page40 quotient/p15/p53 arithmetic. The base encoder assigns each GP plaintext rune \(p\in\{0,\ldots,27\}\) to a distinct next ciphertext rune \(C_{i-1}+g^p\bmod29\), with EA assigned to the immediately preceding ciphertext rune itself. This is a perfect 29-symbol permutation at every state.

Use the exact 2,896 whole canonical words and their rune-local offsets, across printed line and physical page breaks. From each state-specific permutation, perform only **swaps**, preserving bijectivity. The source-visible conditions are:

1. **T6 anchor:** when at least six earlier ciphertext runes belong to the same displayed word, target \(T_i=24-2C_{i-6}\bmod29\). If \(T_i\ne C_{i-1}\), swap the outputs assigned to plaintext index **15 (S)** and the prior plaintext preimage of output \(T_i\), so plaintext S always encodes exactly the T6 echo. Value 24 matches 3301 mod29. The 15/S choice is a source-clue-motivated hypothesis, not an established plaintext.
2. **Specific S5 anchor:** when five earlier runes are in the same word and \(C_{i-5}=15\), make plaintext index **18 (E)** map to visible ciphertext **15 (S)**, unless the swap would displace an active T6 S anchor. This second-choice English-popular source rune is exploratory.
3. **Consecutive lag5 extension:** when the previous position already echoes its five-step predecessor \(C_{i-1}=C_{i-6}\), swap the output assigned to plaintext E with the preimage of \(C_{i-5}\), again avoiding displacement of the active T6 S anchor.

Variant 0 is the unswapped primitive-root map; variant 1 adds T6; variant 2 adds S5; variant 3 adds the lag5 continuation. They are nested *exactly reversible* models. Every original ciphertext rune decrypts uniquely under each proposed model, and 160 independent GP-English source plants per variant were correctly round-tripped **160/160**, a total of **640 complete exact 12,956-rune plaintext recoveries**.

The original source ciphertext counts, all calculated from exact original page/word positions, are:

| Measurable original feature | Original LP2 |
| --- | ---: |
| Word-local T6 affine matches \(C_i=24-2C_{i-6}\pmod{29}\) | **80 / 1,290** |
| Word-local S5 matches \(C_i=C_{i-5}=15\) | **11 / 74 S-exposure slots** |
| All lag5 matches | **104 / 2,105** |
| Consecutive lag5 echo pairs | **9** |
| Within-page adjacent repeated ciphertext runes | **86** |

## Source English GP controls on exact original shapes

The planted plaintext source is the independently committed Shakespeare-to-GP control, using 160 different pre-seeded **contiguous 12,956-rune passages** per model with unchanged original displayed word and physical page geometry. Retaining English source dependencies makes this a more discriminating cipher-capacity test than independent uniformly sampled runes. For every model the encoder produces source-length ciphertext and the inverse reproduces all source GP runes.

| Source-plain positive cipher model | T6 mean ± SD | S5 mean ± SD | All lag5 mean ± SD | Consecutive lag5 mean ± SD | Repeats mean ± SD |
| --- | ---: | ---: | ---: | ---: | ---: |
| Variant0: primitive-root baseline | 44.29 ± 7.02 | 2.59 ± 1.62 | 69.78 ± 8.77 | 2.57 ± 1.75 | 97.54 ± 15.43 |
| Variant1: +T6 swap | **84.21 ± 11.58** | 2.51 ± 1.62 | 70.39 ± 9.23 | 2.29 ± 1.63 | 97.20 ± 14.98 |
| Variant2: +S5 swap | **86.80 ± 11.43** | **8.08 ± 2.80** | 76.61 ± 9.35 | 2.85 ± 1.83 | 97.79 ± 14.79 |
| Variant3: +lag5 continuation | **87.12 ± 11.43** | **8.63 ± 2.74** | **79.56 ± 8.30** | **5.21 ± 2.15** | **97.31 ± 14.74** |

Variant3 permits simultaneously elevated T6, S5 and consecutive lag5 events with **no arbitrary glyph overwrites, information loss or ciphertext replay**. However, it remains short of the original **104** total lag5 matches (planted mean 79.56), and its paired mean 5.21 is below the original 9. These are meaningful *model shortfalls*. The original duplicates 86 are within positive-source sampling variation, but every variant has exactly the number of repeats implied by its planted source EA positions by construction.

## Independent native-word challenge: the S/EA marker choices fail their intended linguistic register

**17 November 2026, Agent 1. Newly bounded original-cipher selection result.** The original report's 160 GP-English positive plants used *contiguous text rebroken at the original ciphertext word boundaries*, which preserves rune-level correlations but destroys natural English word beginnings and endings. This is adequate to demonstrate a mathematically bijective encoder and synthetic feature compatibility; it is **not** evidence that the S and EA choices can produce the observed source word morphology from actual English words. A direct corpus-true word control now changes that assessment.

**Exact source-register bound, independent of the secret base alphabet.** In the frozen lossless permutation model, plaintext S (GP index15) is mapped to the six-back target `T(C[j-6])` at word-local positions `j≥6` whenever the target differs from the preceding ciphertext glyph. The untouched 2,896-word original has **1,290** eligible positions, **79** nondegenerate T6 events and **33** positions where the target equals the predecessor. Hence any fully decoded source under this precise S-anchor rule contains **between 79 and 112 plaintext S runes** among those eligible positions, regardless of the hidden baseline permutation, additive pad or starting key. The 33 conflicting positions were generously allowed to contain S. This bound operates on the fixed published runes; it requires no chosen-key inversion.

The original also has **86** same-glyph successor events, split by authentic printed word boundary as **23 at word beginnings** and **63 inside words**. In the baseline zero-step scheme, plaintext EA (GP index28) produces a repeat of the preceding ciphertext at every ordinary position. Its source-native location pattern would need to resemble that original split. Later S5 swaps can interfere with the exact equality, so this is a bounded criticism of the baseline/first anchor variant rather than a blanket impossibility for every variant.

Construct independent controls from three committed GP-English texts, each encoded using the original solved LP1 orthography (`ING→NG`, `IO→IA/IOR`, `QU→CW`, `V→U`, `K/Q→C`, `Z→S`). For every one of the original **2,896** printed GP-word lengths (including 7–14-rune long words), independently select a genuine whole English word with **exactly that GP rune length**. No synthetic word break, original ciphertext selection, or borrowed T6 event locations enter the plants. Run **500 deterministic plants per corpus**, preserving all 2,896 word positions and their lengths.

| Independent GP-native whole-word source | Expected S at the 1,290 eligible j≥6 sites | Expected EA at a printed word beginning | Expected EA inside a printed word |
| --- | ---: | ---: | ---: |
| Actual LP2 ciphertext condition | **79–112** if S is the forced T6 source symbol | **23** repeats | **63** repeats |
| Gibran | about **157** | about **11** | about **110** |
| Emerson | about **181** | about **9** | about **87** |
| Shakespeare | about **220** | about **5** | about **84** |

Across the matched plants, **none of the 500 GP-native whole-word instances in any of the three source corpora** places its eligible S count in the source-imposed 79–112 interval. None simultaneously places at least 23 EA glyphs at word starts and at most 63 EA glyphs in interiors. The [independent CommonJS source-register SFT](../sims/lp2_word_native_T6_EA_marker_gate_sft.cjs) freezes the exact original counts, sampling seeds, source orthography and the full control distributions. It also records exploratory GP-R counts because R is less frequent and more evenly distributed over eligible long-word locations than S in some references.

**Decision:** retire the literal fixed plaintext **S→T6** and universal **EA→previous ciphertext** assignment as a credible *word-preserving native GP-English decoder* for LP2, despite the successful earlier continuous-rune synthetic fit. These exact source-register demands are insensitive to unknown keys; searching more keys under the same assignments would not address them. This is strong calibrated evidence conditional on the three native-English controls and intact source word boundaries, rather than a theorem about every possible Cicada plaintext, non-English alphabet, spelling, optional inserted rune, or other reversible cipher. The less frequent R is an *exploratory competing plaintext marker*, selected retrospectively from the observed glyph profile; no first-party clue or 150-rune original decryption yet authenticates it.

## Simple source reversal partly rescues S morphology, but fails direct original decipherment

A later [p39 red-triad word-reversal original-decoding experiment](lp2_word_reversal_red_triad_original_gate.md) found a distinct, word-level counterexample to the native-word frequency objection above: **reverse each true GP-English plaintext word before applying the symbol encoder**. This retains natural complete English words and the original rune counts. On three 400-sample whole-word native controls, the source S incidence at original eligible six-back positions drops to approximately **80 Gibran, 92 Emerson, 87 Shakespeare**, against the exact original bound **79–112**. With whole words in forward order the corresponding means are 157, 181 and 220. Gibran's reversed-word source also matches the independent terminal-symbol bound **31–42** (expected 41), although Emerson (55) and Shakespeare (51) overshoot it. Thus the specific GP-S rejection above applies to **unreversed** English and cannot be extended to all word-preserving source transforms.

The red p39 runes [27,5,15] admit the postselected identities product≡24, index-sum≡18 and GP-prime-sum≡28 (mod29). Inspired by these fixed operands, a full **word-reversed, exactly bijective, primitive-15 alphabet** was tested with two potential source-marked word-start zero symbols (GP I or C), two interior zero symbols (GP IA or EA) and the original GP-S-to-T6 swap. All four complete original p40–53 inverses **re-encrypt exactly** and pass native GP-English positive plants, yet have only **32–35 exact dictionary words among 667 original printed words**, all at most three runes long; **zero** original native-English dictionary words of length six or more. The arithmetic coincidences were identified after T6 was known and do not establish an author-issued algorithm. Reversing words therefore supplies a new, narrow source-layout lead, **without any recovered LP2 plaintext or selected changing key**.

## Direct original ciphertext inverse: conditional anchors, no decoded English

Applying the exact inverse to untouched original ciphertext gives a whole-book GP unigram IoC **0.0353113** for baseline and **0.0353317** even for variant3, near the 29-symbol uniform baseline \(1/29=0.0344828\), very far from independent GP-English controls (typical ≈0.060–0.062). Thus the rule, with its stated zero additional key, does **not** decrypt the manuscript.

Within the *conditional* permutation hypothesis, 79 of the **80** original T6 affine hits invert to source rune **S**, while the remaining hit has \(T_i=C_{i-1}\) and is instead an EA zero step. With the S5 rule, all **11** original S5 hits invert to proposed source rune **E**. These 90 symbol predictions are **hypothesis-conditioned** and must not be promoted as recovered original plaintext: the full decoded register and independent tests do not support historical adoption.

The main research benefit is **constructive cryptographic feasibility**: source-guided, word-local echo channels with both lag6 affine and lag5 fixed-symbol biases coexist exactly with a first-order prohibition on accidental same-rune output, without violating lossless decryption. A further independently constrained source key or state function would still be required to obtain actual LP2 plaintext and to predict the remaining excess of lag5 echoes.

## Reproduction and limits

- [Pure Node.js source-word bijective models, original inverse and 640 seeded positive plants](../sims/lossless_word_echo_permutation.cjs).
- [Passed GitHub Actions run 42801910888](https://github.com/FlareZ123/liber-primus/actions/runs/42801910888).
- [Prior exact-source field inverse/unknown-lag research](reversible-exponent-feedback-lookup.md) and [word-local unrestricted key negative](word-local-exponent-autokey-inversion.md).

The cipher choices of plaintext S and E, lag5/6 context, and 3301-affine target were selected from existing knowledge of the source and its anomalies. No null p-value or historical likelihood is claimed for their match. The next substantive goal is a **source-derived complete state/key** that independently predicts actual ciphertext transitions and yields linguistically coherent heldout original plaintext, rather than fitting additional switches to the same source-observed counts.
