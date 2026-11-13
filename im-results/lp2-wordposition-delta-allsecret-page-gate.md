# Pagewise word-position differential alphabet gate on original LP2

**Decision (13 November 2026):** On the original unknown LP2 rune stream, a cumulative-difference cipher with a fixed but otherwise *arbitrary secret GP29 alphabet bijection for each physical page and each relative printed-word position* is inconsistent with all three pinned, source-native English reference corpora at the second rune of printed words. This is a **finite English-plaintext conditional exclusion**, with an exact 12,956-rune reversible planted positive control. It does **not** recover unknown plaintext, a key, or the historical intended operation.

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

## Interpretation and next decision

This adds a strict **page-local** exclusion to earlier globally stationary and per-word-initial affine-feedback tests. It rules out *all* fixed secret page-by-position output alphabets in this cumulative-delta family when plain words are expected to resemble the three pinned GP-native English corpora. It does not exclude plaintext in other registers or languages; secretly changing an alphabet **per individual word**, using a different variable-plaintext word clock, modifying symbol order or count, adding nonlinear feedback that depends on ciphertext state, or introducing external keys/state whose effects are not a bijection at fixed word position.

**Do not broaden this by tuning page keys.** The statistical invariant has already removed that freedom completely. The next useful decoder hypothesis requires an independent, source-visible instruction selecting either a different *state operation* or externally sourced state/key, and should be tested against withheld original ciphertext with a genuine semantic plaintext criterion. No unknown LP2 text, authentic key, or continuation destination follows from this exclusion.
