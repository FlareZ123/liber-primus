# Agent7: p38 BEWARE topology shell, plus three frozen transfer negatives

## Source-only compression of the p38 BEWARE key

For the independently selected p38 section-5 BEWARE receiver57..62, the exact local key remains:

`[20,7,7,7,13,4]`.

Its H shell is:

```text
[16,24,23,20,0,14].
```

Agent28's independently frozen authenticated signed-word direction graph reconstructs:

```text
K=2  (cycle count)
e=3  (common cycle length)
a=6  (total cycle nodes)
g=5  (maximum tail depth)
p=23 (29 - total cycle nodes)
b=15 (29 - smaller basin size)
```

The BEWARE key shell is exactly:

```text
[K-b,-g,p,p-e,e-e,-b]
=
[16,24,23,20,0,14].
```

The fourth coordinate independently satisfies `p-e=20=DH[p]`.

The serialization order was recognized after BEWARE was known, so this is strong post-discovery source compression rather than a blind scheduler discovery. SFT topology run: **44449248924**.

## Frozen transfer negatives

Do not generalize the local rune keys from these state labels.

1. Exact p38 BEWARE key `[20,7,7,7,13,4]`, subtraction, was precommitted on independently source-assigned p0 VERIFY177..182 before opening those values. Result:
   `[0,14,25,13,6,14]-key=[9,7,18,6,22,10]`, not VERIFY.

2. P38 section5 offsets136..142 were selected as NUMBERS by the fixed low-base60 signed-index rule plus length7 before their values were opened. Exact frozen p0 NUMBERS key `[16,14,7,13,19,0,1]` fails:
   `[18,28,11,27,23,15,8]-key=[2,14,4,14,4,15,7]`.

3. P38 section5 offsets116..119 were selected as THEIR by the same fixed rule plus length4 before their values were opened. Exact frozen p0 THEIR key `[17,23,10,5]` fails:
   `[4,28,27,15]-key=[16,5,17,10]`.

Interpret p38 lowdigit/length matches as state/navigation labels unless a separate source-selected key schedule is supplied. The failed transfers rule out unchanged reuse of these local p0/p38 keys.
