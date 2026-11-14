# Blind authentic prime-source tests on the final unknown LP2 chapter

**Agent24, 14 November 2026. Classification: original-cipher bounded negative, with authenticated solved-page and blind native-language positive controls. No previously unknown plaintext, original key or destination recovered.**

## Why these original inputs deserve a targeted inverse

The original LP2 p56 **AN END** ciphertext is exactly decrypted by subtracting the consecutive-prime totient \(\phi(p)=p-1\pmod{29}\), except for one literal F at source rune offset 56 that passes unchanged and does not consume a prime. Its proof does not transfer the cipher to other pages. The original p55 is the immediately preceding **76-rune** physical page, and the original red-heading chapter map fixes the final unknown chapter as **p54+p55 = 232+76 = 308** GP29 runes. Earlier two-million-index Viterbi tests with arbitrary literal-F pauses covered eight large earlier page/section starts and did **not** include p55 or p54; the previous no-interruption two-million source-index test excluded p55 as shorter than 180 runes.

There is one other genuinely historical, exact decoder worth considering on this **308 = 44×7** runic chapter: Cicada's earlier 2014 Stage05 **rowwise seven-column transposition**, keyed **1736254**. The known 140-byte original OutGuess Stage05 message yields the recorded 56-character statement under this operation. The fixed 308-rune p54–55 rowwise inverse had already failed as a *single* layer. Here we test the finite, source-specified **composition with the authentic p56 prime-totient cipher**, rather than inventing a new seven-column key.

All three architectures below retain every original GP29 ciphertext symbol, including the p54→p55 cross-page word carry. There are no English cribs, unknown-page recovered keys, repaired ciphertext values, page edits or tuned transposition phases. Free prime starts are a deliberate generous concession, **not** independently published Cicada key material.

## Exact key hypothesis and blind selection

For each candidate positive prime ordinal \(k\), decrypt source rune \(C_i\) with either \((C_i-\phi(p_{k+i-s_i}))\bmod29\) or its opposite sign. At each observed ciphertext F, a Viterbi path can either consume the normal key or emit a literal F and skip consumption. We optimize up to nine F skips with the existing pinned 20% literal-F prior. A unigram log likelihood trained on an independent **first 240,000 characters** of the committed Shakespeare source selects the prime start on an untouched **prefix**. Other candidate starts are not fitted to the future decoded runes.

- **Page55 alone:** all starting indices 0…1,999,999, both signs, **first 58** of 76 original runes as selection; final 18 as untouched holdout. The first rune is the incoming NG completing a word begun on p54.
- **Whole final chapter pp54–55:** all 2,000,000 starting indices, both signs, **first 90** of 308 as selection, next 90 as untouched holdout and remaining symbols retained for complete word readout.
- **Historical Stage05 outside prime-totient:** on the same 308 runes, use the exact historical per-seven-rune order **[1,7,3,6,2,5,4]**; consider that authentic inverse and its opposite direction without any arbitrary row/phase search, then run the same source-start/skip experiment on each resulting complete runic stream. This adds four prespecified original models (two fixed row directions × two totient signs).

The raw GP29 index-of-coincidence is **0.03789474** for p55 and **0.03382123** for the entire p54–55 block. A pure transposition preserves the latter IoC exactly, as verified in the two-layer program.

## Blind controls demonstrate actual plaintext/key recovery

The known p56 85-rune ciphertext is decrypted **85/85** by the genuine prime start zero and latent original F-skip at rune offset56. More important, the *same unknown-prime-start search, exact skip handling and same training model* recover both deliberately withheld true keys and plaintexts from native-GP positive plants:

| Positive original-language plant | Authentic plaintext symbols recovered | True prime index | Recovered blind prime index | F-skip |
| --- | ---: | ---: | ---: | --- |
| 76 GP runes from solved p57, enciphered by p56's original operator | **76/76** | 123456 | **123456, rank 1** | 43 |
| Independent 308-rune Shakespeare GP source, enciphered by p56's original operator | **308/308** | 123456 | **123456, rank 1** | 43 |
| Same 308 GP source first prime-enciphered and then encrypted by the authentic 2014 Stage05 row-seven operation | **308/308** | 123456 | **123456, rank 1** | 43 |

The original 2014 Stage05 OutGuess source message also recovers **56/56 historical plaintext characters** and round-trips. The 308-rune plant's heldout-90 score is **−2.97851 nats/rune**, with full-stream **−3.01697**; the 76-rune solved-p57 plant has heldout-18 **−2.92895** and full **−2.95762**.

These controls check the specific models' ability to return plaintext even after a completely unknown prime starting index, rather than merely checking that a candidate decoder re-encodes its own gibberish.

## Original ciphertext results

| Complete original-target inverse family | Training-winning key start | Training score | Untouched next-block score | Best complete-score among 12 frozen prefix candidates | Decipherment |
| --- | ---: | ---: | ---: | ---: | --- |
| p55 76 runes, totient − | 873693 | **−3.23602** | **−4.19620** (18 runes) | **−3.28391** (76 runes, start295592) | Unreadable |
| p55 76 runes, totient + | 1197970 | **−3.11593** | **−4.69056** (18 runes) | **−3.31894** (76 runes, start251203) | Unreadable |
| pp54–55 308 runes, totient − | 1220816 | **−3.31463** | **−4.00253** (90 runes) | **−3.74640** (308 runes, start392856) | Unreadable |
| pp54–55 308 runes, totient + | 75044 | **−3.35915** | **−4.05286** (90 runes) | **−3.74284** (308 runes, start1176136) | Unreadable |
| Historical Stage05 inverse, then totient − | 1504026 | **−3.33078** | **−4.17831** (90 runes) | **−3.81344** (308 runes, start703364) | Unreadable |
| Historical Stage05 inverse, then totient + | 1061355 | **−3.39182** | **−4.21873** (90 runes) | **−3.85060** (308 runes, start898556) | Unreadable |
| Opposite Stage05 row direction, then totient − | 1801939 | **−3.33835** | **−4.04395** (90 runes) | **−3.75459** (308 runes, start973569) | Unreadable |
| Opposite Stage05 row direction, then totient + | 200366 | **−3.41263** | **−3.99148** (90 runes) | **−3.80636** (308 runes, start961516) | Unreadable |

The 76-rune page-alone key start295592 yields original-page output beginning **YEIEOOWLNTHNDARDP...** and IoC 0.04246. The full-section 308-rune key start392856 begins **YNWYELYEONTRMNGO...** and has IoC 0.03826. The native 76-rune control's IoC is **0.05930**. None of the full original outputs forms coherent words under original print segmentation; their heldout language scores lose the improvement manufactured by selecting among two million unrelated starts. The 308-rune original candidates retain near-uniform frequencies even when 12 independent prefix candidates are screened.

**Careful strength of conclusion:** Every one of the **12 original inverse classes** has exactly 2,000,000 searched key starts (two signs × two targets, four Stage05/prime combinations = eight original classes; 8 × 2,000,000 = **16,000,000** original source-index evaluations). Only the highest 12 *prefix-scoring* starts are given full 76/308 tracebacks; thus the displayed best complete scores are the best **within those 12**, not an exhaustive full-stream maximum over all two million offsets. The original p56/p57 and synthetic controls show genuine language-recovery power, and every attempted original candidate is unintelligible. This supports retiring the tested **direct native-GP original-final-chapter readings**, within their exact offset/sign/skip/row-direction bounds. It is not a theorem against every possible key, arbitrary historical cipher composition, key phase beyond two million, or other plaintext register. The original no-repeat ciphertext output remains unexplained by these models.

## Exact reproduction and preserved successful runs

- [Page55 blind source-index/unknown-F SFT](../sims/lp2_p55_prime_totient_unknown_F_source_scan.py), [successful CI run 43540185191](https://github.com/FlareZ123/liber-primus/actions/runs/43540185191).
- [Whole final chapter blind source-index/unknown-F SFT](../sims/lp2_p54_55_prime_totient_unknown_F_source_scan.py), [successful CI run 43540419599](https://github.com/FlareZ123/liber-primus/actions/runs/43540419599).
- [Authentic Stage05 row-seven plus source-prime two-layer SFT](../sims/lp2_p54_55_historical7_prime_F_blind_sft.py), [successful CI run 43540661715](https://github.com/FlareZ123/liber-primus/actions/runs/43540661715).
- The first two extend the preexisting [p56 source-index and unknown-F decoder](../sims/prime_totient_F_interrupt_viterbi.py) and [authentic p56 fixed-key positive regression](../sims/prime_totient_long_offset_inversion.py).
- The Stage05 candidate uses the original [historical Stage05 decoder and positive record](../sims/stage5_original_outguess_columnar_sft.cjs).

**Decision:** Neither the authentic p56 prime-totient cipher, alone with freely selected starts and literal-F skips, nor its historically selected seven-row-transposition outer layer provides the final unknown LP2 chapter's plaintext. Avoid more arbitrary phase/key/row variants based solely on this negative result; seek an independently observed key source or a source-specified reversible outer coding operation. The original ciphertext and runner logs are preserved exactly.
