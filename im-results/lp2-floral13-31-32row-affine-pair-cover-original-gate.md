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

### A stronger mask-selected row reflection, without an invented ±2 stride

There is an additional exact mathematical property connecting the *two original dot masks* to the full 32-row table. Treat left and right addresses `a,b` as two endpoints of a **reflection** `J(r)=(a+b−r) mod32`. This is a fixed-point-free pairing of all 32 rows into 16 unordered two-row records **if and only if `a+b` is odd**, because `J(r)=r` would imply `2r≡a+b (mod32)`. The original top-first `13+31=44` is even, so the reflection self-pairs precisely rows6 and22, and produces only 15 proper two-row pairings plus two singleton rows. The stem-gap-clockwise `22+31=53` is **odd**, so it gives **exactly 16 disjoint proper pairs covering all32 source rows** with no additional key choice.

The originally printed two seed addresses also suggest a *conditional direction increment* `d=b−a=31−22=9`, with **opposite signed row movement** `s=−9≡23`, `t=+9`. This yields sixteen consecutive, ordered source row pairs:

`[22,31], [13,8], [4,17], [27,26], [18,3], [9,12], [0,21], [23,30], [14,7], [5,16], [28,25], [19,2], [10,11], [1,20], [24,29], [15,6]`.

Every pair has `L_i+R_i≡21 (mod32)`, the printed sum `53 mod32`, and together the 16 pairs cover each of the 32 original rows exactly once. **This is the unique `non-(2 mod4)` stride pair among the 65 valid pairs** for left22. The alternative unsupported left26 similarly has the unique `s=27,t=5` source-gap reflection route. The theorem and complete source-row walk, including the two self-paired rows under 13/31, are now asserted in the [exact row-index SFT](../sims/lp2_floral13_31_fullrow_affine_coverage_sft.cjs).

This source-number relationship is a **stronger candidate intended layout** than the guessed `+2` walk because the clock increment is derived entirely from the two printed five-bit values, and a left/right floral pair can plausibly suggest a reflection. Nevertheless, the manuscript does **not** explicitly request modular reflection, the clockwise bit start or any cipher. The row pairing alone is an address schedule, not original plaintext.

**Crucial receiver problem:** p50 itself is one of the sixteen flower pages and has **zero GP runes**; the p50-assigned 16-byte record is never consumed by an ordinary one-record-per-page ciphertext cipher. An intended algorithm would need to explain the role of that record and why the 32-row object appears in the middle of its own alleged key schedule.

## New direct original-rune decryption of the best source-shaped schedule

To test the candidate on **actual unknown text**, freeze a source-motivated direct receiver family with no hidden phase, guessed keyword, AES mode, byte reorder or plaintext fitting. Because the printed left/right floral twigs approach their respective dot clusters from opposite sides, include both minimal signed directions **+2 or −2 independently for each row lane**. Each of these **four minimal orientation pairs** covers all 32 rows exactly once. For each page, its 16-byte key is the literal left eight bytes followed by the literal right eight bytes; restart its key clock at the first original rune. Test the two algebraic cipher signs on two simple, fully invertible known-GP transport conventions:

1. **GP29 additive**: `P[i] = (C[i] ± (key[i mod16] mod29)) mod29`. Every original rune consumes one key byte.
2. **GP28 with F literal**: if original `C[i]=F=0`, preserve F and do not advance the key; otherwise rank the 28 non-F runes as 1–28 and add/subtract `byte mod28` in that ring. This is a strictly reversible model inspired by the independently authenticated p56 F-interruption convention; it is **not** the p56 prime-totient cipher itself.

Each output rune reverses exactly to the original ciphertext by the opposite sign, preserving all source positions and page widths. The test also encrypts a source-native p57 95-rune cleartext repeated across the **entire original p40–55 physical page layout**, then decrypts the plant exactly, including the rune-free p50 receiver. All **16** minimal orientation/ring/sign combinations and **four additional source-reflection/ring/sign combinations** are applied to all **3,316** original p40–55 rune positions, including p40–53 **3,008** and separate p54–55 **308** holdout positions.

| **+2/+2** direct transform (representative) | Original p40–53 GP29 IoC, 3,008 runes | Original p54–55 GP29 IoC, 308 runes | Full p40–55 IoC, 3,316 runes |
| --- | ---: | ---: | ---: |
| unchanged ciphertext | 0.03454262749 | 0.03382122763 | 0.03446282661 |
| GP29 subtract | **0.03434074924** | **0.03390583358** | **0.03435202419** |
| GP29 add | 0.03443273320 | 0.03363086425 | 0.03444681575 |
| GP28 literal-F subtract | 0.03461714333 | 0.03621134566 | 0.03454251702 |
| GP28 literal-F add | 0.03463151582 | 0.03432886332 | 0.03457890533 |

For the **20 orientation/ring/sign** candidates (the four ±2 minimal walks and the one printed-gap reflection), whole-book-area GP29 IoC ranges only **0.03426196311–0.03460110220**; the greatest is GP28/F-literal subtract with the mirrored left+2/right−2 walk. Every variant retains the uniform-looking original ciphertext distribution and remains far below the genuine solved p57 GP29 IoC `0.0627099664`. The four additional **stem-gap reflection** candidates with row strides23/9 produce whole-group GP29 IoCs **0.03452741587** (GP29 subtract), **0.03441715927** (GP29 add), **0.03454651973** (GP28 F-literal subtract), and **0.03448738872** (GP28 F-literal add). Each exact original receiver round-trips. None yields recognizable unknown plaintext. The no-plaintext result holds for the only counterrotating affine schedule fixed by the printed address difference. 

The GP29-subtract p40 prefix is `Y-D-IA-AE-W-EO-O-X-IA-F-T-EA-TH-C-P-I-S-U-F-IA`, without intelligible plaintext. No direct candidate recovers coherent previously unknown language. The [new Node22 source-loaded complete original SFT](../sims/lp2_floral_branch22_two_row_source_receiver_sft.cjs) asserts exact table bytes/digest, unique row coverage, all twenty no-plaintext aggregate results, complete original replay, and full solved-p57 synthetic plant recovery.

## Original source-static flower as one fixed 16-byte key

The exact same flower drawing repeats across all sixteen p40–55 plates. An independent, simpler interpretation does **not need a page-dependent key schedule**: the stem-origin clockwise mask 22 and unchanged right mask31 may select **one 16-byte key**, consisting of **original row22 concatenated with original row31**, namely `eb83a6af9028a751719eace6b424bd50`. Its uninterrupted use over all p40–55 avoids the arbitrary `±2` row stride and avoids assigning a separate key to the runeless p50 page. Its weakness is equally important: it leaves 240 printed numeric table bytes unexplained, and no source instruction calls this a key.

Test the same two reversible native GP ring hypotheses with the first-party p56-inspired F-transparent variant. Add the two genuine layout clocks as the only choice: **reset at each of the fifteen rune-bearing original flower pages** or **carry the key clock uninterrupted through all 3,316 GP runes**. Both cipher signs are tested. The resulting **eight** exact source-key decoders reproduce all original source runes when reversed and recover independent synthetic solved-p57 rune plants. Whole-group IoCs range from **0.03440260394777** to **0.03465168195886**, and no decoded original passage is intelligible GP prose. The highest IoC is GP29 addition with a continuous clock, still essentially unmodified original ciphertext.

| Ring, cipher sign | Reset at physical page | Continuous across flower pages |
| --- | ---: | ---: |
| GP29 subtract | 0.034559438 | 0.034477928 |
| GP29 add | 0.034440630 | 0.034651682 |
| GP28 transparent-F subtract | 0.034402604 | 0.034443359 |
| GP28 transparent-F add | 0.034453911 | 0.034406789 |

These are complete original-input negative results for one frozen static, source-origin-key hypothesis. Both true reading clocks preserve p50's **zero-rune** position without inventing a tick for its table contents. All recovered outputs were scored without tuning a key phase, row order, language reference or additional decryption. [Read-only source-loaded, planted-roundtrip CommonJS test](../sims/lp2_floral_branch22_static_two_row_key_source_sft.cjs). The evidence now disfavors the **simplest reversible GP29/GP28 use** of row22+31 as either a static or a page-rotating key, but cannot rule out a separately authored decoder instruction.

## Direct self-contained use of the otherwise orphaned p50 record

A stronger *internal-consumption* rival to the per-page GP-rune receiver grants the rune-free **p50 itself the master key role**. Under each of the four minimal **±2** paired-row walks, take the one 16-byte record allocated to physical p50 (`i=10`), and treat the other fifteen 16-byte records as an ordered **240-byte ciphertext**. The simplest independently decrypted-block operation available in 2014 is **AES-128 ECB without padding or an IV**. This makes the 256 original bytes a completely self-contained candidate: 16 key bytes and 240 ciphertext bytes. There is still **no creator-authenticated command to use AES or ECB**.

All **four** original stem-gap-key interpretations were actually decrypted with Node22's standard cryptography library. The recovered 240-byte messages are bytewise reproducible; encrypting each output under its own original record key exactly restores every source data block, and the same code round-trips an independent 240-byte readable ASCII plant.

| Original left/right table step | Physical p50 master key (16 bytes hex) | Readable ASCII-range bytes out of 240 | Longest consecutive printable run |
| --- | --- | ---: | ---: |
| −2 / −2 | `79ca0f2166893b57d3dcc631ec543823` | **98** | 5 |
| −2 / +2 | `79ca0f2166893b57e7210e7034fbf9f8` | **105** | 5 |
| +2 / −2 | `8e3ac9c1ad1c6f41d3dcc631ec543823` | **77** | 3 |
| +2 / +2 | `8e3ac9c1ad1c6f41e7210e7034fbf9f8` | **93** | 6 |

No model yields a legible text payload or an apparent human-readable instruction. This *direct self-key AES-128 ECB* consumer fails to turn p50 into an authentic recovered key or plaintext, although mathematically it gives a fully reversible use for all 256 table bytes. Do not rescue the theory with unselected IVs, cipher modes, padding variants or additional compression steps. [Read-only source-loaded CommonJS SFT](../sims/lp2_floral_branch22_p50_selfkey_aes128_ecb_sft.cjs).

## Research decision

The **stem-gap read adds a real visual motivation for 22** that the original top-first study lacked. It also exposes a concrete human route to an exhaustive 32-row allocation through `+2` parity walks. The alternate branch-tip direction13, 65 legal strides, the unused p50 receiver, and lack of any authentic encryption opcode remain decisive uncertainty. All twenty fixed-source row-walk GP additive receivers, including the four uniquely mask-reflected candidates, **fail on all 3,316 original runes**. The four source-block p50-master AES-128 ECB readouts independently fail to yield legible byte plaintext. They should not be retried with fitted phases, modes or padding. Prior direct 13/31 AES/TEA/GP29 experiments [also failed](lp2-floral-13-31-aes128-original-table-receiver.md).

Preserve this as a **conditional key-schedule candidate and a bounded original-cipher negative**, not genuine plaintext or a demonstrated Cicada key. A future advancement must provide a **first-party direction or typed byte-to-rune operation** that consumes the printed records, especially p50's record, and decrypts a new untouched passage. The table may instead be unrelated printed binary data.
