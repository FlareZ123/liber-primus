# 2014 Stage11 clear-signed body: canonical/raw distinction found, no LP2 consumer

**Agent 9, 25 November 2026. Director Issue #2874. Classification: bounded negative at the typed-input boundary.**

## Selected source and LP2 selector

I selected the archived 2014 Stage11 clear-signed message, `resources/historical/cicada2014-stage11-message.asc`, rather than repeating packet extraction across the signature corpus. It is a compact, actual clear-signed text object. Its authored body contains the visible Tor v2 address `ky2khlqdf7qdznac.onion`, the line `3301`, and conspicuous leading/trailing spaces. The p7 red-product candidate's inner text `READURL` is an independent LP2 clue that could select a URL; the p56 solved page supplies a 128-hex `HASHES TO` target. This makes the Stage11 URL a reasonable single recipient candidate, not an established destination.

The clear-signature header is `Hash: SHA1`. Under the OpenPGP cleartext signature framework, line endings are canonicalized to CRLF and trailing whitespace is removed before the authored body is hashed; leading whitespace remains. Thus the raw displayed body and the signed canonical text are materially different inputs.

## Exact body distinction

The 12 authored body lines as preserved in the repository contain 300 bytes with LF endings, including their spaces. The PGP-canonical form, with trailing spaces/tabs stripped and line endings normalized to CRLF, is 139 bytes.

Per-line leading/trailing ASCII-space counts:

| Body line | Leading | Trailing | Content |
|---:|---:|---:|---|
| 1 | 0 | 2 | Hello.  Your enlightenment awaits you. |
| 2 | 3 | 3 | blank |
| 3 | 5 | 7 | ky2khlqdf7qdznac.onion |
| 4 | 11 | 11 | blank |
| 5 | 0 | 0 | We look forward to hearing from you. |
| 6 | 13 | 13 | blank |
| 7 | 17 | 17 | blank |
| 8 | 0 | 23 | Good luck. |
| 9 | 29 | 29 | blank |
| 10 | 0 | 0 | 3301 |
| 11 | 31 | 31 | blank |
| 12 | 37 | 37 | blank |

Several counts are primes, and the onion address is surrounded by five leading and seven trailing spaces. This is an observable feature, not a decoded key. Crucially, trailing spaces are not covered by the PGP cleartext signature's canonical text; only the leading spaces survive canonicalization. The raw trailing-space pattern therefore cannot be treated as authenticated signed plaintext without an independent source reason.

## Source-selected hash test

The exact p56 target is:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

SHA-512 of the literal body as preserved (300 bytes, LF) is:

`0d154466509a4577e03b1e0a446d7df3187b2a948d106ab4cce4dcb29035b9944772f60f4ec7f3243088a75c24601634fb10d8be1a95f4314c8fa69a93a90a25`

SHA-512 of the PGP-canonical body (139 bytes, CRLF) is:

`557023455ddf6f3194160b1f06b4b8f4f572004e9b243c512f0c39acdaa6fe6992dc39af2ce56d4b5bdef861f12331b6cb64d453a34c31d3c3e8147873fa3861`

Neither equals the p56 target. This rejects only the specific hypothesis that p56 is SHA-512 of this Stage11 signed message's literal or PGP-canonical authored body. It does not identify the hash algorithm, and it does not test the content of the now-unavailable onion page. The existing `lp2-p56-source-defined-hash-semantics-gate.md` already records that hashing known host strings and adjacent p57 objects does not identify the destination.

## Decision

The clear-signed presentation provides a real and substantial distinction between raw displayed bytes and canonical signed text. However, the LP2 clues do not select either representation as a key or as the p56 hash input:

- p7's `READURL` candidate can select the visible onion URL, but does not select the raw trailing spaces versus canonical signed text as a key.
- p56's digest does not equal SHA-512 of either exact body representation.
- The conspicuous whitespace counts are not a source-defined encoding, and most trailing-space counts are specifically outside the PGP-authenticated canonical text.
- No reversible LP2 receiver or independently selected operation consumes this distinction.

Close Issue #2874 at the typed-input boundary. Do not turn the prime-looking whitespace counts into another unconstrained whitespace/key sweep. The visible onion URL remains a historical destination candidate, but the surviving signed body supplies no reproducible LP2 key or p56 preimage. This is intermediate negative evidence; `results/README.md` remains unchanged.
