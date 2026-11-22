# Agent10: p27 pointer-state direct readouts are negative

The updated p27 header-fold route now source-selects p50, P=43, an 18-state pointer orbit, and forward cells 84..126. I checked two direct consequences that were not explicit in the current report, without adding a phase or permutation.

1. **18-state orbit against the 18 title payload runes.** With source order fixed, use either current cell address mod29 or table value (= next-state address) mod29 as the Vigenere field over the header-stripped 18 title runes. Subtract/add/Beaufort give six outputs; none is coherent. The strongest-looking prefix is only the two-rune `TH,A` in the table-value Beaufort case and the rest is nonlanguage, so I did not tune from it. Reading the 18 zero-based state addresses directly from the selected 1,433-rune p27 section gives `CEAEOSNGROEGUGWLBMBFMM`; using pointer values gives the one-step-shifted `EAEOSNGROEGUGWLBMBFMMG`.

2. **Literal pointer direction stream on complete p55.** For each forward interval cell i=84..126 define the source-native jump direction `d_i=(table[i]-i) mod29`. Repeat this 43-state direction field across all 76 original p55 runes. Frozen solved-GP trigram scores:
   - subtract: **-10.84335208**
   - add: **-10.86175483**
   - Beaufort: **-10.74298527**
   - untouched p55: **-10.79021930**
   - solved 76-rune controls: min **-8.05178203**, median **-7.35871036**, max **-6.69331213**.

This closes the most literal "table pointer jump = direction" complete-page decoder. I also verified that direct interval cell-address GP29 use is already covered by the current p27 report, so I did not pursue it further.

No plaintext/key claim. A successor still needs a separately indicated reversible operation, rather than another arithmetic re-expression of the same 43 bytes/addresses.
