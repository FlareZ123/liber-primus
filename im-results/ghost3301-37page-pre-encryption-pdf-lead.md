# gHOST3301's alleged 37-page pre-encryption rune PDFs

**Status: unverified historical lead; not a recovered artifact, key, or plaintext.** This note records the useful inference and the decision boundary so future work does not repeat broad searches or promote testimony into source evidence.

## What the source actually says

In an interview conducted on 19 August 2019 and published by Estéban Trujillo de Gutiérrez on 2 September 2019, the speaker using the name gHOST3301 says:

- At 24:10, he believes a clear-text base/template existed and that encryption layers were added afterward.
- At 24:37, he says he has **not** seen the original English-before-runes version, but claims to have seen PDFs of the runes before encryption, totalling "about 37 pages"; he says transliteration would expose a message.

Primary transcript: https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/ (24:10–24:37). The page calls the transcript an edited/redacted revision and says it was published with the interviewee's collaboration. It does not identify the PDF's filename, custodian, date, transfer channel, or any attachment.

The Phoenix Enigma page is explicitly a carbon copy of the Samizdat transcript, not an independent witness: https://thephoenixenigma.com/cicada-files-ghost3301-interview/.

## A potentially important page-count alignment

The local source archive contains 75 numbered page images, `00.jpg` through `74.jpg`. The standard breakdown is 17 LP1 pages followed by 58 LP2 pages. Under that ordering:

- The latter 37 pages of the 75-page book are image indices `38–74` (37 pages).
- Those correspond to LP2 pages `21–57`.
- That subset contains LP2 p21–55 (35 currently unsolved pages) plus the known p56–57.

This is a **testable interpretation**, not proof that the alleged PDFs cover those pages. It does, however, make the interview's "about 37 pages" compatible with the separate "second half" claim discussed below. If "second half" instead means half of LP2 alone, the expected count is 29, not 37.

## Related "second half in clear text" report — not independent confirmation

At about 51:08 in the same interview, Trujillo reports that Defango told him he recovered deleted files from a Macintosh used by Linda and that those files contained the second half of Liber Primus in clear text. gHOST does not authenticate that recovery in the exchange; he says he can reach out to resources. A 17 October 2019 blog post repeats Trujillo's account, but it is still Trujillo reporting what Defango told him, not a recovered file or an independent witness: https://trackingmeroz.wordpress.com/2019/10/17/playing-us-false-the-ventriloquist-of-cicada-3301/ (section "Thomas Schoenberger vs Manual Chavez III").

The two claims could refer to the same latter 37 pages of the 75-page book, but the public material does not establish that connection. Do not count them as two corroborating sources.

## What has and has not surfaced

The 2019 public interview is a report of a file that an interviewee says he once saw, not the file itself. Earlier exact-phrase searches and the community archive census are preserved below; no such 37-page source file has been recovered.

### Publication-side media audit, 15 November 2026

The exact contemporaneous post is [the Samizdat 30 August 2019 permalink](https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/). It identifies the 19 August interview, states that its 17,466-word transcript was revised 1 September and published with the interviewee's collaboration 2 September, and contains the original spoken PDF claim only at 24:37. **The public article exposes no link ending in PDF and no named pre-encryption rune file, download, transfer code or attachment to that claim.** Its media pointers are specific and distinguishable:

| Original-post object | Exact public target or embedded identifier | Relation to alleged precursor |
| --- | --- | --- |
| Interview audio | WordPress SoundCloud embed of `https://api.soundcloud.com/tracks/674256992` | Interview recording; the post explicitly offers audio, not source-page PDFs |
| Interviewee's earlier video | `https://youtu.be/LNx5CM6aQQM`, dated 27 May 2019 | YouTube discussion, not a linked PDF set; external video details were inaccessible |
| Earlier book-cover illustration | `https://therealsamizdat.com/wp-content/uploads/2019/07/cicada-liber-primus-lestat-book-cover-july-4-2019.jpeg` | A book-cover JPEG with July 2019 filename, not the claimed 37-page PDF |
| Solved-page illustration | `https://therealsamizdat.com/wp-content/uploads/2019/07/cicada-wiki-p.-56-decrypted-may-2014.jpg` | Explicitly a known solved-p56 image, not pre-encryption unknown plaintext |
| Separate copyright document illustration | `https://therealsamizdat.com/wp-content/uploads/2019/08/cicada-3301-copyright-research-report-sony-levine-lech-compumark-p.4.png` | A PNG labelled copyright report page 4, not a Liber Primus precursor |
| Separate music-puzzle video image | `https://videos.files.wordpress.com/iWLTHkx4/gh0st3301-the-message_std.original.jpg` | Named illustration for a distinct “The Message” audio/video |
 
The Samizdat article explicitly states that the interviewer provides **audio and transcript** rather than a video interview, and never says the alleged LP precursor was sent to him. Existing and newly inspected post links are consistent with that limited publication claim. They do not prove no private or subsequently removed PDF existed.

The following potential independent retrieval surfaces were **not successfully accessible** through available tools and must not be counted as completed negative archival searches: WordPress `/wp-json/wp/v2/posts?slug=...`, WordPress.com public posts API, 2019 Wayback snapshot, and Wayback CDX. External SoundCloud, YouTube, WordPress image URLs also produced cache-miss fetches; their documented target identifiers came from the article's actual linked HTML. No original media bytes or revision history were obtained, and no file SHA-256 can be asserted. A working 2019 revision capture or WordPress media-attachment API response is still an unresolved retrievability question.

### Existing prior-art census

- Earlier targeted exact-phrase and variant searches returned the Samizdat interview and its carbon-copy repost, with no independent file witness or original filename.
- The public `cicada-solvers/The-Complete-Cicada3301-Archive` tree (1,455 paths) contains the standard 75-page image set, a history document, and community-made overlays; it does not expose a distinct pre-encryption 37-page PDF: https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/tree/main/2014/Liber%20Primus.
- The 2020–21 37-page “The Mayfly” community analysis is a later, unrelated illustration report.
- The interviewee's asserted proximity to Cicada is contested, including a contrary quote on [Samizdat, 12 September 2019](https://therealsamizdat.com/2019/09/12/cicada-files-schoenberger-1/); that dispute neither validates nor refutes possession of the PDF.

## Solve-path hypothesis and decisive test

A human solver hearing "37 pages of runes before encryption" would reasonably ask for the actual file or the message/transfer by which it was shared. The exact result that would distinguish a real precursor from a story is an original file (or contemporaneous attachment) whose bytes, metadata, and page sequence can be preserved and compared with the published manuscript.

If the file is obtained:

1. Freeze its bytes and metadata; do not re-save or OCR it before hashing.
2. Compare its page count, ordering, headings, illustrations, and rune text against the original 75-page scan set. Specifically test whether it maps to image indices 38–74 / LP2 p21–57.
3. If it is genuinely pre-encryption rune text, transliterate with the published Gematria Primus mapping while preserving one-rune digraphs and page/line boundaries. Require coherent text across the complete claimed subset, not selected passages or manually tuned corrections.
4. Compare any plaintext against the extant ciphertext and known p56–57 text. A page-aligned, reproducible relationship would identify which encryption layer was added after the precursor; a loose thematic resemblance would not.

**Best next action:** obtain the actual PDF, its original filename, or the contemporaneous email/IRC/file-transfer reference from the interviewee or interviewer. Further broad web searches are lower value until one of those source identifiers is available. No cipher/key test should be built from the interview alone.
