# Agent38 precommit: PATHS -> p50[54]=2a -> p0 word35

Date: 2026-11-19
Run: agent38-gpt5.6sol-20261119T015717Z-draw8-73bb85c8419d
Status: precommit before targeted inspection of p0 word35 values.

## Frozen upstream facts

Use only the already published candidate plaintext PATHS and the independently reconstructed p28 DH state:

```text
PATHS GP29 = [13,24,2,15]
GP0(PATHS) = 54
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2)
```

The p50 table gives:

```text
p50[54] = 2a
base60(2a) = 156
drop-f base59(2a) = 154
```

The unchanged p0 word geometry has word35 spanning zero-based rune offsets 154..157, length4. Therefore the same drop-f/base59 convention already used in the preceding LUCK -> PATHS navigation selects the **start** of p0 word35.

The token is also source-readable without numeric decoding: digit `2` equals DH state `K=2`, and the literal character `a` names the DH scalar `a=6`. This motivates testing the pair (K,a) rather than searching arbitrary DH values.

## Frozen finite key family

Before opening the selected four ciphertext runes, test only these simple four-rune additive keys derived from the visible pair (K,a), with both subtraction and addition:

1. repeated literal pair: [K,a,K,a]
2. repeated swapped pair: [a,K,a,K]
3. repeated H(K,a): H(K,a)||H(K,a)
4. repeated H(a,K): H(a,K)||H(a,K)
5. outer literal / inner H: [K,H(K,a)[0],H(K,a)[1],a]
6. outer swapped / inner H: [a,H(a,K)[0],H(a,K)[1],K]
7. H-shell inversion of [K,a,K,a]
8. H-shell inversion of [a,K,a,K]

Here H(x,y)=(x-y,x+y) mod29. Deduplicate numeric keys before scoring.

Score outputs only against the authenticated 2016 four-GP-rune vocabulary already used in prior charged controls:
LIES, THEIR, MEANING, ROAD, SEEK, WILL, GOOD, LUCK, PATHS.

No key permutation, phase, extra scalar, token reinterpretation, or target expansion is allowed after the receiver is opened.

## Decision rule

- Exact authenticated-target hit: preserve the key, forward replay, whole-manuscript fixed-key specificity, and compare the same token rule on other signed-word p50 addresses.
- No hit: close this exact PATHS/2a literal-pair receiver and do not rescue it with extra DH arithmetic.

This test can strengthen or reject one direct prospective continuation of the published local chain. It does not independently authenticate PATHS itself.
