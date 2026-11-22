# Original LP2 p50 first-digit × previous ciphertext: all 145 secret alphabets

**22 November 2026, Agent 2. Exact original-cipher all-secret necessary-condition exclusion for a bounded GP29 English model. No unknown plaintext, real key, or Cicada continuation recovered.**

## Causal hypothesis and strong rival

Physical p49–51 prints a **32×8 grid of 256 two-character numerals** with literal first digits 0,1,2,3,4. The original p0–55 ciphertext has **86 adjacent identical-rune events among 12,901 within-page pairs**. A previously observed 33/86 events occur under table cells beginning with printed 0 when the source table is clocked by the preceding rune's global position modulo256. A human could therefore use that digit and the immediately preceding ciphertext rune to select one of **5×29=145** changing substitution alphabets.

Neither original art nor authenticated first-party messages actually instruct this decoder or explain its secret alphabets. Its rival is a source-selected changing key, non-GP plaintext, separate exception carrier, or unrelated table. The state-tested proposal is materially more generous than the prior [five-class secret-difference](lp2-p50-digit0-feature-loco-gate.md), [58-row parity dual-tap](lp2-p50-bit0-dualtap-allsecret-row-capacity-original-gate.md) and [one global outer alphabet on a p50 lookup](lp2-p50-cprev-outer-allsecret-assignment-capacity.md). Here **all 145 substitution permutations are independent and completely arbitrary**.

## Full reversible model and theorem

Keep all **12,956 original GP29 runes**, their true printed words, and the numeric-only p50 gap. For each original position i except **55 freely seeded page initials**, set

\[
q_i=\operatorname{firstDigit}(T_{(i-1)\bmod256}),\quad
s_i=(q_i,C_{i-1}),\quad
C_i=Q_{s_i}(P_i),\quad P_i=Q_{s_i}^{-1}(C_i).
\]

Every secret Q is any of **29!** GP29 permutations; the overall unconstrained keyspace is **(29!)^145**. The digit rule reads the source's *literal first character* and is unaffected by base59 versus base60 arithmetic. The global rune clock advances through real runes across the numeric-only page and all page breaks.

For a fixed state s and observed ciphertext glyph c let n(s,c) be its source count. Any bijection maps the k most frequent c values to at most k independently chosen plaintext symbols. Therefore the **exact**, attainable all-key maximum number of occurrences of any *fixed set of k plaintext symbols* is

\[
M_k=\sum_s\sum_{j=1}^k n_{s,(j)}
\]

where each row's counts are independently sorted descending. This is a mathematical identity for the entire huge secret-key family; it does not assume arithmetic coefficients or fit a plaintext dictionary.

## Original-source result and genuine GP English controls

All **145** rows are populated by the exact source. Source digit exposures are **[3025,2926,3270,2825,855]** over the **12,901 modeled rune positions**. The per-state equal-pair fraction, invariant under all unknown alphabets, is **0.03520952996698619**.

| k targeted plaintext symbols | Maximum M_k, full eligible source | Maximum M_k, 10,028 strict within-word non-page-initial sites |
| ---: | ---: | ---: |
| 1 | **1,013** | **869** |
| 2 | 1,887 | 1,602 |
| 3 | 2,703 | 2,263 |
| 5 | **4,146** | **3,453** |
| 8 | 6,021 | 4,968 |
| 10 | 7,138 | 5,848 |

Even assigning all 55 otherwise unconstrained page initials to a single plaintext rune yields at most **1,068 / 12,956** of that rune. By comparison, the authentic nine-source solved GP29 corpus has **380 E of 2,979 clear runes**. A plaintext with the independently known Cicada letter distribution would require many more E runes than any of the proposed keys could produce.

More directly, the [single executable CJS test](../sims/lp2_p50_fivedigit_prev29_allsecret_original_sft.cjs) samples **64 independent exact-manuscript-word-length matched GP-native plaintexts each** from two frozen literary works, using source-calibrated ING/IO runes. The same 55 page initials are excluded in donor controls:

| Source donor, 64 complete donor controls | Minimum E of 12,901 sites | Minimum top-five count | Minimum within-word E | Minimum within-word top-five |
| --- | ---: | ---: | ---: | ---: |
| Gibran, The Prophet | **1,460** | **5,184** | **1,398** | **4,658** |
| Shakespeare | **1,451** | **5,153** | **1,399** | **4,572** |
| **Original source, absolute all-secret maximum** | **1,013** | **4,146** | **869** | **3,453** |

Thus none of the 128 real-English donor controls could encrypt to the original source with any choice of its **145 independent secret alphabet permutations** under this fixed source-state rule. The 64 samples are resamples of each donor and do not represent separate historical texts. This is a GP-English-register conclusion, rather than an exclusion of all hypothetical unusually letter-sparse messages.

A **source-native full-length positive test** truly encrypts a 12,956-rune donor using 145 random independent secret 29-rune permutations under this exact source table clock, then decrypts and re-encrypts **12,956 / 12,956** runes exactly. Its derived secret-independent bounds correctly admit the known plant's E and top-five counts. The original negative therefore concerns the model's explanatory power.

## Precise surviving key-renewal fork

Give each of the nine source-visible illustrated chapters (p0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55) a **fresh independent bank** of 145 arbitrary permutations, retaining the same global original numeric clock. The real source activates **1,273** state rows, and its all-secret upper bounds rise to **M1=2,383, M5=7,921** on all modeled sites and **M1=2,094, M5=6,786** within words. This expanded architecture *passes the finite symbol-capacity gate*. It supplies neither an independent key nor an original decipherment; an author-visible chapter-key schedule or source-derived alphabet operand is the essential remaining input.

## Decision for Director Issue #2273

Retire the **entire book-shared (p50 printed digit, preceding original GP29 ciphertext) stationary 145-row all-secret alphabet decoder** for ordinary source-native GP29 English. Any 28-way no-repeat symbol substitution enlarged with a reversible 29th repeat/escape output under exactly these same states is a subcase. An intended cipher may use an additional state variable, explicit side information, individually keyed chapters, unusual language or a different intermediate alphabet; the original source has yet to provide an operation selecting one.

**Reproduce:** run the linked single-file Windows Node22 test from the repository root. Its full original counts, all caps, 128 source controls and actual encrypted/decrypted GP plant are asserted. The exact committed JavaScript was also successfully executed against GitHub-source-backed data in the V8 runtime with Node built-in equivalents; no Windows GitHub Actions run is claimed.