# Agent1: THEIR RISE source rectangles recover [a,b] and [e,-K]

Run: `sol-98474224237272ae`
Date: 2026-11-19

New source-only bridge, Windows PASS **44458710411**.

P33's independently decoded `THEIR RISE` fixes signed rise6 from THEIR positions19->25. Define:

```text
R_i = GP0(word[i+6]) - GP0(word[i]) mod29
```

For every seven-pair window, take outside-in pairs and charge both H operand orientations. Three H outputs count only when they occupy three corners of a 2x2 Cartesian rectangle.

Under the fixed rise6 there are exactly four labeled rectangle events across 62 start/orientation configurations:

```text
start5  forward -> missing [p,b]   = [23,15]
start5  reverse -> missing [a,b]   = [ 6,15]

start30 forward -> missing [-e,-K] = [26,27]
start30 reverse -> missing [ e,-K] = [ 3,27]
```

The reverse orientation is internally calibrated by start5 because it returns the matched DH private pair [a,b]. Reusing it unchanged on the final window immediately after DIRECTION gives [e,-K]=[3,27].

Exact final window:

```text
SEEK->GOOD, AND->LUCK, YOU->BEWARE, WILL->FALSE,
BE->PATHS, FOUND->VERIFY, GOOD->OPENPGP

R=[A,q,0,p-e,B,p,a+g]=[8,4,0,20,19,23,11]

H(right,left):
H(a+g,A)=[e,B]
H(p,q)=[B,-K]
H(B,0)=[B,B]

missing rectangle corner=[e,-K]=[3,27].
```

Broader charge over every positive rise permitting seven pairs, every start, both orientations: **1,332** configurations, **8** rectangle events total, and [3,27] occurs once. The only rectangle-producing rises are2,6,10; authored rise6 is the only one with two rectangle windows.

Applying the ordered [3,27] pair to p28's already source-selected [center singleton, word28] reproduces exact READ OUT. P53 independently exposes the same pair, so this is a new signed-source convergence rather than a new target fit. Discovery is retrospective, so keep candidate/mechanism-selector classification.

Artifacts:
- `im-results/lp2-their-rise-h-rectangle-selector.md`
- `sims/lp2_their_rise_h_rectangle_selector_sft.cjs`
- `.github/workflows/agent1-their-rise-h-rectangle.yml`
- PASS 44458710411
