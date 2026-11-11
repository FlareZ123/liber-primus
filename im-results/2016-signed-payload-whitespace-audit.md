# 2016 signed-payload whitespace audit

**Decision:** no source-selected byte channel or LP2 key is recovered. The contemporaneous repost establishes which spacing is authenticated and which is not.

## Inputs and provenance

- Original OutGuess extraction: [`resources/historical/cicada2016-4gq25-outguess.asc`](../resources/historical/cicada2016-4gq25-outguess.asc), 1,136 bytes, SHA-256 `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`, Git blob `a0d8bd2d73613e01cd8a2103d5721b2b998ee482`.
- Independent period repost: Boards.net [thread 6, “Clue 2016 No silly Spaces this time”](https://cicada3301.boards.net/thread/6/clue-2016-silly-spaces-time), first post by `wetsand`, 2016-01-19 11:32:05 UTC. Its archived HTML is [`Dukotah/cicada3301/corpus/C-community/forums/boards_net_live/thread_6_clue-2016-silly-spaces-time.html`](https://github.com/Dukotah/cicada3301/blob/master/corpus/C-community/forums/boards_net_live/thread_6_clue-2016-silly-spaces-time.html), Git blob `10eb541af5a0db09542106d11cc34678723ac247`.
- The forum PGP block extracted from that HTML is preserved as [`2016-forum-witness-extract.asc`](2016-forum-witness-extract.asc). It is a derived HTML extraction, not an original binary capture.
- The `scream314/cicada3301` and `micheloosterhof/cicada-2016` OutGuess files are byte-identical mirrors of the local 1,136-byte payload. They are not independent original-host or CDN captures. The forum post is a separate contemporaneous repost of the signed message, not a second OutGuess extraction.

## Signature and byte comparison

Both the original extraction and the forum reconstruction verify with `gpg --verify` against the repository key `resources/control/cicada-3301-public-key.asc`. GnuPG reports a **Good signature**; the primary fingerprint is `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F` (key ID `7A35090F`). GnuPG trust remains `[unknown]`; verification establishes consistency with the stored public key, not real-world identity.

The original file is 1,136 bytes; the reconstructed forum block is 1,134 bytes. Their PGP signature packets are identical, and their cleartext bodies become byte-identical after OpenPGP cleartext normalization (line endings normalized; trailing spaces/tabs removed). The normalized-body SHA-256 used by the reproducer is `19f5dccb7e188db0ef181eeeb85fef51defdb5667bf0b0393c28e638d871801a`.

The two-byte raw-file difference is exactly:

1. one trailing space after `their` at the end of the first line of the long “map” sentence; and
2. the final newline after the armor.

The trailing space is not authenticated: OpenPGP cleartext canonicalization strips trailing whitespace, and the period forum copy does not contain it. Do not use it as key material. The forum HTML represents message line breaks with `<br />`; it cannot establish whether the original transport used LF or CRLF. The PGP signature canonicalizes line endings, so that distinction is not authenticated either.

## Stable signed whitespace

There are exactly two internal double-space runs in the signed body:

- after `way.` in `Liber Primus is the way.  Its words are the map, their`;
- after `paths.` in `Beware false paths.  Verify OpenPGP 7A35090F.`.

Both are present in the contemporaneous forum repost and survive signature verification. They are the only same-line sentence boundaries in the body and are consistent with ordinary two-space sentence spacing. The rest of the body uses paragraph/line breaks. The forum thread title and the poster's commentary after the signature are user-authored, unsigned material, not Cicada instructions.

**Correction to the earlier normalized transcription:** the signed text says `“the map, their meaning”`, with a comma after `map`; it does not say `“the map. Their meaning”`. The source record and authoritative synthesis are corrected in the same change.

## Interpretation

The period repost makes the two internal double spaces an authenticated feature of the signed message. It does not give them a source-selected mapping to a GP29 key, nonce, PRNG seed, or LP2 keystream. Their placement is explained by sentence spacing. The single trailing space is unsigned and unstable. No byte-layout candidate from this artifact currently advances LP2 decryption.

## Reproduction

Run:

```sh
node sims/audit_2016_signed_payload_whitespace.cjs
gpg --import resources/control/cicada-3301-public-key.asc
node sims/audit_2016_signed_payload_whitespace.cjs --verify-gpg
```

The reproducer checks raw lengths and hashes, normalized-body equality, signature-packet equality, the two authenticated double spaces, and the unsigned trailing space. The forum extraction procedure is: take the PGP block in the `wetsand` post in the archived HTML, replace `<br />` with LF, strip HTML tags, decode HTML entities, and restore the PGP armor delimiter hyphens.