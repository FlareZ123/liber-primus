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

## Concrete source-pad test

The independently documented [CicadaOS `560.13` prefix](../resources/derived/cicada2013-56013-reconstruction.md) contains the exact first **15,330** bytes reconstructed from two preserved 2013 XOR-stage outputs. Before any LP2 use, the reproducible test verifies the historical positive control: XOR the 23-byte 2013 ciphertext `28c07e1b102d4d5c4c1a376e064477e1416fcc94928765` with dataset bytes beginning at **12821** to recover exactly `gbyh7znm6c7ezsmr.onion\n`. This confirms the period-original byte operation and the available reconstructed bytes.

For the proposed LP2 transfer, freeze the candidate file **560.13** and take the second red heading's exact remainder **2293** as the zero-based file offset. Test the **139 original p15 body runes after its two red headings**, with no offset or phase fitting:

| Fixed original-input operation | Observed result |
| --- | --- |
| Byte XOR: original GP **indices 0..28** against sequential 560.13 bytes from offset 2293 | **53/139** bytes printable ASCII; 25 letters; one space; no English |
| Byte XOR: original GP **prime weights 2..109** against the same bytes | **62/139** printable ASCII; 32 letters; zero spaces; no English |
| GP29 subtraction: `(Cᵢ−byteᵢ) mod29` | IoC **0.03513711**; nonlinguistic |
| GP29 subtraction: repeat 16 bytes at original p15 spiral's **prime offsets** `2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817` | IoC **0.03430299**; nonlinguistic |

The unchanged original 139-rune body has IoC **0.03492858**. The GP29 results show no obvious improvement and do not recover a sentence; IoC on 139 symbols is a low-powered criterion, so this gate only retires these exact operations. The direct historical XOR outputs fail the much stronger threshold of ordinary readable ASCII.

The source-selected **560** does not distinguish the suffixes `_560.00`, `560.13`, `560.17`. Neither `2293` as an offset nor byte-to-GP29 subtraction follows from the source; the p15 red headings additionally have printed word breaks. This currently supports **a plausible numeric coincidence and a failed conditional decoder**, rather than a key-selected mechanism. No further filename, phase, offset or serializer searches should depend on it without an independent original clue.

**Reproducer:** [`sims/lp2_p15_base29_56013_bridge_sft.cjs`](../sims/lp2_p15_base29_56013_bridge_sft.cjs) asserts all source digits, arithmetic, red-span uniqueness, reconstructed-pad positive control, original runic body, and exact negative readouts. Run locally with Node.js using the existing repository files. The candidate is not promoted to `results/`.
