# Signed-2016 word numbers + p50 cells generate the p33/p38/p40 key shells

**Agent14, 19 November 2026; page-transfer update by Agent20, 24 November 2026. Classification: three selective local inverses; page-wide transfer rejected.** The authenticated signed-2016 word numbers, original p50 table cells, the unique p33/p40 red `[3,5]` spans, and the already fixed p28 literal-DH lookup now generate the exact additive key shells for candidate **WILL** on p33, **BEWARE** on p38, and **PATHS** on p40. The source-cell recipes were recognized after the local candidates and keys were known, so this is a substantial reduction in key-role freedom rather than a blind plaintext recovery. A complete charged-family SFT shows that the exact constructions are highly selective.

## Fixed source objects

Use the authenticated zero-based signed-message corridor:

```text
33 WILL
34 BE
35 FOUND
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
41 VERIFY
42 OPENPGP
```

Decode each p50 two-character token to its 0..255 byte, then write the byte uniquely as

```text
byte = 29 * hi + lo
0 <= lo < 29.
```

The source-numbered cells needed here are:

```text
p50[33] = 1s = 114 = 29*3 + 27 -> [3,27] = [e,-K]
p50[34] = 3H = 197 = 29*6 + 23 -> [6,23] = [a,p]

p50[38] = 2D = 133 = 29*4 + 17 -> [4,17] = [q,b+K]
p50[39] = 05 =   5 = 29*0 +  5 -> [0,5]  = [0,g]
p50[40] = 1K =  80 = 29*2 + 22 -> [2,22] = [K,p-1].
```

The visible red-span geometry independently contributes a shared H coordinate. Across the original ink annotations, the only exact two-complete-word red spans with word lengths `[3,5]` are:

```text
p33 start91 length8 -> [3,5]
p40 start0  length8 -> [3,5].
```

Their canonical pair H is:

```text
H(3,5) = [3-5,3+5] = [27,8] = [-K,A].
```

Thus `A=8` is source-visible on the two pages before using either four-rune inverse.

The independently fixed p28 literal-DH line supplies:

```text
p = 23
DH[p] = 20
```

from its physical length and one-based position p.

## WILL BE -> exact p33 WILL shell

For a signed source pair `i,i+1`, define the four-rune source-cell shell

```text
W(i) = [lo(i+1), A, -lo(i), lo(i)] mod29.
```

At `i=33`, the source pair is literally `WILL BE`:

```text
lo(33) = -K = 27
lo(34) =  p = 23

W(33)
= [p,A,K,-K]
= [23,8,2,27].
```

Canonical four-rune H inversion gives:

```text
key = [25,5,26,2].
```

Apply subtraction to the independently state-selected original receiver:

```text
p33 offsets132..135
cipher [3,15,17,22]
-
key    [25,5,26,2]
=
[7,10,20,20]
=
WILL.
```

This reproduces the previously published local p33 key exactly, now from signed word numbers and p50 cells instead of assigning `p,A,K,-K` after seeing the inverse.

### Full charged WILL-BE family

Freeze the recipe above and charge:

- all 42 consecutive signed-source pairs;
- all 509 complete four-rune unknown-page words;
- both additive signs;
- all nine distinct authenticated four-rune signed targets.

That is:

```text
42 * 509 * 2 * 9 = 384,804 configurations.
```

There is exactly **one** authenticated hit in the full family:

```text
source pair WILL BE at33
p33 offsets132..135
subtraction
-> WILL.
```

No other source pair, receiver, sign, or authenticated four-rune target hits.

## BEWARE FALSE PATHS -> shared p38/p40 source state

For a signed source triple `i,i+1,i+2`, write its p50 cells as `T_j=[hi(j),lo(j)]` and define:

```text
peer(i) = lo(i)   - hi(i+2)
step(i) = lo(i+1) - hi(i+2)
```

At `i=38`:

```text
BEWARE  T38 = [4,17]
FALSE   T39 = [0, 5]
PATHS   T40 = [2,22]

peer = 17 - 2 = 15 = b
step =  5 - 2 =  3 = e.
```

The words `BEWARE FALSE PATHS` therefore reconstruct two independently fixed DH fields, `b` and `e`, directly from their own numbered p50 cells.

## The same warning triple generates p40 PATHS

Define the four-rune warning-path shell:

```text
P(i) = [-peer(i), A, step(i), -step(i)].
```

At the literal warning triple:

```text
P(38)
= [-b,A,e,-e]
= [14,8,3,26].
```

H inversion gives the exact published p40 key:

```text
key = [20,20,12,6].
```

Original replay:

```text
p40 offsets71..74
cipher [4,15,14,21]
-
key    [20,20,12,6]
=
[13,24,2,15]
=
PATHS.
```

### Full charged warning-path family

Charge:

- all 41 consecutive signed-source triples;
- all 509 complete four-rune unknown words;
- both signs;
- all nine distinct authenticated four-rune signed targets.

That is **375,642 configurations**.

There are two exact authenticated hits:

```text
triple27 ARE THE DIRECTION
p34 start227
-> GOOD
(non-identity: page34, target index36)

triple38 BEWARE FALSE PATHS
p40 start71
-> PATHS
(identity: page40, target index40).
```

Thus p40 PATHS is the **only page/index identity hit** of the charged family. The p34/GOOD hit has no independent receiver selector here and is retained only as a family control; it is not promoted as plaintext.

## The warning triple also generates the p38 BEWARE key

Use the same `peer(i)` plus the already independently fixed p28 literal-DH fields. Under the established six-rune pair-interleaved H-shell order `[d0,s0,d1,s1,d2,s2]`, define:

```text
B(i) = [
  hi(i+2) - peer(i),
  -lo(i+1),
  p,
  DH[p],
  hi(i+1),
  -peer(i)
] mod29.
```

For `BEWARE FALSE PATHS`:

```text
B(38)
= [K-b,-g,p,DH[p],0,-b]
= [16,24,23,20,0,14].
```

This is exactly the previously published p38 BEWARE key shell. H inversion gives:

```text
key = [20,7,7,7,13,4].
```

Apply it to the receiver independently selected by the visible numbered-section start and the fixed LUCK->BEWARE predecessor-state relation:

```text
p38 offsets57..62
cipher [8,25,14,2,17,22]
-
key    [20,7,7,7,13,4]
=
[17,18,7,24,4,18]
=
BEWARE.
```

The key is therefore generated from:

1. authenticated source word numbers38/39/40;
2. their original p50 cells;
3. the already fixed p28 `p,DH[p]` lookup.

No free peer-field choice or HERE/DH-line choice remains inside this exact construction.

### Full charged warning-BEWARE family

Freeze `B(i)` and charge:

- all 41 consecutive signed-source triples;
- all 251 complete six-rune unknown-page words;
- both signs;
- all three distinct authenticated six-rune signed targets `PRIMUS / BEWARE / VERIFY`.

That is:

```text
41 * 251 * 2 * 3 = 61,746 configurations.
```

There is exactly **one** hit in the entire family, even before requiring page/index identity:

```text
triple38 BEWARE FALSE PATHS
p38 offsets57..62
subtraction
-> BEWARE.
```

## What changed

The earlier local reports correctly described the p33, p38 and p40 state labels as having been recognized after their plaintext candidates. The new result removes much of that label freedom:

```text
WILL BE
+ p50[33],p50[34]
+ red [3,5]
-> exact p33 WILL key shell

BEWARE FALSE PATHS
+ p50[38],p50[39],p50[40]
+ red [3,5]
+ p28 p,DH[p]
-> exact p40 PATHS key shell
-> exact p38 BEWARE key shell.
```

This is a coherent, human-readable use of the authenticated instruction that words are the map and their numbers supply direction: the signed words choose the table cells, and those cells supply the GP29 key-state coordinates.

The remaining evidence boundary matters. The algebraic recipes `W(i)`, `P(i)`, and `B(i)` were recognized after the three local plaintext candidates were already known. The page-level transfer test now also rejects reusing each fixed key across the other same-length words on its target page. Their full charged-family specificity is strong mechanism evidence, but it is not a blind original-cipher prediction or a reusable page cipher. Promotion to established plaintext still requires a prospective consequence on an independently unopened receiver or a prior first-party instruction that fixes these exact coordinate combinations.

## Page-level transfer check

The three recovered keys were tested prospectively as word-reset keys against every complete word of matching GP29 length on their respective target pages. The established F-transparent convention is retained: an F symbol is passed through without advancing the word key.

| Fixed local key | Same-length words on page | Observed trigram score | Minimum of 2,000 native controls | Native median | Native 95th percentile |
|---|---:|---:|---:|---:|---:|
| WILL / p33, `[25,5,26,2]` | 7 | -12.7132 | -8.2969 | -6.6385 | -5.9887 |
| PATHS / p40, `[20,20,12,6]` | 15 | -13.5208 | -7.7307 | -6.6705 | -6.1949 |
| BEWARE / p38, `[20,7,7,7,13,4]` | 5 | -11.3247 | -8.7859 | -7.3112 | -6.7680 |

Scores are mean GP29 trigram log probabilities using `resources/control/shakespeare_first300k.txt`; each native sample preserves the page's number of words and GP29 word length. All three observed scores fall below the minimum native sample (empirical percentile 0/2,000). Each intended crib still decrypts exactly, but the other same-length words do not form readable English.

This rejects the page-wide word-length-key interpretation, not the three exact local inverses. Reproduction: [`sims/lp2_signed2016_p50_page_transfer_sft.cjs`](../sims/lp2_signed2016_p50_page_transfer_sft.cjs).

## Reproduction

- SFT: `sims/lp2_signed2016_p50_source_shell_generator_sft.cjs`
- Successful Windows CI: `44462082908`
- Existing receiver reports:
  - `im-results/lp2-p33-p40-shared-shell-pair.md`
  - `im-results/lp2-p38-section5-beware-state-holdout.md`
