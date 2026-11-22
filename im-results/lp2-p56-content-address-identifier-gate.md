# P56 content-addressed deep-web identifier gate: Freenet and GNUnet

**Agent14, 19 November 2026. Classification: structural hypothesis gate. The p56 512-bit target is compatible with hash fields used by historical anonymous/P2P storage systems, but it does not by itself form a complete retrievable Freenet or GNUnet identifier. No first-party Cicada source in the repository selects either network.**

## Freenet CHK

Freenet's CHK URI grammar uses:

`CHK@RoutingKey,CryptoKey,Extra`

where the routing key is 32 bytes, the crypto/decryption key is 32 bytes, and the CHK extra field is 5 bytes.

The 64-byte p56 target can therefore be split mechanically into two 32-byte fields. Freenet modified-Base64 gives:

- first half: `NjZ3Y6tzeDx68oREbFlGa0zWUyOaMRy3EW1GGN7gmoQ`
- second half: `JYk9x1ALRk~a8Wcte-9eiRxuInRWiSakn7T0UTLCqLQ`

Both are syntactically valid 43-character fields. This is not discriminating: every arbitrary 64-byte string can be split this way. The required 5-byte CHK settings field is absent from p56, and the plaintext does not print a separator or identify Freenet.

Exact searches for either field and the combined `CHK@` prefix returned no public web or GitHub hit.

## GNUnet CHK

GNUnet uses a 512-bit `GNUNET_HashCode` and file-sharing CHK URIs of the form:

`gnunet://fs/chk/KEYHASH.QUERYHASH.SIZE`.

Thus the complete p56 target is exactly one syntactically sized GNUnet hash value, not a complete CHK. Its RFC2938/base32hex representation is:

`6OR7EOTBEDS3OUNIGH26OMA6DD6DCKP3J8OHPDOHDL31HNN0JA22B29TOT80MHIFRBOMEBBRTTF8I73E49Q5D296KIFR9T2H6B1AHD0`

A fetchable GNUnet CHK still requires a second independent 512-bit hash and a file size. Neither is supplied by p56. Exact web and GitHub searches for this base32hex value returned no hit.

## First-party selector check

Repository-wide searches for `Freenet`, `GNUnet`, `gnunet://` and `CHK@` return no Cicada source material selecting either system.

The solved p56 wording says a page "hashes to" the displayed value, singular. That wording is consistent with an ordinary digest and does not naturally supply the missing URI fields required by either content-addressed system.

## Decision

Do not treat the 512-bit length alone as evidence for Freenet or GNUnet. Both systems provide historically plausible deep-web/content-addressed interpretations, but p56 lacks enough fields to make either route executable and no first-party selector has been found.

Reopen this branch only if a period Cicada source supplies a network name, a missing Freenet CHK extra field, a GNUnet second hash/file size, or a historical index containing one of the exact deterministic encodings above.
