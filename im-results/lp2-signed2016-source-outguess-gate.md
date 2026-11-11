# Authenticated 2016 source phrases as keyed OutGuess selectors for three illustrated LP2 carriers

**Original-source bounded negative (Agent 42, 11 November 2026).** No recognizable hidden message was recovered from the tested three original LP2 images under eleven source-selected passphrases. This does not rule out hidden content with other passwords, other algorithms, or untested manuscript pages. The known status remains **no recovered unknown LP2 plaintext, authentic cipher key, complete mechanism or destination**.

## Human-visible reason for the exact candidates

Cicada's independently signed 2016 JPEG `resources/historical/cicada2016-4gq25.jpg` contains an unkeyed OutGuess payload, `resources/historical/cicada2016-4gq25-outguess.asc`. Its text explicitly calls Liber Primus “the way,” links words to maps/directions, mentions the path, Epiphany, devotion, and cautions against false paths. A historically plausible solver might transfer a literal instruction string as the passphrase of the same 2013–2016 steganography tool to a book image chosen by the signed-image/tree relationships.

The source-selected carriers are original manuscript JPEGs **31.jpg (physical LP2 p14, visible FOLD word and tree), 49.jpg (p32, blurred tree, 11×11 GP-prime source axes 563×569), and 72.jpg (p55, final unsolved tree with shared moth artwork)**. The source-selected password strings are literal 2016 words/clauses **`epiphany`**, **`the devoted`**, **`The path lies empty`**, **`Liber Primus is the way`**, **`Its words are the map`**, **`their numbers are the direction`**, **`Seek and you will be found`**, **`7A35090F`**, plus the image/text selectors **`FOLD`**, **`563569`**, **`1136`**. These choices are retrospective, but fixed before running on the unknown original carriers. They deliberately avoid repeating the earlier 22 generic keys tested throughout the archive.

## Original-input experiment and controls

[Single-file CommonJS SFT](../sims/lp2_signed2016_source_outguess_sft.cjs) runs pinned maintained OutGuess, original JPEG bytes and all 33 combinations with no password tuning. Recognized output requires an internally consistent OutGuess length header and an evident OpenPGP, ZIP, gzip, PNG or ≥96% printable ASCII payload of at least 48 bytes. Header consistency alone is **not** proof of an authored message. Each candidate has its original page/password identity, byte size, extraction seed, SHA-256, and printable opening persisted for independent verification if found.

Two independent controls passed in the same executed job: (1) default-key extraction from the preserved 2016 image exactly matched all **1,136 bytes** of the independently authenticated signed text; (2) embedding a fresh ASCII sentence with key `epiphany` in the original p14 JPEG and extracting it with that key returned the planted bytes exactly. Neither control exposes a key for unknown LP2 images.

**Executed manual-only CI:** [successful run 42971630828](https://github.com/FlareZ123/liber-primus/actions/runs/42971630828); original-result [artifact 13833214177](https://github.com/FlareZ123/liber-primus/actions/runs/42971630828/artifacts/13833214177).

- **33/33 attempts** completed as attempts. Of these, **26** yielded internally consistent nonempty extraction header/length pairs but **0/26** had recognizable payload structure or high ASCII printability.
- **5** OutGuess process invocations terminated via SIGFPE (a native extractor failure) and **2** exited with status1; they were explicitly recorded as unsuccessful retrievals, not rescued as messages.
- **0** candidate files satisfied the stated plaintext/file-header criteria.
- The complete fixed scan and both authentic/plant controls passed. Initial run 42971323753 was interrupted at the first SIGFPE; the script was corrected only to treat native extraction failures as unsuccessful attempts, preserving the original keys, carriers and acceptance rule.

## Decision

Do not generalize the 26 consistent headers into valid steganograms. Retire **these exact 33 combinations** as unproductive under pinned OutGuess. Further historical stego work should seek a distinct player-visible password instruction or evidence pointing to a specific image/format rather than combinatorial key sweeps. This finite negative neither affects the still-open OpenPuff execution gate (a **different** program) nor supplies a decryption of LP2 cipher runes.
