# Original May 2014 LP2 solver pad: five recovered 2016 snapshots

**Agent8, 14 November 2026. Classification: recovered period-origin solver research corpus, no unknown plaintext or p56 destination.** A participant's original **3 May 2014** forum message identifies the exact Liber Primus collaboration pad. A source-pinned lookup found **five archived HTTP-200 copies dated April–July 2016**; subsequent byte-level replay confirms that the preserved HTML contains the group's actual transcription and discussion, including the original p56 solution. This is useful recovered historical context and a future source-acquisition handle. A 2016 archive date does **not** authenticate that every line of this mutable document existed in May 2014.

## Original historical locator and dated participant context

The [restored Unfiction topic *CICADA 3301 2014 IS BACK*](https://forums.unfiction.com/forums/viewtopic.php%40p%3D1038407.html) reproduces two direct participant posts by `bambusar`:

- **3 May 2014, 05:54** (forum-display time; timezone unverified): newly distributed 58 Liber Primus pages, the original image gallery, the live collaboration document `http://titanpad.com/vFCy7T5p0O` and Freenode channel `#cicadasolvers`.
- **18 May 2014, 01:34:** the poster's assessment that 57 pages remained encrypted. This is not a census of all solvers.

The pad identifier is exactly **ten characters**: `vFCy7T5p0O`. The known image distributor `ky2khlqdf7qdznac.onion` has a different role from the deep-web page whose digest is printed in solved p56. The Titanpad collaboration URL is likewise neither an onion target nor a demonstrated p56 preimage.

## New archive records and byte replay

Using only the first-party, dated forum locator, [the Windows Node22 exact-source CDX SFT](../sims/lp2_2014_titanpad_cdx_source_sft.cjs) retrieved **five Internet Archive records** for `https://titanpad.com/vFCy7T5p0O` between April and July 2016. Each has original HTTP status **200**, MIME type `text/html`, and its own CDX SHA-1 digest:

| UTC archive timestamp | Original indexed length (bytes) | Original CDX digest (base32 SHA-1) |
| --- | ---: | --- |
| 2016-04-11 19:14:58 | 34,850 | `PN74KE3GRKDJMMQ2STNIHNIQ3OST3TTD` |
| 2016-04-12 03:30:34 | 34,852 | `GZBIPXZSYR7RDIOW2FMQF6H6DQ2QXY3H` |
| 2016-04-12 06:14:15 | 34,853 | `NZWNQAPWIZ6S7SAWP3M2M722ACLON53Z` |
| 2016-04-12 06:36:58 | 34,861 | `QHPWKLPPCB72ZNORBZ2MZKB3356YEH46` |
| 2016-07-02 00:29:13 | 38,650 | `R27NC5RGYGJGIT6BAA6R4TAUZ3KQHJPY` |

[Indexed source search CI success](https://github.com/FlareZ123/liber-primus/actions/runs/43593000416). Arquivo.pt's exact-page 2014–16 query returned HTTP200 with zero records; the **separate 2014 `publico.pt` positive control** returned a valid 2014 archive record. Common Crawl checks reached explicit 404 and transport errors, so they are inconclusive as an inventory. This is a specific retrieval result, never evidence of general archive absence.

[The independent replay SFT](../sims/lp2_2016_titanpad_wayback_replay_sft.cjs) requests each indexed snapshot via the preserved `id_` replay route. [Windows CI 43593326395](https://github.com/FlareZ123/liber-primus/actions/runs/43593326395) successfully replayed **four** responses (the fifth timed out), including 92,093-byte April HTML and 106,562-byte July HTML. [Repeat CI 43593572754](https://github.com/FlareZ123/liber-primus/actions/runs/43593572754) retrieved all **five** but an unrelated, separate redundant follow-up step timed out. [Consolidated context CI 43593808009](https://github.com/FlareZ123/liber-primus/actions/runs/43593808009) passed, confirming the four April 12/July 2 content-bearing snapshots.

**What is recovered:** the replayed HTML is the actual editable pad page, with original GP29 transliterated source across the 58-page manuscript, commentary, and the historical source-known p56 plaintext. Each successfully replayed page contains the exact leading `36367763ab73783c7af28444` p56 digest bytes, `AN END`, `THE DEEP WEB`, `page 56`, and the solver attribution `cluosh`. It explicitly says the solver shifted runes by the successive-prime totient stream `(primes sequence, mod-29) -1`, followed by the printed translated p56 message. On all four context-extracted snapshots, **zero literal `[a-z2-7]{16}.onion` strings** were found. No new author-signed URL, original target response, p56 hashing algorithm/byte contract, actual unknown LP2 plaintext or key was established. The retrieved byte lengths need not equal the CDX indexed lengths because raw `id_` replay may include archive reconstruction differences; their successful receipt and meaningful content are independently established, but **no claim of exact original 2016 HTTP wire-byte identity is made**.

For direct human inspection, the [3:30 UTC April 12 archived pad](https://web.archive.org/web/20160412033034/https://titanpad.com/vFCy7T5p0O) and [2 July 2016 archived pad](https://web.archive.org/web/20160702002913/https://titanpad.com/vFCy7T5p0O) have exact original snapshot URLs. The source-pinned reproducer extracts surrounding p56/digest contexts and original `clientVars`/chat material from the same fetched body without arbitrary URL enumeration. Do not confuse this 2016 surviving editable state with proof of a fully preserved May 2014 revision or with an original participant IRC log.

## Embedded original chat: a preserved 2016 crib hypothesis, no early 2014 discussion

The [source-pinned chat-entry extractor](../sims/lp2_2016_titanpad_wayback_replay_sft.cjs) parsed JSON `time` / `userId` / `lineText` messages embedded in the replayed pad HTML on [successful Windows run 43594389204](https://github.com/FlareZ123/liber-primus/actions/runs/43594389204). Each April snapshot carries **21** messages dated **3 March–8 April 2016**; the July snapshot carries **27** messages dated **22 May–1 July 2016**. No captured embedded message dates to May–August **2014**. This proves a **chat-history window limitation**, rather than the absence of the original 2014 conversation from all services or archives.

One new, exact period-user hypothesis survives in the July 2016 chat at original millisecond timestamp **1463897861205**, i.e. **22 May 2016 07:37:41.205 UTC**:

> Since the first 2 words of page 56 translates to "AN END", I believe the fist 2 words of page 54 are : "A BEGINNING", try to find the key or some pattern that decode "A / M-NG-D-IA-TH-X-I-M" to "A BEGINNING"

This is a **2016 participant's proposed crib**, with an explicit encrypted word spelling and plain-English guess. It is **not an author-authenticated instruction, a solved page, or evidence for a cipher**. It can be tested only against the original GP orthography, exact first-word segmentation and a genuinely constrained inverse, rather than by fitting an unrestricted key to a conjecture. No original p56 continuation URL or 2014 IRC provenance is supplied by this chat. The July archive preserves the proposed crib verbatim, allowing later independent study without relying on modern hearsay.

## Decision on the 2016 `A BEGINNING` crib

The participant's phrase is a **falsifiable guess**, not a known plaintext. The exact first two original p54 words are `ᚪ / ᛗᛝᛞᛡᚦᛉᛁᛗ`: one rune followed by eight, with the latter's first and last ciphertext symbols both M. Solved LP1 p10–p13 and clear LP2 p57 use ᛝ for **ING** as well as NG, giving the source-calibrated English GP word **BEGINNING** as `ᛒᛖᚷᛁᚾᚾᛝ`, **seven** runes. Therefore the original p54 eight-rune word cannot be that source-calibrated spelling under a one-to-one symbol-preserving cipher (including the solved p56 prime-totient model). The older inventory-token spelling `ᛒᛖᚷᛁᚾᚾᛁᛝ` is **eight** runes, so matches length, but its repeated N at positions five and six would have to map to two *different* original ciphertext runes (TH and X). That defeats **any fixed deterministic substitution** for the older spelling, even with an entirely unknown alphabet. The original word's M…M bookends also prevent a bijective stationary substitution from encoding the distinct B and NG ends.

A narrowly source-motivated candidate **variable-length** transport would insert one extra rune for the **N N** plain doublet, restoring the red heading's eight positions. The [original-word-length grammar gate](lp2-original-wordlength-grammar-mi.md#doubled-plaintext-rune-escape-original-word-order-gate-14-november-2026) tests exactly this rule on 15 independent native-English windows: all retain strong ordered-word-length grammar (minimum z +5.35), unlike the original ciphertext (z +0.52). Thus an isolated p54 length coincidence does not rescue an unpermuted ordinary-English whole-book decoder.

Neither case excludes a changing/position-keyed encryption, an alternate orthographic choice, a variable-length transport paired with reordering or boundary changes, or a different heading. These constraints are specifically on the conjectured phrase and mechanism, not an exclusion of unknown-page English. The [exact original-cipher SFT](../sims/lp2_2016_beginning_crib_source_native_sft.cjs) reads the canonical corpus, original rendered-word transcription, and independently calibrated source encoder. **No authentic p54 plaintext or key follows from this 2016 chat.**

## Research decision and next operation

The historical pad is **recovered as a bounded document**, replacing the previous false assumption that only its URL survived. It is the best concrete newly acquired period-origin solver context from this invocation; nonetheless its p56 annotations only confirm a solution already independently known. The original May–August 2014 `#cicadasolvers` logs have since been recovered and SHA-1 authenticated ([source register](../resources/external/2014-cicadasolvers-freenode-log-corpus.md)). Their exact original pad-link context, plus public two-pad revision and archive acquisition, are now separately evaluated in [the consolidated 2014 history gate](lp2-2014-two-titanpad-revision-history.md). The acquired logs do **not** supply the missing original 2014 pad revision. Only a newly source-dated original export, backup, digest preimage or explicit cipher instruction would change this decision. Do not repeat old 2016 replays or infer preimages from numerical speculation.

The unchanged solved p56 target hex is `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. The 2016 pad repeats this target without identifying its preimage.
