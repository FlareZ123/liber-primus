# LP2 p15 red-heading BASE29 coincidence and CicadaOS 560.13 transfer gate

**Classification: exact original-input arithmetic and a bounded negative decoder test. No recovered unknown LP2 plaintext, authenticated key or intended continuation. Agent 5, 11 November 2026.**

## Why this route is attractive

The original LP2 physical page 15, archive `32.jpg`, is unusual because its top red heading leads immediately into the established [4×4 Fibonacci-prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md). Its numbers all satisfy `abs(3301 - prime(F_n+1))` over 16 distinct Fibonacci indices. The 2013 [signed TCP challenge](../resources/external/2013-tcp-server-signed-source.md) explicitly uses a BASE29 command and the number 3301 as the worked DH modulus. The earlier CicadaOS image really included datasets `DATA/_560.00`, `DATA/560.13` and `DATA/560.17`; the 2013 puzzle historically used those resources in bytewise-XOR stages. A transfer from a red heading through base29 to an older puzzle-supplied pad is therefore a specific human-plausible hypothesis worth a *single* original-cipher test.

The historical BASE29 command converts ordinary integers to base-29 strings. **Nothing in the authenticated command establishes that LP2 red headings are base-29 integers, that they should be reduced modulo 3301, or that their printed word boundaries should be discarded.** The operation tested here is a proposed extension, not a recovered source instruction.

## Exact source arithmetic

Read the original nine upper red heading runes at p15 offsets 0–8 in page order, and map them to the fixed zero-based GP29 indices:

```text
F U L M | A EA Y OE A
0 1 20 19 | 24 28 26 22 24
```

The bar marks an actual printed word boundary. Joining the two words yields the positional integer

`0×29⁸+1×29⁷+20×29⁶+19×29⁵+24×29⁴+28×29³+26×29²+22×29+24 = 29,553,734,724`.

- **Forward modulo 3301:** `29,553,734,724 = 3301×8,952,964 + 560`. This equals the common numeric stem of the three 2013 CicadaOS dataset names.
- **Reversed rune order modulo 3301:** the integer `12,401,468,363,364` leaves remainder **3298**, the second printed spiral number adjacent to red 3299. Reversal is a separate, unselected option.
- The lower red heading (p15 offsets 9–19, consisting of words 4+2+5 runes) has the forward positional integer `8,439,315,242,423,360` and remainder **2293** modulo 3301. Treating that remainder as a byte offset is a new, unselected hypothesis.

Among the **18** source-annotated red rune spans across all 58 physical LP2 pages (including the two solved pages), this top p15 span is the **only** one with remainder 560 in either the forward or reverse reading. This is a descriptive census and is **not** a significance estimate for the larger after-the-fact space of lengths, operations, target numbers and orientations.

## Source-pad inverse tests

The independently documented [CicadaOS `560.13` prefix](../resources/derived/cicada2013-56013-reconstruction.md) contains the exact first **15,330** bytes reconstructed from two preserved 2013 XOR-stage outputs. Before any LP2 use, the reproducible test verifies the historical positive control: XOR the 23-byte 2013 ciphertext `28c07e1b102d4d5c4c1a376e064477e1416fcc94928765` with dataset bytes beginning at **12821** to recover exactly `gbyh7znm6c7ezsmr.onion\n`. This confirms the period-original byte operation and the available reconstructed bytes.

**A source-constrained but unproven filename discriminator:** Invert the *entire* p15 4×4 source grid to its sixteen underlying prime values `2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817`. Among the three actual 2013 dataset suffix values **0, 13 and 17**, only **13** occurs in this fixed prime list. Intersecting the proposed **560** red-heading stem with this prime-membership rule therefore selects **`DATA/560.13` uniquely** among the historical CicadaOS files. This is a concrete two-part source-derived candidate selector: exact initial heading remainder plus the p15 square's independently established prime values. The unknown is whether a solver was actually instructed to use GP29 positional reduction followed by filename-suffix prime membership. In particular, the matching suffix was recognized retrospectively.

**Frozen historical-offset transfer to all 1,894 runes of the following section.** The contemporaneous third-onion walkthrough independently specifies **dataset 13 at zero-based offset 12821**. Use that *period-original* offset rather than guessing one from LP2 ciphertext. The entirety of the subsequent p15:9 through p22:end rune section contains **1,894 source runes** and fits into available reconstructed file bytes 12821 through 14714, inclusive. No free offset, key phase, or chosen subset of words is used. Results:

| Historical file offset 12821; original 1,894-rune section | Observed |
| --- | --- |
| Historical byte XOR with GP indices 0..28 | **702/1894 printable ASCII**, 404 letters, three spaces; nonlinguistic |
| Historical byte XOR with GP prime weights 2..109 | **688/1894 printable ASCII**, 393 letters, four spaces; nonlinguistic |
| GP29 subtraction/addition, key = file bytes mod29 | IoC **0.03451107 / 0.03442796**; nonlinguistic |
| GP29 subtraction/addition, key = floor(29×byte/256) | IoC **0.03452781 / 0.03447649**; nonlinguistic |

The original same-section ciphertext has IoC **0.03449490**. The period-native XOR operations fail to produce ordinary ASCII. All four ordinary modulo-29 transfers remain ciphertext-like, with no language or known-key recovery. This retires these *specific* serializations of the strongest independent-offset transfer, without excluding a different cipher architecture using the same file.

**Secondary speculative lower-heading-offset transfer.** For comparison, use the lower p15 red heading's modulo-3301 remainder **2293** as a proposed source-pad offset. This is less independently motivated than historical offset12821. Test the **139 original p15 body runes after both red headings** as a short diagnostic:

| Fixed original-input operation | Observed result |
| --- | --- |
| Byte XOR: original GP **indices 0..28** against sequential 560.13 bytes from offset 2293 | **53/139** bytes printable ASCII; 25 letters; one space; no English |
| Byte XOR: original GP **prime weights 2..109** against the same bytes | **62/139** printable ASCII; 32 letters; zero spaces; no English |
| GP29 subtraction: `(Cᵢ−byteᵢ) mod29` | IoC **0.03513711**; nonlinguistic |
| GP29 subtraction: repeat 16 bytes at original p15 spiral's **prime offsets** `2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817` | IoC **0.03430299**; nonlinguistic |

The unchanged original 139-rune body has IoC **0.03492858**. The GP29 results show no obvious improvement and do not recover a sentence; IoC on 139 symbols is a low-powered criterion, so this gate only retires these exact operations. The direct historical XOR outputs fail the much stronger threshold of ordinary readable ASCII.

The original **560** remainder identifies the historical numeric dataset family. The grid-prime suffix intersection conditionally selects **560.13**, while the *historical* offset12821 supplies one independent byte position. The proposed rules connecting LP2 red headings, suffixes and 2013 pads are still unauthenticated, and the exact transfer of this otherwise source-fixed material has failed on a long original section. The alternative **2293** offset remains speculative. The original red headings have printed word breaks; neither concatenation nor direct modulo-29 conversion is a confirmed cipher. No unknown LP2 plaintext or cryptographic mechanism is established. Additional pad scans need a new independent cue.

**Reproducer:** [`sims/lp2_p15_base29_56013_bridge_sft.cjs`](../sims/lp2_p15_base29_56013_bridge_sft.cjs) asserts all source digits, arithmetic, red-span uniqueness, reconstructed-pad positive control, original runic body, and exact negative readouts. Run locally with Node.js using the existing repository files. The candidate is not promoted to `results/`.
