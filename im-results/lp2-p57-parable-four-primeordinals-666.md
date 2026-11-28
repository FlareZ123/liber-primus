# LP2 PARABLE: all four printed units are prime sums, with prime ordinals totaling 666

**13 November 2026, Agent 8. Classification: exact original-source numerical identity with an unresolved authorial interpretation. This is a candidate historical pointer, not decoded unknown LP2 prose, a key, or a validated cipher operation.**

## The source-fixed extraction

The **cleartext** final LP2 physical page **p57** (original archive `74.jpg`) prints the red title **PARABLE** and three sentences, each terminated by a visible period. Without choosing phrase fragments, original rune indices or arbitrary cut points, partition the complete 95 original GP29 runes at those four periods, preserving rune digraph spelling (e.g. `NG`, `IU`) and crossing printed line wraps normally.

For each complete unit, sum the established Gematria Primus *prime value* assigned to every original printed rune, and compute that sum's **one-based ordinary-prime ordinal** (i.e. the number of primes no larger than the sum):

| Original text unit | GP rune count | GP-prime sum | Ordinary-prime ordinal |
|---|---:|---:|---:|
| PARABLE | 7 | **449**, prime | **87** |
| LIKE THE INSTAR TUNNELING TO THE SURFACE | 30 | **1259**, prime | **205** |
| WE MUST SHED OUR OWN CIRCUMFERENCES | 30 | **1031**, prime | **173** |
| FIND THE DIVINITY WITHIN AND EMERGE | 28 | **1229**, prime | **201** |
| **All original p57 printed units** | **95** | **3968** | **666** |

In particular, **87 + 205 + 173 + 201 = 666** exactly. All four original period-delimited GP-prime sums are themselves prime. The source's four units and GP alphabet values are independent of this numerical observation; the ordinal-sum target `666` was recognized only after computing them.

The `666` value is historically associated with Aleister Crowley, whose *Book of the Law* was used in an earlier Cicada round. This supplies a plausible, historically grounded **hypothesis** about where an intended solver might seek a book-code source or next key, but the manuscript provides no instruction to interpret this ordinal sum as an external title, index scheme or cipher. Crowley association alone does not identify which word, verse, edition, key or operation would decrypt an LP2 rune.

## Independent solved-page control: AN END selects 64

On the immediately preceding solved LP2 p56, the authentic phi(prime) decoder converts the first five **red original ciphertext runes** to **AN END**: GP indices `[24,9,18,9,23]` (original ciphertext indices `[25,11,22,15,4]`; the first five prime-totient subtractions are `[1,2,4,6,10]`). Their original GP-prime weights are **[97,29,67,29,89]**, summing to **311**. This is the **64th ordinary prime**. The same printed p56 text explicitly displays a **128-hex-character hash = 64 bytes**.

This is a *source-independent target size* for the same prime-ordinal operation that yields 666 on p57. It gives a historically plausible reader-facing hint to try **prime ordinals** on solved text, rather than arbitrarily selecting that function after observing 666. It does **not** prove the cipher author intentionally encoded the digest length in the heading: SHA-512-class 64-byte digests are conventional, AN END is a meaningful title without any number theory, and there is no explicit instruction to sum prime weights of decoded headings. The p57 printed body contains **88** runes after its seven-rune PARABLE heading; 87 is also its number of adjacent body-rune gaps, a further exact dimensional check but **not an independent clue to a key**.

**Constrained continuation:** the historical 2013 Crowley code used **Chapter:Verse:Character** coordinates. If one hypothetically treats the four PARABLE prime ordinals as *global verse ordinals* over the same 2013 Book of the Law chapters, their fixed ranges of 66,79,75 verses select **II:21, III:60, III:28, III:56**. The first words of those existing verses read **WE / THERE / ALSO / ALSO**, with no recognizable four-word instruction. The original chapter/verse/character grammar does not supply a character position for any of these four proposed global-verse addresses, so this candidate lacks a complete book-code rule. A direct, source-ordered GP-native repeating Vigenère reading of the concatenated four original verses (448 GP runes) on LP2 p0 yields IoC **0.03488 / 0.03518** in the two arithmetic directions; it produces no native-English plaintext, whereas the known solved-source GP register is much less uniform. This is a bounded, provisional consumer, not an exhaustive test of Crowley-derived keys.

## A finite source-inventory diagnostic

The original rune inventory and title are kept fixed in 100,000 deterministic seeded surrogates; all three body segments retain their original rune counts **30/30/28**. The source-units-all-prime event appears **367/100,000**, and the additional ordinal-total `666` event **52/100,000**. A separate shuffled-original-word control preserves all nineteen complete body words and fixes original group word counts **7/6/6**: **416/100,000** are all prime and **76/100,000** also total 666. Of those shuffled-word assignments, **279** accidentally preserve all three original GP rune counts, **two** have all-prime sums, and **zero** additionally total 666. These are *diagnostics under simple unnatural nulls*, not adjusted probabilities of designer intention. Across the broader manuscript, extensive numeric clue searches prevent interpreting the small fractions as a global discovery p-value.

The [self-contained original-input Node SFT](../sims/lp2_p57_primeordinal666_source_sft.cjs) reads `resources/liber-primus/lp2-transcription.txt`, verifies that all original 95 rune indices match the independent canonical `lp2-corpus.json`, computes prime ordinals and reproduces the fixed-inventory surrogates. It uses no substituted unknown plaintext.

## Middle-sentence ordinal differences address a zero-F `THOTH` at original p32 (Agent50, 28 November 2026)

**New original-source conditional plaintext-looking fragment; not a decipherment or authenticated key.** The complete printed p57 title/body ordinal vector **[87,205,173,201]** is established above. The source's middle body sentence instructs **“WE MUST SHED OUR OWN CIRCUMFERENCES”**; its immediately prior and following sentences have ordinal **205** and **201**, compared with the middle **173**. If the solver subtracts that middle anchor from each neighbor in original printed order, the completely determined difference packet is:

```
π(1259) − π(1031) = 205 − 173 = 32
π(1229) − π(1031) = 201 − 173 = 28
```

Interpreting `(32,28)` as **physical LP2 page32, zero-based rune offset28**, the *unchanged original JPEG 49.jpg* and the canonical LP2 transcription show exactly five consecutive GP29 glyphs:

```
p32 offsets: 28  29 | 30  31  32
runes:       TH   F | F    O   TH
raw text:    ᚦᚠ-ᚠᚩᚦ.
```

The vertical line above is the **original printed word separator**, *not* a single contiguous printed word. Its two adjacent F runes are specifically the **last rune of one complete printed word and the first rune of the next**—the two *facing word circumferences*. A literal local reading of “shed our own circumferences” is therefore to discard those two touching outer runes, leaving **`TH-O-TH` / `THOTH`**, the name of an Egyptian divinity associated with writing and knowledge. Independently, the rune **F has GP29 index0**; zero-glyph deletion also removes that exact pair. These are two interpretations of the **same two physical deletions**, not independent evidence or an authenticated cipher rule. The neighboring solved p57 sentence says **“FIND THE DIVINITY WITHIN AND EMERGE”**. This makes the entire path more meaningful than an isolated page-number collision: two full original p57 clause sums → simple center subtraction → fixed page/rune address → two printed facing word-edge deletions → a divinity name explicitly fitting the final source sentence. The preceding solved p56 cipher also treats **plaintext** F specially as a non-consuming pass-through; that makes F a historically recognizable symbol to examine, though *it does not validate erasing ciphertext F*.

The **complete printed word containing the addressed first rune** is p32 offsets **25–29**, GP transliteration `IA-R-T-TH-F` (five runes; the hyphens here separate glyph names, not printed words). Its original GP-prime weights `107+11+59+5+2` sum to **184**. The *first complete word* of the first solved p57 body sentence is **LIKE**, natively GP `L-I-C-E` with prime weights `73+31+13+67`, also summing to **184**. This is a second exact source-to-target checksum inside the same candidate path: source body1 both supplies rank205 and opens with LIKE184; its nominated page32 contains the 184-sum word enclosing the proposed offset28. The addressed offset is **not itself a printed word beginning**—it is the fourth rune of that p32 group—and the sum equality was noticed retrospectively. It cannot certify key or plaintext, especially after the many possible manuscript word/number comparisons.

Two exact scope controls using the unmodified complete p0–55 ciphertext are included in the [existing prime-ordinal SFT](../sims/lp2_p57_primeordinal666_source_sft.cjs):

* The book has only **four adjacent F–F doublets** at physical positions **p9@62, p29@87, p32@29, p36@69**. **Only p32@29 straddles any actual printed word separator**; the other three are word-internal. Thus this is the book's only original two-facing-zero-rune seam, not just one of many F-F word joins.
* Removing all index0 F glyphs in each page solely as a *diagnostic*, **`TH-O-TH` occurs exactly once** across 12,956 unknown ciphertext runes, at original p32 positions **28,31,32**. The source packet points precisely to that surviving triple's first rune.

**Weakest premises and stopping gate.** The 2016 signed direction hint and the p57 words nominate numerical navigation, but no first-party command authorizes (1) taking ordinal *differences* rather than prime sums/ranks, (2) choosing `page:rune` versus another address type or choosing zero-based rune origin, or (3) deleting the two facing printed word-edge runes (which happen to be ciphertext F) rather than other circumferences, or equivalently treating zero-F as deletable in the unknown cipher. The solved p56 F skip is a property of its *plaintext-F* transparent cipher; ciphertext-F may encode a non-F rune. The output `THOTH` was noticed while examining the address, not prospectively registered as a required divine name, and other source-guided attempts across the repository create strong postselection risk. **It is not recovered plaintext**: the other original runes remain encrypted, and no key schedule or canonical consumer of `THOTH` has been independently established. This is a bounded candidate **human solve-path clue**: test a next operation only if an authentic original instruction fixes how this exact three-GP-rune name is to be used and where. Do not escalate to arbitrary THOTH/Book-of-Thoth hashes, Vigenère phases, steganography passwords or literary keyword scans on the strength of the match.

## Cryptanalytic decision

This is a **source-defined four-unit numerical relationship** worth preserving and independently assessing: it requires no invented 2016 page/word address grammar, and it uses the same prime numerology explicitly honored in solved LP1 text. Unlike the separate [p57 title-449 modulo/page-line/prime449 hypothesis](lp2-onion7-133-331-p13-line3-primesum.md), this identity comes directly from all printed cleartext units without tuning unknown LP2 ciphertext. The independently solved p56 title-to-hash-size match makes this more promising as a possible human-solve-path clue, although its authorial status is still unproven.

**Open dependency:** find a source-authenticated operation in the 2013–2016 Cicada historical trail that tells a solver to convert sentence GP-prime sums into *prime ordinals* and use `666`, or the now documented `(32,28)→THOTH` candidate, as a specified title, coordinate, password, key derivation, or navigation command. Then freeze that operation and test original undeciphered glyphs. Without such a rule, the identity may be an attractive accidental arithmetic property and must not be promoted as a solved plaintext route.
