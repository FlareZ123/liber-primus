# p8-labelled scroll order: exact tied-class native inverse

**Agent41, 26 November 2026 — decision:** neither sorting direction supports the tested historical key receiver with intact native groups. Forward exact maxima are 87/255; inverse-direction relaxed upper bounds are 158/255. All 12 forward F-hold configurations have legal paths. No unknown plaintext or authenticated key. Sorting is an unconfirmed interpretation of the source relationship.

## Causal hypothesis

The source has 255 complete printed groups across physical p3–7 (1,145 runes), followed by 255 p8 runes. The ink-consistent pairing is 242 black groups (1,101 runes) and p8's first 242 black runes, excluding its p8→p9 carry. See [source](lp2-p3-p8-242-black-word-rune-original-inverse.md). The signed 2016 words-as-map/numbers-as-direction hint motivates treating p8's numbers as ordering labels for source groups instead of character addresses or key shifts. A reader could sort paired groups by numeric label; no original instruction explicitly selects sorting. GP prime weights and GP ordinals have identical numeric sort order.

Grant every permutation within equal-label classes, either ascending or descending labels. Test the historical GP29 additive direction, continuous chapter clock, p56 prime-minus-one starting at the first prime, or known LP1 DIUINITY/FIRFUMFERENFE at all starting phases. Both ordinary consuming and literal plaintext-F bypass. The first section treats forward sorting; the second bounds inverse sorting. Arbitrary cross-label permutations, unknown keys and changed group boundaries are outside both scopes.

Exact subset DP retains the maximum registered-word count for each (used-word mask, consuming clock). All legal within-word F-hold paths are enumerated; only the best lexical score per exit clock is required. All surviving clocks pass to the next class. No beam, sampled tie order or cap. The finite dictionary contains 33369 distinct rune forms (legacy and source-attested ING/IO greedy TextBlob spellings). Every legal maximizing witness replays the original cipher and uses every group exactly once.

## Original results

| Scope | Labels | Key | Ordinary max lexical | F-hold max lexical / failure |
|---|---|---|---:|---|
| all | ascending | prime-minus-one | 77/255 | 83/255 |
| all | ascending | DIUINITY | 54/255 | 53/255 |
| all | ascending | FIRFUMFERENFE | 61/255 | 61/255 |
| all | descending | prime-minus-one | 81/255 | 87/255 |
| all | descending | DIUINITY | 54/255 | 53/255 |
| all | descending | FIRFUMFERENFE | 61/255 | 61/255 |
| black | ascending | prime-minus-one | 76/242 | 76/242 |
| black | ascending | DIUINITY | 49/242 | 49/242 |
| black | ascending | FIRFUMFERENFE | 54/242 | 54/242 |
| black | descending | prime-minus-one | 71/242 | 77/242 |
| black | descending | DIUINITY | 49/242 | 49/242 |
| black | descending | FIRFUMFERENFE | 54/242 | 54/242 |

These are finite scoped lexical decisions under the intact-group assumption and finite register. All 12 original F-hold cases are legal after allowing all tie orders, although stable-order trials can have no path. The maximizing witness is not asserted to be plaintext.

## Controls and reproduction

Six controls use 75 consecutive words from the Gibran source file (including front matter; word offsets 200–274), first75 actual p8 labels, reverse-ID tie order. Each retains at least its true lexical membership and its recovered witness exactly forward-replays; no unique order or plaintext is claimed. Authentic p56 separately retains its established 84-tick path. Source ink and rune alignment are asserted from canonical resources; images were not reaudited. Connected V8 core executed; generated Node wrapper not separately run. No CI.

- [Single-file reproducer](../sims/lp2_scroll255_p8_tied_label_order_exact_sft.cjs)
- [Raw output and witness orders](lp2-scroll255-p8-tied-label-order-exact-output.json)

## Inverse sorting with every tied assignment — clock-interval matching bound

The forward-sort DP above does not cover an encryption that first sorts groups and prints the sorted tape. In this opposite direction, the p8 label tape is attached to the *intended logical order*: printed p3–7 groups are partitioned into contiguous blocks with the corresponding label frequencies, and every group from a block may be assigned to any logical slot with that label. Both ascending and descending block order are granted. Exact joint inverse optimization would require simultaneously maintaining masks for all 29 label classes; a stronger-than-stable-order **necessary** bound is cheaper.

For candidate word j at slot i, count prior slots in each class. Every legal assignment consumes at least the sum of the smallest preceding-group lengths (or lengths minus ciphertext-F counts for literal-F hold), and at most the sum of the largest lengths. Exclude j when computing the other preceding members of its class. This yields an enclosing integer interval of possible prime-clock positions. Every integer in that interval is tested, enumerating all legal word-local F histories; for historical periodic keys grant every phase. Join lexical edges by maximum bipartite matching, so no group or slot can be counted twice. Clock witnesses are allowed to disagree globally, making the result an upper bound, not a recovered ordering. No assumption of intact grammar beyond the registered word membership is made.

| Scope | Blocks | Key | Ordinary lexical upper bound | F-hold lexical upper bound |
|---|---|---|---:|---:|
| all | ascending | prime-minus-one | 155/255 | 154/255 |
| all | ascending | DIUINITY | 54/255 | 53/255 |
| all | ascending | FIRFUMFERENFE | 61/255 | 61/255 |
| all | descending | prime-minus-one | 158/255 | 156/255 |
| all | descending | DIUINITY | 54/255 | 53/255 |
| all | descending | FIRFUMFERENFE | 61/255 | 61/255 |
| black | ascending | prime-minus-one | 145/242 | 143/242 |
| black | ascending | DIUINITY | 49/242 | 49/242 |
| black | ascending | FIRFUMFERENFE | 54/242 | 54/242 |
| black | descending | prime-minus-one | 146/242 | 144/242 |
| black | descending | DIUINITY | 49/242 | 49/242 |
| black | descending | FIRFUMFERENFE | 54/242 | 54/242 |

Twelve plants use two separate 75-word Gibran windows (offsets 2000 and 5000), both block directions, reverse ties, each historical key and both F modes. Every bound retains at least the actual native lexical count (reported in JSON), as required. The bound is necessary only: its matching edges are independently clock-compatible, not a globally consistent decryptor. No unknown key or plaintext. [Inverse-direction SFT](../sims/lp2_scroll255_p8_inverse_ties_bound_sft.cjs) and [matching witnesses](lp2-scroll255-p8-inverse-ties-bound-output.json). Core executed in connected V8; standalone wrapper not separately executed.

**Decision:** retire both tested sorting orientations under the named historical clocks and intact-word assumption. The forward result is an exact lexical optimum; the inverse result is an upper bound only. Reopen on independently selected order or key evidence. No change to authoritative solution status.
