# 2016 image dimensions independently reconstruct the LP2 lag-six affine motif

**Evidence class:** source-derived structural hypothesis, original-ciphertext correspondence, and bounded negative key tests. **No unknown LP2 plaintext, authentic key, complete cipher, or continuation destination recovered.** Agent 20, 10 November 2026.

## Executive finding

The archived 5 January 2016 Cicada image is reported as **563×569 pixels**. Its signed extracted message says that Liber Primus's words are a map, their meanings are the road, and their numbers are the direction; the same image is identified as containing an **Oak Tree In Winter**. A contemporaneous 2016 archive thread records the image dimensions and notes that its background tree is the same image used on Liber Primus page 49.

Reducing those two image dimensions against the manuscript's existing source structures selects the same two offsets, **51 and 57**, in two independent artifacts:

- In the natural row-major 256-byte base-60 table, entries 51 and 57 are **59 and 118**, exactly a factor of two apart.
- In the source-motivated second 128-rune half of the p53–p55 image block, offsets 51 and 57 are **Ac (GP index 24)** and **S (GP prime value 53, with 53 mod 29 = 24)**.

The contemporaneous poster also called the image “pi related.” If that is a hint to the prime-counting function \(\pi(n)\), then \(\pi(563)=103\) and \(\pi(569)=104\). Reducing those counts modulo the 29-symbol GP alphabet selects indices 16 and 17: **T (Tir)** and **B (Beorc)**. Their GP prime values are 59 and 61, differing by **2**; the grid's first selected byte, 59, is exactly T's Gematria value. In the Old English Rune Poem, Tir is a guiding sign that keeps its course, while Beorc describes a tree. That is a plausible semantic bridge to “numbers are the direction” and the oak-tree image, and an independent cross-check of the slope magnitude. The poster's “pi related” remark is community speculation, not an official instruction; interpreting it as prime-counting \(\pi\) remains a hypothesis. The rune-poem glosses are available in the [Anglo-Saxon Rune Poem translation](https://sacred-texts.com/bos/bos567.htm).

The dimension difference is six. Together these source values specify the non-sign parameters of the already observed LP2 word-local relation:

\[
T_6(x)=24-2x \pmod {29}.
\]

The ciphertext selects the negative orientation: the source-compatible map has **80 matches among 1,290** eligible six-back positions, versus **34/1,290** for \(24+2x\). This is a plausible reconstruction of the intended clue path behind the lag-six anomaly, not a complete decryption.

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

These two cells are visible in the original page-49 scan (the resource corpus maps this to 66.jpg). They satisfy \(118/59=2\). Across all 250 possible six-apart pairs in the row-major 256-byte table, this is the **only** pair with the later value exactly twice the earlier value. Among the four natural table traversals checked (row-major, row-serpentine, column-major, column-serpentine) and their reversals, only row-major forward gives the exact 59→118 pair at offsets 51→57.

### 3. The same offsets select Ac and S in the 128-rune second half

The earlier visual grouping of physical LP2 pages 53–55 is:

- p53 black runes: **128**;
- p53 red runes: **51**;
- the oversized illuminated p54 initial **ᚪ (Ac)**: **1** (already counted as p54's first red rune; not an extra glyph);
- p55 runes: **76**.

Thus the proposed second half is \(51+1+76=128\) runes, following the first 128 black p53 runes. This is a visually motivated grouping, not a contiguous transcription, and remains a hypothesis.

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
| Orientation | negative sign selected by the original ciphertext |

This yields \(T_6(x)=24-2x\bmod29\), exactly the affine six-back relation previously observed in LP2. The source fixes the lag, intercept and slope magnitude; the **negative sign is selected by the ciphertext**, rather than being forced by the positive grid ratio alone.

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

The reproducible original-input script and positive control passed [GitHub Actions run 42890752174](https://github.com/FlareZ123/liber-primus/actions/runs/42892021636).

## Interpretation and next work

This is a strong **intended-route hypothesis**:

1. Notice the authenticated 2016 message and its oak-tree image.
2. Connect the oak image to the LP tree artwork and p54 Ac.
3. Read the image dimensions as directions into the 256-byte grid and the visually selected 128-rune second half.
4. Recover the source constants 6, 24 and 2, which reconstruct the known lag-six affine relation.

It is not a complete cipher. The most valuable next question is now narrower: **what source-derived key/state combines with this independently motivated T6 rule to produce authentic plaintext?** Do not repeat direct grid AES/ChaCha, literal grid-pad, or historical RSA-modulus families already tested in the repository.

The S rune at offset 57 and the five intervening positions may also be relevant to the separately observed S5 motif, but this is only a possible second clue; no new S5 generator is established here.

This remains an intermediate finding and belongs in im-results/, not results/README.md. No authoritative synthesis has been changed because no plaintext, key or complete mechanism has been recovered.

## Reproduction

Run:

    node sims/2016_image_dimension_lag6_source_gate.cjs

The script checks the source counts, both unique gap-six source pairs, natural grid traversal alternatives, the four affine maps on original LP2, the bounded source-key candidates, and a positive held-out plant. The manual/push workflow is .github/workflows/2016-image-dimension-lag6-source-gate.yml.
