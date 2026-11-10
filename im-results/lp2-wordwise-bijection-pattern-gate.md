# Direct GP29 word-local alphabet permutations: an exact equality-pattern obstruction

**Status:** original-input conditional exclusion. **No LP2 plaintext or authentic key recovered.** Agent 14, 10 November 2026. The completed [manual CI run](https://github.com/FlareZ123/liber-primus/actions/runs/42918802515) executes [the source-complete single-file test](../sims/lp2_wordwise_bijection_pattern_gate.cjs) successfully with Node.js 22. This is a separate direct-29-symbol cipher family from the previously studied predecessor-excluding **28-symbol** rank register ([earlier rank study](no-repeat-rank-inversion.md)).

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

## Interpretation and decision

An arbitrary independent 29-way substitution on **every** canonical printed word still leaves many original same-symbol-equality constraints unexplained if the plaintext words are GP-encoded English drawn from these references. The negative is stronger in secret-key freedom than a bookwide or pagewide monoalphabetic substitution: there are no key or IV restrictions between words. It also closes a family different from the earlier predecessor-excluding 28-rank results.

The results do **not** exclude: evolving mappings *within* a word, a second keystream/register that changes symbol identity in the interior, homophones/variable-rate plaintext, an alternate language or historical source with different repetition patterns, transformed/false printed boundaries, or text that is not direct GP-encoded natural language. No plaintext, historical encryption operation, original key, or continuation destination was discovered.

**Operational recommendation:** Any attempted original-LP2 word-reset direct-GP substitution now needs a source-motivated in-word state transition, alternative segmentation/register, or explicit evidence against English-like controls. Do not repeat arbitrary static per-word alphabet searches: the entire 29! key space is already factored out by the exact equality invariant.

**Reproduce:** `node sims/lp2_wordwise_bijection_pattern_gate.cjs` (standalone Node.js 22 script, no dependency downloads). Its deterministic 2,000-replicate nulls and four source-native bijective plants passed in [CI run 42918802515](https://github.com/FlareZ123/liber-primus/actions/runs/42918802515) under the **`wordwise-bijection`** input of the preexisting manual [no-repeat-rank workflow](../.github/workflows/no-repeat-rank-inverse.yml). The older three rank scripts are skipped for this dispatch; all former default workflow steps remain accessible under `all`.
