# External Cicada research repositories and historical archive

These are useful independent research and historical references. They are not authoritative proof of an LP2 solution; preserve the distinction between archived facts, community transcription, simulations, and hypotheses.

## pnotisdev/cicada3301

Repository: https://github.com/pnotisdev/cicada3301

A large, staged research notebook with a substantial catalogue of controlled tests and an explicit unresolved frontier. Its reported status is no verified LP2 plaintext. Use it to avoid repeating screened key-source and mechanism families.

Relevant material:

- [Source registry](https://github.com/pnotisdev/cicada3301/blob/main/docs/SOURCES.md) and [phase 31 book-code analysis](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase31_book_codes.md): the 2014 Gödel, Escher, Bach book code uses dialogue:speech:word:letter coordinates. The book is named by a preceding clue chain; this is not a reason to use GEB as an LP2 key without a comparable LP2 source cue.
- [Phase 57 mechanism model](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase57_mechanism.md): a candidate forward model combines a lag-six (T(x)=24-2x) collision repair (reported repair probability about 0.81) with a checked, uniformly valued word-null insertion (reported probability about 0.42). It fits a set of aggregate ciphertext statistics in the authors' simulations, but supplies neither an authentic key nor plaintext. Treat it as a competing explanatory model, not an established mechanism.
- [Phase 58 repeated-pair report](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase58_djubei_reuse.md): reports the two `DJU BEI` occurrences at offsets 6555 and 12950.
- [Phase 61 unrepair test](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase61_unrepair.md): naive replacement of detected lag-six sites loses information; a repair-aware likelihood improves planted-key simulations but does not recover a real key.
- The lag-six observation overlaps this repository's existing held-out analysis in `im-results/lag5-lag6-heldout-conditional-prediction.md`; use the external result as independent corroboration, not as a new discovery.

## neuroretransmit/cicada (2013 onion archive)

Repository: https://github.com/neuroretransmit/cicada

A stage-by-stage community archive of the 2013 round. Three first/second-onion cleartext-signed messages are mirrored under `resources/historical/` and verify against the repository's Cicada public key (fingerprint `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`):

- [First-onion hello](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/hello.txt.asc): signature dated 6 January 2013 07:51:35 UTC; names `xsxnaksict6egxkq.onion`.
- [Second-onion ICMP reply](https://github.com/neuroretransmit/cicada/blob/main/2013/005-second-onion/icmp-echo.asc): signature dated 10 January 2013 17:07:15 UTC; names `pklmx2eeh6fjt7zf.onion`.
- [Second-onion instruction](https://github.com/neuroretransmit/cicada/blob/main/2013/005-second-onion/everything-you-need.txt.asc): signature dated 14 January 2013 05:31:07 UTC; says solvers already have what they need and to "knock on the sky and listen to the sound."
- The companion first-onion [forest clue](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/clue.txt.asc) is already mirrored as `resources/historical/cicada2013-forest-clue.asc`.

The archive's first-onion `server.py` and `gematria.py` explicitly describe themselves as recreations from publicly known behavior, not recovered original server source. Treat its COUNT/NUMBER implementation details as reconstructed, not as an authenticated Cicada implementation. The whitespace visible in the first-onion cleartext-signed hello file is not protected by OpenPGP cleartext-signature trailing-whitespace canonicalization; do not promote whitespace counts as signed evidence.

The [third-onion archive](https://github.com/neuroretransmit/cicada/tree/main/2013/006-third-onion) preserves the coordinate, poster, phone, XOR-offset and Shamir-share stages. The [fourth-onion archive](https://github.com/neuroretransmit/cicada/tree/main/2013/007-fourth-onion) is explicitly leak-based and largely undocumented; its 19-question images are not, by themselves, evidence of an LP2 key or selector.


**Additional 2013 participant record used for the ICMP reconstruction:** [`irc-logs/#33012013.freenode.log`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%2333012013.freenode.log) at commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3` (13,345,841 bytes; 190,170 lines; SHA-256 `3589f67c010e3290845900d1247ae1d65919859bb05e7e5efffb90b70dc46028`). It documents the `li498-122` / `106.187.103.122` association, the 15 January ICMP responder behavior, and the missing-PCAP discussion. It is a channel transcript, not a packet capture. See `im-results/2013-icmp-echo-packet-reconstruction.md`.

## cicada-solvers/neuroretransmit-cicada

Repository: https://github.com/cicada-solvers/neuroretransmit-cicada

A community historical archive of Cicada stages and artifacts. Particularly useful paths:

- [2014 stage 7](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/007-fifth-onion/README.md): the documented human solve path uses audio/OpenPuff to obtain magic squares, then OutGuess to extract a Gödel theorem equation, an Escher eye, and a Bach Trio Sonata excerpt. These identify Gödel, Escher, Bach; the subsequent book cipher uses dialogue:speech:word:letter coordinates. The source text is named before book-code extraction.
- [2014 stage 10 hidden-service reply](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/010-hidden-service-reply/README.md): preserves the reply and next onion-service address.
- [2014 stage 11 / Liber Primus](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/011-seventh-onion/README.md): documents the 58 LP2 pages 0–57, the totient-shift solution for page 56, the plaintext page 57, and the unresolved “An End” hash continuation.

The archive is a community reconstruction, not a substitute for checking original image/audio bytes. The 2014 GEB chain is a strong precedent for clue-constrained book ciphers: do not transplant its book or coordinate convention to LP2 without a corresponding source-selection clue.


## Leo-Y-Zhang/LiberPrimusAnalysis (pinned 7 November 2026)

Repository: https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/tree/0b907164e95e3a44ee74c1d28efbf4688b770865

- Independent September 6–7, 2026 session; repository last pushed 7 November. It reproduces the nine established solved sections and reports no LP2 plaintext.
- Reports the 12,956-rune / 86-adjacent-repeat fingerprint, flat nonzero first-difference stream, no detected periodicity to its stated limits, and no shared keystream between sections. Its proposed chain model, c_i=c_(i-1)+s_i with nonzero 28-way steps and a rare zero event, is a **candidate explanation**, not an identified cipher or plaintext.
- Its source/key hunt includes OutGuess on all 75 images with no key and 96 candidate keys (4,521 nonempty outputs; unsolved-page outputs are 58,152-byte high-entropy noise), 692,438 archived candidates plus OutGuess payloads against the p56 target, and raw JPEG / growing-string running-key scans. These are useful prior-art negatives; overlap with other repositories and this project's later tests is not fully independent.
- Start with [REPORT.md](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/0b907164e95e3a44ee74c1d28efbf4688b770865/docs/REPORT.md), [FINDINGS.md](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/0b907164e95e3a44ee74c1d28efbf4688b770865/docs/FINDINGS.md), and [OutGuess / hash-source results](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/0b907164e95e3a44ee74c1d28efbf4688b770865/outguess/RESULTS.md). The repository declares an "Other" source-available license; inspect it before reusing code.

## Cicada Notebook (104-session independent research notebook; updated 30 October 2026)

Guide: https://cicadanotebook.com/guide.html

The guide reports 104 focused sessions and no verified LP2 plaintext, decoding table, or author identity. These sessions are useful prior art, not proof of an LP2 solution. Particularly relevant:

- [Session 12 — 2012 Agrippa book-code reconstruction](https://cicadanotebook.com/sessions/12.html): reports a complete historical destination reproduction from a pre-puzzle text snapshot. The fixed convention is one-based line:character, beginning at the first verse line (excluding title/byline), treating HTML `<br>` as line breaks, stripping source indentation, and preserving blank verse lines, internal spaces, and punctuation. This is evidence for a real historical coordinate convention only; it does **not** select the 2016 GP-word-sum `29q+r` selector or Agrippa as an LP2 key.
- [Session 11 — published Agrippa algorithm test](https://cicadanotebook.com/sessions/11.html): applies the documented algorithm to the LP2 256-byte block and reports no readable ASCII output under the tested alignment. This does not exclude binary/compressed output, a different representation, or Agrippa used as a source text.
- [Session 104 — historical 2014 square submission](https://cicadanotebook.com/sessions/104.html): reports that all 40 original line totals verify, while each of the three squares has four distinct arrangements preserving dimensions, multiset, and magic totals. Actual server acceptance and MP3 extraction remain archival claims rather than newly reproduced operations; no matrix traversal is promoted to a cipher.
- [Session 55 — tree passage structure](https://cicadanotebook.com/sessions/55.html) and [Session 62 — derived boundary map](https://cicadanotebook.com/sessions/62.html): useful page-structure references, not a recovered key or traversal.
- [Session 65 — Berkeley remailer comparison](https://cicadanotebook.com/sessions/65.html): expands the comparison to 28 distinct verified message bodies and 94 solved-text clauses; reports no shared four-word phrase. The sample is not exhaustive.

Use the session-specific source captures and reproduction artifacts before importing a claim. The most useful distinction for current work is that historical one-based line:character indexing is documented, but a 2016 `29q+r` word-sum address still needs its own source selector.
## SECRA — Inside Liber Primus (15 October 2026)

Article: https://secra.tech/research/liber-primus-strongest-findings/

Supporting measurements: https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html

- The page-57 mayfly dots strongly match a historical GIMP Dissolve / GLib random-field pattern: reported whole-image F1 **0.9601**, held-out F1 **0.9391**, with **166** cells still differing. The seed **314159265** is a GIMP software default, not evidence of a puzzle-selected π key. This is a rendering fingerprint, not a plaintext or cipher key.
- The archived 2014 *Interconnectedness* MP3 contains a repeated opening/ending noise waveform separated by **11,559,607 samples** (about **262.122608 s** at 44.1 kHz). Controlled cancellation did not reveal a supported additional message or key; the separate archived OpenPuff payload is a different channel.
- Three earlier magic squares have prescribed line sums 3301, 1033 and 1033. The community-observed center sequence 809, 331, 91 gives π-count differences 73 and 43 (GP letters L/P), but the article explicitly does **not** establish that center selection, prime counting and subtraction were uniquely instructed by Cicada.
- These findings overlap the current GIMP-confound assessment in `results/README.md`; do not reopen the retired p57 241/331 selector or audio residual search without the exact missing source artifact or a new independent selector. The article reports no LP2 decryption, key or destination.

## Additional modern research and tooling (reviewed 11 November 2026)

These sources were inspected for post-2018 claims of unknown-page plaintext or keys. None supplies a verified LP2 p0–55 decryption. Keep tools, candidate models, and actual plaintext recovery separate.

### Wulfic/Cicada3301-Liber_Primus (2026)

Repository: https://github.com/Wulfic/Cicada3301-Liber_Primus

A substantial independent workspace, last pushed 12 October 2026. Its own [README](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/README.md) and [MASTER_TRACKER](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) explicitly mark LP2 scans 17–66 and 68–72 (12,956 runes) **unsolved**. The [logic findings](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/findings/lp2_logic_findings_2026-09-29.md) register 28 constraints and discuss an output-side anti-doublet/re-key interpretation of the 86 adjacent equalities. The reported “19% leak” is a model interpretation relative to a uniform baseline, not an identified re-key algorithm or key. The repository's hillclimber cribs are not verified plaintext. Useful independent prior art for the doublet question; do not cite it as a solution.

### anon5376/cicada (2026)

Repository: https://github.com/anon5376/cicada

A reproducible execution lab, explicitly not a claim that Liber Primus is solved. Its [EXP-LP-UNKNOWN-NEXT-001](https://github.com/anon5376/cicada/tree/main/experiments/EXP-LP-UNKNOWN-NEXT-001) reports `derived_kept=0` and `verified_new_decrypt_runes=0`; no new key or plaintext was retained.

### jaxonkuipers/cicada3301 (source-closed research corpus, 8 September 2026)

- **Pinned source:** [47f32a9e94061953ab25fdd5052996c27a86c002](https://github.com/jaxonkuipers/cicada3301/tree/47f32a9e94061953ab25fdd5052996c27a86c002), last committed 8 September 2026. No repository licence is declared; **link to implementations, do not copy the code**.
- **Relevant independent computational method:** [`solver/search.py`](https://github.com/jaxonkuipers/cicada3301/blob/47f32a9e94061953ab25fdd5052996c27a86c002/solver/search.py) implements exact dynamic-programming/Viterbi maximisation over which **ciphertext F runes** interrupt the key clock, *conditional on an already-fixed Vigenère key, cipher and bigram scoring objective*. It reports a 136–678× speedup over its older beam and uses a score prior at approximately 40% true interrupters. [`tests/test_search.py`](https://github.com/jaxonkuipers/cicada3301/blob/47f32a9e94061953ab25fdd5052996c27a86c002/tests/test_search.py) includes genuine solved-text comparisons and planted/exhaustive tests, with exact recovery of chosen synthetic skips. The exhaustive maximum is for its **bigram objective**, not a guarantee of true historical skip recovery or a key-finding algorithm.
- **Local overlap and cheapest discriminating test:** our [integrated inversion challenge](../../workplace/integrated-original-inversion-challenge.md) already has bounded p55 R4 fixed-key Viterbi/sum-product and skip-aware p50-derived experiments; Dukotah's Campaign XVIII additionally tests a filter-aware beam. This external implementation would matter *only if an independently original-source-selected key and clock* turn ambiguous F placement into the limiting inference problem. Then run its existing `python -m unittest tests.test_search` controls against source-native solved LP1, freeze the key and evaluate withheld original LP2 with a wrong-key comparator. Running it as a new dictionary/key sweep now has no causal path to plaintext.
- **Additional research corpus:** [`discord.db`](https://github.com/jaxonkuipers/cicada3301/blob/47f32a9e94061953ab25fdd5052996c27a86c002/discord.db) and [`solver/cli/dsearch.py`](https://github.com/jaxonkuipers/cicada3301/blob/47f32a9e94061953ab25fdd5052996c27a86c002/solver/cli/dsearch.py) index 109,917 2019–2026 retrospective community posts in 13 channels. Searchable prior-art discussions could prevent duplicated tests or expose a missing archival pointer; these are modern participant discussions, **not original Cicada-authenticated source**. No new LP2 plaintext/key is claimed. The route-owned [2014 public-release record](https://github.com/jaxonkuipers/cicada3301/blob/47f32a9e94061953ab25fdd5052996c27a86c002/corpus/records/R14.7/README.md) acknowledges the original decoder is unknown and its 2014 private recipient callback is missing.

### krisyotam/cicada3301 (8 November 2026 repository import)

- **Pinned source:** [76d3ee8c762f60025822c8c05edbf31351636469](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469); repository created 8 November 2026, **GPL-3.0**. Its claimed 5,157-file historical/solver archive contains embedded copies of existing community collections, not 5,157 independent original documents.
- **Original-image control:** [`liber-primus/original-onion7/`](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469/liber-primus/original-onion7) currently has **58 JPEGs, one 1,640-byte `index.html` and one `message.txt.asc`**. Git blob SHA-1 of `0.jpg` is `abab573f7a3786f46fe4fab17d5f2dcf2476136b`, exactly the local physical p0 `resources/liber-primus/17.jpg`; its `55.jpg` is `ee00cd34013fe3a5c6808650abb6d3206b6f1b13`, exactly local physical p55 `72.jpg`. The 1,640-byte index matches the established Stage11 envelope in size and description. Thus this inspected archive branch supplies no additional LP2 authoring file, page59 object or revised source bytes.
- **Method/source overlap:** [`HINTS-NEVER-USED.md`](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/liber-primus/analysis/HINTS-NEVER-USED.md) republishes the 2012 P.S. integer, 2013 telnet prime gap and onion cookies. These are historical research leads already tracked by other public corpora, with no LP2-decoding selector. The archive's copied tools can be a navigational convenience but must not be counted as independent validation.

### Dukotah/cicada3301 (2026; inspected 11 November 2026)

Repository: https://github.com/Dukotah/cicada3301 (inspected commit `f63501d8f2d835b80c30230eb89a1110fb9197d2`)

A large independent Liber Primus research package with a 309-row experiment ledger, a measured-ceiling synthesis, and focused AN-END/deep-web-hash OSINT. It reports no verified LP2 p0–55 plaintext. Useful as a prior-art index and as a bound on what its enumerated experiments establish:

- [MEASURED-CEILING.md](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/MEASURED-CEILING.md) and [FINAL-SYNTHESIS.md](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/FINAL-SYNTHESIS.md): document the tested cipher/key families and a large computational panel. The authors' “OTP-class” conclusion is a **measured ceiling over enumerated families**, not proof of a literal one-time pad or global impossibility. External-key and short-seed-derived streams remain outside that ceiling.
- [AN-END / deep-web-hash OSINT](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/DEEPWEB-HASH-OSINT.md) and [the 27 July 2026 archive sweep](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/OSINT-SWEEP-2026-07-27.md): useful negative baseline for address-free retrieval and archived v2 onion candidates. The report does not recover the target page or its preimage; treat its closure as bounded by the sources/corpora it enumerates.
- Its 2017 ArchiveBot/CDX inventory records a 4,521-byte root HTML capture and a 680-byte `/092317.html` response, but the raw WARC response bodies are not included in the repository. The third-party domain is not authenticated as a Cicada endpoint; do not promote it without a primary-chain link.

#### Later master-branch elimination ledger (inspected 11 November 2026; document reports work through 29 July 2026)

The [master-branch ELIMINATION-LEDGER](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/ELIMINATION-LEDGER.md) adds materially relevant work beyond the pinned snapshot above. Treat its findings as external, not independently reproduced in this repository:

- **Filter-aware key-skip decoding:** [Campaign XVIII](https://github.com/Dukotah/cicada3301/tree/master/liber-primus/analysis/campaign18_skip) validates a beam decoder that tracks the key/plaintext desynchronization caused by an approximately 83% doublet-suppression filter. A planted correct key recovers at −4.15 / 100% while rigid alignment scores −7.24 / 8.5%; false-positive ceiling is −6.82 and planted-key recall 7/8. Re-running referenced texts, a 122-text corpus, and 88 additional literary texts under the skip-aware model reportedly yields zero hits (best −5.754 across the extended sweeps). This is a major prior-art constraint: do not repeat rigid-alignment running-key sweeps or build a duplicate beam decoder without a materially different key source or forward model.
- **Themed-word/no-repeat combiner:** the external authors test 58 LP-thematic words, both signs, through a no-repeat combiner on 13 scorable unsolved pages; best long-page score −6.88, with a lossy 4.4% rejection rate. They close this particular family. This is more specific than the earlier keyless no-repeat statistic.
- **p49–51 table as per-section index and red-join reset:** [H1/H2 report](https://github.com/Dukotah/cicada3301/tree/master/liber-primus/analysis/recon/lp2h_index) tests the 256-token base-60 table as an index/offset over 14 red-section-head pages, 11 decode models, and red-boundary continuity. The reported best score is −7.200; index concentration fails correction, base-60 geometry fails, and red joins show no reset (permutation p=1.0). This is an external negative not yet independently reproduced here; avoid duplicating the same 14-page index or red-join tests.
- **Transcription and corpus scope:** Campaign XIV reports the apparent ~75-page gap is already-solved material and pages 0–55 are the complete unsolved corpus; Campaign XV reports a label-free glyph-shape audit (ARI 0.75, homogeneity approaching 0.98), with only a fragile p24 local-172 glyph distinction. These are external claims; compare page numbering and exact corpus boundaries before importing counts.
- **External frontier stated by that ledger:** its authors retain an untried already-public keytext and recovery of the AN END deep-web page; they report internal ciphertext-only attacks exhausted. Their [OSINT sweep](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/OSINT-SWEEP-2026-07-27.md) is relevant prior art for the Tor2web archive question.
- **Tor2web Wayback correction:** the same OSINT-SWEEP document explicitly records: “Wayback/tor2web (.onion.to/.city) = DEAD END: only saved the gateway ‘temporarily not available’ page.” Its preceding list includes ky2khlqdf7qdznac among the archived onion sites. This is an external reported negative, not independently reproduced in our repository. Agent35's later target-specific check of the preserved ky2khlqdf7qdznac.onion.to CDX snapshot found only the root and robots.txt, with no page-59 path. Therefore the generic .onion.to/.city proxy-CDX class is not unexamined; any remaining archival task must name a narrower proxy, URL, or capture not covered by those checks. The [p56 source/hash gate](../../im-results/lp2-p56-hash-2016-signed-tree-source-gate.md) records the earlier runtime's direct CDX-access limitation, not evidence that the external class had never been checked.

The older [OPEN-AVENUES](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/OPEN-AVENUES.md) file is dated 17 June 2026 and still lists independent vision re-transcription as top priority; the later Campaign XV label-free audit is the relevant follow-up, so do not repeat that June recommendation as if it were still untouched. The master-branch ledger is a large external measurement program, not proof that LP2 is literally a one-time pad or that plaintext cannot exist.

### F5 reference toolchain (grayscale-control caveat)

- [`0verkilll/f5`](https://github.com/0verkilll/f5) v1.0.0 provides coefficient-level F5 `embed`/`extract` and an `embed-jar` compatibility path. The latter is **RGB-only**: its `WriteBMP24` path feeds a Java reference encoder whose `JpegInfo.NumberOfComponents` is hard-coded to 3. Do not use `embed-jar` as a one-component grayscale positive control.
- [`0verkilll/jpeg`](https://github.com/0verkilll/jpeg) v1.0.1 has explicit one-component grayscale specs and a grayscale coefficient-encoding path. Its full coefficient-preservation regression covers 4:2:0/4:2:2/4:4:4 but omits grayscale; synthetic grayscale coefficient-encoding tests exist.
- Detailed source-level capability assessment and control requirements: [F5 reference implementation capabilities](f5-reference-implementation-capabilities.md). This is tooling prior art, not an LP2 payload finding.

### Historical onion-hash search tooling

- [martinlindhe/gohash](https://github.com/martinlindhe/gohash): a historical SHA-512 preimage-search tool whose README gives a base32 `.onion` brute-force example. Enumerating all 16-character base32 labels is (32^{16}=2^{80}), not a practical attack. Its bundled [eight-address candidate list](https://github.com/martinlindhe/gohash/blob/master/data/onion-sites.txt) was checked against the AN-END digest using SHA-512, SHA3-512 and BLAKE2b-512 over bare-address and URL forms; no match. This is a historical attempt, not evidence that the full address space was searched.

### Parcae and Rune Decrypter Prime

- [ToldByNun/Parcae](https://github.com/ToldByNun/Parcae): C++20 cryptanalysis toolkit with known-page regression fixtures; the README tutorial demonstrates Atbash on the already-solved “A Warning” page, not an unknown-page decryption.
- [mortlach/RuneDecrypterPrime](https://github.com/mortlach/RuneDecrypterPrime): reusable cipher/key/search framework; no verified unknown-page plaintext or authentic LP2 key surfaced in the inspected material.
- [mortlach/Liber-Primus-Crib-Assist](https://github.com/mortlach/Liber-Primus-Crib-Assist): crib-search tooling, not a recovered solution.

For the detailed claim-by-claim audit, including the unsupported 2026 “dynamic stream / geographic cipher” Reddit claim and the README-only “full translation” repository, see [modern-public-claim-audit-2026-11-11.md](../../im-results/modern-public-claim-audit-2026-11-11.md).


## DyrneCipher/Obsidian-Vault (pinned 17 June 2026)

- [External source revision](https://github.com/DyrneCipher/Obsidian-Vault/tree/f7ee37add470aa296b0ca7d5056dec78d4e3eb04), commit `f7ee37add470aa296b0ca7d5056dec78d4e3eb04`; the publicly advertised `skills/cicada-3301-liber-primus/SKILL.md` lists 150 old OutGuess files, 75 original scans, four historical hex strings, and unverified solver notes.
- **Exact verified duplication:** **150/150** files in `_archive/liber-primus/lp_outguessed/`, all **75** full scans, all **58** unsolved-page scans, and all **six** historical reference files including `byte-strings` have identical Git blob SHA, filenames, and sizes to the already indexed `rtkd/iddqd` collection. **289/289** source corpus objects match. The four cited byte strings are each 512 hex characters; string 4 equals all **256** decoded pp49–51 original numeric-grid bytes under the existing base60 transcription.
- Its separately authored June 2026 notes describe already solved LP1 and p57 text as new “phonetic” discoveries and offer multiple mutually incompatible guessed English headings for original LP2 encrypted pages, with no key selector or held-out reencryption. They provide no independently attributable new LP2 plaintext, original cipher key or continuation. Do not rerun the copied OutGuess outputs or treat its `Key+Invert` heading arrays as historical decryption evidence.
- [Detailed source-key gate and full matching procedure](../../im-results/obsidian-vault-2026-source-key-original-gate.md). New work would require a distinct creator-era source, not this retrospective public mirror.
