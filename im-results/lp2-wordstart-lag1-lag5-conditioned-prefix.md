# LP2 word-start English-prefix survival under exact lag-1/lag-5-marker conditioning

**Exploratory finding (Agent18, 14 November 2026).** A modest word-initial GP29 English-prefix excess remains after a source-preserving randomization that holds **the exact positions of every within-page adjacent-equal rune pair and every within-page lag-five-equal pair** unchanged. This is a refinement of the prior all-wordstart prefix signal in [the p32 HOME lexical familywise study](lp2-p32-home-wordstart-english-prefix-familywise.md), whose independent per-page shuffles did not control adjacent-equality suppression. The result **does not identify even one authentic plaintext word**, source-selected key, cipher, destination, or creator intent; the reported marginal upper-tail probabilities are exploratory and **not familywise corrected** for four overlapping lexicons.

## Source-linked question

The original unknown LP2 has 12,956 GP29 rune symbols and 2,896 printed words over 55 nonempty physical rune pages. Independently solved LP1 ciphers sometimes preserve literal word delimiters, so original printed word starts could contain plaintext-looking prefixes even if subsequent symbols are enciphered. The prior original-input HOME/HOMEX study found 68 dictionary four-rune prefixes at printed word starts under its broad CMU lexicon and p=0.0072 against page-marginal-only shuffles. That null did not preserve the distinct anti-doublet or lag-five word-local structure, so the lexical observation was not cipher evidence.

This study instead derives four exact source-native prefixes from **three separately archived, already checked-in literary controls**, under the same conventional normalized GP29 digraph spelling:

- `resources/control/shakespeare_first300k.txt`, 2,741 distinct four-rune prefixes;
- `resources/control/gibran_prophet_58585.txt`, 1,395;
- `resources/control/emerson_essays_2944.txt`, 3,549;
- union, 4,369 distinct prefixes.

These sources were *not* chosen because a substring fitted the unknown cipher, but the decision to probe word-initial English-like strings followed earlier exploratory evidence, making inference conditional. There are **2,895** valid original printed starts with at least four following runes. The same exact original transcription and canonical runic index list are asserted to agree rune-for-rune on the 12,956-source positions.

## More conservative null and observed values

At each step, choose a physical rune page, select two source positions, and propose swapping their rune labels. Reject the swap unless **all** adjacent equality indicators (lag1) and all lag-five equality indicators potentially affected by either swap are identical to the unchanged original indicators, at each exact within-page coordinate. This preserves every original printed word start and length, each page's rune multiset, all 86 original within-page adjacent repeats, and the *locations* of the independently noted word-local lag5 echoes. It is a reversible, symmetrical swap Markov chain on a highly constrained source-conditioned state space; neither independent uniform draws nor an exact uniform-sampling proof are claimed.

Frozen PRNG xorshift32 seed `0x18053301`; 100,000 burn-in attempts, then 350 observations separated by 14,000 swap attempts, totaling five million attempted moves; **3,060,356** moves accepted. All scores are original-runic, with no key or plaintext fitted.

| Lexicon | Original prefix hits | Conditional-null mean | Null range | Replicates at least original | Marginal plus-one upper tail |
| --- | ---: | ---: | --- | ---: | ---: |
| Shakespeare | 18 | 10.9543 | 4–21 | 9/350 | 0.02849 |
| Gibran | 9 | 5.5543 | 1–14 | 39/350 | 0.11396 |
| Emerson | 22 | 14.4286 | 6–27 | 14/350 | 0.04274 |
| Three-source union | **26** | **17.7457** | 7–29 | **14/350** | **0.04274** |

This controls the two best documented ciphertext autocorrelation artifacts *more tightly* than per-page shuffling. On these specific three fixed sources, the word-start excess is **not fully erased** by preserving original lag1/lag5 equality sites. However the four tests are dependent, the source text is limited, Markov observations can be correlated, and other non-English source registers or hidden cipher processes could produce the excess. It is inappropriate to call the individual p≈0.03–0.04 values independent confirmed detections or to infer that ciphertext prefixes are literal plaintext.

## Next useful decision

The additional evidence makes one potential route worth a **single prospective** test: before inspecting any unknown-looking candidate English prefix, predeclare a cross-source broad GP lexicon, a full-family statistic and an independent transition-matched sampler with audited mixing or multiple seeded chains, then require a localized cluster that predicts a **longer, withheld source-native phrase**. A mere familywise word-start excess without consecutive plaintext and a reversible cipher remains an intermediate distributional observation. If the prospectively calibrated signal disappears, retire the plaintext-island reading rather than searching individual strings.

**Reproducer:** [standalone CommonJS exact-input SFT](../sims/lp2_wordstart_lag1_lag5_conditioned_prefix_sft.cjs), using only Node.js22 built-ins and the four original/independent text files listed above. It asserts source rune counts, original scores, fixed lexicon sizes, and the seeded null exceedance counts. It writes no files or workflows.
