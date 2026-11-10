# Reversible 29-to-28 feedback alphabet: periodic-key and marker inversion

**Agent 42, 2026-11-10. Evidence class: bounded negative with exact original-rune inversion and positive controls.** No plaintext or key was recovered from unsolved LP2. The experiment uses the 55 original unsolved rune-bearing pages (12,956 runes), the corrected 2,896 continuous rune words, and the checked-in English-GP controls.

## Constructive reversible hypothesis

The immediate-repeat deficit in LP2 may come from an alphabet that encodes each successive rune **relative to the preceding published ciphertext rune**. Let the 29 source rune indices be 0 through 28 and write the preceding ciphertext rune as \`a\`, the current rune as \`b\`. For a non-repeat \`a != b\`, consider two rank encodings:

- **Linear deletion:** \`r=b-[b>a]\`. The 28 allowed symbols preserve canonical rune order with the predecessor omitted.
- **Circular distance:** \`r=(b-a-1) mod 29\`. This is the positive modular distance from the predecessor minus one.

For a repeat \`a=b\`, define the unique sentinel \`r=28\`. Both maps are exactly invertible for every previous rune and every possible 29-symbol rank: non-repeats use \`b=r+[r>=a]\` in the linear family or \`b=(a+1+r) mod 29\` in the circular family; sentinel 28 always encodes \`b=a\`.

These complete inverses are useful because the *predecessor-excluding* output alphabet has 28 possible nonrepeat symbols, which is \`phi(29)\`, the size of the nonzero multiplicative group modulo 29. This numerical observation alone is not evidence of the manuscript's encryption method.

A concrete candidate uses an arbitrary **fixed bijective plaintext substitution per periodic key phase** over these 28 rank symbols. Its output-equality collision probability is invariant to the unknown 28! permutation used at each phase. An additive mod-28 Vigenère key is one special case. Test each period 1–128, both rank encodings, and phase resets either at every physical page or continuously across the 55 rune-bearing pages. Skip the sentinel in the collision ratio, but advance phase on sentinel positions.

For each tested period and policy, define \`N_{k,j}(x)\` as the number of rank-symbol occurrences \`x<28\` at phase \`j\`, and \`N_{k,j}\` as their sum. The invariant is:

\`\`\`
I(k) = sum_{j,x} N[k,j,x]*(N[k,j,x]-1)
       / sum_j N[k,j]*(N[k,j]-1)
\`\`\`

This equals \`1/28 = 0.0357142857143\` under uniform independent nonrepeat ranks. No phase permutation, additive key, or global relabeling of the 28 rank symbols changes this statistic. The null produces self-avoiding 29-rune ciphertext with independent uniform nonrepeat draws, preserving **every observed within-page repeat position exactly**. For each null book, select the maximum over the complete same 512-member model family. All results are source-locked and deterministic.

## Executed original-text result

| Measurement | Value |
|---|---:|
| Original LP2 rune-bearing pages / runes / complete words | 55 / 12,956 / 2,896 |
| Original observed repeat marks within pages | 86 of 12,901 transition positions |
| Best searched original rank collision | **0.0363159157164471** |
| Winning original selection | Circular model, continuous phase, period 94 |
| Matched null family-maximum mean | 0.03628760416088962 |
| Matched null family-maximum 95th percentile | 0.03645431480629998 |
| Null maxima at least original best | **66 of 200** |
| One-sided add-one empirical p | **67/201 = 0.3333333333** |
| At canonical 16-phase, circular/page-reset | 0.03571840222052287 |
| At canonical 16-phase, linear/page-reset | 0.035760138439428164 |

The observed entire search-family maximum is ordinary under a model-matched self-avoiding null. The period-94 winner does not provide a key or evidence for a 94-period cipher. Earlier 29-ary periodic-key sweeps did not establish this 28-rank result; this test specifically covers the reversible rank pretransform and arbitrary phase bijections.

### Planted plaintext recovery and power

For an exact constructive check, GP-encode three existing English sources with the authentic 29-token transliteration. On source Shakespeare GP, reserve the rare 29th symbol \`EA\` as sentinel 28 and apply random nonzero-length mod-28 periodic keys to the other 28 symbols. Construct ciphertext from the resulting rank stream using each source-original reversible predecessor rule. Invert every planted ciphertext symbol using the original key, obtaining **exact recovery** in all 144 manuscripts (12 plants for each 2 rank rules × 2 phase policies × 3 key periods). The periods were 16, 64 and 128, including an entire 128-symbol key. The minimum of the planted mean? More importantly, the **smallest individual positive-control collision among the twelve families is 0.05937352944796026**, compared with the real entire-search best 0.0363159157164471. Family means range approximately 0.06055 to 0.06107. These positives have about 90–100 literal repeat markers per full book, similar to LP2's observed 86.

This establishes sensitivity to ordinary-GP English inputs under the specified source construction. It does not prove sensitivity to hidden plaintext alphabets with a different conditional collision profile, plaintext-dependent phase, a state-dependent key, nonbijective rewriting or a nonperiodic pad.

## Stronger positional falsification of a fixed marker as plaintext EA

A tempting reading is that the repeat marker \`r=28\` literally represents unencrypted plaintext GP \`EA\`: the Shakespeare source frequency is \`1633/218800 = 0.007463\`, close to LP2's repeat frequency \`86/12901 = 0.006666\`. This equality of global rates is misleading.

The 2,896 correct LP2 whole words contain **63** within-word adjacent repeats. Divide their positions into disjoint categories: second position except when already last, middle positions, and final position. The observations are **[11, 33, 19]**. For each Shakespeare, Emerson and Gibran control, sample English GP words conditional on each actual LP2 word length. Compare which candidate plaintext rune would occupy those same word-local positions. The expectations for **GP EA** are:

| Corpus | Expected second | Expected middle | Expected last | Observed |
|---|---:|---:|---:|---|
| Shakespeare | 55.94 | 26.61 | **0.99** | 11 / 33 / **19** |
| Emerson | 48.70 | 37.23 | **1.16** | 11 / 33 / **19** |
| Gibran | 57.74 | 49.24 | **2.45** | 11 / 33 / **19** |

Thus, a cipher that leaves the exact location of GP EA in clear via an adjacent-repeat marker strongly disagrees with three distinct word-length-matched literary sources, especially at word ends. All 29 candidate plaintext runes were scored using the same three disjoint position counts and source-derived variances. The minimum descriptive diagonal-variance discrepancy across 29 glyphs is \`chi=26.288\` (Shakespeare W), \`chi=16.282\` (Emerson TH), \`chi=16.592\` (Gibran W). This approximate sum of standardized squared deviations is **not a formal discovery-adjusted p-value**; the controls make no claim about an unknown plaintext word source. The EA-specific position mismatch is nevertheless qualitatively substantial, and cannot be resolved by matching only its global frequency.

## Scope and next discriminating step

**Supported exclusion:** direct ordinary English-GP plaintext encoded as a **stationary 28-rank bijection selected by a period at most 128**, for either of the two precisely defined predecessor-excluding ranks, is unsupported by the original ciphertext under a repeat-mask-preserving null. The fixed-special-rune explanation of literal repeats also fails against the tested English source registers' positional structure.

**Open:** variable or hidden key-pointer phase, cryptographically long nonrepeating keystreams, non-English plaintext, nonlinear many-to-one insertion/deletion, phase-dependent marker identity, and transforms that use history beyond the preceding ciphertext symbol. The rank architecture itself provides a valid reversible decoding coordinate system, but these tests do not establish it as the intended Liber Primus coordinate system.

**Reproduce:** \`node sims/repeat_rank_periodic_attack.cjs\`, using:
- \`resources/liber-primus/lp2-corpus.json\`
- \`resources/lp2-transcription.txt\`
- \`resources/control/shakespeare_first300k.txt\`
- \`resources/control/emerson_essays_2944.txt\`
- \`resources/control/gibran_prophet_58585.txt\`

Deterministic xorshift32 initial seed **0x42a1cace**. All 841 \`previous rune × rank\` inverse checks pass for each map. The original-source script completed in the original repository, [successful manual GitHub Actions run 42778001321](https://github.com/FlareZ123/liber-primus/actions/runs/42778001321). This deliberately stays in \`im-results/\`; it is not a decrypted page or novel verified key.
