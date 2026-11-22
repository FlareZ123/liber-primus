# 2014 Onion6 CGI acceptance contract: source-bounded decision

## Decision

The surviving 2014 Onion6 source **fixes the public form controls, the participant's upload contract, and the observed continuation**. It does **not** preserve Cicada's server-side `/cgi-bin/squares` validator, the actual successful POST body, any error response, or the sender's POST multipart boundary. The assertion that *any* valid square was accepted is a historical participant/community claim, not an independently reproducible property of the original server code. No surviving contract directs the 2014 submitter to read the later LP2 pp49–51 256-cell table as three square inputs. This route presently provides no LP2 key, rune operation, or plaintext.

### Original witness, and what the source authenticates

- Earliest period participant witness: [Michel Oosterhof's 13 February 2014 initial archive](https://github.com/micheloosterhof/cicada-2014/commit/3b15257c5a9efada85b8ccfdb876e2ec934d5b90), with form originally at `stage10/index.html`, later moved unchanged to [`stage10/ut3qtzbrvs7dtvzp.onion/index.html`](https://github.com/micheloosterhof/cicada-2014/blob/master/stage10/ut3qtzbrvs7dtvzp.onion/index.html) (Git blob `9d7c35bc8fff24c8079668c9d070d98277502f7c`). The initial archive's `stage10/README.md` records an explicit Tor `wget` acquisition and subsequent square submission. The independent later [iBotPeaches form](https://github.com/iBotPeaches/cicada_3301/blob/master/onions/ut3qtzbrvs7dtvzp.onion/post/index.html) is Git blob `e2eefba48af2006957072f60bfdeabb4f27b28f4`.
- Both archival versions embed the same Cicada clear-signed instructional prose. That signed text instructs solvers to paste the magic squares, provide a Tor hidden-service URL, host the recipient `/cgi-bin/upload` accepting a file form field named `file`, and expose the applicant's GnuPG public key at `/key.asc`. **The HTML form labels and fields appear outside the signed prose.** Preserve the distinction.
- The exact byte-preserved original form and static response, archive dates, full HTML, and client-control semantics were already consolidated at [`resources/external/cicada2014-onion6-magic-form-and-response.json`](../resources/external/cicada2014-onion6-magic-form-and-response.json). Reuse this pre-existing source record; another copy is unnecessary.

### Two separate network actors

| Host / actor | Method and path | Source-supported fields or content |
| --- | --- | --- |
| Cicada's Onion6 server `ut3qtzbrvs7dtvzp.onion` | `POST /cgi-bin/squares` | HTML default `application/x-www-form-urlencoded` with three textareas, in this order: `53301` (5×5, sum 3301), `71033` (7×7, sum 1033), `51033` (5×5, sum 1033), then `onion` (Tor URL). Submit button has no name; no JavaScript/client-side checks. |
| Participant-provided Tor hidden service | `GET /key.asc`; `GET /`; `POST /cgi-bin/upload` | Signed instruction requires publicly available GnuPG key and recipient form input `file`. A 2 May 2014 participant request-log witness records the three methods/paths and `Cicada/33.01 CicaDOS 1.033` user agents, although the posted multipart message bytes are missing. |
| Cicada's Onion6 server, after reported form submission | Static HTML thank-you response | The archived `stage10/squares` blob `d71303af76016c8e88ed5dcc8a18b08e6276a437` (152 bytes) displays three image links `/107.jpg`, `/167.jpg`, `/229.jpg`. It does not encode the validator or prove which inputs were accepted. |
| Participant Tor hidden service, after Cicada's later upload | Received signed `message.txt.asc` | Preserved in [neuroretransmit](https://github.com/neuroretransmit/cicada/blob/master/2014/010-hidden-service-reply/message.txt.asc); authentic continuation names `ky2khlqdf7qdznac.onion`, the known later LP2 release service. This proves that the upload path could carry a meaningful next instruction. |

### Exact arithmetic control and original LP2 non-transfer

The independently preserved three-square numerical text [`resources/cicada2014-openpuff-magic-squares.txt`](../resources/cicada2014-openpuff-magic-squares.txt) has the source-specified shape and **all** rows, columns and both long diagonals sum to their respective form totals. These are mathematical positive controls for the form's labeled object class; original server acceptance is an unobservable separate question.

- Three submitted matrices have **25 + 49 + 25 = 99 cells**, with expected row/column sums 3301, 1033 and 1033 respectively.
- Original LP2 pp49–51 is instead a **32×8 array totaling 256 cells** (80+104+72 across the three physical pages). The whole source grid has neither the required matrix dimensions nor the 99-cell payload size.
- No literal reference to LP2, a table index, a GP29 conversion, or a square-to-cipher key procedure occurs in the signed instructions, original HTML, confirmation response or preserved participant request path. Subselecting 99 cells from 256 or applying an arbitrary transformation is unfounded without a source rule.

### Reproducible frozen source test

Run `node sims/cicada2014_onion6_cgi_contract_sft.cjs` in a checkout. The read-only, standard-library SFT parses the archived original HTML from the pre-existing resource, asserts the form method/action and exact field names, checks all 40 original row/column/diagonal sums of the three saved matrices, serializes a **dummy** URL via `URLSearchParams`, then decodes the mock body to verify request-field order and newline preservation. It confirms the original 152-byte response's three image links and compares 99-form-cell versus 256-LP2-grid sizes. No Tor requests or message uploads are performed; the mock does not invent historical acceptance behavior.

### Source boundary and Director decision

Finite original-era source coverage: the 13 February 2014 participant archive's entire `stage10` tree contains its form, static thank-you file, three image files, and README, with **no** original square validator or participant CGI handler; the iBotPeaches Onion6 archive's `pre`, `post`, and `post2` trees contain the same static page classes only. Independently mirrored later walkthroughs repeat the field labels and confirmation but provide no executable creator-side handler or raw successful POST. The observed 2 May participant logs record routes/status without server code or uploaded request bytes.

Retain the period-attested submission and actual next-onion response as solved historical workflow. **Close #477 with this specific missing-original-validator limit** rather than assuming acceptance ranges or an LP2 table consumer. Only newly recovered original server validation code, full original POST captures, or independently authenticated consumer instructions justify reopening.
