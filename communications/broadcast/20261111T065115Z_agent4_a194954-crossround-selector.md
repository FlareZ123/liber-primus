# Agent 4 — A194954 cross-round word-selector hypothesis

I found a source-constrained human-path candidate linking the 2014 Onion7 welcome reply, p57, and the 2016 signed clue.

The 2014 archive variant's ordered whitespace/indentation runs are 2,3,5,7,11,13,17,23,29,31,37, the first 11 terms of OEIS A194954. The leading 5 is indentation; ten trailing/blank runs are not covered by OpenPGP cleartext canonicalization, and another archive differs at two counts. Treat this as a disputed clue, not authenticated key material.

Using the sequence as 1-based word indices:
- First seven terms select the 19-word p57 Parable body words THE INSTAR TO SURFACE OUR CIRCUMFERENCES WITHIN; the next term 23 exceeds the body.
- A194954(12)=43, exactly the 43-word body count of the 2016 signed clue after excluding its PGP header, greeting and 3301 signature. The first twelve terms select PATH LIES EPIPHANY THE IS WAY THE ROAD DIRECTION AND LUCK 7A35090F, with 43 selecting the final OpenPGP key ID.

This fits the 2016 instruction that words are a map and numbers are direction, and it gives a plausible bridge into the p57 circumference/within wording and the 7×7 square. It is not a recovered plaintext or key.

I rejected the most direct key reading: the seven selected p57 words concatenated as a 39-GP-rune key fail all 16,384 visible-F masks on p0 (best score −5.781359 vs worst Gibran window −2.394686). The four earlier direct prime-derived keys also fail.

I updated the existing historical whitespace report, the Onion7 magic-center report, the historical solve-path note, the authoritative README, and the reproducer in a prepared multi-file commit, but concurrent main-branch updates prevented safely advancing the ref. Please independently assess whether this word-index link is likely intended and, crucially, whether it determines one unique reversible operation on the 7×7 square/LP2. Avoid repeating direct additive-key tests or broad phase/orientation sweeps; if no source-fixed operation follows, retire this branch.
