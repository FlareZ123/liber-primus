# P40 signed-index PATHS candidate has a unique local DH inverse

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

Forward replay is exact. Applying the canonical four-rune H transform gives:

```text
H([20,20,12,6]) = [14,8,3,26] = [-b,A,e,-e]
```

Here `b=15`, `A=8`, `e=3`, and `-e=26 mod29`. The previous p28-derived label for the value26 is unnecessary. This local PATHS inverse has no dependency on the p28 HERE marker.

## 4. Conditioned cross-page H control

P33 WILL and p40 PATHS share:

```text
p33 H(key) = [23,8,2,27]
p40 H(key) = [14,8,3,26]
```

The earlier shorthand `[x,A,y,-y]` overstates one degree of evidence. Exact GP0 equality forces `sum(key)=0 mod29`, and canonical four-rune H therefore forces `H3=-H2`. That last-coordinate relation is automatic after the source-state receiver has been selected.

The remaining common criterion is:

```text
H0 = signed authenticated state value
H1 = A = 8
H2 = authenticated state value
```

Across the complete 43×43 source-word/page charge there are **62** pairs with exactly one complete four-rune receiver at the target GP0. Exactly two satisfy this non-automatic H criterion:

```text
p33 start132 -> WILL
p40 start71  -> PATHS
```

No non-identity pair survives. This is the appropriate familywise control for the shared H evidence.

See `im-results/lp2-p33-p40-shared-shell-pair.md` and `sims/lp2_hshell_state_conditioned_crosspair_sft.cjs`.

## 5. Source-visible reconstruction of the shell magnitudes

The selected signed phrase is `BEWARE FALSE PATHS`. Its canonical GP rune lengths total `15=b`, and its word count is `3=e`. Physical p40 has one red span at its start with canonical length `8=A`. Since `-e=26 mod29`, these source values reconstruct the shell magnitudes directly:

```text
[-b,A,e,-e] = [14,8,3,26]
```

The outer negative signs and the serialization were recognized after the inverse. The literal word `FALSE` and the large red X on p39 make negation a plausible human cue, while the chronology remains retrospective.

### Three-word-window control

Charge all contiguous authenticated three-word windows whose total GP-rune length equals `b=15`. There are five:

```text
5..7   EPIPHANY SEEKS THE       -> endpoint p7
29..31 DIRECTION SEEK AND       -> endpoint p31
37..39 LUCK BEWARE FALSE        -> endpoint p39
38..40 BEWARE FALSE PATHS       -> endpoint p40
39..41 FALSE PATHS VERIFY       -> endpoint p41
```

At those endpoint pages, red-span lengths are p7=14, p31=none, p39=3, p40=8=A, p41=none. Thus `BEWARE FALSE PATHS` is the only `b`-length three-word window whose endpoint page exposes a red span of length `A`.

Cross-page typography adds another pairing: across all exact two-word red spans, only p33 start91 and p40 start0 have printed word lengths `[e,g]=[3,5]`. Signed indices33..40 also contain exactly `A=8` words with endpoint rise `g+K=7`.

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

The shell is `[-b,A,e,-e]`. After removing the GP0-forced `H3=-H2` relation, the remaining H-state criterion selects only p33 WILL and p40 PATHS among 62 unique four-rune source-state page/target pairs in the full 43×43 control. The free coordinate-role labels were still recognized after the local inverses.

Promotion to a reusable cipher mechanism requires a first-party rule fixing those roles before another receiver is opened, or a prospective application in a different source-selected receiver family.

## Reproduction

Run:

`node sims/lp2_p40_paths_index40_local_inverse_sft.cjs`

The p40 SFT reconstructs the signed source target, canonical receiver, ROAD/PATHS state collision, exact reversible key, HERE-independent shell, and manuscript-wide fixed-key control. The separate conditioned-matrix SFT charges the shared H residue over all unique four-rune source-state page/target pairs.

Windows Node22 verification: corrected p40 SFT run `44457839299` passed. The earlier paired-page run `44457657138` is superseded for familywise interpretation by `sims/lp2_hshell_state_conditioned_crosspair_sft.cjs`, which conditions out the automatic GP0 relation.
