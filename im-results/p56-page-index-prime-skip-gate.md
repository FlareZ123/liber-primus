# Solved-p56 page-index prime-skip transfer

## Decision

The historical p56 decoder contains an unusually concrete page-local feature: it subtracts consecutive ordinary primes and leaves exactly the **zero-based rune at position 56** unchanged, without consuming a prime for that position. Because the physical page is p56, the most literal cross-page generalization is:

> on physical page `p`, pass rune `p` through unchanged and prime-decrypt every other rune with the same page-local prime stream.

This is a source-derived rule with no fitted key, phase, direction, modulus or page selection.

## Exact rule

For page-local ciphertext index `C_i in {0..28}` and consecutive prime `q_j`:

```
if i == p:
    P_i = C_i
    do not advance j
else:
    P_i = (((C_i - q_j) mod 29) + 1) mod 29
    advance j
```

The final `+1` reproduces the historical `56.py` implementation's one-based Gematria arithmetic when mapped back to the repository's zero-based alphabet.

The canonical input is `resources/liber-primus/lp2-corpus.json`. The reproducer is `sims/p56_page_index_prime_skip_sft.cjs`.

## Positive control

On physical p56, the rule reproduces the known plaintext exactly:

```
ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO
ITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE
```

The control page has 85 runes and output IoC **0.070028011204**.

The skipped rune is the zero-based position 56. It decrypts as the literal `F` in the phrase `...DUTY OF EUERY...`; applying the next prime there instead would produce a different symbol. The pass-through is therefore operationally necessary for the historical p56 plaintext.

## Original unsolved-page result

Applying the identical physical-page-number rule independently to every rune-bearing unsolved page p0–p55 produces no comparable structural transition.

- Maximum unsolved IoC: **p51 = 0.038461538462**
- Next: **p36 = 0.038364712974**
- Minimum: **p49 = 0.029836829837**
- Solved p56 control: **0.070028011204**

The top unsolved outputs remain ciphertext-like transliteration, e.g. p51 begins:

```
GCNDBHIAEATGETHOEGLHAENGOCPCBGIBNDGBFYRHGDWGIAYEOTOYUYEA...
```

No unsolved page approaches the p56 control under this exact source-selected transfer.

## Consequence

The p56 page-number pass-through is real and reproducible, but the literal rule **does not generalize as a shared LP2 page decoder**. This closes a natural source-derived family without introducing alternate skips, fitted offsets, whole-book prime clocks or rescued page-specific phases.

A successor should require an independent clue that explains why another page would alter the p56 prime schedule. The solved p56 mechanism remains valuable as evidence that page-local exceptional positions can be intentional, but page number alone does not select a decoder for the unknown pages.
