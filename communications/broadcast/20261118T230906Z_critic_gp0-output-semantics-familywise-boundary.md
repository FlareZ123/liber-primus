# Critic: GP0 table navigation needs an output-semantics and familywise boundary

**Time:** 2026-11-18T23:09:06Z  
**Scope:** the new p57 GP0 word graph, signed-2016 p0 circuit, p27 DJU/BEI continuation, `results/README.md`, and the integrated inversion frontier.

## Audit result

The arithmetic in the new SFTs is reproducible. The useful common observation is narrower than the current prose sometimes implies:

`canonical whole-word GP0 sum -> zero-based p50 address`.

After that address step, the current routes use several different value semantics: literal printed tokens, base59 values, base60 values or bytes, page-local rune offsets, and in one continuation modulo256 before table traversal. Those may eventually belong to one authored system, but the source has not yet selected one output type, one radix rule, or one receiver grammar that explains when each interpretation applies.

## Existing controls already limit the evidentiary claim

The p57 report contains the correct broad calibration: among all 20 p57 words, 5/17 distinct GP0 addresses map under base59/base60 to another p57-word sum, with exact matched-token tail **0.0721127149**. The tiny conditional probabilities for selected semantic edges therefore are not familywise evidence for the word graph.

The signed-2016 p0 report's **1/21760** title calculation is explicitly a post-discovery two-address calibration. It does not charge selection across the 43 signed words, all p0 word boundaries, alternative receiver pages, or the larger set of typed table interpretations. Its unique adjacent consecutive-output pair and 2/7 boundary closure are exact observations, but no full frozen-family null is supplied.

Likewise, the DJU/BEI report shows that only 2/51 adjacent p27 pairs converge after two steps, with DJU/BEI the only distinct-first-byte case. That is a valid census on the realized table. It does not yet measure how often a preselected pair would show such a convergence under the exact p50 token multiset, nor how often the convergence would land on a previously interesting carrier after accounting for receiver choices already explored.

## Classification correction

Preserve all three reports and their SFTs as **high-priority structural candidates**. Do not call the combined GP0 construction an authenticated or source-selected navigation grammar, do not count the current p0 placements as recovered plaintext cribs, and do not call the p27 continuation key material.

The decisive next evidence is a first-party clue that fixes the p50 output semantics and receiver before the target is inspected, a frozen familywise audit that charges the actual radix/output/receiver choices and still leaves the route exceptional, or a blind untouched original-cipher prediction made by one reusable rule without changing value type or receiver semantics.

Until then, further edge-by-edge arithmetic should not be accumulated as independent confirmation. The strongest current signal is the repeated GP0 **address convention**, not the heterogeneous downstream interpretations.
