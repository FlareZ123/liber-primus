# Original LP2 10/13-dot literal escape: a reversible candidate rejected by native plaintext

**Agent48 · 23 November 2026 · Director [#2366](https://github.com/FlareZ123/liber-primus/issues/2366).** All 56 unknown LP2 pages remain unsolved. This is a bounded **negative original-cipher result**, with neither recovered plaintext nor a creator-selected key.

## Why this was a plausible finite test

The original images contain large ten- and thirteen-dot markers, while the 12,956 GP29 runes on the 55 unknown rune-bearing physical pages (p50 is numeric) contain only **86 within-page adjacent repetitions**. A basic reversible no-repeat encoder can reserve equality with the preceding ciphertext rune as an **escape** representing the otherwise omitted 29th plaintext letter. This report tests exactly one human-executable interpretation: a printed dot count is the **zero-based Gematria Primus index of the literal escape plaintext rune**. Thus a 10-dot mark means GP0 rune10 **I** and a 13-dot mark means GP0 rune13 **P**. The initial p0 red heading inherits13 from its first large mark. The new escape applies *after* the mark until the next mark, with page-local predecessor reset and an identity first rune on each printed physical page.

This is a hypothesis selected *before* checking the repeated-rune positions. The manuscript supplies the graphic dot counts and GP29 ordering, but **does not independently command this rank-28 escape operation**, dictate the initial p0 state, or identify a secret successor permutation. A different dot-to-state rule is outside this result.

## Fully specified inverse

For physical-page-internal position i let c be its GP0 ciphertext rune, q the previous ciphertext rune and e the active mark class (10 or13). First rune of each physical page is copied. Otherwise:

- If c=q, output plaintext p=e.
- If c≠q, let r=c-[c>q] be the rank of c among the 28 symbols other than q in ascending GP0 order. Output p=r+[r≥e].
- To encrypt: if p=e emit c=q; otherwise let r=p-[p>e], emit c=r+[r≥q].

The inverse uses no fitted numeric key and preserves **every** original rune and all 2,896 original printed-word lengths. Its exact 12,956/12,956 reencryption is a correctness invariant shared by all keys of this bijective model, **not evidence of decipherment**. A planted, original-length-matched Cicada-native GP29 text also forwards and inverses perfectly.

## Original-source decisive measurements

| Immutable original measurement | Value |
| --- | ---: |
| GP29 runes / complete printed words / rune-bearing physical pages | **12,956 / 2,896 / 55** |
| Distinct large mark records / 10-dot / 13-dot | **31 / 3 / 28** |
| Adjacent equal ciphertext runes within physical pages | **86**, including **23** at printed-word starts |
| Source positions in 10-dot regime / repeat events | **1,248 / 3** |
| Source positions in 13-dot regime / repeat events | **11,708 / 83** |
| Exact reencryption on all original ciphertext | **12,956 / 12,956** |
| Cipher GP29 index of coincidence | **0.03447840** |
| Literal escape decoded GP29 index of coincidence | **0.03514320** |
| Authentic solved-Cicada GP29 native control IoC | **0.06138673** |

Under the exact grammar, the 1,248 positions in ten-dot state permit **exactly three occurrences of I**, all at existing repeated-ciphertext events. There can be **no I** at any other position. The nine solved original-Cicada GP29 source sections comprise 740 words and 2,979 runes and contain **184 I** (6.1766%) and **41 P** (1.3763%). Consequently the ten-dot count implies 0.2404% I, about 25.7-fold below the creator-authentic native control's I frequency. In the larger thirteen-dot region, the model permits exactly83 P among11,708 positions, or 0.7089%, compared with1.3763% P in that control.

For an independent layout-matched check, construct **1,000** seeded GP29-native books by sampling authentic solved-Cicada words of the *same exact length as each of the 2,896 printed original word slots*. Without allowing any fitted escape map, each sampled original-layout book is compared against the exact required plaintext predicates `(P[i] === activeDotIndex) iff (C[i] === precedingCiphertext[i])`. The original source-event grammar requires **zero mismatches**. The matched authentic-native controls instead have **306–404 violations, mean350.329**. In the ten-dot source region alone, control books have **51–109 I occurrences** while the original escape grammar allows3; even the most favorable control has **51 I on prohibited nonrepeat sites**. The rank-28 inverse's first dozens of original words are nonlinguistic; no coherent new passage appears.

The controls use actual solved Cicada GP29 words, preserving GP29 multi-letter runes and the exact observed original word-length distribution. They are conditional evidence against ordinary creator-native English plaintext, rather than a proof against every possible invented register or lost historical decoder.

## Decision and research fork

**Reject the literal dot-count→GP0 plaintext escape grammar as a direct English explanation of LP2.** Its mandatory I/P counts and positions conflict with author-native source controls; exact original replay does not rescue it. This closes the one frozen [#2366](https://github.com/FlareZ123/liber-primus/issues/2366) interpretation, without claiming to exclude all changing-state exceptions. The other source-visible 10/13-dot meanings remain unspecified; do **not** enumerate arbitrary alternate dot-to-letter assignments in hopes of matching word statistics. A future positive route requires an actual first-party mapping instruction or an independent recovered key/state and a readable long original-body holdout.

**Independent Windows Node.js 22 original-source and planted-native PASS:** [GitHub Actions run 45111710313](https://github.com/FlareZ123/liber-primus/actions/runs/45111710313).\n\n**Reproduce:** [`sims/lp2_dotclass_literal_escape_original_sft.cjs`](../sims/lp2_dotclass_literal_escape_original_sft.cjs), reading the unchanged [LP2 corpus](../resources/liber-primus/lp2-corpus.json), [original-ink mark source](../resources/liber-primus/lp2-ink-annotations.json), [exact printed words](../resources/liber-primus/lp2-transcription.txt) and [authentic solved GP29 control](../resources/external/relikd-solved-gp29-native-v1.json). Run from the repository with Node.js22. This report is source-local supporting evidence; established project-level uncertainties remain at [`results/README.md`](../results/README.md).