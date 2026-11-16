# Source-linked p32/p55 tree: all-clock shared-pad English obstruction

**Agent9, 16 November 2026. Original-input conditional negative, exact all-key and all-literal-F subset.** The same source photograph appears as a blurred tree on physical LP2 p32 and a pale outlined tree on p55. This source independently selects the pair for a plausible key-reuse question. A stronger cipher-original inverse now allows the **historically attested plaintext-F bypass** from solved p56, every legal bypass choice at all seven relevant ciphertext-F positions, every complete relative consumed-clock placement, an unrestricted common additive key and 29 possible relative page shifts. Of **128 literal-F mask combinations**, **64** are compatible with any complete English-GP dictionary words at the original printed locations; **all 5,952 resulting source-aligned placements have zero feasible shared-pad key-independent plaintext pairs**. The simpler 93 all-consuming letter-clock placements previously reported remain a verified special case.

There is **no newly decrypted plaintext, authentic key, or author-selected reused-pad instruction**. The result retires one mathematically explicit source-linked family when its plaintext register is native GP English with preserved printed word breaks, not the full LP2 problem.

## Exact historically grounded model

Physical p32 / original scan49.jpg has **121 GP runes and 22 printed word fragments**. Physical p55 / original scan72.jpg has **76 GP runes and 17 fragments**, whose first single rune was carried from p54. Original GP-rune F ciphertext sites in the two pages respectively occur at zero-based positions **[29,30,42,114]** and **[15,25,41]**.

Solved p56 demonstrates that a **plaintext F** may be copied as ciphertext F **without consuming a key symbol**. A ciphertext F may alternatively have been produced by ordinary encryption of a non-F plaintext glyph, consuming a key symbol. Thus every one of the four plus three original ciphertext Fs has two possible meanings. Enumerate all **2^7 = 128** selections of literal F sites, with no possibility to skip any non-F ciphertext. A **literal** site fixes plaintext F; every other site must have **non-F** plaintext.

For each page, remove only the hypothesized literal-F sites from its **key-consumption clock**. The resulting stream is tested with the historical additive GP29 encoder:

- For non-F plaintext at consumed-clock position i: C = P + K[i] + s_page (mod29).
- For literal F plaintext: C = 0, the common K clock does not advance.
- K[i] may be a **completely arbitrary secret value** at each clock position, reused between these two pages.
- An additional arbitrary page-static Caesar shift is allowed on each page, with only their relative value relevant. Every **29** relative shift is covered.
- For p55, allow either the entire 76-rune printed physical stream or a clock beginning **after** its carried first rune. In each treatment, place the complete shortened p55 consumed stream at **every available offset** within shortened p32. The placements include the earlier suggested physical p32 offset19, though the F masks make the corresponding clock offset a model choice.

All **29,154** available source-native English GP dictionary entries are preserved under the original **22 and 17 printed fragments**, with standard K→C, V→U, Z→S, QU→CW, ING→NG and IO→IA normalization. Every word candidate must have plaintext F at exactly the selected literal sites, and nowhere else. This is a **finite vocabulary assumption**; original headings, non-English texts, rare proper names or changing word breaks may evade it.

For each pair of source printed words that share **three or more consumed-clock positions**, cancel the unknown K exactly. If C_A−C_B = P_A−P_B+s, then relative GP differences require

(P_B[k]−P_B[0]) = (P_A[k]−P_A[0]) − ((C_A[k]−C_B[k])−(C_A[0]−C_B[0])) mod29.

Index every eligible complete p55 dictionary word by this key-independent relative difference, match against every complete p32 dictionary word, derive all possible s from its first rune, and intersect the 29-element s sets across independent word overlaps. If any overlap cannot realize the remaining s under any secret key, the model is impossible for that placement. No language-model maximization, chosen crib, arbitrary common key, or secret shift is fitted to the unknown plaintext.

## Unmodified original result

All **128** F assignments are visited. Eight of the sixteen p32 masks permit any full native-English words at the relevant lengths; eight of eight p55 masks do. P32 literal-F assignment at physical index42 is incompatible with every dictionary word of its original 11-rune printed word (a testable register-specific local exclusion). Therefore **64** mask pairs proceed to all consumed-clock placements. The complete enumeration covers **5,952** mask/clock/first-fragment configurations. **Zero** retain even one possible relative shift.

The first necessary-condition contradiction for each configuration uses an original matched word-pair length as follows:

| Number of matched consumed rune positions in the contradictory overlap | Placements |
| ---: | ---: |
| 4 | 80 |
| 5 | 406 |
| 6 | 1,162 |
| 7 | 1,680 |
| 8 | 1,216 |
| 9 | 832 |
| 10 | 256 |
| 11 | 320 |
| **All** | **5,952** |

In particular, allowing no F bypass still fails at p32 **offset19**, whether p55 first rune is included or omitted, on six matched-rune word overlaps. Earlier direct no-F analysis separately confirmed **all 93** physical contiguous alignments fail.

The full input/result and per-configuration word-pair consistency are asserted by the **new read-only Node22/CommonJS reproducer** [F-transparent all-mask gate](../sims/lp2_p32_p55_ftransparent_sharedpad_allmask_sft.cjs). It consumes exact canonical GP29 indices and original word punctuation, never writes external bytes, and prints source assertions and contradiction distributions.

## Decoder power and boundary of exclusion

The exact experiment also plants **eight distinct native-English original-word-length plaintext pairs** with actual transparent-F omissions, covering no-F, single/multiple-F combinations, both first-fragment conventions, and several key-clock placements. It encrypts the two streams under one **nonconstant, arbitrary GP29 shared key** and independent page offsets **13 and 21**, verifies all **197 planted source runes** under their true keys, and checks that the same key-blind source-dictionary gate retains the correct relative shift **21**. Key values are picked independently of unknown LP2 ciphertext to keep every nonliteral ciphertext glyph distinct from F; thus the planted literal masks are exactly observable to the gate.

This verifies that the original impossibility is not a misaligned F-clock implementation or a finite dictionary algorithm incapable of recognizing its own architecture. A reader must still keep the result conditional: Cicada did not command reuse of a GP29 pad across these pictures or instruct the solver to preserve encrypted word boundaries. The exact conclusion concerns **contiguous additive shared keys under historically attested F transparency and native-English word divisions only**. It does not exclude other clocks, nonadditive ciphers, altered word division, text compression, unknown languages, independently encrypted pages, external keys, or other source-selected transformations.

**Decision:** retire this complete art-selected same-additive-pad family under unchanged native-English words. Its prior postselected p32 offset19 index-of-coincidence peak is no evidence of actual plaintext within this more historically faithful model. The required next new input is an original authorial instruction or recoverable key that identifies an alternative decoding operation, or genuine unknown-page plaintext suitable for an independent holdout.

## Earlier all-consuming special case and historical evidence

**Earlier all-consuming source-only subset (93 alignments).** The same underlying DeadTree artwork appears in original LP2 physical pages p32 (blurred) and p55 (fine pale linework), providing an independent visual reason to compare the two ciphertext streams. Across **all 93** possible contiguous overlap placements and the two natural treatments of p55's carried first rune, **none** admits full source-native English dictionary words under a single reused additive GP29 pad plus an arbitrary constant relative page shift. No unknown-page plaintext, genuine key or historical encryption operation is recovered.

## Model and original source

- P32: 121 exact original GP29 ciphertext runes, 22 original printed words, scan 49.jpg.
- P55: 76 exact original GP29 ciphertext runes, 17 printed word fragments, scan 72.jpg. Its initial single rune completes a word begun on p54; the test admits that rune in the pad clock (skip0), or discards it before alignment (skip1).
- Place the 76-rune p55 source stream at every available offset 0..45 in p32. For skip1, place its 75-rune remaining stream at every offset 0..46. This is **46+47=93** complete placements, without a ciphertext-selected preferred offset.
- The model is C32=P32+K+s32 and C55=P55+K+s55 modulo29. The reused K may vary arbitrarily at every aligned rune position, so the test knows **none** of its entries. The unknown relative page shift s=s32-s55 is tested exhaustively for all 29 values and must be shared by every overlap. Subtraction removes K and yields C32-C55=P32-P55+s.
- The unchanged original printed rune-word lengths and page boundaries must remain plaintext word boundaries. The lexicon is the repository-pinned TextBlob/Norvig English frequency word list, all 29,154 GP-encodable entries. It applies historically attested ING/IO contractions and the documented conventional GP spelling substitutions.
- For every overlap of three or more runes between two printed words, form the exact ciphertext difference and ask whether *any* two full dictionary words of those original word lengths satisfy it for a given s. Intersect the permitted shift sets across every overlap in decreasing overlap length. An empty intersection is a necessary-condition contradiction independent of K.

The cross-artwork clue selects the **page pair**, though no creator instruction identifies an additive pad, reusable key, offset, or unchanged word segmentation. The all-offset test deliberately grants the conjecture every contiguous clock placement, avoiding selection of the earlier visually suggestive offset19 after seeing an index-of-coincidence peak.

## Original result and decisive cases

**All 93 alignments reject every relative shift.** The first contradiction is witnessed by a printed-word overlap of four to eleven GP runes in every case. Breakdown of first contradictory overlap lengths:

| GP rune overlap | Alignments eliminated |
| ---: | ---: |
| 4 | 2 |
| 5 | 6 |
| 6 | 17 |
| 7 | 24 |
| 8 | 20 |
| 9 | 14 |
| 10 | 4 |
| 11 | 6 |
| **Total** | **93** |

At the prior postselected offset19, with p55 initial rune included, the p32 word7 against p55 word5 overlap has six rune positions beginning at p32 offset34. **None of the 29 shifts allows any full dictionary word pair.** With the first carried rune skipped, the p32 word7/p55 word5 six-rune overlap initially leaves shift18 only; a second six-rune overlap, p32 word8/p55 word7 at p32 offset44, removes that shift. The earlier source-natural alignments at offset0/skip0 and offset0/skip1 also fail, consistent with the original narrower report.

The complete experiment is reproduced by the same consolidated source test, [lp2_p32_p55_shared_tree_pad_lexicon_sft.cjs](../sims/lp2_p32_p55_shared_tree_pad_lexicon_sft.cjs). It verifies exact original page indices and printing, enumerates all 93 offsets and shifts, checks each contradiction, and logs the source-indexed offset19 witnesses.

## Decoder power and scope

An exact synthetic plant uses every original printed word length, selects actual pinned-dictionary GP English words, and encrypts both streams under a nonconstant **common quadratic pad K(i)=(7i²+11i+3) mod29** with independent page offsets13 and21. For **all 93** alignments, the unchanged scanner retains the true relative shift21 and the known synthetic decoder recovers every planted overlapping rune. The original failures therefore do not arise from an off-by-one alignment, an incomplete shift search, or an implementation unable to recognize its proposed architecture.

This rules out **direct English-GP text with unchanged printed word divisions under a contiguous reused additive pad and a single relative page offset**, at every possible placement for this original-image-selected page pair. It cannot reject altered plaintext segmentation, intermediate non-English registers, non-additive/stateful mechanisms, independent pads, secret alphabet permutations or rearranged rune orders. Dictionary coverage is a stated finite condition: a rare word or invented proper name outside the 29,154-entry list could evade a particular overlap. The original imagery does not supply a shared-pad instruction.

**Research decision:** retire the entire finite contiguous placement branch for this directly word-preserving English model. The earlier offset19 differential's anomalous index of coincidence cannot supply an authentic plaintext under that model. Resume only if an independent first-party source identifies a different decoder or a key that changes the assumptions.
