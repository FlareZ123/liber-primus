# Authenticated 2016 GP0 word collisions reconstruct the complete DH23 state

**Agent27, 19 November 2026. Classification: strong source-side state reconstruction under the frozen H operation. No unknown LP2 ciphertext is consumed. The construction was recognized after H and the p28 DH interpretation were already known, so it is evidence for an intended source/state mechanism rather than an independent discovery probability.**

## Result

The authenticated 2016 signed message contains 43 natural-language words. Read their positions zero-based, encode each word in canonical GP29, and compute its additive GP0 word number.

The message itself says that its words form a map, their meaning a road, and their numbers a direction. Under the already fixed outer-pair operation

```text
H(x,y) = [x-y, x+y] mod29,
```

four source-visible word-number collisions reconstruct the entire p28 Diffie-Hellman state:

```text
THEIR occurs at 19 and 25
H(19,25) = [23,15] = [p,b]

IS occurs at 11 and 21
H(11,21) = [19,3] = [B,e]

GP0(ROAD) = GP0(PATHS) = 54
H(23,40) = [12,5] = [K*a,g]

GP0(MEANING) = GP0(FALSE) = 77
H(20,39) = [10,1] = [K*g,a-g]
```

These equations solve, without reading any LP2 ciphertext:

```text
p = 23
b = 15
B = 19
e = 3
g = 5
a = g + (a-g) = 5 + 1 = 6
K = (K*a) / a mod29 = 12 / 6 = 2
A = g^a mod p = 5^6 mod23 = 8
```

and then independently close the remaining relations:

```text
K*g mod29 = 2*5 = 10
b^-1 mod(p-1) = 15^-1 mod22 = 3 = e
g^b mod p = 5^15 mod23 = 19 = B
A^b mod p = 8^15 mod23 = 2 = K
B^a mod p = 19^6 mod23 = 2 = K
```

The recovered tuple is therefore exactly:

```text
(p,g,a,b,A,B,K,e) = (23,5,6,15,8,19,2,3).
```

This is the same DH23 state previously reconstructed from p28 and, more recently, from the signed-word direction-graph topology, now obtained from a materially different source-only invariant.

## Held-out semantic consequence: the state indexes the clue text itself

The state reconstruction above does not use the first signed clause after the opening `THE` as a target. Once the tuple is fixed, reuse the independently established source ratio

```text
q = GP0(EMPTY) / p = 92 / 23 = 4.
```

Now read the following state values as zero-based signed-word numbers:

```text
[K, e, q, g, a, g+K, A]
= [2, 3, 4, 5, 6, 7, 8].
```

Those positions are exactly:

```text
2 PATH
3 LIES
4 EMPTY
5 EPIPHANY
6 SEEKS
7 THE
8 DEVOTED
```

so the reconstructed state points to the complete source wording

```text
PATH LIES EMPTY
EPIPHANY SEEKS THE DEVOTED
```

without choosing a new cipher target.

Three primary state values also index the later self-referential instruction anchors directly:

```text
b = 15 -> WORDS
B = 19 -> THEIR
p = 23 -> ROAD
```

This is a substantially stronger human-solve-path consequence than the algebra alone. It ties the recovered numeric state to the message's own clue vocabulary and gives literal operational force to the statement that the words are a map and their numbers are a direction.

The chronology remains retrospective with respect to recognizing this index grammar, while the `q=GP0(EMPTY)/p` relation itself predates this collision reconstruction in the p32 DIVINITY route.

## Why these pairs are a bounded family

The reconstruction does not start from an unconstrained search over arbitrary source word pairs.

Two pair classes are defined before state scoring:

1. **Exactly-twice lexical words.** Four source words occur exactly twice:
   - IS: positions 11,21 -> H = [19,3]
   - ARE: positions 16,27 -> H = [18,14]
   - THEIR: positions 19,25 -> H = [23,15]
   - AND: positions 24,31 -> H = [22,26]

2. **Distinct lexical words sharing GP0.** Taking first occurrences and chronological H order gives eight pairs:
   - HELLO/LIBER, GP0 69 -> [20,9]
   - WAY/WILL, GP0 57 -> [9,17]
   - MAP/AND, GP0 56 -> [23,13]
   - MAP/SEEK, GP0 56 -> [17,19]
   - AND/SEEK, GP0 56 -> [23,25]
   - MEANING/FALSE, GP0 77 -> [10,1]
   - ROAD/PATHS, GP0 54 -> [12,5]
   - BE/GOOD, GP0 35 -> [27,12]

Charge every assignment of one exactly-twice pair to `[p,b]`, a different exactly-twice pair to `[B,e]`, one distinct GP0 collision to `[K*a,g]`, and a different distinct collision to `[K*g,a-g]`.

That is exactly:

```text
4 * 3 * 8 * 7 = 672
```

role assignments.

Require, without importing the known state values:

- `p` prime;
- all DH scalars in their valid ranges;
- `e = b^-1 mod(p-1)`;
- `B = g^b mod p`;
- `K*g = Kg mod29`;
- `A = g^a mod p`;
- `K = A^b mod p = B^a mod p`.

Exactly **one of 672** assignments closes the complete system:

```text
THEIR/THEIR     -> [p,b]
IS/IS           -> [B,e]
ROAD/PATHS      -> [K*a,g]
MEANING/FALSE   -> [K*g,a-g]
```

No p28, p0, p38, p50 ciphertext value, candidate plaintext, or previously known state number enters that family search.

## Source semantics

The successful words are concentrated inside the message's self-referential instruction:

```text
... ITS WORDS ARE THE MAP
THEIR MEANING IS THE ROAD
AND THEIR NUMBERS ARE THE DIRECTION ...
... BEWARE FALSE PATHS ...
```

That wording does not prove the arithmetic interpretation by itself. It materially improves the human solve-path plausibility, because the successful pairs use the literal control words THEIR and IS plus ROAD/PATHS and MEANING/FALSE, rather than unrelated lexical collisions elsewhere in the message.

The ROAD/PATHS pair is also the independent source derivation of the p0 ROAD key prefix reported in `lp2-road-paths-signed-index-depth-key.md`.

## Exact-token-multiset positional null

The SFT includes a familywise calibration that preserves:

- all 43 source word tokens;
- every repeated word;
- every GP0 identity and collision group;
- the complete 672-role DH search.

It shuffles only the word positions. Ten deterministic seeds each run 100,000 shuffled messages, for **1,000,000** total positional controls. Every shuffled message is counted positive if **any** role assignment closes a valid DH system.

This calibration is intentionally harder than testing the observed state alone. Windows / Node.js 22 run **44451118583** passed with **16 hits in 1,000,000 controls**, empirical familywise rate **0.000016**. Because the state grammar and H interpretation were recognized after the existing DH work, the null is a calibration of selectivity rather than a discovery p-value.

## Consequences

### 1. The authenticated 2016 message itself carries the DH23 state under H

The p28 state no longer depends on a single manuscript-local interpretation. A source entirely outside the unknown LP2 ciphertext reconstructs the same complete tuple from word positions and GP0 collisions.

### 2. H gains a source-side transfer

This is a materially different input domain from p28 local rune geometry. The same fixed forward H operation converts authenticated word positions into a closed DH state. That is direct evidence relevant to the open question of whether H is an authored reusable operation rather than an analyst convenience.

The chronology remains important: H was already in active use before this source encoding was noticed.

### 3. ROAD key provenance strengthens further

The ROAD/PATHS collision gives `[K*a,g]=[12,5]` directly. Together with the direction-graph depth pair `[a-g,4]=[1,4]`, it yields the independently replayed p0 ROAD key `[12,5,1,4]`. The p38 reciprocal state packet independently contains `[g,K*a,B]=[5,12,19]`.

### 4. The next test should consume this source state prospectively

Do not expand into arbitrary new source-pair arithmetic. The productive next step is to freeze a receiver selected independently of these four pairs and require the reconstructed source state to predict a new key, state transition, or plaintext before opening that receiver.

## Reproduction

Run:

```text
node sims/lp2_signed2016_gp0_collision_dh_state_sft.cjs
```

The SFT reconstructs GP29 word numbers from the authenticated 2016 source, enumerates the complete repeated-word and distinct-GP0 collision families, charges all 672 DH role assignments, proves uniqueness of the exact state closure, verifies the state-indexed clue block and WORDS/THEIR/ROAD anchors, and runs the one-million-control exact-token-multiset positional calibration. Windows / Node.js 22 run **44451466805** passed the complete collision, null, and semantic-index checkpoint.
