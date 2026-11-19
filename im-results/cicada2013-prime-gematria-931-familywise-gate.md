# 2013 prime-Gematria 931 → Stage11 title133: familywise source-text gate

**Decision:** the arithmetic is correct, but the phrase selection is not unique across the comparable 2013 message corpus. Treat 931→BASE29 133 as an interesting post-hoc correspondence, not an independently validated locator or cipher instruction.

## Fixed method and corpus

The pinned helper transcription in [`analyze_gematria.py`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/analyze_gematria.py) strips nonletters, uppercases, and greedily consumes a known two-letter digraph when present; otherwise it consumes one letter. Its lookup table has 29 distinct prime values (with aliases such as U/V and C/K). The same tokenization is applied unchanged to the complete comparable set of human-readable PGP clear-signed message bodies in the pinned 2013 archive.

Included: the 2013 OS message, first-onion clue and hello messages, second-onion “everything you need” and ICMP messages, third-onion coordinate/standby messages, fourth-onion no-email message, and final invitation. Excluded before scoring: duplicate unsigned OS text, hex/gzip dumps, binary whitespace-stego payloads (`whitespace-message.txt`, `gematria.jpg.asc`), raw tweet hex stream, and public-domain source books. The extracted message bodies, original source blob SHAs, and exact selection rule are preserved in `im-results/data/cicada2013-clear-signed-text-corpus.json`.

## Full-message outputs

| 2013 signed message | GP29 tokens | Prime sum | BASE29 |
|---|---:|---:|---|
| OS `message.txt.asc` | 27 | 1153 | `1AM` |
| First-onion `clue.txt.asc` | 50 | 2015 | `2BE` |
| First-onion `hello.txt.asc` | 61 | 2398 | `2OK` |
| Second-onion `everything-you-need.txt.asc` | 92 | 4008 | `4M6` |
| Second-onion `icmp-echo.asc` | 46 | 1857 | `261` |
| Third-onion `annapolis-md.txt.asc` | 0 | 0 | `0` |
| Third-onion `okinawa-japan.txt.asc` | 0 | 0 | `0` |
| Third-onion `standby.txt.asc` | 21 | 974 | `14H` |
| Fourth-onion `no-email.txt.asc` | 106 | 4880 | `5N8` |
| Final `invitation.asc` | 1709 | 76274 | `33K4` |

The selected phrase “THE KEY IS ALL AROUND YOU” is a **19-token substring** of the OS message, not the full message. Its prime values sum to **931**, and (931=1\times29^2+3\times29+3), so BASE29 is `133`. The complete OS message instead sums to **1153**, BASE29 `1AM`.

## Familywise 19-token scan

There are **1,968** consecutive 19-token windows across the included corpus. **12** windows sum to 931:

| Source | Start token | 19-token window |
|---|---:|---|
| OS message | 0 | `TH E K E Y I S A L L A R O U N D Y O U` |
| Fourth-onion no-email | 20 | `U T D I D N O T R E C E I V EA N E M A` |
| Fourth-onion no-email | 65 | `A T C G M A I L C O M M A K E S U R E` |
| Final invitation | 216 | `R E W O N T B EA N Y H I D D E N C O D` |
| Final invitation | 246 | `E S S A G E S O R P H Y S I C A L T R` |
| Final invitation | 730 | `W O U L D H A V E R E V EA L E D S O M` |
| Final invitation | 766 | `Y R A N N Y A N D O P P R E S S I O N` |
| Final invitation | 1001 | `E S O R D E C L I N E M E M B E R S H` |
| Final invitation | 1102 | `N D O U B T E D L Y W O N D E R I NG W` |
| Final invitation | 1451 | `I E V E TH A T E V E R Y H U M A N B E` |
| Final invitation | 1452 | `E V E TH A T E V E R Y H U M A N B E I` |
| Final invitation | 1463 | `H U M A N B E I NG H A S A R I G H T T` |

The selected OS phrase is one of twelve hits; the same sum occurs repeatedly in unrelated prose, especially the long final invitation. The correspondence is therefore not rare within the relevant corpus. More importantly, it appears only after selecting a 19-token substring; the full OS message does not produce133.

## Stage11 comparison

The pinned Stage11 HTML has title `133`, one numeric element ID `331`, and **58** image links (0–57). There is no image or element ID `133`. The arithmetic `133 mod 58 = 17` would point to image17 only after inventing an otherwise unsupported modulo-58 rule. The factorization (133=7\times19) can point to image19 only after choosing a factorization rule; the HTML links all 58 images in ordinary order and does not privilege19. No further fixed Stage11 object is selected by133.

## Conclusion

The prime sum and BASE29 conversion reproduce exactly, but the familywise control defeats the claim that the selected phrase uniquely predicts title133. The full-message outputs do not yield133; 12/1,968 19-token windows yield931; the title is the only visible133 field; and no source instruction maps133 to a further asset. The 2013 OS / Stage11 relation remains a possible historical association, not a causal decoding route. Do not use it to justify further p50/p55 key fitting.

## Reproduction

Run from repository root:

`node sims/cicada2013_prime_gematria_931_familywise.cjs`

The script reads the pinned corpus snapshot in `im-results/data/cicada2013-clear-signed-text-corpus.json` and the Stage11 HTML at `resources/external/cicada2014-stage11-onion7-original-index.html`.
