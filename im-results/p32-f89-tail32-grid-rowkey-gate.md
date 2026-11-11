# p32 F89 tail → p50 32×8 row-key gate

**Status: bounded negative for the two source-motivated simple row-key families.** No plaintext, key, or file payload was recovered.

## Upstream premise

The p15 Fibonacci-prime construction supplies F_11 = 89. The canonical p32 transcription contains 121 runes (11×11); taking the suffix after zero-based offset 89 leaves exactly **32 runes**. The canonical p49–51 table is **32 rows × 8 columns = 256 bytes**. The 32-to-32 row alignment is therefore a specific cross-page hypothesis, not a generic key-length search.

The signed 2016 instruction says “words are the map, meaning is the road, numbers are the direction.” This makes an eight-way row rotation a plausible first readout for an 8-column table. The 2013 source's “primes are sacred” makes the GP prime weights a plausible alternate row key. Neither source explicitly says “XOR” or “rotate each row”; these are deliberately limited, reversible tests of the simplest interpretations.

## Locked test

Inputs are the canonical repository files:

- \`resources/liber-primus/lp2-corpus.json\`
- \`resources/liber-primus/lp2-grid-256.json\`

The 32-rune suffix at p32 offset 89 is used top-to-bottom, one key value per p50 grid row. Two key encodings are tested:

1. GP ordinal (0–28);
2. the corresponding GP prime weight.

For each key, test only:

- XOR the row's eight bytes with its one key value;
- rotate the row left by key mod 8;
- rotate the row right by key mod 8.

The row order, start offset, and table orientation are fixed. No offset search, key fitting, AES/PRNG sweep, or alternative page selection is performed. Reproduction:

\`\`\`bash
python sims/p32-f89-tail32-grid-rowkey.py
\`\`\`

## Exact input

The 32 GP indices are:

\`\`\`
22,21,3,19,17,1,23,15,17,11,28,4,22,18,9,9,
7,6,1,20,24,3,26,1,16,0,11,16,24,6,17,12
\`\`\`

Their GP prime weights are:

\`\`\`
83,79,7,71,61,3,89,53,61,37,109,11,83,67,29,29,
19,17,3,73,97,7,103,3,59,2,37,59,97,17,61,41
\`\`\`

GP-index sum = 429; prime-weight sum = 1,567.

## Results

| Fixed transform | First 32 output bytes (hex) | Printable bytes | Entropy (bits/byte) | Standard file signature |
|---|---|---:|---:|---|
| GP-index row XOR | \`dd f1 b1 ac 77 fb 68 a1 49 ec 89 cb e2 11 a2 c1 7a c9 0c 22 65 8a 38 54 7e d5 be 0a 85 51 9e 96\` | 101/256 | 7.1334 | none |
| GP-prime row XOR | \`98 b4 f4 e9 32 be 2d e4 13 b6 d3 91 b8 4b f8 9b 7e cd 08 26 61 8e 3c 50 2a 81 ea 5e d1 05 ca c2\` | 95/256 | 7.2917 | none |
| GP-index left rotation | \`7e b7 cb e7 a7 ba 61 ed 04 b7 d4 5c f9 9c de f7 21 66 89 3b 57 79 ca 0f 19 96 42 8d 85 6d c6 ad\` | 103/256 | 7.1697 | none |
| GP-index right rotation | \`a7 ba 61 ed 7e b7 cb e7 de f7 04 b7 d4 5c f9 9c 89 3b 57 79 ca 0f 21 66 42 8d 85 6d c6 ad 19 96\` | 103/256 | 7.1697 | none |
| GP-prime left rotation | \`ba 61 ed 7e b7 cb e7 a7 d4 5c f9 9c de f7 04 b7 57 79 ca 0f 21 66 89 3b 85 6d c6 ad 19 96 42 8d\` | 103/256 | 7.1697 | none |
| GP-prime right rotation | \`ed 7e b7 cb e7 a7 ba 61 f9 9c de f7 04 b7 d4 5c ca 0f 21 66 89 3b 57 79 c6 ad 19 96 42 8d 85 6d\` | 103/256 | 7.1697 | none |

The row-rotation variants are pure permutations, so their byte histogram and entropy are unchanged from the source grid. None begins with PNG, JPEG, ZIP, GZIP, PDF, or ELF magic; none yields a readable text prefix. Both XOR variants remain high-entropy and have no standard signature or coherent plaintext.

## Interpretation and limits

The 32-rune suffix / 32-row alignment is real as a length relation, but the simplest row-key implementations do not reveal a payload. This rejects only the fixed direct-XOR and mod-8 row-rotation models tested here; it does not prove that the p32 suffix is unrelated to the table.

The grid JSON explicitly says that 11 disputed cells were adjudicated against original pixels, while remaining cells are not comprehensively re-adjudicated. The negative is conditional on the current canonical transcription. Do not expand this into arbitrary byte shifts, row permutations, AES modes, or offset searches without a primary clue selecting that operation.

**Decision:** preserve the 32=32 alignment as a weak structural observation, retire direct row-XOR and mod-8 row-rotation as key models, and do not treat this as plaintext or key recovery.
