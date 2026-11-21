# P29 printed-word DH23 bookends: an original-source boundary clue

**21 November 2026, Agent41. Classification: exact original-source correspondence, provisional intended role. No LP2 plaintext or original cipher key recovered.**

## A source-visible rather than a fitted body key

Physical LP2 p29 (original `46.jpg`) begins with one **complete printed rune word** `ᚦᛞᚷ` (GP29 indices **[2,23,6]**) and ends with one **complete printed rune word** `ᚷᚻᛗ` (indices **[6,8,19]**). The complete boundary words are independently present in the canonical `resources/liber-primus/lp2-transcription.txt` and the 277-symbol p29 sequence in `resources/liber-primus/lp2-corpus.json`. Neither assignment uses an English plaintext score.

The GPG-authenticated 26 January 2013 Cicada TCP challenge gives the worked example `DH 23`, server `5 8`, client `19`, shared result `2`. Its two small-group private exponents follow by elementary discrete logarithms, `5^6 mod23=8` and `5^15 mod23=19`, with `19^6 mod23=2`. Define the historical state `(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)`, where **a and b are derived** rather than printed by the signatory. The p29 complete-word endpoints exactly read:

| Physical p29 boundary | Original GP29 indices | DH-number reading |
| --- | --- | --- |
| First whole word | **[2,23,6]** | **[K,p,a]** |
| Last whole word | **[6,8,19]** | **[a,A,B]** |

A further, independently printed **three-rune red inscription on p39**, `[27,5,15]`, reads `[-K,g,b]` in GF29, since `-2 ≡ 27 (mod29)`. Thus **all seven** historical/derived DH-state values are present in this compact p29-boundaries/p39-red combination, and the private exponent `a=6` occurs at both p29 endpoints. The p39 triple is already known to be `15(X−24)^2`, and p29's GP29 polynomial is already known to have the repeated root24. Those are **previously published results**, not newly discovered independent corroboration.

## Finite original-page discriminator

Freeze the seven-number set `{2,5,6,8,15,19,23}` and count membership across the first three and last three rune indices of every one of the **55 original rune-bearing unsolved pages**. P29 is the **only** page with all **six** boundary symbols inside this set; the second-highest page is p44 with **four**. The complete original words on p29 also happen to preserve a concise `K,p,a | a,A,B` state serialization. This does not establish its probability of deliberate authorship: the chosen DH example was already known, the set and word readout were recognized after examining the page, the seven-number set allows many orderings, and the research project has inspected many arithmetic correlations.

The independent, later-proposed p28 `THE→DIRECTION` source-index navigation already conditionally selects p29 before testing the original page. If that navigation is independently authenticated, the endpoints become a possible *player-observable page-state clue*, rather than merely an arbitrary page selected from 55. But the original 2013 TCP source does **not** instruct its reader to interpret later LP2 page-edge rune words as ordered DH values, and p29 does not provide a cipher operand, clock/reset, or an unknown-body decoder.

## Direct cryptanalytic consequence and limit

The new observation makes one concrete receiver question sharper: **does a source-authored instruction select p29 first/last printed words as `[K,p,a] | [a,A,B]`, with p39's red `[-K,g,b]` fixing a reversible operation on an untouched p29 or neighboring passage?** Under this hypothesis all seven state integers and source locations are fixed before inspecting any body plaintext. A positive follow-up must identify a previously unseen original instruction that fixes **operator, orientation, interval, phase and key use** and must recover a substantial untouched original ciphertext passage, with exact forward replay and independent holdout. Further mere G-adic remainders or arbitrary DH-key sweeps are not a response.

Already exhausted: the direct G/H divisibility, p29/p50 `P=S+2G+G²R` congruence, finite-field DH-sharing alternatives and their nonlinguistic original-cipher consumers. They are described in [the established p29 G-adic source report](p29-signed2013-dh2-gadic-congruence.md) and [closed source-selector decision #306](https://github.com/FlareZ123/liber-primus/issues/306). None should be rerun solely on this observation.

**One-file Windows Node22/CommonJS exact original source test:** [`sims/lp2_p29_dh_word_bookend_sft.cjs`](../sims/lp2_p29_dh_word_bookend_sft.cjs). It reads both canonical corpus sources, asserts complete rune-word boundaries, derives the signed/derived DH example, confirms the already-known p29 double root, and compares the boundary-state membership across all 55 original pages. It deliberately makes **no plaintext assertion** or author-intent probability claim.
