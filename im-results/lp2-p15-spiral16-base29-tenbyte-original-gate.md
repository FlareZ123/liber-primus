# P15's original 16-cell spiral as a lossless ten-byte binary transport

**Agent 1, 23 November 2026. Conditional source-to-payload test, six complete source-faithful inverses.** No original unknown LP2 plaintext, key, compressed document, continuation address or source-authenticated new cipher has been recovered. This is a bounded test for [Director #2336](https://github.com/FlareZ123/liber-primus/issues/2336), not evidence that the creator intended this serialization.

## Why this is a fresh, finite, human-visible binary candidate

The *original* physical LP2 p15 scan \`32.jpg\` prints a **4×4 number square**. The already-recovered outward center-red spiral has zero-based cell order

\`[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]\`

and reads exact values \`3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516\`. Its first-party shape and order are not conjectured. The immediately following uninterrupted illustrated chapter, physical **p16–22**, contains exactly **1,744 unchanged GP29 runes**, in seven physical pages of lengths \`[267,273,260,271,269,273,131]\`: **1,744=109×16**. The 2013 signed Cicada TCP exchange independently demonstrates positional **BASE29** number conversion, although it does not say to use it here.

A simple proposed operation is therefore to group *all* p16–22 runes into **109 consecutive source-order 16-rune blocks**, lay each in a 4×4 square, read it through p15's outward spiral, treat the resulting GP ordinal digits as a big-endian base29 integer, and serialize to the shortest **fixed lossless field of 10 bytes**. We also admit the unchanged printed order and a counterclockwise center-first spiral, with forward/reversed digit travel, as six explicit rival readings. **No byte offset, extra padding, alphabet-fitting, key guessing, selected page subset, deletion, or omitted glyph is allowed.** This is *not* a direct whole-chapter integer or printed-word field codec: both have already failed separately.

The critical unsupported premise is the transfer from a numeric 4×4 drawing to **consecutive rune groups**, and the choice to interpret the output as file bytes. Exact divisibility and historical knowledge make this affordable to test but are not an authored framing command.

## Reversible codec and original-source output

Each 16-digit GP block is an integer in \`[0,29^16−1]\`; its integer fits in exactly 10 unsigned big-endian bytes because \`29^16 < 256^10\`. Keeping field boundaries makes the conversion invertible even for leading zero rune indices. The inverse reads each 10-byte number, rejects out-of-range values, expands it to exactly sixteen base29 digits and puts the digits back in the original 4×4 positions. **All 1,744 original rune ordinals are recovered exactly** for all six cases. The final original page contributes its entire 131 runes through the continuous chapter stream; page boundaries are not discarded.

| 16-rune block read order | Digits | First ten result bytes (hex) | Printable ASCII/whitespace |
| --- | --- | --- | ---: |
| Printed 4×4 row-major | Forward | \`22650d3842114774a755\` | 37.98% |
| Printed 4×4 row-major | Reverse | \`0a97f21f5b13b4ed3479\` | 38.53% |
| Original center-out clockwise | Forward | \`0742184e5b888433c165\` | 38.99% |
| Original center-out clockwise | Reverse | \`1d79eda3ac7f0c737b89\` | 40.64% |
| Center-first counterclockwise | Forward | \`067f927bcb387e45cc1d\` | 37.06% |
| Center-first counterclockwise | Reverse | \`3383167e058fb86844b1\` | 38.81% |

Every output is exactly **1,090 bytes** in 109 fixed ten-byte fields. No case starts as gzip, PDF, bzip2, PNG, ZIP, RIFF or ELF. Their low printable fractions and random-looking initial bytes are unlike directly visible prose; no typed complete original file is identified.

### A stronger key-independent capacity obstruction

The maximum possible **first byte in *every* ten-byte field** obeys

\`floor((29^16−1)/256^9) = 52 = 0x34\`.

This holds for **every one of the 29! secret permutations of the GP alphabet**, every 16-cell traversal, and every possible source block of 16 GP symbols, as long as the stipulated positional-base29 / ten-byte encoding is kept. Consequently a standard **binary OpenPGP packet** (first octet at least \`0x80\`), a \`BZh\` **bzip2 header** (first octet \`0x42\`), PNG (\`0x89\`), ZIP (\`0x50\`), RIFF (\`0x52\`) or ELF (\`0x7f\`) **cannot** begin at any ten-byte frame boundary in this codec, no matter what unknown page plaintext or secret rune relabeling is posited. The first original frame bound is 52, and all 109 actual output frame heads comply. No alphabet fitting could repair this format mismatch. **Gzip \`0x1f\` and PDF \`0x25\` are numerically possible**, but neither appears at offset zero in any of the six actual source-directed readings.

This is a mathematical impossibility **for this precise lossless field representation**, not a claim that LP2 cannot contain compressed/encrypted binary under another representation or that the raw ciphertext is random.

## Positive controls, reproducibility and decision

The [standalone source-exact Node22/CommonJS reproducer](../sims/lp2_p15_spiral16_base29_tenbyte_original_sft.cjs) checks p15's actual 16 values and cell order, reads canonical source p16–22, round-trips **all 1,744/1,744 original rune symbols** in every reading, and independently round-trips a sixteen-rune passage from *genuinely solved* p57. A **real ten-byte RFC1952 gzip header** \`1f8b0800000000000003\` fits below \`29^16\`; the same codec reconstructs those bytes from a synthetic 16-rune block and the unchanged file-magic detector recognizes the header under each orientation. This is a **header-recognition** positive, not a claim of synthetic full-file decompression.

**Decision:** the exact 16-rune, ten-byte, original p15 spiral-to-direct-file hypothesis fails on the complete adjacent p16–22 original. It is not an authenticated serialization instruction, and no direct typed payload emerges. The strongest output is the **all-alphabet frame-header exclusion** above, which should prevent a future costly 29!-permutation attempt to force standard OpenPGP or bzip2 at this exact ten-byte clock. If a new first-party instruction selects a byte register with a different width or a preceding value-changing transform, test that *newly typed operation*, preserving the source group boundaries and exact forward inverse. No ciphertext grammar or secret key is inferred from this negative.
