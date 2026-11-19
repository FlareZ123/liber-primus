# P33/P40 shared H-shell skeleton and HERE-independent PATHS inverse

**Agent2, 19 November 2026. Classification: strong cross-page mechanism compression, still retrospective at the field-role level. The p40 PATHS inverse no longer depends on the failed HERE continuation. P33 WILL and p40 PATHS are the only hits in a shared bounded shell family on the two source-paired pages.**

## Exact local inverses

Authenticated signed word33 is WILL. Physical p33 is independently selected by `B=19 -> p50[19]=33`, and its unique complete four-rune word with WILL's state `(length4, GP0=57)` is offsets132..135:

```text
cipher = [3,15,17,22]
WILL   = [7,10,20,20]
key    = [25,5,26,2]
H(key) = [23,8,2,27] = [p,A,K,-K]
```

Authenticated signed word40 is PATHS. Physical p40 has one complete four-rune word with PATHS's state `(length4, GP0=54)`, offsets71..74:

```text
cipher = [4,15,14,21]
PATHS  = [13,24,2,15]
key    = [20,20,12,6]
H(key) = [14,8,3,26]
```

The last p40 coordinate had previously been written `HERE[p]=26`. That dependency is unnecessary:

```text
e = 3
-e mod29 = 26

H(key_p40) = [-b,A,e,-e]
             [14,8,3,26]
```

Thus the p40 local inverse is independent of HERE.

## Shared shell

Both exact shells have the same form:

```text
p33: [ p,A,K,-K]
p40: [-b,A,e,-e]

common skeleton: [x,A,y,-y]
```

Charge the bounded family without choosing a separate expression per coordinate:

- `x`: either sign of one authenticated state value from `{p,g,a,b,A,B,K,e,q}`, collapsing duplicate numeric values;
- second coordinate: fixed `A=8`;
- `y`: one authenticated state value;
- fourth coordinate: forced `-y mod29`.

There are 16 distinct x values and 9 y values, hence **144 shells**.

Apply all 144 shells to every complete four-rune word on p33 and p40, all nine distinct authenticated four-rune signed targets `LIES, THEIR, MEANING, ROAD, SEEK, WILL, GOOD, LUCK, PATHS`, and both additive directions.

Exactly two hits survive:

```text
p33 start132 -> WILL   subtract -> [ p,A,K,-K]
p40 start71  -> PATHS  subtract -> [-b,A,e,-e]
```

No other p33/p40 four-rune word, authenticated target, or direction is admitted by the shared family.

## Source-visible pairing of p33 and p40

The same two pages are paired before the four-rune inverse family is considered.

Across the complete ink annotations, the only exact two-word red spans whose printed word lengths are `[e,g]=[3,5]` are:

```text
p33 start91 length8 -> [3,5]
p40 start0  length8 -> [3,5]
```

The authenticated source interval from word33 through word40 is:

```text
33 WILL
34 BE
35 FOUND
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
```

It contains exactly **8=A** words, while the endpoint index rise is **7=g+K**.

These relations make the p33/p40 pairing source-visible rather than a post-hoc choice of arbitrary pages. The assignment of `x` and `y` to the particular endpoint state fields remains retrospective.

## Evidence boundary

Preserve the following:

```text
p33 WILL  shell [ p,A,K,-K]
p40 PATHS shell [-b,A,e,-e]
shared family [x,A,y,-y]
```

The joint 144-shell charge selects only those two local inverses on the source-paired pages. This materially strengthens the case that the two candidates share a mechanism.

The result does not yet establish a reusable decoder for another page. A decisive promotion requires a first-party rule fixing `x` and `y` before a fresh receiver is opened, or a prospective third application selected independently of plaintext.

## Reproduction

- Shared-family SFT: `sims/lp2_p33_p40_shared_shell_sft.cjs`
- Shared-family Windows Node22 PASS: **44457657138**
- Corrected p40 SFT: `sims/lp2_p40_paths_index40_local_inverse_sft.cjs`
- HERE-independent p40 Windows Node22 PASS: **44457839299**
