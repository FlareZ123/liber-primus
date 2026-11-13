# Original pp49–51 table: exact published-constant and Cicada-source fingerprint

**Status (13 November 2026): bounded negative.** The canonical conventional-base60 reading of the 32×8 original token table is *not an exact copy* of the selected published 256-byte cryptographic tables or the three surviving 2014 Cicada 256-byte onion captures. More decisively, the 256 bytes cannot be any complete **byte permutation table**, regardless of its provenance. No unknown LP2 plaintext, authentic key or source-selected consumer was recovered. The possibility of another, as-yet-unidentified non-permutation lookup or cryptographic output remains open.

## Independent premise and original inputs

Physical LP2 **pp49–51**, original scans \`resources/liber-primus/66.jpg\`–\`68.jpg\`, contain the printed 32×8 two-character grid, page row counts **10 + 13 + 9**. The canonical transcription is \`resources/liber-primus/base60-grid.json\`. Exactly follow the published conventional base60 alphabet \`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx\`, with byte value \`60×index(first)+index(second)\`, in printed row-major order. Do not transpose, reverse, modulo-reduce, XOR, change radix, or insert a cipher stage to manufacture a match.

The full original scans were visually compared against all 32 printed token rows. No additional transcription disagreement was observed. The images use visually similar \`I\`/\`l\` and \`O\`/\`0\` forms; this rowwise inspection therefore does not independently prove the case of every ambiguous original glyph. The eleven formerly disputed positions already have separate source-image checks in [the prior source adjudication](lp2-grid-11-original-glyph-adjudication.md). The digital transcription is used unchanged.

### Exact raw-byte fingerprint

| Measure | Result |
| --- | --- |
| Original token count | **256**, rows 32×8 |
| Byte stream SHA-256 | \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\` |
| First eight bytes | \`cb e7 a7 ba 61 ed 7e b7\` |
| Distinct values | **161** out of 256 |
| Additional repeated occurrences | **95** |
| Maximum multiplicity | **4** |
| Original non-permutation witness | Byte positions **7** and **14** (zero-based) are both **183** |

A genuine 256-entry byte permutation has all 256 possible output values exactly once. Original positions 7 and 14 already contradict that invariant. This source-level fact excludes exact identity with the complete forward/inverse AES S-box, MD2's pi permutation, RC4's initialized identity permutation, Twofish q permutations, and any other 256-entry permutation table without needing to assume a candidate key. The apparent randomness of the byte histogram alone provides no positive indication of a copied constant.

## Pre-2014 published cryptographic constants, frozen direct-order matches

The pinned sources are [RFC 6234, §5.1](https://www.rfc-editor.org/rfc/rfc6234) (May 2011 SHA-256 constants), [RFC 1321, §3.4](https://www.rfc-editor.org/rfc/rfc1321) (April 1992 MD5 sine constants), [FIPS 197](https://csrc.nist.gov/pubs/fips/197/final) (AES standard, 2001), and [RFC 1319](https://www.rfc-editor.org/rfc/rfc1319) (April 1992 MD2 pi permutation). A whole-table byte-for-byte equality is required. MD5 and SHA-256 32-bit constants are represented in ordinary fixed BE or LE word byte order, **not arbitrary byte/word permutations**.

| Specific entire reference table | Unequal positions of 256 |
| --- | ---: |
| SHA-256 64 round constants, BE words | **254** |
| SHA-256 64 round constants, LE words | **256** |
| MD5 64 sine constants, LE words | **256** |
| MD5 64 sine constants, BE words | **255** |
| AES forward S-box | **255** |
| AES inverse S-box | **256** |
| RC4 initialized identity byte table | **256** |

The AES/MD2/RC4/Tw​ofish family additionally fails the mathematical permutation invariant, independent of the direct byte comparisons. The two 256-byte SHA/MD5 constant series, unlike the S-boxes, are actual non-permutation reference bytes and provide independent exclusions.

## Exact historical Cicada 2014 256-byte captures

The three recorded hex streams in [the repository's source index](../resources/cicada-hiddenservice-256-candidates.json) are already 256 bytes each; the source file links each to its historical onion service. They are genuine comparison candidates with some historical provenance, although the \`onion2\` stream's exactly-256-byte length was an accidental intermediate snapshot of a growing response. Compare all 256 bytes against the LP2 table without applying any extra operation.

| Historical captured stream | Unequal positions of 256 |
| --- | ---: |
| \`onion2\` | **255** |
| \`onion3\` | **255** |
| \`onion4\` | **253** |

Each fails at **byte zero**: historical prefixes \`634292ba49fe336e\`, \`87de5b7fa26ab85d\`, and \`bf1d5574ca36efd5\` versus original LP2 \`cbe7a7ba61ed7eb7\`. No full-table identity, and therefore no matching source-selected consumer, follows from the length correspondence.

## Exact reproduction and decision

Run \`node sims/lp2_grid_published_256byte_exact_sft.cjs\` on Node.js 22. The single-file CommonJS test loads the *original unmodified repository resources*, verifies every base60 token against the stored numeric transcription, asserts the original SHA-256 and non-permutation statistics, regenerates SHA-256/MD5/AES constants from the pinned definitions, loads the historical 256-byte hex streams, and prints full candidate digests and Hamming distances in bytes. A native exact-copy positive control has **0/256** unequal bytes; a controlled one-byte mutation has **1/256**. The above direct-order originals produce no exact match.

**Director decision:** retire the tested exact-copy hypotheses, and the **entire class of exact 256-entry bijective byte S-boxes**. Do not rescue with arbitrary transformations or new related tables. This experiment cannot exhaust every published arbitrary non-permutation table. Revisiting one requires a particular historical source or visible original clue selecting **that exact source and its role**. Neither a plaintext/key nor a reversible operation is supported by these comparisons, so no unknown-page decoding was attempted.
