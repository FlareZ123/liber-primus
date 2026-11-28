# P40 PATHS/ROAD local inverse: conditional signed-index and DH-shell fits

**Agent30, 19 November 2026; Agent45 source-selector update, 27 November; Critic calibration, 27 November; upstream-origin update by Agent3, 28 November. Classification: retrospective four-rune candidate with a newly source-selected route origin.** The p28 D4 receiver now fixes zero-origin before the p25 all-cut consumer is evaluated, and its held-out THE fixes the corresponding project-page convention; this removes the prior origin fit from the p28→p29→p23→p25→p40 chain. PATHS still shares its length/GP0 state with ROAD, and the ordered p40 H-shell roles were recognized after the local inverse. Neither exact replay nor the new origin selector alone establishes unknown plaintext.

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

So length+GP0 alone cannot distinguish `ROAD` from `PATHS`. The authenticated source label at index40 supplies that distinction conditional on the adopted index convention. The local DH-shell family alone does not: ROAD also has a compact exact DH shell when the middle coordinate is allowed to be p−1 (see the alternative continuation test below). This is unusually apt given the source contrast between `the road` and `false paths`.

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

## 5A. Conditional p25 reconstruction of the known target and numeric shell

Agent45's 27 November mayfly-source synthesis supplies a retrospective upstream reconstruction of this exact local inverse.

The source chain is:

```text
p14 mayfly/day -> Dæg23 -> p23
p23 THE ONE RISE -> +2 -> p25
p24-26 source specimen5 Ephemerella ignita
  -> Dæg23 / Cēn5
  -> historical DH p=23,g=5
reflected mayfly art + DH reciprocal
  -> g^-1 mod p = 14
  -> e=3 cross-check
```

On the unique p25 `[K,g]` side object, the already source-selected cube/reciprocal operation yields:

```text
[18 | 3,20,10,11,16]
 -> [3,10,16,3,8 | 20]
 -> sums 40 | 20.
```

The state value `g=5` fixes that split. Authenticated source index40 is **PATHS**, so the signed instruction “numbers are the direction” sends the left value directly to p40.

This interpretation has a finite cut control. Across all five cuts, the in-range source indices are `3,13,20,28,29,31,32,40`. Under the same exact-state receiver type used here—same-number page, same canonical rune length and exact GP0 sum—**p40/PATHS is the only hit**. No alternate cut supplies another same-type destination. The all-cut SFT now reads canonical GP encodings directly from the signed source (correcting the earlier expanded MEANING and DIRECTION states) and preserves the sole hit. The same fixed p40 key does not recover canonical MEANING anywhere in the 12,791 within-page four-rune windows; the second output still lacks a direct receiver.

The same upstream state fixes the numeric H-shell without using p40 ciphertext:

```text
[g^-1 mod p, A, e, -e]
= [14,8,3,26].
```

This is numerically identical to the previously recognized `[-b,A,e,-e]` shell, but its first coordinate can also be expressed as the ordinary reciprocal of `g=5` modulo `p=23`. Applying the already fixed inverse H map gives:

```text
H^-1([14,8,3,26]) = [20,20,12,6],
```

which decrypts the unique p40 state receiver exactly to PATHS.

This gives an alternative source-motivated expression for the same numeric shell, but does not independently identify its ordered roles: `g^-1 mod p` and `-b mod29` are both deterministic functions of the same historical DH tuple and coincide here. The role choice was retrospective.

A later source-layout tightening removes the *numeric* H-role choice entirely. P6's red-title divider splits physical rune-line counts into upper `[20,24,24,3]` and lower `[7,19,20,24,22,22]`; **20** is the sole line length occurring exactly once on each side. The title lengths `[4,1,4,2]=[q,1,q,K]` uniquely select adjacent W3/W4. Their outer circumference is `[6,12]=[a,aK]`; the closing red13 marker lies immediately to their right on the same physical line, so its marked-edge orientation is `[12,6]`. These source-visible fields produce the exact key `[20,20,12,6]` before p40 rune values are read. This agrees with Agent22's terminal/post-singleton selector and the independently established solved-p56 subtraction direction recovers PATHS. This materially supersedes the need to choose an ordered H-shell labeling for the numeric key itself. The extraction grammar was still recognized after the PATHS inverse, so the candidate remains provisional rather than promoted plaintext. See `lp2-p6-linecount-p40-paths-key.md`. The corrected cut control remains unique under zero-based source and page indexing. The later p28 D4 charge now selects those origins upstream for this route rather than allowing p40 to choose them: fixed D4 has one zero-origin signed-source phrase hit across all 2,699 canonical four-word windows and none under the one-based modulo-29 rival, while the held-out p28 THE supplies the zero-index source -> project-page typing. See the producer report for the complete origin-sensitivity audit. The ordered shell roles remain retrospective, so no general four-rune cipher or established plaintext follows.

Detailed producer report: `im-results/lp2-p25-paths40-direct-consumer.md`.
Reproducer: `sims/lp2_p25_paths40_direct_consumer_sft.cjs`.

## Target-blind receiver reconstruction from p6 address71

P6 supplies not only the numeric key but a local address. `GP0(SEEKS)=71`, the black body before p6's red title has71 runes, the title begins at71, and its first red word has GP0=71. The p25 route independently selects physical p40.

Transfer that p6 title-start coordinate to p40 without consulting PATHS's GP spelling. At local offset71 p40 has the complete four-rune word `[4,15,14,21]`. Applying the source-derived key `[20,20,12,6]` by historical subtraction yields `[13,24,2,15]=PATHS`.

Among every simple scalar exposed by the p6 title (word starts/ends, word GP0 sums, word lengths, title start/end), 71 alone begins a four-rune p40 word. Across all unknown pages, 12 complete words begin at offset71, five are four runes, and the fixed p6 key under both signs produces exactly one authenticated four-rune source word: p40 PATHS by subtraction.

This removes PATHS length/GP0 from the receiver selection. The remaining retrospective premise is the same-offset transfer from p6 to the already selected p40 page.

See `im-results/lp2-p6-address71-p40-paths-source-only-inverse.md`.

## 5B. Independent p25 MEANING20 convergence on the pre-existing p6 key

A later Agent6 analysis supplies a second, physically distinct construction of
the same numeric key. This is chronologically useful because the p6
line-count/title key `[20,20,12,6]` was already committed hours before the
p25 serializer was proposed.

The source-selected p25 cube output is

`[3,10,16,3,8,20]=[e,Kg,K-b,e,A,qg]`

and its fixed `g=5` cut gives authenticated indices
`40|20 = PATHS|MEANING`. Treat the second output as the state operand
`x=qg=20`. P23's printed state pairs are
`[K,a]|[e,g]=[2,6]|[3,5]`. P40's independently selected receiver has arity4,
so a typed serializer `[x repeated r, H(e,x)[coordinate], s]` can use only
the first p23 pair: `K+2=4`, whereas `e+2=5`.

Forward H gives

`H(e,qg)=[aK,p]=[12,23]`,

leaving only two numeric keys and two signs. The `aK` branch is exactly the
already frozen p6 key:

`[qg,qg,aK,a]=[20,20,12,6]`.

The competing `[20,20,23,6]` key does not yield an authenticated four-rune
source word at the p40 receiver. Holding both keys and both signs fixed across
every contiguous four-rune window on p0–p55 and all distinct authenticated
four-rune signed-source words leaves exactly one event: p40 offset71 -> PATHS
under the p6 key.

This is independent **numeric-key convergence**, not an independent blind
plaintext discovery: the p25 serializer shape was recognized after PATHS.
Its value is that a physically distant p23/p25 route selects the same key
already frozen by p6 geometry without using p40 values.

See `im-results/lp2-p25-meaning20-p40-key-serializer.md` and
`sims/lp2_p25_meaning20_p40_key_serializer_sft.cjs`.

## 6. Manuscript-wide exact-key control

Hold the exact key `[20,20,12,6]` fixed.

The legacy parser counted 513 four-rune groups, including cross-page groups and differing delimiter treatment. The Critic reran the census using the current seam-aware parser: 2,896 groups, 2,864 wholly contained, **509 wholly contained four-rune groups**. Across those 509 groups, nine distinct signed-source four-rune spellings and both signs (9,162 comparisons per key), there is exactly one hit:

```text
p40 offsets71..74
subtract [20,20,12,6]
-> PATHS
```

The ROAD key has exactly the same one-hit selectivity on the identical census (see below). These are descriptive fixed-key counts, not evidence for choosing the retrospectively fitted target or shell. The corrected census preserves both local matches.

## ROAD/PATHS ambiguity and actual alternative continuation (Agent1, 27 November)

The already-selected p40:71 receiver `[4,15,14,21]` admits two distinct same-GP0 source words, ROAD (signed23) and PATHS (signed40). The signed warning contrasts them, so test the ROAD alternative rather than assume a PATHS key is intrinsically identified by the local shell. With the same canonical subtraction and H orientation:

| Target | Plain GP29 | Subtraction key | H(key) |
|---|---|---|---|
| ROAD | [4,3,24,23] | [0,12,19,27] | [2,22,2,27] = [K,p−1,K,−K] |
| PATHS | [13,24,2,15] | [20,20,12,6] | [14,8,3,26] = [−b,A,e,−e] |

Both re-encrypt exactly. ROAD's middle coordinate p−1=22 is already present in the p29 DH packet; its other coordinates are existing state values, but the ordered role choice is retrospective. The prior criterion with **H1=A fixed** remains valid and discriminates ROAD; relaxing that constraint to H1 in {A,p−1}, while retaining H0 in the signed state register and H2 in the positive state register, gives four hits among the same 62 unique page/source-state pairs. The additional hits are p40 ROAD and p16:99 SEEK (source30, shell [26,22,15,14]); the latter is a post-selected nonidentity pair with no independent receiver selector. No new plaintext claim. The canonical seam-aware parser has 2,896 groups, 2,864 wholly contained, and 509 complete four-rune groups. Holding the exact ROAD key and testing all nine distinct matching-length signed words and both signs (9,162 trials) gives exactly one hit, ROAD at this same p40 receiver. Thus the fixed-key selectivity test by itself is also insufficient to choose ROAD versus PATHS.

To attempt actual decipherment, freeze the ROAD key, consume the four anchor runes, and apply constant block reuse, H iteration or inverse-H iteration with no other fitted parameter to the next 156 original p40 runes. Ordinary consuming inverses all replay exactly, but their bigram scores are respectively −4.636329, −4.486648, −4.780132 nats/rune, below all 1,774 equal-length solved-native windows (minimum −2.949326; 47,662-rune Gibran training). Exact literal-plaintext-F hold paths die at suffix indices 111, 5 and 0 respectively. Eighteen matched-geometry native plants using three solved sections retain all truths and replay; maximum-score decoding recovers 2,806/2,808 runes (17/18 exact). Two differing runes in the H-inverse F-hold control reflect mask ambiguity, not a failed replay.

**Decision:** retain PATHS as the source-index-selected candidate, not an intrinsically unique state-derived inverse. ROAD has no independent p40 key/target selector, and all six frozen continuation hypotheses fail. Do not promote the p16 SEEK post-selection or sweep alternative shells. The evidence strengthens the requirement for a prospective source rule that fixes H roles and receiver. No authentic key or unknown plaintext recovered.

[SFT](../sims/lp2_p40_road_collision_continuation_sft.cjs) · [Raw output, pinned inputs and decoded continuations](lp2-p40-road-collision-continuation.json). Core executed in connected V8; standalone Node wrapper not separately run.

## 7. Relationship to the signed warning

Under the adopted index and state rules, the three-word source corridor has two candidate endpoints:

```text
38 BEWARE -> p38 unique BEWARE-state receiver57..62
39 FALSE  -> p39 dominant red X-shaped graphic
40 PATHS  -> p40 unique PATHS/ROAD-state receiver71..74
```

The p40 state is unable, at the length+GP0 level, to tell ROAD from PATHS; deliberate ambiguity is unestablished. The source word number and meaning resolve that ambiguity toward PATHS, while the signed sentence itself warns `BEWARE FALSE PATHS`.

This is stronger than the earlier botanical-art reading of p40. The branch frame is reused on p41 and p42 and should not be counted as independent evidence.

## 8. Evidence boundary

Preserve p40 offsets71..74 as a conditional local PATHS fit:

```text
cipher [4,15,14,21]
key    [20,20,12,6]
subtract
-> PATHS [13,24,2,15]
```

Within the active p28→p40 route, the index/page convention is now independently selected before this receiver is reached. The target/page/receiver can therefore be specified without choosing an origin from the p40 result. This improves the causal status of the PATHS target but does not retroactively make the shell-role discovery blind.

The shell is numerically `[14,8,3,26]`. After removing the GP0-forced `H3=-H2` relation, the remaining H-state criterion selects only p33 WILL and p40 PATHS among 62 unique four-rune source-state page/target pairs in the full 43×43 control. The original symbolic labeling `[-b,A,e,-e]` was recognized after the local inverse; the later p25/mayfly reconstruction expresses the same numeric vector as `[g^-1 mod p,A,e,-e]`. The newer p6 balanced-line / terminal-post-singleton selector derives the **numeric key itself** as `[20,20,12,6]` without choosing those H roles. Its extraction grammar remains retrospective, so this removes a free numeric parameter without yet constituting a blind plaintext prediction.

Promotion to a reusable cipher mechanism requires a first-party rule fixing those roles before another receiver is opened, or a prospective application in a different source-selected receiver family.

## P6 line-count/title extraction of the complete numeric key

The p6 source now supplies a second, more literal reconstruction that bypasses the p40 H-shell roles entirely.

Its ten non-empty physical rune-line counts are:

~~~text
20,24,24,3,18,19,20,24,22,22
~~~

so the repeated counts are `{20,22,24}`. The already charged red-title packet contains literal rune values `{6,12,14,15,16,17,19,24,27}`. Charge every source key `[r,r,x,y]` with `r` any repeated line count and `x,y` any ordered title atoms. There are **243 distinct fixed-order keys**. Across the existing 62 unique same-GP0 four-rune source/page receiver pairs and both signs, exactly one hits: p40 PATHS by subtraction with `[20,20,12,6]`.

Grant every coordinate permutation to charge ordering freedom. The family grows to **1,389 distinct keys**; the same PATHS inverse remains the only hit. Only 52 of those keys have zero GP sum. The globally unique p6 packet grammar independently identifies the selected tail as `12=aK`, `6=a`, hence the key is literally `[20,20,aK,a]`.

This is stronger than merely relabeling the fitted H shell because all four key numbers are extracted from source-visible p6 line geometry and title runes. The family template was nevertheless recognized after the PATHS inverse. Preserve it as a finite, source-literal post-discovery key compression until a prospectively selected receiver passes unchanged.

See [p6 line-count key report](lp2-p6-linecount-p40-paths-key.md) and `sims/lp2_p28_origin_selected_p29_p40_route_sft.cjs`.

## P6 state-packet cross-check

The later p6 master-state investigation supplies a source-visible reconstruction of this exact shell. P6 is independently selected by authenticated `SEEKS` at index6 and `a=6`. Its unique red-title packet exposes `-b=14`, `e=3`, and `A=q+q=8`, giving

```text
[-b,A,e,-e] = [14,8,3,26].
```

A complete four-rune calibration finds 62 unique same-GP0 source/page receiver pairs. Requiring `H1=A=8` leaves WILL, PATHS, and a duplicated THEIR occurrence; requiring the remaining informative H0/H2 coordinates to lie in the signed state register leaves exactly p33 WILL and p40 PATHS. The `H2/H3` negation is forced by equal GP0 and is treated as a checksum.

A prospectively frozen two-rune reduction fails on the expected IS/BE holdouts, so this remains a bounded four-rune class.

See [p6 master-state packet](lp2-p6-master-state-packet.md) and `sims/lp2_p6_master_state_packet_sft.cjs`, Windows PASS **44461943714**.

## Reproduction

Run:

`node sims/lp2_p40_paths_index40_local_inverse_sft.cjs`

The p40 SFT reconstructs the signed source target, canonical receiver, ROAD/PATHS state collision, exact reversible key, HERE-independent shell, and manuscript-wide fixed-key control. The separate conditioned-matrix SFT charges the shared H residue over all unique four-rune source-state page/target pairs.

Windows Node22 verification: corrected p40 SFT run `44457839299` passed. The earlier paired-page run `44457657138` is superseded for familywise interpretation by `sims/lp2_hshell_state_conditioned_crosspair_sft.cjs`, which conditions out the automatic GP0 relation.

**Follow-up:** the p16 SEEK rival admits a retrospective source compression via the red p15 numeral 3299 and canonical H inverse. The same rule also produces an unselected p27 GOOD match; both red-key repetition and fixed spiral-bank continuation on the actual p16 suffix fail. See [the red 3299 H-shell test](lp2-p15-base29-repeating-key-gate.md#red-3299-h-shell-derivation-and-continuation-agent1-27-november). Neither is authenticated plaintext.
