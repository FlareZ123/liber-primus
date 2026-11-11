# Exact public occurrences of the LP2 p56 digest

**Snapshot:** 11 November 2026 · **Issue:** [#126](https://github.com/FlareZ123/liber-primus/issues/126). Exact target occurrences and associated dated claims only; no hash algorithm or preimage is inferred.

## Frozen target from the original scan

Physical p56 is image 73.jpg in the original 75-image ZIP. The user-supplied ZIP SHA-256 is 094f3f8bc508159bda033482706a2d9bf516c8b8a324d87d41c5ee3696c075ea, matching the repository's pinned original-image archive. Image 73.jpg is 389,813 bytes with SHA-256 a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc.

The five printed lines, in reading order, have lengths 26, 25, 25, 27, 25 and concatenate to exactly 128 hexadecimal characters / 64 bytes:

36367763ab73783c7af284446c
59466b4cd653239a311cb7116
d4618dee09a8425893dc7500b
464fdaf1672d7bef5e891c6e227
4568926a49fb4f45132c2a8b4

Continuous target:
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4

Exact 64-byte base64 representation:
NjZ3Y6tzeDx68oREbFlGa0zWUyOaMRy3EW1GGN7gmoQliT3HUAtGT9rxZy17716JHG4idFaJJqSftPRRMsKotA==

SHA-256 of those 64 target bytes (a checksum of the digest bytes, not a candidate preimage):
0911bf3c8cc3a73bbb346f82ba65daff3eb81914c4826060ac168bd0f55e267e

This matches the target already transcribed in im-results/archive-hash-preimage.md and the 2014 solver archive's 56.txt / 56.bin. The 56.bin object is the 64 target bytes themselves, not the missing target-page content.

## Exact occurrences and their evidential status

### Dated public discussion

- **Tor Stack Exchange, question 4377 (2014-08-18; later answers through 2019):** [Cicada 3301 2014 page 56](https://tor.stackexchange.com/questions/4377/cicada-3301-2014-page-56) reproduces the exact 128-hex target. This is an exact public occurrence, not an original target-page payload.
- **Answer by user13596 (2016-07-12):** claims that a “Whirlpool” lookup produced a Pastebin-related downloadable file named **uRkNsGsa.htm**. The answer does not supply the file bytes, a stable raw URL, the hash calculation, the input framing, or an independently reproducible match. Exact web searches for the identifier return the Stack Exchange answer and a later repost, not the file. GitHub code search for the identifier returns zero results. No indexed Pastebin/Wayback raw capture was located. Treat this as an unverified historical claim, not a preimage.
- **Later answer by Wentworth Walker (2019):** associates the same discussion with dxwd42hgpd7qrccm.onion and 1711141131131.xyz, but supplies no reproducible hash calculation or target-page bytes. The archived CDX evidence in Dukotah's corpus records only robots.txt for the dxwd .onion.to mirror, not the root page. The 171114 site has archived 2017-era material, but the corresponding archive manifest marks Cicada attribution as unverified and the material is not authenticated by a 3301 signature. These are related destination claims, not exact digest preimages.

### Follow-up test of the Whirlpool claim

The 2016 “Whirlpool” report motivated a source-locked check of all 58 original Onion7 JPEG page bytes under Whirlpool. Result: 0/58 exact matches to the p56 target. The reproducer is the opt-in --whirlpool mode in [the existing original-JPEG gate](../sims/anend_original_jpeg_gate.py), which verifies the OpenSSL 3 legacy-provider implementation with the published abc vector and reuses the script's per-page original Git-blob assertions. This does not test the claimed uRkNsGsa.htm file itself, which remains unrecovered; it only excludes the raw published JPEGs as Whirlpool preimages.
### Repository and code-history occurrences

GitHub exact-code search for the 128-hex string reaches its 100-result cap. The inspected hits fall into three classes: page transcriptions, target constants/fixtures, and generic search tools. Representative exact occurrences:

| Source snapshot | Exact occurrence | What it establishes |
|---|---|---|
| [cicada-solvers/Cicada-DWH-HashcatAttempts, commit cf79ffd (2025-10-29)](https://github.com/cicada-solvers/Cicada-DWH-HashcatAttempts/commit/cf79ffd8a3b9ba27d5b8005472f20cccb8fa9104) | Files deepwebhash and deepwebhash-blake2 | The target is supplied as a hashcat input. No recovered page bytes or successful candidate are included. |
| [tweqx/3301-hash-alarm, commit 50aa895 (2021-08-25)](https://github.com/tweqx/3301-hash-alarm/commit/50aa8953d2d3db6f16b773425205f856d43412a9) | Target constant in src/hashbox.js | A hash-testing UI/tool, not a result. Its Whirlpool wrapper calls CubeHash, so that code path is not valid Whirlpool evidence. |
| [martinlindhe/gohash, commit 4aaf49e (2024-03-19)](https://github.com/martinlindhe/gohash/commit/4aaf49ec8f3c9e797e71c1a631d41e23e1854a17) | Target in generic search documentation | SHA-512/onion-address search tooling; no matching preimage output. |
| [trizen/experimental-projects, commit cd76a2a (2026-07-01)](https://github.com/trizen/experimental-projects/commit/cd76a2aecf0a4fea5ff78305e42bc5ae9a08ff6e) | Target in a brute-force script | Candidate IPv4-string search; no recovered target-page content. |
| [Dukotah/cicada3301, Round 43 commit f63501d (2026-11-06)](https://github.com/Dukotah/cicada3301/commit/f63501d8f2d835b80c30230eb89a1110fb9197d2) | Target literal in research corpus | A copied target used for analysis, not a preimage. |
| [micheloosterhof/cicada-2014, archive commit 6c3421a (2014-05-11)](https://github.com/micheloosterhof/cicada-2014/commit/6c3421a4d245596e403c88e037509d162a2afd17) | 56.txt and 56.bin | Exact text and binary encodings of the printed digest; the binary is the target itself. |

Other exact-text copies occur in transcription and data repositories including iBotPeaches/cicada_3301, relikd/LiberPrayground, ToldByNun/Parcae, and the later Cicada archive mirrors. These copies preserve the printed target; none of the inspected objects contains the missing target-page body.

### Exact encodings and archive searches

- The exact base64 encoding above returns **zero** GitHub code-search and web-search hits.
- GitHub commit-message searches for the full hex target, uRkNsGsa, and dxwd42hgpd7qrccm return **zero** commits. Code-search hits are current-file literals and mirrors; they do not reveal a deleted preimage.
- Targeted exact searches of Google Groups, Mail-Archive, Archive.org, and Pastebin return no indexed exact target or base64 occurrence beyond the dated Tor Stack Exchange discussion and its reposts.
- The available Wayback-derived records in Dukotah's corpus preserve the dxwd .onion.to robots.txt and the 171114 site archive, not the raw content of a page demonstrated to match the p56 target. No raw Pastebin object for uRkNsGsa.htm was recovered.

Search-engine and public-code indexes are not exhaustive; a zero result is not proof that a private, deleted, or unindexed object never existed.

## Conclusion

**No exact occurrence located here includes the original target-page content bytes.** The only purported recovery is the 2016 Whirlpool/Pastebin statement, for which the named file and reproducible hash input are missing. The 2019 onion/domain claim is not authenticated and has no archived root-page bytes. The exact hash algorithm, canonical preimage bytes, page framing, and destination therefore remain unknown.

Do not turn the words “Whirlpool,” the Pastebin filename, or the later onion/domain into assumptions. Reopen this branch only if the raw uRkNsGsa object, an authenticated target-page capture, or another source-fixed byte object is recovered.