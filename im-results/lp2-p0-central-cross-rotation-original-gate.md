# LP2 p0: exact 180-degree cross duplication and a source-fixed first-chapter reverse test

**Agent 26, 14 November 2026.** Classification: a newly measured original-image geometry and one bounded original-cipher negative. **No unknown plaintext, creator-selected cipher key, or intended continuation recovered.**

## Original source and player-visible operation

The original physical LP2 page **p0**, archive **17.jpg**, is a 2400×3600 JPEG of exactly 695,525 bytes, SHA-256 \`197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e\`. It shows two distinctive **three-bar crosses** to either side of the rune text. The lower-left cross has horizontal bars that become progressively longer downward. The upper-right cross has their lengths reversed.

These are effectively **the same artwork rotated by exactly 180 degrees about the image's geometric center**. This is a literal source-visible reversal, rather than only a semantic association with inversion. The original two cross-bearing rectangular windows, as [left, top, right, bottom] pixel edges, are:

- Lower-left: \`[57, 1684, 547, 2960]\`.
- Upper-right: \`[1853, 640, 2343, 1916]\`.

They are 490×1276 pixel windows, geometrically related by \`(x,y) → (2399−x,3599−y)\` in zero-based original image pixels. Thus their copied placement also preserves the exact central inversion, rather than merely using two similar drawings at unrelated page locations.

Grayscale Pearson correlation after applying the indicated transform is **0.996917457** over all pixels, and **0.945755487** over the union of pixels darker than 210. Mean absolute grayscale difference is **0.971934** over the full paired rectangles and **3.3005** over their ink union. Against the same bounding boxes, the original untransformed, horizontal-only and vertical-only comparison correlations are respectively **−0.061126, 0.386508, 0.188893**. The difference is consistent with reusing one illustration with 180-degree rotation and lossy JPEG compression. This finding selects an exact *visual reversal*; whether it instructs the reader to reverse the ciphertext is unproved.

## First original-cipher decision using this reversal

The first visual chapter is original **pp0–2**, exactly **262+266+201 = 729 GP29 runes**. A separately surviving **4 February 2015** solver dialogue selected a precise candidate transformation on this first chapter: prime shifts beginning with prime3 and an imagined GP-F with prime2, then successive modular differences. This operation is documented with the dated original witness and fully reproduced in [the existing first-chapter report](lp2-2015-prime-delta-40-doublet-source-inversion.md). Its original forward reading has **40** equal adjacent transformed rune pairs from 728 opportunities, with an almost uniform marginal distribution and no plaintext.

If the p0 two-cross artwork instead selects a literal 180-degree reading direction for that complete 729-rune tape, the bounded hypothesis is **reverse all 729 unchanged original ciphertext runes once, and apply the same independently specified prime/difference operation**. Freeze the first-prime convention, fictitious-F initial state, arithmetic sign and full source body. No alphabet or phase search is performed. Formally, for either source order \`C[0..728]\`:

\`\`\`text
S[-1] = (0 - 2) mod 29 = 27
S[i]  = (C[i] - prime[i+1]) mod 29, with prime[0]=2
D[i]  = (S[i] - S[i-1]) mod 29
\`\`\`

The inverse is \`S[i]=(S[i−1]+D[i]) mod29\`, then \`C[i]=(S[i]+prime[i+1]) mod29\`; it restores every original rune. The trial reads both complete \`D\` tapes as one big-endian positional BASE29 integer, expressed in **443 bytes**, as previously tested for the forward original by Agent14. This direct binary reading is a source-era operation but still not explicitly prescribed for LP2.

| Frozen first-chapter reading | Derived adjacent equals | GP29 IoC | First 32 big-endian BASE29 bytes |
| --- | ---: | ---: | --- |
| Original physical order, historical control | **40 / 728** | **0.034504590060** | \`16701bee70c4b19d90abf1d05127911a06105c711f6cd4623ca8cc1c2063ea0b\` |
| **180-degree reverse order, new source-fixed trial** | **21 / 728** | **0.035024646136** | \`0a498603cc1fff37bd8eb44cff86fd940f4824f547c7e25ef28de715777b6bd8\` |

The reversal **does not preserve or improve** the historically unusual 40-doublet feature. Both outputs remain near the uniform GP29 coincidence baseline **1/29 ≈ 0.034482759**, far from the native-GP English controls in this repository. The reversed 443-byte frame begins \`0a49...\`: it has no GZIP, bzip2, PNG, ZIP, PDF, or OpenPGP packet header at byte zero. This check excludes only those direct first-byte container interpretations. It is not a proof that the bytes contain no encrypted or otherwise framed information.

## Result, scope and next decision

The **centrosymmetric artwork placement** is an independently confirmed original-image property that a 2014 player could notice. It is a more specific original clue than an inferred symbolic reading of the crosses. The **decoder is still missing**: no signed instruction, word key, reversible GP29 output operation or authentic plaintext is fixed by the visual symmetry. When combined with the one independently attested first-chapter prime/difference candidate, the literal reverse-original option fails the precise high-doublet check and has no natural plaintext or file header.

Preserve the original artwork fact as a potential reading-direction cue only. **Retire this exact reversed-first-chapter prime/difference plus positional-BASE29 direct-file route**. Any additional rotation, sign, offset, secret alphabet or cipher layer requires a genuinely separate original selector.

**Reproducer:** [read-only Windows-friendly original JPEG and corpus SFT](../sims/lp2_p0_central_inversion_source_sft.py), requiring Pillow and NumPy; it checks the original JPEG's SHA-256, all four image orientations, source ciphertext counts, both complete reversible transformations, derived-rune statistics, fixed BASE29 prefixes and a 729-rune positive plant from the independently solved p57 source. No existing source file or illustration is edited.
