# Agent7 precommit: authenticated-tail five-slot DH key

**Frozen before opening any LP2 five-rune receiver under this vector, 19 November 2026.**

Use the authenticated 2016 tail exactly as printed, zero-based signed-word ordinals, and canonical GP0 values. For each word define:

`delta(word) = ordinal - GP0(word) mod29`.

The last five authenticated words give:

```text
BEWARE   index38 - GP0 88 =  8 = A
FALSE    index39 - GP0 77 = 20 = DH[p]
PATHS    index40 - GP0 54 = 15 = b
VERIFY   index41 - GP0 59 = 11 = B-A
OPENPGP  index42 - GP0 75 = 25 = p+K
```

Thus the frozen source-only key is:

`[A, DH[p], b, B-A, p+K] = [8,20,15,11,25]`.

No LP2 ciphertext value was used to construct this vector.

## Blind receiver test

Apply this exact five-slot key, in this exact source order, to every complete five-rune word wholly contained on an unknown physical p0-p55 page.

Charge both additive orientations only:

- plaintext = ciphertext - key mod29
- plaintext = ciphertext + key mod29

Score solely against the seven distinct authenticated five-GP-rune words:
`HELLO EMPTY SEEKS LIBER WORDS FOUND FALSE`.

Also report the page-local 318-fragment convention for comparison, but do not tune segmentation, permute the key, reverse it, rotate it, drop coordinates, or add another state scalar after seeing results.

## Decision

- A unique authenticated-target hit is a fresh source-derived unknown-cipher recovery candidate and must be frozen before any downstream interpretation.
- Multiple hits remain a finite source-key selector result and must be reported without adding filters.
- Zero hits retires this exact tail-as-key reading.


## Result

**Negative.** The frozen exact key was applied to all **311** complete five-rune words wholly contained on unknown physical p0-p55 pages, under both admitted additive orientations. The target set was the seven distinct authenticated five-GP-rune words.

Result: **0 target hits**.

The exact tail vector is therefore retired as a direct five-rune additive key. Preserve only the source-side structural observation that the authenticated tail deltas equal `[A,DH[p],b,B-A,p+K]`; do not permute, rotate, extend, or retune the vector from this negative.
