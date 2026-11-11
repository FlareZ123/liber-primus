# Source-selected passphrases for OutGuess on three illustrated LP2 carriers

**Current result (Agent 42, 11 November 2026):** No recognizable hidden message or plaintext was recovered. The fixed gate comprises **11 literal 2016-source passphrases** plus two source-derived readings of a 13-character central-column path, tested on original p14/p32/p55 JPEGs: **39 attempts total**, **29 internally consistent nonempty OutGuess headers**, **0 recognizable payloads**, **8 SIGFPE**, and **2 status1 failures**. Header consistency is not proof of an authored payload. Three raw high-entropy outputs are preserved in the linked CI artifact for any later source-selected analysis.

## Human-visible route and fixed candidates

Cicada's independently signed 2016 JPEG `resources/historical/cicada2016-4gq25.jpg` contains an unkeyed OutGuess payload, `resources/historical/cicada2016-4gq25-outguess.asc`. Its text links Liber Primus words to maps/directions, mentions the path and Epiphany, and warns against false paths. A historically plausible solver could transfer a literal instruction string as the passphrase of the same 2013–2016 steganography tool to an image selected by the signed-image/tree relationships.

The three fixed original carriers are **31.jpg (physical LP2 p14, FOLD word and plant/tree illustration), 49.jpg (p32, blurred tree and 11×11 GP-prime source axes 563×569), and 72.jpg (p55, final unsolved page with tree artwork)**. The 11 literal 2016-source strings were `epiphany`, `the devoted`, `The path lies empty`, `Liber Primus is the way`, `Its words are the map`, `their numbers are the direction`, `Seek and you will be found`, `7A35090F`, `FOLD`, `563569`, and `1136`. These are fixed candidates, not an unconstrained password sweep.

A separate p55/p36 route through the 2013 `0_wisdom` 5×5 table yields the inward central-column sequence **CABAL → UOID → FORM**. The exact 13-GP-symbol transliteration is `CABALUOIDFORM`. The 2016 signed message says that word meanings are the road, motivating the one natural semantic reading `CABALVOIDFORM` as well. Both 13-character forms were tested once on each of the same three carriers; no further spelling variants were searched.

## Method and controls

- Original JPEG bytes were used with the pinned OutGuess build.
- The original 11-key scan is reproduced by [`lp2_signed2016_source_outguess_sft.cjs`](../sims/lp2_signed2016_source_outguess_sft.cjs).
- The two derived key readings and raw-output preservation are reproduced by [`lp2_cabal_derived_outguess_sft.cjs`](../sims/lp2_cabal_derived_outguess_sft.cjs), under [the bounded workflow](../.github/workflows/lp2-cabal-derived-outguess.yml).
- A result counts as recognizable only when the OutGuess header and extracted length agree and the output has an evident OpenPGP, ZIP, gzip, PNG or ≥96%-printable ASCII signature of at least 48 bytes. Header consistency alone is explicitly not sufficient.
- Two independent controls passed in the combined derived-key run: default-key extraction from the preserved 2016 image exactly matched all **1,136 bytes** of the independently authenticated signed text (SHA-256 `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`); an independent `epiphany` plant/recovery control returned all **54 bytes** exactly.

The original literal-key scan completed in [run 42971630828](https://github.com/FlareZ123/liber-primus/actions/runs/42971630828), with [artifact 13833214177](https://github.com/FlareZ123/liber-primus/actions/runs/42971630828/artifacts/13833214177): 33 attempts, 26 internally consistent headers, zero recognizable payloads, five SIGFPE and two status1 failures.

## Derived-key results on original carriers

The combined two-reading run is [42992046917](https://github.com/FlareZ123/liber-primus/actions/runs/42992046917); its [artifact 13841714006](https://github.com/FlareZ123/liber-primus/actions/runs/42992046917/artifacts/13841714006) preserves the raw header-consistent binaries and complete JSON output.

| Key reading | Carrier | OutGuess header | Extracted bytes | Outcome |
|---|---:|---:|---:|---|
| `CABALUOIDFORM` | p14 / 31.jpg | seed 64701, len 34707 | 34707 | Header-consistent binary; no recognized signature |
| `CABALUOIDFORM` | p32 / 49.jpg | seed 64701, len 34707 | 0 | SIGFPE; no output file |
| `CABALUOIDFORM` | p55 / 72.jpg | seed 64701, len 34707 | 34707 | Header-consistent binary; no recognized signature |
| `CABALVOIDFORM` | p14 / 31.jpg | seed 53331, len 41232 | 0 | SIGFPE; no output file |
| `CABALVOIDFORM` | p32 / 49.jpg | seed 53331, len 41232 | 0 | SIGFPE; no output file |
| `CABALVOIDFORM` | p55 / 72.jpg | seed 53331, len 41232 | 41232 | Header-consistent binary; no recognized signature |

The three raw files have these properties:

| Raw extraction | SHA-256 | Shannon entropy (bits/byte) | gzip size / input | Printable fraction |
|---|---|---:|---:|---:|
| UOID p14, 34,707 bytes | `083439cacfe2d70b5be93bc19324231dad47afe1c4eb35ec6b7afa52ebb43847` | 7.994890 | 1.000951 | 0.386925 |
| UOID p55, 34,707 bytes | `c6c8dc4c8089181c347174c7e450f1354a077fe808abb7182481029cebc7ca06` | 7.994779 | 1.000951 | 0.385110 |
| VOID p55, 41,232 bytes | `90581241a62ec82380f3ea56ac9f1e573734aba125afbc4558d188f1920e7136` | 7.995703 | 1.000800 | 0.382106 |

The UOID p14 and p55 outputs share an exact **1,243-byte prefix**. This is not independent evidence of a shared hidden message: the original p14 and p55 grayscale JPEGs are **81.0316% pixel-identical** and **75.6504% same-position 8×8 blocks identical**, consistent with a common page template/background. Their full extraction hashes differ. The VOID p55 output is likewise high-entropy and incompressible, with no tested file signature. Its 41,232-byte length is 16-byte aligned, but no source selects AES; that arithmetic alone does not justify a decryption search.

The six derived-key attempts add three header-consistent raw files and three SIGFPEs. Combined with the original 33 literal-key attempts, the fixed total is **39 attempts**, **29 header-consistent**, **0 recognizable**, **8 SIGFPE**, and **2 status1**. The three raw binaries are retained in the 30-day workflow artifact; `im-results/outguess-cabal-derived/summary.json` preserves their hashes and measurements in the repository.

## Decision

This gate recovers **no plaintext, no authenticated LP2 key, and no intended destination**. The 13-symbol CABAL/UOID/FORM path remains a source-derived navigation hypothesis, not a demonstrated OutGuess password or cipher key. Preserve the raw binary outputs, but do not treat them as messages or launch unconstrained second-layer/KDF searches. Reopen only if an independent source clue selects a specific format, transformation, or additional carrier. This finite OutGuess result neither affects the separate OpenPuff execution gate nor decrypts LP2 cipher runes.
