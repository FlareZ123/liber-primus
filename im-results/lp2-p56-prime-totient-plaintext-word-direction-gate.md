# p56 prime-totient key with causal plaintext-word direction

**Status:** bounded source-derived negative; no unknown LP2 plaintext recovered.

## Human solve-path hypothesis

The solved p56 page establishes a concrete key stream: consecutive prime totients φ(p)=p−1, reduced modulo GP29. The signed 2016 message says word numbers give direction; LP1 p05 names primes and MOBIUS. A plausible human attempt is therefore to use the authentic p56 key stream, but let each recovered plaintext word's number choose the direction of the next word's key traversal.

This is explicitly **causal**. Start at the first prime (p=2) and move forward through the key during the first word. After decrypting a word, compute the sum (S) of its GP prime values; use either primality or μ(S) to set the direction for the next word. The key stream is not cyclic: it is the authentic unbounded prime-totient sequence, and a negative pointer is an invalid path. No page resets, offsets, key wraps or fitted parameters are allowed.

## Frozen mechanism

- Key: (K_i=(p_i-1)\bmod29), where (p_i) is the (i)-th prime starting with 2.
- Direction is selected from the **previous plaintext word's** GP-prime sum.
- Prime selector: prime/composite choose opposite directions; both polarities tested.
- Möbius selector: μ(S)=+1/-1 choose opposite directions; μ(S)=0 holds the pointer for the next word; both polarities tested.
- Both arithmetic signs (C=P+K) and (C=P-K) tested.
- Original p0–p55 word segmentation: 2,896 words, 12,956 runes, asserted byte-for-byte against the canonical corpus.

## Results

The Shakespeare GP29 trigram model trained on the first 240,000 characters scores **−2.21915** on training and **−2.36417** on held-out text; uniform mean is **−3.36730**. Untouched LP2 scores **−4.60956**.

| Selector | Direction polarity | Sign | Outcome |
|---|---|---|---|
| Prime/composite | Prime backward, composite forward | (C=P+K) | Valid; logL −4.62773 |
| Prime/composite | Prime backward, composite forward | (C=P-K) | Valid; logL −4.63235 |
| Möbius | μ=−1 forward, μ=+1 backward, 0 hold | (C=P-K) | Valid; logL −4.61258 |
| Other five polarity/sign cases | — | — | Pointer underflows below prime index 0 (by word 3, 5 or 21) |

The three valid outputs are ciphertext-like and remain about 2.25 nats/rune below native English. The best, Möbius (C=P-K), scores **−4.61258**, effectively the untouched ciphertext baseline. The valid prime/composite models pass exact constant-zero synthetic round trips; the valid Möbius candidate re-encrypts the original 12,956-rune ciphertext exactly. The invalid cases fail the nonnegative-key-index constraint before completing the book.

## Decision and limits

Reject these exact causal word-direction transfers of the p56 prime-totient key. This does not exclude a different key source, a different source-defined word number, or a separate page-local schedule. Do not add arbitrary starting offsets, key wraps, or direction functions to rescue the route.
