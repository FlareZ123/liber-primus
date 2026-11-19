# P36-p38 red-10 numbered packet: familywise audit and prospective return to p32

**Agent11, 19 November 2026. Director issue #1801. Classification: strong source-index navigation result with a prospective numeric consequence. No local p36-p38 plaintext is claimed.**

Two identical red ten-dot punctuation marks bracket the only Arabic-numbered section packet in LP2, sections1 through5 across physical p36-p38. Under the independently established zero-based signed-source convention, the bracket count10 is source word `PRIMUS`; adding the visible section labels1..5 gives indices11..15, `IS THE WAY ITS WORDS`. A complete red-count/sign/origin census shows that count10 is necessary for this exact source-index sequence, while p49 and p56 provide matched red-10 controls lacking any numbered packet.

A continuation was frozen on Director issue #1801 before opening the selected section words: interpret **ITS WORDS** as the words inside the five numbered sections, use the literal rule section n -> nth canonical word, keep only its visible rune length, and apply the already solved p56 cardinal length serializer `T(n)=(prime_n-1) mod29`. The held-out lengths are `[4,4,4,2,6]`; serialization gives GP values `[6,6,6,2,12]`, whose canonical GP0 is **32**. This returns exactly to physical **p32**, independently selected by the authenticated SEEKS/p50 depth-p route.

## Complete visible-number census

The transcription contains Arabic `n-` section labels only here:

```text
p36: 1
p37: 2 3 4
p38: 5
```

The ink annotation corpus contains **35 red large-punctuation occurrences**:

```text
count10: 4 occurrences  -> p36, p38, p49, p56
count13: 30 occurrences
count23: 1 occurrence   -> p57
```

Within the numbered packet, the only red count10 anchors are:

```text
p36 rune boundary99: 10 red dots, before section1
p38 rune boundary186: 10 red dots, after section5
```

The other count10 controls are p49 and p56; neither page has an Arabic section label. Counts13 and23 likewise do not bracket the five-section packet.

Thus the visual type is specific: **same red count on both outer boundaries of the only numbered section sequence**.

## Charged arithmetic family

To avoid silently privileging the successful arithmetic, charge every red punctuation occurrence against visible markers `[1,2,3,4,5]` using:

- anchor origin zero or one;
- marker origin zero or one;
- addition or subtraction;
- every red count10/13/23 occurrence.

All 35×2×2×2 = **280** configurations stay inside the 43-word authenticated source.

The exact index sequence

```text
[10,11,12,13,14,15]
= PRIMUS IS THE WAY ITS WORDS
```

occurs only for:

```text
count10
zero-based anchor
literal marker values
addition
```

Numerically this same configuration appears at all four red10 occurrences because they share the same count. The original-image structural selector then matters: only p36 and p38 are the two matching boundaries of the numbered packet. P49 and p56 are matched red10 controls with no numbered section consumer.

Representative p36 controls are:

```text
10 - [1..5]         -> PRIMUS LIBER DEVOTED THE SEEKS EPIPHANY
one-origin +[1..5] -> LIBER PRIMUS IS THE WAY ITS
marker-origin shift -> duplicates the anchor and misses WORDS
```

The repository's zero-based signed-source convention was selected independently before this packet, so the successful origin is not chosen from these controls.

## Frozen continuation: ITS WORDS

The issue required a continuation before opening new selected values. The precommit was posted on #1801:

```text
ITS WORDS = words inside the five numbered sections.
section n -> nth canonical printed word.
read only that word's visible rune length.
apply the solved p56 cardinal word-length serializer T.
No neighboring/reverse word ordinal after reveal.
```

This creates one receiver in each section with no plaintext feedback.

The held-out word lengths are:

```text
section1 word1 -> 4
section2 word2 -> 4
section3 word3 -> 4
section4 word4 -> 2
section5 word5 -> 6
```

Apply the fixed solved-page serializer:

```text
T(4)=6
T(4)=6
T(4)=6
T(2)=2
T(6)=12

packet = [6,6,6,2,12]
GP0(packet) = 32
```

The five serialized runes need no spelling repair. Their standard GP0 scalar gives a typed page receiver, **p32**.

## Independent p32 control

P32 was already fixed independently:

```text
GP0(SEEKS)=71
follow original p50 base60 byte pointers
for p=23 steps
terminal = 32
```

Exact chain:

```text
71 -> 108 -> 14 -> 183 -> 81 -> 58 -> 146 -> 92
   -> 236 -> 238 -> 129 -> 179 -> 175 -> 18 -> 15
   -> 212 -> 70 -> 169 -> 228 -> 144 -> 125 -> 20
   -> 102 -> 32
```

Therefore the frozen numbered-section continuation returns to a page selected by a materially independent authenticated-source operation.

## Integrated continuation on the selected p32 object

The prospective section-word continuation gives scalar32, returning to the independently fixed p32 object. Existing source-constrained p32 work now makes the next authenticated words operationally concrete.

The terminal SEEKS route states immediately before p32 are:

```text
[125,20,102]
= [g^e, GP0(THE), GP0(DEVOTED)].
```

Using the already fixed p50 width `A=8` gives coordinates:

```text
rows [15,2,12] -> sum29
cols [5,4,6]   -> sum15=b.
```

Reuse those source coordinates on the state-sized `11×11=(A+e)^2` p32 square by reducing only the rows modulo11. This selects original p32 offsets:

```text
[49,26,17]
-> [24,4,18]
-> ARE.
```

Before reading those rune values, their containing zero-based p32 words are:

```text
[8,5,3]
sum = 16
source word16 = ARE.
```

Thus the selected object after the numbered packet supplies the exact next authenticated word.

A second independently bounded state read gives THE:

```text
start = p+g = 28
north one p32 row
end   = p-a = 17

p32[28],p32[17] = [TH,E] = THE.
```

The two reads share the same original E cell17. Source index17 is `THE`.

The following authenticated source word `MAP` already has a typed operational role rather than requiring a third local plaintext read:

```text
GP0(MAP)=56
p50[56] = 4E
0x4E = ASCII N
56 - A(8) = 48 = GP0(HERE).
```

Therefore the combined route is:

```text
red10 + sections1..5
-> PRIMUS IS THE WAY ITS WORDS
-> frozen section-word serializer
-> p32
-> ARE
-> THE
-> MAP supplies N / HERE operation.
```

This joins the numbered packet directly to the authenticated continuation `PRIMUS IS THE WAY ITS WORDS ARE THE MAP` while keeping the word types distinct: ARE and THE are p32 readouts; MAP is an existing p50 direction opcode.

A deliberately narrow follow-up tested whether MAP itself also appears under the exact p32 state-address/cardinal grammar that produced THE. Keeping the same 49 addresses, all four directions, and extending from two cells to three yields **zero** authenticated three-rune hits on p32 and zero on the matched square page p6. That failure is recorded in `im-results/lp2-p32-state-native-the-readout.md`. Do not tune turns, wraps, or alternate starts to force MAP as local p32 plaintext.

## Independent phrase replication on p15

The packet's six-word authenticated readout is independently reconstructed by a different original-page geometry on p15.

P15 visibly supplies:

```text
red span lengths 9,11
red punctuation count13
physical page15
```

forming the sole arithmetic progression in the complete manuscript family of pages with two red spans plus red punctuation:

```text
[9,11,13,15], step2=K.
```

Under the already fixed zero-based source convention:

```text
9  LIBER
11 IS
13 WAY
15 WORDS.
```

The arithmetic midpoints are:

```text
10 PRIMUS
12 THE
14 ITS.
```

Interleaving terms and midpoints gives:

```text
LIBER PRIMUS IS THE WAY ITS WORDS.
```

So p15 independently reproduces the complete six-word packet phrase plus its immediate predecessor `LIBER`, using a different visible number structure.

The numbered diagonal also independently selects p15's canonical word16 / zero-based word15 for authenticated `WORDS`. A separate p15 geometry-key analysis recovers a strong local WORDS candidate at that exact receiver, while retaining a chronology caveat on the key serialization.

This makes `PRIMUS IS THE WAY ITS WORDS` a repeated manuscript-level instruction rather than a phrase obtained from only one numerical layout.

## The same packet also selects MEANING -> ROAD

A concurrent independent result gives the red10 packet a second source-selected consumer.

The two matching outer punctuation glyphs each have ten red dots:

```text
10 + 10 = 20
source index20 = MEANING.
```

Section marker1 fixes p36's first section receiver. Its canonical word at offsets99..102 is:

```text
C = [20,2,12,22].
```

The original-raster ten-dot geometry has column signature `(3,4,3)=(e,q,e)`; together with visible section marker1, the complete local key alphabet is therefore `{1,3,4}`. Agent43 exhaustively charged all:

```text
3^4 * 2 signs = 162
```

four-slot operations against the already fixed MEANING target. Exactly one works:

```text
[20,2,12,22] - [1,3,3,1]
= [19,28,9,21]
= MEANING.
```

The same authenticated source uses the recurring `X IS/ARE THE Y` spacing of `e=3`:

```text
MEANING20 + e3 = ROAD23.
```

ROAD23 is independently the established p23/origin state checkpoint. Thus the packet does more than recover the earlier clause `PRIMUS IS THE WAY ITS WORDS`; its own red boundary count and section1 also supply a constrained transition:

```text
MEANING -> ROAD.
```

This is a strong local candidate with target-frozen finite controls, not a universal p36 cipher. It replaces no part of the retired p36 GOOD pseudo-word claim.

See `im-results/lp2-p36-section1-meaning-state-inverse.md` and Windows regression **44465133751**.

## Independent numbered-diagonal loop: BEWARE returns to YOU

Agent1's independently recovered numbered route gives a second interpretation of the packet's p32 result.

The authenticated one-based source ordinal `n` selects physical LP2 page `n`, project page `n−1`, and canonical local word `n`. Across all43 source words the sole direct-coordinate failure is:

```text
YOU ordinal33
-> project p32
-> requested word33 absent
-> p32 has exactly22=p−1 words.
```

DIRECTION30 independently recovers `p−1=22`, so the one permitted one-based wrap sends YOU33 to p32 word11. Direct numbering then resumes:

```text
WILL34   -> project p33
BE35     -> project p34
FOUND36  -> project p35
GOOD37   -> project p36
LUCK38   -> project p37
BEWARE39 -> project p38.
```

The final three project pages are exactly the physical packet studied here:

```text
p36 section1
p37 sections2,3,4
p38 section5.
```

So the independently recovered numbered diagonal enters the red10 packet on the authenticated suffix:

```text
GOOD -> LUCK -> BEWARE.
```

The prospectively frozen packet continuation then gives:

```text
section n -> word n lengths
[4,4,4,2,6]
-> solved cardinal T
[6,6,6,2,12]
-> GP0 32
-> project p32.
```

Project p32 is exactly the unique wrapped YOU page. Therefore two independently developed mechanisms close a page-level cycle:

```text
YOU33
 -> unique p32 wrap
 -> WILL34 -> BE35 -> FOUND36
 -> GOOD37 -> LUCK38 -> BEWARE39
 -> p36-p38 red10 numbered packet
 -> frozen packet readout32
 -> p32
 -> YOU33.
```

This relation was recognized after the packet continuation and the numbered diagonal had been developed separately. It requires no new key, radix, sign, or offset. The packet's numeric output was already frozen as32; the diagonal had already fixed p32 as the unique YOU exception.

This is currently the strongest structural consequence of the red10 packet: it does more than quote authenticated source text or point to a previously interesting page. It closes onto the unique exceptional page in a distinct source-number navigation system.

## Local plaintext evidence along the post-YOU loop

The numbered-page cycle also overlaps existing local plaintext work on five of its six post-YOU source words:

```text
p33 -> strong WILL candidate
p34 -> strong BE candidate
p35 -> strong FOUND candidate
p36 -> GOOD local inverse retired
p37 -> strong LUCK candidate
p38 -> strong BEWARE candidate.
```

The p33-p35 phrase was developed independently: p33 is selected by the DH/p50 state, carries the WILL inverse, and its two authored RISE consumers select p34 and p35 before their BE and FOUND receivers are consumed. The numbered diagonal later reaches the same three project pages as `WILL34 / BE35 / FOUND36`.

The p37 LUCK result is stronger at the receiver-coordinate level: the diagonal's one-based `LUCK38 -> project p37 / word38` is exactly zero-based p37 word37, the receiver independently used by the LUCK double-index analysis.

P38 BEWARE is selected by a different authored object, section5 and the LUCK predecessor state, rather than by the diagonal word ordinal. It is therefore a page/transition convergence rather than an identical local-word coordinate.

This evidence profile is deliberately asymmetric. No replacement GOOD decoder is introduced after the canonical line-wrap correction invalidated the earlier p36 pseudo-word.

## Ciphertext-bearing anchor inside the GOOD / LUCK / BEWARE leg

The numbered loop is not purely page arithmetic. Its LUCK coordinate coincides exactly with an independently developed local plaintext candidate.

Under the one-based numbered diagonal:

```text
LUCK ordinal38
-> physical page38
-> project p37
-> canonical word38
-> zero-based p37 word37.
```

Agent43 independently selected that exact p37 word37 at offsets146..149 under the zero-based double-index convention:

```text
cipher [3,2,6,27]
-> strong local LUCK candidate.
```

Its untouched raw state has the additional source consequence:

```text
GP0(p37 word37) = 38
source index38 = BEWARE
-> project p38.
```

P38 is independently selected by the authored section5 predecessor gate:

```text
LUCK GP0 31
p50[88] low60 = 31
section5 first word length6 / GP0 88
-> BEWARE at p38 offsets57..62.
```

That receiver has a separately charged exact local BEWARE inverse.

So the post-YOU loop contains a ciphertext-bearing bridge before the red10 packet returns to p32:

```text
... GOOD37
-> LUCK38 / p37 numbered receiver
-> local LUCK candidate
-> raw GP0 38
-> BEWARE39 / p38 section5 receiver
-> local BEWARE candidate
-> red10 numbered packet
-> p32 / YOU.
```

The former p36 local GOOD inverse is retired because it used a line-wrap pseudo-word; this loop does not depend on it.

## Existing downstream continuation from MAP / HERE

The MAP opcode does not terminate at an untyped pointer. Existing independently documented work gives a constrained continuation:

```text
MAP
-> GP0 56
-> p50[56] = 4E
-> literal hex N
-> one p50 row north
-> 48 = GP0(HERE).
```

A later source-selected consumer revives exactly one HERE continuation under the reconstructed DH depth `K=2`:

```text
HERE = 48
48 -> p50 base60 253
253 -> p50 base60 36
36 = GP0(FOUND)
source index35 = FOUND.
```

The same two-step p50 map has a pre-existing authenticated source adjacency control `WILL -> BE`, so depth2 is not chosen from HERE after its result is known.

FOUND then converges on an independently selected page/result pair in two ways:

```text
source number35
-> p50[35] = 39
-> physical p39

35 + THEIR RISE(6)
-> source index41 = VERIFY.
```

P39's independent DIVINITY/circumference receiver also yields VERIFY. The pre-existing VERIFY holdout then reaches p9 and an untouched source-index packet:

```text
VERIFY
-> p9
-> DIRECTION | PATHS.
```

Thus the broader candidate solve path is now:

```text
p36-p38 red10 numbered packet
-> PRIMUS IS THE WAY ITS WORDS
-> frozen section-word cardinal readout
-> p32
-> ARE THE
-> MAP / N
-> HERE
-> T^K
-> FOUND
-> p39
-> VERIFY
-> p9
-> DIRECTION | PATHS.
```

This synthesis does not upgrade every link to established plaintext. The p32 ARE/THE readouts, HERE route-state, and p39 VERIFY remain source-constrained candidates with their own finite controls and chronology caveats. Its value is causal compression: the new red10 packet now feeds an already existing chain of typed consumers instead of creating an isolated numeric coincidence.

Dedicated downstream evidence remains in:

- `im-results/lp2-state56-map-north-here-cube-packet.md`;
- `im-results/lp2-p28-here-found-p39-verify-convergence.md`;
- `im-results/lp2-p32-seeks-route-are-readout.md`;
- `im-results/lp2-p32-state-native-the-readout.md`.

## Interpretation

The resulting human-scale loop is:

```text
red10 + sections1..5
-> PRIMUS IS THE WAY ITS WORDS

ITS WORDS
-> section n / word n lengths
-> solved cardinal serializer
-> GP0 32
-> p32

p32
-> established READ OUT / signed-source navigation routes
```

This supplies a prospective consequence for the red10 packet without reading unknown rune plaintext or tuning an offset after reveal.

The result supports a typed interpretation of the numbered packet as navigation metadata. It does not license arbitrary visible numbers as source indices. The structural type requires the numbered section packet and its matching red punctuation boundaries.

## Reproduction

`sims/lp2_red10_numbered_packet_familywise_sft.cjs`

The SFT verifies the complete visible-number census, all280 arithmetic controls, the unique packet bracketing geometry, the exact authenticated-source readout, the frozen section-n/word-n length selection, solved p56 serialization, GP0=32 consequence, and the independent SEEKS depth-p p32 control.

Windows Node22 generic-runner reproduction PASS: **44463236057**.
