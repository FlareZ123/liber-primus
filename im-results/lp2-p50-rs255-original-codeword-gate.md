# P50 numerical rectangle as one direct GF(256) Reed–Solomon codeword

**Agent 9 · 22 November 2026. Original-input bounded negative; no unknown plaintext, cipher key, or destination recovered.**

## Why this precise operation is worth trying

The original p49–51 printed numeric field is a 32-row × eight-column array of 256 two-character tokens. Cicada's earlier puzzles used QR codes, which rely on Reed–Solomon error correction over GF(256). One simple human-inspectable interpretation is a complete 255-byte Reed–Solomon codeword with one extra framing/control byte. This is a finite **format test**, not an asserted explanation of the table or a guessed password.

The immutable table is the checked-in \`resources/liber-primus/lp2-grid-256.json\`; its standard base60 byte vector has SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. The original two-character tokens also admit the historically suggested \`f\`-omitted base59 interpretation. The source does not authenticate either byte serialization.

## Fully frozen necessary-condition test

Over the standard QR Reed–Solomon field GF(2⁸) with irreducible polynomial \`0x11d\` and generator element \`0x02\`, a systematic RS codeword with consecutive parity roots beginning at α⁰ must evaluate to zero at α⁰. Another common first-root convention begins at α¹. This first-syndrome condition is independent of the original unknown message, parity length, and secret plaintext. We also calculate all 32 initial syndromes.

The 32 source-shaped candidate serializations are the Cartesian product of:

- Exact printed token reading in radix60 or omitted-\`f\` radix59;
- Row-major (32 rows of eight) or column-major (eight columns of 32) reading;
- Forward or reverse reading direction;
- Omitting the first or last one of the 256 tokens to make a 255-byte codeword;
- Standard first root zero or one.

There are **no selected secret bytes**, no arbitrary permutation of columns, no guessed correction coordinates, and no optimization against unknown plaintext. The test does not claim that a large QR symbol should itself be a single RS(255, k) block. QR codes with multiple interleaved shorter blocks or nonstandard pre-encodings are outside its scope.

## Observed complete original input

| Necessary condition | Original result |
| --- | ---: |
| Source serializations checked | **32** |
| First syndrome exactly zero | **0/32** |
| Full 32-syndrome vectors all zero | **0/32** |
| Minimum nonzero values among the first 32 syndromes, per candidate | **32/32** |

In particular, every direct candidate fails at its *first* required root, so none is an exact full unmodified standard RS(255, k) codeword under the tested geometries. This excludes the stated source-shaped byte-frame interpretation regardless of the number or contents of its data bytes. It does **not** exclude a different framing, per-row error correction, encrypted content, or a source format requiring actual corruption correction.

An independent **positive** is built using 223 generated source-independent message bytes and the GF(256) generator polynomial. The test computes a systematic **RS(255,223)** block for each of first-root conventions zero and one, then verifies all 32 zero syndromes. It also corrupts one byte at a fixed position and confirms a nonzero syndrome. Both positives and both corruption controls pass.

## Decision

No original plaintext, external payload, keystream, or error-correcting receiver is obtained. A single QR-style 255-byte codeword with one unconsumed framing byte is now excluded under the declared natural serializations. This result gives no basis to invent more orientations, errors, Reed–Solomon block partitions or alternative GF generators without an independent source-visible instruction.

**Read-only Windows Node22/CommonJS SFT:** [\`sims/lp2_p50_rs255_source_sft.cjs\`](../sims/lp2_p50_rs255_source_sft.cjs). It loads the committed original tokens, pins the canonical digest, performs exact field arithmetic, and prints all 32 case parameters and syndromes.
