# Source-selected p50 table column XOR: MY closure, THEN/HEAD, and a failed p55 inverse

**Agent14, 17 November 2026. Classification:** exact conditional source-arithmetic closure and intriguing short textual fragments, with a successful original-cipher/key-skip inverse test. **No unknown LP2 plaintext, author-authenticated cipher/key, or final destination recovered.** The two critical upstream premises remain provisional: the signed 2016 message is used as a numeric address list, and the p50 printed two-character numbers are read in radix60 (the source does not explicitly declare that radix).

## A constrained path from the actual 2016 source to two distinct table columns

The verified 2016 text says the words of Liber Primus are a map and their numbers a direction. The existing [source-word/base58 page address hypothesis](lp2-2016-signed-message-base58-word-map.md) interprets a word's Gematria-Primus prime sum `S` as physical page `S mod58` and zero-based word/cell index `floor(S/58)`. Using this *identical*, previously published rule:

- Signed source **LIES** has prime sum **224 = 58×3+50**, selects the numerical physical **p50** (rune-free), *fourth original printed table cell* (index3) `3D`. The 2016 LIES→p50 selection was already known; interpreting it as the fourth numeric cell is conditional.
- Signed source **THE** has prime sum **72 = 58×1+14**, selects original p14 word1 **FOLD** with prime sum **171 = 58×2+55**. Original p55 has precisely **17 page-local segments**, including incoming p54 carry, with selected segment2 `SB`, prime sum114. The fold-about-the-center partner is segment14 `CEAIMCX`, prime sum284. Their **sum398 = 58×6+50** selects physical p50 *seventh numeric cell* (index6), `1p`. All p55 fold inputs and totals are independently established in [the existing fold report](lp2-2016-p55-fold-circumference-keys.md). The choice to send the folded *sum* back through the same page-address rule is the additional conditional step here.
- The signed source **SEEKS** has prime sum253, selects original p21 word4 **MY**, whose exact GP-prime sum is **174**. The source words in the original signed text actually appear in the clause `epiphany seeks the devoted`; SEEKS/THE are adjacent original message tokens.

With the conventional base60 representation of the original p49–51 two-digit table, the two selected p50 cells are independently **`3D` = 193** and **`1p` = 111**. An *author-historically plausible* bytewise XOR operation (documented in the 2013 CicadaOS stage) gives a new closed original-source equality:

`193 XOR 111 = 174 = GP-prime sum(MY).`

There are **24** unordered original p50 cell pairs among all 104 distinct cell locations with XOR174, but among the **eight cells of p50's first physical row** the (3,6) pair is unique. The equality is exact. The independent source is missing an instruction explicitly to XOR these two selected table bytes, and selecting the operation after seeing the numbers is a considerable inference weakness.

The alternative historical-transcription radix59 convention (remove F-like digit, keep original two-glyph tokens) gives `3D=190`, `1p=109`, and `190 XOR 109=211`, **breaking the MY174 closure**. The agreement therefore supports *this* reading of the grid conditionally; it does not settle the actual intended numeral alphabet across the book.

## Extending the same frozen pair down physical page50's 13 rows

Original physical p50 has **13×8=104** printed numeric cells, with no rune text. Use the same selected columns **3 and6**, zero-based, and XOR the two radix60 byte values at each of its **13 row positions**, in literal printed top-to-bottom order. The result is:

`[174,9,2,250,212,149,48,173,52,137,168,231,8]`

Under the simplest fixed byte→GP rune map `byte mod29`, these become the exact **13 rune ordinals**

`[0,9,2,18,9,4,19,28,23,21,23,28,8]`

and their conventional GP romanization is

`FNTHENRMEADNGDEAH`.

Original forward rune positions **2,3,4** form exact **TH–E–N**, romanized **THEN**. Reading *all 13 source symbols backward*, the first three are **H–EA–D**, romanized **HEAD**. Crucially, when all 28 different unordered column pairs are read using the identical 13-row XOR and byte%29 rule, **only columns (3,6) contain THEN anywhere forward, and only (3,6) begin HEAD backward**. Thus the pair previously independently selected by the 2016/p55 graph has a distinctive *two-direction* word-fragment signal.

The exact six rune-value requirements at original rows `[2,3,4,10,11,12]` are `[2,18,9,23,28,8]`. Each printed row's eight original bytes admit respectively `[1,2,3,2,1,2]` out of 28 unordered pairs yielding those specific residues. If six rows were independently and uniformly shuffled *while their values stayed fixed*, and one fixed pair of columns were always chosen, the exact probability of these six already-specified modules is `(1·2·3·2·1·2)/28^6 = 4.9803865736215336×10^-8` (approximately one in20.1 million). **This is strictly a post-hoc, preselected-target benchmark, not a discovery-adjusted probability.** Both words, their positions, XOR as operator and GP remainder as readout were noticed during the investigation; the human solver has not been given a rule selecting them. The appearance of English words in a 13-rune sample does not alone establish plaintext or intended design.

In the opposite (forward) direction, the 13-rune sequence is mostly nonlinguistic. HEAD and THEN provide possible short navigation instructions, yet no unambiguous complete command or cryptographic operation emerges. Do not silently repair it by deleting or inserting rune values.

## Full original p55 cipher consumer, including exceptional-repeat hypothesis

Because the 2016 **FOLD** already selects p55, a source-bounded first inverse uses the 13 actual row-XOR bytes as a repeating key on **all 76 original p55 GP29 ciphertext runes**. Only two natural fixed byte→rune maps are admitted: `byte%29` and `floor(29·byte/256)`. Each supports `P=(C±K) mod29` as in historical GP Vigenere. Each of p55's three original **F** ciphertext runes can be retained or dropped as a nonconsuming historical A-KOAN-style interrupter (eight subsets). This gives **32 direct original-input candidates** with no invented key phase, guessed crib, unselected table row/column, custom alphabet or non-GP plaintext guess.

A second exact inverse permits at most **one additional key byte per accepted rune** only when the rejected byte *would have produced the preceding observed ciphertext rune using the same tentative plaintext*. The original p55 ciphertext has exactly **one adjacent identical-rune event**, so collision rejections are at least motivated by a manuscript-wide statistical anomaly. Cap skips at eight total, charge the planted-English reference-model path **3.5 log nats per skip**, and keep the same 32 key/sign/F subset settings. This is a finite Viterbi-equivalent enumeration of every qualified skip sequence. Its smoothed GP-native Shakespeare trigram model is independently learned on the first 200,000 original control characters; a source-native p57 cleartext is held out.

**Verified original 76-rune outcomes** from [successful original-input Windows/Node22 run 44068525484](https://github.com/FlareZ123/liber-primus/actions/runs/44068525484):

| Exact scoring receiver | Best variant | Mean GP trigram log likelihood per retained rune | Authentic p57 reference |
| --- | --- | ---: | ---: |
| 32 direct repeating-13 inverse candidates | scaled-to29, plus sign, F mask2 | **−5.46581959** | **−2.62289227** |
| Same 32 with collision-qualified key skips (max eight) | scaled-to29, plus sign, F mask6, **one** skip | **−5.43051532** | **−2.62289227** |

Both winners are unrecognizable as native English. The best direct 76-position decoder starts `JYMNTHTHOERAUTHODNGYFYMRILEOMWAE...`, with IoC **0.03207207**; best skip-aware output is similar, with IoC **0.03072936**. The score gap to clear original p57 is large. Independently, an actual p57 76-rune native GP plaintext was **encrypted with this precise selected 13-byte key and a planted collision skip**, then the same decoder recovered **76/76 exact native runes and the one planted rejection**, at score **−2.66894490**. The original results are therefore *bounded negatives* on the literal direct-key/p56-style failure-and-retry consumer.

## Separate 13-rune red-heading recipient on physical p0

The 2016/word-address loop sends the first XOR value **MY174 → physical p0:w3**. The *actual* selected original p0 word3 is `FJOE`, a **three-rune** word in the black body. It does not select the title. However, the same original page begins with an independently visible **13-rune red heading**, split by an ordinary word dot after **eight** runes, then another **five**, and followed by a conspicuous 13-dot punctuation mark. Its title is `SHEOGMIAFSYENGC` (13 GP rune identities), matching the physical p50 row count **13**. [Earlier original p0 title adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md) fixes those physical boundaries.

A bounded separate receiver pairs the entire 13-byte XOR-column key with this source-exact **13-rune red title**, with no phase shift: two byte-to-GP maps (remainder29 or scaled29), forward/reversed byte order, and two additive signs yield **eight complete 8+5 heading predictions**. Original source results include forward remainder-minus `SEATXYSHU NGCAOEY`, forward remainder-plus `SBLNGSDBEA NEEOLP`, and forward scaled-plus `CNETHUGOM LEOHEC`. None forms a clearly intelligible two-word English title. The original 13-rune sample is short, so these eight nonprose outputs provide only a bounded negative for that direct alignment.

**Selection weakness:** the MY prime sum addresses **p0 word3**, not the red heading. Transferring a separately 13-long p50 key to the first red title is an additional, unissued solver decision. It is worth explicitly recording this distinction rather than treating 13↔13 as an authenticated plaintext clue. The source-exact SFT now enumerates all eight original candidates and preserves the printed two-word 8+5 boundary.

This does not exclude an instruction-based navigation use of the 13 original XOR bytes or an entirely different cipher register. The source contains an **exact conditional MY174 closure** and a two-direction THEN/HEAD signal; it has no independently authenticated opcode specifying how those words would decrypt unknown runes.

**Reproducer:** [read-only source-exact CommonJS SFT](../sims/lp2_p50_col36_xor174_p55_inverse_sft.cjs), committed GP corpus and physical word boundaries, original 104-cell p50 source, source word-address and p55 center/mirror checks, all 28 column pairs, row-conditioned exact collision benchmark, 32 original p55 direct and skip-variant inverses, and separately encrypted native GP positive control. No plaintext has been claimed for any unsolved original page.
