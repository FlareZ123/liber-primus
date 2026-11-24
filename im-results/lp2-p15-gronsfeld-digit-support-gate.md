# LP2 p15 decimal Gronsfeld digit-support attack

Director task [#2539](https://github.com/FlareZ123/liber-primus/issues/2539); Agent2, 2026-11-24. Distinct from the existing modulo-29 integer-cell spiral tests.

## Frozen construction

Historical Gronsfeld is decimal-digit-key Vigenere, assigning shifts 0–9; see the 1939 historical account [Fletcher Pratt, *Secret and Urgent*](https://files.4in1.ws/Fletcher%20Pratt%20-%20Secret%20and%20urgent%20-%20the%20story%20of%20codes%20and%20ciphers%20%281939%29.pdf), and [CrypTool description](https://legacy.cryptool.org/en/cto/gronsfeld.html). Adapt to GP29 with the authentic p56 convention: for nonzero plaintext p, c=(p+d) mod 29 and consume one digit d; plaintext F=0 bypasses without consuming. Enciphered non-F may become ciphertext F. All legal inverses are branched.

Source-fixed digits: concatenate the 16 original printed decimal numerals in the uniquely recovered red-origin Fibonacci-prime spiral order, with no padding or integer-cell reduction:

```
329932983296329432883278325832223152303828382472182070812064516
```

63 digits, cyclic, phase zero immediately after the p15 13-dot mark at rune offset 20; target continues through p22. Corpus/transcript agreement and chapter boundaries are asserted: 1,883 runes, 432 complete words.

## Results

The optimistic support test discards every relationship between consecutive key digits, allowing an arbitrary d in 0..9 at each consuming rune. Dictionary compatibility requires each plaintext rune to satisfy the exact support condition. This is a genuine upper bound on coverage under any decimal digit schedule, conditional on the finite 38,920-word native GP lexicon and fixed word boundaries.

- Original: at most 391/432 words and 1,511/1,883 runes can be dictionary-compatible. 41 words, comprising 372 runes, have no compatible dictionary spelling even with arbitrary independent digits.
- Positive control: all 73/73 native words, 292/292 runes compatible.
- Hidden periodic digit-key plant: exact partial-key trie CSP learned all eight digits [3,8,4,1,9,0,7,2] from 154 training runes (unique after two words). Its 138-rune withheld continuation decoded exactly; full 292-rune replay exact. The dictionary contains native source words, but the plant key was never used as a CSP constraint.
- Original fixed 63-digit tape: lexical DP dies at word index 1 (after 4 runes). More decisively, even with **no language or dictionary constraint**, all legal plaintext-F paths die at zero-based chapter rune 35, corresponding to p15 local rune 55. This cannot be repaired by an out-of-vocabulary word. The remaining original continuation was not fitted or used to select another tape.

The broad digit-support bound is lexicon-conditional, not a universal exclusion of all possible digit keys. The specific source-ordered repeated decimal tape is mathematically impossible under the frozen F convention, start, and sign. No recovered original plaintext or key. Retire this exact schedule; do not treat the independently decoded spiral as proven key material.

Reproducer: [sims/lp2_p15_gronsfeld_digit_support_sft.cjs](../sims/lp2_p15_gronsfeld_digit_support_sft.cjs), executed against current original corpus and native controls via a read-only JS filesystem shim. Code commit baf1ddee7404f588521c46c63d38a586ed57af3c.
