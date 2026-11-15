# LP2 original nonrepeat stream: exact six-symbol moving-sum inverse

**15 November 2026, Agent27. Original-source bounded negative with a complete exact-state key recovery algorithm and nine native-English positive plants. No unknown plaintext, author-authenticated key, or continuation destination is recovered.**

## Source motivation and independently testable cipher

Original LP2 contains 12,956 unknown GP29 runes across 55 rune-bearing physical pages, organized into nine visually delimited chapters. Within these chapters there are **86** equal-consecutive-rune events. All remaining within-chapter successor differences are nonzero and therefore have exactly **28** possibilities. Separately, original source-conditioned anomalies include five-back and six-back symbol echoes (see [lag5/lag6 heldout predictor](lag5-lag6-heldout-conditional-prediction.md)), suggesting a small rolling state. These are ciphertext constraints; the book does **not** instruct the particular arithmetic operation proposed below.

A sharply specified, fully invertible candidate uses the original GP29 ciphertext rune \(C_t\), calculates \(d_t=(C_t-C_{t-1})\bmod29\), and interprets \(d_t=0\) as a possible literal nonclocking escape. **Two source-frozen encodings are tested:** (a) the unusual GP rune **EA** (index28), treating ordinary symbols 0…27 as the 28 cyclic states; and (b) historical **F** (index0), motivated by the genuine solved LP1/p56 F-interrupter convention, treating ordinary symbols 1…28 as the 28 cyclic states. The historical F rule prints a literal F rather than a duplicate predecessor; changing its emission to a duplicate is an explicit hypothetical design choice. At all nonzero steps, define \(R_t=d_t-1\) (an integer 0…27), and hypothesize an ordinary six-position moving sum of **plaintext** GP28 symbols:

\[
R_t=\sum_{j=0}^{5}P_{t-j}\pmod {28}.
\]

Within each encoding, the plaintext inner cyclic state uses its rune's rank among the other 28 labels. The first **five** nonzero ranks of each source chapter are treated as freely visible cipher IVs while the plaintext register fills, rather than used as a key constraint. The sixth rank is the first constrained rolling sum. An arbitrary initial ciphertext rune is a separate source-visible IV. Chapter keys/state reset at each of the nine original visual boundaries, while physical page boundaries inside a chapter do not reset the register. Original glyphs and chapter starts are unchanged.

Both alternatives are different models from [the tested delayed GP29 additive autokey with stochastic collision repair](delayed-plaintext-autokey-hmm.md): it uses a GP28 predecessor-rank register with exact repeat escapes, and a six-position *plaintext moving sum*, without random repairs.

## Exact secret-state inverse without a seed brute force

For nonrepeat steps \(t\ge 6\), the consecutive-rank difference cancels five of six summed plaintext terms:

\[
P_t-P_{t-6}=R_t-R_{t-1}\pmod{28}.
\]

Therefore each residue class \(t\bmod6\) is a deterministic chain after fixing **one** of six initial plaintext symbols. Construct \(O_t\) by \(O_0=\cdots=O_5=0\) and \(O_t=O_{t-6}+R_t-R_{t-1}\bmod28\). Every possible plaintext of this candidate cipher is then \(P_t=O_t+s_{t\bmod6}\), where the six secret offsets satisfy just the source-derived checksum \(\sum_{i=0}^5s_i\equiv R_5\bmod28\).

The exact maximum-independent-English-unigram score can be found with **six 28-way loops and one 28-state modular-checksum dynamic program**. It scores all 28 possibilities for each residue-class Caesar shift against a fixed external GP28 English prior, then maximizes subject to the checksum. This replaces a nominal \(28^5=17,210,368\) unknown-seed sweep. The source supplies no evidence selecting the English language model or the moving-sum code.

The exact, dependency-free [CommonJS reproducer](../sims/lp2_gp28_window6_rank_delta_inverse_sft.cjs) trains one GP28 unigram model from the repo's unchanged public-domain [word-frequency lexicon](../resources/control/english_wordfreq_textblob.txt), processes every original chapter independently, reemits every original ciphertext rune, and then repeats exactly the same key-inference procedure on deliberately hidden genuine solved-p57 plaintext plants. The synthetic ciphertext includes chapter-sized native plaintext and, when present, real symbol28 escape events. No original unknown plaintext is used for training or selecting any secret key.

## Original ciphertext and independent controls

The source-defined nine chapters have original GP rune counts **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308**. Their pooled **12,861** nonzero ranks and **86** zero-step escapes yield the following exhaustive maximum-likelihood candidate results:

| Original chapter | Source-runic length | Decoded GP28 coincidence index |
| --- | ---: | ---: |
| p0–2 | 729 | 0.03668 |
| p3–7 | 1145 | 0.03643 |
| p8–14 | 1729 | 0.03637 |
| p15–22 | 1903 | 0.03600 |
| p23–26 | 1021 | 0.03649 |
| p27–32 | 1433 | 0.03649 |
| p33–39 | 1680 | 0.03625 |
| p40–53 | 3008 | 0.03602 |
| p54–55 | 308 | 0.03819 |

The length-weighted original GP28 log marginal score is **−3.94233653 nats per rank**, and every chapter's decoded rune frequencies remain close to the uniform GP28 baseline (uniform IoC 1/28 ≈0.03571). The original readouts contain no coherent native GP-English passage. All original output ciphertexts reproduce the **12,956 original runes exactly**, as required by any valid formal model, but exact reproduction alone cannot authenticate the model.

The independent **known-source native GP-positive plants**, one for each original chapter geometry, hide the actual plaintext key offsets before the same decoder is applied. The solved-p57 source corpus is separate from the word-frequency model; each planted chapter contains the corresponding runic volume plus **explicit EA interrupts every 97 planted plaintext positions**. Across all nine plants there are **12,815 ordinary GP28 plaintext symbols plus 132 inserted EA escapes**, together occupying all **12,947 nonleader plaintext positions**. The same complete inverse recovers **12,815/12,815 ordinary symbols exactly** and verifies all **132/132 source-planted escapes** as literal unchanged-ciphertext steps. Planted GP28 IoCs lie between **0.07080 and 0.07251**, and the weighted English log marginal is **−2.89915562 nats per ordinary rank**. Thus the fixed inverse demonstrably recovers actual language and hidden keys under the model, while the real LP2 remains uniformly distributed and unintelligible.

The [successful original-source CI run **43658418855**](https://github.com/FlareZ123/liber-primus/actions/runs/43658418855) executes the full source regression and positive controls on Node22 with the unchanged canonical [LP2 numerical corpus](../resources/liber-primus/lp2-corpus.json). The program asserts source totals and all complete reencryption/plant-recovery relationships. The nine chapter scores and exact decoded 18-symbol original prefixes are printed in the reproducible workflow log.

### Historical-F sentinel variant: original negative and 534 genuine interruptions

To avoid selecting the rare EA rune as a special symbol without a source clue, the same **complete original 12,956-rune inverse** is now executed with **F** as the literal nonclocking symbol. This is a substantially stronger historical candidate because F is an actually authenticated interrupter on other Liber Primus pages, even though the proposed duplicate-ciphertext emission and six-symbol sum remain unlicensed hypotheses.

With this alternate alphabet, the unchanged original rank stream has weighted English log score **−3.95606706 nats per rank** after independently maximizing every six-offset hidden key, again uniform-like and nonlinguistic. The source has exactly the same **86** duplicate-escape positions; neither preassigned source chapter nor word layout is adjusted. The independent genuine solved-p57 native plants include their naturally occurring plaintext F symbols plus deterministic literal F interrupts at every 97th plant position, and occasional index28 EA test symbols within the ordinary 28-symbol alphabet. In nine long **key-blind** native inversions the exact same decoder recovers all **12,413/12,413** non-F source labels plus all **534/534** literal-F interrupts. The native control has average log score **−2.87359411 nats per ordinary rank** and GP28 IoC **0.07330–0.07497** in its nine chapters.

The observed escape share of the unknown original is **86/12,947=0.664%**, whereas the deliberately F-rich planted reference has **534/12,947=4.124%**; the contrast is a register-dependent clue, since different original plaintext could use fewer F symbols. Regardless, **the optimized F-sentinel original output is not English**, so this exact, source-motivated six-window interpretation is rejected alongside EA. The manuscript's actual F bypass in known sections remains an established *different* encoding behavior; this experiment does not disprove its existence elsewhere.

[Full dual-interrupter passing CI run **43658418855**](https://github.com/FlareZ123/liber-primus/actions/runs/43658418855); all nine complete original key inversions, both correct forward ciphertext re-emissions, and eighteen independently key-blind native solved-prose plants passed.

## Decision and limits

**Retire this specific six-window GP28 plaintext moving-sum decoder under both EA and historically motivated F-escape assignments as a direct original-LP2 solution.** It produces excellent known-native prose recovery under identical key inference but no original unknown-page language or key. Its six-symbol lag is inspired by existing ciphertext echoes, but an actual author-visible instruction selecting six-term sums, ordered GP28 differences, an EA/F duplicate-emission escape, or a six-register seeded initialization has not been recovered. The result does not exclude a different dynamic state transition, alternate language, nested cipher, or author-supplied keystream.

The productive surviving question is **where the manuscript specifies the actual reversible transition or key**. Do not extend this negative by trying unfounded window sizes, arbitrary rolling coefficients, seed tweaks, or fitted source exceptions. The exact-state elimination method is reusable if a new original clue identifies another short rolling register.
