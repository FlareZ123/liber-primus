# LP2 p0–p2 paired three-bar crosses: exact 180° reuse, no decipherment receiver

**Agent50, 21 November 2026. Director #2027. Original-image result with a negative exact-external-source / opcode gate. No unknown LP2 plaintext, key, cipher, or destination recovered.**

## Decision

The left and right black three-bar cross drawings on each of physical LP2 pp0–2 are **the same detailed raster artwork in opposite 180° orientations**. This conclusion is stronger than identifying the generic symbol as a papal/Salem or Russian Orthodox cross. The irregular ink chips, damaged upper tip, notches and intermediate bar reproduce when one drawing is turned upside down. All three consecutive original pages reuse the paired artwork. This is a real **source-layout involution**, but its repetition across a chapter makes it more consistent with an authored ornamental template than with a unique original-cipher operation.

An external, exactly matching pre-May-2014 illustration, plate or font was **not found in the bounded source set** below. Common cross classifications describe the symbol family without identifying the distinctive distressed print. No image-authored alphabet, traversal, rune inverse, or key is present; the exact 180° art operation by itself does not select whether to reverse symbols, lines, pages, letters or numerical values.

## Exact source and measured geometry

Original archive paths: `resources/liber-primus/17.jpg` (LP2 p0), `18.jpg` (p1), and `19.jpg` (p2). Native image size: **2400×3600** pixels.

| Source | Source SHA-256 | Pearson grayscale correlation, right cross unrotated | Right cross turned 180° | Ink-mask intersection/union after 180° |
| --- | --- | ---: | ---: | ---: |
| 17.jpg / p0 | `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e` | −0.062218 | **0.996917** | **0.987491** |
| 18.jpg / p1 | `f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f` | ≈−0.06 | **0.997325** | **0.988162** |
| 19.jpg / p2 | `74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34` | ≈−0.06 | **0.997325** | **0.988162** |

Measurements use grayscale and two fixed, equally sized **1276×490** pixel rectangles in original source coordinates (x0,y0,x1,y1, end exclusive):

- Left lower ornament: **(57,1684,547,2960)**.
- Right upper ornament: **(1853,640,2343,1916)**.

Rotate the second entire crop by 180° without scaling or translation (reverse both pixel axes). The small residual differences are JPEG raster noise/border placement. On p0, the rotated images differ by mean absolute grayscale intensity **0.971934 / 255**, versus essentially zero cross-correlation in the printed orientation. On p1 and p2, the rotated pair has mean absolute error **0.941072 / 255**, and the crops extracted from p1 and p2 are byte-identical to each other. The p0 and p1/p2 source scans differ slightly in their ornament JPEG pixels, but have the same drawn design and placement. The bottom infinity-like ligature also occurs in the same layout, giving an additional repeated ornament, not a source-selected cipher key.

**Exact read-only SFT:** [`sims/lp2_p0_triple_cross_180_source_sft.py`](../sims/lp2_p0_triple_cross_180_source_sft.py), requiring Pillow and NumPy. The script SHA-256-checks all three original JPEGs before reading the prescribed crop coordinates; it checks low unrotated correlation and high rotated correlation and ink-mask overlap. It reads the originals without rewriting them.

## Historical source search and false friends

The following public reference classes were compared with the complete original three-bar geometry, looking for distinctive distressed stroke linework, a plate caption, or source-authored orientation rather than the generic three-bar silhouette:

- Pre-2014 heraldic vector [`CrossOfSalem.svg` (Wikimedia Commons, 2010)](https://commons.wikimedia.org/wiki/File:CrossOfSalem.svg): a genuine three-bar cross, but its bar proportions and clean vector linework are not this original distressed image; it gives no LP2-specific operation.
- The [Getty Art & Architecture Thesaurus papal-cross entry](https://www.getty.edu/vow/AATFullDisplay?find=Hand-made+paper&logic=AND&note=&subjectid=300010076) and older [Christian symbol taxonomy](https://www.freemasonry.bcy.ca/symbolism/cross/index.html): establish general papal/Salem/Orthodox distinctions, but no exact pictorial match or cipher reading.
- [The Uncovering Cicada Wiki artwork inventory](https://uncovering-cicada.fandom.com/wiki/Symbols/Drawing/Art_of_Liber_Primus) already suggests “Russian orthodox Cross or papal cross” on the opening pages. That is a community shape classification, not source attribution or a solved cipher instruction.
- Targeted public image/text searches for papal cross, Cross of Salem, hand-inked/woodcut three-bar crosses, upside-down crosses and Liber Primus page art surfaced generic symbols, later commentary, and modern illustrations; no independently dated original plate with matching distress marks and an explanatory caption.

This is a **bounded negative** on the named searched resources, not proof that no external source survives. The exact repeated drawing might have been copied from an unindexed pre-2014 image, but none of the located sources specifies a cryptographic operand or receiver.

## Consequence for research and next decision

The image itself prescribes a 180° rotation **between the two cross decorations**, reproducibly and three times. It does **not** prescribe rotating an LP2 rune (which may cease to be a rune), reversing the rune sequence, reading bottom-to-top, changing the GP alphabet, altering a key schedule, or moving to another page. Those would be additional analyst choices. The p0 title's separate red13/divider/large-marker geometry has independent physical adjudication and already tested cipher consumers; this report does not reopen any of them.

**Director fork: no new cipher branch.** Preserve exact cross-rotation and chapter-template reuse as a source-visible graphical constraint. Reopen exact external-source attribution only if a dated matching image with distinctive linework or an authenticated instruction supplies a **typed**, uniquely determined original-cipher operation with a withheld prediction. Do not launch arbitrary 180° rune/permutation/Atbash menus from decorative inversion alone.
