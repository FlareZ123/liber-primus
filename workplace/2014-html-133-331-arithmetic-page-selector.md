# 2014 Stage11 HTML numbers: a possible 8×58 / 16×29 selector

**Status:** source-grounded hypothesis, not a decipherment. The arithmetic is exact; whether the numbers were deliberately chosen for this purpose remains unproven.

## Source facts

The pinned May 2014 Stage11 index is:

- Repository: `micheloosterhof/cicada-2014`
- Commit: `6c3421a4d245596e403c88e037509d162a2afd17`
- File: `stage11/ky2khlqdf7qdznac.onion/index.html`
- Raw source: https://raw.githubusercontent.com/micheloosterhof/cicada-2014/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion/index.html

The HTML contains `<title>133</title>`, `<div id="331">`, and exactly 58 image references (`0.jpg` through `57.jpg`). The two numbers are reversals.

The manuscript's GP29 alphabet has 29 symbols. The canonical transcription gives p55 76 runes and 17 printed groups; its first `ᛝ` completes a word carried across the p54/p55 boundary, leaving 75 body runes and 16 complete words. Those 16 complete words form eight adjacent pairs. The original p41 image has an ornamental motif with eight filled black dots and two outlined circles.

## Exact arithmetic

```text
133 + 331 = 464
464 = 8 × 58
464 = 16 × 29

133 × 331 = 44023 = 58 × 759 + 1
133 mod 58 = 17
331 mod 58 = 41
17 × 41 mod 58 = 1
```

The modular inverse and sum identities are exact but not independent evidence. Since `464=8×58`, the residues satisfy `331≡−133 (mod58)`; the inverse identity reduces to `17²≡−1 (mod58)`. The only roots of −1 modulo58 are 17 and 41. An exact finite audit of the 360 unordered, nonpalindromic three-digit decimal reversal pairs with neither endpoint zero found seven whose sum is divisible by58 and three satisfying both the sum-divisibility and inverse conditions: `(133,331)`, `(365,563)`, `(597,795)`. All three select the same two residues. This census is conditional on these retrospectively chosen constraints and is not a calibrated significance test.

An exploratory coordinate reading is possible because both selected pages have 273 runes:

- `133 mod 58 = 17` selects p17; `331 mod 58 = 41` selects p41.
- Use the original HTML order (title133 then div id331) and the 2012 book-code convention of 1-based positions.
- `133 mod 273 = 133`; the 133rd rune on p17 is `ᛁ` (I).
- `331 mod 273 = 58`; the 58th rune on p41 is `ᛝ` (NG).
- The selected sequence is `I + NG`, whose Latin transliteration reads `ING`. These are **two separate GP29 symbols** (I and NG), not one alphabet symbol; the 29-symbol inventory has `I` and `NG` but no `ING` entry.

This is a concrete, reproducible output under this particular modular/indexing interpretation, but the interpretation itself is not yet selected by an explicit instruction. Swapping page assignments while retaining the coordinate numbers reportedly gives `CI`; simply reversing the two selected outputs gives `NG,I`. Taking positions133/331 in the whole LP2 concatenation reportedly gives `XJ`. None of these contrasts independently selects the mixed zero-based page / one-based rune convention. The two-symbol output `I, NG` (transliterated `ING`) is a candidate key/operation selector, not yet a decryption; its role on p55 remains to be established.

## Prior-work qualification

The arithmetic `133+331=464=16×29=π(3301)` is **not new**. Agent6's earlier report `im-results/2014-stage11-133-331-prime464-original-gate.md` already documents it, the earlier Stage10 magic-square center 331, the p0 red-title relations `331±16`, and a bounded negative test of prime-rank starts133/331 through the solved p56 mechanism. That report correctly cautions that the arithmetic was noticed retrospectively and does not specify an LP2 opcode. Do not present the sum itself as new evidence or repeat its prime-rank tests.

The distinct additions here are the possible modulo-58 page selectors (p17/p41), the 2012 phone-number/p41 ten-circle correspondence, the p55 17-group/16-complete-word/75-token structure, and the exploratory 1-based within-page extraction yielding two GP29 symbols I,NG. These are still hypotheses and require a source-selected reversible role; they do not supersede Agent6's negative result.

## Candidate interpretation

The 2016 signed Cicada message says: “the words are the map, their meaning is the road, and their numbers are the direction.” A human solver inspecting the original HTML could notice the two reversed numbers, use the visible 58-page count as a modulus, and examine pages 17 and 41. The same numbers also yield `16 × 29`, which matches the 16 complete words on p55 and the 29-symbol alphabet; `8 × 58` matches the eight filled dots on p41 and the page count. The 2012 phrase has 17 words, matching the 17 printed groups on p55 when the carried-in fragment is counted; its GP29 token count after contracting TH to one symbol is 75, matching the p55 body.

There is a further cross-round arithmetic match: the p41 ornament has **10 circular marks**, eight filled and two outlined; the 2012 book-code message ends in the 10-digit phone number `2143909608`, which has eight nonzero digits, two zeroes, and digit sum **42**. Since p41 is zero-based index41 (the **42nd** page in one-based counting), the retrospectively compared phone-number digit sum also points to p41. Also, `58 - 16 = 42`, linking the page count and p55's 16 complete words to the same value. The 10/8/2 circle count matches the phone number's 10 digits, eight nonzero digits, and two zeroes. A more specific half-by-half match is visible: split the phone number as `21439 | 09608`. The first five digits are all nonzero, matching the p41 right cluster's five filled circles; the last five digits contain three nonzero digits and two zeroes, matching the left cluster's three filled and two outlined circles. Reading the all-filled right cluster first and the mixed left cluster second therefore matches the two five-digit halves at the binary filled/nonzero level. This adds a cluster-count match conditional on reading the all-filled cluster first, but still does not extract digits. Even if a five-position traversal is fixed independently, there are ten possible locations for two outlined circles; only the pair (1,4) matches the second half. No unique source-defined traversal establishing that order has been found. The aggregate counts, half counts, digit sum and page selection were noticed after examining the same sources; they cannot be multiplied as independent probabilities. Exact p41 source image: https://raw.githubusercontent.com/micheloosterhof/cicada-2014/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion/41.jpg.

**New keypad checksum.** The selected 1-based rune positions are p17[133] = `I` and p41[58] = `NG`. On the standard telephone keypad, `I` maps to 4 and the two-letter rune `NG` maps to 64; concatenating them gives **464**, exactly `133 + 331`. This is a precise cross-check for the mixed page/position selector and makes a telephone-keypad interpretation more plausible. It is not a decryption: the mapping is many-to-one, and the same selector numbers generated both the chosen runes and their sum, so this is a consistency relation rather than independent evidence. The p41 dot/phone-number match is the contextual reason to test keypad mapping; it does not by itself specify how to use the keypad.

A bounded T9-digit test was run on p17, p41, their ordered concatenation, and p55. GP29 transliterations were expanded to keypad digits (including TH=84, NG=64, OE=63, AE=23, IA=42 and EA=32), then the 2012 phone number `2143909608` (and its reverse) or `464` was used as a repeating additive/subtractive key modulo 10, with continuous and per-word clocks and selector-derived phases. No coherent T9 plaintext emerged; common-word coverage was comparable to random 10-digit-key controls. This rejects the simplest keypad-Vigenere interpretation, not the broader selector/checksum hypothesis. Historical caution: the pinned 2013 first-onion source explicitly says its phone access code was converted through Gematria, not ordinary T9; that precedent does not establish T9 as the intended cipher.

This converges with a separate 2012→p55 candidate: the 2012 OutGuess book-code chain resolves to `CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT` (76 characters); GP29 contraction of `TH` gives 75 tokens, matching p55's 75 non-carry runes. This phrase is not established plaintext. Direct monoalphabetic substitution, constant GP29 Caesar, and transposition-plus-monoalphabetic substitution have failed. The exact historical OutGuess read operation on original p55 also yielded no payload (false-looking header, SIGFPE, zero output bytes); see `im-results/2012-first-image-payload-reproduction-and-lp2-transfer-decision.md`.

The p17 and p41 pages each have 273 runes. However, 273 occurs on six LP2 pages, not only this pair; their direct positionwise difference has near-uniform IC (about 0.0346) and no constant Caesar relation. Treat the page-pair equality as secondary evidence, not a solved relationship.

## Strongest objections

1. `133` and `331` may be incidental HTML metadata rather than puzzle instructions.
2. The identities `464 = 8 × 58 = 16 × 29` and T9(`I`+`NG`) = 464 are exact but not independent: the same two selector numbers determine the positions, selected runes and sum. The dot and word counts remain interpretations of visual structure.
3. The p41 cluster order needed to match the phone-number halves is not independently specified; the match is conditional on reading the all-filled right cluster first.
4. The 273-rune equality of p17/p41 is not unique (six pages have273), and their simplest direct difference test is negative; the new coordinate extraction does not depend on treating their direct difference as a key.
5. The simplest T9-digit Vigenere consumer of the phone number/464 was tested and did not produce coherent text. The pinned 2013 phone stage used Gematria rather than T9, so historical precedent does not authenticate T9 as the cipher.
6. No reversible operation currently maps the 2012 phrase to p55. The word boundaries differ (17 phrase words versus 16 p55 body groups), and simple substitution/transposition tests fail.

## One bounded next decision

The `I,NG` extraction now has a keypad checksum, but that checksum supplies no reversible cipher operation, ordered traversal, or boundary rule. The bounded T9-digit Vigenere test is negative; do not expand it into a generic keypad-key search. The remaining actionable prerequisite is an independent source instruction that selects a specific telephone-keypad consumer or route, plus a typed two-symbol consumer and full cross-page conservation rule. Under [#2447](https://github.com/FlareZ123/liber-primus/issues/2447), a complete candidate must conserve all 86 original p54→p55 receiver runes, including the ten p54 runes and one p55 rune belonging to the same carried word. Only a frozen full 76-rune p55 inverse satisfying [#41](https://github.com/FlareZ123/liber-primus/issues/41) warrants an independent original-cipher test. Absent that input, park the branch at its missing instruction.

Do not launch a generic grid, route, modular, or transposition search. Original p55 is a nominated receiver, not an authenticated target of the historical phrase. The phrase remains a speculative crib, not a key or recovered plaintext.
