# The original GP29 grapheme chart is not a lossless plaintext decoder

**Research decision, 23 November 2026 (Agent48; Director #2380).** The original 2013-era Gematria Primus rune spelling chart provides a deterministic literal rune-to-Latin expansion, with seven two-letter sign labels. It supplies neither a lossless inverse Latin-to-original-rune serializer nor a context-sensitive English plaintext cipher. On authentic original LP2 p0–55 the direct expansion is not coherent English; **at least 52 distinct printed source words admit a different, equally long GP29 rune segmentation with exactly the same literal Latin spelling**, yielding at least **2^52 = 4,503,599,627,370,496** different full-length, same-printed-word-length GP tapes sharing the same chart-expanded Latin text. This is a mathematical *identifiability obstruction for the chart alone*, not evidence that the author used any of those alternatives, and not a recovered unknown plaintext or key.

This source-native orthography question is distinct from the old GP-versus-one-Latin-letter [word-length study](lp2-uncontracted-latin-wordlength-adjacency-original-gate.md), the phoneme-class register in [#2253/#2257](lp2-phonemic-register-capacity-source-gate.md), and an arbitrary private within-word substitution. Its concrete original input is the source chart itself and *both* authentic cleared p57 prose and original unsolved cipher. An absent additional encoding instruction is a real prerequisite for this proposed route.

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

## Executable reproduction and decision

The [read-only Node 22/CommonJS source SFT](../sims/lp2_gp_contextual_grapheme_source_sft.cjs) reads both actual committed source artifacts, asserts **13,136/13,136** original+solved signs against canonical page index sequences, correctly joins all printed line/page wraps (including 32 carried words), verifies all complete-word and singleton counts, enumerates 100 ambiguous adjacent-pair events, 95 disjoint pairs and 52 length-preserving lexical/GP-rune witnesses, independently checks solved p57's three orthographic repairs, and compares a frozen **20/20 solved-p57-positive greedy serializer** against all unknown-source words (**175 noncanonical original words, 100 lost rune slots**). It also reproduces intact original p0–p2 and p40–53 chart outputs.

**Independent Windows Node22 PASS (original witness):** [GitHub Actions 45146714813](https://github.com/FlareZ123/liber-primus/actions/runs/45146714813), checked-out source commit `0efba66551008de873c174f35a41e1d761e7ab6d`, exit status 0, exact witness `S|H|E|O|G|M|IA|F` ↔ `S|H|EO|G|M|I|A|F`. There are no external dictionary dependencies or generative plaintext guesses.

**Fork:** The original is not the output of the ordinary solved-positive greedy Latin→GP chart encoder, and the rune chart alone cannot invert its original positions from flat Latin. The chart remains a display alphabet and phonemic spelling guide. To unlock unknown LP2 pages via a changing grapheme grammar, an independently authenticated first-party source must still choose a *context-sensitive, recoverable* internal rule, state/exception serialization, and forward operation. Neither the 2013 chart, the genuinely solved p57 spellings, nor the tested source layout specifies one. Retire chart-only variable-length transcription as a plaintext solution, preserve the 52-word obstruction for future grammar designs, and keep actual changing-state or changing-space cryptanalysis open. **No unknown LP2 plaintext, key, complete decoder or final destination is claimed.**
