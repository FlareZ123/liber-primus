# Onecool 2016 p0 workbook: the visible English candidates are crib-conditioned solver trials

**Agent1, 28 November 2026. Classification: historical workbook-state reconstruction and provenance gate for Director issue #3405. The exact workbook bytes remain missing; this reconstruction uses the recovered five contemporaneous screenshots, the archived 16 December 2016 onecool forum post, and canonical p0 only for arithmetic replay. No candidate word is treated as authentic plaintext.**

## Decision

The recovered workbook does **not** independently generate `DISCOVER`, `DIRECTION`, or `DIVINITY` from p0. They are solver-entered plaintext hypotheses represented by their corresponding fitted modifier/key rows.

The decisive source statement is onecool's own guide, posted 16 December 2016:

- `COUNT` is the letter-position index;
- `MODIFIER` is the encryption key and is where the user should **try various key sequences**;
- the modifier is applied to ciphertext to obtain `DECODED`;
- rows 66–70 are the working rows.

The recovered working-pane screenshot `RHV0bYJ` makes the state even more explicit. Its live rows are:

```text
COUNT             0   1   2   3   4   5   6   7
MODIFIER          8   2  -3   2  -3  11  -9   4
DECODED          23  10  15   5   3   1  18   4
DECODED ENGLISH   D   I  S/Z C/K  O   U   E   R
Möbius            0   1  -1  -1   0  -1   1  -1
```

Below the formal working rows, the same screenshot preserves scratch trials in worksheet order:

```text
yellow key:   8  2  -3   2  -3  11  -9   4
output:       D  I   S   C   O   V   E   R

maybe?
yellow key:   8  2  15  15  -1  26   0   9
output:       D  I   R   E   C   T  IO   N

yellow key:   8  2  12   7   3  -9 -11  -3
output:       D  I   V   I   N   I   T   Y
```

The visible `maybe?` annotation is direct contemporaneous evidence that these are hypotheses, not discovered plaintext. The screenshot preserves vertical worksheet state, **not revision chronology**; there is no basis to infer which scratch row was typed first.

## Reconstructed dependency graph

The four recovered workbook crops and onecool's guide support this dependency graph:

```text
page ciphertext row
        |
        +-- fixed integer shift k --> numeric shift rows (+1,-1,+2,-2,+3,-3,...)
        |                              |
        |                              +--> English rendering rows
        |
        +-- user-selected MODIFIER key --------------------+
        |                                                  |
        |                                   C + MODIFIER mod29
        |                                                  |
        |                                             DECODED numeric
        |                                                  |
        |                                             GP/English render
        |
COUNT index --> named mathematical trial rows (visible: Möbius)
```

The screenshot `wZVmpq9` independently exposes `CIPHER_DEC 15,8,18`; `UasnRcL` shows `15+1=16`, `15-1=14`, `15+2=17`, `15-2=13`, `15+3=18`, `15-3=12`; `RQANPSJ` shows the corresponding English renderings. Together they fix the arithmetic direction without using the trial words.

No formula bar or formula text is visible in any recovered crop. Exact Excel formula strings, absolute/relative references and revision history therefore remain unrecoverable. The dependency graph above is the strongest reconstruction supported by the historical artifact; inventing cell formulas would exceed the evidence.

## Candidate provenance

The screenshot-localized cipher window is canonical p0 offsets 0–7:

```text
C = [15,8,18,3,6,19,27,0].
```

For every displayed candidate, its yellow row is exactly

```text
MODIFIER = candidate_GP29 - C mod29.
```

This is an algebraic crib condition, not independent key evidence:

| candidate | displayed signed modifier | classification |
|---|---|---|
| DISCOVER | `[8,2,-3,2,-3,11,-9,4]` | plaintext crib / trial key |
| DIRECTION | `[8,2,15,15,-1,26,0,9]` | plaintext crib / trial key; visibly under `maybe?` |
| DIVINITY | `[8,2,12,7,3,-9,-11,-3]` | plaintext crib / trial key |

Whether the solver typed the candidate letters and let Excel subtract the cipher, typed the already-computed modifier numbers, or copied the numbers between rows is not recoverable from the screenshots. All three edit procedures have the same evidential consequence: the key row is conditioned on the desired word.

The words themselves were available to a 2016 solver from existing Cicada material rather than discovered by this workbook:

- **DISCOVER** appears in the already solved LP instruction `DISCOVER TRUTH INSIDE YOURSELF`;
- **DIVINITY** appears in the solved Parable phrase `FIND THE DIVINITY WITHIN AND EMERGE`;
- **DIRECTION** appears in the authenticated January 2016 wording `their numbers are the direction`.

All three encode to eight GP runes, exactly matching p0's first red title word. This reconstructs a plausible human heuristic: test salient Cicada-authored eight-rune vocabulary in the visible eight-rune title slot. It does not select a key or authenticate any of the words as p0 plaintext.

## Untouched consequence test

The only low-assumption way to turn an eight-rune trial modifier into a prediction is to freeze it and repeat it beyond the fitted first word. No new values are chosen.

Applying each eight-rune row periodically across the complete 13-rune p0 red heading gives:

```text
DISCOVER key repeat:
D I S C O U E R | D EA S D TH

DIRECTION key repeat:
D I R E C T IA N | D EA R W R

DIVINITY key repeat:
D I U I N I T Y | D EA U EA H
```

Thus the fitted `DIVINITY` key does **not** predict the known source continuation `WITHIN`, and the fitted `DISCOVER` key does not predict `TRUTH`. The later community `DIVINITY WITHIN` fit therefore requires five new crib-conditioned modifier values; it is not a withheld consequence of the recovered 2016 row.

The visible deterministic `Möbius` row is also replayable. The screenshot is exactly the convention

```text
[0, μ(1), μ(2), ..., μ(7)]
= [0,1,-1,-1,0,-1,1,-1].
```

Extending that fixed convention across all 13 title runes produces canonical transliteration

```text
S N B TH G E EA EA | S Y M L C
```

and supplies no selector for the three English trials. Möbius is therefore a documented deterministic experiment in the workbook, not the source of DISCOVER/DIRECTION/DIVINITY.

## What the snapshot does and does not prove

Established from the historical artifact:

1. p0 offsets 0–7 are the exact active ciphertext window;
2. the workbook arithmetic is `decoded = cipher + modifier mod29`;
3. the main modifier row is a user-facing trial-key control;
4. DISCOVER is currently loaded into that control in the screenshot;
5. scratch rows preserve DISCOVER, a `maybe?`-marked DIRECTION trial, and DIVINITY;
6. the displayed modifier vectors are exactly the vectors required to force those desired words;
7. the visible Möbius row is a separate deterministic count-indexed experiment.

Not established:

- exact Excel formulas or cell references;
- edit/revision chronology among the scratch rows;
- an external source that supplies any displayed modifier vector independently of the candidate word;
- authentic p0 plaintext or a transferable p0 key.

## Director fork

The negative fork is now decisive. Treat all three yellow rows as **solver-state / crib provenance**, not key support. They are useful for reconstructing what a serious 2016 human solver tried and why, but they do not reopen p0 cryptanalysis by themselves.

A historical path should reopen only if a new artifact supplies one of the displayed modifier vectors **before** the corresponding candidate word, or exposes a formula/reference that deterministically derives it from an independent source field. Otherwise later arithmetic performed on the `DIVINITY` or `DIVINITY WITHIN` fitted key remains crib-conditioned and must make a fresh untouched prediction before promotion.

## Reproduction

Run:

```text
node sims/lp2_onecool_2016_p0_workbook_provenance_sft.cjs
```

The SFT replays the visible formal rows, verifies the Möbius sequence, reconstructs all three candidate outputs, proves each yellow key is exactly the crib-minus-cipher vector, and freezes/repeats each eight-rune trial over the untouched second p0 title word.