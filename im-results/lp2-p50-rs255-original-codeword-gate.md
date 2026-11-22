# P50 numerical rectangle as a direct or interleaved GF(256) Reed–Solomon codeword

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

## Original 32×8 as QR-style interleaved short blocks

An independent and *more geometry-faithful* mechanism uses all 256 original bytes without dropping any: **eight 32-byte Reed–Solomon blocks printed vertically**. This is motivated by actual QR interleaving and the physical 32 rows × eight columns, and it was not answered by the preceding 255-byte test. For symmetry, also test **32 eight-byte blocks printed horizontally**. All proposed blocks are complete systematic GF(256) codewords, requiring a zero syndrome at α⁰ or α¹ independent of their payload or actual parity length.

The fixed 16 cases are:

- Source-original base60 or \`f\`-omitting base59;
- Eight columnwise 32-byte blocks or 32 rowwise eight-byte blocks;
- Forward or backward direction *within every block*;
- Standard QR-style consecutive parity-root convention starting at α⁰ or α¹.

**Original-input outcome: 0/16 cases** has even one block with a zero first syndrome. Each of the eight columns individually fails its first mandatory checksum under all eight column-shaped choices. Each of the 32 rows likewise fails under all eight row-shaped choices. Therefore no declared orientation is a set of complete, unmodified standard GF(256) Reed–Solomon codewords, regardless of parity length (provided it is at least one).

The same SFT independently constructs eight genuine \`RS(32,24)\` codewords, interleaves them into a source-shaped 32×8 table, and recovers **8/8** first-root zero syndromes. It separately constructs 32 genuine \`RS(8,4)\` codewords into the same shape, recovering **32/32** zero syndromes. Both first-root conventions pass; a fixed single-byte corruption triggers a nonzero syndrome in either shape. These are successful synthetically planted controls only. The actual original table remains unchanged and yields no recognizable codeword or decoded payload.

**Precise scope:** QR encoders can use other codeword lengths and multiple blocks with padding/interleaving that do not coincide with the eight physical columns; a 256-byte table need not encode an entire QR symbol. Nor does the experiment check arbitrary per-column permutations, a different byte alphabet or corrupted/correctable RS blocks. Without an independent originally visible QR/block allocation instruction, those variants would multiply unconstrained interpretations.

## Decision

No original plaintext, external payload, keystream, or error-correcting receiver is obtained. A single QR-style 255-byte codeword with one unconsumed framing byte **and** complete 8×32 or 32×8 source-aligned codewords are excluded under the declared natural serializations. This result gives no basis to invent more orientations, errors, Reed–Solomon block partitions or alternative GF generators without an independent source-visible instruction.

**Read-only Windows Node22/CommonJS SFT:** [\`sims/lp2_p50_rs255_source_sft.cjs\`](../sims/lp2_p50_rs255_source_sft.cjs). It loads the committed original tokens, pins the canonical digest, performs exact field arithmetic, and prints all 32 case parameters and syndromes.
