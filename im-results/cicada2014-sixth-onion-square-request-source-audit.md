# 2014 Sixth Onion square-submission messages: authenticated request, no new square operation

**Decision (20 November 2026):** the three requested messages are now preserved and independently verify under the established Cicada 3301 public key. They authenticate a hidden-service upload challenge, not a method for constructing or transforming the three squares. The bounded Issue #1945 therefore meets its **negative** completion criterion for a new square operation or LP2 receiver. No LP2 plaintext, key, or destination is recovered.

## Exact source objects and signature results

Pinned source: [`cicada-solvers/neuroretransmit-cicada`](https://github.com/cicada-solvers/neuroretransmit-cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd/2014/008-sixth-onion), commit `b13600373d3400d75ec4208198019f3d92a304dd`.

All three armored objects are exactly 1,234 bytes. Their Git blob IDs match the pinned source tree and their SHA-256 values are independently reproduced by `sims/cicada2014_sixth_onion_square_request_sft.py`.

| Source object | Git blob SHA-1 | SHA-256 | OpenPGP signature time (UTC) |
|---|---|---|---|
| [`11.jpg.asc`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2014/008-sixth-onion/11.jpg.asc) | `2f825249d5d37555053abf3b07d2fe8fb1def56b` | `6f2db751c9d6acd7f17c59679e4313632402a66e7295447781d0de5701894027` | 2014-01-19 07:39:42 |
| [`12.jpg.asc`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2014/008-sixth-onion/12.jpg.asc) | `7d883e03ece7823fbfcfe906461084c55ea1525b` | `78581663e7a5ba77494d1840820098b122217edd13009661f1be2e497db88179` | 2014-01-19 07:39:50 |
| [`13.jpg.asc`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2014/008-sixth-onion/13.jpg.asc) | `4cff459f0d0d6abb4c1d8879591fd085e420877a` | `83835b0e148c1061d42693ea14a5035f54ad41fa45496b00b37311b8e96a2095` | 2014-01-19 07:39:57 |

Each reports `GOODSIG` and `VALIDSIG` under primary fingerprint `6D854CD7933322A601C3286D181F01E57A35090F` (key ID `181F01E57A35090F`), imported from `resources/cicada-3301-authentic-public-key.asc`. GnuPG 2.4.7 exits 0 on all three. Its `[unknown]`/trustdb warning says the key is not certified by this local web of trust; it does not indicate a failed signature. The signed bytes are authenticated under the repository's established Cicada key. This does not independently prove the community archive's HTTP custody.

## What the three signed bodies actually say

The common instruction is:

1. Create one Tor hidden service that accepts CGI file uploads.
2. When the service is reachable and accepts input, post **the three magic squares** and the URL of that service.
3. Work alone.

The bodies also say “Good luck” and end with `3301`. The only operational instruction is to submit already-obtained square data to a participant-hosted service. No body specifies how to derive the squares, their ordering, a traversal, coordinate origin, arithmetic, a key, or a decoder for LP2.

Each message includes a distinct framed 3×3 numeric pattern. Under the straightforward decimal 3×3 reading, none is itself a magic square:

| Message | Row sums | Column sums | Diagonal sums |
|---|---|---|---|
| 11 | 425, 449, 425 | 932, 38, 329 | 427, 427 |
| 12 | 122, 146, 122 | 32, 38, 320 | 124, 124 |
| 13 | 223, 247, 223 | 332, 38, 323 | 225, 225 |

These are not the three requested magic squares. The community-authored Stage 8 README calls the small patterns “frames” and interprets them as OutGuess metadata; that explanation is useful historical context, but it is not part of the signed instruction and was not independently reproduced by this bounded audit.

## Cross-check against the 99-number stream and Stage 10

The existing `resources/cicada2014-openpuff-magic-squares.txt` contains 99 entries arranged as three actual magic squares:

| Square | Dimensions | Entries | Row/column/diagonal sum |
|---|---:|---:|---:|
| 1 | 5×5 | 25 | 3301 |
| 2 | 7×7 | 49 | 1033 |
| 3 | 5×5 | 25 | 1033 |

The three sums and dimensions match the fields in the preserved 2014 Stage 10 client form (`53301`, `71033`, `51033`), as documented in `im-results/2014-stage10-squares-cgi-source-boundary.md`. The saved Stage 10 success response only displays `/107.jpg`, `/167.jpg`, and `/229.jpg`; it does not disclose a square-generation algorithm. This confirms that the 99-number set is shaped like the three objects later requested for submission, but the 11/12/13 signed messages do not themselves select or generate that set.

The Stage 8 community README says the squares came from the preceding OpenPuff stage and a prior square from the third onion. That is a plausible reconstruction of the human solve path, not an additional statement authenticated by these three messages. The original Stage 7 page and MP3 acquisition gap remains separate.

## Follow-on signed response: upload protocol, not square mathematics

The same pinned archive contains [`ut3qtzbrvs7dtvzp.onion.v2-form.html.asc`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2014/008-sixth-onion/ut3qtzbrvs7dtvzp.onion.v2-form.html.asc), preserved as `resources/historical/cicada2014-sixth-onion-v2-form.html.asc`. It is 1,350 bytes (Git blob `ff4d21ad4e56836070f431a6a297ab14a10a099b`, SHA-256 `8de5d05fccdaa3c087ce70eea44fba27f7cac9db290a46a0672ab717a0ebbfc0`) and also verifies under the same key, signed 2014-01-25 08:26:57 UTC.

That signed follow-up tells the participant to paste the magic squares, provide their Tor URL, host the receiving CGI script at `/cgi-bin/upload`, name its file input `file`, and publish their own public key at `/key.asc`. This is the participant-side upload contract. It is distinct from Cicada's Stage 10 `/cgi-bin/squares` endpoint; it supplies no square construction or LP2 operation.

The 1,351-byte iBotPeaches `messages/2014/hello-you-have-done-well.asc` mirror (Git blob `14470df9fd76f4d1599ab12e63b77d1a143d46af`) is exactly the pinned 1,350-byte follow-up plus one trailing LF. The signed body is identical and the mirror also verifies. It is a line-ending variant, not a separate instruction.

## Reproduction and disposition

Run:

```bash
python3 sims/cicada2014_sixth_onion_square_request_sft.py
```

The read-only SFT checks the four preserved source objects' exact byte counts, Git blob SHA-1s, SHA-256 hashes, signer fingerprint and signature timestamps; confirms the embedded 3×3 patterns are not magic squares; and checks that the existing 99-number source contains the 5×5/3301, 7×7/1033, 5×5/1033 square set.

**Disposition:** retain these as authenticated historical instructions for the 2014 submission stage. They clarify the intended human workflow—recover three earlier squares, run a participant CGI service, and submit them—but do not add a source-selected square operation, LP2 key, unknown-page plaintext, or destination. Do not launch new permutations or arithmetic consumers from the framed 3×3 patterns without a separate first-party selector.
