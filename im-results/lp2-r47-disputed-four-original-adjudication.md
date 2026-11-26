# Round47 four-site original JPEG adjudication (#2982)

## Result and scope

All four disputed canonical glyph labels are supported by the original 2400×3600 JPEG pixels, using a separate native-resolution source template comparison trained only on solved p56's 84 ordinary glyphs. No new ciphertext correction is supported. In particular, 9877 is pixel-identical at grayscale threshold 128 to an independently labeled D control from solved p56, and distinct from its immediate M neighbor. This narrows the remaining R47 uncertainty without repeating the #1178 whole-book experiment. The requested two new independent blind human/vision reads are **not completed**: both worker dispatch attempts returned UNAVAILABLE (MCP SSE probe 404). The blind deck is published without labels for future readers. No reader answers invented, and no canonical changes made.

## Offset reconciliation

Read the four positions from pinned [R47/T2 results](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round47/T2-transcription-closeout/RESULTS.md). The external zero-based gpos and gline conventions match local `resources/liber-primus/lp2-transcription.txt` after splitting by % and /, dropping non-runes and the physical p50 numeric plate. Verified 12,956 unknown-page runes and 594 rune-bearing lines. The four gpos, gline and within-line indices exactly match external reported values. Source file number = physical LP2 page +17.

| gpos | gline:j | physical p / source JPEG | local line | original crop x,y,w,h | solved-only top match | runner-up |
|---:|---|---|---:|---|---|---|
|276|12:14|1 / 18.jpg|0|1262,673,35,114|A .93271995|O .89064264 (AE .85811967)|
|5054|232:18|20 / 37.jpg|9|1445,2367,34,115|TH .97940075|W .74513078|
|6054|277:21|25 / 42.jpg|2|1610,1050,34,114|AE .97398841|A .85853660|
|9877|455:6|41 / 58.jpg|0|914,673,53,114|D 1.00000000|M .75836974|

The 37.jpg and 42.jpg rows each have one touching glyph pair before the target, so component numbers are 17 and 20 respectively, not the glyph indices 18 and 21. The source row match was checked against all surrounding detected ordinary labels, not by assuming every connected component was a rune.

## Exact D/M witness

- Target 9877: original 58.jpg crop (914,673,53,114), 3,072 ink pixels. 
- Solved D control: original 73.jpg crop (976,861,53,114), also 3,072 ink pixels.
- Both 114×53 binary mask arrays compare equal element-for-element, SHA-256 of NumPy bool array bytes `cdf66dabb82f7894ba965e73c60f5724784d646c8604d63b14f6c2cbad4e39df`.
- Adjacent actual M at 9876: original 58.jpg (855,673,53,114), 2,968 ink pixels, mask SHA-256 `6d10dbde3932f589e3eec94c140c0f80f143d1f3be60082fa903effb2e3e1c8e`. Distinct mask, independently labeled M with IoU 1.0 against a p56 M exemplar.
- Other D controls: gpos280 (prior R47 reader error), gpos9881, gpos9883 each label D .98134446 versus M .75836974.

The matching method preserves native width and height, centers each binary mask in a 128×136 canvas and takes maximum IoU across all p56 templates of each label and shifts ±2 pixels. Unlike the previous external blind reads, this uses the repository's original JPEG pixels, rather than a relikd re-render. It is a source-pixel check, not independent human perception. There is no need to use the ciphertext doublet-suppression prior in this decision. The exact equal mask means the M reading of this particular glyph would also entail reclassifying an identically printed solved D. The solved p56 ciphertext and its known-answer interpretation are independent of these four unknown glyphs. This is strong evidence for retaining D, not a new decryption.

## Frozen blind deck

[PNG base64, frozen before any reader dispatch](https://github.com/FlareZ123/liber-primus/blob/473f5d7a273c641053d107edf6b14fc908455e45/im-results/lp2-r47-blind-deck-2982.png.b64), decoded SHA-256 `7570b4125f4dbaae12c96b0dbe4c3f53e455f47a780e2f2bfdcfec179f286ec2`. The fourteen crops are thresholded at 128 without any scaling or neighboring symbols and opaque IDs are the only labels printed. Four targets, four matched additional originals and six solved control exemplars. Workers should receive only the frozen deck and generic GP29 recognition instructions; no report or positions. Ask for 01–14 label plus confidence and do not disclose identities until two separate responses are frozen. Sealed answer key is intentionally omitted here. For independent reader grading, Agent2 retains the deck map in its own local work until responses can be obtained; do not treat any later unblinded read as satisfying the test.

Reproducer: `sims/lp2_r47_disputed_four_sft.py`, local prototype run against supplied original JPEG ZIP, source-coordinate checks, all 29 solved templates. The committed narrower standalone implementation has not yet been independently run. The prior #1178 full original-source recognition already agrees with all 12,956 canonical runes; the new result is the specifically targeted original-versus-render comparison and exact D control identity. Keep issue open for its explicit two-reader requirement.
