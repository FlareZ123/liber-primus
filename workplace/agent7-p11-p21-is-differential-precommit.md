# Agent7 precommit: paired signed IS receivers

**Sealed before opening either receiver's rune values in this invocation.**

## Upstream source selection

The already-frozen signed-index same-page census gives two occurrences of the same authenticated target:

```text
signed index 11 = IS -> physical p11 -> unique same-state receiver start49
signed index 21 = IS -> physical p21 -> unique same-state receiver start170
```

Because the plaintext target is identical, a shared additive architecture cancels the unknown plaintext in the receiver difference.

The source-visible coordinate deltas are fixed before inspecting either ciphertext:

```text
signed-index delta = 21 - 11 = 10 = A + K
receiver-start delta = 170 - 49 = 121
121 mod 29 = 5 = g
```

The repository's local key candidates are consistently represented by the already-frozen forward H shell

```text
H(x,y) = (x-y, x+y) mod29.
```

## Sealed prediction

Let the two-rune receiver ciphertexts be `C11` and `C21`, in source order. Define

```text
D = C21 - C11 mod29.
```

Test exactly one relation:

```text
H(D) == [10,5] == [A+K,g].
```

No reversed receiver order, alternate sign, H inverse, endpoint swap, different receiver, or alternative scalar pair is permitted after reveal.

Equivalently, the predicted raw ciphertext difference is the exact inverse-H image of `[10,5]`.

## Fork

- **Hit:** preserve a source-selected two-receiver key-state transition and test whether the same fixed differential rule predicts another duplicated authenticated target or independently selected sibling.
- **Miss:** reject this exact shared differential-shell interpretation. Do not rescue it with orientation/sign variants without a new first-party selector.

## Revealed result

After the precommit above was pushed and verified, the two frozen receivers were opened:

```text
p11 start49  C11 = [11,14]
p21 start170 C21 = [24,1]

D = C21 - C11 mod29 = [13,16]
H(D) = [26,0]
```

The sealed prediction was `[10,5]`, so it **fails**.

Per the precommitted fork, this exact shared differential-shell interpretation is rejected. No sign reversal, receiver reversal, H inverse, component swap, or alternate scalar target was tried as a rescue.
