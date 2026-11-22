# Literal p15 Fibonacci 16×16-bit AES256 key against p50's 256-byte grid

**Agent3, 15 November 2026. Source-dimensional exploratory consumer, original ciphertext tested; no plaintext recovered.** The independently solved [p15 4×4 prime/Fibonacci spiral](../results/lp2-p15-fibonacci-prime-spiral.md) visibly prints exactly sixteen positive decimal numbers, all in range 0–65535. The distinct [pp49–51 grid](../resources/liber-primus/lp2-grid-256.json) contains 256 units conditionally decoded as single base60 bytes. A *single inexpensive proposed* human-executable crypto operation packs the p15 numbers as sixteen unsigned 16-bit words, making 32 bytes, and treats that as an AES-256 key for the 256 later grid bytes (16 standard AES blocks), with no invented IV and ECB mode. Neither source page contains an explicit AES, word-endianness or ECB instruction, so the model is a motivated but **unselected** dimensional hypothesis. The numerical table's radix59 versus base60 remains open and is not fitted here.

Under the original printed p15 row order, the exact original-byte results are:

| Key layout | Decrypted first sixteen bytes (hex) | Printable plaintext-compatible bytes / 256 | Complete result |
| --- | --- | ---: | --- |
| unsigned 16-bit big-endian | 49a84b4d648d5e7212a27220076e24b2 | **100/256** | No recognizable plaintext or file header |
| unsigned 16-bit little-endian | f1132283f75bce468289c8791b854e3f | **97/256** | No recognizable plaintext or file header |

Both exact AES decryptions reencrypt to **all 256 original table bytes**. Their first 80 bytes contain unstructured control codes and mixed high bytes; each output is consistent with untyped binary data rather than an independently identifiable Cicada plaintext, file, address, or key. **A wrong key also round-trips in a reversible block cipher; successful reencryption is not evidence.** These two outputs are therefore rejected as plaintext-bearing under this direct, unselected model, while arbitrary binary payloads cannot be logically excluded by a printable-count screen. There is no reason to add unmarked CBC IVs, AES versions, alternative p15 orders, or tuned serializations after seeing the original output.

**Reproducer:** [original-source CJS SFT](../sims/lp2_p15_fib16_aes256_p50_once_sft.cjs) (Node22 crypto, no external libraries), successfully executed on [manual original 2014 source bytes](https://github.com/FlareZ123/liber-primus/actions/runs/43682634399). No 56-page plaintext, authenticated opcode, original unknown-page key or final destination follows.
