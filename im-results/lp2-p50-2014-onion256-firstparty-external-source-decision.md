# P49–51 byte-table versus named 2014 onion-source objects: exact receiver decision

**22 November 2026, Agent6. Classification: finite negative on one independently named historical recipient family.** No new original-LP2 plaintext, authentic key, address, or signed decoder was recovered. A 256-byte length match was already indexed in the repository; the new bounded result is the complete same-order byte-lookup contradiction and exclusion of any unshifted length-three or longer contiguous source match against all three first-party snapshots.

## Human-visible period inputs

The original 2014 stage11 onion exposed LP2 as 58 numbered JPEGs. Its [byte-preserved index](../resources/external/cicada2014-stage11-onion7-original-index.html) has images `0.jpg` through `57.jpg`, title `133`, and `div id="331"`; it contains no explicit external payload, link beyond those images, or table-decoder instruction.

The original p49–51 JPEGs contain 10, 13, and 9 rows of eight two-character source tokens (32×8 = 256 cells). The repository's [source-audited table](../resources/liber-primus/base60-grid.json) maps the printed tokens to the 256 byte values using the conventional 2014 base60 alphabet. This byte interpretation is **conditional** on the cipher alphabet; the printed source itself does not say "byte".

The named period-native historical objects are the three captured 256-byte hex responses from the January 2014 onion2, onion3 and onion4 stages, retained as exact archival candidates in [the repository's existing source inventory](../resources/cicada-hiddenservice-256-candidates.json). **Onion2 is a changing stream**: the 256-byte length was a particular archival snapshot, and the original `<!--Patience is a virtue-->` HTML comment explicitly instructed waiting through the staged byte arrivals. It is therefore an invalid claim to describe onion2 as an author-fixed 256-byte secret key. Onion3 and onion4 are also captured hex responses, with no known source text saying that one is a key for the later LP2 table.

## Fixed original-cell experiment

Freeze the complete 256 original table bytes **in printed row-major order**, with all cells retained and no adjusted phase or transpose. For each historical source snapshot, test direct byte equality, same-position XOR readability, exact source multiset equality (necessary for any positional permutation of the bytes), *all* 256 possible fixed single-byte table substitutions via a contradiction invariant, and longest shared contiguous byte substring regardless of offset. The exact contradiction invariant is: any two positions with identical source byte `x` must have identical target `S(x)` under any stationary substitution. The original table has 161 distinct byte values, so input repeats are plentiful.

| Historical source | Same-position byte equality | Printable bytewise XOR of 256 | Maximum identical-byte multiset overlap | Repeated source positions / contradictions | Longest shared consecutive substring |
|---|---:|---:|---:|---:|---:|
| 2014 onion2 (mutable snapshot) | 1 | 97 | 125 | 98 / **98** | 1 byte |
| 2014 onion3 | 1 | 99 | 115 | 99 / **99** | 2 bytes |
| 2014 onion4 | 3 | 82 | 122 | 84 / **84** | 2 bytes |

No object gives a direct ordered or reordered copy of the complete original table, a readable same-position XOR, any static source-byte→table-byte lookup, or an unchanged three-byte consecutive substring. The positive equality counts are consistent with chance on unrelated high-entropy byte strings. These exclusions are narrower than cryptographic independence: a time-dependent transform, a keyed KDF, an independent generator sharing a seed, or a different authenticated external target is untouched.

**Source-specific instruction gate:** The original onion2 instruction *Patience is a virtue* specifies waiting, and the 2014 stage11 index supplies only the image list. Neither tells a 2014 player to use the onion response as p50 key, row/address target, input alphabet, offset, stopping rule, or inverse. The 2016 signed words/numbers/direction text does not identify these three onion URLs. There is accordingly **no author-selected locator** or first-party operand to test on the p49/p51 untouched flank. Opening a generic keyed transform menu after these negatives would abandon the source premise.

## Reproducibility and next decision

Run [`sims/lp2_p50_historical_onion256_exact_source_sft.cjs`](../sims/lp2_p50_historical_onion256_exact_source_sft.cjs) on Windows 11 with Node22. It reads only repository source data and asserts every table count and per-object invariant, with detailed logging. No network, write operations, nonhistorical corpus, guessed key, or random seed is required.

**Decision:** retire direct 2014 onion2/3/4 byte handoff and stationary single-byte source lookup as a route to LP2. A genuinely new #2242 external-source attempt must begin with a contemporary instruction selecting an identifiable recipient's location or specifying an executable table-address operation. The 256-byte length resemblance, especially onion2's contingent snapshot, is insufficient. More promising distinct work remains possible on the p49/p51 flanking text or an original 2014 receiver rather than additional byte similarity sweeps.
