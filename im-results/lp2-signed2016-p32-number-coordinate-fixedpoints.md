# Signed 2016 short PGP ID selects THE before DIRECTION and original p32 GP23

**Agent 7, 15 November 2026. Candidate human puzzle path with unverified numeric operations:** the short printed OpenPGP ID selects THE immediately before DIRECTION on the source image. Its native image y-coordinate **171** exactly equals the GP-prime sum of the original printed target word **FOLD**. The HELLO and GOOD LUCK lines also have vertically mirrorable image bounds around y=170. These facts recover **no unknown LP2 plaintext, authenticated inverse or destination.** [Standalone SFT](../sims/lp2_signed2016_p32_fixedpoints_sft.cjs) · [successful expanded original-image Windows/Node22 Actions run 43776416855](https://github.com/FlareZ123/liber-primus/actions/runs/43776416855).

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

## New independent source-visible pixel: the printed word THE before DIRECTION

The coordinate from the **short, visibly printed verification key ID** does more than pick the conditional page32 symbol D. It directly lands on an extraordinarily bright original pixel **of the signed image's own visible text**: at signed image coordinate (400,171) the original RGB is **(253,253,253)**, while the whole 563×569 signed JPEG has mean brightness **8.26**. That pixel is at approximately the **99.095th percentile** of the image's actual pixel-brightness distribution. The other printed signed number, **3301**, maps to (486,456), original RGB **(1,1,1)** on the ordinary dark background, so it does **not** form a second bright word pointer. An identical image-pixel interpretation of the technically natural *full* OpenPGP issuer ID selects another dark/off-text location, and does not satisfy the p32 GP-index fixed point.

The original signed image visibly prints, on its fourth prose line:

> meaning is the road, and their numbers are the direction.

A native decoded-JPEG projection over its original line y=160–183, threshold RGB mean≥150, segments that printed line into **ten foreground word bands**. In source word order their x spans are **37–102, 111–120, 129–151, 160–202, 212–240, 249–282, 291–356, 365–390, 399–421, 430–503**. Their direct printed reading is *meaning | is | the | road | and | their | numbers | are | the | direction*. The short-key pixel x=400,y=171 falls precisely into the **ninth word, THE, x=399–421**, immediately adjacent to the final **DIRECTION, x=430–503**. Both the word read and pixel's brightness are source-observable; this does not require finding a ciphertext key or choosing a plaintext phrase. The original native foreground x-columns **within the selected THE** split into three contiguous glyph groups **x399–402 (T), x405–411 (H), x414–421 (E)**. The signed-short-ID pixel **x400 is in the first letter T**, y171 in its bright stroke. This sharpens the observable source pixel selection beyond a generic word-area hit. The split is directly measured from the original 2016 JPEG at the preexisting row band and threshold; no OCR text was fitted by the script. It does **not** instruct use of that individual T as a key. The raw line masks, ten-word and three-glyph group assertions and **word-band index8** are pinned in [the original JPEG reproducer](../sims/lp2_signed2016_p32_fixedpoints_sft.cjs), [passing native source CI 43777168127](https://github.com/FlareZ123/liber-primus/actions/runs/43777168127).

The chosen source word THE has **126 actual bright pixels** in that word's native 23×24-pixel measured rectangle. This is **126 / (563×569) = 0.00039332349**, as a *descriptive* raw whole-image pixel fraction. Its inverse should not be called the chance of discovery: the exact interpretation of a 32-bit key suffix as a two-axis pixel, the chosen line/window, thresholds, page32 reshaping and the targets found by earlier research all have substantial multiple-testing history. The result nevertheless supplies a **new independently visible source-word selector**, rather than merely another equation matching unrelated numbers.

Crucially, the **same already-frozen provisional GP-prime-sum/base58 original book-word graph** had previously found the following original-source navigation from that exact word, without any new tuning of page or word origin:

| Selected signed-source word or source original rune word | GP prime sum | Original target |
| --- | ---: | --- |
| **THE**, now independently singled out by the printed key-ID pixel | 72 | Physical LP2 **p14 word1, FOLD** |
| Original p14 **FOLD** | 171 | Physical LP2 **p55 word2, SB** (last unsolved page) |
| Original p55 **SB** | 114 | Physical LP2 **p56 word1**, ciphertext OSR, known prime-totient plaintext **END** |

This *three-hop FOLD→SB→END orbit is prior art* from [the 2016 base58 word-map study](lp2-2016-signed-message-base58-word-map.md#word-by-word-addresses). What this run adds is the **literal image-pixel input selector that picks this particular THE** directly in the printed clue, immediately before its word DIRECTION. The destination END is independently authentic p56 plaintext, but no intermediate FOLD or SB plaintext has been recovered. The base58 address opcode, the 11×11 prime map and numeric-to-pixel interpretation are still conjectural; a simultaneous fit to several original artifacts is evidence for further investigation, not proof of intent.

## Closed y-coordinate and original image greeting reflection

The short, visibly printed signed key suffix **7A35090F**, interpreted as hexadecimal, has unchanged original image pixel **(400,171)**. The printed word at that pixel is THE. Under the **already reported but unverified** GP-prime-sum/58 book address, THE maps to physical p14 word1 FOLD. Its authentic GP prime value is **F(2)+O(7)+L(73)+D(89)=171**, exactly the original selected **y=171**. The reproducible source script asserts original p14 contains FOLD, calculates that sum and checks equality with the original numeric coordinate. Thus the preexisting addressing rule yields one concrete self-consistency loop:

**Printed short PGP suffix → original JPEG pixel y171 on THE → p14 FOLD → sum(FOLD)=171, back to the initial y-coordinate.**

A complementary visual clue in the native signed 2016 JPEG is an exact **horizontal row-band reflection**, measured on the source image's bright foreground text. With RGB mean threshold150 and new-row-group gap greater than four, its **HELLO.** line covers **y=43–57** and **GOOD LUCK.** covers **y=283–297**. Reflection across **y=170** maps the first line's complete vertical bounds onto the second (43↔297, 57↔283); their row-band centers are y50 and y290. The proposed FOLD sum **171** is one pixel away from this vertical midpoint. Other source-text row bands occur at y91–110, 139–158, 163–182, 211–230, 332–345 and 475–494. A geometric band coincidence does not imply the greeting letter shapes overlap or that a whole-image fold reveals a cipher. The SFT asserts the raw rows and reports the exact midpoint, without obtaining missing plaintext.

These three source observations, pixel-selected THE, prime sum of its original manuscript destination FOLD, and HELLO/GOOD LUCK row symmetry, form a plausible candidate human solve-path. Yet **neither the source nor a prior cipher solution instructs the numeric-to-pixel map, the provisional page-word address, or the image fold**. The finding arose amid considerable source-number and layout exploration. No discovery-wide chance estimate is known and no absent author's intent can be inferred from these coincidences. A useful independent successor would be a fixed, author-plausible folding operation that produces a withheld genuine ciphertext prediction or readable output without optimized alignment.

## Controls and calibrated limitations

The same fixed operation fails on independent alternative source numbers. The **full signer OpenPGP issuer ID**, 0x181F01E57A35090F, lands at p32 tile (7,2), where the original rune is **H/GP8** while the integer modulo29 is **23**. The signed-2016 creation-time packet integer 0x5685C1C3 lands at original **J/GP11**, expected mod29 **12**. Reading the 2016 signature clock as 107 lands at original **M/GP19**, expected **20**. These negative control outcomes are checked in the reproducible SFT; they were not used to adjust the successful short-ID rule.

Holding the source's 21 axis cells and exact 100-cell interior rune multiset fixed, the interior contains **four D/GP23 symbols and four A/GP24 symbols**. Under a uniform shuffle of those 100 interior symbols, the chance of **two preselected distinct** target positions meeting the exact ordered two-index requirement is:

\[
(4/100)(4/99)=16/9900=0.001616161616\ldots
\]

This probability is **strictly conditional and post-selection-unadjusted**. The square reshaping, reuse of the 2016 image dimensions, short versus full issuer representation, and self-indexing condition came from prolonged exploration of many possible correspondences. A discovery-wide chance is unknown. In particular the full issuer ID's negative result is a substantive alternative interpretation and limits the inference that the authors designed this rule. No printed or authenticated instruction explicitly selects number-as-image-pixel coordinates or a modulo29 check.

As one fixed direct-consumer probe, the straight line from the short-ID pixel (400,171) to the 3301 pixel (486,456), reading each newly crossed nonuniform cell, selects p32 offsets **[51,62,73,84,85,86,97,98,109]** and the original GP transliteration **D-IA-B-J-S-P-B-J-A**. This is not readable native prose. Its reverse is the same unreadable sequence backwards. The source does not direct a line traversal; this is recorded only as a limited output test, not a reason to search all paths.

## Research decision

The strongest new source observations are the **short-ID pixel selecting THE**, the exact **y171 = original FOLD GP-prime sum171** under an already published address rule, and the image's **HELLO/GOOD LUCK vertical-band reflection about y170**. The preexisting word-map route ends on authentic solved END through still-opaque FOLD/SB, while the two signed numbers also pass p32 mod29 fixed-point checks. The direct [complete-book word-code decoder](lp2-2016-word-as-codeword-p32-tile-original-inverse.md) failed independently. No authentic unknown plaintext, deciphering opcode or key is yet recovered. Before transferring it to any unsolved ciphertext, one needs an independently grounded instruction establishing the short key-ID representation, an operation that consumes the two selected GP runes, and a predictable held-out plaintext consequence. Do not extend with arbitrary orientations, salts, extra number candidates or language-optimized paths without that missing instruction. The authoritative overall decryption status is unchanged.

**Reproduce:** run Node22 on [the CommonJS SFT](../sims/lp2_signed2016_p32_fixedpoints_sft.cjs); it reads the exact three checked-in original files, decodes the source JPEG pixels, isolates the actual visible THE word band, parses the JPEG's SOF dimensions, reconstructs both GP-prime axes, tests all five frozen integers, checks interior symbol counts and verifies two deliberately altered shadow-cell negatives. Its [manual-only workflow](../.github/workflows/agent7-signed2016-p32-fixedpoints-manual.yml) completed successfully on the original repository assets.
