# LP1 physical p05: exact reverse-copy trailer in an original JPEG

**Source-byte discovery, 11 November 2026.** This is a genuine, deterministic byte-level relationship in the supplied original archive, but **not recovered unknown LP2 plaintext, an LP2 key, or an authenticated instruction to reverse any specific LP2 stream**. Its purpose is unresolved.

## Original-source observation

The archived `resources/liber-primus/05.jpg` (LP1, preceding the 58-page second release) has SHA-256 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`. Its final JPEG EOI marker starts at original byte offset **600,364** (zero-based). There are exactly **72,700 bytes following that marker**. If `B` denotes the entire file and `T=B[600366:]`, an exact byte-for-byte identity holds:

```
len(T) = 72700
T == reverse(B[:72700])
```

Thus the appended bytes are an exact reversal of the file's *own initial 72,700 bytes*. Reversing them exposes an incomplete JPEG beginning with the same JFIF header and initial text/image content as the original; it contains **no independent file bytes or unknown secret material**. The prefix bytes have been duplicated by the appendix.

An identical EOI/trailer census of all **75** supplied original JPEGs (`00.jpg` through `74.jpg`) finds **74 with zero bytes after the final EOI marker**. Only LP1 `05.jpg` has an appended payload. This distinguishes the observation from an ordinary characteristic shared by the archive's JPEG encoder. None of the **58** LP2 JPEGs has appended data after the final EOI.

## Fixed original-LP2 byte-key screen

To test the cheapest possible causal route from this literal source-byte stream to unknown LP2 ciphertext, consume the **actual post-EOI bytes in printed file order**, starting at its first byte, with one continuous book-global GP clock over all **12,956 unknown runes**. Map each source byte to a 29-way residue and invert GP29 addition/subtraction. Neither choice produces source-language-looking text:

| Fixed original inversion | Original decoded IoC | Observable result |
| --- | ---: | --- |
| Raw unknown LP2, before inverse | 0.0344783978645 | Near-uniform native GP |
| `P_i = (C_i − trailer[i] mod 29) mod 29` | **0.0344812933935** | Unreadable |
| `P_i = (C_i + trailer[i] mod 29) mod 29` | **0.0344950203456** | Unreadable |
| `trailer[i] mod 28` after excluding prior GP ciphertext symbol | **0.0357254560223** on 12,870 eligible positions | **86 original adjacent repeats are undefined** by this 28-choice rule |

The last rule cannot invert all original positions without an extra independently identified escape mechanism. Under the two direct additive rules, the IoCs remain at the cipher baseline; they do not recover GP-English plaintext or identify the historical cipher. No extra byte offsets, rotations, file variants, salts or tunable mappings were introduced. All mappings are conjectural because the source itself does not prescribe a byte→GP29 conversion.

Reproduce directly against source bytes and the pinned complete original rune corpus using the [full original-inversion SFT](../sims/lp1_p05_jpeg_trailer_original_inverse_sft.cjs), alongside the [JPEG-only source gate](../sims/lp1_05_reversed_jpeg_trailer_sft.py).

## Interpretation and cryptanalytic status

The construction is a literally reversible byte operation visible to a byte-level human inspection of a historical Cicada page. Whether it is a deliberately planted reversal hint, a downstream artifact-repacking effect, or some other production anomaly is **undetermined**. The doubled fragment is a prefix of the same JPEG, so it cannot itself serve as a previously unknown independent high-entropy keystream. The source does not say which later page, text region, bit order or ciphertext register should be reversed, nor which key follows. Whole-stream reversal is only a positional transposition and cannot by itself explain the book's near-uniform ciphertext marginals.

The meaningful next gate is an **independent contemporaneous instruction or source-level pattern that gives a unique target and role for this particular byte-reversal idiom**, plus one original LP2 plaintext prediction. Avoid a broad family of arbitrary reversal/phase sweeps or treating the 72,700-byte duplication as new key entropy.

## Reproduction

Run [`sims/lp1_05_reversed_jpeg_trailer_sft.py`](../sims/lp1_05_reversed_jpeg_trailer_sft.py), a small source-only Python program (stdlib, no network), against the original `resources/liber-primus/*.jpg` archive. It verifies the exact 05.jpg SHA-256, trailer length, reversal identity and uniqueness across all 75 original JPEGs.
