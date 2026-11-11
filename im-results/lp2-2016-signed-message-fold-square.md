# Signed-2016 58-page fold square

**Status:** source-constrained intermediate mechanism. It does **not** recover unknown LP2 plaintext or an unknown key.

## Result

Using the canonical Gematria Primus prime values on the authenticated 2016 signed message yields three source-internal facts:

- `HELLO = LIBER = 243`. This is the only GP-prime-sum collision between distinct source words in the signed message.
- `FOUND - THE = 130 - 72 = 58`. This is the only pair of distinct source words whose sums differ by the LP2 page count, 58.
- `YOU + FOUND = 113 + 130 = 243`. This is the only pair of distinct source words whose sums total 243.

Treat a word sum as the zero-based Euclidean address

```text
sum = page + 58 * wordIndex
page = sum mod 58
wordIndex = floor(sum / 58)
```

Then the source values make a locked local prediction:

| label | GP-prime sum | address | printed destination |
|---|---:|---:|---|
| THE | 72 | p14:w1 | **FOLD** |
| FOUND | 130 | p14:w2 | NGC |
| YOU | 113 | p55:w1 | AEMIW |
| FOLD | 171 | p55:w2 | SB |

The first row follows from source words alone because FOUND = THE + 58. The destination at THE is the literal English word **FOLD**, whose GP-prime sum is 171. That closes a second 58-spaced row because FOLD = YOU + 58.

The four source labels therefore form

```text
THE    FOUND
YOU    FOLD
```

with a direct arithmetic fold:

```text
243 - THE = FOLD
243 - YOU = FOUND

THE + FOLD  = 243
YOU + FOUND = 243
HELLO = LIBER = 243
```

A diagonal fold through THE/FOLD swaps YOU with FOUND, matching the source sentence “Seek and you will be found.” The equal diagonal total is independently named twice by the source itself through the unique HELLO/LIBER collision.

This materially strengthens the earlier base58-word-map observation because the divisor 58 and the THE/FOUND adjacency are selected by a relation internal to the signed source, before reading p14.

## Solved-tail connection

FOLD has sum 171, so the same address rule selects p55:w2 `SB`. `SB` has sum 114, which selects p56:w1 `OESR`. The established p56 mechanism decrypts that ciphertext word to **END**.

This connection is useful as a consistency check, yet it is weak evidence by itself. Under the same pointer graph, 154 of 2,928 physical-word starts reach p56:w1, and 15 starts do so in exactly two steps. The source-internal 58/243 algebra carries more evidential weight than generic convergence to the solved tail.

## What did not survive discrimination

A literal center fold of the original p14 scan, tested vertically, horizontally, and in both axes, does not produce a clean registration of the page art or text. The p14 13-red-dot marker also recurs on several other LP2 pages, so its incidental match to one pointer-walk length is not a useful selector.

## Weakest assumptions

1. GP-prime sum is the intended “number” of an English source word.
2. The 58 LP2 images define the modulus.
3. Address orientation is `page = remainder`, `wordIndex = quotient`.
4. Word indices are zero-based, consistent with the 0–57 page numbering.
5. **FOLD** denotes the 243-complement/address-square operation rather than another fold mechanism.

The first four assumptions jointly make the FOLD destination a concrete prediction. The fifth remains the unresolved step.

## Next decisive experiment

Do not expand into arbitrary fold axes or generic cipher sweeps. The useful continuation must be derived from this square itself or another authenticated source clue and must specify an operation on original ciphertext that predicts unknown plaintext or key material. In particular, test whether the 243-complement relation selects a deterministic operation on the paired destination words NGC/AEMIW or on p14/p55 before introducing any tunable key or permutation.

## Reproduction

Run:

```text
node sims/lp2_2016_fold_square.cjs
```

The script recomputes source-word GP sums, uniqueness of the 243 collision, uniqueness of the 58-difference pair, the 243 pair, all four addresses, the FOLD destination, and the p55→p56 pointer.
