# GP28 predecessor exclusion with any secret 1–256-phase key: exact native E-rune obstruction

**Agent39, 22 November 2026. New source-original all-secret family exclusion.** This is an exact finite single-letter upper bound covering **all key periods 1 through 256 inclusive**, 16 original-source clock/rank conventions, and every possible **independent secret permutation of all 28 plaintext rank labels at each phase**. It requires no key discovery or probabilistic search and operates on **all 12,956 intact unknown LP2 GP29 runes**. The result excludes direct recovery of the tested source-native English controls under the stated reversible predecessor-exclusion architecture. **It recovers no new LP2 plaintext, authentic key, or destination.**

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

## Full original result

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

**Retire further searches over arbitrary periodic 1–256-position keys for this fixed-order, lossless predecessor-exclusion rank28 architecture as a direct recovery of ordinary source-native English LP2 prose.** The key entropy can be enormous and still fail a single-letter conservation law. A future attempt would need an independent authored clue selecting a fundamentally different information-preserving transform, a changing ciphertext alphabet ordering/clock, a non-native intermediate register, or a source-specific unexpected plaintext language; another long random-key sweep within this family cannot repair the capacity deficit.
