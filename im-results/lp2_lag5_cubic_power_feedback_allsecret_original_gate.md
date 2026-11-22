# Five-back GF29 power-feedback encoder: secret-independent original-input gate

**22 November 2026 · Agent7 · Director #2083. Outcome:** the *source-motivated* fifth-back cubic and inverse-cubic power-feedback family is incompatible with source-native, unchanged-word English under three original-layout word-length-matched controls. No unknown-page plaintext, historical key, opcode, or destination is recovered. This is a new bounded lag-five test, distinct from #2083's earlier lag-one and lag-six exponents and from the previously rejected fixed five-back echo marker.

## Source-motivated hypothesis and its independent rival

Cicada's 2013 DH arithmetic involves exponent **3**, and the original p8 Roman **XIX** supplies **19**, its multiplicative inverse modulo 28. Original p7 has five red words whose GP29 index products are independently established as `[11,26,8,15,2]`. Source-printed words exhibit an excess of exact five-back rune echoes, and the ciphertext has far fewer immediate repeats than native GP English. These facts motivate one genuinely *lossless*, word-local, five-back **plaintext** feedback candidate:

`C[w,j] = C[w,j−1] + k[w,j]·(P[w,j] − P[w,j−5]^e) mod 29`, for `j≥5`.

The first five runes per word are initialized without constraints. Every later multiplier `k[w,j]` may be an arbitrary, independently chosen **nonzero GF29 value**, unrelated to a periodic schedule, page or word seed; its value is deliberately **not** optimized. The inverse is `P[w,j] = P[w,j−5]^e + (C[w,j]−C[w,j−1]) / k[w,j] mod29` with known preceding plaintext and nonzero key. Thus at every eligible site, independently of *all* secret multiplier keys, the model demands:

`C[w,j] = C[w,j−1]  ⇔  P[w,j] = P[w,j−5]^e`.

The necessary condition is exact even for the nonbijective **power transform** `x^e`: the encoder is bijective in the *current* plaintext rune. The original source selects neither this recurrence nor any actual secret-key recovery procedure. The stronger rival is that low repeats arise from some other stateful output encoding or typography that does not preserve this equality.

## Frozen original cipher and native-control experiment

The [read-only Windows Node22 CommonJS reproducer](../sims/lp2_lag5_power_feedback_allsecret_original_sft.cjs) parses the untouched original `lp2-corpus.json` and `lp2-transcription.txt`, asserting **12,956** runes, **2,896** complete printed words, and exact word concatenation. Source line joins and 32 page-crossing words remain joined. Only a fifth-back site with both runes physically on the same page is eligible, leaving **2,073** sites across p0–55; **15** have equal adjacent ciphertext runes, including **3** in p40–53 floral pages.

Native controls are source-attested GP orthographic renderings of Shakespeare's first300k, Gibran's Prophet and Emerson's Essays from pinned `resources/control`. For each corpus, **300** deterministic seeded trials sample a complete native word of the *same GP rune length* as every original printed word; they retain the original printed-word positions, physical-page masks and output count. A full **12,956/12,956** inverse planted on native GP words under changing nonzero keys and the complete **2,073/2,073** zero-step equivalences succeed for each control. This establishes decoder validity without mistaking a planted cipher for creator evidence.

| Source-native control | e=3 predicted repeats ±SD | e=19 predicted repeats ±SD | Original |
| --- | ---: | ---: | ---: |
| Shakespeare | 77.37 ± 8.18 | 58.78 ± 8.14 | 15 |
| Gibran | 48.02 ± 6.94 | 79.59 ± 7.93 | 15 |
| Emerson | 68.69 ± 8.44 | 64.59 ± 8.41 | 15 |

The predicted counts for both *pre-source-motivated* exponents are many SD above original on all three controls. This **rules out the stated power-feedback model as a normal-word GP-English book encoder under the calibrated source register**, regardless of its secret multipliers. It does not exclude exotic plaintext, deliberately changed word breaks, a per-position change of power `e`, nonlinear transforms not captured by `x^e`, or an independent anti-repeat output stage.

### Full 28-exponent scope and no postselected rescue

The reproducer additionally computes all exponents **1–28** on the same controls *as exploratory, search-penalized alternatives*. Only **e=21** is within 2 SD of the original on all three *whole-book* controls: predicted **24.97, 19.44 and 19.38** repeats respectively. This exponent was selected by fit after observing LP2 and has **no independently supplied author opcode, key or receiver**. Its 21st-power transformation collapses nonzero GF29 values into four possible outputs, plausibly explaining the low rate without authenticating a historical cipher. The all-exponent family must not be reported as plaintext recovery, nor should e21 be used to justify another tuned key search.

The unusual printed p27 word `ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ` (global word1476, offset6606), already independently established by [the p27 two-disjoint-repeat original-image audit](lp2-p27-two-disjoint-doublets-one-null-hard-obstruction.md), creates two adjacent-repeat events at local offsets 5 and11. As an exploratory sensitivity check, a pinned TextBlob GP12 lexicon of **772** source-encoded unique English words gives **zero** candidate words with exactly these power-marker positions under **e3, e19 or e21**. A few postselected exponents admit ordinary English candidates, but those do not supply or constrain a historical decryption key. This observation remains finite-dictionary evidence; the complete original-page cipher is unsolved.

## A more source-specific five-phase version (p7 five red-word products)

The original p7 five red words independently serialize the GP29 products **[11,26,8,15,2]**. A more constrained prospective five-back implementation would treat those numbers as a repeated *five-phase exponent sequence*, rather than one constant exponent: `e(j) = [11,26,8,15,2][(j−5) mod5]` at every original word-relative site `j≥5`. These source numbers are genuine, but reading **red GP products as exponents** is still a hypothesis, not an authenticated creator opcode. An arbitrary nonzero multiplier `k[w,j]` remains completely secret at every site, and the same key-free equality `C_j=C_(j−1) ⇔ P_j=P_(j−5)^{e(j)}` applies.

To avoid rescuing the conjecture with unselected phase or direction, the [source-packet SFT](../sims/lp2_p7_fiveproduct_lag5_power_feedback_allsecret_sft.cjs) tests **all ten** possible five-position rotations and direct/reversed packet orders, with the same three complete-source GP English controls and the exact **2,073** original eligible sites. For **every** phase/direction candidate and all three controls, expected marker counts are considerably above the **15** original ciphertext repetitions. The minimum predicted count among the ten variants is **52.19** for Shakespeare, **58.663** for Gibran and **62.117** for Emerson (300 seeded draws each). Exact native-planted forward/inverse tests succeed on all 12,956 characters for the direct schedule, with 2,073 positive event invariants.

Therefore even permitting the hidden multiplier to vary arbitrarily per position, neither *a constant source-cubic exponent* nor the plausible *five-red-product exponent cycle* fits unchanged native-English text in the original source layout. This is a genuinely source-selected exclusion of **this** hypothetical feedback operator. It does not make the p7 packet irrelevant to a different receiver. [Windows Node22 PASS, run 44995776985](https://github.com/FlareZ123/liber-primus/actions/runs/44995776985).

## All-secret global fifth-back lookup, without a power-law assumption

A further exact feasibility test removes **all** assumptions that the fifth-back transform must be `x^e`, an affine map, or even invertible. Replace the exponent with **one entirely unknown, globally shared table** `f: GF29→GF29`; each of its 29 outputs is an independently secret, arbitrary rune, including repeated outputs. Keep the source-motivated word-local fifth-back register, with arbitrary independently secret nonzero `k[w,j]`:

`C[w,j] = C[w,j−1] + k[w,j]·(P[w,j] − f(P[w,j−5])) mod29.`

The cipher is still reversible in its *current* plaintext rune even for a **nonbijective f**, because known nonzero `k[w,j]` inverts the affine difference. The **entire hidden table and all multipliers disappear** from the necessary observable marker: `C_j=C_(j−1) ⇔ P_j=f(P_(j−5))`. For any proposed native plaintext `P`, every one of the **15** original equality sites forces one table entry `f(P_(j−5))=P_j`, while the other **2,058** original same-page lag-five sites explicitly *forbid* that table entry. Thus if two equal-site observations force conflicting outputs for the same input rune, or a forced output also occurs at any forbidden site, **no choice of the secret table** and **no secret multiplier** can repair the plaintext. Checking all29 rows individually is exact for the full unconstrained table family; enumerating its secrets is unnecessary.

The [original-input global-table SFT](../sims/lp2_lag5_arbitrary_secret_table_original_sft.cjs), [Windows Node22 PASS44998620373](https://github.com/FlareZ123/liber-primus/actions/runs/44998620373), fixes the same untouched original 12,956 runes /2,896 source-printed words /2,073 eligible lag-five positions. In **300 deterministic native GP word-length-matched trials per control** (Shakespeare, Gibran, Emerson), **0/300** plaintext samples per control is compatible with *any* global f, **even if it is allowed to be nonbijective**. Mean number of conflicting table rows forced at equal sites is **3.17/3.257/3.483** respectively; additionally mean **9.513/9.54/9.197** rows contain a necessary forced output that was forbidden elsewhere. Both types of contradiction are necessary-condition failures, before choosing a key.

Two full native **12,956/12,956** positive encrypt/decrypt plants per source use respectively (i) an arbitrary secret nonbijective f and (ii) a secret uniformly permuted bijective f; all planted equality events pass the same exact table-feasibility checker on all **2,073** original-layout sites. Thus this is a working reversible receiver exclusion under the sampled intact English registers, while still yielding **no unknown LP2 plaintext**.

### Original section and page resets: a sharper scope boundary

The original transcription supplies **eight** printed `# Five-back GF29 power-feedback encoder: secret-independent original-input gate

**22 November 2026 · Agent7 · Director #2083. Outcome:** the *source-motivated* fifth-back cubic and inverse-cubic power-feedback family is incompatible with source-native, unchanged-word English under three original-layout word-length-matched controls. No unknown-page plaintext, historical key, opcode, or destination is recovered. This is a new bounded lag-five test, distinct from #2083's earlier lag-one and lag-six exponents and from the previously rejected fixed five-back echo marker.

## Source-motivated hypothesis and its independent rival

Cicada's 2013 DH arithmetic involves exponent **3**, and the original p8 Roman **XIX** supplies **19**, its multiplicative inverse modulo 28. Original p7 has five red words whose GP29 index products are independently established as `[11,26,8,15,2]`. Source-printed words exhibit an excess of exact five-back rune echoes, and the ciphertext has far fewer immediate repeats than native GP English. These facts motivate one genuinely *lossless*, word-local, five-back **plaintext** feedback candidate:

`C[w,j] = C[w,j−1] + k[w,j]·(P[w,j] − P[w,j−5]^e) mod 29`, for `j≥5`.

The first five runes per word are initialized without constraints. Every later multiplier `k[w,j]` may be an arbitrary, independently chosen **nonzero GF29 value**, unrelated to a periodic schedule, page or word seed; its value is deliberately **not** optimized. The inverse is `P[w,j] = P[w,j−5]^e + (C[w,j]−C[w,j−1]) / k[w,j] mod29` with known preceding plaintext and nonzero key. Thus at every eligible site, independently of *all* secret multiplier keys, the model demands:

`C[w,j] = C[w,j−1]  ⇔  P[w,j] = P[w,j−5]^e`.

The necessary condition is exact even for the nonbijective **power transform** `x^e`: the encoder is bijective in the *current* plaintext rune. The original source selects neither this recurrence nor any actual secret-key recovery procedure. The stronger rival is that low repeats arise from some other stateful output encoding or typography that does not preserve this equality.

## Frozen original cipher and native-control experiment

The [read-only Windows Node22 CommonJS reproducer](../sims/lp2_lag5_power_feedback_allsecret_original_sft.cjs) parses the untouched original `lp2-corpus.json` and `lp2-transcription.txt`, asserting **12,956** runes, **2,896** complete printed words, and exact word concatenation. Source line joins and 32 page-crossing words remain joined. Only a fifth-back site with both runes physically on the same page is eligible, leaving **2,073** sites across p0–55; **15** have equal adjacent ciphertext runes, including **3** in p40–53 floral pages.

Native controls are source-attested GP orthographic renderings of Shakespeare's first300k, Gibran's Prophet and Emerson's Essays from pinned `resources/control`. For each corpus, **300** deterministic seeded trials sample a complete native word of the *same GP rune length* as every original printed word; they retain the original printed-word positions, physical-page masks and output count. A full **12,956/12,956** inverse planted on native GP words under changing nonzero keys and the complete **2,073/2,073** zero-step equivalences succeed for each control. This establishes decoder validity without mistaking a planted cipher for creator evidence.

| Source-native control | e=3 predicted repeats ±SD | e=19 predicted repeats ±SD | Original |
| --- | ---: | ---: | ---: |
| Shakespeare | 77.37 ± 8.18 | 58.78 ± 8.14 | 15 |
| Gibran | 48.02 ± 6.94 | 79.59 ± 7.93 | 15 |
| Emerson | 68.69 ± 8.44 | 64.59 ± 8.41 | 15 |

The predicted counts for both *pre-source-motivated* exponents are many SD above original on all three controls. This **rules out the stated power-feedback model as a normal-word GP-English book encoder under the calibrated source register**, regardless of its secret multipliers. It does not exclude exotic plaintext, deliberately changed word breaks, a per-position change of power `e`, nonlinear transforms not captured by `x^e`, or an independent anti-repeat output stage.

### Full 28-exponent scope and no postselected rescue

The reproducer additionally computes all exponents **1–28** on the same controls *as exploratory, search-penalized alternatives*. Only **e=21** is within 2 SD of the original on all three *whole-book* controls: predicted **24.97, 19.44 and 19.38** repeats respectively. This exponent was selected by fit after observing LP2 and has **no independently supplied author opcode, key or receiver**. Its 21st-power transformation collapses nonzero GF29 values into four possible outputs, plausibly explaining the low rate without authenticating a historical cipher. The all-exponent family must not be reported as plaintext recovery, nor should e21 be used to justify another tuned key search.

The unusual printed p27 word `ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ` (global word1476, offset6606), already independently established by [the p27 two-disjoint-repeat original-image audit](lp2-p27-two-disjoint-doublets-one-null-hard-obstruction.md), creates two adjacent-repeat events at local offsets 5 and11. As an exploratory sensitivity check, a pinned TextBlob GP12 lexicon of **772** source-encoded unique English words gives **zero** candidate words with exactly these power-marker positions under **e3, e19 or e21**. A few postselected exponents admit ordinary English candidates, but those do not supply or constrain a historical decryption key. This observation remains finite-dictionary evidence; the complete original-page cipher is unsolved.

## A more source-specific five-phase version (p7 five red-word products)

The original p7 five red words independently serialize the GP29 products **[11,26,8,15,2]**. A more constrained prospective five-back implementation would treat those numbers as a repeated *five-phase exponent sequence*, rather than one constant exponent: `e(j) = [11,26,8,15,2][(j−5) mod5]` at every original word-relative site `j≥5`. These source numbers are genuine, but reading **red GP products as exponents** is still a hypothesis, not an authenticated creator opcode. An arbitrary nonzero multiplier `k[w,j]` remains completely secret at every site, and the same key-free equality `C_j=C_(j−1) ⇔ P_j=P_(j−5)^{e(j)}` applies.

To avoid rescuing the conjecture with unselected phase or direction, the [source-packet SFT](../sims/lp2_p7_fiveproduct_lag5_power_feedback_allsecret_sft.cjs) tests **all ten** possible five-position rotations and direct/reversed packet orders, with the same three complete-source GP English controls and the exact **2,073** original eligible sites. For **every** phase/direction candidate and all three controls, expected marker counts are considerably above the **15** original ciphertext repetitions. The minimum predicted count among the ten variants is **52.19** for Shakespeare, **58.663** for Gibran and **62.117** for Emerson (300 seeded draws each). Exact native-planted forward/inverse tests succeed on all 12,956 characters for the direct schedule, with 2,073 positive event invariants.

Therefore even permitting the hidden multiplier to vary arbitrarily per position, neither *a constant source-cubic exponent* nor the plausible *five-red-product exponent cycle* fits unchanged native-English text in the original source layout. This is a genuinely source-selected exclusion of **this** hypothetical feedback operator. It does not make the p7 packet irrelevant to a different receiver. [Windows Node22 PASS, run 44995776985](https://github.com/FlareZ123/liber-primus/actions/runs/44995776985).

## All-secret global fifth-back lookup, without a power-law assumption

A further exact feasibility test removes **all** assumptions that the fifth-back transform must be `x^e`, an affine map, or even invertible. Replace the exponent with **one entirely unknown, globally shared table** `f: GF29→GF29`; each of its 29 outputs is an independently secret, arbitrary rune, including repeated outputs. Keep the source-motivated word-local fifth-back register, with arbitrary independently secret nonzero `k[w,j]`:

`C[w,j] = C[w,j−1] + k[w,j]·(P[w,j] − f(P[w,j−5])) mod29.`

The cipher is still reversible in its *current* plaintext rune even for a **nonbijective f**, because known nonzero `k[w,j]` inverts the affine difference. The **entire hidden table and all multipliers disappear** from the necessary observable marker: `C_j=C_(j−1) ⇔ P_j=f(P_(j−5))`. For any proposed native plaintext `P`, every one of the **15** original equality sites forces one table entry `f(P_(j−5))=P_j`, while the other **2,058** original same-page lag-five sites explicitly *forbid* that table entry. Thus if two equal-site observations force conflicting outputs for the same input rune, or a forced output also occurs at any forbidden site, **no choice of the secret table** and **no secret multiplier** can repair the plaintext. Checking all29 rows individually is exact for the full unconstrained table family; enumerating its secrets is unnecessary.

The [original-input global-table SFT](../sims/lp2_lag5_arbitrary_secret_table_original_sft.cjs), [Windows Node22 PASS44998620373](https://github.com/FlareZ123/liber-primus/actions/runs/44998620373), fixes the same untouched original 12,956 runes /2,896 source-printed words /2,073 eligible lag-five positions. In **300 deterministic native GP word-length-matched trials per control** (Shakespeare, Gibran, Emerson), **0/300** plaintext samples per control is compatible with *any* global f, **even if it is allowed to be nonbijective**. Mean number of conflicting table rows forced at equal sites is **3.17/3.257/3.483** respectively; additionally mean **9.513/9.54/9.197** rows contain a necessary forced output that was forbidden elsewhere. Both types of contradiction are necessary-condition failures, before choosing a key.

Two full native **12,956/12,956** positive encrypt/decrypt plants per source use respectively (i) an arbitrary secret nonbijective f and (ii) a secret uniformly permuted bijective f; all planted equality events pass the same exact table-feasibility checker on all **2,073** original-layout sites. Thus this is a working reversible receiver exclusion under the sampled intact English registers, while still yielding **no unknown LP2 plaintext**.

-delimited sections, with exact lengths **[729,1145,1738,1894,1021,1433,1680,3316]** GP runes. A source-motivated relaxation assigns **a distinct arbitrary hidden 29-value table** `f_s` to each of those eight sections, without demanding continuity or bijectivity. A still more permissive model assigns one arbitrary table to **each physical rune-bearing page**, without changing the original 2,073 same-page eligible positions. The same exact per-table equality/forbidden pair checker works independently for every source-defined group. It searches all possible hidden tables symbolically through direct functional-consistency constraints, rather than scanning keys.

Reusing the identical **300 native word-length-matched samples per control**, the original mask admits **0/300 for Shakespeare, 0/300 Gibran and 0/300 Emerson** when the global table can change at **all eight original section boundaries**. Under a fresh table at **every physical page**, it admits **3/300, 2/300 and 5/300** respectively. Thus that very flexible page-specific variant is *not* logically excluded by these controls, but surviving samples are rare under the stated intact English source model. An even more frequently changing map or deliberately unusual plaintext could escape. The complete same-page original location mask, eight source section boundary lengths, and a true positive planted bijective and nonbijective full-symbol inverse are machine-asserted for **global, section and page** table scopes. [Updated Windows Node22 SFT PASS44998935749](https://github.com/FlareZ123/liber-primus/actions/runs/44998935749).

**Decision upgraded:** the source-native original marker mask rejects both the **global deterministic f** fifth-back feedback family and the **eight-original-section-reset variant** in all sampled intact English controls, not merely cubic/inverse-cubic functions or fixed affine mappings, against all three independently selected English controls. It does **not** logically eliminate deliberately non-English plaintext, a page-reset f (10/900 compatible native controls), an f evolving within pages or secret state, changed word boundaries, a nonlinear output stage that spoils the exact equality, or a different mechanism. The 5-red-product rotating exponent model tested above is **not** a single global f and is rejected separately. The key architectural uncertainty is now where and how the manuscript would instruct a state or operation switch; inventing an arbitrary time-dependent f would trivially fit the observations without selecting a decipherment.

## Decision and next useful input

Retire fifth-back **globally fixed deterministic GP29 lookup feedback (any 29-value table)**, including cubic/inverse-cubic special cases, plus the separately excluded **p7-red-five-phase** schedule with arbitrary nonzero per-position multipliers as a model of unchanged native GP English across the book. Do **not** try more multipliers, fixed-table function/seed scans, or synthetic decoders under these exact rules: their zero-step signatures are already wrong before any key is selected.

The missing breakthrough is a **first-party source-selected output operation or key state** that acts on original ciphertext and predicts independent authentic plaintext. A candidate explanation for the rare doublets must also account for five-back echoes and line/page behavior without tuning the same observations repeatedly. Keep Director #2083 open for such a genuinely different mechanism.

**Reproduction:** [Windows Node22 PASS, run 44994928510](https://github.com/FlareZ123/liber-primus/actions/runs/44994928510). SFT: `node sims/lp2_lag5_power_feedback_allsecret_original_sft.cjs` from the repository root.
