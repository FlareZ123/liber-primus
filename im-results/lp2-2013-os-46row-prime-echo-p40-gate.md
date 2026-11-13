# Source-clock challenge: 2013 Cicada OS prime-echo row endings and the LP2 p40–53 body

**Classification: one new, fully original-input, reversible source-shaped experiment; no recovered unknown plaintext, key, or authenticated transfer.** Agent 9, 13 November 2026. The independent arithmetic construction is exact; its interpretation as an intended Cicada encryption clock is a conjecture.

## Human-visible source route

The surviving 2013 Cicada OS has a byte-identical pair of binary files named `wisdom` and `folly`. Their original 3,368-byte body has SHA-256 `7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a` and is preserved offline at [the exact original byte resource](../resources/historical/cicada2013-wisdom-folly.b64). The independent source `prime_echo`, preserved at [the original Ash source](../resources/historical/cicada2013-os-original-prime-echo.sh), emits **464 consecutive primes up to 3301** in ten-prime printed rows, with **46 complete rows** and a four-prime tail.

The original LP2 p40 enlarged red heading contains exactly eight runes `[0,9,19,26,6,23,25,8]`, which select the standard historical eight-column order `[0,4,7,1,2,5,6,3]`. After this heading the original pp40–53 text is exactly **3,000 GP29 runes**. Thus, without fitting to plaintext:

| Source-only quantity | Exact value |
| --- | ---: |
| 2013 `wisdom`/`folly` bytes | 3,368 = 421 × 8 |
| 2013 `prime_echo` complete ten-prime rows | 46 |
| LP2 red heading / candidate column width | 8 |
| LP2 pp40–53 body | 3,000 = (421 − 46) × 8 |

A concrete, **hypothetical** clock is to group the binary into 421 consecutive eight-byte rows and delete one row for each ten-prime line-end `p` at zero-based row `p mod 421`. All **46 residues are distinct**, so this produces exactly 375 rows, or **3,000 original bytes**, with no hand-picked exclusions. The 46 zero-based row addresses in source print order are:

`29, 71, 113, 173, 229, 281, 349, 409, 42, 120, 180, 238, 312, 388, 21, 99, 171, 227, 309, 381, 28, 110, 188, 248, 320, 394, 49, 127, 205, 303, 369, 24, 108, 182, 252, 318, 5, 91, 161, 215, 293, 377, 52, 132, 234, 310`.

**Weakest premise:** no 2013 signed message, `prime_echo` script, or p40 original text says to take row-end primes modulo 421, discard binary rows, or use either OS file as an LP2 key. The OS boot script prints `prime_echo` but does not itself read `wisdom` or `folly`. The exact length fit may be coincidental. This is a hypothesis built from three independent authentic source counts, not an authenticated authorial rule.

## One fixed original-cipher inverse challenge

The unchanged p40–53 original cipher body and exact 2013 byte stream were tested in the following small, finite set. In every case both byte reductions are `byte mod alphabetSize` and `floor(byte × alphabetSize / 256)`; signs are ±; the key clock begins at the first surviving byte; no source offsets, key edits, target windows or English-optimised alignments are searched.

- **8 GP29 direct additive interpretations:** printed cipher body or undone heading-keyed eight-column order, both key reductions and both signs.
- **32 GP28 predecessor-exclusion interpretations:** same two layout states, both byte reductions and signs; equality of the current rune and predecessor maps to the fixed reserved rune `F` or `EA`, and either consumes or holds the key clock. The predecessor begins as the last original red heading rune.

Every experiment exactly re-encodes every input GP rune. Independent solved-p57 GP-native positive plants round-trip all 3,000 positions, with **plant index of coincidence 0.07210603534511503**. These controls establish implementation correctness only; they do not select this cipher family.

Across all **40** original-input interpretations, the complete 3,000-rune decoded IoC ranges from **0.03430654662665 to 0.03553073246638**. The largest result is the printed-order, `byte%28`, subtractive GP28-F-marker model holding its clock on 18 original repeats. That output begins `USEEEOENGTHTHGPEAIALNMMTHTHOAEL...` and does not continue as intelligible plaintext. The GP29-only family is **0.0343554518–0.0346426587**. These are ciphertext-like distributions and provide **no independently recognizable LP2 plaintext**. Original printed body contains 18 adjacent rune repeats; reversing the red8 columnar stage yields 101, matching the independent [source layer-order observation](lp2-p40-columnar-antirepeat-layer-order.md).

## Decision and scope

This closes the **direct additive / predecessor-exclusion** interpretation of this newly source-built 46-row-deletion clock on the authentic 3,000-rune p40–53 body. It does not exclude every use of the 2013 bytes, nonadditive transformations, different authenticated binary sources, or hidden historical instructions. Given the unselected row-deletion rule and negative direct consumers, do not expand to arbitrary delete sets, row permutations, nonce search, or ciphertext scoring.

The exact repeatable [standalone Node.js CommonJS SFT](../sims/lp2_2013_os_prime_echo_rowdrop_p40_sft.cjs) reads only three committed sources, validates 464 original prime announcements, 46 distinct modulo-row addresses, the binary SHA-256 and all original rune lengths; it executes the 40 complete inverses and confirms all original and solved-native round trips. The source was also run end-to-end in the connected JavaScript runtime with exact repository bytes and all assertions passed (the local mock supplied the independently documented SHA value; native Node hashes the actual binary directly). No GitHub Actions run was requested.

The more general alternative **3,368 byte = 8 header + 3,316 pp40–55 runes + 44 printed punctuation** and its negative complete original tests are already documented in [the independent 2013 punctuation-clock gate](lp2-2013-wisdom-p40-punctuation-clock.md). These are two different postulated clocks and neither authenticates the binary as an LP2 key.
