# Repeated terminal six-rune pair: DJU BEI

**Status:** intermediate structural clue; no plaintext, key, or decipherment established.

## Exact observation

The pair `DJU BEI` (GP29 indices `[23, 11, 1, 17, 18, 10]`) occurs twice in the 12,956-rune unknown LP2 stream, at zero-based start offsets **6555** and **12950**, a start-to-start separation of **6395**. This was previously reported in the independent research repository [pnotisdev/cicada3301, phase 58](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase58_djubei_reuse.md).

I independently checked the sequence against this repository's `resources/liber-primus/lp2-corpus.json` and inspected the corresponding original JPEGs in the 75-page combined archive:

- **LP2 page 27**, local rune offset 28, corresponds to combined-book image **44**. This is the first occurrence.
- **LP2 page 55**, local rune offset 70, corresponds to combined-book image **72**. This is the second occurrence and the final two words of the unknown pages, immediately before the red 13-dot mark. Solved LP2 pages 56–57 follow.

The combined archive has 17 LP1 pages before the 58 LP2 pages, so combined-image index = LP2 page + 17. Do not confuse combined image 56 with LP2 page 56: LP2 page 56 is combined image 73.

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

## Next discriminating work

1. Test whether a source-selected key/state schedule predicts the same six-rune pair at both positions; do not infer a key from the repetition alone.
2. Evaluate the 2016 “way/map” wording only as a locked crib with a specified reversible operation and held-out prediction.
3. Determine whether the terminal 13-dot mark is merely the next fragment delimiter or contributes an independent end-of-section instruction.

**Reproduction inputs:** `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, `lp2-ink-annotations.json`, and `lp2-grid-256.json`; original image checks used the user-provided combined JPEG archive and can be cross-checked against [image 44](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/011-seventh-onion/44.jpg) and [image 72](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/011-seventh-onion/72.jpg) in the historical archive.
