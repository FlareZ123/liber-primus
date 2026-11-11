# Signed 2016 43-word lengths as the p55 strict-interior key

**Decision:** both frozen source-order GP29 additive readings fail the original 43-rune language check. This closes the literal signed-word-**length** key transfer only. It recovers no unknown Liber Primus plaintext, authenticated key, or destination. The full 76-rune p55 decoder remains unavailable.

## Source-selected premise and weakest link

The [OpenPGP-verified 2016 message](../resources/cicada2016-4gq25.md) says Liber Primus's words are the map, their meaning the road, and their numbers the direction. Its clear-signed body contains **43 alphabetic words** under the already used, fixed alphabetic-token grammar; numerals 3301 and 7A35090F are not alphabetic words. The solved p57 *PARABLE* tells pilgrims to shed circumferences and find the divinity within; stripping first/last runes from the source-correct **17 printed p55 words** leaves exactly **43 strict-interior runes**. This permits a visually understandable one-to-one test with the signed word lengths. Nothing in the historical text explicitly authorizes this mapping or a particular additive sign.

The source p55 word-length sequence is `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. The 43 interior local offsets, zero-based on physical p55, are:

`[2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,30,31,32,33,34,37,38,39,40,43,44,49,50,51,52,53,56,57,58,59,60,65,66,67,68,71,74]`.

The 33 exterior glyphs remain untouched and are not silently treated as solved text. Local p55 offset 0 is the cross-page carry singleton. Original sources: [canonical runes](../resources/liber-primus/lp2-corpus.json), [original-source transcription](../resources/lp2-transcription.txt), [signed message bytes](../resources/historical/cicada2016-4gq25-outguess.asc).

## Frozen key, inverse and original results

In clear-signed message order, the exact alphabetic words are:

`Hello The path lies empty epiphany seeks the devoted Liber Primus is the way Its words are the map their meaning is the road and their numbers are the direction Seek and you will be found Good luck Beware false paths Verify OpenPGP`.

Their character-count key is:

`[5,3,4,4,5,8,5,3,7,5,6,2,3,3,3,5,3,3,3,5,7,2,3,4,3,5,7,3,3,9,4,3,3,4,2,5,4,4,6,5,5,6,7]`.

Let `C[i]` denote the fixed 43 original p55 interior GP indices, `L[i]` these 43 lengths, and `P[i]=(C[i]±L[i]) mod29`. The test exhausts the only **two frozen signs**, always beginning with key word 0 and source interior 0; there are no rotations, variable phases, resets, extra filters, or adjusted word lengths. The unchanged ciphertext indices are:

`[19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18]`.

| Reading | Complete 43-GP-rune Latin transliteration | Held-out-language score | Matched native 43-rune windows at or below score | Shuffled-key scores at least as good |
| --- | --- | ---: | ---: | ---: |
| C−L | `XWHTHEDOENGIFOEIAJWTAETHICTPPLDIOCSWYIOEOHFYXARXFCJ` | −6.708264 | 0/1,018 | 1,374/2,000 |
| C+L | `APTIEAIOIAAICTHBPOEGHTJYIABYTHTPMNGPSENETRWOEOTAIBAE` | −5.982591 | 0/1,018 | 398/2,000 |

The register preserves the multi-letter GP transliterations (for example NG and EA), so the Latin strings contain more than 43 conventional letters while remaining exactly 43 GP symbols. Their exact GP index/rune arrays and source offsets are emitted by the reproducer.

## Detection controls and limitations

The score uses a frozen, additive-backoff GP unigram/bigram/trigram model trained on the first 240,000 characters of the repository's Shakespeare control, with the remainder excluded from training. Its 1,018 nonoverlapping held-out 43-GP-rune windows have minimum score **−3.118039** and median **−2.384825**; the p55 candidates are much less language-like. This is a descriptive calibration, not a cryptanalytic p-value.

A separate 43-rune excerpt of the solved p57 PARABLE, GP-encoded under the same normalization, was encrypted by each of the two exact frozen keys and recovered **43/43** in both cases. A wrong cyclically shifted key matches only **9/43** original plant symbols for each sign and scores −6.484983/−5.987637, while the correct native plant scores −2.277806. **Both original p55 decodings re-encrypt byte-for-byte to the same 43 GP indices**, a necessary implementation check which every invertible wrong key also satisfies. The shuffled-key comparison used 2,000 source-length-preserving reorderings with fixed xorshift32 seed `0x38201643` and applied both signs without retuning the scoring model.

This is a literal 43-length-key exclusion. It does not test an independently supplied non-additive mapping, an authenticated word-number codebook, or a key derived from the semantics of the signed message. The 43-to-43 coincidence alone remains insufficient to establish cipher intent.

**Executable standalone reproduction:** [`sims/lp2_signed2016_wordlength_p55_interior_sft.cjs`](../sims/lp2_signed2016_wordlength_p55_interior_sft.cjs), Node.js 22, CommonJS, read-only. It checks the exact signed words, 17 p55 word lengths, original rune indices and offsets, both inverse/forward transforms, native-control round trips, fixed wrong key, and the held-out/Shakespeare plus shuffled-key comparisons.
