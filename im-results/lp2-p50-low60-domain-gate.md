# p50 low60 class is not a complete 0..59 permutation

**Decision, Agent 13, 18 November 2026.** Director Issue #1561 tested the exact 60 p50 cells in the validated low-value/leading-zero class. Their low digits are highly duplicated. Under the conventional base60 reading, the 60 cells contain only **36 distinct values**. The multiset therefore fails the complete-domain test.

This closes the proposed rank-map interpretation. The 60-cell class remains a discrete source category associated with adjacent-equal ciphertext events, while its membership does not enumerate every value from 0 through 59 once.

## Exact source object

The canonical 256-cell p50 table contains exactly 60 tokens whose first printed character is `0`. Their row-major tokens are:

`04 0F 0X 0x 0P 0d 0s 05 0S 0G 0l 0x 0p 0P 0k 0w 0S 0n 0u 0Z 0Y 0W 0V 0E 0W 0s 0Z 0g 0s 0D 0K 0A 0D 0k 0X 0E 0q 0I 0s 0I 0e 0J 0c 0X 00 0l 0L 0v 06 0x 0w 0q 0p 0q 00 0W 0g 0M 0u 0a`.

### Conventional base60

Using `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, the exact row-major low values are:

`4,15,33,59,25,39,54,5,28,16,47,59,51,25,46,58,28,49,56,35,34,32,31,14,32,54,35,42,54,13,20,10,13,46,33,14,52,18,54,18,40,19,38,33,0,47,21,57,6,59,58,52,51,52,0,32,42,22,56,36`.

There are **36 distinct values**. Missing values from 0..59 are:

`1,2,3,7,8,9,11,12,17,23,24,26,27,29,30,37,41,43,44,45,48,50,53,55`.

Repeated values and multiplicities are:

`0×2, 13×2, 14×2, 18×2, 25×2, 28×2, 32×3, 33×3, 35×2, 42×2, 46×2, 47×2, 51×2, 52×3, 54×4, 56×2, 58×2, 59×3`.

### Documented drop-f base59 alternative

Under the documented source-compatible alphabet with lowercase `f` removed, the same 60 printed cells again contain **36 distinct values**. The domain is 0..58. Missing values are:

`1,2,3,7,8,9,11,12,17,23,24,26,27,29,30,37,42,43,44,47,49,52,54`.

Repeated values are:

`0×2, 13×2, 14×2, 18×2, 25×2, 28×2, 32×3, 33×3, 35×2, 41×2, 45×2, 46×2, 50×2, 51×3, 53×4, 55×2, 57×2, 58×3`.

This alternative has only 59 possible low digits, so a 60-element exact 0..59 permutation is impossible under its own digit domain in addition to the observed duplicates.

## Consequence

The hard construction hypothesis in #1561 is rejected directly by the original tokens. There is no source-native rank permutation to hand to a decoder. The existing low60 association should continue to be treated as a binary class until another independent clue selects a richer operation.

Reproduction: `sims/lp2_p50_low60_domain_sft.cjs`.
