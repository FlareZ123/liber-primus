# Cicada 2016 signed clue image: archival source record

**Classification:** two original-host January 2016 Wayback responses, archival copies and extracted signed-text reference; no LP2 plaintext or key.

## Original publication envelope

The original Twitter status `684596461628223488` (account `@1231507051321`) carries a Snowflake publication time **2016-01-06 04:44:50.296 UTC**, equivalent to **5 January in the US Pacific time zone**. A modern Twitter-profile mirror displays the visible tweet body as only `infotomb.com/4gq25.jpg`. Participants independently recorded that exact URL and the OutGuess extraction by 2016-01-06 08:40:27 UTC. The original tweet's HTTP response remains unavailable. The exact InfoTomb host URL now has recovered January 9 and January 16, 2016 Wayback responses: the former is a 99-byte server-path preamble followed by the canonical 26,342-byte JPEG; the latter is the canonical JPEG alone. A contemporaneous January 7 4chan post also preserves a `4gq25.jpg` image attachment, 563×569 pixels. The currently accessible Imgur repost is byte-distinct from the canonical carrier but independently recovers the *identical* 1,136-byte authenticated OutGuess message; the 2016 4chan upload's original on-wire bytes remain unrecovered. This publication-level witness supplies no additional authorial LP2 cipher or key selector. [Original tweet / InfoTomb source-envelope decision](../im-results/2016-tweet-infotomb-publication-envelope.md).

## Image

- Archived copy: https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg
- Independent mirror: https://github.com/scream314/cicada3301/blob/master/assets/2016/4gq25.jpg
- Both GitHub trees expose the same Git blob SHA: `22027296dcd7df53c5127e6aadbabeaf3223f72d` (26,342 bytes).
- A byte-exact local copy is preserved at `resources/historical/cicada2016-4gq25.jpg`; its blob SHA matches both external copies.
- JPEG structure: 563×569 pixels, 8-bit, three components; JFIF APP0 only. No EXIF APP1 or JPEG COM segment was present. The EOI marker is at byte offset 26,340, with zero trailing bytes.
- The raster shows the signed text over a faint leafless tree. The pixels do not establish the tree species or location.
- The header/metadata check does **not** test OutGuess's DCT-coefficient payload; that is a separate steganographic channel.
- The [original-host Wayback capture](historical/cicada2016-4gq25.md) from 2016-01-16 matches this JPEG byte-for-byte. The distinct 2016-01-09 host response has 99 preceding ASCII bytes naming server temporary paths and then **the identical JPEG**. Its original raw SHA-256 is `2aa61b8393e6d993646445caabccbf03812f553b24c8752c66eb1c9526b458f4`; see [original-host reconstruction SFT](../sims/lp2_2016_infotomb_capture_envelope_sft.cjs) and [archived raw responses, run 44939817654](https://github.com/FlareZ123/liber-primus/actions/runs/44939817654/artifacts/14720889155).

### Independent January 2016 repost carrier, byte-variant positive (17 November 2026)

The [7 January 2016 /x/ post 17184052](https://4chanarchives.com/board/x/thread/17183963/post-all-your-cicada-3301-clues-here) links `https://i.imgur.com/6yfjB9k.jpg`. A direct 17 November 2026 HTTP 200 `image/jpeg` response returned **23,975 bytes**, SHA-256 `6dffc48b8672f03034dc6e3c17985ecdb7096d0686a77d74172f7629b687b39e`, contrasting with the preserved primary image's **26,342 bytes**, SHA-256 `a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe`. The two JPEG byte streams demonstrably differ; the live Imgur response is **not** established to be the unmodified image originally attached in 2016.

The pinned OutGuess 0.4 extractor, built from commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`, independently retrieved from this byte-distinct Imgur image **seed 230, length 1,136** and recovered an output with SHA-256 `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`, **exactly identical** to the canonical signed extraction already GPG-verified. This is a separate contemporary repost-path carrier of **the same authenticated first-layer message**, without an extra first-layer key or plaintext. It does not establish byte fidelity to the original InfoTomb server, 4chan attachment, or any other hidden steganographic channel. [Single-file source witness/OutGuess gate](../sims/lp2_2016_4chan_original_carrier_variant_sft.cjs) · [successful pinned Linux source run](https://github.com/FlareZ123/liber-primus/actions/runs/44112529129).

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
