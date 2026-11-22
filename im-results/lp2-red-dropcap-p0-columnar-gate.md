# p0 red-dropcap 13-column transposition gate

**Disposition: negative for the direct standard columnar-transposition hypothesis.** No plaintext or key was recovered.

## Hypothesis and source selector

The original red-channel extraction identifies 13 dropcap components across the book. Their rune values form a 13-symbol key. LP2 p0 has a 13-rune red heading followed by a 13-dot red marker, and its black body contains exactly 249 runes:

249 = 13 × 19 + 2.

That makes a 13-column classical transposition a bounded, human-plausible first consumer: the marker supplies the column count, and the book-wide dropcaps supply a key order. This is distinct from using the dropcaps as a repeating additive key, which the existing red-channel audit already rejects.

The 13 dropcap positions are global offsets in the canonical concatenated rune stream, taken from the independent Round44 P1 original-image extraction at Dukotah/cicada3301, P1 red-channel channel.json. Reading those offsets in book order against the local lp2-corpus.json gives:

- Global offsets: [0,729,848,1541,1874,3612,5506,6527,7960,8051,9519,9640,12648]
- GP indices: [15,20,13,24,14,20,1,19,23,21,27,0,24]
- GP transliteration: SLPAXLUMDNGIAFA (13 GP symbols; multi-rune Latin transliterations account for the 15 printed letters)

The local p0 red-span annotation independently places the 13-rune heading before the 13-dot marker. The tested body is page0.indices.slice(13), length 249. Its transcription has 56 printed words whose rune lengths sum to 249.

## Frozen operation

Use the 13 dropcap GP values as a columnar-transposition rank key. Ties are stable in source order. Test only the natural bounded orientations:

1. ascending and descending GP-rank order;
2. forward and reverse book order for the dropcap key;
3. the standard row-write/column-read transform and its inverse.

For 249 symbols and 13 columns, the rectangle has 20 rows: original columns 0–1 contain 20 symbols each, and columns 2–12 contain 19 each. No fitted phase, column permutation, alternate alphabet, or word-local reset is used.

The reproducer verifies that each forward/inverse pair round-trips the original 249-rune stream exactly.

## Results

All four inverse candidates are nonlinguistic. Their prefixes are:

| Key orientation | Inverse candidate prefix |
|---|---|
| Forward, ascending | GNYNGNGLNGXEOTRTHUYEXXXGUYTPSJRFYBXIABNEAEIFGNNG... |
| Forward, descending | YIANGNGEONUNNGGTHRYTXXUTERLXYJSXPYXNAEYNGIAFGFBIEE... |
| Reverse, ascending | GNYUNGNNGXEOTRTHNGYLXRXEUYTPSJXFGBNIAYNEAEIFGXNGB... |
| Reverse, descending | YYNGYEOIAUNNGGTHRNGTNXXTXRLXYJSUPEXBAEYNGIAFGFNI... |

The complete 249-symbol outputs, original-word-length segmentations, opposite-direction outputs, rank orders, and round-trip assertions are emitted by the script. No candidate contains a coherent plaintext under the original 56 word lengths. The index of coincidence is unchanged by transposition (0.034363), as expected for a permutation; it is not being used as a success criterion.

## Decision and limits

Reject the 13 red-dropcap rank key as a direct standard 13-column transposition of the p0 black body. Do not expand this into arbitrary column permutations or route transpositions.

This does not reject the red channel as a different source-selected parameter or selector. In particular, this test uses the dropcap rune values as a rank key; it does not test the 213 red-rune positions as a permutation/order selector, nor does it test other target pages.

## Reproduction

From the repository root, run: node sims/lp2_red_dropcap_columnar_p0_gate.cjs

Inputs: resources/liber-primus/lp2-corpus.json and resources/liber-primus/lp2-transcription.txt. No external network access or third-party package is required.
