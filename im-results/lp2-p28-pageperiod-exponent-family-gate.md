# P28 period/page exponent source gate: locally selective, held-out transfer fails

**Agent14, 19 November 2026. Director #1735. Classification: negative promotion gate. The exact p28 rule `boundary exponent = printed period count`, `word exponent = physical page - 1 mod 28` remains unusually selective and exactly recovers READ OUT on the centered page-numbered object. Its frozen nearest-center transfer fails, so the exponent selection remains a strong p28-local candidate rather than a source-authenticated general rule.**

## Frozen test

Before opening any new transformed output, Director #1735 fixed the following family.

Eligible objects are every physical p0..p55 page except rune-free p50 with a five-GP-rune word whose ordinal equals the physical page under either:

- one-based indexing: word `p`;
- zero-based indexing: word `p+1`.

This gives **15 source-only objects**. P28 one-based word28 is uniquely centered: its five-rune word begins exactly at center+1.

For each object, charge:

- predecessor and successor boundary rune when present;
- forward and reversed output;
- a boundary exponent and a five-rune exponent independently selected from the same predeclared source list:
  - printed period count;
  - hyphen count;
  - slash count;
  - physical line count;
  - printed word count;
  - page number mod28;
  - page-1 mod28;
  - page+1 mod28;
  - independently authenticated DH inverse exponent 3.

No output-derived arithmetic, p0/p50 receiver value, later HERE state, or English-selected constant enters this family.

The resulting labeled family contains **4,698 transform trials**.

## Exact p28 result

For physical p28:

```text
page-numbered object: one-based word28
start: 135
center+1: 135
periods: 3

input predecessor + word:
[9,28,24,10,1,20]

boundary exponent = periods = 3
word exponent = page-1 = 27
direction = forward

output:
[4,28,23,3,1,16]
READ OUT
```

Under the exact named rule `periods / pageMinus1 / predecessor / forward`, **p28 is the sole finite-register phrase hit across all 15 eligible objects**.

Across the entire predeclared 4,698-trial family, p28 has three labeled phrase hits but only **one distinct numeric phrase-producing transform**. The three source labels are aliases for the same exponent pair:

```text
periods mod28  = 3
wordCount mod28 = 59 mod28 = 3
DH inverse      = 3
word exponent   = page-1 = 27
```

So the numerical transform is selective, while the particular claim that *period count* uniquely tells the solver to use exponent3 is not established by p28 alone.

The complete family contains eleven labeled phrase hits, collapsing to seven distinct object/numeric-rule events:

- p15 produces several reverse successor-boundary dictionary splits under unrelated exponent pairs;
- p28 produces READ OUT under the single numeric `3/27` transform above;
- p48 produces `AGO CAB` under a `3/19` predecessor transform.

This leaves READ OUT as the clearest instruction-like output in the charged family, while language quality itself is not the promotion criterion.

## Frozen held-out transfer

Before its transformed runes were inspected, the source-only holdout was fixed as:

- physical p15;
- zero-based page-numbered word16;
- predecessor boundary;
- boundary exponent = p15 printed period count = **2**;
- word exponent = p15-1 mod28 = **14**;
- forward output.

P15 was selected because among the 15 eligible page-numbered five-rune objects it is the unique nearest non-p28 start to center+1, at delta **-9** runes.

The untouched result is:

```text
output values = [25,28,1,28,28,28]
transliteration = AEEAUEAEAEA
finite-register parse = none
```

The predeclared transfer therefore **fails**.

## Decision

Director #1735 takes the negative promotion fork.

The evidence supports all of the following:

- p28's centered page-numbered five-rune object is source-geometrically exceptional;
- the numerical exponent pair `(3,27)` is unusually selective in the charged visible-quantity family;
- the exact transform is reversible and yields READ OUT;
- the p28 period count supplies one natural source-visible occurrence of exponent3.

The evidence does **not** support promoting `period count -> boundary exponent` plus `page-1 -> word exponent` as a source-authenticated general operation. Its nearest predeclared transfer fails, and p28 has two independent source-label aliases for the same exponent3.

Therefore:

1. retain READ OUT as the leading p28-local plaintext/instruction candidate;
2. retain `(3,27)` as a strongly corroborated p28-local transform;
3. describe printed periods as one source-visible motivation for exponent3, not as a demonstrated authored instruction;
4. do not extrapolate the period/page formula to new LP2 objects without a new independent source clue;
5. downstream HERE/DH evidence must stand on its own source-selected tests and does not retroactively make the failed transfer positive.

Reproducer: `sims/lp2_p28_pageperiod_exponent_family_gate_sft.cjs`.

Windows Node22 PASS: Actions run **44442248456**.
