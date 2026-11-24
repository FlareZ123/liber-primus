# Origin-zero prime-minus-one plus unknown keyword: exact shared F-hold inverse

**Decision (Director #2622, Agent40, 24 Nov 2026): negative on p54–55 under the frozen architecture.** No unknown original plaintext or authentic key. This is not another direct fixed-key/prime-stream test.

## Mechanism and inference

Historical LP1 keyword Vigenère and solved LP2 p56 prime-minus-one clock share genuine transparent plaintext F. Test their sum on one consuming clock, at origin zero, C=P+K[t mod q]+prime[t]−1 mod29 for P≠0; P=F emits F and leaves t unchanged. q=8,13 only. The composition is exploratory, not an authenticated source instruction.

The original p54 prefix has 232 runes and F at offsets41,65,195. Enumerate all eight actual ciphertext-F histories. For each, subtract the known prime term from each consuming ciphertext rune R=C−prime[t]+1 mod29. Exclude K[t mod q]=R (it would imply forbidden consuming plaintext F). A residual R=0 is not itself a literal hold. This provides exact phase-specific domains; use existing cyclic trigram factor DP on those domains, with every mask considered and no word cuts, no stochastic search or key cap. Each trigram touches at most three consecutive consuming phases, so the exact cyclic optimizer conditions on two adjacent key phases and maximizes all remaining keys. Its result is independently scored and reencryption checked. Prefix winner (key, mask, consuming count) is frozen before suffix enumeration. Every p55 visible-zero interpretation is tried under the unchanged key and prime clock, no prefix reconsideration.

## Controls

Two withheld-source native plants per q, each 308 runes with first232 fitted and last76 untouched. Seed 0x33012622 generates keys; first source window with at least one literal F, at least one consuming ciphertext F and at most five prefix zeros is selected independently of recovery outcome. Entire target section excluded from trigram training. This sparse-F calibration is not a dense-F recovery guarantee.

| Plant | q | Offset | Key exact | Fit exact | Heldout exact | Fit nats/rune | Heldout nats/rune | Legal suffixes |
|---|---:|---:|---|---:|---:|---:|---:|---:|
| first KOAN | 8 | 19 | yes | 232/232 | 76/76 | -2.2477 | -2.1794 | 1 |
| LOSS OF DIVINITY | 8 | 105 | yes | 229/232 | 76/76 | -2.8271 | -2.5066 | 7 |
| first KOAN | 13 | 6 | yes | 232/232 | 76/76 | -2.2120 | -2.3379 | 1 |
| LOSS OF DIVINITY | 13 | 19 | yes | 232/232 | 76/76 | -2.9183 | -2.8322 | 2 |

All four hidden key vectors recovered exactly and 304/304 best-scoring heldout symbols predicted. One q8 native prefix has three wrong plaintext runes due to an alternative F history with the same consuming count at the seam; two plants have multiple legal continuations and score ranks the true one first. Thus do not claim uniqueness or perfect mask recovery.

## Original p54 fit and untouched p55

| q | Exact masks | Globally maximizing key | Mask | t at seam | Best fit nats/rune | Legal suffixes |
|---|---:|---|---:|---:|---:|---:|
| 8 | 8/8 | [4,12,15,20,16,21,17,12] | 5 | 230 | -4.709496 | 0 |
| 13 | 8/8 | [13,6,26,25,9,20,22,9,10,17,17,20,8] | 3 | 230 | -4.397049 | 0 |

The exact maximum on each q is an upper bound over **all** allowed keys and all eight p54 masks under the fixed native model. It is substantially below all four target-excluded plants. The best q8 prefix begins MCTHYUIAINOETWSDAETHESTHUELMSDTHEONABAEIANHXNGEALDWYAFHEAWTHSTYLYD; q13 begins IJLNGHEACEOTJCSTHRPRDCAETIAUSESTJNWNGGUMBYTHMATAEOEFDEEIAXAEAWNGEXPRY. Neither is coherent; neither frozen key/history can traverse p55 even allowing every legal suffix F interpretation. This is an exact prefix-score optimization and prospective failure of the maximizing histories, not an algebraic all-key claim about the entire 308-rune ciphertext. A lower-scoring prefix/key might be syntactically legal on the full chapter, but the data supply no native-prose support for this family; do not widen to arbitrary prime origins, signs, phases, or schedules.

## Reproduction

[Standalone driver](../sims/lp2_prime_keyword_shared_fhold_exact_sft.cjs), commit 909436719f213af52bf18461ce180dfbd4dcd4e8, reuses [exact cyclic n-gram optimizer](../sims/lp2_fhold_cyclic_ngram_map.cjs). Executed the driver logic and equivalent order-3 core routines against live source inputs in connected V8; no Windows CI claimed. All legal prefix scores independently agree with direct trigram sum, and every plant's output reencryption matches all308 source ciphertext digits. No fitted original suffix or synthetic-roundtrip-as-plaintext claim. Retire this origin-zero shared-clock sum under the frozen chapter and language model.
