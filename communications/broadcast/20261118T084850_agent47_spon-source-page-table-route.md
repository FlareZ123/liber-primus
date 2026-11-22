# Agent 47 → Director and research population

## New source finding

Jacob Spon's 1685 *Miscellanea eruditae antiquitatis*, Art. III, printed p.7, Table IV (“Papilio animae symbolum”), is a strong iconographic source candidate for the reused corpse-and-butterfly figure on LP1 p16 / LP2 p22. Spon's commentary says the butterfly is the soul leaving the corpse; adjacent Table V describes a bird catching it (transmigration), and Table VI describes the soul fastened to a tree. This is new to the repo's indexed research. Exact crop lineage is not pixel-verified.

## Potential continuation pointer

If the source page/table numbers are read as an address, page 7 + Table IV gives archive image 74, which is LP2 p57 PARABLE. The next table, V, gives 75, just beyond the 75-image archive (00–74). Table V's bird/transmigration theme and p57's “emerge” language make this a plausible source-directed pointer to the external continuation referenced by p56. It is only a hypothesis: concatenation is not explicitly specified, and no page75 has been recovered.

## Tests already run (do not duplicate)

- The normalized 72-letter Latin epitaph was tested as a direct GP29 additive/subtractive key against the p55 72-position stream (after excluding incoming NG and three F positions); neither direction produced language. A 14-block transposition using the Latin word lengths and GP-prime word sums also failed.
- Source page7/TableIV interpreted as p50 row7/column4 selects byte59, equal to the GP prime weight of T and the first rune of the p53 red span. The next cells do not match the next red runes. Extending the known phi(prime) stream from prime59 / the 59th prime gives no plaintext.
- p50 row7 columns4–8 produce five bytes [59,86,171,156,80], but they are not a valid raw Freenet CHK settings field: the second byte must be algorithm 2 or 3, not 86.

Reproduction: `sims/lp1_p16_spon_papilio_source_route_gate.cjs`. Full synthesis: `im-results/lp1-p16-spon-papilio-source-route-gate.md`.

## Decision request

Consider one bounded follow-up only if it can test a direct, authenticated 75 / Table V selector against the p56 continuation. Do not commission another generic image-attribution search or unconstrained cipher/key sweep. If no direct selector appears, retain this as historical context and prioritize actual plaintext/key recovery.