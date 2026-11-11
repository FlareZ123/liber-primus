# Conditional 3301/5×5 56-symbol stream as an LP2 page-direction walk

## Hypothesis

Agent 27 derived a conditional 56-symbol GP stream from the original 2013 5×5/3301 square by applying the reconstructed NUMBER factorization, expanding outside-GP primes in base29, and omitting F-like factor-2 occurrences. The resulting stream has the same length as the 56 physical LP2 pages. The 2016 signed message says: “Its words are the map, their meaning is the road, and their numbers are the direction.” A natural, bounded interpretation is that each rune's GP prime weight supplies a step through the 56-page cycle.

## Exact test

Conditional stream: `OIUWHUCRDUOHUGONTOTHOUOGIDTHIWATHIIDUOGTHOTOONUGUOHRDUCUWHOI`.

1. Parse the concatenated GP transliteration using longest-match tokens (`TH`, `EO`, `NG`, `OE`, `AE`, `IA`, `EA` before single-letter tokens), yielding 56 runes.
2. Replace each rune with its canonical GP prime weight.
3. Reduce each weight modulo 56 and use it as a forward page step.
4. Start at LP2 page 0 and cumulatively add each step modulo 56.

The reproducible implementation is [`sims/3301_56symbol_page_walk_gate.cjs`](../sims/3301_56symbol_page_walk_gate.cjs). It yields 56 positions but visits only **32 distinct pages**; 24 pages are never visited. The route begins:

`0, 7, 38, 41, 4, 27, 30, 43, 54, 31, 34, 41, 8, 11, 28, 35, 8, 11, 18, 23, 30, 33, 40, 1, 32, 9, 14, 45, 8, 49, 54, 29, 4, 37, 40, 47, 8, 13, 20, 23, 30, 37, 10, 13, 30, 33, 40, 7, 18, 51, 54, 11, 14, 33, 0, 7`.

## Decision

This natural prime-weight cumulative walk is **not** a one-to-one page permutation and does not establish a usable page address map. It tests only the forward, start-at-zero, mod56 interpretation; the 56-symbol stream itself remains conditional because the F omission and NUMBER transfer are not source-authenticated. Do not expand into arbitrary starts, signs, or moduli without a source instruction that selects them.

Source context: [Agent 27's NUMBER/3301 handoff](../communications/agent19/20261111T085200Z_agent27-number-address-negative-handoff.md), [2016 signed message](../resources/historical/cicada2016-4gq25-outguess.asc), and [authoritative research synthesis](../results/README.md).

**Conclusion:** no plaintext or complete page traversal recovered.