# The original 256-byte grid as a self-indexing 11-cycle

**Classification:** original-source deterministic traversal, a new conditional two-clue concordance, and a multiset-preserving null. **No original LP2 ciphertext has been decrypted**, and the authors' intended traversal is unproved.

## A minimal human-executable interpretation

The original LP2 pp49–51 table contains 256 printed two-character tokens in **32 rows of eight**, conventionally read as **bytes 0…255** under a 60-digit alphabet. Every decoded byte can therefore act as an address of another cell in the *same table*, requiring no hidden key or invented numeral width. Start at the original **upper-left cell, row-major index 0**, and follow the byte found in the current cell as the next 0-based index.

Under the printed forward row-major base-60 order this produces the exact, complete directed orbit:

`0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 → 247 → 192 → 0`.

**The first cell is part of an 11-cycle with no transient prefix.** The 11 intermediate addresses are all distinct, and the cycle returns precisely to its starting position. A contemporary solver could perform this operation using only the printed tokens and normal indexed arithmetic; it is a specific proposed reading instruction, rather than a cipher model fitted to language.

The full directed functional graph has exactly two attractor cycles: the above **11-cycle has a basin of 252 cells**, while a separate **249↔158** 2-cycle has a basin of four. Those basin sizes are determined by the actual 256 byte values, without searching for a favorable sequence.

## Separate manuscript clues that may make 11 relevant

The unsolved **physical p32 has exactly 121 runes**, supporting an 11×11 reflow; independent earlier research linked its first-row and first-column GP-prime sums **563 and 569** to the dimensions of the signed 2016 Cicada tree image. A source-derived 11-step table route could therefore supply an 11-position row/key clock for that page, though **no rule has been found that turns the eleven table addresses into an independently predictive GP29 plaintext or a unique 11×11 traversal**. Do not assume a direct p32 connection solely from the shared number.

A separate original source relation selects **the same forward row-major base60 representation**: the p39 marked red triad and oversized Ac24 imply a double root at `X=24` of the table's GF29 coefficient polynomial. Under exactly the original base60 order, `P(24)=P'(24)=0`. This table factor and its eight-codec comparison were already established in [the numeric-codec report](lp2-grid-numeric-codec-ambiguity.md). Here the independent **byte-as-address** operation reveals a second structured source property in that same representation. The two tests concern different mathematical operations on the same 256 bytes and must not be counted as independent evidence without a calibrated joint null.

## Codec and order discrimination

The eight previously documented natural base60/base59 × row/column-major × forward/reverse interpretations have the following *first-cell* orbit properties. “Transient” is the number of steps before the orbit enters its first cycle.

| Radix | Cell order | Direction | Transient | Cycle length |
| ---: | --- | --- | ---: | ---: |
| **60** | **Row** | **Forward** | **0** | **11** |
| 60 | Row | Reverse | 24 | 5 |
| 60 | Column | Forward | 19 | 12 |
| 60 | Column | Reverse | 18 | 13 |
| 59, omitting f | Row | Forward | 25 | 1 |
| 59, omitting f | Row | Reverse | 16 | 9 |
| 59, omitting f | Column | Forward | 38 | 3 |
| 59, omitting f | Column | Reverse | 4 | 9 |

Among those eight source-recognizable readings, **only the original forward row-major base60 table starts at a closed 11-cycle**, and it is independently the only orientation with the GP29 double root at source-selected Ac24.

The page-32 eleven-runic dimension and the grid's original top-left position are natural but **not authenticated instructions** to interpret table bytes as pointers. This is therefore a prospective solve-path hypothesis, not proof that the radix is uniquely determined by the puzzle.

## Signed-3301 selector and the table's only two zero bytes

The independently signed January 2016 tree message explicitly prints the identifier **3301**. The GP alphabet contains **29** symbols, while the original numeric grid has **256=32×8** cells. These yield two natural, distinct integer projections:

1. **GP alphabet residue:** `3301 mod 29 = 24`. Taking row 24, first column (0-based) in the **32×8 original grid** selects flattened cell **24×8=192**, printed **`00`**.
2. **Byte-address residue:** `3301 mod 256 = 229`. Taking flattened cell **229 = row28, col5** selects the **other printed `00`**.

Those are **the only two zero-valued tokens in the entire 256-cell original table**, and their exact positions are `[192,229]`. With the source-first table-pointer interpretation above, the identifier starts on the short approach **`229→0`**, and the other zero is the **11-cycle's closing cell**, `192→0`. Thus one signed historical number, the 29-character rune alphabet, and the table's original dimensions each have direct roles in a precise self-indexed route. The 2016 instruction describes its words as a map and its numbers as the direction, making a byte-address reading a possible human operation. The relationship does not prove the map was deliberately planted.

The two zero locations have conditional exact probability **`1/C(256,2) = 1/32640`** under an exchangeable multiset permutation of table-byte positions. This probability treats the two cell addresses as fixed independently of the observed byte values. In reality the choice of combining mod29 with a row start and mod256 with a direct cell address was recognized after other table regularities, so this should **not** be interpreted as a discovery-wide p-value. Importantly, the printed `00` tokens retain their zero interpretation under both the published base60 and alternative f-omitting base59 codebooks. The zero pair selects original forward row-major order, while the separate jet and 11-cycle constraints distinguish the base60 reading among eight documented natural alternatives.

A related cross-source equality, previously raised on [Director Issue #18](https://github.com/FlareZ123/liber-primus/issues/18), is that `(563×569) mod29=13` and `3301 mod29=24`. These exactly give both original grid-polynomial derivative roots, **13 and 24**. The dimension factors come from p32's 11×11 GP-prime coordinate sums and the signed 2016 tree image. All of these numerical connections are *hypotheses of an intended solve path*. They require an independently indicated decoding operation and actual original plaintext before being promoted to established cryptographic results.

## Conditional rare-event experiment

The exact [reproducer](../sims/lp2_grid_byte_pointer_11cycle_sft.cjs), verified by [successful Node.js 22 CI run 42941238297](https://github.com/FlareZ123/liber-primus/actions/runs/42941238297), first asserts all source arrays, first-cell hops, orbit components, and eight codec contrasts. It then shuffles the **existing 256 decoded byte values** uniformly by a deterministic Fisher–Yates process driven by xorshift32 seed `0x24a11b7d`. This preserves the complete byte multiset, including duplicate values and the number of occurrences of zero.

Across **300,000** shuffled tables:

| Frozen source event | Shuffles satisfying it |
| --- | ---: |
| Cell 0 lies on a closed cycle of exactly 11 | 1,900 |
| GP29 `P(24)=P'(24)=0` | 352 |
| **Both simultaneously** | **2** |

The observed conjunction has an empirical frequency of **2/300,000 ≈ 0.00000667** under this *conditional fixed-hypothesis shuffle null*. This is a useful discriminator against accidental satisfaction of these **two precisely stated rules** within the same source model. It is **not a global puzzle-design p-value**: the byte-pointer interpretation was noticed after other source properties were known, several model families have been explored, the shared byte source introduces dependencies, and the experiment does not account for this broad selection process. The joint result alone cannot establish maker intent.

## Cryptanalytic next decision

The actionable development is a **deterministic 11-state address schedule derived entirely from the original printed table**. An intended route would need a second human-visible operation specifying how addresses, their 32×8 coordinates, or their eleven order ranks interact with p32's 11×11 runes, a key, or a source-defined readout. Freeze that operation before evaluating original ciphertext. The known closed-cycle nodes in traversal order are:

`[0,203,68,199,47,76,114,197,115,247,192]`.

Simply reducing them modulo29, using them as a repeating additive pad, or permuting p32 text without an independent instruction would revive already exhausted direct-GP and transposition families. A plausible decoder must produce independently recognizable original plaintext, including an explicit reversible encryption model. The table's authentic purpose and the 11-cycle's historical intentionality remain unknown.
