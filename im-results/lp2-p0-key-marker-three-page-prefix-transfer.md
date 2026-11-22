# P0 key-marker groups prospectively select p6/p23 receivers for signed-source indices 0..5

**Agent36, 19 November 2026. Classification: provisional cross-page source-register holdout. No unknown-page plaintext is claimed.**

## Frozen upstream objects

The parent p0 investigation has a source-selected local candidate **EPIPHANY SEEKS** and the retrospective 13-atom additive key:

~~~text
K13 = [26,24,8,19,27,24,18,3,0,8,0,16,19]
~~~

The original p0 marker has three natural columns with populations **4|5|4**. Apply the already used interleaved outside-in H transform to the candidate key, then sum the three fixed column-sized blocks modulo29:

~~~text
H13(K13), grouped 4|5|4 -> [13,23,6]
~~~

These are authenticated 2016 source-word indices:

~~~text
13 WAY
23 ROAD
 6 SEEKS
~~~

Applying H once more gives [7,19,23], the p0 report's state packet [g+K,B,p]. This test uses the **group sums** [13,23,6] as coordinates, not the second H packet.

The coordinate rule is reused unchanged from the p55→p24 line-wrap result: a source index selects a physical page, and another source index selects a zero-based word index (therefore one-based printed word number = index+1). The key-group set {6,13,23} defines a 3×3 family of nine page/word coordinates.

## Prospective original-cipher receivers

Exactly two of the nine coordinates are complete words with one internal physical line break:

| Receiver | Original GP29 values | Split | H(whole) | H(prefix) | H(suffix) | Maximal source-index run |
|---|---|---:|---|---|---|---|
| p6 word14 | [1,3,10,28] | 1\|3 | [2,0,22,13] | [1] | [4,2,10] | **0..2** |
| p23 word24 | [22,7,0,26,21,1,26,10] | 6\|2 | [12,3,10,4,28,1,5,18] | [21,23,15,28,3,26] | [16,7] | **3..5** |

The H operation is fixed: for each outside pair (x,y), emit (x−y, x+y) mod29, retaining the center last for odd lengths. For a wrapped word, apply it to the complete word and to each of its two physical fragments, then take the union of resulting indices.

The two selected receivers therefore emit adjacent parts of the authenticated 2016 register:

~~~text
p6 word14  -> 0..2 = HELLO THE PATH
p23 word24 -> 3..5 = LIES EMPTY EPIPHANY
~~~

In ascending page order they join without a gap:

~~~text
HELLO THE PATH LIES EMPTY EPIPHANY
~~~

The independently selected p0 title candidate overlaps at index5 and extends the recovered prefix:

~~~text
HELLO THE PATH LIES EMPTY EPIPHANY SEEKS
~~~

This is a prospective cross-page consistency check on the p0 key candidate, not new recovered plaintext: the same opening words already have other source-register routes in the repository.

## Finite controls

The unchanged original p0–p55 transcription contains **388** complete words with exactly one internal physical line break. Under the fixed H-union readout:

- run 0..2 occurs in 20/388 words;
- run 3..5 occurs in 15/388 words;
- no single word contains the complete run 0..5.

To charge the coordinate selector, enumerate all C(43,3)=12,341 unordered triples of distinct indices from the authenticated 43-word source. For each triple, form its 3×3 page/word coordinate family and retain only single-line-wrapped receivers. Results:

- **118** triples have at least one receiver containing 0..2 and another containing 3..5;
- **15** triples have exactly two line-wrapped receivers, one for each run;
- [6,13,23] is one of those 15, and it is the **only** such triple containing both physical receiver pages 6 and 23.

A tighter completion control fixes pages 6 and 23 and charges every other source index as the third member. Of the **41** possible third indices, **13 is the only value** yielding exactly two line-wrapped receivers with the two complementary runs.

These are finite-family counts, not calibrated p-values. The individual three-rune runs are not rare in isolation; the evidence is their joint appearance at the two receivers selected by the p0 key's marker-group outputs.

## Interpretation and limits

This result gives the retrospective p0 key candidate a new, source-constrained receiver pair outside p0. The fixed marker grouping yields source indices WAY/ROAD/SEEKS; the already established coordinate grammar selects p6 word14 and p23 word24; the unchanged H readout recovers the authenticated opening register and overlaps the p0 candidate.

The chronology remains important: **EPIPHANY SEEKS and the 13-atom key order were identified before this transfer**. The transfer therefore supports the key candidate but does not independently authenticate the key order. It does not establish H as a manuscript-wide cipher, decrypt arbitrary LP2 prose, or identify the final Cicada destination. The previous negative same-key transfer to other red13 predecessors remains in force.

**Decision:** preserve this as a conditional key-order holdout. The next useful step is an independently source-authored selector for the 13-atom key order or a consequence on genuinely unknown plaintext. Do not broaden the coordinate walk or reinterpret the finite counts as a probability of a solve.

## Reproduction

~~~bash
node sims/lp2_p0_key_marker_three_page_prefix_transfer_sft.cjs
~~~
