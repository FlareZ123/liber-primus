# LP2 pp49–51 tree-dot fill asymmetry and an ITA2 reading: visual lead, no decryption

**21 November 2026, Agent9. Classification: original-art observation plus a conditional historical-code interpretation; not a recovered plaintext, key, or author-selected operation.** This is kept in workplace rather than promoted to established results. It is separate from the exact [p50 H/G carry and ASCII IV](../im-results/lp2-p23-red-midpoint-p50-factor-bridge.md) channel.

## Source-visible signal

The original JPG scans [66](../resources/liber-primus/66.jpg), [67](../resources/liber-primus/67.jpg) and [68](../resources/liber-primus/68.jpg), book pages49–51, repeat the **same tree border** around the entire 32×8 =256 base60-byte table. The five-dot ornaments on the two sides are *not* ink-mirrors:

- **Left of table:** quincunx with two intentionally hollow circles (top center and bottom left) and three solid black circles (middle left, middle right and bottom right).
- **Right of table:** five solid black circles at the homologous positions.

Reading each five-dot cluster in ordinary printed-row order (top center, middle left→right, bottom left→right), with hollow=0 and filled=1, produces **01101** on the left and **11111** on the right, consistently on all three original pages. The same left code follows from clockwise ordering starting at the top; reversing travel direction yields a different left value. The byte table has 32 rows, so 5-bit binary row codes are visually shape-compatible. The adjacent p49 red ten-square delimiter is an additional separate mark; it has not supplied a reliable code or decoding direction.

## Concrete ITA2/Baudot clue hypothesis

In the documented 5-bit [International Telegraph Alphabet 2 table](https://www.dataip.co.uk/technical-information/the-baudot-code/) (Baudot-Murray, not every historical five-bit alphabet), **01101=F** and **11111=LTRS** (return to letters mode). The paired original ornaments therefore have a literal possible reading **F / LTRS**. That is suggestive because GP29 uses the special F rune and the independently solved LP2 p56 totient cipher has a transparent-F rule. This remains a **retrospective choice of 5-bit codebook and scan order**, not an authenticated instruction to apply F skipping to the unsolved pages.

## Immediate source-length tests

The obvious direct decoder treats the unchanged 256 table bytes as a 2048-bit row-major stream of MSB-first binary digits, groups 5 bits into **409 ITA2 codes plus 3 residual bits**, starts in letters mode, and obeys the native FIGS/LTRS shift controls. It yields **8 FIGS, 8 LTRS and 11 NUL**, plus incoherent text beginning **BKWGKCWEXYJCQUBWWKKCESQGZMMHABENG**. The raw-printed-byte LSB-first bit-order rival yields **11 FIGS, 9 LTRS and 13 NUL**, and gibberish beginning **GKWVRQNIPXCGCHUSXVV**. Both directions lack basic English segments THE, AND, FOR and ING. Applying the literal left five-bit XOR mask (13) to each consecutive packed code likewise yields no English start or readable message. No key, reset, or heldout stage is inferred.

A second direct, source-shape alternative assigns already available GP29 ciphertext indices to ITA2 values (unchanged or shifted by the visible three filled dots) and decodes the authentic p49 66-rune and p51 92-rune prose. Both outputs remain incoherent. The +3 ITA2 variant begins **VYCAQBF** on p49 and **RRTAVQZHN** on p51. The source therefore does **not** support direct native Baudot decoding of either the printed byte table or adjacent rune lines.

## Research decision

The genuine new source fact is the repeated asymmetric fill of two five-dot groups, not a secured Baudot signal. Preserve the exact F/LTRS reading only as a **low-cost, clue-constrained hypothesis**. Future work needs an original historical instruction specifying the five-dot ordering and codebook, or a prospective original ciphertext decoder yielding sustained GP plaintext. Do not turn this into arbitrary 5-bit rotations, masks, symbol remappings or crypto sweeps; those would amplify the same post-selection problem as the p50 ASCII-IV lead.
