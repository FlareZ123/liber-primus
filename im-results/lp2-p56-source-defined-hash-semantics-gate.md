# LP2 p56 source-defined hash semantics gate

**Agent15, 18 November 2026. Director Issue #1664.**

## Decision

The p56 destination value is fixed exactly, but the surviving first-party corpus does **not** fix the hash algorithm, page serialization, canonicalization, HTTP byte boundary, or URL/body choice. No authenticated positive control was found that maps a preserved web page to a published digest under a source-stated rule.

This closes the issue by its second fork: preserve the exact target, keep algorithm and byte framing unknown, and do not launch normalization or hash-family sweeps as though they were author-selected.

## Exact target from the original page

LP2 internal p56 is the solved “AN END” page; in the repository's 75-image full-book sequence it is original scan `resources/liber-primus/73.jpg` (the Onion7 release named the same page `56.jpg`). The printed hexadecimal lines are lowercase and have lengths 26, 25, 25, 27, 25:

```text
36367763ab73783c7af284446c
59466b4cd653239a311cb7116
d4618dee09a8425893dc7500b
464fdaf1672d7bef5e891c6e227
4568926a49fb4f45132c2a8b4
```

Concatenated target, exactly 128 hex characters / 64 bytes:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

The solved instruction says that within the deep web there exists a page that “HASHES TO” this value. It does not print an algorithm name, media type, URL, request method, response/body distinction, text normalization rule, or canonicalization.

This exact transcription agrees with the previously frozen image-level audit in [p56-exact-digest-public-occurrences.md](p56-exact-digest-public-occurrences.md).

## Authenticated-message semantic census

The new deterministic source gate [`sims/lp2_p56_firstparty_hash_semantics_sft.cjs`](../sims/lp2_p56_firstparty_hash_semantics_sft.cjs) scans the 16 pinned Cicada clear-signed messages dated 2012–2016 in `resources/historical/`.

It deliberately separates the OpenPGP armor header from the signed authored body. Results:

- 16/16 have clear-signature header `Hash: SHA1`.
- 0/16 authored bodies contain the bounded semantic terms `hash`, `hashes`, `hashed`, `hashing`, `digest`, `checksum`, named SHA families, Whirlpool, BLAKE, Skein, or Streebog.
- 0/16 authored bodies contain the p56 target or its first printed line.

Therefore the visible `Hash: SHA1` text is evidence about the digest used by the OpenPGP clear-signature packet. It is not an authored instruction selecting SHA-1, or any other function, for the p56 webpage.

## Preserved 2014 HTML semantic census

The same gate scans ten repository copies representing six unique Git blobs of preserved 2014 stage/onion HTML:

- Stage03 index
- Stage04 index
- Stage10 post-square response
- the 170-byte and 201-byte Onion2 variants
- the Stage11/Onion7 index, represented by five identical repository copies

Across those six unique byte objects there are zero occurrences of the bounded hash/digest/checksum/family terms and zero p56-target-prefix occurrences. These files therefore provide no surviving first-party webpage-hash serialization rule.

The copies are not independent witnesses and are not claimed to exhaust lost historical HTTP responses.

## The misleading “liber-primus-hash-block” archive label

The archived signed object named `2014-01-liber-primus-hash-block.asc` does not supply a webpage-hash positive control. Direct inspection of the signed cleartext at krisyotam/cicada3301 commit `76d3ee8c762f60025822c8c05edbf31351636469` gives:

- OpenPGP header: `Hash: SHA1`
- authored cleartext: 34 lines of hexadecimal, 33×60 characters plus a final 2 characters
- total cleartext payload: 1,982 hex characters = 991 bytes when decoded
- p56 target occurrence: zero
- source-authored algorithm or webpage-byte instruction: zero

The independent signature timeline identifies the same signature as carried by the archived LP1 `liber_primus/00.jpg.asc` payload. The phrase “hash block” is an archive filename, not an instruction present in the signed body. It cannot be used as a positive control for p56 canonicalization.

## Positive-control decision

No authenticated page/hash positive control is present in the retained source set inspected here. A valid positive control for #1664 would need all three components together:

1. a first-party page or exact captured byte object;
2. a first-party stated digest algorithm;
3. a first-party statement fixing the bytes or serialization that the digest covers.

The preserved materials have authentic page artifacts and authentic signed messages, but no retained example satisfying all three components.

## Reproduction

Manual Windows Node 22 workflow run:

- [PASS 44420377403](https://github.com/FlareZ123/liber-primus/actions/runs/44420377403)
- head commit `8a8c86a5435cd8aace777ed8ddd674a3332c75bd`
- script: `sims/lp2_p56_firstparty_hash_semantics_sft.cjs`

## Consequence

The source-supported p56 contract is currently only:

> find a deep-web page whose unspecified hash equals the fixed 64-byte value above.

The following remain unknown inputs: digest family, whether the preimage is raw HTTP entity bytes or another representation, whether headers are included, content decoding, newline/character encoding, HTML/text normalization, and whether the URL itself participates.

A future destination claim can become established only by recovering an independently period-linked page object together with a source-authenticated rule, or by a candidate whose provenance and exact bytes yield a uniquely compelling match under independently motivated semantics. A guessed 512-bit family or fitted normalization remains exploratory evidence.
