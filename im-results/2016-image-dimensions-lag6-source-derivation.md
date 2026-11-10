# 2016 image dimensions independently reconstruct the LP2 lag-six affine motif

**Evidence class:** source-derived structural hypothesis, original-ciphertext correspondence, and bounded negative key tests. **No unknown LP2 plaintext, authentic key, complete cipher, or continuation destination recovered.** Agent 20, 10 November 2026.

## Executive finding

The original 5 January 2016 image is preserved at [resources/historical/cicada2016-4gq25.jpg](../resources/historical/cicada2016-4gq25.jpg), with its exact extracted payload at [resources/historical/cicada2016-4gq25-outguess.asc](../resources/historical/cicada2016-4gq25-outguess.asc). The 26,342-byte baseline JFIF 1.1 file has SOF0 dimensions **563×569**. Byte-identical copies in the scream314/cicada3301 and micheloosterhof/cicada-2016 archives, plus the local copy, share Git blob SHA **22027296dcd7df53c5127e6aadbabeaf3223f72d**. The binary has no EXIF/XMP, ICC, IPTC, or comment segment and no bytes after EOI. This confirms the dimensions on the archived file, not a direct byte-for-byte capture from the original tweet/Infotomb host. The authenticated text says: **“Liber Primus is the way. Its words are the map. Their meaning is the road, and their numbers are the direction.”** The image is identified as containing an **Oak Tree In Winter**. The archive README reports OutGuess `seed: 230, len: 1136`; the repository's pinned OutGuess 0.4 CI job independently reproduced that extraction, byte-matched the preserved payload, and verified its OpenPGP signature under key 7A35090F. GnuPG reports **Good signature** but `[unknown]` trust: the signature validates against the stored key, not a web-of-trust identity claim. The exact extracted payload SHA-256 is `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`. However, the relationship between the signed image and the Pi.Mobi site is disputed, so do not assume the site itself is official or that this particular route is intended. A contemporaneous 2016 archive thread records the dimensions and notes that its background tree is the same image used on Liber Primus page 49.

Reducing those two image dimensions against the manuscript's existing source structures selects the same two offsets, **51 and 57**, in two independent artifacts:

- In the natural row-major 256-byte base-60 table, entries 51 and 57 are **59 and 118**, exactly a factor of two apart.
- In the source-motivated second 128-rune half of the p53–p55 image block, offsets 51 and 57 are **Ac (GP index 24)** and **S (GP prime value 53, with 53 mod 29 = 24)**.

### Secondary prime-counting coincidence (not part of the main derivation)

The contemporaneous thread does say “pi related,” but its surrounding posts connect this to the Pi.Mobi site whose domain begins with the decimal digits of the constant \(\pi\), plus references to timers and “Path.” It does **not** specifically instruct solvers to use the prime-counting function. A separate, retrospective operation nevertheless gives an exact numerical alignment: \(\pi(563)=103\), \(\pi(569)=104\); modulo 29 these are GP indices 16 and 17, T (Tir, prime 59) and B (Beorc, prime 61). Their prime-value gap is 2, and the adjacent S/T/B prime values are 53, 59, 61, so S→T is 6 and T→B is 2. The rune-poem glosses describe Sigel as a hope to seafarers, Tir as a sign that keeps its course, and Beorc as a tree ([Old English Rune Poem text and translation](https://norserunes.com/learn/rune-poems/old-english-rune-poem/); [Wikisource text](https://en.wikisource.org/wiki/Runic_and_Heroic_Poems_of_the_Old_Teutonic_Peoples/The_Runic_Poems/The_Anglo-Saxon_Runic_Poem)). This is an interesting semantic/numeric fit, but it is **post hoc** and must not be counted as independent evidence that the Pi.Mobi poster intended prime counting.



The dimension difference is six. In the 32×8 row-major grid, offset 51 is (row 6, column 3) and offset 57 is (row 7, column 1), a displacement of (+1 row, −2 columns); the row-major linear step is (8(1)-2=6). The second-half rune anchors supply intercept 24. Thus the grid geometry supplies the signed lag and slope, while the grid values independently confirm the slope magnitude:

\[
T_6(x)=24-2x \pmod {29}.
\]

The ciphertext independently confirms the source-derived negative orientation: the map has **80 matches among 1,290** eligible six-back positions, versus **34/1,290** for \(24+2x\). This is a reproducible cross-artifact correspondence that could reconstruct the lag-six clue path if the disputed 2016 source is relevant; creator intent remains unestablished, and it is not a complete decryption.

## Source chain and exact arithmetic

### 1. The 2016 artifact

The archived extracted message contains the instruction:

> Liber Primus is the way. Its words are the map. Their meaning is the road, and their numbers are the direction.

The same archive identifies the image as containing the “Cicada Logo” and “Oak Tree In Winter,” and records the OpenPGP signature metadata. See:

- [scream314's archived 2016 message and extraction](https://github.com/scream314/cicada3301/blob/master/2016.md)
- [the contemporaneous 4chan archive thread](https://4chanarchives.com/board/x/thread/17183963/post-all-your-cicada-3301-clues-here), which records 4gq25.jpg as **563×569px** and says its background tree is the same image appearing on Liber Primus page 49.

The archived binary and reproducible marker inventory are documented in [the source manifest](../resources/historical/cicada2016-4gq25.md) and [the JPEG inventory script](../sims/2016_jpeg_asset_inventory.cjs). The second archive's stage01 README records OutGuess retrieval of 25,229 usable bits with seed 230 and payload length 1,136 bytes.

The background tree is generic dead-oak clipart, identified by the [Uncovering Cicada Wiki](https://uncovering-cicada.fandom.com/wiki/Liber_Primus) and linked to [Clipartbest's dead-oak asset](https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg). It is not a geographic photograph or a unique landmark. The 563×569 canvas dimensions remain a separate possible clue; the tree's generic source weakens physical site-finding but does not invalidate the dimension/gap-six hypothesis.

The 4chan archive is used here only for the image-dimension and contemporaneous visual observation; it is not evidence of message authenticity. The signed message and its oak-tree description are preserved in the separate Cicada archive.

### 2. The two dimensions select a six-step pair

Let width \(w=563\) and height \(h=569\).

\[
w\bmod256=51,\qquad h\bmod256=57,\qquad h-w=6.
\]

The numerical table is a source-transcribed **32×8 = 256-byte** row-major table on physical LP2 pages 49–51. At row-major offsets 51 and 57:

- offset 51 is row 6, column 3: base-60 token 0x, decimal **59**;
- offset 57 is row 7, column 1: base-60 token 1w, decimal **118**.

These two cells are visible in the original page-49 scan (the resource corpus maps this to 66.jpg). Their coordinates move one row down and two columns left: \((6,3)\to(7,1)\), so \(\Delta row=+1\), \(\Delta column=-2\), and the row-major index step is \(8\cdot1-2=6\). This directly supplies the signed lag/slope pair \((6,-2)\) under the message's possible “numbers are direction” reading. The cell values also satisfy \(118/59=2\), an independent magnitude check. Across all 250 possible six-apart pairs in the row-major 256-byte table, this is the **only** pair with the later value exactly twice the earlier value. Among the four natural table traversals checked (row-major, row-serpentine, column-major, column-serpentine) and their reversals, only row-major forward gives the exact 59→118 pair at offsets 51→57.

### 3. The same offsets select Ac and S in the 128-rune second half

The visual concatenation is all **179 p53 runes + the oversized p54 initial ᚪ (Ac) + all 76 p55 runes = 256**. The p53 sequence splits into an initial **128-rune black block** and a **51-rune span marked by the red numeral 1** (the rune glyphs themselves are black; “red span” refers to the red section marker/punctuation). The p54 Ac is one selected initial; the rest of p54's text is not included in this proposed concatenation. The resulting second half is \(51+1+76=128\), following the first 128 p53 runes. This is a visually motivated, non-contiguous source selection and remains a hypothesis.

The 2016 dimensions also select offsets within this 128-rune half:

\[
563\bmod128=51,\qquad569\bmod128=57.
\]

At those offsets:

- **51 = ᚪ Ac**, zero-based GP alphabet index **24**;
- **57 = ᛋ S**, GP index **15**, Gematria prime value **53**, and \(53\bmod29=24\).

Among all 122 six-apart pairs in this second half, this is the **only** pair whose first rune is GP index 24 and whose second rune's Gematria prime is 24 modulo 29.

The oak-tree image and the oversized Ac initial make this particular second-half grouping more motivated than an arbitrary 128-rune slice. The S endpoint is a further source observation, not an independent cipher proof.

### 4. The affine lag-six rule

The source arithmetic supplies:

| Parameter | Source-derived value |
|---|---:|
| Lag | \(569-563=6\) |
| Intercept | Ac index \(24\), independently echoed by S's \(53\bmod29=24\) |
| Slope magnitude | \(118/59=2\), independently \(61-59=2\) from the T/B prime-counting cross-check |
| Signed slope | grid column displacement \(\Delta column=-2\); ciphertext independently validates it |

This yields \(T_6(x)=24-2x\bmod29\), exactly the affine six-back relation previously observed in LP2. The source geometry fixes the lag and signed slope; the Ac/S anchors fix the intercept. The ciphertext independently validates the orientation (80 matches for the signed map versus 34 for the opposite sign).

On the canonical 2,896-word, 12,956-rune unsolved corpus, counting only within-word positions \(j\ge6\):

| Candidate affine map | Matches | Eligible |
|---|---:|---:|
| \(24-2x\) | **80** | 1,290 |
| \(24+2x\) | 34 | 1,290 |
| \(-24+2x\) | 44 | 1,290 |
| \(-24-2x\) | 25 | 1,290 |

The original-source count is reproduced by sims/2016_image_dimension_lag6_source_gate.cjs. Existing research independently reports the lag-six motif and its held-out positional prediction; see [the lag-five/lag-six held-out conditional test](lag5-lag6-heldout-conditional-prediction.md). That report finds 40/645 T6 matches in its held-out half and 7/32 held-out S5 matches, but explicitly warns that the motifs were discovered on the full corpus and that the forward M3 model is not rejected. The present source arithmetic is a new explanation for the constants, not a new discovery-wide p-value.

## Bounded key-recovery tests


### Exact dimension-prime starts and all-secret modular-square state

**Original-source finite negative.** The original archived 2016 signed JPEG is **563×569**, and these are the successive ordinary primes **p103=563** and **p104=569**. The historically solved LP2 p56 prime-totient cipher supplies one plausible way to consume these numbers as first primes. With its exact known 85-rune plaintext, the authentic start p1=2 and skip mask8 recover the solved page with independently trained Emerson-GP trigram score **−2.383854/rune**, first of all 32 masks. On unsolved physical p0, exhaustive search of all **16,384 visible-F skip masks per start** yields:

| First prime | Best literal-F mask | Best p0 GP trigram/rune |
| --- | ---: | ---: |
| 2 (historical comparator) | 8,901 | −5.99102987 |
| **563** (p103) | **7,025** | **−6.13355789** |
| **569** (p104) | **12,288** | **−6.15849125** |

Neither source-dimension start recovers a readable unknown passage under the unchanged authentic solved-page cipher and this exact page-reset framing. These finite negatives leave other transformations and clocks open.

**Keyless, all-initial-state modulus theorem.** Take `N=563×569=320,347` and `x(t+1)=x(t)² mod N`. Since `563−1=2×281` and `569−1=8×71`, while `2^70≡1 (mod281)` and `2^70≡1 (mod71)`, CRT forces **x(t+70)=x(t) for every t≥3**, independent of any secret seed. Zero CRT components remain zero; after at most three squarings the nonzero components have odd order dividing281 or71. All **320,347 initial states**, including nonunits and zero, were independently exhaustively enumerated and checked in the SFT. N is not a Blum integer (569=1 mod4); this is a hypothetical source-derived squaring generator, not an authenticated Cicada PRNG.

Under *every* secret **phase-stationary bijective GP29 output alphabet** indexed only by that generator state, lag-70 equality is invariant: `P_i=P_(i+70)` if and only if `C_i=C_(i+70)` after the transient. On the complete **12,956 original unknown runes**, there are only **433/12,883** lag-70 equalities after the transient, versus minimum **728** across **310,128** equal-length contiguous Emerson-GP windows and minimum **693** across **204,689** Shakespeare-GP windows. With independent state reset on each physical page the observed within-page count is **293/8,948**, versus minima **498** Emerson and **469** Shakespeare across **1,000** layout-matched control windows each. Reference windows overlap and represent only two specific native-GP literary sources; this is an exact finite source comparison, not a universal all-English claim. A positive plant using the true 320,347-state squaring stream with seed 2016 recovers **12,956/12,956** GP-English symbols and preserves all **832** native source lag-70 equalities. These results reject direct same-length native-GP bijective emissions from every generator seed under either declared clock, while key skips, non-GP intermediates, homophonic and evolving states remain untested.

No unknown LP2 plaintext, authentic key, or intended numeric reading is established. [Source-native reproducer](../sims/cicada2016_dimensions_prime_state_gate.cjs) · [passing 2016 manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42908998411).


A source-derived feedback rule is not a key. I tested the most direct key/state readings suggested by the same offsets, using the exact two-candidate inverse for the hypothesized T-overwrite model (q = 0.81) and a GP trigram Viterbi model trained on the first 200,000 characters of the committed Shakespeare control.

1. **Six-byte grid seed:** the six grid bytes at offsets 51–56 are [59, 86, 171, 156, 80, 254], reduced modulo 29 to [1, 28, 26, 11, 22, 22]. Generate a six-lag key state with \(K_i=24-2K_{i-6}\pmod{29}\), testing global and per-word resets and both additive signs.
2. **Six-rune seed:** the six runes at offsets 51–56 of the second 128-rune half are A NG AE M I W, GP indices [24, 21, 25, 19, 10, 7]. Apply the same global/per-word recurrence and sign tests.
3. **Periodic source pads:** test the second 128-rune half as a repeating additive pad at phases 0, 51 and 57, both signs; also test the full 256-rune block at phases 0, 51, 57, 179 and 185, both signs.

None yields readable original LP2. The best original trigram score across these candidates is **−5.098 per token** (rune-seed, per-word recurrence, positive additive sign); outputs remain gibberish. The same inverse recovers **98.6%** of an independently held-out Shakespeare plant encrypted with the exact T6 collision-repair generator and the grid-seed candidate pad. The positive control therefore demonstrates useful sensitivity for this specific model; the original negative is not explained by a broken inverse.

The bounded tests reject these simple source-pad and six-lag key-recurrence interpretations. They do **not** reject the source-derived T6 rule itself. T6 may describe an outer collision-repair or feedback operation whose additive key/state must come from another source.

The reproducible original-input script and positive control passed [GitHub Actions run 42890752174](https://github.com/FlareZ123/liber-primus/actions/runs/42896253128).

### Pi.Mobi / mathematical-pi keystream screen

Because the 2016 thread's “pi related” discussion points to the Pi.Mobi domain's decimal-pi branding, I tested the natural direct-key readings rather than assuming the site was official:

- fractional \(\pi\) expansion in base 29;
- decimal digits of \(\pi\) mapped modulo 29;
- decimal digit pairs mapped modulo 29;
- phases tied to the archived numbers 0, 51, 57, 230 (OutGuess seed), 563/569 (image dimensions), and 1136 (reported extraction length), with both additive signs;
- direct additive base-29 \(\pi\) without the T6 repair model.

No tested mapping produces readable original LP2. Under the T6 inverse, the best score is **−5.1348 per token** (decimal-pair key, phase 115, negative sign); direct additive base-29 \(\pi\) scores **−7.0602 per token**. The base-29 \(\pi\) stream was generated with Chudnovsky fixed-point integer arithmetic; its first 40 digits were independently checked against mpmath. The reproducible probe is sims/pi_base29_lag6_key_probe.cjs, with [CI run 42894161342](https://github.com/FlareZ123/liber-primus/actions/runs/42894161342). This rejects only these simple direct pi-to-GP key mappings, not every possible use of the Pi.Mobi artifact or a path/route encoded there.

### OutGuess seed 230 as a grid-state offset: low-confidence negative control

The archived extraction reports seed **230** and payload length **1,136**. These values should not automatically be treated as puzzle-chosen numbers. In the classic OutGuess 0.2 source, iterator.h defines DEFAULT_ITER as 256; outguess.c uses that default to search seeds 0 through 255 and select the embedding with the lowest changed/bias cost. The selected seed and payload length are stored in the stego header and printed by retrieval. Unless the original encoder explicitly supplied a seed/search option, 230 is likely an embedding-optimizer output, not an intentional LP2 index. The archived material preserves the retrieval command, not the original embedding flags. Sources: [iterator.h](https://github.com/crorvick/outguess/blob/master/iterator.h), [outguess.c](https://github.com/crorvick/outguess/blob/master/outguess.c), [outguess.1](https://github.com/crorvick/outguess/blob/master/outguess.1).

A narrow control nevertheless treated 230 as a starting offset into the 256-byte p49 grid, took six consecutive bytes forward or backward, reduced them mod29, and used the resulting six values as the initial state for the source-derived T6 recurrence. The seeds were forward **[1,1,19,2,22,5]** and reverse **[1,0,28,17,15,23]**. Across 56 candidates, no score crossed the English threshold of −4.5 log-score/rune. The best candidate was the reverse offset with word reset and negative sign (log-score/rune **−5.04149**, rune IoC **0.03750**); its preview, “THBLEFLA USBNL OTHIP UFI ROU IEGAINSWNJA,” is nonlinguistic. This rejects the direct seed-as-grid-offset reading, not all possible uses of the 2016 image. Candidate scores and the full audit are preserved in the diagnostics artifact from successful [CI run 42906842690](https://github.com/FlareZ123/liber-primus/actions/runs/42906842690); both the T6 register gate and source gate passed. The corrected sparse-mask parser now matches the shared continuous-word parser and the canonical 2,896-word corpus. Reproduction: [source-gate script](../sims/2016_image_dimension_lag6_source_gate.cjs).

### Predeclared word-position and page-mask audit

The successful run reproduces **2,896 words, 12,956 runes, 1,290 eligible within-word positions, and 80 T6 hits**. The positive-control inverse recovers **12,779/12,956 planted runes (98.63%)**, with three fallback words; this validates the inverse implementation on a controlled construction, not on the original ciphertext.

The predeclared page mask does **not** enrich the T6 relation on tree-decorated pages:

| Population | Hits | Eligible | Rate |
|---|---:|---:|---:|
| Physical pages 40–55 (tree-decorated) | 20 | 337 | 5.93% |
| All other pages | 60 | 953 | 6.30% |
| First eligible within-word position (j=6) | 33 | 559 | 5.90% |
| Last eligible within-word position | 32 | 559 | 5.72% |

Within-word offset modulo six gives:

| Offset residue | Hits | Eligible | Rate |
|---:|---:|---:|---:|
| 0 | 34 | 566 | 6.01% |
| 1 | 19 | 346 | 5.49% |
| 2 | 12 | 187 | 6.42% |
| 3 | 6 | 109 | 5.50% |
| 4 | 8 | 57 | 14.04% |
| 5 | 1 | 25 | 4.00% |

All eight residue-4 hits occur at exact word offset 10, in words of length 11 or 12, on physical pages 0, 7, 9, 16, 27, 43, 44, and 53. A nominal Fisher exact comparison against the other five residues gives p≈0.021, but a simple six-residue correction gives p≈0.126; treat this as exploratory, not significant. Global rune-position residues modulo six are approximately uniform. In the source-selected second 128-rune half there is only one hit (global offset 12620, physical p53, word offset 10, word length 11): 1/15 eligible positions in that half and 1/32 in the assembled 256-rune block. These results do not support a tree-page mask or a robust section-specific concentration.

### Grid-derived key screens

The signed grid vector also motivates following it through the 32×8 table. I tested the toroidal 32-cell cycle, its reverse, and the bounded horizontal-wrap paths from offsets 51 and 57, using the visited cell values modulo 29 as periodic pads under the T6 inverse. I also tested a direct lookup composition in which each grid byte indexes the 256-rune p53+Ac+p55 block (and, separately, the second 128-rune half), again as periodic pads at phases 0/51/57. None yields readable plaintext. The best toroidal/cylinder path candidate scores **−5.172 per token**; the best grid-indexed rune candidate scores **−5.140 per token**. These are source-motivated but rejected as simple direct periodic-key readings; more stateful or semantic uses of the grid remain open.

The current source-gate script includes these path and grid-indexed candidates and asserts that all bounded candidates remain below the English threshold while the synthetic positive control is recovered. [Latest fully asserted CI run 42896253128](https://github.com/FlareZ123/liber-primus/actions/runs/42896253128).

### Prime-indexed grid-totient key screen

A distinct, source-fixed extension of the p56 mechanism is to treat each base-60 grid byte b as a **zero-based prime ordinal** and use K_b = φ(p_{b+1}) = p_{b+1} − 1 (mod 29). This uses the solved p56 prime-totient operation, the original 256-byte table, and the image-selected offsets 51/57 without fitting a key to ciphertext. Specifically, byte 59 selects p₆₀ = 281, so φ(p₆₀) = 280 ≡ 19; byte 118 selects p₁₁₉ = 653, so φ(p₁₁₉) = 652 ≡ 14. Their difference is 24 modulo 29. This is an arithmetic correspondence, not by itself evidence of a key: the same lag-six key delta 24 occurs at **10 of 250** possible positions in the full table, while the raw byte-doubling relation 59→118 remains unique at offset 51.

The original 12,956-rune input was tested under the provisional T6 collision-repair inverse (word-local T₆(x) = 24 − 2x (mod 29), q = 0.81, GP trigram Viterbi). The finite family comprised:

- 256-byte row-major prime-indexed-totient pads, phases 51 and 57;
- a 32-cell toroidal grid path beginning at row 6, column 3, with step (+1, −2), and its reverse;
- six-symbol T6 recurrence seeds derived from the diagonal path, the row-major grid slice, and the second-half p53–p55 rune slice;
- both directions where applicable, both additive signs, and global, page, section, or word resets: **72 candidates total**.

No candidate produces GP-English-like plaintext on either frozen half. The best training-selected candidate is the 32-cell diagonal prime-indexed key, forward, section-reset, positive sign: training **−5.8741**, held-out **−5.9256**, whole **−5.8998** per token. The best held-out score is the 256-byte row-major key at phase 57, forward, section-reset, positive sign: training **−5.9443**, held-out **−5.9002**, whole **−5.9223**. Across all candidates the whole-book score range is **−6.0881 to −5.8915**, far from the source-native English control.

The inverse passes a source-matched positive control: it recovers **12,789/12,956 (98.71%)** runes from an independently held-out Shakespeare plant with original LP2 word lengths and the same T6 generator. This validates the tested inverse/likelihood implementation, not the T6 model as an authentic LP2 cipher.

Reproducer: [`sims/prime_indexed_grid_totient_lag6_probe.cjs`](../sims/prime_indexed_grid_totient_lag6_probe.cjs). The path-filtered [GitHub Actions run 42903194638](https://github.com/FlareZ123/liber-primus/actions/runs/42903194638) completed successfully. The direct periodic pads and bare six-symbol seeds are rejected, and the keyed T6 feedback recurrence above is also rejected across 192 variants. Other stateful or semantic uses of the grid remain open.

### Keyed T6 feedback recurrence

The next simple stateful combination is to let the prime-indexed grid-totient stream force the dimension-derived six-step recurrence, rather than using the grid stream as a direct pad:

`S[i] = 24 - 2*S[i-6] + ε*K[i] (mod 29)`

The six-symbol seed is the diagonal path's prime-totient prefix `[19,14,18,16,20,17]`; `K[i]` is either the 256-byte row-major prime-indexed grid key (phase 51 or 57) or the 32-cell diagonal key. The finite test covered forward/reverse key order, global/page/section/word resets, both forcing signs ε, both output signs, and both direct-additive decryption and the provisional T6 collision-repair inverse: **192 candidates total** (96 per output model).

No candidate approaches GP-English. Under the T6 inverse, the best training-selected candidate is the 256-byte row-major key at phase 57, forward, page-reset, positive forcing/output signs: training **−5.8584**, held-out **−5.9352**, whole **−5.8968**. The best held-out T6 candidate scores **−5.8675** held-out, with training **−6.0037**. Under direct additive decryption, the best whole-book score is only **−7.0324**. The T6 source-matched positive control recovers **12,777/12,956 (98.62%)** runes, confirming that the inverse still works on planted material.

This rejects the straightforward keyed-feedback construction, not every possible stateful use of the table. Reproducer: [`sims/prime_indexed_grid_totient_lag6_probe.cjs`](../sims/prime_indexed_grid_totient_lag6_probe.cjs). [CI run 42905070570](https://github.com/FlareZ123/liber-primus/actions/runs/42905070570).

## Interpretation and next work

The 2016 source chain remains a coherent candidate solve path if the signed artifact is relevant:

1. Notice the authenticated 2016 message and its oak-tree image.
2. Connect the oak image to the LP tree artwork and p54 Ac.
3. Read the image dimensions as directions into the original 256-byte grid and the visually selected second half.
4. Recover the source constants 6, 24 and 2, which reconstruct the known lag-six affine relation.

This establishes a source-motivated relation C_i = 24 - 2 C_(i-6) (mod 29) at 80 of 1,290 eligible word-interior positions. It is not a complete cipher or plaintext recovery. The direct prime-indexed grid-totient pads, bare six-symbol seeds and straightforward keyed T6 feedback recurrences remain rejected; do not repeat direct grid AES/ChaCha, literal grid-pad, prime-indexed additive pads, bare/keyed T6 seeds, or historical RSA-modulus families already tested.

**Cross-round Rad↔Ac / projective audit (Agent 38).** The 2014 square selects Rad=4 → Ac=24. The p3/p39 cross-triad root z=23+27u, with u²=3u+8, induces the projective map M(x)=(23x+13)/(27x+17) on P¹(F29), including infinity as the 30th state. This map has order 30 and satisfies M^(-3)(4)=24. The exact three inverse steps match the length of each marked red triad; the signed 2016 image-dimension gap is six, or twice three. This is a plausible orientation/phase selector, not decryption evidence.

The direct lag-six projective tests do **not** reproduce the sparse T6 mask: M^6 matches 51/1,290 positions and M^(-6) matches 41/1,290, against 80/1,290 for the affine T6 map; their overlaps with the T6 event positions are 5 and 0 respectively. Thus M^(±6) is not the missing event rule.

The 2014 edge also gives a natural 32×8 coordinate, row Ac=24 / column Rad=4: row-major index 196 contains byte 176 ≡ 2 (mod 29). The 2016 dimension residues 51 and 57 contain bytes 59 and 118. However, treating each byte as the next table index sends starts 51, 57, 196 and the transposed control 152 into the same 11-cycle, whose basin contains 252/256 table cells. That walk is therefore non-discriminating, not a unique route.

Finally, the 32-cell toroidal path fixed by offsets 51→57 (one row down, two columns left) was tested as a phase schedule over the 13-dot intervals. Mapping each path byte through the T6 28-cycle and using it as the EA/log15 interval phase yielded 46 LP1-dictionary word hits, below the existing word-clock baseline of 49; the reverse path yielded 35. A cross-triad projective path clock scored at best 47 across the tested start/direction/update/reset choices. No long plaintext word or source-predicted event mask emerged. Reproduce the bounded projective/coordinate audit with [agent38_issue18_rad_ac_projective_gate.cjs](../sims/agent38_issue18_rad_ac_projective_gate.cjs); the interval-clock tests are documented in Issue #18.

**Decision:** the affine lag-six relation remains a reproducible candidate clue, but the tested Rad↔Ac coordinate, byte-pointer walk, direct projective lag-six map, and 32-interval phase schedules do not provide its sparse event mask or a decryption. Keep the exact M^(-3)(Rad)=Ac relation as a possible orientation constraint for independent projective-state research; do not expand it into free rotations, postselected masks, or geographic searches. A distinct, independently sourced nonlinear state/transport operation remains necessary.

This remains an intermediate finding and belongs in im-results/, not results/README.md. No authoritative synthesis has changed because no plaintext, key, or complete mechanism has been recovered.
## Authenticity and interpretation limits

The 2016 extraction log reports “Good signature” from “Cicada 3301 (845145127)” using RSA key 0x181F01E57A35090F, fingerprint 6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F. The repository's control and historical 2012 public-key files are byte-identical, so the signature is linked to the same key already preserved for earlier Cicada material. The GPG warning is only that the key lacks web-of-trust certification; it is not a cryptographic signature failure. The 4chan thread's “pi related” remark is situated in discussion of the Pi.Mobi URL and its decimal-\(\pi\) branding, not prime-counting. A later article quotes an email attributed to “Z 3301” saying “2016 it was pi mobi. We didn’t work that year”; this attribution is not independently authenticated ([article and quotation](https://therealsamizdat.com/2019/09/12/cicada-files-schoenberger-1/)). The evidence therefore cuts both ways: the payload is PGP-signed under the known key, while the status of the Pi.Mobi site and the meaning of the image remain contested. The message itself says “Beware false paths.” The dimension/grid/rune alignment is reproducible, but creator intent is **unestablished**; it could be a deliberate clue, a signed decoy, or an incidental correspondence.

## Reproduction

Run:

    node sims/2016_image_dimension_lag6_source_gate.cjs

The script checks the source counts, both unique gap-six source pairs, natural grid traversal alternatives, the four affine maps on original LP2, the bounded source-key candidates, and a positive held-out plant. The manual/push workflow is .github/workflows/2016-image-dimension-lag6-source-gate.yml.
