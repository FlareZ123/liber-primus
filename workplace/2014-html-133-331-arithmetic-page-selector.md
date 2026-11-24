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

Thus the HTML numbers are multiplicative inverses modulo the 58-page Stage11 sequence, and their sum is simultaneously eight times the page count and sixteen times the GP29 alphabet size.

A second, source-typed coordinate extraction is available because both selected pages have 273 runes:

- `133 mod 58 = 17` selects p17; `331 mod 58 = 41` selects p41.
- Use the original HTML order (title133 then div id331) and the 2012 book-code convention of 1-based positions.
- `133 mod 273 = 133`; the 133rd rune on p17 is `ᛁ` (I).
- `331 mod 273 = 58`; the 58th rune on p41 is `ᛝ` (NG).
- The selected sequence is `I + NG = ING`, exactly one symbol in the 29-symbol GP29 alphabet.

This is a concrete, reproducible output from the original HTML numbers, page count, and page rune counts. Reversing the page order gives `CI`; taking positions133/331 in the whole LP2 concatenation gives `XJ`. The source order therefore matters. The output `ING` is a candidate key/operation selector, not yet a decryption; its role on p55 remains to be established.

## Candidate interpretation

The 2016 signed Cicada message says: “the words are the map, their meaning is the road, and their numbers are the direction.” A human solver inspecting the original HTML could notice the two reversed numbers, use the visible 58-page count as a modulus, and examine pages 17 and 41. The same numbers also yield `16 × 29`, which matches the 16 complete words on p55 and the 29-symbol alphabet; `8 × 58` matches the eight filled dots on p41 and the page count. The 2012 phrase has 17 words, matching the 17 printed groups on p55 when the carried-in fragment is counted; its GP29 token count after removing the TH digraph is 75, matching the p55 body.

There is a further count-level cross-round match: the p41 ornament has **10 circular marks**, eight filled and two outlined; the 2012 book-code message ends in the 10-digit phone number `2143909608`, which has eight nonzero digits and two zeroes. This may be a visual selector linking the 2012 phone-number message to p41. It is **not** yet a digit extraction: the two outlined circles do not align with the phone number's zero positions (6 and 9) under simple left-to-right, right-to-left, or top-to-bottom readings. The exact p41 source image is https://raw.githubusercontent.com/micheloosterhof/cicada-2014/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion/41.jpg.

This converges with a separate 2012→p55 candidate: the 2012 OutGuess book-code chain resolves to `CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT` (76 characters); GP29 contraction of `TH` gives 75 tokens, matching p55's 75 non-carry runes. This phrase is not established plaintext. Direct monoalphabetic substitution, constant GP29 Caesar, and transposition-plus-monoalphabetic substitution have failed. The exact historical OutGuess read operation on original p55 also yielded no payload (false-looking header, SIGFPE, zero output bytes); see `im-results/2012-first-image-payload-reproduction-and-lp2-transfer-decision.md`.

The p17 and p41 pages each have 273 runes. However, 273 occurs on six LP2 pages, not only this pair; their direct positionwise difference has near-uniform IC (about 0.0346) and no constant Caesar relation. Treat the page-pair equality as secondary evidence, not a solved relationship.

## Strongest objections

1. `133` and `331` may be incidental HTML metadata rather than puzzle instructions.
2. The identities `464 = 8 × 58 = 16 × 29` are exact but may be numerological coincidence; the dot and word counts are interpretations of visual structure.
3. The 273-rune equality of p17/p41 is not unique (six pages have273), and their simplest direct difference test is negative; the new coordinate extraction does not depend on treating their direct difference as a key.
4. No reversible operation currently maps the 2012 phrase to p55. The word boundaries differ (17 phrase words versus 16 p55 body groups), and simple substitution/transposition tests fail.

## One bounded next decision

Determine whether the extracted GP29 `ING` symbol has a source-selected role in a reversible p55 reader, and whether the eight filled dots on p41 plus the 16 complete p55 words specify a unique 8-pair order for the 17-word/75-token 2012 phrase. The test must predict a fixed mapping on original p55 before inspecting candidate plaintext. If the 8-dot motif does not uniquely select an 8-pair/16-word route, or if the 133/331 arithmetic does not produce a reversible p55 operation without tuned exceptions, retire this branch.

Do not launch a generic grid, route, modular, or transposition search. The only justified receiver is original p55; the 2012 phrase remains a crib candidate, not a key or plaintext.
