# 2013 PRIMES 3257→44→193 table bracket: familywise null

## Source observation

The recovered participant PRIMES paste preserves two literal doubled spaces: after **29** and after **3257**. It ends at 3301. The second delimiter gives \(3301-3257=44\); the 44th prime is 193. In the original row-major p49–p51 256-byte table, 193 occurs exactly at offsets 83 and 127, separated by 44 and enclosing 43 bytes. That interior length equals p55's circumference-stripped 43-rune core.

The first doubled-space delimiter is a useful control: \(31-29=2\), the second prime is 3, and the table contains no value 3. Thus only the second delimiter produces the proposed table pair.

The paste is an unsigned participant artifact, not an authenticated Cicada server transcript or command grammar. It preserves the whitespace, but does not instruct the solver to use the left endpoint, convert the difference to a prime ordinal, or consume the bracket as a key.

## Null test

Two different questions must be separated:

1. **If gap 44 and value 193 were fixed in advance**, and the table's byte multiset were fixed with exactly two 193s, the chance that their two positions differ by exactly 44 under a uniform permutation is
   \[
   \frac{2(256-44)}{\binom{256}{2}}=0.0064951.
   \]
   The 100,000-shuffle simulation gives 0.00625.
2. **Before the rule is authenticated**, the data permit a search over the first 54 prime ordinals (all whose prime values fit in a byte). The familywise statistic is whether *any* prime value occurs twice at a separation equal to its prime ordinal. The observed table has one match, at gap 44 / prime 193. A deterministic 100,000-shuffle null preserving the exact byte histogram gives:
   - expected matches across the 54 gaps: 0.15843;
   - probability of at least one match: 0.14812;
   - match-count histogram for 0, 1, 2, 3, 4+ matches: 85,189 / 13,812 / 960 / 39 / 0.

The familywise result is not unusual enough to establish the rule. The 0.0065 fixed-gap probability is relevant only if an independent source first selects the 3257→44→193 operation. The additional 43-rune interior match is not included in that table-position null and should not be counted as an independent probability without a justified model for page/word-length selection.

## Decision

Preserve the 3257→44→193→43 bracket as a source-observed candidate, but do not promote it to an LP2 key or cipher. Its specific table placement is uncommon when the gap is fixed, yet the broader prime-ordinal scan finds at least one match in about 15% of histogram-preserving permutations. The unresolved, decisive input remains an original source that authenticates the 2013 COUNT/PRIMES command grammar and selects this exact consumer. The already-tested direct multiplicative consumers fail; do not run further masks or phase sweeps while that source edge is missing.

## Reproduction

Run from the repository root with Node.js 22:

~~~sh
node sims/lp2_2013_primes_44_p50_193_gap_null_sft.cjs
~~~
