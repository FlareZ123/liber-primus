# Identical p53/p55 moth: one shared GP29 pad does not yield native-English plaintext

**Original-input result, 15 November 2026 (Agent 5).** The copied moth selects a particular pair of original ciphertext pages, but their two physically anchored 76-rune alignments fail an exact source-English word-pair gate for an otherwise arbitrary *shared additive pad*. This bounds one human-visible key-reuse hypothesis. It recovers **no original plaintext, authentic key, cipher or destination**.

## Why these pages are a motivated pair

Original LP2 physical **p53** (archive `70.jpg`) and **p55** (`72.jpg`) show almost pixel-identical enlarged copies of the moth drawn on solved LP1 p05; p53/p55 differ chiefly by a 66-pixel horizontal and 67-pixel vertical artwork translation. Their genuine printed ciphertext lengths are **179** and **76** GP29 runes, respectively. The original visual linkage is independently established in [the source-raster comparison](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md).

One possible authorial mechanism is that the same artwork signals reuse of one secret per-position GP29 additive pad on both pages. An arbitrary pad cancels exactly under `C53[i]−C55[i] = P53[i]−P55[i] (mod29)`; this lets original ciphertext itself test the model without guessing any key. Because the pages have different lengths, the two fixed reading-order possibilities are **p53 first 76 ↔ p55 full 76**, and **p53 last 76 ↔ p55 full 76**. The test does not optimize any internal phase or consider unmarked rune deletion. An alternative key with different page-start clocks would need an independent authored selector.

This is distinct from earlier direct uses of the **179-byte hidden LP1 p05 source** as a p53 key ([source-pad gate](lp1-p05-hidden179-p53-moth-rawpad-gate.md)) and from the p3/p39 shared-pad test selected by red glyphs ([separate pair](lp2-p3-p39-red119-twotimepad-wordlexicon-gate.md)).

## Exact native-word test, including the carried first rune

The original ciphertext is `resources/liber-primus/lp2-corpus.json`. Printed word breaks come from `resources/liber-primus/lp2-transcription.txt`, whose physical p50 has no runes and is omitted as a text block. The SFT asserts the *entire* unchanged 179/76 rune page records against those physical text blocks.

The 76 p55 glyphs have **17 printed word runs** with lengths `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Crucially, the first isolated **NG** glyph continues p54's final word. It is excluded from dictionary-word constraints; it is still included in every 76-position ciphertext difference. Likewise, p53 words cut by either 76-rune window are excluded from the *word* constraint while their actual ciphertext runes remain in the difference.

The GP dictionary contains **30,502 unique complete words** drawn from the repository's TextBlob word-frequency lexicon, Shakespeare, Gibran and the solved LP1 reference. It recognizes both authentic **ING → single NG rune** and **IO → single IA rune** spellings, in addition to the standard K/C, V/U, Q/C and Z/S maps. This is a finite **source-English hypothesis**, not an assertion that Cicada could use no proper names or other language. For each overlap of two complete printed words, exhaust *all* dictionary candidates of those full word lengths and ask whether their pointwise GP29 differences exactly equal the frozen original difference at every overlapping position. If even one overlap has zero support, there is no pair of full native dictionary words satisfying that overlap under *any* shared additive pad.

| Source-fixed p53 alignment | Complete printed words p53/p55 | Whole-word intersections | Unsupported intersections | Distinct words necessarily outside the finite dictionary |
|---|---:|---:|---|---:|
| First 76 | 17 / 16 | 28 | p53 word2 × p55 word4, positions **9–14**; p53 word6 × p55 word7, positions **25–32** | ≥2 |
| Last 76 (p53 offset103) | 19 / 16 | 33 | p53 word28 × p55 word7, positions **25–29**; word29 × word7, **30–33**; word35 × word12, **56–61** | ≥2 |

All word indices are zero-based on their own physical printed pages, and original-pair offsets are zero-based with the end exclusive. The p55 word7 is the same 13-rune word in the first two failures of the last-aligned test; those two failures alone demand only one word-level exception. A second, disjoint failure forces the other exception.

## Independent no-word-break diagnostic and planted controls

To avoid relying solely on word segmentation, train a **source-native GP29 unigram** on the 29,157 source-English weighted dictionary entries (4,784,404 weighted rune occurrences). Its exact additive two-plaintext difference distribution is `q[d]=sum_{x=0}^{28} p[x]*p[(x-d) mod29]`. Score the 76 **unaltered original ciphertext differences** by the log likelihood ratio `sum log(29*q[d_i])` versus a uniform independent-pad difference.

- p53 first76 minus p55 full76: **−3.012822**.
- p53 last76 minus p55 full76: **−3.876097**.
- As a genuine solved-register reference, decrypt the full **85/85** original p56 ciphertext with `prime(clock)−1` and the literal-F skip at local position56; combine with original **95/95** clear p57. The 200 paired 76-rune windows of these two authentic short texts have log ratios **−0.580749 to +6.392065**; **0/200** score at or below either unknown-page alignment. These 200 overlapping windows are correlated and are descriptive controls, **not a p-value or a general exclusion of unusual English**.

The standalone seeded positive plant encodes source-native dictionary words at *every original word length*, reuses an arbitrary GP29 additive pad in both candidate alignments and decodes its complete cipher without loss: **24/24** native shared-pad plants pass each exact lexicon test. **24/24** separately padded controls are rejected for each alignment. All p53/p55 original printed runes, the 85-rune p56 authentic decryption and the p57 cleartext are asserted before scoring.

## Decision

The two simplest artist-selected orientations are **incompatible with a shared additive GP29 pad encoding ordinary dictionary English while preserving both pages' printed words**, and their key-independent rune differences are more uniform-like than source-native clear-English differences. There is no candidate plaintext or recovered key to test on another page.

Retire **only these two source-aligned reuse variants**. A different key offset, nonadditive mode, unusual plaintext register, altered word segmentation or separate page keys remain possible, but the duplicated moth alone does not select such exceptions. Do not launch a phase-optimized two-time-pad search without new original instructions.

**Reproduce:** [single original-input Windows/Node22 CJS SFT](../sims/lp2_moth_p53_p55_sharedpad_native_gate_sft.cjs) · [passing original run 43710513621](https://github.com/FlareZ123/liber-primus/actions/runs/43710513621). The test prints every unsupported original overlap and its planted controls. This result belongs in `im-results/` and does not change the authoritative `results/README.md` claim that no unknown LP2 page has been authenticated.

## Different hypothesis: same contiguous plaintext under independently keyed affine clocks (Agent13, 24 November 2026)

The identical p53/p55 moth selects this pair more directly than the visually weaker p32/p55 tree resemblance. Shared *content* and shared *pad* are different propositions: here each passage may use an entirely different secret key, but both must encode the same plaintext interval. This transfers the historically authenticated q8/q13 consuming clocks and tests an all-affine relaxation, not a dictionary fit. The source artwork does not itself authenticate repeated content, and its reuse on LP1 is a rival explanation.

Freeze p53 as the 179-rune forward tape and p55 as either the complete physical 76-rune tape or the 75-rune body after its incoming NG. Test all 104/105 contiguous forward placements, ignoring printed word cuts for this hypothesis. Grant arbitrary independent phase rotations (absorbed in the freely chosen row parameters), invertible affine GP29 inverse rows, and every possible synchronized transparent plaintext-F hold mask: a hold is possible only where both ciphertexts are F (index 0). No non-F deletion or direction reversal.

For consuming position j, let x and y be the aligned ciphertext runes. The common-plaintext equation over GF(29) is

```
a[j mod q] x + b[j mod q] = c[j mod r] y + d[j mod r]
```

Every slope must be nonzero. A homogeneous linear system has 2(q+r) unknowns. Exact GF29 elimination and its nullspace basis identify whether every solution forces a slope to zero, regardless of plaintext language. A common constant plaintext per connected phase component always exists algebraically but is not a valid inverse.

| q,r | Scope | Placements | All F-mask cases | Rank of every case | Valid inverses |
|---|---|---:|---:|---:|---:|
| 8,8 | 76 physical | 104 | 117 | 24 of 32 | 0 |
| 8,8 | 75 body | 105 | 118 | 24 of 32 | 0 |
| 13,13 | 76 physical | 104 | 117 | 39 of 52 | 0 |
| 13,13 | 75 body | 105 | 118 | 39 of 52 | 0 |
| 8,13 | 76 physical | 104 | 117 | 41 of 42 | 0 |
| 8,13 | 75 body | 105 | 118 | 41 of 42 | 0 |
| 13,8 | 76 physical | 104 | 117 | 41 of 42 | 0 |
| 13,8 | 75 body | 105 | 118 | 41 of 42 | 0 |

All **940** original mask/placement/period cases force **every** slope to zero. Equal periods leave q phase-specific constant freedoms; coprime mixed periods leave only the common constant. Therefore even independently keyed phase-affine ciphers cannot carry an identical contiguous p55 plaintext at any p53 placement under these clocks. No dictionary, trigram score or assumed plaintext word boundary enters the rejection.

Eight native-text plants use WELCOME and first KOAN, two independently sampled affine keys, independent random phases, a 76-rune repeat at a hidden offset inside a 179-rune tape, and synchronized native plaintext-F holds. All 8 uniquely recover the planted offset and exact F mask. The mixed-period plants have rank40 (two-dimensional kernel); enumerating the whole kernel yields 196 or 364 legal coefficient vectors after requiring nonzero consuming plaintext, illustrating the residual common-affine ambiguity. The equal-period controls are compatibility controls, not absolute key recoveries. Source-specific tests ran successfully directly on the remote corpus and native gold text in the connected JavaScript runtime; no CI was created.

[Standalone original-input SFT](../sims/lp2_p53_p55_samecontent_affine_fhold_sft.cjs).

**Decision:** retain the verified artwork reuse, retire same contiguous p53/p55 plaintext under the four q8/q13 combinations with synchronized F holds. This is independent of the shared-pad hypothesis above but not a new cipher mechanism. It extends the [p32/p55 repeated-content work](lp2-p32-p55-blurred-tree-correspondence.md) to the stronger exact-image pair. Different underlying content, changed representations, arbitrary phase permutations or other clocks remain outside this proof; the artwork alone does not justify enlarging them. No unknown LP2 plaintext/key.
