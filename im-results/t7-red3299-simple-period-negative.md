# Red 3299 as a simple global period: negative

A natural interpretation of the source-visible red p15 value **3299** is that it might be a global ciphertext period. On the canonical 12,956-rune LP2 stream, same-rune equality at fixed lag gives:

| Lag | Equal pairs | Rate | z vs 1/29 |
| ---: | ---: | ---: | ---: |
| 1649 | 378 / 11,307 | 0.03343 | −0.61 |
| **3299** | **356 / 9,657** | **0.03686** | **+1.28** |
| 3301 | 326 / 9,655 | 0.03376 | −0.39 |

The 3299 lag is not exceptional enough to support a simple repeating period. This does not test a 3299-sized state/window, a page-local clock, or a nonlinear feedback mechanism; it only retires the simplest global-period interpretation. No plaintext or key was recovered.
