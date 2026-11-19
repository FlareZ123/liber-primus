# P15 source-index skeleton and a source-visible local `WORDS` inverse

**Agent11, 19 November 2026. Classification: strong local plaintext candidate with an independently source-visible receiver and a compact page-geometry key.** Physical p15 carries four authored numbers that form a constant-step source-index skeleton: red-span lengths **9,11**, red punctuation count **13**, and physical page **15**. Under the already established zero-based signed-word convention these are `LIBER / IS / WAY / WORDS`; their common step is **2=K**, and the arithmetic midpoints 10,12,14 are exactly `PRIMUS / THE / ITS`. Thus p15 alone reconstructs the authenticated clause `LIBER PRIMUS IS THE WAY ITS WORDS`. A separate p36-p38 ten-dot/section-number packet independently reconstructs the latter six words.

The same p15 geometry produces the five-rune tuple **[3,10,4,4,2]**, which is simultaneously a direct visible-page summary and the reconstructed state expression **[e,K·g,q,q,K]**. Subtracting this exact tuple from the source-selected p15 local word15 at offsets71..75 yields canonical GP `WORDS` exactly. This is the only authenticated five-GP-rune source-word hit produced by the exact key, either sign, over every complete five-rune word in the unknown manuscript. The key serialization was recognized after the WORDS target was available, so chronology remains retrospective and the result should stay at strong-candidate rather than established-plaintext status pending an independent transfer or external selector.

## 1. P15 itself reconstructs the source clause

Original p15 has:

- two red rune spans of lengths **9** and **11**;
- three identical red large-punctuation groups, each with **13 dots**;
- a physical page number **15**;
- a printed **4×4** numerical square.

Take the first two red lengths, the punctuation count, and the page number in their natural source roles:

```text
9, 11, 13, 15
```

They are an exact arithmetic progression with common difference2. The authenticated source at those zero-based indices is:

```text
 9 LIBER
11 IS
13 WAY
15 WORDS
```

The common difference is the already reconstructed DH shared secret:

```text
K = 2.
```

Fill the three integer midpoints:

```text
(9+11)/2  = 10 -> PRIMUS
(11+13)/2 = 12 -> THE
(13+15)/2 = 14 -> ITS
```

Interleaving skeleton and midpoints gives the exact first-party clause:

```text
 9 LIBER
10 PRIMUS
11 IS
12 THE
13 WAY
14 ITS
15 WORDS
```

or:

```text
LIBER PRIMUS IS THE WAY ITS WORDS
```

No unknown ciphertext is inspected to obtain this readout.

This has a useful independent overlap. The p36-p38 numbered packet has identical red ten-dot brackets and printed section numbers1..5; under the same already fixed zero-based source convention, `10 -> PRIMUS` and `10+[1..5] -> IS THE WAY ITS WORDS`. The two manuscript structures therefore reconstruct the same source clause by different visible number layouts.

## 1.5 Complete red-span packet family

The p15 arithmetic skeleton is also exceptional inside the exact manuscript visual family that can express it. Charge every page with at least two red spans and at least one red large-punctuation count, preserving natural span order, and form:

```text
[first red-span length, second red-span length, red-dot count, physical page].
```

Only three such packets exist:

```text
p3  -> [16,3,13,3]   differences [-13,10,-10]
p15 -> [9,11,13,15]  differences [2,2,2]
p33 -> [10,8,13,33]  differences [-2,5,20]
```

P15 is the sole arithmetic progression in this complete source-visible family. Its common difference is `2=K`, and the four terms are exactly authenticated source indices `LIBER / IS / WAY / WORDS`. This census was run after the p15 pattern had been noticed, so it is a finite visual-family control rather than a blind discovery probability.

## 2. The p8-p15 same-index corridor

The source clause is not isolated from the existing navigation graph.

P32 READ OUT independently selects authenticated `THE DEVOTED`, giving `DEVOTED` index8 as a natural page address. For every authenticated source index `i`, take physical page `p_i`, then the zero-based local printed word `i`, and compute:

```text
residual_i = GP0(local word i) - GP0(source word i) mod29.
```

Over all 43 authenticated source indices, the unique longest consecutive run whose residual belongs to the pre-existing compact state-scalar family

```text
{0,p,g,a,b,A,B,K,e,q,K*a,K*g,a-g}
```

is exactly **i=8..15**:

```text
index  source       residual
8      DEVOTED      p
9      LIBER        a
10     PRIMUS       0
11     IS           0
12     THE          b
13     WAY          K*a
14     ITS          g
15     WORDS        p
```

Numerically:

```text
[p,a,0,0,b,K*a,g,p]
= [23,6,0,0,15,12,5,23].
```

The next-longest run is length5 at indices21..25; the next is length3 at33..35. This finite charge was performed only after p8 was already selected by DEVOTED and the p15 number packet had selected the 9..15 clause, so its role is corroboration rather than initial discovery.

The residual packet should not yet be treated as a page cipher. A direct p50 read of the selected local-word sums does not form a navigation chain, and the simple extension into source words16..20 fails. Those branches are closed rather than tuned.

## 3. P15 source-visible five-coordinate key

P15 has a compact five-number page summary:

1. number of red 13-dot punctuation groups = **3**;
2. arithmetic midpoint of the two red title lengths 9 and11 = **10**;
3. numerical-square row count = **4**;
4. numerical-square column count = **4**;
5. red-title length difference 11−9 = **2**.

This gives:

```text
K_page15 = [3,10,4,4,2].
```

The tuple independently equals a compact expression of the reconstructed source state:

```text
[e,K*g,q,q,K]
= [3, 2*5, 4,4,2]
= [3,10,4,4,2].
```

Its outside-in H shell is also entirely state-derived:

```text
H([3,10,4,4,2])
= [1,6,4,14,5]
= [a-g, a, q, -b, g].
```

Thus the key is described independently both by p15's visible layout and by the existing state vocabulary.

**Chronology caveat:** this particular five-feature serialization was recognized after the source-index route had made `WORDS15` a serious target. It is therefore a source-visible retrospective key construction, not a blind preregistered key.

## 3.5 Independent receiver-selection convergence from the numbered diagonal

After this p15 candidate had been developed, Agent1 independently recovered the authenticated `THEIR NUMBERS ARE THE DIRECTION` diagonal:

```text
one-based signed ordinal n
-> physical LP2 page n
-> canonical local word n.
```

Apply that route to authenticated `WORDS`:

```text
WORDS zero index15 = ordinal16
-> physical page16
-> project p15
-> canonical word16
-> zero-based local word15.
```

This is exactly the receiver used below, offsets71..75. The diagonal route was derived from DIRECTION/SEEK/AND/YOU state structure rather than from the p15 WORDS inverse, and it has its own Windows-positive reproducer (`sims/lp2_direction_seek_you_numbered_route_sft.cjs`, reported PASS 44462393395).

This materially strengthens receiver provenance. The remaining chronology caveat is concentrated in the exact five-feature key serialization `[3,10,4,4,2]`, which was recognized after WORDS became a serious target.

## 4. Source-selected receiver and exact inverse

The signed source has:

```text
index15 = WORDS
WORDS = [W,O,R,D,S] = [7,3,4,23,15].
```

The same number-direction rule selects:

```text
physical p15
local printed word15
offsets71..75
cipher = [10,13,8,27,17].
```

Subtract the page-geometry key:

```text
 [10,13, 8,27,17]
-[ 3,10, 4, 4, 2]
-------------------
 [ 7, 3, 4,23,15]
 = WORDS.
```

This gives a concrete unknown-ciphertext plaintext candidate at an independently selected receiver.

## 5. Bounded controls

### Key-order/sign control at the fixed receiver

The visible key multiset `[3,10,4,4,2]` has **60 distinct permutations**. Apply every permutation to the selected p15 word15 under both addition and subtraction, and compare against every authenticated source word having exactly five GP runes.

There are **120** key-order/sign configurations.

Exactly one produces any authenticated five-rune source word:

```text
key [3,10,4,4,2]
subtract
-> WORDS15.
```

No alternate permutation or sign produces HELLO, EMPTY, SEEKS, LIBER, MEANING, FOUND, FALSE, or any duplicate five-rune source target.

### Manuscript-wide receiver control

Freeze the exact key `[3,10,4,4,2]`. Apply it under both signs to **every complete five-rune printed word on every unknown physical page**.

The sole output matching any authenticated five-GP-rune source word is:

```text
p15 local word15, offsets71..75
subtract
-> WORDS15.
```

Thus the exact key/target relationship is unique over the complete finite receiver family, rather than one of many local source-word hits.

## 6. Evidence boundary

Promote the following route as a **strong plaintext candidate**:

```text
p32 READ OUT -> DEVOTED8 -> p8
p8..p15 same-index residual corridor
p15 visible 9,11,13,15 -> LIBER / IS / WAY / WORDS
midpoints 10,12,14 -> PRIMUS / THE / ITS
=> LIBER PRIMUS IS THE WAY ITS WORDS

p15 visible geometry
-> [3,10,4,4,2]
-> [e,K*g,q,q,K]
-> H shell [a-g,a,q,-b,g]

source index15
-> p15 / local word15
cipher [10,13,8,27,17]
minus [3,10,4,4,2]
-> WORDS [7,3,4,23,15].
```

Do **not** yet promote WORDS to established plaintext. The receiver is independently selected and the key is fully source-visible, while the exact five-feature serialization was recognized retrospectively. The next decisive evidence should be a prospectively fixed transfer of this page-geometry grammar or an independent source instruction selecting the same key coordinates/order.

A simple unchanged period-5 running-key interpretation is not implied. The surrounding p15 words have incompatible lengths with the adjacent signed-source words, so do not force a continuous source-text crib across the page.

## Reproduction

`sims/lp2_p15_words_geometry_key_sft.cjs`

The SFT reconstructs the authenticated source indices, p15 red geometry, the K=2 skeleton and midpoints, charges the full 43-index same-page/local-word residual family and verifies the unique p8-p15 longest run, checks the state-key equality and H shell, reproduces the exact p15 word15 inverse, exhausts all60 key permutations under both signs, and performs the complete manuscript-wide five-rune receiver charge. The initial Windows Node22 version passed as run **44462102283**; a rerun of the strengthened residual-corridor version supersedes it.
