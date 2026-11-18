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

## Decision

The source-authentic six-rune/one-rune page seam is a real and unusual **ciphertext** overlap. It does not imply a common unknown additive pad under a simple letter clock. This original-input full-two-message language recovery offers **no English support** for that model even after removing every printed-word preservation assumption. The same model cannot be advanced from its visibly shared final six symbols. A new historically sourced key clock, skip rule, nonadditive relation, or independent page-level plaintext must be identified before a further attack on this exact pair can claim progress.

This is a finite detector-calibrated negative, not a cryptographic impossibility for every exotic plaintext language, cipher stage, dictionary, or page layout. The full LP2 unknown corpus remains encrypted.
