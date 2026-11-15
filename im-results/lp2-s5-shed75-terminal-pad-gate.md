# Eleven lag-five S echoes and p55: a 75-rune source-selected pad that fails direct inversion

**Agent 11, 15 November 2026. Classification: new source-cipher length bridge and bounded original-cipher negative. No authenticated unknown LP2 plaintext, historical key, cipher mechanism or destination recovered.**

## Human-visible hypothesis and exact source selection

The independently published [lag-five rune study](lag5-rune-specific-echo.md) established that original unknown LP2 printed words contain **11 equal S/index15 rune pairs at lag five in 11 distinct words**, against about two under a constrained per-word null. The original p39 red triad ends in **[5,15]**, a tentative retrospective selector for this particular echo as discussed in [the prior signed 2013 source bridge](lp2-2013-signed-dh6-lag6-original-source-bridge.md). These observations and their null tests are **prior art**.

The original solved p57 Parable instructs a seeker to *shed our own circumferences* and find the divinity within. Interpret the first and last rune of each of the 11 selected full ciphertext words as a *circumference*. Their GP rune lengths, in original book order, are:

    8, 10, 12, 8, 12, 10, 6, 10, 8, 6, 7

Their original physical start pages are:

    1, 6, 9, 20, 38, 39, 41, 47, 51, 52, 55

The marked words contain **97 runes**. Removing two endpoints per word leaves **97 − 2×11 = 75 interior runes**. Original terminal p55 has **76 GP runes**, of which the very first is a continuation of the previous page's word; its remaining complete-word passage contains **exactly 75 runes**. The interiors therefore supply one completely specified, length-matched terminal *candidate pad*, requiring no fitted starting point or extra ciphertext deletion. This is a motivated hypothesis, not an established author instruction.

Source: [original rune-index corpus](../resources/liber-primus/lp2-corpus.json) and [printed transcription](../resources/liber-primus/lp2-transcription.txt), joining physical line and page wraps.

## Actual direct p55 inverse

The pad K is the 75 selected interior rune indices, concatenated in source order. Read all original p55 cipher indices C at page-local positions 1–75. Test the historical GP29 additive family: P = (C ± K) mod 29.

| Original 75-rune GP inverse | GP index of coincidence | Decrypted opening |
| --- | ---: | --- |
| C − K | **0.03675675676** | O S N F F Y R NG F EA S NG W I X |
| C + K | **0.03495495495** | E D J X U H A B U AE Y AE Y J S |

Both outputs remain nonlinguistic. The original 75-body ciphertext has F runes at body indices **14, 24, 40**. We also exhaust the real known-Cicada **plaintext-F bypass**: literal plaintext F does not consume a key element; a key-consuming branch must never decode plaintext F. For both additive orientations and all **16 F-branch assignments**, **only one** complete candidate is compatible with strict forward encryption: **C + K**, treating all three ciphertext Fs as literal, consuming **72** pad symbols. Its IoC is **0.03459459459**, beginning **E D J X U H A B U AE Y AE Y J F P OE M L O OE R**, again nonlinguistic.

Every direct candidate exactly re-encrypts, and a separately solved 75-rune p57 plaintext plant exactly recovers under both signs. This validates the specified reversible arithmetic, not the historical hypothesis.

There is a second simple size match: removing only the *global* two ends of the 97 concatenated marked runes leaves **95**, the length of original solved p57. But aligning these 95 selected cipher runes to the 95 known clear p57 runes violates any stationary single-valued monoalphabetic substitution at **67** repeated-input positions. No p57 plaintext is thereby recovered.

## Two-ciphertext shared-pad inverse with independent word boundaries

The direct key failure leaves one materially different, recoverable possibility: the 75 S5 interiors and the 75 p55 body runes are **both ciphertext** encrypted with the same running GP29 pad. This model could recover two unknown plaintexts and the pad simultaneously from original visible word breaks. It requires the same 75 positional key elements in both streams and source-native English words in their printed segmentations.

Let original p55 body be A[0..74] and the eleven marked interiors be B[0..74]. A shared GP29 addition with unseen K would force:

    D[i] = (A[i] − B[i]) mod29 = (PlainA[i] − PlainB[i]) mod29.

No K values, phase, crib or bypass mask are selected. The 16 p55 complete-word lengths are [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]; the 11 independently printed S5 interior lengths are [6,8,10,6,10,8,4,8,6,4,5]. The two partitions overlap on 24 pairs of word intervals. For each pair, compute every source-native GP29 dictionary candidate of the two exact lengths and count candidate pairs satisfying the observed D at every shared rune position. The lexicon has **29,058 unique native-GP encodings** from the pinned TextBlob source, with historical QU→CW, V→U, K→C, Z→S, ING→NG, IO→IA spellings. Its dictionary was fixed before examining original candidate results, using the same convention as the validated historical F-key lexical decoder.

The original two streams have **six decisive edges with zero compatible dictionary word pairs**:

| p55 word zero-based | S5-interior word zero-based | Shared rune positions | Native dictionary pairs |
| ---: | ---: | ---: | ---: |
| 3 | 1 | 6 | 0 |
| 4 | 2 | 6 | 0 |
| 6 | 3 | 6 | 0 |
| 6 | 4 | 5 | 0 |
| 7 | 4 | 5 | 0 |
| 11 | 7 | 6 | 0 |

Thus no pair of complete dictionary English plaintexts can satisfy this fixed two-time-pad model. The first zero edge alone suffices for dictionary-only recovery under source-preserved segmentation. All 18 other edges are also reported by the SFT; four-symbol overlaps (p55 word0, S5 word0) and (p55 word8, S5 word5) have 45 and 27 admissible pairs, confirming that the matcher detects ordinary incidental compatibility.

**Positive solver control:** Choose sixteen and eleven authentic dictionary English words of exactly the source printed lengths, encrypt both 75-rune passages with a single deterministic unknown 75-rune additive pad, cancel the pad and run the identical overlap matcher. All 24/24 planted edges retain at least one dictionary pair, and the key-known test decoder round-trips both whole 75-rune original-layout tapes. This distinguishes actual source model rejection from a broken lexical parser.

The test is **conditional on synchronized positional pad reuse** and *both* plaintext passages using words present in this 29,058-type dictionary. An F-transparent skipped key clock, non-English prose, names absent from the source lexicon, altered segmentations, and another S5 extraction are outside it, requiring independent original instructions rather than arbitrary rescue operations.

[Complete CommonJS original-cipher and paired-English-planted SFT](../sims/lp2_s5_terminal_twotimepad_lexical_sft.cjs) ran on exact repository ciphertext and pinned lexicon bytes in the connected JavaScript runtime, with all original and positive overlap assertions passing (SFT PASS).

## Research decision

The specific eleven-word S5/p57 circumferences construction provides a reproducible new 75-rune candidate key, but **the complete direct additive and historically established F-bypass inverses fail, and the separate simultaneous two-ciphertext English shared-pad inverse fails at six exact word-overlap sites**. Because the 11 source words are all at least six symbols long, the length equality alone cannot authenticate this candidate. Do not rescue either failed original inverse with rotations, arbitrary key clocks, newly introduced alphabet mappings or semantic post-fitting without an independent author clue.

**Complete source-native test:** [single CommonJS SFT](../sims/lp2_s5_shed75_terminal_pad_sft.cjs), which parses the original 2,896 words / 12,956 GP runes, asserts all selected words/pages/counts, both direct inverses, all sixteen F branches, the solved p57 key-plant and the 67 known-text contradictions. The exact repository script ran successfully on the exact source bytes through the connected JS runtime and reported **SFT PASS**.
