# Exact 22 Jan 2015 TitanPad saved-revision retrieval for the overwritten LP2 pair-frequency workpad

**Agent1, 14 November 2026; Director task #925.** Original 2016 archived HTML preserves three exact **2015 saved revision identifiers**, but their **text bodies are absent from every tested exact saved-view/export archive endpoint**. No key, unknown-page plaintext or separately runnable rule was recovered. This is an exact historic-data availability result, not a cipher failure.

## Historical source object and the important timing

The preserved 2015–16 `#cicadasolvers` record at **L79394** has `juliusceasar` posting `https://titanpad.com/X29BZhdBBe` on **22 January 2015 at 17:13 UTC**, explicitly as a **rune-pair frequency table** for LP2 pp0–56. The two actually recovered root-page Wayback HTML captures from **12 April 2016 06:10:55 UTC** and **2 July 2016 06:30:58 UTC** both contain a 43-item `initialRevisionList`, whose earliest actual source-saved entries are:

| Saved original ID | Claimed original timestamp | Relation to first-person IRC announcement |
| --- | --- | --- |
| `N6t59CKTj7` (revision 1) | 22 Jan 2015 **16:13:06 UTC** | 59 minutes before the 17:13 post |
| `lMfDxJwCBo` (revision 2) | 22 Jan 2015 **16:16:40 UTC** | 56 minutes before the 17:13 post; latest saved version before the documented announcement |
| `wzRESlRFeI` (revision 3) | 22 Jan 2015 **17:36:41 UTC** | 23 minutes after the 17:13 post |

The 2016 HTML preserves the **names and dates of original saves**, and its visible current text is a later 13,264-character emoji/vandalism string with original reconstructed SHA-256 `9b3c32ecd1d703876be7165f54abc2afca35248025d6746fd52254901b242741`. It does **not** preserve the earlier rune-pair spreadsheet contents as a readable `initialAttributedText` body. The two current-root captures and exact time/source attribution were independently established under [Director #915](lp2-2015-2016-four-pads-original-archive-gate.md).

## Exactly bounded source-object requests

The **three saved revision tokens above were frozen before any candidate URL retrieval**, using a historically documented native Etherpad `/ep/pad/view/<padId>/<savedRevision>` endpoint and `/ep/pad/export/<padId>/<savedRevision>?format=txt` export endpoint. Each version was tested at its own original 2015 timestamp and at the known 12 April 2016 Wayback capture, **without inspecting other pad handles or scanning arbitrary versions**.

For each of the three exactly named IDs, actual original-target requests produced:

| Scoped endpoint | Revision 1 | Revision 2 | Revision 3 |
| --- | --- | --- | --- |
| `archive.org/wayback/available` for full saved-view URL and Jan2015 date | HTTP 200 JSON **empty `archived_snapshots`** | same | same |
| Wayback exact saved-view CDX `filter=statuscode:200` | HTTP 200 **`[]`** | HTTP 200 **`[]`** | HTTP 200 **`[]`** |
| 2016 preserved snapshot, original HTTPS saved-view | HTTP **404** Wayback absence page | HTTP **404** | HTTP **404** |
| 2016 preserved snapshot, HTTP saved-view spelling | HTTP **404** | HTTP **404** | HTTP **404** |
| 2016 preserved snapshot, `?pt=1` plain-text view | HTTP **404** | HTTP **404** | HTTP **404** |
| 2016 preserved snapshot, original saved-text export | HTTP **404** | HTTP **404** | HTTP **404** |
| 2016 preserved snapshot, `rev.<id>` saved-text export spelling | HTTP **404** | HTTP **404** | HTTP **404** |
| `archive.org/wayback/available` exact export URL | HTTP 200 JSON **empty snapshots** | same | same |
| Exact export CDX 200 index | HTTP 200 `[]` | transient **`fetch failed`** | HTTP 200 `[]` |

The transient second export-CDX failure is **not evidence of an absent record** for that endpoint. However, its separate exact export `available` check returned empty snapshots, the 2016 fixed memento returned 404, and the exact original saved-view CDX returned `[]`. Therefore no original 2015 saved text is accessible from the **listed tested endpoints**. Archived-root HTML being 200 in #915 does not imply that the **distinct saved revision URL** was itself crawled.

The view/export route syntax is grounded in publicly documented pre-2015 Etherpad API usage, including `/ep/pad/view/padId/latest?pt=1` and `/ep/pad/export/padId/latest?format=txt`, with a saved identifier replacing `latest`. Whether TitanPad's own 2015 deployment used the saved ID as a compatible `rev` endpoint token is **not independently demonstrated** from the surviving metadata; that caveat is another reason this negative is strictly a *URL acquisition boundary*.

## Exactly reproducible scope and next fork

The independent source-locked [single-file Node22 CommonJS retrieval](../sims/lp2_2015_etherpad_x29_three_rev_acquisition_sft.cjs) fixes all three original ID/date pairs, emits each exact request URL, response status, final URL, response byte size, SHA-256 and whether genuine original document text was returned. No untrusted remote code or `.bin` program was run. Both successful manual action runs record the 3×5 original view/URL and 3×4 export/URL outcomes:

- [Original saved-view three-revision test, CI 43622275201](https://github.com/FlareZ123/liber-primus/actions/runs/43622275201).
- [Follow-on exact historic export routes, CI 43622425632](https://github.com/FlareZ123/liber-primus/actions/runs/43622425632).

**Conclusion for #925:** Retire the source-addressed January 2015 revision recovery at these exact links unless an independent archival snapshot or TitanPad server-side backup of the saved revision bodies is produced. The source **does establish a participant-authored LP2 pair-count document before the January 2015 message**, but no actual original pair-count table, key material or decryption exists in the accessible saved bodies. Applying the 100-rune plus 40-rune held-out inverse would require inventing both the missing saved body and the cipher operation, so was correctly not attempted. Continue independent original-cipher and source-visible route selection.
