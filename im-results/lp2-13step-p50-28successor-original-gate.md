# Reversible predecessor-difference transport: all-29 marker exclusion and original p50/13 gate

**17 November 2026, Agent 2. Two nested original-input findings, one mathematical construction and two bounded English-original negatives. No recovered unknown-page plaintext, authenticated key, or historical opcode.** [One frozen p50/13 inverse](../sims/lp2_13step_p50_28successor_original_sft.cjs) · [All-29 marker source-window gate](../sims/lp2_all29_fixed_plain_delta_marker_original_sft.cjs).

## Exact hypothesis and unique inverse

The 12,956 unknown LP2 rune symbols have only 86 same-page adjacent equalities among 12,901 pairs; a page-27 12-rune word has disjoint repeated pairs at positions 4–5 and 10–11. That word excludes the earlier strict no-repeat plus one-null-per-word R3. A 29-symbol plaintext alphabet can nevertheless be mapped bijectively into a 29-symbol ciphertext alphabet at each step while favoring 28 non-repeating successors: designate **one rare predecessor-dependent plaintext transition** to emit the zero difference. Every other plaintext transition emits one of 28 nonzero differences. No hidden deletion, extra glyph, or side channel is required. This is a real invertible construction; its ability to reproduce an arbitrary ciphertext alone proves no historical relevance.

The original thirteen-dot marks supply a weak motivation to test the fixed step \(s=13\) in GP ordinal arithmetic. The printed 32×8 p50 table supplies a separate, unauthenticated row-major **base60** interpretation of 256 numeric bytes \(b_0,\ldots,b_{255}\). Freeze the first receiving rune as p51's first rune immediately after the table and continue across p51–55 without resets or extra punctuation clocks. Let all rune ordinals belong to \(\mathbb Z/29\mathbb Z\):

- \(C_0=(P_0+b_0)\bmod29\).
- For each \(i>0\), let \(z_i=(P_i-P_{i-1}-13)\bmod29\).
- If \(z_i=0\), emit \(\Delta_i=0\); otherwise emit \(\Delta_i=1+((z_i-1+b_{i\bmod256})\bmod28)\).
- \(C_i=(C_{i-1}+\Delta_i)\bmod29\).

The inverse obtains \(\Delta_i=(C_i-C_{i-1})\bmod29\). It recovers \(z_i=0\) when \(\Delta_i=0\), otherwise \(z_i=1+((\Delta_i-1-b_{i\bmod256})\bmod28)\), then \(P_i=(P_{i-1}+13+z_i)\bmod29\). The first plaintext is \(P_0=(C_0-b_0)\bmod29\).

This is a full per-position bijection for every previous plaintext rune and every table byte: the zero residue maps to zero, while the 28 nonzero residues undergo a cyclic permutation. It is length-preserving, causal and explicitly invertible even at the actual double-doublet p27 witness. At any repeated ciphertext rune, the proposed plaintext must contain a successive GP ordinal difference of exactly 13. The first-party material does **not** establish that these 13-dot marks specify such a predecessor-dependent marker, nor that p50 should control a 28-ary rotor.

## Locked original-input test

The supplied code reads unchanged canonical GP29 indices, the p50 byte table, printed word boundaries, and the pre-existing independent TextBlob English-to-GP lexicon. The following results are from the exact implementation on the original-source values:

| Check | Observation |
| --- | --- |
| Original p27 witness | GP indices **12,4,9,15,3,3,5,24,18,26,18,18**; doublet second-rune offsets **5 and 11**. Both decode and re-encrypt without deletion |
| Original contiguous p51–55 receiver | **842 runes**, **184 printed words** |
| Decoded p51–55 GP29 index of coincidence | **0.03444604**, with original ciphertext IoC **0.03409864** |
| Decoded complete words found in frozen 29,058-word lexicon | **10/184**; these include short accidental entries, and the output is overwhelmingly nonlinguistic |
| Authentic solved p56 plaintext | **85/85** synthetic cipher inversion (implementation positive only) |
| Clear original p57 | **95/95** synthetic cipher inversion; **16/20** source-printed words in same lexicon before ciphering |
| p27 entire word under the required 13-step equality-marker pattern | **0** matching 12-rune words in the pre-existing 29,058-word lexicon |

The p27 dictionary screen is a necessary word-shape condition only under the **13-step** proposed rule, intact printed word lengths, ordinary GP29 English spelling and the chosen dictionary. It cannot logically exclude proper names, unattested English words or another plaintext language. The p51–55 original output's weak word support and flat unigram distribution are independent reasons to reject this **specific source-keyed direct decoder** as an original-LP2 plaintext recovery.

The source table's radix remains disputed between byte interpretations; a different 28-way key stream, marker function, reset, serialization or language is outside this frozen test. Exhaustively rotating keys to fit native prose would weaken the original clue and create arbitrary alternatives.

## All-29 fixed-predecessor-difference constraint: zero original source survivors

The special step need not be 13. Let **k be any one of the 29 GP ordinal differences** and grant the cipher every conceivable unknown, nonstationary, keyed bijection on the other 28 possible plaintext differences. If each ciphertext repeated pair occurs exactly when the plaintext GP difference equals the one fixed k, the cipher's **entire key-independent invariant** is

\[
\sum_{\text{same-page }i}\mathbf{1}\{C_i=C_{i-1}\}
=
\sum_{\text{same-page }i}\mathbf{1}\{(P_i-P_{i-1})\bmod29=k\}.
\]

Original source fixes the left side at **86** over **12,901** adjacent rune sites on the 55 original rune-bearing physical pages. The 54 physical page-boundary transitions are omitted on both sides. The same comparison holds for any source-sized native plaintext under the exact original page lengths, even if the other 28 codewords use arbitrary independently changing secret keys, word resets, or pagewise rotor permutations. It would not hold for a cipher where multiple plaintext differences can produce zero, the special difference changes state, original word lengths change, symbols are dropped/inserted, or the target language is not ordinary native-GP English.

To test the entire **fixed marker family** without tuning any key, the [new read-only source SFT](../sims/lp2_all29_fixed_plain_delta_marker_original_sft.cjs) draws **every contiguous 12,956-rune** window from the three *pre-existing independent* source-native English controls, applies the original page cut schedule, and counts all 29 distinct GP predecessor differences for each window. The native conversion is the repository's already-used GP tokenizer (QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA); this is ordinary GP runic spelling rather than an invented corpus. The values below were computed with the exact algorithm against unchanged GitHub control-file bytes:

| Pre-existing independent control | Native-GP rune length | Full source-shaped windows | **Smallest** same-page count, minimizing over all 29 markers and windows |
| --- | ---: | ---: | ---: |
| Gibran, The Prophet | 62,492 | 49,537 | **140** |
| Shakespeare | 217,106 | 204,151 | **166** |
| Emerson | 321,327 | 308,372 | **152** |
| **Total** | | **562,060** | **0** windows at or below original **86** |

This scans **all 29 marker values**, rather than one conveniently picked GP difference. In the original source each window would have to contain exactly 86 marker transitions. The minimum for **any** full-length matched native source window is 140, so **none** of 562,060 original-length native comparison windows satisfies the necessary invariant, even after selecting k adversarially. The minimum gap of 54 transitions is substantial, and a complete decoder would also have to satisfy the more restrictive p27 two-doublet shape. Exact all-k counts per source (29 minima and means) are emitted by the SFT; no scores, parameters or word cuts were fit to a decrypt attempt.

### Even the nine original visual chapters cannot repair the fixed-rule family

An authored chapter reset is a much stronger rival than one globally fixed k. Permit each of the nine genuine physical manuscript chapters its own independently secret predecessor-difference marker k, completely independent of the markers on the other chapters. The original chapter lengths are **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008 and 308** runes. Continue excluding the 54 original physical page-edge transitions, including those within chapters. For each source-native window, optimize the zero marker **independently across all nine chapters**. This admits the full 29⁹ possible assignments of chapter markers with no assumption about the other 28 keyed successor permutations.

A rolling exact count of each GP difference per source physical page, pooled within its real chapter, scans all **562,060** native original-sized windows. The minimum *total* fixed-marker event count under the optimized nine-chapter model is **121** for Gibran, **136** for Shakespeare and **140** for Emerson, still greater than source **86**. All nine chapter best k values and their counts are emitted at the minimum-scoring window in the [same all-k reproducer](../sims/lp2_all29_fixed_plain_delta_marker_original_sft.cjs). This adds a source-visible key-reset boundary and a substantive restriction: even independent markers at all nine obvious chapter breaks do not reproduce the source equality scarcity in any pinned contiguous GP-English comparison passage. A genuinely within-chapter changing marker, source-level resegmentation or new register remains possible.

This is a **strong empirical source-English exclusion** of every *single fixed plaintext-difference-k zero-emission rule*, regardless of the unknown permutation applied to the 28 nonzero differences. It is conditional on three fixed English controls and original-sized contiguous ordinary GP prose; it cannot prove a mathematical impossibility for every possible authored message, an arbitrary ciphertext-permutation receiver, or a state-changing exceptional difference. An encoder with zero-repeat rejection or an evolving selected zero-step rule is still logically possible, but requires an external source instruction for its inverse.

## Consolidated research decision

The mathematical design is genuinely reversible and survives p27's disjoint doublets, with no inserted nulls or unrecorded side information. Its tested **13-step/p50** original decoder remains nonlinguistic, and its stronger **all-29 fixed-step successor family**, even with independent nine-chapter marker rekeys, cannot match the original equality rate in *any* of 562,060 full-length, matched-cut native Gibran, Shakespeare and Emerson windows, no matter how the other 28 symbols are secretly permuted at each step. A GP29 predecessor-difference marker fixed for the whole book or for each of its nine visually signaled chapters is therefore a poor original-LP2 cipher hypothesis under ordinary GP-English.

What remains genuinely open is a creator-specified **changing zero-step or state-dependent rejection code** with a lossless inverse, historically recoverable key clock and independently readable unknown original plaintext. Direct 13-dot/p50 fixed-step is retired. Do not proliferate similar keyed 28-way rotations or weaken source word segmentation merely to rescue the synthetic family. Both exclusion tests remain in supporting im-results; no authentic unknown plaintext has been recovered.
