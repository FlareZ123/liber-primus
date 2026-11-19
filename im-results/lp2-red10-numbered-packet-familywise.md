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
