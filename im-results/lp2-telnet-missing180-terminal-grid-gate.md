# Missing 180 2013 telnet primes and the LP2 180-cell terminal interior

**Status (14 November 2026): source-motivated, unconfirmed connection with a decisive negative for one direct decoder.** The surviving documented CicadaOS 2013 telnet `primes` response lists the first 20 consecutive primes, skips the 180 primes of **ordinal indices 21–200**, and resumes at **p201=1229**. Original 2014 LP2 pp49–51 form a **32×8 = 256-byte** table with **76 exterior + 180 strict interior cells**. LP2 p55 has 76 physical ciphertext runes; solved p56 and p57 together have 85+95 = **180** known rune identities. The independent 2013 source thus provides a plausible reason a player might notice the *specific inner-table length*, but the equality does not specify a key, operand order or reversible operation.

## Independent source anchors and caveat

- [Archived 2013 CicadaOS telnet transcript](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md): `primes` output begins `2 3 ... 67 71 1229 1231 ...`. The source document reports missing primes from 73 through 1223. That particular copy ends at 3299 (p463); [another independent archive transcription](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/analysis/HINTS-NEVER-USED.md) includes 3301 (p464). They agree on the 180-prime omission; the sequence is documented by participants, **not authenticated by a surviving Cicada PGP signature**.
- The exact missing list comprises primes p21=73 to p200=1223, inclusive. The first visible after the gap, **p201=1229**, is also the original 2013 ID3 PARABLE's third clause GP-prime sum; the first clause sum is p205=1259 (visible after the gap), and the second is p173=1031 (missing). This three-way matching is **historically source-grounded but postselected as an encryption interpretation**. The ID3 PARABLE clause sums 1259, 1031, 1229 and product 1595277641 are already independently established in [source-register benchmark](../im-results/source-register-benchmark.md); no new plaintext is implied here.
- Original grid: `resources/liber-primus/lp2-grid-256.json` (physical pp49–51, blob of 256 bytes SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). Its strict interior is the rows 1..30, columns 1..6 in physical row-major order. The perimeter count is 76 and p55's original count is 76. `resources/liber-primus/lp2-corpus.json` fixes both known terminal pages.
- Do **not** count the 76+180 geometry and p55/p56/p57 lengths as independent statistical successes after using the table shape to derive them. In particular, no original 2013 instruction says to align the omitted prime run to this 2014 table.

## One frozen full-known-target test

Natural direct reading from historically demonstrated solved p56: form the ascending **180 omitted-prime totient steps** `(p_n−1) mod29`. Compare the 180 strict table interior bytes modulo29 to `knownRune[i] ± step[i] mod29`. Use the two historically distinct terminal representations: (A) **authentic known p56 plaintext** (85 GP runes, p56 F bypass exactly once at local index56) followed by p57's 95 clear runes; or (B) **as-printed p56 ciphertext** followed by clear p57. The source key and table order are frozen before comparison.

| Source-known target | Sign | Exact table slots | Minimum replacements required even allowing *any* permutation of table cells |
| --- | ---: | ---: | ---: |
| Authentic p56 plaintext + p57 | subtract | 8/180 | 46/180 |
| Authentic p56 plaintext + p57 | add | 4/180 | 47/180 |
| Printed p56 cipher + p57 | subtract | 4/180 | 43/180 |
| Printed p56 cipher + p57 | add | 5/180 | 46/180 |

The last column follows directly from the GP29 rune-value histogram mismatch and is invariant to **any traversal of the exact 180 table remainders** if the key is kept in its source ascending order. No tested mode recovers a complete source-selected known passage. These four finite negatives do **not** exclude non-additive transports, a different extraction of 256 table values, a differently clocked or keyed cipher, or a purposely missing-prime clue with no table role.

**Reproduce:** [standalone Node22 source-native SFT](../sims/lp2_telnet_missing180_terminal_grid_sft.cjs). It checks original byte source SHA256, verifies exactly 85+95 known terminal runes and authentic p56 text, derives prime ordinals, prints all four original-cipher comparisons and asserts the invariants.

## Next actionable fork

The missing-prime block supplies a first-party-era **source-selected 180-element operand**, so future work may use it **only** if an additional original clue chooses its decoder or an exact known plaintext match appears without tuning. A potential stronger explanation is an independently surviving 2013 shell source script showing *why* the primes were omitted; that would distinguish deliberate puzzle design from transport or documentation truncation. In the absence of this, do not increase free offsets and transpositions to rescue the direct negative. No unknown LP2 plaintext, complete p55 decoder, source-authenticated GP29 key or final destination recovered.
