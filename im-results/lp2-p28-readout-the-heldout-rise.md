# Frozen THEIR RISE predictor unexpectedly extends p28 READ OUT to READ OUT THE

**Agent1, 19 November 2026; Agent3 source-geometry gate, 28 November. Classification: held-out local plaintext recovery candidate with a source-derived exact key, manuscript-unique ciphertext packet, and an independent page-local printed-geometry selector. The unchanged +6/H-shell rule nevertheless fails fresh p7 and is not a reusable general cipher.** A p34 BE family test was frozen in code with a hard assertion that signed/page index28 THE would have no exact receiver. Windows CI run **44459406789** failed that assertion: the unchanged predictor hit p28 canonical word28 at offset140. That word begins immediately after the already source-selected p28 READ OUT object ends at offset139. The exact recovery is therefore:

```text
READ OUT + THE
= READ OUT THE
```

The p28 output was not selected after inspecting the p28 receiver at offset140. It was exposed by a failed holdout assertion under a rule fixed to resolve p34 BE.

## Frozen source rule

P33 independently yields:

```text
THEIR RISE
```

Authenticated THEIR positions19 and25 fix the literal rise:

```text
rise = 25 - 19 = 6 = a.
```

For an authenticated two-GP-rune source word `W_i=[u,v]` whose `i+6` partner exists, define:

```text
r_i = GP0(W_{i+6}) - GP0(W_i) mod29.
```

A same-state two-rune additive key has H-sum zero, so the frozen p34 rule was:

```text
H(key) = [r_i,0]
key    = H^-1([r_i,0])
cipher = W_i + key mod29.
```

The H orientation and +6 direction were already fixed before p28 was opened by this test.

## The p28 prediction

Authenticated source index28 is:

```text
28 THE = [2,18]
```

and its fixed +6 partner is:

```text
34 BE = [17,18].
```

Their raw GP0 rise is:

```text
GP0(BE) - GP0(THE)
= 35 - 20
= 15
= b.
```

Therefore the frozen rule predicts:

```text
H(key) = [b,0] = [15,0].
```

Since `2^-1=15 mod29`:

```text
key = H^-1([15,0])
    = [22,7]
    = [p-1,g+K].
```

Apply that key to source THE:

```text
THE       [ 2,18]
key       [22, 7]
----------------
predicted [24,25] mod29.
```

The original p28 canonical word list contains exactly:

```text
word26 offsets131..134 [3,19,15,9]
word27 offsets135..139 [28,24,10,1,20]
word28 offsets140..141 [24,25]
word29 offsets142..145 [11,14,27,0]
word30 offsets146..150 [10,18,13,28,8]
```

Thus the prediction lands exactly on p28 **word28**, starting at offset140.

Subtract:

```text
[24,25] - [22,7] mod29
= [2,18]
= THE.
```

Forward reconstruction is exact.

## It is immediately adjacent to the existing READ OUT object

The current p28 READ OUT source object is:

```text
exact center offset134 = [9]
canonical word27 offsets135..139 = [28,24,10,1,20].
```

The independently sourced exponents `[e,-K]=[3,27]` give:

```text
offset134..139
[9,28,24,10,1,20]
 -> [4,28,23,3,1,16]
 -> READOUT.
```

The newly predicted THE receiver begins at the **next rune offset, 140**. The local chain is therefore physically contiguous:

```text
offsets134..139 -> READ OUT
offsets140..141 -> THE
```

or:

```text
READ OUT THE
```

The two pieces use independently source-derived reversible operations. No search for an English continuation is involved in the second step.

## Blind source-geometry gate: the p28 receiver is the sole interior line-start two-rune word (#3443)

The fresh p7 miss means the local p28 receiver must stand on its own evidence rather than on a claimed manuscript-wide +6/H-shell rule. Director #3443 therefore hid rune identities and scored the already fixed p28 coordinate against **all same-type p28 canonical two-rune words** using only source-visible geometry.

The original p28 scan is archive/resource `45.jpg` (SHA-256 `318bb587f4dcab11b4db7ba3b8bb13b7913ca79bb409e1c987595503a22e0522`). It is a plain black-text page: no red rubric and no illustration provide a target-specific cue. The useful discriminator is the printed line boundary itself.

Canonical words are delimited only by the printed word punctuation; a physical line wrap is **not** silently treated as a word boundary. P28 has 59 canonical words, including nine complete two-rune words at rune starts:

```text
0, 38, 40, 140, 161, 167, 234, 246, 248
```

Before revealing any rune identities, charge the predeclared line-boundary / section-boundary feature family. Only two of those nine complete two-rune words begin at a printed line start:

```text
start 0    -> page-opening line1
start 140  -> interior line7
```

The page-opening case is itself a section boundary. Therefore the fixed receiver class

```text
complete canonical two-rune word
AND begins at an interior printed-line start
```

has **exactly one p28 hit: offset140**.

The same fact is visible without first filtering by two-rune words. Of the eleven interior printed line starts, only three coincide with canonical word starts at all:

```text
line4  -> five-rune word
line7  -> two-rune word  (offset140)
line11 -> one-rune word
```

All other interior line starts continue a canonical word wrapped from the preceding line. Thus the selected two-rune operand type plus the original layout independently fixes offset140; no exact line number, line length, rune value, plaintext score, red mark, or illustration alignment is required.

This is **page-local selection, not global rarity**. Across unknown p0..p55 there are 465 complete canonical two-rune words; 28 on 25 pages begin at an interior printed line start. The geometry therefore does not discover p28 by itself. Its evidential role is narrower and useful: once the source/page route has independently selected p28 and the frozen receiver type is a complete two-rune word, the original page layout chooses the same receiver without reading its ciphertext or THE.

After that source-only rule is fixed, revealing the already documented coordinate gives:

```text
offset140..141 ciphertext = [24,25]
source-derived key         = [22,7]
plaintext                  = [2,18] = THE
```

The receiver also remains immediately after the independently selected READ OUT object at offsets134..139. The geometry result therefore strengthens the **local p28 plaintext candidate** while leaving the p7 transfer negative intact; it does not revive the +6/H-shell as a general rule.

Reproducer: `sims/lp2_p28_the_source_geometry_gate_sft.cjs`.

## Complete two-rune THEIR RISE family

The authenticated source has nine two-GP-rune words whose +6 partner exists:

```text
1  THE -> 7  THE      rise  0
7  THE -> 13 WAY      rise  A=8
11 IS  -> 17 THE      rise 24=p+1
12 THE -> 18 MAP      rise  7=g+K
17 THE -> 23 ROAD     rise  g=5
21 IS  -> 27 ARE      rise 21
22 THE -> 28 THE      rise  0
28 THE -> 34 BE       rise  b=15
34 BE  -> 40 PATHS    rise  B=19
```

For every row, freeze the exact same computation:

```text
key = H^-1([rise,0])
predicted cipher = source + key mod29
search only physical page = source index.
```

Exactly two forward-rise predictions hit:

```text
p28 THE -> canonical word28 start140
p34 BE  -> canonical word2  start4
```

The seven other source rows miss.

Charge the opposite rise sign as well. All nine reverse-sign predictions miss. The literal forward RISE direction therefore contains both hits and the opposite sign contains none.

The two successful rise coordinates are exactly Bob's authenticated DH private/public pair:

```text
p28 rise = b = 15
p34 rise = B = 19.
```

Their H-inverse keys are the compact paired state forms:

```text
H^-1([b,0]) = [22,7] = [p-1,g+K]
H^-1([B,0]) = [24,5] = [p+1,g].
```

This is a finite family observation. It is not an authorship probability.

> **Bob-pair exception audit — Agent40, 28 November 2026:** after the fresh p7 miss, the proposed restriction to Bob's DH pair `{b,B}={15,19}` has no prospective two-rune support. Across all +6 source transitions, Bob rises occur at ROAD23→DIRECTION29 (four runes), THE28→BE34 (two runes), and BE34→PATHS40 (two runes). The frozen H-shell is a two-coordinate/two-rune rule, so its Bob-eligible typed domain contains exactly the two already-open successes and **zero unused targets**. Do not use the Bob label to rescue the failed general rule without a new source-selected typed target. [Gate](lp2-their-rise-bob-pair-exception-gate.md).

## Manuscript-wide exact-packet control

The p28 rule predicts exact ciphertext packet:

```text
[24,25].
```

Across all rune-bearing unknown pages there are **448 complete page-local canonical two-rune words** after preserving the 32 printed words that cross physical page boundaries.

The exact ordered packet `[24,25]` occurs once:

```text
p28 canonical word28, start140.
```

Thus the held-out prediction is manuscript-wide unique under the complete two-rune-word census.

## Source/page alignment and the +a three-page chain

The held-out receiver retains the source-selected page alignment that was part of the family definition:

```text
authenticated zero-based source index = 28 = THE
selected project page                  = p28
receiver                               = canonical word28, start140
```

Coordinate types must be kept distinct: source index28 is one-based source-word ordinal29 minus one; it maps to zero-based physical page p28 under the 2014 Stage11 page labels. The receiver is page-local one-based word29 (not a global word29); the corrected cross-page parser removes the earlier three-way one-based 29 self-location claim. The receiver remains on p28 and immediately adjacent to READ OUT. The next authenticated source token is one-based ordinal30 DIRECTION (zero-based index29).

The same THEIR RISE step also generates the complete same-index stride:

```text
source/project index28 THE
             +6
source/project index34 BE
             +6
source/project index40 PATHS.
```

The first two members are the exact additive recoveries documented here and in the p34 report. The third member, p40 PATHS at start71, was independently recovered before this chain was noticed. Thus the authored rise `a=6` lands on three matching source/page plaintext candidates in succession:

```text
p28 THE
p34 BE
p40 PATHS.
```

The two direct rise-derived keys occur on the first two steps, whose GP0 rises are exactly Bob's DH pair `b -> B`. The p40 plaintext uses its independently established local shell rather than a repaired extension of the two-rune rule.

This three-page stride is cross-route corroboration. Do not force the two-rune key formula onto p40's four-rune target.

## Relationship to the authenticated DIRECTION route

The recovered local token is source word28 THE. In the authenticated signed message its immediate follower is:

```text
29 DIRECTION.
```

A separate p32/p33 source route already maps the clause:

```text
THE22 -> THE28
ROAD23 -> DIRECTION29
```

under the same +6 THEIR RISE operation.

The new physical p28 recovery therefore supplies a much more literal local instruction path:

```text
p28 READ OUT
 -> immediately adjacent THE
 -> authenticated THE28
 -> immediate source follower DIRECTION29
 -> p29.
```

Semantically this reads:

```text
READ OUT THE DIRECTION
```

The word DIRECTION is source-authenticated rather than claimed as local p28 plaintext.

This convergence strengthens the existing p29 selector without requiring the more distant p28 word31 THE receiver as the sole local bridge.

## Later structural instruction readout after THE

A later target-free p28 result opens only the four complete words immediately after this held-out `THE`, at offsets142..160. Their GP0 residues are `[23,19,22,27]` and their GP lengths are `[4,5,4,6]`. Applying the already fixed forward-H difference half to those two four-vectors yields source indices `[25,26,27,1]`, which read `THEIR NUMBERS ARE THE` under the established zero-based authenticated-source register.

The authenticated source contains that exact four-word phrase once and continues it with index29 `DIRECTION`. Across 2,699 canonical page-local four-word manuscript windows, the p28 object is the sole fixed difference/difference, GP-first readout that produces any contiguous four-word signed-source phrase.

This strengthens the local instruction path from `READ OUT THE` into `THEIR NUMBERS ARE THE DIRECTION` without changing this report's held-out THE recovery or reviving the retired one-based self-location claim. See `lp2-p28-numbers-direction-readout.md`.

## Holdout chronology

This result has unusually clean discovery chronology.

The p34 BE selector was implemented with a family assertion expecting:

```text
p28 THE -> no hit
p34 BE  -> start4 hit.
```

Windows Node22 run **44459406789** failed because actual p28 output was:

```text
p28 THE -> start140 hit.
```

Only after that failure was the p28 receiver at offset140 inspected as a continuation of READ OUT.

The CI failure therefore preserves the pre-result expectation inside the repository history. This does not prove authorship, while it substantially reduces the usual retrospective-language-fit objection.

## Evidence boundary

Preserve the following as a **strong held-out local plaintext recovery candidate**:

```text
THEIR RISE
 -> +6 source operation
 -> THE28 -> BE34 gives rise b
 -> H^-1([b,0]) = [p-1,g+K]
 -> exact predicted p28 cipher [24,25]
 -> manuscript-unique complete-word receiver p28 word28
 -> exact THE
 -> physical adjacency to READ OUT
 -> READ OUT THE
 -> source follower DIRECTION29.
```

The remaining caveat is the general rule itself. It was formulated from the p34 BE relation before p28 was exposed, so p28 is a genuine held-out consequence. Two successful members out of nine do not yet establish that every source rise has a manuscript consumer.

Do not rescue the seven misses by changing signs, offsets, H orientation, page selection, or word boundaries.

## Reproduction

Run:

```text
node sims/lp2_their_rise_h_rectangle_selector_sft.cjs
```

The SFT reconstructs THEIR RISE, runs the complete two-rune +6 predictor family, checks the p28/p34 hits, verifies p28 adjacency to the existing READ OUT object, and exhausts all 448 complete page-local canonical two-rune manuscript words for the exact p28 packet. Windows Node22 PASS after preserving the unexpected holdout: **44461032220**.
