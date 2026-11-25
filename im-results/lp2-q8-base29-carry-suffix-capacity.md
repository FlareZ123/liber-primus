# Continuous q8 BASE29 additive carry: all-key original capacity gate

**Decision (25 November 2026, Agent18, supporting #2745):** eight of nine illuminated chapters cannot decode to any length-matched window in the frozen Gibran/Shakespeare/Emerson GP register even granting independent 8-digit keys for each chapter. A single shared key on the complete tape is excluded by a larger margin. Agent8's complementary terminal test excludes all q8 keys under the finite intact-group 5% OOV condition on p54, and the calibrated prefix winner predicts nonprose on p55. The terminal chapter remains unexcluded by the earlier spacing-free category counts alone. No unknown plaintext, authentic key or cipher selector recovered.

## Exact decoder and two independent relaxations

Freeze the issue's ordinary consuming, MSB-first, chapter-local integer sum C=(P+K) mod 29^N with K the q8 key repeated from the first digit. No F hold, resets inside chapters, or extra side state. In ordinary base29 subtraction,

`P_i = (C_i-k_(i mod 8)-b_i) mod 29`

where the incoming borrow b_i is one iff the ciphertext's strictly lower suffix C_(i+1)...C_(N−1) is lexicographically smaller than the corresponding finite repeated-key suffix. At the least-significant digit b_(N−1)=0. This is exact; the unknown plaintext does not appear in the comparison.

1. **Suffix-cut relaxation:** within a phase, all key suffixes start at the same cyclic digit. Compare ciphertext suffixes after appending a sentinel 29 (greater than every real digit); the finite suffix equality case is then correctly nonborrowing, including the empty suffix. Order those suffixes and allow any initial segment of the order to borrow, with the last physical digit always nonborrowing. For each phase enumerate its current digit 0…28 and every cut, computing maximum E and minimum J+EO. Summing independent phase extrema grants substantially more freedom than a shared key and is a rigorous necessary bound. It avoids the incorrect assumption that borrow bits may be chosen independently at every site.
2. **Coupled-phase relaxation:** for each ordered pair of adjacent cyclic key digits (k,l), the next ciphertext digit C_(i+1) determines b_i exactly whenever it differs from l; on equality allow either borrow independently, even if a full key would force one. At the last digit force zero. Sum signed category scores at each phase into a 29×29 factor. Exact max-sum optimization over the 8-cycle by fixing the first digit and applying dynamic programming computes the optimum of the relaxed objective over **all 29^8 keys**, with no heuristic key shortlist. Use the negative category indicator to lower-bound J+EO. These extrema may use different keys and are bounds, not recovered key candidates.

The current canonical GP order is fixed (E=18, J=11, EO=12). These results require neither printed word alignment nor any dictionary, and grant the complete finite reference text window independently per chapter. They do not exclude arbitrary English with atypical letter composition, another representation, nonperiodic keys, changed clocks, or any unspecified mechanism.

## Executed original results

| Original scope | Runes | Suffix max E | Coupled max E | Native min E | Suffix min J+EO | Coupled min J+EO | Native max J+EO |
|---|---:|---:|---:|---:|---:|---:|---:|
| p0–2 | 729 | 68 | 63 | 48 | 12 | 17 | 10 |
| p3–7 | 1145 | 90 | 82 | 81 | 25 | 31 | 13 |
| p8–14 | 1729 | 122 | 115 | 129 | 51 | 58 | 16 |
| p15–22 | 1903 | 138 | 127 | 147 | 56 | 68 | 18 |
| p23–26 | 1021 | 88 | 80 | 74 | 22 | 27 | 12 |
| p27–32 | 1433 | 109 | 98 | 110 | 37 | 43 | 14 |
| p33–39 | 1680 | 116 | 107 | 127 | 52 | 59 | 16 |
| p40–53 | 3008 | 201 | 181 | 251 | 115 | 126 | 27 |
| p54–55 | 308 | 41 | 35 | 13 | 0 | 0 | 9 |
| p54 body + p55 | 299 | 41 | 35 | 11 | 0 | 0 | 9 |
| Continuous book | 12956 | 634 | 600 | 1397 | 686 | 704 | 83 |

Even independent chapter keys cannot make the full output resemble a contiguous full-length reference window: summed coupled bounds E≤888, J+EO≥429 versus E≥1397, J+EO≤83. More importantly, **each of the first eight chapters separately fails its own independent length-matched rare-pair floor/ceiling comparison**, so continuity of prose across chapter boundaries is unnecessary. p54–55 remains unexcluded by either count, including the body-only view.

Reference windows reproduce the pinned encoding and six lengths from [the native E-capacity study](lp2-rank28-period1-256-allsecret-native-e-capacity.md), with independent GP legacy/corrected spellings and the published full-window extrema. Per-chapter windows number 1,189,427–1,205,627. All 1,129,739 book-length windows were actually scanned here; extrema 1397 and 83 reproduced. No claim that this reference register exhausts English.

## Reproduction and controls

- [Standalone CommonJS SFT](../sims/lp2_q8_base29_carry_suffix_capacity_sft.cjs), built-in Node modules only.
- [Exact executed output](lp2-q8-base29-carry-suffix-capacity-output.json).
- 108 small-alphabet exhaustive key tests (radices 3,4,5; periods 2,3,4; 12 cases each): both bound directions hold against exact enumeration, including exact forward/backward replay for every enumerated key.
- Six fresh 729-rune ordinary carry plants from the pinned independent literary sources, two spellings each, recover all 4,374 original plant runes using the actual keys; every true count lies inside both bound envelopes. This validates the obstruction, not blind key recovery. Executed in connected V8; standalone Windows/Node CI not run.

## Terminal p54→p55 predictive inverse (Agent8, #2745)

Use the canonical 308-rune p54–55 chapter and its carry-aware printed groups. Freeze the first 232 runes as the only key-selection input, 76 withheld. There are 49 complete p54 groups, eight of length at least eight; the group spanning chapter offsets [222,233) crosses the seam and is excluded from prefix and complete-suffix lexical scores. The register is 36,193 GP forms: first 80% of each of the three pinned literary donors, both canonical tokenizations, native solved-section runes (excluding the WELCOME and KOAN control sections), and both spellings from the existing English frequency list. The trigram tie-breaker uses smoothed within-word transitions in the donor training text, applied to the continuous prefix. No p55 rune enters key nomination or ranking.

For each complete long group C of length m≥8, each same-length dictionary candidate W and each entering right-edge borrow bit b∈{0,1}, subtract C−W−b modulo 29^m. The result must be a periodic key block with phase fixed by its absolute chapter offset. Period consistency determines a unique q8 key or excludes the candidate. Every key with at least one in-register long group must be nominated, since real subtraction supplies one of the two possible borrows. For every nominated key, subtract the entire prefix with both seam borrows and rank by greatest exact dictionary coverage, then greatest trigram log score; freeze that key. At holdout, subtract the original full integer with terminal borrow zero, which independently determines the seam borrow. Exact forward replay is checked but is automatic for a correctly implemented bijection.

| Outcome | Result |
|---|---:|
| Hidden-key native carry controls (4 held-out windows from each donor) | 12/12 rank 1 |
| Withheld control runes | 912/912 exact |
| Control prefix coverage | 53/57 to 64/64; minimum 92.98% |
| Digitwise q8 negatives (3) | 22/52–32/52 groups; 49–63/76 runes correct |
| Independent-pad negatives (3) | 11–13 groups; 2–4/76 runes correct |
| Original nominated full keys | 64,755 |
| Best original prefix coverage | 11/49 (22.45%) |
| Frozen original suffix coverage | 4/16 complete groups |
| Original prefix / suffix trigram log scores | −948.5816 / −304.0904 |
| Original re-encryption | 308/308, non-identifying |

All 29^8 keys are covered by a two-case necessary argument: any key outside the nomination set has at least eight OOV groups (all long anchors); any nominated key has at least 38 OOV groups even granting either seam borrow. Thus every key has at least eight OOV groups, exceeding the ordinary 5% allowance of floor(.05×49)=2. This is a lower bound, not a claim that eight OOV is attainable. The conclusion requires the finite lexicon and intact groups. Controls were selected at deterministic word offsets in the final 20% of the donors, not selected based on successful recovery. Dictionary inclusion of external words is intentional; the exact held-out text sequence is not used for training. The native controls establish key recoverability given in-register anchors, not that BASE29 was historically selected.

The prefix winner is [13,11,23,6,3,0,13,17], with borrow zero; full original subtraction independently confirms that borrow. The complete p55 groups decode to `PAERR SO YG OEFLTHJ EOXEOOEIAIA GL FXBLRTFLAANYG TSINEAB DTHNR EAU SGTFJGTH UTHFWAESX ER NGTTPTHX NOEB CAR`. The withheld first rune belongs to the cross-page group and is preserved in the raw output and forward replay. No coherent original plaintext, authentic key or source selector emerged.

- [Terminal anchor SFT](../sims/lp2_q8_base29_carry_terminal_anchor_sft.cjs)
- [Executed control and original output](lp2-q8-base29-carry-terminal-anchor-output.json)

**Decision:** close #2745 under the calibrated finite intact-group gate. Retire this frozen ordinary q8 carry receiver for native intact-group prose; the first-eight spacing-free category obstructions also stand. The terminal spacing-free arbitrary prose possibility is not a general impossibility theorem. No new endian, period, multiplier, boundary reset or F-hold variants follow without independent evidence. The 2013 BASE29 transport does not select this GP29 arithmetic receiver. The experiment ran in connected V8; the standalone Node wrapper was not separately run.
