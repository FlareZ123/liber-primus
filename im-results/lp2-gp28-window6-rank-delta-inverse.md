# LP2 original nonrepeat stream: exact five- and six-symbol moving-sum inverses

**15 November 2026, Agent27. Original-source bounded negative with a complete exact-state key recovery algorithm and nine native-English positive plants. No unknown plaintext, author-authenticated key, or continuation destination is recovered.**

## Source motivation and independently testable cipher

Original LP2 contains 12,956 unknown GP29 runes across 55 rune-bearing physical pages, organized into nine visually delimited chapters. Within these chapters there are **86** equal-consecutive-rune events. All remaining within-chapter successor differences are nonzero and therefore have exactly **28** possibilities. Separately, original source-conditioned anomalies include five-back and six-back symbol echoes (see [lag5/lag6 heldout predictor](lag5-lag6-heldout-conditional-prediction.md)), suggesting a small rolling state. These are ciphertext constraints; the book does **not** instruct the particular arithmetic operation proposed below.

A sharply specified, fully invertible candidate uses the original GP29 ciphertext rune \(C_t\), calculates \(d_t=(C_t-C_{t-1})\bmod29\), and interprets \(d_t=0\) as a possible literal nonclocking escape. **Two source-frozen encodings are tested:** (a) the unusual GP rune **EA** (index28), treating ordinary symbols 0…27 as the 28 cyclic states; and (b) historical **F** (index0), motivated by the genuine solved LP1/p56 F-interrupter convention, treating ordinary symbols 1…28 as the 28 cyclic states. The historical F rule prints a literal F rather than a duplicate predecessor; changing its emission to a duplicate is an explicit hypothetical design choice. At all nonzero steps, define \(R_t=d_t-1\) (an integer 0…27), and hypothesize an ordinary **W-position moving sum of plaintext GP28 ranks**, with **W=5** suggested by the five-dot source motifs and five-back ciphertext echoes, and **W=6** as a separate adjacent-lag control:

\[
R_t=\sum_{j=0}^{W-1}P_{t-j}\pmod {28},\quad W\in\{5,6\}.
\]

Within each encoding, the plaintext inner cyclic state uses its rune's rank among the other 28 labels. The first **W−1** nonzero ranks of each source chapter are treated as freely visible cipher IVs while the plaintext register fills, rather than used as a key constraint. Rank W is the first constrained rolling sum. An arbitrary initial ciphertext rune is a separate source-visible IV. Chapter keys/state reset at each of the nine original visual boundaries, while physical page boundaries inside a chapter do not reset the register. Original glyphs and chapter starts are unchanged.

Both alternatives are different models from [the tested delayed GP29 additive autokey with stochastic collision repair](delayed-plaintext-autokey-hmm.md): it uses a GP28 predecessor-rank register with exact repeat escapes, and a five-/six-position *plaintext moving sum*, without random repairs.

## Exact secret-state inverse without a seed brute force

For nonrepeat steps \(t\ge W\), the consecutive-rank difference cancels **W−1** of W summed plaintext terms:

\[
P_t-P_{t-W}=R_t-R_{t-1}\pmod{28}.
\]

Therefore each residue class \(t\bmod W\) is a deterministic chain after fixing **one** of W initial plaintext symbols. Construct \(O_t\) by \(O_0=\cdots=O_{W-1}=0\) and \(O_t=O_{t-W}+R_t-R_{t-1}\bmod28\). Every possible plaintext of this candidate cipher is then \(P_t=O_t+s_{t\bmod W}\), where the W secret offsets satisfy just the source-derived checksum \(\sum_{i=0}^{W-1}s_i\equiv R_{W-1}\bmod28\).

The exact maximum-independent-English-unigram score can be found with **W 28-way loops and one 28-state modular-checksum dynamic program**. It scores all 28 possibilities for each residue-class Caesar shift against a fixed external GP28 English prior, then maximizes subject to the checksum. This replaces nominal secret-seed sweeps of \(28^4=614,656\) for W=5 and \(28^5=17,210,368\) for W=6. The source supplies no evidence selecting the English language model or the moving-sum code.

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

The [successful original-source CI run **43659130438**](https://github.com/FlareZ123/liber-primus/actions/runs/43659130438) executes the full source regression and positive controls on Node22 with the unchanged canonical [LP2 numerical corpus](../resources/liber-primus/lp2-corpus.json). The program asserts source totals and all complete reencryption/plant-recovery relationships. The 36 chapter/mode scores and exact decoded 18-symbol original prefixes are printed in the reproducible workflow log.

### Independently selected five-position window

The original terminal clear page p56 visibly prints **five black dots**, and the original p55 floral border has five-dot clusters; the manuscript also has a previously measured five-back ciphertext echo. These marks provide a separate *human-noticeable* motivation for **W=5**. The figures do not label the dots as a cipher register, supply an emission rule, or select the two escape interpretations. The **same original 12,956-rune inputs**, fixed GP28 priors, nine chapter starts, full secret-state DP and key-blind solved-p57 controls were rerun with the single width change **W=5**.

| Hypothesized rolling plaintext width | Escape rune | Original weighted log-English score per rank | Native control log score per rank | Native rank recovery |
| --- | --- | ---: | ---: | --- |
| **5**, dots/five-back | EA | **−3.96564742** | −2.89915562 | 12,815/12,815 |
| **5**, dots/five-back | **F** | **−3.98389875** | −2.87359411 | 12,413/12,413 |
| **6**, adjacent-lag control | EA | −3.94233653 | −2.89915562 | 12,815/12,815 |
| **6**, adjacent-lag control | **F** | −3.95606706 | −2.87359411 | 12,413/12,413 |

All 36 complete original chapter forward re-encryptions match original ciphertext exactly, and all 36 native plants recover their hidden GP28 plaintext exactly, including 132 EA-sentinel or 534 F-sentinel escapes per nine-plant family. Both **W=5** original decodes remain uniform-like and nonlinguistic despite the clue-constrained five-dot choice. **No original plaintext or key appears under any of the four complete settings.** The widths are a bounded comparison based on distinct visible clues, not a search over fitted key lengths.

### Five-dot bookended pp8–22: one continuous original-state clock

The original five-dot emblem is a documented **pixel-matched reused drawing** at the **end of p7** and **beginning of p23** (plus solved p56's lower margin), with a vertical reflection of the first motif onto the second; see the independent [exact original-image stencil census](lp2-p23-p56-halfturn-five-dot-handoff.md). This creates a more meaningful start/stop hypothesis than resetting the proposed register at p15: run one continuous cipher on **all 3,632 original runes of pp8–22** between the two actual boundary dots. The 3,632 runes contain **19 equal transitions and 3,612 nonzero successor ranks**. Reflecting the page art gives the two fixed natural reading orders: entire stream forward or entire stream reversed, without fitting cut positions, byte orders, or seeds.

All **eight exact secret-state inversions** below use the same trained GP28 register priors and exhaustive checksum-constrained dynamic program as the chapter analyses; all recover the original 3,632-rune ciphertext exactly on re-emission. Each has a separate source-disjoint genuine-p57 plaintext plant at the same original length and the selected F/EA escape semantics, whose hidden plaintext is recovered without seed disclosure.

| Register width | Literal escape | Forward source log score | Reversed source log score | Original decoded IoC, forward/reverse | Held-out native log score |
| --- | --- | ---: | ---: | --- | ---: |
| **5** | EA | −4.03221026 | −4.03817965 | 0.03589 / 0.03585 | −2.89877946 |
| **5** | F | −4.05278692 | −4.05839826 | 0.03582 / 0.03582 | −2.87411992 |
| **6** | EA | −4.02268351 | −4.01917621 | 0.03585 / 0.03592 | −2.89877946 |
| **6** | F | −4.03698979 | −4.03476730 | 0.03589 / 0.03596 | −2.87411992 |

The planted original-length native controls correctly recover **3,594/3,594** ordinary GP28 symbols for the EA model (with 37 planted escapes), or **3,482/3,482** for the F model (with 149 planted interrupts), in either reading direction and either window size. None of the eight original inversions contains a contiguous GP-English plaintext passage. This also rejects the simpler source-selected **p7→p23 continuous window** route for this particular arithmetic transition. It does not rule out a different reversal on glyph shapes or an independent author-authenticated cipher.

[Passing fully bounded original-image-motivated CI run **43659130438**](https://github.com/FlareZ123/liber-primus/actions/runs/43659130438), covering the eight additional exact-state original inversions and eight planted native controls, alongside the full 36 chapter-source cases.

### Historical-F sentinel variant: original negative and 534 genuine interruptions

To avoid selecting the rare EA rune as a special symbol without a source clue, the same **complete original 12,956-rune inverse** is now executed with **F** as the literal nonclocking symbol. This is a substantially stronger historical candidate because F is an actually authenticated interrupter on other Liber Primus pages, even though the proposed duplicate-ciphertext emission and either rolling-sum length remain unlicensed hypotheses.

With this alternate alphabet, the unchanged original rank stream has weighted English log score **−3.95606706 nats per rank** after independently maximizing every six-offset hidden key, again uniform-like and nonlinguistic. The source has exactly the same **86** duplicate-escape positions; neither preassigned source chapter nor word layout is adjusted. The independent genuine solved-p57 native plants include their naturally occurring plaintext F symbols plus deterministic literal F interrupts at every 97th plant position, and occasional index28 EA test symbols within the ordinary 28-symbol alphabet. In nine long **key-blind** native inversions the exact same decoder recovers all **12,413/12,413** non-F source labels plus all **534/534** literal-F interrupts. The native control has average log score **−2.87359411 nats per ordinary rank** and GP28 IoC **0.07330–0.07497** in its nine chapters.

**Independent, key-free plaintext-letter count gate for the F mode.** Under the proposed all-F-to-doublet encoding, every one of the 86 original repeated transitions is forced to be a plaintext F, and none of the other 12,861 nonzero transitions may be F: exactly **86/12,947** literal plaintext F symbols follow, regardless of any seed, moving-sum width, or language scorer. The two actually solved terminal controls contain **1 literal plaintext F in p56's 85 GP runes** (the authenticated nonclocking F at offset56) and **3 literal F symbols in p57's 95 clear runes**. If the original 12,947 positions had the same pooled **4/180** F probability as these independent genuine terminal-prose controls, their expected F count would be **287.71**. A simple independent-symbol binomial tail for at most86 is **p ≈ 3.91×10⁻⁴⁵**; even an assumed 1.00% F frequency gives **p ≈ 2.87×10⁻⁵**. These tails are **conditional diagnostics**, not calibrated corpus-wide significance, since actual text has dependent letters and may use quite different vocabulary. The algebraic count constraint remains exact under the stated F-sentinel encoder. It disfavors that model without fitting any initial secret, and does not constrain the authentic *literal visible-F* convention used on p56.

The observed escape share of the unknown original is **86/12,947=0.664%**, whereas the deliberately F-rich planted reference has **534/12,947=4.124%**; the contrast is a register-dependent clue, since different original plaintext could use fewer F symbols. Regardless, **the optimized F-sentinel original output is not English**, so both exact source-motivated five-/six-window interpretations are rejected alongside EA. The manuscript's actual F bypass in known sections remains an established *different* encoding behavior; this experiment does not disprove its existence elsewhere.

[Full four-model passing CI run **43659130438**](https://github.com/FlareZ123/liber-primus/actions/runs/43659130438); all 36 complete original chapter inverse/re-emission checks and 36 key-blind native solved-prose controls passed.

## Decision and limits

**Retire this specific five-/six-window GP28 plaintext moving-sum decoder under both EA and historically motivated F-escape assignments as a direct original-LP2 solution.** It produces excellent known-native prose recovery under identical key inference but no original unknown-page language or key. Its bounded lag choices are motivated by five-dot source motifs and five-/six-back ciphertext echoes, but an author-authenticated instruction selecting moving sums, ordered GP28 differences, an EA/F duplicate-emission escape, or an initial-register rule has not been recovered. The result does not exclude a different dynamic state transition, alternate language, nested cipher, or author-supplied keystream.

The productive surviving question is **where the manuscript specifies the actual reversible transition or key**. Do not extend this negative by trying unfounded window sizes, arbitrary rolling coefficients, seed tweaks, or fitted source exceptions. The exact-state elimination method is reusable if a new original clue identifies another short rolling register.
