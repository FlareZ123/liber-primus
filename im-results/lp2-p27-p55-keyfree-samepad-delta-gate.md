# A key-free test of long additive-key reuse behind the p27/p55 DJU–BEI echo

**16 November 2026, Agent9. Decision:** the exact original repeated two-word ciphertext provides a fixed 6,395-position alignment, but the **302 original GP29 runes preceding it do not exhibit the difference profile expected from independently sampled source-native English texts sharing one identical positionwise additive key**. This is a source-anchored, bounded negative for extended additive-pad reuse. **No unknown LP2 plaintext, historical key, or cipher operation was recovered.**

The original anchor itself is prior art: [Agent28's source-verified repeated-pair census](lp2-p27-p55-terminal-two-word-echo.md) and the earlier [pnotisdev Phase58](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase58_djubei_reuse.md) report the same six original runes. Phase58 screened 1,439 candidate numerical streams for matching six-rune key fragments and 686 candidate decodings, with no source plaintext. The present test **does not enumerate or infer a key at all**: under the stated same-pad premise the key cancels algebraically over a long authentic, held-out-before-the-echo passage.

## Source and exact frozen competing predictions

The canonical physical LP2 original rune indices are \`resources/liber-primus/lp2-corpus.json\` (pages p0–55, 12,956 rune symbols, p50 empty). Independent original photographs and source-matched GP indices for the repeated two-word unit are established in the linked earlier report:

| Printed location | GP29 indices | Global contiguous positions |
| --- | --- | --- |
| p27 second printed line, local 28–33 | 23,11,1 / 17,18,10 | 6555–6560 |
| p55 final two words, local 70–75 | 23,11,1 / 17,18,10 | 12950–12955 |

The common six-rune string is \`ᛞᛄᚢ-ᛒᛖᛁ\`. It is the sole duplicated literal-hyphen-adjacent word pair among 2,584 scanned pair slots. The exact source-relative displacement is **6,395 rune indices**.

**Tested long-reuse hypothesis H:** the author used a single GP29 additive keystream with identical per-symbol state at offsets \`[6253,6554]\` and \`[12648,12949]\`, the **302 rune symbols immediately preceding the copied six-rune phrase**, and the authentic plaintext in both windows resembles the source-native English GP29 register documented on independently solved LP1 and LP2 material. No assumption of repeating *plaintext* over those 302 positions is needed. The six exact repeated runes were **excluded** from the original-input test to avoid a selected-anchor bias.

For two plaintext streams \`P[i]\`, \`Q[i]\` and a shared unknown pad \`K[i]\`, let \`C[i]=(P[i]+K[i]) mod 29\` and \`D[i]=(Q[i]+K[i]) mod 29\`. Then the exact observed signed ciphertext difference
\`(C[i]-D[i]) mod 29 = (P[i]-Q[i]) mod 29\`.
This mathematical equality holds for **every secret pad**, independent of entropy, phase, or length, if the exact same pad is reused at each of the tested 302 positions. Other state transitions, partial overlap, changed segmentation, a different alphabet, an extended non-additive cipher or historical alternate-language plaintext are outside this gate.

The independent source-native GP spelling calibration, implemented by \`sims/lp2_native_gp_source_orthography_sft.cjs\`, reproduces 181/181 solved LP1 word positions and all 95 solved original LP2 p57 runes, respecting one-rune **ING** and **IO**. It is the pinned choice of English alphabet used for the discriminating comparison, not a claim about all possible unknown-page plaintext.

## Exact original-input statistic

The observed 302-rune difference histogram, ordered by zero-based GP29 residue 0–28, is:

\`\`\`text
11 5 16 16 9 9 12 11 7 4 10 11 7 12 15 11 8 12 11 11 9 8 12 8 14 11 7 14 11
\`\`\`

In particular, only **11/302** differences are zero. From each independently supplied source-native English corpus, estimate the 29 unigram frequencies \`p[r]\`, then their exact independent pair-difference probabilities \`q[d]=sum_r p[r]p[(r-d) mod29]\`. Use a fixed log-likelihood ratio score relative to uniform GP29 differences: \`LLR = sum_i ln(29*q[delta[i]])\`. Positive LLR favors the independent-English-difference model relative to flat GP29; a low or negative score weakens that model. It is deliberately a coarse unigram statistic rather than a fitted machine-learning decipherer.

| Independently fixed English reference | Source-native rune training length | q[0] | Original 302-rune LLR | 1,500 independent-text control median | Source-English control scores at/below original |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gibran, *The Prophet* | 62,492 | 0.05959424 | **−5.80230** | 6.54668 | **0/1,500** |
| Shakespeare, first 300k | 217,106 | 0.05944728 | **−5.04912** | 5.94815 | **0/1,500** |
| Emerson, *Essays* | 321,327 | 0.06149836 | **−6.47681** | 7.03289 | **1/1,500** |

The deterministic controls select two 302-rune windows from the same independent reference corpus, with a nonoverlap correction for same-source windows. In the positive, two genuine source-native English 302-rune windows are encrypted under the **same explicitly nonperiodic positionwise GP29 additive pad**, and the code asserts exact key cancellation and forward–inverse recovery. Thus the test has a correct same-key positive across both unknown-key arithmetic and the source-native linguistic register.

An additional 2,000 deterministic **wrong-original-alignment controls** compare each unchanged p55 pre-echo window to another fixed-position 302-rune window in the authentic 12,956-rune unknown ciphertext. Under the Gibran score, their median was **−6.22623**; **901/2,000** scored at or above the source-anchored original score. Therefore the 302-rune authentic difference looks **ordinary among unrelated original ciphertext alignments**, despite its uniquely matching terminal six-rune anchor.

These deterministic windows can overlap and share the same training text, so fractions are **calibration counts, not independent binomial p-values or discovery-corrected probabilities**. This score is selected after knowing the repeated six-rune ciphertext pair. The analysis tests one well-defined and fairly strong extension of the reused-key premise rather than a probabilistic proof that the six-symbol pair was accidentally repeated.

## Meaning for decipherment

The six-rune copied phrase remains a genuine original-source structural anchor, but **the hypothesis that its two occurrences reside within an identical additive keystream extending back another 302 runes is unsupported under English-like plaintext**. A single reused six-rune pad followed or preceded by distinct key state is unaffected. A long shared key combined with a non-English or pseudorandom intermediate register is also not excluded. A true plaintext-repeat cipher would impose stronger predictions than our pair-of-different-English controls, but should have an independent author-selected repeating-phrase rule before testing it.

A fresh solve route would need an author-era **reset selector or key-state recurrence** that predicts the exact 6,395-displaced six-rune match and additional original-page plaintext beyond it. This source-fixed clue does not justify sweeping previously exhausted numerical key libraries or fitting more unsigned parameters to the echo.

## Reproduction

- Standalone read-only original-source CommonJS test with JSDoc, deterministic source-English controls and genuine same-pad plants: [\`sims/lp2_p27_p55_keyfree_samepad_delta_sft.cjs\`](../sims/lp2_p27_p55_keyfree_samepad_delta_sft.cjs).
- One manual-only Windows Node22 workflow: [\`.github/workflows/agent9-p27-p55-keyfree-samepad-manual.yml\`](../.github/workflows/agent9-p27-p55-keyfree-samepad-manual.yml).
- **Passed source-native Windows Node22 execution:** [GitHub Actions run 43806311849](https://github.com/FlareZ123/liber-primus/actions/runs/43806311849), job 133097798696, complete 16 November 2026 at 04:49:10 UTC, success. It executed the SFT on original repository inputs.
- Source placement/provenance: [p27/p55 two-word original census](lp2-p27-p55-terminal-two-word-echo.md). External previous key-library screening: [Phase58](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase58_djubei_reuse.md).

**Result classification:** a bounded original-cipher family exclusion under a specified calibrated English register, not established decryption and not an independently sourced key.
