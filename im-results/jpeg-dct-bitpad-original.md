# Original-JPEG DCT parity as a direct LP2 page-local pad

**Finding (2026-11-10, Agent 40):** A separately tested JPEG-DCT parity carrier gives no English-like LP2 plaintext under **1,024 fixed direct additive mod-29 inverses**. This is a constrained negative, not a statement that the images contain no hidden message or that DCT steganography is absent.

## Source and candidate cryptosystem

Use the 55 original, rune-bearing LP2 source JPEGs (archive scans `17.jpg` onward, skipping physical LP2 page 50) and the authoritative `resources/liber-primus/lp2-corpus.json`, **12,956 original runes**. For each JPEG, `sims/jpeg_dct_bits.c` reads **quantized DCT AC coefficients** using `jpeg_read_coefficients`; it never re-encodes, alters, or rescales pixels. Read AC coefficient absolute-value parities, skipping zeros, optionally skipping absolute-one values; two coefficient traversals (planar or interleaved MCU) and two within-block coefficient orders (natural or zig-zag) yield **eight stream variants**.

Four exactly defined key mappings derive page-local mod-29 numbers from successive bits: five-bit values reduced modulo 29, five-bit values with 29–31 discarded, six-bit values reduced modulo 29, and eight-bit values reduced modulo 29. The first bit offset is 0–15. Apply both signs of `P_i=(C_i-sign*K_i) mod29`. Thus **8 × 4 × 16 × 2 = 1,024** models. Key consumption advances locally within its own page image; it does not cross page boundaries. No free page-specific offset, hidden key, PRNG seed, DCT sign convention beyond absolute parity, or collision-aware skipping is fitted.

Train model selection on even-numbered physical rune pages; retain odd-numbered pages as a held-out test. Score pooled decoded rune-index coincidences `sum_j f_j(f_j-1)/(N(N-1))`, with 29 Gematria Primus labels. This gives a directly testable necessary signal if the raw parity stream is the plaintext's **direct additive key** and the source is English-like GP.

## Executed results

[Original CI execution](https://github.com/FlareZ123/liber-primus/actions/runs/42787452672), success, 2026-11-10 09:04 UTC. The same run tests **440 authentic page-image extractions** and **1,024 declared inverse settings** on both a planted and original 12,956-rune ciphertext.

| Input | Frozen best training setting | Training rune IoC | Held-out rune IoC |
|---|---|---:|---:|
| Positive plant (Shakespeare GP text + original JPEG DCT bit keys) | planar, zigzag, skip abs-one, five-bit reject, offset 3, positive pad | **0.06027909** | **0.06180966** |
| Original LP2 | planar, zigzag, keep abs-one, five-bit mod29, offset 2, negative pad | **0.03464851** | **0.03447304** |

The positive plant's **true source-derived key ranked first of all 1,024 configurations** on the training split. Its next best model scored **0.04019029 / 0.04073078** (train/holdout), well below the true model. All top eight original-trained models had training IoC in **0.03459566–0.03464851** and held-out IoC in **0.03444649–0.03456194**. The original's best held-out result is close to the 29-symbol uniform coincidence baseline **1/29 ≈ 0.03448276**. No actual LP2 plaintext or authentic key recovered.

## Reproduction and limitations

Run the [dispatch-only workflow](../.github/workflows/jpeg-dct-bitpad-manual.yml), which installs libjpeg headers, compiles the [exact coefficient extractor](../sims/jpeg_dct_bits.c) using a C compiler and runs the [inversion and planted-control program](../sims/jpeg_dct_bitpad_attack.cjs) under Node.js 22. Both programs are source-specific, deterministic, and read original files without writing them.

**Not excluded:** a cryptographically keyed/JSteg-like payload, arbitrary bit permutations, a password-seeded DCT coefficient selection, any hidden ciphertext-dependent state, page-key material stored in a *different* image, a variable-length/anti-repeat transducer, a non-GP or non-English plaintext encoding, or byte-oriented use of JPEG image data. This result is independent of Agent 40's earlier OutGuess pseudoheader and raw-byte-pad work. It should guide candidate prioritization, rather than be misrepresented as proof that original JPEGs carry no steganographic key.
