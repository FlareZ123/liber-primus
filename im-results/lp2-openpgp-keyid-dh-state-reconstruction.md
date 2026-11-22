# Signed OpenPGP key ID: post-hoc DH-state correspondence, not an authenticated state reconstruction

**Critic correction, 19 November 2026.** The arithmetic observations below are reproducible, but the previous classification as an "authenticated-source state reconstruction" was too strong. The source authenticates the literal key ID `7A35090F`; it does not authenticate a mapping from its nibble positions or values to the already-known DH fields. That mapping was constructed after the target state was available.

## Verified arithmetic

The authenticated 2016 message contains:

```text
Verify OpenPGP 7A35090F.
```

Reading the hexadecimal nibbles gives:

```text
[7,10,3,5,0,9,0,15]
```

Applying the previously used outside-in arithmetic transform

```text
H(x,y) = (x-y, x+y) mod29
```

to the four outside-in pairs gives:

```text
H(7,15) = [21,22]
H(10,0) = [10,10]
H(3,9)  = [23,12]
H(5,0)  = [5,5]

=> [21,22,10,10,23,12,5,5]
```

These computations are facts about the chosen transform.

## The previously reported DH labels are conditional fits

Given the already-reconstructed candidate state

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, F=0
```

the raw nibble vector can be *described* as:

```text
[g+K, K*g, e, g, F, b-a, F, b]
```

and the H output can be *described* as:

```text
[p-K, p-1, K*g, K*g, p, K*a, g, g].
```

Those descriptions reproduce the numbers exactly. They do not show that the key ID independently determines the state, because the expression template was not fixed by the source before the target state was known.

The earlier 16-orientation test is therefore conditional on a post-selected template. It answers "which orientation best matches this chosen template?" It does not charge the much larger choice of template itself.

## Small-expression multiplicity check

To quantify the missing model-selection charge, use a deliberately tiny expression grammar over the already-known fields:

- each direct field in `{p,g,a,b,A,B,K,e,F}`;
- `x+1` and `x-1`;
- pairwise `x+y`, `x-y`, and `x*y` modulo29;
- commutative `+` and `*` expressions counted once.

Under this grammar, the numbers in the raw key-ID vector have respectively:

```text
7:  7 expressions
10: 6
3:  8
5:  7
0: 21
9:  8
0: 21
15: 6
```

That is **49,787,136** coordinate-wise expression assignments before adding any larger DH grammar.

The H-shell values have:

```text
21: 5 expressions
22: 5
10: 6
10: 6
23: 6
12: 5
5:  7
5:  7
```

That is **1,323,000** coordinate-wise assignments in the same tiny grammar.

Examples of immediate alternatives include:

- `7 = g+K = A-1 = a+1 = p*p mod29`;
- `10 = g*K = g+g = A+K = b-g`;
- `9 = b-a = a+e = A+1 = B*K mod29`;
- `21 = p-K = B+K = a+b mod29`;
- `22 = p-1 = B+e = p*a mod29`.

This does not prove the observed pattern is meaningless. It proves that "exactly expressible in DH-state arithmetic" is not an identifying criterion after the state is already known.

## What survives

The following should be preserved as candidate-level evidence:

1. the first-party key ID is authentic;
2. the selected H transform yields the exact numeric shell above;
3. the printed orientation is the unique orientation matching the *chosen* DH template;
4. the PRIMUS / NUMBERS / OPENPGP p50 observations are additional arithmetic correspondences worth testing under their own source-selection gates.

The following claims are withdrawn pending a predeclared mapping grammar or an independent withheld prediction:

- that the key ID **alone reconstructs** `p,g,a,b,A,B,K,e`;
- that the key ID is an **independent authentication** of the p28 DH state;
- that the source itself assigns the raw or H-shell coordinates to those DH expressions.

A valid upgrade would require a source-visible rule that fixes the coordinate-to-expression mapping before opening the state, or a bounded expression family with a familywise null plus a genuinely withheld consequence.

## Reproduction of the multiplicity count

For each state field, evaluate the direct field, `x±1`, every ordered subtraction `x-y`, and each unordered addition/product pair modulo29. Deduplicate textual expressions and count those evaluating to each target coordinate. The counts above follow directly from that finite grammar.
