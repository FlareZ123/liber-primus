# P0 27x27 block11: continuity and state restoration select exact END

**Agent48, 19 November 2026. Classification: source/state-derived exact local inverse and strong retrospective closure of the public block11 candidate `END`.** The public block11 path was already visible in repository research when this selector was reconstructed, so this is not a blinded plaintext discovery. The advance is causal: the key node, key, receiver start, direction and length now follow from previously fixed state and geometry without subtracting `END` to choose them.

## Fixed upstream state

The independently recovered DH23 tuple is:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, q=4.
```

Blocks9–10 already establish one continuous state point:

```text
block9 node lower outer = (19,16)
block10 node center      = (19,16)
                         = (B, B-e).
```

The frozen block11 state packet is:

```text
[B-A, p-a, B-A]
= [11,17,11].
```

The same fixed node-to-key transform replaces the center by Euler phi and rotates by the Möbius sum.

## 1. Continuity resolves the two-node ambiguity

Exhaust every canonical horizontal, vertical and 45-degree triple at radii1..13 in the original p0–p2 27x27 object. The packet `[11,17,11]` has exactly two placements:

```text
radius4 D2: (19,16) -> (23,12) -> (27,8)
radius6 H : (13,12) -> (13,18) -> (13,24)
```

Only the first placement contains the already established block9→10 state coordinate `(19,16)`. Requiring state continuity therefore selects a single block11 node without opening its plaintext.

This reconciles the earlier prospective negative correctly: `[11,17,11]` is globally nonunique, so state expressibility alone is insufficient; the later chain supplies an independent selector that was absent from the original negative test.

## 2. The fixed node transform gives the block11 key

Apply the already frozen transform:

```text
[11,17,11]
 -> center phi(17)=16
 -> [11,16,11]
 -> Möbius rotation2
 -> [11,11,16].
```

Thus the repeating block11 key is fixed before choosing a receiver.

## 3. Invert the state differences to get the receiver start

The packet is not an arbitrary numeric triple. Its state formula is:

```text
outer  = B-A = 11
center = p-a = 17.
```

Restore exactly the terms that were subtracted:

```text
(B-A)+A = B = 19
(p-a)+a = p = 23.
```

This fixes the state-derived coordinate:

```text
(B,p) = (19,23).
```

The row/column swap `(p,B)=(23,19)` is retained as a charged rival rather than assumed away.

The same coordinate can also be seen from the continuity-selected node start `(B,B-e)=(19,16)`: its column must advance by `g+K=7`, because `B-e+g+K=p`. That independent state identity lands on the same `(19,23)`.

## 4. Direction and length charge uniquely select END

From the two state-derived start orientations `(B,p)` and `(p,B)), charge:

- all eight compass directions;
- every state-sized length in `{K,e,q,g,a,g+K,A}={2,3,4,5,6,7,8}`;
- the fixed repeating key `[11,11,16]`;
- original p0–p2 ciphertext only.

Compare the resulting plaintext vector against the fixed source-native vocabulary made from solved Cicada GP text plus the authenticated 2016 source words.

Exactly one case produces any source-native word:

```text
start     = (B,p) = (19,23)
direction = south
length    = e = 3
cells     = (19,23) -> (20,23) -> (21,23)
cipher    = [0,20,10]
key       = [11,11,16]
plaintext = [18,9,23]
          = END.
```

Forward replay is exact.

The swapped start `(p,B)` produces no source-native output under any charged direction or length.

## 5. Scope

This closes block11 locally and extends the reconstructed route fragment to:

```text
OF THE END
```

It does not establish a general 27x27 route generator. A later Agent48 continuation does resolve block12 specifically: the END endpoint selects the previously failed unique `[-B,q,-B]` seed mirror, a charged state transition expands it uniquely to `[A,q,A]`, and the authenticated source register selects exact `IS`. See `im-results/lp2-p0-state-block12-is.md`. This later success remains local and does not validate a general transition rule.

The result is strongest as an intended-route reconstruction: a globally ambiguous state packet becomes unique only after the preceding chain exposes a shared state coordinate; its own symbolic differences then invert to a receiver coordinate, and the bounded direction/length family has one lexical survivor.

## Reproduction

```text
node sims/lp2_p0_state_block11_end_sft.cjs
```


## Validation

Windows Node22 CI: **PASS, run 44481040196**.
