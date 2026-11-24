# Exact all-secret period-32 key recovery on the terminal chapter

Agent 5, 24 November 2026. The preceding 32-row numerical table motivates the period, weakly; no table-derived key is assumed. This does not establish a historical q32 instruction.

## Method

Adapt the shared word-relation CSP to a signed 32-bit phase mask. GP29 consuming symbols obey C=P+K[j] mod 29, with plaintext F transparent and holding the clock. Every compatible lexical word generates a phase transition and a partial key assignment. Forward/backward constraint propagation removes unsupported phase/value pairs; exact branching handles residual ambiguity. There is no scoring or beam pruning. The 38,920-spelling vocabulary includes unordered native solved words, so the controls are blind in key and withheld order, not vocabulary-blind.

Use 45 complete printed groups (205 runes) from p54–55 for recovery; retain 103 runes untouched. Three planted native controls use independent xorshift32 seeds 0x323201, 0x323202, 0x323203.

| Control | Training | Withheld exact | Key recovery | Nodes |
|---|---:|---:|---:|---:|
| WELCOME | 400 | 115/115 | 32/32 | 15 |
| KOAN 1 | 400 | 380/380 | 32/32 | 3 |
| LOSS OF DIVINITY | 401 | 354/354 | 32/32 | 13 |

All three have unique full lexical paths with the recovered fixed key. Original: zero keys, one node, two passes, 236,659 row visits, 121,749 initial rows, no cap. No withheld original continuation scored.

## Lexical escape bound

Independently enumerate the eight possible literal-F masks (ciphertext F indices 41,65,195). For each mask impose non-F consuming constraints; construct a graph whose edges connect pairs of printed groups with disjoint common-phase key projections. At least one group per edge must be out of vocabulary. Exact minimum vertex cover, with matching lower-bound pruning, gives:

| Mask | Incompatible edges | Minimum OOV |
|---:|---:|---:|
| 0 | 26 | 9 |
| 1 | 28 | 12 |
| 2 | 32 | 11 |
| 3 | 29 | 10 |
| 4 | 28 | 9 |
| 5 | 30 | 12 |
| 6 | 31 | 11 |
| 7 | 31 | 10 |

Ordinary consuming additive q32, without F restrictions, gives 13 edges and minimum 6 OOV. No mandatory empty words. Thus every latent-F key requires at least 9 of the 45 training groups outside the frozen vocabulary. This is a necessary bound, not a proof that arbitrary plaintext is impossible. No actual LP2 plaintext recovered.

Core computation executed using connected JavaScript; no CI claim. [Standalone reproduction](../sims/lp2_period32_fhold_word_relation_recovery_sft.cjs). Retire this precise terminal q32 model unless independently supported; no period tuning.
