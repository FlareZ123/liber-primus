# Thirty-two original page-carried words as a 32×8 table packet selector

**Agent29, 14 November 2026; Director #830. Classification: source-shaped exploratory packet extraction, with one direct-output negative. No recovered LP2 plaintext, historical key, validated decoder or destination.**

## Independent physical inputs and exact selector

The original unknown manuscript has **32 actual rune words carried across physical page breaks** when original text is parsed continuously. Two further words have a trailing separator on the following page but **no new-page rune**, and therefore are not genuine carries; counting those would incorrectly produce 34. The pp49–51 numeric grid contains **exactly 32 printed rows by eight columns**, representing 256 independently transcribed two-character cells. The numerical equality motivates one packet grammar without fitting ciphertext: **the ith genuine carried word selects grid row i; the number of runes on the right side of that page break (1–7) selects column (length − 1).** However an [independent original chapter-conditioned boundary control](lp2-pagecarry-grid32-chapter-layout-null.md) finds that 32 page carries are entirely typical under the book's nine visible chapters and ordinary printed line wraps (**32 observed; 32.572 expected; exact lower-tail p=0.4824**). The matching counts alone no longer support an authored row-to-word linkage. The **same nine-chapter original line-wrap null** also shows that all 32 carried right fragments fitting 1–7 columns has conditional probability **0.450568** given exactly 32 crossings, because only 11 of 594 original line-wrap gaps have a right fragment longer than seven. The naturally fitting eight-column width is therefore ordinary under the observed printed layout. The right-fragment lengths in source order are:

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

All four outputs are unlike readable ASCII and lack an obvious plaintext signature. A separately frozen, more direct **2014-type repeating-key GP29 Vigenère** consumer takes each candidate byte mod 29, resets phase to zero at both complete original terminal pages, and applies both conventional signs. On p54 the subtraction/addition outputs have IoC **0.0373563 / 0.0338857**; on p55 they have **0.0333333 / 0.0308772**. Their first thirty runes are nonlinguistic, and each direction reverses exactly. Mod-29 byte reduction is **not authenticated by the printed table**, so this rejects only this conventional one-pass consumer, without treating a generated key value as authenticated. XOR has a genuine prior-round Cicada precedent: the 2013 Twitter and first-onion stages explicitly XOR supplied binary artifacts (including 560.13 and 761.mp3). That authenticates XOR as a historical operation, but no 2014 LP2 source selects it for this 32-byte packet or this table. The ± byte operations remain exploratory and have no printed/signed opcode. No cipher was fitted to unknown text. Reversibility applies to extracting/reconstructing the 32 packet values against the original table; no claimed inversion exists for the complete 12,956-rune ciphertext.

## Historical XOR consumer gate (bounded negative)

The [2013 Twitter-stage walkthrough](https://github.com/neuroretransmit/cicada/blob/master/2013/003-twitter/README.md) and [2013 first-onion walkthrough](https://github.com/neuroretransmit/cicada/blob/master/2013/004-first-onion/README.md) document XOR between supplied binary artifacts, including 560.13 and 761.mp3. The original [2013 0_wisdom source](https://github.com/neuroretransmit/cicada/blob/master/2013/002-3301/rootfs-modified/0_wisdom) also contains the explicit word **MOBIUS**. These are genuine earlier-round clues, so four direct XOR consumers were frozen. They do not prove that LP2 reuses XOR or that this 32-byte packet is a key.

1. **One selected byte per 32×8 table row.** XOR each row's eight table bytes with that row's selected carry byte. This yields 256 bytes, but has exactly 32 NULs because each selected byte is XORed with itself. Only **81/256** bytes are printable ASCII; entropy is **6.8113 bits/byte**. There is no readable text or recognizable file signature. The zeros are a guaranteed consequence of extraction, not a positive signal.
2. **Repeated 32-byte key over the 256 terminal runes.** Encode each of p55/p56/p57's 256 runes as its canonical GP29 index (0–28), then XOR with the 32-byte carry packet repeated eight times. This yields **118/256** printable bytes, one NUL, 104 high bytes, and entropy **7.0464 bits/byte**. The output is not readable ASCII. Reducing the output bytes modulo 29 gives no coherent GP text, and the known clear p57 segment is not preserved as plaintext.
3. **The 256-cell table as a row-major pad.** XOR each terminal GP29 index with the corresponding p49–51 table byte in the canonical row-major order. The 256-byte result has **105/256** printable bytes, no NULs, 129 high bytes, and entropy **7.0774 bits/byte**. It is not readable.
4. **The table as an alternating-row (Möbius-snake) pad.** Motivated by the 2013 MOBIUS source word, reverse every odd table row before applying the same one-byte-per-rune XOR. The output has **106/256** printable bytes, no NULs, 129 high bytes, and entropy **7.1408 bits/byte**. It is not readable. The word MOBIUS does not itself authenticate this exact serpentine traversal.

All four transforms are exactly reversible and the reproducer checks the inverse. Invertibility is not evidence that the key or layout is intended. These tests reject only the four fixed, simple consumers above. No AES, RC4, nonce, IV, padding, hash-derived stream, arbitrary byte permutation, or additional traversal was searched: the 2013 sources document XOR, not an LP2 instruction selecting any of these consumers. A contemporaneous 2014 IRC question about AES is solver speculation, not an authored instruction.

## Reproduce, decision and limitation

Run [`sims/lp2_pagecarry_grid32_packet_sft.cjs`](../sims/lp2_pagecarry_grid32_packet_sft.cjs) with Node 22 from the repository root. It reparses the complete original source including page-crossing words, distinguishes the two false positive carries, checks all 32 row/column addresses, records all selected token and byte values, and performs an exact 32-byte planted table-record retrieval using the same frozen selector. The original table's transcription and base60 serialization remain provisional as described in its resource metadata. All checks, including the planted 32-byte retrieval, direct GP29 consumer, and the four historical-XOR consumer gates, are reproducible with the script. The prior CI run [43568064016](https://github.com/FlareZ123/liber-primus/actions/runs/43568064016) predates the XOR extension; the added XOR calculations were independently recomputed against the same canonical source files.

This reproducible positional packet is a possible **source-addressed 32-byte value**, not an authenticated 256-bit key or plaintext. Its exact 32-to-32 cardinality is unremarkable after conditioning on genuine chapter boundaries and printed line wraps; only an independently motivated addressing rule or successful original decoder can establish its relevance. The 2013 XOR precedent justified four fixed tests, but all four failed to produce plaintext and no 2014 instruction selects the consumer. It still cannot meet the Director #830 requirement of an independently selected **full-chapter variable-delimiter inverse with ≥100 held-out original plaintext runes**. Do not optimize column offsets, hashes, ciphers, or byte permutations to force a message from these 32 values.
