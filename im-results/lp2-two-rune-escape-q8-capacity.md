# Two-rune escape delimiter, consuming period eight: all-key original capacity gate

Issue [#2731](https://github.com/FlareZ123/liber-primus/issues/2731), Agent 24, 2026-11-25. No unknown LP2 plaintext or authentic key was recovered.

## Decision and frozen receiver

The single-symbol delimiter and dual parity-space registers have already failed. This investigation tests the distinct fixed GP29 escape grammar: EO (index 12) is reserved, EO EO emits literal EO, EO F emits a space, and any other symbol emits itself. Every encoded rune consumes a phase of one shared additive q8 key. Printed LP2 gaps play no role. There is no authenticated Cicada instruction selecting this grammar.

The primary original scope is p54 black-body indices [9,232) plus p55 [0,76), i.e. 223 development and 76 withheld ciphertext runes. Also report the 308-rune sensitivity case including all nine p54 red heading runes. The red/body cut follows the prior source-adjudicated #2712 scope; no new glyph transcription was performed.

## Exact upper bound for every key

Write ciphertext as C and the eight residue key digits as k. For every complete decoded space there must be an encoded EO F pair at adjacent positions i,i+1. For phase j=i mod 8, construct the 29-by-29 integer table

A_j[u,v] = number of i at phase j for which C_i = u+12 and C_(i+1) = v (mod 29).

The exact total number of potential space pairs for a key is sum_j A_j[k_j,k_(j+1 mod 8)]. This can overcount actual spaces (e.g. EO EO F can contain an overlapping raw pair), so it is a rigorous upper bound on valid parsed spaces. The bound does not require assumed plaintext boundaries or legal grammar.

Condition on k_0, compute the max-plus chain recurrence d_j[v]=max_u(d_(j-1)[u]+A_(j-1)[u,v]), and close the cyclic edge with A_7[k_7,k_0]. Maximize over all 29 starting digits; count maximizing assignments exactly. This covers 29^8 = 500,246,412,961 keys without heuristic pruning. Thirty exhaustive 3-symbol/4-phase comparisons validate maxima and maximizing-key counts per scope.

An additional relaxation grants independent arbitrary bijections at each of eight phases, with independent chosen ciphertext representatives for the two delimiter symbols and no consistency constraints between edges. Each phase contributes at most its largest ordered adjacent-pair cell. Thus sum_j max_(u,v) A_j[u,v] also bounds **all** phase-wise deterministic bijections and any fixed ordered two-rune space code under a consuming period-eight clock. It does not require additivity; no claim that this relaxed maximum is attainable.

## Original and calibrated evidence

| Scope | Ciphertext length | Exact additive cap | Relaxed arbitrary phase-bijection cap | Smallest literature/reference space count over arbitrary cuts |
|---|---:|---:|---:|---:|
| Full p54 fit | 232 | 8 | 10 | 27 |
| Full p54–55 | 308 | 8 | 11 | 37 |
| Corrected p54 black fit | 223 | 8 | 10 | see raw per-source windows |
| Corrected p54–55 | 299 | 8 | 11 | 36 |

For the corrected 299-rune scope, four exact published solved-GP sections (no Latin retransliteration) provide 2,371 arbitrary-cut windows; full space minima are respectively 43, 48, 43 and 51. This counts only completely contained EO F code units even if a window endpoint cuts an escape. The four independently encoded literary/normalized reference streams give minima 42, 36, 36, 41 (908,534 windows). Punctuation is normalized to a single separating space between contiguous native rune runs or Latin words. The normalized LP reference contains LP1 and the known LP2 ending; literary GP conversion uses the fixed greedy tokenization and QU/CW, V/U, K/Q/C, Z/S conventions from the neighboring SFT, not an assertion of exact historical spelling.

The pair-maximizing decoder receives only development ciphertext. It recovers each of eight hidden keys uniquely in the full 232+76 scope and eight further keys uniquely in the corrected 223+76 scope; four additional exact-native section plants recover all four keys. All 20 decode their complete streams legally, recover the 76 withheld encoded runes and all withheld space positions exactly (1,520/1,520 held-out runes), and re-encrypt. This is algorithmically blind key recovery, not a separate human blind study. The two eight-pad panels achieve only 7–9 development potential pairs; no pad can meet the native fit floor. The corrected and uncorrected runs use separate deterministic seeds. Native controls may have no literal EO; literary controls cover the escape branch when present. The fixed grammar itself is implemented directly.

The original corrected development optimum has eight tied keys; the first maximizing representative is [22,12,5,10,8,6,23,15]. Frozen through p55, it yields eight parsed spaces and seven grammar errors at encoded offsets 10,23,64,100,182,185,240. The original full 299-rune maximum is still eight, with 113 tied pair-count maximizers. The full 308-rune scope has 119 maximizing keys. The displayed invalid parse is diagnostic gibberish; its additive inverse round-trip alone is not evidence of a legal plaintext or true key. No constrained grammar search is necessary after the stronger relaxed all-key capacity is already far below the finite reference floor. We do not assert that eight is the exact attainable maximum among legal parses.

Whole-book sensitivity, if a **single** q8 key consumes every one of the 12,956 runes without reset: 48 potential pairs (65 under the independent-phase relaxation). This is a separate conditional scope and does not presume actual chapter keys are shared.

## Research consequence and limits

Retire the exact EO EO / EO F escape representation under an ordinary consuming q8 additive cipher for native-reference-compatible prose. The stronger bound also rejects the same fixed ordered two-symbol space code under eight arbitrary phase substitution tables on the corrected terminal scope, regardless of how the phase alphabet is relabeled. No universal lower bound on language spacing is claimed; artificially sparse text, a different clock, transposition, or delimiter coding with variable pair patterns could evade the bound. This does not adjudicate H-shuffle versus H-decoy in general, and the source does not select a successor representation. Do not tune new escape symbols or period under this issue.

## Reproduce

`node sims/lp2_two_rune_escape_q8_capacity_sft.cjs`

[CommonJS reproducer](../sims/lp2_two_rune_escape_q8_capacity_sft.cjs) · [raw output and source blob SHAs](lp2-two-rune-escape-q8-capacity.json). The numerical experiment was executed in the connected V8 runtime against fetched repository inputs. The Node filesystem wrapper has not been run on CI. The source corpus and exact solved-rune reference were reused; no new transcription or provenance work was necessary.
