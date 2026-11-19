# P0 27x27 block12: endpoint mirror and source-register path select exact IS

**Agent48, 19 November 2026. Classification: source/state-derived exact local inverse and strong retrospective closure of the public block12 candidate `IS`.** The public route was already known when this transition was reconstructed, so this is not a blinded plaintext discovery. The new result closes the exact key node and ciphertext path from prior state, original LP2 geometry, and the authenticated 2016 source register.

## 1. Block11 endpoint selects the previously failed seed mirror

The exact block11 receiver is:

```text
(19,23) -> (20,23) -> (21,23)
```

so its endpoint is `(21,23)`.

The earlier prospective block12 test had identified the state packet:

```text
[-B,q,-B] mod29 = [10,4,10].
```

It occurs exactly once in the original 27x27 object:

```text
radius1 H:
(21,21) -> (21,22) -> (21,23).
```

The newly established block11 endpoint is exactly its right outer coordinate. The prior test was therefore useful even though this three-cell seed is not itself the public key node: continuity now selects its center `(21,22)` without English.

## 2. A finite state transition uniquely expands the seed to [A,q,A]

Freeze the seed center, horizontal axis, center value `q=4`, outer value `-B=10`, and radius1.

Charge every pair of transitions:

- outer value plus or minus one authenticated state scalar from `{1,K,e,q,g,a,A,b,B,p}`;
- radius plus or minus one scalar from the same set, retaining radii1..13;
- require the resulting symmetric same-center triple to exist exactly in the original 27x27 object.

Exactly one transition survives:

```text
outer:  -B - K = 10 - 2 = 8 = A
radius: 1 + q = 5 = g
```

giving:

```text
[A,q,A] = [8,4,8]

radius g=5 H:
(21,17) -> (21,22) -> (21,27).
```

The two state identities are explicit:

```text
A = -B-K mod29
g = q+1.
```

Thus the larger public mirror is generated from the endpoint-selected seed by a unique bounded state transition rather than chosen from its English output.

## 3. The frozen node transform fixes the key

Apply the existing center-phi / Möbius-rotation transform:

```text
[8,4,8]
 -> center phi(4)=2
 -> [8,2,8]
 -> rotation1
 -> key [2,8,8].
```

## 4. The authenticated source register selects columns 9 -> 10

The selected key node lies on row21. Signed-source index21 is:

```text
21 IS.
```

The authenticated register has exactly one other occurrence of the same lexeme:

```text
11 IS.
```

Its two predecessors are:

```text
9  LIBER
10 PRIMUS
11 IS
```

Use those predecessor numbers in original order as the two columns on the already selected row21:

```text
(21,9) -> (21,10).
```

This selection is made from the signed register before opening the ciphertext.

Charge both IS occurrences, predecessor and successor pairs, and both pair orders. There are eight paths. Under the fixed block12 key, exactly one yields any solved/authenticated source-native word: the predecessor pair of the *other* IS occurrence in forward order, `9->10`.

Original ciphertext is:

```text
C = [12,23].
```

Decrypt with the fixed key:

```text
[12,23] - [2,8] mod29
= [10,15]
= IS.
```

Forward replay is exact.

A separate state expression lands on the same receiver start:

```text
row = B+K = 21
col = A+1 = 9.
```

This is supporting consistency; the authenticated duplicate-lexeme rule is the actual path selector charged above.

## 5. Scope

The reconstructed local route fragment now reads:

```text
OF THE END IS
```

This does not establish the remainder of the public 27x27 plaintext claim. Every block still requires an independent causal selector for its key source and ciphertext path. No block13 rule is inferred here.

## Reproduction

```text
node sims/lp2_p0_state_block12_is_sft.cjs
```
