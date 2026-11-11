# The original p53 red-51 / p54 Ac Solitaire deck: a source-first p55 gate

**Status (11 November 2026):** bounded original-cipher negative of one newly constructed source-specific playing-card key; no recovered LP2 plaintext, genuine key or destination.

## Plausible intended path

The historic 2014 Cicada clue **PATIENCE IS A VIRTUE** could prompt the Bruce Schneier [Solitaire/Pontifex cipher](https://www.schneier.com/academic/solitaire/), which uses **52 physical playing cards and two jokers**. The manuscript supplies a conspicuous group of **51 red GP runes** on physical p53 (original `70.jpg`, local [128,179)) followed by a large red 13-dot mark. The next page p54 (original `71.jpg`) begins with one dramatically enlarged, red **Ac=24** rune, and a red 13-dot mark follows its opening nine red runes. Thus source order can distinguish **51+1 marked rune events and two large punctuation events**, exactly the 54 events of a Solitaire deck.

The weak premise is consequential: although the source selects the **52 rune positions** as distinct physical events, it contains only 29 rune identities, and the two red punctuation marks have the same shape. It does not explain how to assign the 52 unequal playing-card identities or which mark is joker A versus B. A single deterministic construction can be tested without pretending that it is a recovered key.

## Frozen card assignment

Take the physical p53 red 51 rune indices followed by the first p54 red rune (Ac24). Sort these 52 source *positions* by GP index ascending, breaking tied rune indices by original reading order. Assign card ranks **1..52** in that order, restoring them to source-event order. Insert **joker A=53 immediately after the p53 red passage** and **joker B=54 after the selected p54 Ac event**. The actual large p54 red 13-dot mark appears **after eight additional heading runes**, so treating the p54 mark as an adjacent selected joker is a simplification of the artwork, not an independently authenticated instruction.

The resulting original-reading deck is fully specified, including duplicate-rune tie breaking:

`[36,31,15,26,35,16,38,27,3,20,17,13,23,8,49,42,50,4,45,22,28,48,34,40,29,52,51,46,24,18,9,5,32,43,25,41,6,14,1,30,39,11,19,44,7,37,12,2,10,33,21,53,47,54]`.

This contains all 54 distinct card IDs and places jokers at their respective large-punctuation source boundaries. The published Solitaire deck update (joker moves, triple cut, count cut, output lookup) then fixes the keystream without a phase, guessed password, salt, fitted rune or page-clock parameter.

## Original p55 exact inverses

Apply the unmodified deck to **all 76 original GP29 runes** of physical p55 (`72.jpg`). The most direct decoder adds or subtracts the Solitaire stream's 1..26 value modulo29. Because the LP2 manuscript has an unusual adjacent-doublet deficit, an independent conservative comparison uses a 28-rank predecessor-exclusion register, with either sorted or cyclic excluded-rune order. The first page rune stays literal, same-adjacent runes become reserved EA=28 without consuming card output, and other ranks are shifted by the unmodified Solitaire output minus one modulo28. Both signs are tested. These are **six predeclared finite inverses**, no search over card orders or key phrases.

| Candidate | Decryption sign | Original p55 GP IoC |
|---|---|---:|
| Direct GP29 | minus | 0.03508772 |
| Direct GP29 | plus | 0.03789474 |
| Sorted predecessor rank28 | minus | 0.03298246 |
| Sorted predecessor rank28 | plus | 0.03122807 |
| Cyclic predecessor rank28 | minus | **0.03929825** |
| Cyclic predecessor rank28 | plus | 0.03789474 |

Original p55 IoC is **0.03789474**; independently solved p57 native-GP IoC is **0.06270997**. Every proposed output remains a high-entropy nonlinguistic rune sequence. For example the best-scoring candidate begins `NG M IA W TH U G F L E O NG EO OE S H P EO E S EO EO N M EO X`; it has no coherent word segmentation beyond accidental short tokens.

The exact [self-contained CommonJS reproducer](../sims/p53_red51_p54_ac_solitaire_54card_sft.cjs) checks original p53/p54 red spans and punctuation, exact 54-card permutation, original 76-rune p55 forward reencryption for all six models, and an independently solved p57 76-rune planted positive under each model. Synthetic controls recover **76/76** true GP runes under the exact planted cipher, while the original p55 inverse remains near random-letter IoC.

## Immediate continuation after p54's red heading

The original **p54 red title is 9 runes**, ending at its red 13-dot boundary. This is a more directly player-visible start for the first ciphertext after the proposed card-deck clue than the start of p55. Without changing the key, signs, or register conventions, the same **six frozen inverses** were applied to **223 subsequent p54 runes followed by the 76 p55 runes**, for a 299-rune contiguous original interval.

| Fixed model | Sign | 299-rune decoded IoC |
|---|---|---:|
| Direct GP29 | minus | 0.03654239 |
| Direct GP29 | plus | 0.03333259 |
| Sorted predecessor rank28 | minus | 0.03548742 |
| Sorted predecessor rank28 | plus | **0.03737290** |
| Cyclic predecessor rank28 | minus | 0.03524051 |
| Cyclic predecessor rank28 | plus | 0.03445489 |

Raw original interval IoC is **0.03348971**; the largest putative plaintext IoC is **0.03737290**, still much closer to a near-uniform cipher register than independently solved GP English. Each original 299-rune stream exactly reencrypts, and an independent 299-rune solved-p57 repeating native GP plant exactly recovers under each of the six fixed models. No candidate yields an intelligible opening. This tighter, visibly motivated continuation also fails; the p55-only result is not just an artifact of beginning one page too late.

## Decision

The historically motivated **PATIENCE → Solitaire** operation is a plausible human clue, and the manuscript really provides 51 red runes, a prominent additional Ac, and two nearby 13-dot events. The specific simple source-event rank deck and direct GP29/GP28 decoders **fail on original p55**. Its extra rank and joker-placement conventions are not indicated by a contemporaneous clue. Further deck-order or phase brute force would tune the same missing information and is not justified.

A meaningful successor would need an independently visible **52-card suit/rank convention** or a historically preserved instruction binding the red rune positions to a card deck. Without that, the 54-event count is a bounded key-source candidate, not a decipherment. The established book remains unsolved.
