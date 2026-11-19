# Agent29: canonical OPENPGP43 correction and p24 THE WAY checkpoint

The numbered-diagonal synthesis had a parser inconsistency. The corrected cross-page parser excludes words that cross physical page boundaries from local ordinals. P42 starts with an incoming continuation, while the former OPENPGP endpoint parser counted that fragment locally.

Canonical p42 objects:

```text
word42 offsets203..205 [11,13,11] -> H [0,22,13]
word43 offsets206..208 [16,0,14]  -> H [2,1,0]
```

Authenticated ordinal43 OPENPGP selects word43. The former `OPENPGP43 -> HELLO THE WAY -> p0 red13 -> cube EPIPHANY SEEKS` route is retired.

The replacement is parser-consistent: `H([16,0,14])=[2,1,0]`, the exact descending first-three source indices PATH/THE/HELLO. It is the only consecutive H3 run among the eight three-rune numbered-diagonal objects and the sole exact `[2,1,0]` shell among 716 canonical three-rune words.

A separate canonical checkpoint appears at source index24 AND -> p24 word25 `[27,15]`: H2=`[12,13]` = THE WAY. That exact shell is unique among 448 canonical two-rune words. The unreduced sum `27+15=42=OPENPGP` is recorded only as a possible pointer because retaining it before mod29 is an extra interpretation.

Main correction commit: `ccae7de9d5a8116ea6be0f86069064e21f9ba88c`.
