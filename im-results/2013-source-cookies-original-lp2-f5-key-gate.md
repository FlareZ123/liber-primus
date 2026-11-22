# 2013 final-onion 167/761 cookies as original LP2 F5 passphrases

## Finite source constraint and original result

A historical [2013 Cicada archive](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md) preserves two 32-byte (256-bit) cookie values reportedly assigned by the original recruitment-questionnaire onion service. The [contemporaneous account](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_2_%282013%29) identifies the application as a timed quiz; **the values might simply be session-state tokens**. The public source values and limitations are pinned in [the reference record](../resources/external/2013-final-onion-cookie-values.md).

This experiment freezes exactly **four ASCII passwords**: `167`, `761`, and their **verbatim 64-hex-character cookie values**, without fitted suffix, basename, KDF, page number, salt or alternate byte order. The potential carrier scope is exactly the **58 original LP2 JPEGs**, archive members **17.jpg–74.jpg** (physical p0–p57), including all unknown and solved pages, regardless of their display contents. Their original files come from [the source JPEG archive](../resources/liber-primus/README.md). F5 has no source-selected LP2 role; testing it is explicitly an exploratory historical-password check, not a claim that the original book uses F5.

Use a pinned reference-compatible [F5 v1.0.0 CLI](https://pkg.go.dev/github.com/0verkilll/f5@v1.0.0) and independently native embedded positive controls. The [CJS reproducible probe](../sims/2013_cookie_terminal_f5_probe_sft.cjs) checks that the extractor recovers exact external SHA256 bytes from one planted original-source grayscale cover (**62.jpg**, password `167`) and one planted RGB cover (**71.jpg**, password `761`), both produced via authentic coefficient-preserving F5 at fixed `k=4`. It then requires the extractor to return an internally valid payload from an unchanged original JPEG; garbage bytes with a coincidentally valid header would require further independent file/grammar validation.

The [manual original-input CI run 43421641168](https://github.com/FlareZ123/liber-primus/actions/runs/43421641168), completed **2026-11-13 12:03:51 UTC**, reports:

| Exact historical password | Original LP2 JPEGs tested | F5-valid extractor payloads |
| --- | ---: | ---: |
| Decimal name `167` | 58 | **0** |
| Decimal name `761` | 58 | **0** |
| 64-hex cookie `167` value | 58 | **0** |
| 64-hex cookie `761` value | 58 | **0** |
| **Total** | **232** | **0** |

Both planted F5 positive controls recover all 32 bytes exactly and print `TRUE_F5_POSITIVE_CONTROL`; no original candidate reaches `extractor_returned_bytes`, and the run ends with `candidates: []`. Original JPEGs were in fact tested, unlike the separate blind-JET 274-D detector calibration, which correctly withheld them when its gate failed. The CI run was deliberately manual-only and reproducible from immutable repository inputs.

## Decision

Retire **only** literal F5 extraction using these four exact historically transcribed ASCII passphrases on the current 58 original LP2 JPEGs. This supplies no negative evidence against different F5 passwords, another payload framing or steganographic algorithm, different carriers, KDF-derived uses of the cookie bytes or any conventional LP2 ciphertext decryption. It also does not establish these session cookies as puzzle keys. No hidden original payload, unknown plaintext, recovered cipher key, authenticated instruction or destination was found. Further attacks on 2013 cookie material should first find a historical author-selected use rather than trying arbitrary encodings and ciphers.
