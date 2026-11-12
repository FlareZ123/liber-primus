# Direct p55 Wisdom-word AES key → original pp49–51 grid: no clear payload

**Classification (12 November 2026, Agent44):** a narrow source-directed cryptographic hypothesis tested against the original 256-cell grid. **No unknown LP2 plaintext, authentic AES key, recognizable embedded file, or continuation recovered.** The result is conditional on the conventional, still unauthenticated radix-60 interpretation of the printed tokens.

## Causal reason for this particular operation

The original physical p55 image (scan `72.jpg`) contains **16 words beginning on that page**, totaling 75 GP29 runes, plus one incoming rune from p54. Its moth is a geometrically reused illustration from solved LP1 p5, which explicitly teaches that **prime numbers and Euler's totient function are sacred**. The original LP2 physical pp49–51 table supplies **256 consecutive numeric cells**, interpreted conditionally as exactly 256 bytes, or sixteen AES blocks. Thus a historically imaginable reader action is to treat each p55 word's GP-prime sum as one AES key component and attempt a direct AES decryption of the table. This uses a stronger combined source selector than choosing arbitrary AES passwords.

The upstream assumption is still substantial: **neither the moth nor a signed 2014 instruction selects AES, its ECB mode, or this word-to-byte encoding**, and the grid's base-60 alphabet is not Cicada-authenticated. Both input counts would occur under other operations. This is a bounded test, not a claim of puzzle intent.

## Frozen original-input calculation

Take exactly the 16 complete p55 words **whose first rune is printed on p55** (excluding the single incoming carry). For each, sum the canonical Gematria Primus prime weights, in printed word order. The independently documented sums are

```text
222, 114, 118, 306, 283, 30, 596, 365,
138, 108, 341, 291, 88, 284, 129, 159
```

There are two direct length-preserving AES key serializations: one unsigned low byte per word (128 bits), and one unsigned 16-bit big-endian integer per word (256 bits). Both are frozen without fitting to ciphertext. Decrypt the conditional original table bytes in its printed row-major order under AES-ECB, without IV or padding. The grid is 256 bytes, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Source files remain unchanged.

| Direct source interpretation | Key hex | Printable ASCII bytes of 256 | First 16 decrypted bytes |
| --- | --- | ---: | --- |
| AES-128, low 8 bits per prime sum | `de7276321b1e546d8a6c5523581c819f` | **89** | `96b84b458f47686b6011bae90efeb4f8` |
| AES-256, 16-bit big-endian prime sums | `00de007200760132011b001e0254016d008a006c015501230058011c0081009f` | **101** | `364c7638b56e5da9c896679b3fbaf9ad` |

Both outputs are high-entropy-looking binary with **no recognizable clear signature or sustained natural-language payload**. Printable counts are ordinary for arbitrary bytes and far below text-like source controls. The AES result was reproduced with the independent Python `cryptography` AES implementation and all fixed key/table bytes. Each result round-trips through encryption; a separate planted 256-byte ASCII control is required to round-trip under both modes in the Node.js SFT. Round-tripping is an implementation check, not a decryption proof.

## Cryptanalytic decision

This rejects **only** these two direct, source-count-selected AES-ECB transfers on the conventional table bytes. It does **not** establish that the table is ciphertext, that p55 is an AES key, or that the creator used AES. Without an independently selected mode, IV, key schedule, digit alphabet, or consumption rule, do not rescue this negative by trying arbitrary endian variants, CBC nonces, shifts, KDFs, page starts, or password lists. A positive route requires new authored evidence fixing such a choice, followed by a plaintext prediction on original bytes.

Reproduce using [`sims/p55_wisdom_wordprime_aes_grid_sft.cjs`](../sims/p55_wisdom_wordprime_aes_grid_sft.cjs), which reads the existing canonical LP2 corpus, shared printed-word parser and grid, verifies the sixteen word sums and exact grid digest, evaluates the two frozen AES inverses, checks complete re-encryption and validates an independent known-plaintext plant. Source context: [original LP1/LP2 moth correspondence](lp1-lp2-crossrelease-artwork-raster-copies.md), [source-prime word list](../workplace/p55-prime32-v2-onion-hypothesis.md), [original numeral-table codec ambiguity](lp2-grid-numeric-codec-ambiguity.md).
