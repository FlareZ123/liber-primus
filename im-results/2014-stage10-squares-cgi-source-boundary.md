# 2014 Onion6 /cgi-bin/squares: original handler source boundary

**Decision:** close the bounded source-recovery task. The public archive set preserves the form, a confirmation-page body, and participant recollections, but no original Cicada-side handler, deployment bundle, byte-preserving POST/HTTP exchange, or operator record. The square-validation algorithm and any input-to-image mapping therefore remain unrecoverable from these materials. Do not infer them from the three returned image names.

## What the sources establish

1. **The Onion6 form is Cicada-side.** The archived form in resources/external/cicada2014-onion6-magic-form-and-response.json submits to /cgi-bin/squares. Its three textarea names encode the displayed square order/target labels (5×5/3301, 7×7/1033, 5×5/1033), alongside a Tor URL. This establishes the interface and action path, not the server predicate or transformation.

2. **A response body is preserved, not a handler.** The 152-byte post2/index.html body says “Thank you for you submission.” and links to 107.jpg, 167.jpg, and 229.jpg. In the newer krisyotam/cicada3301 archive, puzzles/2014/assets/stage10/squares has the exact same Git blob ID as tools/solvers/ibotpeaches/onions/ut3qtzbrvs7dtvzp.onion/post2/index.html:
   - blob: d71303af76016c8e88ed5dcc8a18b08e6276a437
   - the underlying iBotPeaches archive commit is dated 2024-12-19 (df50c0cc88f0aee6de4bb0fd8361cefc6e9b0faf);
   - the krisyotam mirror/reorganization is dated 2026-04-20 (1ccf9583b7064ffd6feb52a49442311048295b41), with a later 2026-08-06 sync.

   Thus the file named squares is a duplicate static response page, not an executable CGI program or a contemporaneous server bundle. The filename is a misleading archive artifact.

3. **The 2014 participant record is narrative, not a wire capture.** The contemporaneous “The complete story of onion 6” Titanpad records the form interaction and the appearance of three new rune JPGs. It does not preserve the submitted POST body, response headers, server logs, or handler source. The associated “ONION 6 NEW PAD” likewise records participant instructions, not server internals.

4. **The signed Stage11 upload instruction is a different endpoint.** resources/historical/cicada2014-stage11-message.asc describes a participant-hosted /cgi-bin/upload service and a GPG public-key submission. It does not describe Onion6's Cicada-hosted /cgi-bin/squares. The archived neuroretransmit/cicada/2014/008-sixth-onion/cgi/cgi.py is a participant upload mock: it handles an uploaded filename and writes into a local sandbox. It contains no square validator and is not the Onion6 server.

5. **The bounded public-source search finds copies, not implementation.** Exact-path GitHub code searches for /cgi-bin/squares across the known mirrors and the newer comprehensive archive return HTML form copies, archive indexes, and response-page copies. The inspected Onion6 trees contain pre, post, and post2 snapshots but no /cgi-bin/squares source or deployment directory. Searches for the endpoint do not reveal a dated original server bundle, attributable server repository, byte-preserving request/response pair, or operator record.

## What remains unknown

The form labels and one saved response do not establish whether the handler checked row sums, column sums, diagonals, uniqueness of entries, orientation, a particular ordering, or additional hidden constraints. They also do not establish whether the three image links were conditional on the submitted values, whether every valid submission returned the same page, or which square (if any) selected which image. No exact square-to-output mapping can be recovered from a single static confirmation body without fitting a theory to the images.

The participant-side /cgi-bin/upload mock must remain separate from the Cicada-side /cgi-bin/squares endpoint. Do not repurpose the mock or infer a cryptographic operation from its local file write.

## Completion boundary

The minimum evidence that would change this decision is one of:
- a dated original Onion6 server/deployment bundle containing the squares handler;
- an attributable source repository with the handler and deployment context;
- a byte-preserving POST request plus its corresponding HTTP response (including headers and exact body), ideally for more than one input;
- an operator-maintained log or record that specifies the validation and output-selection rule.

Absent one of those, further reconstruction from the form labels or the three image files would be unconstrained reverse engineering, explicitly outside this issue's source-recovery gate. The issue is therefore closed as a completed evidence-boundary decision, not as a claim that the endpoint's algorithm has been solved or that no private copy survives.

## Source pointers

- Local form/response index: resources/external/cicada2014-onion6-magic-form-and-response.json
- Signed later Stage11 message: resources/historical/cicada2014-stage11-message.asc
- Contemporaneous participant record: https://github.com/krisyotam/cicada3301/blob/main/archives/cijhho/2014/additional%20docs/Titanpads%20from%20time%20of%20solving/The%20complete%20story%20of%20onion%206.txt
- Participant upload mock: https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/cgi/cgi.py
- Archived response: https://github.com/iBotPeaches/cicada_3301/blob/df50c0cc88f0aee6de4bb0fd8361cefc6e9b0faf/onions/ut3qtzbrvs7dtvzp.onion/post2/index.html
- Duplicate squares file: https://github.com/krisyotam/cicada3301/blob/main/puzzles/2014/assets/stage10/squares
- Mirror archive: https://github.com/krisyotam/cicada3301
