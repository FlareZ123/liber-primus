# p50/G polynomial quotient as a 254-rune key for the moth pair: direct inverse fails

**Agent23, 18 November 2026. Classification: source-constrained, conditional direct-receiver negative.** No unknown LP2 plaintext, authentic key, established cipher mechanism, or Cicada destination was recovered.

## Why this was worth one bounded test

Three independent original-source observations form a compact candidate path:

1. The isolated red triad on physical p39 has GP29 indices **[27,5,15]**. Read as low-degree-first coefficients, it defines
   \[
   G(X)=27+5X+15X^2=15(X-24)^2 \pmod {29}.
   \]
2. The oversized red A at the start of p54 has GP29 index **24**, independently matching the repeated root. The original p50 32×8 table, read in printed row-major order under the conventional base-60 codec and reduced modulo29, is exactly divisible by this same quadratic. The quotient retains **254 coefficient slots**, including its leading zero.
3. The repeated moth artwork selects original p53 and p55 as a pair. P53 has **179** runes. P55 has **76**, but its first rune is an incoming **NG** carried from p54; excluding that incomplete carry leaves **75** complete p55-body runes. The source-selected paired register is therefore **179+75=254** runes. Its two original terminal 13-dot marks make 256 rune-or-marker events, matching the original table's 256 cells.

This is a stronger alignment than applying the table to an arbitrary 254-rune slice: the divisor is selected by an original red inscription and the enlarged p54 A, while the recipient pages are selected independently by repeated artwork. The weakest premise remains decisive: **nothing in the manuscript says to use the p50/G quotient as an additive GP29 key**. The table's base-60 interpretation and high-first polynomial convention are conditional source readings, not an authenticated cipher specification. This test therefore asks whether the most direct historically familiar consumer succeeds, not whether every possible use of the quotient has been exhausted.

Relevant established source work: [the base-60/base-59 and p39 double-root gate](lp2-grid-numeric-codec-ambiguity.md), [the p29/p50 shared-factor and quotient study](lp2-p29-grid-sole-repeated-root-and-quotient-key-gate.md), [the original moth-image registration](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md), and the [paired moth-register synthesis](../workplace/lp2-moth-pair-256-table-56word-map.md).

## Frozen original-input operation

- Decode the 256 original printed table tokens using the conventional radix-60 alphabet 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx, preserving row-major order.
- Reduce each byte modulo29 to form the high-first coefficient vector \(P_{50}(X)\).
- Reverse the original p39 low-first triad to obtain high-first divisor **[15,5,27]**. Divide \(P_{50}\) by this divisor over GF(29). The remainder is exactly **[0,0]**; multiplication of the 254-slot quotient by the divisor reconstructs all 256 coefficients. The quotient's first slot is zero and is retained.
- Form the recipient in natural order: all **179** p53 runes, then p55 runes **1–75** (zero-based), excluding only the initial carried NG. Do not insert either terminal punctuation mark.
- Test the quotient coefficients as a one-use GP29 additive key at phase zero:
  \[
  P_i=(C_i-K_i)\bmod29,\qquad P_i=(C_i+K_i)\bmod29.
  \]
  No reversal, offset, alternative radix, page reset, word reset, F bypass, marker consumption, or language-score tuning is allowed.

This is distinct from the earlier p50/G quotient tests against the p29 quotient and the nine 28-symbol chapter-key construction: the target here is the independently image-selected p53+p55 254-rune register. It is also distinct from prior direct raw-table-byte, zero-anchored, and XOR tests on the moth pages.

## Original-cipher results

| Readout | Whole 254-rune IoC | p53 IoC | p55 body IoC | GP29 trigram score |
|---|---:|---:|---:|---:|
| Original paired ciphertext | **0.03454608** | — | — | — |
| \(C-K\) | **0.03457720** | 0.03521436 | 0.03207207 | **−14.76873385** |
| \(C+K\) | **0.03541751** | 0.03533990 | 0.03603604 | **−15.19402350** |

The random 29-symbol IoC baseline is \(1/29\approx0.03448276\). Both direct inverses remain essentially uniform rather than showing the concentration expected of ordinary GP-native prose. Their first 120 transliterated characters are:

- **Subtract:** EOIAOEJGMFAEJAELSEREATEWXOEPAEAGUJNGMWREONFTHEBDHEOHTEOEOYAIAEARWOAEIJIARYINTOEBWUAEECNGPTEABTMEUSEEJTHDFIANMBWI
- **Add:** EODCIBEONUBAJOBJMAEEAYJEAUNGLUWIAYBNHOEOEOEFSNGPNUYAEJAEIAERREANGREAIAYBBAELJAEBXBRTHDOERTHHBLUTHYEOANGNDJTHGYRAOETHGDM

The language control is a GP29 trigram model trained on the first 200,000 characters of the preserved Shakespeare control after canonical GP29 tokenization (including TH, NG, EO, OE, AE, IA and EA digraphs). A fixed xorshift32 seed **0x239254** selected 3,000 windows of 254 GP symbols from held-out Shakespeare, Gibran and Emerson text. Their score distribution was:

| Control statistic | Trigram score (natural log per GP trigram) |
|---|---:|
| Minimum of 3,000 windows | **−9.44576425** |
| 1st percentile | −8.90471527 |
| 5th percentile | −8.58414024 |
| Median | −8.05527799 |
| Maximum | −7.48684450 |
| Known clear p57, 95 runes | −8.02928961 |

Both original candidates score more than **5.3 nats per trigram below even the worst** of these 3,000 English windows. This is a strong negative for ordinary GP-native English under the frozen direct additive model; it does not prove that every possible plaintext language is English.

## Positive control and decision

The known clear 95-rune p57 stream was tiled to 254 symbols, encrypted under each exact quotient/sign convention, and recovered **254/254** by the corresponding inverse. Both original candidate outputs also re-encrypt exactly to their untouched 254-rune source. These checks establish implementation correctness, not key authenticity.

**Decision:** reject the direct one-use additive use of the p50/G quotient on the p53+p55 moth register. Preserve the source alignment as a conditional structural observation, but do not continue with phase shifts, reversals, alternative radix choices, F-skip tuning, or additional arbitrary direct key consumers. A successor needs an independently authored instruction specifying a different reversible consumer of this quotient, or a new source-selected key/operation that predicts plaintext. No update to results/README.md is warranted: this is an intermediate bounded negative, not a decipherment.

## Reproduction

Run node sims/lp2_moth_p50_gquotient_direct_key_sft.cjs with Node.js 22. The standalone script:

- checks Git blob SHA-1s for the original table, corpus, annotations and three language controls;
- reconstructs all 256 base-60 bytes from the printed two-character tokens;
- asserts the p39 red triad, p54 enlarged A, the p53/p55 source lengths and carried NG;
- verifies the exact GF(29) division, zero remainder and full polynomial reconstruction;
- executes both original inverses, exact forward replay, both 254/254 known-plaintext plants and the fixed English-control sample.

The result is reproducible from the committed original inputs; no external packages or network access are required.
