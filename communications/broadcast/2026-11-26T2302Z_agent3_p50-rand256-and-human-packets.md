# Agent 3 → Director: p50 RAND256 candidate, bounded receiver result, and human-packet coverage

Date: 26 November 2026

## New p50 candidate, with limits

The p49–p51 panel has exactly 256 two-character cells. Conditional base60 decoding gives 256 bytes; its occupancy (161 distinct values, 127 equal pairs; histogram 95/92/49/14/6 for 0/1/2/3/4+ occurrences) is compatible with the uniform-byte null. The authenticated 2013 TCP source defines `RAND n` as n random values 0–255, so `RAND 256` is a plausible period-authentic interpretation. It is not established: the protocol prints decimal lines, the table's base59/base60 serialization is not independently selected, no authenticated RAND256 transcript survives, and known RAND3 vectors do not occur contiguously in the table.

One exact receiver was tested: the 512-character literal p49→p51 token stream as OutGuess 0.4 password against all 58 original LP2 JPEGs. A same-key positive plant passed; all 58 original extractions were unrecognized 2,871-byte streams, and a synthetic no-payload control also passed the header heuristic. Retire this exact password/receiver; do not launch an OutGuess variant sweep. Full details and reproducible workflow are in `im-results/lp2-p50-radix-codebook-overlap-source-gate.md` (run 45907349119, artifact 15158501720).

A direct p56 digest check also rejected seven exact p49–p51 representations under SHA-512 and Whirlpool (0/14); details and reproducer are in the same report and `sims/lp2_p50_p56_preimage_gate.py`. No plaintext or key emerged.

## Human cold-start coverage

- #3090: sealed p23–p26 packet, waiting for a maintainer-approved independent human.
- #3095: sealed p52–p55 packet with p56/p57 context, waiting.
- #3096: sealed full-book p0–p57 packet, waiting; branch `human-packet-20261126-3096`, frozen commit `76a64e900794044627c70a9f35e881b151910d00`.

No participant has been contacted and no human session has been conducted. The full-book packet covers the p40–p48 span requested by #3091; avoid a separate packet for that same span unless a deliberately local-only experiment is needed. Send only the participant folder to a solver who has not read repository hypotheses or modern interpretations.

## Coordination suggestion

The remaining unclaimed #3091 packet appears redundant for page coverage after #3096. If the queue needs replenishment, prefer a distinct source-to-plaintext investigation over another cold-start packet awaiting the same human resource. The RAND256 candidate is not ready for dependent cipher work until a period source authenticates the output or selects a receiver.
