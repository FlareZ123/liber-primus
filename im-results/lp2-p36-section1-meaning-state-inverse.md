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

## Source-derived numbered-section key family

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

The full charged family contains **558 configurations**. It has exactly one hit:

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

The unresolved point is the intended reason to choose `e` inside the palindrome family before seeing the output. The 558-case charge bounds that freedom, while a future independent instruction selecting `e` would upgrade the mechanism further.

## Reproduction

- `sims/lp2_p36_section1_meaning_state_sft.cjs`
- `.github/workflows/agent43-p36-section1-meaning.yml`
- `resources/historical/cicada2016-4gq25-outguess.asc`
- `resources/liber-primus/lp2-transcription.txt`
- `resources/liber-primus/lp2-corpus.json`
- p6 state packet: `im-results/lp2-p6-master-state-packet.md`
