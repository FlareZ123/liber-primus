# 2013 Book of the Law as a continuous GP29 running key

**Status: bounded negative for direct additive/subtractive running-key use, including the exact five numbered-verse reset receiver. No plaintext or key recovered.**

## Why test this source?

The three `resources/external/2013-book-of-law-{I,II,III}.txt` files preserve the specific book associated with the earlier Cicada 2013 round. A human solver of Liber Primus could reasonably recognize the title-level relationship between *Liber Primus* and *Liber AL vel Legis* and try the familiar running-key operation before inventing a new cipher family. The Book of the Law also contains explicit numeric phrases (“six and fifty”; “sixty-one”; “eight, eighty, four hundred and eighteen”), so a source-aligned offset scan is preferable to unconstrained book hunting.

This report tests direct GP29 running-key interpretations with continuous or literal numbered-verse reset clocks. It does not assume the book is an authenticated LP2 key.

## Locked test

- **Key source:** chapters I, II and III in the repository's 2013 Cicada Book of the Law transcription, concatenated in chapter order.
- **Encoding:** same greedy GP29 transliteration used by `sims/rand1955_running_key.py`: uppercase; QU→CW, V→U, K→C, Z→S; longest GP tokens first; ignore nonletters and verse numbers.
- **Key size:** 31,061 raw characters → **21,630 GP symbols**.
- **Ciphertext:** original LP2 unknown pages p0–p55, flattened in physical order; numeric-only p50 contributes zero runes. **12,956 runes**.
- **Clock:** one continuous key stream across the entire unknown book; no page, line, word or section resets.
- **Operation:** (P_i=C_i-K_{j+i}\pmod{29}) or (P_i=C_i+K_{j+i}\pmod{29}).
- **Alignment:** every legal full-book offset (j=0,\ldots,8674), both signs.
- **Train/holdout:** train on physical pages p0–p27 (**6,761 runes**); hold out p28–p55 (**6,195 runes**). Offsets are ranked on the first half only; the same offsets are then scored on the untouched second half.
- **Language score:** GP29 unigram log likelihood from the first 240,000 characters of the pinned Shakespeare control, with add-one smoothing. Held-out Shakespeare reference mean is **−2.97858** nats/rune; uniform GP29 mean is **−3.36730**.

The explicit source-number offsets 0, 8, 56, 61, 80 and 418 were also scored, in both signs. These include the numbers stated in the Book of the Law passages; 84 is not substituted for the source's “eight, eighty”.

## Original-ciphertext results

Best train-ranked candidates (larger / less negative is better):

| Decode sign | Key offset | Train score | Frozen holdout score | Full score |
|---|---:|---:|---:|---:|
| subtract key | 3357 | −4.19396 | −4.27377 | −4.23212 |
| subtract key | 8594 | −4.19496 | −4.29231 | −4.24151 |
| subtract key | 4120 | −4.19608 | −4.29703 | −4.24435 |
| subtract key | 5370 | −4.20174 | −4.25905 | −4.22914 |
| subtract key | 5808 | −4.20409 | −4.28200 | −4.24134 |
| subtract key | 163 | −4.20715 | −4.22862 | −4.21742 |
| add key | **232** | **−4.17655** | **−4.23848** | **−4.20616** |
| add key | 4168 | −4.17944 | −4.25850 | −4.21724 |
| add key | 2421 | −4.17996 | −4.26348 | −4.21990 |
| add key | 4556 | −4.18022 | −4.25188 | −4.21449 |
| add key | 5801 | −4.18228 | −4.24466 | −4.21211 |

The best full-book score is **−4.20616** at offset 232, still markedly worse than both the uniform baseline (−3.36730) and native English reference (−2.97858). Its frozen holdout is also poor (−4.23848); the train maximum does not generalize.

The explicit source-number offsets are equally negative:

| Offset | Subtract-key full score | Add-key full score |
|---:|---:|---:|
| 0 | −4.25662 | −4.25306 |
| 8 | −4.27192 | −4.24275 |
| 56 | −4.27193 | −4.27316 |
| 61 | −4.27525 | −4.30571 |
| 80 | −4.26451 | −4.28350 |
| 418 | −4.26442 | −4.22865 |

## Positive control

To check that the source scan can recover a real running-key alignment, held-out Shakespeare GP29 plaintext was encrypted as (C=P+K\pmod{29}) using the same Book-of-the-Law key at hidden offset **1234**. Scanning the same 8,675 legal offsets with the subtract-key decoder recovered offset **1234 at rank 1**:

- train: −2.97187
- holdout: −2.98132
- full: −2.97639

The positive control is native-English-like and decisively separates the true offset from the other offsets. The negative original result is therefore not explained by an insensitive offset scan.

## Decision and limits

**Reject the direct continuous GP29 running-key hypothesis using this Book of the Law transcription.** No offset, sign, or explicit numeric offset yields an English-like original plaintext. Do not add a rejection/skip layer to rescue this candidate: the book is a source-plausible key, but no independent source instruction selects such an extra operation.

Separate source-directed cyclic-pointer tests now use the same key with GP-prime-sum primality and the literal μ(previous-word GP-prime-sum) as direction, motivated by the signed 2016 direction instruction and LP1's prime/MOBIUS/circumference clues. Both prime/composite readings and all four Möbius variants are negative; see [the prime/Möbius-directed pointer gates](book-of-law-prime-direction-running-key-gate.md). These are distinct from the direct continuous-key test above and do not add a skip layer. This does not rule out a book cipher using verse/word numbers, a semantic route through the text, or using one of its numbers as a seed for a separately source-authenticated generator. Those are distinct hypotheses and need their own observable selector and discriminating prediction. The continuous result above is only about a direct full-length running key; the separately tested literal verse-indexed resets below are also negative.

## Reproduction

```sh
node sims/book_of_law_running_key_gate.cjs
```

The script reads the three pinned chapter transcriptions, canonical LP2 corpus and Shakespeare control; scans every legal offset in both signs; reports train/holdout rankings and the explicit numeric offsets; and runs the hidden-offset positive control.

## Numbered-verse reset receiver (Agent50, Director #2885, 26 November 2026)

**Decision:** the printed red labels 1–5 on original LP2 p36–38 do not yield plaintext when used as exact verse identifiers in the three preserved historical chapters of *Liber AL vel Legis*. All fifteen literal-verse plaintext lengths disagree with their corresponding original numbered item. For the distinct literal-verse-as-cyclic-key hypothesis, 29/30 strict plaintext-F inverses are algebraically impossible and the sole survivor is nonlinguistic. No new key or unknown plaintext.

### Human solve path and rival

The original JPEGs 53.jpg–55.jpg visibly enumerate five rune passages with separate red Arabic labels. The preserved 2013 book-code source has literal numbered verses beginning at 1 in each of three chapters. A solver familiar with the earlier round could select the same numbered verse before inspecting any ciphertext outputs. The operation is the already known GP29 additive Vigenère family, with the selected verse repeated from its first rune at each red label. The source does not specify the chapter or the transfer operation, so test the three actual chapters without choosing one by a score. This is a finite exploratory receiver, not an authenticated selector.

The strongest independent rival is ordinary semantic enumeration: genuine 2014 Onion6 clear pages 10/11 explicitly number two errors described by preceding prose, while the GP words themselves express the meaning. This demonstrates that a printed number need not encode a key at all. The historical chapter/verse book-code grammar also does not by itself license turning its verse into a Vigenère key.

### Locked original experiment

Use the actual p36 [99,238), p37 [0,91), p37 [91,189), p37 [189,228) + p38 [0,57), and p38 [57,186) slices. Preserve the item 4 physical carry. Convert the exact preserved 2013-liber-al-bookcode-{I,II,III}.txt verses with the established running-key GP alphabet (QU→CW, V→U, K→C, Z→S, longest tokens, skip nonletters). No offsets, no verse permutation, no alternate dictionary, no cross-item fitting. Compare the literal lengths first; then decode with each corresponding cyclic key, both signs, both ordinary consuming and exact historical plaintext-F-transparent clocks. In the latter, literal plaintext F emits C=0 without advancing; every ordinary decoded non-F advances. Exhaustive dynamic programming merges states by consumed count and last plaintext rune, sums path counts as BigInt, and retains the best native bigram path per state. Exact replay is checked for each deterministic ordinary and best legal strict inverse.

| Item | Original runes | Chapter I verse | Chapter II verse | Chapter III verse |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 139 | 24 | 16 | 31 |
| 2 | 91 | 28 | 117 | 110 |
| 3 | 98 | 28 | 65 | 73 |
| 4 | 96 | 39 | 24 | 16 |
| 5 | 129 | 58 | 117 | 9 |

No literal verse has the matching GP length; this rejects the exact verbatim length-preserving plaintext interpretation only. All 30 ordinary candidates have negative mean native bigram log-ratio to uniform (range −0.508491 to −0.128904 nats per transition), versus +0.525844 on the independently held-out actual clear p57. The best ordinary candidate is chapter I/item4, decode-add sign; its IoC is 0.033553 and its beginning is `I EO R S T P L EA C R D A N E D I W W E P B T Y IA W B R J R EA A M A S O`, not coherent prose.

The following are the first zero-reachable-state ciphertext indices for the strict historical F receiver, **zero-based, within each item**. Each cell gives (subtract key, add key).

| Chapter | Item 1 | Item 2 | Item 3 | Item 4 | Item 5 |
| --- | --- | --- | --- | --- | --- |
| I | 87,11 | 18,37 | 1,44 | 8,37 | 0,7 |
| II | 12,0 | 41,1 | 55,26 | 32,1 | 34,11 |
| III | 72,10 | 7,45 | 65,24 | **one legal path**,10 | 33,43 |

The only legal strict inverse is III/item4/subtract-key, unique, score −0.391924, IoC 0.039693; it begins `T O EO H R S OE L OE G N EA O P C T NG M C D P AE J C D IA H T I I C AE M E AE`. It exactly replays but is nonlinguistic. No single historical chapter has even one complete legal five-item decoding.

### Controls and reproduction

Train the bigram model on 755 actual GP runes from the preserved 2014 Onion6 clear pages 10–13, add 0.5 per transition. Held-out native p57 contains 95 runes, IoC 0.062710 and bigram log-ratio +0.525844. All 30 ordinary planted cases recover exactly. All 30 strict planted cases (p57 repeated to the actual item length) retain legal paths; the Viterbi choices recover 3,292/3,318 actual plaintext symbols (one unique strict plant), exposing genuine F-mask ambiguity rather than claiming perfect identification. This is a connected JavaScript execution, no GitHub CI execution claimed.

Run `node sims/lp2_numbered_liber_al_verse_key_sft.cjs` to reproduce every row and control. [Exact script](../sims/lp2_numbered_liber_al_verse_key_sft.cjs), commit `328611b4bccba61ee56a0bcf5fa8479de14bed3c`. Pinned input Git blob SHA-1s: corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; verses I `64876892683fab1467481fe87d85743a8ea17982`, II `cb4353b080d7584441f85502aeccb60796e6fe0f`, III `36e716252a271d31f5c4ba25b3cb78199ccc1114`; native control `4525055701cec4efbc265fddedcf04019ab8bbfa`.

**Next decision:** retire this exact verse-indexed receiver. The five labels alone do not select a chapter or an operator. A materially new source need is an original instruction that identifies a chapter/verse operand and how to consume it, or a real historical example of a verse-key reset selected by the same visual convention. An additional arbitrary verse offset, reverse order, or key transformation would be post hoc. The original five-item ordered structure remains open; see [consolidated numbered-passage evidence](lp2-cuneiform-five-numbered-wisdom-inversion.md).
