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
- **Answer by user13596 (2016-07-12), newly resolved live identifier (2026-11-16):** the answer claims that a “Whirlpool” lookup yielded a Pastebin-related downloaded file named **uRkNsGsa.htm**, without printing the file, its digest calculation, or its creation time. The bare eight-character ID now demonstrably resolves to [https://pastebin.com/uRkNsGsa](https://pastebin.com/uRkNsGsa), titled **“Liber Primus p.57 hash”**; its [direct raw content](https://pastebin.com/raw/uRkNsGsa) is exactly **136 bytes** (SHA-256 `017231b4cceabfbc8e20d3d60e9fa07b2e5bd3cd12becf0f27ca94e1fa41321c`) containing the *same five lines of printed challenge digest*, not another page's plaintext. A read-only authenticated GitHub Actions runner fetched the HTML and raw bytes on 2026-11-16; both fail exact **SHA-512, SHA3-512, BLAKE2b-512, and Whirlpool** comparisons to p56 (0/8). The original downloaded 2016 `.htm` object and a 2016-dated response body remain unavailable, so historical edits cannot be excluded. The claim does not supply a verified preimage. [Source-frozen reproducer](../sims/lp2_p56_2016_urkngsa_archive_probe.cjs) · [successful run](https://github.com/FlareZ123/liber-primus/actions/runs/43780780079).
- **Later answer by Wentworth Walker (2019):** associates the discussion with `dxwd42hgpd7qrccm.onion` and `1711141131131.xyz`, but supplies no reproducible hash calculation or target-page bytes. The 2017 ArchiveBot batch manifest labels the recovered domain assets not PGP-signed and attribution to 3301 unverified; a third-party `Sevens_Exposed` README treats the domain as a work-in-progress puzzle, and a separate MP4 metadata dump reports a 2019 Premiere export associated with the handle `spoofnix`. These records support treating the domain/video as an unauthenticated third-party branch, not a verified Cicada destination. See [the consolidated hash assessment](archive-hash-preimage.md). These are related destination claims, not exact digest preimages.

### Follow-up test of the Whirlpool claim

The 2016 “Whirlpool” report motivated a source-locked check of all 58 original Onion7 JPEG page bytes under Whirlpool. Result: **0/58** exact matches to the p56 target. The reproducer is the opt-in `--whirlpool` mode in [the existing original-JPEG gate](../sims/anend_original_jpeg_gate.py), which verifies OpenSSL 3's legacy-provider implementation with the published `abc` vector and reuses the script's per-page original Git-blob assertions.

The exact 15 September 2014 Onion7 host directory was previously tested under SHA-512, SHA3-512 and BLAKE2b-512 (38,448 hashes across four fixed address serializations); Node 22 did not expose Whirlpool, so that algorithm was not actually covered by the earlier direct-address SFT. A separate OpenSSL 3.5.5 legacy-provider test now closes that gap. It verifies the original 73,692-byte directory Git blob `8722ee2edd749f01b4fffbd91053fac5a8ca0ff3`, comprising 3,204 unique entries (3,172 canonical lowercase v2 hosts), then computes Whirlpool over all four frozen serializations—exact `.onion` host, bare label, HTTP root URL, and HTTPS root URL—for **12,816** address candidates. The published `abc` test vector passes; **zero** candidates match. The exact archived 1,640-byte 2014 Stage11 index HTML (Git blob `303db130705f0ef9be2a738f4336d5cfcebde80c`) also does not match; its Whirlpool digest is `4e0f749b92b1d465fbe598de7446d9c8867d244ab1af1a93132b3dfcde8dbf47bfbc2c51259d8144dfc8f598d622537792d89d7e0017767fc33bf1ad64d847b8`. Reproducer: [Whirlpool source-gate](../sims/lp2_p56_whirlpool_historical_onion_sft.py) · [manual workflow](../.github/workflows/lp2-p56-whirlpool-historical-onion-sft.yml) · [successful run #44206277530](https://github.com/FlareZ123/liber-primus/actions/runs/44206277530).

These negatives exclude only the tested direct Whirlpool representations of this particular historical directory and archived index copy. They do **not** establish the digest family, preimage framing, or final destination. The archived index is a participant-archive copy, not an authenticated original HTTP entity body. The historical 2016 downloaded `.htm` file remains unrecovered; the current 136-byte raw Pastebin copy has separately been byte-hashed under Whirlpool and three other 512-bit algorithms without reproducing the target.

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
- Additional Wayback CDX evidence in [Dukotah's pinned cicada3301.org index](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/D-archives/cdx/cicada3301.org.json) records the exact 128-hex p56 digest as a URL path on `cicada3301.org`: 2016-04-12 (404, 1,668 bytes), 2016-07-27 (522, 2,206 bytes), 2016-08-29 (404, 1,444 bytes), and 2017-05-09 (404, 522 bytes). There is no 200 capture. The 2016-04-12 response digest is identical to the site's generic `/admin` 404 response, so this records a requested path, not recovered target content. The same corpus's [ky2k `.onion.to` CDX](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/D-archives/cdx/onion_ky2khlqdf7qdznac_to.json) has a 2015-05-25 root 200 capture (780 bytes); the companion [Wayback analysis](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/round43/F5-stored/RESULTS-wayback.md) identifies it as an `onion.to` “Temporarily not available” gateway page, not onion-service content. These records strengthen the interpretation that the digest was tried as a URL path but do not identify a live or authenticated destination. The ArchiveBot item metadata identifies 22,508,403-byte host and 9,302-byte `www` WARCs, whose anonymous downloads now give **HTTP 401**, with metadata `access-restricted-item=true`. **Two exact Wayback `id_` replay HTML bodies were recovered**: the 2017-06-29 domain root is 7,063 bytes, and the 2017-06-16 `/092317.html` is 971 bytes. Both SHA-1 base32 digests exactly equal their public CDX payload digests; the earlier 4,521 and 680 figures are **CDX record lengths**, not original HTML body lengths. The root links to three named MP3 files, QII.jpg and 30.png; `/092317.html` is a September 2017 countdown. Neither contains PGP signatures, `.onion`, `3301`, `uRkNsGsa` or the p56 digest; their SHA-512 values do not match p56. The raw WARCs remain inaccessible, and matching the CDX payload digest does not independently prove unaltered on-wire bytes. The batch manifest marks source attribution to Cicada unverified. [Exact source-specific replay and checksums](2017-archivebot-1711141131131-original-html-source-gate.md) · [consolidated hash assessment](archive-hash-preimage.md). The live Pastebin ID `uRkNsGsa` now has a verified 136-byte raw object, but it merely reproduces the target hash; no original-time downloaded `uRkNsGsa.htm` bytes were recovered.

Search-engine and public-code indexes are not exhaustive; a zero result is not proof that a private, deleted, or unindexed object never existed.

### Root-page CDX metadata: index inspected, payload unavailable

The earlier statement that the domain's root captures were uninspected is now narrowed: their **CDX metadata** has been inspected, but the HTML payloads have not been recovered.

- The pinned [Phase 52 CDX index](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase52/cdx_results.json), query key cicada3301.org/*, contains **257 exact root-URL records** from 2015-08-14 through 2026-06-29: 159 status 200, 59 status 302, 7 status 523, and 32 revisits.
- The independent pinned [Dukotah CDX index](https://github.com/Dukotah/cicada3301/blob/7a264cb643c7e6a3076a318e82734472da37ee5d/corpus/D-archives/cdx/cicada3301.org.json) contains **208 exact root-URL records** over the same date range: 148 status 200, 50 status 302, 2 status 523, and 8 revisits. Its 2015–2017 subset is 14 captures, 13 status 200 and one revisit.
- The exact p56 digest path remains negative in both indexes: five Phase 52 records and four Dukotah records, all 404 or 522. The root-page 200s are not captures of the digest path.
- A separate [ArchiveTeam WARC item](https://github.com/Dukotah/cicada3301/blob/7a264cb643c7e6a3076a318e82734472da37ee5d/corpus/D-archives/iarchive/meta_warc-cicada3301_org.json) was captured on 2016-11-26. Its 16,512,716-byte WARC reports imagecount 359. The 23-byte start-URL file's SHA-1 matches exactly `https://cicada3301.org/`, but the item and all files are marked private/access-restricted; no WARC body or CDX derivative was retrieved.
- A later [2024 GitHub snapshot](https://github.com/RYSF13/cicada3301/tree/52fce6439eed12de73063daac4ee34ff4d4dc26c) is branded “Cicadian”; its Liber Primus and Gematria Primus pages are marked “coming soon.” This is later community material, not evidence of the 2016 site's content or an authenticated Cicada endpoint.

**Decision:** the index-level omission is closed, but the page-body question remains inaccessible through the available public sources. The domain is not authenticated as a Cicada destination, and the exact digest path itself has no successful capture. Do not treat the root-page 200s as target-page evidence or spend further effort here unless the restricted WARC becomes accessible or a first-party link selects this host.

## Conclusion

**No exact occurrence located here includes the original target-page content bytes.** The 2016 Pastebin statement is a known-digest repost; the 2019 onion/domain/video claim is an unauthenticated third-party puzzle/media branch with no reproducible preimage or creator-authenticated signature. The exact hash algorithm, canonical preimage bytes, page framing, and destination therefore remain unknown.

Do not turn the words “Whirlpool,” the Pastebin filename, or the later onion/domain into assumptions. Reopen this branch only with an independently dated original `uRkNsGsa.htm` file different from the live target-hash copy, an authenticated target-page capture, or another source-fixed candidate preimage.