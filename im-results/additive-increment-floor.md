# Additive-key doublet deficit: a precise conditional lower bound (2026-11-10)

**Evidence class: mathematical derivation + reproducible corpus comparison; no ciphertext decryption.** This clarifies, rather than assumes, when a low frequency of repeated ciphertext runes is evidence against a stream cipher. It is especially relevant to [Agent 11's caveat](../communications/broadcast/2026-11-10T0207Z_agent11_correlated-keystream-caveat.md) that correlation of key increments invalidates the often-stated universal 1/29 collision expectation.

## Exact algebraic result

For additive encryption in Gematria Primus indexing,

\`\`\`text
C_t = (P_t + K_t) mod 29,
ΔC_t = ΔP_t + ΔK_t mod 29.
\`\`\`

Let \`f[d]=Pr(ΔP_t=d)\` for a plaintext source whose **marginal rune-difference distribution is stationary** over the relevant positions. If a key increment \`ΔK_t\` is independent of the *contemporaneous* plaintext difference, then

\`\`\`text
Pr(C_t=C_(t-1))
 = sum_{k=0..28} Pr(ΔK_t=k) * f[-k mod29]
 >= min_d f[d].
\`\`\`

The inequality is a convex-mixture bound. It **requires no uniformity**, no independent keystream increments across time, no fixed key increment and no linear-congruential generator assumption. A key with a completely deterministic but time-varying increment sequence still obeys it under the specified stationary and independent plaintext marginal. However, a key intentionally coupled to the plaintext, an unusual source with low minima, or nonstationary plaintext difference laws can defeat the bound.

The common **1/29** assertion is valid only under additional conditions, e.g. a uniform independent increment for each position. This more general floor is source-dependent.

## Empirical reference, with register limitations

Encode \`resources/control/shakespeare_first300k.txt\` into canonical 29-rune GP indices using the repository transliteration labels, greedy two-character GP runes and normalized \`QU→CW,V→U,K→C,Z→S\`. This yields **218,800** runes and **218,799** adjacent GP-rune differences, including transitions between words.

Full-reference difference distribution:
- Smallest of 29 rune-difference probabilities is \`f[18]=3,706/218,799 = 1.693792%\`.
- If the key-increment generator is allowed to use *different strategies at within-word and between-word boundaries*, the separate lower bounds are **within word: 1,610/163,393 = 0.985354%** (difference 18), and **between words: 996/55,406 = 1.797639%** (difference 7).
- Four nonoverlapping quarter-corpus reference minima were 1.538–1.765% globally, 0.952–1.005% within words, and 1.545–1.791% between words. This is a sensitivity check, not a model of all possible English registers.

The **direct plaintext** segments 2, 4 and 6 of the small, solved LP1 provide an additional important counterweight: their 1,001 runes have just 1,000 differences. Their empirical overall minimum is **7/1,000 = 0.700%**, with within-word minimum **4/771 = 0.519%**. This small text demonstrates that no deterministic universal floor >0.66% follows for every finite English manuscript; the Shakespeare-conditioned expectation cannot be promoted to a statement about unknown LP2 plaintext merely by naming it 'English'.

## LP2 measurement and conditional consequence

Use \`resources/transcriptions/liber_primus_master.txt\` with proper physical-page continuity across the unsolved 56-page LP2 scope, ignoring physical line and page delimiters and splitting only whole rune-words. This yields 2,896 whole rune-words and 12,956 runes.

| Adjacency class | Observed LP2 doublets | GP-Shakespeare empirical collision floor | Predicted minimum count using LP2 pair totals |
|---|---:|---:|---:|
| Within a whole word | 63 / 10,060 = **0.6262%** | 0.9854% | 99.13 |
| Across a whole-word boundary | 23 / 2,895 = **0.7945%** | 1.7976% | 52.04 |
| Combined | 86 / 12,955 = **0.6638%** | 1.6938% if one stationary difference law | 219.43 |
| Boundary-aware policy | same 86 | separate distributions and key-increment policies | **151.17** |

The two alternative predictions are **expectations under distinct assumptions**. The combined 219.43 count assumes a single marginal difference law across all LP2 pair positions and independence of key increments from their contemporaneous plaintext differences. The boundary-aware 151.17 count permits *different increment policies between/within words* but assumes the displayed boundaries are plaintext word boundaries and the relevant GP-English marginal difference distributions are stationary within each class.

For perspective, a simplistic binomial reference with p=1.6938% would place at most 86 occurrences in 12,955 trials at probability about 3.8e−25, but such a p-value is **not an inferential claim here**: natural-language rune differences are dependent and the true LP2 plaintext register is unknown. Any valid significance assessment must simulate whole plaintext words/texts and a prespecified key model rather than extrapolate this binomial approximation.

**Conditional inference:** Under an English-like stationary source close to the sampled Shakespeare rune-difference distribution, the 86 observed repeat sites are difficult to reconcile with *any* plaintext-independent additive mod-29 keystream, even one with arbitrary stationary or nonstationary correlation among its increments, without a collision-repair mechanism or some change to the source model. The low count is compatible with deliberately avoiding repeated ciphertext runes, changing the plaintext, or a dependent/nonadditive transformation. It does not identify which mechanism actually produced LP2.

## Exact reproducibility check

The script \`sims/additive_increment_lower_bound.cjs\` computes 29 reference difference bins and 29 LP2 bins, both boundary classes, cross-corpus quarters and the direct plaintext LP1 comparison. It then adds all **29 deterministic linear counter keystreams \`K_t=d*t\`** to the reference English runes and checks an exact algebraic identity: the resulting doublet count equals the plaintext delta histogram at \`−d mod29\` for every d. The best counter still has **3,706 / 218,799** reference-text collisions; the worst has 13,642. This is an arithmetic identity check, not a synthetic planted-language test and not evidence that LP2 uses a counter.

[Successful manually dispatched GitHub Actions run 42745130453](https://github.com/FlareZ123/liber-primus/actions/runs/42745130453), with opt-in workflow \`.github/workflows/additive-collision-floor.yml\`.

This result sharpens a general cipher-mechanism boundary but does not establish a new plaintext or recovered key. Preserve its assumptions prominently if reusing it in an architectural synthesis.
