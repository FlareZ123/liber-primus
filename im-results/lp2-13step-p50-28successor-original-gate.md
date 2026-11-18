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

### A separate fixed marker at every original large punctuation sign also fails

The manuscript contains **31 source-visible chapter/section punctuation records** in the original unsolved pp0–55. Two records share earlier rune offsets and the final mark sits after the last rune; these yield **28 distinct interior rune cuts and 29 marked sections**. The original image census independently confirms their dot morphology and the companion identity inventory aligns all 31 signs to their original rune offsets. Grant each resulting section its **own completely arbitrary fixed GP29 predecessor-difference marker**, with the other 28 successor outputs arbitrarily keyed per position. This even permits a change at tiny section boundaries inside physical pages.

For a conservative comparison, delete all 54 physical page-edge transitions and **every marked reset transition** from the equality invariant on both original and native comparison passages. This leaves **12,882 eligible within-span GP transitions**. None of the original 86 adjacent equalities occurred at a deleted mark, so the source still requires **exactly 86** fixed-marker hits. Intersecting physical-page cuts with the mark cuts yields **74 atomic physical spans**, each assigned to one of 29 independently keyed source-marked sections. On each original-length native window, the method minimizes the possible hits separately among all 29 k choices for each section, exactly covering all **29²⁹** possible exceptional-marker assignments without enumerating their Cartesian product.

The exhaustive all-window minimum totals are **111** (Gibran), **122** (Shakespeare) and **124** (Emerson), each strictly above **86**. **None of 562,060** source-length native windows matches the original repeated-rune scarcity under any assignment of all 29 exceptional section markers. The full [source-read, rolling-count SFT](../sims/lp2_all29_fixed_plain_delta_marker_original_sft.cjs) outputs the minimizing start positions and 29 independently optimal markers with counts at those windows; the original source-marker offsets, page cuts and all 29 GP ordinal difference values are read at execution.

#### Independent-passage source control, addressing the long-text continuity caveat

A full 12,956-rune excerpt from one author is a restrictive null if the original 29 marked sections contain independent passages. The [same SFT](../sims/lp2_all29_fixed_plain_delta_marker_original_sft.cjs) therefore includes a distinct, *predeclared source-passage null*: for **10,000** trials with frozen xorshift32 seed **0x3301**, each of the **29 source-marked sections** independently selects one of the three existing GP-English prose corpora and an unrestricted uniformly chosen source position capable of holding that section's full original rune length. It preserves the original **74 atomic page/mark spans**, omits all source page-edge comparisons, and allows the same **29 independently optimized exceptional markers**. Within each section the native text is a contiguous real prose excerpt, while different sections may draw on different authors and positions.

The 10,000 exact independent-source trials produced **minimum 114**, **1st percentile 130**, **5th percentile 137**, **median 156**, **95th percentile 174**, **maximum 195** and mean **155.5318** exceptional difference hits. No trial was at or below **86**; none even reached **100**. This simulation does not prove impossibility: its finite null and source distribution are assumptions, and a bespoke language or a different structural encoder may evade them. It directly addresses the strongest obvious objection to the 562,060 contiguous book-length windows: merely composing independently selected ordinary English prose passages at all visible punctuation cuts does not typically reproduce the original repeated-rune deficit under any sectionwise constant GP predecessor-difference marker.

No individual one of the 29 original sections is strictly excluded by the per-section native minima considered independently across the three corpora. The **collective scarcity over the complete marked manuscript** is the useful discriminant, not a claim that any one local ciphertext phrase is mathematically impossible under the model. Future source work should look for a genuine within-marked-section exceptional-rule clock or another reversible operation, rather than fabricate a whole-book uniform original plaintext source.

This **does not** exclude cipher state changes at smaller unseen intervals, a non-zero marker condition that also depends on a secret evolving context, a sideband code, changed plaintext symbol grouping or a different language. It does exclude the hypothesis that a single exceptional GP29 plaintext difference can remain fixed between **every original 10/13-dot author-marked section boundary**, even granting independent secret markers at *all* those boundaries. The source therefore needs an additional within-section state/grammar clue to make a fixed-difference anti-repeat route plausible.

This is a **strong empirical source-English exclusion** of every *single fixed plaintext-difference-k zero-emission rule*, regardless of the unknown permutation applied to the 28 nonzero differences. It is conditional on three fixed English controls and original-sized contiguous ordinary GP prose; it cannot prove a mathematical impossibility for every possible authored message, an arbitrary ciphertext-permutation receiver, or a state-changing exceptional difference. An encoder with zero-repeat rejection or an evolving selected zero-step rule is still logically possible, but requires an external source instruction for its inverse.

## Different zero-step architecture: predecessor-SUM, all secret marked-section keys (18 November 2026)

A different short, reversible transmitter tests whether original adjacent equalities encode a **two-plaintext-rune SUM** rather than a single plaintext letter or predecessor **difference**. Let \(P_i,C_i\in\mathbb Z/29\). Each of the **29 original large-punctuation-defined sections** may choose its own completely unknown marker \(K_s\). Set \(z_i=(P_i+P_{i-1}-K_s)\bmod29\). Emit \(\Delta_i=0\) when \(z_i=0\); otherwise permute its 28 nonzero residues under **any arbitrarily changing secret bijection** onto the 28 nonzero ciphertext differences, then set \(C_i=C_{i-1}+\Delta_i\bmod29\). A section IV seeds its first rune. Every step admits an exact inverse given its previous plaintext rune. No original clue independently establishes this SUM operation, so it is tested as a falsifiable alternate finite-state mechanism.

**Exact key-independent condition:** \(C_i=C_{i-1}\iff(P_i+P_{i-1})\bmod29=K_s\). The original **28 unique internal large-mark cuts** create **29 marked sections**, split into **74 source-physical atomic spans** when the 54 true page edges are respected. Deleting all such reset transitions on both original and controls gives **12,882** eligible original ciphertext pairs, including exactly **86** original doublets. For every native-language full-length window, independently minimize the sum-pair marker count over all 29 possible keys in all 29 sections. This analytically covers every one of the **29²⁹** arbitrary key assignments, without searching keys. The other 28 outputs' arbitrary per-position secret maps cancel entirely.

| Pre-existing GP-native English reference | Original-length windows | Minimum possible doublet sites under any 29 section keys |
| --- | ---: | ---: |
| Gibran, *The Prophet* | 49,537 | **138** |
| Shakespeare | 204,151 | **129** |
| Emerson | 308,372 | **140** |
| Latin Vulgate NT (word-preserving GP) | 191,847 | **100** |
| Corrected Beowulf Old English | 35,057 | **119** |
| **Total** | **788,964** | **Zero** compatible windows at or below **86** |

An independent **10,000-trial** xorshift32-seeded control (seed 0x3301) draws one independent Gibran, Shakespeare or Emerson GP-English prose excerpt per marked section, retaining each original page-edge mask and optimizing the 29 section keys independently. Its minimum is **136**, first percentile **151**, median **176**, mean **175.8596**, with **zero** samples at or below 86. This directly tests the rival that the 29 marked sections are separate prose sources.

The [standalone read-only Node22 SFT](../sims/lp2_pair_sum_zeroescape_allsecret_original_sft.cjs) uses source-original runes and punctuation offsets, and constructs a genuine **12,956-rune** native GP English positive under 29 different markers and invertible nonzero-step secret rotors, with fresh IVs at all 74 physical atomic spans. It decodes and re-encrypts **12,956/12,956** correctly. The original rejection arises from the observed repeat count rather than a failure to implement an inverse.

**Research decision:** retire every section-constant predecessor-SUM exceptional-step model under the five declared GP-native English, Latin and Old English controls, including a hypothetical fixed p39-quadratic-root marker \(K=24\). A marker changing *inside* sections, a separate stateful operation, a change in rune order/length, or another language remains untested. This result identifies no genuine LP2 plaintext or author-selected key.

## Consolidated research decision

The mathematical design is genuinely reversible and survives p27's disjoint doublets, with no inserted nulls or unrecorded side information. Its tested **13-step/p50** original decoder remains nonlinguistic. Both distinct all-secret families, one with a fixed predecessor **difference** and one with a fixed predecessor **SUM**, fail all 562,060 original-length source-native English windows after granting independent arbitrary exceptional residue choices at **all 29 original punctuated sections** and arbitrary secret 28-way nonzero output permutations. The difference-family three-English minima are **111/122/124**. The SUM-family minima are **138/129/140** for those sources and **100/119** for Latin Vulgate / Beowulf, giving **788,964** total SUM-family source-language windows, all above the original **86**. A GP29 predecessor-difference marker fixed for the whole book, each of nine visual chapters, or each of 29 author-punctuated sections is therefore a poor original-LP2 cipher hypothesis under the three fixed ordinary GP-English controls.

What remains genuinely open is a creator-specified **changing zero-step or state-dependent rejection code** with a lossless inverse, historically recoverable key clock and independently readable unknown original plaintext. Direct 13-dot/p50 fixed-step is retired. Do not proliferate similar keyed 28-way rotations or weaken source word segmentation merely to rescue the synthetic family. Both exclusion tests remain in supporting im-results; no authentic unknown plaintext has been recovered.
