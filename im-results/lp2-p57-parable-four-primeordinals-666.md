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

A useful address-type constraint is that original **p32 has 121 rune instances but only 22 locally printed word groups** (and six printed text lines). Thus the second coordinate **28 is out of bounds for ordinary “word 28” or “line 28”** addressing on p32; a zero-based *rune* or raw-character interpretation remains possible. This is a constraint, not proof that the author intended that coordinate type. 

The vertical line above is the **original printed word separator**, *not* a single contiguous printed word. Its two adjacent F runes are specifically the **last rune of one complete printed word and the first rune of the next**—the two *facing word circumferences*. A literal local reading of “shed our own circumferences” is therefore to discard those two touching outer runes, leaving **`TH-O-TH` / `THOTH`**, the name of an Egyptian divinity associated with writing and knowledge. Independently, the rune **F has GP29 index0**; zero-glyph deletion also removes that exact pair. These are two interpretations of the **same two physical deletions**, not independent evidence or an authenticated cipher rule. The neighboring solved p57 sentence says **“FIND THE DIVINITY WITHIN AND EMERGE”**. This makes the entire path more meaningful than an isolated page-number collision: two full original p57 clause sums → simple center subtraction → fixed page/rune address → two printed facing word-edge deletions → a divinity name explicitly fitting the final source sentence. The preceding solved p56 cipher also treats **plaintext** F specially as a non-consuming pass-through; that makes F a historically recognizable symbol to examine, though *it does not validate erasing ciphertext F*.

The **very next original printed group after the period** at p32 offset32 starts at offsets **33–36** with the exact GP29 ciphertext glyphs **H-O-M-E**. Thus the *local source window*, after the candidate facing-edge deletion alone and with original punctuation retained, reads **`THOTH.HOME`** as a *seven-rune visible motif*, not an entire decoded sentence. The `HOME` fourgram was already known and examined at p32 in the [pre-existing whole-book word-start control](lp2-p32-home-wordstart-english-prefix-familywise.md), which found its *stand-alone* English-prefix significance vanished after comparable-start correction (familywise p≈0.9456). Treat the two adjacent readable groups as a single postselected motif and possible clue to a divinity's locale or book source, **not** as two independently decrypted plaintext words or an actual geographic destination.

The **complete printed word containing the addressed first rune** is p32 offsets **25–29**, GP transliteration `IA-R-T-TH-F` (five runes; the hyphens here separate glyph names, not printed words). Its original GP-prime weights `107+11+59+5+2` sum to **184**. The *first complete word* of the first solved p57 body sentence is **LIKE**, natively GP `L-I-C-E` with prime weights `73+31+13+67`, also summing to **184**. This is a second exact source-to-target checksum inside the same candidate path: source body1 both supplies rank205 and opens with LIKE184; its nominated page32 contains the 184-sum word enclosing the proposed offset28. The addressed offset is **not itself a printed word beginning**—it is the fourth rune of that p32 group—and the sum equality was noticed retrospectively. It cannot certify key or plaintext, especially after the many possible manuscript word/number comparisons.

Two exact scope controls using the unmodified complete p0–55 ciphertext are included in the [existing prime-ordinal SFT](../sims/lp2_p57_primeordinal666_source_sft.cjs):

* The book has only **four adjacent F–F doublets** at physical positions **p9@62, p29@87, p32@29, p36@69**. **Only p32@29 straddles any actual printed word separator**; the other three are word-internal. Thus this is the book's only original two-facing-zero-rune seam, not just one of many F-F word joins.
* Removing all index0 F glyphs in each page solely as a *diagnostic*, **`TH-O-TH` occurs exactly once** across 12,956 unknown ciphertext runes, at original p32 positions **28,31,32**. The source packet points precisely to that surviving triple's first rune.

### Bounded original-source payload consumer: literal `THOTH` fails on both associated JPEGs

The conditional p32 address makes literal uppercase **`THOTH`** a genuinely source-derived key candidate, distinct from an arbitrary occult wordlist. Earlier Cicada rounds genuinely extracted signed OutGuess payloads from JPEGs, so apply the **unchanged native-compatible OutGuess 0.4 key format** to exactly two original image carriers: p32's original merged-image `49.jpg`, selected by `(32,28)`, and p55's original merged-image `72.jpg`, independently linked through the same tree artwork and 76-rune panel clue. Neither the manuscript nor any original signed instruction commands this JPEG transfer, so this is a single finite test, not a general steganographic claim.

The source-faithful local run used unmodified originals from the project's original 75-image ZIP and the checked-in C/libjpeg DCT bitmap algorithm with OutGuess ARC4 iterator. A **genuine same-algorithm positive**, original LP1 `03.jpg` under the historically established `Default key`, recovered **31,809 bytes**, starting `-----BEGIN PGP SIGNED MESSAGE-----`, SHA-256 `a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1`. The identical finite gate is retained as [read-only source reproducer](../sims/lp2_agent50_thoth_outguess_source_sft.py) and [source-specific GitHub Actions workflow](../.github/workflows/agent50-thoth-source-outguess.yml). **Independent original-input Linux CI PASS:** [run 46095522744](https://github.com/FlareZ123/liber-primus/actions/runs/46095522744) reproduced both original-image negative SHA-256 values and the authentic 31,809-byte 2012 signed payload positive, with zero recognizable payloads under `THOTH`.

| Original carrier | Fixed passphrase | Extractor status | Apparent output | Entropy | Printable fraction |
| --- | --- | --- | ---: | ---: | ---: |
| p32 `49.jpg` | `THOTH` | header permits read, **source-forced false header** | 19,005 bytes | 7.99047 bits/byte | 0.38206 |
| p55 `72.jpg` | `THOTH` | header permits read, **source-forced false header** | 19,005 bytes | 7.98987 bits/byte | 0.38537 |

Both originals begin with **1,024 eligible OutGuess coefficient parity bits set to one**, forcing the *same* ciphertext header `ffffffff` for any key and making the apparently valid `529a3d4a` decrypted header, seed 39506 and length19005 spurious. Their recovered pseudo-payloads begin with exactly the same bytes `529a3d4a4cce910dfe752762d45e3688` and share substantial output prefix; neither has a recognized file magic, OpenPGP armor or readable UTF-8. The full SHA-256 values are `c439fdb1cb0d7771719ccb39440582407f39cc9ff2171227b7479287cd5d2946` (p32) and `db1919e917beb1d6daafe22f4251d4598960cc2639db65c23e014a2e2a8a6765` (p55). Retire **this exact two-carrier `THOTH` OutGuess password**; do not reinterpret a source-forced header as an encrypted hidden plaintext.

### Conditional unchanged-crib GP29 q11 receiver — Agent48, 28 November 2026

The adjacent ciphertext sequence `TH F F O TH H O M E` at p32 offsets 28–36 supplies a **conditional placed identity crib**, not a key or recovered sentence. This test grants the proposed two facing F holds, retains all nine original glyph positions (does not erase any ciphertext), and asks whether the other seven are literal plaintext under one historically demonstrated GP29 additive transparent-plaintext-F receiver. The inferred 121=11×11 p32 reflow supplies the exploratory period 11. Neither the identity-crib assumption nor period choice is independently authenticated; HOME is also the prefix of an eleven-rune printed group, not a verified complete word. The prior [q11 block-permutation gate](lp2-p32-joint-q11-blockperm.md) has ordinary consumption and no F holds; it is a distinct model.

For the receiver, `C[i] = P[i]+K[j] mod29` for nonzero plaintext, consuming one phase; P=F gives C=F without consuming. The phase at offset28 is defined as zero (a cyclic naming convention). The seven consecutive consuming crib runes require K[0..6]=0, leaving **every** assignment of K[7..10] in GP29. Both printed Fs at offsets29/30 are forced true holds only as part of this conditional crib; every other C=F is exhaustively branched as a literal hold or consuming non-F output. For a fixed hold mask, the phase path is fixed and every consumed position excludes K[j]=C[i]. A spacing-free rounded trigram language objective factors into constant, unary, adjacent pair and adjacent triple contributions on the four unknown phases. Exhaustive enumeration of the remaining four variables gives the exact global maximum under that objective, with no key shortlist, beam, assumed printed word boundaries, or original-trained language model. Every returned candidate is asserted against exact forward replay and the nine-rune crib. Counts below are legal (hold mask,key) assignments, not distinct linguistic plaintexts.

Fit only physical offsets 0–79, freeze the best key, initial phase and fitted hold path, and then enumerate every legal continuation through offsets80–120 without key changes. Independently compute the complete 121-rune objective maximum. The first bigram implementation recovered both complete native control keys but failed the locked prefix gate for WELCOME (73/80 fit, 37/41 held, wrong key); original was not opened in that run. Refine to the trigram objective, using 602,514 training GP runes from the separately pinned literary donors and solved native sections, excluding WELCOME, KOAN and PARABLE. Fresh controls are four disjoint 121-rune windows from the separately held Hapgood 1906 and Bellows 1923 texts, selected by the same nine-position geometry (non-F endpoints, exactly two internal Fs), without original scoring. The frozen gate required both development native controls and at least three of four fresh controls to recover the exact fit key, ≥75/80 fit runes, ≥38/41 held runes and ≥115/121 full runes. All six passed **exactly**: 480/480 fitted, 246/246 withheld, 726/726 full, six exact keys. These are matched planted-receiver controls, not independent evidence of the original cipher or a universal natural-language threshold.

| Objective (nats/rune) | Six controls, range | Original p32 |
| --- | ---: | ---: |
| Fit first80 | −2.8964 to −2.2166 | **−5.2836** |
| Frozen continuation41 | −2.3478 to −2.0381 | **−6.7190** |
| Exact full121 maximum | −2.7097 to −2.1906 | **−5.5989** |

Original prefix: 2 hold masks tested, 1 legal, 291,456 legal assignments. Its unique selected path uses key `[0,0,0,0,0,0,0,18,4,7,21]`, initial phase5, holds29/30/42 and phase5 at the cut. There is exactly one legal continuation, nonprose. The full original exact optimization has 4 hold masks, 1 legal, **203,742** legal assignments, maximum key `[0,0,0,0,0,0,0,18,4,20,14]`, phase5, holds29/30/42/114. All replays pass; neither full output nor frozen continuation is coherent. The complete decoded sequences, keys and controls are retained in the raw output. The continuation is a within-invocation holdout, not collectively unseen ciphertext.

**Decision:** retire this precise unchanged-motif q11 additive F-hold hypothesis. The exact score ceiling lies below every matched control, and the original-selected key has no predictive continuation. This does not prove that the visible motif cannot be an intentional clue, rule out other periods or transpositions, or establish a different plaintext. The result does not authorize further ad hoc THOTH keys or phase variants. An authenticated consumer or genuinely independent plaintext/operation selector is still needed.

[Bigram SFT](../sims/lp2_p32_thoth_home_q11_fhold_exact_sft.cjs) · [bigram control output](lp2-p32-thoth-home-q11-fhold-exact-output.json) · [exact trigram SFT](../sims/lp2_p32_thoth_home_q11_fhold_trigram_exact_sft.cjs) · [complete trigram output](lp2-p32-thoth-home-q11-fhold-trigram-exact-output.json). The core ran in connected V8 using the committed repository inputs; standalone Node wrapper and CI were not independently run. Reproduce with Node from repository checkout. No authoritative synthesis change: no unknown plaintext or key.


### Distinct evolving lag-11 receiver (Agent4, 28 November 2026)

The conditional identity motif also fails a time-varying affine extension on the consuming clock: K[t+11]=a K[t]+b mod 29. Exact search of all 811 nonstationary pairs and all initial seeds/F masks gives 102,972,400 feasible prefix assignments, unique best prefix without a legal continuation, and full-page maximum -4.615307 nats/rune across 46,679,837 assignments. Two planted native controls recovered all 242 runes and both complete keys; their true full scores are approximately -2.27/-2.31. Retire this precise family, preserving the unauthenticated status of the motif. [Report and reproducer](lp2-p32-thoth-home-q11-affine-feedback.md).


### Historical book-code typed address and direct receiver (Agent14, 28 November 2026)

The same ordered differences `32,28` admit a different, historically grounded reading: concatenate their decimal representations as `3228`, and split into three positive fields using the exact chapter:verse:character grammar of the **signed 2013 Book of the Law** challenge. This is a conditional reuse of that authentic grammar, not an LP2 command. In the pinned historical carrier there are precisely two legal segmentations:

| Address | One-based literal output | First case-sensitive occurrence in verse | Compatible with historical first-occurrence sender? |
|---|---|---:|---|
| III:2:28 | m | 28 | yes |
| III:22:8 | e | 3 | no |

Chapter III verse 2 begins with the phrase “There is division hither homeward”; the selected m is the third letter of the word **homeward**, whose first four letters are the independently observed p32 HOME prefix. Across all three exact pinned source chapters, the only whole word beginning HOME is this word, and the sole whole-word match to THOTH / TAHUTI / TEHUTI / HERMES is **Tahuti at II:39, character 13** (Thoth's historical alternate name). Thus both parts of the original visible `THOTH.HOME` motif have an exact limited textual referent in the already-authenticated historical book-code carrier. The signed 2013 first-occurrence grammar discriminates the two decimal splits, but the full forward cursor constraint cannot be checked without a preceding record. The string concatenation, the choice of this carrier and interpretation of the containing word are analyst-selected; the match is postselected relative to HOME and cannot be counted as independent discovery significance. Source chapter blobs: I `64876892683fab1467481fe87d85743a8ea17982`, II `cb4353b080d7584441f85502aeccb60796e6fe0f`, III `36e716252a271d31f5c4ba25b3cb78199ccc1114`. The alias relation is independently attested in Crowley's [Book 4, Chapter II](https://hermetic.com/crowley/book-4/chap2); its appearance in the carrier is not a second Cicada-authored key instruction.

**Actual inverse:** Freeze the one direct historical record output M (GP ordinal 19), the containing word HOMEWARD (eight native GP indices [8,3,19,18,7,24,4,23]), and the complete selected verse III:2 (108 GP runes under the explicitly documented native conversion). Apply each unchanged from phase zero to all 121 original p32 runes using additive subtraction, with ordinary consumption and exhaustive native plaintext-F transparent holds as distinct receivers. No phase or key search, no original-fitted crib, no ciphertext-F erasure. For comparison, use a 1,504-rune native trigram model trained on the other solved native sections, excluding WELCOME, KOAN, p56 and p57. Plant the same six encoders on two 121-rune withheld authentic controls.

| Exact source operand | Ordinary original score (nats/rune) | Original F-hold inverse paths | Planted truth retained |
|---|---:|---:|---:|
| M | -4.76877 | 0 | 4/4 |
| HOMEWARD | -4.67437 | 0 | 4/4 |
| full III:2 | -4.33562 | 0 | 4/4 |

All six ordinary planted cases recover exact plaintext (121/121 each). All six F-hold planted cases retain the exact true path; score ranking recovers 121/121 in four of six, 112/121 and 109/121 in the other two. The true native control scores are -2.83275 and -2.27664. The three original ordinary inverses replay exactly but are nonprose; all three native F-hold original inverse sets are empty, a stronger exact necessary-condition failure independent of language scoring. The actual original JPEG 49 was directly inspected for the local layout; computation uses canonical rune indices.

[Reproducer](../sims/lp2_p57_3228_historical_bookcode_homeward_sft.cjs) and [complete actual output](lp2-p57-3228-bookcode-homeward-output.json), commits `05c5f691ff1e534a7eff5b305536a4d6fdbeacbb` and `cbe845b164829989d5b714a8dfadc8462d73fba8`. Core executed in connected V8; standalone Node wrapper not independently run.

**Decision:** preserve the conditional, uniquely first-occurrence-compatible book-code reading as an alternative to a purely physical page:rune pointer. Retire these three fixed phase-zero additive consumers. No evidence yet determines whether the output m is one character of a longer record stream, whether HOMEWARD selects another operation, or whether the entire match is coincidental. A new source-defined sequence of typed records or an independently specified receiving operation is required; do not manufacture additional decimal arithmetic or tune these candidate keys.

**Weakest premises and stopping gate.** The 2016 signed direction hint and the p57 words nominate numerical navigation, but no first-party command authorizes (1) taking ordinal *differences* rather than prime sums/ranks, (2) choosing `page:rune` versus another address type or choosing zero-based rune origin, or (3) deleting the two facing printed word-edge runes (which happen to be ciphertext F) rather than other circumferences, or equivalently treating zero-F as deletable in the unknown cipher. The solved p56 F skip is a property of its *plaintext-F* transparent cipher; ciphertext-F may encode a non-F rune. The output `THOTH` was noticed while examining the address, not prospectively registered as a required divine name, and other source-guided attempts across the repository create strong postselection risk. **It is not recovered plaintext**: the other original runes remain encrypted, and no key schedule or canonical consumer of `THOTH` has been independently established. This is a bounded candidate **human solve-path clue**: test a next operation only if an authentic original instruction fixes how this exact three-GP-rune name is to be used and where. Do not escalate to arbitrary THOTH/Book-of-Thoth hashes, Vigenère phases, steganography passwords or literary keyword scans on the strength of the match. The source-bounded JPEG-key use, separately conditional q11 placed-identity-crib receivers, and the historical III:2 phase-zero additive consumers have all been tested and are negative.

## Cryptanalytic decision

This is a **source-defined four-unit numerical relationship** worth preserving and independently assessing: it requires no invented 2016 page/word address grammar, and it uses the same prime numerology explicitly honored in solved LP1 text. Unlike the separate [p57 title-449 modulo/page-line/prime449 hypothesis](lp2-onion7-133-331-p13-line3-primesum.md), this identity comes directly from all printed cleartext units without tuning unknown LP2 ciphertext. The independently solved p56 title-to-hash-size match makes this more promising as a possible human-solve-path clue, although its authorial status is still unproven.

**Open dependency:** find a source-authenticated operation in the 2013–2016 Cicada historical trail that tells a solver to convert sentence GP-prime sums into *prime ordinals* and use `666`, or the now documented `(32,28)→THOTH` candidate, as a specified title, coordinate, password, key derivation, or navigation command. Then freeze that operation and test original undeciphered glyphs. Without such a rule, the identity may be an attractive accidental arithmetic property and must not be promoted as a solved plaintext route.
