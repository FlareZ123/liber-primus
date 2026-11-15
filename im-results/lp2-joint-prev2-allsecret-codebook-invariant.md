# Two-previous-ciphertext GP29 all-secret row-codebook obstruction

**15 November 2026, Agent15.** This is a source-exact, all-secret necessary-condition discriminator. The original manuscript yields no recovered plaintext or authentic key. The result concerns a particular stable nonlinear-codebook mechanism and native-language reference registers.

## Hypothesized complete decoder and exact invariant

A natural extension of the 29-row predecessor rotor is a single fixed substitution alphabet for **each ordered pair of immediately preceding ciphertext runes**. At positions i≥2 within each original physical page, posit C[i] = π_(C[i−2], C[i−1])(P[i]), where all **841** functions π are *independently unknown, arbitrary bijections of the complete 29-rune GP alphabet*. Grant the first two positions of every page arbitrary initialization. This generously includes 841 × 29! independently secret output alphabets. It also covers a ciphertext-first-difference output representation: subtracting C[i−1] is itself a bijection once the two-rune state is fixed.

The original input completely specifies counts n(s,c) for each ordered two-rune predecessor state s and current ciphertext output c. Every secret inverse π_s merely *relabels the 29 columns inside that row*. The following normalized conditional collision measure is therefore exactly unchanged **for every possible secret key**, including wholly nonlinear and unstructured permutation tables:

**I₂ = 29 × [Σ_(s,c) n(s,c)(n(s,c)−1)] / [Σ_s n(s)(n(s)−1)].**

The code uses original ink GP29 rune positions and resets the two-symbol history at physical page starts, matching the proposed model. No word delimiters are changed or cipher symbols deleted. All first two page symbols are free initial conditions.

## Original unchanged LP2 measurement

The 55 rune-bearing unknown pages contain **12,956** rune symbols and **12,846** eligible two-back positions. Across all 29²=841 possible predecessor pairs, **840 states occur**, 836 at least twice. The original has **100,584 unordered pairs of sites sharing a two-symbol predecessor**, of which only **3,511** emit the same current symbol. The exact invariant is **I₂=1.0122782947586098**, extremely near the uniform-GP29 baseline **1**.

This statistic is stronger than an absolute ciphertext IoC: a source-secret codebook permutation *cannot* increase it. For comparison, the model's unconstrained single-output concentration cap is **2,010/12,846 = 15.6469%**, so marginal E frequency alone cannot reject this two-rune context model. The conditional-collision invariant resolves that ambiguity. Its scope is distinct from the earlier [one-rune predecessor frequency bound](lp2-previouscipher-rowperm-allsecret-frequency-gate.md) and [two-back *single rune* C[i−2] test](lp2-two-back-fixed-row-conditional-language-gate.md).

## Source-native original-length controls with secret keys

The reproducible [CommonJS SFT](../sims/lp2_joint_prev2_allsecret_codebook_sft.cjs) loads three independently selected reference registers before looking at source ciphertext: (1) nine published clear-GP29 Cicada passages, **2,979** runes, (2) first 12,956 GP29 runes of frozen Shakespeare text using the repository's historical QU→CW, V→U, K/Q→C, Z→S and greedy rune combinations, and (3) first 12,956 runes of an independently pinned already-GP29-encoded Latin Vulgate reference. The two long registers are split into the **exact 55 original page sizes**. The solved passages retain their nine independent source boundaries.

For each reference, the identical 841-row full-bijection encoder runs under **20 independent preseeded hidden permutations per row**, with 29-symbol Fisher–Yates shuffles for every state. The inverse reconstructs **every planted rune exactly**, including the two free page-initial runes. No key is optimized against the original manuscript. All control values below are the same normalized invariant measured on the *encrypted* native text, with its ciphertext-derived pair states.

| Encrypted source register | Native GP runes | Minimum of 20 secret keys | Median | Maximum |
| --- | ---: | ---: | ---: | ---: |
| Original unknown LP2 (unchanged) | 12,956 | **1.01227829** | same | same |
| Published solved Cicada | 2,979 | **1.72080639** | **1.90284575** | **2.25625680** |
| Shakespeare | 12,956 | **1.83798170** | **1.85931668** | **1.92688455** |
| Latin Vulgate | 12,956 | **2.23433980** | **2.27608391** | **2.33318027** |

Source-native language has frequent GP rune repetition, and the stationary pair-state codebook cannot hide that repetition *within a reused state*. The original output is dramatically flatter. The exact 841-secret-table family therefore has the wrong same-context structure for these realistic native-English and Latin prose registers, even though the original marginal-frequency 15.65% cap alone admits common English-letter frequencies.

## Decision boundary

**Reject the straightforward globally stationary two-ciphertext-predecessor reversible GP29 alphabet decoder as a plausible direct source-native prose solution.** No assumption about a particular secret row's values is made; the invariant is an exact all-key fact. The finite language controls support a strong *conditional* exclusion, not a theorem covering every contrived human-language plaintext.

Remaining mechanisms include tables rekeyed across original pages, words or locations, more than two ciphertext symbols of state, position-varying substitutions, plaintext-dependent key clocks, non-GP plaintext registers, or changed printed segmentation. The original pages do **not** specify this 841-row model as Cicada-authored in the first place. More unconstrained secret-row search under the same model cannot recover a native-language plaintext signal, and is lower priority than obtaining a first-party key/state opcode.

**Reproduction:** Run the [standalone Node.js 22 SFT](../sims/lp2_joint_prev2_allsecret_codebook_sft.cjs) on the repository's original frozen LP2 corpus. It asserts every original count above and all native positive roundtrips, plus the 20-seed ranges.