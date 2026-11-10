# LP2 page 53 red stanza: exact historical prime-totient 11-rune anchor inversion

**Classification: completed bounded negative cryptanalytic attack.** No LP2 key, plaintext or puzzle destination has been recovered.

## Source-defined target and plausible cipher

Original 70.jpg / physical LP2 page 53 has a verified **51-rune** red passage, at page offsets [128,179) and containing twelve complete words with lengths `5,4,4,11,2,3,2,6,5,5,2,2`. The unique eleven-rune fourth word supplies an independently selected word anchor. Its 11 ciphertext runes occupy [13,24) within the red passage. The corrected input is committed at `resources/liber-primus/lp2-page53-red-span.json`, fixing the obsolete 50-rune red span used by earlier code.

The final already-solved LP2 page 56 is known to use `K[n]=phi(prime_n)=prime_n-1 (mod 29)` with additive subtraction and a literal `F` interrupter. The historical solved cipher is reproduced at `sims/authentic_lp2_p56_totient_regression.cjs` and is a source-derived candidate mechanism, independent of the red stanza.

This attack checks whether that specific arithmetic sequence, started at an unknown prime index, decrypts the original red 51 runes into English-GP runic words. It permits either additive sign, direct or atbash-carrier `28-C`, four source-defined reading orders (printed, reverse words, reverse all glyphs, mirror each word) and optional literal-`F` skip outside the anchor. Every candidate key must re-decrypt at least **9 of the 11** anchor runes into one eleven-GP-rune dictionary word. Its other eleven words are separately decrypted as a held-out readable-language test.

## Search without unconstrained language fitting

The checked-in English word-frequency resource contains **1,611** distinct 11-GP-rune word spellings (one per resulting code). We enumerate the first **50,000 possible prime-index key starts** in each of **16** reading/carrier/sign combinations. Each dictionary word is indexed under the **55** nine-rune signatures obtained by omitting any two of its 11 rune positions. A cipher anchor with up to two arbitrary altered runes must match at least one of those signatures. The indexed lookup therefore searches all dictionary words and all allowed two-position corruption patterns *exactly*, without choosing or scoring a favorable phrase after seeing a candidate.

The index contains **87,581 distinct signatures**; each key-start produces at most 55 indexed probes. A candidate would also have to yield non-anchor words under the same key schedule, adjusting phase for optional literal `F` positions. The start window and two-error limit are finite explicit model restrictions.

## Result and exact planted-key control

| Evaluation | Result |
| --- | --- |
| GP English eleven-rune anchor spellings | 1,611 |
| Prime starts per reading/sign/carrier combination | 50,000 |
| Such combinations | 16 |
| All real manuscript anchor candidates with 0, 1, or 2 altered rune positions | **0** |
| Independently decrypted non-anchor English words | **0** |
| Synthetic known-key test with two altered anchor positions | **PASS** |
| Planted key start | 3301 |
| Planted recovered key start | **3301 exactly** |
| Planted other long dictionary words recovered without fitting | **7** |

The positive control constructs a full 51-rune dictionary-compatible GP passage with the exact original word-length pattern, encrypts it with the genuine `prime_n-1` sequence at hidden start 3301, alters anchor rune positions 2 and 9, and recovers start 3301 plus **all seven independently encoded long non-anchor words**. Thus the source-defined anchor inversion is effective against a correctly generated key even with the allowed two-rune corruption.

**Interpretation:** An ordinary GP-English 11-rune word, carrying no more than two alterations in this highlighted word, is incompatible with any of the tested **50,000** historical prime-totient starts under these orientations/carriers. This is a strong finite cryptanalytic exclusion of one plausible **historically demonstrated** mechanism on a source-selected passage. It does not exclude a hidden intermediate register, greater alteration count, cipher-dependent key skips within the anchor, dynamic key state, or an unrelated generator.

## Reproduction

- Exact standalone script: [`sims/red_verse_prime_totient_anchor.cjs`](../sims/red_verse_prime_totient_anchor.cjs).
- Complete successful on-demand CI, including positive control and all original-input inversions: [Actions run 42761420099](https://github.com/FlareZ123/liber-primus/actions/runs/42761420099).
- Correct original red segment and earlier periodic-key experiment: [`im-results/lp2-page53-red-verse.md`](lp2-page53-red-verse.md).
- Historical solved cipher regression: [`sims/authentic_lp2_p56_totient_regression.cjs`](../sims/authentic_lp2_p56_totient_regression.cjs).

This targeted attack should not be repeated with the same dictionary, 50,000 starts and error model. A productive follow-up requires an independently constrained key transformation or evidence that the highlighted word is not encoded as a normal English GP word.
