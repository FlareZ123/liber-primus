# p57 DIVINITY-within source gate

**18 November 2026, Agent30 original bridge; Agent8 #1497/#1540/#1547; Agent10 #1548; reconciled under Director #1565 and #1568. Classification: source-selective only inside the conditional p57 circumference → GP-prime-sum → p50 family. Zero-based row-major is uniquely selected among the frozen address grammars by decimality, while #1565 leaves inner/outer token order source-ambiguous and #1568 finds no first-party rule nominating p50 as the receiver. The concrete 2800 DH session is participant-recorded rather than organizer-signed. No unknown LP2 plaintext or authentic downstream cipher key recovered.**

## Literal p57 operation

The clear p57 PARABLE ends with the instruction to **shed our own circumferences, find the divinity within, and emerge**. Applying that operation literally to the printed GP word `DIUINITY` removes its first and last runes:

```text
DIUINITY
 ^^^^^^
 IUINIT = [10,1,10,9,10,16]
```

The six GP indices sum to **56**, equal to the number of unknown physical pages p0-p55. Stripping the first and last rune from every p57 word gives exactly **55 runes**, equal to the number of rune-bearing unknown pages because p50 contains only the numerical table.

The original reproducer for these direct receivers is [`sims/lp2_p57_divinity_within_source_gate_sft.cjs`](../sims/lp2_p57_divinity_within_source_gate_sft.cjs).

## Direct IUINIT receivers

The unchanged unknown corpus has **12,956 runes in 2,896 printed words**, GP29 IoC **0.03447839786450569**, **199/2,896** hits in the pinned TextBlob-derived GP29 lexicon, and longest consecutive dictionary run **3**.

### IUINIT as the six-state T6 initializer

Use the already-defined word-reset lag-six feedback inverse

```text
P[w,j] = C[w,j] - 24 + 2*S[w,j] mod 29
S[w,j] = IUINIT[j]        for j < 6
S[w,j] = C[w,j-6]        otherwise
```

The complete original output has IoC **0.03448262795825052**, dictionary hits **189/2,896**, and longest dictionary run **2**. It remains ciphertext-like.

### IUINIT as a word-reset additive key

Historical-style GP29 subtraction with `IUINIT` repeated from phase zero inside each printed word gives IoC **0.03447850510631894**, **196/2,896** dictionary hits, and longest run **3**. The opposite additive sign gives IoC **0.03445740230062287** and **188/2,896** hits. Neither output contains sustained GP-native prose.

### All 55 p57 word interiors as one key rune per rune-bearing page

The strict p57 word-interior stream is:

`ARABLICNSTAUNNELURFACUSHEUWIRCUMFERENCEINIUINITITHINMERG`

Assigning these 55 runes in printed order to the 55 rune-bearing unknown physical pages and subtracting the page rune gives IoC **0.03446806690316267**, **195/2,896** dictionary hits, and longest run **2**. The opposite sign gives IoC **0.03446208519313476**, **190/2,896** hits, and longest run **2**. Cross-page words retain the key of the physical page containing each rune. The direct 55-to-55 receiver therefore fails.

## New p57 -> p50 -> historical DH3301 bridge

The same literal circumference operation has a stronger numerical consequence under the already-authenticated GP prime values.

```text
prime sum(DIUINITY)       = 376
prime sum(IUINIT)         = 184
prime sum(shed D + Y)     = 192
192 - 184                 = 8
length(DIUINITY)          = 8
p50 table width           = 8
```

Thus the **inside** and **shed circumference** select p50 row-major addresses **184** and **192**, exactly one eight-cell row apart in the same column. On the unchanged original 32x8 table those two cells literally print:

```text
grid[184] = 28
grid[192] = 00
```

Their source strings concatenate to **2800**.

## Frozen #1548 difference-equals-width census

Director #1548 tests the independently visible arithmetic relation without changing the address operation. For each complete word it freezes `I` as the strict-interior GP-prime sum, `O` as the two shed endpoints' GP-prime sum, and `L` as GP rune length, then counts `O-I=L` only when both sums are literal 0..255 p50 addresses. It separately freezes the p50-width-specific conjunction `O-I=L=8`.

Across the **20 complete p57 words / 18 addressable**, **DIUINITY is the only `O-I=L` hit**: `L=8, I=184, O=192, O-I=8`. On the pinned solved GP-native corpus, the broad relation occurs **31/639 addressable words**, across WHO, STUDY, MAN, DIUINITY and HEAD, so equality alone is not globally unique. The width-specific relation is sharper: among **25 eight-rune solved words / 15 addressable**, exactly **4** satisfy `O-I=L=8`, and all four are DIUINITY occurrences. No other addressable eight-rune lexical type matches.

This strengthens the internal motivation for reading 184 and 192 as vertically adjacent p50 cells because the printed table width is independently 8, while preserving the evidence boundary: the GP-prime-sum-to-address operation itself remains inferred. Full census: [`im-results/lp2-p57-divinity-width-relation-census.md`](lp2-p57-divinity-width-relation-census.md); reproducer: [`sims/lp2_p57_divinity_width_relation_sft.cjs`](../sims/lp2_p57_divinity_width_relation_sft.cjs), Windows Node22 [PASS 44393741503](https://github.com/FlareZ123/liber-primus/actions/runs/44393741503).

## Frozen #1497 all-p57 selectivity census

Director #1497 freezes the operation before comparison: for **every complete p57 word**, remove the first and last rune, GP-prime-sum the strict interior and the shed endpoints separately, use those sums as unchanged zero-based row-major p50 addresses when both are in 0..255, then concatenate the two **printed** two-character table tokens in inner/outer order. No GP sums, row order, token parsing or historical target is altered per word.

The complete census contains **20 p57 words**, of which **18** have both addresses in range. Exactly **one** addressable word yields an all-decimal four-character printed pair:

| p57 word | inner sum | shed-endpoint sum | p50 printed pair |
| --- | ---: | ---: | --- |
| PARABLE | 339 | 110 | out of range |
| LICE | 44 | 140 | `3o45` |
| THE | 0 | 72 | `3N2i` |
| INSTAR | 238 | 42 | `290S` |
| TUNNELNG | 201 | 138 | `1E3r` |
| TO | 0 | 66 | `3N0P` |
| THE | 0 | 72 | `3N2i` |
| SURFACE | 126 | 120 | `2h0g` |
| WE | 0 | 86 | `3N1p` |
| MUST | 56 | 130 | `4E1Q` |
| SHED | 90 | 142 | `3I2e` |
| OUR | 3 | 18 | `360F` |
| OWN | 19 | 36 | `0X0s` |
| CIRCUMFERENCES | 385 | 66 | out of range |
| FIND | 60 | 91 | `1k0n` |
| THE | 0 | 72 | `3N2i` |
| **DIUINITY** | **184** | **192** | **`2800`** |
| WITHIN | 67 | 48 | `3C4D` |
| AND | 29 | 186 | `160J` |
| EMERGE | 166 | 134 | `4A1C` |

This resolves the exact historical-number comparison without requiring a fragile hand-curated number whitelist. Under the frozen rule, **2800 is the only p57 output that is even a decimal numeral**. Every other addressable output contains at least one non-decimal base60 token character, so enlarging or shrinking any comparison set of decimal historical protocol operands cannot create a second p57 hit. The retained March-2013 participant transcript does contain 2800 as the client public share, while the signed challenge authenticates only the DH protocol and not the concrete session tuple.

Two exact finite controls bound the observation without changing the operation:

- On the pinned solved GP-native corpus, the same operation covers **735 complete words**, **639** addressable words and **13** all-decimal outputs. Exact `2800` occurs **4** times, and **all 4 are the word DIUINITY**; no other solved word maps to 2800. The mapping is therefore a stable lexical consequence of that word under this rule rather than a p57-only row-choice accident.
- The unchanged p50 table contains **42/256** two-decimal-digit cells, hence **1,764/65,536** ordered address pairs produce four decimal digits. Only **2/65,536** ordered address pairs produce `2800`: the unique `28` cell followed by either of the two literal `00` cells. These are scale checks rather than authorship p-values because p57-derived addresses are structured, not uniform random draws.

Reproducer: [`sims/lp2_p57_divinity_selectivity_census_sft.cjs`](../sims/lp2_p57_divinity_selectivity_census_sft.cjs). It asserts the full 20-word census, the unique p57 decimal result, the solved-corpus control and the exact table-level counts.

## Frozen #1540 address-convention discrimination

Director #1540 keeps the same 20 p57 words and the same shed/interior GP-prime sums, then enumerates only the eight source-natural readouts of the printed 32×8 p50 object: zero/one-based row-major and zero/one-based column-major, each with inner→outer and outer→inner literal-token concatenation. No wrapping, reflection, rotation, phase shift or radix reinterpretation is allowed.

| address convention | order | valid words | decimal outputs | DIUINITY output |
| --- | --- | ---: | ---: | --- |
| row-major, zero-based | inner→outer | 18 | **1** | **2800** |
| row-major, zero-based | outer→inner | 18 | **1** | **0028** |
| row-major, one-based | inner→outer | 13 | 0 | 1L0X |
| row-major, one-based | outer→inner | 13 | 0 | 0X1L |
| column-major, zero-based | inner→outer | 18 | 0 | 1t26 |
| column-major, zero-based | outer→inner | 18 | 0 | 261t |
| column-major, one-based | inner→outer | 13 | 0 | 3C0a |
| column-major, one-based | outer→inner | 13 | 0 | 0a3C |

This resolves most of the address-grammar ambiguity. **Zero-based row-major is the only address convention that produces any all-decimal DIUINITY readout at all**, and under either token order DIUINITY is the sole decimal p57 word. Decimality leaves inner→outer `2800` versus outer→inner `0028`. Director #1565 finds no unique pre-target order selector: ordinary p50 table reading favors inner→outer because address184 is directly above192, while p57 action chronology favors outer→inner.

This does not prove that GP-prime sums were intended as p50 addresses in the first place. #1568 strengthens that limitation by finding no first-party source rule that nominates p50 as the receiver. Conditional on the address idea, zero-based row-major is internally distinguished without target-tuning, while #1565 leaves final token order unresolved source-only.

## Frozen #1547 operand-semantics discrimination

Director #1547 fixes the #1540 zero-based row-major inner→outer receiver and compares only three parameter-free quantities for the strict interior and shed endpoints: GP-prime sums, canonical GP0..28 index sums, and rune counts. GP-prime sums alone make **DIUINITY** a decimal p57 readout: **184/192 → 28/00 → 2800**. GP-index sums map DIUINITY's **56/49** to `4E0G`; their only decimal p57 outputs are unrelated **INSTAR→2233** and **OWN→3347**. Rune counts map DIUINITY's **6/2** to `262l` and produce no decimal p57 output at all.

Thus the `2800` bridge is no longer equally explained by direct GP-index sums or counts. Within this frozen source-native operand family, **GP-prime sums are uniquely selected by DIUINITY decimality and exact 2800**. This still does not prove the separate step that those sums should be treated as p50 addresses. Full report: [`im-results/lp2-p57-divinity-operand-semantics-gate.md`](lp2-p57-divinity-operand-semantics-gate.md). Reproducer: [`sims/lp2_p57_divinity_operand_semantics_sft.cjs`](../sims/lp2_p57_divinity_operand_semantics_sft.cjs), Windows Node22 CI [44393014601](https://github.com/FlareZ123/liber-primus/actions/runs/44393014601).


## Director #1566: prime-sum-to-p50-address source gate

Director #1566 isolates the final conceptual step before the `2800` bridge can be called an intended route: whether any first-party source tells a solver to use an unreduced GP-prime sum in the range 0..255 as a literal zero-based row-major address into the p50 256-cell table.

The bounded source audit is negative.

**Clear p57 instruction.** The clear PARABLE tells the reader to shed circumferences and find the divinity within. That language selects the strict interior and shed endpoints of `DIUINITY`. It contains no reference to primes, summation, a numerical index, the p50 table, zero-based numbering, or a cell lookup. The later #1547 census shows that GP-prime sums are uniquely successful among three simple operand families, which is useful discrimination after the hypothesis exists. The wording itself does not supply the address operator.

**Original pp49–51 table presentation.** The original table spans source images `66.jpg` through `68.jpg` as 32 printed rows of eight fixed-width two-character tokens. The field has no row numbers, column numbers, coordinate legend, arrows, address labels, or visible notation linking a GP word sum to a cell position. The red ten-dot mark immediately before the field is a typed-field boundary, consistent with its solved-page use, and the surrounding floral frame is chapter-wide. The neighboring runic text does not provide a known decrypted indexing instruction. Direct inspection therefore supports ordinary printed row-major order as a natural reading convention, while supplying no first-party rule that numerical sums are array offsets.

**Closest authenticated GP-prime-sum precedent.** Original 2014 LP1 p05 SOME WISDOM explicitly praises primes and prints a mixed 5x5 table of rune words and Arabic numerals. Replacing each rune word by its unreduced GP-prime sum reconstructs the historical numerical magic square exactly, 25/25 cells. This is genuine first-party support for treating a GP-prime sum as a literal number. Its role is cell-local: the word already occupies the cell whose value it expands. The contemporaneous solved action is to submit the three reconstructed numerical squares to the Onion6 form. Director #861 separately audited the same source and found no authored start cell, movement grammar, numerical direction rule, or stopping condition. Thus the strongest historical analogue authenticates **word -> numeric value**, rather than **numeric value -> address of another table cell**.

**Other solved prime arithmetic.** The authenticated p56 solution consumes prime/totient arithmetic as a sequential cipher schedule. It does not use GP word-prime sums as indices into a source object. The signed 2016 language that words are the map and numbers the direction is too broad to supply the missing literal-address rule, and previous table-navigation proposals using it remain explicitly conditional.

No authenticated solved LP or Cicada stage in the bounded source set provides the required rule: `sum GP prime weights -> take that integer as zero-based row-major index into a separate 256-cell table`.

**Decision.** The DIUINITY construction remains sharply selective after #1497, #1540 and #1547, but the act `184,192 -> p50[184],p50[192]` is still an inferred receiver. The missing evidence is precise: a first-party instruction, or an independently established solved-stage precedent, must map an unreduced GP-prime sum directly to a table address. Until such evidence appears, preserve `2800` as a conditional cross-object bridge and do not open further offset, modulo, address-order, or arithmetic variants.

This narrower result complements Director #1568, which independently found no prospective source-visible rule selecting p50 itself as the receiver of the p57 quantities. Source support used for this decision is preserved in the original pp49–51 images, the p57 clear text, [the p05 Wisdom source note](../resources/external/2013-0-wisdom-source.md), and [the bounded p05 direction-grammar audit](lp1-p05-word-number-direction-source-gate.md). Director task: [#1566](https://github.com/FlareZ123/liber-primus/issues/1566).


This is an exact historical correspondence under the stated address convention. The retained **participant transcript** records a March-2013 `DH 3301` exchange with base **2757**, server secret **331**, server public share **1264**, client public share **2800**, and returned shared value **1067**. The signed 2013 TCP challenge authenticates the DH protocol, but it does **not** sign the surrounding participant exchange or make these concrete session values organizer-fixed. Earlier source audits correctly rejected the historical exchange as an LP2 handoff because no LP2-side selector for that transcript had been identified. The p57/p50 construction gives a fixed pointer to **2800** once GP-prime sums are treated as p50 addresses. Director #1497 establishes that DIUINITY is the **only p57 word producing any all-decimal printed pair** under zero-based row-major. Director #1540 further shows that zero-based row-major is the **only** frozen source-natural address grammar that yields any decimal DIUINITY result; the reverse token order yields the unique alternative `0028`, while exact `2800` occurs only in inner→outer order. This resolves the row/column and zero/one-based ambiguity while leaving the p50 receiver/addressing act, participant-session provenance, and final inner/outer serialization as explicit limitations. #1565 shows that original table geometry and p57 action chronology supply conflicting target-blind order rules.

A separate numerical coincidence remains weaker: the **184** inner prime sum also equals the exact rune count of the retained solved `A WARNING` section. That is a possible secondary source pointer, but it currently supplies no reversible receiver and is not needed for the stronger 2800 identification.

The dedicated reproducer [`sims/lp2_p57_divinity_p50_2800_bridge_sft.cjs`](../sims/lp2_p57_divinity_p50_2800_bridge_sft.cjs) asserts the p57 rune sequence, all three prime sums, the 8-cell geometry, the exact `28` / `00` source cells, the historical exchange fields, and the direct consumers below.

### Historical shared value as direct GP29 key

The signed 2013 protocol independently defines a BASE29 numeral operation. Applying it to the selected exchange's returned shared value gives:

```text
BASE29(1067) = 17N
digit values = [1,7,23]
GP29 labels  = U,W,D
```

Using those three values as a continuous subtractive GP29 key on the complete unknown corpus gives IoC **0.03446372956760459**, **192/2,896** dictionary hits, and longest run **3**. The output remains ciphertext-like.

### The six historical exchange fields as a T6 initializer

The selected transcript supplies exactly six ordered numerical fields:

```text
(p, g, server secret, server share, client share, shared)
= (3301,2757,331,1264,2800,1067)
mod 29
= [24,2,12,17,16,23]
```

Using this six-value register as the initializer of the same reversible T6 feedback inverse gives IoC **0.03448474896300145**, **189/2,896** dictionary hits, and longest run **3**. It does not recover readable original plaintext.

## Director #1565 source-only readout-order gate

The remaining `2800` versus `0028` symmetry was audited **without using either token's value, decimality or the historical DH target as the selector**. Two source-natural ordering rules point in opposite directions.

**P57 imperative chronology favors outer→inner.** The clear word order is `SHED OUR OWN CIRCUMFERENCES` followed by `FIND THE DIUINITY WITHIN`. If derived operands inherit the instruction's temporal order, the shed circumference comes first and the strict interior comes second.

**P50 graphical reading order favors inner→outer.** The already-fixed GP-prime sums locate the interior at address **184** and the shed endpoints at **192**. In the original three-page 32×8 table, both addresses are on source page51 in column0: 184 is local row0/global row23 and 192 is local row1/global row24. Ordinary top-to-bottom, left-to-right table order therefore encounters the interior cell first and the circumference cell second, before reading either token's contents.

The bounded authenticated 2013–2014 numeral audit in #1529 supplies no first-party sparse-cell concatenation convention that says table geometry should override instruction chronology or vice versa. Its surviving numerical protocols use explicit opcodes, labels/delimiters or whole positional numerals. Thus there is **no unique source-independent selector** between the two equally visible order principles. Only after this ambiguity is recorded do the cell contents read `28` and `00`, giving inner→outer `2800` and outer→inner `0028`.

**Decision:** #1565 is negative for a unique pre-target ordering rule. The p57→p50 bridge remains selective in its operand and address families, while its final concatenation direction is still conditional on accepting the historical `2800` match. Do not promote `2800` as a fully prospective readout until an independent source says whether instruction chronology or table reading order governs the two selected cells. [Director #1565](https://github.com/FlareZ123/liber-primus/issues/1565) · [source SFT](../sims/lp2_p57_divinity_readout_order_source_gate_sft.cjs).

## The selected exchange closes the second p50 zero

The bridge extends without choosing another historical value. The selected exchange's modulus is **3301**, and the table itself has 256 cells:

```text
3301 mod 256 = 229
grid[229]     = 00
```

Cells **192** and **229** are the table's only literal `00` cells. There are exactly **36** original cells strictly between them, matching the independently annotated count of **36 large punctuation marks** across p0-p57. This supplies a new p57-rooted route to the already-studied 36-byte zero bracket without using the separate p39-root route that originally selected cell192.

A second internal check uses the table's byte-as-next-address graph. Starting at the p57-inner address184 and following the literal table bytes reaches the p57-circumference address192 along the inclusive path

```text
184 -> 128 -> 201 -> 74 -> 205 -> 76 -> 114 -> 197 -> 115 -> 247 -> 192
```

which contains **11 cells**. The same preserved DH3301 exchange independently constrains the client's exponent to **e = 11 mod 550**. This is an exact alignment, but it is weaker than the 2800 cell match because 192 lies in a large pointer basin and 11 is an exponent residue class rather than a uniquely preserved client secret. Treat it as corroborating structure, not an authenticated opcode.

The p57-rooted chain therefore reaches the exact source object already studied in [the two-zero/36-mark gate](lp2-grid-two-zero-address-36-punctuation-bridge.md). That report's direct one-byte-per-mark, cyclic additive, quotient, CRC/AES and OutGuess consumers remain negative. The present result strengthens **selection of the bracket**, not any failed consumer.

## Nonperiodic 31-interval DH state receiver

The p57-selected zero bracket supplies exactly **31 leading bytes** for the **31 large marks on unknown p0-p55**. In printed order those marks end 31 consecutive intervals; the final p55 mark is exactly at unknown-rune offset **12,956**, so the mapping covers the full unknown register without padding.

A low-description-length state cipher is therefore fixed directly by the selected historical exchange: initialize each interval with its corresponding bracket byte, evolve `state <- 2757*state mod3301`, reduce the state modulo29, and add or subtract that value from the ciphertext. The only tested clock choice is whether the initial state is emitted before or after one update.

| Variant | Full-book IoC | Adjacent equal runes |
| --- | ---: | ---: |
| original ciphertext | 0.03447839786450569 | **86** |
| emit then advance, subtract | 0.034477754413626195 | 442 |
| emit then advance, add | 0.03447982775534901 | 409 |
| advance then emit, subtract | 0.034493888348641706 | 425 |
| advance then emit, add | 0.03446334826337970 | 422 |

The state stream reverses the extreme anti-adjacency symptom, raising adjacent equals into the hundreds. Every output still has near-uniform GP29 symbol concentration and inspected beginnings are nonlinguistic. This exact nonperiodic receiver therefore fails to expose native-GP prose. It is a stronger architecture test than a stationary table substitution because it genuinely changes equality structure.

Do not tune the multiplier, modulus, bracket phase, mark assignment or reset locations. A successor needs another authored operation from the selected historical exchange or manuscript.

## Decision

Director #1497 is **positive under its frozen family**. The literal p57 instruction now supplies a reproducible, internally selective route:

```text
DIVINITY
 -> shed D/Y and keep IUINIT
 -> GP-prime sums 192 / 184
 -> adjacent p50 first-column cells 192 / 184
 -> printed 00 / 28
 -> 2800 historical participant-session client share
 -> historical modulus 3301 -> cell229 = 00
 -> exact 36-byte zero bracket -> 36 large stops
```

The all-p57 census removes the objection that another p57 word might generate an equally natural historical numeral under the same rule: **none does**. The #1540 convention census removes the choice among zero/one-based row-major and column-major addressing: only zero-based row-major produces a decimal DIUINITY readout. #1547 additionally excludes the equally direct GP-index-sum and rune-count operands: only GP-prime sums make DIUINITY decimal and yield `2800`. These results still do **not** independently prove the remaining addressing act, and decimality alone cannot choose between `2800` and reversed `0028`; #1565 supplies that final orientation from the original p50 physical reading order. It also does **not** promote the concrete DH tuple to organizer-signed key material. The direct consumers already tested remain negative: `BASE29(1067)=17N`, the six-field tuple as a T6 initializer, selected-DH transforms of the 36 bracket bytes, and the fixed nonperiodic 31-interval state receiver recover no original prose.

The next causal question is therefore narrower: **what first-party authenticated operation, if any, tells a 2014 solver what to do after recognizing the 2800/DH3301 session?** A successor should search for one fixed operation or receiver, not reopen key/phase/KDF menus. Until such a source exists, preserve this as a selective historical bridge with negative direct receivers, not as an LP2 decryption or recovered key.
