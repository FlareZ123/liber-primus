# 2013 prime-Gematria 931 → Stage11 title133: exact-tokenizer familywise gate

**Decision (19 November 2026):** the arithmetic is reproducible, but neither the prime-sum 931 nor the whole-sentence GP0 address252 is unique in the comparable 2013 corpus. Treat 931→BASE29 133 and the p50 cell252 correspondence as post-hoc structural observations, not independently validated locators, cipher instructions, or radix selectors.

## Fixed method and corpus

The preregistered participant tokenizer is applied **per alphabetic word**: uppercase; replace QU→CW and Q→K; greedily consume the longest lookup token (including 3-letter ING), then 2-letter digraphs, then singles. Preserve aliases U/V, C/K, S/Z, NG/ING, and IA/IO. The 29 distinct prime values are ranked in ascending order to produce GP0 indices 0–28. The GP-prime sum uses the raw prime values. This is the exact helper behavior frozen in [the familywise preregistration](../workplace/lp2-2013-all-around-p50-familywise-preregistration.md), not the earlier two-letter-only approximation.

Included are the ten human-readable PGP clear-signed message bodies in the pinned 2013 corpus: the OS message, first-onion clue and hello, second-onion everything-you-need and ICMP, third-onion coordinate/standby bodies, fourth-onion no-email, and final invitation. Excluded before scoring are the duplicate unsigned OS text, hex/gzip dumps, binary whitespace-stego payloads, raw tweet hex stream, and public-domain source books. The exact bodies, source paths, blob SHAs, and selection rule are preserved in `im-results/data/cicada2013-clear-signed-text-corpus.json`.

The OS screen itself is preserved from the original ISO but is **not PGP-signed**. A separate clear-signed `message.txt.asc` counterpart contains the same text. The signed 2013 TCP protocol authenticates integer BASE29 conversion; it does not authenticate text-GP0 summation or p50 addressing.

## Target phrase

The phrase `THE KEY IS ALL AROUND YOU` tokenizes to 19 GP29 tokens:

`TH E K E Y I S A L L A R O U N D Y O U`

| Measure | Result |
|---|---:|
| GP0 token sums by word | `[20, 49, 25, 64, 64, 30]` |
| Whole-phrase GP0 sum | **252** |
| Whole-phrase raw GP-prime sum | **931** |
| BASE29(931) | **133** |
| 20-letter A0Z25 sum | **241** |
| 20-letter A1Z26 sum | **261** |

The full OS message is not the target phrase: it has 27 GP29 tokens, GP0 sum318, raw prime sum1153, and BASE29 `1AM`.

## Familywise 19-token scan

Across the ten messages there are **1,953** consecutive 19-token windows. The target is one of **20** windows with GP0 sum252 and one of **13** windows with raw GP-prime sum931. The complete hit starts are preserved by the reproducer; the prime-sum hit list is:

| Source | Start token (0-based) |
|---|---:|
| OS `message.txt.asc` | 0 |
| Fourth-onion `no-email.txt.asc` | 66 |
| Final `invitation.asc` | 216, 377, 378, 379, 402, 408, 710, 941, 986, 1169, 1439 |

The 20 GP0=252 hits occur at starts: OS `message.txt.asc` 0; fourth-onion `no-email.txt.asc` 47; final invitation 71, 157, 211, 212, 387, 625, 683, 765, 913, 942, 976, 1004, 1014, 1104, 1185, 1439, 1577, 1614. The selected OS phrase is therefore **one of 20**, not a unique 252 address. The 13/1,953 prime-sum family likewise defeats the 931→133 uniqueness claim.

## Direct-address and character controls

Under the frozen zero-based row-major p50 table address rule, the GP0 19-token family yields **1,393 valid direct addresses**, of which **478** land on the 76-cell perimeter; **20** select a base60 token value of180 and **0** select a base59 value of180. All 20 base60=180 hits are the repeated GP0=252 address.

The character-based controls use 20-letter windows after stripping spaces and punctuation:

| Family | Windows | Valid addresses 0–255 | Perimeter | base60=180 | base59=180 |
|---|---:|---:|---:|---:|---:|
| A0Z25 | 2,031 | 1,777 | 593 | 28 | 0 |
| A1Z26 | 2,031 | 1,267 | 484 | 24 | 0 |

The target phrase's own character sums are 241 and 261, neither252. Nevertheless, unrelated character windows produce 28 and24 base60=180 perimeter hits (all are cell252 addresses), so this is not an exceptional physical address under the character controls.

The precommitted whole-message controls also have valid direct addresses only for the two coordinate-only third-onion records: `annapolis-md.txt.asc` and `okinawa-japan.txt.asc` contain no alphabetic tokens, so both whole-message GP0 and raw-prime sums are zero. Each zero selects p50 cell0, token `3N` (base60=203, base59=200): an outer-perimeter cell, but neither a 180-value cell nor cell252. The other eight whole-message sums exceed255 under both numeric families. Thus each whole-message family has 2/10 valid direct addresses, 2 perimeter hits, 0 base60=180 hits, 0 base59=180 hits, and 0 cell252 hits. The two zero-token records remain included in the frozen corpus rather than being silently dropped.

| Whole-message family | Source records | Valid direct addresses | Perimeter | base60=180 | base59=180 | cell252 |
|---|---:|---:|---:|---:|---:|---:|
| GP0 sum | 10 | 2 | 2 | 0 | 0 | 0 |
| Raw GP-prime sum | 10 | 2 | 2 | 0 | 0 | 0 |

Full-message A0Z25/A1Z26 sums are recorded as diagnostics, but the precommitted character-address family is the 20-letter sliding-window scan above.

## Cell252 and Stage11

Cell252 is row31, column4 (zero-based), on the p50 outer perimeter. Its printed token is `30`: base60 value **180**, base59 value **177**. These are real table facts, but the whole-sentence GP0 family does not uniquely select the cell, and the table value does not choose a radix.

The pinned Stage11 HTML has title `133`, numeric element ID `331`, and **58** image links (0–57). There is no image or element ID `133`. The operations `133 mod58 = 17` and `133 = 7×19` select image17 or image19 only after adding unsupported modulo/factorization rules. The 13/1,953 prime-sum family does not authenticate a Stage11 continuation.

## Conclusion

The old two-letter-only tokenizer produced stale counts of 1,968 windows and12 prime-sum hits. The exact per-word participant tokenizer corrects these to **1,953 windows and13 hits**; the companion GP0 family has **20 hits** at252. Character controls independently produce 28/24 base60=180 perimeter hits, and the whole-message GP0/prime controls each have only two valid zero addresses, both landing at cell0 rather than cell252. Therefore the whole-sentence `THE KEY IS ALL AROUND YOU` sum does **not** uniquely select p50 cell252, does not establish base60 over base59, and does not validate the downstream p53 receiver. The p53 H-inverse result remains a separate conditional consequence; it must not be used to tune or rescue the address grammar. The newer wordwise 49/27/75/177 motif is a separate family assigned under #1912 and is not part of this whole-sentence audit.

## Reproduction

Run from repository root:

`node sims/cicada2013_prime_gematria_931_familywise.cjs`

The script reads only the pinned 2013 corpus, the original p50 32×8 base60 grid, and the pinned Stage11 HTML. It asserts the exact tokenizer, target phrase, all familywise counts, table values, and Stage11 metadata.