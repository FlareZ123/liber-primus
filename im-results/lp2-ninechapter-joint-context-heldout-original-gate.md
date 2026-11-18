# LP2 nine illustrated chapters: joint higher-order context does not select a simpler decoder

**Decision for [Director Issue #1485](https://github.com/FlareZ123/liber-primus/issues/1485), 18 November 2026.** This source-frozen predictive test on original unknown ciphertext with an original-bigram-matched null finds **no actionable chapter reset, unusually easy independently withheld chapter, or plaintext/key**. The negative is limited to the four-bit higher-order feature and hierarchical prediction grammar below. A chapter-specific transform outside that grammar remains possible.

## Source and decision

The nine original illustrated chapter intervals are physical pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, and 54–55, with rune totals 729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308. No split was optimized. Corpus and text are the existing resources/liber-primus/lp2-corpus.json and resources/lp2-transcription.txt. The prior shared parser validates **12,956 ciphertext runes**, **2,896 authentic printed words** and **32 words carried across physical pages**. Runeless p50 is excluded from the rune tape.

The competing routes are a source-visible change of a compact word-state cipher at illustrated chapter openings, versus continuously generated ciphertext whose motif frequencies fluctuate by section. A positive would identify a target chapter whose unseen higher-order structure is more predictable than its exact preserved first-order page properties, motivating a specific decoder rather than another coincidence.

## Predeclared higher-order model and controls

At the **1,290** original within-word positions with six preceding runes in the same printed word, each ciphertext successor belongs to one of sixteen **joint signatures** from four simultaneous flags: equality to previous rune, equality to two-back, equality to five-back, and equality to the previously established affine T6 transform of six-back, namely T6(x)=(24−2x) mod29. T6 was retrospectively identified by previous studies, so this is exploratory conditional testing, not pre-discovery T6 significance.

Two-fold alternate-original-page cross-validation within each of the nine illustrated chapters compares a global sixteen-category multinomial (Jeffreys count 0.5 per category) with a chapter-specific model shrunk toward the same fold's globally trained categorical prior. Both score identical held-out positions. Native GP English controls (Gibran, Emerson, Shakespeare), using already source-calibrated GP orthography and the original word/page geometry, selected smoothing mass **1,024** from the frozen mass grid {8,16,32,64,128,256,512,1024}, before computing unknown LP2 outcomes. The untrained-chapter diagnostic scores a chapter using the baseline model learned only from the other eight chapters.

The exact conditional null uses **1,200 independent uniformly sampled original-page directed Euler trails**, fixed seed 0x85e45f39, with the repository's existing cycle-popping and last-exit method. Every shuffled page retains its exact original 29×29 ordered-bigram counts, first/last glyph, page length, chapter, and printed-word masks. All **32 cross-page word carries** remain joined in the score. On the first sample the complete 55-page ordered-bigram tables are explicitly asserted equal to original. The question is specifically whether higher-order chapter behavior survives after exact first-order source properties are conditioned away.

## Actual outcome

| Original chapter | Word-local six-back opportunities | Held-out chapter gain (bits) | Null gain ≥ original / 1,200 | Untrained bits/position |
|---|---:|---:|---:|---:|
| pp0–2 | 79 | −0.22869 | 1,117 | 0.96181 |
| pp3–7 | 106 | +0.09875 | 463 | 0.67471 |
| pp8–14 | 184 | −0.09483 | 857 | 0.83603 |
| pp15–22 | 178 | −0.85653 | 1,169 | 1.04395 |
| pp23–26 | 100 | +0.02374 | 633 | 0.97484 |
| pp27–32 | 144 | −1.32094 | 1,198 | 1.11012 |
| pp33–39 | 162 | +0.07148 | 566 | 0.99109 |
| pp40–53 | 302 | +0.50142 | 449 | 0.86970 |
| pp54–55 | 35 | +0.07900 | 151 | 0.47981 |

**Whole-book cross-validation:** the chapter-specific model loses **1.72662 bits** relative to the shared one. In **1,175/1,200** exact-bigram-matched null books, chapter models gain more than on original (plus-one upper-tail fraction **0.97918**). Largest observed per-position chapter gain is only **0.002257 bits**, from pp54–55; **1,062/1,200** null books have a larger maximum across nine chapters (familywise upper-tail **0.88510**).

**Independent target selection:** the smallest untrained-chapter code length is pp54–55 at **0.47981 bits/position**, but **429/1,200** null books have some chapter equally or more compressible (book-wide plus-one **0.35803**). Even if pp54–55 had been independently specified as the sole target, **190/1,200** null books score it at least this low. The modest positive gains at pp40–53 and pp54–55 select neither an operation nor a key.

The native English samples calibrate only the smoothing mass. The null conditions on the original observed page bigrams and does not represent all conceivable ciphers or exact preserved higher-order effects. Prior selection of lag5/T6 and the small number of eligible positions in some chapters limit the strength of generalizations.

## Actionable conclusion and exact reproducer

The **nine visual boundaries alone are not an empirically supported target selector under this fixed joint-context prediction model**. Do not redirect the inverse program to a chapter on the strength of these scores or tune new lags, boundaries, T6 maps or smoothing after this original test. A credible chapter-specific cipher still needs independently source-selected reset/key/operation or a blind original-cipher prediction. There is no recovered unknown-page plaintext, key, opcode or destination.

The self-contained [Windows Node22 CommonJS SFT](../sims/lp2_chapter_joint_context_cv_euler_sft.cjs) prints the entire prior calibration, all chapter scores and the exact conditional null. It passed on original repository source in [GitHub Actions run 44339183594](https://github.com/FlareZ123/liber-primus/actions/runs/44339183594). Prior original-bigram controls are documented in [the existing first-order conditional analysis](lp2-original-lagfive-conditional-page-markov-gate.md).
