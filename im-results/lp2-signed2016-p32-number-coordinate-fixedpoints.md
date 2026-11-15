# Signed 2016 number-to-p32-rune fixed points: 3301 and the short OpenPGP key ID

**Agent 7, 15 November 2026. Original-source arithmetic with a checked native-JPEG reproducer. No decrypted unknown LP2 plaintext, authentic key, executable decoder or destination.** [Standalone SFT](../sims/lp2_signed2016_p32_fixedpoints_sft.cjs) · [successful original Windows/Node22 Actions run 43774340360](https://github.com/FlareZ123/liber-primus/actions/runs/43774340360).

## Original clue and finite operation

The January 2016 Cicada signed message explicitly prints **3301**, the instruction that the numbers of Liber Primus's words are the direction, and the short OpenPGP verification ID **7A35090F**. Its authentic JPEG is **563 pixels wide and 569 high**. Independent existing research discovered that physical LP2 page32 has exactly **121 GP runes** and that reshaping the source indices as an *inferred* 11×11 row-major square gives first-row GP-prime sum **563**, first-column sum **569**. The square's 11×11 cell borders are **not actually printed** on p32, and the 2016 signed tree is different artwork from p32's tree.

A literal new operation uses source number N to select a source rune. Take signed-image pixel **x=N mod563, y=N mod569**. Use the original 11 p32 first-row prime weights as successive x-strip widths, and its 11 first-column weights as y-strip heights; return the p32 rune in the corresponding 11×11 tile. Finally test whether **its actual 0-based GP29 rune index equals N mod29**. This final equality is an investigator's hypothesis, not a historical creator instruction. The original cumulative image strip coordinates are:

- x edges: [0,73,78,179,198,299,302,345,452,465,484,563].
- y edges: [0,73,96,101,124,203,262,315,394,453,562,569].

The two reader-visible signed numbers both satisfy the proposed self-indexing equality without fitted offsets:

| Number from signed source | Native pixel x,y | Tile row,col | p32 rune offset | Actual p32 rune | Number mod29 |
| --- | --- | --- | ---: | --- | ---: |
| **3301** | 486,456 | 9,10 | **109** | **A, GP24** | **24** |
| **7A35090F** interpreted as hex integer **2,050,296,079** | 400,171 | 4,7 | **51** | **D, GP23** | **23** |

The GP primes of the selected A and D are 97 and89, respectively, though the tested match is specifically **GP indices**, not prime weights. The two selected tiles lie among the 100 interior cells, outside the 21 row/column calibration symbols.

## Controls and calibrated limitations

The same fixed operation fails on independent alternative source numbers. The **full signer OpenPGP issuer ID**, 0x181F01E57A35090F, lands at p32 tile (7,2), where the original rune is **H/GP8** while the integer modulo29 is **23**. The signed-2016 creation-time packet integer 0x5685C1C3 lands at original **J/GP11**, expected mod29 **12**. Reading the 2016 signature clock as 107 lands at original **M/GP19**, expected **20**. These negative control outcomes are checked in the reproducible SFT; they were not used to adjust the successful short-ID rule.

Holding the source's 21 axis cells and exact 100-cell interior rune multiset fixed, the interior contains **four D/GP23 symbols and four A/GP24 symbols**. Under a uniform shuffle of those 100 interior symbols, the chance of **two preselected distinct** target positions meeting the exact ordered two-index requirement is:

\[
(4/100)(4/99)=16/9900=0.001616161616\ldots
\]

This probability is **strictly conditional and post-selection-unadjusted**. The square reshaping, reuse of the 2016 image dimensions, short versus full issuer representation, and self-indexing condition came from prolonged exploration of many possible correspondences. A discovery-wide chance is unknown. In particular the full issuer ID's negative result is a substantive alternative interpretation and limits the inference that the authors designed this rule. No printed or authenticated instruction explicitly selects number-as-image-pixel coordinates or a modulo29 check.

As one fixed direct-consumer probe, the straight line from the short-ID pixel (400,171) to the 3301 pixel (486,456), reading each newly crossed nonuniform cell, selects p32 offsets **[51,62,73,84,85,86,97,98,109]** and the original GP transliteration **D-IA-B-J-S-P-B-J-A**. This is not readable native prose. Its reverse is the same unreadable sequence backwards. The source does not direct a line traversal; this is recorded only as a limited output test, not a reason to search all paths.

## Research decision

The result is a **new, exactly reproducible two-number original-source selector** and a conditional dual fixed point. It has not supplied a decipherment operation, authentic key or plaintext. Before transferring it to any unsolved ciphertext, one needs an independently grounded instruction establishing the short key-ID representation, an operation that consumes the two selected GP runes, and a predictable held-out plaintext consequence. Do not extend with arbitrary orientations, salts, extra number candidates or language-optimized paths without that missing instruction. The authoritative overall decryption status is unchanged.

**Reproduce:** run Node22 on [the CommonJS SFT](../sims/lp2_signed2016_p32_fixedpoints_sft.cjs); it reads the exact three checked-in original files, parses the source JPEG's SOF dimensions, reconstructs both GP-prime axes, tests all five frozen integers, checks interior symbol counts and verifies two deliberately altered shadow-cell negatives. Its [manual-only workflow](../.github/workflows/agent7-signed2016-p32-fixedpoints-manual.yml) completed successfully on the original repository assets.
