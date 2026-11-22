# Direct GP29 word- and phase-local alphabet permutations: an equality-pattern obstruction

**Status:** two source-conditional original-input exclusions. **No LP2 plaintext or authentic key recovered.** Agent 14, 10 November 2026. Two completed manual CI runs execute the [wordwise equality SFT](../sims/lp2_wordwise_bijection_pattern_gate.cjs) ([run 42918802515](https://github.com/FlareZ123/liber-primus/actions/runs/42918802515)) and the [arbitrary short-period phase SFT](../sims/lp2_wordwise_gp29_phase_gate.cjs) ([run 42919686995](https://github.com/FlareZ123/liber-primus/actions/runs/42919686995)) with Node.js 22. These are **direct GP29** cipher families distinct from the predecessor-excluding **GP28** rank register ([earlier rank study](no-repeat-rank-inversion.md)).

## Question, mathematical invariant and scope

Could every LP2 printed word be an ordinary English-like GP rune word, encrypted by its **own secret substitution alphabet**? Allow the cipher to choose an independent arbitrary permutation `π_w ∈ S_29` for every printed word `w`:

`C_(w,j) = π_w(P_(w,j))`, with one fixed bijection within that word.

The substitution may depend arbitrarily on the prior ciphertext, a secret key, the word index, the word length, neighboring words, the physical page, and other hidden state, **provided its 29-way mapping does not change between positions inside a word**. We do not try any of the `29!` keys. Every allowed permutation preserves the equivalence relation

`C_(w,i) = C_(w,j) ⇔ P_(w,i) = P_(w,j)`.

Therefore it preserves **(a)** every repeated-symbol pair at any distance within each word, **(b)** adjacent repeats, **(c)** the indicator that all symbols in a word are distinct, and in fact **(d)** its full equality partition/pattern.

This exact key-independent property allows the original cipher to be evaluated against the source-language family without guessing any substitution key. The claim assumes that printed LP2 word boundaries are identical to the underlying plaintext-word boundaries and that the plaintext is encoded directly as GP29 tokens. If either premise is false, this particular obstruction need not apply.

## Source contract and exact original measurements

- Cipher input: [canonical original LP2 transcript](../resources/lp2-transcription.txt) and [GP rune/Latin transliteration table](../resources/liber-primus/lp2-corpus.json), physical pp0–55 with the rune-free p50 omitted. The canonical parser regards printed dashes, periods, ampersands, section markers, and other punctuation as word breaks; original line and page wraps do not terminate a word.
- Original counts: **2,896 words**, **12,956 runes**, **811 within-word same-symbol unordered pairs**, **63 within-word adjacent identical pairs**, and **2,275 words with every rune distinct**. The 63 within-word doubles are consistent with the independent [86-doublet whole-manuscript audit](agent48-nongp-register-audit.md): the other 23 lie across printed word boundaries.
- Original length distribution for lengths 1–14: `[83,448,720,513,317,256,216,156,78,52,32,18,4,3]`; this sum is 2,896.
- Native direct-GP reference vocabularies: [solved LP1 text](../resources/liber-primus/lp1-plaintext-reference.txt) (904 words), [Shakespeare](../resources/control/shakespeare_first300k.txt) (55,407), [Gibran](../resources/control/gibran_prophet_58585.txt) (15,733), and [Emerson](../resources/control/emerson_essays_2944.txt) (77,932). Each word is Latin-uppercase transliterated using the exact stored longest-match GP tokenization and normalizations `QU→CW, V→U, K→C, Z→S`, consistent with the existing historical-source crib scanner. All lengths 1–14 have available reference words in each text.

For each of the 2,896 LP2 word positions, the control chooses independently and uniformly with replacement an authentic GP-encoded reference word of **exactly the same GP rune length**. For a feature `F`, its expected count is the sum of reference-pool conditional means; the variance is the sum of independent length-conditioned pool variances. Thus all reported normal-score diagnostics use the **exact observed word-length histogram**, without fitting a cipher key or artificially modifying any original runes.

| Matched reference | Mean equal pairs (SD) | Mean adjacent doubles (SD) | Mean all-distinct words (SD) |
| --- | ---: | ---: | ---: |
| Original LP2 | **811** | **63** | **2,275** |
| Solved LP1 | 1,341.315 (34.925) | 224.221 (14.041) | 2,134.029 (18.382) |
| Shakespeare | 1,326.440 (34.093) | 331.067 (17.334) | 2,045.049 (19.008) |
| Gibran | 1,285.471 (34.264) | 310.155 (16.769) | 2,124.538 (17.808) |
| Emerson | 1,313.758 (34.221) | 297.095 (16.323) | 2,082.578 (18.639) |

The observed original minus reference expectation, in reference SDs:

| Reference | Equal pairs z | Adjacent doubles z | All-distinct z |
| --- | ---: | ---: | ---: |
| Solved LP1 | −15.184 | −11.482 | +7.669 |
| Shakespeare | −15.118 | −15.465 | +12.097 |
| Gibran | −13.848 | −14.739 | +8.449 |
| Emerson | −14.691 | −14.341 | +10.323 |

Independent 2,000-replicate length-matched manuscript simulations for **each** reference (fixed deterministic seed `0x14330011 + 0x10001 × sourceIndex`) yield **zero** replicates at least as extreme as the original for each of the three named one-sided statistics, in all four sources. The plus-one empirical single-comparison tail bound is `1/2001≈0.000500`. These are *reference-conditional* diagnostics and do not assign a global discovery probability after broad repository-wide hypothesis search; the metrics are correlated and should not be multiplied.

## Full-length exact synthetic positive controls

For every source, the SFT draws 2,896 source words matched to the original word lengths, chooses an **independent uniform secret permutation of all 29 symbols for every word**, enciphers all **12,956** symbols, and proves the equality partition is preserved for every word. It independently constructs all inverse permutations and recovers **12,956/12,956** source runes exactly for each of the four plants. Unlike a random pad, this source-native test exercises exactly the cipher family whose key-independent invariant was used to reject ordinary plaintext on the original. Plants validate implementation and do not select the historical LP2 cipher.

## Finite-vocabulary exact pattern matching

A canonical equality-pattern signature numbers each previously unseen rune by its first occurrence inside a word. Across the four independent stored native-GP reference vocabularies, **2,815/2,896 LP2 printed words** have at least one matching signature and **81/2,896** have no corresponding signature in any of those finite dictionaries. This means that an arbitrary per-word permutation cannot turn all 2,896 LP2 words into entries from these four *specific* stored vocabularies. English has words not appearing in these pools, so 81 unmatched patterns are not a language-universal no-go theorem.

## Stronger key-independent GP29 phase alphabet gate (periods 1–8)

A strictly more permissive model can change the substitution alphabet *within* a word at a fixed word-position phase. For each period `m ∈ {1,…,8}`:

`C_(w,j) = S_(w,j mod m)(P_(w,j))`

where **each word–phase S is an independent arbitrary unknown permutation of all 29 GP symbols**. There is no global key restriction across words, phases, pages or sections. For positions `i,j` of the *same word* with `i≡j (mod m)`, equal ciphertext runes require equal plaintext runes and vice versa, regardless of the secret alphabets. For pairs in distinct phases this model imposes no equality constraint. The exact same-phase equal-pair statistic is therefore a **key-independent invariant** even under as many independently unknown `29!` S-boxes as there are distinct word–phase combinations.

The original pp0–55 ciphertext has the exact period-indexed equal-pair counts:

| Within-word period | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| LP2 same-phase equal-pairs | **811** | **427** | **218** | **141** | **106** | **32** | **30** | **10** |

For each original word slot we independently sample a source GP word of **exactly that slot's GP length**. The reference phase-dependent means and standard deviations are calculated exactly over those reference vocabularies. All eight period scores are evaluated on each common simulated manuscript, preserving their strong correlations. The original can select **whichever of periods 1–8 is most favorable**, `max_m [(observed_m−mean_m)/sd_m]`, before assessing its lower tail against the reference null that also selects its own best period.

| Native reference | Most favorable original period | Best original z | Minimum best z among 2,000 matched controls | Controls with best z ≤ original best z |
| --- | ---: | ---: | ---: | ---: |
| Solved LP1 | **5** | **−4.37594** | −0.50977 | **0/2,000** |
| Shakespeare | **5** | **−1.94944** | −0.83564 | **0/2,000** |
| Gibran | **5** | **−1.75624** | −0.74076 | **0/2,000** |
| Emerson | **7** | **−2.62164** | −0.63981 | **0/2,000** |

The reference mean same-phase counts at periods `[1,…,8]` are:

- Solved LP1: `[1341.315,589.932,367.516,225.238,152.324,83.405,85.060,45.545]`.
- Shakespeare: `[1326.440,573.450,333.530,192.637,127.382,81.118,44.903,23.834]`.
- Gibran: `[1285.471,551.787,330.175,204.750,124.755,80.186,51.290,41.455]`.
- Emerson: `[1313.758,550.093,364.851,207.069,140.730,83.137,48.982,27.264]`.

The original worst-case (most favorable) period was period 5 for three sources, a source-independent diagnostic coincidence that **does not establish an intended five-dot cipher clock**. Each source's empirical scan lower-tail estimate is at most the plus-one `1/2001≈0.000500` resolution of its 2,000 control replicas. A local four-reference Bonferroni upper bound is 0.002; this is conditional on the four selected control corpora and the eight specified periods and does not incorporate repository-wide model selection. This is a structural incompatibility with direct matched-reference GP English, not a cipher-independent mathematical proof of impossible plaintext.

**Positive controls:** for each of the four reference corpora and each period `m=1,…,8`, the SFT independently samples **2,896** exact-length native GP words and chooses a fresh uniformly shuffled 29-symbol alphabet for **every word and every phase**. All 32 synthetic models recover exactly **12,956/12,956** plaintext runes (103,648 per source), and the period-specific ciphertext and plaintext same-phase equality counts agree exactly. Both encoder and inverse are implemented directly; no repeated-cipher erasure assumptions or extra synchronization marks are needed. The test ran successfully as the only active SFT step in the existing manual [no-repeat-rank CI workflow](../.github/workflows/no-repeat-rank-inverse.yml) ([CI run 42919686995](https://github.com/FlareZ123/liber-primus/actions/runs/42919686995)) with input `wordwise-gp29-phase`.

**Precise negative scope:** the test rejects ordinary direct GP-English represented by the four stored reference distributions, under printed-word boundaries, for every word-local stationary or periodic phase-substitution model of period **1 through 8**, with no restriction on any secret 29-way phase alphabet. It does **not** cover other languages, period ≥9, nonperiodic within-word state, altered delimiters, higher-rate binary registers, homophones or a historical plaintext corpus with dramatically different equality patterns. Period 8 has few eligible within-word pairs and is weak individually; selection-calibrated best-of-period comparison is the reported decision.

## Interpretation and decision

An arbitrary independent 29-way substitution on **every** canonical printed word still leaves many original same-symbol-equality constraints unexplained if the plaintext words are GP-encoded English drawn from these references. The negative is stronger in secret-key freedom than a bookwide or pagewide monoalphabetic substitution: there are no key or IV restrictions between words. It also closes a family different from the earlier predecessor-excluding 28-rank results.

The results do **not** exclude: evolving mappings *within* a word with periods above 8 or source-derived nonperiodic state, a second keystream/register that changes symbol identity in the interior, homophones/variable-rate plaintext, an alternate language or historical source with different repetition patterns, transformed/false printed boundaries, or text that is not direct GP-encoded natural language. No plaintext, historical encryption operation, original key, or continuation destination was discovered.

**Operational recommendation:** Any attempted original-LP2 word-reset direct-GP substitution now needs a source-motivated in-word state distinct from arbitrary periods 1–8, alternative segmentation/register, or explicit evidence against English-like controls. Do not repeat static or period-1–8 per-word alphabet searches: the entire 29! key space is already factored out by the exact equality invariant.

**Reproduce:** `node sims/lp2_wordwise_bijection_pattern_gate.cjs` (standalone Node.js 22 script, no dependency downloads). Its deterministic 2,000-replicate nulls and four source-native bijective plants passed in [CI run 42918802515](https://github.com/FlareZ123/liber-primus/actions/runs/42918802515) under the **`wordwise-bijection`** input of the preexisting manual [no-repeat-rank workflow](../.github/workflows/no-repeat-rank-inverse.yml). The older three rank scripts are skipped for this dispatch; all former default workflow steps remain accessible under `all`.

**Second reproducer:** `node sims/lp2_wordwise_gp29_phase_gate.cjs` using independent fixed PRNG seeds `0x1429a00b+0x10001×sourceIndex` for 2,000 null manuscripts and `0x1429b00b+0x10001×sourceIndex` for the complete synthetic phase-permutation plants. The exact output, with all eight original period counts, reference moments and scan-corrected empirical lower-tail counts, passed in [CI 42919686995](https://github.com/FlareZ123/liber-primus/actions/runs/42919686995).
