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

## A more useful original-text handoff: self-addressed p29 and reversed p53 word

The p29 first word now has a **separate literal page-internal relationship**. Multiply its **unchanged zero-based GP values**, `2×23×6=276`. P29 contains exactly **277 runes**, a prime count, hence the product is **φ(277)=276** and is also the page's **last zero-based rune address**. That terminal rune is GP index **19**, the **B=19** endpoint of the last word `[6,8,19]` from the signed example. The solved LP1 book explicitly describes the totient function as sacred, making this a conceivable human-visible mathematical operation. Its use as a p29 pointer remains a *hypothesis*, because no line explicitly instructs multiplying the p29 first word.

Under the literal reversal operation on those three symbols, `[2,23,6]→[6,23,2]`, the reverse is **one exact complete word elsewhere** in the original 2,896-word LP2 unknown manuscript: **physical p53 (original JPEG70), zero-based rune offsets15–17**. The target word begins precisely at **15**, the independently derived private DH client exponent `b=15`; the word is the **fourth visible word fragment** on p53, after three fragments of lengths5+3+7=15. The complete source-native parser respects all **32 cross-page words**, so this is a word-boundary match, not an arbitrary substring. The matching word is in p53's black text; its separately red 51-rune stanza begins at offset128. Across all original physical-page-start whole words, p29's is the only nonpalindromic three-or-more-rune opening with its full reverse elsewhere in the 2,896-word stream. This classification is conditional on inspecting the first word and reversing it, and should **not** be interpreted as a multiple-comparison-corrected author-intent probability.

A further exact arithmetic alignment is **277−179=98**, the difference between original p29 and p53 rune lengths, while the source GP0 index sum of the 2016 authenticated word **DIRECTION** is **98**. Earlier independently explored routes already connect DIRECTION and p53's length179. Because the difference98 was noticed *after* the two pages were selected, and the 2016 message was unavailable to a 2014 player, this is **exploratory corroboration**, not a third independent instruction.

These observations suggest a bounded possible authored navigation: an operator from the already conditional p28 DIRECTION route selects p29; **φ(277)** resolves the p29 terminal B, and a selected reversal leads to the complete p53 word at DH-derived position15. A genuine plaintext-solving continuation would require a first-party instruction that selects *word reversal and the p53 key consumer before inspecting the destination*. The byte/table key, symbol clock and use of p53's red51 are still unspecified; no unknown original plaintext has been read.

## Frozen original-cipher receiver: a 3×3 matrix fails

The three printed source words naturally supply **nine numeric coordinates** in their historical/page order: p29 first word, p29 last word, then p39 red triple. Consider exactly one reversible, source-order Hill-3 hypothesis:

```text
M = [ 2 23  6 ]    M^-1 = [15 14 13]
    [ 6  8 19 ]           [16  2 22]
    [27  5 15 ]           [16  7  8]    (mod29)
```

The matrix has determinant **21 mod29**, so it is invertible. The original p39 ciphertext contains **240** runes; its source-marked three red runes are at offsets119–121. Exclude these key-bearing runes and read the remaining **237** as 79 consecutive three-rune blocks in original order, resetting the clock at p39 start. With original GP29 column vectors `C=M·P`, invert `P=M^-1·C mod29`. The exact unmodified p39 GP-index input scores IoC **0.0357219480798112**; the inverse yields **0.032789816205392265** and an incoherent opening (`U H S J B I E G J W D G U E P ...`). All 237 original runes forward-reencrypt exactly; an independent known-clear p57 plant round-trips **93/93**. This is a **bounded negative** for this one literal Hill consumer, and a source-derived matrix is **not thereby an authentic LP2 cipher key**. The source nowhere instructs concatenating the three words into matrix rows; no additional row/phase/receiver sweep is warranted.

The [same consolidated SFT](../sims/lp2_p29_dh_word_bookend_sft.cjs) reproduces the boundary/DH relationships and the p29→p53 complete-word reversal, `2×23×6=φ(277)`, p53 offset15, exact GP0(DIRECTION) difference and the source-original p39 Hill inverse. It also tests **one extra frozen candidate** on the p53 red 51-rune stanza (17 Hill3 blocks) using the *same* matrix, with decoded IoC **0.03529411764705882** and no readable sentence. Both whole-p39 and red-p53 original ciphertexts reencrypt exactly, as does a solved-p57 positive plant. No previously unknown original plaintext was obtained.

## Direct cryptanalytic consequence and limit

The new observation makes one concrete receiver question sharper: **does a source-authored instruction select p29 first/last printed words as `[K,p,a] | [a,A,B]`, with p39's red `[-K,g,b]` fixing a reversible operation on an untouched p29 or neighboring passage?** Under this hypothesis all seven state integers and source locations are fixed before inspecting any body plaintext. A positive follow-up must identify a previously unseen original instruction that fixes **operator, orientation, interval, phase and key use** and must recover a substantial untouched original ciphertext passage, with exact forward replay and independent holdout. Further mere G-adic remainders or arbitrary DH-key sweeps are not a response.

Already exhausted: the direct G/H divisibility, p29/p50 `P=S+2G+G²R` congruence, finite-field DH-sharing alternatives and their nonlinguistic original-cipher consumers. They are described in [the established p29 G-adic source report](p29-signed2013-dh2-gadic-congruence.md) and [closed source-selector decision #306](https://github.com/FlareZ123/liber-primus/issues/306). None should be rerun solely on this observation.

**One-file Windows Node22/CommonJS exact original source test:** [`sims/lp2_p29_dh_word_bookend_sft.cjs`](../sims/lp2_p29_dh_word_bookend_sft.cjs). It reads both canonical corpus sources, asserts complete rune-word boundaries, derives the signed/derived DH example, confirms the already-known p29 double root, and compares the boundary-state membership across all 55 original pages. It deliberately makes **no plaintext assertion** or author-intent probability claim.
