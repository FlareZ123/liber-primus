# Original 242 black scroll words ↔ 242 page-contained p8 black runes

**Original-source result, Agent 2, 22 November 2026.** This tightens the adjacent 255↔255 observation and specifies an operationally meaningful stream split. It does **not** recover unknown-page plaintext, a creator-selected key, a reversible original cipher, or the final destination. The independent original-image ink annotations, complete-word transcription and complete numerical GP29 ciphertext supply all inputs.

## What a 2014 reader could actually see

Physical p3–p7 are one five-page scroll (1,145 original GP29 runes) and contain precisely **255 complete printed words**, joining line and page carries. Classifying whole words against the original colored-rune segments yields **13 entirely-red words, 242 entirely-black words and zero mixed-ink words**. Red word positions in the 255-word scroll register are zero-based:

`[0,1,2,22,176,177,178,179,250,251,252,253,254]`.

Physical p8 immediately follows. Its **255 original runes** consist of a twelve-rune red heading and **243 black runes**. The final black rune `ᛇ` belongs to a **single six-rune printed word crossing from p8 into p9**: that page carries one GP rune, followed by five GP runes from p9. Consequently exactly **242 black p8 runes form the entire page-contained black receiver**, with a natural unchanged 242-word source tape on p3–p7. Both source and receiver can be read without removing or inventing original cipher symbols. This strengthens the prior plain 255↔255 cardinality by recognizing original ink and a complete-word seam.

Independently the *literal five final p7 red-word GP29-index products modulo three* define a primitive order-five GF(3) recurrence with 242 nonzero states; see the repository's existing p7 GF3 report. The new **242 black source words** supply one possible original word for each such state, and **242 page-contained black p8 runes** supply one possible receiver per state. A single carried p8 rune could serve a zero-state or seam marker, but that interpretation is conjectural. The red13 source words and red12 p8 heading runes do **not** explain their own mismatch. A newly checked 13→12 first-difference/ratio interpretation is mathematically constrained by **the repeated p8 heading rune**: the exact red12 GP29 vector is `[14,10,14,19,1,14,19,5,2,13,3,17]`, with equal value14 at positions 0, 2, and 5. None of eight independent natural red13 whole-word features (length; first/last rune; GP-index/ordinal/prime sum; GP-index/ordinal product) has matching equality classes after taking its 12 consecutive GP29 differences, in either printed or reversed order. Neither adjacent product ratio nor inverse-ratio sequence is compatible with those equalities. This **excludes every fixed, secret, arbitrary GP29 alphabet substitution** after these exact source-derived transitions, including all affine maps. The ratio using the 13 index-products `[17,8,4,18,13,19,14,23,11,26,8,15,2]` specifically yields `[9,15,19,12,26,16,12,3,5,7,20,4]`. The test never uses p9 plaintext and does not exclude evolving state, a mixed-input checksum, or a different source operator. [Canonical SFT](../sims/lp2_p3_p8_242_blackword_blackrune_transfer_sft.cjs). Neither the original text nor earlier authenticated Cicada instructions presently tell a reader how to transform a source word into a corresponding receiver symbol, what the state ordering is, or how to decode p9. This is a well-typed missing **word→rune opcode**, not an unlocked cipher.

## One direct, source-respecting inverse decisively fails

Before fitting any keys, align the 242 black scroll words with the 242 black p8 runes by original printed order. The previously appealing 20/255 zero-phase equality between complete-scroll word GP29-index sums and all 255 p8 runes does **not** transfer to this ink-consistent pairing:

- **6/242** GP29-index word sums equal aligned source p8 black runes. Among all 242 cyclic shifts, the maximum is 18 and **198** shifts tie or exceed the exact source phase-zero score. The difference tape IoC is **0.0328863894**.
- Only **36/242** target p8 symbols occur anywhere within their corresponding source black word. This directly excludes a simple selection of one original rune from each word as an explanation of the whole receiver.
- More strongly, even giving a free source-rune selector **per word** and any completely secret fixed GP29 29→29 substitution, every one of the **29/29 p8 output classes** has an empty intersection of candidate input glyphs across all its matching words. Therefore the direct one-rune extraction is impossible under **every** global secret mapping, including all arbitrary nonbijective maps. Allowing a separate completely unknown secret mapping on **each of the five scroll pages** still leaves **52 of 121 occupied page×output classes impossible**. Synthetic source-selected glyphs under a fixed secret affine GP29 substitution correctly produce zero contradictions.
- Whole-word **BASE29** values reduced modulo243 have only **150 distinct labels** across the 242 black source words (149 when rune digits are reversed). Thus no one-to-one *direct* fixed-base29-mod243 address code for the 242 nonzero states is present without another selected transform.

Two further exact necessary conditions strengthen the same no-go. **Three pairs of identical original black whole words** appear at source black-word indices `(43,232)`, `(44,223)`, and `(227,228)`. Every pair is aligned to **different** p8 black output runes, so a stationary deterministic hash or codebook mapping a complete source word to one target rune cannot work, regardless of secret key or unbounded nonlinear word hash. The third pair is especially decisive: it is the **two consecutive identical black GP29 words on physical p7**, excluding even a page-local fixed whole-word codebook. All three pairs require changing state if this source register is the intended input. The minimal alternating word-position parity removes just these three whole-word contradictions, but no original page chooses that mode as the cipher.

The original p7 fivefold red rubric also motivates a much more permissive **five-state fixed secret alphabet** applied to *any freely selected source rune in every word*. Source-position phase modulo5 leaves **49 impossible classes among122 occupied phase×target groups**. Even granting **five separate completely secret tables for each original physical scroll page**, the page×phase×target test still finds **18 impossible classes among205**. Thus a fixed five-phase single-glyph extraction, with or without a page reset, cannot transmit this exact original p8 black receiver. A genuine source mechanism would have to aggregate more source information or evolve state beyond the tested stationary maps.

These are exact original-source obstructions, with no possible key fitting to rescue the stated deterministic one-glyph transport.

## A source-shaped shared-state pad was inverted on actual unknown ciphertext

There is an unusual route in which the apparently random original 242-rune difference tape is itself a **secret state pad**, rather than expected plaintext. Let a whole source scroll word's GP29-index sum, or alternatively its explicitly printed GP-prime **Gematria sum**, be `S[j]`. If `C8[j] = S[j] + K[j] (mod29)` and the same 242-state pad encrypts p9's original prose, then the pad is exactly recoverable: `K[j] = C8[j] − S[j] (mod29)`. No guessed key survives. Starting p9 after the authentic five-rune continuation of the p8 crossing word, decrypt the original first 300 later GP runes and predict a disjoint original p13 first 200 with the unchanged repeated 242-state key. Exactly reencrypt every original rune. True solved-p57 GP29 plants encrypt/decrypt 300/300 for each key.

| Fixed source checksum | Original p9 first300 IoC | Untouched p13 first200 IoC |
| --- | ---: | ---: |
| GP29-index word sum | 0.0340245262 | 0.0345226131 |
| GP-prime Gematria word sum | 0.0342251951 | 0.0349246231 |

All four original outputs are ciphertext-like, around the GP29 uniform baseline 1/29, and contain no coherent sustained GP29 prose. This rejects only the **explicit repeated 242-state additive pad with either source-word checksum**, not an evolving cipher or the larger original 242-state clue. Merely reencrypting random-looking plaintext under the recovered candidate pad proves nothing about author intent.

## Source-selected 242-state GF(3) address order, without arbitrary zero insertion

The original p7 red five-word GP29-index products provide the previously established source-fixed GF(3) coefficients `[2,2,2,0,2]`, a primitive degree-five LFSR that visits every **242 nonzero five-trit state once**. The earlier direct p8 black243 table reading required an **unselected choice among two legitimate zero-trit splice positions** to create a 243-state de Bruijn cycle. The new page-contained ink correspondence admits a more economical original-source *rival*: read exactly **242** nonzero states using the fixed p7 red-product vector itself as seed, with **no extra zero splice**. Retain the last p8 black rune in the p8→p9 crossing word rather than silently treating it as a dictionary cell. This constructs the exact 242-address permutation (state base3 index minus one) beginning

`[235,222,183,66,202,122,125,136,168,20,63,193,...]`,

with all integer addresses 0–241 visited exactly once. The original material still does **not** say whether source words or target runes are serialized lexicographically by this state; we tested both natural orientations as independent source-layout rivals. For each, derive a complete 242-position GP29 additive key from one original source-word checksum exactly as before, then read 300 untouched p9 runes after the real crossing-word suffix and 200 disjoint p13 runes, with forward reencryption and solved-p57 plants:

| GP29 whole-word summary | State address applied to | Exact checksums equal /242 | Original p9 IoC (300) | Original p13 IoC (200) |
| --- | --- | ---: | ---: | ---: |
| Index sum | p8 black rune table | 9 | 0.0330657748 | 0.0363819095 |
| Index sum | p3–p7 black word table | 9 | 0.0358751394 | 0.0348241206 |
| GP-prime Gematria sum | p8 black rune table | 6 | 0.0334002230 | 0.0342713568 |
| GP-prime Gematria sum | p3–p7 black word table | 12 | 0.0372352285 | 0.0335175879 |

All four source-frozen recipients remain ciphertext-like. The state cycle and its complete 242-address permutation are exact, and the carried-rune segmentation removes the need for a *chosen* de Bruijn zero insertion **in this particular model**. Neither register orientation has a first-party endorsement, and none reveals authentic plaintext. Retire these four **fixed GF3-address additive-pad** consumers; the source geometry may still inform an evolving, nonadditive mechanism.

## Five-word red-tap convolution has an all-secret obstruction

A separate direct **state-construction** hypothesis uses p7's five complete marked red words as a five-place update grammar over the physically adjacent 242 black scroll words. Could the **242 original p8 page-contained black runes** be one checksum per scroll word, calculated from a rolling block of five neighboring scroll words? This is different from the previous one-whole-word sum, fixed shared pad, or GF(3) state-address operations.

For each original black word `w_i`, freeze one of three immediately visible scalar readings: `length(w_i) mod29`, `sum GP29 ordinal indices mod29`, or `sum printed GP primes mod29`. Admit either contiguous **previous-five** or **next-five** window, excluding the first/last four source word positions so no cyclic wrap is invented. Each frozen window provides exactly **238 independently printed, position-matched source vectors** `X_i ∈ GF(29)^5` and original output rune `Y_i`. The source p7 red ordinal word-products `[11,26,8,15,2]` are one plausible five-tap vector. To avoid an arbitrary coefficient search, grant a *stronger all-key model*:

`Y_i = S(a_0 X_i[0] + ... + a_4 X_i[4] + b mod29)`,

where **all five coefficients** `a_j`, offset `b`, and the **entire fixed bijective 29-symbol output alphabet** `S` are unconstrained secrets. Any real source-derived coefficient choice would belong to this family. The offset is absorbed by the arbitrary output permutation. This tests a deterministic *source-word-to-p8-rune checksum*, and is not itself an invertible original-prose decoder.

The decisive key-independent condition is elementary: whenever two original p8 outputs are identical (`Y_i=Y_j`), a bijective `S` forces `a·(X_i−X_j)=0 (mod29)`. Each of the six source-reading/window orientations yields **209 such original equality constraints** (238 observations and 29 distinct observed rune types). Gaussian elimination over GF(29) finds **rank five of five in every case**, forcing `a=[0,0,0,0,0]`. A zero tap vector would emit one constant rune, directly contradicting the 29 observed output classes.

| Source scalar per black scroll word | Previous-five constraint rank | Next-five constraint rank |
| --- | ---: | ---: |
| Printed word length | **5/5** | **5/5** |
| GP29 ordinal-index sum | **5/5** | **5/5** |
| Printed GP-prime sum | **5/5** | **5/5** |

For the GP-index/previous-five interpretation, just **five independent same-output original pairs** already certify full rank: source/receiver offsets `(4,14)` share GP rune index14, `(12,17)` share21, `(8,20)` share3, `(12,23)` share21, and `(15,25)` share20. Hence neither a chosen p7 red-tap vector nor **any** hidden vector and arbitrary secret substitution can produce that receiver under the exact linear-hash law. No scanned glyph or word boundary is altered.

**Control:** On exactly the same 238 source-shaped input windows, plant the genuine p7 red taps `[11,26,8,15,2]` and a nonlinear, **bijective** source-era GF29 output alphabet `S(x)=x³` (inverse `x¹⁹`). The identical same-output rank test correctly returns **rank4/5** for every source reading and orientation, leaving the actual planted nonzero coefficient solution admissible; exact inverse recovers every planted hash value. This proves the all-secret gate does not reject genuine source-shaped five-word codes indiscriminately.

This excludes **only** a fixed five-consecutive-word GP29 linear checksum followed by a stationary permutation of output symbols. Position-dependent output tables, non-GP coding, rolling *nonlinear* hash state, word/p8 sequence misalignment and genuine encrypted p8 text are different architectures. The original five-word/p8-242 physical coincidence remains worth preserving, but the simple five-tap source-checksum interpretation now has a complete mathematical answer, independent of cipher key fitting and English scores. [Original-source Windows-compatible CommonJS SFT](../sims/lp2_p3_p8_fiveword_allsecret_convolution_sft.cjs) asserts all six rank certificates and six reversible nonlinear planted controls.

## Arbitrary secret nonlinear two-word lookup is source-impossible

A stronger and logically independent source-architecture gate dispenses **entirely** with linear arithmetic and with an output permutation. Suppose original p8's 242 black page-contained runes were produced as `Y_i=F(S(w_i),S(w_(i-1)))` or `Y_i=F(S(w_i),S(w_(i+1)))`, for some **completely unknown arbitrary deterministic** table `F:GF(29)²→GF(29)`. All 29² table outputs are permitted as secrets; neither key, algebra, nor language is specified. The only necessary test is *same complete input tuple must yield the same output rune*. This can be checked exactly on 241 source-contained adjacent pairs and their 241 unmodified aligned p8 glyphs, in both physical reading directions.

| Source original whole-word scalar S | Conflicting repeated 2-word input tuples, previous / next | Conflicts with 3-word tuple, previous / next |
| --- | ---: | ---: |
| Word length, mod29 | **161 / 163** | **66 / 68** |
| Sum GP29 index, mod29 | **27 / 27** | **0 / 0** |
| Sum official GP prime, mod29 | **26 / 27** | **1 / 1** |
| Product GP29 indices, mod29 | **41 / 42** | **3 / 3** |

The two-word GP-index-sum model, for example, has an exact original witness: two source positions with same input pair `(16,23)`, at indexed output positions **6 and 11** (the first test’s source-contained zero-based positions; source-local result-array indices 5 and10), demand **different** p8 rune outputs **4 and19**. Every nonlinear secret table must contradict at least one. Across the 27 repeated inputs of the 241 GP-index/past-two source tuples, all27 demand inconsistent output symbols. The length-only two-word rule has 169 repeated input tuples and161 contradictory output emissions, while GP-prime has28 repeated pairs,26 contradictions. The output conflict is a *strict exact impossibility for a stationary whole-word numerical lookup*, requiring no guesses about its entire 29² output codebook, GP29 substitution, ciphertext language or secret state.

The three-word comparison is informative about **capacity**: GP index-sum last/next-three has **240 distinct input triples among240 tested positions**, so it is perfectly compatible with an entirely secret map, but **only because no input repeats**; 240 arbitrary table entries could label any original ciphertext. That is a tautological fit, not a predictive decoder or evidence for a real three-state cipher. Prime-sum, product and length triples retain exact original contradictions. A previously published five-red-word cue remains potentially compatible with an evolving five-word nonlinear state, but these results establish that any such hypothesis needs a **source-authored state/key law and nontrivial predictive constraints**. Purely giving an enormous secret lookup is not a solution.

The [same pinned original source SFT](../sims/lp2_p3_p8_fiveword_allsecret_convolution_sft.cjs) now includes **16 exact input-collision tests** (four scalar readings × past/future × two-/three-word windows) and **16 genuine nonlinear input→output plants**, each of which yields zero false conflicts. All tests were executed from the exact remotely committed CommonJS bytes against exact canonical GitHub source files and passed. The model is independent of GP word semantics; it is a deterministic arithmetic statement about printed source positions.

## Practical research decision

Keep the original **red13/black242 scroll words → red12/black242+carried1 p8 runes** as a physically independent, source-typed possible state-transmission interface. The next productive step would be a **first-party instruction or visibly determinative original illustration** fixing (1) how 242 complete source words encode 242 distinct states or values, (2) the 13→12 red register treatment and final carried GP rune, and (3) a *nonstationary and reversible downstream recipient*. Do not resurrect the old 20/255 sum spike as evidence of a plaintext checksum; source-color separation makes that match less compelling. The five-tap linear word checksum and all stationary invertible output alphabets are excluded by the exact original same-output rank certificate above; arbitrary secret stationary two-word numerical lookups fail the independent output-collision gate. Avoid inventing a secret 242-entry dictionary, cycling arbitrary permutations, or refitting a pad to p9 language.

**Reproducer:** [original-source Windows/Node22 CJS SFT](../sims/lp2_p3_p8_242_blackword_blackrune_transfer_sft.cjs). Sources: [exact previous whole-scroll 255↔255 experiments](lp2-five-scroll-255words-p8-255runes-p50-grid256-original-gate.md), [original ink register](../resources/liber-primus/lp2-ink-annotations.json), [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), [source transcription](../resources/liber-primus/lp2-transcription.txt). Source registers remain fixed and all ciphertext counts are original.
