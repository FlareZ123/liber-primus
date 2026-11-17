# Original LP2 five/six-back echoes exclude the source-simple cyclic H2 prior on native-English controls

**Agent14, 17 November 2026. Classification:** conditional source-original model discrimination; no unknown-page plaintext, key or continuation. [Executable, deterministic Node22 SFT](../sims/lp2_h2_cyclic_lag5_original_sft.cjs). This result extends Agent38's prior random-table/global-IoC comparison and Agent30's independent-random-table/word-echo test to the *cyclic/Latin* table prior that survives global flatness.

## Why this model and why this decision

The authentic solved physical p56 uses the successive-prime Euler-totient stream modulo 29. An independently proposed collision-skip H2 branch redraws the next ciphertext rune when it would repeat the previous rune, consuming an additional prime state with probability q=0.81; this is motivated by LP2's scarce doublets but is not a Cicada-authenticated operation. Agent38 found that 29 *independently random* permutation rows did not reproduce the original manuscript's unusually flat global distribution in 1,600/1,600 controls, whereas a balanced *cyclic/Latin* tableau frequently did. Thus cyclic H2 is a materially different, still-eligible rival to Agent30's 29-independent-row simulation.

The smaller, historically simple model uses one secret but otherwise arbitrary GP29 alphabet permutation sigma and a deterministic row shift k_j=(prime[j]-1) mod29. It covers **both source-natural layer orders** and **both additive signs**:

1. Permute then shift: output = (sigma[plain]+sign*k_j) mod29.
2. Shift then permute: output = sigma((plain+sign*k_j) mod29).

Both define 29 valid, mutually related permutations and have an exact inverse given the secret sigma and the true skipped-key history. The original source *does not* select either second-layer permutation or the q parameter, and no such secret sigma has been recovered. The test asks whether this specific way of rescuing H2's global entropy also supplies the *independent* word-local five/six-back signatures a complete original cipher must account for.

## Original-source registers and controlled simulation

The untouched GP29 transcript (all physical p0–55, with runeless p50 omitted) has **12,956 runes in 2,896 complete printed words**, preserving 32 words across original physical-page boundaries. Printed line wraps and page transitions do not break a word. The native original word-length vector fixes all 10,060 inner-word positions and includes the long 14-rune words. The external plaintext word pools are independent Gibran and Shakespeare GP29 transliterations using the project's established ING/IO and U/V/QU orthography; **every simulated word has exactly the length of the corresponding actual original printed word**.

For each of eight predeclared source × order × sign cells, the SFT independently draws **500** deterministic 12,956-rune source-native books, their secret 29! sigma permutations, and actual q=.81 collision-skip histories, beginning with the first authentic p56 prime state. For **each of all 4,000 plants**, the test verifies the true secret inverse exactly reconstructs each one of its 12,956 plaintext glyphs. The original unknown text is never used to choose keys, source words, skips or plaintext.

| Original source feature | Genuine manuscript |
| --- | ---: |
| Global GP29 index of coincidence | 0.0344783978645 |
| Equal adjacent runes inside the same printed word | 63 |
| Equal runes five places apart inside a word | **104 / 2,105** |
| Specific GP index15 S→S at five places | **11 / 2,105** |
| Source-derived T6 echo C[j] = (24−2·C[j−6]) mod29 | **80 / 1,290** |

The T6 and S5 statistics were previously found by a much larger research campaign, and are not independently prespecified discoveries in this report. They are appropriate as *model-discriminating original targets*, not as new independent p-values.

## Frozen model-family results

Each entry below is **minimum–maximum** of 500 source-native synthetic books. The last three columns report the original manuscript's three longer-range echo counts. Every cell samples genuine full-length word shapes and uses a fresh secret alphabet and hidden key-skips on every plant.

| Native source | Order | Key sign | Adjacent within-word | Five-back equals | S5 | T6 |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Gibran | permute then shift | + | 34–110 | 48–95 | 0–9 | 26–62 |
| Gibran | permute then shift | − | 42–100 | 50–101 | 0–7 | 18–64 |
| Shakespeare | permute then shift | + | 41–93 | 50–94 | 0–7 | 26–69 |
| Shakespeare | permute then shift | − | 40–98 | 46–101 | 0–9 | 27–65 |
| Gibran | shift then permute | + | 39–85 | 46–97 | 0–8 | 27–66 |
| Gibran | shift then permute | − | 49–92 | 50–95 | 0–8 | 26–64 |
| Shakespeare | shift then permute | + | 36–84 | 47–100 | 0–9 | 26–68 |
| Shakespeare | shift then permute | − | 44–100 | 46–104 | 0–8 | 26–64 |

- **Global flatness survives:** the eight mean global cipher IoCs all lie between **0.0345045 and 0.0345091**, closely bracketing source-cipher 0.0344784. In each cell 432–454 of the 500 synthetic ciphertexts have IoC at least the original value, so original-like flatness alone does not reject this Latin construction.
- **Near-repeat suppression is compatible:** each cell's mean 58.8–68.9 within-word adjacent repeats is close to original 63, and its observed repeated-rune count falls within every cell's simulated range. This is the feature q=.81 was designed to reproduce.
- **Long-range source geometry is incompatible with the calibrated model:** **1/4,000** simulations reaches the original 104 five-back equality events, **0/4,000** reaches 11 S5 events, and **0/4,000** reaches 80 T6 affine echoes. The one five-back equality near-miss has only the ordinary model's low S5 and T6 counts; **0/4,000** reproduces the joint observed long-range signature.

With zero exceedances, the simple add-one single-target Monte Carlo tail for this *fixed eight-cell matched-source ensemble* is at most 1/4001≈0.000250. The eight cells are distinct model interpretations, and the three targets are correlated and retrospectively selected; do not convert this fraction into a discovery-wide likelihood or claim a theorem against all possible English/literary registers.

## Cryptanalytic consequence

This provides an **original-cipher model-selection negative**, separate from Agent30's previous independent-random-table H2 word-echo result. Making the 29-row secret tableau cyclic/Latin **rescues the original-like global alphabet flatness** without rescuing the source's significant word-internal lag-five and lag-six echoes. A jointly inferred H2 pointer and cyclic table could still decrypt *H2 synthetic controls*, but this does not by itself explain the authentic manuscript.

**For the intended human solve path, the missing input remains an authored state rule, plaintext-dependent synchronization, or an independent key/stream layer** that also predicts the real 5/6-back structure. Full H2 blind decoding on actual LP2 should not be licensed merely by matching entropy and doublets. Conversely, this finite negative does not exclude an H2-based multiple-layer cipher, non-cyclic secret table with other row balancing, stronger plaintext morphologies, or extra source-derived feedback. The original book's unknown plaintext has not been recovered.

**Reproduction:** [single self-contained read-only CJS SFT](../sims/lp2_h2_cyclic_lag5_original_sft.cjs) asserts exact source word lengths, original feature counts, per-rune native-GP planted roundtrips, then prints all eight seeded cell summaries with counts, means, minima and maxima. A matching independent full computation was executed through the connected GitHub-source JavaScript runtime on 17 November 2026, reproducing every cell. A Windows Node22 source-runner check has been dispatched; do not represent that queued workflow as a passing CI result until its status confirms success.
