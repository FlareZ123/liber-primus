# GP28 predecessor exclusion with any secret 1–256-phase key: exact native E-rune obstruction

**Agent39, 22 November 2026. Source-original all-secret family exclusion through period256, combining exact frequency bounds with phase-equality invariants.** The strongest short-period result allows **arbitrary secret orderings of all 29 ciphertext rune identities at every key phase**, together with arbitrary 28-way plaintext substitutions, and excludes all periods **1 through 43**. The second tier retains the original cyclic/sorted GP order and covers **all periods 1 through 256** with arbitrary 28-way substitutions. The E-frequency branches are exact finite upper bounds on a single recovered plaintext rune. The independent phase-collision branch covers the full remaining key-period range without hypothesizing a repeat symbol. It requires no key discovery or probabilistic search and operates on **all 12,956 intact unknown LP2 GP29 runes**. The result excludes direct recovery of the tested source-native English controls under the stated reversible predecessor-exclusion architecture. **It recovers no new LP2 plaintext, authentic key, or destination.**

## Why this is an actionable architectural exclusion

Original p49–51 prints a 256-cell, 32×8 numerical table, so a 256-symbol periodic cipher key is a visible, technically plausible option. The original unknown text is nearly uniform in its 29-rune inventory, yet across all 55 rune-bearing physical pages only **86** of 12,901 within-page successors equal their predecessor. A reversible lossless cipher can exploit the 28 alternative next-symbol choices: the 29th plaintext symbol becomes an explicit identical-ciphertext escape. This provides a concrete explanation for rare ciphertext repeats **if** the source actually uses that channel; neither the numeric table nor the original text authenticates it.

The direct table-byte rank28 shift was already tested in [p50 direct256 rank28](lp2-p50-direct256-rank28-nonbacktracking-gate.md); literal eight AES/ChaCha column keys were more broadly tested in [grid-rank28 keyed exclusion](grid-rank28-keyed-exclusion.md). Prior [period13 all-secret rank capacity](lp2-rank28-period13-allsecret-original-gate.md) also allows arbitrary cipher alphabet ordering. Those tests leave the **entire unknown 256-symbol periodic key family** unaddressed, including hypothetical key schedules unconnected to p50. This result eliminates that key search outright for the declared native-English register. There is no need to enumerate `28^256` possible additive keys or individual symmetric primitives.

## Exact source and reversible decoder family

The canonical original corpus contains **12,956** GP29 ciphertext glyphs in p0–55. The 55 page initial symbols, **one additional original `$`-section initial that falls inside a physical page**, and **86** equal-successor symbols are conservatively marked as **142 completely unconstrained positions**, with **12,814** ordinary nonrepeat successor symbols.

At each ordinary position decode the original GP29 pair `(previous,current)` to a rank in 0..27 by either:

- **Cyclic 28-way rank:** `r=(current-previous-1) mod29`, after verifying `current!=previous`.
- **Sorted 28-way rank:** `r=current-Number(current>previous)`, deleting the predecessor from the ordered GP29 alphabet.

Each phase of an arbitrary periodic secret key can apply **any** of the 28! bijections from rank values 0..27 to plaintext symbols. That includes every possible additive mod28 shift at that phase and much more; the sixteen observed clock families allow **four** reset modes (continuous, physical page, eight printed `$` sections, nine illuminated chapters), **two** clock-consumption policies (every original rune or only unmarked/unequal successor runes), and both cyclic/sorted original rank conventions. For each mode **every period 1,2,3,...,256 is separately evaluated**, totaling **4,096** whole-source mode/period combinations. The secret permutation can be independently reselected at each phase and each mode; the analysis grants this adversarial freedom.

For one fixed original clock, period `m`, and rank convention, let `n[j,r]` be the count of original nonexceptional positions falling into phase `j` and observed rank `r`. Every hypothetical plaintext GP rune **E** must be assigned to **one** rank in each phase under a bijection. Consequently the **exact maximum E occurrences** across all secret phase permutations is

`M(m) = SUM(j=0..m-1) MAX(r=0..27) n[j,r]`.

This is attainable at each phase and cannot be increased by changing any secret substitution mapping. No language model is used to derive it; the English source controls enter only when judging whether the upper bound is compatible with real prose.

## Stronger exact result: arbitrary secret ciphertext alphabet order through period43

The prior source research established an exact one-rank bound under **every possible hidden ordering of the 29 ciphertext GP identities** at one key phase, by reducing the order search to 406 endpoint pairs rather than enumerating 29! permutations ([period13 predecessor work](lp2-rank28-period13-allsecret-original-gate.md)). This result extends that theorem to **every key period 1–60 inclusive**, each of the eight book/page/section/chapter × all/nonrepeat clocks, and the complete 12,956 original runes.

For each phase j, form the 29×29 directed transition-count table `T_j[s,c]` of original unequal adjacent symbols. Any hidden GP alphabet order maps any one secret 28-way plaintext rank to the two adjacent destination symbols `a,b` in that secret order. The exact maximal number of one plaintext rune (e.g. E) attained at that phase is

`W(T_j)=MAX(a<b){T_j[a,b]+T_j[b,a]+SUM(s!=a,b) MAX(T_j[s,a],T_j[s,b])}`.

The bound is attained by placing every other source rune on whichever side of the adjacent pair permits its more frequent destination. The source order and the plaintext rank relabeling are each allowed to vary **independently at every phase**. Sum `W(T_j)` over phases and grant all **142** source exception sites arbitrary E. Small-alphabet exhaustive `q=4,5,6` permutation oracles validate the formula for 36 independent weighted transition tables.

| Unknown period | Maximum original E after granting 142 free positions, any ciphertext ordering and any output alphabet |
| --- | ---: |
| 1 | 716 |
| 13 | 1,036 |
| 23 | 1,177 |
| 29 | 1,240 |
| 32 | 1,288 |
| **Any period 1–43** | **At most 1,372** (maximum at period42) |
| 43 alone | 1,370 |
| **44** | **1,398**, first period not excluded by the E-only criterion |
| 60 | 1,526 |

Every 12,956-rune native-English control window has at least **1,397 E**. Thus **not one of the 344 source-clock and key-period combinations from period 1 to 43 can directly decrypt to any of those source-native English windows**, even after allowing a wholly unknown 29! source alphabet and independent 28! output mapping at every phase and even if **all** rare ciphertext repetitions could be E. The threshold **44** is only the first phase cardinality for which E frequency ceases to rule the model out; it is no evidence of a genuine 44-phase key. This all-order statement is stronger than the fixed-source-rank tier below for periods ≤43 and removes the separate assumption about which plaintext symbol ciphertext repeats encode.

The [separate all-source-order Node22 CJS reproducer](../sims/lp2_rank28_period43_allsecret_alphabet_capacity_sft.cjs) computes all periods1–60 on the original ciphertext and proves the exact endpoint-pair bound against 36 independent small-alphabet exhaustive oracles. It encrypts and recovers **12,956/12,956** original-solved-p57-derived native plaintext runes under a fully secret noncanonical GP29 ciphertext order and an actual table-derived 256-phase secret rank key, confirming that the mathematical bound accepts true native GP plaintexts in the declared cipher class. [Successful Windows run 45061788402](https://github.com/FlareZ123/liber-primus/actions/runs/45061788402) records original threshold and positive.

## Additional exact result: original fixed-order periodic ranks up to256


| Original rank-bound question | Exact result |
| --- | ---: |
| Nonexceptional original rank positions | **12,814** |
| Fully free initial/repeat positions granted | **142** |
| Clock/rank variants | **16** |
| Different key periods per variant | **256** |
| Original maximum `M(256)` across all 16 clocks/ranks | **1,280** |
| Original maximum `M(m)` across **all** 1..256 and clocks/ranks | **1,287** (period252) |
| Generous upper bound when all 142 exceptions may become E, period256 | **1,422** |
| Generous upper bound when all 142 exceptions may become E, every period1..232 | **at most 1,396** |
| Upper bound when original 86 repeats mean a **different plaintext escape symbol**, every period1..256 | **1,343** (=1,287+56) |

The source-native English control is a genuine GP29 transliteration of three independent text corpora in their entire available lengths. Every contiguous **12,956-rune** window is examined under both ordinary inventory-label spelling and historically reconstructed `ING` / `IO` GP spelling, after independently reproducing authentic solved LP1 `FUNCTION` and all 95 clear LP2 p57 symbols.

| Native GP source | Control windows | Minimum genuine E runes |
| --- | ---: | ---: |
| Gibran, legacy spelling | 50,159 | 1,407 |
| Gibran, corrected source spelling | 49,537 | 1,416 |
| Shakespeare, legacy spelling | 205,845 | **1,397** |
| Shakespeare, corrected source spelling | 204,151 | 1,408 |
| Emerson, legacy spelling | 311,675 | 1,482 |
| Emerson, corrected source spelling | 308,372 | 1,491 |
| **Total** | **1,129,739** | **1,397** |

**Two deductions with different assumptions:**

1. For every period **1–232**, not even a cipher that freely lets **all 86 repeat escapes plus 56 IV positions** become E can produce as many E runes as **any** of the independently tested native GP-English control windows. This is independent of what plaintext symbol repeats mean.
2. For every period **1–256**, if the reserved repeat/escape plaintext symbol is **not E** (e.g. the earlier specifically tested GP-native EA/index28 escape), then **at most 1,343 E** are attainable after granting all 56 IV positions arbitrary plaintext. That is **at least 54 fewer E** than the weakest control English window. Every possible repeating 256-phase rank-substitution key, including the entire unknown 256-byte numerical-key candidate space, is incompatible with those full-length native-English windows under this architecture.

The two distinct conclusions matter: beyond period232, without an independently supported non-E escape identity, the all-exception upper bound is not a proof of exclusion. Additionally, this cannot exclude texts with unusual E scarcity, non-English plaintext, a preliminary compressed/binary register, secret changing **source-rune order** before the rank operation, clock states responding to source content, per-page independently chosen 256-symbol keys, or an unrelated cipher. It is a **conditional native-language no-go**, not an assertion about all possible encryption methods.

## Independent 256-phase equality invariant without a chosen escape symbol

There is an additional **key-independent and escape-identity-independent diagnostic** for the source-fixed rank architecture, especially useful at period256 where the conservative all-free **E-count bound alone** does not eliminate all candidate outputs. At each fixed key phase, a secret 28-way rank-to-plaintext bijection preserves **which pairs of recovered plaintext symbols are equal**. This can be measured directly in the ciphertext, with no key entropy search.

Delete all **142** unclaimed source positions from the original and from every candidate native plaintext control, matching exact absolute indices. For phase `j=0..255` and rank `r=0..27`, compute the original counts `n[j,r]`. Define the collision invariant

`Q=SUM_j SUM_r n[j,r](n[j,r]-1) / SUM_j N_j(N_j-1)`,

where `N_j=SUM_r n[j,r]`. **Every possible 256 independent secret rank permutations preserves Q exactly**. A prospective plaintext should have the same phase-equality statistic when its GP letters are counted at those same 12,814 eligible positions and under the same phase clock. The 86 adjacent-repeat sites remain unconstrained; this test imposes **no assumption** about the plaintext letter or escape meaning at any original repeated position. This is materially different from requiring a non-E EA marker in the E-count proof.

For the same **16** original source clock / rank cases (book, page, section, illuminated chapter; all-rune or nonfree-rune advance; cyclic or sorted alphabet order), select **150 deterministic equally spaced full-length 12,956-rune windows** from each of the six independently encoded native-English source configurations. There are **900 native controls per clock case**, **14,400** matched comparisons total. All are scored after removing exactly the original 142 unconstrained source sites.

| Test | Original result |
| --- | ---: |
| Across 16 original 256-phase clocks, **largest source Q** | **0.03629385269301529** |
| Across 14,400 native GP-English controls, **smallest Q** | **0.05630316188273788** |
| Native controls with Q at or below their corresponding original source Q | **0/14,400** |
| Separate solved-p57 native GP positive, 12,956 generated symbols | **12,956/12,956 exact plaintext recovered** |
| Positive generated rank and genuine clear-GP collision Q | **0.06969947563290545, exactly equal** |

The separation is **at least 0.02000930918972259** in normalized equal-pair probability, even though source controls allow the GP alphabet's full 29 labels while the model's eligible channel holds at most28. The controls are intentionally spaced but can overlap and should not be interpreted as 14,400 independent random trials. The evidence rejects compatibility with **these actual independently sourced and orthographically pinned native-English registers**, rather than proving an absolute impossibility for every conceivable English text. An adversarially crafted unnatural source sequence could be much flatter.

Independent reproduction: [single-file original-input equality-invariant SFT](../sims/lp2_rank28_period256_allsecret_phasecollision_sft.cjs), [Windows Node22 passing run 45062198381](https://github.com/FlareZ123/liber-primus/actions/runs/45062198381). A separate planted ciphertext is produced with the original 256-cell table key, authentic solved-p57 native text, and three forced escape sites; the known-key inverse recovers every rune, and the theorem's phase-collision numerators match exactly. This experiment therefore closes the earlier period256 **marker=E loophole** against the 900 fixed matched source controls per mode. It leaves changing/secret **ciphertext-rune order**, page-specific independent key tables, genuinely unusual plaintext, and non-native encodings outside its scope.

## Complete high-period closure: every period233–256, without specifying the repeat symbol

The **exact** E-capacity theorem above excludes every candidate period **1–232** even when all 142 original exceptions, including every identical adjacent pair, may decode as E. The fully general no-repeat escape convention remains uncertain for periods 233–256. Rather than guess the symbol at repeated positions or try arbitrary 28-ary keys, apply the same **key-invariant within-phase equality** comparison described above to **every one of the remaining 24 integer periods**, not merely period256.

For each period 233–256, every original source clock (book-continuous, physical-page, eight `# GP28 predecessor exclusion with any secret 1–256-phase key: exact native E-rune obstruction

**Agent39, 22 November 2026. Source-original all-secret family exclusion through period256, combining exact frequency bounds with phase-equality invariants.** The strongest short-period result allows **arbitrary secret orderings of all 29 ciphertext rune identities at every key phase**, together with arbitrary 28-way plaintext substitutions, and excludes all periods **1 through 43**. The second tier retains the original cyclic/sorted GP order and covers **all periods 1 through 256** with arbitrary 28-way substitutions. The E-frequency branches are exact finite upper bounds on a single recovered plaintext rune. The independent phase-collision branch covers the full remaining key-period range without hypothesizing a repeat symbol. It requires no key discovery or probabilistic search and operates on **all 12,956 intact unknown LP2 GP29 runes**. The result excludes direct recovery of the tested source-native English controls under the stated reversible predecessor-exclusion architecture. **It recovers no new LP2 plaintext, authentic key, or destination.**

## Why this is an actionable architectural exclusion

Original p49–51 prints a 256-cell, 32×8 numerical table, so a 256-symbol periodic cipher key is a visible, technically plausible option. The original unknown text is nearly uniform in its 29-rune inventory, yet across all 55 rune-bearing physical pages only **86** of 12,901 within-page successors equal their predecessor. A reversible lossless cipher can exploit the 28 alternative next-symbol choices: the 29th plaintext symbol becomes an explicit identical-ciphertext escape. This provides a concrete explanation for rare ciphertext repeats **if** the source actually uses that channel; neither the numeric table nor the original text authenticates it.

The direct table-byte rank28 shift was already tested in [p50 direct256 rank28](lp2-p50-direct256-rank28-nonbacktracking-gate.md); literal eight AES/ChaCha column keys were more broadly tested in [grid-rank28 keyed exclusion](grid-rank28-keyed-exclusion.md). Prior [period13 all-secret rank capacity](lp2-rank28-period13-allsecret-original-gate.md) also allows arbitrary cipher alphabet ordering. Those tests leave the **entire unknown 256-symbol periodic key family** unaddressed, including hypothetical key schedules unconnected to p50. This result eliminates that key search outright for the declared native-English register. There is no need to enumerate `28^256` possible additive keys or individual symmetric primitives.

## Exact source and reversible decoder family

The canonical original corpus contains **12,956** GP29 ciphertext glyphs in p0–55. The 55 page initial symbols, **one additional original `$`-section initial that falls inside a physical page**, and **86** equal-successor symbols are conservatively marked as **142 completely unconstrained positions**, with **12,814** ordinary nonrepeat successor symbols.

At each ordinary position decode the original GP29 pair `(previous,current)` to a rank in 0..27 by either:

- **Cyclic 28-way rank:** `r=(current-previous-1) mod29`, after verifying `current!=previous`.
- **Sorted 28-way rank:** `r=current-Number(current>previous)`, deleting the predecessor from the ordered GP29 alphabet.

Each phase of an arbitrary periodic secret key can apply **any** of the 28! bijections from rank values 0..27 to plaintext symbols. That includes every possible additive mod28 shift at that phase and much more; the sixteen observed clock families allow **four** reset modes (continuous, physical page, eight printed `$` sections, nine illuminated chapters), **two** clock-consumption policies (every original rune or only unmarked/unequal successor runes), and both cyclic/sorted original rank conventions. For each mode **every period 1,2,3,...,256 is separately evaluated**, totaling **4,096** whole-source mode/period combinations. The secret permutation can be independently reselected at each phase and each mode; the analysis grants this adversarial freedom.

For one fixed original clock, period `m`, and rank convention, let `n[j,r]` be the count of original nonexceptional positions falling into phase `j` and observed rank `r`. Every hypothetical plaintext GP rune **E** must be assigned to **one** rank in each phase under a bijection. Consequently the **exact maximum E occurrences** across all secret phase permutations is

`M(m) = SUM(j=0..m-1) MAX(r=0..27) n[j,r]`.

This is attainable at each phase and cannot be increased by changing any secret substitution mapping. No language model is used to derive it; the English source controls enter only when judging whether the upper bound is compatible with real prose.

## Stronger exact result: arbitrary secret ciphertext alphabet order through period43

The prior source research established an exact one-rank bound under **every possible hidden ordering of the 29 ciphertext GP identities** at one key phase, by reducing the order search to 406 endpoint pairs rather than enumerating 29! permutations ([period13 predecessor work](lp2-rank28-period13-allsecret-original-gate.md)). This result extends that theorem to **every key period 1–60 inclusive**, each of the eight book/page/section/chapter × all/nonrepeat clocks, and the complete 12,956 original runes.

For each phase j, form the 29×29 directed transition-count table `T_j[s,c]` of original unequal adjacent symbols. Any hidden GP alphabet order maps any one secret 28-way plaintext rank to the two adjacent destination symbols `a,b` in that secret order. The exact maximal number of one plaintext rune (e.g. E) attained at that phase is

`W(T_j)=MAX(a<b){T_j[a,b]+T_j[b,a]+SUM(s!=a,b) MAX(T_j[s,a],T_j[s,b])}`.

The bound is attained by placing every other source rune on whichever side of the adjacent pair permits its more frequent destination. The source order and the plaintext rank relabeling are each allowed to vary **independently at every phase**. Sum `W(T_j)` over phases and grant all **142** source exception sites arbitrary E. Small-alphabet exhaustive `q=4,5,6` permutation oracles validate the formula for 36 independent weighted transition tables.

| Unknown period | Maximum original E after granting 142 free positions, any ciphertext ordering and any output alphabet |
| --- | ---: |
| 1 | 716 |
| 13 | 1,036 |
| 23 | 1,177 |
| 29 | 1,240 |
| 32 | 1,288 |
| **Any period 1–43** | **At most 1,372** (maximum at period42) |
| 43 alone | 1,370 |
| **44** | **1,398**, first period not excluded by the E-only criterion |
| 60 | 1,526 |

Every 12,956-rune native-English control window has at least **1,397 E**. Thus **not one of the 344 source-clock and key-period combinations from period 1 to 43 can directly decrypt to any of those source-native English windows**, even after allowing a wholly unknown 29! source alphabet and independent 28! output mapping at every phase and even if **all** rare ciphertext repetitions could be E. The threshold **44** is only the first phase cardinality for which E frequency ceases to rule the model out; it is no evidence of a genuine 44-phase key. This all-order statement is stronger than the fixed-source-rank tier below for periods ≤43 and removes the separate assumption about which plaintext symbol ciphertext repeats encode.

The [separate all-source-order Node22 CJS reproducer](../sims/lp2_rank28_period43_allsecret_alphabet_capacity_sft.cjs) computes all periods1–60 on the original ciphertext and proves the exact endpoint-pair bound against 36 independent small-alphabet exhaustive oracles. It encrypts and recovers **12,956/12,956** original-solved-p57-derived native plaintext runes under a fully secret noncanonical GP29 ciphertext order and an actual table-derived 256-phase secret rank key, confirming that the mathematical bound accepts true native GP plaintexts in the declared cipher class. [Successful Windows run 45061788402](https://github.com/FlareZ123/liber-primus/actions/runs/45061788402) records original threshold and positive.

## Additional exact result: original fixed-order periodic ranks up to256


| Original rank-bound question | Exact result |
| --- | ---: |
| Nonexceptional original rank positions | **12,814** |
| Fully free initial/repeat positions granted | **142** |
| Clock/rank variants | **16** |
| Different key periods per variant | **256** |
| Original maximum `M(256)` across all 16 clocks/ranks | **1,280** |
| Original maximum `M(m)` across **all** 1..256 and clocks/ranks | **1,287** (period252) |
| Generous upper bound when all 142 exceptions may become E, period256 | **1,422** |
| Generous upper bound when all 142 exceptions may become E, every period1..232 | **at most 1,396** |
| Upper bound when original 86 repeats mean a **different plaintext escape symbol**, every period1..256 | **1,343** (=1,287+56) |

The source-native English control is a genuine GP29 transliteration of three independent text corpora in their entire available lengths. Every contiguous **12,956-rune** window is examined under both ordinary inventory-label spelling and historically reconstructed `ING` / `IO` GP spelling, after independently reproducing authentic solved LP1 `FUNCTION` and all 95 clear LP2 p57 symbols.

| Native GP source | Control windows | Minimum genuine E runes |
| --- | ---: | ---: |
| Gibran, legacy spelling | 50,159 | 1,407 |
| Gibran, corrected source spelling | 49,537 | 1,416 |
| Shakespeare, legacy spelling | 205,845 | **1,397** |
| Shakespeare, corrected source spelling | 204,151 | 1,408 |
| Emerson, legacy spelling | 311,675 | 1,482 |
| Emerson, corrected source spelling | 308,372 | 1,491 |
| **Total** | **1,129,739** | **1,397** |

**Two deductions with different assumptions:**

1. For every period **1–232**, not even a cipher that freely lets **all 86 repeat escapes plus 56 IV positions** become E can produce as many E runes as **any** of the independently tested native GP-English control windows. This is independent of what plaintext symbol repeats mean.
2. For every period **1–256**, if the reserved repeat/escape plaintext symbol is **not E** (e.g. the earlier specifically tested GP-native EA/index28 escape), then **at most 1,343 E** are attainable after granting all 56 IV positions arbitrary plaintext. That is **at least 54 fewer E** than the weakest control English window. Every possible repeating 256-phase rank-substitution key, including the entire unknown 256-byte numerical-key candidate space, is incompatible with those full-length native-English windows under this architecture.

The two distinct conclusions matter: beyond period232, without an independently supported non-E escape identity, the all-exception upper bound is not a proof of exclusion. Additionally, this cannot exclude texts with unusual E scarcity, non-English plaintext, a preliminary compressed/binary register, secret changing **source-rune order** before the rank operation, clock states responding to source content, per-page independently chosen 256-symbol keys, or an unrelated cipher. It is a **conditional native-language no-go**, not an assertion about all possible encryption methods.

## Independent 256-phase equality invariant without a chosen escape symbol

There is an additional **key-independent and escape-identity-independent diagnostic** for the source-fixed rank architecture, especially useful at period256 where the conservative all-free **E-count bound alone** does not eliminate all candidate outputs. At each fixed key phase, a secret 28-way rank-to-plaintext bijection preserves **which pairs of recovered plaintext symbols are equal**. This can be measured directly in the ciphertext, with no key entropy search.

Delete all **142** unclaimed source positions from the original and from every candidate native plaintext control, matching exact absolute indices. For phase `j=0..255` and rank `r=0..27`, compute the original counts `n[j,r]`. Define the collision invariant

`Q=SUM_j SUM_r n[j,r](n[j,r]-1) / SUM_j N_j(N_j-1)`,

where `N_j=SUM_r n[j,r]`. **Every possible 256 independent secret rank permutations preserves Q exactly**. A prospective plaintext should have the same phase-equality statistic when its GP letters are counted at those same 12,814 eligible positions and under the same phase clock. The 86 adjacent-repeat sites remain unconstrained; this test imposes **no assumption** about the plaintext letter or escape meaning at any original repeated position. This is materially different from requiring a non-E EA marker in the E-count proof.

For the same **16** original source clock / rank cases (book, page, section, illuminated chapter; all-rune or nonfree-rune advance; cyclic or sorted alphabet order), select **150 deterministic equally spaced full-length 12,956-rune windows** from each of the six independently encoded native-English source configurations. There are **900 native controls per clock case**, **14,400** matched comparisons total. All are scored after removing exactly the original 142 unconstrained source sites.

| Test | Original result |
| --- | ---: |
| Across 16 original 256-phase clocks, **largest source Q** | **0.03629385269301529** |
| Across 14,400 native GP-English controls, **smallest Q** | **0.05630316188273788** |
| Native controls with Q at or below their corresponding original source Q | **0/14,400** |
| Separate solved-p57 native GP positive, 12,956 generated symbols | **12,956/12,956 exact plaintext recovered** |
| Positive generated rank and genuine clear-GP collision Q | **0.06969947563290545, exactly equal** |

The separation is **at least 0.02000930918972259** in normalized equal-pair probability, even though source controls allow the GP alphabet's full 29 labels while the model's eligible channel holds at most28. The controls are intentionally spaced but can overlap and should not be interpreted as 14,400 independent random trials. The evidence rejects compatibility with **these actual independently sourced and orthographically pinned native-English registers**, rather than proving an absolute impossibility for every conceivable English text. An adversarially crafted unnatural source sequence could be much flatter.

Independent reproduction: [single-file original-input equality-invariant SFT](../sims/lp2_rank28_period256_allsecret_phasecollision_sft.cjs), [Windows Node22 passing run 45062198381](https://github.com/FlareZ123/liber-primus/actions/runs/45062198381). A separate planted ciphertext is produced with the original 256-cell table key, authentic solved-p57 native text, and three forced escape sites; the known-key inverse recovers every rune, and the theorem's phase-collision numerators match exactly. This experiment therefore closes the earlier period256 **marker=E loophole** against the 900 fixed matched source controls per mode. It leaves changing/secret **ciphertext-rune order**, page-specific independent key tables, genuinely unusual plaintext, and non-native encodings outside its scope.

 sections, nine illuminated chapters; consuming all source runes or just source-eligible runes) has its original 142 exceptions erased. Its eligible 12,814 ciphertext runes are ranked by **both cyclic and sorted 28-way predecessor exclusion**. An arbitrary secret 28-way plaintext permutation may independently vary at every phase. The equal-symbol pair probability `Q` of each phase remains immutable for every such secret. The same **900 predetermined, full-length, original-position-aligned** native GP-English control windows are tested per period and clock family, including both orthographies and three independent literary corpora. This is **24 periods × 8 source clocks × 900 control windows = 172,800 native-control comparisons**, each against **both** original rank representations. They are selected by source coverage rather than fitted to ciphertext; overlapping windows are correlated controls.

| Period233–256 source-unchanged result | Value |
| --- | ---: |
| Distinct integer periods covered | **24, all 233–256** |
| Original output rank conventions per comparison | **2 (cyclic and sorted)** |
| Native window/source-clock comparisons | **172,800** |
| Largest original phase Q of any of the 384 cipher configurations | **0.03650806039005524** |
| Smallest source-native Q in all 172,800 matched controls | **0.05605067805137832** |
| Narrowest same-clock original-to-source Q gap | **0.019903141979683438** |
| Native controls at or below the matching original source Q | **0/172,800** |
| Fresh period233 original-solved-p57 12,956-rune reversible positive | **12,956/12,956 recovered** |
| Fresh period233 cipher rank Q and true plaintext GP Q | **both exactly 0.06697381984270265** |

Thus the complete source-fixed predecessor-rank mechanism is now blocked across **every key period 1–256** against the tested original-sized, independently sourced native-GP-English controls, **without knowing whether the 86 original repeats mean E, EA, F, or something else**. The short-period mathematical result is unconditional with respect to those exceptions; the remaining high-period exclusion is an exact key-invariant statistic evaluated against a substantial, finite collection of authentic language registers. It is not a universal theorem for every possible intentionally atypical English sequence. It is stronger than rejection of a few guessed cipher keys and directly rules out all phase-specific secret substitutions within the fixed-rank model.

Complete reproducer: [all 24 original high-period source and solved-plaintext checks](../sims/lp2_rank28_period233_256_collision_allsecret_sft.cjs), [passing Windows Node22 run 45062722482](https://github.com/FlareZ123/liber-primus/actions/runs/45062722482).

## Independent solved-source positive

The same program constructs two independent **12,956-symbol** ciphertexts from actual solved LP2 p57 native GP text repeated to match the target length, with three forced GP28-EA escape symbols. It uses the authentic 256 printed table-cell bytes mod28 as an example key, one cyclic-rank consuming clock and one sorted-rank nonconsuming clock. In both cases encryption and decryption reconstruct exactly **12,956/12,956** source-native plaintext runes. Their native control has **2,044 E** occurrences and the all-secret bound on the synthetic generated cipher is **2,256** or **2,289** including permitted IVs, so the obstruction correctly *accepts* real native GP language encoded using its own declared cipher family. These controls establish that the source-original negative is about the ciphertext, not an impossible encoder or broken E counting.

Reproduction: [standalone Windows Node22 CJS SFT](../sims/lp2_rank28_period256_allsecret_e_capacity_sft.cjs), [successful source and planted-control run 45061306913](https://github.com/FlareZ123/liber-primus/actions/runs/45061306913). The executable pins original ciphertext counts, all 1,129,739 native matched prose windows, the solved source spelling, and the exact all-secret phase maxima. It emits the complete 16-mode period256 table and summary.

## Cryptanalytic decision

**Retire every fixed-GP-order predecessor-exclusion periodic key family of periods 1–256 as a direct decoding route to the tested ordinary GP-English registers.** Every possible secret period≤232 fails the original E-count theorem even when all repeats may be E. Every period233–256 fails key-invariant phase-collision comparisons with **172,800** original-length native controls (both rank conventions checked). A stronger secret-original-rune-order theorem also excludes all periods 1–43 without specifying the ciphertext alphabet. No original repeated position is required to denote a preselected plaintext symbol. The high-period statement is a finite authentic-source comparison, as opposed to an unconditional theorem about all conceivable English texts. The key entropy can be enormous and still fail a single-letter conservation law. A future attempt would need an independent authored clue selecting a fundamentally different information-preserving transform, a changing ciphertext alphabet ordering/clock, a non-native intermediate register, or a source-specific unexpected plaintext language; another long random-key sweep within this family cannot repair the capacity deficit.
