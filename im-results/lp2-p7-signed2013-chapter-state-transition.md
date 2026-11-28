# P7 circulant to chapter navigation gives a signed-2013-anchored DH state transition

**Agent 2, 28 November 2026. Classification: original-LP2 structural state transition independently anchored to Cicada's authenticated 2013 worked DH transcript. This result does not use p15's post-selected descriptor→DH role map. No unknown LP2 plaintext or authenticated body-cipher opcode is recovered.**

## Decision

Cicada's authenticated January 2013 TCP-server specification contains the worked exchange

```text
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
```

so its first-party public tuple is

```text
(p,g,A,B,K) = (23,5,8,19,2).
```

The discrete logs in the printed group are unique:

```text
5^6  mod23 = 8  => a=6
5^15 mod23 = 19 => b=15
15^-1 mod22 = 3 => e=3
19^6 mod23 = 2 = K.
```

This state is therefore fixed from the historical source before any p7 or chapter-map value is interpreted.

Primary preserved-source provenance and signature details are documented in
`im-results/lp2-p15-signed2013-tcp-dual-example.md`; the preserved authenticated protocol transcription is linked there.

## Untouched p7 red products reproduce a source-state row

The five original p7 red-word GP29 products are

```text
[11,26,8,15,2].
```

Use the repository's already-fixed right-circulant construction. Its determinant is

```text
19 = B,
```

and its inverse first row is

```text
[23,2,5,2,19]
= [p,K,g,K,B].
```

Charge all five cyclic starts and both ring directions while keeping the authenticated 2013 target fixed. Exactly one of the ten variants matches the complete row: the original printed p7 orientation.

This comparison no longer depends on p15's descriptor-role assignment.

## The source-defined chapter navigation consumes that row directly

An independently established LP2 chapter grammar uses the first complete black word after each physical red chapter opening:

- GP29 **SUM** is the chapter's IN label;
- GP29 **PRODUCT** is the chapter's OUT label.

The nine source records are

```text
page   IN   OUT
 p0    15    23
 p3     9    11
 p8    23     2
p15    22    13
p23    25    16
p27     2    19
p33     5     3
p40    27     3
p54    19    27
```

Treat the independently source-anchored p7 row `[p,K,g,K,B]=[23,2,5,2,19]` as chapter IN labels. It selects the physical itinerary

```text
p8, p27, p33, p27, p54.
```

The chapter grammar's **raw OUT labels** along that itinerary are

```text
[2,19,3,19,27]
= [K,B,e,B,-K].
```

This is the important new causal result: the pre-existing chapter SUM→PRODUCT navigation consumes the p7 state row and returns a second DH-state row **without H5, p15 descriptor semantics, language scoring, or an LP2 body key**.

The older H5 observations on chapter spans/word lengths/products remain useful secondary structure, but they are no longer needed to establish this raw state transition.

## Fixed-marginal control

Preserve the nine observed IN labels and permute the nine whole observed chapter records among them. There are `9! = 362,880` assignments.

Keeping the authenticated source input row and output target fixed, exactly

```text
240 / 362,880 = 1 / 1,512
```

assignments reproduce the raw OUT state row.

This is a post-discovery finite assignment diagnostic, not a discovery-wide authorship probability. The stronger scientific point is type consistency: the input is an original p7 numeric row independently matched to a first-party DH tuple, and the consumer is an already-defined original chapter navigation rule.

## Evidence boundary

Established here:

1. authenticated 2013 source fixes `(p,g,A,B,K)=(23,5,8,19,2)`, hence `a=6,b=15,e=3`;
2. original p7 red products in printed orientation yield determinant `B=19` and inverse first row `[p,K,g,K,B]`;
3. the independent chapter SUM→PRODUCT grammar consumes those five IN labels;
4. its raw OUTs are exactly `[K,B,e,B,-K]`;
5. only the original p7 ring orientation matches the authenticated input row; the chapter fixed-marginal raw-OUT charge is 1/1,512.

Still candidate-level:

- the p7 right-circulant operation itself is not printed as an instruction;
- this state transition does not identify a body-text receiver or decrypt unknown LP2 ciphertext;
- H5 is not required for the raw transition and remains a separate candidate transform.

Reproducer: `sims/lp2_p7_signed2013_chapter_state_transition_sft.cjs`.
