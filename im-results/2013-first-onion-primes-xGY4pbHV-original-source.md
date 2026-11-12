# Recovered original first-onion PRIMES paste xGY4pbHV: 284-number witness

**Classification:** new original first-hand participant source, stronger historic evidence for the 2013 first-onion gap and double spacing. **No authenticated Cicada server code, unknown LP2 plaintext or cipher key.** Agent1, 12 November 2026. This changes the missing-input status recorded in [closed Director #478](https://github.com/FlareZ123/liber-primus/issues/478), which could not reach the archive/Pastebin endpoints from its former tool path.

## Exact now-recovered artifact

The original [Pastebin raw xGY4pbHV](https://pastebin.com/raw/xGY4pbHV) is publicly retrievable through a GitHub Actions Windows runner. It returns **HTTP200**, **1,387 bytes**, SHA-256 **591b3cf337c803eef76a16466fa6ebc711aa1f0a3b26d1520573abda89889a94**. The source begins with the literal first-onion command **primes**, followed by a blank line and the numerical output. The [original article](https://pastebin.com/xGY4pbHV) renders the same list. The [Wayback CDX index](https://web.archive.org/cdx/search/cdx?url=pastebin.com%2FxGY4pbHV&output=json) currently shows a later 10-June-2024 capture, which provides independent preservation though not an early timestamp.

The older [2016 Uncovering Cicada index](https://uncovering-cicada.fandom.com/wiki/Mentioned_PRIMES) explicitly names this exact ID as the first-onion PRIMES Telnet output. The exact bytes and original source URL are now available. This is an unsigned public participant paste, not a cryptographically authenticated Cicada daemon output. The full third-party source may be retrieved using the stable source link and hash; it is not republished verbatim here.

## Newly fixed details

1. There are **284 numbered tokens**, all primes. They match exactly the first **20** primes (2 through **71**) followed by primes **201 through 464** (1,229 through **3,301**). Exactly **180** consecutive primes are missing: ordinals 21–200, values 73–1,223. This is the exact original source list rather than a recreated 180-gap model.
2. The original preserves exactly two doubled spaces **after 29 and after 3,257**: adjacent literal text snippets **29  31** and **3257  3259**. This formatting was present in the original participant paste and was not invented by a later recreated server. The source has no instruction to pick the preceding or following number.
3. Its final prime is explicitly **3,301**, resolving the **3,299 versus 3,301** disagreement across two later reconstructions in favor of the direct older witness. It does not authenticate either alternate reconstruction's command grammar.
4. The published 2013 title/parable number relations remain mathematically exact. The historical gap's **180** absent ordinals still agree with the **180** interior cells of the manuscript's 32×8 numeral table, while the one-cell table perimeter holds **76** cells. This comparison was identified before recovery and remains a retrospective match, **not** a source-selected LP2 cipher inverse.

**Reproducer:** [Windows Node22 single-file source gate](../sims/cicada2013_xgy_paste_source_sft.cjs) fetches the original raw bytes and requires their exact hash/length; constructs the complete list of primes up to 3,301 independently; checks all 284 source values, gap endpoints and doubled-space delimiters without correcting transcription. [Successful original retrieval CI run 43315419807](https://github.com/FlareZ123/liber-primus/actions/runs/43315419807). The enhanced exact comparison is rerun separately in CI.

## Decision for cryptanalysis

This source eliminates a historical provenance uncertainty and makes the 2013 180-omission/29/3257 spacings available as genuine contemporary observations. It does **not** establish that Cicada's server created the omissions intentionally, explain how the 256-position p50 table is to be traversed, prescribe how prime numbers convert to keystream symbols, or deliver unknown LP2 plaintext. Any continuation must specify one such reversible instruction from an independent original clue. See also the existing [180/76 conditional test](2013-telnet-missing-primes-terminal-180-76.md), whose original-source classification is updated accordingly.
