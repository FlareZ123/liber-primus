# P33/P40 conditioned H-shell residue and HERE-independent PATHS inverse

**Agent2, 19 November 2026. Classification: selective cross-page mechanism evidence after conditioning on the actual source-state selector. The p40 PATHS inverse is independent of HERE. The previously emphasized `[x,A,y,-y]` skeleton contained one automatic relation; after removing that relation, p33 WILL and p40 PATHS remain the only hits in the full charged four-rune source-state matrix. Field-role interpretation remains retrospective.**

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
H(key) = [14,8,3,26] = [-b,A,e,-e]
```

Because `e=3`, `-e mod29=26`. The earlier label `HERE[p]=26` was unnecessary. The p40 inverse therefore survives the negative HERE-continuation result.

## Algebraic conditioning

For a four-rune subtraction key

```text
k = cipher - target mod29
```

an exact GP0 state match means the cipher and target sums are equal, so:

```text
k0+k1+k2+k3 = 0 mod29
```

With canonical four-rune H

```text
H(k) = [k0-k3, k1-k2, k1+k2, k0+k3]
```

the last two coordinates obey

```text
H2 + H3 = sum(k) = 0
=> H3 = -H2 mod29
```

Therefore the `y,-y` half of the earlier `[x,A,y,-y]` description is automatic after the receiver has already been selected by exact GP0. It cannot be counted as independent shell evidence.

The non-automatic common residue is:

```text
H0 ∈ ±{p,g,a,b,A,B,K,e,q}
H1 = A = 8
H2 ∈ {p,g,a,b,A,B,K,e,q}
```

## Full conditioned 43×43 control

Charge the actual selection family instead of only p33 and p40.

For every authenticated signed source word and every physical page p0..p42:

1. restrict to four-rune source targets;
2. require exactly one complete four-rune page word with the target's exact GP0;
3. form the subtraction key from that unique receiver;
4. apply H;
5. ignore `H3=-H2`, because it is forced by GP0 equality;
6. score only the three non-automatic conditions above.

There are **62** unique four-rune source-state page/target pairs in this matrix.

Exactly **two** satisfy all three non-automatic H conditions:

```text
p33 / signed33 WILL  / start132
H(key) = [23,8,2,27]

p40 / signed40 PATHS / start71
H(key) = [14,8,3,26]
```

Both are identity page/index pairings. No non-identity member of the 62-pair charged family satisfies the residual criterion.

This is the correct familywise evidence for the shared H structure. It is stronger than the earlier two-page 144-shell count because it conditions on the same state-selection step that produced the receivers and removes the algebraically automatic coordinate relation.

## Canonical same-index census

Printed `/` line breaks and whitespace are typographic wraps and do not terminate a word. Under that canonical segmentation, same-index source-state hits occur at:

```text
6, 11, 21, 33, 34, 38, 40
```

P33 WILL and p40 PATHS are the only four-rune identity cases. This prevents using another same-index four-rune page as an untouched transfer without an additional source selector.

A temporary p36 GOOD experiment was invalidated because an experimental parser incorrectly split a printed line wrap into a word boundary. The apparent p36 four-rune fragment is part of a longer printed word and supplies no GOOD receiver.

## Source-visible pairing

The p33/p40 relationship also has source/layout support that does not use their inverse keys.

Across the complete ink annotations, the only exact two-word red spans with printed word lengths `[e,g]=[3,5]` are:

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

It contains exactly `A=8` words and the endpoint rise is `g+K=7`.

These observations support treating p33 and p40 as a related pair. They do not fix the particular state labels assigned to H0 and H2 before the inverses are known.

## P50 register downstream page-direction hypothesis: rejected

A tempting two-anchor extension applies the already conditionally authenticated p57 register to the p33/p40 local inverse words, then interprets the quotient as Latin-letter count and the remainder as a forward page displacement:

| Receiver | GP0 address | Authored p50 byte | divmod29 | Latin letters | Proposed destination |
| --- | ---: | ---: | ---: | ---: | ---: |
| p33 WILL | 57 | 118 | [4,2] | 4 | p35 |
| p40 PATHS | 54 | 156 | [5,11] | 5 | p51 |

The apparent p33 alignment is attractive because p33+2=p35 is already the independently recovered RISE→FOUND handoff. But this is not an independent confirmation: the proposed output type was inferred after seeing that handoff, and p40+11 merely lands on the final page of the numeric table.

The decisive control applies the same fixed GP0→p50→divmod29 map to all 43 words of the authenticated 2016 signed message and asks whether quotient equals the source word's Latin-letter count. The authored table order yields 10 hits: THE (six occurrences), EPIPHANY, WILL, LUCK and PATHS. All ten proposed destinations happen to lie within p0–p55. However, across all 256 cyclic rotations of the same 256-cell table, the authored order has 10 hits while shift144 has 14 (the unique maximum); shift4 has 13. The authored ordering is therefore not selected by this predicate. Repeated THE occurrences account for most of the canonical hits.

Reject the proposed quotient=Latin-length / remainder=page-displacement interpretation. Preserve the raw table lookups [4,2] and [5,11] as arithmetic observations only. The p33→p35 route remains supported by its independent red RISE and FOUND evidence; do not count the p50 lookup as a second confirmation. This test does not weaken the p57 serialization result at its original solved-p57 scope, but it supplies no unknown-page key, typed page pointer, or new plaintext.

Reproducer: sims/lp2_2016_source_word_p50_register_rotation_control_sft.cjs.

## Evidence boundary

Preserve:

```text
p33 WILL  H(key)=[23,8,2,27]=[p,A,K,-K]
p40 PATHS H(key)=[14,8,3,26]=[-b,A,e,-e]
```

The correct shared evidence is the conditioned residual criterion over **62** unique four-rune source-state page/target pairs, with exactly those two hits.

The field-role labels `p,K,-b,e` were recognized after the local inverses. A decisive next promotion requires a first-party rule fixing the free H coordinates before another receiver is opened, or a genuinely prospective application in a different source-selected receiver family.

## Reproduction

- Conditioned full-matrix SFT: `sims/lp2_hshell_state_conditioned_crosspair_sft.cjs`
- Canonical same-index audit: `sims/lp2_sameindex_hshell_state_conditioned_sft.cjs`
- P33/p40 paired-page audit: `sims/lp2_p33_p40_shared_shell_sft.cjs`
- Corrected p40 inverse SFT: `sims/lp2_p40_paths_index40_local_inverse_sft.cjs`
- Direct repository calculation of the locked full-matrix script: **62 charged pairs, 2 residual hits, WILL33 and PATHS40 only**.
