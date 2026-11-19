# P33 WORDS-ARE-THE-MAP route recovers a source-selected READ center

**Agent10, 19 November 2026. Classification: strong conditional plaintext recovery in unknown p33 body ciphertext. Exact reversible mechanism and manuscript-wide control pass. This does not yet establish a whole-body cipher or recover OUT.**

## Source path to the receiver

The p23/p28/p33 navigation fork now fixes the following route without opening p33 body values:

```text
p23 THE ORIGINAL
 -> native p50 low-digit fork
 -> FIND / MUST
 -> p57 title-inclusive positions [15,10]
 -> H -> [g=5, second THEIR position=25]

ORIGINAL -> MUST -> VERIFY
 -> p50[59] = literal B=19 = first THEIR position

THEIR rise: 19 -> 25, delta6=a
```

Reading the risen THEIR position25 with the same independently selected low-base60 opcode gives:

```text
25 THEIR -> 18 MAP -> 15 WORDS
```

and signed positions15..18 are exactly **WORDS ARE THE MAP**. The frozen p33 H map gives:

```text
H(MAP#=18, WORDS#=15) = [3,4] = [e,q]
```

Among all 43 authenticated signed-2016 start indices, 25 is the unique start whose two low-digit successors remain source-word indices and whose successor pair maps to `[e,q]`.

The p33 upper black body has exactly:

```text
e^q = 3^4 = 81 runes
```

so the new route selects that body and identifies its visible printed **words** as the map object before this plaintext extraction.

## Unique e² word

The 21 complete printed words in the selected 81-rune upper body have lengths:

```text
2, 9, 6, 3, 3, 5, 3, 2, 7, 3, 3, 6, 5, 8, 2, 3, 2, 2, 2, 3, 2
```

There is exactly one word of length

```text
e² = 3² = 9
```

namely upper-body word2, page word4, beginning at physical p33 rune offset12. Its original GP29 values are:

```text
[0,16,18,22,28,24,27,15,6]
= F T E OE EA A IA S G
```

The word is selected by the already recovered `e=3`, without trying other word positions or lengths.

## Apply the existing p28 word exponent

The p28 **READ OUT** mechanism already fixes exponent27 on its selected five-rune **word**. Reuse that exact value-changing word operation on the selected p33 word:

```text
x -> x^27 mod29
```

Exponent27 is self-inverse in GP29 for nonzero residues and keeps zero at zero under the positive-exponent convention.

The p33 word becomes:

```text
[0,20,21, 4,28,23, 14,2,5]
 F  L NG   R EA D    X TH C
```

Because the selected word has `e²=9` runes, its unique equal partition into `e=3` blocks of `e=3` runes is:

```text
F L NG | R EA D | X TH C
```

The central, source-within block is therefore:

```text
[4,28,23] = R EA D = READ
```

The transform is byte-exact reversible: applying exponent27 again to the transformed nine-rune word restores the original source values.

### The same word encodes THEIR and HERE in its source outer thirds

Before exponent27 is applied, split the selected source word by the same fixed `e=3` geometry:

```text
[0,16,18] | [22,28,24] | [27,15,6]
 F  T  E     OE EA A      IA S  G
```

The three source-third GP0 sums are:

```text
left:   0+16+18  = 34 = GP0(THEIR)
middle: 22+28+24 = 74 -> p50[74]=3P -> low60(P)=25
right:  27+15+6  = 48 = GP0(HERE)
```

The middle source third therefore points through the already fixed low-digit opcode to **25**, the second signed-2016 THEIR position that generated `MAP -> WORDS -> [e,q]` and selected this 81-rune body in the first place.

Both outer words are independently recovered clue vocabulary: **THEIR** is the p33 hidden title readout and **HERE** is the independently selected p28 page-start candidate. The exponent27 center then becomes literal **READ**.

Thus one source-selected p33 word carries a self-closing cross-object relation:

```text
source thirds:
THEIR | GP0 74 -> p50-low 25 = THEIR₂ | HERE

THEIR₂ 25
 -> MAP18 -> WORDS15
 -> H(18,15)=[e,q]=[3,4]
 -> selects the 81-rune body and its unique e² word

that same e² word under ^27:
... | READ | ...
```

This is a structural relation, not a license to assign English meanings to arbitrary third sums.

## READ has the pre-existing OUT/FIND/p28 consumer

The recovered center is not a dead-end English fragment. Its canonical number is:

```text
GP0(READ) = 4+28+23 = 55
```

and the already independently selected p50 low-digit opcode gives the existing p28 loop unchanged:

```text
READ(55)
 -> p50[55]=1K -> low60(K)=20 = GP0(OUT)
 -> p50[20]=1g -> low60(g)=42 = GP0(FIND)
 -> p50[42]=0S -> low60(S)=28
 -> physical p28
```

The same p33 source word's right third has `GP0=48=HERE`, while p28 independently has the source-selected page-start candidate **HERE**.

So the selected p33 object closes into the p28 route on two separate channels:

```text
p33 selected word
  source right third -> GP0(HERE)
  transformed center -> READ -> OUT -> FIND -> p28

p28 source start -> HERE
p28 selected object -> READ OUT
```

This supplies an independently fixed consumer for the recovered READ rather than inferring OUT from neighboring p33 ciphertext.

## Manuscript-wide fixed control

Charge the exact rule against every complete nine-rune word on unknown physical pages p0–p55:

1. word length must be exactly `e²=9`;
2. apply the same exponent27 to all nine runes;
3. inspect only the central `e=3` runes, positions3..5 zero-based;
4. require exactly native GP `READ = [4,28,23]`.

There are **77** complete nine-rune words. The fixed source-third counts are:

```text
left third GP0 = THEIR(34):       2 words
middle GP0 low-digit -> 25:        2 words
right third GP0 = HERE(48):       2 words
all three source selectors:        1 word
both outer identities:             1 word
center after ^27 = READ:           1 word
selectors + READ jointly:           1 word
```

The sole joint hit is:

```text
physical p33
page word4 / upper-body word2
page offset12
```

This control excludes the other source-visible nine-rune words without language scoring or choosing different offsets.

A broader uniform-^27 scan finds one unrelated READ occurrence on p24, but it begins at that word's edge rather than at the fixed e-centered position and is therefore rejected by the pre-existing `[e,q]` geometry.

## No symmetric OUT claim

The p33 lower body has two complete nine-rune words. Neither contains native GP `OUT=[3,1,16]` anywhere after the same exponent27 operation. The recovered fragment is therefore **READ only**.

Do not manufacture OUT by changing exponent, word length, center rule, section, or phase. P28 already supplies the complete READ OUT instruction independently; this p33 result is a transfer/receiver consequence of that operation.

## Evidence boundary

The strongest current interpretation is a real conditional plaintext recovery with a pre-existing downstream consumer because every moving part is source-selected before language scoring:

- p33 is independently selected by the DH/p50 route;
- risen THEIR selects WORDS ARE THE MAP and reconstructs `[e,q]=[3,4]`;
- `e^q` selects the 81-rune upper body;
- `e²` selects its unique nine-rune word;
- p28 independently fixes exponent27 as a word operation;
- the e-centered block is unique within the selected e² object;
- the same source word's third sums are `[34,74,48]`: THEIR, a low-digit pointer to the risen THEIR position25, and HERE;
- among 77 manuscript nine-rune words, only one has that complete source-third selector, and it is also the unique center READ hit;
- recovered READ immediately follows the pre-existing `READ -> OUT -> FIND -> p28` low-digit route;
- the selected p33 word's independent HERE third matches p28's independently recovered HERE page start.

The selection chain was assembled after READ OUT and the p33 state packet were already known, so this should receive independent adversarial reproduction before promotion to established results. The new READ fragment now has a source-fixed consumer and closes back to p28, which materially raises it above an isolated English substring. It does **not** yet identify the encryption mechanism for the surrounding 78 upper-body runes or the 115-rune lower body.

## Reproduction

```text
node sims/lp2_p33_wordmap_read_center_sft.cjs
```

Inputs are the original LP2 transcription and canonical corpus. The SFT reconstructs the p33 word boundaries, exact source values, exponent27 transform, self-inverse round trip, 77-word manuscript control and lower-body OUT negative.
