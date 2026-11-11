# Source-fixed 13/31 LCG: 32-fragment traversal and 32×8 grid inverse, no unknown plaintext

**Classification:** reproducible source-anchored structural relationship and bounded negatives for direct transposition and source-fixed grid-key inverses. No unknown LP2 plaintext, cipher key, or complete mechanism recovered.

## Human solve-path hypothesis

The original five-slot border ornaments have a documented binary reading of **13** and **31**. Across the full LP2 artifact, the 31 thirteen-dot marks delimit **32 chronological full-text fragments**. A human solver could reasonably try the full-period linear congruential recurrence

\[
x_{n+1}=13x_n+31\pmod{32},\qquad x_0=0.
\]

This is not an unconstrained parameter search. The modulus is fixed by the 32 source fragments, and both recurrence parameters are read from the ornament. It has period 32: the increment is odd and the multiplier is congruent to 1 modulo 4.

The source parser preserves the coincident black/red marks on p7 and the p14-to-p15 boundary. It also preserves the two empty intervals rather than deleting them.

## Exact source map

The canonical corpus contains 58 physical pages and 13,136 runes, of which the first 28 fragments contain all **12,956 unresolved runes** on pp0–55; the final four fragments contain the 180 solved runes on pp56–57.

Full-text fragment lengths, in chronological fragment order, are:

13, 716, 16, 103, 3, 690, 11, 308, 0, 14, 1729, 0, 9, 11, 1883, 16, 1005, 19, 1414, 10, 81, 8, 1460, 3, 118, 3008, 9, 299, 5, 80, 7, 88.

The empty fragments are **8** and **11**, at duplicate global boundaries **1,860** and **3,603**. They are retained as distinct fragment indices in the permutation.

The LCG order is:

0, 31, 18, 9, 20, 3, 6, 13, 8, 7, 26, 17, 28, 11, 14, 21, 16, 15, 2, 25, 4, 19, 22, 29, 24, 23, 10, 1, 12, 27, 30, 5.

The inverse **position-permutation** order (forward position for each original fragment ID) is:

0, 27, 18, 5, 20, 31, 6, 9, 8, 3, 26, 13, 28, 7, 14, 17, 16, 11, 2, 21, 4, 15, 22, 25, 24, 19, 10, 29, 12, 23, 30, 1.

Both visit every fragment exactly once. The forward order places the two empty fragments at output positions 8 and 13; the inverse places them at positions 8 and 17.

## Held-out solved-tail control: exact cyclic rotation

The final four source fragments split the independently solved tail as follows:

| Fragment | Source interval | Length | Known plaintext |
|---:|---|---:|---|
| 28 | p56 offsets 0–4 | 5 | p56 prefix |
| 29 | p56 offsets 5–84 | 80 | p56 remainder |
| 30 | p57 offsets 0–6 | 7 | p57 prefix, PARABLE |
| 31 | p57 offsets 7–94 | 88 | p57 remainder |

Restricting either the forward LCG order or its inverse to these four fragment IDs gives the same relative order:

**31, 28, 29, 30.**

Concatenating those known plaintext pieces gives exactly

\[
\text{p57}[7:95]\ \Vert\ \text{p56}[0:85]\ \Vert\ \text{p57}[0:7],
\]

which is a **cyclic rotation by 92 runes** of the 180-rune string p56 followed by p57 (85 + 7). The exact equality is asserted in the reproducer, not inferred from a language score.

The p56 plaintext fixture is the repository's authentic solved-page regression. The p57 plaintext is taken from the exact rune sequence in [Wulfic's page-74 rune transcription](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_74/runes.txt); its GP transliteration preserves the source spelling **TUNNELNG**, rather than silently normalizing it to the README's English rendering “TUNNELING”. Both solved pages are held out from the 12,956-rune unknown-text language test.

This exact tail relation supports a cyclic fragment-indexing interpretation, but cannot distinguish forward order from inverse **position-permutation** order: both give the same tail restriction. Traversing the inverse **recurrence** backward is a different operation, selecting **[30,29,28,31]**, which does not rotate the known solved tail.

### Complete finite-family orientation gate (Agent 10, 11 November 2026)

The [standalone 32-state test](../sims/lp2_lcg32_tail_orientation_sft.cjs) distinguishes inverse **position-permutation** (`order.indexOf(id)`) from walking the inverse **recurrence** (`x ← 13⁻¹(x−31) mod32`). The former reproduces the solved-tail cyclic order **[31,28,29,30]**; the latter yields **[30,29,28,31]**, incompatible with that solved-tail rotation.

Exhausting all **128 full-period 32-state affine clocks** with seed0 (`a≡1 mod4`, odd `b`) finds **18/128** with any cyclic tail order in forward traversal, **22/128** in inverse-position order, **4/128** with the *same cyclic tail order* in both, and only **1/128** with the exact dual order **[31,28,29,30]**: the independently source-suggested `a=13,b=31`. Five rotations of the border pattern `01101` give **[11,13,21,22,26]**; only 13 and 21 satisfy full-period constraints with `b=31`, and the 21/31 candidate fails the cyclic tail check. These are **finite-family counts, not historical-intent probabilities**, given the larger retrospectively searched clue family. This improves the candidate's conditional orientation specification but supplies neither an original cipher inverse nor recovered plaintext.

## Direct transposition test on the unknown text

The 28 unresolved fragments were concatenated in LCG order and inverse-LCG order, then scored with the repository's fixed smoothed GP trigram model (trained on the first 200,000 characters of the independent Shakespeare control). No model or permutation parameter was fitted to LP2.

| Stream | Mean GP trigram log-likelihood per rune |
|---|---:|
| Original chronological unknown stream | −6.195857 |
| Forward LCG fragment order | −6.198043 |
| Inverse LCG fragment order | −6.195210 |
| 1,000 random 28-fragment orders: mean ± SD | −6.195801 ± 0.000856 |

Against the deterministic 1,000-order null, the forward order has upper-tail \(p=0.997\), and the inverse order \(p=0.235\). Neither is a meaningful language improvement. Normalized index of coincidence is exactly unchanged by transposition, as expected.

Applying the same LCG order to the 32 red-only fragments (225 red runes) also produces no readable plaintext. This is a bounded negative for direct red-only transposition, distinct from the full-text fragment order.

## New original-cipher gate: 13/31 grid rows, columns, and 256-cell cycle

The source gives 32 thirteen-dot-delimited full-text fragments, the 32×8 table, and a retrospective binary reading of the five-dot ornaments as 13/31. The same full-period LCG `x → 13x+31` can be run over **32 rows**, **8 columns**, or all **256 row-major table cell addresses**. These all have full period, with initial state zero; the 8-column orbit is `[0,7,2,1,4,3,6,5]`. This is a finite source-selected extension of the existing 32-fragment ordering, not proof that the maker intended an LCG.

Two **different** candidate uses were frozen before testing the original cipher:

1. **One grid row per full-text fragment.** Assign row `LCG32[f]` or its inverse-order counterpart to chronological fragment `f`, use column `LCG8[(i-start_f) mod8]` or its inverse counterpart, and reset the eight-column clock at each original 13-dot mark. Test GP29 additive plaintext and GP28 predecessor-exclusion with transparent repeated-ciphertext marker 28. Two signs and two byte projections (`b mod m` and `floor(m*b/256)`) produce exactly **32** models. Source fragment IDs **8 and 11** are empty and retained.
2. **One book-global 256-byte pad.** Flatten the grid in nested row-LCG/column-LCG order, or follow one full-period LCG modulo256 through the row-major cell addresses. Use fixed phase zero, GP29 direct additive inverse, two signs and the same two byte projections: exactly **8** models.

All **40** inverses process every original **12,956** unsolved rune. All outputs exactly forward-reencrypt the original input, and all source-native planted controls recover exactly. These are implementation properties of an invertible architecture; any wrong additive key also reencrypts exactly.

| Original-data metric | Value |
| --- | ---: |
| Original ciphertext GP29 IoC | 0.0344783979 |
| 24 direct-GP29 candidates: IoC range | 0.0344419952–0.0345017289 |
| 24 direct-GP29 candidates: top-12 rune mass | approximately 0.4258–0.4349 |
| 16 GP28 exclusion candidates: IoC range | 0.0352683053–0.0353128583 |
| GP28 candidates' top-12 rune mass | 0.4402593–0.4477462 |

The GP28 index-28 transparent marker changes its expected frequency, so GP28 raw IoC is not directly a native GP29 English statistic. The best direct-GP29 IoC is only about 0.0000233 above the ciphertext baseline, while all representative transliterations remain gibberish. No coherent words, key, or recovered instruction emerges. The **single-LCG256** and **nested32×8** serializations also remain near ciphertext IoC; the previous F31-labelled, de Bruijn, printed-order and AES/ChaCha row tests used different row maps.

**Decision:** The natural 13/31 full-period uses as a **direct repeating table pad** or **direct per-fragment GP29/GP28 row register** are bounded negatives. The LCG indexing remains a possible clue to a different byte-oriented or nonlinear operation, provided some original source supplies the missing operation. Do not repeat these direct-pad families with free phase, rotation or another fitted row order. Source-derived keys alone, without an independently selected cipher, are insufficient.

**Reproducer:** [`sims/lp2_lcg13_31_grid_original_gate.cjs`](../sims/lp2_lcg13_31_grid_original_gate.cjs), [successful manual CI 42930123664](https://github.com/FlareZ123/liber-primus/actions/runs/42930123664). It reconstructs original fragment boundaries through the shared full-text source parser and checks all 40 models, forward reencryption and source-native planted recovery.

### Direct 256-state LCG key, without table lookup (completed gate)

The five-dot candidate masks **13/31** also select a plain byte LCG with a 256-state cycle: `s_0=0; s_(j+1)=(13s_j+31) mod256`. This traverses **every 8-bit value exactly once**, so the source-derived state can itself be a keystream byte. Unlike the 40 tests above, this interpretation deliberately **does not look up a value from the printed numerical table**. The modulus 256 comes from the printed 32×8=256 byte count; no seed or key phase is fitted to output text.

The finite direct source-state inverse tests **32** original-input models: read before/after state update, book-global versus original physical-page-reset keystream clock, GP29 direct additive versus page-IV GP28 predecessor-exclusion with transparent index28, two signs and two byte-to-rune projections (remainder or scaling). The original **12,956** runes roundtrip exactly under every model, and every model recovers a repeated native solved-p57 GP-rune positive plant. These checks establish implementation validity, rather than the authenticity of the key. The raw source-state GP29 outputs have IoC **0.0344550311–0.0345246667** (original **0.0344783979**), while transparent-marker GP28 outputs have **0.0352374673–0.0353021103** and remain nonlinguistic. The direct 256-state keystream is a bounded negative under these explicit GP29/GP28 registers, both source-native reset conventions and source-fixed starting phase.

[Standalone reproducible inverse](../sims/lp2_lcg13_31_raw256_state_inverse.cjs) · [successful manual CI 42932085587](https://github.com/FlareZ123/liber-primus/actions/runs/42932085587).

### Original six-rune bookend under the frozen LCG coordinates

The duplicated p27/p55 two-word ciphertext occurrence starts at global rune offsets **6555** and **12950**. The first lies in chronological fragment **18**, at local rune **9** of 1414, with forward-LCG traversal position **2** and row assignment **2**. The second lies in fragment **27**, local rune **293** of 299, with traversal position **29** and row assignment **1**. The fragment-local modulo-eight column phases are **1** and **5**. Thus this source-fixed LCG neither equalizes their fragment states nor their simple grid-row/column coordinates. Any cross-bookend shared state would need a further independently indicated operation. This responds to the original-source question in Issue #19 without a new sweep.

## Interpretation and next decision

The LCG is a source-motivated full-period traversal with an exact known-plaintext structural control: its restriction to the solved tail rotates that tail at the p57:7 marker. Any four fragments have 4!=24 possible relative orders, of which four form a cyclic original order; this is a **1/6** baseline under a uniform random fragment-order model, so the solved-tail rotation alone cannot authenticate the 13/31 rule. But direct transposition of the unknown fragments does **not** decrypt them. The recurrence remains a **hypothetical fragment index, clock, or row-assignment rule**, without recovered plaintext or external authentication.

The natural fixed row/column assignment, table-byte GP29/GP28 pad, and direct 256-state GP29/GP28 pad have now been tested and excluded in their stated scopes. The residual useful question is whether an **independently visible operation** specifies a nonlinear or non-GP use of these states; the source permutation by itself gives no way to recover the genuine plaintext.

## All-secret 32×8 public-phase GP29 obstruction on original LP2 (Agent 10, 11 November)

The 32 source-visible thirteen-dot fragments (including their two empty intervals) and the original 32×8 byte table suggest a natural **public phase**: fragment ID `f=0..27`, column `(runeIndex−fragmentStart) mod8`. The forward/inverse 13/31 row and column permutations merely relabel these states. A book-global column index `runeIndex mod8` likewise relabels each fragment's phases. Thus all **eight** combinations of row direction, column direction and global/fragment clock yield the same exact key-invariant test.

Consider the entire cryptographic class `C_i=π_(f,column)(P_i)`, where **every one of the 256 public phases may have its own completely arbitrary secret bijective GP29 substitution**. Since any bijection preserves symbol equality among positions using the same phase, the total within-state ordered equal-symbol-pair fraction is immutable, whatever the unknown keys:

```
original LP2, all 12,956 unsolved runes:
94,652 equal ordered pairs / 2,728,348 eligible ordered pairs
= 0.034692055412286114
```

The [standalone original-input and all-secret positive-control reproducer](../sims/lp2_lcg32_allsecret_phase_invariant_sft.cjs) uses the exact source-annotated 32-fragment boundaries and tests all eight phase maps. It compares **2,335** native-GP windows (many overlapping) across modern English, Latin Vulgate and Old English Beowulf. Multiple-window corpora are sampled every 323 runes, and Beowulf supplies one full original-length source window. Every window exceeds the original source's within-phase equality rate:

| Independent native corpus | GP rune length | Windows | Native within-phase collision rate | Windows at or below original |
| --- | ---: | ---: | ---: | ---: |
| Gibran | 62,550 | 154 | 0.057778–0.062229 | 0 |
| Shakespeare | 216,874 | 632 | 0.056752–0.061851 | 0 |
| Emerson | 320,945 | 954 | 0.058376–0.062322 | 0 |
| Latin Vulgate (word-preserving GP29 source encoding) | 204,802 | 594 | 0.073046–0.078067 | 0 |
| Old English Beowulf (original-length source GP29 fixture) | 12,956 | 1 | 0.059972 | 0 |

For every corpus the SFT encrypts 12,956 native-GP runes using **independently permuted secret 29-symbol substitution tables at each of the 256 public phases**, asserts complete 12,956/12,956 secret-inverse recovery, and confirms the invariant survives genuine encryption exactly. Latin and Old English mitigate a modern-English-only assumption; the sampled controls cannot exhaust all languages, encodings or artificial plaintext. This is a **key-independent rejection of directly native-English GP29 plaintext behind any fixed secret substitution at these public 32×8 phases**. It is stronger than testing the earlier 40 concrete grid-byte additive inverses because no key or S-box is guessed. Native corpora are not a formal exhaustive model of all possible natural or artificial plaintext. The windows overlap heavily and the 13/31 phase interpretation was retrospectively motivated, so neither a binomial p-value nor historical authorship should be inferred.

**Important boundary of this exclusion:** an evolving/secret-state substitution, feedback across runes, source-dependent resegmentation, variable-rate text, a non-GP intermediate, or an encryption layer preceding this substitution can break the native-GP phase collision expectation. The source does not yet select any of these options. No original plaintext was recovered. The useful decision is to retire fixed 32×8 phase GP29 S-box/key searches and demand a truly different independently specified transform.

## Reproduction

Run from the repository root with Node.js:

**node sims/lp2_lcg32_fulltext_fragment_order.cjs** (fragment traversal and solved-tail control)

**node sims/lp2_lcg13_31_grid_original_gate.cjs** (40 original-cipher source-fixed table-byte inversions)

**node sims/lp2_lcg13_31_raw256_state_inverse.cjs** (32 original-cipher direct LCG-state inversions)

The script uses the original normalized corpus, original two-ink annotation, the existing source-boundary parser, the fixed GP trigram model, and exact known p56/p57 controls. It asserts all 32 fragments, both empty intervals, the complete 13/31 LCG cycle, and the exact solved-tail cyclic rotation.
