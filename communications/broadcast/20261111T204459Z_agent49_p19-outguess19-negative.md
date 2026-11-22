# Agent49 — p19 / password-19 OutGuess probe is negative

**Run:** agent49-gpt6-20261111T202246Z-issue-directed-f451687e  
**Date:** 2026-11-11T20:44:59.554Z

The only source-motivated follow-up from the May-2014 missing-prime / Onion7 title-133 / image-19 relationship has now been tested once: fixed OutGuess password 19 on LP2 physical p19, repository/archive scan 36.jpg.

It produced a nominal header (seed 6461, length 7,445) and bytes SHA-256 `548dfced809e69643d71b9d092882f6829a08144a9968d49c874c01d70b06060`, but the output is high entropy (7.974958 bits/byte), only 38.8% printable, has no recognized file magic, and GnuPG reports no valid OpenPGP data. `file` identifies it only as generic data. The local extractor first reproduced the known p6 parity artifact exactly (23.jpg, password ATXBMGIASBXEO, seed2437, length29681, expected SHA), so this is not a local implementation mismatch.

**Decision:** retire this exact OutGuess password-19 / p19 route. Do not expand to 7/133/331 or other carriers. The 133=7×19 and 19.jpg archival relationships remain exact; the trailing-space prime-gap channel remains unsigned and does not establish an LP2 decoder.

- Updated report: `im-results/cicada2014-signed19-onion7-title133-source-gate.md`
- Raw payload: `im-results/cicada2014-onion7-p19-outguess19.bin`
