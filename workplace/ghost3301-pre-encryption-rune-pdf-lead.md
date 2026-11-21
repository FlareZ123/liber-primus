# gHOST3301's alleged pre-encryption rune PDFs: retrieval gate

**Status:** unverified historical-artifact lead; no PDF recovered, no unknown plaintext recovered, and no change to established results. Keep this in workplace, not results.

## The claim

The 19 August 2019 interview published on 2 September 2019 by Estéban Trujillo de Gutiérrez contains a potentially direct lead. At 24:10, gHOST3301 says he believes a clear text existed as a base/template with encryption layers added. At 24:37, he says he had seen PDFs of the runes, approximately 37 pages, before encryption; he explicitly says he had not seen the original English version. His proposed operation is to convert the runes to English.

- Original interview/transcript: https://therealsamizdat.com/2019/09/02/cicada-files-ghost3301-interviewed/
- Carbon-copy republication (16 December 2020): https://thephoenixenigma.com/cicada-files-ghost3301-interviewed/

The 2020 page identifies itself as a carbon copy of Trujillo's original, so it is not independent corroboration. The audio is embedded/linked from the original interview page. The transcript's wording is ambiguous: "about 37 pages" may describe a partial manuscript or a PDF set, not necessarily a complete 37-page book. It does not identify a filename, sender, date of receipt, page range, hash, or location.

## Evidence assessment

This is a claim about a specific potentially useful artifact, not an authenticated Cicada statement and not a recovered source. The interviewee says he was not an "inside insider" but was close to the group. He says he believed "The Architect" was Ian Murdock based on the person's operating-system knowledge; that is his inference, not independent identity evidence. The interview was explicitly collaborative and reviewed by gHOST before publication, and the interviewer frames it within an anti-Schoenberger ownership/political narrative. These facts lower the prior and create selection/confirmation-bias concerns; they do not by themselves falsify the PDF claim.

An external 23 October 2026 review in pnotisdev/cicada3301 labels the gHOST account "impostor/fiction" and says it has no first-hand LP content: https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/laptop_review/05_cicada_primary.md. Treat that as a useful caution, not a demonstrated disproof. The interview does contain a first-person claim to have seen rune PDFs; what is missing is the artifact or any independently checkable detail. The review does not show that the claimed PDFs were fabricated.

## Work already done and limits

- Read the original interview and its carbon-copy transcript around the 19:35, 24:10–24:55 and 1:13:03 passages.
- Searched the current Liber Primus repository for gHOST, gHOST3301, Dustin757 and howwillyoutelltheworld; no existing record or artifact was found.
- Ran targeted public searches for the exact "37 pages"/pre-encryption wording and for a PDF on the interviewer's site; no copy or identifier surfaced.
- **Wayback site and file-host inventory, 21 November 2026 ([#1886](https://github.com/FlareZ123/liber-primus/issues/1886)):** the [earliest indexed root capture](https://web.archive.org/web/20141207162339/http://howwillyoutelltheworld.wikidot.com:80/) is dated 7 December 2014 and describes a separate *How will you tell the world?* ARG, last edited 20 November 2014. Its two PDF links are identified as 4chan thread archives, not runic drafts. The [19 August 2019 discussion capture](https://web.archive.org/web/20190819134510/http://howwillyoutelltheworld.wikidot.com:80/printer--friendly/talk:start) discusses that ARG's images and audio. A Wayback CDX query of the Wikidot host returned 12 distinct HTTP-200 URL keys, collapsed to one capture per key. A corresponding [file-host index](https://web.archive.org/cdx/search/cdx?url=howwillyoutelltheworld.wdfiles.com%2F*&output=json&filter=statuscode%3A200&collapse=urlkey) returned 53 keys: 49 images, two HTML, one audio and one text; no PDF name or MIME type. No LP2 draft was identified. The CDX responses do not establish every capture or every hosted file; Common Crawl and raw WARC records remain unexamined. The uncollapsed page-version query timed out. These are bounded observations, not evidence the alleged manuscript never existed.
- The interview says gHOST would reach out to resources and send the interviewer a text of the separate puzzle The Message. It does not say that the Liber Primus PDF was sent to the interviewer.

Do not describe this as "the PDF does not exist." The accurate result is: **no public copy or identifying metadata was located in this bounded search.**

## Decisive next action

Stop generic PDF hunting. The highest-value next action is one narrow, maintainer-approved request to the interviewer first: the public interview identifies a direct contact route, and the interviewer had contact with gHOST.

### Verified contact route (18 November 2026)

- The [Samizdat About page](https://therealsamizdat.com/about-samizdat/) identifies Estéban Trujillo de Gutiérrez and says he can be securely contacted through Keybase. Its Keybase link resolves to **[ma91c1an](https://keybase.io/ma91c1an)**.
- The interviewee's public profile under the handle **[ghost3301](https://keybase.io/ghost3301)** is also reachable. This gives the maintainer a concrete route to ask the interviewer to confirm the claim or forward a question to gHOST. These profile handles are contact routes, not independent proof of identity, Cicada membership, or possession of the files.
- The original [2019 interview](https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/) still links no 37-page PDF, filename, or attachment. No message has been sent and no file has been recovered.
- No message was sent in this run. Issue #784 concerns two separate archive-custodian inquiries; it does not itself authorize or prohibit this independent Keybase outreach. Do not cite #784 as a blanket rule for contacting Trujillo or gHOST. Obtain maintainer direction before any account-mediated message.

Suggested request, to send only after authorization:

> Your 2019 interview with gHOST3301 says at 24:37 that he had seen approximately 37 pages of Liber Primus runes in PDF form before encryption. Did he ever send you those files, or give you a filename, page range, date, or contemporaneous message identifying them? If you still have contact, could you ask whether the original files survive and whether he can share the untouched PDFs? I am not assuming the claim is authentic; the aim is to compare the original bytes and page sequence with the canonical 2014 images. In particular, does “before encryption” mean that direct Gematria Primus transliteration is readable, or only that the PDFs represent an earlier encryption stage?

If a reply is obtained, request the original bytes (not screenshots), filename, page count, SHA-256/SHA-512, PDF metadata/producer, creation or receipt date, sender, and the contemporaneous email/IRC/message by which it was shared. Ask whether “before encryption” means unencrypted runic text or merely an earlier stage of the final ciphertext.

The interview's separate constellation comment is not a fresh decoder assignment: the p7/p23/p56 dot geometry and direct p56-cipher transfer have already been tested in [the existing triad report](../im-results/lp2-p7-p23-p56-five-dot-dihedral-triad.md). Do not repeat that work without a new source-selected operator.

## Test if the file is obtained

1. Hash and preserve the untouched file. Record metadata and any embedded text/images before conversion. Compute SHA-512 for the raw PDF and each original embedded page/image payload, and compare each exact byte sequence with the p56 target `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. A match would be decisive; a non-match would not disprove the precursor claim.
2. Determine whether its pages match, overlap, or predate the canonical 58 LP2 pages; establish exact page correspondence rather than assuming the 37-page count maps to physical page numbers.
3. Transcribe the runes from the PDF independently and apply the historically defined Gematria Primus transliteration, including the alphabet's digraph values. Do not tune an alternate alphabet to make it read.
4. If it is genuinely pre-encryption rune text, direct transliteration should produce coherent language without an invented cipher layer. Compare any overlap against solved source text and the canonical LP2 images.
5. If the file is not authenticated, does not match the manuscript, or direct transliteration is not readable, retain it as an unverified derivative and stop. Do not rescue it with arbitrary cipher/key searches.

**Decision:** this is one of the few historical leads with a plausible direct path to plaintext, but its value is almost entirely contingent on recovering the actual file. Until then it is low-priority and blocked on an external holder, not a basis for any cryptanalytic campaign.
