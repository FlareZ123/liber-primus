# Original five numbered LP2 passages: Shamir interpolation gate

**Decision, 14 November 2026 (Agent 7):** The five numbered passages printed on LP2 pp36–38 do not form a position-aligned degree-2 or degree-3 Shamir polynomial code over GP29. A literal five-of-five degree-4 reconstruction gives a nonlinguistic 91-rune stream. No unknown plaintext, authentic key, or destination was recovered. This is a finite original-input result, not an exclusion of all possible share encodings.

## Original source selector

The original 53.jpg–55.jpg visibly print **red numerals 1–5** introducing five passages. Source-ink boundaries established independently in [the original five-passage audit](lp2-cuneiform-five-numbered-wisdom-inversion.md):

| Number | LP2 physical page and zero-based rune offsets | Length |
| --- | --- | ---: |
| 1 | p36 [99,238) | 139 |
| 2 | p37 [0,91) | 91 |
| 3 | p37 [91,189) | 98 |
| 4 | p37 [189,228) and p38 [0,57) | 96 |
| 5 | p38 [57,186) | 129 |

Cicada's documented earlier 2013 puzzle used Shamir secret sharing; see the [2013 historical-control reproducer](../sims/2013_shamir_missing_shares_sft.cjs). The simplest player-visible hypothesis interprets the printed numerals as share coordinates x=1,2,3,4,5 and each GP29 rune as a GF(29) element. Freeze the first **91 symbols** from each passage, aligned at their printed starts, with no offsets, reordering or fitted choices. This is a distinct operation from the prior five-passage Hill-5 matrix, row-pad and simple interleave attacks.

## Original-cipher results

A **3-of-5 degree-2** Shamir model requires all ten triples of original numbered shares to reconstruct the **same** f(0) at every aligned rune position. In the original source this happens at **0 of 91 positions**. A **4-of-5 degree-3** model requires all five possible quadruples to reconstruct the same secret. Only **4 of 91 positions** satisfy that condition. These are key-free contradictions to common low-degree sharing under the frozen alignment.

For **5-of-5 degree-4**, any five values interpolate, so mathematical share consistency by itself cannot discriminate a genuine code. The exact x=0 Lagrange formula is

f(0) = 5*y1 - 10*y2 + 10*y3 - 5*y4 + y5 (mod 29).

The complete original recovered tape has IoC **0.03907203907**. The first 91 known, direct GP symbols on solved p57 have IoC **0.06031746032**. The first 35 output symbols from the original five-of-five reconstruction are:

    IA L W T P W T EO J O J C X M H U IA P TH EA A J W O W M U NG P M TH S M G R

The first-three-share and first-four-share candidates have IoC **0.03687423687** and **0.03101343101**, respectively. These direct inverses do not yield readable GP-native prose. A deliberately encrypted or compressed secret could still look nonlinguistic; no original source selects a next decoding operation here.

## Native positive controls and conclusion

The new [self-contained CJS reproducer](../sims/lp2_five_numbered_shamir_original_sft.cjs) asserts the exact source corpus slices, verifies all original-inversion counts, and makes **three source-native planted controls** from the first 91 original solved p57 runes. For degree 2, all ten three-share subsets recover 91/91 symbols; for degree 3, all five four-share subsets do; for degree 4, the full five-share subset does. The same interpolator processes the untouched original unknown text.

**Decision:** retire literal position-aligned GP29 Shamir reconstruction of these five numbered original passages as a plaintext recovery. The 98 remaining symbols beyond the common 91-symbol prefix and unequal passage lengths remain uninterpreted. Another share alignment, radix, subset or decoding layer requires an independently visible selector and a prospective original plaintext prediction, rather than retrospective tuning.
