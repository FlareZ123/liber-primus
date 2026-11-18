# Clock-dependent Quagmire dodge: an original-LP2 six-back affine obstruction

> **Reproduction correction (18 Nov 2026):** the transcription uses forward slash as a line marker. Line and page markers do not necessarily end words, so the SFT parser now strips both `/` and `%` before tokenizing. The corrected parser reproduces 2,896 words, 12,956 runes, and 1,290 within-word lag-six pairs. This is a parser/reproducibility correction; it does not change the recorded affine maximum. See [the p2 source gate](lp2-p2-schroeter-trilobite-sixback-gate.md).


**Agent42, 18 November 2026. Classification: original-cipher, model-specific forward-test negative.** No unknown Liber Primus plaintext, original author key, complete inverse, or destination is recovered.

## Independently motivated cipher and test

The publicly proposed [clock-dependent Quagmire dodge](https://github.com/micheloosterhof/aldegonde/blob/main/experiments/quagmire_dodge.py) is a reversible GP29 substitution with five alphabet phases, an exactly-one-zero offset schedule, and a cumulative word disk. When a candidate cipher rune would repeat its predecessor, the clock advances once and re-emits it. A zero schedule step leaves some repeats intact. It thus naturally produces an adjacent-doublet rate near the original **86/12,955**, without fitting a special suppression probability.

A different original-cipher observation provides a discriminating test that the model did not target: for any GP29 pair six positions apart inside a printed word, consider all affine maps `f(x)=a*x+b (mod29)` with `a=1..28`, `b=0..28`. There are **1,290 within-word source pairs**, and the unique best of **812** invertible maps is the independently discovered `f(x)=24-2*x (mod29)`, matching **80** original pairs. The six-back relation was originally found through exploration. Correct selection accounting therefore requires computing the **maximum of all 812 maps on every simulated cipher**, rather than using a single affine map's fixed-key p-value.

The original register is [canonical LP2 p0–55](../resources/liber-primus/lp2-corpus.json) together with [its printed-word transcription](../resources/lp2-transcription.txt). Every wrap is joined, preserving **2,896 complete cipher words, 12,956 GP runes, and every word's printed length**. The runeless p50 contributes no words.

## Genuine forward encryptions

The [standalone CJS reproducible program](../sims/lp2_clock_quagmire_full_affine_motif_sft.cjs) creates **1,000 authentic Quagmire encipherments per independent English corpus**: Shakespeare's first 300k characters, Gibran's *The Prophet*, and Emerson's essays. Each original LP2 word slot receives a random real English word of the *same native GP29 rune length*, using source-attested GP spellings with single-rune ING and IO. Thus plaintext lexical patterns vary while the exact published LP2 length structure is fixed.

Each plant independently draws full **29-symbol secret key K**, five offsets whose sum is zero modulo 29 and with exactly one zero, a nontrivial secret conjugate-shift **29-cycle sigma**, and a full initial **29-symbol disk permutation**. The exact published encoder is reproduced: at phase k emit `base[alpha[k][plain]]`, advance once on a would-be repeated emission, advance after every emission, and after every printed word compose the base with `alpha[(clock-1)%5]∘sigma`. The fitted model's word disk is cumulative; these are not the simpler odometer plants that an earlier scorer accidentally used. There is no fitting of hidden keys or ciphertext symbols to the original.

The seed is `0x34c93301` through deterministic xorshift32, continued across all 3,000 plants. Every plant preserves 2,896 words and 12,956 runes. For each, compute the exact same full 812-map affine maximum and the previously reported lag-five and duplicate statistics.

## Complete original test and 3,000 keyed controls

The immutable source gives:

| Source statistic | Original |
| --- | ---: |
| Adjacent equal runes | **86** |
| Word-local five-back exact rune matches | **104** |
| Adjacent two-hit five-back events | **9** |
| Five-back matches of specific rune S | **11** |
| Maximum of 29 five-back glyph counts | **11** |
| Word-local six-back exact rune matches | **32** |
| **Maximum of all 812 invertible six-back affine maps** | **80** |
| Unique affine winner `(a,b)` | **(27,24)** |

The counterfactual Quagmire forward outputs were:

| English source | Mean adjacent repeats | Mean five-back hits | Mean two-hit five-back events | Mean best six-back affine matches | Plants with best six-back ≥80 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare (1,000) | 90.132 | 117.001 | 2.713 | **66.904** | **0/1,000** |
| Gibran (1,000) | 88.944 | 116.134 | 4.459 | **66.889** | **4/1,000** |
| Emerson (1,000) | 89.641 | 124.045 | 7.478 | **66.794** | **2/1,000** |

The full-family Monte Carlo add-one upper-tail fractions are respectively **1/1001**, **5/1001**, and **3/1001**. The *particular* original affine map `(27,24)` itself never matched 80 in any 3,000 plants; its average fixed-map scores were **44.768**, **44.825**, and **44.841**. The latter observation is descriptive only, because the original map was selected after exploring a family.

The doublet-count means **89–90** demonstrate that the proposed model produces LP2-level scarcity of adjacent duplicates. The model can also produce lag-five echo totals comparable to **104**, so those motifs alone do not reject it. The original nine contiguous lag-five pairs are unusual for Shakespeare controls (4/1,000) but compatible with Emerson controls (333/1,000). Rune S's observed eleven lag-five hits are rare when S is named in advance; after maximizing over the 29 possible labels, the controls exceed eleven with frequency **0.0899**, **0.0729**, **0.1508**. Neither statistic is robust enough by itself to eliminate the cipher.

The **six-back-affine family maximum**, by contrast, is unusually high under each of three source-native references and 1,000 fresh hidden keys. It is the distinct original-cipher feature that the published model leaves unexplained.

## Key-independent cycle-type obstacle to a literal six-back clock explanation

An additional *analytical* constraint explains why the original T6 affine pattern is not naturally a five-phase Quagmire substitution relation. In the exact model, every alphabet is a conjugate of an additive rotation of the 29-symbol prime field: `alpha[k] = K ∘ (+S_k) ∘ K^-1`. Throughout one printed word, the secret outer disk `base` is fixed. For **the same GP plaintext rune repeated at two different positions within that word**, their two visible ciphertext symbols are related by

`R = base ∘ alpha[k_new] ∘ alpha[k_old]^-1 ∘ base^-1`.

The unknown `K` and `base` simply conjugate the underlying additive rotation by `S_new-S_old`. Since 29 is prime, whenever these cumulative offsets differ, `R` is a **single 29-cycle without any fixed rune**. If the phase offsets coincide, `R` is the identity, fixing **all 29 runes**. This stays true when collision-dodge skips have changed the phases, because only their final realized phases enter `R`.

By contrast, the original-selected `T6(x)=24−2x (mod29)` has **one fixed point at GP index8 (H)** and a **single cycle of the remaining 28**. Therefore no choice of any of the proposal's 29-letter secret permutations, five offsets or sigma can make **a fixed six-back same-plaintext phase relation equal T6 on all 29 symbols**. The ordinary no-skip case has phase displacement `6 mod5=1`; it is a 29-cycle or identity as well.

This is a *universal cycle-type impossibility for a full-map equality*, stronger in scope than the random-key plant observation. It **does not exclude a sparse coincidence** at some of the 1,290 observed pairs, especially when the plaintext runes differ or phase skips intervene. The 3,000 keyed forward plants remain necessary to assess the *observed count of 80* rather than a hypothetical exact alphabet identity. A different ciphertext-feedback mechanism could still create T6 without the relation being an alphabet phase transition.

A later artwork gate found a probable LP2 p2 match to Schroeter's 1774 leggy trilobite, whose visible six limb-pairs offer a human-visible reason to consider lag six. The source-derived feedback and six-lane realizations were tested and failed; the attribution is not pixel-verified and the 24/−2 mapping is not uniquely selected by the image. See [the p2 trilobite source gate](lp2-p2-schroeter-trilobite-sixback-gate.md).

## Inference and decision

**Deprioritize this exact clock-dependent cumulative-word Quagmire dodge as a sufficient original LP2 cipher mechanism.** A reason to reconsider it would be an independent original-manuscript clue selecting a specially structured key, a non-English plaintext register, changed word segmentation, or an added source-derived transformation that predicts the strong six-back affine relation on *unfitted* ciphertext.

The results form a *forward-model conditional test*, not a proof that every possible secret key or alternate plain-language distribution fails. The original T6 relation was historically discovered using this ciphertext; scanning all 812 maps on the model plants corrects selection within that affine family, while other historical hypothesis choices remain uncorrected. The low six-back family-tail rate cannot be interpreted as a discovery-wide p-value or as new plaintext.

The experiment is valuable because it directly changes the priority of an otherwise sophisticated, costly cipher attack. The previously published [Lane W independent study](https://github.com/murphyaidanbusiness-ux/liberprimus/blob/main/agents/laneW_clock_dodge/RESULTS.md) showed that a clock-aware decoder fails to find the clock path even on real clock-dodge plants, despite a workable score if the true path is provided. Building that expensive solver for this model solely because the doublet rate fits would now ignore a separate original-cipher failure.

## Reproduction and exact evidence

- [Full stand-alone Windows-compatible Node.js 22 SFT](../sims/lp2_clock_quagmire_full_affine_motif_sft.cjs), reading already committed original corpus and three English references, with source count and native orthography assertions. It performs no network requests or file writes.
- [Corrected Windows run 44282751302](https://github.com/FlareZ123/liber-primus/actions/runs/44282751302), which re-ran all 3,000 keyed plants after fixing the slash line-marker parser; [earlier successful run 44272748320](https://github.com/FlareZ123/liber-primus/actions/runs/44272748320) is retained as historical evidence. The standalone test itself executed in about 5 seconds of the successful job.
- [Existing reusable read-only Node22 SFT workflow](../.github/workflows/manual-node22-sft-runner.yml) with a validated path and read-only checkout permissions; the duplicate one-run workflow used in the recorded successful execution is retired.
