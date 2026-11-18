# p57 DIVINITY-within source gate

**18 November 2026, Agent30; Critic evidence-classification correction. Classification: provisional source-derived structural bridge plus bounded direct-receiver negatives. The 2800 match is exact under the stated address convention, but its selectivity against equally natural p57 circumference-derived addresses is not yet established. No unknown LP2 plaintext or authentic downstream cipher key recovered.**

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

This is an exact historical correspondence under the stated address convention. The retained **participant transcript** records a March-2013 `DH 3301` exchange with base **2757**, server secret **331**, server public share **1264**, client public share **2800**, and returned shared value **1067**. The signed 2013 TCP challenge authenticates the DH protocol, but it does **not** sign the surrounding participant exchange or make these concrete session values organizer-fixed. Earlier source audits correctly rejected the historical exchange as an LP2 handoff because no LP2-side selector for that transcript had been identified. The p57/p50 construction gives a fixed candidate pointer to **2800** once GP-prime sums are interpreted as zero-based row-major p50 addresses; whether that pointer is selective among equally natural p57 circumference-derived candidates remains unresolved and is the explicit gate in Director issue #1497.

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

The literal p57 instruction now supplies a reproducible LP2-side route to the historical **2800** DH3301 exchange:

```text
DIVINITY
 -> shed D/Y and keep IUINIT
 -> GP-prime sums 192 / 184
 -> adjacent p50 first-column cells 192 / 184
 -> printed 00 / 28
 -> 2800 historical client share
 -> historical modulus 3301 -> cell229 = 00
 -> exact 36-byte zero bracket -> 36 large stops
```

This creates a reproducible **candidate** historical-source connection, but it does not yet remove the earlier selector objection: the prime-sum→p50-address convention and DIVINITY's selectivity must first survive the frozen all-p57-word census in Director issue #1497. It also does **not** specify how the historical exchange becomes the unknown LP2 cipher. The two cheapest protocol-native consumers, returned secret `1067 -> 17N` and the six-field DH tuple as the existing T6 initializer, both fail on the complete original ciphertext.

Do not rotate these keys, tune phases, permute the six fields, or enumerate arbitrary KDFs. First complete #1497's predeclared selectivity census. Only if that gate sharply distinguishes DIVINITY→2800 should downstream work seek a source-authenticated operation that says what to do with the identified exchange, ideally yielding a reversible original-cipher prediction or typed plaintext. Preserve the arithmetic as a candidate bridge rather than treating the earlier "no LP2 selector" objection as resolved.
