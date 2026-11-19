# P38 section 5: source-state BEWARE selection and a compact DH-shell inverse

**Agent24 source-state selector plus Agent7 inverse, 19 November 2026. Classification: strong local BEWARE plaintext candidate with an exact reversible DH-shell inverse. The target and receiver were selected before the new key family was constructed. The shell template itself was recognized after BEWARE was known, so this remains source-constrained mechanism compression rather than a blind key discovery.**

## Upstream facts fixed before this test

Three ingredients were already fixed independently:

1. the visible Arabic markers `1-` through `5-` across physical p36-p38 are authored numbered-section starts;
2. the p50 **native base60 low digit, zero-origin** component was selected upstream by the p28 READ OUT self-closure and then transferred to the p38 FOUND continuation;
3. authenticated signed2016 plus solved p56/p57 provide source words and their original predecessor relations.

No candidate key for the p38 section-5 first word is used to select its label.

## Numbered-section starts

The first complete word after each visible section marker has:

```text
section 1: length4, GP0=56,  p50[56]=4E, low60=14
section 2: length4, GP0=67,  p50[67]=3C, low60=12
section 3: length3, GP0=37,  p50[37]=1K, low60=20
section 4: length7, GP0=100, p50[100]=1N, low60=23
section 5: length6, GP0=88,  p50[88]=3V, low60=31
```

For each start, search authenticated signed2016 and solved p56/p57 for a source word with the same GP-rune length and GP0. Then require the fixed low60 value to equal GP0 of that source word's actual predecessor.

Only one relation survives:

```text
p38 section 5 first word:
cipher offsets57..62
cipher [8,25,14,2,17,22]
length = 6
GP0 = 88

signed2016:
LUCK   GP0=31
BEWARE length=6, GP0=88

p50[88]=3V
low60(V)=31=GP0(LUCK)
```

Therefore the section start selects the authenticated adjacency:

```text
LUCK -> BEWARE
```

and labels the p38 section-5 first word **BEWARE** at the source-state level.

The other static source collisions do not satisfy the predecessor state:

- section1 GP0=56/length4 matches signed `SEEK` and solved-p56 `SEEC`, but their predecessors have GP0 112 and19, while low60(56)=14;
- section5 GP0=88/length6 also matches solved-p56 `EXISTS` and `HASHES`, whose predecessors both have GP0 42, while low60(88)=31.

Thus the predecessor relation disambiguates BEWARE from the same-state solved-word collisions.

## Manuscript-wide charge

Across all **2,864** complete unknown words wholly contained on a physical p0-p55 page, exactly three words have the BEWARE state signature:

```text
p36 ordinal37 offsets180..185
p38 ordinal11 offsets57..62
p49 ordinal16 offsets60..65
```

Only the p38 word is one of the authored numbered-section starts.

The section-start test therefore uses the visible section structure as the independent receiver selector rather than searching all words for a desired state.

## Exact-token-multiset calibration

Charge the complete family of predecessor relations from signed2016, solved p56 and solved p57 against all five numbered-section starts. Randomly permute the exact 256 p50 tokens while preserving the token multiset.

Using **100,000** deterministic permutations with seed `0x24be5afe`:

```text
observed family hits = 1
null mean            = 0.06483
familywise tail      = 4577 / 100001 = 0.0457695
```

The exact section5/BEWARE relation appears in 1,215 of the 100,000 shuffled tapes, corrected tail 0.0121599. That target-specific number is descriptive because BEWARE was inspected after the section state was observed; the familywise 0.04577 value is the appropriate charged calibration.

This is moderate rather than decisive evidence by itself.

## Frozen BEWARE decoder holdout fails

Agent19 had already frozen a **48-case** six-rune BEWARE role-shell family on the independently source-assigned p0 warning-packet BEWARE block. That family has one local p0 BEWARE hit and had already failed unchanged on its p0 VERIFY sibling.

Apply the exact same 48 cases, unchanged, to the newly selected p38 section-5 receiver.

Result:

```text
48 configurations
0 authenticated six-rune target hits
```

The exact p0 BEWARE key also fails:

```text
p0 BEWARE key = [12,2,0,17,12,7]

[8,25,14,2,17,22] - [12,2,0,17,12,7] mod29
= [25,23,14,14,5,15]
!= BEWARE
```

So the new source-state selector does **not** validate the existing BEWARE rune-level key family as a transferable decoder.

## New peer-state DH-shell inverse

The failed p0 BEWARE transfer left one narrow source question: can the immediately preceding section-4 terminal state `[g,K*a,B]` and the literal p28 DH/HERE state support a different compact six-rune key family?

For the selected receiver `[8,25,14,2,17,22]`, the frozen outside-in H serialization is:

```text
[15,1,8,13,12,16]
= [b,a-g,A,b-K,K*a,K-b].
```

The independently selected BEWARE target has:

```text
BEWARE = [17,18,7,24,4,18]
H_shell(BEWARE)
= [28,6,14,22,12,2]
= [g-a,a,-b,HERE[B],K*a,K].
```

The exact additive key is `[20,7,7,7,13,4]`. Its H shell is:

```text
[16,24,23,20,0,14]
= [K-b,-g,p,DH[p],0,-b].
```

Here `DH[p]=20` is the one-based p28 literal-DH lookup at the fixed modulus field.

Because this shell was recognized after the BEWARE label was known, charge a finite source-state family. For each `v` in `{p,g,a,b,A,B,K}`, choose either literal p28 source line `HERE` or `DH`, build

```text
[K-v,-g,p,LINE[p],0,-v],
```

H-invert it into a six-rune key, test both additive directions, and score the three distinct authenticated six-rune targets `PRIMUS BEWARE VERIFY`.

The **28-case** family has one hit:

```text
v=b
LINE=DH
subtraction

shell [16,24,23,20,0,14]
key   [20,7,7,7,13,4]

[8,25,14,2,17,22]
-
[20,7,7,7,13,4]
mod29
=
[17,18,7,24,4,18]
=
BEWARE.
```

Forward replay is exact.

Apply the exact key unchanged to all **251** complete six-rune unknown words, both additive directions, and the same three authenticated targets. There is one manuscript-wide hit: p38 offsets57..62 under subtraction gives BEWARE.

This supplies an exact reversible local mechanism for the independently selected block. The key-template chronology remains retrospective.

### Precommitted fresh transfer fails

Before opening the source-assigned p0 VERIFY ciphertext in the Agent7 invocation, freeze the exact p38 key and subtraction direction on p0 offsets177..182.

The held-out original ciphertext is:

```text
p0 VERIFY receiver177..182
[0,14,25,13,6,14]
```

Exact transfer:

```text
[0,14,25,13,6,14]
-
[20,7,7,7,13,4]
mod29
=
[9,7,18,6,22,10]
```

Canonical VERIFY is `[1,18,4,10,0,26]`, so the transfer fails.

This is a useful localization result. The exact p38 key is retired as a reusable six-rune decoder; the p38 BEWARE inverse remains local. No sign, rotation, peer-field substitution, or shell permutation is admitted after this failure.

Reproducer: `sims/lp2_p38_section5_beware_dh_shell_inverse_sft.cjs`. Windows Node22 PASS: initial inverse run **44447593645**; holdout-integrated rerun **44448030240**.

## P6 source-packet upgrade

A later independent p6 investigation supplies a source-visible origin for the exact BEWARE key shell.

P6 is selected upstream by authenticated word6 `SEEKS` and the established state `a=6`. Its red title is the globally unique page-local four-word packet satisfying

```text
W1 = [-g, K-b, -b, K+b]
W2 = [B]
W3 = [a, -K, b, K+b]
W4 = [-b, aK]
```

under the charged state family. Its word-length vector `[4,1,4,2]` satisfies

```text
H([4,1,4,2]) = [K,-e,g,a].
```

This makes the p38 interleaved six-rune shell

```text
[K-b,-g,p,p-e,0,-b]
= [16,24,23,20,0,14]
```

readable from p6 packet fields and state arithmetic.

The fourth W1 field, `K+b=17`, is unused by the key shell and uniquely matches the first GP rune of **BEWARE** among the distinct authenticated six-rune targets.

A finite role charge treats each W1 field in turn as the target initial, assigns the other three fields in every order to the free shell roles, fixes the middle pair to `[p,p-e]`, fixes the zero coordinate, and tests both signs. The **48** cases contain one hit, the exact BEWARE shell and subtraction key.

A broader 48-key p6+p28 family gives one authenticated six-rune hit across all **251** complete six-rune unknown words and both signs, again p38 BEWARE. The unchanged p6-only role family gives zero hits on the independently selected p0 VERIFY receiver.

See [p6 master-state packet](lp2-p6-master-state-packet.md) and `sims/lp2_p6_master_state_packet_sft.cjs`, Windows PASS **44461943714**.

## Decision

Preserve p38 offsets57..62 as a **strong local BEWARE plaintext candidate with a source-visible p6 state-packet key route**.

The receiver remains independently selected by the section5/LUCK gate. The exact key and plaintext replay remain unchanged. The p6 packet upgrades the former retrospective DH-shell compression into a finite source-derived schedule, while the failed p0 VERIFY transfer keeps the mechanism local. The next useful test is a fresh receiver whose packet-role semantics can be fixed before ciphertext inspection.

## Reproduction

Run:

`node sims/lp2_p38_section5_beware_state_holdout_sft.cjs`

The SFT reconstructs the five numbered-section starts, charges all signed2016/p56/p57 predecessor relations, parses the manuscript-wide BEWARE-state receivers, runs 100,000 exact-token-multiset controls, and applies Agent19's frozen 48-case BEWARE family unchanged to the p38 holdout. Windows / Node.js 22 reproduction passed in Actions run [44446240909](https://github.com/FlareZ123/liber-primus/actions/runs/44446240909).\n\nThe new inverse is reproduced by `sims/lp2_p38_section5_beware_dh_shell_inverse_sft.cjs`; Windows / Node.js 22 PASS is Actions run [44447593645](https://github.com/FlareZ123/liber-primus/actions/runs/44447593645).
