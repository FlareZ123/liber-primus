# Constructive independent-alphabet known-schedule recovery (2026-11-26)

Agent 10. Follow-up to the exact Fibonacci orbit gate. Model: permutations alpha,beta of GP29 fixing 0; non-F P consumes shift K, with beta(C)=alpha(P)+K mod29; literal F holds the clock. Known periodic schedule but unknown phase and both alphabets.

## Method
Exact forward/backward over the phase states, accumulating expected consuming counts G[c,t] and hold count H. Conditional M-step for beta: Hungarian assignment, weight W[c,b]=sum_t G[c,t] log p[alpha^-1((b-K[t]) mod29)]. Conditional alpha M-step: assign plaintext frequency ranks to expected decoded rank counts by sorting. A decreasing artificial probability for illegal consuming rank0 permits exploratory EM steps; final scoring uses strict zero. Unigram Viterbi rank tape, bigram permutation annealing on alpha with exact incremental swap objective, then exact Viterbi on (phase,previous plaintext). Freeze both alphabets, ending phase and preceding plaintext symbol after the first 1200 glyphs; decode the last 703 without refitting.

Emerson language training: blob a92be8ba5b3511a003a22ba31523c14397aaa83a, 321327 GP runes, additive .5 smoothing. QU→CW, ING→NG, IO→IA, V→U,K/Q→C,Z→S, greedy digraph. Independent Gibran blob df260a07d56bf5998d40a6360b6132c35c252d10 offset10000, seed202611260; Shakespeare blob 94c677ad9dd50771c6670e0c4e4dad9052b46d85 offset30000 seed202611261. 150 restarts ×50 EM steps; initial alpha anneal 100×8000 swaps, 20 later starts. Mixed [5,27] and pure [1,6] Fibonacci seeds respectively. Scale/phase gauge 1 and 24.

## Actual local outputs
| Test | Fit correct /1200 | Frozen suffix correct /703 | Beta labels | Observed alpha labels | Fit log-score |
|---|---:|---:|---:|---:|---:|
| Gibran blind |1200|703|29/29|25/25|-3091.8821|
| Shakespeare blind|1200|700|29/29|27/27|-3251.4031|
| Original mixed orbit|unknown|no legal continuation|unknown|unknown|-5022.9132|
| Original pure orbit|unknown|no legal continuation|unknown|unknown|-5072.5421|

Both control tapes replay exactly, including F holds. Original legal fits 2/150 and 1/150. Full-chapter independent 2000-start exploratory optimization found zero legal fits in either orbit despite exact SAT witnesses. Optimizer failure, not a mathematical exclusion. Unknown unrestricted K update extension (q8 DIUINITY and q13 FIRFUMFERENFE controls, 1000×100 steps) failed: fit accuracy 9.75%/3.33%, effective action accuracy 6.03%/3.71%, both no legal heldout. Not applied to original. The calibrated receiver is useful specifically when K is independently known. No actual plaintext obtained. Local NumPy/SciPy/Numba runs; reconstructed portable wrapper pending separate commit. 
