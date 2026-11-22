# LP1 warning nine-prime lines -> LP2 nine visual chapters: one frozen totient transfer

**Decision (13 November 2026, Agent 4): the direct cross-release key schedule fails to decrypt original LP2.** The nine LP1 warning body lines and the nine LP2 source-visible red-heading chapters form a plausible human-visible count correspondence. The same 2014 release gives both artifacts. The historically solved p56 prime-totient operation supplies an independently known decoder family. Applying exactly one fixed assignment over all 12,956 original unknown runes, with no fitted seed or phase, recovers **no unknown plaintext or key**. It yields the original-like whole-book IoC **0.034499321934**, versus **0.034478397865** for the untouched ciphertext and **0.062709966405** for solved native-GP p57.

## Original-visible input and independent source

The LP1 `A WARNING` image (archive `01.jpg`) contains nine consecutive body assertions beneath its colored heading. Existing early solver transcription records their GP-prime line sums, in printed order, as:

`757, 1009, 691, 353, 769, 911, 1051, 859, 677`.

All nine are prime, respectively primes **134, 169, 125, 71, 136, 156, 177, 149, 123** (one-based). These sums come from the published solved-text/gematria calculation, not an independent author-signed claim that they are cipher keys. The original LP2 ink gives nine independent visual chapter starts (see `im-results/lp2-global-original-visual-section-map.md`). The printed ordered chapter intervals and lengths are:

| LP2 physical pages | Unknown runes | LP1 source line prime | Prime ordinal | Decoded IoC |
|:--|--:|--:|--:|--:|
| 0–2 | 729 | 757 | 134 | 0.034587498 |
| 3–7 | 1,145 | 1009 | 169 | 0.034916176 |
| 8–14 | 1,729 | 691 | 125 | 0.034234893 |
| 15–22 | 1,903 | 353 | 71 | 0.034453873 |
| 23–26 | 1,021 | 769 | 136 | 0.034783277 |
| 27–32 | 1,433 | 911 | 156 | 0.034547790 |
| 33–39 | 1,680 | 1051 | 177 | 0.034296208 |
| 40–53 | 3,008 | 859 | 149 | 0.034457940 |
| 54–55 | 308 | 677 | 123 | 0.035534498 |

The nine chapter lengths sum to 12,956 source runes. The source-visible chapter structure is real; the nine-warning-line correspondence is a **hypothesis**, and the warning provides no independently authenticated instruction to seed these chapters.

## One pre-frozen cipher consumer

For the `j`th rune (zero-based) of chapter `i`, let `s_i` be its corresponding LP1 warning sum, and let `prime(n)` be the `n`th ordinary prime (one-based). The candidate inverse is

`P_ij = (C_ij - (prime(ordinal(s_i)+j) - 1)) mod 29`.

This exactly transfers solved p56's authenticated subtract-`φ(prime)` arithmetic with one new source-motivated element: the first prime of chapter `i` is the `i`th LP1 warning line sum. No candidate orientation, starting offset, direction, text window, or prime spelling was selected after reading output. All original runes consume one prime. In particular, p56's exceptional single-F interrupt at position 56 is **not** transplanted: no original instruction selects which of the unsolved-page F positions should interrupt the key clock.

The source-exact [CommonJS reproducer](../sims/lp1_warning_nine_chapter_prime_totient_sft.cjs) checks all nine physical chapter lengths and source sum primality; decodes all 12,956 GP29 rune indices; re-encodes each rune exactly; and checks a complete source-native solved-p57 planted ciphertext/recovery control for each chapter. Exact re-encryption proves implementation invertibility only, since **every** wrong additive keystream round-trips.

## Direct original-input outcome and limitation

- Original 12,956-rune IoC: **0.034478397865**.
- Frozen nine-prime totient inverse IoC: **0.034499321934**. The first chapter's decoded GP rune names begin `P TH R X O G TH TH W T R C H L AE E R D U I`, with no readable opening.
- Reassigning those same nine sums in reverse printed order as a predeclared wrong-source control gives **0.034505065329**.
- The separately solved, unencrypted p57 native-GP page has IoC **0.062709966405**. Its exact source-native rune sequence is also the planted positive-control source.

Thus this **exact** prime-value-start, book-line-to-chapter correspondence does not produce a native-GP plaintext register. It does not exclude a different language, a different hidden symbol register, a chapter-dependent non-additive consumer, or an independently supplied F-interrupt mask. Those alternatives are not supported by a visible instruction here; do not rescue this failed schedule by searching line reorders, alternate prime indices or arbitrary interruptions.

**Research decision:** keep the nine-warning-line numerical correspondence as a weak possible clue, but retire this direct p56-style φ-prime additive key transfer. A new branch requires an independently sourced rule specifying how the nine LP1 primes affect LP2 state or output and a complete, held-out original plaintext prediction.

**Source links:** [original LP1 source and community prime-sum transcription](https://github.com/cicada-solvers/documenting-cicada3301-scream314/blob/master/liber_primus.md); [current physical chapter atlas](lp2-global-original-visual-section-map.md); [source SFT](../sims/lp1_warning_nine_chapter_prime_totient_sft.cjs).
