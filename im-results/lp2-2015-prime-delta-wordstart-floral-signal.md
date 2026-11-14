# Word-start signal in the 2015 first-prime-difference register

**Agent 45, 14 November 2026. Exploratory source-preserving result.** A previously published 2015 first-chapter transform unexpectedly exhibits a **word-start-specific repeat enrichment on the original floral chapter p40–53**. This survives an exact physical-page-preserving null, a nine-chapter family correction, and two unchanged-source wrong-operator controls. It is an intermediate *state/segmentation clue* only: **no original unknown-page plaintext, complete inverse, authentic key, or destination was obtained**. The manuscript supplies no instruction selecting this transform for floral pages. All original rune and printed word coordinates are unchanged.

## Source-fixed operation and new, independent observable

On 4 February 2015 a solver in the preserved IRC record suggested shifting p0–2 through successive primes, with an imagined initial F, then taking differences. That exact historical experiment was reconstructed in [the prior original 40-event report](lp2-2015-prime-delta-40-doublet-source-inversion.md). With the published GP29 indices and consecutive primes `p[0]=2,p[1]=3,...`, the reversible operation is

```text
S[-1] = (F-index 0 - 2) mod 29 = 27
S[i]  = (C[i] - p[i+1]) mod 29
D[i]  = (S[i] - S[i-1]) mod 29
repeat event i>0: D[i] == D[i-1]
```

The original 729-rune pp0–2 segment has **40 repeat events**. The 2015 figure was already known and is not a new discovery. The new discriminator uses a fixed set of **genuine printed word starts** obtained from the original transcript, after joining physical line and page carries, to test whether these events fall at original word beginnings more often than expected. This does *not* assume that repeated D values are plaintext or that page punctuation is movable.

Exactly **2,896 complete words / 12,956 unchanged GP runes** partition into nine visually identified chapters with lengths **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308** and word counts **158, 255, 383, 437, 224, 326, 378, 669, 66**. Apply the exact same negative-prime operation, restarted with fictitious F and prime3, to all nine sections without fitting phases, shifts, language scores or keys. This is a *cross-section transfer of the 2015 solver idea*, rather than an independently author-certified method.

## Exact page-preserving null and all nine sections

For each physical page, hold its original page length, original true word-start coordinates, and all derived D-repeat event offsets fixed. Then cyclically shift **only that page's event markers** across its original rune positions. Enumerate every shift separately for every page. Convolve the exact per-page event/word-overlap distributions, producing an exact chapter null that preserves the number of events and the start density of each physical page, including the shortened 66- and 92-rune flanks of the p50 table.

| Original section | Derived repeat events | Original word starts hit | Expected hits, exact page-null | One-sided upper-tail probability |
| --- | ---: | ---: | ---: | ---: |
| p0–2 | 40 | 4 | 8.5015 | 0.98450 |
| p3–7 | 39 | 7 | 8.6479 | 0.79902 |
| p8–14 | 64 | 17 | 14.2397 | 0.23479 |
| p15–22 | 78 | 20 | 17.9047 | 0.32578 |
| p23–26 | 37 | 8 | 8.1824 | 0.60204 |
| p27–32 | 48 | 14 | 10.8620 | 0.17183 |
| p33–39 | 60 | 17 | 13.3883 | 0.15795 |
| **p40–53** | **99** | **35** | **22.1952** | **0.00198956** |
| p54–55 | 11 | 1 | 2.3607 | 0.93478 |

The ninth p40–53 page span includes the rune-free p50, so its **13 rune-bearing physical pages** have 3,008 original rune positions. Its enrichment is dispersed: original page-local hits are p40:1, p41:1, p42:4, p43:4, p44:4, p45:3, p46:4, p47:0, p48:4, p49:2, p51:3, p52:3, p53:2. The page-preserving null has an exact mean 22.1952, SD **4.09785** and observed standardized score **+3.12477**.

For the declared family of **nine** chapter-specific word-start association tests, compute each chapter's own exact null mean and SD, take the largest absolute observed standardized score and evaluate that maximum under independent physical-page rotations of each chapter. The combined familywise **two-sided tail is 0.0186506610** (positive-direction tail **0.0168239539**). This probability corrects only these nine chapter tests of this historically chosen transform. It is **not** an experiment-wide probability across the repository's numerous prior model hypotheses, and it does not authenticate creator intent.

The historical p0–2 signal points the opposite way for word starts: **4 observed against 8.5015 expected**, with exact lower-tail **0.0459342**. That is not significant after family correction. In the original 729-rune transform, the 40 consecutive-equality *positions* form **36 distinct runs**, including a four-equal-D plateau at global indices **544–547** inside physical p2's six-rune source word `N–H–B–E–G–EO`. Across all **729** unchanged-ciphertext cyclic shifts against the fixed prime clock, raw event count40 ranks **1/729**, but **36 clusters rank only 7/729**, and a maximum four-rune plateau occurs in **43/729** shifts. This shows that the previously noted raw-event peak is partly affected by repeated-run clustering; it should not itself be read as plaintext.

## Wrong-operation controls and a finite direct plaintext attempt

The floral-chapter observation is **specific to the published negative prime sign**, rather than an automatic property of word starts. Two fixed control operations keep the original 3,008 source runes, printed words, page shifts, and event definition:

| Floral-chapter transform | Repeat events | Word starts hit | Page-null expectation | One-sided upper tail |
| --- | ---: | ---: | ---: | ---: |
| **Original 2015 negative prime shift** | **99** | **35** | **22.1952** | **0.00198956** |
| Opposite (positive) prime shift | 114 | 19 | 25.3291 | 0.947426 |
| No prime shift (first differences only) | 107 | 22 | 23.8107 | 0.703239 |

To force a first plaintext-bearing decision rather than extending free-key searches, the 35 selected original words were also processed under **one** historically motivated arithmetic output: sum the published GP rune prime weights of every selected complete word and reduce modulo29 to one GP symbol. In original reading order the 35-rune output transliterates, separated here only for readability, to:

```text
D N P A B U N I G Y I U H P C P U L OE G NG EO OE R B I AE D I T W B Y E EA
```

This is **not readable native LP2 language**, has native-symbol coincidence index **0.0336134454**, and supplies no independently recoverable address. The literal 35 first ciphertext runes and 35 retained D values are likewise nonlinguistic. The direct word-sum extraction fails the desired plaintext test; no alternative modulus or post-fitted permutation was attempted.

## What changes in the next cryptanalytic decision

The floral-page enrichment and opposite-sign/unshifted controls support treating a **signed-prime-difference / word-start interaction** as one *conditional observable* of a proposed stateful decoder. The only promising continuation is a **specific source-selected rule** explaining why some genuine word starts give equal derived values and others do not, then predicting new decoded plaintext on untouched original pages. A human solver could recognize words and consecutive primes from the genuine book/earlier Cicada instruction tradition, but neither the 2015 participants nor the signed Cicada text supplies a rule turning the 35 marked floral words into a complete key, state, map, or message. Do not translate this correlation into an assumed cipher just because its local null p-value is small. Do not rescue the failed modulo29 word-sum extraction by scanning alternate reductions.

A word-dependent feedback or state-reset hypothesis may be worth a **single prespecified plaintext test** if an original image or historical instruction selects its update equation. Otherwise preserve this as a statistically interesting diagnostic, with no upgrade to established decryption.

**Reproduction:** [single CJS original-source SFT](../sims/lp2_2015_prime_delta_wordstart_signal_sft.cjs), Node22, uses the canonical original GP29 corpus and transcript, joins all 32 page-spanning words, asserts all nine chapter/rune/event counts, enumerates the 729 prime-phase rotations, analytically convolves original-page cyclic-null distributions and prints each exact tail and the nine-chapter correction. It makes no source-file mutations or network calls. The exact original-source SFT passed in [manual Windows/Node22-compatible GitHub Actions run 43635193928](https://github.com/FlareZ123/liber-primus/actions/runs/43635193928). Calculations were also executed independently against original GitHub-source data in the connected JavaScript runtime on 14 November 2026.