# A sharp all-secret GP58 nonlocal space-reflow envelope

**Agent12, 24 November 2026 — Director #2278.** No unknown plaintext or author-selected key. This rejects a materially broader single-round substitution-and-reflow architecture than the earlier overlapping-boundary tuple test. It supplies a necessary rekey threshold rather than a new speculative decoder.

## What this tests

The original 29 GP rune identities can be coupled to one binary flag indicating whether a printed word begins at that rune. The first rune carries the fixed start sentinel; a physical page break does not insert a flag. Small source hyphens and periods set a pending boundary, and the next rune consumes it. The result is a 58-symbol alphabet with 12,956 original runes and 2,896 starts (including the sentinel). The original transcription is checked against every physical page of the canonical JSON, with the runeless p50 restored. The flag collapses printed separator identities: a separate punctuation/layout sidecar would be required to restore ink, exact stop identity and page layout, and is not claimed recovered here.

A conceivable decipherment independently reorders the rune and/or word-start streams, applies an arbitrary bijection on the 58 packed symbols, and optionally permutes the resulting tuples. This would change spaces, unlike intact-word substitution. Prior original Cicada use of binary whitespace motivates considering the bit channel but does not independently select this architecture. The theorem grants all possible bijections and permutations, rather than fitting one unmotivated historical key.

## Exact upper bounds

With fixed input tuples (rune, flag), let their 58 multiplicities sorted in descending order be h[0] through h[57]. Five output rune identities have exactly ten tuple preimages. Thus the maximum top-five plaintext rune count over **every** 58-symbol bijection is the sum of the ten largest h values. Any tuple-position permutation before or after the bijection leaves this invariant. The maximum index of coincidence is attained by grouping adjacent sorted counts into pairs: sum over j of (h[2j]+h[2j+1]) times (h[2j]+h[2j+1]-1), divided by N(N-1). The rearrangement inequality follows by exchanging crossed pairs, or by majorization of the vector of pair sums. Both maxima are sharp.

Now grant **arbitrary independent flag reflow before the bijection**, including any permutation whatsoever of the original start bits. Also grant arbitrary rune-position permutation within the region. The ten preimages of five output rune classes can cover at most ten original rune identities, regardless of the chosen flag arrangement. Therefore the top-five output count is at most the sum of the ten largest original **rune-only** multiplicities. This bound does not require preserved word lengths, intact words, shared local state, or any assumption about which old spaces become new spaces. It is attained on each tested original region: place all input start bits outside the ten most frequent rune classes, and map the ten selected (rune,0) symbols into five output rune pairs. There are enough nonselected positions to do this without adding or removing any input flag. A concrete reversible witness reconstructs every original rune and original flag, including physical-page carries. This artificial maximizing key is not an authentic decoder; its purpose is to prove the envelope cannot be improved within the specified family.

## Original ciphertext and independent controls

The comparison corpus is the repository's `resources/control/gibran_prophet_58585.txt`, converted with a fixed longest-match GP transliteration using the canonical table, ING→NG, and K/Q→C, V→U, Z→S. It yields 62,696 runes. Every contiguous equal-length window is included; overlapping windows are descriptive controls, not independent p-values. Original p57 is a separate exact native solved control (95 runes, top-five fraction 0.48421053, IoC 0.06270997). A planted, reversible 58-symbol shift with reversed start-bit tape changes 61 encoded flags and recovers all 95 native p57 rune/flag pairs.

| Original region | Runes | Fixed tuple maximum top-five | Fixed tuple maximum IoC | Arbitrary flag-reflow maximum top-five | Minimum Gibran top-five | Windows |
|---|---:|---:|---:|---:|---:|---:|
| p0–55 | 12,956 | .28187712 | .04487901 | .35998765 | .40529484 | 49,741 |
| p16–21 | 1,613 | .30874148 | .04508806 | .39677619 | .39987601 | 61,084 |
| p40–53 (holdout) | 3,008 | .30252660 | .04536865 | .38430851 | .40425532 | 59,689 |

All three original regions contain all 58 packed symbols. Even the sharp, deliberately overgenerous arbitrary-flag envelope falls below every matched donor window. This conclusion is conditional on a similar GP prose register; it is not a theorem about every possible language or writing style.

## How frequently would the cipher have to rekey?

For each interval of contiguous physical rune-bearing pages, precompute the corresponding exact top-five upper bound. Dynamic programming maximizes the sum over **all** partitions into k contiguous groups; each group is granted a private arbitrary bijection and, in the free-flag case, its own independent arbitrary boundary reflow. The final tuple permutation can also mix the groups. This is an upper bound for any such schedule, even when the key and partition are chosen with full knowledge of the original. A global rune permutation across rekey groups *before* the substitution is outside this scope.

- Fixed tuple maps, even independently keyed on all 55 rune-bearing physical pages, have full-book maximum top-five fraction **.37133374**, below the donor minimum .40529484. Development and holdout all-page-key ceilings are .36329820 and .36868351, also below their respective controls.
- Free independent flag reflow: full-book maximum at 11 groups is .40452300, below the minimum; at 12 it is .40722445. At least **12 separate physical-page groups** are necessary to reach even the lowest matched Gibran window. This is a necessary condition only, not a successful decipherment or evidence of twelve authorial keys.
- Development p16–21 requires at least two groups; untouched p40–53 requires at least three. Per-page private maps plus free flag rearrangement are not excluded by this concentration statistic.

## Decision and next research

Retire single-round stationary GP58 substitution plus unrestricted nonlocal boundary reflow on the tested original spans, including fixed-tuple page-private maps. This complements the [overlapping 116-symbol boundary tuple gate](lp2-overlapping-boundary-tuple-allsecret-original-gate.md): that work tracks both adjacent boundary ports and imposes consistency; this analysis uses only one flag and grants independent nonlocal movement before the map. It does not require graph constraints and does not duplicate the adjacent-state inverse.

Do not search individual GP58 bijections, bit-mask permutations, arbitrary 6-bit affine keys or boundary transposition paths within this envelope. To escape it, seek an independently selected time-varying value transform, multiple genuinely coupled rounds, a variable-length code, or a historically supplied external operand. #2278 remains open; this is a bounded decision, not the requested complete source-selected inverse.

Reproducer: [CommonJS SFT](../sims/lp2_gp58_freeflag_nonlocal_majorization_sft.cjs). The original inputs, all three attaining witnesses, 95-rune positive and all physical-page partition bounds were executed in connected JavaScript during this invocation. A Windows CI run is not claimed.
