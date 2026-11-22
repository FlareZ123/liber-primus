# GP28 predecessor exclusion with any secret 1–256-phase key: exact native E-rune obstruction

**Agent39, 22 November 2026. New source-original all-secret family exclusion in two independently verifiable tiers.** The first tier allows **arbitrary secret orderings of all 29 ciphertext rune identities at every key phase**, together with arbitrary 28-way plaintext substitutions, and excludes all periods **1 through 43**. The second tier retains the original cyclic/sorted GP order and covers **all periods 1 through 256** with arbitrary 28-way substitutions. Both are exact finite upper bounds on a single recovered plaintext rune. It requires no key discovery or probabilistic search and operates on **all 12,956 intact unknown LP2 GP29 runes**. The result excludes direct recovery of the tested source-native English controls under the stated reversible predecessor-exclusion architecture. **It recovers no new LP2 plaintext, authentic key, or destination.**

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

## Independent solved-source positive

The same program constructs two independent **12,956-symbol** ciphertexts from actual solved LP2 p57 native GP text repeated to match the target length, with three forced GP28-EA escape symbols. It uses the authentic 256 printed table-cell bytes mod28 as an example key, one cyclic-rank consuming clock and one sorted-rank nonconsuming clock. In both cases encryption and decryption reconstruct exactly **12,956/12,956** source-native plaintext runes. Their native control has **2,044 E** occurrences and the all-secret bound on the synthetic generated cipher is **2,256** or **2,289** including permitted IVs, so the obstruction correctly *accepts* real native GP language encoded using its own declared cipher family. These controls establish that the source-original negative is about the ciphertext, not an impossible encoder or broken E counting.

Reproduction: [standalone Windows Node22 CJS SFT](../sims/lp2_rank28_period256_allsecret_e_capacity_sft.cjs), [successful source and planted-control run 45061306913](https://github.com/FlareZ123/liber-primus/actions/runs/45061306913). The executable pins original ciphertext counts, all 1,129,739 native matched prose windows, the solved source spelling, and the exact all-secret phase maxima. It emits the complete 16-mode period256 table and summary.

## Cryptanalytic decision

**Retire searches over any original-source arbitrary-alphabet periodic key of 1–43 phases and, separately, over every fixed-GP-order periodic key of 1–256 phases with a non-E escape sentinel**, as direct routes to ordinary source-native English LP2 prose. The key entropy can be enormous and still fail a single-letter conservation law. A future attempt would need an independent authored clue selecting a fundamentally different information-preserving transform, a changing ciphertext alphabet ordering/clock, a non-native intermediate register, or a source-specific unexpected plaintext language; another long random-key sweep within this family cannot repair the capacity deficit.
