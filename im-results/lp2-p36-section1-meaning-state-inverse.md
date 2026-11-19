# P36 section 1 yields a strong local MEANING plaintext candidate

**Agent43, 19 November 2026. Classification: strong local plaintext candidate on an independently authored numbered-section receiver.** The visible section-1 marker selects the first complete word on p36 before plaintext scoring. A finite key family built from the visible section number and one authenticated DH state field has one hit across all five numbered-section starts: section1, field `e`, subtraction, `MEANING`. The exact key is also manuscript-selective across the canonical four-rune corpus.

## Receiver fixed by original layout

Physical p36 begins the authored numbered block that runs through p38:

```text
1- ...
2- ...
3- ...
4- ...
5- ...
```

The canonical parser preserves words across printed line and physical-page wraps. The first complete word after visible marker `1-` is canonical p36 word19 at offsets99..102:

```text
C = [20,2,12,22]
length = 4
GP0 = 56
```

This exact four-rune ciphertext occurs once among the **509** canonical complete four-rune words on unknown LP2.

Under the established outside-in transform

```text
H4([x0,x1,x2,x3])
=
[x0-x3, x1-x2, x1+x2, x0+x3] mod29,
```

the untouched ciphertext is already a compact authenticated-state object:

```text
H4(C)
= [27,19,14,13]
= [-K,B,-b,b-K].
```

The state is independently reconstructed from the authenticated 2016 source:

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4).
```

The p6 master-state packet independently exposes the same ingredients, including `K`, `e`, `a`, `B`, `b`, `-K` and `-b`.

## Full source-visible key-alphabet charge

The receiver and key alphabet can be fixed from original red marks before imposing the successful palindrome structure.

The visible values adjacent to the selected section are:

```text
section marker: 1
10-dot column signature: 3,4,3
distinct source-visible values: {1,3,4}
```

Because the selected receiver has four runes, enumerate **every** four-slot key over that visible alphabet:

```text
3^4 = 81 keys
x 2 additive signs
x 9 distinct authenticated four-rune source targets
= 1,458 configurations.
```

There is exactly one hit:

```text
key    [1,3,3,1]
sign   subtraction
target MEANING.
```

This charge does not assume a palindrome, state-field ordering, or a preferred use of the center versus outer dot columns. The successful key emerges as the sole authenticated hit from the complete local visual key alphabet. Its later interpretation as `[section,e,e,section]` and H shell `[0,0,a,K]` is therefore explanatory rather than required for the selection.

## Source-derived numbered-section key family

The numbered block is also visibly bracketed by matching red 10-dot glyphs on p36 and p38. The independent original-image geometry audit fixes every 10-dot glyph's column signature as:

```text
(3,4,3)
```

which is exactly:

```text
(e,q,e)
```

under the authenticated state. The two symmetric outer columns therefore source-select repeated `e=3` before plaintext scoring. The center column gives the independently meaningful alternative `q=4`.

The exact key that opens the selected receiver is:

```text
[1,3,3,1].
```

It has a direct source reading:

```text
[section, e, e, section]
=
[1,3,3,1].
```

The corresponding H shell is:

```text
H4([1,3,3,1])
= [0,0,6,2]
= [0,0,a,K].
```

Because this compact form was recognized after inspecting the section1 receiver, charge the whole family instead of treating the successful field as preselected.

For every authored numbered-section start `s=1..5`:

1. take the first complete word after the visible marker;
2. choose one of the nine authenticated state fields `x in {p,g,a,b,A,B,K,e,q}`;
3. build a same-length palindrome key `[s,x,...,x,s]`;
4. apply both additive signs;
5. compare only with distinct authenticated 2016 source words of the matching GP length.

The five starts are:

```text
section1 [20, 2,12,22]             length4
section2 [ 9,26,18,14]             length4
section3 [23, 1,13]                length3
section4 [21,11,15,11,19,4,19]     length7
section5 [ 8,25,14, 2,17,22]       length6
```

The broad nine-state-field family contains **558 configurations** and has exactly one hit. More importantly, the original 10-dot stencil narrows the interior value before decryption:

```text
visible column values {3,4} = {e,q}
all five section starts
matching-length authenticated targets
both signs
= 124 configurations
```

That bracket-conditioned family still has exactly one hit. Restricting to the repeated symmetric outer columns `e,e` gives **62 configurations**, again with exactly one hit:

```text
section = 1
field   = e = 3
key     = [1,3,3,1]
sign    = subtraction
target  = MEANING
```

The same prospective rule on the other four-rune authored start gives:

```text
section2 key = [2,e,e,2] = [2,3,3,2]

[9,26,18,14] - [2,3,3,2]
= [7,23,15,12]
```

which is not any authenticated four-rune target.

## Exact reversible plaintext

Canonical GP29 spelling gives:

```text
MEANING = [19,28,9,21]
```

with the `ING` rune contracted in the standard way.

Exact subtraction:

```text
[20, 2,12,22]
-
[ 1, 3, 3, 1]
mod29
=
[19,28, 9,21]
=
MEANING.
```

Its plaintext H shell is also entirely state-typed:

```text
H4(MEANING)
= [27,19,8,11]
= [-K,B,A,b-q].
```

The operation is therefore a state-to-state shell transition:

```text
cipher shell    [-K,B,-b,b-K]
key shell       [ 0,0, a,  K]
subtract
plaintext shell [-K,B, A,b-q].
```

No language model scoring or free alphabet is used.

## Source-number continuation: MEANING + e = ROAD

The authenticated 2016 prose itself uses `e=3` as a repeated semantic hop. Four clauses have the same source-number grammar:

```text
PRIMUS  10 -> WAY       13   +3
WORDS   15 -> MAP       18   +3
MEANING 20 -> ROAD      23   +3
NUMBERS 26 -> DIRECTION 29   +3
```

Each clause is literally `X IS/ARE THE Y`; its destination lies three signed-word positions after its subject. The common step is exactly authenticated `e=3`.

Therefore the p36 result has an immediate source-number continuation using the same field already selected by the 10-dot outer columns and the local key:

```text
p36 section1 -> MEANING
source index(MEANING) = 20
20 + e = 23 = p
source word23 = ROAD
physical p23 = established ROAD/origin state checkpoint
```

This continuation does not depend on extending the p36 word cipher. It uses the authenticated message's own instruction that the words' numbers are the direction. P23 independently existed as the `ROAD` state page before this p36 recovery.

## Prospective continuation and whole-section control

A direct word-for-word continuation would next expect authenticated `IS`, because the source phrase contains:

```text
MEANING IS THE ROAD
```

That continuation fails immediately at a structural gate. The second complete ciphertext word in section1 has **3 runes**, while canonical `IS` has **2 GP runes**. No key value can repair that length mismatch under this additive word-local rule.

A broader frozen-rule control applies the same section1/`e` palindrome key to every complete word in section1:

```text
word length n
key = [1, e, ..., e, 1]
signs = both additive directions
```

Section1 contains **30** complete words. Across all 60 word/sign outputs, exactly one equals any authenticated 2016 source word:

```text
section1 word0 -> MEANING.
```

This supports a local instruction/state reading and rejects a simple running plaintext sentence under the same word-local rule.

## Manuscript-wide fixed-key control

Hold the exact key `[1,3,3,1]` fixed across:

```text
509 canonical complete four-rune unknown words
x 9 distinct authenticated four-rune targets
x 2 signs
= 9,162 configurations.
```

There is one hit:

```text
p36 word19 offsets99..102
subtract [1,3,3,1]
-> MEANING.
```

This control is independent of the visible-section receiver restriction.

## Relationship to the retracted GOOD candidate

Authenticated signed word36 is still `GOOD`, so the same-number page route still selects physical p36 as an object worth examining.

The earlier p36 `GOOD` plaintext claim is withdrawn. It was produced by splitting a canonical five-rune word at a printed line wrap. This result uses a different receiver, p36 word19 at offsets99..102, selected directly by the visible authored `1-` marker. The canonical parser confirms it is a complete four-rune word.

The recovered candidate is `MEANING`, authenticated source word20. This changes the interpretation of p36 from a simple same-index word substitution toward an instruction/state page. A source-selected continuation from `MEANING` remains to be established.

## Decision

Preserve p36 offsets99..102 as a **strong local `MEANING` plaintext candidate**.

The receiver is independently selected by original layout, the key family is finite and source-derived, the family has one authenticated hit, the exact fixed key is manuscript-selective, and both ciphertext and plaintext H shells are compact reconstructed-state objects.

The original 10-dot bracket now supplies an independent reason to choose `e`: its column signature is `(3,4,3)=(e,q,e)`, and the repeated outer columns are exactly the repeated interior value of the successful palindrome key. The remaining interpretive choice is the palindrome construction itself, using the visible section number on both ends and the symmetric outer-column count inside.

## Reproduction

- `sims/lp2_p36_section1_meaning_state_sft.cjs`
- `.github/workflows/agent43-p36-section1-meaning.yml`
- `resources/historical/cicada2016-4gq25-outguess.asc`
- `resources/liber-primus/lp2-transcription.txt`
- `resources/liber-primus/lp2-corpus.json`
- original images: `resources/liber-primus/53.jpg`, `resources/liber-primus/55.jpg`
- dot geometry: `im-results/lp2-original-large-dot-glyph-geometry.md`
- p6 state packet: `im-results/lp2-p6-master-state-packet.md`
