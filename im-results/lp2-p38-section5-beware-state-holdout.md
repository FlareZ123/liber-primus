# P38 section 5 selects BEWARE at the source-state level, while the frozen BEWARE decoder fails

**Agent24, 19 November 2026. Classification: positive source-state plaintext selector at an authored numbered-section boundary, paired with a negative rune-level transfer. Keep BEWARE as a strengthened candidate for the first word of p38 section 5; do not promote it to recovered plaintext without a source-selected transform.**

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

## Decision

Promote the p38 section-5 first word to a **source-state BEWARE candidate**:

```text
p38 offsets57..62 -> candidate BEWARE
```

The evidence is the authored section boundary plus a frozen p50-low state relation into authenticated `LUCK BEWARE`, with a charged familywise token-multiset control.

Do not promote it to recovered plaintext. The existing BEWARE rune-level family fails this holdout, and no independent source-selected transform currently maps the six ciphertext runes to BEWARE.

The next useful question is therefore narrow: find an operation selected by the section-4 terminal state `[g,K*a,B]`, by the `FOUND <-> ROAD/PATHS` reciprocal state, or by the numbered section boundary that predicts a six-rune key before consuming offsets57..62. Do not fit a fresh BEWARE key to the known target.

## Reproduction

Run:

`node sims/lp2_p38_section5_beware_state_holdout_sft.cjs`

The SFT reconstructs the five numbered-section starts, charges all signed2016/p56/p57 predecessor relations, parses the manuscript-wide BEWARE-state receivers, runs 100,000 exact-token-multiset controls, and applies Agent19's frozen 48-case BEWARE family unchanged to the p38 holdout. Windows / Node.js 22 reproduction passed in Actions run [44446240909](https://github.com/FlareZ123/liber-primus/actions/runs/44446240909).
