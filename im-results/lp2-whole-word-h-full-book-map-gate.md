# Full-book whole-word H → 2016-word-map gate

**Status: negative for a general whole-word decoder.** This does not invalidate the source-selected line-fragment H readouts; it rejects only the simple proposal to apply the same transform independently to every complete ciphertext word and read every output as a 2016 source-word index.

## Inputs

- `resources/liber-primus/lp2-transcription.txt`
- `resources/liber-primus/lp2-corpus.json`
- `resources/historical/cicada2016-4gq25-outguess.asc`

The canonical parser was applied to the first 55 rune-bearing page segments (the 56 unresolved LP2 pages, with the numeric p50 table not counted as a rune page). It returned 2,896 complete words. Rune values were taken from the canonical 29-symbol corpus.

## Frozen transform

For a word with rune values (x_0,ldots,x_{n-1}), apply the outside-in transform independently within that word:

[
H(x)_{{2i}}=(x_i-x_{n-1-i})\bmod29,qquad
H(x)_{{2i+1}}=(x_i+x_{n-1-i})\bmod29
]

and append the center rune unchanged for odd-length words. Map each output value 0–28 to the corresponding word among the first 29 alphabetic words of the authenticated 2016 signed message. Do not concatenate across word boundaries when evaluating within-word runs.

## Result

- Complete words tested: **2,896**.
- Maximum ascending consecutive source-index run within any complete word: **3**.
- Maximum descending consecutive source-index run within any complete word: **3**.
- No complete five-word source run `LIBER PRIMUS IS THE WAY` was recovered by this uniform whole-word application.

The decoded stream is dominated by short fragments and common source words. It does not form a continuous plaintext or a coherent source-register sequence.

## Interpretation

The H operation remains useful as a **selected structural/source-register readout** where page geometry, line breaks, or another independent selector fixes the object. This full-corpus negative shows that applying H indiscriminately to every complete word does not decode LP2. Do not reopen the whole-book H sweep without a new source selector.

## Reproduction outline

1. Parse the first 55 rune-bearing page segments with the repository's canonical word-boundary rules.
2. Convert each complete word to canonical GP indices.
3. Apply the frozen outside-in difference/sum transform above, resetting at every word.
4. Map output indices to signed-message words 0–28.
5. Compute longest ±1 runs separately inside each transformed word.

This is a finite exhaustive scan over the 2,896 complete words; no random seed or search parameters are involved.

## Strongest rival

The selected line-fragment H register may use a distinct physical serialization that is lost when the transform is reset at every complete word. This experiment says nothing against that narrower, independently selected route.
