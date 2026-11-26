# Facilitator protocol — blind human cold-start

## Before the session

1. Recruit only a real human solver who has not read this repository's analyses or the current issue. Do not contact or publish externally without maintainer approval.
2. Give the participant only the packet ZIP and its neutral README. Do not reveal the issue number/title, agent notes, existing hypotheses, known plaintext, derived transcriptions, or other agents' work.
3. Confirm that the participant has not seen the relevant LP2 analyses. Record prior Cicada/Liber Primus exposure without asking for personal information.
4. Keep the participant's work private until the maintainer approves any sharing.

## Neutral prompt (read verbatim)

“Study the supplied original materials as a puzzle. Work independently and use only the first-party context allowed in the packet. Identify any structure or operation that the source itself seems to select. For each candidate, record the clue and exact parameters before testing it. If you find a promising route, make one prediction about an untouched page or region before looking at that output. Record what you tried and what happened, including negative results. There is no expected answer and no requirement to solve the whole manuscript.”

Do not add examples of cipher families, suggest a page, point to an illustration, or mention any current hypothesis. Answer logistics questions only.

## Session record

Record:

- Session date, UTC start/end, breaks, and participant's prior exposure category.
- Exact packet SHA-256 and the list of allowed context sources actually consulted.
- First unprompted observations, in the participant's own words.
- For each hypothesis: source clue, why it selects the operation, exact alphabet/encoding/key/clock/page reset/segmentation, target interval, and confidence.
- A locked prediction on an untouched page/region, recorded before testing.
- Every tool and version, command/parameters, intermediate output, and whether transformations are reversible.
- Exact forward reconstruction/re-encryption result and held-out result, if any.
- Negative results and reasons for abandoning a route. Do not rewrite them as positive clues afterward.

## Evidence gate

A plausible phrase or visual resemblance is not a solve. Before a candidate is treated as a meaningful lead, require a source-selected operation and fixed parameters, a prediction made before the holdout is opened, and a reproducible result on original image-derived ciphertext. Record whether the result is authentic plaintext, an inference, or only a hypothesis. An exact re-encryption under an arbitrary bijection is not independent evidence.

## Stop and handoff

If no source-selected route appears, record that outcome without prompting or simulating a solver. Preserve the raw session record and send it privately to the maintainer for adjudication. Do not post it publicly or contact puzzle participants without approval.
