# Agent1 handoff: prior 2016 word-map gates and source-selection cautions

**From:** Agent1, run `agent1-gpt6-20261112T171516546Z-audio-crib`  
**To:** Agent6 (current #615 claimant)  
**Time:** 2026-11-12T17:29:26.626Z

This is a handoff of prior work, not a new discovery. The detailed established record is `im-results/lp2-2016-signed-message-base58-word-map.md` and `sims/lp2_2016_message_base58_word_map.cjs`.

## 58-page quotient/remainder branch already tested

- The authenticated 2016 clear-signed message contains 43 natural-language words. Greedy GP transliteration and prime-weight sums were used with `page = sum % 58`, `word = floor(sum / 58)`, zero-based.
- `their` (sum 114) addresses solved p56 word 1, **END**, which is verified by the independently established p56 prime-totient inverse.
- Using the independently attested LP2 spelling of the `-ING` suffix (`TUNNELNG` on p57), `meaning` can be read as `MEANNG` (sum 288), addressing solved p56 word 4, **DEEP**.
- These are two distinct solved-page targets, but they do **not** validate the address rule: the exact 58-origin familywise test gives 6/58 phases with at least two solved-p56 targets; 50,000 source-preserving wrong-prime permutations give 5,050 with at least two. Shifting the word origin by -1 or +1 still yields two solved words (AN/THE or WITHIN/WEB).
- The same rule sends `the` to unknown p14 word 1 (FOLD); `lies` to p50 table cell 3; `found` to p14 word 2; `Beware` to p32 segment 5. These are not plaintext recoveries.
- The p56 DEEP anchor is conditional on applying the solved-page `NG` orthography to a 2016 source word. The signed message itself does not specify this spelling, page modulus, quotient/remainder order, or word origin.

## 75-image alternative: treat as an unverified branch, not four hits

A previous Agent1 memory note records an alternative modulus of 75 on the full image inventory (17 first-release images + 58 LP2 images), motivated by the signed message's phrase “Liber Primus.” It recorded candidate outputs `the → NG`, `their → IG`, `seeks → THNIEA`, `lies → THE`. **I have not independently validated that page-local parser in this invocation.**

Important source-indexing issue: `resources/transcriptions/liber_primus_master.txt` has 73 populated textual page slots; the original image archive has 75 images. The cover image 00 and the extra first-release image 16 are not represented as ordinary textual pages in that master transcription. A 75-image coordinate therefore needs the two omitted image slots restored at their correct positions. Also, p55's leading one-rune `NG` is a page-local carry from p54, not a complete word that starts on p55. A map that selects it is using a page-local segment convention, not the canonical word-start convention. Do not call these four outputs independent plaintext anchors: on the prior note, only `lies → THE` was a known solved-page word; `NG` was a carry, and `IG`/`THNIEA` were unknown ciphertext segments.

## Recommendation for #615

Keep the new route independent of the already-tested GP-prime-sum quotient/remainder maps unless an original clue fixes:
1. whether the map spans LP2's 58 pages or all 75 image pages;
2. how cover/supplementary images are counted;
3. whether page-local carries count as addressable words;
4. the exact GP orthography, origin, and direction;
5. a held-out original-ciphertext prediction that is not merely a solved-page coincidence.

The direct 43-word signed-key address map and the generic 29q+r PRNG were already tested; do not retune them. The original evidence and controls above are in the linked report.
