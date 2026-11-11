# Repeated terminal six-rune pair: DJU BEI

**Status:** intermediate structural clue; no plaintext, key, or decipherment established.

## Exact observation

The pair `DJU BEI` (GP29 indices `[23, 11, 1, 17, 18, 10]`) occurs twice in the 12,956-rune unknown LP2 stream, at zero-based start offsets **6555** and **12950**, a start-to-start separation of **6395**. This was previously reported in the independent research repository [pnotisdev/cicada3301, phase 58](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase58_djubei_reuse.md).

I independently checked the sequence against this repository's `resources/liber-primus/lp2-corpus.json` and inspected the corresponding original JPEGs in the 75-page combined archive:

- **LP2 page 27**, local rune offset 28, corresponds to combined-book image **44**. This is the first occurrence.
- **LP2 page 55**, local rune offset 70, corresponds to combined-book image **72**. This is the second occurrence and the final two words of the unknown pages, immediately before the red 13-dot mark. Solved LP2 pages 56–57 follow.

The combined archive has 17 LP1 pages before the 58 LP2 pages, so combined-image index = LP2 page + 17. Do not confuse combined image 56 with LP2 page 56: LP2 page 56 is combined image 73.

## New source-only prime-mean and solved-word address reading (Agent 15, 11 November 2026)

The exact repeated pair is also the **only duplicated adjacent complete rune-word pair** among all **2,895 adjacent pairs** of the 2,896 canonical whole LP2 ciphertext words. The two words each have exactly three GP runes and occur exactly twice individually, together on p27 and again as the final two words on p55. This observation preserves printed boundaries; it is more constrained than a duplicate six-rune window chosen from the continuous ciphertext.

The existing GP prime weights give the same values at both locations:

| Original complete word | GP prime sum | Mean of its three rune primes | GP symbol for that mean |
| --- | ---: | ---: | --- |
| `DJU` | 129 | **43**, prime | **P** |
| `BEI` | 159 | **53**, prime | **S** |
| Both | **288** | — | — |

Thus one simple *hypothesized* compression of each three-rune word, **mean of GP prime weights followed by its inverse GP prime-to-rune map**, yields **P S**. At the end of a book, the familiar reading “P.S.” is possible, but the manuscript does not authorize this compression or that expansion. An independent scan of **all 184** original adjacent **3+3-rune** pairs finds just **four occurrences** with both means in the 29-symbol GP prime alphabet: `S H` at canonical word 315, `P S` at word 1,462, `P P` at word 1,654 and `P S` again at final word 2,894. The second `P S` is a literal repeat of the first six glyphs, so the duplicate provides **one** candidate message rather than two independent demonstrations of a cipher.

Separately, the combined prime sum **129+159=288** gives under the *existing*, independently formulated signed-2016 word-as-map rule `page = N mod 58`, `word = floor(N/58)`, exactly **physical p56, zero-based word4 = DEEP**, previously and independently solved. This is a new cross-link to the already established **THE DEEP END** solved-endpoint reading from p55. Neither the original signed message nor the pair itself says to *add* consecutive word sums before applying the otherwise single-word address rule. The arithmetic is deterministic and source-grounded, while the choice of grouping/averaging remains conjectural. It produces **no new unknown plaintext or decryption key**.

**Conditioning matters.** The pair's placement is striking under a free whole-book word shuffle. But if we condition on the two special 3-rune words **already being present once each on p27 and p55**, and preserve every page's exact word-length slot sequence, p27 has **13 three-rune slots and four adjacent three-plus-three slots**, while p55 has **two three-rune slots, both terminal**. Randomly and independently assigning the two unique words to their available three-rune slots per page gives the *exact* matching-adjacency probability
`[4/(13×12)] × [1/(2×1)] = 1/78 ≈ 0.0128205`.
This is a **conditional placement reference**, not a discovery-wide significance level and not proof of authorial intent. The source selection, arithmetic letter reading, repeated-pair observation and terminal positioning were all recognized in exploratory work.

[Deterministic CJS original-input reproducer](../sims/dju_bei_prime_mean_wordpair_sft.cjs) asserts the complete canonical word census, uniquely repeated pair, all four eligible prime-mean pairs, the exact p27/p55 page/length slots, and the source-fixed map to solved DEEP. The inference remains a candidate *author-selected cross-reference*, not a cipher recovery. Advance it only if an independent original source selects the prime-average letter reading or pair-sum-address operation and yields a frozen prediction on an unsolved target.

## Relation to the 13-dot fragments and candidate M7 map

Under the existing chronological 13-dot segmentation (31 events, 32 fragments, two empty, 30 nonempty):

- The first occurrence lies in fragment **19**, at offset **9** of its 1,414 runes.
- The second lies in fragment **28**, at offset **293** of its 299 runes: exactly the fragment's final six runes.

There is a conditional cross-link to the candidate p50-grid rank map. Sorting the 30 nonempty fragment rows by the p50 grid's unique second-column byte assigns fragment 19 to projective rank **22** and fragment 28 to rank **24**. The p32 matrix
`M7 = [[14,25],[25,28]]`
has fixed points 22 and 25. The other fixed-point fragment under this candidate map is fragment 22, the eight-rune p33 red heading, at rank 25.

This is **not source-authenticated**: the second-column rank mapping remains a hypothesis. The pair's first occurrence being in a fixed-point fragment is therefore a conditional observation, not evidence that the map is correct.

## Relation to the lag-six signal

Neither occurrence is itself a `T6` event: for all six positions in both copies,
`c[i] != 24 - 2*c[i-6] (mod 29)`.
The manuscript-wide lag-five/lag-six analysis is already documented in `im-results/lag5-lag6-heldout-conditional-prediction.md`; this report does not duplicate that result.

## Candidate interpretations and limits

The pair could be a repeated plaintext refrain under a reused or position-dependent key, a terminal marker, or a chance ciphertext repetition. Its second occurrence is terminal in the unknown stream, which makes a terminal/refrain interpretation worth testing.

The authenticated 2016 message's phrases “the way” and “the map” are possible crib ideas, not plaintext evidence. In GP29, `TH` is a single rune, so either phrase has five GP symbols; a 3+3 ciphertext pair could accommodate it only with an additional symbol/null in the first word. That is compatible with one external forward-model hypothesis, but does not identify the null, key, or plaintext. A narrow test of a single affine map to these candidate phrases, deleting one symbol from the first ciphertext word, found no fit; this rejects only that simple model.

## Source-locked affine word-pair constraint (Agent 38, 11 November 2026)

This extension tests whether the repeated phrase is one of a family of otherwise invisible repeated plaintext phrases under *word-local Caesar or affine encipherment*. A human solver could recognize a recurring two-word phrase while allowing each word its own rotating rune alphabet. A necessary condition for this proposed decoder is that two-word equality **up to the hypothesized alphabet transformations** survives encryption.

For each original complete ciphertext word of GP indices `w`, its canonical Caesar-invariant fingerprint is `(w_i-w_0) mod 29`. For affine `a*w_i+b`, where `a != 0 mod 29`, further divide by the first nonzero difference. Concatenate two fingerprints and freeze their separately printed rune-word lengths. For a **shared affine mapping applied to both words**, normalize the combined pair under one affine multiplier and preserve the first-word boundary instead. The fingerprints are mathematically invariant under every secret key in these respective families; they do not fit ciphertext language or rely on a recovered plaintext.

Across the **2,896 whole original unsolved words**, with printed page wraps rejoined and GP29 identity confirmed against original physical-page indices, the complete census is:

| Key-independent class of printed two-word phrase, at least six runes | Eligible neighboring pairs | Additional occurrences beyond distinct classes | Repeated classes |
| --- | ---: | ---: | ---: |
| **One shared arbitrary affine multiplier/shift per phrase** | 2,495 | **1** | **1** |
| **Separate arbitrary Caesar shift per word**, each word at least two runes | 2,422 | **1** | **1** |
| Separate arbitrary affine multiplier/shift per word, each at least two runes | 2,422 | 30 | 26 |

The **only** repeated class under either of the first two architectures is the *exact identical original* `DJU-BEI` at **global rune offsets 6,555 and 12,950**; its GP29 indices are `[23,11,1 | 17,18,10]`. The third, much less constrained architecture produces 26 short collision classes, so the marker is no longer unique there. The SFT additionally checks that independently shifted GP words and a jointly affine-transformed pair preserve the declared fingerprints.

To judge the frequency of such class collisions in native prose, construct **100 whole-word resamples per reference author**, independently sampling a genuine GP-transliterated source word of the *same exact rune length as each of the 2,896 original printed words*, preserving every original word-length position, phrase boundary and eligible-pair count. All GP digraph choices are frozen to the existing `word_partition_invariant.cjs` mapping, with no ciphertext-fitted spelling. The finite reference controls give:

| Native GP-English source | Shared-affine additional pairs, mean (min–max) | Independently shifted additional pairs, mean (min–max) | Independently affine additional pairs, mean (min–max) |
| --- | --- | --- | --- |
| Shakespeare, 55,407 source tokens | 34.61 (18–55) | 39.04 (23–62) | 146.80 (117–178) |
| Emerson, 77,932 source tokens | 48.52 (30–67) | 51.78 (37–69) | 137.82 (112–168) |
| Gibran, 15,733 source tokens | 94.49 (70–115) | 99.64 (76–122) | 216.19 (189–249) |
| **Original unknown LP2** | **1** | **1** | **30** |

Every one of these **300 finite word-length-matched native-English samples** has more repeat classes than the original for each declared architecture. This is a conditional language-register comparison, rather than a universal statistical proof: the reference draws use independent words sampled with replacement, and an author selecting unusually low-repetition phrasing could avoid these collisions. Sampling words out of original LP2's *own ciphertext word inventory* and shuffling their order 100 times gives only 0–1 independent-Caesar pair collisions (mean **0.04**). Thus the structural sparsity is rooted primarily in the individual ciphertext word fingerprints, while the exact terminal bookend pair is an additional, source-visible placement.

**Decision:** ordinary native-GP English passed through independently keyed word-local Caesar or affine maps is severely mismatched on its otherwise unalterable two-word recurrence signature, even when every word has a different unknown key. This extends the previously documented [wordwise equality-partition necessary condition](wordwise-equality-invariant.md) into phrase structure; it does not identify the historical cipher or exclude low-repetition text, hidden transpositions, homophonic/variable-rate registers, or changing within-word cipher state. The exact six-rune echo remains a useful *fixed holdout landmark* for any independently selected genuine decoder; it supplies no authentic key, plaintext or destination on its own.

**Reproducer:** [standalone canonical-source and seeded-three-author SFT](../sims/dju_bei_affine_wordpair_sft.cjs), which asserts every original GP index, both unique six-rune collision classes, and native synthetic transformation invariance.

## Next source-to-plaintext decision

The two occurrences delimit the existing bookend hypothesis but cannot select a shift, affine key or readout direction. An independently source-selected key/state law could use their unchanged equality as a strict terminal prediction, while also yielding coherent withheld plaintext. Absent such an operator, retire further unconstrained use of the six-rune repetition, synthetic 81²/80² geometry, or phrase guesses. The 2016 wording and 13-dot punctuation remain clues to inspect only when they specify an executable rule.
