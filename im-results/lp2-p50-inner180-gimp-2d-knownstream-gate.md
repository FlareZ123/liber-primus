# GIMP 2.8 source row-field as a p50 terminal 256-byte pad: known180 inverse

**15 November 2026, Agent 10. Original-input negative with twelve exact planted inverses.** No previously unknown Liber Primus plaintext, destination, or historical encryption key has been recovered.

## Why this could have recovered page 55

The original p57 illustration contains a strongly supported pre-2014 GIMP 2.8 Dissolve generator fingerprint. Independently, the p50 printed number grid is a **32×8 array of 256 bytes**; shedding its one-cell rectangular circumference leaves a **30×6 = 180-byte core**. Its perimeter has **76 cells**, the length of unknown p55. The independently solved p56 (**85 native GP runes**) plus clear p57 (**95 native GP runes**) provide exactly **180 source-known** terminal symbols.

A physically direct conditional route is that the original byte grid masks those 180 known and 76 unknown GP values using the GIMP image generator's row-synchronized 32×8 byte field. If the actual table obeyed that relationship, its border could be decrypted into a complete unknown p55 plaintext, using no p55 crib or guessed key. The artwork supports the existence of the GIMP generator, **not** the claim that the generator keyed the table. In particular, the mayfly's fitted pixel crop offset is not an original table coordinate and has not been transferred here.

## Source-prescribed generator and original known-plaintext outcome

Use the historical GIMP seed **314159265**, a 4,096-element MT row-seed table, and fresh MT output for each printed table row. The exact first eight master seeds are 3721122731, 618219707, 807213306, 3144837749, 3447982176, 3230631767, 755972506, 1398685501. Row zero begins with raw 32-bit output 505524582, 4277517655, 1702989131, 912900261, 1432505218, 4108960502, 2270003630, 316039421. The **actual historical GLib g_rand_int_range(0,255)** first-row bytes computed as output mod255 are **87,10,191,6,133,152,5,71**, independently verifying the exact software field. A raw low-eight-bit projection is an explicit alternate source-byte reading.

For either eight-bit field, decode original table bytes with a literal XOR, subtraction or addition modulo256. For both original 180-symbol known registers, **solved p56+p57** and **printed p56+p57**, test all **12 deterministic original inputs**, with no word phase, fitted geometry or hidden parameter. The strongest single readout matches only **2/180** independent genuine known rune values. The other eleven match zero or one. Full 180/180 known-rune agreement is mathematically required to identify the pad and decrypt p55. Thus **none of these twelve GIMP-derived original-mask candidates is valid**.

Each of the twelve operators was also applied to a planted **complete 256-rune source-native record** using the authentic 180 known ending runes in the core and **76 independently clear GP runes withheld at the perimeter**. All twelve positives decrypt **180/180 inner plus 76/76 border values**, establishing exactly what would have constituted genuine page-55 recovery under each fixed mechanism.


## Original illustration-selected GIMP crop field (Agent9, 16 November 2026)

The recovered original p57 mayfly source coordinates offer a distinct physical origin that the initial unshifted experiment above deliberately left unresolved. The original native mayfly crop begins at source-cell (178,487); the historically reproduced GIMP field is translated (-154,-484). Thus the **first visible native image source cell maps to GIMP field (x24,y3)**. This source-derived anchor permits one frozen crop transfer to the separate 32x8 p50 table, with eight successive GIMP values from original x24..31 for each of the 32 source rows y3..34. The new model keeps the exact old 256-cell field, its 30x6=180 inner recipient, the 76-cell perimeter, both printed and solved p56 input registers, and 2014 GIMP GRand seed 314159265. Only the independently obtained source-image crop anchor changes; there is no offset search.

The canonical 2014-era byte variants are each seeded from original GIMP MT row seeds and use raw output mod255 or raw low byte. For the source table's 180 original interior bytes, exact independently known GP symbols under the three standard fully reversible byte operators are:

| Fixed source-crop key + known 180 recipient | XOR | Subtract | Add |
|---|---:|---:|---:|
| historical GRand range255; solved p56 + clear p57 | 0/180 | 0/180 | 0/180 |
| historical GRand range255; printed p56 + clear p57 | 0/180 | 0/180 | 1/180 |
| raw low byte; solved p56 + clear p57 | 1/180 | 1/180 | 2/180 |
| raw low byte; printed p56 + clear p57 | 1/180 | 2/180 | 1/180 |

All 12 fail the necessary 180/180 recovery gate. A source-shaped planted byte table under each exact operator recovers all independently assigned 180 known and all 76 held-out perimeter GP symbols. The extension therefore eliminates the *specific original-image-selected crop transfer* as the missing p55 key, while retaining the genuine software-image relationship. No authentic p55 plaintext, source-authored numeric-page consumer, or intended final destination was recovered. The GIMP-native crop supplies a legitimate physical selector but does not itself establish that the table consumes that image field. Avoid fitting nearby offsets.

[Reproducible read-only source SFT](../sims/lp2_p50_gimp_illustration_crop_known180_sft.py) · [Original image reconstruction](lp2-p57-native576-gimp-heldout-original-image.md).

## Decision

Retire this **one source-selected GIMP fixed-row field and two standard byte projections** as a direct numerical-table pad, without inferring that other GIMP-based steganographic mechanisms are absent. The original mayfly remains evidence of software rendering, and the table's 76+180 partition remains a geometry clue without a demonstrated historical cipher operation. Source-linked model expansion requires an original instruction selecting a coordinate offset, a different producer, or a real key.

[Standalone original-input source SFT](../sims/lp2_p50_inner180_gimp_2d_knownstream_sft.py), using NumPy RandomState to reproduce pre-2014 GLib's MT init_genrand output, the canonical 256-byte table SHA-256, both authentic p56 registers and all twelve invertible planting controls. [Successful Windows Python 3.12 / NumPy 2.2.6 CI run 43657005818](https://github.com/FlareZ123/liber-primus/actions/runs/43657005818).
