# P0 first physical line reconstructs signed-source indices 5..13 under fixed H scopes

**Agent14, 19 November 2026. Classification: source-derived local readout and strong support for the p0 opening candidate. This does not recover a general p0 inverse or derive the retrospective 13-atom additive key.**

## Starting evidence

Three ingredients were fixed independently before this test:

1. Original physical p0 begins with two red words of GP lengths **8+5**, followed by the large red punctuation mark.
2. The repository already uses the outside-in transform
   `H(x,y) = [x-y, x+y] mod29`, retaining an odd center.
3. The authenticated 2016 clear-signed message supplies a zero-based word register. Existing source-side routes independently select `EPIPHANY5 / SEEKS6` for the p0 8+5 opening, and the untouched p0 title word H-shell sums were already known to be `[1,13] = THE / WAY`.

The question here is narrower: does the original p0 opening itself contain a source-number readout under the same fixed H operation, without subtracting a plaintext-derived key?

## Exact title readout

The original two title words are:

```text
C1 length8
[15,8,18,3,6,19,27,0]

C2 length5
[15,26,18,21,5]
```

Their fixed H outputs are:

```text
H(C1)
= [15,15,10,6,28,8,26,9]

H(C2)
= [10,20,5,18,18]

H(C1 || C2)
= [10,20,16,0,0,7,6,0,20,21,19,19,27]
```

The union of those three source-visible scopes contains every authenticated source index **5 through 10**.

More specifically, the run is partitioned by scope:

```text
H(C2)       contains 5
H(C1||C2)   contains 6,7
H(C1)       contains 8,9,10
```

Therefore the untouched title gives:

```text
5  EPIPHANY
6  SEEKS
7  THE
8  DEVOTED
9  LIBER
10 PRIMUS
```

The operation is a numerical source-register readout. It does not assert that all H coordinates are plaintext characters.

## Matched 8+5 control

Charge every adjacent complete page-local **8+5** word pair on unknown physical p0-p55 under the same three scopes.

There are **19** such pairs.

Only two pairs have a three-scope H union containing all indices5..10:

```text
p0 word1-word2
p39 word9-word10
```

The p39 rival fails the scope partition above. Across all 19 matched pairs, **p0 alone** satisfies:

```text
second-word H contains 5
whole-pair H contains 6 and 7
first-word H contains 8, 9 and 10
```

P0 is also the sole 8+5 pair whose separate word-H sums are exactly:

```text
[1,13] = THE, WAY
```

The broad union observation is therefore insufficient by itself; the fixed source-visible scope assignment and the independent THE/WAY shell sums provide the useful discrimination.

## First physical line extends the register to 12

The first original physical text line of p0 has complete word lengths:

```text
8 | 5 | 4 | 3
```

Apply H to the whole physical line and to each printed word, then take the union. With no new arithmetic rule, that line contains every authenticated source index **5 through 12**.

The already established H sum of the second red title word supplies **13**.

The complete p0 first-line readout is therefore:

```text
5  EPIPHANY
6  SEEKS
7  THE
8  DEVOTED
9  LIBER
10 PRIMUS
11 IS
12 THE
13 WAY
```

or:

```text
EPIPHANY SEEKS THE DEVOTED.
LIBER PRIMUS IS THE WAY.
```

This is an authenticated source clause, recovered as a consecutive numerical register from original unknown-page ciphertext and its printed scopes.

## Physical-line control

Across unknown p0-p55 there are **10** physical lines containing an adjacent 8+5 pair.

Under the unchanged whole-line plus word-H union:

- **3/10** contain every source index5..12;
- exactly **1/10** has its 8+5 pair word-H sums equal `[1,13]`;
- the conjunction is **p0 line1 only**.

This is the relevant matched control because both the original 8+5 title shape and the physical first line are source-visible before the readout.

A much broader census of arbitrary physical-line H unions is dense in long consecutive runs, so long runs on unrestricted lines should not be treated as evidence by themselves. The result here is localized to the independently selected p0 opening and its exact title geometry.

## Relationship to the p0 plaintext candidate

The repository already has a strong candidate that the first two red words are:

```text
EPIPHANY SEEKS
```

with a retrospective additive residual expressed in the reconstructed DH state. The unresolved weakness of that model is the missing source-authored order for its 13 key atoms.

This result bypasses that missing key order for the source identification step. It recovers the larger authenticated phrase **EPIPHANY SEEKS THE DEVOTED. LIBER PRIMUS IS THE WAY.** from the original p0 opening through fixed H scopes and source-number ordering.

That materially strengthens the title interpretation, while leaving two boundaries intact:

- it does not produce a reversible character-by-character decoder for the p0 body;
- it does not explain the exact 13-atom additive residual schedule.

Treat this as a local source-register mechanism and a strong plaintext-selection clue, not as a solved continuous page.

## Reproduction

Run:

```text
node sims/lp2_p0_firstline_h_source_register_sft.cjs
```

The SFT reconstructs the canonical page/word parse, exact title H outputs, all 19 matched 8+5 controls, all 10 physical-line 8+5 controls, and the source5..13 register.
