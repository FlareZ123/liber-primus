# p32 terminal state → DH rekey → p50 base29 word graph

**Agent31, 19 November 2026. Status: exploratory hypothesis, not a decryption.**

## Human-visible clue chain

- The p28 page carries a literal DH line, and the 2013 signed protocol gives a concrete Diffie–Hellman procedure with (p=23,g=5).
- The p32 full-branch audit fixes a terminal source-derived H pair ([10,1]=[K g,a-g]), from the MEANING/FALSE source collision at positions 20/39.
- LP2's p49–p51 numerical table is a 256-cell byte array in `resources/liber-primus/lp2-grid-256.json`.
- The 2013 source includes BASE29; the 2016 signed message says words are the map and numbers are direction.

A plausible, deliberately simple continuation is to use the p32 terminal pair as the next DH private exponents, then use the shared secret as a p50 table index, and interpret the returned byte as a base29 page/word address.

## Exact computation under that hypothesis

1. Reuse the p28 DH parameters (p=23,g=5), but set new exponents (a'=10,b'=1). Then:
   - (A'=5^{10}mod23=9)
   - (B'=5^1mod23=5)
   - (K'=A'^{b'}=B'^{a'}=9)
2. The table cell `p50[9]` is token `49`, decoded by the repository's base60 table parser as byte 249.
3. (249=8\times29+17). Under zero-based page/word coordinates this selects p8 word17.
4. Continue by taking the selected word's GP0 sum modulo 29 as the next p50 index. Use the canonical `resources/liber-primus/lp2-transcription.txt` for word boundaries, not the older `resources/transcriptions/liber_primus_master.txt`.

The resulting exact path is:

| State / p50 index | Byte → base29 address | Canonical LP2 target | Next GP0 state |
|---:|---:|---|---:|
| 9 | 249 → (p8,w17) | AHOERNGUER | 15 |
| 15 | 212 → (p7,w9) | EAIAIC | 12 |
| 12 | 247 → (p8,w15) | PNGUP | 19 |
| 19 | 33 → (p1,w4) | RBODTHF | 20 |
| 20 | 102 → (p3,w15) | NWCFPMPL | 28 |
| 28 | 150 → (p5,w5) | GDWA | 2 |
| 2 | 167 → (p5,w22) | YEANTGCA | 27 |
| 27 | 25 → (p0,w25) | CFN | 14 |
| 14 | 183 → (p6,w9) | YDT | 7 |
| 7 | 183 → (p6,w9) | YDT (fixed point) | 7 |

All pages used in this path (p0–p8) match the canonical transcription's rune stream exactly against `lp2-corpus.json`.

## Structural observation

Define (F(x)) as: read `p50[x]`, convert the byte to the zero-based base29 address ((page,word)), take that canonical word, and return its GP0 sum modulo 29.

Across all 29 possible GP0 states, this particular map has three fixed points:

- 0 → p7 word0 HNG
- 7 → p6 word9 YDT
- 18 → p0 word15 BU

The basins contain 2, 26, and 1 states respectively; 26/29 states flow to fixed point 7. The p32-derived seed 9 enters the large basin and terminates at 7.

This is a notable but unproven cross-link: the independently reported p35 H5 key shell is `[2,28,18,0,7]` = `[K,g−a,A−B,0,g+K]`. Its last three values are exactly the p50 map's fixed-point set `{18,0,7}`. The p32 seed's terminal state 7 is also one of those values.

## Why this is not promoted

Two essential steps remain unsupported by an independent source instruction:

1. The p32 pair `[10,1]` has not been explicitly identified as new DH private exponents. This is a plausible state-machine continuation, not an established rule.
2. The 2013 BASE29 reference does not itself specify that p50 output bytes should be split into zero-based LP2 page/word coordinates. The 43-unit source-selector audit explicitly leaves the byte-to-receiver serialization unselected.

Most importantly, the canonical targets in the chain are ciphertext rune words, not plaintext. An earlier exploratory pass using `resources/transcriptions/liber_primus_master.txt` appeared to produce CONSUME/CONSUMPTION/WOE, but that file does not match the LP2 corpus; those apparent plaintexts were a transcription artifact and must be discarded.

## Decisive next test

Do not expand this into more p50 encodings or arbitrary key transforms. First find independent first-party evidence that fixes either (a) the p32 pair as new DH exponents, or (b) the p50 byte-to-page/word serialization. If neither selector can be found, retire this branch. If one is found, the next test is a blind decryption of the fixed-point receiver p6 word9 using a source-derived key, with exact forward reconstruction.
