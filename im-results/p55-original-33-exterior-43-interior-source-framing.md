# Terminal p55 33 exterior / 43 interior runes: source-supported partition, no decoder

**Status updated 25 November 2026 (Director #1895; Agent16):** Original p55 has an exact, reproducible **43-rune strict-word-interior / 33-rune exterior** decomposition. The authenticated 2013 BASE29/DH value **3301 = 43×76 + 33**, where original p55 has 76 runes; solved p57's “shed our own circumferences” independently motivates an interior/exterior reading. The p50 32×8 table also has a 76-cell perimeter and 180-cell interior, matching p55 and the solved p56+p57 180-rune register. This supersedes the earlier classification that no source selected the count-level partition. A new LP1 p5 / LP2 p57 interpretation selects **29 of the 43 strict interiors** by a wordwise coprime-position rule and yields a reproducible 29-character BASE29 candidate password; it has no verified receiver and is not an authenticated key. The simplest same-page Vigenere receiver is negative; a single-image OpenPuff receiver remains untested and owner/Director-gated. The exact wordwise first/last implementation remains an inferred realization of the structural clue, not an explicit printed algorithm. A later p28 DH-derived GP29 cube/inverse candidate has been tested directly on the 43 strict interiors while preserving all 33 exteriors; neither direction produces readable text (see the p55 DH-cube receiver gate). No source assigns the 33 exteriors a key, checksum, transport-frame, reset, or separate-plaintext role, and no complete reversible operation/order for the 76 runes is established. Keep all 76 original p55 runes in the target state; do not silently discard the shell.

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

## Exact original-p55 obstruction to any literal exterior-copy decoder (Agent40, 21 November)

There is now an independent **keyless failure condition** for proposals that modify **only the 43 strict interiors** and treat all 33 outside runes as literal, unchanged plaintext boundaries. Five of p55's 16 complete printed words have **exactly two runes** and therefore **no interior positions at all**. Their original page-local starting offsets (zero-based) and native-GP transliterations are:

| Original p55 offset | Two-rune source word |
| ---: | --- |
| 5 | `S-B` (SB) |
| 7 | `X-M` (XM) |
| 21 | `W-R` (WR) |
| 46 | `EO-E` (EOE) |
| 62 | `TH-OE` (THOE) |

All ten rune positions in those five words are **exterior positions**. Consequently **any** interior-only algorithm, no matter how nonlinear or what key it uses, must output these exact five words if it preserves printed word breaks. Under the established native-GP spelling rules, none of the five belongs to **any** of four pinned independent English word sets: the Shakespeare, Gibran, Emerson and TextBlob word-frequency corpora. A decoder producing words drawn from these English controls must therefore **change at least one exterior rune in each word** (at least five positions total), or explicitly alter the word segmentation. This is a conditional native-English necessary condition, not a proof against every language, acronym or word-boundary-changing cipher.

The independent read-only [Node22 CJS reproducer](../sims/lp2_p55_exterior_copy_two_rune_obstruction_sft.cjs) reconstructs the original full 76-rune page, the exact 43/33 partition, five untouched short words and four independently encoded native-GP lexicons; positive controls admit true source-native words `IN` and `THE`. It also applies a reversible mutation to every one of the 43 interiors and checks that all five short words remain unmodified. [Windows original-source CI PASS 44961526952](https://github.com/FlareZ123/liber-primus/actions/runs/44961526952).

**Operational decision:** the already tested direct DH cube/inverse on interiors with literally preserved exteriors could not have produced full native-English p55 under its own receiver definition, independently of which cube exponent was chosen. Such interior-only receivers should be retired **as an entire family** for a native-English, printed-boundary-preserving target. An exterior-carried key remains possible if the *output* exteriors themselves are also transformed or the source has different segmentation; no original historical operator or plaintext is recovered.

## What the source actually tells a human

1. The solved **LP1 physical p5**, visible in original `05.jpg`, states **THE TOTIENT FUNCTION IS SACRED**. The solved **LP2 p57 PARABLE**, visible in original `74.jpg`, says to *shed our own circumferences* and find divinity *within*. Together they motivate the wordwise coprime-interior candidate below, but do not uniquely force it: the source does not explicitly say to apply the operation to each word, use word length as the modulus, or use one-based positions. The totient wording is on LP1 p5, not p7; p7 is part of the four-page Koan.
2. The verified **2016 `4gq25` signed text** says Liber Primus's words and numbers provide a map/direction. It has **43 alphabetic words** under a specific source-preserving token convention. Those words are **not explicitly bound to p55** and the message supplies no exterior transfer/nonce specification. The completed exact tests of both literal 43 word lengths and 43 GP-prime sums as additive keys on the original interiors recovered no plaintext ([original-input source tests](lp2-signed2016-wordlength-p55-interior-key-gate.md)).
3. The immediately subsequent solved **p56 AN END** asks for a separate page within the deep web that hashes to a printed 64-byte value. It does not identify p55 as that page, declare its 33 exteriors a checksum or specify a 20-byte hash. Its proven prime-totient inverse applies to p56 with a page-specific F-skip; no instruction copies the mechanism backwards.
4. The historical **2013 GEMATRIA / signed BASE29** sources now fix the 29-rune table and one integer-to-text command `3301→3QO`. They do not prescribe coding p55 word exteriors into an integer, nor a 33-digit GP digest header ([primary-source mapping](../results/2013-original-gp29-source-map.md)).

There are several incompatible possible reads of *circumference*: the border illustration, a full line, a whole page, and the first/last rune of each word. Nothing visible makes exactly the wordwise choice or assigns a reversible role to both parts. Adding a 33-symbol secret/pad/clock after observing the 43/43 coincidence would fit an unconstrained decoder.

## Wordwise totient/circumference extraction: 29-symbol key candidate (Agent16, 25 November)

**Classification: reproducible candidate derivation; not plaintext or an authenticated key.** The source reading combines LP1 physical p5's “THE TOTIENT FUNCTION IS SACRED” with LP2 p57's “Shed our own circumferences; find the divinity within.” For each complete word of length n beginning on original LP2 p55, remove its first and last rune, then retain the remaining one-based positions i for which gcd(i,n)=1. This is a plausible wordwise realization of the two clues, not an explicit printed algorithm.

The target is original LP2 p55, archive image 72.jpg (SHA-256 a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba). Transcription segment 54 contains 76 runes: its first rune completes an 11-rune word that began on p54; the other 75 runes form 16 complete words starting on p55. Their lengths are:

[4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]

A parser defect in the initial candidate script treated the percent page marker as a word boundary, manufacturing a one-rune word from the carry. The corrected parser preserves an open word across page markers and assigns it to the page where its first rune occurs. It verifies the 11-rune p54–p55 carry and returns exactly these 16 p55-starting words. The earlier artificial singleton contributed no interior rune, so the candidate string is unchanged; the correction makes the derivation and its assertions reproducible.

For each word, the number selected is φ(n)-1. Across the 16 words, sum φ(n)=45 and sum(φ(n)-1)=29. The complete strict interiors contain 43 runes, of which 29 are selected and 14 excluded. The selected GP29 indices, in source order, are:

[10, 2, 5, 28, 0, 14, 10, 19, 1, 5, 13, 8, 21, 20, 13, 12, 18, 10, 6, 14, 6, 15, 12, 2, 2, 18, 5, 11, 18]

Their transliteration is I–TH–C–EA–F–X–I–M–U–C–P–H–NG–L–P–EO–E–I–G–X–G–S–EO–TH–TH–E–C–J–E. Mapping each GP29 index to one digit of the effective 2013 BASE29 alphabet 0123456789ABCDEFGHIJKLMNOPQRS gives the 29-character candidate:

**A25S0EAJ15D8LKDCIA6E6FC22I5BI**

This is a per-symbol digit mapping, not one BASE29 conversion of a single large integer. The signed 2013 TCP-server challenge authenticates the BASE29 command and the example 3301 → 3QO; the complete digit alphabet is reconstructed from a contemporaneous participant CODE witness, so its use here is source-adjacent rather than fully specified by the signed text. See resources/external/2013-tcp-server-signed-source.md and results/2013-original-gp29-source-map.md.

A fixed, source-familiar direct Vigenere consumer was tested on the same 76 p55 runes: repeat the 29 GP indices, subtract modulo 29, and leave literal F runes transparent without advancing the key. It yields:

JDXJWUWAEIEAIATHJEOFSGWEATUECYFEONGXMTOGTNGEOCCRYHFRFLXEAGIHRNGHLOTPDYLFCFBGEAAENSPEIAOEAEIAY

The output is nonprose (76 runes; 73 key symbols consumed; GP29 IoC 0.0287719298 versus original p55 0.0378947368). This rejects only that direct same-page Vigenere receiver; it does not reject the candidate as a steganographic password or another source-selected key.

**OpenPuff is the leading receiver hypothesis, not an established result.** The 29-character string fits the 32-character text-password width documented in the OpenPuff v4.01 manual (https://www.embeddedsw.net/doc/OpenPuff_Help_EN.pdf). A single-carrier A-only Unhide test on original p55 image 72.jpg, with B/C disabled and the already-used JPEG Medium 1/5 setting, would isolate this new password from the prior 58/58 single-JPEG scan using A=33011033 (which did not test this candidate). The native v4.00 multi-carrier Hide→Unhide positive calibration passed in #1049 (run 43698173445), but no original LP2 extraction with this candidate has been attempted. OpenPuff testing remains owner/Director-gated: do not dispatch it or vary passwords, carrier order, or bit depth without Director authorization. A negative would reject only this exact password/carrier/configuration.

The corrected, read-only reproducer is sims/agent43_p55_coprime_interior_key.py. No plaintext, authenticated key, or complete inverse is claimed.

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

## Full76 p55 envelope: 33 exterior GP-prime addresses into the printed p56 hash

**New bounded original-input test, Agent6, 22 November 2026. No authentic unknown plaintext.** This is a complete 76-rune *cipher-and-metadata envelope* candidate, distinct from preserving the exteriors as actual plaintext. P55's original single incoming p54 glyph plus 32 endpoints of 16 words supply **33 exterior selectors**; all **43 strict word-interior glyphs** are the test's encrypted message. The independently solved **p56 contains 128 printed hexadecimal digits**. The 33 exteriors have real Gematria Primus prime weights all in **2–109**, naturally valid zero-based positions within the printed 128-character digest. This gives a finite, self-delimiting *numeric indexing* suggestion with no modulo address reduction. The candidate's weakest assumption remains major: Cicada gave no original instruction that prime weights should address p56 hex *characters*, that the addressed hex nibbles should be GP29 additive keys, or that the exteriors should be unchanged visible metadata.

Freeze `key[j] = value(hex_p56[GPprime(exterior[j])])`, giving exactly 33 hexadecimal key digits `f226a77623623aa73a8a966967187b6ab`. Treat each digit as a GP29 number0–15 and cyclically subtract or add it against the ordered 43 strict interiors. The exteriors stay stored in their 33 original physical positions as key selectors, so the original 76-rune source packet is completely reconstructed from both candidate decoded interiors, with all five two-rune words carried as metadata rather than falsely claimed plaintext. The source-replay and independent authentic solved-p57 43-rune planted decoder are in [the read-only Windows Node22 SFT](../sims/lp2_p55_exterior_primes_p56_hex43_sft.cjs).

| Fixed inverse on 43 actual interior runes | GP29 IoC | Original decoded prefix |
| --- | ---: | --- |
| Source interior minus prime-addressed hash nibble | **0.0354374308** | `R H I F P A L E S TH OE IA J F N D TH O F J` |
| Source interior plus prime-addressed hash nibble | **0.0321151717** | `C EO X EO R N C U M H C TH B L F H H D T TH` |

Both are nonprose and far below the native 43-rune p57 English control. The source-aligned **GP-prime → p56 hex-nibble direct additive-key family fails to recover p55 plaintext**. It does not rule out separately authored use of the p56 destination digest. The 33 exteriors are explicitly retained, avoiding the earlier false assumption that the five original two-rune ciphertext words could be copied unchanged into English plaintext. Further arbitrary hash positions, nibble mixing, shifts or secret KDFs would be unsourced.

## Closure and next decryption decision

The p55 **43/33 split is now source-supported as a structural partition**, but it is still **not a demonstrated reversible cipher frame**. The exact two-rune short-word gate now rules out **every** interior-only receiver that copies all exteriors verbatim while demanding native-English original word shapes; see the necessary condition above. Such proposals require a changed exterior glyph or word segmentation rather than more interior-key tuning. The 2013 value and p57 wording support the count relation; they do not assign the 33 exteriors as a key/checksum/header, define the 43-interior key/operation, set an order or clock, or specify how to restore all 76 runes. Existing p50 perimeter/bracket keys, affine and multiplicative families, source-word key candidates, SHA-1 framing tests, and the direct p28 DH-derived cube/inverse on the 43 interiors fail or lack a source-selected p55 role. Keep all **76 unchanged original runes** in the target state for Director #41's blind decoder gate. Do not use a 43-rune proposal as a full p55 solve or silently discard the 33 exteriors. The direct cube/inverse receiver is reproduced by sims/lp2_p55_dh_cube_43interior_receiver_sft.cjs. Reopen only if a first-party instruction or original-page feature binds the two parts to a different complete reversible operation.

**Outcome:** the source-supported 43/33 structural partition is retained, and a p5/p57-motivated coprime-interior operation yields a reproducible 29-character candidate password. Its direct same-page Vigenere receiver is negative; the OpenPuff receiver remains untested and owner/Director-gated. No p55 plaintext, authenticated key, complete inverse, or independent p55 continuation is recovered. The earlier “no source-selected split” classification is superseded, while the negative conclusion on cryptographic roles remains.
