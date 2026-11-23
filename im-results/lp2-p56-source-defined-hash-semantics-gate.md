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

### Exact 2014 Stage03/Stage04 page candidates (Agent24, 23 November 2026)

The preserved Stage03 and Stage04 index objects are natural earlier-chain candidates for the p56 “deep web page” target. I tested the exact repository blobs and the two unambiguous payload boundaries (ASCII hex and decoded 256-byte payload) under the two 512-bit functions already motivated by the historical discussion: SHA-512 and Whirlpool. None equals the target.

| Candidate bytes | Length | SHA-512 | Whirlpool |
|---|---:|---|---|
| Stage03 exact page blob (resources/external/2014-stage03-index.html; Git blob c979fa7e23de1b04b502467da75ff5b506b97ff8) | 541 | be9ee498562df5a81c7a0db7dba23bb20a3e230dba1ab51ec5882275c3559352eaf37330437a260dc2d0f2139027f596e0872238d1d57b56b7c1eff699a7373e | 160ea5bc1dbb02376667f4e5b873c44660abe666cb33405d2a73b7147047f96e2fbe1b8754af9481ab3a1124f2ac601392b4aa05d60cdff70828d7e008e117a3 |
| Stage03 ASCII hex body | 512 | cc30bb42838d78c7be803673de8af61b537191dcc2d31bcc37b10f0d023c5771b383458e41d9db510ba201d86e05175551249cd838ca7cebc640c7d38a3ed211 | 8c154fc0637644b59c0a0241079a4e70d6206e52157512deee12897965ad1c228243f224813b47df73f4cd0c4c1e3701acb49c058f5e3243a47cdf330ec34fce |
| Stage03 decoded payload | 256 | 881fc9e850842a8765c86e020e854b5c49680e5027625ca45a7a2fca6b2093d57b35aecf1b3b40b0604e26f2421fd6b0884203cc68e9674fa4abfad4f904f5a2 | 97d39186b7c5e45f6915e3907dd8049d04f39f386375551f53b1e861f0c8b6f1452fe61e7976cbc2abdeaffde8e6067daf3c4597b2d16c5a5b68e282e146cdac |
| Stage04 exact page blob (resources/external/2014-stage04-index.html; Git blob 81837b8d5e89f6a31731b84a217a6fdeaa62aff8) | 524 | 8b88426ab9884bf7c23e07fa5f5e2c0a2092f79c0496fbf4dd3e1d149e8c4a91f312127f945846be071d5f6bc84e4853d7a426f8de00b6b464fedfc0af59ecfe | fe81c7ea2846612812042ce6522569f0fd9304a1002b35b2ffcfae038153ae6ebb2925bb5bd87dd82dbcea26ff534785226e0370280b1f1663f450b796929538 |
| Stage04 ASCII hex body | 512 | 524ef99542ccf8ee7232e37082e0232699ffe306438e8b223afbdd4fad906754fb52eb1c2a38635d860f0504636c68c5b3c86c6f3bb9e23d50a8da4b3c1cd681 | b33edcb42ca46d9c2a9c1c377155947721c25bfb87d9ede787e22a042413daf1a5b50f4a563f6074f837b4273c3e53b25c5156543109e47bbfb15516fc9356e6 |
| Stage04 decoded payload | 256 | 678fe2ae157719f5cc2b02d01c6646b92288e37f1e8e5a156db44282c660d25aefe9d17d365d2fb2a3ca796e2c0f3e192739d06638b86be9deaf3d8541e17dac | c4193d23c63d160596420536e4fd124c83c39eed2d25da1b7ca575a8e918e380e74a51f0f7f520a19fa7b73f5f5259499eafe0409c3ce37c5383716f6d5d4678 |

The Stage03 512-character hex body is byte-for-byte identical to the 512-character value in resources/2014-onion2-final-256byte-hex.txt (the authentic January 2014 Onion2 stream; the two repository blob IDs are c979fa7e23de1b04b502467da75ff5b506b97ff8 and cc631b0836032827021d20f3d2c805401c9ee439). Therefore the decoded Stage03 payload row also tests the Onion2 256-byte stream itself; it is not a separate untested candidate.\n\n
### Third 2014 onion and participant XOR output (Agent24, 23 November 2026)

The remaining original 3301-labelled preliminary 256-byte page is also a natural earlier-chain candidate. Its exact 512-character hex object is preserved at the external archive path neuroretransmit/cicada/2014/006-fourth-onion/avowyfg151kzfj3n_256.hex (Git blob 5fd99c0f6c0fe9f86c013f19880ba8179ccf9f0c). I tested both its ASCII-hex bytes and decoded 256-byte payload, plus the 256-byte result of the contemporary participant-authored three-way XOR (1033 ⊕ 761 ⊕ 3301). None matches the p56 target under SHA-512 or Whirlpool.

| Candidate bytes | Length | SHA-512 | Whirlpool |
|---|---:|---|---|
| 3301 ASCII hex | 512 | f9ade05de913286358bc4bcbeb600413c4a10afdc24f088f2d113f9bcf6f411f73b1fd453487b9111e49fcea90b3b988801151b1fe206a5cb251335cef7466b3 | e3c81918dbf7c9e4bd05dd8f048a42a27e80dded6dbdb351c82996466b38473101db45a74ce80359357b7dcc7c4e96d7f100a2eab027af416f256a938fb39f88 |
| 3301 decoded payload | 256 | ba7474bde659c5fa6008eae27f8ac9b0d5537eac6237771e3f5c9b6e2a1555f51ada4985ee6e1d15266be58e9e536f6d2b7b47732a4492c863f0ee21eba5b4b8 | 847aba84f8b9410d42d56a95b76362180842e317bf68921dff10e51a6cb0dfe9da7e364954ec0646deac8f5078fead5719e2f9e699c3257f5c9e9e1d66f59343 |
| Participant three-way XOR output (1033 ⊕ 761 ⊕ 3301) | 256 | 0949487eb2bac6110964abdcfd2283369ea832e829decad577cd17d936e07629508163c76139f1eb96596c12e104cca8441cc26c29204d19029b35c802a3c84e | c2335b424f90881e8dc45d2ceb78bb24dc6db8967e3384ac6a0a8abdfac469dc351b98af776eebdff9b6dce8e5151546fb034070eccffe3995c163e53210dfcd |

The XOR output is not an author-authenticated page or a Cicada-specified p56 preimage; it is included as a plausible derived-file candidate because the operation exists in the contemporary participant script. The 3301 candidate is an archived preliminary page, not the later gzip carrier. These tests reject only the stated exact byte objects and boundaries, not lost HTTP wrappers or other historical page versions.

Reproduction: run sha512sum FILE and openssl dgst -provider legacy -whirlpool FILE. For each page, the ASCII-hex body is the 512-character line after its HTML comment; the decoded payload is bytes.fromhex(body). This rejects only these preserved page/payload byte boundaries. It does not establish that lost original HTTP response bytes or other historical pages are absent.

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

## Terminal-page visual handoff audit (Agent47, 20 November 2026)

Original LP2 scans were inspected in physical order, with p52 and p54 first and p53/p55 only for additional independent art/layout:

- **p52 / original scan 69.jpg:** grayscale JPEG (mode `L`), with a light ground, dark runes, bilateral vine/root border, and three-dot clusters on both margins. The apparent yellow/purple palette in the earlier display was a false-color rendering of grayscale values, not source color. No separate caption, key legend, or localized mark points from this page to a later page or selects a cipher operation.
- **p54 / original scan 71.jpg:** RGB JPEG, with the same bilateral border and three-dot margin clusters. Its large red initial and small red separator are genuine visible color features; the derived `lp2-ink-annotations.json` likewise labels the nine-rune span and punctuation at offset9 as red. The separator's positional role is already established as an ordinary word boundary, not a state opcode ([p54 separator audit](lp2-p54-tiny-red-point-original-separator-gate.md)).
- **p53 / original scan 70.jpg:** RGB scan with the same border motif and cicada engraving at the foot; its red text/arrow and 179-rune/51-rune annotated span are visible and already-known, and were not treated as new selectors.
- **p55 / original scan 72.jpg:** RGB scan with the same border and cicada motif, a central tree illustration, and the already-known terminal red marker. The tree/branch hypotheses have been tested separately: the p32/p55 silhouette correspondence is not a stable topology-preserving copy, the 29-tip count is threshold-unstable, and no branch traversal or rune order is selected ([p55 tree source-panel gate](lp2-p55-ghosttree-balanced-v2-source-panel-gate.md)).
- **p56 / original scan 73.jpg:** RGB scan with the exact 128-hex target and five black dots below the text. **p57 / original scan 74.jpg:** RGB scan with the clear PARABLE text and a point-cloud tree. These provide a repeated tree motif across p55/p57, but no leaf/node labels, traversal, or link to a specific target URL.

The repeated vine border and three-dot clusters, p53/p55 cicada engravings, p55 tree, and p57 point-cloud tree are real visible features. The p52 JPEG does not preserve color, so its palette cannot be inferred; p54 is RGB and its red initial/separator are visible. Taken together the imagery may indicate a terminal botanical/cicada motif, but it does not define a Merkle tree or any other exact handoff: there is no source-selected leaf set, node order, hash function, canonical byte representation, page URL, or rule connecting the illustrations to the p56 digest. “Tree + 128 hex digits” is an association, not a reproducible hash instruction. No new p55/p56 cipher or hash family was tested.

**Decision:** the p52/p54-first visual inventory adds no source-selected handoff to p56. The exact p56 digest remains a target whose algorithm, byte boundary, and URL are unspecified; the terminal art does not fill those missing inputs.

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
