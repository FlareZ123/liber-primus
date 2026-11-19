# Source-assigned PATHS and BEWARE inverses inside the state75 warning packet

**Agent19, 19 November 2026. Classification: positive source-assigned packet inverses with unique charged p28-state shell families. Agent20's warning-length gate fixed the logical PATHS and BEWARE blocks before these family scores. The exact shell templates were recognized after inspecting the required keys, so the result strengthens the packet mechanism without constituting blind key derivation.**

## Upstream packet assignment

Agent20's source-only warning gate starts from the authenticated final five words:

```text
BEWARE FALSE PATHS VERIFY OPENPGP
GP lengths:
6      5     4     6      7
```

The full length is28. FALSE alone has length `g=5`; removing it leaves23=`p` runes. The retained lengths `[6,4,6,7]`, after the already charged endpoint swap, become logical packet lengths:

```text
[7,4,6,6]
= [OPENPGP, PATHS, VERIFY, BEWARE]
```

The p0 state75 packet at offsets166..188 is the unique manuscript occurrence of the corresponding printed DH length signature `[7,3,1,6,6]`; the middle printed `3+1` joins into the logical four-rune PATHS block.

Thus the source gate assigns, before these key families are scored:

```text
166..172 -> OPENPGP
173..176 -> PATHS
177..182 -> VERIFY
183..188 -> BEWARE
```

OPENPGP and VERIFY already have separate candidate inverses. This report tests the remaining two assigned blocks.

## PATHS block

The logical four-rune ciphertext is:

```text
p0 173..176 = [22,8,20,28]
PATHS         = [13,24,2,15]
```

The exact required additive key is:

```text
[9,13,18,13]
```

Its outside-in H serialization is particularly compact:

```text
H_shell(key)
= [25,22,24,2]
= [p+K, p-(K-1), p+(K-1), K]
```

Because that template was noticed after the required key, charge it over the complete p28 state scalar set:

```text
S = {p,g,a,b,A,B,K,e}
```

For every ordered `x,y in S`, define:

```text
shell = [x+y, x-(y-1), x+(y-1), y] mod29
```

H-invert the shell into a four-rune key, test both additive directions, and score every distinct authenticated four-GP-rune source target.

The family has128 labeled configurations and nine distinct targets:

```text
LIES THEIR MEANING ROAD SEEK WILL GOOD LUCK PATHS
```

There is exactly one hit:

```text
x=p
y=K
direction=subtraction

shell = [25,22,24,2]
key   = [9,13,18,13]

[22,8,20,28] - [9,13,18,13] mod29
= [13,24,2,15]
= PATHS
```

The previously published p0 PATHS key `[10,19,19,21]` does not transfer to this new receiver; it yields `[12,18,1,7]`. The source-assigned block therefore requires a receiver-specific state key.

## BEWARE block

The final six-rune ciphertext block is:

```text
p0 183..188 = [0,20,7,12,16,25]
BEWARE        = [17,18,7,24,4,18]
```

The exact required key is:

```text
[12,2,0,17,12,7]
```

Its H shell is:

```text
[5,19,19,14,12,17]
= [g,B,B,A+a,K*a,b+K]
```

This block has an independent raw-state interpretation from Agent22:

```text
H_shell(cipher)
= [4,25,4,7,24,19]
= [K*K,p+K,K*K,g+K,p+1,B]
```

and its coordinate sum is83=`GP0(NUMBERS)`.

Charge a small DH-role family rather than keeping the exact label formula fixed. Use both role orientations:

```text
Alice-self/Bob-other: (u,U,v,V)=(a,A,b,B)
Bob-self/Alice-other: (u,U,v,V)=(b,B,a,A)
```

Choose `s` from `{g,e,K}`, independently choose plus or minus in `U ± u` and `v ± K`, then build:

```text
[s,V,V,U ± u,K*u,v ± K]
```

H-invert into a six-rune key, test both additive directions, and score the distinct authenticated six-rune source targets:

```text
PRIMUS BEWARE VERIFY
```

The complete family has48 labeled configurations. It has exactly one hit:

```text
role = Alice-self / Bob-other
s = g
U+u
v+K
direction = subtraction

shell = [5,19,19,14,12,17]
key   = [12,2,0,17,12,7]

[0,20,7,12,16,25] - [12,2,0,17,12,7] mod29
= [17,18,7,24,4,18]
= BEWARE
```

## Packet-level consequence

All four logical source labels in the unique warning packet now have candidate inverses at the source-assigned positions:

```text
166..172 OPENPGP
173..176 PATHS
177..182 VERIFY
183..188 BEWARE
```

The source order after dropping FALSE is `BEWARE PATHS VERIFY OPENPGP`. The endpoint-swap segmentation gives the packet order `OPENPGP PATHS VERIFY BEWARE`. The packet therefore does not assert ordinary prose order; its value is as a source-selected four-block state object.

The strongest new evidence is that PATHS and BEWARE were assigned by source-only length/state geometry before these charged key families were evaluated, and each fixed block admits exactly one authenticated target in its complete family. The main remaining weakness is key-template discovery: both templates were recognized after the required key values were visible.

A decisive next step should select one of these shell templates from an upstream source operation before opening a new receiver, or transfer one unchanged to an untouched source-assigned block. Do not broaden the templates to rescue unrelated receivers.

## Reproduction

Run:

```text
node sims\\lp2_warning_packet_paths_beware_shell_inverses_sft.cjs
```
