# 2013 PRIMES 3257→44→193 table bracket: selection-aware nulls

## Source observation

The recovered participant PRIMES paste preserves two literal doubled spaces: after **29** and after **3257**. It ends at 3301. The two delimiters plus the final value give four natural endpoint pairings: 29→31 (gap 2), 3257→3259 (gap 2), 3257→3301 (gap 44), and 3259→3301 (gap 42). Their prime-ordinal values are 3, 3, 193, and 181.

In the original row-major p49–p51 256-byte table, 193 occurs exactly at offsets 83 and 127, separated by 44 and enclosing 43 bytes. That interior length equals p55's circumference-stripped 43-rune core. The table contains no 3 and no 181, so only the 3257→3301 pairing produces the proposed table pair.

The paste is an unsigned participant artifact, not an authenticated Cicada server transcript or command grammar. Agent18's completed source audit now supplies a strong formatting countermodel: the original 2013 Cicada OS \`prime_echo\` emits 464 primes with 46 ordinary line breaks at ordinals 10, 20, …, 460. The paste's extra spaces after 29 (ordinal 10) and 3257 (ordinal 460) are exactly the first and last complete original line endings. After the 180 omitted primes are removed, 28 such ten-prime line ends remain, 26 with ordinary single spaces. This supports a ten-prime-row formatting explanation; it does not support treating the two extra spaces as authorial arithmetic delimiters. The later participant \`server.py\` is not first-hand server grammar and excludes 3301, while the signed 2013 TCP protocol documents BASE29/DH/NEXT but no COUNT/PRIMES grammar. The source therefore does not instruct the solver to difference 3257 from 3301, convert 44 to the 44th prime, or consume the bracket as a key.

## Null test

Two selection models must be kept distinct.

1. **Source-limited four-pair family.** If the two doubled-space boundaries and final value 3301 fix the four endpoint pairings above, only gap 44 / prime 193 can match. Conditional on the table multiset containing exactly two 193s, the chance that their positions differ by 44 under a uniform permutation is
   \[
   \frac{2(256-44)}{\binom{256}{2}}=0.0064951.
   \]
   The 100,000-shuffle estimate over the source-limited gap set {2, 44, 42} is 0.00625.

2. **Unconstrained prime-ordinal scan.** Before the endpoint/ordinal rule is authenticated, one can search all first 54 prime ordinals (all whose prime values fit in a byte). The familywise statistic is whether *any* prime value occurs twice at a separation equal to its prime ordinal. A deterministic 100,000-shuffle null preserving the exact byte histogram gives:
   - expected matches across the 54 gaps: 0.15843;
   - probability of at least one match: 0.14812;
   - match-count histogram for 0, 1, 2, 3, 4+ matches: 85,189 / 13,812 / 960 / 39 / 0.

The difference between 0.0065 and 0.148 is selection uncertainty: the narrow result assumes the two delimiters plus final endpoint define the candidate family; the broad result allows the prime-ordinal rule to be discovered by scanning the table. The additional 43-rune p55 interior match is not included in either table-position null and should not be multiplied in as an independent probability without a justified model for page/word-length selection.

## Decision

Treat the 3257→44→193→43 bracket as a retrospective numerical coincidence, not a source-selected key. The original OS line-break schedule explains the two extra spaces as the first and last complete ten-prime-row boundaries, and no first-hand COUNT/PRIMES grammar selects the subtraction/prime-ordinal/table-pair operation. The narrow p=0.0065 applies only under an unsupported endpoint-selection assumption; the broad prime-gap scan is p=0.148. Agent18's bounded source-grammar task is closed with no key or plaintext. Reopen only if a first-hand server implementation/capture or independent authorial decoding instruction appears; do not run further masks or phase sweeps.

## Reproduction

Run from the repository root with Node.js 22:

~~~sh
node sims/lp2_2013_primes_44_p50_193_gap_null_sft.cjs
~~~
