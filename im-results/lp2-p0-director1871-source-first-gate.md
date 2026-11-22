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

The issue requires the exact serialization and coordinate-to-GP29 rule to be selected **before** evaluating the p0 residual. The three rise laws do not satisfy that chronology: their shape was recognized after the p0 residual packet was visible. The later recovery of every numeric anchor from the original marker and square state does not retroactively source-select the formulas.

### Additional first-party / historically available source audit (19 November 2026)

I checked the preserved 2012–2017 signed/public instruction chain for a rule that fixes the exact left/center/right rise formulas, not merely a general preference for directions, depth or visual inspection:

- **2012 countdown:** 'You have done well to come this far. Patience is a virtue. Check back…' — no marker, column or rise operation.
- **2012 path/Chorus message:** 'This song is your own path,' 'Another stop on the road toward enlightenment,' and 'Let the Chorus be your guide to the depths.' It can motivate following a source path, but gives no three-column traversal or cumulative increments.
- **2013 forest clue:** 'You can't see the forest when you're looking at the trees.' This is a whole/part caution, not a column-rise instruction.
- **2013 second-onion message:** 'You already have everything you need to continue. Sometimes one must knock on the sky and listen to the sound.' It does not specify a p0 marker coordinate system, rise law or sign.
- **2014 Onion5 signed response:** the text says 'Very good. You have done well to come this far' and embeds two small JPEGs: one contains the visible text Bew(y) = ∃ x, the other an eye. Neither supplies the p0 three-column increment sequences or a column ordering.
- **2014 Onion6 magic-square form:** explicitly asks the player to paste the Order-5/3301, Order-7/1033 and Order-5/1033 squares and provide a Tor hidden-service URL. This selects the square submission task and its three square inputs, not the p0 marker's rise formulas.
- **2014 May 2 / Stage11 signed message:** 'Your enlightenment awaits you,' followed by an onion address and 'We look forward to hearing from you.' No rise/column rule.
- **2016 signed clue:** the 'numbers are the direction / meaning is the road' language is compatible with numeric direction-finding, but does not specify the three-column cumulative grammar, its role assignments, additive sign, or p0 receiver.
- **2017 signed message:** 'Beware false paths. Always verify PGP signature…' is an authenticity warning, not a p0 transformation.

The authenticated 2014 square metadata does independently fix the DH state and the visible marker-derived values. The p0 marker independently fixes the 4|5|4 column populations and the alternating 1,2 row populations. Neither source specifies that these values must be fed into

```
left   = cumulative(-Q, [Q-S, B-S, B+S])
center = cumulative( Q, [Q, Q+T, Q+2T, Q+3T])
right  = cumulative( T, [T-S, T, T+S])
```

No preserved instruction fixes the cumulative operation, the three increment lists, their assignment to columns, the top-to-bottom order, or the subtraction sign before the residual is examined.

**Source-selector result: negative.** The source corpus supports the numeric roles and marker geometry; it does not independently select the rise-law shape. The strong local EPIPHANY SEEKS candidate remains conditional and the p2 holdout below remains negative. Do not promote the full 13-rune rise serializer as a source-authenticated LP2 cipher.

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
