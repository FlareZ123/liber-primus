# Signed 2016 dimension-selected original LP2 rune words as binary stream keys

**13 November 2026, Agent 7. Classification: original-input bounded negative.** No recovered LP2 plaintext, key or continuation. The exact 2016 signed JPEG dimensions **563×569** select original LP2 **p0 word6** and **p1 word33** uniquely by Gematria-prime word sum. Their **11+10 original runes** supply source-addressed material. The 2016 signed image arrived after the 2014 book; this connection does not prove an intended SHA-256 KDF, AES or ChaCha20 operation. Direct GP29 additive and GP28 predecessor-exclusion inverse attacks are consequently *testable hypotheses* rather than authenticated author instructions.

The 21 runes were frozen in their image-selected order, width word followed by height word, with three exact encodings:

| Source key serialization | Bytes | SHA-256 digest |
|---|---:|---|
| 21 GP rune ordinals in 0..28 as bytes | 21 | `4b4483ac5f2a2ee28d8b4ded9724ab2f4c7c81167e6322ed1aede59b7121a23c` |
| 21 GP primes as unsigned 16-bit big-endian | 42 | `20c670895dd5961b77a3bb090e6d7ff856bdb2f0eb43e058e801ec914b1d49cc` |
| Concatenated original 21 Unicode rune glyphs, UTF-8 | 63 | `2da39594ab15217b1fe17940df425aa02f54e953388772ca7cb3ff128ec11cbe` |

Each digest was used as a 32-byte key for `aes-256-ctr` and `chacha20` with the exact 16-byte zero IV. Byte keystreams were applied either continuously across the original **12,956 ciphertext runes** or reset to byte zero on every original rune-bearing physical page (55 pages). Both signs were tested for two independent transports:

1. Direct GP29 rune-ordinal addition/subtraction, byte modulo 29.
2. The precise GP28 predecessor-exclusion rank `r = C[j]−1(C[j]>C[j−1])`, byte modulo 28. The **55 physical-page initials and 86 source doublets** are left unconstrained, rather than inventing their plaintext.

Thus the frozen finite set has **3×2×2×2×2=48 decoders**. Neither ciphertext-dependent key fitting nor unknown-plaintext scoring influenced the initial key selection.

## Complete original result

A word-internal smoothed GP bigram scorer was trained on the first 70% of the pinned Shakespeare source-native words, with GP special symbols `ING/IO`; the independent last 30% supplied exact original-printed-word-length control words, supplemented by Gibran for missing rare lengths. Printed word continuations across physical line/page breaks are preserved. The GP28 reference maps otherwise unrepresentable rare `EA` to `A` only for the control. Score units are **natural log probability per within-word eligible transition** (higher is more prose-like).

| Corpus / best candidate | Native bigram score | Scored transitions |
|---|---:|---:|
| Original unknown GP29 ciphertext, untreated | −5.823706536 | 10,060 |
| Exact original-shape held-out native GP29 English | **−2.389306171** | 10,060 |
| Exact original-shape native GP28 English | **−2.369088618** | 10,060 |
| **Best of 24 source-key GP29 decoders** | **−5.758803335** | 10,060 |
| **Best of 24 source-key GP28 rank decoders** | **−5.758663595** | 9,854 |

The best GP29 case is UTF-8 rune encoding → SHA-256 → ChaCha20, physical-page key reset, plus sign; its opening transliteration begins `DEEANTHNWMNGYJSAEGBOEOJOP...` and does not form source-native language. The best GP28 rank case is ordinal-byte encoding → SHA-256 → ChaCha20, book-continuous clock, minus sign, with 141 unconstrained page-initial or duplicate locations. No variant approaches the native-English control. All 48 recorded original-cipher outcomes and the exact key bytes/digests appear in the reproducer output.

The **positive inverse check** exact-recovers all **12,956/12,956** planted native GP29 runes and **12,901/12,901** planted GP28 noninitial positions under the same known keystreams and source page shapes. This validates the specified byte-stream inverse, but only for the tested transport/clock. The source-shape language check is independent of the encryption plant.

**Windows CI passed:** [original-input run 43492890147](https://github.com/FlareZ123/liber-primus/actions/runs/43492890147). [Single runnable Node 22 script](../sims/lp2_2016_dimension_words_stream_original_sft.cjs); [manual-only workflow](../.github/workflows/lp2-2016-dimension-words-stream-manual.yml).

## Research decision

The two image-selected words, under these **three literal KDF inputs and two zero-IV stream ciphers**, are insufficient to decode original LP2 as GP-native text with the specified additive or predecessor-exclusion transport. This result does **not** exclude the words as keys under an independently specified different KDF, stage/counter, escape/channel, target page, or cipher family. No new source instruction selects such a variant. The earlier [2016 source-word spatial-address investigations](../sims/lp2_2016_dimensions_firstwords_sft.cjs), [11×11 Toeplitz word-pair consumer](../sims/lp2_2016_dimension_wordpair_toeplitz11_sft.cjs), and [2016 book-address walk](../sims/lp2_2016_dimensions_base58_orbit_sft.cjs) test distinct consumers; this original-byte-stream test complements them, and supplies no reason to continue arbitrary key-derivation guesses.
