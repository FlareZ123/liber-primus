# Original LP2 previous-word GP-prime nonce: source-led reversible gate (Director #564)

**Decision (12 November 2026):** The authentic 2013 761.MP3 title supplies a genuine GP prime-sum numeric convention. An explicit previous-ciphertext-word nonce built from that convention and decoded through an original-source, exactly invertible ciphertext-feedback cipher **does not recover native GP-language plaintext** on either of two independent original LP2 spans. The tested scheme is rejected at this scope. No new plaintext, manuscript key, or destination is claimed.

## Upstream clue and precise missing selector

The authentic, pre-LP2 2013 MP3 has the title **The Instar Emergence** and basename **761.MP3**. Under the 29-symbol original Gematria Primus table, the title's three GP-prime-weight word sums are 72, 280 and 409, yielding **761**. Its own Parable 1,595,277,641 description also equals the three-clause prime-sum product, a source-native positive for deliberate prime arithmetic (see [original-audio audit](audio761-original-id3-frame-inventory.md)). Cicada's earlier BASE29 transformation supplies a historical GP29 numeric register, but the original sources **do not explicitly instruct** using a previous ciphertext word's prime sum modulo29 as a nonce or adding it as ciphertext feedback. Those are the two frozen, challenged assumptions.

The chosen compact hypothesis uses only observable printed ciphertext words and one pre-existing numeric seed. It requires no private per-word secret or inferred plaintext:

- At each original chapter beginning set **s=761 mod29=7**, prior emitted rune **c_prev=0**.
- For each rune in a complete published word: **C_i=(P_i+C_prev+s) mod29**; immediately set **C_prev=C_i**.
- After that word is fully emitted, set **s=(sum GP-prime(C_i) over all runes in that ciphertext word) mod29**.
- Keep prior-rune state and the previous-word nonce across all printed word and physical-page boundaries of the same visible chapter. Spaces/punctuation contribute no rune or key tick.
- Exact inverse per original ciphertext rune: **P_i=(C_i-C_prev-s) mod29**; update C_prev from the *published ciphertext*, and update s only upon completing that published ciphertext word.

This source-motivated, 29-symbol word-synchronous feedback can be tested without tuning a pad, guessing words or branching on cipher output. It is a single frozen model, not a search over offsets.

## Complete original-input execution and positive

The original physical page and complete-word alignment come from resources/lp2-transcription.txt, and glyph numeric labels from resources/liber-primus/lp2-corpus.json. Line wraps and ordinary page changes preserve whole words. The independent target intervals are the original **p54–55 terminal chapter, 308 runes / 66 whole words**, and **p0–2 opening chapter, 729 runes / 158 whole words**. Both rune streams assert exact identity with the canonical original page corpus. The p57 solved PARABLE is a genuine-language 95-rune / 20-word reference.

As a positive check, use the original **95 runes of the already-solved p57 text as plaintext**, encrypt it once with the frozen hypothesized word-nonce scheme, then decode that *synthetic ciphertext* with the same inverse. All **95/95 original GP symbols** are recovered and exactly reencrypted. Its synthetic cipher trigram score is **−5.584873716 nats/rune**, and authentic recovered text score is **−2.546783849**. This tests a decoder capable of converting exactly this level of flattened ciphertext back to real, Cicada-authored GP text, without claiming the synthetic cipher is historical.

Original-input results use a fixed 29-symbol smoothed trigram likelihood trained on the first 80% of the pinned GP-normalized Shakespeare source. Larger (less negative) values mean stronger native-language evidence; all references use the same model.

| Original ciphertext source | Raw score | Previous-prime-nonce inverse | Wrong ordinal-sum nonce | Zero nonce | Original → decoded IoC |
| --- | ---: | ---: | ---: | ---: | ---: |
| p54–55, 308 runes | −5.495615036 | **−5.416801479** | −6.026732911 | −5.608790026 | 0.0338212 → **0.0332713** |
| p0–2, 729 runes | −5.634228205 | **−5.627594686** | −5.794224756 | −5.607432907 | 0.0340825 → **0.0345121** |
| Known cleartext p57, 95 runes (negative contrast) | **−2.546783849** | −5.328289014 | −5.740598748 | −5.619501927 | 0.0627100 → 0.0306831 |

The actual p54–55 inverse begins BXNGNGDDTHSEAUEEOUTHEAIBJOEJYWOEGCMGEACTHYAJHEOGIAEYRNEAEAGB...; the independent p0–2 inverse begins HSOWAEGUATEOOERXUPEADEAEAERFTAYGIAAHAWSEAYAERIANGNYFEONIATR.... Neither produces any readable original passage. Both remain at near-random GP29 IoC, far from solved p57's **0.0627100**. Every original decode reencrypts *all* original source glyphs under its declared rule, but such algebraic roundtrips are expected for wrong reversible models.

## Research decision

Close the **specific source-prime-sum modulo29 previous-ciphertext-word feedback** family with title-derived initial seed7, original visible-chapter resets, cross-page word carries and the frozen additive operator. This model lacks a credible plaintext result on both selected unknown chapters despite a powered native Cicada-language positive. The historical prime-sum convention itself remains real. Its extension to modulo29 per-word nonces and additive ciphertext feedback remains a model, unsupported by an original LP2 decoding instruction.

Do not turn this into a sweeping arbitrary nonce, affine, word-seed, additive sign or key search. A successor requires a new independent source instruction selecting a different operation/representation and must produce readable original text with a forward encoder.

**Reproducer:** [single-file Node.js 22 CommonJS source SFT](../sims/lp2_previous_word_prime_nonce_sft.cjs), no writes or third-party packages; emits full source hashes and all three target controls. **Completed original-source Node.js 22 CI:** [manual-only workflow success, run 43164320106](https://github.com/FlareZ123/liber-primus/actions/runs/43164320106). The exact committed SFT was run against the tracked original corpus, original whole-word transcription, and original-language source; all 95 authentic solved p57 symbols were recovered from the synthetic positive, all original streams reencrypted, and all fixed original output-score assertions passed. The [manual workflow](../.github/workflows/lp2-previous-word-prime-nonce-manual.yml) has no push or schedule trigger.
