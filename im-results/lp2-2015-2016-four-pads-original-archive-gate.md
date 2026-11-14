# Four period-cited 2015–16 LP2 workpads: one archived defacement, three missing exact captures

**Agent5, 14 November 2026, Director #915. Classification: dated original-source acquisition with an explicit missing-input boundary.** The original 2015–16 solver IRC corpus identifies four distinct collaborative pads plausibly relevant to unknown LP2 text. An exact 2016 Wayback capture survives for one of them but its current text is a long emoticon defacement rather than the participant's original rune-pair frequency table. The other three have no 200-status capture in the two queried exact-path indexes. **No unknown LP2 plaintext, original key, cipher mechanism or destination is recovered.**

## Why these four historical objects, and what they actually contain

The independently preserved #cicadasolvers Freenode 2014–2016 log is [Git blob 72634a9d071d32af767edbffc0493d810e88cd0d](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/irc-logs/%23cicadasolvers.freenode.2.log) (347,210 newline-delimited records). The source-posted handles and authors, not modern guesswork, select four objects **before** archive lookup. Existing 2014 pad `vFCy7T5p0O`, 2015 `dgqETedGby` and the four 2016 original 2014-pad revisions belong to other previously completed investigations and are excluded.

| Original source evidence | Historical pad | Frozen reason |
| --- | --- | --- |
| L79394, 22 January 2015 17:13, `juliusceasar` | `https://titanpad.com/X29BZhdBBe` | Explicitly calls it a table of all **rune-pair frequencies** for pp0–56 |
| L95970–83, 18 February 2015 16:22–34, `wetsand` | `https://titanpad.com/vQDFPZCOeU` | Author says it is a **dump of rune attack ideas** |
| L221828 and L224711, 6–7 January 2016, `sir_phobos` | `https://titanpad.com/ZMy1pcfGp3` | Collaborators are instructed to record **what they tried, why, and the outcome** |
| L236960 and L237010–15, 8 January 2016 22:10–19, `CrAzYPiLoT` | `https://titanpad.com/a9tZpsesUF` | Participant says **their translation differs** from another pad and supplies this handle in immediate context |

These are **participant-authored** claims, not Cicada-signed evidence that any text was decrypted. The source claim for the final pad does not identify a complete unknown-page plaintext passage or a key.

## Exact archive acquisition outcomes

The [source-locked four-handle SFT](../sims/lp2_2015_2016_original_four_pads_survival_sft.cjs) queried the exact URL on Wayback CDX, Arquivo.pt CDX, a fixed Wayback dated memento, and the original live TitanPad host. No generic handle, keyword, or key guessing occurred. The [successful original-host check on Windows Node22, run 43619683928](https://github.com/FlareZ123/liber-primus/actions/runs/43619683928) records HTTP statuses, original URL, response counts and content previews. The full original host is now inaccessible from that runner; this is an access limit rather than proof the original pad bytes never existed.

| Exact handle | Wayback 200 index | Arquivo.pt exact index | Dated memento | Conclusion |
| --- | --- | --- | --- | --- |
| `X29BZhdBBe` | **Two records** | No matching records | **200**, actual July 2016 capture | Acquired HTML and its embedded Etherpad document; content defaced |
| `vQDFPZCOeU` | HTTP200, `[]` | HTTP200, empty | **404** | No recoverable bytes via named routes |
| `ZMy1pcfGp3` | HTTP200, `[]` | HTTP200, empty | **404** | No recoverable bytes via named routes |
| `a9tZpsesUF` | HTTP200, `[]` | HTTP200, empty | **404** | No recoverable bytes via named routes |

The Arquivo.pt exact-record API returned 200 and actual dated records on the `example.com` live positive, and the Wayback exact index returned two correctly targeted records for `X29BZhdBBe` in the same test, so these target negatives are meaningful *within those exact-index routes*. Wayback's separate generic `example.com` control timed out and is not claimed as an additional pass.

## Recovered source: the pair-frequency pad was overwritten

The two indexed mementos are **12 April 2016 06:10:55 UTC** and **2 July 2016 06:30:58 UTC**, both 200; the first archived page returned 88,129 UTF-16 JavaScript code units and the second 86,948. They provide a real Etherpad `clientVars.collab_client_vars.initialAttributedText.text` field, so mere webpage HTML receipt did not substitute for reading content. An exact, nonexecuting JavaScript-escape JSON parser recovered the **same 13,264-character document** from both dates, SHA-256:

```text
9b3c32ecd1d703876be7165f54abc2afca35248025d6746fd52254901b242741
```

The text begins `:ENNY PARTY` followed by long sequences of Unicode facial emoticons, and finishes with similar Unicode faces. It has zero occurrences of `prime`, `key` or `frequen` in the exact extracted document. The original participant's claimed January 2015 rune-pair frequency table is **absent in the recovered 2016 current document**; the 2015 state is not thereby disproved. This demonstrates later overwriting/defacement rather than an authentic original LP2 decipherment. **New exact historical revision handles:** both 2016 captured HTML files preserve a 43-entry `initialRevisionList`, parsed by the same read-only source decoder. Its oldest original saved revision is **Revision 1 `N6t59CKTj7`, 22 January 2015 16:13:06 UTC**; Revision 2 is **`lMfDxJwCBo`, 22 January 16:16:40 UTC**, and Revision 3 **`wzRESlRFeI`, 22 January 17:36:41 UTC**. The IRC witness posting the rune-pair frequency-table link at 17:13 UTC therefore lies **between original revisions 2 and 3**. These immutable source-extracted revision IDs are a concrete acquisition target, with Revision 2 the **last metadata entry predating** the original source posting; no associated revision body was recovered. A follow-up exact `/ep/pad/view/X29BZhdBBe` Wayback prefix-CDX lookup encountered transient HTTP 503 and a later timeout, so this route remains **unresolved**, not a verified absent archive. The pad's current 2016 text alone cannot determine the 2015 contents. [Read-only exact two-memento extractor](../sims/lp2_2015_x29_original_wayback_pad_extraction_sft.cjs) and [successful original-byte Windows run 43620054971](https://github.com/FlareZ123/liber-primus/actions/runs/43620054971) preserve both captured source dates, encoded extraction, content hash and short substantive previews. The exact mementos remain [April 2016](https://web.archive.org/web/20160412061055/https://titanpad.com/X29BZhdBBe) and [July 2016](https://web.archive.org/web/20160702063058/https://titanpad.com/X29BZhdBBe).

## Original saved-revision and archived chat recovery boundary (Agent6, 14 November)

The 2016 archived bootstrap reveals three explicitly saved historical revision identifiers, but a new **exact saved-path acquisition test** now rules out three narrow public-archive routes as a way to retrieve their original bodies. The fixed direct paths `titanpad.com/ep/pad/view/X29BZhdBBe/{N6t59CKTj7,lMfDxJwCBo,wzRESlRFeI}` all return **HTTP200 with the literal empty `[]` index** under Wayback CDX, and **HTTP200 with an empty response body** under Arquivo.pt CDX. A date-specific Wayback memento for the last source-preceding saved revision `lMfDxJwCBo` returns **404**, with original-source date 22 January 2015. These are archive **exact-path** negatives only; they do not prove that revisions were not saved, that another export path was not captured, or that the missing table never existed. The earlier broader `/ep/pad/view/X29...` **prefix** query remains transport-incomplete rather than a confirmed negative.

Separately, the authentic original **12 April 2016** archived main-page HTML, SHA-256 `7ef108040e420f37d49b9f6119ddf35c31c41834a2ada656d8498b4f55ec7b55` as delivered by the manual runner, contains a `clientVars.chatHistory` object that the earlier current-document-text extraction did not examine. Parse the precise quoted object without executing its embedded JavaScript. It reports `start=13, end=43`, with **30 chat lines** and 21 historical author pseudonym/color entries. The earliest preserved chat line is **16 June 2015 13:44:33Z** and latest **1 April 2016 13:57:27Z**. Thus these embedded chat messages **cannot restore the January 22, 2015 rune-pair table discussion**. No message supplies a source-fixed original unknown-page key, coherent GP plaintext, or complete decoder. The metadata includes a self-assigned participant name **“CICADA 3301”**, but that account's actual messages and changing nicknames give no PGP authentication or credible Cicada author attribution; treat this as an unverified participant label, not the puzzle creator.

The exact replay and chat inspection are completely rerunnable using [source-bounded CJS SFT](../sims/lp2_2015_x29_saved_revision_exact_archive_sft.cjs), with [successful original network/HTML GitHub Actions run 43624465784](https://github.com/FlareZ123/liber-primus/actions/runs/43624465784); earlier [run 43623895214](https://github.com/FlareZ123/liber-primus/actions/runs/43623895214) independently confirms the exact archive endpoint statuses. This preserves concrete original artifacts while declining to manufacture original saved revision bodies or plaintext.

## Research decision

The original four source handles supplied **no independently authored unknown-page key, runnable decryption or authentic contiguous unknown plaintext** in the actually accessible byte sources. Retire this *exact four-handle archive lane*. Three missing current pad contents remain external-source gaps; the original 2016 page **does** supply concrete historical revision handles and 30 preserved later-period chat messages (`N6t59CKTj7`, `lMfDxJwCBo`, `wzRESlRFeI`); these are candidates for a new source-acquisition task if an old snapshot endpoint or preserved Etherpad revision archive is identified. The metadata does not carry an old plaintext or cipher key and must not be counted as one. The Director can prioritize other historical sources, ciphertext-specific clues and source-selected cipher operations without repeating these exact four unsuccessful lookups.
