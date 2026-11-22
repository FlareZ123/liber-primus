# 2014 Stage04 and Stage08: cryptographically authenticated original signed sources

**Director #852, 14 November 2026.** Both surviving clear-signed message bodies pass original-key GnuPG cryptographic verification. This resolves the former signature-validity uncertainty in #832. Source-authentic historical clue instructions are thereby established; they do not supply an LP2 decoder, unknown-page plaintext, or a new author-selected key.

## Original source bytes and direct signature results

| Stage | Exact source | Bytes | SHA-256 | GnuPG signature |
| --- | --- | ---: | --- | --- |
| Stage04 | Original extracted resources/external/derived/2014-stage04/03-outguess.asc; Git blob 2a355d1bf14d37041384f09d8700e2ee274a13e6 | 31,809 | a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1 | GOODSIG, VALIDSIG; 2014-01-10 |
| Stage08 | [Pinned archived index](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage08/index); Git blob 57478039d8dbb4b20d16aff7f9c3af0f2f13da8d | 25,543 | 0c1054e9b013c6894eb7b2f0f01ad7e8627ff9432a13688c84686810e705a844 | GOODSIG, VALIDSIG; 2014-01-19 |

Both signatures verified with original Cicada 3301 public key, fingerprint **6D854CD7933322A601C3286D181F01E57A35090F**, preserved at [resources/control/cicada-3301-public-key.asc](../resources/control/cicada-3301-public-key.asc). The exact verified status contains GOODSIG 181F01E57A35090F Cicada 3301 (845145127), and VALIDSIG with that full fingerprint. GnuPG signature timestamps are 1389332574 and 1390112886, respectively. Original text signatures have v4 cleartext class 01 and SHA-1 (Hash: SHA1 header).

Stage04 has 533 original LF bytes, Stage08 has 453. Both exact source originals exit status zero on GnuPG, and realistic LF-to-CRLF transport alternatives also verify (Stage04 32,342 bytes, SHA-256 3388e61a9eb9d9ddb47428261fe6ac59c30a957924e22aa8c77e49dc3b275855; Stage08 25,996 bytes, SHA-256 b70513e1d0f633c6f41fe83c8d3f3e4d8487f43acd2466e40b3e470598eca365). A single altered byte in a signed prose line causes each verification to fail: the signatures actually bind the authored body. The test imports the pinned public key into a fresh temporary GnuPG home and executes GnuPG directly on unmodified source files, with no invented canonicalization or reassembled message.

Stage08 is pinned to krisyotam/cicada3301 revision 76d3ee8c762f60025822c8c05edbf31351636469. Its 12,683-byte original compressed index.bz2 has precisely one bzip2 member, no trailer, and expands byte-for-byte to the separately archived 25,543-byte signed index. Prior authentic parent JPEG OutGuess extraction independently yields the exact compressed bytes. **The missing raw original HTTP transaction has not been recovered**; authenticity of the archived signed payload does not prove every original network-transfer byte.

## Historical decryptions and their exact scope

**Stage04.** The signed source contains “Let the text guide you” and a runic picture. Original LP1 words WELCOME PILGRIM TO THE GREAT form the historically consumed 22-GP-rune Vigenère key. Source-native subtraction recovers the subsequent onion address avowyfgl5lkzfj3n.onion. The already-complete [exact LP2 transfer test](lp2-stage04-exact-key-transfer-gate.md) applied that key over all 12,956 unsolved runes under global, physical-page and chapter clocks, and checked p55 literal-F alternatives; it recovered no language. This authentication does not revive already rejected direct key reuse.

**Stage08.** Its signed message includes three exact hex media daughter objects depicting Gödel, Escher and Bach, pointing historically to Douglas Hofstadter's *Gödel, Escher, Bach*. The same signed message carries chapter-code markers 3PI, LML, ETOATS, C[1], C[2] and ONION, which historically lead to ut3qtzbrvs7dtvzp.onion. The exact daughter-source study is [here](cicada2014-stage08-daughter-source-audit.md). No LP2 decoding key, page selection, clock or reversible consumer is selected by that message.

## Reproduction, evidence classification and decision

The read-only [Python SFT](../sims/cicada2014_stage04_stage08_signature_gate.py) pins original Git blobs, checks the Stage08 compressed-member equality, imports the actual original public key, runs the two exact-byte GnuPG checks and transport/tamper controls, and prints complete status metadata. The existing [manual-only workflow](../.github/workflows/cicada2014-stage08-bzip2-manual.yml) passed in [run 43571434961](https://github.com/FlareZ123/liber-primus/actions/runs/43571434961) and again in [run 43571703580](https://github.com/FlareZ123/liber-primus/actions/runs/43571703580). No automated per-commit CI was introduced.

**Decision:** promote Stage04 and Stage08 *signed body contents* to original-key cryptographically authenticated historical selector controls. Preserve the Stage08 archival HTTP-capture caveat, the independent word-key and book-code reproducibility questions, and the open LP2 plaintext/key gap. Do not rerun general signature archaeology or direct Stage04-key transfer without a newly selected authored operation.
