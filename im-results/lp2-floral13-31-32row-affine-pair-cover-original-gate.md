# Floral stem-gap row address: a complete 22/31 paired-row map, with no decrypted LP2 text

**Agent23 · 22 November 2026 · Director #2241, extended independent original-source work. Classification: source geometry + exact all-stride theorem + direct original-rune cipher negative. No recovered unknown plaintext, author-authenticated cipher/key or continuation address.**

## The two observed objects

The original LP2 p40–55 share one identical flower illustration with **five outlined/filled dots on the left and five filled dots on the right**, all p40–55 pages retaining that exact fixed artwork. Original p50 scan `resources/liber-primus/67.jpg` has left sites in top → upper right → lower right → lower left → upper left order:

`[(398,1475),(425,1500),(421,1534),(380,1542),(367,1500)]`, with actual 11×11 dark-center counts `[0,121,121,0,121]` and binary `01101₂=13`. The right sequence is `11111₂=31`. These source marks and unchanged frame identity were established by [the earlier original-image study](lp2-floral-dot-masks-grid-row-original-gate.md), independently of this contribution.

The same source's p49–51 numeric field prints exactly **32 rows of eight base60 two-character tokens**, whose accepted conditional byte reading yields 256 original values. The **16** flower-framed pages can be paired with **16** successive two-row / 16-byte records. Neither the picture nor the 2014 source calls those bytes a key or specifies a cipher; the apparent dimensional match is a hypothesis.

## Newly observed original-ink start boundary

In original 2400×3600 scan `67.jpg`, the filament/branch leading into the **left five-dot cluster** ends at exactly **x=370, y=1520–1521**, the last dark pixels in the isolated branch-end search rectangle `300≤x<375, 1510≤y<1527` at grayscale threshold120. Its terminal falls **between** the upper-left **filled** site4 `(367,1500)` and lower-left **outlined** site3 `(380,1542)`. Both gap neighbors are close; the stem does not point unambiguously to a single petal. This differs from arbitrarily declaring the top dot the bit-reading start.

A person starting a circular five-bit read **at the natural filament gap** has two immediate choices:

| First dot after the stem gap | Order of original five site indices | Actual original binary bits | Readout |
| --- | --- | --- | ---: |
| **clockwise**, upper-left filled first | 4, 0, 1, 2, 3 | **10110** | **22** |
| **counterclockwise**, lower-left outlined first | 3, 2, 1, 0, 4 | **01101** | **13** |

The previously reported **top-first 13** remains genuine. The new **stem-gap clockwise 22** requires a visible origin convention, and puts the readout at an **even** row. The artwork has no directional arrow or printed “start here” instruction, so `22` is **a source-motivated alternative**, not a demonstrated intended key. The other rotation `26` has no corresponding natural stem-gap start in this reading. [The new original-JPEG Pillow SFT](../sims/lp2_floral_branch_stem_bit_origin_original_sft.py) asserts the exact mark-center fills, stem tip, and both directional readouts with untouched scan bytes.

## Exact all-stride 32-row cover test

For each p40–55 page index `i=0..15`, assign two eight-byte source table rows by constant independent strides `s,t ∈ {0,…,31}`:

`L_i=(a+s·i) mod32; R_i=(31+t·i) mod32`.

A **full-table paired-row schedule** must reference each of the 32 printed rows exactly once, with no collision or omission. The [original-table, source-independent test](../sims/lp2_floral13_31_fullrow_affine_coverage_sft.cjs) enumerates all 1,024 stride pairs for each distinct rotation or reflection of the actual left bitmap, with no ciphertext matching:

| Left seed | Independent stride pairs giving exact 32-row cover |
| --- | ---: |
| 13 (top-first; also stem-gap counterclockwise) | **0/1,024** |
| 11, 21 (other origin/direction choices) | **0/1,024 each** |
| **22 (stem-gap clockwise)** | **65/1,024** |
| 26 (another unselected origin) | **65/1,024** |

The right all-filled seed is always31. With the actual 13/31 reading, **every** independent constant-stride two-row-per-page attempt is impossible, including any hidden stride choice. The equivalent one-based seeds12/30 are impossible too. This does not exclude nonaffine table row arrangements.

For the stem-gap-clockwise **22/31**, the minimal positive disjoint progression `s=t=2` gives p40 row pair **[22,31]**, p41 **[24,1]**, p42 **[26,3]**, …, p55 **[20,29]**. Its sixteen 16-byte records use **all 256 source table byte cells exactly once**, with p40 record `eb83a6af9028a751719eace6b424bd50`. This is the simplest parity-complementary cover, an actual source-anchored **candidate key schedule**. Among the 65 possible strides, 64 have `s≡t≡2 (mod4)`. Nothing author-signed chooses `+2`, although it is the simplest positive stride that visits the two disjoint row parities.

**Crucial receiver problem:** p50 itself is one of the sixteen flower pages and has **zero GP runes**; the p50-assigned 16-byte record is never consumed by an ordinary one-record-per-page ciphertext cipher. An intended algorithm would need to explain the role of that record and why the 32-row object appears in the middle of its own alleged key schedule.

## New direct original-rune decryption of the best source-shaped schedule

To test the candidate on **actual unknown text**, freeze a source-motivated direct receiver family with no hidden phase, guessed keyword, AES mode, byte reorder or plaintext fitting. Because the printed left/right floral twigs approach their respective dot clusters from opposite sides, include both minimal signed directions **+2 or −2 independently for each row lane**. Each of these **four minimal orientation pairs** covers all 32 rows exactly once. For each page, its 16-byte key is the literal left eight bytes followed by the literal right eight bytes; restart its key clock at the first original rune. Test the two algebraic cipher signs on two simple, fully invertible known-GP transport conventions:

1. **GP29 additive**: `P[i] = (C[i] ± (key[i mod16] mod29)) mod29`. Every original rune consumes one key byte.
2. **GP28 with F literal**: if original `C[i]=F=0`, preserve F and do not advance the key; otherwise rank the 28 non-F runes as 1–28 and add/subtract `byte mod28` in that ring. This is a strictly reversible model inspired by the independently authenticated p56 F-interruption convention; it is **not** the p56 prime-totient cipher itself.

Each output rune reverses exactly to the original ciphertext by the opposite sign, preserving all source positions and page widths. The test also encrypts a source-native p57 95-rune cleartext repeated across the **entire original p40–55 physical page layout**, then decrypts the plant exactly, including the rune-free p50 receiver. All **16** minimal orientation/ring/sign combinations are applied to all **3,316** original p40–55 rune positions, including p40–53 **3,008** and separate p54–55 **308** holdout positions.

| **+2/+2** direct transform (representative) | Original p40–53 GP29 IoC, 3,008 runes | Original p54–55 GP29 IoC, 308 runes | Full p40–55 IoC, 3,316 runes |
| --- | ---: | ---: | ---: |
| unchanged ciphertext | 0.03454262749 | 0.03382122763 | 0.03446282661 |
| GP29 subtract | **0.03434074924** | **0.03390583358** | **0.03435202419** |
| GP29 add | 0.03443273320 | 0.03363086425 | 0.03444681575 |
| GP28 literal-F subtract | 0.03461714333 | 0.03621134566 | 0.03454251702 |
| GP28 literal-F add | 0.03463151582 | 0.03432886332 | 0.03457890533 |

For the full **16 orientation/ring/sign** family, whole-book-area GP29 IoC ranges only **0.03426196311–0.03460110220**; the greatest is GP28/F-literal subtract with the mirrored left+2/right−2 walk. Every variant retains the uniform-looking original ciphertext distribution and remains far below the genuine solved p57 GP29 IoC `0.0627099664`. The GP29-subtract p40 prefix is `Y-D-IA-AE-W-EO-O-X-IA-F-T-EA-TH-C-P-I-S-U-F-IA`, without intelligible plaintext. No direct candidate recovers coherent previously unknown language. The [new Node22 source-loaded complete original SFT](../sims/lp2_floral_branch22_two_row_source_receiver_sft.cjs) asserts exact table bytes/digest, unique row coverage, all sixteen no-plaintext aggregate results, complete original replay, and full solved-p57 synthetic plant recovery.

## Research decision

The **stem-gap read adds a real visual motivation for 22** that the original top-first study lacked. It also exposes a concrete human route to an exhaustive 32-row allocation through `+2` parity walks. The alternate branch-tip direction13, 65 legal strides, the unused p50 receiver, and lack of any authentic encryption opcode remain decisive uncertainty. All sixteen minimally oriented direct GP additive receivers **fail on all 3,316 original runes**, and should not be retried with fitted phases. Prior direct 13/31 AES/TEA/GP29 experiments [also failed](lp2-floral-13-31-aes128-original-table-receiver.md).

Preserve this as a **conditional key-schedule candidate and a bounded original-cipher negative**, not genuine plaintext or a demonstrated Cicada key. A future advancement must provide a **first-party direction or typed byte-to-rune operation** that consumes the printed records, especially p50's record, and decrypts a new untouched passage. The table may instead be unrelated printed binary data.
