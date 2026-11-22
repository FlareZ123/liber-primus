# LP2 2014 original delivery: dated external wrapper and removed-file gate

**Decision (18 November 2026):** No previously absent, first-party, runnable LP2 decryption instruction was recovered in the bounded dated primary Git archive lane. The earliest preserved Git snapshot establishes a `58 JPEG + index.html + message.txt.asc` delivery set. Later extra files in the same repository were solver-derived artifacts, so their mere presence under the onion directory does **not** establish first-party distribution. Unknown private delivery messages or unpreserved HTTP responses remain outside this test. No unknown plaintext or original cipher key was recovered.

## Historical source, not a new artifact image audit

A contemporary participant's public [`micheloosterhof/cicada-2014` repository](https://github.com/micheloosterhof/cicada-2014) contains a `stage11` directory with **Git commit history dated May 11–25, 2014**. We interrogated its historical Git trees via GitHub's tree API, not merely the current copy:

| Timestamp / historical snapshot | Git tree query | Delivery wrapper / extra files |
| --- | --- | --- |
| **2014-05-11 18:33:43 UTC**, commit `6c3421a4d245596e403c88e037509d162a2afd17` (`new data`) | [Earliest stage11 tree](https://api.github.com/repos/micheloosterhof/cicada-2014/git/trees/6c3421a4d245596e403c88e037509d162a2afd17?recursive=1) | Exactly `stage11/message.txt.asc` plus `stage11/ky2khlqdf7qdznac.onion/index.html` and `0.jpg`–`57.jpg`. **60 files** (the additional Git tree entry is the onion directory). No onion-subdirectory README, key, instruction, linked script, or extra attachment. |
| **2014-05-11 22:09:23 UTC**, commit `1e3e842b460848d8e9342ae47efe453e20443aee` (`move files around`) | [Later tree](https://api.github.com/repos/micheloosterhof/cicada-2014/git/trees/1e3e842b460848d8e9342ae47efe453e20443aee?recursive=1) | Additional `README.md`, `decimal.txt`, `sexagesimal.bin`, and `decimaltobyte.pm` appear inside the onion subdirectory, plus `stage11/49–51` conversion working files. The then-current README literally says “59.txt contains text from page 59” and gives a local `xxd` command, clearly solver working notes rather than an authenticated onion instruction. |
| **2014-05-25 19:17:10 UTC**, commit `bbba77c8f9fca1fe3a853354bd154a8de0fa4220` (`simplified`) | [Later tree](https://api.github.com/repos/micheloosterhof/cicada-2014/git/trees/bbba77c8f9fca1fe3a853354bd154a8de0fa4220?recursive=1) | Page-56 decoder scripts/outputs, sexagesimal conversions, and other derived text remain in working directories. The earlier onion-directory README was removed. These files cannot safely be attributed to Cicada. |
| Undated modern copy `krisyotam/cicada3301` | [Original-onion7 folder](https://github.com/krisyotam/cicada3301/tree/main/liber-primus/original-onion7) | Contains **60 files**: the same 58 numeric JPEG filenames, one index, and one signed `message.txt.asc`. Its top-level README's informal “61 raw files” count is incompatible with the actual folder inventory; do not infer a missing 61st historical payload. |

The earliest signed delivery message is [archived separately](https://github.com/micheloosterhof/cicada-2014/blob/master/stage11/message.txt.asc), and its readable signed text is:

> Hello. Your enlightenment awaits you.  
> ky2khlqdf7qdznac.onion  
> We look forward to hearing from you. Good luck. 3301.

The independently saved [`index.html`](https://github.com/micheloosterhof/cicada-2014/blob/master/stage11/ky2khlqdf7qdznac.onion/index.html) contains `<title>133</title>`, `<div id="331">`, and **only** sequential image references `0.jpg`–`57.jpg`. Those already-indexed 133/331 and ordering clues were not reinterpreted as a new key. A parallel [modern copy of the first-party signed message](https://github.com/krisyotam/cicada3301/blob/main/pgp/messages/2014-05-liber-primus-release.asc) has the same readable wording. Existing local material `resources/historical/stage11-2014-index.html` and `resources/historical/cicada2014-stage11-message.asc` already preserves those two objects.

## Evidential boundary and next decision

The **dated Git revision history** independently prevents confusion between original delivery assets and later solver-created files, and reveals no source-authored decoder input missing from the local archive. The inspected modern copies likewise reveal no additional original launch instruction. This is a **bounded negative** for available public file-tree snapshots and retained signed text; Git history does not prove completeness of the 2014 live onion server, original HTTP headers, private recruitment notices, or lost contemporaneous chats.

Do **not** restart a 58-JPEG hash/metadata audit, use `59.txt` as a lost 59th LP2 page, reinterpret a README or `decimal.txt` as Cicada-authored, or treat the folder count typo as a key hint. Resume this avenue only if a **distinct, dated, original capture** yields a genuinely new signed sentence, bytes, URL, attachment, or documented first-party file-order operand. Such a find must freeze a reversible transform before testing the original ciphertext and then demonstrate authentic plaintext or a typed object with independent holdout and full reproduction.

**Outcome for Director issue #1442:** Historical wrapper search exhausted for these specific contemporaneous/modern public Git lanes; no actionable new first-party instruction, no key, no plaintext.
