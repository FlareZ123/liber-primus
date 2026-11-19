# P40 signed-index PATHS candidate has a unique local DH/HERE inverse

**Agent30, 19 November 2026. Classification: strong local PATHS plaintext candidate with an exact reversible inverse. The authenticated source selects the page and target state before the key family is constructed. The compact key-shell template is recognized retrospectively and is charged as a bounded family.**

## 1. Source word40 selects physical p40

The authenticated 2016 message has zero-based:

```text
38 BEWARE
39 FALSE
40 PATHS
```

The companion self-location result shows that authenticated `BEWARE` uniquely satisfies the p50-low predecessor echo and uses its source number38 to select p38.

Continue the same already-active source-number page reading one step further:

```text
PATHS = signed word40
-> physical p40
```

This does not use unknown p40 plaintext.

## 2. P40 has one PATHS-state receiver

Canonical GP encoding gives:

```text
PATHS = [P,A,TH,S] = [13,24,2,15]
length = 4
GP0    = 54
```

Among complete canonical words wholly on physical p40, exactly one has that state:

```text
p40 offsets71..74
cipher = [4,15,14,21]
length = 4
GP0    = 54
```

Thus source index40 plus source word state selects a single p40 receiver before any rune-level key is needed.

There is an important semantic ambiguity:

```text
ROAD  = [4,3,24,23]   length4 GP0=54
PATHS = [13,24,2,15]  length4 GP0=54
```

So length+GP0 alone cannot distinguish `ROAD` from `PATHS`. The authenticated source label at index40 supplies that distinction. This is unusually apt given the source contrast between `the road` and `false paths`.

## 3. Exact local inverse

For the independently assigned PATHS target, the additive subtraction key is:

```text
cipher [4,15,14,21]
PATHS  [13,24,2,15]

key = cipher - PATHS mod29
    = [20,20,12,6]
```

Forward replay is exact:

```text
[13,24,2,15] + [20,20,12,6] mod29
= [4,15,14,21]
```

Apply the canonical four-rune H transform to the key:

```text
H([20,20,12,6])
= [14,8,3,26]
= [-b, A, e, HERE[p]]
```

using the independently fixed p28/HERE/DH state:

```text
b       = 15  -> -b = 14
A       = 8
e       = 3
HERE[p] = 26
```

Thus:

```text
H^-1([-b,A,e,HERE[p]])
= [20,20,12,6]
```

## 4. Retrospective family charge

The shell was recognized after PATHS was source-assigned, so its compactness is not treated as a blind prediction.

Charge the finite family:

```text
[-v, x, y, LINE[p]]
```

where:

- `v` ranges over the seven primary DH fields `{p,g,a,b,A,B,K}`;
- `x,y` independently range over `{p,g,a,b,A,B,K,e,q,0,1}`;
- `LINE` is `HERE` or `DH`;
- both additive directions are tested.

This gives 1,694 key-shell configurations.

Apply the family across:

- all 15 complete four-rune p40 words;
- the nine distinct authenticated signed-message targets whose GP form has four runes:
  `LIES THEIR MEANING ROAD SEEK WILL GOOD LUCK PATHS`;
- both signs.

There is exactly one hit:

```text
p40 start71
target PATHS
subtraction
shell [-b,A,e,HERE[p]]
key [20,20,12,6]
```

No other p40 four-rune word / authenticated target / sign is hit by the charged family.


## 5. Source-visible reconstruction of the shell magnitudes

The compact shell was discovered after the target, so this section is mechanism compression rather than a blind prediction. It nevertheless has a constrained source reading.

The selected signed phrase is:

```text
BEWARE FALSE PATHS
```

Its canonical GP rune lengths are:

```text
BEWARE = 6
FALSE  = 5
PATHS  = 4
total  = 15 = b
```

The phrase contains exactly three words:

```text
word count = 3 = e
```

Physical p40 has one red span at its start whose canonical length is:

```text
red heading length = 8 = A
```

The prior p28 HERE state supplies:

```text
HERE[p] = 26
```

Therefore the four **magnitudes** of the observed H-shell can be reconstructed from source-visible material as:

```text
[b, A, e, HERE[p]]
= [15,8,3,26]
```

The required shell is:

```text
[-b,A,e,HERE[p]]
= [14,8,3,26]
```

The remaining interpretive step is the sign on `b`. The literal middle word `FALSE` and the large red X on p39 make negation a plausible human instruction, but this sign was not frozen before the inverse was known. Preserve that chronology.

### Three-word-window control

Charge all contiguous authenticated three-word windows whose total GP-rune length equals `b=15`. There are five:

```text
5..7   EPIPHANY SEEKS THE       -> endpoint p7
29..31 DIRECTION SEEK AND       -> endpoint p31
37..39 LUCK BEWARE FALSE        -> endpoint p39
38..40 BEWARE FALSE PATHS       -> endpoint p40
39..41 FALSE PATHS VERIFY       -> endpoint p41
```

At those endpoint pages, the red-span lengths are:

```text
p7  -> 14
p31 -> none
p39 -> 3
p40 -> 8 = A
p41 -> none
```

Thus `BEWARE FALSE PATHS` is the only `b`-length three-word window whose endpoint page exposes a red span of length `A`.

This substantially reduces the field-choice freedom behind the shell. It still does not prospectively establish the first-coordinate minus sign or prove that this serialization transfers to another block.

## 6. Manuscript-wide exact-key control

Hold the exact key `[20,20,12,6]` fixed.

Across all **513** complete four-rune words on unknown p0-p55, the same nine authenticated four-rune targets, and both signs, there is exactly one hit:

```text
p40 offsets71..74
subtract [20,20,12,6]
-> PATHS
```

This makes the local inverse manuscript-wide selective even though the shell-template discovery is retrospective.

## 7. Relationship to the signed warning

The three-word source corridor now has two independent state-selected endpoints:

```text
38 BEWARE -> p38 unique BEWARE-state receiver57..62
39 FALSE  -> p39 dominant red X-shaped graphic
40 PATHS  -> p40 unique PATHS/ROAD-state receiver71..74
```

The p40 state is deliberately unable, at the length+GP0 level, to tell ROAD from PATHS. The source word number and meaning resolve that ambiguity toward PATHS, while the signed sentence itself warns `BEWARE FALSE PATHS`.

This is stronger than the earlier botanical-art reading of p40. The branch frame is reused on p41 and p42 and should not be counted as independent evidence.

## 8. Evidence boundary

Preserve p40 offsets71..74 as a strong local PATHS plaintext candidate:

```text
cipher [4,15,14,21]
key    [20,20,12,6]
subtract
-> PATHS [13,24,2,15]
```

The target/page/receiver selection precedes the key-template construction through authenticated index40 and the unique p40 length4/GP0=54 state.

The shell template `[-b,A,e,HERE[p]]` was recognized afterward. Promotion to an established reusable cipher mechanism requires either:

- an independent source-visible rule that selects this exact shell serialization before another receiver is opened; or
- an unchanged transfer of the exact shell/key grammar to a fresh source-assigned block.

## Reproduction

Run:

`node sims/lp2_p40_paths_index40_local_inverse_sft.cjs`

The SFT reconstructs the signed source target, canonical p40 receiver, ROAD/PATHS state collision, exact reversible key, 1,694-case retrospective shell family, and manuscript-wide fixed-key control.

Windows Node22 verification: generic read-only SFT run `44456607530` passed the strengthened source-magnitude controls and all local/global inverse assertions.
