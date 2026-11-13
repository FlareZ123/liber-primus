# January 2014 onion-2 arrival cadence: original byte-dependency gate

**Agent31, 13 November 2026. Status: independent historical-source negative.** No Liber Primus unknown plaintext, original keystream, authored LP2 decoder or continuation destination is recovered. The [read-only single-file CommonJS test](../sims/lp2_onion2_byte_arrival_dependency_sft.cjs) uses exact local preserved original-era sources, with no LP2 key, crib or parameters fitted to ciphertext.

## Causal premise and competing account

The January 2014 second onion published a growing 256-byte binary string under the human-readable HTML clue *Patience is a virtue*. Contemporaneous observers recorded five-minute-quantized **inter-byte waiting times** for the final 114 additions, one-based positions 143–256. The leading missing 142 arrivals are unobserved. Unlike already-exhausted attempts to repeat the public 114 delays as an LP2 additive key, this test asks if the **publication schedule itself was a deterministic encoding of the same original published bytes**. If so, a player might have inferred an authored generator or supplementary key without needing LP2 ciphertext to choose its rule. The competing, simpler account is ordinary operator pacing, scheduling or coarse observer resolution. The 5-minute granularity need not reflect an intentional symbol clock.

Inputs: [complete 256-byte historical publication register](../resources/cicada2014-onion2-timing.json), hash SHA-256 `05acf0d8e2ba7d851e2b4bbc32b85e461a1bd41576a50504487f33d4c1522c56`; [independently reconciled 114-delay witness merge](lp2-2014-onion2-timing-merged-114.json), with the formerly uncertain positions 190/191 resolved as 10/20 minutes by original-era two-observer crosschecks. Each preserved arrival is associated with the byte that was appended at the end of its preceding interval. The SFT asserts these indices, exact 256-byte digest, all 114 corresponding published hex bytes and sum of delay units before testing.

## Fixed historical operation and independent null

One classic way of making random bytes induce a geometric waiting time is to count their initial run of equal bits: the stop bit terminates the waiting period. For each of the 114 original published bytes, freeze four simple 8-bit rules with no unseen nonce, shift or phase:

`waiting time / 5 minutes = 1 + (leading or trailing run of 0 or 1 bits)`.

All 114 delays are positive integer units, with frequencies **1:46, 2:34, 3:21, 4:6, 5:4, 6:2, 7:1** (sum **240 units**). For the four fixed rules in trailing-zero, leading-zero, trailing-one, leading-one order, exact source-byte/delay matches are **35, 36, 37, 38 of 114**. The last is the family-selected maximum. These counts have no value as a decoder unless enriched over chance, since the geometric waiting-time and byte-bit-run marginals both favor short intervals.

Use **50,000 independent Fisher–Yates permutations** of the full delay multiset, while keeping the 114 bytes, all historical positions and the four rules fixed. The xorshift32 RNG is seeded at `0x6140f519`; every null trial reselects the best of all four rules. The four null means are **35.17292, 35.71020, 33.61868, 34.15582** matches. Null best-of-four median is **39**, 95th percentile **45**, 99th percentile **47**. Exactly **38,333/50,000** null maxima reach or exceed the observed best 38; the plus-one empirical familywise **p = 0.76666467**. Thus none of these four byte-dependent delay generators is selected by the source observations.

A second source-only test asks whether the timing order itself has a short periodic register. The observed lag-1 through lag-10 delay autocorrelations are:

`[-0.039810,-0.074370,-0.109817,+0.103868,-0.018665,-0.141854,+0.114404,-0.043120,+0.192575,-0.003474]`.

The best absolute value is **0.192575** at lag nine. With **50,000** fresh exact-marginal shuffles, seed `0x1041b5c1`, and selecting the maximum absolute autocorrelation over all ten lags in *each* null, the 95th maximum is **0.260342** and 99th is **0.305781**. **16,362/50,000** nulls reach or exceed original, familywise **p = 0.32725345**. No source-evidenced short-lag timing memory is established.

## Independent byte-generator scope check

A secondary source tape check grouped the exact 256-byte string into aligned 16-byte, 32-byte and 64-byte blocks. Consecutive-block MD5, SHA-256 and SHA-512 digests, forwards and backwards, have **zero exact neighboring full-block matches** out of 15, 7 and 3 adjacent-block pairs respectively; same for the corresponding SHA3-256/SHA3-512 variants. A generic Merkle/hash chain with these exact byte frames is thus unsupported. This was checked on the complete published tape, not LP2. It does not constrain keyed hashes, nontrivial salts, truncation or an independent hidden generator.

## Decision

The archived 2014 arrival schedule has **no supported mechanical dependence on the byte stream under four simple byte-bit waiting rules, and no enriched lag-1..10 cadence**. These findings are source-only and statistically bounded; they do not prove the published 256 bytes or their timings carry no information. Neither measurement yields an independent seed, reversible operation or key schedule for LP2, so the correct next action is **source acquisition of an original sender-side timing script/instruction**, if any exists. Do not search phases or cipher offsets in the manuscript to rescue the weak timing relationship. The previously completed [114-delay LP2 pad sweeps](lp2-2014-onion2-256bytes-grid-source-gate.md) remain separate and negative, and are not repeated.

The SFT prints every finite result, uses no downloaded data beyond the two committed source files, and has deterministic seed/positive structural assertions. Neither surrogate permutation test reads or optimizes against a single unknown LP2 rune.
