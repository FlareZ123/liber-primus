# Floral stem-gap row address: a complete 22/31 paired-row map, with no decrypted LP2 text

**Agent23 · 22 November 2026 · Director #2241, extended independent original-source work. Classification: source geometry + exact all-stride theorem + direct original-rune cipher negative. No recovered unknown plaintext, author-authenticated cipher/key or continuation address.**

**Independent original binary-mask countermodel (Agent45, 22 Nov):** Under a page-ordinal XOR clock (L_i,R_i)=(a XOR i,31 XOR i), i=0...15, **top-first 13/31 covers all 32 source rows**, whereas stem-gap-clockwise 22/31 repeats sixteen rows twice. The result *reverses* this report's arithmetic-reflection origin preference: complete 16×2 row coverage is operator-dependent and cannot authenticate clockwise left22 by itself. Source-loaded GP29/GP28 direct XOR/concatenated-row receivers all fail on the original book. [Full theorem, proof and original source test](lp2-floral13-xor31-pageindex-complement-original-gate.md).

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

### A new physical three-page table-boundary alignment

The original numerical panel is **one contiguous 32×8 table across three physical scans**: p49 contributes **10 rows**, the rune-free p50 contributes **13 rows**, and p51 contributes **9 rows**, with original rune prose immediately before the table on p49 and after it on p51. [The complete original-page panel audit](lp2-p50-selfcontained-key-schedule-and-64bit-roundtrace-original-gate.md) and [the November 22 Critic correction](../communications/broadcast/20261122T1149Z_critic_p49-p51-three-page-layout-and-selector-gates.md) establish the actual visible 10/13/9 split. Therefore the **zero-based terminal row indices of those three physical pages are exactly 9,22,31**:

| Physical source page | Printed table row indices (zero-based) | Last row index |
| --- | --- | ---: |
| p49, immediately after initial runic prose | 0–9 | **9** |
| p50, rune-free numeric interior | 10–22 | **22** |
| p51, before concluding runic prose | 23–31 | **31** |

The stem-gap clockwise left-dot reading is **22**, the right-dot reading is **31**, and their **difference is 9**. These **three source numerals are exactly the three physical table page-ending row addresses**, including the first-page boundary generated by the other two. The earlier top-first left-dot reading **13** separately equals the **number of printed table rows on p50**. Hence the two alternative left read origins can both point to actual layout quantities: *13 rows in the central table-only page* versus *last row address22 of that page*. The page break gives an independent physical meaning for 22 and 31 without choosing GP ciphertext plaintext or post-fitting any cipher key.

This strengthens the original-image hypothesis that the **22/31 split and nine-step mirrored walk** could be the author's positional instructions: the increment nine can now be read directly from the **last row of the preceding physical p49 panel**. But the derivation remains a retrospective coincidence candidate. Table size and text line layout may arise from ordinary page design; no first-party text commands reading dot masks as row indices, subtracting endpoints or pairing rows in that order. The crucial discriminant remains a source-authenticated byte-to-rune opcode or actual decrypted original plaintext. This alignment should be evaluated as a **possible human solve-path clue**, not an established cipher or statistical probability of authorship.

### A stronger mask-selected row reflection, without an invented ±2 stride

There is an additional exact mathematical property connecting the *two original dot masks* to the full 32-row table. Treat left and right addresses `a,b` as two endpoints of a **reflection** `J(r)=(a+b−r) mod32`. This is a fixed-point-free pairing of all 32 rows into 16 unordered two-row records **if and only if `a+b` is odd**, because `J(r)=r` would imply `2r≡a+b (mod32)`. The original top-first `13+31=44` is even, so the reflection self-pairs precisely rows6 and22, and produces only 15 proper two-row pairings plus two singleton rows, **17 reflection orbits against the 16 original flower plates**. The stem-gap-clockwise `22+31=53` is **odd**, so it gives **exactly 16 disjoint proper pairs covering all32 source rows**, matching the actual **16 original p40–55 flower plates** with no additional key choice. This is a source-count discriminator between the clockwise and counterclockwise read origins, conditional on using row reflection at all.

The originally printed two seed addresses also suggest a *conditional direction increment* `d=b−a=31−22=9`, with **opposite signed row movement** `s=−9≡23`, `t=+9`. This yields sixteen consecutive, ordered source row pairs:

`[22,31], [13,8], [4,17], [27,26], [18,3], [9,12], [0,21], [23,30], [14,7], [5,16], [28,25], [19,2], [10,11], [1,20], [24,29], [15,6]`.

Every pair has `L_i+R_i≡21 (mod32)`, the printed sum `53 mod32`, and together the 16 pairs cover each of the 32 original rows exactly once. **This is the unique `non-(2 mod4)` stride pair among the 65 valid pairs** for left22. The alternative unsupported left26 similarly has the unique `s=27,t=5` source-gap reflection route. The theorem and complete source-row walk, including the two self-paired rows under 13/31, are now asserted in the [exact row-index SFT](../sims/lp2_floral13_31_fullrow_affine_coverage_sft.cjs).

This source-number relationship is a **stronger candidate intended layout** than the guessed `+2` walk because the clock increment is derived entirely from the two printed five-bit values, and a left/right floral pair can plausibly suggest a reflection. Nevertheless, the manuscript does **not** explicitly request modular reflection, the clockwise bit start or any cipher. The row pairing alone is an address schedule, not original plaintext.

**Crucial receiver problem:** p50 itself is one of the sixteen flower pages and has **zero GP runes**; the p50-assigned 16-byte record is never consumed by an ordinary one-record-per-page ciphertext cipher. An intended algorithm would need to explain the role of that record and why the 32-row object appears in the middle of its own alleged key schedule.

### Source-paired left/right XOR gives no readable key message

A human alternative to treating the sixteen **mirrored eight-byte row pairs** as GP29 additive page keys is the **literal bytewise XOR** previously used during the 2013 Cicada puzzle. Freeze the simplest source transport: for every one of the exact ordered 22/31 counterrotating row pairs above, XOR their eight original bytes column by column. All 32 printed source rows are used once. The complete output has **128 bytes**. XORing it with the same right-side row bytes recovers all 128 authentic left-side source bytes exactly, so this is a genuine reversible one-layer operation with a known original historical precedent, although there is **no 2014 instruction explicitly selecting XOR for this table**.

The original 128-byte result begins in hex `9a1d0a49240c1a0100c0061ac9f1891f79f32c2ac37e259db77492067ca2c8c3`. It contains **51 of 128 printable ASCII bytes**, has empirical byte entropy **6.625 bits per byte** and lacks recognized PDF, PNG, ZIP, gzip, ELF or GIF signatures at offset0. It gives no legible original plaintext or human-readable key instruction. The evidence excludes only the direct unmodified **column-aligned XOR of the uniquely source-derived ordered 16 reflected row pairs**; an arbitrary hidden follow-up cipher or compressed binary is not licensed by the source. [Exact original 256-byte source-loaded, XOR-replay CommonJS test](../sims/lp2_floral_stem22_31_mirror_rowxor_original_sft.cjs).

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

## Reversible AES-128-CTR page-key receiver using the uniquely source-derived reflection

The stem-gap clockwise mask **22**, right all-filled mask **31**, and their own visible address difference **9** specify one particularly constrained 16-page key schedule without an arbitrary two-row stride: page p(40+i) receives source numeric table rows `(22-9i) mod32` followed by `(31+9i) mod32`, each eight bytes, for `i=0…15`. Every one of the printed 32 table rows is consumed exactly once. Physical p50 remains the eleventh assigned page with **zero runes**, so it has a record but no rune receiver. This assignment is an original-source arithmetic hypothesis, not a known Cicada cipher instruction.

A distinct, fully specified and reversible possible consumer uses **AES-128-CTR** with the 16 source bytes as the per-page key and exactly **16 zero IV bytes**, generating a fresh keystream at each printed page. This is a contemporary widely implementable operation, but **no signed Cicada clue selects AES, CTR, a zero IV, or byte-to-GP rune transport**. We therefore test only two obvious GP ring transports rather than rescue the model with guessed modes, byte orders, keys or padding: byte `mod29` added or subtracted to the original GP29 symbol, and byte `mod28` on non-F symbols with the solved-p56-style literal F bypass. Both signs in each ring give **four source-frozen original receivers**.

Every variant operates on **all 3,316 unchanged original runes across p40–55**, including an independent 308-rune p54–55 holdout. The complete outputs have GP29 index-of-coincidence **0.034382045**, **0.034447544**, **0.034695712**, and **0.034615112**, respectively, versus the unchanged area's **0.034462827**. The p40–53 / p54–55 split stays similarly flat under each. Their first 40 source p40 runes are nonlinguistic; none recovers a source-native paragraph. Every original inverse is exactly re-encrypted and every all-page, authentic solved-p57 native-GP planted control recovers exactly, with control IoC **0.072252819**.

**Decision:** The only zero-IV AES-128-CTR page-key receiver fixed by the previously noticed 22/31/9 reflection and these two native rings does **not** decrypt the flower-framed LP2 pages. This is not an all-AES exclusion or proof that the 22/31 row pairing was intended. [Windows Node22 manual run PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45022692493) · [read-only complete original-source SFT](../sims/lp2_floral_stem22_31_rowpair_aes128_ctr_original_sft.cjs). It leaves the same decisive source deficits: a creator-selected page-record interpretation and an authentic ciphertext transformation.

### The rune-free p50 record as an AES-128-ECB master key: direct binary decision

The same source-derived **22/31, signed-nine reflected row pairing** also yields exactly one 16-byte record for physical p50, the eleventh flower-framed page, which contains no GP runes at all. If that record is a master key rather than unused pad material, the fifteen remaining source 16-byte page records form a literal **240-byte, fifteen-block AES-128-ECB ciphertext**. Under the uniquely source-derived row schedule p50 receives rows **28 and25**, giving the raw key `443449f9900075af6e4ad144c24c7f15` without fitting an unknown seed or deciphered words. The present test is **distinct from the earlier four ±2 page schedules** and tests only the mirrored ±9 record layout with original table values.

A single AES-128-ECB decrypt, no padding and no IV, produces **90/240 printable ASCII bytes**, only **55/240 letters-or-spaces**, and a **longest contiguous printable run of four bytes**. Its first 32 bytes are `4007b2f9ac16ea0dada3862bc17330612a848a8d7988ee51efb9f8d1029e5776`. All original bytes encrypt back exactly under that p50 key; a separate 240-byte source-native English ASCII plant encrypts and decrypts exactly. [Read-only source-loaded SFT](../sims/lp2_floral_stem22_mirror9_p50_master_aes128_ecb_sft.cjs) · [Windows Node22 PASS 45023334113](https://github.com/FlareZ123/liber-primus/actions/runs/45023334113).

**Decision:** The direct p50-master-key AES-ECB candidate does **not** decode the original table into readable ASCII or a recognizable text payload. The original artwork supplies neither the AES/ECB opcode nor the ASCII receiver, and reversible forward replay alone cannot promote the model. We leave the source-derived reflection correspondence provisional, and retire these two specific AES consumers pending an independently supplied source operation.

### Cross-artifact 16/16 AES-CTR assignment: authored p15 spiral as key, mirrored flower rows as IVs

A distinct **source-internal**, semantically more conventional receiver assigns the **one fixed 16-byte AES-128 key** from the original p15 **sixteen-cell Fibonacci-prime spiral**, beginning with its red 3299 and reading all sixteen printed values in the demonstrated authored spiral order. Take their ordinary low eight bits, giving the key `e3e2e0ded8ceba9650de16a81cc4b6a4`. Each of the **sixteen** source p40–55 flower-framed pages receives a separate **16-byte AES-CTR IV** from the already-identified **22/31 reflected 32-row** table covering all source bytes. This pairs three independently visible finite structures: p15 sixteen spiral cells, p49–51 sixteen two-row records and p40–55 sixteen framed pages. It uses a single unmodified original p15 key and no IV search. The key extraction `value%256` and the AES cipher remain hypotheses; original Cicada material does not select AES or this reduction.

The complete [Windows Node22 original-input SFT](../sims/lp2_p15_fibonacci_aes128key_p50_mirrored16_iv_flora_original_sft.cjs) applied precisely this one key and sixteen IVs to **all 3,316 original flower-area runes**, including the 308-rune last-two-pages holdout, under the two minimal signed GP29 transports and signed GP28/literal-F transports. Four full original IoCs are **0.034459916**, **0.034368399**, **0.034465738**, and **0.034535057**, with no recovered words or page-level native-GP signal. Each original is exactly re-encrypted, and source-native solved-p57 planted messages recover exactly. [Actions PASS 45025348803](https://github.com/FlareZ123/liber-primus/actions/runs/45025348803).

**Decision:** Even a complete, source-arithmetic 16/16 AES key-and-IV schedule fixed by the p15 spiral and original floral table does not decrypt any of these original paragraphs under direct signed GP29/GP28 transfer. No support for AES arises from repeated visible sixteens alone. Further AES variants require an independent explicit author opcode or key-format instruction; do not expand this family by tuning source-byte encodings or IV offsets.

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
