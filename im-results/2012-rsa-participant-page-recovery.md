# 2012 participant-specific RSA page: provenance and reproducible decryption

## Finding

Three distinct participant-specific one-time RSA messages are now represented in the repository, and all three encrypted response numbers are reproducible. The original onion /NUM path token and original server-response bytes have **not** been recovered. A source-pinned screenshot of the enrollment form is now preserved; it confirms the email/number workflow but does not reveal an actual participant token or the later response. The archive README identifies the quaetrix0@gmail.com / valid-participant copy as the only one of its three page copies with a valid PGP signature; this invocation has not independently re-verified that signature. The unknown and another_unknown copies have redactions and their signatures do not verify.

The recovered RSA response numbers are **33521494043430258676** (valid-participant mirror), **29201928111913239376** (unknown), and **25121996842107342310** (another_unknown). These are numbers to enter at the same onion URL after decrypting the displayed RSA challenge; they are not the initial emailed /NUM path token.

## Provenance of the primary message

The public archive is pinned at [neuroretransmit/cicada commit `b13600373d3400d75ec4208198019f3d92a304dd`](https://github.com/neuroretransmit/cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd/2012/008-rsa-emails).

- The archive's `sources.txt` records the [Wayback capture of Pastebin `HakCdFW1`](https://web.archive.org/web/20120116170758/https://pastebin.com/HakCdFW1), captured at **2012-01-16T17:07:58Z**.
- The contemporaneous [AllMystery Cicada thread](https://www.allmystery.de/themen/it83189) contains posts dated **15 January 2012** discussing the unique email, a participant's **112-digit** RSA key, and the Pastebin copy. The participant says an earlier post was removed to redact the key. The modulus in the archived `unknown.asc` is also 112 decimal digits. This provides a contemporaneous participant/source chain for the message, although it is not a raw onion-server capture.
- The archive file `2012/008-rsa-emails/unknown.asc` has Git blob SHA-1 **`0e69b063b379a8ccdd8a96815de318bcf65a1247`**. It contains the one-time warning, RSA public modulus, compressed ciphertext and a signature packet naming Cicada key ID `7A35090F`.
- Its extracted ciphertext file `unknown.pem` has Git blob SHA-1 **`087ed31790eb8931d0255efd34e137ad13163b35`**. The source manifest itself has Git blob SHA-1 `6214cb83329eed3166930536504d581ce862bd63`.

**Authentication limitation:** the archive README identifies the `quaetrix0@gmail.com.asc` / valid-participant copy as the only one of its three page copies with a valid PGP signature; the `unknown` and `another_unknown` copies have redactions and their signatures do not verify. The valid-participant file is preserved locally as `resources/external/2012-sq6wmgv2zcsrix6t-valid-participant-rsa-message.asc` (blob SHA-1 `30a45f2149bf46fd99d156d24b7132f8e0f207b3`). The same signed challenge is reproduced in the [12 April 2021 account by Connor Tumbleson](https://connortumbleson.com/2021/04/12/the-cicada-3301-mystery-puzzle-1-extra/), which supplies its factors and reports plaintext `33521494043430258676`. The other two message copies' signature packets name key ID `7A35090F`, but that is not equivalent to successful signature verification. None of these mirrors is a byte-preserving capture of the original onion HTTP response.

## Reproducible RSA interpretation

The archived `unknown.pem` is a zlib-compressed serialization with header `10\0 188\0 Cyphertext` and a **188-byte** ciphertext field. With the archived `unknown.private` and `unknown.factors` values:

- (n=pq), with (e=65537);
- the ciphertext is four RSA blocks of 47 bytes;
- each decrypted OAEP block yields five bytes;
- concatenating the four chunks gives **`29201928111913239376`**.

This matches the archive README's recorded plaintext. The message says to return to the same URL and enter the decrypted number. Thus `29201928111913239376` is the **RSA response**, not the emailed `/NUM` path token.

### Third valid-participant sample

The separately preserved valid-participant-rsa-message.asc uses modulus

7880891639791153779530258464649693928733411681581577103690292822333198036864739065916344030512697162068582555837

with exponent 65537. The 2021 account gives the two factors

- 98007492061325958997349177934627388613835953553459586261
- 80411114232571782218163489375797613948878398942588985417

The local reproducer now independently applies the same Crypt::RSA 1.99 OAEP decoder to the preserved 188-byte ciphertext (four 47-byte blocks) and recovers **33521494043430258676**. This agrees with the secondary account. The factors are secondary-source inputs; the ciphertext itself is preserved locally. The initial emailed /NUM token remains unknown.

### Why standard OAEP fails

The message specifies `Crypt::RSA::ES::OAEP`, version **1.99**. The archived Perl implementation has two relevant behaviors:

1. `ES/OAEP.pm` encodes to `k-1` octets, with no leading standard-OAEP `Y` octet.
2. `DataFormat.pm` implements MGF1 with a loop variable `i` incremented by the SHA-1 digest length (**20**) rather than by one. For a 26-byte mask, the module uses counters **0 and 20**, not standard MGF1 counters **0 and 1**.

The source is pinned at [gitpan/Crypt-RSA commit `257f59d25d2d4adec3ef7e439e89b07a3a21a4ec`](https://github.com/gitpan/Crypt-RSA/tree/257f59d25d2d4adec3ef7e439e89b07a3a21a4ec): [`OAEP.pm`](https://github.com/gitpan/Crypt-RSA/blob/257f59d25d2d4adec3ef7e439e89b07a3a21a4ec/lib/Crypt/RSA/ES/OAEP.pm), Git blob `98b980c0575cc876143ba9f395fde361b6fe7eab`; [`DataFormat.pm`](https://github.com/gitpan/Crypt-RSA/blob/257f59d25d2d4adec3ef7e439e89b07a3a21a4ec/lib/Crypt/RSA/DataFormat.pm), Git blob `07edffd5340a50717f9c5ebf859c267a09d1a6cd`.

The reproducer implements this exact module-specific behavior using only the Python standard library. Replacing its MGF1 with standards-compliant counter progression does not recover the valid OAEP delimiter in these blocks.

## Independent archived-message cross-checks

The archive's separate `another_unknown.pem` ciphertext (Git blob SHA-1 **`49e290f2e80502c525f931b35c01232b7ee9bcf4`**) uses a different modulus, factors and private exponent. The same independent decoder recovers **`25121996842107342310`**.

The 11 June 2021 [participant-style account](https://saumitrasapre.medium.com/the-mysterious-puzzle-2-c73d805e1f04) prints the matching RSA message and says that appending `25121996842107342310` to `sq6wmgv2zcsrix6t.onion` returned “Correct. We'll email you”; the following email contained the MIDI clue. This is a useful independent consistency check on the second decryption and the historical sequence, but it is a retrospective secondary source, not a contemporaneous archive capture or signature verification.

## Source-pinned enrollment-form screenshot

The community archive `cicada-solvers/neuroretransmit-cicada`, commit `b13600373d3400d75ec4208198019f3d92a304dd`, preserves `2012/007-onions/sq6wmgv2zcsrix6t.onion/screenshots/6mBiv.jpg`. It is mirrored locally as [`resources/external/2012-sq6wmgv2zcsrix6t-onion-get-email-screenshot.jpg`](../resources/external/2012-sq6wmgv2zcsrix6t-onion-get-email-screenshot.jpg): 123,011 bytes, Git blob SHA-1 `908ec5b74fd99ff9bf5a440e1685ca317dc88c26`, SHA-256 `07d3c4539437192017f5dd9f8faa31097b7b92beac0a91617f2cb49c40d8db3f`.

The browser capture is at `/cgi-bin/get_email`. Its signed page text asks the participant to create a new public email address, wait for a number, then append a slash and that number to the onion host root. The displayed `3894894230934209` is explicitly an example, not a recovered path token. The screenshot is not the original HTML/HTTP entity, not the participant-specific `/NUMBER` page, and not the later “Correct. We'll email you.” response.

The exact screenshot bytes were tested under SHA-512 and Whirlpool; neither matches the p56 target. The three preserved page/source objects were also rechecked in the same run. [Workflow 45800628837](https://github.com/FlareZ123/liber-primus/actions/runs/45800628837) · [raw hash results](lp2-p56-whirlpool-2012-onion-pages.json) · [source note](../resources/external/2012-sq6wmgv2zcsrix6t-onion-get-email-screenshot.source.md).

## Exact p56 digest decision for three participant-specific page copies (Director #2987)

The original pinned [2012/008-rsa-emails directory](https://github.com/neuroretransmit/cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd/2012/008-rsa-emails) was reopened. All three original archive blob IDs and lengths match the local mirrored .asc files; the valid-participant copy is archive-qualified as signed, the other two are redacted. These are distinct from the three earlier enrollment/post/congratulations objects in the existing SHA-512/Whirlpool report.

For each exact archived byte object, test SHA-512 over the full armor; the literal bytes between the first empty header line and the signature marker (preserving trailing line separator); and the OpenPGP cleartext extraction (only dash-unescape at line starts and omit the final line separator before the signature). No LF/CRLF conversion, whitespace stripping, inferred /NUM token, or HTTP wrapper is introduced. The target is the exact p56 digest in the [consolidated hash semantics report](lp2-p56-source-defined-hash-semantics-gate.md).

| Archive blob / form | Bytes | SHA-512 |
| --- | ---: | --- |
| Valid participant / full armor | 2500 | `636d263618569bb1e34b0c27a7e5c230aa2639e5aa890479a89d2331b01bbf5ad745dd9c9312ba03ea7911acb5bf7b9c8b82528d3e18e607f6234739d9fd67b5` |
| Valid participant / literal body | 1617 | `5d2bbe19121d204acec36f0fa9b00faed1aa1750626c8a2e6c65c3f32032779289a375b5d178fe438249f5fd971a04927fc020ce80d0e5b17c5b322d42157392` |
| Valid participant / extracted cleartext | 1612 | `ba52987a82649edbaa0935f54ba6dcf5650222f27a10a2cf6366efd492665af87474ac108cb6a2aa27fa193489dba9ea6dbc0596486c9e92cd6a5f9b3228c441` |
| Unknown / full armor | 2537 | `d2f227ba5f26703362a23b1fb4c4840d46725040a1a231c9ad0b8b2a010b4951afcb209f0a68fe8a46a38080ac1266d480d74fd5593ea4221c9302428f037e98` |
| Unknown / literal body | 1636 | `8b55084cf571bdca0bcb738cd4c0a470356315316f89bf7e43cac98ad051c70f50efe4a2bc808f48ec7504be649e965de5ee460f6d13abfbbc929f42f7d0a3ad` |
| Unknown / extracted cleartext | 1630 | `735be3d97fd69b8e92536e36edbb517614483cf325a954a2d9991a6c38d61ebda5a2697d069453a7cf56a62d5a53b1cc063a8992ae0cadbc0c088702552ea4d3` |
| Another unknown / full armor | 2476 | `c48d28701e8bef1ee797a868d6d5e7f68be6f863ea86192bccbab602d3c94fcdd4b49040b90aca222ac87aaa696e74a5a9b64655cd2f665d74e1145be3e491d7` |
| Another unknown / literal body | 1593 | `bd66e077eb880a7cb480a2a02b5aec17bddc3a390593bd53e3d5cfe416930cc2e67f237c892db0ecf4a6e0efb363aed2f95178cbcbe1e5cf5944aec3e20254e4` |
| Another unknown / extracted cleartext | 1588 | `1e340c8dfd6abf64d635df6ecab953cc8822492034159dd8b3b8d98c8ab94c40b4aefe546a7cd1223684406833ecc2319f1461b3c55a91c4c75f7cc5968aac5b` |

**0/9 matches.** The unknown source has 59 CRLF line endings and the other two have 60 LF each. The SHA-512 implementation ran in the connector V8 isolate against raw base64-decoded bytes with empty-string and abc standard known-answer controls and the independent 1788-byte enrollment HTML's previously recorded SHA-512 (71ae971c27c3852b…719e9fbb). A standard-library [Python reproduction](../sims/lp2_p56_sq6_participant_message_hash_sft.py) uses the local exact Git blobs and the same frozen boundaries; its standalone execution is not yet claimed. No independent period-authored Whirlpool selector was found, so no extra hash family was added.

The pinned directory README reports a 500 error screenshot and later successful text “Correct. We’ll email you.” at approximately 02:49 UTC on 17 January. Neither is a byte-preserving successful HTTP response. The directory contains the three .asc files and derived cryptographic/solver materials, not an initial /NUM email or exact successful response body. The separately archived disqualification email is not a one-time page. Therefore the specific recovered copies are retired as direct SHA-512 preimages; the missing actual onion response and distinct eq6 route remain open. No unknown plaintext, key or destination recovered.

## Exact missing artifact and stopping boundary

Recovered:

- three distinct participant-specific RSA challenge copies: the contemporaneous/provenance-qualified unknown and another_unknown archive records, plus the valid-participant mirror;
- reproducible RSA response numbers **33521494043430258676**, **29201928111913239376**, and **25121996842107342310**;
- the signed congratulations instructions (resources/external/2012-sq6wmgv2zcsrix6t-congratulations.asc) and the signed second-chance/MIDI message (resources/historical/cicada2012-song-is-your-own-path.asc).

Still missing:

- the initial email from the puzzle sender containing the participant's unique numeric /NUM path token, or a server/request log mapping that token to the one-time response; the screenshot's example number is not this token;
- a byte-preserving capture of the original onion HTTP response;
- independent local GPG re-verification of the valid-participant mirror. The archive README identifies it as the valid signature copy; the other two message copies do not verify.

The Wayback timestamp above is for the Pastebin mirror, **not** the original onion URL. The missing record is specifically the initial per-recipient email with the path number (or an equivalent server log); the RSA plaintext is not that number. No public source found in this bounded task supplies it. Do not brute-force or guess the token.

The nine exact archived participant page representations have no SHA-512 match to p56. This historical recovery does not establish an LP2 key, unknown plaintext, p56 preimage, or intended 2016 dependency.

## Reproduction

Run:

```bash
python3 sims/2012_rsa_oaep_reproducer.py
```

Expected output:

```text
valid_participant: 33521494043430258676
unknown: 29201928111913239376
another_unknown: 25121996842107342310
```

The script asserts all three factorizations and private-exponent relations, validates each compressed payload framing, decodes all four OAEP blocks per message, and checks the recovered plaintexts against the archived/secondary-source values. It does **not** verify PGP signatures or claim to recover the original emailed /NUM path token.
