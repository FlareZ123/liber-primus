# 2012 participant-specific RSA page: provenance and reproducible decryption

## Finding

One additional participant-specific one-time RSA message has been recovered as a **provenance-qualified mirror**, and its encrypted response number is independently reproducible. The original onion `/NUM` path token and original server-response bytes have **not** been recovered. The mirrored copy's PGP signature is not verified, so this report does not claim cryptographic authentication of that copy.

The primary message's RSA plaintext is **`29201928111913239376`**. A second, independently keyed archived message decrypts to **`25121996842107342310`**, matching the subsequent onion URL reported in a 2021 participant-style account and the transition to the MIDI stage.

## Provenance of the primary message

The public archive is pinned at [neuroretransmit/cicada commit `b13600373d3400d75ec4208198019f3d92a304dd`](https://github.com/neuroretransmit/cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd/2012/008-rsa-emails).

- The archive's `sources.txt` records the [Wayback capture of Pastebin `HakCdFW1`](https://web.archive.org/web/20120116170758/https://pastebin.com/HakCdFW1), captured at **2012-01-16T17:07:58Z**.
- The contemporaneous [AllMystery Cicada thread](https://www.allmystery.de/themen/it83189) contains posts dated **15 January 2012** discussing the unique email, a participant's **112-digit** RSA key, and the Pastebin copy. The participant says an earlier post was removed to redact the key. The modulus in the archived `unknown.asc` is also 112 decimal digits. This provides a contemporaneous participant/source chain for the message, although it is not a raw onion-server capture.
- The archive file `2012/008-rsa-emails/unknown.asc` has Git blob SHA-1 **`0e69b063b379a8ccdd8a96815de318bcf65a1247`**. It contains the one-time warning, RSA public modulus, compressed ciphertext and a signature packet naming Cicada key ID `7A35090F`.
- Its extracted ciphertext file `unknown.pem` has Git blob SHA-1 **`087ed31790eb8931d0255efd34e137ad13163b35`**. The source manifest itself has Git blob SHA-1 `6214cb83329eed3166930536504d581ce862bd63`.

**Authentication limitation:** the archive README identifies `quaetrix0@gmail.com.asc` as the only one of its three page copies with a valid PGP signature; the `unknown` and `another_unknown` copies have redactions and their signatures do not verify. The `unknown.asc` signature packet names key ID `7A35090F`, but this is not equivalent to a successful signature verification. The forum and dated Pastebin mirror support provenance; they do not make the copy byte-identical to the original onion response.

## Reproducible RSA interpretation

The archived `unknown.pem` is a zlib-compressed serialization with header `10\0 188\0 Cyphertext` and a **188-byte** ciphertext field. With the archived `unknown.private` and `unknown.factors` values:

- (n=pq), with (e=65537);
- the ciphertext is four RSA blocks of 47 bytes;
- each decrypted OAEP block yields five bytes;
- concatenating the four chunks gives **`29201928111913239376`**.

This matches the archive README's recorded plaintext. The message says to return to the same URL and enter the decrypted number. Thus `29201928111913239376` is the **RSA response**, not the emailed `/NUM` path token.

### Why standard OAEP fails

The message specifies `Crypt::RSA::ES::OAEP`, version **1.99**. The archived Perl implementation has two relevant behaviors:

1. `ES/OAEP.pm` encodes to `k-1` octets, with no leading standard-OAEP `Y` octet.
2. `DataFormat.pm` implements MGF1 with a loop variable `i` incremented by the SHA-1 digest length (**20**) rather than by one. For a 26-byte mask, the module uses counters **0 and 20**, not standard MGF1 counters **0 and 1**.

The source is pinned at [gitpan/Crypt-RSA commit `257f59d25d2d4adec3ef7e439e89b07a3a21a4ec`](https://github.com/gitpan/Crypt-RSA/tree/257f59d25d2d4adec3ef7e439e89b07a3a21a4ec): [`OAEP.pm`](https://github.com/gitpan/Crypt-RSA/blob/257f59d25d2d4adec3ef7e439e89b07a3a21a4ec/lib/Crypt/RSA/ES/OAEP.pm), Git blob `98b980c0575cc876143ba9f395fde361b6fe7eab`; [`DataFormat.pm`](https://github.com/gitpan/Crypt-RSA/blob/257f59d25d2d4adec3ef7e439e89b07a3a21a4ec/lib/Crypt/RSA/DataFormat.pm), Git blob `07edffd5340a50717f9c5ebf859c267a09d1a6cd`.

The reproducer implements this exact module-specific behavior using only the Python standard library. Replacing its MGF1 with standards-compliant counter progression does not recover the valid OAEP delimiter in these blocks.

## Independent second-message cross-check

The archive's separate `another_unknown.pem` ciphertext (Git blob SHA-1 **`49e290f2e80502c525f931b35c01232b7ee9bcf4`**) uses a different modulus, factors and private exponent. The same independent decoder recovers **`25121996842107342310`**.

The 11 June 2021 [participant-style account](https://saumitrasapre.medium.com/the-mysterious-puzzle-2-c73d805e1f04) prints the matching RSA message and says that appending `25121996842107342310` to `sq6wmgv2zcsrix6t.onion` returned “Correct. We'll email you”; the following email contained the MIDI clue. This is a useful independent consistency check on the second decryption and the historical sequence, but it is a retrospective secondary source, not a contemporaneous archive capture or signature verification.

## Exact missing artifact and stopping boundary

Recovered:

- one participant-specific RSA message copy with a contemporaneous forum/Pastebin provenance chain and a Wayback capture timestamp;
- the archived ciphertext and private-key/factor material;
- the reproducible response **`29201928111913239376`**;
- a second independent RSA plaintext **`25121996842107342310`** that matches the reported subsequent URL and MIDI transition.

Still missing:

- the initial email from the puzzle sender containing the participant's unique numeric `/NUM` path token, or a server/request log mapping that token to the one-time response;
- a byte-preserving capture of the original onion HTTP response;
- a valid PGP verification of the `unknown.asc` copy.

The Wayback timestamp above is for the Pastebin mirror, **not** the original onion URL. The missing record is specifically the initial per-recipient email with the path number (or an equivalent server log); the RSA plaintext is not that number. No public source found in this bounded task supplies it. Do not brute-force or guess the token.

This historical recovery does not establish an LP2 key, unknown plaintext, p56 preimage, or intended 2016 dependency.

## Reproduction

Run:

```bash
python3 sims/2012_rsa_oaep_reproducer.py
```

Expected output:

```text
unknown: 29201928111913239376
another_unknown: 25121996842107342310
```

The script asserts both factorizations and private-exponent relations, validates the compressed payload framing, decodes all four OAEP blocks per message, and checks both recovered plaintexts against the archive/secondary-source values. It does **not** verify PGP signatures or claim to recover either original `/NUM` token.
