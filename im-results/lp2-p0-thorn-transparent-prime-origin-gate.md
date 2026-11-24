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

## Distinct periodic-key inverse with TH or F+TH holds (Agent6, 24 November 2026)

The original opening twig-to-TH correspondence and the authentic LP1 q8/q13 Vigenère mechanisms motivate testing the same two literal-marker sets with an **unknown arbitrary periodic additive key**, rather than another prime-origin sweep. This is a separate finite lexical model, with no claim that the twig authenticates either period or hold rule.

For a complete printed group C and proposed native GP word P of the same length, every P in Q={TH} or {F,TH} must emit itself with no clock advance. All other positions require the shifts (C−P) mod29 in consuming order. If a word consumes more than q symbols, repeated phase shifts must agree. Construct all such word relations from the fixed 38,920-form register (TextBlob GP variants and unordered vocabulary of nine solved native sections, including the native plants). The relation has a start and end phase; propagate exact cyclic phase support and per-key-slot shift domains, then exhaustively branch on smallest domains. The solution stage counts up to two distinct keys or paths and checks forward replay. This tests all keys for an empty result if no node cap is hit.

The native controls use independently generated keys, 250–251 complete-prefix runes and frozen key/terminal phase on the suffix. No ordered plaintext enters inference, but target native vocabulary **is included**; these are vocabulary-assisted plants.

| Period / literal holds | Native fit | Native withheld exact | Original 351-rune prefix: exact nodes / surviving keys | Long anchor OOV lower bound |
|---|---:|---:|---:|---:|
| 8 / TH | 251 | 264/264 | 1 / 0 | 7/8 |
| 13 / TH | 250 | 530/530 | 5 / 0 | 2/8 |
| 8 / F+TH | 250 | 530/530 | 1 / 0 | 5/6 |
| 13 / F+TH | 251 | 264/264 | 9 / 0 | 1/6 |

All four plants uniquely recover the complete key and native continuation (1,588/1,588 withheld). Original target is the corrected p0–2 black-body start after 13 red heading runes, length716. Fit is the first 82 complete printed groups, 351 runes; 365 runes remain withheld and were not scored. Every original search completes before the 10,000-node cap.

The independent anchor gate selects **all** original fit groups with length ≥8 and no visible hold symbol. A lexical candidate must consume every rune. Each gives a partial or complete periodic key assignment. Grant each anchor an arbitrary independent phase, ignore all intervening clock constraints, and join candidate key signatures for every relative rotation. An edge denotes an incompatible anchor pair for every key; an empty anchor is mandatory OOV. Exact minimum vertex covers yield the bounds in the table. For q8, every pair of individually feasible anchors conflicts (complete graphs), forcing at least seven of eight TH-only anchors or five of six dual-hold anchors outside the register. q13 bounds are much weaker; the whole-prefix exact result uses intact-group and no-OOV assumptions and should not be promoted into an all-register exclusion.

**Disposition:** retire these four fixed intact-group periodic additive models on the opening black body. This does not exclude a different role for TH, altered segmentation, a nonperiodic key, additional independently selected operations, or plaintext outside the register. No unknown plaintext or authentic key. [Reproducer](../sims/lp2_p0_thorn_periodic_fhold_word_relation_sft.cjs) · [raw output](lp2-p0-thorn-periodic-fhold-word-relation.json). Executed in JavaScript Code Mode against the actual repository inputs, no CI execution claimed.

### Spacing-free exact all-permutation gate

The preceding lexical obstruction does not by itself survive arbitrary resegmentation. Use the whole 716-rune black body (including its earlier lexical holdout; this is a separate retrospective necessary test). After deleting the actual literal-Q holds, equality of two active GP29 symbols at lags q,2q,3q is preserved under **any independent phase bijections**. The same holds for an adjacent bigram pair at those lags. No assumption on plaintext word boundaries, additive rows or key vocabulary is needed.

The dynamic program retains the last 3q+1 active ciphertext symbols and, for each state, exact min/max cumulative rune and bigram collision counts. On visible Q symbols branch both hold and consume, otherwise consume. This includes every actual hold interpretation, even granting illegal consuming paths as a relaxation. The individual bounds need not be jointly attained, which only makes the gate more permissive. Twenty-four exhaustive ternary/multisymbol toy masks validate both extrema; four independently random phase-permutation native prose plants preserve both active statistics and replay all 716 symbols with their known planted hold masks (2,864 total). No blind key recovery is claimed by this gate.

Freeze 96 matched 716-rune native literary windows (32 each Shakespeare, Emerson, Gibran). The native hold-count vector cannot exceed the count of each visible marker. All four models admit 84/96 windows under that count alone; none passes both exact collision intervals.

| Period / hold set | Original rune collision range | Original bigram range | Native minima among marker-count-eligible windows | Eligible / surviving |
|---|---:|---:|---:|---:|
| 8 / TH | 51–92 | 1–2 | 107 / 4 | 84 / 0 |
| 13 / TH | 56–96 | 0–3 | 96 / 3 | 84 / 0 |
| 8 / F+TH | 38–112 | 0–4 | 107 / 3 | 84 / 0 |
| 13 / F+TH | 34–118 | 0–4 | 106 / 5 | 84 / 0 |

Where separate minima overlap the intervals (especially q8 dual hold and q13 TH only), the per-window joint gate still excludes all controls; do not infer separation solely from the two scalar minima. Maximum dynamic-program state count on original is 191, no cap. Original marker counts TH30, F33. Exact bounds depend on the frozen continuous consuming clock and fixed full-length native windows, not arbitrary language or changing phases.

This strengthens the periodic TH/F+TH rejection beyond intact printed groups and additive maps, while remaining a **finite native-register necessary gate**. Retire these q8/q13 direct receivers unless independently sourced evidence changes the state law or plaintext register. [SFT](../sims/lp2_p0_thorn_periodic_spacingfree_collision_sft.cjs) · [raw output](lp2-p0-thorn-periodic-spacingfree-collision.json). No unknown plaintext recovered.

## Direct Thorn-stanza key receiver

The twig's historically conditional TH reading is a specific selector for the third stanza of the 29-rune Anglo-Saxon Rune Poem, not an arbitrary search over the poem. Use the preserved Dickins Old English third stanza and [his published English translation](https://en.wikisource.org/wiki/Rune_poems), with the name included, standard greedy GP conversion, and phase zero at the physical black-body start after the 13 red runes. Two eth conversions (TH and D) give 82-rune keys; the English translation gives 83. The historical additive direction is P=C−K. No phase, reversal, stanza subset, or sign sweep is performed.

| Key | Ordinary prefix/withheld trigram log score | Legal prefix F hold | TH hold | F+TH hold |
|---|---:|---:|---:|---:|
| OE eth→TH | −3.572294 / −3.561779 | 0 | 34 | 28 |
| OE eth→D | −3.577717 / −3.566365 | 21 | 34 | 28 |
| Dickins English | −3.506449 / −3.540458 | 0 | 16 | 16 |

The exact phase/previous-two-rune Viterbi inverse tests each possible literal hold path; a path that reaches no state cannot be rescued by a language score. Each of the nine literal-marker variants dies in at most 34 runes. In particular the natural OE phonetic and English F-hold keys die on the first TH: their first key symbol is TH, so consuming would decode F, which must emit F literally. The ordinary receivers survive but produce nonprose on both the 351-rune prefix and frozen-phase 365-rune continuation. Target-section-excluded native trigram scoring gives −2.323 to −2.831 for the twelve planted controls; exact ciphertext replay holds for all, with 1901/1928 plaintext symbols recovered (ambiguity in literal-marker paths accounts for the errors). This excludes the direct cyclic stanza receiver only, not every possible use of the poem or twig. No unknown plaintext.

Reproducer: `node sims/lp2_p0_thorn_stanza_direct_key_sft.cjs`; raw `im-results/lp2-p0-thorn-stanza-direct-key.json`.
