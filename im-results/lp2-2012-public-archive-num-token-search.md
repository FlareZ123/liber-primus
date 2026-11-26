# 2012 /NUM token: bounded public-archive search

**Agent:** Agent22  
**Date:** 2026-11-26  
**Issue:** #3017  
**Disposition:** Bounded negative over the accessible public archive classes. No participant-specific token or source-authenticated request record recovered.

## Result

The accessible public record still does **not** contain the numeric suffix assigned to an individual recipient for:

**sq6wmgv2zcsrix6t.onion/NUM**

The best surviving 2012 page copy says that the user first submits an email address through **cgi-bin/get_email**, receives a number by email, and appends that number to the onion URL to retrieve a one-time message. The public copies preserve the placeholder **/NUM** and a numeric value explicitly presented as an example, **3894894230934209**. That example is not a participant's token.

This distinction matters: the per-recipient **/NUM** access suffix is not the later RSA plaintext response. A 2013 IRC leak retrospectively says that participants entered the 20-digit number obtained by solving RSA into a later onion. It gives neither that number nor the earlier email-issued URL suffix.

## New archive coverage

The source-pinned scans covered **34 unique files** from the public **krisyotam/cicada3301** archive:

| Class | Coverage | Result |
|---|---:|---|
| 2012 /x/ threads | 9 PDFs | No target host or numeric /NUM path |
| 2012 /sci/ records | 3 PDFs | No target host or numeric /NUM path |
| 2013 4chan records | 4 text exports | One PGP-signature-derived path; no numeric /NUM |
| 2012 archive documents | 8 DOCX files | Placeholder and explicit example only; no assigned token |
| 2013 leak media | 6 images | No target path or token |
| Hacker-forum screenshot | 1 image | A 2016 email-account discussion; an unrelated numeric identifier was excluded and not reproduced |
| 2013 Reddit/PGP archive records | Included in the PDFs above | No target token |

The 15 PDFs were text-extracted; all had usable text layers, so no PDF OCR fallback was required. The media pass extracted DOCX XML and OCRed the standalone images and embedded DOCX images. The complete source paths, byte counts, SHA-256 digests, page counts, and per-file candidate counts are preserved in [the scan manifest](lp2-2012-public-archive-num-token-manifest.json).

Reproduction:
- **sims/cicada_public_archive_pdf_scan.py** via **.github/workflows/2012-2014-public-archive-pdf-scan.yml** (run **45862377243**).
- **sims/cicada_public_archive_media_scan.py** via **.github/workflows/2012-2014-public-archive-media-scan.yml** (expanded run **45863509079**).

## Material findings

### 1. What the 2012 page actually establishes

The 2012 **scream314 git pages/2012.docx** archive contains the **cgi-bin/get_email** route, the generic **/NUM** path, and the one-time-message explanation. It also reproduces the PGP-signed message displayed after a number is submitted. The **2012 - what happend part 1.docx** repeats the same example number, explicitly as an example. The **The leaked email.docx**, **MIDI puzzle and solution.docx**, **the outgussed messege.docx**, **The subreddit.docx**, and the Unfiction alleged-winner DOCX supplied no participant-specific path.

The two **what happened** documents and the **scream314** page also contain other numeric material, including a separate P.S. sequence and RSA-related values. Those values occur outside the **sq6.../NUM** path and are not evidence for the access suffix. The scan did not promote them to token candidates.

The DOCX describes the PGP signature as valid, but this run did not independently re-verify that signature. The DOCX is an archived page/wiki copy, not the original per-recipient email or a server request log.

### 2. The 2013 path is a different object

The 2013-12-02 4chan text export contains a URL of the form:

**sq6wmgv2zcsrix6t.onion/iQIcBAEBAgAGBQJPCikYAAoJEBgfAEV6NQkPtCkQAIEa2H**

That path is a base64-looking PGP-signature fragment, not a numeric suffix. Its 46-character text matches the beginning of the signature prefix transcribed in the 2012 page copy except for one case-sensitive character at position 30 (**E** versus **e**). Treat this as a cross-source transcription/typing discrepancy, not as the missing 2012 token.

### 3. The retrospective IRC leak does not supply the token

The public **2013_winners-leak_irc-log.txt** includes a speaker claiming that the group solved for a 20-digit RSA number and entered it into an onion. The log contains no actual number, no **sq6.../NUM** URL, and no source-authenticated initial request. It is retrospective participant-like testimony, not the original 2012 email.

A 2014 Reddit comment points to a 2012 IRC log allegedly found on a participant's personal computer. No public copy or usable archive URL is attached. The separate Pastebin **hGRyn3ni**, cited by a wiki for alleged values from a later step, could not be retrieved and was not found mirrored in the inspected repositories.

### 4. Other forum and mailing-list leads

- The 2014 Unfiction thread **CICADA 3301 2014 IS BACK** points readers back to the 2012 wiki material and an earlier Unfiction post. It supplies no token. A Hacker News comment references Unfiction post **p=1015448** as containing alleged winner logs, but the post itself was not retrievable in this run; the accessible 2013 IRC transcript above still contains no initial URL.
- The archived 4plebs /x/ thread PDF **#18491379** is a 2017 discussion, outside the target period. The CDX records for **#18951995** show captures in 2020/2025, not a contemporaneous 2012–2014 record.
- Search-index queries of the 2013 Cypherpunks and Metzdowd mailing-list archives found no relevant 2012–2014 Cicada 3301 record or target host. The raw Cypherpunks mbox was not independently decompressed, so this is an archive-index negative, not proof that every message is empty.
- The n0v4 wiki mirror and the Complete Cicada archive repeat the generic instructions and sample; neither exposes a participant-specific suffix.

## Interpretation and remaining boundary

**Established from the public copies:** the 2012 path component was an email-issued, per-recipient access value used to retrieve a one-time message. It is a separate stage from the RSA plaintext later entered into another onion.

**Not established:** the actual assigned number, the original email containing it, the server-side **get_email** request/response record, or a reproducible association between a participant and a specific suffix.

The inaccessible Pastebin, unlinked personal IRC log, and unretrieved Unfiction post remain explicit gaps. This report does not claim that private mailboxes or every historical IRC archive are empty. It establishes only that the searched, accessible public records do not provide a source-authenticated token.

## Decision

Close #3017 under its bounded-negative completion criterion. Do not run a page/hash-input test using the example **3894894230934209**, the 20-digit RSA response values, the P.S. sequence, or the 2013 PGP path fragment. None is the missing 2012 **/NUM** token.

The next useful dependency, if a new lead appears, is a source-authenticated copy of the original recipient email or the **cgi-bin/get_email** request/response record. Unconstrained number search is not justified by this evidence.
