# P27 title header-fold: 256 / prime-43 table-interval bridge

**Status (11 November 2026): source-rare navigation structure selecting a 256-cell table and a 43-cell interval; traversal orientation and reversible decoder remain unresolved. No unknown LP2 plaintext or authentic cipher key recovered.**

## Upstream source route

This result continues the independently reproduced signed-2016 / p55 navigation route:

1. the signed 2016 base-58 word map sends each repeated **the** to the unique complete LP2 ciphertext word **FOLD**;
2. the cumulative signed route ends at physical **p55**;
3. folding the p55 sharp-tree image against itself yields mismatch bits 10010₂ = 18;
4. the 31 printed 13-dot marks delimit **32** physical fragments when coincident marks are retained, and one-based fragment **18** is exactly the red p27 title.

The duplicated p27/p55 DJU-BEI pair also has an exact numerical coincidence: its canonical word starts are 1,432 words apart, while the selected p27 section has 1,433 runes. These quantities use different units. The equality 1432 = 1433−1 is retained as an observation and **does not supply a direction, clock or state transition** without a source rule connecting word offsets to section-rune steps.

## Self-indexing title header

Fragment 18 is the 19-rune title MPYLSOAAEHLEEOIMLLSCP.

Its first rune is M, GP index **19**, exactly the title length. Removing that length header leaves **18 payload runes**, exactly the fragment number.

Across all 32 13-dot fragments, fragment 18 is the only nonempty fragment satisfying any of these three conditions:

- first rune index equals fragment length;
- remaining length equals fragment number;
- header-stripped fold equality mask equals 256.

## Literal header-aware fold

Fold the 18 payload runes outer-to-inner and write 1 for an equal pair, 0 for an unequal pair. The nine bits are exactly **100000000₂ = 256**.

The **only equal pair is P/P**. In Gematria Primus, P is index 13 and has prime weight **43**.

Thus one source-selected fold supplies two useful cardinalities:

- **256**, exactly the number of cells in the original 32×8 numerical table;
- **43**, exactly the size of the known interval between the table's two 193 cells, the authenticated 2016 signed-message word count, and the p55 shed-circumference interior channel.

Scanning every possible contiguous 19-rune window in the complete **13,136-rune LP2 source stream** finds exactly one match to the full pattern M=19, outer payload P/P, and no other folded equality: **p27 local offset 0**, the selected title. This is a source-rarity observation, not a discovery-adjusted p-value.

## Mirrored table bracket selects the 43-cell interval

The signed word **lies** has GP-prime sum 224, giving the already frozen base-58 address **physical p50 word index 3**, global table cell **83**, token 3D, byte **193**.

The 256-cell table contains exactly two byte-193 cells, at **83** and **127**. Their outward neighbors are both byte **201**:

- cells 82–83 = **[201,193]**;
- cells 127–128 = **[193,201]**.

The cells strictly between the two 193 boundaries are exactly **84–126**, i.e. **43 cells**. This mirrored bracket is a same-representation table fact and independently agrees with the P/P prime weight 43.

The source currently **does not fix whether those 43 cells are consumed 84→126 or 126→84**. The reverse ordering investigated below is therefore a conditional branch, not a source-selected orientation.

## Conditional reverse-order direct tests

Before the cross-unit direction problem was identified, the reverse order 126→84 was frozen and tested under direct operation families already used elsewhere in the repository. The negatives remain valid for that conditional ordering.

### 43 signed-addressed LP2 words

Using reverse cells 126→84 as one GP29 additive shift per signed-message-addressed LP2 word gives same-source key-order shuffle upper tails:

| Model | Original mean log score | Upper tail |
| --- | ---: | ---: |
| subtract reverse byte mod29 | **−4.799898** | **0.81409** |
| add reverse byte mod29 | **−4.633761** | **0.21639** |

### P55 shed-circumference interiors

Applying the same conditional reverse bytes positionwise to p55's 43 interior runes gives:

| Model | Original mean log score | Upper tail |
| --- | ---: | ---: |
| subtract reverse byte mod29 | **−4.503814** | **0.22069** |
| add reverse byte mod29 | **−4.786443** | **0.79055** |

The outputs are unreadable.

Other finite checks under that reverse hypothesis also fail: the 43 bytes have only **27 distinct residues modulo43**, and direct XOR or modular ± byte readouts using signed-word and selected-word sums reach at most **22/43** printable ASCII.

## Decision

The durable route is:

**FOLD → p55 → 18 → self-indexing p27 title → (256, 43) → mirrored 43-cell table interval.**

The title fold materially improves selection of the table and interval. It does not yet determine interval orientation or the reversible operation consuming the table interval, p55 interiors, and signed-message words. The 1,432-word / 1,433-rune coincidence must stay separate from direction claims unless a source instruction bridges those units.

Do not expand arbitrary byte KDFs, permutations or phase searches. A useful successor needs an independent source-visible rule for **orientation and operation**.

**Reproduce:** node sims/p27_title_headerfold_256_43_reverse_sft.cjs
