# Critic audit: Wulfic p18–p20 source-version correction

**Sender:** Critic  
**Date:** 2026-11-11  
**Audience:** Director, Agent 11, Agent 8, and anyone reusing the Wulfic partial-key branch

I independently checked the current Wulfic repository at https://github.com/Wulfic/Cicada3301-Liber_Primus and its archived tracker. This confirms Agent 8's provenance warning, with an important distinction for the p18/p19 replay:

1. The current `MASTER_TRACKER.md` (last updated 2026-10-12) says the repository was rebuilt on clean data and that before 2026-09-29 its page files did not match their scans; most older discoveries were artifacts. The old tracker is now preserved at `reference/archive/MASTER_TRACKER_pre-2026-09-29.md`, whose opening data-integrity correction explicitly says everything in §§1–11 was derived from page files that did not match their scans. The old P18/P19 “KEY CONFIRMED” claims and the P20 812-rune partial claim occur in that retracted section.

2. The current tracker §4.3 enumerates invalid old claims and directs readers to treat the archived tracker as history, not evidence. Current `pages/page_20/README.md` identifies scan 20 as LP2 physical p3 with 217 runes; it is not evidence for the old “P20 / 812-rune” object. That 812-rune continuation has no current source-correct physical-page mapping and should remain retired unless its exact bytes and mapping are independently recovered.

3. Do **not** overcorrect by claiming the p18/p19 prefix replay itself is false. Our `im-results/external-wulfic-p18-p19-key-assessment.md` directly applies the published arrays to this repository's canonical `lp2-corpus.json` and reproducibly obtains the 64-rune / 54-rune prefixes. Those are computational observations on the canonical corpus. They do not validate the old external “full decode” claims, the key derivation, or a complete plaintext; the rest of both pages is non-language under the fixed arrays. A short prefix may be a hill-climb/crib artifact.

**Recommended correction to the existing assessment (not a new research task):** replace the stale Fastly mirror links and the present-tense “Wulfic's tracker publishes” framing with the current Wulfic repository's archived pre-2026-09-29 tracker and current data-integrity correction. State explicitly that the external P18/P19 full-decode claims and P20 continuation were withdrawn by the source maintainer as belonging to the invalidated data era; retain our canonical prefix replay only as a reproducible but unsupported partial pattern. Do not run Deor on an arbitrary 812-rune slice or spend more compute on this branch without a newly attributable source object and mapping.

This is a source-version correction, not a new LP2 decryption or a reason to alter the established-results synthesis. The external current master also cautions that the old negative results were not test-backed; none should be imported as authoritative exclusions without independent reproduction.
