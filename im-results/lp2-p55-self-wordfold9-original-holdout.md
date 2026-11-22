# LP2 p55: self-derived nine-rune wordfold key has a local signal but fails the p27 holdout

**Agent 46, 15 November; Agent3, 22 November 2026. Classification: provisional original-source structural signal and finite failed wordfold/full-page butterfly cipher predictions.** No authenticated unknown LP2 plaintext, author-supplied key, working cipher, or continuation recovered. A [standalone read-only source SFT](../sims/lp2_p55_self_wordfold9_source_sft.cjs) reproduces the full experiment and passed [manual GitHub Actions Node22 run 43661530787](https://github.com/FlareZ123/liber-primus/actions/runs/43661530787). The measurements below supplement, rather than replace, the authoritative [unsolved synthesis](../results/README.md).

## Intended-solver hypothesis, without treating it as an instruction

Under a *provisional* 2016 signed-word map, the signed word `the` points to the literal four-rune ciphertext **FOLD** at physical p14; following the same provisional GP-prime-sum address leads to the final unknown page **p55** and then to the already-solved **END** at p56. Those address conventions remain disputed. Separately, the solved p57 PARABLE says to shed circumferences. This makes a literal outer-to-inner **fold of p55 printed words** one possible human action, although no source explicitly selects addition, GP-prime sums, or the decoded output's role.

Original physical p55 contains **76 GP29 runes**, arranged in **17 printed rune fragments**. Its first fragment is one rune carried over from p54; the remaining 16 are whole printed words. Freeze their source order `W_0,...,W_16`, and compute each fragment's GP-prime-weight sum `S_i`. The nine folded residues are

```text
K_i = (S_i + S_(16-i)) mod 29  for i=0..7
K_8 = S_8 mod 29
K = [6,3,21,3,17,15,22,9,17]
GP letters = G O NG O B S OE N B
```

The direct candidate is a **positionwise GP29 subtraction** of this source-derived period-nine stream from all 76 unchanged original p55 runes: `P_i=(C_i−K_(i mod9)) mod29`. An exact inverse exists **when K is supplied**. Because K here is computed from the ciphertext being decrypted, the synthetic fixed-key roundtrip only checks the arithmetic. It does **not** show that the complete self-key construction is invertible or was used by Cicada.

## Source-input original results and matched controls

| Exact source-based readout | GP29 IoC |
| --- | ---: |
| Original unchanged 76-rune p55 | **0.03789474** |
| Candidate subtraction of folded original nine-residue key | **0.04491228** |
| Known solved p57 with one final rune shed from each body word, 76-rune source-native control | **0.05649123** |

The proposed original output starts `SOEIAWMFACTHNNXLXIWEWJTHNRTTHGLYRT...` in GP transliteration; it is **not recognizable plaintext**. The original IoC rises, but falls below approximately the **first percentile** of 76-rune windows in each of three independent native-GP English reference corpora. Those windows use the pinned Shakespeare, Gibran and Emerson resources and the historical longest-match GP orthography. Thus the local symbol-frequency improvement is too small to identify a finished native-English decrypt.

Two exact, matched wrong-source nulls retain the source's nine-key procedure. For each, test the **specified forward-minus key** and also the *maximum of four plausible signs/read directions* to account for this family's exploratory selection.

| Original preserved and randomized | 50,000 trial counts at least original | Plus-one four-model family tail |
| --- | ---: | ---: |
| **Entire sixteen complete p55 word fragments shuffled** as units; first carried fragment fixed; recompute folded key on each resulting source text | **1,797** | **0.03595928** |
| Original p55 unchanged; shuffle the assignment of its original **29 GP prime weights** to the rune alphabet; recompute folded key | **2,656** | **0.05313894** |

For the one specified forward-minus model alone the corresponding plus-one tails are **0.00955981** (word order) and **0.01325973** (prime assignment). These are conditional finite-family numbers, *not discovery-wide probabilities*: the page, 17-fragment fold, GPprime weights, nine-period subtraction, source phrasing and IoC statistic were selected after substantial earlier research. A familywise p-value just over 0.05 for the wrong-alphabet test and the cipher-looking output prevent an authenticity claim.

An independent same-manuscript original-input comparison tests the same forward-minus operation on every page-local window of **17 printed rune fragments**, without tuning any key. Across **2,048** windows, **76** have exactly 76 runes; **p55 is the sole equal-length window with IoC at least 0.04491228**. Of the **1,048** windows of length 70–82, four meet or exceed that score. This supports recording a *locally unusual original-word geometry*, conditional on the exploratory chosen fold. It does not establish plaintext.

## Separate p27 original-cipher prediction fails

A distinct source-visible handle for a heldout test is the exact duplicated final six-rune word pair on p27 and p55, **D J U / B E I**. Its original local positions are p27 runes **28–33** and p55 runes **70–75**. If the folded nine-rune p55 source key also encrypts the corresponding p27 material under a shared periodic clock, the duplicate itself fixes p27's key phase with no language scoring:

```text
phase = (70 - 28) mod 9 = 6
```

Apply *the same forward-minus nine-rune key* to the original p27 page with phase 6. The page's IoC goes **down**, from **0.03393126 to 0.03330766**; no readable passage appears. Even optimizing a phase retrospectively among nine alternatives only reaches IoC **0.03668244**, still ciphertext-like. This rejects the simplest cross-page shared-key interpretation despite its two exactly matching original anchors. It cannot rule out a distinct page-local selfkey or a deliberate repeated ciphertext marker with different underlying key streams.

## Full-physical-page reversible two-wing fold (Agent3, 22 November)

**New bounded architectural test, source-motivated and negative.** Original physical p55 prints bilaterally mirrored vine-like framing and a two-wing moth below the pale tree. The solved PARABLE source explicitly describes shedding circumferences; the earlier p55 wordfold test instead discarded information when folding source fragments, and its ciphertext-derived key made a complete plaintext-to-ciphertext inverse unspecified. The most literal entirely **lossless** continuation pairs every original rune with its physical left/right mirror across the **entire 76-rune ciphertext stream**, rather than deleting endpoint or two-rune word data.

Freeze 38 source-ordered pairs at unchanged physical offsets (i,75−i), i=0..37. Apply one keyless 2×2 GF29 butterfly H=[[1,1],[1,−1]] to each pair: P_i=C_i+C_(75−i), P_(75−i)=C_i−C_(75−i), modulo29. Its determinant is −2, invertible in GF29, with H inverse=(15×H) mod29. Thus **all 76 printed ciphertext symbols** participate and recover exactly, including p55's carry from p54 and all five two-rune complete words. All original 16 complete word lengths are retained as output word breaks; no cipher symbols or punctuation lengths are silently omitted. The butterfly operator is a human-visible geometry interpretation, not a claimed creator-selected cipher.

The original page's IoC changes from **0.037894737** to **0.042456140**, while the complete first 76 true clear p57 GP source runes have **0.059649123**. All sixteen original p55 complete printed words after this inverse are:

    XWJE  NTH  MN  AEJJTRJ  EFYFLM  OEI  THCIONHPIAETNLAE  BNNGNGEAL  RFUF  EU  JAEMOEOIANG  EOMCOEAEJI  FU  UPCFNO  NGAEN  THWJ

The initial carried rune in the output is TH. There is no meaningful continuous GP-native prose in these word positions. The specific **whole-page no-key mirror butterfly** is rejected as a direct p55 decoder; its modest IoC change cannot compensate for the literal gibberish. The model selection has **zero free parameters**. On a separate genuine clear p57 76-rune planted source, forward inverse H reconstructs all 76/76 runes and decrypts exactly. Every original p55 glyph also reencrypts exactly; these roundtrips verify implementation, not historical authenticity.

[Single-file Windows Node22 CJS SFT](../sims/lp2_p55_full76_tree_butterfly_original_sft.cjs) · [passing complete original-source CI run 44977110624](https://github.com/FlareZ123/liber-primus/actions/runs/44977110624). Existing exterior33, nested 43/23/9/5 peel, source-kernel, p56 direct totient and three-square feedback models are distinct published failures and were not retested here. No new numerical key or post-hoc fold orientation is proposed.

## Research decision

Keep the exact 17→9 source-fold construction and its modest matched-source anomaly as **provisional local evidence**. Retire the idea that its direct GP29 subtraction has already recovered the p55 message, or that the same key transfers to p27 through the duplicated bookend. It leaves unanswered the decisive questions: why the creator would select these prime sums and this specific fold, how a ciphertext-derived key would be encrypted reproducibly, and what independently selected additional operation would produce a genuine plaintext or external destination. Do not tune further affine parameters or claim source authentication without new original instructions or a withheld positive prediction.
