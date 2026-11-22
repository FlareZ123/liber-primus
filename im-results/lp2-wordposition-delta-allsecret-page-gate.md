# Pagewise word-position differential alphabet gate on original LP2

**Decision (13 November 2026):** Three independent original-input, key-independent entropy/frequency invariants sharply exclude cumulative-difference ciphers with otherwise *arbitrary secret GP29 substitutions* controlled by several natural source-visible clocks, including page, printed word position, word length, and a **book-wide predecessor-ciphertext-dependent word-position map**. The stronger conditional-entropy test grants a distinct secret alphabet for each **word-start page × current-glyph page × word length × relative position** state. All three pinned source-native English controls lie substantially below the original ciphertext. These are **finite English-register conditional exclusions**, each with a complete 12,956-rune reversible positive control. No unknown plaintext, historical key, or intended mechanism is recovered.

## A distinct, generous proposed inverse

Consider a cipher that retains the original printed word lengths, and that uses the preceding ciphertext rune as its state. Each printed word w begins with a page-dependent arbitrary secret bijection g:

\`C[w,0] = g_page(P[w,0])\`.

At each following position j≥1, suppose it updates by:

\`C[w,j] = C[w,j−1] + h_page,j(P[w,j]) mod 29\`.

Here **every g and every h_page,j may be a different completely unknown one-to-one permutation of the 29 Gematria Primus symbols**. Unlike an ordinary cumulative-sum cipher, the hypothesis does not reuse any alphabet between distinct physical pages or between different positions within words. It therefore permits the key schedule to change at visible page/word boundaries without having to guess any key values or phases.

For all words on the same physical page having a second rune, the differences \`D[w,1] = (C[w,1]−C[w,0]) mod29\` must be a single secretly permuted copy of the plaintext second-rune frequency distribution. **Sorting the 29 frequencies removes the entire unknown page-specific alphabet**. This is an exact invariant for every reversible h_page,1; it cannot be rescued by tuning a secret shift or nonlinear substitution. No pooling across pages is valid when each page can use a different alphabet. Words whose first two runes straddle a physical-page boundary are excluded from the independent-page calculation.

The upstream physical cues are the author-visible printed word/page boundaries and the documented absence of adjacent repeated runes. This mechanism is only a *plausible hypothesis*. Neither the original page images nor an authenticated Cicada message specifies it.

## Original input and controls

- Unmodified \`resources/liber-primus/lp2-corpus.json\` and \`resources/liber-primus/lp2-transcription.txt\`: 55 rune-bearing unknown pages, 12,956 ciphertext runes, 2,896 printed words. Of 2,813 words having at least two runes, seven straddle a physical-page boundary between the first two runes; **2,806** positions enter the page-local invariant.
- The fixed English controls are \`resources/control/shakespeare_first300k.txt\`, \`gibran_prophet_58585.txt\`, and \`emerson_essays_2944.txt\`. The existing source-validated \`encodeSourceNativeGP\` retains the solved LP1 single-rune spellings of ING and IO.
- For each physical page and each original word length, reference English words are sampled from the matching length pool. The expected second-rune GP29 distribution uses those same original page-by-length counts. A deterministic xorshift32 generator seeded \`0x33015635 + corpusIndex\` draws **500 full source-native, original-word-length-matched controls per corpus**.
- Define \`TV = (1/2) Σ_k |sorted(observed_deltas)[k]/N − sorted(expected_GP_second_runes)[k]/N|\`. Average these distances across individual physical pages, weighted by the number of eligible second-rune positions on each page. Every secret page-wise alphabet bijection preserves this distance exactly.

## Completed original-cipher test

| Pinned control | Original page-weighted sorted TV | Minimum / median / maximum among 500 controls | Complete GP-native cipher plant |
| --- | ---: | ---: | ---: |
| Shakespeare | **0.30203977** | 0.11140021 / 0.12039171 / 0.13265651 | 0.11839098 |
| Gibran | **0.28818585** | 0.10863957 / 0.12102879 / 0.13371946 | 0.12582573 |
| Emerson | **0.27580418** | 0.11177257 / 0.12430019 / 0.13632297 | 0.12031492 |

Each observed original distance is above every one of its 500 matched-control distances. This is an empirical finite-reference rejection of that exact architecture, not a universal probability bound on English or a model-free proof that the real plaintext is not English.

The positive plant samples all **2,896** original-length English GP words, encrypts them using a different page/position affine bijection, and inverts **all 12,956 of 12,956 symbols exactly**, including positions in words carried over printed page boundaries. Its page-local invariant falls inside the English controls. For this plant, \`g_page(x)=11x+5page+3 (mod29)\` and \`h_page,j(x)=17x+3page+7j (mod29)\`. The known inverses of 11 and 17 modulo29 are 8 and 12. This validates the positive decoder and shows that the original mismatch is not caused by the proposed cipher inherently destroying second-position letter frequencies.

**Passing source-original CI:** [Actions run 43517475735](https://github.com/FlareZ123/liber-primus/actions/runs/43517475735), manual-only workflow \`.github/workflows/agent6-original-source-gates.yml\` with \`route=position\`. Reproducer [\`sims/lp2_wordposition_delta_allsecret_source_gate_sft.cjs\`](../sims/lp2_wordposition_delta_allsecret_source_gate_sft.cjs). The manual workflow leaves existing routes unchanged and never runs on commits.

## Stronger all-secret word-length-conditioned cumulative inverse

The previous pagewise second-rune test **does not cover** ciphers whose secret differential alphabet changes with the complete printed word length. In an independently motivated, more permissive model the author can choose a separate key at every physically visible **(word-start page, current rune's physical page, word length, relative within-word position)** tuple. Including both page selectors handles every actual crossed-page word. For each such key/state s, let \`h_s\` be **any unknown bijection of all 29 GP runes**. Encryption follows the same cumulative update \`D[w,j] = C[w,j]−C[w,j−1] = h_s(P[w,j]) mod29\`, so the exact state-conditional Shannon entropy is invariant:

\`H(D | s) = H(P | s)\`.

The key is fully abstract, with no assumed affine form and no period, and the model permits **2,576 distinct unguessed secret alphabets** across all original word-layout states. The original 2,896 words produce **10,060** consecutive *within-word* rune differences. Native-English controls draw 500 complete exact-original-word-length samples per corpus under the same 2,576 source-visible state partitions, and the entropy statistic averages all original state histograms weighted by their number of runes.

| GP-native reference | Original \`H(D|s)\` (bits) | 500 matched control minima / medians / maxima (bits) | Source-native encrypted plant \`H(D|s)\` (bits) |
| --- | ---: | ---: | ---: |
| Shakespeare | **2.23070477** | 1.84434559 / 1.87606137 / 1.90653460 | 1.88423128 |
| Gibran | **2.23070477** | 1.83191060 / 1.86807273 / 1.90455479 | 1.85133856 |
| Emerson | **2.23070477** | 1.88108717 / 1.90779605 / 1.93187729 | 1.90747220 |

Even granting all 2,576 independently unknown GP29 permutations, the original invariant is at least **0.29882748 bits per consumed rune** higher than the maximum of the 1,500 tested source-native controls. This obstruction also applies to **arbitrary deterministic non-injective** 29→29 state maps: for any function `h_s`, `H(h_s(P)|s) ≤ H(P|s)` by the Shannon data-processing inequality, whereas the original ciphertext's entropy is larger. Permuting inputs or permitting collisions cannot rescue a fixed state-only cipher. An additional variable or hidden state carrying at least **0.29882748 bits/consumed rune** of conditional entropy relative to the largest tested source reference is necessary for a deterministic hidden-state extension, under this register/word-boundary model. Every candidate within that architecture shares this exact invariant; the result cannot be improved by searching secret bijection keys. The 12,956-rune independent synthetic cipher uses a fixed invertible scale 17 and a distinct state-dependent additive pad; its exact inverse restores **12,956/12,956 native GP runes**, and its invariant equals its pre-encryption plaintext exactly.

**Passing [manual CI 43518561426](https://github.com/FlareZ123/liber-primus/actions/runs/43518561426)**; reproducible [\`sims/lp2_wordshape_delta_allsecret_entropy_sft.cjs\`](../sims/lp2_wordshape_delta_allsecret_entropy_sft.cjs), \`route=shape\` in the same manual-only workflow. The original test remains independently reproducible via \`route=position\`.

This is a distinct **ciphertext-feedback** result from the older word-shape entropy obstruction, which was limited to direct fixed symbol maps/within-word permutations of the original rune output. It excludes the cumulative-difference inverse even if each word length has its own hidden page-specific alphabet at *each* position. It still does not cover an alphabet that changes per individual word or a hidden state depending on preceding plaintext/ciphertext values.

## Predecessor-ciphertext-conditioned secret maps: exact source-clock boundary

A separate model permits **nonlinear, predecessor-ciphertext-dependent hidden substitution tables**, beyond the fixed page/word-length maps above. In each printed word, let the first rune be arbitrary and for all later relative positions j choose an entirely unknown deterministic GP29 map \`h_(j,Cprev)\` based on the *previous ciphertext rune* and j. The update is \`D[w,j] = C[w,j]−C[w,j−1] = h_(j,C[w,j−1])(P[w,j]) mod29\`. This permits 308 actually occupied \`(j,Cprev)\` states (up to 13×29 possible) and arbitrary noninjective table entries.

Conditional entropy supplies a **one-sided universal obstruction** even when the predecessor state correlates with unknown plaintext:

\`H(D | j,Cprev) ≤ H(P | j,Cprev) ≤ H(P | j)\`.

The first inequality is deterministic data processing, and the second is the entropy conditioning inequality. Thus a source-native English candidate must have at least as much GP29 **plaintext** \`H(P|relative position)\` as the original **ciphertext** \`H(D|relative position, previous ciphertext)\`. There is no inference, guess or fit of the hidden maps in the test.

All **10,060** within-word steps of original unknown LP2 yield **4.286987497 bits/rune** on the left. The pinned original-word-length source-native controls give:

| English reference | Original \`H(D|j,Cprev)\` | Minimum / median / maximum over 500 \`H(P|j)\` samples |
| --- | ---: | ---: |
| Shakespeare | **4.28698750** | 3.83925787 / 3.87185713 / 3.90981284 |
| Gibran | **4.28698750** | 3.85280284 / 3.89049737 / 3.92297429 |
| Emerson | **4.28698750** | 3.90876929 / 3.94863564 / 3.97978078 |

The original exceeds *all 1,500* exact-length-matched source controls; the most generous margin is **0.30720672 bits/rune**. A complete positive native GP English plant encrypts with a different affine bijection for each observed \`(j,Cprev)\`, inverts **all 12,956/12,956** original-layout runes exactly, and satisfies the theorem strictly (its \`H(D|j,Cprev)\` is 2.92221 / 2.77911 / 3.03561 versus native \`H(P|j)\` 3.89333 / 3.89841 / 3.95604). [Passing manual CI 43519644698](https://github.com/FlareZ123/liber-primus/actions/runs/43519644698) and [original-only SFT](../sims/lp2_predecessor_wordposition_entropy_sft.cjs) via \`route=predecessor\`.

**Important non-exclusion.** Extending the unknown map to also depend on **full word length**, the original conditional output entropy drops to **2.84369888** across 1,689 observed states, below all 500 native control entropies for each source (source minima 3.35982 / 3.36303 / 3.49658). Making the key depend instead on one of **nine original visual chapters** yields **2.63479273** across 1,942 observed states, again below all source minima (3.71722 / 3.71874 / 3.77865). These lower original entropies mean the necessary inequality **holds** for the tested control registers; such enriched stateful models are *not excluded* by this test. They are not verified decoders and have no recovered plaintext.

This identifies a concrete decision boundary: page/length/position-only *deterministic* difference maps fail (previous section), as do book-wide \`(previous ciphertext, word position)\` maps, while \`(previous ciphertext, word position, word length)\` and \`(previous ciphertext, word position, visual chapter)\` models remain mathematically possible. Their secret-key or state-update rule is entirely missing. Independently source-selected operations would be required before testing a specific consumer.

## Interpretation and next decision

These two complementary tests add **page-local and word-length-conditioned** fixed-state exclusions to earlier globally stationary and per-word-initial affine-feedback tests. It rules out *all* fixed secret page-by-position output alphabets in this cumulative-delta family when plain words are expected to resemble the three pinned GP-native English corpora. It does not exclude plaintext in other registers or languages; secretly changing an alphabet **per individual word**, using a different variable-plaintext word clock, modifying symbol order or count, adding nonlinear feedback that depends on ciphertext state, or introducing external keys/state whose effects are not a bijection at fixed word position.

**Do not broaden this by tuning page keys.** The statistical invariant has already removed that freedom completely. The next useful decoder hypothesis requires an independent, source-visible instruction selecting either a different *state operation* or externally sourced state/key, and should be tested against withheld original ciphertext with a genuine semantic plaintext criterion. No unknown LP2 text, authentic key, or continuation destination follows from this exclusion.
