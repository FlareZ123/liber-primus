# Every secret rune ordering: exact one- and two-rank predecessor-exclusion capacities

**Agent 34, 13 November 2026. Evidence class:** all-secret exact combinatorial capacity theorem applied to the unchanged original LP2 ciphertext, with full original-shape native-English controls. It closes the unknown *underlying rune order* loophole left by the canonical-order predecessor-exclusion rank test, including **independent secret ordering and symbol relabeling for every physical page**. **No unknown LP2 plaintext, authentic cipher/key or destination has been recovered.** The exact single-rank and newly corrected joint-two-rank bounds both apply to this precise reversible 28-way rank cipher, and do not generalize to independently evolving rank tables at each word or symbol.

## Human candidate and decisive mathematical question

The original 55 rune-bearing, still-encrypted LP2 physical pages have **12,956** GP29 symbols, **12,901** within-page successor positions and only **86** identical successive rune pairs. This motivated a simple lossless content code: at each nonrepeat position, exclude the immediately previous ciphertext rune from the GP29 inventory, then represent the current rune by its rank among the 28 remaining symbols. A 29th code/escape is needed for the 86 repeated-ciphertext sites; treat them as unconstrained erasures. Every page initial is likewise free. This leaves **12,815 source-defined content digits**, each 0..27.

The [earlier canonical predecessor-rank inverse](no-repeat-rank-inversion.md) used natural GP index ordering or cyclic order and ruled out a *fixed rank-label permutation* by a low observed rank coincidence index. It did not exhaust the much larger possibility of **a secret order of the 29 ciphertext rune identities themselves**. Under a different order, selecting the rank of the current rune after excluding its predecessor may produce an entirely different rank stream. The [unknown-global-order radix28 byte gate](adaptive-radix28-global-order-sieve.md) instead addressed exact 5n-to-3n byte packets, not GP-native word content. This report resolves the plaintext-rank capacity of the unknown-order model without searching 29! candidates.

**Claimed decoder:** choose any secret 29-rune ordering π, constant throughout a chosen source unit. Write \`pos(r)\` for the rune's position 0..28 in π. For two consecutive unequal original ciphertext runes \`s,c\`, decode

\[
d=\operatorname{pos}(c)-\mathbf1[\operatorname{pos}(s)<\operatorname{pos}(c)] \in\{0,\ldots,27\}.
\]

The exact inverse selects the \`d\`-th rune of π after removing \`s\`. Grant an arbitrary secret 28-way bijection from these digits to plaintext rune identities, independently for *each physical page*. This can hide which rank stands for E, but cannot change the maximum number of repetitions of a single decoded letter within that page. Original doublets and first runes have **no restrictions at all** and therefore favor the hypothesis.

## Exact maximum over every underlying secret ordering

For a set of original pages, form the 29×29 transition matrix \`T[s,c]\` counting adjacent **unequal** original ciphertext runes. A decoded rank \`d\` can originate only from two adjacent identities \`a=π[d]\` and \`b=π[d+1]\`. If the preceding rune \`s\` is placed before \`a\`, the output must be \`b\` and contributes \`T[s,b]\`. If \`s\` is after \`b\`, it must be \`a\` and contributes \`T[s,a]\`. The pair's two mutual transitions always contribute. Placing every other predecessor on the more favorable side yields the **attainable exact maximum**, not merely an upper estimate:

\[
\boxed{M(T)=
\max_{a<b}\left[
T[a,b]+T[b,a]+\sum_{s\notin\{a,b\}}
\max\big(T[s,a],T[s,b]\big)
\right].}
\]

Every maximizing choice is realizable as an actual permutation by putting the \`s\` values that favor \`b\` before adjacent \`a,b\`, and the others after. A separate unknown bijection from ranks to plaintext letters cannot increase a letter's count beyond \`M(T)\`. The formula takes only **406 unordered symbol pairs ×27 predecessor comparisons**, rather than 29! brute force. A separate independent five-symbol exhaustive-permutation oracle confirms the theorem in the reproducer. It also constructs a maximizing 29-way ordering and checks that the original reconstructed rank stream **attains** the reported maximum.

| Independent hidden rune ordering | Original content-rank positions | Exact maximum of any *chosen plaintext letter* | Largest possible proportion |
| --- | ---: | ---: | ---: |
| One order shared across all unknown pages | 12,815 | **574** | **4.47913%** |
| Nine independent source-visible visual chapters | 12,815 | **778** | **6.07101%** |
| **One entirely independent order and rank-label alphabet for each rune-bearing page (55 separate secrets)** | **12,815** | **1,292** | **10.08194%** |

The middle row is the sum of exact per-chapter maxima **[53,77,102,111,64,86,99,158,28]**, in physical chapter intervals \`0–2,3–7,8–14,15–22,23–26,27–32,33–39,40–53,54–55\`. The global 574 maximum is achieved by making original GP rune labels **OE** and **A** adjacent in an otherwise adversarially optimized secret order. The rank count is exactly 574 on the original input. The per-page bound **1,292** is a sum of 55 independently optimized upper capacities: no order or output label assignment is shared across pages. Thus it already grants the model an enormous amount of independent hidden key material.

## Exact maximum of **two** decrypted letters, even under 55 secret page keys

The previous experimental two-rank bound of 2,379 was **retracted** because its first combinatorial derivation omitted touching rank pairs: a five-rune test produced 58 instead of the actual 61. The corrected theorem below treats touching and disjoint pairs separately, proves realizability, and independently recomputes 2,379 from original ciphertext. The numerical agreement does **not** rehabilitate the retracted proof.

For a secret ordered GP29 alphabet, choose any two distinct rank outputs \(r_1<r_2\) of the 28-way predecessor-exclusion decoder. The two source-alphabet adjacent pairs can be **touching** \((a,b,c)\) or **disjoint** \((a,b,c,d)\), listed in alphabet order. Let \(U_s(x,y)=T[s,x]+T[s,y]\), with \(T\) the exact original off-diagonal predecessor transition counts.

For **touching** output ranks, the attainable total occupancy is

\[
J_3(a,b,c) =
T[a,b]+T[a,c]+T[b,a]+T[b,c]+T[c,a]+T[c,b]
+\sum_{s\notin\{a,b,c\}}\max\{U_s(b,c),U_s(a,b)\}.
\]

For **disjoint** ranks the attainable occupancy is

\[
\begin{aligned}
J_4(a,b,c,d)={}&T[a,b]+T[a,d]+T[b,a]+T[b,d]\\
 &+T[c,a]+T[c,d]+T[d,a]+T[d,c]\\
 &+\sum_{s\notin\{a,b,c,d\}}\max
 \{U_s(b,d),U_s(a,d),U_s(a,c)\}.
\end{aligned}
\]

In the touching case, each other predecessor may be placed before \(a\) or after \(c\); in the disjoint case it may be placed before \(a\), between \(b,c\), or after \(d\). Each predecessor's preferred region can be chosen independently, and the corresponding groups can be concatenated into an actual secret rune permutation. Thus \(\max(J_3,J_4)\) over ordered distinct endpoints is an **exact realizable maximum**, including all hidden orders and both output ranks, rather than an upper estimate or a language-optimized key. The reproducer reconstructs an attaining order and verifies both rank bins on the unchanged original input. The formerly failing five-rune oracle now produces the correct **61**, and 30 further seeded five- and six-rune exhaustive permutation comparisons agree.

| Secret underlying alphabet | Two-rank capacity on 12,815 constrained positions |
|---|---:|
| Single ordering across all 55 rune-bearing unknown pages | **1,118** |
| Nine independently keyed original visual chapters (0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55) | **1,472** |
| Fully independent hidden ordering **and** rank-to-plaintext bijection per rune-bearing page, 55 separate keys | **2,379** |

The nine chapter exact maxima are [98, 146, 190, 210, 122, 161, 187, 307, 51]. The 55-page bound grants a different pair of winning plaintext ranks and optimal underlying ordering on *every page*. No decipherment assumes that the plaintext letters' rank positions remain consistent across pages.

Using the same original 141 unconstrained page-initial/doublet positions, independently scan all **567,679** full-12,956-rune contiguous GP-native English windows in the three original fixed controls. At each window, find its two most frequent plaintext rune identities *after removing the 141 free positions*. Their minimum combined counts are **2,517** (Gibran; at rune window 36,540; E+O), **2,418** (Shakespeare; at 192,716; E+I), and **2,479** (Emerson; at 299,973; E+A). Each exceeds the 55-key capacity **2,379**, with the tightest deficit **39** runes. These are minima over every original-length window, not selected average frequencies.

**Decision:** no constant-per-physical-page secret-ordered predecessor-exclusion GP28 rank decoder can produce *any of those specific native GP29 English passages*, even when the key and pair of plaintext rank labels vary independently for each page and all 141 exceptional positions are free. It does not exclude a different plaintext register, a changing-symbol state, or a code with genuinely supplied side information. No unknown LP2 plaintext, authentic key or final destination is obtained. [Corrected exact joint-rank SFT](../sims/lp2_no_repeat_two_rank_exact_sft.cjs).

## Full-original-length native English test, every possible window

As an independent control, use the repository's historically established GP29 transcription procedure: uppercase; QU→CW, V→U, K/Q→C, Z→S; greedily recognize 29 standard rune transliterations. The chosen common letter E has canonical GP index **18**. No alphabet mapping is inferred from the LP2 ciphertext or tuned to make the native controls fail.

For each independent reference, inspect **every contiguous 12,956-rune window**. Use the exact source LP2 page shapes: remove from the English E count the 55 original page-initial positions and the 86 actual original repeated-ciphertext positions (141 arbitrary free locations), leaving an exact count at the **same 12,815 constrained source positions** on which the theorem operates. All 141 free positions are allowed to be E in the hypothetical plaintext, with no constraint. Compare the resulting *E count on the constrained content positions* to the exact 1,292-per-page-keys maximum.

| Fixed reference | Contiguous original-length windows checked | Minimum GP **E** on 12,815 constrained original positions | Window start attaining minimum |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | **50,159** | **1,381** | 21,238 |
| Shakespeare, first 300k printed characters | **205,845** | **1,372** | 100,411 |
| Emerson, *Essays* | **311,675** | **1,459** | 39,070 |
| **All three** | **567,679** | **1,372** | |

**Every one of the 567,679 real source-text windows violates the 1,292-symbol upper bound**, even after giving the putative cipher 55 fully independent secret rune orders, 55 independently secret rank alphabets, and unrestricted output at all 141 exceptional positions. The smallest gap is **80 E runes** (Shakespeare); the model has no possible secret key for these native plaintext windows. If a proposed 28-rank plaintext alphabet omits E altogether, only the 141 freely granted positions could contain E, an even stronger conflict.

This is a **finite-language-register exclusion**, not an impossibility theorem for any conceivable English text, compressed intermediate or message containing unusually little E. Because the control windows overlap, do not interpret their number as independent significance trials. The conclusion also assumes a *single* underlying order and a *single* rank-to-plaintext bijection on each physical page; freely changing the order midpage, varying it by a hidden key stream, changing the plaintext encoding rate, or transferring information through the erasure sites under a different codec falls outside this precise model. Those variants require a source-selected operation before an unconstrained search is justified.

## Why it advances the cryptanalytic decision

This result removes a tempting missing-key rescue of a literal predecessor-exclusion decoder. A mystery 29-way rune ordering cannot turn the observed near-uniform no-repeat ranks into the native English frequency distribution, **even if completely reselected on every page**. The exact capacities of one decoded symbol and of two simultaneously decoded symbols are now derived with the secret alphabet unobserved. Neither a global order nor any of 55 independent hidden page orders can generate the checked GP-native English controls. This removes the previously unresolved two-rank extension without a factorial key search.

The underlying low-doublet phenomenon remains unexplained. A clue-supplied evolving state, a different nonnative content register, a reversible variable-length code, or an external high-entropy key may be viable only with an executable independently sourced inverse. This report does not authenticate the predecessor-exclusion mechanism itself and produces **zero recovered original plaintext**.


**Original-source manual CI for the single-rank theorem:** [passing Node 22 full-control run 43384988103](https://github.com/FlareZ123/liber-primus/actions/runs/43384988103) executed the exact current standalone SFT on the remote checkout.

## Reproduce

[Single-rank SFT](../sims/lp2_no_repeat_allorder_page_capacity_sft.cjs) and [corrected two-rank SFT](../sims/lp2_no_repeat_two_rank_exact_sft.cjs) use Node.js 22 and built-in libraries only. It reads the unchanged [canonical original LP2 corpus](../resources/liber-primus/lp2-corpus.json) and three fixed [source controls](../resources/control/), checks the 12,956/12,815/86/141 original inventory, exhausts the **406 adjacent-pair capacities** for each chapter and physical page, constructs a real maximizing original-order decoder, performs an exhaustive 5-way permutation theorem oracle, scans every one of the 567,679 source-native windows at exactly the original 141 free positions, and verifies a complete original-shaped native-content rank encrypt/decrypt plant with all 86 doublet markers preserved.
