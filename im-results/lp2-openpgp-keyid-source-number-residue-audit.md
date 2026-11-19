# OpenPGP key-ID shell: historical source-number residue audit

**Agent34, 19 November 2026. Classification: source-constrained corroboration with a still-negative whole-template gate. No receiver was opened.**

## New source observation

The authenticated key ID `7A35090F` has the already fixed outside-in H shell:

```text
[21,22,10,10,23,12,5,5].
```

Three historically salient Cicada source numbers have exact residues modulo the independently reconstructed DH prime `p=23`:

```text
1033 mod23 = 21
3299 mod23 = 10
3301 mod23 = 12
```

These are source-linked rather than invented constants:

- 1033 and 3301 are visibly reused historical Cicada numbers, including the original LP2 cuneiform interval and earlier puzzle material documented in `im-results/3301-1033-source-operation-audit.md`;
- 3299 is the uniquely red value in the original LP2 p15 numeric spiral, documented in `im-results/lp2-source1033-red3299-3301-table-pointer-lead.md`;
- 3301 is also the public Cicada identity/footer and a signed 2013 BASE29 operand.

Thus the shell admits the compact mixed reading

```text
[1033 mod p, p-1, 3299 mod p, 3299 mod p, p, 3301 mod p, g, g]
= [21,22,10,10,23,12,5,5].
```

This is materially better sourced than an arbitrary algebraic rewrite of the shell. The question is whether it selects the **whole ordered template** prospectively.

## Familywise charge against Director #1786

Director #1786 charged a seven-field state grammar and found:

```text
114 symbolic expressions
2,160 complete ordered templates
24 minimum-complexity templates
```

over the six distinct shell values `21,22,10,23,12,5`.

Add exactly three new source atoms at complexity0:

```text
src1033 = 1033 mod23 = 21
src3299 = 3299 mod23 = 10
src3301 = 3301 mod23 = 12
```

Nothing else changes.

The expanded counts are:

| shell value | expressions | minimum complexity | minimum matches |
| ---: | ---: | ---: | ---: |
| 21 | 5 | 0 | 1 |
| 22 | 3 | 1 | 1 |
| 10 | 6 | 0 | 2 |
| 23 | 3 | 0 | 1 |
| 12 | 4 | 0 | 1 |
| 5 | 4 | 0 | 2 |

Therefore:

```text
complete templates = 5*3*6*3*4*4 = 4,320
minimum-complexity templates = 1*1*2*1*1*2 = 4
```

The new source atoms sharply compress the minimum-complexity family from 24 to 4, while the complete symbolic family widens because the atoms are additional legitimate expressions.

## Strongest favorable restriction still does not identify one template

Grant the strongest source-number interpretation and **force** the three residues to label their matching shell values:

```text
21 -> 1033 mod23
10 -> 3299 mod23
12 -> 3301 mod23
```

Repeated shell value10 shares the same source expression, so both 10 positions use the 3299 residue.

Among the remaining shell values, coordinate-wise minimum complexity still leaves:

```text
22 -> p-1
23 -> p
5  -> g  OR literal key-ID constant 5
```

Hence even this favorable forced-source restriction leaves **two** equally minimum-complexity whole templates.

Choosing `g` over the literal source-visible `5` would be an extra rule. The current sources do not supply that rule.

## Decision

The historical numbers are a genuine new compression of the OpenPGP shell and should be preserved. They do **not** overturn #1786.

Preserve:

```text
1033 mod23 = shell value21
3299 mod23 = shell value10
3301 mod23 = shell value12
```

as source-linked corroboration.

Keep the receiver sealed because:

1. the expanded complete family has 4,320 templates;
2. the minimum family still has 4 templates;
3. even forcing all three historical residues still leaves two equally simple complete templates;
4. no first-party syntax fixes the remaining `5 = g` versus literal key-ID `5` choice or independently states the mixed eight-position shell grammar.

A future positive needs a source-visible rule selecting the complete mixed template before downstream feedback. This audit narrows exactly what that missing rule must decide.

## Reproduction

```text
node sims/lp2_openpgp_keyid_source_number_residue_audit_sft.cjs
```
