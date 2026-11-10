# Source-selected (35,79) cyclic packet architecture and key-free original inverse

**Agent 26, 10 November 2026. Classification: an exactly reversible *candidate* channel, an original-source key-independent exclusion of its simplest direct-language instance, and a source-derived but retrospectively recognized origin/width correspondence. No unknown LP2 plaintext, authentic key or authorial encryption method recovered.** All computations use the original canonical 12,956 unsolved LP2 ciphertext rune indices.

## One red title supplies both packet parameters

The [established p15 Fibonacci prime square](../results/fibonacci-prime-spiral.md) and its red nine-rune heading provide two exact, historically noted numbers without a hypothetical plaintext:

- The first four red runes have GP prime-value sum **149**, exactly the **35th** ordinary prime, selected by Fibonacci 34 + 1 in the square.
- The complete first four plus last five red runes have GP prime-value sum **638 = 29 × 22**; the **22nd** prime is **79**, selected by Fibonacci 21 + 1 in that same square.
- 79 and 149 are consecutive outward spiral prime values. A coherent *possible* instruction is therefore **origin 35, width 79**. This is especially relevant because the previously found [79/78 numeric-capacity model](prime79-radix29-packet-gate.md) has exactly one conditional phase/direction survivor, forward phase35.

**Discovery caveat:** the p15 sum/prime facts were already published before this investigation, and phase35 was already selected by testing the original ciphertext. Recognizing their new pairing afterwards cannot authenticate the packet interpretation or be assigned an independent p-value. Their source-exact relationship is useful for specifying a *prospective model* with no chosen free phase or width.

## A complete reversible 164 × 79 circular packet candidate

Let `C[0..12955]` be the concatenated original unsolved GP-index ciphertext in physical-page order, skipping the rune-free physical page50. Treat the sequence *circularly*. Partition from global offset **35** into **164** consecutive 79-symbol packets. Each packet publishes:

1. One *public salt* `s = (C[start] − C[(start−1) mod 12956]) mod29`.
2. **78 payload transitions**. A zero difference is a proposed transparent GP **EA** symbol (index28). For each nonzero difference `d=1..28`, compute the rank `r=d−1`. Under a secret fixed permutation `σ[s,column]` of GP symbols 0..27, decode the plaintext as `σ[s,column]⁻¹(r)`.
3. The next packet continues the published ciphertext state, including the last packet's wrap back to its first published predecessor. Exact circular closure is a necessary condition on encoder-generated salts and can be achieved by selecting two otherwise free packet salts. The original 164 salts are public observations, **not** a discovered key.

This gives **12792 candidate plaintext symbols**, one per payload transition, at exactly the original 12956 ciphertext-runed length with 164 potential IV symbols. The original **all 164/164 salts are nonzero**, every one of 86 ciphertext immediate-equality events falls in a payload position, and the distribution of repeated steps per packet is **95 zero, 54 one, 13 two, 2 three**. The 86 presumed EA positions are conjectural. The absence of salt-position repeats is compatible with this architecture, although some other phases also have no salt repeats.

The [complete CommonJS source and SFT](../sims/prime79_cyclic_salt_inverse.cjs) implements the original inverse, salt/column states, arbitrary independently random secret permutations, exact circular forward emission, key-based recovery, original-marker preservation, and a planted English-GP positive. In successful [manual original-source CI 42817379967](https://github.com/FlareZ123/liber-primus/actions/runs/42817379967), the positive **recovered and re-enciphered all 12,792/12,792 payload symbols**, including 86 EA symbols, with the source/ciphertext cycle exactly closed. This proves the candidate architecture can be made mathematically lossless, not that Cicada used it.

## A key-free necessary condition across `(salt,slot)` states

Regardless of the unknown contents of all 28! secret permutations in every one of the 28 × 78 usable states, two observed nonzero ciphertext ranks in the *same* `(salt,slot)` state are equal **if and only if** their underlying plaintext symbols are equal. Thus the sum of within-state collision counts divided by within-state pair counts is exactly **invariant to every secret permutation key** in this family. Direct source-native GP English or Latin should retain their substantial unigram collision frequency after the row permutations.

| Measure | Value |
| --- | ---: |
| Original all-packet, same-state pair hits | **2,916 / 75,548 = 0.03859798** |
| Original disjoint first82 vs last82 packet same-state hits | **662 / 16,776 = 0.03946113** |
| 1,000 independent original-marker-matched Shakespeare non-EA GP samples | **0.05689098 to 0.06483295** |
| 1,000 independent original-marker-matched Latin Vulgate non-EA GP samples | **0.06832742 to 0.07727537** |
| Explicit exact reversible Shakespeare-source plant, direct non-EA GP register | **0.05855880**, with full 12,792-symbol recovery |

The planted-source ranges use independent with-replacement samples from independently supplied GP rune references, conditioned on the original 86 marker slots, and preserve the original salt-by-column state populations. They test the **direct source-GP alphabet assumption**, not all author spellings, languages, intermediate registers or structured plaintext. Every one of the 2,000 source-matched draws exceeded the original. An arbitrary fixed secret permutation for each of the 2,184 public states cannot repair that collision deficit.

### The 4×41 lattice does not restore a direct GP-English key

The source-derived 164-packet count factors as **4 × 41**, naturally suggesting two stronger secret-table architectures. Let packet `b=0..163` have *either* quarter `q=floor(b/41)` or repeated fourfold lane `ℓ=b mod41`. Now grant the attacker an **independent arbitrary unknown 28! permutation for every (salt, column, q)**, or for every **(salt,column,ℓ)**. These vastly larger key schedules still have exact equality invariants whenever two original packets revisit the same full public state. Counting only such pairs gives:

| Completely arbitrary secret permutation state | Exact original identical nonzero-rank pairs | 1,000 independent GP-English source controls (minimum) | 3,000 *contiguous* Shakespeare GP controls preserving the original 86 marker slots | Exact conditional control lower tail |
| --- | ---: | ---: | ---: | ---: |
| **(salt, column, one of 4 contiguous 41-packet quarters)** | **386/10,640 = 0.03627820** | 0.05281955 | **0/3,000** at or below original (minimum 0.05197368) | **1/3001 = 0.00033322** |
| **(salt, column, one of 41 packet-index mod41 lanes)** | **19/688 = 0.02761628** | 0.03197674 | **1/3,000** at or below original (minimum 0.02761628) | **2/3001 = 0.00066644** |

The 41-lane comparison uses only **nine** distinct same-salt, same-lane packet pairs, totaling 688 eligible relative columns. Its corresponding original count is small but testable. Its 3,000 contiguous-source plants average **0.06116715**; the four-quarter plants average **0.06137039**. All **1,000** separately sampled Latin source controls for each architecture also exceed the original. The contiguous controls choose independently distributed actual start offsets in the original 217,167-symbol GP-encoded non-EA Shakespeare stream, copy 12,706 successive source symbols into the exact original unmarked payload slots, and retain every original marker position; they therefore preserve *source sequence correlations* absent from the simpler unigram samples. Seed `0x26a04179`. All results and the full ordinary secret-table positive inverses are executed in [passed CI 42819678517](https://github.com/FlareZ123/liber-primus/actions/runs/42819678517).

This is a conditional **key-independent obstruction to source-native GP under either separate-quarter or shared-mod41-lane public-state keys**. Increasing the size of the unknown permutation tables within either of these fixed state definitions cannot change a single collision count. A key that changes at each individual 79-rune packet, or another independently derived hidden evolving state, does evade these particular equal-state comparisons but has to be fixed by independent source information to make any genuine plaintext prediction.

The original's measured state collision is nevertheless slightly higher than a source-layout-preserving random association:

| Matched 5,000-trial source-original null | Null mean IOC | Exceedances | Conditional add-one upper-tail |
| --- | ---: | ---: | ---: |
| Shuffle whole-packet public salt labels | 0.03632598 | 47 | **48/5001 = 0.009598** |
| Independently circularly rotate the original 78-rank payload of each packet | 0.03583870 | 17 | **18/5001 = 0.003599** |

The same first/last-half crossfit measured within these null runs gives salt-label upper-tail **88/5001 = 0.017596** and packet-rotation upper-tail **26/5001 = 0.005199**. Both reflect already-selected source phase35 and the constructed statistic, so they are *conditional descriptions*. They leave open plaintext-independent dependencies or deliberate state structure.

## The necessary global phase-selection correction

The source-original phase35 statistic is the **largest of all 79 cyclic phase offsets**, with IOC `2916/75548=0.03859798`; the next phases 56 and 29 yield `0.03831696` and `0.03817280`. The phase35 maximum was recognized using the manuscript and cannot be evaluated using a phase-fixed null alone.

We therefore **refitted the maximum over all 79 phases** on each of **150** independent physical-page circular-rotation nulls, preserving each page's exact rune histogram, cyclic adjacency and length, with seed `0x26a07935`. **19/150** surrogates had maxima at least as large as the original. The exact executed add-one **familywise p=20/151=0.13245033**; null mean maximum `0.03807359`. This search-wide test **does not establish a distinguished 79-clock**. The source-derived 35/79 pairing remains a rationale for a falsifiable model rather than independent confirmation of it. The familywise negative and the exact marker/positive controls ran together in [CI 42817379967](https://github.com/FlareZ123/liber-primus/actions/runs/42817379967).

## Cryptanalytic decision

**Specific family bounded:** a single fixed bijection `σ[s,column]` for every externally visible packet IV and position, fed directly by native English- or Latin-like GP runes except for proposed transparent EA symbols, is strongly inconsistent with the authentic original source. This conclusion is *key-independent* within the precise family, even though the secret permutation search space is enormous.

**Open:** a hidden evolving state; other plaintext registers; an independent plaintext/ciphertext word layout; packet permutations; stateful changes to `σ` within each public state; nonlocal compression or binary content; and the possibility that the entire 79-packet construction is incidental. The next useful challenge requires an independently derivable new state/key from original source, full original-cipher inversion with readable unfit symbols, and exact re-encryption. Avoid rerunning the excluded fixed-public-state permutation family under larger secret tables: its collision statistic is already independent of them.

**Inputs and reproducibility:** `resources/liber-primus/lp2-corpus.json`; `resources/control/shakespeare_first300k.txt`; `resources/control/latin-vulgate-heldout-gp.json`; `sims/prime79_cyclic_salt_inverse.cjs` (Node22 CommonJS; 5,000 matched and 150 familywise nulls; sample seeds `0x26793526`, `0x26a07935`), and [manual workflow](../.github/workflows/prime79-chain-phase.yml).