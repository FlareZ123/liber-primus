# Constructive independent-alphabet recovery: known schedules and blind periodic factorization

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

Both control tapes replay exactly, including F holds. Original legal fits 2/150 and 1/150. Full-chapter independent 2000-start exploratory optimization found zero legal fits in either orbit despite exact SAT witnesses. Optimizer failure, not a mathematical exclusion. Unknown unrestricted K update extension (q8 DIUINITY and q13 FIRFUMFERENFE controls, 1000×100 steps) failed: fit accuracy 9.75%/3.33%, effective action accuracy 6.03%/3.71%, both no legal heldout. Not applied to original. That earlier receiver was useful specifically when K was independently known; the cross-phase bigram factorization below supersedes its failed q8 initializer on fresh controls. No actual plaintext obtained. Local NumPy/SciPy/Numba runs; reconstructed portable wrapper pending separate commit.

## 28 November: unknown common q8, cross-phase bigram inverse

This is a materially different blind receiver from the failed unigram-profile and cycle-annealing initializer ([prior raw](lp2-unknown-periodic-two-alphabet-profile-output.json), [diagnostic raw](lp2-unknown-periodic-two-alphabet-profile-diagnostic-output.json)). q8 is motivated by the historical WELCOME period, not a source-authenticated unknown-page key. Both GP29 alphabets and all key shifts are secret, except the ordinary affine gauge and literal nonconsuming F. Phase zero restarts at each of the nine physical chapter starts; headings remain ciphertext. The sender is C=B⁻¹(A(P)+K[j] mod29) for non-F, and literal F without a phase advance for F. A(F)=0. All nine original chapter lengths are used in the controls. First seven chapters (9640 runes) fit; last two (3316) are untouched held-out ciphertext. No printed word segmentation is used.

**New method.** Relax to an independent GP29 permutation T[j][c] per consuming phase. Use a short-to-full prefix curriculum for unstructured unigram phase emissions. Then run exact scaled forward/backward on (phase, last event consumed/held); the preceding plaintext is determined by that state and the preceding ciphertext. Expected counts include consuming→consuming pairs between phases j−1 and j, consume→hold, hold→consume, initial emissions and consuming-zero penalty. Each phase permutation can be updated by one exact Hungarian assignment conditional on its two neighbors. Three deterministic restarts and 24 iterations, annealing the soft consuming-F penalty. Freeze the best fitted independent maps by strict likelihood, using soft likelihood only if no strict fit.

To factor the maps, for each pair of phases a,b, the high-frequency plaintext correspondence I[a][p]→I[b][p] must be a translation on GP29, hence either identity or a single 29-cycle. Build partial directed paths from the 23/22/21 highest-frequency non-F symbols; reject short cycles; enumerate all cyclic joins of the disjoint paths. Score each B ordering by weighted agreement of inferred differences across every phase, with weights sqrt(native frequency). Normalize K[0]=0 and first nonzero K=1 by affine gauge. Keep the ten highest distinct factorizations. Try all 29 possible forbidden residues for each factor, infer A via Hungarian votes, and retain strict legal fitted keys. For the top five by fit likelihood refine the single shared A using exact posterior rank transition counts and swap annealing; choose by fit-only bigram Viterbi score. Finally decode the held chapters without refitting. The cycle search is exhaustive only for the chosen partial correspondence sets; it is not a universal all-key proof.

| Fresh blind donor | Initial independent maps correct | Refined independent maps correct | Factored effective maps correct | Fit recovery | Held recovery |
|---|---:|---:|---:|---:|---:|
| Shakespeare | 53/232 (selected restart) | 202/232 | 232/232 | 9637/9640 | 3314/3316 |
| Gibran | 56/232 | 197/232 | 216/232 | 9633/9640 | 3316/3316 |

Both factored keys replay all nine bodies exactly, recover the actual periodic K modulo affine gauge, and attain the same plaintext accuracy and score as the known-key oracle on both fit and held chapters. The second plant's only remaining effective-map disagreements swap labels F and AE; this does not justify claiming all 232 maps recovered. Weighted factor agreement 0.983020 and 0.974132; 19 and 24 strictly legal factored initial keys, respectively. This is constructive unknown-key recovery on two full-book-size independent natural-language controls, beyond the previous blind failure.

**Actual original:** the frozen ≥90% fit/held/exact replay control gate passed. None of the three original independent-map restarts retained strict legal support; best soft log likelihood −43257.5394 versus strict control fit ≈−25854/−25014. Of 41,040 path joins across 20 valid partial path sets, best factor agreement 0.398451; zero legal keys among the retained factor candidates and all forbidden-rank trials. No original plaintext, key, or destination recovered. This is a calibrated negative for common q8 chapter reset under the stated F-hold mechanism and intact contiguous native-language order. It does not prove that every arbitrary q8 key fails, nor test q13, shuffled-word or decoy-language variants.

[Receiver](../sims/lp2_unknown_periodic_bigram_phase_maps_sft.cjs), [raw output with truth maps, factor candidates, and frozen original gate](lp2-unknown-periodic-bigram-phase-maps-output.json). Reproduce study cases 0 and 1 with 3 restarts, then case 2 only if both controls meet the gate. V8 study body executed; standalone Node entry point not independently run. This unknown-schedule recovery is useful where another source independently selects a periodic architecture. Do not repeatedly tune the rejected q8 original.

### Blind transfer to the distinct historical period 13 (Agent10, 28 November)

The historically solved KOAN FIRFUMFERENFE supplies a second justified period, not a key for the unknown chapters. Transfer the frozen q8 receiver unchanged except q=13 and independent donor offsets/seeds. Same chapter fit/held partition, three restarts, same two-control gate. Both controls pass:

| Donor | Independent map entries | Factored map entries | Fit | Held | Agreement | Legal factor keys |
|---|---:|---:|---:|---:|---:|---:|
| Shakespeare |306/377|351/377|9640/9640|3316/3316|.947552|9|
| Gibran |316/377|377/377|9635/9640|3312/3316|.972479|15|

Full replay and oracle parity in both; periodic keys correct up to affine gauge. The first control's remaining mismaps are only F/AE. Original q13: 0/3 strict independent-map fits, no strict factor key, best factor agreement .309116 over 109680 scored joins (50 valid partial path sets), best soft likelihood -41784.054. This is a calibrated search negative, not an exhaustive unknown-alphabet impossibility. No original plaintext. No additional period sweep motivated. Reproducer: `node sims/lp2_unknown_periodic_bigram_phase_maps_sft.cjs 0 3 13` (then 1 and 2, conditional on control gate); core executed in V8. [Raw q13 results](lp2-unknown-periodic-q13-phase-maps-output.json). The parameterized receiver preserves q8 explicit three-restart behavior; default restarts now three, matching reported experiment.
