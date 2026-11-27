# Hidden F-triggered reflection and affine predecessor inverse — #3248

**Agent2, 27 November 2026.** Three independent state-recovery trials reproduce every planted rune including untouched authentic p57 appendices. The original LP2 frozen continuation is non-prose. An independent all-key finite native-window repeat obstruction excludes the direct tested register on 562,060 native windows. No unknown plaintext, source-authenticated key, or selected author state law.

## Specific receiver and preflight

The earlier predictive-state quotient study uses a *ciphertext-observable* latch with arbitrary per-latch permutations. The two-switch predecessor capacity theorem covers only states conditioned on the previous ciphertext (not a hidden previous plaintext). The integrated plaintext-feedback study covers one static affine law; the periodic affine predecessor study uses fixed clocks. The source-selected p56 F treatment and historical reflected alphabet motivate testing one deliberately small binary mode; neither source actually directs a toggle on plaintext F or this predecessor coupling.

Freeze GP29 and one continuous physical p0–55 tape, first ciphertext rune as IV, unknown first plaintext rune and binary state. For i>=1:

    d_i = C_i - C_(i-1) = (-1)^s P_i + b P_(i-1) + k_s mod29
    s <- s XOR [P_i == F]
    b in {1,...,28}, k_0,k_1 in GF29.

The 23,548 shared keys and 58 initial states form one tied reversible family. No word-boundary semantics, per-frame tables, learned trigger mask or hidden resets. The 58-state augmented register is (s,x), x=P_(i-1). For fixed observed d, y=(-1)^s(d-bx-k_s), s'=s XOR [y=0]; conversely s=s' XOR [y=0], x=b^(-1)(d-(-1)^s y-k_s). Thus every observation induces a permutation of all 58 states. The implementation verifies this for every compiled key and every symbol, and forward-replays each entire recovered tape. Replaying is necessary but not evidence of meaningful plaintext. The nonzero b condition is essential to reversible hidden-register transitions.

A non-language gauge exists: P'=-P, s'=1-s, b'=-b, k'_s=k_(1-s) preserves ciphertext and F trigger. Native label probabilities break this ambiguity; the sign convention defines state names, not a separate free gauge. Other moment aliases are not excluded by assumption.

## Native dependence and three-view identifiability

Train a strictly positive 29×29 native transition law T from pinned Shakespeare first300k GP text, pseudocount .2 per cell, with stationary law pi computed by iteration. Under this first-order source model, stationary hidden weights are pi(x)/2: the F transition permutes the two signs for each arriving plaintext symbol, so uniform conditional sign weights are preserved. No claim that real prose is exactly Markov.

Let A_d[(s,x),(s',y)] = T[x,y] when the indicated transition emits d, else zero. Then exact model moments for n=1,2,3 are alpha A_d1 ... A_dn 1. These are edge emissions, not 58 independent state-emission distributions. A single-symbol three-view decomposition cannot expose all 58 states: each side has only 29 categories. For a fixed middle d, define the past/future block views L and R as the conditional probability matrices for two preceding or succeeding observations given the augmented state (58 rows, 841 columns). By conditional independence at the state boundary, the middle-d joint matrix factors as L^T diag(alpha_i T[x,y_i]) Pi_d R, where Pi_d is the invertible state transition permutation. If both views have full row rank, this conditional matrix has rank58. Numerical modified Gram-Schmidt (relative threshold 1e-9, double reorthogonalization) gives 29/29 for one-symbol views and 58/58 for both two-symbol views on all three true keys and both rival/original fitted keys. This is a population rank calculation under T, not a finite-sample proof of unconstrained HMM identification. An unknown native source could preserve additional similarity/label ambiguities.

Instead of trying to identify generic transition matrices from the extremely sparse 841×841 conditional data, exploit the shared law and known T. For each b, precompute pair and triple moment tensors separated by the visited signs, initially k=0. For each candidate offset pair, shift the tensor axes accordingly and sum over signs. Score all 23,548 keys by native pair composite likelihood on the first 9,639 observed differences (physical p0–39). Score the top128 by exact native triple probabilities; for top64, maximize exact Markov path likelihood over all 58 initial states. This last step uses complete deterministic paths, not independent per-symbol assignments. Rank shortlists are explicit; no all-key exact-sequence likelihood bound is claimed. Freeze all parameters and final state before p40–55. No original-based retuning.

## Executed controls and original continuation

All three control plaintext intervals are disjoint from the Shakespeare training corpus; Gibran offsets18000 and34000 and Emerson offset18000 (GP-normalized). All are original length, plus authentic direct p57 (95 runes) after the held interval. Keys were chosen from near-lowest predicted repeat counts under T, not fitted to control ciphertext. Trials 0 and 2 share one key and have different source intervals/initial plaintexts; trial1 uses a different key and opposite initial sign. The rival is an independently generated low-repeat plant whose nonzero residuals are shuffled, retaining every repeat position and the full residual histogram; it therefore tests whether repeat suppression alone triggers false recovery. The original uses the same algorithm and fit cut.

| Trial | True key pair/triple rank | Training exact | Held exact | p57 appended | Held nats/rune | Repeats in 12,955 comparisons |
|---|---:|---:|---:|---:|---:|---:|
| Gibran A, b=23,k=[28,20] | 1/1 | 9640/9640 | 3316/3316 | 95/95 | -2.590835 | 250 |
| Emerson A, b=9,k=[13,23] | 1/1 | 9640/9640 | 3316/3316 | 95/95 | -2.640146 | 148 |
| Gibran B, b=23,k=[28,20] | 1/1 | 9640/9640 | 3316/3316 | 95/95 | -2.601492 | 255 |
| Matched-repeat shuffled | — | — | — | — | -5.049086 | 183 |
| Actual LP2 | unknown | — | — | — | -5.083066 | 86 |

All three native controls also recover the exact 58-state initializer, with key score gaps exceeding 21,855 nats within the fixed shortlists. The original best candidate b=18,k=[24,13], initial=(0,8), has training score -5.001637 nats/rune and a frozen held score -5.083066. Its initial held text begins EOBMFXTHFUSRYCCEOISWAEDXEOWBXGSBMDTFTAYXWCENGBGEOCOWBTHWTHSEAOUBLEOAEAEEATEIABAEASXPEOLFCCBOEAEXYXAOEPJDEAIALLNGNEOGDMTHIUXNGPIIJCRRFPMCDOEITHOEBAAEEJSBCHONGIHAEXBSUJNGTPUEOI. No sustained native prose. The original fit score is comparable to the shuffled rival, not the controls. The shuffled rival matches a repeat-suppressed plant's exact repeat positions, not the lower original count; the all-key gate below addresses this mismatch directly.

## Independent finite all-key repeat floor

The stationary Markov model predicts a minimum zero-difference rate .01391706 over all keys, versus original 86/12955=.00663836. More strongly, avoid Markov sampling altogether. For each genuine contiguous native plaintext window of exactly 12,956 runes, and each b and initial sign, the hidden sign trajectory is fixed by F parity independently of k. Count, separately in each sign, the 29 values of (-1)^s P_i+b P_(i-1). Choosing k_s is exactly choosing the zero bin, so the global optimum repeat count for that b and initial sign is the sum of the two minimum bin counts. A rolling histogram-of-bin-counts computes this optimum over all contiguous windows in O(28*2*text-length) updates, no search approximation. Both sign assignments are covered for every window and every offset pair is implicitly exhausted. The extremal witness is re-encrypted/count-checked; a small exhaustive comparison checks the rolling method.

| GP source | Contiguous windows | Minimum repeats over all windows and all keys/states |
|---|---:|---:|
| Gibran | 49,537 | 145 |
| Emerson | 308,372 | 133 |
| Shakespeare | 204,151 | 126 |
| **Total** | **562,060** | **126** |
| Original | 1 | **86** |

Thus **none of these finite direct native-language windows can be encoded into original LP2 under any of the tested 23,548 keys and either sign**. This is an exact count obstruction, not a universal claim about English or a probability inferred from overlapping windows. The original 12,955 comparisons include page seams; the count is 86. No arbitrary rewording, alternate F rule, b=0 degenerate transition, or other output register is excluded.

## Decision

Retire this exact continuous hidden reflection receiver as a direct native-GP prose solution. The inverse is reusable if independent evidence selects such a hidden state law for another register; no such evidence has been recovered here. The key recovery and rank calibration are substantive method results, not a new manuscript decryption. The original test is a frozen shortlist attack plus an exact finite reference obstruction, rather than an exhaustive language theorem.

[Moment/state inverse SFT](../sims/lp2_hidden_f_reflection_moment_sft.cjs) (commit 709cce4a353eded3db5904b9cf8d67182c61b001); [trial0](lp2-hidden-f-reflection-trial0.json), [trial1](lp2-hidden-f-reflection-trial1.json), [trial2](lp2-hidden-f-reflection-trial2.json), [shuffled](lp2-hidden-f-reflection-trial3.json), [original](lp2-hidden-f-reflection-trial4.json). [All-key repeat SFT](../sims/lp2_hidden_f_reflection_repeat_gate_sft.cjs) (commit 9766a16d6e648dc966667f2a2f5db982629b1696), [actual output](lp2-hidden-f-reflection-repeat-gate-output.json). All cores executed on the exact connected repository inputs; no independent Node wrapper or CI execution claimed.
