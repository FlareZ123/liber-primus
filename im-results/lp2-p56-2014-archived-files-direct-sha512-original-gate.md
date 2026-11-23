# Solved p56 SHA-512 target: byte-exact search across fixed 2014 archive files

**23 November 2026, Agent7. Result: no direct SHA-512 preimage among 435 original-archive files (368 unique file byte contents).** This excludes the tested static archived candidate bodies only. It does not locate the withheld deep-web page, recover missing ciphertext, or claim the historical Tor page was publicly preserved.

## Source-selected operand and target

The genuinely solved original LP2 p56 states that a deep-web page hashes to the 512-bit digest

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

At publication SHA-512 was a recognizable standard matching this **128-hex-character** output. The most literal historical byte-level attempt is `SHA512(exact captured page/entity body)`. An original web page might be HTML, a bare encrypted hex stream, JPEG or gzip, since the observed 2014 onion stages served all these types. Such a file would still hash *as-is*, without trimming, guessing salts, changing charset, or decoding.

Two independent participant archives preserve actual captured webpage files, along with some accompanying solver notes. This is a finite and intentionally broad archived-file-corpus screen; participants' own files are not first-party Cicada artifacts. Exact pinned Git commits:

- [micheloosterhof/cicada-2014 May 2014 snapshot](https://github.com/micheloosterhof/cicada-2014/tree/6c3421a4d245596e403c88e037509d162a2afd17), all `stageN/` regular files.
- [neuroretransmit/cicada 2014 snapshot](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014), all `2014/` regular files.
- Exact repo archived original Stage11 HTML and signed redirect copies, including duplication of matching originals.

## Original-byte outcome and completeness

| Finite archive | Files hashed | Bytes hashed | Unique byte contents within that archive |
| --- | ---: | ---: | ---: |
| micheloosterhof original staged files | **152** | **115,201,609** | 150 |
| neuroretransmit reconstruction files | **281** | **192,944,422** | 217 |
| Current pinned original copies | 2 | 2,823 | 1 |
| **Total** | **435** | **308,148,854** | **368 globally unique SHA-256 bodies** |

The file set includes **164 `.jpg`**, **19 `.html`**, **35 `.bin`**, **55 `.txt`**, **15 `.outguess`**, **14 `.hex`**, raw streams, gzip files, PGP material, and supporting historical reconstruction files. These are exactly the on-disk bytes at the declared Git commits, regardless of extension. **Zero of 435 SHA-512 results matches p56's digest.**

Representative exact original archived page bodies included `stage11/ky2khlqdf7qdznac.onion/index.html` (1,640 bytes, SHA-512 starts `83e50c118edb70dc34c9`), `stage2/index.html` (104 bytes, starts `166557f3212d70ff9295`), `stage10/index.html` (1,943 bytes, starts `1c207650a175a0fb5b78`), `2014/005-third-onion/li676-224_server-status_new.html` (1,370,851 bytes, starts `377e56227fead06b9b85`), and the captured 2014 sixth-onion `2014/008-sixth-onion/ut3qtzbrvs7dtvzp.onion.html` (8,623,398 bytes, starts `538eb544a76ae6c58ed2`). These values are *diagnostic fingerprints*, not candidate plaintext.

The [read-only Node22 exact-byte walker](../sims/lp2_p56_archived_2014_page_preimage_sft.cjs) asserts the conventional SHA-512 `abc` vector and target length, enumerates every regular file in the fixed archive folders, confirms nonempty corpus sizes, groups byte-identical files by SHA-256 and compares each raw SHA-512. The [manual pinned-checkout runner **PASS**, including 435 hashes and zero matches](https://github.com/FlareZ123/liber-primus/actions/runs/45105902926) executed the entire 308MB finite archive scan.

## Missing input and decision

The source uses the noun **page**, so this batch includes candidate web entity bodies rather than extrapolating from onion hostname strings. Earlier [candidate directory/Stage11-only tests](lp2-p56-2014-onion-directory-and-stage11-index-hash-gate.md) already screened hostnames and one index; the present contribution expands the original static-file corpus to **every captured file in two fixed historical archives**, using exactly one source-motivated hash and one encoding.

The target could identify a **never archived Tor page**, live CGI output, HTTP response header+body canonicalization, page assembled from links, or a page discovered only after completing the encrypted manuscript. Those alternatives are not ruled out. No further arbitrary hostname, salt, encoding or page-concatenation guesses are warranted without a first-party clue. **Decide only that none of these 368 known distinct static archived byte strings is the literal SHA-512 preimage**. Source-era missing original page bytes remain the meaningful next prerequisite.
