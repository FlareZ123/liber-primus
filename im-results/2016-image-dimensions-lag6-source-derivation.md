# 2016 image dimensions independently reconstruct the LP2 lag-six affine motif

**Evidence class:** source-derived structural hypothesis, original-ciphertext correspondence, and bounded negative key tests. **No unknown LP2 plaintext, authentic key, complete cipher, or continuation destination recovered.** Agent 20, 10 November 2026.

## Executive finding

The archived 5 January 2016 image is reported as **563×569 pixels**. Its extracted payload says that Liber Primus's words are a map, their meanings are the road, and their numbers are the direction; the image is identified as containing an **Oak Tree In Winter**. The archive reports a good OpenPGP signature under key 7A35090F. Its fingerprint matches the Cicada public key preserved in this repository's 2012/control key files; the GPG warning is that the key lacks web-of-trust certification, not that the signature failed. However, the relationship between the signed image and the Pi.Mobi site is disputed, so do not assume the site itself is official or that this particular route is intended. A contemporaneous 2016 archive thread records the dimensions and notes that its background tree is the same image used on Liber Primus page 49.

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

> Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.

The same archive identifies the image as containing the “Cicada Logo” and “Oak Tree In Winter,” and records the OpenPGP signature metadata. See:

- [scream314's archived 2016 message and extraction](https://github.com/scream314/cicada3301/blob/master/2016.md)
- [the contemporaneous 4chan archive thread](https://4chanarchives.com/board/x/thread/17183963/post-all-your-cicada-3301-clues-here), which records 4gq25.jpg as **563×569px** and says its background tree is the same image appearing on Liber Primus page 49.

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

### Grid-derived key screens

The signed grid vector also motivates following it through the 32×8 table. I tested the toroidal 32-cell cycle, its reverse, and the bounded horizontal-wrap paths from offsets 51 and 57, using the visited cell values modulo 29 as periodic pads under the T6 inverse. I also tested a direct lookup composition in which each grid byte indexes the 256-rune p53+Ac+p55 block (and, separately, the second 128-rune half), again as periodic pads at phases 0/51/57. None yields readable plaintext. The best toroidal/cylinder path candidate scores **−5.172 per token**; the best grid-indexed rune candidate scores **−5.140 per token**. These are source-motivated but rejected as simple direct periodic-key readings; more stateful or semantic uses of the grid remain open.

The current source-gate script includes these path and grid-indexed candidates and asserts that all bounded candidates remain below the English threshold while the synthetic positive control is recovered. [Latest fully asserted CI run 42896253128](https://github.com/FlareZ123/liber-primus/actions/runs/42896253128).

## Interpretation and next work

This is a coherent **candidate solve path if the 2016 image is relevant**:

1. Notice the authenticated 2016 message and its oak-tree image.
2. Connect the oak image to the LP tree artwork and p54 Ac.
3. Read the image dimensions as directions into the 256-byte grid and the visually selected 128-rune second half.
4. Recover the source constants 6, 24 and 2, which reconstruct the known lag-six affine relation.

It is not a complete cipher. The most valuable next question is now narrower: **what source-derived key/state combines with this independently motivated T6 rule to produce authentic plaintext, if the 2016 dimensions are relevant at all?** Do not repeat direct grid AES/ChaCha, literal grid-pad, or historical RSA-modulus families already tested in the repository.

The S rune at offset 57 and the five intervening positions may also be relevant to the separately observed S5 motif, but this is only a possible second clue; no new S5 generator is established here.

This remains an intermediate finding and belongs in im-results/, not results/README.md. No authoritative synthesis has been changed because no plaintext, key or complete mechanism has been recovered.


## Authenticity and interpretation limits

The 2016 extraction log reports “Good signature” from “Cicada 3301 (845145127)” using RSA key 0x181F01E57A35090F, fingerprint 6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F. The repository's control and historical 2012 public-key files are byte-identical, so the signature is linked to the same key already preserved for earlier Cicada material. The GPG warning is only that the key lacks web-of-trust certification; it is not a cryptographic signature failure. The 4chan thread's “pi related” remark is situated in discussion of the Pi.Mobi URL and its decimal-\(\pi\) branding, not prime-counting. A later article quotes an email attributed to “Z 3301” saying “2016 it was pi mobi. We didn’t work that year”; this attribution is not independently authenticated ([article and quotation](https://therealsamizdat.com/2019/09/12/cicada-files-schoenberger-1/)). The evidence therefore cuts both ways: the payload is PGP-signed under the known key, while the status of the Pi.Mobi site and the meaning of the image remain contested. The message itself says “Beware false paths.” The dimension/grid/rune alignment is reproducible, but creator intent is **unestablished**; it could be a deliberate clue, a signed decoy, or an incidental correspondence.

## Reproduction

Run:

    node sims/2016_image_dimension_lag6_source_gate.cjs

The script checks the source counts, both unique gap-six source pairs, natural grid traversal alternatives, the four affine maps on original LP2, the bounded source-key candidates, and a positive held-out plant. The manual/push workflow is .github/workflows/2016-image-dimension-lag6-source-gate.yml.
