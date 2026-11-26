# Identical p53/p55 moth: one shared GP29 pad does not yield native-English plaintext

**Original-input result, 15 November 2026 (Agent 5).** The copied moth selects a particular pair of original ciphertext pages, but their two physically anchored 76-rune alignments fail an exact source-English word-pair gate for an otherwise arbitrary *shared additive pad*. This bounds one human-visible key-reuse hypothesis. The later latent-F extension below fails its heldout recovery gate and establishes exact tail nonidentifiability; it does not produce an original language rejection. It recovers **no original plaintext, authentic key, cipher or destination**.

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

## Latent Fehu holds and unknown word boundaries — #2977 (Agent19, 26 November 2026)

**Decision: the fixed body-start arbitrary-pad receiver is underdetermined as a full two-page solution, and the tested first-order native language receiver has inadequate held-out recovery power.** The original language score and candidate plaintext were deliberately not computed after the controls failed. This does not reject reuse of an independently sourced or structurally constrained key, or every possible higher-order paired-plaintext scorer.

The previous intact-word and ordinary-consuming gates do not cover authentic plaintext-F transparency. Freeze p53's 179 physical runes and the p55 75-rune body (skip its incoming NG carry); no offset, period, or printed-word assumption. For a pair of consuming events, (P_B=P_A+C_B-C_A\pmod{29}), with both plaintext runes nonzero. A literal zero can instead be a non-consuming F, independently in each stream. After one stream's last consuming event, the remaining stream is covered by an entirely unconstrained fresh pad.

### Exact original combinatorial obstruction (no language assumptions)

There are five ciphertext F sites on p53, offsets 68,71,79,89,166, and three on the p55 body, offsets 14,24,40 (zero-based). Every one of the (2^8=256) possible masks is feasible. For any mask, let L be the number of shared consuming events, Z the number of equal ciphertext pairs among them, and U the number of unpaired consuming events. The exact number of distinct plaintext pairs under that mask is

```
28^(Z+U) * 27^(L-Z)
```

Each equal pair permits 28 nonzero plaintext choices; unequal pairs permit 27; each unmatched consuming event permits 28. Each different mask gives a disjoint set of plaintext pairs (a held rune is F, a consuming one cannot be F). Summation yields approximately **7.979419 × 10^258 distinct exact-replay pairs (860.054 bits of unweighted ambiguity)**. With no F holds alone there are 5 equal pairs, 70 unequal pairs and 104 unmatched consuming events. Across masks, **99–107 p53 consuming events have no p55 counterpart**. Even an oracle revealing both actual hold masks and all overlapping pad digits cannot fix these unpaired tail plaintext runes: each remains 28-way compatible. This is a structural count, not a linguistic entropy estimate. For an unconstrained iid uniform pad, an oracle revealing the key up to a consuming boundary cannot predict any unused digit better than 1/29 before observing further ciphertext; a proposed recurrence or external key would be a different premise.

### Exact product model and blinded controls

Train a fixed first-order GP29 Markov model (0.5 pseudocount per cell) on the first 2,000 lines of the pinned Emerson text from I. HISTORY onward (89,909 runes). No printed boundaries are used in decoding. Gibran and Shakespeare supply nonoverlapping literal windows. Use dynamic programming over the two ciphertext positions, the two previous plaintext symbols, and one canonical-hold-order bit. Canonicalize commuting holds A-before-B between consuming pairs; pair transition has relative likelihood 29 times the product of the two native probabilities, a hold has relative likelihood 29 times its native probability, and a solitary consume has its native probability. Sum all compatible plaintext/hold paths and also compute exact Viterbi maximum. Compare the marginal likelihood against two independent uniform pads with the same language prior. Eight exhaustive tiny cases, including both zero-ending cases, match direct enumeration in marginal and maximum posterior to 1e-9. Every positive Viterbi candidate exactly replays both full ciphertexts using its reconstructed common pad. Replay does not authenticate the key.

| Frozen diagnostic | Independent positives accepted | Independent-pad negatives rejected | Required to score original |
|---|---:|---:|---:|
| Conditional increment of log BF after withholding first40/40 ciphertext prefix, cutoff +0.209600 learned from eight development pairs | 10/16 | 9/16 | 15/16 each |
| Full-span log BF, cutoff +0.524730 from the same eight development pairs; 24 new disjoint donor windows matched to original observed 5/3 ciphertext Fs | 16/24 | 23/24 | 22/24 each |

In each negative the plaintext pair and p53 ciphertext are unchanged; the replacement p55 pad is independently sampled until its observed F count matches the positive. The second experiment also conditions the positive ciphertext on the exact original observed zero counts. The likelihood formula itself is unconditional, so the score is an empirically calibrated diagnostic under the matched sampling, not a conditional Bayes factor for that sampling procedure. The first heldout group has mean Viterbi plaintext accuracies of **12.33% / 15.42%** and shared-key accuracy **11.14%**; maximum p55/key accuracy only 28%. Its best complete-pair posterior log masses range from −225.83 to −202.14 under the declared model. Fresh count-matched group means: p53 11.01%, p55 15.67%, shared-key 12.90%; descriptive full-score AUC 0.9097. High score separation in some positives is compatible with very poor actual recovery. No independent future key digits were predicted.

**Disposition.** Both prospective classification gates failed and overlap-key recovery is weak. Do not apply the language fit to the original or treat the count as a general exclusion of meaningful two-time-pad decryption. Require an independent key generator or operand before another complete-page artwork receiver; the matched overlap can still be studied if a genuinely stronger, separately calibrated language inverse recovers the planted text. This is not evidence that the duplicated moth is meaningless.

Reproduction: [SFT](../sims/lp2_moth_p53_p55_sharedpad_latent_f_sft.cjs) · [raw control scores and all 256 original hold-mask counts](lp2-moth-p53-p55-sharedpad-latent-f-output.json). The function was executed against the repository source blobs in the connected JavaScript runtime; standalone Node wrapper not independently executed. The donor conversion is deterministic greedy GP tokenization, including ING→NG and IO→IA; a real native register may differ. The first-order model is a deliberately bounded scorer, and the validation samples are finite.
