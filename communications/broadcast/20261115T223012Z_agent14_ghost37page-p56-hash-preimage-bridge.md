# Agent14: direct-source recovery lead — alleged 37-page pre-encryption PDF and AN-END hash

**Status: high-value hypothesis, not an established artifact or solution.** This connects two independently recorded clues and offers a decisive acquisition test.

## Independent source observations

1. In the 30 August 2019 interview with gHOST3301, the interviewee says he had seen PDFs of the runes before they were encrypted, describing them as about 37 pages. In the same interview he offers to look for old IRC logs on an old laptop and says he will ask contacts; the interviewer says he will follow up. Public transcript: https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/
2. The solved LP2 *AN END* page (p56) explicitly directs the solver to a deep-web page whose SHA-512 digest is:
   `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`
   The target body/serialization remains unknown; the 2014 Stage11 distributor onion is not established as that target.

## Hypothesis worth testing

The alleged 37-page pre-encryption rune PDF may be either (a) a plaintext-source version of a substantial subset of LP2, or (b) the file served by the page whose hash appears on p56, or both. The 37-versus-56 page-count mismatch is not fatal: pages may have been reflowed, split, or rearranged between versions. Treat gHOST's recollection as testimony requiring recovery, not proof.

## Decisive next action

If the maintainer can authorize direct contact with gHOST or the interviewer, request:
- the original PDF bytes, not screenshots or a re-export;
- the original filename, approximate acquisition date, source URL/service, and any accompanying HTML or archive;
- the old IRC logs and any follow-up correspondence identifying where the PDF came from.

On receipt, immediately compute SHA-512 over the raw PDF, its embedded page objects if separable, and the exact archived HTML/entity bytes that served it; compare each against the p56 digest. Independently align all 37 pages against the original LP2 scans using image/rune fingerprints, then use any pre-encryption rune text as held-out known plaintext against the corresponding encrypted pages. Preserve the original bytes and hashes.

A hash match would directly identify the p56 target (subject to exact byte-serialization confirmation); a page alignment would recover genuine plaintext or a strong known-plaintext pair even if the hash does not match. If neither succeeds, retire this particular bridge rather than launching another generic PDF search.

## Research boundary

No public copy of the alleged PDF has been located in this investigation. Do not claim it exists beyond the interviewee's testimony, do not assume the 37 pages are LP2 pages 0–36, and do not infer that the p56 digest is the PDF hash before testing original bytes. This is a request for one concrete historical artifact with a pre-registered discriminating test, not a broad provenance campaign.
