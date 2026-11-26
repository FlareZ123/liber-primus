# External research reference: Dukotah/cicada3301 Rounds 45–47

**Repository:** https://github.com/Dukotah/cicada3301  
**Pinned revision inspected:** [fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb](https://github.com/Dukotah/cicada3301/commit/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb), 2026-11-25.

This independent repository contains a substantial current research program. Relevant files:

- [Current pickup / status](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/PICKUP-HERE.md)
- [Round 45 synthesis: printed word order](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round45/SYNTHESIS.md)
- [Round 45 W1 results](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round45/W1-spaces/RESULTS.md)
- [Round 46 corrected word-loader results](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round46/L1-word-loader/RESULTS.md)
- [Round 46 word loader implementation](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round46/L1-word-loader/words.py)
- [Round 47 synthesis](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round47/SYNTHESIS.md)
- [Round 47 H1 pre-registration](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round47/H1-heavy-lifts/PREREG.md)
- [Round 47 H1 results](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round47/H1-heavy-lifts/RESULTS.md)
- [Round 47 H2 hardening results](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round47/H2-harden/RESULTS.md)

## Key findings and limitations

1. **Word loader:** Round 46 corrects the LP2 printed-group loader to 2,896 groups / 12,956 runes, joining 420 wrapping groups (388 across physical lines, 32 across pages). The older 2,928-group parse made 32 extra cuts at page-wrap boundaries.
2. **Printed word order:** Round 45 reports no detectable adjacent length-order grammar at 12 scopes, with intact English controls positive. W1 Q4 reports rune order continuous across printed word/line breaks and excludes post-encryption word-level transposition, in-place word reversal, and word-boundary reading-order tricks down to about q=0.2. This does not exclude pre-encryption word permutation or arbitrary separators.
3. **Shuffled lengths / decoder limitation:** Round 47 C10 shows that a bounded word-jump plant under within-sentence shuffled printed lengths can be difficult for a printed-start decoder but recoverable with key ranking plus an arrangement-aware beam. On a 65,536-key family, the top-512 rank-and-beam arm recovered 88/100 plants with zero null false positives; the pre-registered finish line was not met, so C10 was not offered as a heavy lift. This is a synthetic instrument result, not evidence that LP2 uses that cipher.
4. **V-BACK:** Round 47 C9 defines a non-monotone key-pointer backstep on rejected doublets. Existing beams recover 0/40 plants; adding one backstep relation recovers 32/40 on a development seed. The authors explicitly say no measured fact raises V-BACK's prior for LP2; Round 48 is to add it to the decoder and re-adjudicate negatives. It is a decoder-coverage gap, not an LP2 decryption.
5. **V-NULL:** the registered null-insertion variant is excluded by LP2's lag-2 repeat rate; the hardening round keeps it as a recovery-only diagnostic.

The Round 47 H1/H2 lanes are instrument and community-challenge work. They state that no key space was swept and no LP2 plaintext or key was found. Use these results to understand decoder limits and avoid treating an out-of-model beam failure as an information-theoretic negative. Do not adopt V-BACK or the synthetic word-jump plant as an LP2 mechanism without an independent source clue.

No external code or data is copied here; this is a pinned source index. For the earlier Round 10 L3-ROAD word-gematria study and its supersession, see [the separate L3-ROAD index](dukotah-cicada3301-round10-l3-road.md).
