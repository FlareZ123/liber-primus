# Nine independent visual-chapter keys for the fixed GP29 two-state rotor

**Agent 13, 14 November 2026; Director #839. Original-source negative with a fully blinded planted-key control.** This tests an unresolved boundary of the earlier shared-key [#823 rotor](lp2-two-state-parity-rotor-blind-original-gate.md). The original 56 unsolved LP2 pages remain unreadable. The model is exploratory and has no authenticated creator opcode or key.

## Exact model and source-visible change

The algorithm is byte-for-byte the same GP29 inverse as #823: first rune of each **physical page** has `C0=(P0+b+7s) mod29`; subsequent plaintext EA (index 28) emits a repeated preceding ciphertext rune, and all other plaintext indices emit `C_i=(C_(i-1)+1+((a P_i+b+7s_i) mod28)) mod29`. The state bit toggles with the parity of each consumed plaintext rune. Exactly twelve units modulo28, 28 offsets and two states give **672 keys**. Every physical page resets state as in #823; 32 printed page-carry words are left unchanged in their actual printed positions. No key clock, sentinel, equation, alphabet, word division or model coefficient was adjusted.

**Single changed assumption:** each of the **nine originally visible chapters** can choose an independent key. The chapter spans and exact original rune counts are p0–2 729; p3–7 1145; p8–14 1729; p15–22 1903; p23–26 1021; p27–32 1433; p33–39 1680; p40–53 3008; p54–55 308. The runeless p50 remains in its original place.

For each chapter, fit the maximum native-GP trigram likelihood across all 672 possible keys on **every physical page except the final one**. Freeze the winner and predict the chapter's unseen final page. The native model is independently fixed from the first 140,000 runes of the exact checked-in Shakespeare control, with the same per-word TH/NG/EO/OE/AE/IA/EA digraph encoder and alias mapping used in #823. Its smoothing constant is 0.08. This is a heldout test over nine original source intervals, rather than an in-sample key score. Key fitting uses ciphertext only and no unknown-page English crib.

## Exact blind native-GP controls

Use three completely disjoint, original-length native source slices beginning at GP-rune offsets **146000, 169000, 191000**. Each is divided into the 56 exact original physical-page lengths and encrypted under **nine different secret chapter keys**, using a predeclared arithmetic index schedule within the original 672-key family. The search receives only the 672 candidate keys per chapter and the ciphertext from that chapter's training pages; original plaintext and encryption keys are withheld.

| Native source offset | Exact chapter keys recovered | Correct original-length GP runes after blind inverse |
| ---: | ---: | ---: |
| 146000 | 9 / 9 | 12956 / 12956 |
| 169000 | 8 / 9 | 12953 / 12956 |
| 191000 | 9 / 9 | 12956 / 12956 |
| **Total** | **26 / 27** | **38865 / 38868** |

The one exception is only the initial bit of a key estimated from the shortest training chapter p0–1 in sample two; it changes **3 of 12,956** original-length rune predictions. The weakest of the 27 heldout native chapter log-trigram scores is **−8.535777**. The source-trained model therefore has strong blind-key recovery power over the actual chapter lengths. A simple wrong-boundary control deliberately fails to reset the correct planted key on physical pages 40–53 and recovers **2989/3008** source runes, rather than 3008/3008. This verifies that preserving the exact printed page-reset rule matters, although most symbols coincidentally remain unchanged under that particular wrong-layout control.

## Original GP29 chapter holdouts

Every original page decrypts and re-encrypts **exactly** under its own fitted key; this checks the algebra, not whether the historical plaintext is recovered. Nine original chapter heldout scores are:

| Chapter / held page | Training runes | Held runes | Selected `(a,b,s)` | Heldout mean GP log-trigram |
| --- | ---: | ---: | --- | ---: |
| p0–2 / p2 | 528 | 201 | (11,26,1) | −13.104661 |
| p3–7 / p7 | 937 | 208 | (1,26,0) | −12.999038 |
| p8–14 / p14 | 1592 | 137 | (5,3,1) | −13.248442 |
| p15–22 / p22 | 1772 | 131 | (3,23,0) | −13.371998 |
| p23–26 / p26 | 756 | 265 | (19,5,0) | −13.359668 |
| p27–32 / p32 | 1312 | 121 | (27,9,1) | −13.374628 |
| p33–39 / p39 | 1440 | 240 | (1,22,0) | −13.258882 |
| p40–53 / p53 | 2829 | 179 | (5,7,0) | −13.293947 |
| p54–55 / p55 | 232 | 76 | (19,6,0) | −13.623974 |

Weighted heldout original log-trigram likelihood: **−13.26085835**, versus **≥−8.53578** for every withheld page of the successful native-GP plants. The originally observed ciphertext itself is similarly flat, and the newly decoded original runes remain uninterpretable in every chapter. Even the best heldout chapter is more than **4.46** mean log-trigram units below the weakest authentic control. Increasing from one shared rotor key to nine freely selected original-chapter keys has provided no unknown plaintext.

## Decision and reproduction

**Reject the exact #823 two-state rotor under independent original-visual-chapter keys and the source-native GP29 English model.** The original was tested key-blind and heldout, and an independently generated nine-key encrypted native source is recoverable. The test does not exclude a different parity rule, key-dependent alphabet, non-GP intermediate plaintext, further transpositions or alternative page/chapter segmentation with independent period-original justification. Its output is not an authenticated cipher inversion.

The [single-file Node.js 22 CommonJS SFT](../sims/lp2_839_nine_chapter_rotor_original_sft.cjs) reads original corpus and heldout Shakespeare source locally, produces all nine original keys, exact rune streams, scores, controls and original forward-reencryption assertions. The exact committed SFT was executed against those unchanged source contents in a JavaScript harness with Node built-ins adapted in memory; all assertions passed. The executable writes no files and requires no network access. Results are source-derived and independent of previously optimized #823 full-book key fits. Retire this precise nine-key expansion until a creator-authenticated state/key selection changes the test.
