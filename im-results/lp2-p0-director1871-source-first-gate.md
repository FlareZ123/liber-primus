# Director #1871 gate: p0 marker key remains a strong local candidate, but source-first generation is not yet established

**Agent17, 19 November 2026. Decision: close Director #1871 negative under its strict chronology and held-out criteria.** The current marker/state construction reproduces the exact p0 13-rune key and survives large finite rival families. Its exact three vertical rise laws were recognized after the p0 residual was visible. The natural p2 terminal-marker holdout does not validate unchanged transfer. Preserve the construction as strong local evidence; do not promote it as an independently source-generated key.

## Frozen independent evidence

Before using p0 candidate plaintext, the project now has:

- authenticated 2014-square state
  `(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)`;
- the original p0 13-dot marker, directly audited as columns **4|5|4** and staggered row populations **1,2,1,2,1,2,1,2,1**;
- a unique receiver gate: of 30 red 13-dot marks, p0 alone is immediately preceded by a red span of exactly 13 runes;
- the fixed reversible outside-in `H` operation;
- source-visible marker counts giving
  `u=1, K=2, q=4, g=5, w=13, t=g+K=7`.

These facts are independent of subtracting EPIPHANY SEEKS from p0.

## Exact candidate generator and finite rivals

The already frozen three-column rise grammar is:

```text
left   = cumulative(-Q, [Q-S, B-S, B+S])
center = cumulative( Q, [Q, Q+T, Q+2T, Q+3T])
right  = cumulative( T, [T-S, T, T+S]).
```

With the source-visible roles

```text
Q=q=4
B=w=13
S=u=1
T=t=7
```

it generates:

```text
left   [25,28,11,25]
center [ 4, 8,19, 8,4]
right  [ 7,13,20,28]
```

and therefore

```text
H(left || center || right)
=
[26,24,8,19,27,24,18,3,0,8,0,16,19].
```

Subtracting that exact key from untouched p0 title ciphertext gives **EPIPHANY SEEKS**.

The nearest finite role family was charged without changing the grammar shape:

```text
candidate visible values = {1,2,4,5,7,13}
four roles Q,B,S,T
both additive signs
6^4 * 2 = 2,592 cases
```

Exactly one produces any pinned two-word lexical title:

```text
Q=4, B=13, S=1, T=7
subtraction
-> EPIPHANY SEEKS.
```

Additional bounded controls remain strong:

- all 729 `[x,y,z,y,x]` palindromes from the full nine-field DH state: sole lexical five-rune result is `[q,A,B,A,q] -> SEEKS`;
- opposite additive sign: zero lexical results;
- 48 physical column order/reversal views: sole lexical packet is ordinary left→center→right, top→bottom, with the center-reversal degeneracy because the center is palindromic;
- 32 natural staggered-row traversals: zero lexical title;
- 44 valid 13-rune pre/post windows beside red13 markers: sole fixed-key lexical segmentation is p0 pre-marker EPIPHANY SEEKS;
- every cyclic phase, key reversal and sign across those 44 windows: 2,288 schedule cases, same sole p0 phase0/unreversed/subtraction hit.

These controls show that the exact local construction is highly selective after the rise-law shape is frozen.

## Why #1871 still fails its source-first gate

The issue explicitly requires a serialization and coordinate-to-GP29 rule selected **before** evaluating `C-P` or the residual.

The three exact vertical rise laws above do not satisfy that chronology. Their shape was recognized after the p0 residual packet was already available. Later work recovered every numeric anchor from the original glyph and square state, and the role/sign families are highly selective, but those facts do not retroactively turn the formula shape into a blinded source selection.

Therefore the strongest rival in #1871, retrospective formula fitting, is reduced but not eliminated.

## Natural p2 held-out transfer

P0–p2 form the original 27×27 rune object, and p2 ends at another original red 13-dot marker. This supplies the cheapest same-glyph held-out receiver.

Freeze the exact p0 generated key above and apply it unchanged to the **13 runes immediately before the p2 terminal marker**, same phase and subtraction sign.

Original p2 terminal ciphertext:

```text
[11,13,0,28,8,23,9,27,1,13,15,1,7]
```

Subtracting the key gives:

```text
[14,18,21,9,10,28,20,24,1,5,15,14,17]
translit: XENGNIEALAUCSXB
```

This has no pinned solved/authenticated lexical segmentation. The opposite sign also has no lexical segmentation. The broader 44-window, 2,288-schedule family likewise finds no p2 hit.

So the frozen local key does not validate as an unchanged marker schedule on the natural p2 holdout.

## Decision

Under #1871's predeclared standard, the positive claim is not met.

Preserve:

```text
original p0 geometry + authenticated state
-> highly selective local rise serializer candidate
-> exact p0 13-rune key
-> EPIPHANY SEEKS
```

Do not preserve the stronger assertion:

```text
the original marker independently source-selects those exact rise formulas
```

until either:

1. an original source instruction fixes the three rise laws before p0 residual inspection, or
2. the same frozen formula makes a genuine held-out prediction on untouched material.

## Reproduction

Main SFT:

```text
sims/lp2_p0_marker_center_plaintext_selector_sft.cjs
```

Windows Node22 PASS with role, state, sign, orientation, receiver, cyclic-schedule and transfer controls: **44481898432**.

Supporting synthesis:

```text
im-results/lp2-p0-square-marker-plaintext-selector.md
im-results/lp2-p0-square-state-rise-key-serializer.md
```
