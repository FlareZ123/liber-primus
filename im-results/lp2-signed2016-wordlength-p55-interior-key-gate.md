# Signed 2016 43-word lengths and GP-prime values as p55 strict-interior keys

**Decision:** all four frozen source-order GP29 additive readings fail the original 43-rune language check. This closes direct signed-word **length** and **GP-prime-sum** key transfers. It recovers no unknown Liber Primus plaintext, authenticated key, or destination. The full 76-rune p55 decoder remains unavailable.

## Source-selected premise and weakest link

The [OpenPGP-verified 2016 message](../resources/cicada2016-4gq25.md) says Liber Primus's words are the map, their meaning the road, and their numbers the direction. Its clear-signed body contains **43 alphabetic words** under the already used, fixed alphabetic-token grammar; numerals 3301 and 7A35090F are not alphabetic words. The solved p57 *PARABLE* tells pilgrims to shed circumferences and find the divinity within; stripping first/last runes from the source-correct **17 printed p55 words** leaves exactly **43 strict-interior runes**. This permits a visually understandable one-to-one test with the signed word lengths or GP-prime sums, with different interpretations of the authenticated instruction that the words' numbers provide direction. Nothing in the historical text explicitly authorizes this mapping or a particular additive sign.

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

## Independent signed-word GP-prime-sum key

The literal verified message says the words' **numbers** indicate direction. The existing GP29 prime-weight table supplies a different source-constrained word number from mere length. Encode each of the 43 original signed alphabetic words using the already established native-GP spelling normalization (e.g., V→U and K→C), add its GP-prime weights, reduce modulo29, and apply the resulting **43-value key at original position 0** to the same 43 strict-interior p55 glyphs. This changes only the independently motivated definition of the word number; no word/phase is discarded, reordered, or fitted to the unknown text. Note that applying 2016 words to p55 remains conjectural: the signed message gives no explicit 43-cell pairing or GP transliteration recipe.

The 43 original signed words yield this pinned prime-sum key, in source order:

`[11,14,0,21,24,1,21,14,4,11,9,26,14,16,27,5,1,14,8,27,0,26,14,1,12,27,5,1,14,18,26,12,26,22,12,14,4,15,3,2,24,14,17]`.

| Reading | Complete 43-GP-rune transliteration | Held-out-language score | Native windows at or below score | Shuffled-key scores at least as good |
| --- | --- | ---: | ---: | ---: |
| C−prime-sum | `HAEEOXEAUGIPDMOFDNGAEREAFDLENYUIWBAEBBDEMMBXPWBIYU` | **−5.855950** | 0/1,018 | 191/2,000 |
| C+prime-sum | `UAEOIAEOMNNGTHYEAYBGGIATMLEOHEAAEGBMAAJEEOCXTOEXPNGFAEG` | **−7.771128** | 0/1,018 | 1,991/2,000 |

Both original 43-rune strings are nonlinguistic under the same independently trained GP29 trigram model, whose held-out native-English minimum is −3.118039. A genuine 43-rune solved-p57 text plant encrypts and decrypts exactly **43/43** under each sign; shifting the numeric key by one position recovers **0/43** literal plant glyphs, with heavily degraded language scores. Each original output reencrypts to the exact 43 original indices. These controls make the direct negative discriminating without claiming that a wrong cipher inverse can be recognized from round-trip success alone.

Reproduce with [`sims/lp2_signed2016_gematria_word_p55_interior_sft.cjs`](../sims/lp2_signed2016_gematria_word_p55_interior_sft.cjs); successful [manual-only GitHub Actions run 43115260087](https://github.com/FlareZ123/liber-primus/actions/runs/43115260087).

This retires this specific **GP-prime-weight key transfer** alongside the separately tested literal word-length transfer. It neither determines the unobserved p55 plaintext nor resolves the 33 exterior glyphs. A different word-to-symbol interpretation requires independent source support or a frozen held-out prediction.

## Detection controls and limitations

The score uses a frozen, additive-backoff GP unigram/bigram/trigram model trained on the first 240,000 characters of the repository's Shakespeare control, with the remainder excluded from training. Its 1,018 nonoverlapping held-out 43-GP-rune windows have minimum score **−3.118039** and median **−2.384825**; the p55 candidates are much less language-like. This is a descriptive calibration, not a cryptanalytic p-value.

A separate 43-rune excerpt of the solved p57 PARABLE, GP-encoded under the same normalization, was encrypted by each of the two exact frozen keys and recovered **43/43** in both cases. A wrong cyclically shifted key matches only **9/43** original plant symbols for each sign and scores −6.484983/−5.987637, while the correct native plant scores −2.277806. **Both original p55 decodings re-encrypt byte-for-byte to the same 43 GP indices**, a necessary implementation check which every invertible wrong key also satisfies. The shuffled-key comparison used 2,000 source-length-preserving reorderings with fixed xorshift32 seed `0x38201643` and applied both signs without retuning the scoring model.

These are independent 43-length and GP-prime-sum key exclusions. They do not test an independently supplied non-additive mapping, an authenticated word-number codebook, or a key derived from the semantics of the signed message. The 43-to-43 coincidence alone remains insufficient to establish cipher intent.

**Executable standalone reproduction:** [`sims/lp2_signed2016_wordlength_p55_interior_sft.cjs`](../sims/lp2_signed2016_wordlength_p55_interior_sft.cjs), Node.js 22, CommonJS, read-only. It checks the exact signed words, 17 p55 word lengths, original rune indices and offsets, both inverse/forward transforms, native-control round trips, fixed wrong key, and the held-out/Shakespeare plus shuffled-key comparisons.
