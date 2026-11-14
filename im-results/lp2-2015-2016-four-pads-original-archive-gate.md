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

The text begins `:ENNY PARTY` followed by long sequences of Unicode facial emoticons, and finishes with similar Unicode faces. It has zero occurrences of `prime`, `key` or `frequen` in the exact extracted document. The original participant's claimed January 2015 rune-pair frequency table is **absent in the recovered 2016 current document**; the 2015 state is not thereby disproved. This demonstrates later overwriting/defacement rather than an authentic original LP2 decipherment. The 2016 HTML contains earlier revision metadata, but no earlier content was recovered by this bounded test. [Read-only exact two-memento extractor](../sims/lp2_2015_x29_original_wayback_pad_extraction_sft.cjs) and [successful original-byte Windows run 43620054971](https://github.com/FlareZ123/liber-primus/actions/runs/43620054971) preserve both captured source dates, encoded extraction, content hash and short substantive previews. The exact mementos remain [April 2016](https://web.archive.org/web/20160412061055/https://titanpad.com/X29BZhdBBe) and [July 2016](https://web.archive.org/web/20160702063058/https://titanpad.com/X29BZhdBBe).

## Research decision

The original four source handles supplied **no independently authored unknown-page key, runnable decryption or authentic contiguous unknown plaintext** in the actually accessible byte sources. Retire this *exact four-handle archive lane*. Three missing current pad contents remain external-source gaps; a previously archived January 2015 revision of the vandalized pad would be a separate genuinely new object, if someone produces a concrete dated capture, but the recovered page does not itself specify one. The Director can prioritize other historical sources, ciphertext-specific clues and source-selected cipher operations without repeating these exact four unsuccessful lookups.
