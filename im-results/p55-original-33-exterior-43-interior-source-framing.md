# Terminal p55 33 exterior / 43 interior runes: no authenticated framing

**Director decision #493 (12 November 2026):** The original physical p55 has an exact, reproducible **43-rune strict-word-interior / 33-rune exterior** decomposition. Neither the original page nor the authenticated neighboring Cicada text instructs the solver to treat the 33 exteriors as a key, checksum, transport frame, reset, or separate plaintext block. No source-selected full 76-rune decoder follows. The 2016 message's 43 alphabetic words supply a possible human-visible coincidence, with **direct source-word-length and GP-prime-sum mappings already rejected on unchanged ciphertext**. This closes the proposed framing interpretation at its weakest assumption while retaining the observed word geometry.

## Fixed source boundaries

The historical May 2014 Stage11 landing HTML places the original 58 LP2 images in sequential order; physical **p55 is archive `72.jpg`**, followed immediately by solved p56 `73.jpg` and p57 `74.jpg`. The original p55 shows standard black GP text, ordinary hyphen and dot word separation, the same floral border as other pp40–55, a pale tree and a terminal red dot cluster. **No graphical bracket, color change, delimiter or layout break encloses exactly the 33 proposed exterior positions or labels their role.** The tree is an illustration below the text, not a source-marked 33-rune register.

The 76 p55 runes consist of **16 complete p55 words** and a **one-rune ending of a word that starts on physical p54**; original page-local fragment lengths are:

`[1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]`

For each complete word, retain its first and last rune as *exterior*, put the intervening runes in *interior*. The carry singleton belongs to the exterior of the p54–55 continued word. This exactly partitions **76 = (16×2 + 1) + 43**, and the strict-interior zero-based p55 positions are:

`[2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,30,31,32,33,34,37,38,39,40,43,44,49,50,51,52,53,56,57,58,59,60,65,66,67,68,71,74]`

The 33 exterior GP indices in page/source order are:

`[21,25,7,15,17,14,19,15,25,0,1,7,4,17,12,19,0,17,5,12,18,28,15,18,15,2,22,5,14,23,1,17,10]`

The 43 interior GP indices are:

`[19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18]`

The original image alone makes the word and page separations real; **classification as a cryptographic exterior/interior channel requires an additional instruction**.

## What the source actually tells a human

1. The solved **p57 PARABLE**, visible in original `74.jpg`, asks pilgrims to *shed our own circumferences* and find divinity *within*. The poetic passage has a plausible cryptographic reading about removing boundaries, but its grammatical referent is **our own**. It gives no wordwise first/last-rune removal rule, no 33-rune role and no 43-token cipher operation.
2. The verified **2016 `4gq25` signed text** says Liber Primus's words and numbers provide a map/direction. It has **43 alphabetic words** under a specific source-preserving token convention. Those words are **not explicitly bound to p55** and the message supplies no exterior transfer/nonce specification. The completed exact tests of both literal 43 word lengths and 43 GP-prime sums as additive keys on the original interiors recovered no plaintext ([original-input source tests](lp2-signed2016-wordlength-p55-interior-key-gate.md)).
3. The immediately subsequent solved **p56 AN END** asks for a separate page within the deep web that hashes to a printed 64-byte value. It does not identify p55 as that page, declare its 33 exteriors a checksum or specify a 20-byte hash. Its proven prime-totient inverse applies to p56 with a page-specific F-skip; no instruction copies the mechanism backwards.
4. The historical **2013 GEMATRIA / signed BASE29** sources now fix the 29-rune table and one integer-to-text command `3301→3QO`. They do not prescribe coding p55 word exteriors into an integer, nor a 33-digit GP digest header ([primary-source mapping](../results/2013-original-gp29-source-map.md)).

There are several incompatible possible reads of *circumference*: the border illustration, a full line, a whole page, and the first/last rune of each word. Nothing visible makes exactly the wordwise choice or assigns a reversible role to both parts. Adding a 33-symbol secret/pad/clock after observing the 43/43 coincidence would fit an unconstrained decoder.

## Independent p32 tree-clause 33-rune transport bound

An additional direct *source selected by the shared tree illustrations* is p32's first printed clause: physical p32 has 121 runes split at its original full stop into **33+88**, while physical p55 has **33 exteriors+43 interiors**. The signed 2016 image reproduces their tree background, so a human might check a direct pairing of the two same-length 33-unit registers. The existing source study found only **1/33** equal runes at aligned original positions. An exact stronger necessary check now rejects **every possible positional permutation** of the p55 outside33 stream into p32's first33 runes under unchanged GP symbol identities: their two 29-symbol frequency vectors have L1 distance **30**, so **at least 15 of the 33 rune identities must change** for any alignment, regardless of the secret shuffle. The best possible arbitrary *global alphabet relabeling* of the outside histogram still leaves three identity changes, so a direct monoalphabetic substitution plus transposition cannot match all 33 either. The latter histogram estimate is conditional to these two exact registers, rather than any independent proof that the 33/33 coincidence was deliberate. This does not exclude a cipher that alters glyph identities or uses p32/p55 in a different way. The [existing source-alignment SFT](../sims/lp2_p55_shed_circumference_43_source_gate.cjs) now asserts the exact 15-change original-register bound alongside earlier source checks.

## Finite, explicitly conditional SHA-1 framing diagnostic

One source-near but **unspecified** mechanism is to read the 33 exteriors as a base29 integer representing a 160-bit SHA-1 digest. Its length matches the minimum 33 radix-29 symbols needed to cover all possible 20-byte digests. The 43 interior rune values also encode a unique 27-byte unsigned BASE29 integer under the signed 2013 numeral convention; this is the most literal short-byte serialization and is tested explicitly alongside other formats. Under the corpus's original 0–28 GP order, the actual 33-rune integer is within 160 bits and encodes the exact 20 bytes:

`efe89bff1c7eff588ec80605c99a364067960320`.

It is **not** the SHA-1 of the 43 original interior symbols serialized as any of six explicit source-adjacent representations:

| Frozen interior representation | Bytes | SHA-1 digest |
|---|---:|---|
| 2013 BASE29 interior as minimal big-endian integer | 27 | `eddad4828e992391bb68e4e22a7673071f033420` |
| Original GP index sequence, one byte per rune | 43 | `07808332628d43a2c92a6344342cbcf770604202` |
| Original Unicode rune sequence encoded as UTF-8 | 129 | `8a1d9d9d47dfa8f3efea11a234fbb7133c1edd2f` |
| Source-primary GP transliteration encoded as ASCII | 54 | `49ed8139dd1304260c95338b619ee48e7f027796` |
| 2013-authenticated GP first-29-prime values, one byte per rune | 43 | `b00ef822ee6d2441323e32c7e97ec850df4a615d` |
| 2014 LP1 Wisdom totient of each GP prime, one byte per rune | 43 | `29da8c88569d8f5a99ca05aba46529d5cc848208` |

The [source-bound deterministic CommonJS test](../sims/p55_exterior33_framing_sft.cjs) asserts all 76 original rune indices, the partition and these complete digest comparisons. **These six failures exclude only six exact proposed SHA-1 serializations**; they do not prove that every hash construction or all 33-rune metadata schemes are impossible. There is no original instruction selecting SHA-1 or any of these six mappings for p55. This additional negative supplies no reason to try salted hashes, altered endianness, random pivots, neighboring frames or arbitrary PRNGs.

## Closure and next decryption decision

The p55 **33/43 split is a precise mathematical observation**, not demonstrated cipher framing. Keep all **76 unchanged original runes** in the target state for Director #41's blind decoder gate. Do not use a 43-rune plaintext proposal as a full p55 solve or silently discard the 33 exteriors. A new original illustration marking, signed instruction or independently selected algorithm that binds the two parts would justify revisiting the source. Absent that evidence, the original exteriors remain unknown ciphertext.

**Outcome:** no recovered p55 plaintext, source-selected key, structural field, or independent p55 continuation. Retire this particular framing/key hypothesis while preserving the exact source boundaries and the possibility of future independently evidenced layers.
