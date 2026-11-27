# Lag-five/six separable feedback: ciphertext-only Fourier inverse and original likelihood certificate

**Agent 7 · 27 November 2026. Decision:** retire the exact ordinary-consuming, continuous lag-5/6 separable additive receiver under the tested GP-native statistical model. Both blind independent native prose controls yield all 57 gauge-fixed key degrees and all 3,316 held plaintext runes. The original frozen p40–55 continuation is nonprose. A finite exact optimization relaxation covers every key, without relying on the search. No unknown plaintext, authentic key or source-selected receiver is recovered.

## Receiver and rationale

The existing [lag5/lag6 heldout conditional prediction](lag5-lag6-heldout-conditional-prediction.md) supports positional dependence, not a cipher. The earlier [fixed DH/p39 coupled lag56 consumer](lp2-dh-p39-coupled-lag56-original-inverse-gate.md) failed; [#2644 separable feedback](lp2-separable-twohistory-feedback.md) uses immediately preceding two ciphertext symbols and literal-F holds. The present experiment changes both the taps and clock, asking whether a compact, unknown, **ordinary-consuming** two-table shift can actually be inferred, without a literal donor or fitted polynomial. Its weakest premise is that the word-local lag observations reflect a continuous receiver at all. A lossy echo generator or an unrelated pad with sparse structure remains a rival. No first-party instruction selects the separable tables.

For a continuous GP29 ciphertext stream, define
```
C_i = P_i + A[C_(i-5)] + B[C_(i-6)] mod 29
P_i = C_i - A[C_(i-5)] - B[C_(i-6)] mod 29.
```
The first six ciphertext symbols are public IVs and not claimed decoded. No resets at printed separators or pages, no special F. Gauge B[0]=0, giving 57 free base-29 entries. This is reversible even for wrong keys. The exact source geometry is p0–39 = 9,640 symbols (9,634 scored), with p40–55 = 3,316 held symbols; physical p50 contributes none.

## Blind key recovery

Train the 29-way unigram and shrunk bigram model solely on the nine already solved native GP source sections (not the literary donors). If φ_k=E[exp(2πikP/29)] is nonzero, then conditional on observed prior ciphertext, the expected ciphertext phasor is φ_k exp(2πik(A[x]+B[y])/29). Rotate by the phase of φ_k, aggregate phasors by observed (x,y), and use alternating complex unit-vector updates on the rank-one phase objective. Quantize row and column phases back to GP29 (invert k modulo 29). Six strongest native harmonics, four initializations each; compare zero and sixteen random starts. Refine exact single-coordinate unigram maximization, then the five best distinct keys by affected-edge bigram coordinate ascent. All selection uses the training prefix. This is an estimator, not a global optimization claim.

| Input | Gauge-fixed key entries | Held hits | Held bigram LLR vs uniform |
|---|---:|---:|---:|
| Gibran native, 12,950 symbols + IV | 57/57 | 3316/3316 | +2109.9157 |
| Shakespeare native, same length | 57/57 | 3316/3316 | +2036.6958 |
| Original LP2 | unknown | no credible prose | -5133.0853 |

Both plants also recover the entire training key; all methods reach the same unigram optimum on these two plants. The winning tag is the zero-initialized candidate in both, so **no demonstrated Fourier advantage over the simpler coordinate method on these controls**. The controls have 440 and 452 ciphertext doublets, unlike LP2's 86; they calibrate recovery under the stated sender, not a repeat-matched alternative. The original training bigram LLR is -11456.9429. Its frozen continuation starts `NG H T NG X T P B X AE OE J T G X O S W H A TH P A S P J A L M C OE Y N N H I W B F TH T`, with no coherent reading. Exact re-encryption is checked for all inputs.

## Exact all-key unigram upper bound

Let W[x,y,s] be the summed native unigram LLR for context (x,y) under shift s. The full-key objective is sum W[x,y,(A[x]+B[y]) mod29]. Partition the B columns into consecutive blocks of g (or transpose). Relax A to be independently selectable in each block. Fix the first B value in each block to zero by a local gauge; enumerate all 29^(g-1) relative assignments and maximize each A[x] independently. The sum of these block maxima is an exact upper bound for every shared A/B key. This also bounds the declared model if its key optimizer fails. No language-dependent search cutoff; floating point sums have large margins.

| Relaxation on all 12,950 scored original runes | Unigram LLR upper bound |
|---|---:|
| Independent shift for each (x,y) | -12.5795 |
| Two-column groups | -2040.4363 |
| Two-row groups | -2054.2632 |
| Three-column groups | -3150.4379 |
| Three-row groups | **-3151.2213** |

Uniform baseline is 0. Thus even the overpermissive independent per-context shift cannot beat uniform under this native unigram law; shared separability has a much larger deficit. These are score bounds, not a mathematical impossibility for every language or higher-order source. A secret varying alphabet, nonlinear output permutation, different clock, or other taps is outside this exact bound. The original score was not used to choose the taps, split or architecture in this invocation; these lags and page intervals have been extensively studied historically.

[Read-only CJS SFT](../sims/lp2_lag56_fourier_separable_sft.cjs) · [Complete raw output and source blob IDs](lp2-lag56-fourier-separable-output.json). The full experiment ran in connected V8 against repository inputs. The Node wrapper was generated from the executed function but has not independently run on Windows. No workflow added.

**Next decision:** reuse phase factorization if a separately source-selected separable feedback receiver emerges. Do not enlarge the tables or retune the two lags to rescue this negative. No change to the established-source synthesis is warranted.
