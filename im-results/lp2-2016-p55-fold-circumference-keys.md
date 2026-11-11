# Source-selected p55 fold recovers CIRCUMFERENCE and two historical key totals

**Status:** strong source-constrained intermediate mechanism. It does not yet decrypt unknown LP2 plaintext.

## Route from the authenticated 2016 clue

The authenticated 2016 sentence contains **“epiphany seeks the devoted.”** Under the previously documented GP-prime / 58-page address rule:

- `seeks` has GP-prime sum **253**, selecting p21:w4, whose unchanged printed ciphertext is the literal word **MY**.
- `the` has GP-prime sum **72**, selecting p14:w1, whose unchanged printed ciphertext is the literal word **FOLD**.

So the adjacent source phrase **“seeks the”** maps to the adjacent readable instruction **“MY FOLD.”** Its two destination numbers are also tightly related: `MY=174=3×58`, `FOLD=171`, hence their difference is **3**.

The already established next address from **FOLD=171** is p55:w2.

## Fold the 17 printed words of p55

Physical p55 contains exactly **17** printed words. Folding the word sequence about its unique middle word gives the involution

```text
i <-> 16-i
```

The source-selected p55:w2 therefore pairs with p55:w14.

| role | index | printed GP word | GP-prime sum |
|---|---:|---|---:|
| FOLD-selected word | 2 | `SB` | 114 |
| mirror partner | 14 | `CEAIMCX` | 284 |
| natural fold pivot | 8 | `MSDIAPF` | 365 |

The mirror pair gives

```text
114 + 284 = 398 = GP-prime sum(CIRCUMFERENCE)
```

The unique fold pivot gives

```text
365 = GP-prime sum(FIRFUMFERENFE)
```

`FIRFUMFERENFE` is the historical Gematria spelling used as the known A-KOAN key for **CIRCUMFERENCE**. The numerical difference is exactly explained by the three C→F substitutions in that spelling: each substitution changes the prime value by `13-2=11`, so `398-3×11=365`.

## The p32 source counts recover DIVINITY and the same historical key total

Two p32 counts were established independently before this fold result:

- p32 contains exactly **22 printed words**.
- its first punctuated clause contains exactly **33 runes**.

Those counts give

```text
398 - 22 = 376 = GP-prime sum(DIVINITY)
398 - 33 = 365 = GP-prime sum(FIRFUMFERENFE)
```

This makes the solved p57 instruction “shed our own circumferences / find the divinity within” numerically concrete: subtract the p32 word count from **CIRCUMFERENCE** and the result is exactly **DIVINITY**. Subtract the p32 first-clause rune count and the result is exactly the historical CIRCUMFERENCE-key spelling.

The result does not yet specify which unknown ciphertext should be decrypted with either key.

## Corpus discriminator

The page and fold were selected before this check: FOLD points to p55:w2, and a 17-word sequence has one natural center.

Across all **34** unsolved LP2 pages with an odd printed-word count of at least five:

- p55 is the **only** page whose center word has GP-prime sum **365**.
- p55 is the **only** page whose fixed index-2 mirror pair has GP-prime sum **398**.
- p55 is therefore the only page satisfying both conditions.

This strongly favors an intentional word-fold interpretation of p55 over a generic page-number coincidence.

## Scoped negatives

Two immediate continuations were tested and rejected:

1. The known first A-KOAN reversed-GP ±3 operation, suggested by `MY-FOLD=3` and the independent `A KOAN=243` sum, does not decrypt the p30–33 pages selected by the surrounding source words `epiphany` and `devoted`.
2. Direct Vigenere-style application of **DIVINITY** or **FIRFUMFERENFE** to p32 and its natural concentric square interiors does not recover readable plaintext under the straightforward historical variants.

These failures narrow the problem to **where and how the recovered key material is meant to act**. They do not weaken the exact p55 fold equalities.

## Next decisive question

Use the fold structure itself to select the ciphertext target or key application. Avoid broad key sweeps. A successful continuation should explain, from source-visible structure, why one of the recovered totals **398 / 376 / 365** applies to a particular unknown LP2 span and should predict readable plaintext before tuning.

## Reproduction

Run:

```text
node sims/lp2_2016_p55_fold_keys.cjs
```

The script recomputes the 2016 source addresses, the MY/FOLD destinations, the p55 fold, the historical key totals, the p32 22/33 counts, and the complete odd-page uniqueness check.
