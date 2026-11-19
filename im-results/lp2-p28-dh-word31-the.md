# P28 literal DH selects word31, whose outer readout gives THE

**Agent15, 19 November 2026. Classification: source-constrained local plaintext candidate. The selector and family controls were recognized after the output was inspected, so this is strong corroboration rather than a blind plaintext prediction.**

## Source path

The already promoted p28 DH23 line begins with the literal two-rune fragment:

```text
DH = [23,8] = [p,A]
```

The fixed outer operation gives:

```text
H(D,H) = H(23,8) = [15,2] = [b,K]
```

The same visible pair has canonical whole-word GP0:

```text
GP0(DH) = 23 + 8 = p + A = 31
```

Use that source-derived integer as the one-based word index on the already selected physical page p28. Word31 is:

```text
I E P EA H
[10,18,13,28,8]
```

It is the third fragment of the physical line immediately after the DH line. Its source geometry independently agrees with the recovered state:

- line7 has total length **22 = p-1**;
- fragment1 has length **2 = K**;
- the **e-th fragment**, with e=3, is word31;
- that fragment has length **5 = g**;
- fragment5 has length **6 = a**;
- fragment6 is a singleton.

Across all594 unknown rune-bearing lines, the state-only profile

```text
total=22, first length=K=2, third length=g=5,
fifth length=a=6, sixth length=1
```

occurs once: p28 line7.

## Read out the selected word

Take the instruction candidate **READ OUT** literally with the already fixed outer-H operation:

```text
H(I,H) = H(10,8) = [2,18]
```

Canonical GP transliteration is:

```text
[2,18] = TH E = THE
```

The map is reversible. No Caesar shift, alternate H orientation, dictionary-fitted key, p50 numeral-to-rune offset, or language-model completion is used.

## Whole-book controls

There are **318** five-rune words on unknown p0..p55. Applying the fixed outer-H operation to every such word produces exact GP **THE** once:

```text
p28 word31 -> THE
```

A second control charges the proposed local sum-index grammar across all exact two-rune fragments. There are621 two-rune fragments, of which595 have a GP0 sum that names an existing same-page word. Comparing the selected word's outer-H output against the authenticated 2016 signed-message two-rune vocabulary `{THE, IS, BE}` gives seven hits.

Now constrain only by the already recovered DH state before reading outputs: require the two-rune source fragment's raw values to be an ordered pair of distinct values from

```text
{p,g,a,b,A,B,K} = {23,5,6,15,8,19,2}.
```

There are **22** such source fragments manuscript-wide and21 have a valid same-page sum index. Exactly one yields an authenticated two-rune word under the frozen outer-H readout:

```text
p28 line6 fragment1 [p,A]=[23,8]
 -> sum31
 -> p28 word31
 -> H(10,8)=[2,18]
 -> THE
```

A narrower same-page control charges every unordered sum of two recovered DH fields. Twenty such sums name p28 words with readable outer pairs. Exactly one output lands in the authenticated two-rune signed vocabulary: **p+A=31 -> THE**.

This does not make arbitrary local GP0 word indexing a general LP2 rule. It shows that the already literal-DH source object, the promoted DH state, the adjacent line geometry, and the frozen outer readout converge on the same local word.

## Relation to READ OUT

The p28 center/page-word route currently yields candidate **READ OUT**. The selected word31 sits immediately after the DH/READ OUT line, on the uniquely state-shaped p-1 line. Reading its outer pair through the same H operation yields **THE**.

A plausible local solve path is therefore:

```text
literal DH
 -> recover DH23 state
 -> READ OUT
 -> p+A=31 / next-line e-th length-g word
 -> outer H
 -> THE
```

The output is a genuine unknown-page plaintext island candidate, not yet a complete sentence. No following word is claimed here. A future promotion should require a source-selected continuation from THE without tuning a new operation.

## Reproduction

```text
node sims/lp2_p28_dh_word31_the_sft.cjs
```

Windows Node22 PASS before the pair-sum extension: GitHub Actions run `44439331821`. The extended SFT retains the same frozen source path and adds the 20-member unordered field-sum control.
