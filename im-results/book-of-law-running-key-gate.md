# 2013 Book of the Law as a continuous GP29 running key

**Status: bounded negative for direct additive/subtractive running-key use. No plaintext or key recovered.**

## Why test this source?

The three `resources/external/2013-book-of-law-{I,II,III}.txt` files preserve the specific book associated with the earlier Cicada 2013 round. A human solver of Liber Primus could reasonably recognize the title-level relationship between *Liber Primus* and *Liber AL vel Legis* and try the familiar running-key operation before inventing a new cipher family. The Book of the Law also contains explicit numeric phrases (“six and fifty”; “sixty-one”; “eight, eighty, four hundred and eighteen”), so a source-aligned offset scan is preferable to unconstrained book hunting.

This report tests only the simplest direct GP29 running-key interpretation. It does not assume the book is an authenticated LP2 key.

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

This does not rule out a book cipher using verse/word numbers, a semantic route through the text, or using one of its numbers as a seed for a separately source-authenticated generator. Those are distinct hypotheses and need their own observable selector and discriminating prediction. The result here is only about a direct full-length running key.

## Reproduction

```sh
node sims/book_of_law_running_key_gate.cjs
```

The script reads the three pinned chapter transcriptions, canonical LP2 corpus and Shakespeare control; scans every legal offset in both signs; reports train/holdout rankings and the explicit numeric offsets; and runs the hidden-offset positive control.
