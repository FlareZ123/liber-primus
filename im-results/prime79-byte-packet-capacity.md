# Exact 47-byte capacity obstruction in the 79/78 radix-28 model

**Agent 23, 10 November 2026.** Source-original, key-independent, bounded negative. No unknown Liber Primus plaintext, historical cipher, key, or destination recovered. This excludes a fixed independent **47-byte unsigned binary integer per complete 79-rune output packet** under either fixed secret predecessor-excluding cyclic or sorted 29-rune alphabet. It does not exclude general binary plaintext intermediates, lossless continuous bitstream packing, per-packet IV/salt models, or variable-size transport.

## Exact bound and why it is source-independent

The previously surviving 79/78 model emits 79 radix-28 digits, each represented by a GP29 rune different from its immediately preceding published glyph. For an independently packed 47-byte unsigned integer \`0 <= n < 2^376\`, the most significant base-28 digit satisfies

\`d0 = floor(n / 28^78) <= floor((2^376 - 1) / 28^78) = 2\`.

Consequently, regardless of the unknown 29-symbol key order:

* **Cyclic predecessor-excluding order:** any fixed preceding ciphertext glyph has at most **three** possible successors for a leading digit, corresponding to differences of 1, 2 or 3 in the hidden cycle. A preceding glyph with **four or more different successors** across clean packet starts makes the model mathematically impossible.
* **Sorted predecessor-excluding order:** the emitted first glyph must be among the **first four symbols** of the unknown fixed order. Removing one predecessor can shift a glyph's rank by at most one. At least five distinct observed leaders make the model mathematically impossible.

These are necessary conditions for every 47-byte packet, independent of source language, randomness, file signature, serialization endianness, candidate plaintext and all subsequent 78 output digits.

## Authentic original-source test

Source: \`resources/liber-primus/lp2-corpus.json\`, physical unsolved pages 0..55, skipping rune-free p50, concatenated into exactly 12,956 rune indices. For **every 79 packet phase 0..78**, test both normal and reversed digit order. The reversed case uses the last original consecutive glyph transition in each packet as its leading-digit transition. A packet is discarded if any of its 79 output transitions repeats the preceding glyph, granting the strictly nonrepeating model the benefit of the doubt at all observed zero-step positions. The first start at global source offset zero is also discarded because the predecessor is unknown.

| Source-original diagnostic across 158 phase/direction cases | Result |
| --- | ---: |
| Minimum, across cases, of the maximum distinct successors after one leading predecessor | **5** (model permits at most 3) |
| Minimum distinct leading glyphs across cases | **25** (sorted model permits at most 4) |
| Case exclusions | **158/158 cyclic**, **158/158 sorted**, hence **316/316** |
| Source-global phase 35, forward | **95 clean packets**, maximum **7** successors, **28** distinct leading glyphs |
| Source-global phase 35, reverse | **95 clean packets**, maximum **7** successors, **28** distinct leading glyphs |

This is an **exact nonexistence proof of the specified frame representation** for all fixed 29! unknown orders. It does not require solving a CSP and it remains valid when repeat-bearing original packets are ignored.

## Positive and exact forward check

\`node sims/prime79_47byte_packet_capacity.cjs\` (Node 22, CommonJS, no extra packages) reproduces all source-original measurements and runs a blind synthetic positive on each of the four orientation/order types. Seed \`0x23094779\` shuffles the secret 29-glyph order and draws 163 independent unsigned 47-byte integers, then encodes each exactly into 79 base-28 digits at phase35 with predecessor exclusion, plus an arbitrary 35-glyph prefix and 44-glyph suffix. The decoder reconstructs the **same 163 integer values** using only the secret key and generated ciphertext. The cyclic plants satisfy the maximum-three-successor necessary condition; sorted plants satisfy the four-leader necessary condition.

The result refines the open **binary-intermediate** alternative: any source hypothesis that packs independent 47-byte integers directly into 79 radix-28 output digits cannot be historical LP2 under these conventions. A continuous binary stream chunked in 378/379-bit ranges, a separate 79-symbol salt field, a changed order per packet, an independent key state, or other byte framing still requires its own source-constrained original inversion and is untouched by this exclusion.
