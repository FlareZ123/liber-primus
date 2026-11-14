# The original LP2 numeral table and p53's red inscription share one exact cross-radix factor

**14 November 2026, Agent17. Classification:** new exact source-only factor intersection and a finite, failed attempt to consume its naturally sized quotients as GP29 keys. **No unknown-page plaintext, author-specified decryption operation, authenticated cipher key or final destination is recovered.** The GCD is a mathematical finding on a precisely stated numeral interpretation, not proof of intentional authorship.

## A plausible original puzzle path

The 2014 LP1 *A WARNING* explicitly treats the manuscript's **words and their numbers** as significant. The 2013 signed protocol gives an authentic BASE29 numeral example and the puzzle repeatedly uses prime arithmetic. Physical LP2 pp49–51 contain a peculiar printed **32×8 numerical table**, while physical p53 has an unusually long **51-rune red inscription** near the end of its **179-rune** page. These are source-visible numeric objects a contemporary solver might compare. A natural first reversible arithmetic operation on two large integers is their greatest common divisor.

Freeze the visible reading conventions before looking for a match:

- Table: decode each two-digit token using the repository's conventional 60-character base60 alphabet, in original row-major order; interpret the resulting **256 bytes as one big-endian base256 integer** `N`.
- Red inscription: interpret each original red runic span, without losing a rune or changing order, as a **big-endian GP29 integer** `R`, with F=0 through EA=28.
- Compute `gcd(N,R)` for **all 18 originally marked red spans**, including independently solved controls on p56/p57. Do not optimize shifts, substrings, radix, direction or a key.

### Exact source-specific outcome

The 51-rune red span at **physical p53, rune offset128**, is uniquely distinguished:

```text
gcd(N, R[p53 red]) = 358 = 2 × 179
179 is the 41st prime
N is divisible by 179², but not by 179³
R[p53 red] is divisible by 179, but not by 179²
```

**None of the other 17 original red spans has a GCD divisible by 179.** The largest other GCD is **56** (the p33 eight-rune span). Holding the same two literal integer definitions, three simple wrong-input controls destroy the shared factor: reverse only p53's red-runic order (**GCD 2**); reverse only the original 256 table bytes (**GCD 1**); or remove the otherwise unused `f` from the printed base60 digit ordering and interpret tokens with radix59 (**GCD 1**).

Independently, `f` is the **only missing low-position digit** in the printed 256 two-character tokens, with digit index **41** in the canonical 60-character alphabet. Therefore the separately computed 41st prime **179** is also available directly as a common factor from original table+p53 integers; one need not select it by guessing an unrelated modulus.

This exact intersection is more specific than an arbitrary matching length, yet there are strong caveats. The big-endian **base256 serialization** of the table and big-endian **base29 serialization** of the red phrase are researcher-selected interpretations, and the GCD operation is not explicitly ordered by a surviving Cicada instruction. In particular, the original BASE29 2013 worked numeral does not instruct using GP red spans and later 2014 table bytes as integer inputs to Euclid. Multiple source objects and reading conventions were considered by this research population before this result was found, so these are descriptive source coincidences, not a calibrated chance probability or proof of design.

## Does the shared factor reveal a usable source key?

The source gives three natural complete-length registers whose lengths match **unique unordered pairs of nonempty original physical LP2 pages**, independent of their ciphertext values:

| Table-derived candidate register | Exact length | Unique page-length-matched pair | Why it exists |
| --- | ---: | --- | --- |
| GF29 table quotient after dividing original descending polynomial by the authentic-era 2013 BASE29 quadratic and original p39 red quadratic | **251 GP29 symbols**, omitting the formal leading zero | **p15 (159) + p51 (92)** | Both quadratics divide the original 256-coefficient polynomial exactly |
| Same GF29 quotient with its leading zero retained | **252 GP29 symbols** | **p22 (131) + p32 (121)** | Fixed-width polynomial coefficient register |
| Big-endian byte integer `N/179²` | **255 bytes** | **p53 (179) + p55 (76)** | Exact historical-number and red-inscription common factor, with p55's recurring moth illustration |

The **255-byte table quotient → p53+p55** path had already been investigated in [the prior source-key test](../sims/grid179sq_255_terminal_bridge.cjs), with no authentic plaintext. The two other page-pairs are a new source-length comparison. The source does *not* explicitly instruct pairing nonadjacent pages, choosing additive GP29 or using polynomial quotients as keys.

A frozen, no-phase, original-input test subtracts or adds each complete candidate register modulo29, in source order and its complete reverse, against its paired **unchanged original ciphertext runes**. The same four variants are run for each length, with exact forward reencryption and a positive **95/95 solved-p57 native-runic** additive-control plant. All outputs are nonlinguistic:

| Register and paired original pages | Minimum decoded GP29 IoC | Maximum decoded GP29 IoC |
| --- | ---: | ---: |
| Q251, p15 + p51 | **0.033785** | **0.035283** |
| Q252, p22 + p32 | **0.032884** | **0.035540** |
| Q255 byte residue mod29, p53 + p55 | **0.034213** | **0.035881** |

All twelve remain near uniform GP29 ciphertext rather than source-native solved text. The Q251 primitive-root GP28 nonzero-step inversion was also independently tried with both signs, reversed key and page-reset alternatives, and its eight whole-pair IoCs were **0.03490–0.03576**, with no readable result. Those additional exploratory GP28 reads are not promoted as a new source-selected operation.

## Decision and next authentic-text criterion

**Established under the exact numerical representation:** among all original red inscriptions, only p53's long red span shares the source-visible prime factor179 with the table, with exact GCD358, and only that direction/original radix retains the factor under the specified controls. This supplies a bounded, internally consistent candidate for **source-selected arithmetic operands** and perhaps an original clue linking the table to the terminal moth section.

**Still missing:** a first-party instruction to form a big integer or GCD, a specific reversible cipher using its quotient, exact byte-to-GP transport, original initial state/clock, and an independently readable full passage. The matched lengths and source factor cannot be treated as a decipherment. The natural direct additive consumer fails, as do the previously tested 255-byte extensions. Any successor should obtain one of those missing original instructions or independently source-selected operations **before** implementing new cryptographic modes on these same numbers.

[Read-only original-source CommonJS SFT](../sims/lp2_p50_p53_red_gcd179_source_bridge_sft.cjs) asserts the SHA256 of the exact 256 table bytes, 18 red spans, all original runes and cross-radix GCDs, wrong-input controls, the exact GF29 quadratic quotient, all unique page-length pairs and twelve original-cipher reversible key-consumer tests. It requires only the three checked-in source JSON files and Node.js 22, and writes nothing. The source-exact numerical findings and twelve variants were independently computed from GitHub-fetched original JSON in the current JS runtime. A fresh stand-alone Node execution is not asserted.
