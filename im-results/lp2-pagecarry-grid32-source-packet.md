# Thirty-two original page-carried words as a 32×8 table packet selector

**Agent29, 14 November 2026; Director #830. Classification: source-shaped exploratory packet extraction, with one direct-output negative. No recovered LP2 plaintext, historical key, validated decoder or destination.**

## Independent physical inputs and exact selector

The original unknown manuscript has **32 actual rune words carried across physical page breaks** when original text is parsed continuously. Two further words have a trailing separator on the following page but **no new-page rune**, and therefore are not genuine carries; counting those would incorrectly produce 34. The pp49–51 numeric grid contains **exactly 32 printed rows by eight columns**, representing 256 independently transcribed two-character cells. This numerical equality suggests one packet grammar without fitting ciphertext: **the ith genuine carried word selects grid row i; the number of runes on the right side of that page break (1–7) selects column (length − 1).** The right-fragment lengths in source order are:

```text
5 2 2 2 6 2 5 1 2 5 1 2 3 2 1 2
4 1 2 2 3 1 2 2 1 7 3 4 1 1 5 1
```

The resulting 32 table tokens in row order are:

```text
1b 49 3M 3I 1K 1O 1Q 4E 4F 1s 2M 3e 1C 13 1D 3v
20 0A 3U 0X 3C 40 2B 2a 00 27 06 0x 18 1k 0M 1r
```

This selector is **complete and deterministic** for these 32 original page-carry packets. It does not discard any rune from the original chapter and it handles genuine page-crossing words correctly. The left-side fragment lengths range from 1 to 10, so the right side is the uniquely simple length coordinate that fits the printed eight columns without modular reduction. The choice of using right-side length is still a hypothesis: the author has not instructed the solver to join these two objects, and most ordinary page carries also have short right fragments.

## Output and a contemporaneous numeric consumer

Use the working table's provisional positional-base60 numeral conversion as printed in `resources/liber-primus/lp2-grid-256.json`. The selected 32 bytes are:

```text
61 f9 ca c6 50 54 56 fe ff 72 8e dc 48 3f 49 ed
78 0a d2 21 c0 f0 83 9c 00 7f 06 3b 44 6a 16 71
```

Exactly **14/32** bytes are printable ASCII (range 0x20–0x7e), and the stream has no coherent direct English/UTF-8 message. Since a 32-byte result could also be key material, failure to read ASCII does not exclude every possible use. The provisional base60 alphabet and byte interpretation are not signed instructions.

The independently attested historical **sum-of-GP-primes per word** suggests a second, narrowly defined potential numeric input. The 32 carried-word prime sums are:

```text
300 305 335 115 331 155 318 677 178 167 155 632 336 508 452 130
407 260 193 383 387 364 568 208 237 399 632 374 517 161 704 521
```

Applying three fixed natural byte operations to each table byte with its own word's prime sum produces:

| Frozen readout | Original 32-byte hexadecimal | Printable ASCII bytes |
| --- | --- | ---: |
| Direct table | `61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671` | 14 |
| XOR prime sum's low byte | `4dc885b51bcf685b4dd515a418c38d6fef0e135e439cbb4cedf07e4d41cbd678` | 12 |
| Table minus prime sum (mod 256) | `35c87b5305b918594dcbf364f843856be10611a23d844bcc13f08ec53fc95668` | 13 |
| Table plus prime sum (mod 256) | `8d2a19399bef94a3b1192954983b0d6f0f0e93a0435cbb6ced0e7eb1490bd67a` | 12 |

All four outputs are unlike readable ASCII and lack an obvious plaintext signature. XOR and ± are **exploratory** consumers with no printed/signed opcode selecting them; only the plain row/column extraction follows from the proposed page-carry coordinate grammar. No cipher was fitted to unknown text. Reversibility applies to extracting/reconstructing the 32 packet values against the original table; no claimed inversion exists for the complete 12,956-rune ciphertext.

## Reproduce, decision and limitation

Run [`sims/lp2_pagecarry_grid32_packet_sft.cjs`](../sims/lp2_pagecarry_grid32_packet_sft.cjs) with Node 22 from the repository root. It reparses the complete original source including page-crossing words, distinguishes the two false positive carries, checks all 32 row/column addresses, records all selected token and byte values, and performs an exact 32-byte planted table-record retrieval using the same frozen selector. The original table's transcription and base60 serialization remain provisional as described in its resource metadata.

This coincidence is a possible **source-addressed 32-byte value**, not an authenticated 256-bit key or plaintext. It cannot yet meet the Director #830 requirement of an independently selected **full-chapter variable-delimiter inverse with ≥100 held-out original plaintext runes**. Further byte scrambling would need a specific authentic operator or independently attested key use. Do not optimize column offsets, hashes, ciphers, or byte permutations to force a message from these 32 values.
