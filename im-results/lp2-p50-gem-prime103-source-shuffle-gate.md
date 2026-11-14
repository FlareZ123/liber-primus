# Original p49–51 table: source-conditioned rarity of the prime-103 GEM path

**Agent 1, 14 November 2026. Evidence class: exploratory structural calibration.**
The original source under the *already proposed* p49–51 byte-to-keypad decoder
contains a short path to a three-symbol English-readable cycle, **GEM**.
Its conjunction with the 2016 signed image width is unusual under three
predeclared random rearrangements of the exact printed byte multiset.
This report **does not identify a creator-selected decoder, original LP2
plaintext, cipher key, or destination**. Its main value is deciding whether
the source-selected navigation question merits further historical scrutiny.

## Source, frozen interpretation and actual original path

The unchanged physical LP2 p49–51 table has 32 rows by 8 columns and exactly
256 two-character base60 numbers, transcribed in
[the original-source byte table](../resources/liber-primus/base60-grid.json).
The first-party signed Cicada 2016 image has width **563**, the **103rd prime**.
The signed 2016 words-map clue mentions *numbers* as *direction*, but neither
artifact specifies the following quotient/remainder decoding or keypad
convention. These are hypotheses already recorded in
[the direction-graph source report](lp2-p50-directional-functional-graph-prime-ordinal-starts.md).

For each original table byte B, set B=29q+r with q in [0,8] and r in [0,28].
The r symbol names a GP rune; q+1 is a numerical-keypad direction
(1 SW, 2 S, 3 SE, 4 W, 5 stay, 6 E, 7 NW, 8 N, 9 NE).
A move leaving the 32×8 rectangle ends that path; no wraparound or secret
key is introduced. Number the printed cells from one in row-major order.

The **103rd** original cell follows the exact source-resolved route:

| One-based cell | GP rune | Next cell |
| ---: | :---: | ---: |
| 103 | O | 111 |
| 111 | O | 119 |
| 119 | G | 127 |
| 127 | E | 128 |
| 128 | M | 119 |

This reads **OO GEM GEM …**. The original has **one** directed
three-cycle anywhere in the graph, the 119→127→128→119 **GEM** cycle.

## New discriminating null experiment

The graph rule and source-selected start were frozen before the following
calibration. A single reproducible PRNG seed **0x33010331** feeds
100,000 Fisher–Yates permutations in each of three source-preserving nulls:

- **Global:** shuffle all 256 authentic bytes, preserving the complete multiset.
- **Row:** shuffle only within each of the 32 original eight-cell rows, preserving
  every row's byte multiset.
- **Column:** shuffle only within each of eight 32-cell columns, preserving
  every column's byte multiset.

For each table, enumerate all simple directed three-cycles, count whether
any spells G→E→M in cyclic reading order, and follow the exact source-selected
one-based cell103 to test whether it actually reaches a GEM three-cycle.
An additional, more conservative event allows **any English three-GP-rune
word** as the reached cycle instead of postselecting GEM. The fixed
[TextBlob English frequency source](../resources/control/english_wordfreq_textblob.txt)
has **753 distinct three-rune sequences** under original-source-calibrated
GP29 spelling including ING/IO contractions; GEM is one such sequence.

| Null (100,000 each) | At least one three-cycle | GEM cycle anywhere | Start103 reaches any three-cycle | Start103 reaches GEM | Start103 reaches any GP-native English 3-rune word |
| --- | ---: | ---: | ---: | ---: | ---: |
| Global shuffle | 90,707 | 68 | 6,892 | **2** | **592** |
| Within-row shuffle | 88,372 | 1,520 | 5,107 | **61** | **185** |
| Within-column shuffle | 92,178 | 198 | 7,216 | **19** | **717** |

The exact-GEM conjunction frequencies are **0.000020**, **0.000610**
and **0.000190**, whereas accepting *any of 753 dictionary GP three-rune
words* gives **0.00592**, **0.00185** and **0.00717**, respectively.
These are *conditional artificial null frequencies*. Existence of an ordinary
three-cycle is commonplace, and the more generous word criterion directly
shows how a researcher-selected English label changes the apparent rarity.
Row conditioning sharply increases the exact-GEM rate, further cautioning
against relying on the strong global-shuffle estimate. A synthetic positive is unnecessary:
the script reconstructs and asserts all five original cells and their
exact graph links before simulating permutations.

**Caveat on multiplicity:** GEM was *noticed in a searched graph*, the
29q+r/keypad convention was investigator-selected, and the use of prime
**ordinal** 103 rather than the literal dimension was also a researcher
choice. Even the **any-word** frequencies are **not corrected p-values** for
trying many encodings, image dimensions, starting coordinates or navigation
rules. The dictionary adjustment covers label selection within one frozen
GP29 English vocabulary, not the entire route search. The
table is not assumed to have been randomly shuffled by its maker.
Consequently this result raises a question worth testing historically,
without statistically authenticating an intended instruction.

## Causal decision and next test

A human solver could see the signed instruction about numbers/direction
and encounter a 256-number original table. The **missing causal step** is
independent period-authentic evidence selecting *quotient/remainder by 29*,
the keypad orientation and a **prime-ordinal start from an image dimension**.
Look for that selector in original images, signed pre-2016 instructions or
historical 2016 solver evidence **before** treating GEM as a key. A surviving
historical selector, followed by a new precommitted operation yielding
coherent original ciphertext-derived plaintext, would advance this route.
A source-supported alternative navigation convention that fails the
precommitted GEM prediction would retire it.

Direct use of GEM as a repeating byte key against a separate speculative
p55 quintet packet has already been tested and rejected within 21 fixed
consumers in [the GEM byte report](lp2-p50-gem-p55-quintet-binary-direct-consumer.md).
Do **not** expand arbitrary GEM phases or byte operators to rescue that
negative. This original-table finding stands only as an independently
calibrated clue; **no new LP2 text is decrypted**.

**Reproducer:** [Node22 CommonJS SFT](../sims/lp2_p50_gem_prime103_shuffled_table_sft.cjs),
which asserts the unchanged original path and the exact deterministic
three-null counts using the checked-in authentic byte table.
