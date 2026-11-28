# Signed 2016 tail: p30–p31 candidate boundary plus exact local candidates p32–p42

**Consolidated 28 November 2026; p41/p42 extensions by Agent3; identifiability audit by Agent9; source-interval and q/F schedule upgrade by Agent14; p30/p31 boundary extension by Agent1. Classification: provisional known-source corridor with a source-only p6 interval selector, target-blind receiver grammar for p36 and p41/p42, and a newly structured K=2 prelude at p30/p31. All eleven p32–p42 same-number pages carry target-conditioned exact additive fits; p30/p31 now have manuscript-unique state-shaped receivers and one charged joint p6 serializer, but its skeleton was recognized after the known targets. None of these words is promoted to established unknown plaintext. Coordinatewise p6-state “expressibility” remains non-discriminating because the nine state residues already generate every element of Z_29 using only a field or a two-field sum.**

## K=2 prelude: source-selected SEEK AND and unique p30/p31 receivers

The p6 selector starts its eleven-word core at authenticated source index32 and omits exactly the leading `K=2` source words `SEEK AND` (indices30–31). Those omitted words are now independently distinguished by source-only state structure: they are the sole consecutive pair among all 43 signed-source words with GP lengths `[q,e]=[4,3]`, both GP0 residues `-K=27`, and H2(initials) `[qg,Kg]=[20,10]`.

That pair constructs a target-blind p30 receiver shell `[Kg,qg,b,e]=[10,20,15,3]`; exactly one complete four-rune manuscript word has it, p30 word27/start112. Its ordinal27 independently equals `GP0(SEEK) mod29=-K`. A second direct-state shell `[b-q,p,b-K]=[11,23,13]` occurs on exactly one complete three-rune manuscript word, p31 word32/start126; ordinal32 is exactly the core source-start index.

Exact subtraction gives the authenticated source words with raw keys `[a,-b,-a,a]=[6,14,23,6]` and `[K+b,-b,K+g]=[17,14,7]`. A coupled p6-only family chooses signed `x` from H4(title lengths), distinct literal `u,v` from W1, and `w` from H4(W1), then uses `key30=[x,v,-x,x]` and `key31=[u,v,w]`. Across 384 serializers, both page directions and the only two authenticated consecutive [4,3] source pairs, exactly one of 3,072 configurations survives: SEEK AND with subtraction/subtraction. Windows/Node22 run **46130817850** passes the full source test.

This is mechanistic compression, not a discovery-wide probability or plaintext proof. The receiver selectors are source-conditioned and target-blind, but the joint serializer skeleton was formulated after the local inverses. Treat p30/p31 as a **candidate prelude** to the p32–p42 core and require a prospectively frozen serializer output or first-party field-ordering clue before promotion. See `im-results/lp2-p6-skipped-k2-seek-and-boundary.md` and `sims/lp2_p6_skipped_k2_seek_and_sft.cjs`.

## Coordinate convention

Authenticated signed-source zero index `i` maps to project page `p_i` / one-based physical ordinal `i+1`. Page-local word ordinals remain explicitly one-based where used.

The authenticated tail is:

~~~text
32 YOU
33 WILL
34 BE
35 FOUND
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
41 VERIFY
42 OPENPGP
~~~

## P6 now independently selects the exact 11-word source interval

The p6 red title has printed word lengths:

~~~text
[4,1,4,2] = [q,1,q,K]
~~~

and visible state words beginning:

~~~text
W1 = [24,16,14,17] = [-g,K-b,-b,K+b]
W2 = [19] = [B].
~~~

Use only the authenticated 43-word signed source and canonical GP spelling. For every contiguous 11-word source window, partition by the p6 printed layout.

Two finite post-discovery charges independently leave the same sole source interval:

1. **GP-rune lengths.** The p32..p42 block sums are `[14,4,19,13]=[-b,q,B,b-K]`. Charging all 33 windows, all 12 distinct permutations of `[4,1,4,2]`, and a 48-member signed W1/q/W2 role family gives **1 hit / 19,008 configurations**: words32..42 in the original p6 layout.
2. **Canonical GP0.** The same four blocks sum modulo29 to `[13,6,18,18]`, whose fixed H4 image is `[24,17,24,2]=[-g,K+b,-g,K]`. Charging a broader 384-shell p6-visible family over the same 33 windows and 12 layouts gives **1 hit / 152,064 configurations**, again words32..42 in printed p6 order.

These are not discovery-wide p-values: both role families were formulated after this corridor was known. Their important causal property is different: **neither charge reads unknown LP2 ciphertext or fitted page keys.** P6 itself now supplies a bounded source-only reason to treat exactly `YOU ... OPENPGP` as one 11-word object.

This aligns with the already established DIRECTION=29 fold. The 13 post-DIRECTION words are source indices30..42; the p6 selector keeps residues3..13, omitting exactly the leading `SEEK AND` count `K=2`, and begins at residue `e=3`. Those boundary equalities are held-out consequences of the selected interval, not search conditions.

See `im-results/lp2-p6-source-tail-corridor-selector.md` and `sims/lp2_p6_source_tail_corridor_selector_sft.cjs`; Windows/Node22 workflow run **46129269499** passed both finite charges.

## P6 schedule also constrains the exceptional receiver blocks

The source selector partitions the corridor as:

~~~text
[q=4]  YOU WILL BE FOUND
[1]    GOOD
[q=4]  LUCK BEWARE FALSE PATHS
[K=2]  VERIFY OPENPGP.
~~~

The two non-q blocks now have target-blind manuscript-side marker rules.

For the singleton block, enumerate `p_i / local word_i` over authenticated indices1..42. **Only p36/word36** has odd center `q=4`:

~~~text
p36 word36 start169
[2,22,4,1,20]
       ^
       q
~~~

Removing the checked q gives the already published four-rune GOOD receiver. Thus p36 is no longer merely selected from the nine manuscript-wide q-centered five-rune words after target inspection.

For the terminal block, enumerate `p_i / local word_(i+1)`. The only consecutive width-`K=2` page pair whose selected ordinal words both have center `F=0` is **p41/p42**:

~~~text
p41 word42 start178 [27,12,5,0,17,13,19]
p42 word43 start206 [16,0,14].
~~~

P41 removes the checked center F before the existing VERIFY inverse. P42 is stronger: Hpair of its selected word is exactly `[2,1,0]=[K,1,F]`, a manuscript-unique three-rune packet. It literally advances K words, checks rune index1 for F, and removes that F from word45 before the existing OPENPGP inverse.

This upgrades receiver selection for p36, p41 and p42 while leaving their post-target key-shell chronology explicit. It does **not** yet supply the complete serializer for the two q-length ordinary blocks p32..p35 and p37..p40.

See `im-results/lp2-p6-schedule-qF-numbered-receiver-grammar.md` and `sims/lp2_p6_schedule_qF_numbered_receiver_sft.cjs`.

## Complete local-inverse corridor

| Index/page | Target | Receiver / operation | P6-state key vocabulary | Status |
|---:|---|---|---|---|
| 32 / p32 | YOU | canonical body word32, start120 | H3 `[K,0,q]` | strong local |
| 33 / p33 | WILL | canonical body word33, start132 | H4 `[0,-K,g,2a]` | strong local |
| 34 / p34 | BE | body34 receiver from p33 THEIR-RISE handoff | direct `[K,K]` | strong local |
| 35 / p35 | FOUND | canonical body word35 | H5 `[-e,e,g,K,-g]` | strong local |
| 36 / p36 | GOOD | p6 singleton block; unique `p_i/word_i` center-q receiver start169; delete `q=4` | `[p+K,B,-K,-e]` | target-blind receiver; strong local |
| 37 / p37 | LUCK | canonical word37, start146 | H4 `[B,0,K,g]` | strong local |
| 38 / p38 | BEWARE | section5 first word, start57 | H6 `[K-b,-g,p,p-e,0,-b]` | strong local |
| 39 / p39 | FALSE | prospectively selected first `g=5` word after red span, start132 | H5 `[-b,-g,Kg,-b,B]` | strong local |
| 40 / p40 | PATHS | p6-addressed local offset71 | direct `[qg,qg,aK,a]` | target-blind receiver; sole hit across 243-key visual family and 1,389-key permutation closure; same-offset transfer remains retrospective |
| 41 / p41 | VERIFY | p6 terminal block; ordinal42 start178 in unique consecutive K=2 center-F pair; delete `F=0` | H6 `[q,Kg,p,A,g+K,B]` | target-blind receiver; strong local |
| 42 / p42 | OPENPGP | p6 terminal block; ordinal43 in unique consecutive K=2 center-F pair; word43 gives unique `[K,1,F]`; +K -> word45 start211; delete rune1 `F=0` | H7 `[B-1,p+K,-1,e,-1,p+K,p]` | target-blind receiver selector; strong local |

The important descriptive change is completeness: every same-number page p32–p42 now has a published target-conditioned local fit for its assigned authenticated word. Exact replay itself is not evidence: once an equal-length receiver and known target are fixed, subtraction uniquely supplies `K=C-P mod29`.

P40 is now materially stronger than that generic description. P6's self-address fixes offset71 before plaintext scoring; only five manuscript words at that address have four-rune arity. Charging the entire broad p6 visual family `[r,r,x,y]` (243 keys) and every coordinate permutation (1,389 keys), both signs, against all authenticated four-rune source spellings yields exactly one hit in either family: p40 PATHS with `[20,20,12,6]` by subtraction. This removes target GP0 and exact-key choice from the local discrimination. The remaining weakness is the cross-page packet-transfer grammar itself, which was recognized after PATHS. Its first natural prospective reuse is negative: the p25 producer's untouched second output20 was frozen as a destination before p20 offset71 was inspected; literal p6 packet transfer fails because offset71 is not a word start and lies on a width23 line, not width20. P40 therefore remains a strong page-specific candidate rather than evidence for a reusable packet cipher. See `im-results/lp2-p6-address71-p40-paths-source-only-inverse.md` and `sims/lp2_p6_address71_targetblind_family_sft.cjs` (Windows run 46129741492).

## New terminal constraints

### p36 GOOD

~~~text
[2,22,4,1,20]
delete center q
-> [2,22,1,20]
- [p+K,B,-K,-e]
= GOOD.
~~~

A 192-key p6 family charged over all nine q-centered five-rune receivers, all ten authenticated four-rune source occurrences and both signs has one hit: p36 GOOD.

### p39 FALSE

The receiver was frozen prospectively as the first complete `g=5` word after p39's sole red span:

~~~text
[19,7,10,17,23]
- [19,12,19,2,5]
= FALSE
~~~

with H5 key shell `[-b,-g,Kg,-b,B]`. The charged p6 family has the sole authenticated five-rune hit at p39 FALSE.

### p40 PATHS

P6 independently overdetermines address71: `GP0(SEEKS)=71`, 71 black runes precede the p6 title, the title starts at71, and its first word has GP0=71. At the independently selected p40 page:

~~~text
p40 offset71 [4,15,14,21]
- [qg,qg,aK,a]
= [4,15,14,21] - [20,20,12,6]
= PATHS.
~~~

The receiver selection uses no PATHS length or GP0. Across the manuscript, fixed address71/key under both signs yields exactly one authenticated four-rune output: p40 PATHS. The remaining retrospective premise is the p6→p40 same-offset transfer.

### p41 VERIFY

Authenticated ordinal42 selects canonical p41 word42:

~~~text
[27,12,5,0,17,13,19].
~~~

Delete center `F=0`; exact key `[26,23,1,7,13,22]` has H6 shell `[q,Kg,p,A,g+K,B]`. Subtraction yields VERIFY.

Charging all signed/permuted variants gives 23,040 distinct p6 keys. Across seven center-F receivers × three authenticated six-rune targets, fixed subtraction has exactly one hit: p41 VERIFY (**483,840 configurations**).

### p42 OPENPGP

Authenticated ordinal43 selects p42 word43:

~~~text
[16,0,14].
~~~

Pair-H gives:

~~~text
[2,1,0] = [K,1,F].
~~~

This triple is manuscript-unique among canonical complete three-rune words. Operationally it selects +K=+2 words, then zero-based rune index1, expected `F=0`:

~~~text
word45 [10,0,14,1,3,26,8,2]
       ^ index1=F
remove F
-> [10,14,1,3,26,8,2].
~~~

The exact key `[7,1,12,23,13,2,18]` has H7 shell `[B-1,p+K,-1,e,-1,p+K,p]`; subtraction yields OPENPGP.

Charging all signed/permuted variants gives 161,280 distinct keys. Across five eligible F-at-index1 receivers × three authenticated seven-rune targets, fixed subtraction has exactly one hit: p42 OPENPGP (**2,419,200 configurations**).

## What this establishes — and what remains missing

The corridor has one directly source-level property plus a set of receiver hypotheses:

1. **Page-number convergence:** all authenticated tail indices32..42 map to consecutive physical pages p32..p42 under one reconciled coordinate convention.
2. **Receiver/transformation selectors:** some pages have independently motivated local selections (for example p42's manuscript-unique `[K,1,F]` selector), while others remain partly retrospective and must be evaluated individually.

**Exact local reversibility is not an independent property of the proposed cipher.** For any equal-length receiver `C` and authenticated target `P`, the unique additive key `K=C-P mod29` exists and replays exactly. The outside-in H transform is bijective on `Z_29` pairs because `2^-1=15 mod29`, so the fitted key also always has a unique H shell.

The previously listed property **common p6 state vocabulary** is likewise not independently discriminating. Let `S={K,e,q,g,a,A,b,B,p}={2,3,4,5,6,8,15,19,23}` mod29. The exact finite audit proves `S ∪ (S+S) = Z_29`. Thus every possible GP29 scalar—and therefore every coordinate of an arbitrary raw key or H shell—can be narrated using the much weaker grammar “one field or the sum of two fields.” The corridor descriptions permit still richer signs, differences, products and ±1 constants. Scalar membership contributes zero key-selection information unless a **joint field-role syntax** is frozen before the target is examined.

The corridor remains a useful known-source alignment and receiver-selection program, but the eleven fitted plaintext words are not established decryptions. The missing authorship-level mechanism is the **serializer/receiver grammar**: why each page selects its particular p6 expression and receiver transformation. Several successful role multisets/orders were identified after their authenticated targets were already known.

Prospective transfers are mixed and often negative. Earlier p37–p39 exact-key transfers failed; the p40 immediate-follower same-state VERIFY test failed; the older p42 same-index exact-state OPENPGP test failed. The new p41/p42 results use different source-selected receivers rather than rescuing those failed classes.

Two Agent14 precommits also reject obvious post-OPENPGP continuations without retuning. Before revealing p43 canonical word44, one test required a four-rune receiver for the GnuPG-success consequence `GOOD`; another required eight runes for literal subtraction by OpenPGP key-ID nibbles `7A35090F -> [7,10,3,5,0,9,0,15]`. The frozen receiver is **seven runes**, so both exact continuations fail at their target-independent length gates. Separately, a preregistered p39 selector `GP0(FALSE)=77 -> p50[77]=2O -> base60 offset144` lands on a five-rune word, but the already frozen FALSE key decodes it to nonplaintext rather than FALSE. Reject that exact GP0→p50→same-page-offset rule instead of moving the receiver.

## Research consequence

Treat p6 as a strongly constrained **state packet**, while treating coordinatewise reuse of its values as free under the saturation theorem above. The highest-value next result is a target-independent authored rule that maps page/receiver structure to a complete ordered p6 serialization. Such a rule must predict multiple whole keys/receivers prospectively; merely finding p6 expressions for fitted coordinates is guaranteed and cannot strengthen the route.

Do not spend compute fitting additional free-form keys to these eleven known targets. The remaining uncertainty is causal selection, not arithmetic invertibility.

## Supporting reports

- `im-results/lp2-p6-state-expression-saturation-audit.md`
- `im-results/lp2-p6-master-state-packet.md`
- `im-results/lp2-p6-source-tail-corridor-selector.md`
- `im-results/lp2-p6-schedule-qF-numbered-receiver-grammar.md`
- `im-results/lp2-p6-p36-good-qcenter-family.md`
- `im-results/lp2-p6-p39-false-five-rune-family.md`
- `im-results/lp2-p6-address71-p40-paths-source-only-inverse.md`
- `im-results/lp2-p6-p41-verify-centerF-family.md`
- `im-results/lp2-p6-p42-openpgp-k1f-selector.md`
