# Source-selected passphrases for OutGuess on three illustrated LP2 carriers

**Original-source bounded negative (Agent 42, 11 November 2026).** No recognizable hidden message was recovered from the tested three original LP2 images under eleven literal 2016-source passphrases plus one later source-derived 13-GP-symbol key, for **36 fixed attempts** in total. This does not rule out hidden content with other passwords, other algorithms, or untested manuscript pages. The known status remains **no recovered unknown LP2 plaintext, authentic cipher key, complete mechanism or destination**.

## Human-visible reason for the exact candidates

Cicada's independently signed 2016 JPEG `resources/historical/cicada2016-4gq25.jpg` contains an unkeyed OutGuess payload, `resources/historical/cicada2016-4gq25-outguess.asc`. Its text explicitly calls Liber Primus “the way,” links words to maps/directions, mentions the path, Epiphany, devotion, and cautions against false paths. A historically plausible solver might transfer a literal instruction string as the passphrase of the same 2013–2016 steganography tool to a book image chosen by the signed-image/tree relationships.

The source-selected carriers are original manuscript JPEGs **31.jpg (physical LP2 p14, visible FOLD word and tree), 49.jpg (p32, blurred tree, 11×11 GP-prime source axes 563×569), and 72.jpg (p55, final unsolved tree with shared moth artwork)**. The source-selected password strings are literal 2016 words/clauses **`epiphany`**, **`the devoted`**, **`The path lies empty`**, **`Liber Primus is the way`**, **`Its words are the map`**, **`their numbers are the direction`**, **`Seek and you will be found`**, **`7A35090F`**, plus the image/text selectors **`FOLD`**, **`563569`**, **`1136`**. These choices are retrospective, but fixed before running on the unknown original carriers. They deliberately avoid repeating the earlier 22 generic keys tested throughout the archive.

A separate source-derived candidate comes from the p55/p36 route through the 2013 `0_wisdom` 5×5 table: its inward central-column sequence is **CABAL → UOID → FORM**, exactly **13 GP symbols** as `CABALUOIDFORM`. The 2016 signed image independently establishes OutGuess as a historically used tool. A human solver could therefore try this single derived string as a passphrase on the same three visually selected carriers. It is not a literal 2016 phrase and is tested separately from the 11 literal strings.

## Original-input experiment and controls

[Single-file CommonJS SFT](../sims/lp2_signed2016_source_outguess_sft.cjs) runs pinned maintained OutGuess, original JPEG bytes and all 33 combinations with no password tuning. Recognized output requires an internally consistent OutGuess length header and an evident OpenPGP, ZIP, gzip, PNG or ≥96% printable ASCII payload of at least 48 bytes. Header consistency alone is **not** proof of an authored message. Each candidate has its original page/password identity, byte size, extraction seed, SHA-256, and printable opening persisted for independent verification if found.

Two independent controls passed in the same executed job: (1) default-key extraction from the preserved 2016 image exactly matched all **1,136 bytes** of the independently authenticated signed text; (2) embedding a fresh ASCII sentence with key `epiphany` in the original p14 JPEG and extracting it with that key returned the planted bytes exactly. Neither control exposes a key for unknown LP2 images.

**Executed manual-only CI:** [successful run 42971630828](https://github.com/FlareZ123/liber-primus/actions/runs/42971630828); original-result [artifact 13833214177](https://github.com/FlareZ123/liber-primus/actions/runs/42971630828/artifacts/13833214177).

- **33/33 attempts** completed as attempts. Of these, **26** yielded internally consistent nonempty extraction header/length pairs but **0/26** had recognizable payload structure or high ASCII printability.
- **5** OutGuess process invocations terminated via SIGFPE (a native extractor failure) and **2** exited with status1; they were explicitly recorded as unsuccessful retrievals, not rescued as messages.
- **0** candidate files satisfied the stated plaintext/file-header criteria.
- The complete fixed scan and both authentic/plant controls passed. Initial run 42971323753 was interrupted at the first SIGFPE; the script was corrected only to treat native extraction failures as unsuccessful attempts, preserving the original keys, carriers and acceptance rule.

## Later source-derived passphrase extension

The fixed key `CABALUOIDFORM` was tested once on each of the same three original carriers with pinned OutGuess. The authentic 2016 1,136-byte extraction and the independent `epiphany` plant/recovery control both passed in the same job.

- **p14 / 31.jpg:** OutGuess printed seed **64701**, length **34707**; the extracted file was exactly 34,707 bytes but had no PGP, ZIP, gzip, PNG or ≥96%-printable signature. SHA-256: `083439cacfe2d70b5be93bc19324231dad47afe1c4eb35ec6b7afa52ebb43847`.
- **p32 / 49.jpg:** native OutGuess terminated with **SIGFPE**. It printed the same seed/length header before termination, but produced no file; this is not a header-consistent extraction.
- **p55 / 72.jpg:** seed **64701**, length **34707**, exactly 34,707 bytes, with no recognized payload signature. SHA-256: `c6c8dc4c8089181c347174c7e450f1354a077fe808abb7182481029cebc7ca06`.

The p14 and p55 outputs share the same first 80 bytes but have different full-file hashes; both are nonlinguistic binary outputs. This adds **2** internally consistent headers and **1** SIGFPE, with **0** recognizable payloads. [Executed fixed-key run 42991118188](https://github.com/FlareZ123/liber-primus/actions/runs/42991118188) · [reproducer](../sims/lp2_cabal_derived_outguess_sft.cjs) · [workflow](../.github/workflows/lp2-cabal-derived-outguess.yml).

**Combined decision:** across all **36** fixed attempts (11 literal 2016-source strings plus this one derived key), **28** yielded internally consistent nonempty headers, **0/28** yielded recognizable payloads, **6** terminated via SIGFPE, and **2** exited with status1. Retire the exact `CABALUOIDFORM` OutGuess passphrase on p14/p32/p55; do not generalize the 34,707-byte headers into authored steganograms. This does not test other transformations or other carriers.

## Decision

Do not generalize the 26 consistent headers into valid steganograms. Retire **these exact 33 combinations** as unproductive under pinned OutGuess. Further historical stego work should seek a distinct player-visible password instruction or evidence pointing to a specific image/format rather than combinatorial key sweeps. This finite negative neither affects the still-open OpenPuff execution gate (a **different** program) nor supplies a decryption of LP2 cipher runes.
