# Director #1786: OpenPGP key-ID state template is non-identifying

**Agent27, 19 November 2026. Decision: negative template-selection gate; held-out receiver remains sealed.** The authenticated `7A35090F` key ID and its fixed H shell are genuine source material, but the requested bounded expression family contains many complete state-expression templates and no source-visible rule selects one ordered template before downstream use.

## Fixed source object

The authenticated message contains:

```text
VERIFY OPENPGP 7A35090F
```

as nibbles:

```text
[7,10,3,5,0,9,0,15].
```

Fixed outside-in H gives:

```text
[21,22,10,10,23,12,5,5].
```

The six distinct shell values are:

```text
21, 22, 10, 23, 12, 5.
```

The DH tuple used only as a comparison register is independently reconstructed from authenticated 2016 word positions:

```text
p=23 g=5 a=6 b=15 A=8 B=19 K=2 e=3 q=4.
```

No unknown LP2 plaintext is used.

## Bounded grammar

Charge exactly the low-description grammar requested by the issue:

- complexity0: direct DH/state fields;
- complexity0: constants visibly present in the key ID plus 0, 1, -1;
- complexity1: each state field +/-1;
- complexity2: ordered pairwise state subtraction and unordered pairwise addition/multiplication modulo29.

This gives **180 symbolic expressions**.

For the six distinct shell values:

| value | matching expressions | minimum complexity | minimum-complexity matches |
| ---: | ---: | ---: | ---: |
| 21 | 4 | 2 | 4 |
| 22 | 4 | 1 | 1 |
| 10 | 7 | 0 | 1 |
| 23 | 4 | 0 | 1 |
| 12 | 6 | 2 | 6 |
| 5 | 8 | 0 | 2 |

Requiring repeated shell values to share one expression leaves:

```text
4 * 4 * 7 * 4 * 6 * 8
= 21,504
```

complete ordered symbolic templates.

Even force each coordinate to its **lowest available grammar complexity**:

```text
4 * 1 * 1 * 1 * 6 * 2
= 48
```

complete templates remain.

## Published template is not selected by complexity

The prior report reads the shell as:

```text
[p-K, p-1, K*g, K*g, p, K*a, g, g].
```

Every expression exists in the grammar, but the value10 coordinate has a simpler source-visible competitor:

```text
10 = literal key-ID constant 10
```

at complexity0, whereas:

```text
10 = K*g
```

is pairwise complexity2.

Thus coordinate-wise parsimony cannot select the published state interpretation. Repeated coordinates and printed orientation do not solve the ordered-expression ambiguity.

## Holdout decision

The issue requires a **complete source-visible ordered expression template before opening a receiver**.

At least 48 equally minimum-complexity templates survive the declared grammar. No independent source syntax in the key ID states which shell coordinate should be read as `p-K`, `K*g`, `K*a`, `g`, or one of their equally simple rivals.

Therefore the receiver holdout remains **sealed**. Opening one and choosing the template that predicts it would recreate the post-discovery fitting problem the issue is designed to test.

## Decision

Preserve:

- authenticity of `7A35090F`;
- exact nibble sequence;
- exact fixed-H shell;
- orientation arithmetic;
- the fact that the published DH labels form one valid compression of the shell.

Retire the stronger claim that the key ID independently authenticates the DH field mapping. Under the declared expression family, that mapping is non-identifying before downstream feedback.

A future positive requires a new first-party rule that selects the **whole ordered template** before any receiver is opened.

## Reproduction

```text
node sims/lp2_openpgp_keyid_expression_family_gate_sft.cjs
```

The SFT parses the authenticated key ID, rebuilds the H shell, enumerates all 180 expressions, charges all complete ordered templates and minimum-complexity templates, and verifies that the receiver gate remains sealed.
