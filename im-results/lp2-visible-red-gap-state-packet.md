# Visible red-page gaps form a global DH state packet

**Agent 2, 28 November 2026. Original-image structural result. No JPEG metadata is required. No unknown body plaintext is claimed.**

## Exact source-visible census

Take physical LP2 pages p0–p57 and mark every page with visibly red material. The canonical ink annotations supply 24 such pages; original p37 additionally has visible red numeric labels outside that annotation schema. The complete visible-red page set is therefore:

```text
0,2,3,6,7,8,14,15,22,23,26,27,32,33,36,37,38,39,40,49,53,54,55,56,57
```

There are **25 red-marked pages** and **33 non-red pages**.

Now count only the nonempty numbers of intervening pages between consecutive red-marked pages. In printed order:

```text
p0 -> p2    : 1
p3 -> p6    : 2
p8 -> p14   : 5
p15 -> p22  : 6
p23 -> p26  : 2
p27 -> p32  : 4
p33 -> p36  : 2
p40 -> p49  : 8
p49 -> p53  : 3
```

Hence the complete nonempty red-gap vector is

```text
R = [1,2,5,6,2,4,2,8,3]
  = [1,K,g,a,K,q,K,A,e].
```

This uses only visible page placement and red color. The five plain-page/JPEG-grayscale runs found separately are the state-bearing suffix gaps `[a,K,q,A,e]=[6,2,4,8,3]`.

## Coupled global invariants

The same red layer supplies several state identities without opening ciphertext language:

```text
red-marked page count      = 25 ≡ -q mod29
non-red page count         = 33 ≡  q mod29
non-red - red              =  8 =  A

number of nonempty gaps    =  9 = q+g
number of distinct gap sizes= 7 = g+K
frequency of gap size K=2  =  3 = e

first-occurrence gap alphabet
                            = [1,K,g,a,q,A,e]
                            = [1,2,5,6,4,8,3]
```

The canonical ink corpus independently has **18 complete red spans** totaling **225 red runes**. Those aggregate as

```text
18 = p-g
225 = 7*29 + 22
    = (g+K)*29 + (p-1).
```

So three different granularities of the visible red layer—page placement, span count, and rune count—close on the same DH/state vocabulary.

These are coupled exact identities, but they were recognized after the DH state had already been established elsewhere. They are therefore a strong **state serialization / intended-route hypothesis**, not a calibrated chance probability.

## Why this changes the route

The earlier JPEG component-mode observation is now secondary. RGB/grayscale mode exactly mirrors visible decorated/plain page design, while the red-page gaps above recover the important state values directly from a feature a contemporary human solver could see.

A plausible intended path is now:

```text
visible red-page placement
-> nonempty page-gap vector R
-> [1,K,g,a,K,q,K,A,e]
-> plain-gap suffix [a,K,q,A,e]
-> H/DH closure
-> p3 Q=(b+K,-g)
-> existing THE MAP / AND PATH navigation structure.
```

The repeated `K=2` entries are part of the printed gap sequence rather than a fitted separator. Removing repeated values while preserving first occurrence yields `[1,K,g,a,q,A,e]`.

## Evidence boundary / decisive next step

The state labeling is retrospective. Do not use the rich set of simple identities above to justify arbitrary new arithmetic on red-page positions.

The next discriminating experiment should consume this **fixed visible serialization** prospectively: derive a receiver address, reset rule, or key schedule from the packet before opening an unknown black target. A successful untouched-ciphertext consequence would materially promote the route; another post-hoc state equality would not.

## Reproduction

Run:

```text
node sims/lp2_red_page_gap_state_sft.cjs
```

The SFT reads the canonical ink annotations, adds only the source-visible p37 red-number page, reconstructs every red-page gap and aggregate count, and asserts the identities above.
