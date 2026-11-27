# The original GP29 grapheme chart is not a lossless plaintext decoder

**Research decision, 23 November 2026 (Agent48; Director #2380).** The original 2013-era Gematria Primus rune spelling chart provides a deterministic literal rune-to-Latin expansion, with seven two-letter sign labels. It supplies neither a lossless inverse Latin-to-original-rune serializer nor a context-sensitive English plaintext cipher. On authentic original LP2 p0–55 the direct expansion is not coherent English; **at least 52 distinct printed source words admit a different, equally long GP29 rune segmentation with exactly the same literal Latin spelling**, yielding at least **2^52 = 4,503,599,627,370,496** different full-length, same-printed-word-length GP tapes sharing the same chart-expanded Latin text. The exact whole-source mixed-radix count below strengthens this to a 250-bit conditional register; the independently nominated physical 32-byte column fails to reproduce it. This is a mathematical *identifiability obstruction for the chart alone*, not evidence that the author used any of those alternatives, and not a recovered unknown plaintext or key.

This source-native orthography question is distinct from the old GP-versus-one-Latin-letter [word-length study](lp2-uncontracted-latin-wordlength-adjacency-original-gate.md), the phoneme-class register in [#2253/#2257](lp2-phonemic-register-capacity-source-gate.md), and an arbitrary private within-word substitution. Its concrete original input is the source chart itself and *both* authentic cleared p57 prose and original unsolved cipher. An absent additional encoding instruction is a real prerequisite for this proposed route.


## Historical ordered-component gate (Director #3167, Agent17, 27 November)

**Decision: genuine pre-2014 historical coordinate ciphers exist, but the original GP chart does not select their group partition or a 29-sign extension, and the prominent LP2 dot markers are not literal historical two-row rune codes.** This is a distinct test of a lossless ordered-component representation, independent of the Latin spelling ambiguities below.

### Source and incompatibility

The historically documented *isruna* tract encodes a rune by an ordered pair (group, position within group). René Derolez, *Runica Manuscripta: The English Tradition* (1954), pp. 89, 132–135, discusses five manuscript witnesses and explicitly distinguishes the 28-sign repertoire, the Salzburg witness's 8+8+8+4 partition, and the other witnesses' unresolved placement of the additional four signs. The variants express the same pair through short/long I runes, L runes, bilateral strokes, or two horizontal dot rows (*stopfruna*). The *hahalruna* discussion describes group strokes on the left and position strokes on the right. [1954 book bibliographic record](https://biblio.ugent.be/publication/8767090); [scanned text, pp. 89 and 132–135](https://old.katab.asia/special/Rene_Derolez_-_Runica_Manuscripta.pdf); [St Gall MS 270, digitized 2008](https://e-codices.ch/en/list/one/csg/0270); [Dickins 1915 discussion](https://en.wikisource.org/wiki/Page:Runic_and_heroic_poems_of_the_old_Teutonic_peoples.djvu/18). The scanned text was readable but web PDF screenshot retrieval failed; historical conclusions use the printed text, not a newly adjudicated facsimile. The documented cipher encodes the **position** of a rune; it does not decompose the ordinary glyph itself into physical strokes.

I decoded and visually inspected the checked-in [original 2013 chart JPEG](../resources/historical/cicada2013-gematria-jpeg.b64) (current base64 blob `625717bab1bff316c204b197c1cd901eb3cd7cb6`). It is headed “Gematria Primus” and has two equally styled three-column tables, Rune/Letter/Value, with 15 rows (F–X) and 14 rows (S–EA). Each row has the same kind of horizontal rule; there are no visible ætt partitions or ordered two-component field. The chart's explicit number assignments are primes. Reading table number and row number is a lossless coordinate representation, but it is simply the known ordinal expressed as two integers, and differs from the historical grouping:

- Literal chart coordinates for zero-based GP ordinal i: (1,i+1) for i=0..14, (2,i−14) otherwise.
- Hypothetical four-group extension of the historical partition: (1+floor(i/8),1+i mod 8), inverse i=8(g−1)+p−1 with range check i<29. This is bijective on GP29 but **the 29th sign is an extension**, and the chart does not print this partition. Treating the extra signs as one extended third group instead is another distinct choice allowed by historical uncertainty. The 28-sign tract does not provide a canonical choice for the GP29 IA/EA ending.
- Exact intersection: chart-native coordinate positions above eight occur for 13 of the 29 signs: H,N,I,J,EO,P,X,D,A,AE,Y,IA,EA. Thus the chart grouping cannot be consumed directly by the historical one-to-eight position grammar. Even the solved physical p56 contains all 29 signs, with 36/85 occurrences outside that grammar. It is not enough to add a special case for unknown ciphertext.

Executed on canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`:

| Span | Runes | Chart row >8 | IA | EA |
|---|---:|---:|---:|---:|
| p0 | 262 | 118 | 7 | 6 |
| p56 solved control | 85 | 36 | 3 | 2 |
| p57 clear control | 95 | 30 | 0 | 0 |
| p0–55 unknown | 12956 | 5827 | 470 | 460 |

For reproducibility, the core is `const row=i=>i<15?i+1:i-14; const count=xs=>xs.filter(i=>row(i)>8).length;` on each physical page's `indices` array in [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json). This exact core was executed on fetched original-derived inputs. No language model or cipher score is involved.

### The obvious original dot receiver fails its literal type

The historical *stopfruna* draws one row for group and one for position. Even granting a generous full 4×8 domain, a single mark contains at most 12 dots; under the GP29 8+8+8+5 extension the actual maximum is 11. Hence neither the original 13-dot punctuation nor the terminal 23-dot marker can be one historical coordinate rune. The native 10-dot marker could satisfy the count alone, but not the literal two-horizontal-row grammar.

Using the supplied original JPEG archive and the existing [native dot-template detector](lp2-native-dot-template-widening-gate.md), I additionally grouped centroids by y in ascending order with a 3-pixel consecutive-gap threshold. The original source groups have the following row populations, with no rotation, rescaling, or repartition:

| Original LP2 mark | Physical pages independently observed | Row populations | Number of rows |
|---|---|---|---:|
| 13 | p0,p2,p56 (twice),p57 | 1,2,1,2,1,2,1,2,1 | 9 |
| 10 | p36,p38,p49,p56 | 1,2,1,2,1,2,1 | 7 |
| 23 | p57 terminal | 3,2,3,2,3,2,3,2,3 | 9 |

This is an additional geometrical type check on already known marker counts, not a new marker discovery. A two-row positive control with g=3,p=8 has populations [3,8] and total 11. Arbitrarily splitting or rotating the source marks to make several code runes would require a separate independent delimiter and orientation cue.

Original scans05 and16 show solved, mixed rune/numeric magic-square graphics, whereas the LP2 p0/p2 triple-cross assets and p23/p40 scattered dot decorations do not supply a labelled ætt index or a two-row receiving register. The contact-sheet examination is a coarse screen, not an exhaustive ornament inventory. The source's tree/branch imagery alone cannot pick group order, group sizes, grapheme boundary, or any operation on resulting coordinate streams. The known LP1 prime-sum and LP2 p56 totient operations consume prime/ordinal values already given by GP, not this component type.

**Fork:** close #3167 on its missing-source-edge criterion. The historical analogue is authentic, and a modern 29-sign coordinate embedding is trivial to construct, but neither fixes the requested typed operand on original unknown ciphertext. No frozen unknown-span prediction is justified; no unknown plaintext/key, no cipher-family exclusion beyond the stated direct representations. Reopen only if an independently visible source clue selects a specific partition and receiver; do not sweep arbitrary row/column encodings, bit mappings or regrouped punctuation. See also the distinct [historical Hastières 24-letter cipher gate](issue1445-hastieres-futhorc-29-symbol-gate.md) and [exact Rune Poem alphabet-order gate](lp2-anglo-saxon-rune-poem-source-gate.md).


## Solved-source spelling-choice calibration and checksum ambiguity (Agent2, #2976, 26 November)

**Decision:** there is no source-calibrated secondary spelling-choice channel. The explicit, frozen ordinary grammar is word-local longest matching over the chart's 29 literal labels, its C/K, S/Z, NG/ING and IA/IO aliases, and the historical V→U convention. On the 694 source-replayed LP1 training groups, every observed literal spelling is the **unique shortest legal parse**, not merely a successful greedy parse. There are 155 groups with multiple parses of *different* lengths and no equal-width choice. With the grammar frozen, the withheld p56/57 controls give the same result on all 45 groups, including 11 variable-width opportunities. The actual author-era Latin from the 2013 Instar TXXX witness gives the same result on 19 p57 body words (5 variable-width opportunities); the solver-derived, English-normalized p10–13 reference gives it on 181 aligned words (47 variable-width opportunities). These subsets overlap the 739 solved groups; they are distinct input representations, not additional independent samples. The Latin reference uses QU→CW, Q→C and the known aliases. The primary-source p57 Latin witness is the stronger independence check; literal expansions derived from known runes do not independently establish which Latin alias the author used.

The new test enumerates **every** word-local parse of the fixed input string with the above token vocabulary, rather than rechecking only the earlier greedy mask or the 52 merge/split witnesses. The observed solved choices supply no equal-width training event, and every variable-width choice takes the uniquely shortest spelling. Thus no context-sensitive alternative-choice grammar is identifiable from these controls; no positive side bit or exceptional operation is selected. The following original-cipher diagnostics are conditional on the fixed literal chart expansions and printed rune counts, **not** evidence that those expansions are underlying plaintext.

| Corpus | Groups | Multiple parses (any length) | Multiple parses (observed length) | Non-greedy | Observed length exceeds minimum |
|---|---:|---:|---:|---:|---:|
| LP1 training | 694 | 155 | 0 | 0 | 0 |
| LP2 p56/57 holdout | 45 | 11 | 0 | 0 | 0 |
| 2013 author-era p57 body Latin | 19 | 5 | 0 | 0 | 0 |
| LP1 p10–13 English reference | 181 | 47 | 0 | 0 | 0 |
| Unknown p0–55 | 2896 | 1970 | 230 | 209 | 123 |

The alias-aware fixed-Latin count is 281.6001302708983 log2 units, i.e. 282 fixed bits to distinguish arbitrary length-preserving parses, versus 250 under the narrower literal-label-only grammar below. The extra freedom comes from recognition of IO/ING within the same literal expansions; this is not enumeration over arbitrary choices of input alias strings. Greedy is not always globally shortest: 165 original groups have tied minimum-length parses, including some whose observed length is larger than minimum. Ordinary deterministic spelling does not reconstruct the original ciphertext.

**New simultaneous length, prime-sum and ordinal-sum obstruction.** Even granting every actual printed group's prime sum and zero-based ordinal sum as additional side information leaves 11 independent binary choices in the original. Eight are exact rune-multiset swaps (so *any* additive per-rune weight, including totient or product checks, is insensitive). The other three are occurrences of the exact identity

`I|AE|OE = IA|EO|E` (literal IAEOE; three runes, prime sum 215 and ordinal sum 57 on both sides).

These occur in zero-based original group indices 1145, 1927 (with terminal TH), and 2040. This proves at least 2^11 residual full-tape alternatives even when supplied all original group widths, literal expansions, prime sums and ordinal sums. The eight multiset witnesses are indices 55, 1215, 1910, 2215, 2352, 2393, 2534, 2708. Per-word sum checks alone cannot generally recover the parse-state tape; the genuine p57 metadata product succeeds because its independently provided Latin and factor constraints happen to identify a unique path. No analogous independent unknown-page numeric target is known from this test.

**Fork:** close #2976 as a no-selector result. Do not serialize these 230 ambiguity positions into arbitrary bits or tune a rule to ciphertext. A new branch requires an independently supplied Latin witness, actual noncanonical choice on solved material, or an original instruction fixing a typed state and its readout; order-sensitive information is necessary to discriminate the checksum collisions. This is a finite calibration/identifiability result, not a universal exclusion of encrypted sidecars or context-dependent spelling. No unknown plaintext, key, or cipher recovered.

Reproducer: [CommonJS SFT](../sims/lp2_gp_spelling_channel_calibration_sft.cjs), source replay setup from the prior renderer SFT, connected JS core executed on pinned repository inputs. Standalone Node wrapper has not been independently executed. Inputs: corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, native solved 1b064ef6d85819b7d96adaff31a82d1ec551598f, corrected LP1 37c96b816495c5f93ca658a01c9918bf92598316, corrected LP2 f7b534a33edeb212d427329798438325307463d7, and the [historical Instar source](../resources/external/2013-instar-xor-source.md) and [English reference](../resources/liber-primus/lp1-plaintext-reference.txt). The SFT emits all 11 checksum collision witnesses.

## The chart and its actual information loss

The official 29-rune ordering and derived display spellings are pinned as `runes` and `translit` in [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json), and the exact original physical breaks and rune sequence in [lp2-transcription.txt](../resources/liber-primus/lp2-transcription.txt). The full 2014 LP2 image inventory is mapped in [the original archive README](../resources/liber-primus/README.md). Its seven *literal two-letter* chart signs are **TH, EO, NG, OE, AE, IA and EA**; each of their two Latin letters also exists as separate GP signs. Therefore the encoding is not uniquely decipherable from plain unseparated Latin letters. For example:

```text
S | H | E | O | G | M | IA | F    (eight original p0 runes)
S | H | EO    | G | M | I | A | F (eight different legal GP runes)
                   both give SHEOGMIAF
```

The first is precisely the *actual source's first eight printed signs*; the second merges original E,O into the existing EO rune and splits original IA into its separate I,A signs. It preserves that word's **original eight rune slots**, literal expanded Latin text and every printed word boundary. The manuscript cannot distinguish the two by reading that text and the printed word length alone. The other source words furnish **51 additional independent same-word, same-length swaps**. Choose whether to replace each complete word independently. This constructs exactly `2^52` distinct rune tapes, each of the manuscript's **2,896 printed complete words with all individual lengths unchanged**, rendering the **same** literal Latin text. Rune-symbol identities, and thus the GP-index cipher operand, are different. An inverse needs an extra canonical segmentation law, an explicit sign delimiter, external decoding state or other information.

There are **100 original within-word adjacent literal two-sign pairs** whose Latin expansions equal one compound rune's spelling (e.g. original T,H versus TH). They lie in **92 source words**, with a disjoint packing of **95** positions; 52 of the 92 words also contain an alternate compound sign to split, preserving exact source-word length. The 100/95/52 values and witness strings are computed exhaustively without language-corpus fitting. The **52-bit ambiguity is conditional on retaining only expanded Latin and printed rune-word lengths**. It is not a measure of the original's encrypted entropy, and a pre-authorized canonical encoding policy could remove ambiguity by excluding some source sequences from its image. Crucially, no such author-selected policy has been identified; applying generic greedy digraph rules to the original would erase genuine two-sign positions.

### Complete list of the 52 same-length ambiguity witnesses

Indices are zero-based in the canonical sequence of 2,896 original printed words. Each row gives the original GP signs, one different GP-sign sequence of the **same rune length**, and their identical flat Latin expansion. The 52 choices can be made independently while preserving every printed word boundary and length.

| Word index | Original GP signs | Alternative GP signs | Identical Latin |
|---:|---|---|---|
| 0 | `S H E O G M IA F` | `S H EO G M I A F` | `SHEOGMIAF` |
| 22 | `T H AE IA` | `TH A E IA` | `THAEIA` |
| 55 | `F O E W EA OE L F AE` | `F OE W E A OE L F AE` | `FOEWEAOELFAE` |
| 84 | `NG P EO O E A` | `N G P EO OE A` | `NGPEOOEA` |
| 319 | `T X C T H D EO` | `T X C TH D E O` | `TXCTHDEO` |
| 514 | `OE N EO A E` | `O E N EO AE` | `OENEOAE` |
| 557 | `OE EA U I A` | `O E EA U IA` | `OEEAUIA` |
| 570 | `E O H M O OE B TH` | `EO H M O O E B TH` | `EOHMOOEBTH` |
| 637 | `I TH T G U W C H E O A E` | `I T H T G U W C H EO A E` | `ITHTGUWCHEOAE` |
| 647 | `W C E NG R EA D T H` | `W C E N G R EA D TH` | `WCENGREADTH` |
| 717 | `E O AE G Y L` | `EO A E G Y L` | `EOAEGYL` |
| 746 | `E A TH M L` | `EA T H M L` | `EATHML` |
| 749 | `A E EA F J U` | `AE E A F J U` | `AEEAFJU` |
| 764 | `A E I EO B OE` | `AE I E O B OE` | `AEIEOBOE` |
| 789 | `X A E H R Y EA EO` | `X AE H R Y E A EO` | `XAEHRYEAEO` |
| 842 | `B I A AE L` | `B IA A E L` | `BIAAEL` |
| 885 | `E O I Y J T IA` | `EO I Y J T I A` | `EOIYJTIA` |
| 994 | `Y AE G E O OE U R W U` | `Y A E G EO OE U R W U` | `YAEGEOOEURWU` |
| 1051 | `N G IA` | `NG I A` | `NGIA` |
| 1081 | `A E M NG` | `AE M N G` | `AEMNG` |
| 1166 | `TH E O J G S NG Y M OE H` | `T H EO J G S NG Y M OE H` | `THEOJGSNGYMOEH` |
| 1177 | `U P E A AE X AE` | `U P EA A E X AE` | `UPEAAEXAE` |
| 1215 | `B A O E U IA J W T R W OE` | `B A OE U I A J W T R W OE` | `BAOEUIAJWTRWOE` |
| 1221 | `IA E O` | `I A EO` | `IAEO` |
| 1252 | `AE E O C TH W M` | `A E EO C TH W M` | `AEEOCTHWM` |
| 1263 | `IA E O` | `I A EO` | `IAEO` |
| 1350 | `NG X X A E` | `N G X X AE` | `NGXXAE` |
| 1418 | `OE G Y G N G` | `O E G Y G NG` | `OEGYGNG` |
| 1476 | `EO R N S O O C A E Y E E` | `E O R N S O O C AE Y E E` | `EORNSOOCAEYEE` |
| 1488 | `Y M F I AE I A` | `Y M F I A E IA` | `YMFIAEIA` |
| 1496 | `W EA O R O E` | `W E A O R OE` | `WEAOROE` |
| 1697 | `U TH OE G E A OE EO EO` | `U T H OE G EA OE EO EO` | `UTHOEGEAOEEOEO` |
| 1857 | `H B N G EO U OE` | `H B NG E O U OE` | `HBNGEOUOE` |
| 1879 | `G N P D NG T E A` | `G N P D N G T EA` | `GNPDNGTEA` |
| 1910 | `EA A E TH L AE` | `E A AE TH L AE` | `EAAETHLAE` |
| 1934 | `IA EO I EO OE X C W A E` | `I A EO I EO OE X C W AE` | `IAEOIEOOEXCWAE` |
| 2023 | `N O TH C TH N M O E` | `N O T H C TH N M OE` | `NOTHCTHNMOE` |
| 2150 | `B I A EA` | `B IA E A` | `BIAEA` |
| 2164 | `EO EA O E` | `E O EA OE` | `EOEAOE` |
| 2215 | `P IA EA I A` | `P I A EA IA` | `PIAEAIA` |
| 2304 | `T H W AE` | `TH W A E` | `THWAE` |
| 2352 | `A N IA A E AE` | `A N I A AE AE` | `ANIAAEAE` |
| 2393 | `TH N OE Y O E H` | `T H N OE Y OE H` | `THNOEYOEH` |
| 2421 | `P C I A B G B P OE` | `P C IA B G B P O E` | `PCIABGBPOE` |
| 2422 | `OE J F A E` | `O E J F AE` | `OEJFAE` |
| 2440 | `Y E A S OE EO U A IA` | `Y EA S O E EO U A IA` | `YEASOEEOUAIA` |
| 2475 | `M L I TH T EA S N G L` | `M L I T H T EA S NG L` | `MLITHTEASNGL` |
| 2534 | `L M E I TH AE A IA J I A R` | `L M E I T H AE A IA J IA R` | `LMEITHAEAIAJIAR` |
| 2563 | `TH J I A` | `T H J IA` | `THJIA` |
| 2580 | `IA Y E O E IA G AE F N W` | `I A Y EO E IA G AE F N W` | `IAYEOEIAGAEFNW` |
| 2708 | `E A P W EA L` | `EA P W E A L` | `EAPWEAL` |
| 2866 | `N G O E L M B TH` | `NG O E L M B T H` | `NGOELMBTH` |

These are concrete pairs of distinct GP tapes, not plaintext candidates. The chart and intact word lengths alone cannot distinguish either member of any pair.

## Exact whole-manuscript ambiguity register and physical table operand (Agent48, #2444)

The earlier 52 independent merge/split witnesses are only a lower bound. Enumerating all legal chart parses in published GP ordinal order gives exactly **204** ambiguous complete original words, with parse multiplicities **150×2, 33×3, 12×4, 4×5, 2×6, 3×7** (remaining 2,692 words uniquely parse). Their product is

`1027300003126123037067341387479649450198562544404360969700613957835816960000`.

Therefore exactly **250 fixed binary bits** suffice and are necessary to identify an arbitrary original-length tape conditional on the entire Latin expansion and all 2,896 original rune-word widths. If those original rune counts are not independently retained, exhaustive variable-width parsing instead requires **3,405 fixed binary bits**; even the entire 256-byte table cannot directly carry every possible parse choice for this fixed Latin expansion. These are conditional capacity bounds, not encryption entropy measurements. They are not evidence that any hidden register exists.

A lossless mixed-radix serializer is explicit: enumerate each word's parses in GP ordinal lexicographic order, count them as (m_i), record the actual zero-based index (d_i), and accumulate (R \leftarrow m_i R + d_i) from zero in printed word order. Undo by quotient/remainder from the final word backwards. The original complete ciphertext rank is hex `18d11b78ee49747821c208d169910de9e849127bc0c8e87c9ad5e93dc257da1`. Original p25 E|OE and p54 EO|E have respective ranks 1 and 0 in their two-entry parse lists. The independently selected 32-byte fifth-column operand from [the p0 red-title/cross-page route](lp2-p0-red331-crosspage-fifth-p50-source-route.md) has sufficient physical capacity and was nominated before ranking the source. Its interpretation as a base60 column is conditional; no first-party instruction selects the rank consumer.

**Direct original receiver:** Treat the column as one big-endian 256-bit integer. It lies outside the legal 250-bit rank space, so the literal padded rank fails. Even the relaxed receiver reducing the integer modulo the exact product reproduces only **91/204** ambiguous original words; it already changes the first printed word, matches **1/7** opening pp0–2, **14/34** pp16–21, and **23/58** independent pp40–53. All unambiguous words necessarily match. No secret parameters are fitted, and the exact original rune replay criterion fails on 113 words. This retires the direct nominated-column rank and its modulo variant, not arbitrary encrypted sidecars. The flat Latin remains ciphertext-like even with its original rank.

**Controls:** Exhaustive same-width and unrestricted-width rank/unrank replay all 12,956 original runes with the *derived actual rank*, an implementation check only. The 20 genuine clear p57 words and 230 genuine clear LP1 words all replay; their same-width choice space is singleton, hence they do not calibrate an ambiguous tie-break. All four assignments of the genuine EOE pair are separately encoded and recovered as nonvacuous planted sidecar controls. The same algorithm was executed against the checked-in source inputs in the JS runtime. [Standalone read-only Node SFT](../sims/lp2_grapheme_mixed_radix_sidecar_sft.cjs), [commit a48632e](https://github.com/FlareZ123/liber-primus/commit/a48632ed2c87e3fa13d38454d57258f4657b29ec).

**Decision:** A conditional alternate-register side channel is small enough to fit a physically nominated 32-byte column if original rune widths are retained, but the exact source-selected candidate bytes do not supply that channel as a direct rank. Without retained widths, the direct full-table ambiguity register is insufficient for unrestricted choices. Further work needs an independently selected different carrier/decoding law and an actual cipher over the intermediate register. No unknown plaintext or authentic cipher key has been recovered.

## Exact word-local contextual-state obstruction

The earlier 204 ambiguously parseable source words show that the literal published chart discards rune-boundary information. There is also a direct contradiction to **every deterministic word-local serializer** whose only inputs are that word's literal Latin expansion and its printed rune count, even with otherwise arbitrary lexical choices. Across all 2,896 exact original complete words, the sole repeated flat-Latin/length key with **different original rune tapes** is:

| Original complete word | Physical page | Preceding mark | Expanded Latin | Exact GP signs |
|---:|---:|---|---|---|
| **1,381** (zero-based) | **25** | period | **EOE** | **E / OE** |
| **2,889** (zero-based) | **54** | hyphen | **EOE** | **EO / E** |

The two source rune sequences differ, both contain exactly two rune signs, and the authentic GP chart assigns both the same Latin spelling. A single-valued serializer accepting only (expanded Latin, original rune count) cannot return both source tapes, independently of how its private dictionary is chosen. Thus a freely selected **word-only canonical parser** cannot repair all source segmentation ambiguity. The original **preceding punctuation differs**, supplying a visible candidate context bit, so a rule with sentence state, previous-word context, page-mode or an explicit escape can evade this narrow theorem. There is **no historical rule** specifying such a mark-to-segmentation decision or a ciphertext-to-plaintext operation; this is not recovered plaintext.

The updated [original-source SFT](../sims/lp2_gp_contextual_grapheme_source_sft.cjs) counts all complete expanded-Latin/length groups and checks this conflicting pair exactly. The test requires neither an English dictionary nor a guessed cipher key.

**One historically motivated contextual rule is insufficient.** The solved-p56 F-interrupter convention gives a concrete candidate for signaling exceptions to a default grapheme parser, with F explicitly present within the affected word. Of the original 175 words whose literal GP rune tapes disagree with the solved-positive greedy serializer, **153 contain no F rune at all** (141 preceded by a printed hyphen, 12 preceded by a period). Thus no rule requiring an F *inside the exceptional word* can select all original split digraphs, regardless of the unknown F behavior. This is a narrow original-source counterexample to the **same-word F-escape** grammar; cross-word F state, other context rules and keyed ciphers are outside its scope. Native solved p57 still has 20/20 canonical serializer positives. There remains no source-selected lossless cryptographic decoder.

## A source-authentic serializer comparison narrows the cipher register

The normal, leftmost-longest native-GP chart encoder is not a speculative “decoder”; it is a simple 2014-executable way to spell visible Latin words with the published 29 signs. Its only relevant convention here is to consume a chart two-letter token whenever it begins at the current Latin letter. It has **20/20 exact original printed-word matches** on the separately solved and clear **p57 PARABLE**, using the same literal chart spellings and no encryption. The independently established full LP1 181-word source-calibrated positive additionally supplies the ING and IO pronunciation aliases needed to normalize true English, but these are not invoked on the literal glyph chart expansions in this test.

Freeze that exact *solved-positive* greedy serializer and apply it **backwards as a recoder of the actual unknown source**: expand each original GP word with its official Latin sign labels, then re-encode that flat Latin word greedily. The source's original 2,896 word slots and punctuation are held fixed, and no target plaintext, word dictionary or key is used. **175/2,896 original ciphertext words change GP sign identities or segmentation**, and the re-encoded ciphertext would contain **12,856 rune slots instead of the original 12,956**. The difference is an exact **loss of 100 runes**, consistent with the 100 original split-form digraph events. Even the opening original word changes from its actual eight signs to seven under the ordinary greedy parser:

```text
actual original p0:  S | H | E | O | G | M | IA | F   (8)
greedy chart respell: S | H | EO    | G | M | IA | F  (7)
same Latin spelling:  SHEOGMIAF
```

This is a **decisive original-input exclusion of the specific architecture “ordinary Latin-letter ciphertext → author's greedy GP chart spelling → original printed runes.”** It retains an independently source-native solved-page positive. The unknown source cannot have been produced by **that final serialization law**, even if an arbitrary changing-position cipher generated the hypothetical Latin ciphertext. The much wider possibility of a separate noncanonical text encoder, a 29-ary cipher working directly in GP symbols, or a keyed variable-length transducer remains open. This scope matters: the all-secret original rune collision and printed-word tests still concern the ciphertext after whatever encoding the author actually chose.

## Does the source actually favor split-form ligatures?

A control comparison separates the **mathematical noninjectivity** proved above from a conjecture that the original cipher deliberately encodes hidden data through those split forms. Preserve each of the actual 2,896 complete printed word boundaries, its exact rune length, and **its exact 29-rune multiset**; for 4,096 fixed-seed trials randomly permute only the order of signs *within each word*. This deliberately conditions on the original's extraordinary low within-word equality count and preserves every global letter frequency, while removing any special placement of separated digraph signs.

Under this narrow source-preserving null, the number of original adjacent separate glyph pairs that also have a compound-rune spelling has mean **97.7451**, standard deviation **7.9327**. The authentic original has **100**, only **0.2843 standard deviations** above the null. **1,697/4,096** random arrangements are at least as high (plus-one one-sided tail **0.41445**). The number of words permitting the *same-length* alternative merge-plus-split has null mean **57.6841**, standard deviation **6.2242**; original **52** is below that expectation, with **3,442/4,096** randomized arrangements at least as high (plus-one upper tail **0.84037**). The exact seed, LCG, Fisher–Yates algorithm and assertions are embedded in the same standalone SFT; [Windows Node22 run 45149000771](https://github.com/FlareZ123/liber-primus/actions/runs/45149000771) independently passed every original-input assertion.

**Decision:** The 100 pairs and 52 independently reversible words are genuine source-level ambiguities and an exact restriction on prospective plaintext serialization. Their *counts*, however, are ordinary under word-multiset-preserving shuffled-placement controls. There is no evidence in this experiment that the creator deliberately encoded a 52-bit steganographic payload in the positions of split ligatures; do not infer a hidden message or key from their mere occurrence. The conditional null makes no universal statement about other hidden channels, because it deliberately randomizes word-internal order.

## Original native-script and solved controls

The source has **12,956 original GP29 unknown runes**, **2,896 printed complete words**, **83 one-rune words** and **448 two-rune words**. **28 distinct original rune signs** occur as one-rune words; C is the only unused singleton glyph. Under the chart's *literal spelling alone*, only **10/83** singleton positions produce A, I or O (including poetic “O” generously). The other **73** have raw spellings such as P, NG, EA or W and cannot serve as ordinary stand-alone English words without a further context/code transformation. This rejects a mere chart-expansion reading under intact source words; it does **not** rule out an independent cryptographic cipher that changes values inside those words, a true word-token code, or resegmented boundaries.

The independently known **clear p57 PARABLE** provides a valuable *actual creator-authentic positive* for spellings. Its original rune sequence expanded strictly using the same chart produces **LICE**, **TUNNELNG** and **DIUINITY** at locations known from the [solved LP2 text](../resources/liber-primus/lp1-plaintext-reference.txt) to mean LIKE, TUNNELING and DIVINITY. Thus the source really uses contextual spelling equivalences **C/K**, **NG/ING** and **U/V**. These repairs are usually recoverable by a human reader who already recognizes meaningful language. They are not a published finite cipher opcode that, given arbitrary unknown LP2 rune ciphertext, selects unique Latin plaintext words with an invertible state. Even the bare `LICE` spelling is an English word in a different context.

Literal chart expansion was applied to **all 729 original opening p0–p2 runes** and **3,008 independent original p40–p53 runes**, preserving the source's rune/word slots. Their initial full words are, respectively:

```text
p0–p2:   SHEOGMIAF SYENGC THJGAE FJOE ONTH NEWBASOEEOINGU NAEGITH HBNIA
p40–53:  FNM YGDAEH APXYH EOEAOE TNGEA LITTHF MACE DC
```

They do not reveal intact coherent English words/sentences, and the same chart expansion is incapable of reconstructing its original rune identities without segmentation information. This is an original-input negative for this single literal operation. It does not exclude a separately keyed contextual variable-length *cipher* or a genuinely source-chosen lexical transducer.

### Punctuation-conditioned same-length parsing control

An independent **2014-readable state premise** is that a printed full stop versus a hyphen determines which of the legal *exact original-rune-length* chart parsings to output. To give this premise a full, reversible and falsifiable test, freeze two competing laws *before looking at the source tape*: (A) after a full stop take the lexicographically first GP-ordinal parse, otherwise take the last; (B) reverse those choices. The original word's flat official-chart spelling, printed rune count, punctuation, and physical page carries are held fixed. Sorting uses the actual chart's 29 published rune indices, rather than contemporary English or fitted lexica. This predicts every rune position and tests exact original serialization, with no free secret alphabet.

These two natural mark-state laws fail on the original 204 ambiguous printed words: **94/204** and **88/204** rune-exact original matches (respectively **110** and **116** original source-word counterexamples). On the full original p0–2 opening they each reproduce only **3/7** ambiguous words; on p16–21 (word-origin interval) **15/34**; on independent p40–53 **24/58**. Law B already fails the **first original p0 printed word**: it predicts `S|H|EO|G|M|I|A|F` while the actual eight glyphs are `S|H|E|O|G|M|IA|F`. Law A fails the original word beginning at global rune83 on p0: it predicts `IA|E|H|X|TH|P|G` for actual `I|AE|H|X|TH|P|G`. Both give the same flat Latin spelling and same rune count, which confirms the source ambiguity but does **not** count as a ciphertext-exact inverse.

More importantly, test **whether either punctuation rule can be positively calibrated against genuine clear author text**: the six physically clear, source-original LP1 rune pages p3, p8, p9, p10, p11, p14 contain exactly **230 complete words / 1,001 runes** and **zero same-length chart-ambiguous words**. The genuinely solved p57 contains **20 words / 95 runes** and also **zero** such words. Both models necessarily pass all those unambiguous words; their apparent 100% source-native “positives” are **nondiscriminating**, so they provide no historical selection of either punctuation tie-breaker. For an explicitly limited length-stratified null that draws 230 words from the LP2 source without replacement *within each exact rune-word-length stratum*, the LP2 ambiguity frequencies predict **15.364** ambiguous LP1-like words; the exact conditional chance of zero is **4.50898868×10^-8**. Different genres and cipher states prevent treating this descriptive null as a causal author-intent significance test. It establishes that these authentic clear controls cannot distinguish an invented ambiguity state.

This does **not** reject all punctuation-history cryptosystems. A mark-conditioned transducer that actually **changes rune values** and has an independently furnished key/state could escape these two deterministic spelling-only laws. No first-party GP chart, LP1 F interruption, or original punctuation currently defines such an inverse. Any state that merely chooses a parsing of fixed Latin chart labels also leaves the original gibberish Latin expansion invariant and cannot by itself decrypt an unknown page. The [single-file Windows Node22 original-input SFT](../sims/lp2_punctuation_grapheme_state_original_sft.cjs) reproduces the exact controls, source words, two laws, counterexamples, and conditional comparison; [Actions PASS 45282446278](https://github.com/FlareZ123/liber-primus/actions/runs/45282446278).

## Executable reproduction and decision

The [read-only Node 22/CommonJS source SFT](../sims/lp2_gp_contextual_grapheme_source_sft.cjs) reads both actual committed source artifacts, asserts **13,136/13,136** original+solved signs against canonical page index sequences, correctly joins all printed line/page wraps (including 32 carried words), verifies all complete-word and singleton counts, enumerates 100 ambiguous adjacent-pair events, 95 disjoint pairs and 52 length-preserving lexical/GP-rune witnesses, independently checks solved p57's three orthographic repairs, and compares a frozen **20/20 solved-p57-positive greedy serializer** against all unknown-source words (**175 noncanonical original words, 100 lost rune slots**). It also reproduces intact original p0–p2 and p40–53 chart outputs.

**Independent Windows Node22 PASS (original witness):** [GitHub Actions 45146714813](https://github.com/FlareZ123/liber-primus/actions/runs/45146714813), checked-out source commit `0efba66551008de873c174f35a41e1d761e7ab6d`, exit status 0, exact witness `S|H|E|O|G|M|IA|F` ↔ `S|H|EO|G|M|I|A|F`. There are no external dictionary dependencies or generative plaintext guesses.

**Fork:** The original is not the output of the ordinary solved-positive greedy Latin→GP chart encoder, and the rune chart alone cannot invert its original positions from flat Latin. The chart remains a display alphabet and phonemic spelling guide. To unlock unknown LP2 pages via a changing grapheme grammar, an independently authenticated first-party source must still choose a *context-sensitive, recoverable* internal rule, state/exception serialization, and forward operation. Neither the 2013 chart, the genuinely solved p57 spellings, nor the tested source layout specifies one. Retire chart-only variable-length transcription as a plaintext solution, preserve the 52-word obstruction for future grammar designs, and keep actual changing-state or changing-space cryptanalysis open. **No unknown LP2 plaintext, key, complete decoder or final destination is claimed.**


**Image-corrected punctuation follow-up (#2597, 24 November):** The two changed preceding-mark states belong to words 415 and 2163 (global rune offsets 1886 and 9648; IANT and APXYH). Each has exactly one same-width chart parse. The 204 ambiguous words, regional scores and exact 94/88 matches are therefore unchanged. The punctuation-state SFT now reads the image-corrected transcription.


## Literal printed chart partition: key-free donor projection (#3172, Agent17, 27 November)

This is a distinct hypothesis from historical regrouping. The original chart left table is indices 0–14 (F through X), right table 15–28 (S through EA). Freeze the binary projection at 15, with no alternate partition or radix. Any position-wise permutation acting only within the printed tables preserves that bit, as does a literal F hold. The original supplies the partition but no selector for row-preserving encryption.

Target: original p54 223 black body runes, p55 76 continuation runes, with the 9 red p54 heading runes excluded. The search uses all 192 length-32 target training windows entirely inside p54, then demands the exact next 32 bits (within p54 or across the genuine p54→p55 continuation). All nine pinned solved native source records (2,979 runes total; no invented transliteration or cross-record joining) supply 2,412 valid 64-rune donor windows, 2,380 distinct 32-bit fit patterns. Every repeated donor window retains its multiplicity. **463,104 comparisons; zero 32-bit fits, zero 64-bit continuations.** The absence excludes only exact contiguous donor reuse of this register under the preserved chart bit, not unknown row-preserving plaintext. No broader Latin historical corpus was transliterated or searched.

Conditional null: independently uniformly permute the bits of p54 (110 ones/223) and p55 (36 ones/76). For a fixed donor word of length l with k ones, the exact probability for a specified window is (m)_k (n-m)_(l-k)/(n)_l, with falling factorials. For a cross-page prediction multiply the two separate conditional probabilities. Summation over **every** donor/target pair gives expected fit count 0.0001078920864 and expected full count 2.57172738465e-14 (also the union bound on ≥1 full match, no independence between overlapping windows assumed). This is a finite conditional permutation null, not a language-model probability or evidence that the actual book is random.

Controls: two separately seeded within-row changing permutation plants, native WELCOME start 83 (seed3301) and KOAN start190 (seed1033), 128 symbols each with new fixed-F row permutations at offset64. Both true donor alignments recovered; each has 65 overlapping full matches belonging to the planted continuous passage, not 65 independent solutions. A partial map inferred from the first 32 symbols predicts 25/32 and 28/32 subsequent ciphertext symbols exactly where the plaintext rune is previously seen. Authentic original LP1 WARNING Atbash and original p56 totient negatives disagree in 182/184 and 43/85 aligned row bits, respectively, and produce zero 32-bit donor fits in the same search. Four separately seeded row-count-matched shuffled targets also produce no fit. Plant controls use known donor provenance; no authentic unknown plaintext inferred.

Nonidentifiability without a donor: even the narrower family of arbitrary position-dependent row permutations fixing F leaves **14^293** possible 299-rune inverses (six F positions fixed; 147 other first-table and 146 second-table positions, each with fourteen choices). All can be realized by choosing an appropriate row permutation at each symbol; log2 count 1115.555 bits. This is an unconstrained rune-string count, not a count of grammatical messages. Granting the original complete-word boundaries with the genuine 11-rune carry, a stronger ternary F/first-row/second-row projection on the 272 distinct solved native word types gives 151 patterns. Among 64 original complete groups, 21 have no native lexical match, 8 one, and 35 multiple. The positive-match groups alone retain 2^70.257 independent wordwise choices before grammar; for example pattern 111 admits ALL, EASY, MAY, BEING among six observed forms. This finite native lexicon neither supplies all original words nor resolves the ambiguity. No language-only decoder is justified by the chart bit.

[Reproducer](../sims/lp2_literal_chart_row_projection_sft.cjs), executed the exact projection, control, probability and lexical functions in connected V8 against pinned repository inputs. Standalone Node/CI not run. Decision: no donor, no authentic key, no source-selected row-preserving mechanism. Preserve the literal partition as a possible invariant only if an independent source selects it. Do not try new partitions or binary ASCII transformations.
