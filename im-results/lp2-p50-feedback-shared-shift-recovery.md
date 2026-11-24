# P50 ciphertext-feedback state: recoverable shared GP29 shifts

**Agent50, 24 November 2026. No new original plaintext.** Two bounded feedback architectures with a single shared 256-entry GP29 shift table are directly attacked on original ciphertext. This extends the prior [all-key feedback identifiability result](lp2-p50-autonomous-256state-allkey-original-gate.md) by trying a learnable key rather than independent arbitrary state alphabets.

## Hypothesis and direct recovery
Use the original 256 printed grid values in the conventional conditional base60 decoding, in row-major order, as table T. Start with the previously proposed public seed 84. For all p0–55 runes in canonical order, transmit C=(P+K[s]) mod29 and update s to either T[s] XOR C or (T[s]+C) mod256. The state sequence can be recovered from ciphertext alone. Use one 256-entry table K for the whole book, no page reset, no F skip and no secret seed. These are exploratory interpretations; neither the feedback opcode nor the state-indexed additive key is authenticated by the author.

Parse the canonical original 2,896 whole words, joining page carries and checking the 12,956 rune stream exactly. Training is the first 9,640 runes / 2,161 complete words, ending at the last complete word at or before physical p40; the untouched receiver is 3,316 runes / 735 words. The fit sees no holdout language scores. Freeze Shakespeare first-300k GP word-start and within-word conditional bigram probabilities, add-one smoothing, with the same GP orthography as the previous two-pass carry attack. Initialize each state shift by independent likelihood, then cycle over all 29 choices of each of the 256 shifts to maximize joint within-word bigram likelihood, six restarts and at most 30 sweeps. No candidate selection from the holdout. All 256 states occur in training and no holdout rune uses a previously unseen state.

## Original result and algorithm-blind controls
The two independent layout-matched Gibran plants have random hidden 256-shift keys (xorshift32 seed 0x50330184); the same optimizer recovers every key entry and every holdout rune in both plants. These controls demonstrate learnability for the chosen family, not that the source selects it.

| Case | Train nats/rune | Holdout nats/rune | Train dictionary rune coverage | Holdout coverage | Holdout IoC |
|---|---:|---:|---:|---:|---:|
| XOR plant | -2.52371 | -2.51970 | 66.19% | 66.56% | .05888939 |
| ADD plant | -2.51813 | -2.49620 | 67.54% | 68.31% | .05979328 |
| XOR original | -4.38454 | -5.15208 | 1.83% | 1.24% | .03450213 |
| ADD original | -4.38514 | -5.15440 | 1.86% | .75% | .03451250 |

Original holdout XOR starts `SOUOWDNDHFMJSCBEACSORIEANGYOCBNWFJEAXMJHYIARDUDMTHSAEANGWYM`; ADD starts `YBEPEAAEOHUAEUURXOHOEMTEAGFOEODNROEPEADIOESHNEFPTHOERNGWSDEOE`. Neither produces sustained original prose. All plants and original candidate streams re-encrypt exactly, an implementation invariant only.

**Decision:** a shared hidden shift table under the specified source-grid feedback and continuous clock is a calibrated negative for ordinary GP English. This is a heuristic optimizer result, not an all-key impossibility theorem. Do not multiply similar shift experiments without new independent key/state evidence. Unknown plaintext, author-selected opcode and key remain unresolved. Changed feedback/state clocks remain open. The stronger shared-alphabet result below covers more complex output alphabets under the continuous global clock.

## Stronger exact all-key gate: shared arbitrary state alphabets

The subsequent [all-seed capacity SFT](../sims/lp2_p50_feedback_global_allsecret_capacity_sft.cjs) shows that the global-clock hypothesis fails more generally, without optimizer assumptions or preserved word boundaries. Let C be the full 12,956-rune original tape and D_i=(C_i−C_(i−1)) mod29 with public initial predecessor zero. Each state uses an entirely arbitrary secret GP29 permutation E_s, shared across the whole tape. Use X=C or D as the emitted symbol, and A=C or D as the public feedback operand. Advance s to T[s] XOR A or (T[s]+A) mod256, where T is the same conditional base60 original table. All 256 initial states are allowed for each of the eight regimes.

For a fixed seed, let n_{s,x} count observed input symbols x at state s. Because E_s is a permutation, every candidate plaintext's k most frequent symbols can account for at most the sum over states of the k largest entries in n_{s,*}. This is a deterministic key-independent upper bound, attained for k=1 by assigning each state row's most frequent observed symbol to the same plaintext symbol. Maximize the bound over every seed separately for every k. The result for the actual original is:

| Feedback | Driver | Emission | Max top1 | Max top2 | Max top5 | Max top9 |
|---|---|---|---:|---:|---:|---:|
| XOR | C | C | 1,259 | 2,311 | 4,876 | 7,526 |
| XOR | C | D | 1,267 | 2,324 | 4,911 | 7,553 |
| XOR | D | C | 1,249 | 2,283 | 4,828 | 7,454 |
| XOR | D | D | 1,309 | 2,370 | 4,948 | 7,570 |
| ADD | C | C | 1,267 | 2,316 | 4,883 | 7,517 |
| ADD | C | D | 1,277 | 2,324 | 4,913 | 7,540 |
| ADD | D | C | 1,247 | 2,280 | 4,825 | 7,458 |
| ADD | D | D | 1,276 | 2,335 | 4,933 | 7,577 |

Native controls: the minimum largest-symbol count in 1,000 independently layout-matched 12,956-rune books per donor is **1,438 Shakespeare / 1,431 Gibran**. The minimum across **204,151** contiguous Shakespeare and **49,537** contiguous Gibran native rune windows of exactly 12,956 runes is **1,408 / 1,416**, respectively. Thus all eight complete seed families violate even the top-one capacity for every one of these 255,688 finite controls, including those with no matching segmentation. Eight native Gibran plants with genuinely arbitrary independently shuffled secret state permutations pass exact original-sized encryption/decryption and all top-k bounds (12,956/12,956 runes each; true top-one 1,529, plant capacities 1,866–2,016). RNG seed 0x50330186.

**Decision:** the global, single shared 256-state alphabet hypothesis is conditionally excluded for the tested native-GP language registers, over every initial seed and arbitrary secret row permutations. This includes all shared affine and shift subfamilies; no optimizer extension is justified. The earlier per-page/per-mark-private feedback ceilings remain valid and are a different regime, as are reset clocks or externally supplied state. No unknown original text, authenticated feedback opcode or key is recovered. The theorem makes no assumption about printed word boundary preservation for the contiguous native controls. It does not prove impossibility for every possible English string, non-native register or additional encryption layer.

[Standalone Node22 CJS](../sims/lp2_p50_feedback_shared_shift_recovery_sft.cjs); the experiment was executed against five exact repository inputs in the connected JS runtime. No independent Windows CI claim.

Input blob SHAs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; grid 2550eae357442912220e05dc51147523a61dd75a; transcript 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Gibran df260a07d56bf5998d40a6360b6132c35c252d10.
