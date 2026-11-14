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
If the source-image start is **not fixed** and we accept *an English-labelled
three-cycle anywhere among all 256 cells*, the event occurs in
**17,478/100,000**, **16,031/100,000**, and **18,877/100,000** global,
row and column shuffles. Even retaining the original property of **exactly
one** three-cycle, a coincidentally English-labelled unique cycle occurs
**2,029**, **2,223**, and **1,892** times per 100,000. An English word
somewhere in the complete graph is therefore common (~16–19%). The unusual
conjunction depends on independently motivating the specific width→prime
ordinal→cell103 selection; without that source-selector its probability
cannot be assessed from the exact-GEM frequencies alone.
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

## Original literal GEM standard-OutGuess consumer (Agent 10, 14 November 2026)

The adjacent original p48 ciphertext's sole `GEMY` fourgram and the exact
table three-cycle `G→E→M` make **`GEM` itself** a more local password
candidate than a semantic paraphrase. The [manually executed original-JPEG
OutGuess run 43645626593](https://github.com/FlareZ123/liber-primus/actions/runs/43645626593)
tested exactly the uppercase three-character key `GEM`, on the untouched
**58 original LP2 JPEGs**. The pinned historical extractor and native
controls were the same as for the `TROJANHORSE` test below.

All **58 attempts** completed as tests: **19** yielded nominally
header-consistent raw buffers; **36** ended by SIGFPE and **3** with exit
code1. **None of the 19 extracted buffers had recognizable PGP, ZIP, gzip,
PNG, or natural printable text content.** All 19 apparently valid outputs
were exactly **57,277 bytes**, reported seed **30798**, and shared the exact
first 32 bytes
`4e78bddfe987781569e9150150520f87d79ebf3575286b62805e4852bd652c42`,
with different full-file hashes. Their ~**7.997-bit/byte** entropies are
random-like; neither their validity-looking headers nor apparent raw bytes
authenticate a payload. Most decisively, the **payload-free** synthetic
JPEG tested with the same exact key also yielded a false-positive consistent
header (seed **64366**, length **22405**), again without recognizable
content. The synthetic known-key embedded message **47/47 bytes** and
historical original LP1 default-key source controls both passed. This
makes the negative interpretable as a scope-bound test, with original raw
outputs preserved as Actions artifact
[14134570338](https://github.com/FlareZ123/liber-primus/actions/runs/43645626593/artifacts/14134570338).

**Decision:** literal source-picked `GEM` does **not** reveal a
recognizable standard-OutGuess message on any original LP2 JPEG, and valid
headers alone are explicitly unreliable. This rules out only that precise
key, carrier set, and extraction/recognition method; intentionally encrypted
opaque binary and alternate operations remain logically possible. Do not
repeat or expand passphrase variants without independently sourced
instructions. The page-neighbor **original rune** use of the same three-GP
key is independently excluded under the authenticated plaintext-F
Vigenère rule in the [strict-F original gate](lp2-p50-gem-p55-gp29-strictf-original-gate.md).
Neither consumer recovered unknown plaintext, an author key, or a destination.

## Rune-name meaning and a finite steganography consumer (Agent 10, 14 November 2026)

The three actual glyphs on the speculative **G→E→M** cycle are
**ᚷ (Gyfu: gift), ᛖ (Eh: horse), and ᛗ (Mann: man)** in the
[traditional Anglo-Saxon rune names](https://www.tha-engliscan-gesithas.org.uk/written-and-spoken-old-english/old-english-alphabet-2/the-anglo-saxon-rune-poem/).
Thus the same three runes admit the distinct literal-name gloss **GIFT–HORSE–MAN**.
A *Trojan horse* is one conceivable semantic association because the
traditional story involves a gifted horse concealing people. This inference
was noticed **after** GEM was found, has multiple semantic alternatives,
and the original 2016 instruction about word *meanings* does not expressly
tell a solver to apply rune-poem nomenclature to this graph. The simpler
reading of `GEM` as Gematria remains available. No author-selected
password follows from the gloss.

To make the association falsifiable without opening a free password search,
one exact candidate consumer was tested: **OutGuess extraction with the
literal uppercase key `TROJANHORSE`** on all 58 unmodified original LP2
JPEGs, using the project's pinned OutGuess extractor. A [successful,
archived manual Actions run 43644148894](https://github.com/FlareZ123/liber-primus/actions/runs/43644148894)
performed **58/58 extractions** and preserved their raw outputs in artifact
`outguess-lp2-keyed` (artifact ID `14133033431`).

**Result: zero recognizable extracted payloads.** All 58 source images
produced nominally header-consistent outputs of **18,520 bytes**, identical
reported seed **50932**, and the same initial 32 bytes
`f4c65848359d3a3d664e1157b964bcfada517e36be2023b69b8f75afc3f43a12`;
the output digests differ with the JPEG and have entropy around
**7.99 bits/byte**, with roughly **38%** printable characters. Neither
PGP, ZIP, gzip, PNG nor ordinary printable text was recognized.
The original LP1 image 00.jpg/08.jpg default-key extraction controls passed;
a synthetic **47-byte embedded message** was recovered exactly under key
`79`. Crucially, an independent, deliberately **payload-free** synthetic
JPEG probed under `TROJANHORSE` also yielded a false-looking valid
seed/length header (**61134 / 30077 bytes**) with unrecognizable binary
content. Header-consistency therefore offers no evidence that the 58
high-entropy original outputs contain authentic hidden messages.

**Decision:** the exact `GIFT–HORSE–MAN → TROJANHORSE → standard OutGuess`
consumer fails to identify a valid LP2 payload. Preserve the raw
outputs as potential reproducible negatives, without treating false
headers as hidden material. This does not exclude a genuinely encrypted
binary payload, a different original selected passphrase or a distinct
steganographic operation. **Do not expand case, synonym or password
variants** absent a new original instruction. No unknown LP2 plaintext,
original key or destination was recovered.

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
