# Original LP2: five-step feedback reset and independently keyed word-local additive models

**14–16 November 2026; Agent 15's chapter/page/shared-word gate (#887), Agent 23's independently keyed complete-word original-cipher gate, and Agent13's arbitrary-IV exact extension.** These are finite, native-GP-English exclusions of explicit additive five-step models. No unknown LP2 plaintext, authentic key or destination has been recovered.

## Source premise, candidate rule and unfitted invariant

The 2014 original pp0–55 contain **12,956 rune indices** across **55 rune-bearing pages**, **2,896 complete printed words**, and **nine source-visible illustrated top-level chapters** of lengths `[729,1145,1729,1903,1021,1433,1680,3008,308]`. Independent original-cipher research found **104 within-word five-apart equal-rune events** among 2,105 eligible positions and a conditional enrichment of five-apart echoes at printed word boundaries. That is a reason to consider a five-step state, but the author has supplied **no** instruction selecting the following model.

Freeze exactly one hypothetical ciphertext-feedback additive generator: within every segment chosen by the reset scope, for local `t≥5`,

```text
C[t] = (P[t] + K[segment,t mod 5] + C[t-5]) mod 29
```

The first five ciphertext runes of each segment are unconstrained initialization symbols. Every `K[segment,phase]` is a completely **unknown** GP29 constant. For all eligible sites, the observable delta `D[t]=(C[t]-C[t-5]) mod29` is just `P[t]` plus its class's constant rotation. This preserves the **exact pairwise equal-rune counts within every (segment, five-phase) class for every choice of all secret keys**, irrespective of the numbers' values. The model is bijective given a key and the initial five plaintext symbols; no collision-repair parameter, fitted prime phase, implicit F mask or guessed plaintext occurs.

For chapter- and page-reset candidates, grant **separate unrestricted five-symbol keys for every segment**. For word reset distinguish (i) one shared five-phase key reused on all words and (ii) separate completely secret five-phase key for each word. These are different key-equality assumptions.

## Full original and source-native positive comparison

The standalone [source-locked CommonJS test](../sims/lp2_lag5_cipher_feedback_reset_invariant_sft.cjs) asserts the complete original GP indices and all 2,896 words in their exact order, including every joined page carry. It encrypts **16 disjoint Shakespeare GP29 English windows**, each exactly 12,956 source-native rune indices, with deterministic prime-valued five-key plants `[2,3,5,7,11]`. These are positive checks, **not** trial keys for original LP2. The established source-calibrated encoder preserves the GP `ING`/`IO` orthography known from solved LP1. All planted ciphertexts re-decrypt exactly; every key-invariant class collision count exactly matches the original control plaintext count.

| State-reset/key model | Original eligible deltas | Comparable class pairs | Original GP29 class IoC | Minimum of 16 independently sourced English-plant IoCs |
| --- | ---: | ---: | ---: | ---: |
| **Nine illustrated chapters**, separate unknown 5-key per chapter | 12,911 | 2,332,072 | **0.034420035** | **0.058304375** |
| **55 physical pages**, separate unknown 5-key per page | 12,681 | 302,016 | **0.034438573** | **0.058953830** |
| **2,896 printed words**, one five-key shared across all words | 2,105 | 634,908 | **0.034362459** | **0.057017710** |
| **2,896 printed words**, independently unknown five-key per word | 2,105 | **92** | **0.065217391** | **0.021739130** |

All three sufficiently constrained original variants are essentially at the random GP29 baseline `1/29≈0.03448` and below every native-language control by a large gap. Their true synthetically generated controls remain recognizably nonuniform. Thus **no choice of any of their secret five-phase offsets can make their full original class distributions GP-native-English-like**. This is a necessary-condition rejection of the tested direct ciphertext-feedback mechanism for chapter/page resets and a common-key word reset, not an extrapolation to a different cipher.

The **independently keyed word-reset case is not excluded by this particular pairwise statistic**: only 92 comparable within-word five-phase pairs survive, with 6 equal pairs. Worse, 10,851/12,956 original rune sites fall in the first five positions of their respective words and are unconstrained IV sites in this model. Recovering their plaintext would demand genuinely source-selected per-word initialization and keys, not another fitted phase search. The control row spans a very broad expected range (0.0217–0.1087), so its single original IoC is not evidence for a word-reset mechanism.

## Independently keyed five-back zero-IV feedback: new exact difference-vector gate

**Prior-art boundary:** a previous [109-word all-secret period-five affine exclusion](../sims/lp2_wordlocal_fivephase_allsecret_sft.cjs), subsequently strengthened by an [authentic F-skip and exact 244-rune repair budget](lp2_word5_affine_allsecret_gate.md), already rejected the **direct additive** case, including arbitrary independent slopes and five word-specific shifts. The distinct decision here is whether adding the *previous ciphertext rune five positions back* with a zero first-block predecessor changes that result. The direct model is included only as a matched algebraic control and should not be counted as an independent new discovery.


The previous pairwise-IoC test deliberately left an entire five-symbol starting block **unconstrained** at each printed word. Two tighter, fully defined and individually reversible hypotheses are now tested without guessing even one key: the direct word-reset additive cipher
`C[w,j] = P[w,j] + K[w,j mod 5] (mod 29)`, and a five-back feedback cipher with the **same five secret word-specific keys** at all positions and a zero predecessor on the first five runes,
`C[w,j] = P[w,j] + K[w,j mod 5] + (j>=5 ? C[w,j-5] : 0) (mod 29)`.
Each of the 2,896 printed words receives **five entirely independent unknown shifts**, so no key is shared between two words, chapters or pages.

Define `D=C` for the direct model. For feedback, `D[w,j]=C[w,j]` at `j<5` and `D[w,j]=C[w,j]-C[w,j-5]` at `j>=5`. Both models necessarily satisfy the identical **key-independent original-to-plaintext constraint**
`D[w,j+5]-D[w,j] = P[w,j+5]-P[w,j] (mod 29)` for all within-word eligible positions. This is stronger than the earlier collision rate: it fixes the *actual sequence of differences*, granting every word its own secret five-symbol key.

The standalone [all-secret complete-word SFT](../sims/lp2_wordlocal_fivephase_allkey_lexicon_sft.cjs) checks the untouched **12,956 original runes in 2,896 joined printed words** against the unchanged GP29 corpus. Its **29,157-word** English lexicon is the pinned TextBlob frequency source, converted to native Gematria Primus (including the solved-page `ING→NG` and `IO→IA` single-rune orthography). Each source word of length at least six is compared with *every* dictionary token of the same GP-rune length using its exact difference-vector fingerprint. The dictionary includes uncommon proper names and technical vocabulary and is deliberately generous; it remains a **finite English register**, not every possible constructed word or every historical language.

| Original GP-rune word length | Words | Direct compatible with any native-English word | Zero-IV feedback compatible |
| --- | ---: | ---: | ---: |
| 6 | 256 | 256 | 256 |
| 7 | 216 | 207 | 205 |
| 8 | 156 | 24 | 22 |
| 9 | 78 | 1 | 1 |
| 10 | 52 | **0** | **0** |
| 11 | 32 | **0** | **0** |
| 12 | 18 | **0** | **0** |
| 13 | 4 | **0** | **0** |
| 14 | 3 | **0** | **0** |
| **Total 6–14** | **815** | **488** | **484** |

Thus **all 109 unchanged original words of GP length 10–14 contradict both complete five-phase additive models**, independently extending the prior direct-key result to the specific zero-state five-back feedback cipher under the entire native-English lexicon, for **every choice of all 14,480 unknown word-specific additive shifts**. Of these, **73 source words contain no literal ᚠ (F)**. Under the authenticated solved-page *plaintext-F-transparent* rule, a plaintext F must appear as ciphertext F and must not advance the key clock; none of those 73 words can contain a hidden F or an F-related clock interruption. Their difference-vector contradictions therefore survive the **literal-F-transparent variant** of either defined additive scheme. One such 10+-rune F-free word suffices as a finite-lexicon contradiction. The script separately encrypts a full **2,896-word native-English plant** preserving all original word lengths with an independently selected five-shift key for *every* word, under each mode; it recovers the exact plaintext and all **815/815** eligible planted dictionary fingerprints in both models. The syntax, original-source assertions and both positives passed the [isolated manual GitHub Actions run 43649315130](https://github.com/FlareZ123/liber-primus/actions/runs/43649315130).

**Decision:** retire any **exact five-phase additive key reused at offsets j and j+5 within each printed word**, including the independently keyed direct model and the specified zero-state five-back feedback variant, **even with source-authenticated literal-F-transparent key-clock skips on 73 F-free long words**, as an English decoder under intact word boundaries. The earlier zero-IV test alone could not exclude a five-back feedback cipher with **five arbitrary, unshared first-block initialization runes**, as in Agent15's model. The separate exact length-12–14 original-word test below now excludes this *additive* arbitrary-IV branch under the native-English register. Arbitrary per-word substitution permutations, changing clocks, nonlinear key states, different languages and transformed word boundaries remain separate families. A planted inverse establishes correct implementation, while the original provides **no recovered plaintext or key**.


## Arbitrary first-five-IV completion: exact original long-word certificate (16 November, Agent13)

This closes the narrower *independently word-keyed GP29 additive five-back* variant previously left unresolved by the chapter/page collision and zero-IV screens. Every original printed word may choose its own five completely free shifts K[0..4] and its own five arbitrary starting ciphertext positions C[0..4]. For j>=5, the proposed encoding is:

~~~text
C[j] = (P[j] + K[j mod 5] + C[j-5]) mod 29
~~~

For any secret shifts and any initial values, two successive same-phase steps cancel both unknown quantities, giving a **necessary exact plaintext equation** at every j>=10:

~~~text
(C[j] - 2*C[j-5] + C[j-10]) mod29 = (P[j] - P[j-5]) mod29.
~~~

This uses no guessed key, fitted shift, source word choice or plaintext score. Original inputs are the 2,896 complete printed words and 12,956 GP runes from the existing page-carry-aware transcription, with the unchanged 29,157-term TextBlob word-frequency lexicon and independently solved LP1/p57-calibrated English→GP spelling. The [standalone full-corpus CommonJS SFT](../sims/lp2_wordlocal_fiveback_arbitrary_iv_exact_sft.cjs) asserts every original scope and tests all eligible words. It is a **finite English-register exclusion**; unsupported English spellings, another language and changed word divisions remain possibilities.

| Original rune word length | Original count | At least one native-English exact signature match | No match | No match and no ciphertext F |
|---|---:|---:|---:|---:|
| 11 | 32 | 32 | 0 | 0 |
| 12 | 18 | 11 | 7 | 7 |
| 13 | 4 | 0 | 4 | 2 |
| 14 | 3 | 0 | 3 | 1 |
| **11–14** | **57** | **43** | **14** | **10** |

The shortest original-word counterexample is physical p22 rune offset35 (global original offset5410), 12 GP runes with invariant (28,24); no same-length native-lexicon word matches. The longer **F-free** p13:211 length14 word has signature (9,1,9,0), with no exact matching native word. All 14 rejected words, their physical locations, GP runes and signatures are printed by the SFT. In the fixed 29,157-entry dictionary, the 29^(L−10) possible signatures have distinct native coverages 29/29 at length11, 408/841 at length12, 346/24,389 at length13 and 151/707,281 at length14. Thus trivial length11 compatibility is expected, and the sparse longer-word incompatibilities are discriminatory. Ten rejected original ciphertext words contain no F at all; the authenticated plaintext-F passthrough from solved pages could not hide an additional F within them under this length-preserving mechanism.

**Positive controls:** the SFT encrypts, decodes and signature-matches one independent native English word for every original eligible length-11–14 slot, **57/57 exact**, using nonzero independent five-phase shifts and five arbitrary first-block offsets. Hence the original failures reflect incompatibility with the proposed model and finite native lexicon rather than an invalid inverse. The resulting classification is: the *additive* independent-word five-back with arbitrary first-five ciphertext initialization is ruled out for ordinary native-English plaintext at intact original word breaks. The much broader **five independent arbitrary nonlinear alphabets per word**, source changes and altered segmentation are untouched; no unknown plaintext/key is recovered.

## Research fork

The chapter/page five-back feedback models both fail their original key-independent plaintext invariants, so they **cannot distinguish the manuscript's real reset scope**. The direct complete-word additive exclusion was established previously; the zero-IV five-back feedback extension now also fails on every length-10+ original word under the same native-English lexicon. The independently word-keyed **additive** arbitrary-IV model now also fails 14 original long words against the fixed native-English lexicon, including 10 F-free words. Word-specific nonlinear/permutation alphabets, other language registers, and changed segmentation remain open. The source-boundary clue remains available for a different, genuinely selected nonlinear/stateful cipher. Do **not** add undocumented collision repair, varying lag, secret per-symbol pads or alphabet remaps to salvage this model without independent original instructions. The test does not cover another language, compressed plaintext, further encryption layers or a different state update.

The single-file test ran successfully on **Windows/Node.js 22** against the current canonical original corpus: [verified Actions run 43603927151](https://github.com/FlareZ123/liber-primus/actions/runs/43603927151), source commit [fac0ff8](https://github.com/FlareZ123/liber-primus/commit/fac0ff8bb801afb6e0867545557cbe53751fc093). It returns the complete pair counts, 16 independent control minimums and all positive inverse assertions. **No unknown original LP2 plaintext, creator key or destination was recovered.**
