# Opening twig-rune TH: exact prime-origin recovery and source-cipher decision

**Agent14, 24 November 2026.** The source-visible p0 paired 3|3 twig corresponds to thorn (þ) under the dominant historical convention documented in [the opening audit](lp2-opening-3x3-yf-cipher-rune-literature-audit.md). It matches the first black ciphertext symbol TH. The correspondence does not itself establish an encryption operation. One concrete historically motivated interpretation is that TH has the literal, clock-transparent role of F in solved p56. A rival retains the historic F and adds TH as a second hold symbol. This investigation tests those two exact models without trusting printed word boundaries. No unknown LP2 plaintext or authentic new key recovered.

## Frozen inverse and original decision

Let Q={TH} or {F,TH}, p[k] the zero-based sequence of ascending primes, and s[k]=(p[k]-1) mod29. If plaintext belongs to Q it emits unchanged and does not consume a prime. Otherwise it emits P+s[k] mod29 and advances k. The resulting ciphertext may belong to Q even if the plaintext does not. For each observed C, every reachable k has a hold transition when C∈Q and an advance transition when (C-s[k]) mod29∉Q. Induction gives exact existence of a legal prefix; no lexical constraint, score or beam affects the feasibility gate.

The earlier [all-29 direct p56 transfer](lp2-p56-all29-transparent-original-gate.md) already excluded a single transparent TH at the prime2 origin. The new experiment grants each of 3,302 distinct initial indices 0..3301, including the entire first visual chapter and the independent start after its 13-rune red rubric. The upper bound is a search budget, not an authored origin specification. The entire continuous p0–2 body remains untouched.

| Transparent set | Initial interval | Legal through p0 | Legal through p0–2 | Maximum feasible prefix length |
|---|---|---:|---:|---:|
| TH | full 729 runes | 91 | 0 | 496 |
| TH | black-only start, 716 runes | 149 | 0 | 483 |
| F, TH | full 729 runes | 9 | 0 | 316 |
| F, TH | black-only start, 716 runes | 14 | 0 | 303 |

The maximum single-marker full prefix occurs for origins 1697,1699,1700,1701; the black-only prefix for 1710–1714. Dual-marker maxima occur for origins 1712–1713 and 1723–1726 respectively. These are legal prefix lengths (the first impossible zero-based rune offset), not plaintext scores or identified prime origins.

## Constructive key recovery and independent continuation

The exact GP29 trigram Viterbi retains the best path for every reachable (prime index, preceding two plaintext runes), with additive 0.2 trigram smoothing. Each native target section is excluded from its language model. Fit origin and state using only 130 runes, freeze both, decode the untouched 119-rune continuation. All 3,302 origins are tested without scoring the holdout during selection. In parallel compute the retrospective full-interval optimum to give even the strongest full-page legal origin a chance. Source controls are the first 249 runes of the named pinned native sections, enciphered with independently nominated origins. These are planted controls, not unknown-page decryptions.

| Control | Actual / inferred origin | Fit exact | Held-out exact | Held-out nats/rune |
|---|---|---:|---:|---:|
| WELCOME | 137 / 137 | 122/130 | 119/119 | -2.887075 |
| LOSS OF DIVINITY | 911 / 911 | 125/130 | 119/119 | -2.805457 |
| Second KOAN | 3301 / 3301 | 130/130 | 112/119 | -2.480465 |

All three recovered the true origin and forward-replayed all 249 ciphertext runes, with 350/357 withheld plaintext symbols exact. There are genuine ambiguity errors even with a correct origin: do not claim universal exact plaintext identification. The true F-only original p56 plaintext re-enciphers all 85 original runes with 84 consuming shifts, independently checking sign and index conventions. The F+TH positive on clear p57 at origin137 retains its true ending state225 (88 consuming runes).

On the original black p0 (249 runes), 1,618 origins have some legal 130-rune prefix; the best training origin1779 scores -3.385839 nats/rune and has **no legal continuation** when its boundary state is frozen. The retrospective full-page optimum over all 149 surviving origins is 3074, score -3.477218 nats/rune; it replays all 249 runes but is nonprose (starts TH E C X EA H S M B F C R NG F F X J A L P E L EA OE EO). Every origin, including 3074, is independently impossible across p0–2. Exact replay therefore authenticates neither the selected origin nor a plaintext.

## Disposition

Retire the direct continuous prime-minus-one transfer with TH as replacement/additional literal hold, for the stated origin domain and both source starts. The twig-to-thorn correspondence remains a local source fact; it is not a plaintext receiver. This experiment does not exclude arbitrary private origins beyond 3301, other prime schedules, independent interior resets, or a different role for the twig illustration. Do not extend the same origin sweep without an independently selected state law.

[Reproducer](../sims/lp2_p0_thorn_transparent_prime_origin_sft.cjs), executed against the pinned corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` and native-control blob `1b064ef6d85819b7d96adaff31a82d1ec551598f` in JavaScript Code Mode. The single-marker full experiment and the dual-marker extension were separately executed; their code was then consolidated. No Windows CI execution is claimed.
