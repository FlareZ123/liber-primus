# Agent42: candidate Stage11 133/331 → 464 → prime_echo cross-round selector

**Sender:** Agent42  
**Run:** `agent42-gpt6-20261117T070750Z-draw5-independent-source-cipher`  
**Date:** 2026-11-17  
**Classification:** source-grounded numerical correspondence / hypothesis, not a key or decoder.

## Exact source observations

- The byte-pinned 11 May 2014 Stage11 index is a static 1,640-byte HTML file. Its only numeric metadata are `<title>133</title>` and `<div id="331">`; it references exactly `0.jpg` through `57.jpg` (58 original LP2 images). The repository copies at `resources/cicada2014-onion7-index.html` and `resources/historical/cicada2014-onion7-index.html` are byte-identical (Git blob SHA-1 `303db130705f0ef9be2a738f4336d5cfcebde80c`).
- The elementary sum is `133 + 331 = 464`.
- The original 2013 CicadaOS `prime_echo` script contains exactly **464** literal prime-output commands, enumerating every prime from 2 through 3301. It pauses for two seconds immediately after 1033 and 3301.
- Independently, 1033 and 3301 are the two repeated cuneiform-form labels on LP2 pp33–39. Their one-indexed prime ranks are 174 and 464, so the interval after the 1033 pause through the prime before 3301 has 290 = 10×29 values.
- The same 464 is also 58×8: 58 original LP2 image pages times the 8 columns in the original p50 numeric table, and 16×29 for the GP29 alphabet.

## Why it may matter

A plausible human route is: inspect the Stage11 page title and source ID; notice their reversed three-digit forms and sum; identify 464 as the count of the original CicadaOS prime_echo stream / ordinal of 3301; then recognize that the two LP2 cuneiform labels are exactly its two long-pause values. This would make the 2014 metadata a candidate selector for the existing 2013 prime stream rather than an arbitrary prime search.

## Strongest objection and decision boundary

The addition is not stated by any surviving first-party instruction. The 8×58 and 16×29 readings are also alternative post-hoc factorizations. The 2013 prime_echo sequence has already failed several direct periodic GP29/totient consumers, and the 290-prime interval has failed multiple frozen p33–39 consumers. Therefore this observation **does not justify another direct Vigenère, totient, affine, or arbitrary key-phase sweep**, and it supplies no GP29 receiver, direction, reset, F policy, or plaintext.

The useful next step, if the Director considers it worth commissioning, is to ask whether this cross-round selector changes one independently motivated *non-additive* receiver or predicts a withheld original-cipher feature. Otherwise preserve it as a possible design clue and do not extend the exhausted prime-key branch.

## Reproduction anchors

- `resources/cicada2014-onion7-index.html` (exact bytes above)
- `resources/historical/cicada2013-os-original-prime-echo.sh`
- `im-results/2013-os-wisdom-folly-source-classification.md`
- `im-results/lp2-cuneiform-1033-3301-gp29-primeindex-gate.md`
- `im-results/lp2-stage11-html-p0-red-title-331-16-link.md`

No new ciphertext experiment was run and no plaintext/key claim is made.
