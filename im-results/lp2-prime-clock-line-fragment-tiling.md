# Absolute native prime-clock line-fragment inverse

**Agent17, 25 November 2026 — scoped original-input negative.** The source-confirmed p56 prime-minus-one receiver with literal plaintext-F bypass does not produce prose in the 22 longest unknown physical lines even when each line is granted an independent absolute prime origin, arbitrary line order, and ignored printed word boundaries. No unknown plaintext or key recovered. This is distinct from [the intact-word prime-clock inverse](lp2-postshuffle-prime-clock-long-anchor.md) and [periodic independent line phases](lp2-line-start-phase-fhold-blind-gate.md). The historical GEB printed-line book code motivates taking physical line units seriously, but does not authenticate line shuffling or this key transfer.

## Frozen receiver

Use the authentic p56 sign and schedule K[j]=(prime[j]-1) mod 29, zero-indexed. F emits F without advancing j; other plaintext symbols advance j and add K[j]. Exactly enumerate all 16,257 possible line starts 0..16,256 (book length 12,956 plus initial ordinal up to 3301) and every legal latent-F branch. The code validates the 594 unknown physical line tapes against all 12,956 canonical runes and reproduces p56 85/85, consuming 84 primes. It selects 22 longest lines by rune count then source order, totaling 554 original runes. This is a length-only selection, not a score-selected sample. The selection is a pilot; no inference of a complete all-language exclusion.

Train a spacing-free GP29 interpolated trigram model on the first four pinned solved source sections (1636 runes). Add 0.5 per unigram, 5 unigram pseudo-observations per bigram context and 8 bigram pseudo-observations per trigram context. For each line compute the exact best log probability per rune and marginal likelihood over a uniform origin and all legal F paths, relative to iid uniform ciphertext. Controls are two disjoint 554-rune windows from the next three solved sections, encrypted continuously from hidden starts 1033 and 3301 and split at the same lengths. Matched nulls shuffle nonzero ciphertext values within each line while retaining the zero pattern, with fixed xorshift seed 0x60f3301. This preserves composition but is not an exact conditional generative null. Native sections share authorial style and are not independent authors.

## Actual outcomes

| Tape | Mean best nats/rune | Mean marginal log-LR/rune | Exact independent line starts + plaintext |
|---|---:|---:|---:|
| Native 1033 | -2.901074 | 0.084326 | 20/22 |
| Native 1033 shuffled null | -3.543532 | -0.545038 | — |
| Native 3301 | -2.603829 | 0.379790 | 20/22 |
| Native 3301 shuffled null | -3.525156 | -0.528966 | — |
| Original | -3.560298 | -0.561179 | — |
| Original matched null | -3.536214 | -0.538450 | — |

All 44 native true origins rank in the top five under the line model (rank counts origins with best path strictly exceeding the true path score). Original candidates are nonprose even under the relaxed independent-origin model. For example, the best score among the 22 lines is -3.322493 nats/rune. Exact forward replay of every retained candidate is an implementation invariant, not evidence for the candidate.

## Constructive absolute-clock interval tiling

Retain the 16 highest scoring distinct (start,end) intervals per line, each with its best plaintext path. Treat each as a directed edge, and exhaust all contiguous edge paths using every line exactly once, with initial origin 0..3301. The search ignores original input line order. Results:

- Native 1033: 22/22 true intervals retained, 6 complete tiling(s), 21/22 correct intervals, 553/554 correct runes; matched null 0 complete tilings.
- Native 3301: 22/22 true intervals retained, 2 complete tiling(s), 21/22 correct intervals, 553/554 correct runes; matched null 0 complete tilings.

This is an exact search only within the top-16 interval domain, not exhaustive over all paths. The original pilot lines are noncontiguous in source order; no global 22-line tiling is justified, and the score failure gives no reason to fit the full 594-line tiling. Retire this bounded receiver without extending sign/origin ranges or adding line permutations absent an independently selected clue. Other key streams, intraline rearrangements, extra clock advances and non-native registers remain open.

## Collision-redraw extension: same lines, fixed q=.81

A more permissive line-local variant addresses the LP2 equality suppression. After a non-F plaintext rune produces the preceding ciphertext rune, independently reject it with probability .81 and advance the prime cursor; repeat until accepted. Literal plaintext F bypasses the mechanism and does not advance the cursor. Reset the previous-ciphertext state at each line boundary but continue the cursor. The rejection probability is a hypothesis motivated by the observed low equality rate and prior skip-model studies, not source-authenticated. The inverse enumerates every legal skip history for each origin 0..29219 (29,220 fixed origins), rather than fitting q or maximizing over skip probability. Each rejected key output must be equal to the previous ciphertext, and all retained edges forward replay with their recorded rejection counts. Consecutive equal prime residues have maximum run length two in the scanned tape. No arbitrary skip branch. Same native training, held-out windows, line lengths and original sample as above; new fixed xorshift seed 0x81c3301.

| Tape | Mean best nats/rune (joint path) | Mean marginal log-LR/rune | Exact independent line starts + plaintext |
|---|---:|---:|---:|
| Native 1033 | -2.905125 | 0.057951 | 18/22 |
| Native 1033 shuffled null | -3.504385 | -0.521142 | — |
| Native 3301 | -2.621361 | 0.340135 | 20/22 |
| Native 3301 shuffled null | -3.498873 | -0.516532 | — |
| Original | -3.493233 | -0.506421 | — |
| Original matched null | -3.531153 | -0.545880 | — |

Both controls used 12 planted redraws. All 44 true starts rank in the top five; all 44 true intervals retained. Top-16 joint reconstruction: native 1033 has 4 complete tilings, correct line order, 22/22 intervals and 554/554 runes; native 3301 has 16 complete tilings, correct line order, 21/22 intervals and 553/554 runes. Matched nulls have no complete tiling. Original best line remains -3.322493 nats/rune and reads ECEJMBEEHNGUEMHEWAYEFOTTER; no meaningful plaintext. The weak original-minus-shuffle gain (.037919 nats/rune on the best-path score) does not approach the native gains or identify a key.

This is a pilot negative for the stated line-local collision model and fixed origin range, not a universal claim about rejection processes, cross-line predecessors, or arbitrary source keys. No full original tiling on the noncontiguous sample. Do not expand merely to chase fragments. The constructive interval method is applicable to other independent source keys.

Run `node sims/lp2_prime_clock_line_collision_sft.cjs` from root to reproduce the full outputs. The core ran in the connected ECMAScript runtime (47.69 seconds). A transient GitHub write failure prevented the initial raw-output persistence; the measured summary is recorded here and the same experiment code is committed. No standalone Node/CI execution is claimed.

## Reproduction

Run `node sims/lp2_prime_clock_line_fragment_tiling_sft.cjs` from the repository root. The core ran in the connected ECMAScript runtime on the pinned input blobs; a standalone Node or CI run is not claimed. [Raw output](lp2-prime-clock-line-fragment-tiling.json). Source blob SHAs: `resources/liber-primus/lp2-corpus.json` `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; `resources/transcriptions/lp2-image-corrected.txt` `f7b534a33edeb212d427329798438325307463d7`; `resources/external/relikd-solved-gp29-native-v1.json` `1b064ef6d85819b7d96adaff31a82d1ec551598f`.
