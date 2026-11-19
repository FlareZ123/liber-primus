# P33 signed-index WILL candidate has a unique state-selected local inverse

**Agent30, 19 November 2026. Classification: strong local WILL plaintext candidate with an exact reversible inverse. Physical p33 is independently selected upstream; authenticated word33 supplies the target and state before the key shell is interpreted. The H-shell serialization remains retrospective.**

## 1. Two independent routes select p33

The authenticated 2016 source has zero-based:

```text
33 WILL
```

Physical p33 was already selected independently by the p50 state graph:

```text
B = 19
p50[19] = 0X = 33
-> physical p33
```

The source index and the upstream p50 route therefore converge on the same page without using unknown p33 plaintext.

## 2. WILL state selects one receiver

Canonical GP encoding:

```text
WILL = [W,I,L,L]
     = [7,10,20,20]
length = 4
GP0    = 57
```

Among complete canonical words wholly on p33, exactly one has length4 and GP0=57:

```text
p33 offsets132..135
cipher = [3,15,17,22]
       = O S B OE
```

This fixes the local receiver before any key-shell search.

## 3. Exact inverse

For the independently assigned target WILL:

```text
cipher [3,15,17,22]
WILL   [7,10,20,20]

key = cipher - WILL mod29
    = [25,5,26,2]
```

Forward replay:

```text
[7,10,20,20] + [25,5,26,2] mod29
= [3,15,17,22]
```

The canonical four-rune H transform gives:

```text
H([25,5,26,2])
= [23,8,2,27]
= [p,A,K,-K]
```

All four scalar values were already fixed in the p33 state/layout work:

```text
p  = 23
A  = 8
K  = 2
-K = 27
```

The exact ordering `[p,A,K,-K]` was recognized after the WILL target and receiver were assigned, so the serialization is retained as retrospective mechanism compression.

## 4. Page-layout control

Original p33 has two red spans:

```text
start0  length10
start91 length8
```

Their canonical word-length layouts are:

```text
first red title  = [2,8] = [K,A]
second red title = [3,5] = [e,g]
```

The existing p33 layout report also derives `p`, `A+K`, and `-K` from these title/H relations and the surrounding authored units. The new key shell therefore uses the same small scalar register already visible on p33.

Charge a deliberately broad family: every ordered four-tuple drawn from the seven distinct pre-existing p33 layout scalars

```text
{K,A,p,A+K,e,g,-K}
= {2,8,23,10,3,5,27}
```

This gives `7^4 = 2,401` H-shell candidates.

Across:

- all seven complete four-rune words on p33;
- the nine distinct authenticated four-rune source targets `LIES THEIR MEANING ROAD SEEK WILL GOOD LUCK PATHS`;
- both additive directions;

the broad family gives exactly two hits:

```text
p33 start119 -> WILL
shell [p,p,A,K]

p33 start132 -> WILL
shell [p,A,K,-K]
```

Only start132 has the independently selected WILL state `length4, GP0=57`. The state selector resolves the broad shell-family ambiguity before the shell form is used.

## 5. Manuscript-wide fixed-key control

Hold the exact key `[25,5,26,2]` fixed.

Across all 513 complete four-rune words on unknown p0-p55, the same nine authenticated four-rune targets, and both additive directions, exactly one hit remains:

```text
p33 offsets132..135
subtract [25,5,26,2]
-> WILL
```

This makes the exact local inverse manuscript-wide selective.

## 6. Conditioned cross-page H audit with p40 PATHS

P40's exact shell `[14,8,3,26]` is `[-b,A,e,-e]` because `e=3` and `-e=26 mod29`; no HERE state is required.

The earlier shared description

```text
p33 [ p,A,K,-K]
p40 [-b,A,e,-e]
     [ x,A,y,-y]
```

needs one algebraic correction. Exact GP0 equality forces the subtraction key sum to zero. For four-rune H, `H2+H3=sum(key)`, so `H3=-H2` is automatic after state selection. The `y,-y` pair is therefore not independent evidence.

Charge the remaining criterion over the complete 43×43 source-word/page matrix: among all **62** page/target pairs having exactly one complete four-rune receiver with the target GP0, require only

```text
H0 = signed authenticated state value
H1 = A = 8
H2 = authenticated state value
```

Exactly two pairs survive:

```text
p33 / WILL  / start132 -> [23,8,2,27]
p40 / PATHS / start71  -> [14,8,3,26]
```

No non-identity member of the 62-pair family satisfies the criterion. Under canonical word segmentation, p33 WILL and p40 PATHS are also the only four-rune same-index state cases.

The source still pairs the pages independently: p33 start91 and p40 start0 are the only exact two-word red spans with `[e,g]=[3,5]` word lengths, while signed indices33..40 comprise `A=8` words with endpoint rise `g+K=7`.

This is selective cross-page evidence after conditioning on the actual receiver selection. The free H-coordinate role labels remain retrospective, so a prospective different-family receiver or first-party coordinate selector remains the promotion gate.

See `im-results/lp2-p33-p40-shared-shell-pair.md` and `sims/lp2_hshell_state_conditioned_crosspair_sft.cjs`.

## 7. Evidence boundary

Preserve:

```text
p33[132..135] = [3,15,17,22]
key           = [25,5,26,2]
subtract
-> WILL [7,10,20,20]
```

The strongest causal sequence is:

```text
B=19 -> p50[19]=33
and signed word33=WILL
-> physical p33
-> unique p33 length4 / GP0=57 receiver132..135
-> exact WILL inverse
```

The H-shell `[p,A,K,-K]` is compact and page-local. After conditioning on GP0 selection, its non-automatic H residue is one of only two hits among 62 charged four-rune source-state page/target pairs, the other being p40 PATHS. The coordinate-role interpretation was learned after the targets were assigned, so a first-party selector for those roles or a prospective transfer in a different receiver family would materially strengthen the cipher-mechanism claim.

## Reproduction

Run:

`node sims/lp2_p33_will_index33_local_inverse_sft.cjs`

The SFT verifies the upstream page selector, authenticated WILL state, unique p33 receiver, exact inverse, p33 layout-scalar family, and manuscript-wide exact-key control.

Windows Node22 verification: generic read-only SFT run `44456442823` passed, including the 513-word manuscript-wide fixed-key control.
