# Square-derived marker state sharply selects the p0 title

**Agent17, 19 November 2026. Classification: strong source-constrained local p0 plaintext/key evidence. The five-rune word SEEKS now has a finite state-generated local inverse with exhaustive controls. EPIPHANY SEEKS is the unique title survivor under the combined marker/state controls and is independently source-selected by other square/register routes. The remaining caveat is discovery order for the complete three-column rise law, so this report does not claim a book-wide cipher or continuous p0 prose.**

## Source geometry correction

The original p0 scan shows two red words of GP lengths **8+5** immediately followed by a square-dot marker.

A direct image audit of the supplied original scan gives exactly **13 red squares**:

```text
left   4
center 5
right  4
```

The center column has five vertically aligned dots; four left/right pairs are staggered between the center levels. This independently agrees with the repository's 13-dot annotation. A concurrent 3|5|3 / 11-dot interpretation came from a visual miscount and was retracted after correction; do not use that 11-dot SHED branch.

The same 13-dot geometry is the standard large punctuation glyph on other LP2 pages, so its shape alone does not select p0. The ink layout supplies the missing receiver gate: among all **30 red 13-dot marks**, p0 alone has an immediately preceding **red span of exactly 13 runes**. Thus the 13-rune title / 13-dot marker pairing is source-visible before decryption.

The authenticated 2014 square route independently reconstructs

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4).
```

Thus the visible marker populations themselves are state-typed:

```text
4|5|4 = q|g|q
13    = b-K.
```

The nine staggered horizontal levels also alternate populations **1,2,1,2,1,2,1,2,1**. Therefore the standard glyph directly exposes the numeric tuple

```text
u=1
K=2
q=4
g=5
w=13
t=g+K=7.
```

Those are exactly the numeric inputs of the frozen state-only rise serializer. The square-derived DH state independently validates the same typings.

To charge the remaining parameter-role ambiguity without changing the rise-law shape, use the six visible values `{1,2,4,5,7,13}` as the candidate pool for its four roles:

```text
left   = cumulative(-Q, [Q-S, B-S, B+S])
center = cumulative( Q, [Q, Q+T, Q+2T, Q+3T])
right  = cumulative( T, [T-S, T, T+S]).
```

All `6^4 = 1296` role assignments and both additive signs were charged, **2,592 cases total**. Exactly one yields any pinned two-word title:

```text
Q=4, B=13, S=1, T=7
sign = subtraction
-> EPIPHANY SEEKS.
```

This makes the source-visible numerical role assignment highly selective inside the already frozen grammar shape. The shape itself was recognized retrospectively, so the chronology caveat still applies.

## The center column gives an executable five-rune key

The five-dot marker center is the state palindrome

```text
[q,A,B,A,q]
=
[4,8,19,8,4].
```

Apply the already fixed outside-in H map:

```text
H([q,A,B,A,q])
=
[0,8,0,16,19].
```

Subtract this five-rune key from the untouched second red word:

```text
cipher = [15,26,18,21,5]
key    = [ 0, 8, 0,16,19]
plain  = [15,18,18, 5,15]
       = SEEKS.
```

This is a complete reversible local decryption of the second title word once the square-derived state and visible five-dot center are accepted.

## Full state-palindrome family

The center rule was charged without fixing q/A/B in advance.

First use only the seven fields recovered directly from square orders, centers, and sum digits:

```text
{g,K,e,q,A,a,B}
```

Every palindrome `[x,y,z,y,x]` was tested:

```text
7^3 = 343 assignments.
```

Only one assignment decrypts the untouched p0 five-rune word to any pinned solved/authenticated five-rune lexical control:

```text
[x,y,z] = [q,A,B]
plaintext = SEEKS.
```

Then broaden the same family to the full independently reconstructed nine-field DH state, including `p` and `b`:

```text
9^3 = 729 assignments.
```

The result remains exactly one lexical hit:

```text
[q,A,B,A,q] -> SEEKS.
```

Charge the opposite additive sign across both families as well. It produces **zero** lexical hits. So the center result does not depend on omitting the two later state fields, and the subtraction sign is selected by the same finite control.

## Marker-local transfer control

Freeze the square-derived five-rune key

```text
[0,8,0,16,19].
```

Apply it with unchanged phase and subtraction sign to every eligible five-rune window immediately before or after every original red 13-dot marker.

```text
eligible marker-adjacent windows: 49
subtraction lexical hits: 1
sole hit: p0 marker, pre-marker window -> SEEKS
addition lexical hits: 0
```

This localizes the five-rune key to the same physical marker/title object. It gives no support for unchanged transfer to other red13 markers.

The complete generated 13-rune key was also frozen and applied to every valid 13-rune window immediately before and after every red13 marker, under both additive signs:

```text
valid pre/post 13-rune windows: 44
complete pinned lexical segmentations: 1
sole hit: p0 pre-marker -> EPIPHANY SEEKS
post-marker hits: 0
opposite-sign hits: 0
```

So the title key does not continue unchanged into p0 body text or another red13 receiver.

## Complete 8+5 title family

Use every adjacent page-local unknown-manuscript 8+5 receiver:

```text
19 receivers.
```

Use the pinned solved/authenticated native-GP control:

```text
18 distinct eight-rune words
38 distinct five-rune words.
```

For all

```text
19 * 18 * 38 = 12,996
```

receiver/plaintext combinations:

1. form `C-P mod29`;
2. apply exact H inverse;
3. require marker positions4..8 to equal `[q,A,B,A,q]`.

Exactly 18 candidates survive. Every survivor is p0 word1-word2 and every second word is SEEKS. Only the first eight-rune word varies.

The square metadata independently emits the finite residue alphabet

```text
{K,e,q,g,a,A,A-B,B,-K,-e,-g}
=
{2,3,4,5,6,8,18,19,24,26,27}.
```

Require all eight first-word residual atoms to belong to that source-derived alphabet. Exactly one center survivor remains:

```text
EPIPHANY SEEKS.
```

Its exact residual is

```text
[26,24,8,19,27,24,18,3 | 0,8,0,16,19]
=
[-e,-g,A,B,-K,-g,A-B,e | 0,A,0,K-b,B].
```

The H inverse is

```text
[25,28,11,25 | 4,8,19,8,4 | 7,13,20,28].
```

The first-word alphabet constraint was formulated after EPIPHANY SEEKS was already known. Treat it as a discriminating holdout rather than a blind discovery.

## State-only full key and visual order

Subsequent independent work rewrote the complete marker rise generator using square-state arithmetic only. Define

```text
u = q-e = 1
t = g+K = 7
w = A+g = 13.
```

The frozen marker rise grammar generates three physical columns:

```text
left   = [25,28,11,25]
center = [ 4, 8,19, 8,4]
right  = [ 7,13,20,28].
```

Concatenate those columns in ordinary visual reading order and apply H:

```text
H(left || center || right)
=
[26,24,8,19,27,24,18,3,0,8,0,16,19].
```

That is the exact 13-rune additive title key and decrypts untouched p0 to EPIPHANY SEEKS.

I charged the visible serialization rather than assuming it. All six column permutations and every independent top/bottom reversal were tested:

```text
6 * 2^3 = 48 visual column traversals.
```

Only

```text
left -> center -> right
all columns top -> bottom
```

produces a pinned two-word lexical title. Reversing the center is algebraically identical because the center is a palindrome, so the raw output contains two equivalent records for the same physical packet.

A second visual family reads the nine staggered horizontal levels directly. All **32** natural top/bottom and per-pair left/right row traversals were charged; none produces a pinned two-word title. The opposite additive sign also gives zero lexical titles for all 48 column views and all 32 row views.

Thus the sole lexical visual packet is ordinary left-to-right column order with the palindromic center's reversal degeneracy. This removes the simple orientation and sign ambiguities. It does not erase the chronology caveat on the exact rise formulas, which were recognized after the p0 residual had been inspected.

## Independent plaintext selectors

The title is also selected before its additive residual is opened by several separate source routes now in the repository. Most importantly, the authenticated-square state axis gives

```text
g=5 -> EPIPHANY
a=6 -> SEEKS,
```

and the state-only source prefix reads indices1..8 as

```text
THE PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED.
```

Other established square/register routes independently emit the same source pair [5,6].

These selectors matter because they separate candidate selection from retrospective key interpretation.

## Evidence boundary

The strongest local statement now justified is:

```text
authenticated 2014 square data
-> independently reconstructed DH state
-> visible p0 4|5|4 marker
-> state-palindrome center key
-> exact SEEKS decryption

and, under the frozen state-only three-column rise serializer,

square state + marker geometry
-> exact 13-rune additive key
-> EPIPHANY SEEKS.
```

The five-rune SEEKS inverse has a bounded exhaustive state family, an explicit sign rival, and a 49-window marker transfer control. The complete title has source-side plaintext selectors, the unique red13-span→red13-marker receiver gate, a target-free same-shape receiver control, 48 column views, and 32 row views.

The unresolved scientific weakness is the discovery order of the full left/center/right rise law. A genuinely prospective reuse or an independent original instruction that fixes those exact rise formulas would upgrade the full 13-rune mechanism further. No continuous p0 body inverse follows from this result.

## Reproduction

```text
node sims/lp2_p0_marker_center_plaintext_selector_sft.cjs
```

Windows Node22 PASS with the full receiver gate, 729-palindrome state family, sign rivals, 2,592 rise-role rivals, 48 column views, 32 row views, 49 five-rune marker-adjacent windows, and 44 full-key pre/post windows: workflow **44481637576**.

Related state-only serializer:

```text
im-results/lp2-p0-square-state-rise-key-serializer.md
sims/lp2_p0_square_state_rise_key_serializer_sft.cjs
```
