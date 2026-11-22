# Cross-word anti-repetition: exact lossless state/postfilter nonidentifiability

**Director #590, Agent 27, 12 November 2026.** This is a source-native and exact-reversible *model-selection obstruction*. **Neither original LP2 plaintext nor a key was recovered.** Across-word rarity of adjacent repeats is real, but the specified two architecture types cannot be discriminated by printed ciphertext alone unless the postfilter is independently restricted.

## The original, including withheld terminals and page carries

The canonical original LP2 has **12,956 GP29 runes**, **2,896 complete printed words**, **55 rune-bearing physical pages** (physical p50 is table-only), and **32 words carried over a physical page turn**. A word is parsed continuously across line and page wraps; only original word punctuation terminates it. Physical page starts are separately known and excluded from the in-page repeat event count.

Before considering a model, partition the original rune stream into physical p0–39 (training) and p40–55 (withheld terminal test). Count each predecessor pair, including the exact original printed word starts, full prior rune identity, and page-turn carries:

| Original pair class | p0–39: repeats / eligible | p40–55: repeats / eligible |
| --- | ---: | ---: |
| Join between complete printed words, within one page | **17 / 2,141** | **6 / 732** |
| Inside printed words, within one page | **48 / 7,459** | **15 / 2,569** |
| Crossing page cuts | **0 / 39** | **0 / 15** |

Hence **23 / 2,873** within-page word joins repeat, versus **63 / 10,028** in-word predecessor pairs. Each observed repeat retains both GP glyph identities, and every nonrepeat also retains its ordered identities. The counts directly exclude no cipher by themselves. The printed page carries remain one word in both halves; they are not converted into fabricated page-local starts.

## Two lossless rival architectures with exactly the same output

Let \(\mathbb F_{29}\) denote the GP-index field, \(P_i\) a plaintext rune, \(C_i\) the transmitted original-format rune, \(L_i\) the **complete printed word's GP-rune length** containing \(P_i\), and \(s=C_{i-1}\) the immediately preceding ciphertext rune within its physical page. Page-first runes are copied directly to initialize \(s\). Other positions use:

**A. Continuous-state GP29 online cipher.** The source applies the invertible state-dependent map

\[
C_i = (P_i + s + 1)\pmod{29},\qquad
P_i = (C_i-s-1)\pmod{29}.
\]

The previous transmitted symbol \(s\) carries through **every printed word boundary**, including the word before and after a full stop. For any nonpage-leading position, a repeated output \(C_i=s\) occurs if and only if \(P_i=28\), the GP **EA** class in this illustrative model.

**B. Word-reset source plus invertible page-global postfilter.** Each complete printed word, completely independently of its predecessor, produces \(U_i=(P_i+L_i)\pmod{29}\). A second, post-word-composition stage processes the entire physical page continuously as

\[
C_i=(U_i-L_i+s+1)\pmod{29},\qquad
U_i=(C_i-s-1+L_i)\pmod{29}.
\]

The page's first rune uses \(C_i=U_i-L_i\). Both word-local and postfilter operations are bijections, known to a decoder from printed word lengths and previous emitted ciphertext, so the pair is **lossless** without deleted symbols, inaccessible random retries, unknown skip counts, or supplemental side-channel bytes. At a word crossing a page turn, its \(L_i\) is unchanged and the postfilter's page state resets exactly at the source page boundary.

By substitution, **B's emitted \(C_i\) is identically A's** at every rune, for *every possible plaintext*, original word-length layout and page cut. Their inverses likewise return identical rune sequences. This is an explicit pre-2014-implementable pair demonstrating the more general composition theorem: given any reversible continuous-state transducer \(T_s\), a word-local invertible map \(U_w\) and a later filter \(T_s\circ U_w^{-1}\) reproduce its output without changing the observable ciphertext. Therefore, if the supposedly competing mechanisms permit an unrestricted invertible page-global filter, **their likelihood ratio from ciphertext alone equals exactly 1**. No statistic on preceding/following glyph identity, word joins, within-word runs, first/last rune distributions, or the p54→p55 carried word can distinguish them; a held-out sample cannot repair this structural nonidentifiability.

This is a *negative identifiability theorem*, not evidence that this particular transducer was used.

## Original inversion and independent source-native plants

The [single-file CommonJS SFT](../sims/lp2_wordjoin_state_postfilter_equivalence_sft.cjs) reconstructs the original word and page starts, asserts each numerator and denominator in the table, inverts **all 12,956 original GP runes** under A and B, and reconstructs the exact original ciphertext with both forward operations. Their original inverses are byte-for-byte identical and put **EA/28 at precisely all 86 original adjacent-repeat sites**, with no additional EA at eligible non-leader positions. This is mathematically forced by the toy transducer, **not recovered language**. The earlier [fixed-reserved-symbol original gate](../im-results/lp2-reserved-ea-repeat-transport-original-gate.md) already rejects a literal EA marker at these precise source-word positions as native GP English; do not reinterpret this tautological inverse as plaintext.

The SFT also generates **100 independent original-length/word-shape GP-English plants each** from the pinned Shakespeare, Gibran, and Emerson texts. All **300 / 300** have precisely the same 2,896 manuscript word lengths, all 55 physical page starts, and every original cross-page word carry; both rivals emit the same 12,956-runic ciphertext per plant, and each decoder recovers the complete planted source exactly. Independently executing the same test against the connector-returned original sources produced these held-out word-join repeat counts:

| Native-GP plant source | Mean repeated p0–39 joins (min–max) | Mean repeated p40–55 joins (min–max) |
| --- | ---: | ---: |
| Shakespeare | 4.29 (0–11) | 1.36 (0–5) |
| Gibran | 8.22 (1–18) | 2.83 (0–6) |
| Emerson | 6.62 (1–12) | 2.39 (0–7) |
| **Actual original LP2** | **17** | **6** |

The known direct EA escape models thus have a particularly poor fit to the source's word-join repeat pattern under two reference corpora, in agreement with the existing reserved-symbol study. The new structural point is stronger and independent of any marker's English frequency: A and B fail or succeed **together**, because their ciphertexts are exactly equal for every input. This does not exclude a genuinely different postfilter with an authenticated, restricted state law.

## Decision

For Director #590, **a freely invertible page-global postfilter makes continuous cross-word cipher state observationally nonidentifiable**. The original 23 word-join repeats support an across-word *output constraint*, not a location of the state transition in a multi-stage encoder. The specific example maps all repeats to fixed EA and is unsuitable as a direct native-English plaintext decoder; no original text emerges.

Do **not** commission another comparison between arbitrary word-local ciphers plus unrestricted postfilters and continuous-state ciphers using only ciphertext boundary statistics. To make the alternatives distinguishable, an independent clue must constrain the postfilter to a specific operation, expose an intermediate word-reset output, or supply authentic side information and a withheld plaintext prediction. [Exact source-native implementation and positive controls](../sims/lp2_wordjoin_state_postfilter_equivalence_sft.cjs).
