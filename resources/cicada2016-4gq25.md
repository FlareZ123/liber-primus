# Cicada 2016 signed clue image: archival source record

**Classification:** archival copies and extracted signed-text reference; not an LP2 plaintext or key.

## Original publication envelope

The original Twitter status `684596461628223488` (account `@1231507051321`) carries a Snowflake publication time **2016-01-06 04:44:50.296 UTC**, equivalent to **5 January in the US Pacific time zone**. A modern Twitter-profile mirror displays the visible tweet body as only `infotomb.com/4gq25.jpg`. Participants independently recorded that exact URL and the OutGuess extraction by 2016-01-06 08:40:27 UTC. The original tweet/InfoTomb HTTP response bytes were not located. A contemporaneous January 7 4chan post also preserves a `4gq25.jpg` image attachment, 563×569 pixels; its raw bytes have not been compared. This publication-level witness supplies no additional authorial LP2 cipher or key selector. [Original tweet / InfoTomb source-envelope decision](../im-results/2016-tweet-infotomb-publication-envelope.md).

## Image

- Archived copy: https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg
- Independent mirror: https://github.com/scream314/cicada3301/blob/master/assets/2016/4gq25.jpg
- Both GitHub trees expose the same Git blob SHA: `22027296dcd7df53c5127e6aadbabeaf3223f72d` (26,342 bytes).
- A byte-exact local copy is preserved at `resources/historical/cicada2016-4gq25.jpg`; its blob SHA matches both external copies.
- JPEG structure: 563×569 pixels, 8-bit, three components; JFIF APP0 only. No EXIF APP1 or JPEG COM segment was present. The EOI marker is at byte offset 26,340, with zero trailing bytes.
- The raster shows the signed text over a faint leafless tree. The pixels do not establish the tree species or location.
- The header/metadata check does **not** test OutGuess's DCT-coefficient payload; that is a separate steganographic channel.

## Extracted OutGuess payload

- Archived extraction: https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg.outguess
- Git blob SHA: `a0d8bd2d73613e01cd8a2103d5721b2b998ee482` (1,136 bytes).
- A byte-exact copy is now preserved at `resources/historical/cicada2016-4gq25-outguess.asc`; its local Git blob SHA was checked against the external archive's blob SHA and matches exactly.
- The file is an ASCII OpenPGP clear-signed message with key ID `7A35090F`. The archive's `stage01/README.md` documents extraction with `outguess -r 4gq25.jpg 4gq25.jpg.outguess` and reports `seed: 230, len: 1136`. This invocation independently reconstructed the exact 1,136-byte file (Git blob SHA matches the archived blob), imported `resources/control/cicada-3301-public-key.asc`, and ran `gpg --verify`. GnuPG returned **Good signature** from “Cicada 3301 (845145127)” using RSA key `0x181F01E57A35090F`, fingerprint `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`. GnuPG also reported `[unknown]` trust: this verifies the signature against the stored public key, not the key's real-world identity. Reproduction commands: `gpg --import resources/control/cicada-3301-public-key.asc` then `gpg --verify resources/historical/cicada2016-4gq25-outguess.asc`. The extraction was subsequently reproduced in CI using the repository's pinned OutGuess 0.4 build: `outguess -r resources/historical/cicada2016-4gq25.jpg outguess-2016-results/4gq25.jpg.outguess` returned `seed: 230, len: 1136`; `cmp` confirmed byte-for-byte equality with the preserved `.asc` file, and GPG verification of the extracted output succeeded. Extracted-payload SHA-256: `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`. The regression is in `.github/workflows/lp2-outguess.yml` (manual `workflow_dispatch` input `cicada2016`; the workflow has no automatic source-change trigger).

## Independent period witness and byte-level whitespace audit

A separate contemporaneous repost appears in the [Boards.net thread 6, “Clue 2016 No silly Spaces this time”](https://cicada3301.boards.net/thread/6/clue-2016-silly-spaces-time), in a post by `wetsand` dated 2016-01-19 11:32:05 UTC. The archived HTML witness is [preserved by Dukotah](https://github.com/Dukotah/cicada3301/blob/master/corpus/C-community/forums/boards_net_live/thread_6_clue-2016-silly-spaces-time.html) (Git blob SHA `10eb541af5a0db09542106d11cc34678723ac247`). Its PGP block is extracted at [`im-results/2016-forum-witness-extract.asc`](../im-results/2016-forum-witness-extract.asc); this is a derived HTML extraction, not a raw capture from the original host.

The forum repost preserves the same signature packet and the same cleartext body after OpenPGP normalization. Both copies verify as a **Good signature** under the repository key fingerprint `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F` (GnuPG trust remains unknown). The two internal double spaces—after `way.` and `paths.`—are part of the signed body and appear in the period repost. They are consistent with two-space sentence spacing; no source-selected key mapping follows. The extracted file's single trailing space after `their` is absent from the forum repost and is stripped by OpenPGP cleartext canonicalization, so it is not authenticated.

The source record's earlier transcription had a full stop after `map`; the signed bytes and forum repost both have a comma: `the map, their meaning`. Full comparison, hashes, and reproduction are in [the whitespace audit](../im-results/2016-signed-payload-whitespace-audit.md).

The following is a normalized human-readable transcription; use the `.asc` file above for byte-exact content and signature verification:

```text
Hello.

The path lies empty; epiphany seeks the devoted.

Liber Primus is the way.  Its words are the map, their
meaning is the road, and their numbers are the direction.

Seek and you will be found.

Good luck.

3301

Beware false paths.  Verify OpenPGP 7A35090F.
```

The explicit **“Beware false paths”** warning is important: semantic/geographic matches must be tested against alternatives and an independently fixed stopping rule. The signed text does not add an explicit A-road name, coordinate, cipher key, or LP2 plaintext.

This is a reference record for the archived image and extracted payload. The two GitHub image/payload archives are byte-identical mirrors, not independent captures from the original infotomb host or tweet CDN. The separate January 2016 forum post is a contemporaneous repost of the signed message, not an independent OutGuess extraction or original-host capture.
