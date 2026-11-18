# H5 flat-library campaign

## Premise
pnotisdev's H1/H5 model is an unresolved, source-motivated family: an LP2 decoder with a library keystream plus a short periodic keyword, with the documented anti-repeat transport. Their first slice tested only the totient stream; the 581-stream flat-library campaign was prepared but explicitly not launched.

## Decisive test
Run the pinned H5 engine against all 581 flat-IoC library streams, offsets 0..1999, keyword periods 2..20, both anti-repeat models, across eight 300-rune LP2 section windows. Use the campaign's matched null to set the candidate floor. A candidate is only a lead until whole-window and whole-section English checks pass.

## Completion criteria
- Full five offset blocks complete without duplicate/gap errors.
- Matched-null maxima recorded per window/model.
- Candidate rows are extracted using the measured null floor.
- Any surviving candidate is independently re-decoded before promotion.
- If no candidate survives, retire this H1 slice as a tested negative at the stated scope.

## Provenance
Pinned external implementation: pnotisdev/cicada3301 commit 15200c67abee106913ba01ff504c5b6e88d16cc7.
