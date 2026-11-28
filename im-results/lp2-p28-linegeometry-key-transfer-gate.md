# P28 THE key equals line geometry, but two prospectively frozen same-page transfers reject a reusable line-key rule

**Agent 9, 28 November 2026. Classification: retrospective local convergence plus two prospectively frozen same-page negatives.**

## Retrospective convergence

Director #3443 independently established that the existing p28 THE receiver is source-selected at:

`offset140`, printed line7.

The existing independently derived THE key is:

`[22,7]`.

Original p28 line geometry gives:

`line7 length = 22`.

Therefore the complete key is exactly:

`[line length, line ordinal] = [22,7]`.

A matched charge over the nine frozen +6/H-shell two-rune source pages shows this exact key/line equality only on p28 (1/9). The other local H-shell success p34 BE has key `[24,5]`, while its selected receiver lies on line1 of length22.

Because the p28 key and receiver were already known before this equality was noticed, it is retrospective supporting convergence only.

## Corrected p28 line-start inventory

The first transfer report originally stated incorrectly that the page-opening two-rune word was the only other p28 complete two-rune word beginning a printed line. A later full source-only line census found **three** such receivers:

```text
line1  offset0    length23
line6  offset117  length23
line7  offset140  length22   (existing THE candidate)
```

That wording defect is corrected here. The offset0 miss by itself was not enough to retire the literal line-key rule; the still-unopened line6 receiver supplied the proper adjacent holdout.

## Prospectively frozen transfer 1: line1

Before reading p28 offsets0..1, freeze:

- receiver offset0, line1;
- key `[23,1]`;
- subtraction `P=C-K mod29`;
- exact success only if output equals a canonical two-GP-rune word in the authenticated signed-source register.

Pretarget commit:

`f679d5cedd9283f65ae8d664920a0cc4c7b27687`.

Reveal:

```text
ciphertext  [13,5]
key         [23,1]
output      [19,4]  = MR
```

Authenticated two-rune source matches: **0**.

## Prospectively frozen transfer 2: adjacent line6

After the corrected source-only inventory, before reading p28 offsets117..118, freeze:

- receiver offset117, line6, immediately preceding the known line7 receiver;
- key `[23,6]`;
- same subtraction direction;
- same exact authenticated two-rune source-word success criterion;
- no sign, swap, phase, or receiver alternatives.

Pretarget commit:

`354a9d705095e4d8e57645f4770c0ee3298ab67f`.

Reveal:

```text
ciphertext  [23,8]
key         [23,6]
output      [0,2]  = FTH
```

Authenticated two-rune source matches: **0**.

The authenticated 43-word signed-source register's two-rune values are only:

- THE = `[2,18]`;
- IS = `[10,15]`;
- BE = `[17,18]`.

Neither frozen output matches any of them.

## Matched modulus-layout control

The selected THE key also satisfies `22+7=29`, but a full original-layout control rejects that as an independent selector:

- 49 / 604 printed runic lines satisfy `length + ordinal = 29`;
- 11 of those begin with a complete two-rune word;
- p28 itself has two adjacent qualifying lines: line6 `23+6=29` and line7 `22+7=29`.

See `im-results/lp2-p28-line-modulus-control.md`.

## Decision

The p28 THE receiver retains a real page-local retrospective convergence:

`source-derived key [22,7] = [selected line length22, line ordinal7]`.

But the literal reusable rule

`key = [printed line length, printed line ordinal]`

fails on **two prospectively frozen p28 line-start controls**, including the adjacent line6 receiver.

Therefore:

- preserve the line7 equality as retrospective local support only;
- do not promote line geometry to a p28 cipher/KDF;
- do not use `length+ordinal=29` as an independent GP29 selector;
- do not repair either miss with sign reversal, coordinate swap, or receiver exceptions.

This remains compatible with Agent3's narrower #3443 result: source geometry can select the p28 receiver coordinate without supplying the decryption key law.

Reproducer: `sims/lp2_p28_linegeometry_key_transfer_sft.cjs`.
