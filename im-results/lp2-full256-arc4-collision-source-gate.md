# Full 256-byte table as ARC4 key with collision-latent GP29 key consumption

**17 November 2026, Agent27. Classification: original-cipher finite negative with complete native-language source-positive recovery.** No unknown LP2 plaintext, authorial cipher key, intended decoding operation, or destination recovered.

## Human-accessible clue and new inversion

Original physical LP2 pp49–51 print 256 source-adjudicated base60 numerals. This is a conventional 256-byte ARC4 key length, and Cicada's earlier JPEG OutGuess puzzle used ARC4 internally. The unknown LP2 text has only 86 immediately repeated GP ciphertext runes in 12,956 symbols, suggesting a possible output anti-repeat filter. A hypothetical cipher could draw one additional ARC4 stream byte when an output would exactly repeat its predecessor. The true discarded keystream positions would then be invisible in ciphertext, which could defeat a naive fixed-index decryptor.

Existing direct full-grid ARC4 tests tried **no hidden consumption** (see [direct full-key test](lp2-grid256-rc4-original-gate.md)). Existing collision-constrained ARC4 tests used **individual 32-byte columns as separate keys** (see [eight-column hidden-consumption test](grid-rc4-keyskip-inversion.md)). This investigation uses the **entire 256 bytes as one KSA key** and exact latent skip inference under one shared key, a distinct original-inverse family. The source does not instruct the reader to use ARC4, nor prove that a byte is deliberately rejected; this is a motivated hypothesis, not an authenticated author rule.

## Freeze and inverse

Original key: all 256 printed bytes in row-major order (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). Standard ARC4 KSA and PRGA, zero drop and no IV, nonce, KDF, phase search, or byte permutation. Reduce every ARC4 byte modulo29. The original target is the entire **729-rune opening p0–p2 section**. Test two interpretations visible before decryption: include its 13 red heading runes in the stream, or start the cipher at the first black rune after the heading, leaving 716 runes. For each, test both additive signs of the standard GP29 inverse.

The exact bounded Viterbi model reuses the published [collision-state decoder](../sims/grid_stream_collision_viterbi.cjs): at most one rejected keystream byte per ciphertext emission, allowed **only** when it would have emitted the immediately preceding original ciphertext rune for the **same candidate plaintext rune**. Total extra draws are limited to 34 over the whole original opening. Objective is the independently trained Shakespeare GP29 trigram language model from the first 200,000 bytes of [the fixed fixture](../resources/control/shakespeare_first300k.txt), with 3.5 log-score penalty per reject. These rules are identical for real data and planted controls.

## Original source result

| Original source span | Decryption sign | Exact maximum language score, nats/rune | Inferred hidden draws | Opening GP romanization |
| --- | ---: | ---: | ---: | --- |
| All 729 original opening runes | + | **−5.8535109703** | 7 | `WAEHIAEATHLAPCAEBHUCWOEUIAEMAEBSTLPOI` |
| All 729 original opening runes | − | **−5.7043960980** | 14 | `DNGEIAXIDNGITHBOEAEEOAOIDFOESDEONREAWI` |
| 716 black-runic opening after source red13 | + | **−5.8783394832** | 7 | `DIAJBNSPEOAEEPUPWDYSTHIAXJOROMCYCY` |
| 716 black-runic opening after source red13 | − | **−5.8400686389** | 10 | `IAGLHTHEEOFSOEXAJCTJMLRHEATHIAPOECEANG` |

All four original outputs remain nonlinguistic; the highest score is much worse than source-native GP prose. There is no short authentic instruction or inferred key. A counterexample to the entire proposed ARC4 family is not proved, since a different state policy or expansion could change the result, but **this fixed key and skip architecture does not decipher the opening section**.

## Decisive source-shaped positive

Use a disjoint held-out Shakespeare excerpt, input characters 210,000–259,999, independently encoded to 729 GP29 symbols. Encrypt it with **the same original full 256-byte table**, same standard ARC4, same modulo29 map, each arithmetic sign, and an 81%-chance single discard **only at exact ciphertext repeats**. Seed deterministic xorshift32 with `0x33012755`. The inverse decoder is given neither the plaintext nor skip sites and is not tuned after seeing the original output.

- **Sign +:** actual 17 discarded bytes; Viterbi independently infers 17 and recovers **729/729 exact original plant GP runes**; language score **−2.5238239887**.
- **Sign −:** actual 18 discarded bytes; Viterbi independently infers 18 and recovers **729/729 exact original plant GP runes**; language score **−2.5286250861**.

The standard 9-byte ARC4 `Key` known-answer vector `eb9f7781b734ca72a7` also passes. The positive demonstrates exact keyskip recovery for an authentic table-key stream and original-length native-language plaintext. It prevents the failure on original ciphertext from being dismissed as an inability of the decoder to recover hidden collision consumption. The positive is synthetic and **must not be presented as decrypted Cicada plaintext**.

## Decision and reproduction

**Retire full-table row-major standard ARC4 / GP29 additive cipher with only collision-caused single-byte skips at the source chapter start or post-red-heading start.** Other concrete original-selected consumers, unknown source keys, different cipher families, or a genuine anti-repeat transform remain open. The unusual original five-back equalities identified in [word-lag5 source analysis](lp2-lag5-fixedrune-boundary-alignment.md) also require explanation and were **not** used to fit this source-key model.

[Single-file Windows-compatible Node22 SFT](../sims/lp2_full256_arc4_collision_sft.cjs). [Manual-only GitHub Actions workflow](../.github/workflows/agent27-full256-arc4-collision.yml); [successful source-original Node22 execution on 17 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/44062069913), whose 729-rune real and independently planted outputs agree exactly with the original-data direct V8 calculation. Source datasets: [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), [original image-adjudicated 256 numerals](../resources/liber-primus/lp2-grid-256.json), and the frozen independent Shakespeare fixture. No source value or printed rune was altered.
