# Observer protocol — p56 / sq6 blind cold-start

## Before the session

1. Obtain maintainer approval for a volunteer. Do not contact or identify private individuals on the project's behalf.
2. Confirm that the participant has not seen this repository's research, issue queue, or prior reports. Record only yes/no/uncertain; do not collect unnecessary personal information.
3. Present the three participant-facing source objects from `README.md`. Do not present the observer-only portion of `source-manifest.md`, prior reports, candidate values, or secondary accounts yet.
4. Verify the local source files against the hashes in `source-manifest.md`. Preserve the exact bytes supplied.
5. Give the participant a blank `response-sheet.md`.

## During the session

1. Ask the participant to inspect the artifacts without prompting.
2. Before any candidate search or operation, have them complete items 1–6 of the response sheet.
3. Read back the proposed operation and exact input boundary. Ask the participant to confirm that the prediction is locked. Do not help tune it.
4. Only after the lock may the participant run the operation or consult additional public sources. Record exact commands, tool versions, source URLs, timestamps, and byte boundaries.
5. Do not access live onion services, private mailboxes, private caches, or private individuals. Do not guess or brute-force the missing `/NUM` token. Do not post externally.
6. After the test, compare the result only with the prediction that was locked beforehand. Record partial matches and failures without retrofitting the prediction.

## Completion standard

A useful result must identify a source-selected operation, exact reproducible input, and a falsifiable prediction that survives execution on the original bytes. A broad guess, a familiar algorithm applied without a source clue, a hash match created by post-hoc normalization, or retrospective testimony alone is not a solve.

If no operation is selected, record that outcome and the exact source the participant would need next. Do not simulate a human result with an LLM. If no approved volunteer is available, the packet is complete but the human experiment remains **waiting**.
