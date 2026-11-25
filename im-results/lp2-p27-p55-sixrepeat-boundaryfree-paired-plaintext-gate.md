# Original p27/p55 six-rune shared suffix: joint two-plaintext inverse with free word boundaries

**Agent8, 18 November 2026. Classification: bounded original-cipher negative; no plaintext recovered.** The unusually specific seven-rune p55/p56→p27 seam fixes a source-authentic echo and motivates a candidate original-cipher pair. This experiment uses it to attempt *both unknown plaintexts* under a common additive pad, while freeing all plaintext word boundaries. The original six-rune ciphertext equality alone does not make the output an English passage. The direct global language inverse fails its genuine-English and wrong-alignment controls.

## Original source fixes the two registers

The independently established [p55/p56→p27 seam](lp2-p27-p55-affine-two-timepad-dictionary-inverse.md) has six identical terminal GP29 ciphertext runes **D-J-U-B-E-I** on original p55 and the p27–32 chapter, followed by the first GP29 rune of p56 to complete a seven-rune match. Original p27–32 chapter has 1,433 GP29 runes. The hypothesized complete 76-rune cyclic walk is the chapter's final **42** runes followed by its first **34**. Physical original p55 has **76** runes. The final six in both 76-rune sequences are the same printed runes; the exact source differential is therefore six zeros at its end.

The exact six-rune echo is a stronger original locator than the page32/page55 **postselected offset19** reported in the prior [art-linked paired-English test](lp2-tree-p32-p55-boundaryfree-twotimepad-plaintext-gate.md). The prior [exact dictionary gate](lp2-p27-p55-affine-two-timepad-dictionary-inverse.md) rejected even all separately affine-scaled common-pad keys **provided the original printed word divisions were preserved**. The present operation removes that specific limitation. It still hypothesizes source-unwritten pad reuse, a cyclic chapter walk, a unit relative plaintext alphabet, and a shared clock with no literal-F bypass.

Let the observed source difference be `D[i]=(C27walk[i]−C55[i]) mod29`. For two plaintexts protected with the same unknown per-symbol GP29 pad `K[i]`, subtraction gives `D[i]=(P27[i]−P55[i]) mod29` independent of all 76 key values. Under that exact hypothesis, both plaintexts must share their **last six GP29 runes**, and we can recover two English streams using no observed word boundaries.

## Exact constructive joint-plaintext decoder

[The standalone CJS SFT](../sims/lp2_p27_p55_seam_boundaryfree_viterbi_sft.cjs) trains an interpolated source-native GP29 tetragram model on the first 67% of the repository-pinned Shakespeare reference (145,461 training runes; 71,645 held out), using 29-state transliteration and documented orthography. It applies a single exact 29³-state Viterbi joint inverse to the two source ciphertexts, where all possible GP29 letters and all candidate unprinted spaces are implicitly allowed.

To ensure the detector can be compared to genuine English satisfying the very **same six-rune suffix requirement**, eight **naturally occurring** pairs of separate, independently withheld 76-rune English passages are drawn from distinct source positions sharing an exact six-rune suffix. There is no artificial six-rune suffix patch. Each pair is encrypted with the same nonconstant key `K[i]=(7i²+11i+3+j) mod29`, and the decoder is forced to recover the pair given only the ciphertext difference. A second control generates **12 source-preserving wrong alignments** by circularly shifting the original 70-rune p55 prefix while leaving its final six original runes intact, hence maintaining exactly the same six source-equality sites. For both controls the *full* 76-rune log score is optimized by the same fixed decoder.

## Original-original and known-English results

| Original input type | Cases | Maximum-likelihood paired-English GP29 log score |
| --- | ---: | ---: |
| True original p27 seam window against original p55 | 1 | **−267.8249601574523** |
| Eight authentic held-out English pairs sharing actual six-rune suffix | 8 | **−262.5631555 to −247.9162295** |
| Twelve six-seam-preserving original-prefix rotations | 12 | **−270.7245165 to −256.2773529** |

All **8/8** genuine English pairs score higher than the source original. **10/12** deliberately wrong prefix rotations score higher as well. The original pair's optimized English score is below the source rotation null median **−263.7370008585**, and far below the genuine English-pair median **−255.8739692534**. The Viterbi decoder recovers only **11–44** of 76 true symbols per passage on the positive controls; it can hallucinate locally grammatical-looking substrings even when both underlying 76-rune English originals are recoverable in principle with a stronger language model.

The best original sequences are:

```text
candidate p27: OMORTCONUIRTERICIANSASSAWTHYBUTCHANGEMOURCIUSONRECONGOODUIRGILIAITHALLMESSICINIUS
candidate p55: TOUTANCIENDUNTERTHESEBEGGNGBACCSECONDSNORTHYOURMOTHEPEACEMASOUTHWASHEWALLROACINIUS
```

Their shared `CINIUS` suffix is **forced** by the last six zeros in the source difference, and cannot authenticate a plaintext. Isolated fragments such as `NORTH`, `SECONDS`, `THESE` and `GOOD` are the intended tetragram model's optimization artifacts. No unknown original plaintext is independently recovered.

**Reproduced and passed on original source files on [GitHub Actions Windows run 44300501406](https://github.com/FlareZ123/liber-primus/actions/runs/44300501406)**, Node22. The runnable workflow is [agent8-p27-p55-seam-viterbi.yml](../.github/workflows/agent8-p27-p55-seam-viterbi.yml). It independently asserts original 1433/76/12956 counts, the exact six copied symbols and zero differences, natural English-control suffix identities, and reversible common-key cancellation before scoring all 21 pairs.

## Latent-word paired-language recovery (Agent45, 24 November)

The preceding character-only Viterbi detector had limited genuine-plaintext recovery, so this distinct constructive decoder searches complete dictionary words and two independent latent boundary tapes. It retains the source-fixed 76-rune p27 cyclic window, original p55, shared six-rune suffix and unit shared-pad differential. No new placement or slope is fitted.

A weighted GP29 word trie uses the pinned English frequency lexicon plus the first 67% of Shakespeare words. A separate weighted suffix trie permits an arbitrary initial midword. For each paired next rune, the decoder either continues the current word or closes a terminal and begins the next word; the opposite rune is fixed by the exact differential. It adds an interpolated previous-word conditional probability at word closure. End prefixes are permitted. The 1,024-state beam merges matching paired trie/previous-word states and keeps the highest-scoring paths; this is an approximate search, not global optimality. The full decoder jointly constructs both letter tapes and their predicted word boundaries without using any printed ciphertext space positions. A returned pair yields an exact common pad by subtraction and is forward-replayed against both original ciphertexts.

The implementation contains 29,964 word types and 267,664 trie nodes (including suffixes); it trains on 37,122 Shakespeare words and leaves 71,344 runes held out. Four naturally occurring disjoint held-out pairs with identical six-rune suffixes were selected independently of the manuscript.

| Pair | Joint score | Recovered exact rune positions per tape (of 76) |
|---|---:|---:|
| Plant 1 | -262.900010 | 23 |
| Plant 2 | -255.493752 | 14 |
| Plant 3 | -249.454830 | 57 |
| Plant 4 | -230.622501 | 50 |
| Original | -266.003715 | Unknown |

The two strongest plants reconstruct long actual clauses, for example plant 3 recovers `AND NOW IN PEACE MY SOUL SHALL PART TO HEAUEN SINCE I HAUE SET MY` and `HARDLY BORNE BY ANY IN THIS PRESENCE I DESIRE TO RECONCILE ME TO HIS` concurrently. The incomplete results in the other two plants demonstrate remaining language/beam ambiguity. These independently selected controls and word-level scores are not directly comparable to the earlier character-only scoring scale.

The original joint optimum found by this finite beam is:

```
p27: THE LATTER OF MEN WE LL FLOCCNG HER NATIAN FRAGRANCE MURDERER LET FLOOR ND THE COURT WHY LISTENED
p55: S THE WALL CLEAN OF MY MANLY WHO WHAT EACH MISS IT OH RISE THERE S MAJESTY HORSES IN ALL HIS HASTENED
```

Neither complete passage is intelligible as recovered plaintext, and its score is below all four independent genuine-English pairs. Individual plausible phrases and forward replay under an arbitrary fitted pad are insufficient. This is a stronger constructive recovery attempt, not an all-key theorem or a proof that no language model can invert the pair. It gives no new key, historical instruction, or unknown-page solution. The source-selected seam remains a real ciphertext observation. Do not promote the output or resume the same pad model merely by tuning the beam.

[Executable CJS decoder](../sims/lp2_p27_p55_jointword_beam_recovery_sft.cjs), original-source runtime execution at [d3f9d67e](https://github.com/FlareZ123/liber-primus/commit/d3f9d67eccf9788ae8ed9705b009220d47233020).

## Relative affine two-message inverse (Agent14, 25 November)

The earlier all-affine dictionary attack assumed intact original word boundaries, while the earlier latent-boundary inverse fixed the relative slope to one. Retain the exact original 76-rune cyclic p27 window and p55, but let

```
C27[i] = X[i] + K[i]
C55[i] = beta*Y[i] + K[i]     (mod 29), beta in 1..28
Y[i] = inverse(beta)*(X[i] - (C27[i]-C55[i]))
```

The first alphabet scale is fixed to one, and the second is unknown. No historical source selects this extension; it is a finite constructive attempt to extract both complete unknown messages from the rare source seam. Both original word-boundary tapes remain latent. The shared pad is arbitrary and unbounded. The last six ciphertext equalities now imply scaled plaintext equality, not necessarily identical underlying text.

The existing paired word-trie decoder is adapted to rank **all 28** relative slopes at beam128, then independently rerun the top four at beam1024. The same 29,964-word register and source-held-out Shakespeare words supply five **natural disjoint passage pairs with exactly six equal scaled suffix runes**, chosen for true slopes 1, 2, 7, 13 and 28 without inspecting LP2. Forward replay is checked on both original and all planted ciphertexts. The implementation returns explicit candidate plaintexts rather than just a score.

| True planted scale | Selected scale | True coarse rank | Exact plaintext positions, each of 76 |
| ---: | ---: | ---: | --- |
| 1 | 1 | 1 | 49 / 49 |
| 2 | 2 | 1 | 37 / 37 |
| 7 | 14 | 23 | 4 / 6 |
| 13 | 19 | 14 | 6 / 1 |
| 28 | 28 | 1 | 22 / 22 |

The original selects **beta=1**, reproducing the previously reported word-beam candidate and score **−266.00371503992204**. Other refined alternatives (25, 10, 24) score −275.155836, −275.502721 and −277.403043. None recovers an independently intelligible full message. The earlier unit-slope candidate is not new plaintext. The 76/76 shared-pad replay is automatic for any feasible pair and chosen scale. A preliminary exact trigram all-scale decoder recovered zero of five planted slopes, with its original score below six seam-preserving wrong-prefix rotations; it is superseded for this attack by the stronger word-trie search.

**Decision:** the all-scale latent-boundary attack did not recover an original key or plaintext. It recovered 3/5 planted slopes but not complete paired plaintext, so its original failure is **not an all-key or all-language exclusion**. The coarse beam misses two true scales before refinement. Do not interpret a low original score or its winning unit scale as proof that the affine family is impossible. Further work needs a genuinely independent key/crib constraint or materially stronger blind recovery, rather than merely changing beam widths. This exact finite experiment is preserved as [read-only Node/CommonJS SFT](../sims/lp2_p27_p55_relative_affine_jointword_sft.cjs) and [raw original and control output](lp2-p27-p55-relative-affine-jointword-output.json). Executed directly in Code Mode against the repository corpus and donor; no Windows CI execution is claimed.

## Decision

The source-authentic six-rune/one-rune page seam is a real and unusual **ciphertext** overlap. It does not imply a common unknown additive pad under a simple letter clock. This original-input full-two-message language recovery offers **no English support** for that model even after removing every printed-word preservation assumption. The same model cannot be advanced from its visibly shared final six symbols. A new historically sourced key clock, skip rule, nonadditive relation, or independent page-level plaintext must be identified before a further attack on this exact pair can claim progress.

This is a finite detector-calibrated negative, not a cryptographic impossibility for every exotic plaintext language, cipher stage, dictionary, or page layout. The full LP2 unknown corpus remains encrypted.
