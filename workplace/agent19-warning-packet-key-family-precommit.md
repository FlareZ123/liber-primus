# Agent19 precommit: charged DH-shell families for source-assigned PATHS / BEWARE blocks

**Frozen before scoring these families against authenticated target vocabularies.**

Upstream source-only assignment is already committed by Agent20:

```text
warning source: BEWARE FALSE PATHS VERIFY OPENPGP
drop FALSE length g=5
logical packet lengths after endpoint swap:
OPENPGP(7), PATHS(4), VERIFY(6), BEWARE(6)

p0 state75 packet:
166..172 len7
173..176 logical len4 (printed 3+1)
177..182 len6
183..188 len6
```

OPENPGP and VERIFY already have separate candidate inverses. This precommit charges two post-assignment key-shell templates for the remaining blocks. The compact formulas motivating the templates were noticed after the target assignment, so even a positive result is mechanism compression rather than blind plaintext proof.

## PATHS family

Fixed ciphertext block:

```text
p0 173..176 = [22,8,20,28]
```

State scalar labels:

```text
S = {p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3}
```

For every ordered `x,y in S`, build the four-coordinate H-key shell

```text
[x+y, x-(y-1), x+(y-1), y] mod29
```

H-invert the two shell pairs into a four-rune linear key. Test both additive directions on the fixed block and score every distinct four-GP-rune word in the authenticated 2016 carrier.

Complete family size: `8 * 8 * 2 = 128` labeled cipher configurations.

The compact candidate already observed is `x=p,y=K`, whose shell is `[25,22,24,2]` and whose linear key is `[9,13,18,13]`.

Positive gate: the complete charged family has one distinct numeric operation/target hit and it is PATHS under `x=p,y=K`, subtraction. Multiple targets, a cheaper rival, or no hit prevents promotion.

## BEWARE family

Fixed ciphertext block:

```text
p0 183..188 = [0,20,7,12,16,25]
```

Use the two standard DH role orientations:

```text
Alice-self/Bob-other: (u,U,v,V)=(a,A,b,B)
Bob-self/Alice-other: (u,U,v,V)=(b,B,a,A)
```

Choose `s in {g,e,K}`. Independently choose plus or minus in the two role sums. Build

```text
[s, V, V, U ± u, K*u, v ± K] mod29
```

H-invert the three shell pairs into a six-rune linear key. Test both additive directions on the fixed block and score every distinct six-GP-rune authenticated 2016 word.

Complete family size: `2 role orientations * 3 s choices * 2 * 2 sum signs * 2 cipher signs = 48` labeled configurations.

The compact candidate already observed is Alice-self/Bob-other, `s=g`, both plus signs, whose shell is `[5,19,19,14,12,17]` and whose linear key is `[12,2,0,17,12,7]`.

Positive gate: the complete family has one distinct numeric operation/target hit and it is BEWARE under that source-role configuration and subtraction. Otherwise close the template with no widening.

No target-dependent constants, rotations, permutations, phase changes, or extra state expressions may be added after this file is established.


## Outcome

Both complete frozen families have exactly one authenticated-target hit.

### PATHS

```text
configs = 128
distinct authenticated four-rune targets =
LIES THEIR MEANING ROAD SEEK WILL GOOD LUCK PATHS

sole hit:
x=p, y=K, subtraction
H-key shell = [25,22,24,2]
linear key  = [9,13,18,13]

[22,8,20,28] - [9,13,18,13] mod29
= [13,24,2,15]
= PATHS
```

### BEWARE

```text
configs = 48
distinct authenticated six-rune targets =
PRIMUS BEWARE VERIFY

sole hit:
Alice-self / Bob-other
s=g
U+u
v+K
subtraction
H-key shell = [5,19,19,14,12,17]
linear key  = [12,2,0,17,12,7]

[0,20,7,12,16,25] - [12,2,0,17,12,7] mod29
= [17,18,7,24,4,18]
= BEWARE
```

No family widening was used.

**Classification:** positive source-assigned packet inverses with charged, unique state-shell families. The plaintext block assignments were selected by Agent20's independent source-only warning-length gate before these families were scored. The exact family templates were recognized after inspecting the required keys, so the result is strong mechanism compression and a cross-check of the source segmentation rather than fully blind key derivation.
