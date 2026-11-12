# 2014 Onion6 /cgi-bin/squares: client form recovered; server handler remains unknown

**Decision:** close the bounded client-source search. A contemporaneous participant archive preserves the 73-line Onion6 form page in a commit dated 13 February 2014. The page is plain HTML: it contains no JavaScript, stylesheet, hidden field, or client-side transformation. Its browser submission schema is recoverable; the exact historical request bytes and Cicada-side handler are not.

## Contemporaneous participant capture

The independent participant repository [micheloosterhof/cicada-2014](https://github.com/micheloosterhof/cicada-2014) added `stage10/index.html` in commit [`3b15257c5a9efada85b8ccfdb876e2ec934d5b90`](https://github.com/micheloosterhof/cicada-2014/commit/3b15257c5a9efada85b8ccfdb876e2ec934d5b90), authored by Michel Oosterhof and dated **2014-02-13 18:23:37 UTC**. The file is 73 lines and has Git blob SHA-1 `9d7c35bc8fff24c8079668c9d070d98277502f7c`. The same commit adds:

- `stage10/README.md`, which records `torify wget http://ut3qtzbrvs7dtvzp.onion/` and “Submit squares, output in squares”;
- `stage10/squares`, the static 152-byte confirmation page (blob `d71303af76016c8e88ed5dcc8a18b08e6276a437`);
- the three returned images `107.jpg`, `167.jpg`, and `229.jpg`.

Commit [`b1d7412afae69e4109223dd8561ae57b73ac4798`](https://github.com/micheloosterhof/cicada-2014/commit/b1d7412afae69e4109223dd8561ae57b73ac4798), dated **2014-06-02 22:53:38 UTC**, only moves the form from `stage10/index.html` to `stage10/ut3qtzbrvs7dtvzp.onion/index.html`; the blob SHA-1 is unchanged. The repository's `stage10` snapshot contains no JavaScript or CSS assets. The surrounding HTML is a participant archive, not a Cicada-signed object; only the embedded instruction block has an OpenPGP signature.

## Exact client-side form semantics

The archived HTML specifies:

- `method="post"`;
- `action="/cgi-bin/squares"`;
- no `enctype`, so the browser's default POST encoding is `application/x-www-form-urlencoded`;
- four named successful controls, serialized in document order:
  1. textarea `53301` — “Order 5 Square, 3301”;
  2. textarea `71033` — “Order 7 Square, 1033”;
  3. textarea `51033` — “Order 5 Square, 1033”;
  4. text input `onion` — participant's hidden-service address;
- an unnamed submit input with value `Submit`, which contributes no name/value pair;
- no hidden controls, script elements, stylesheet links, inline styles, or custom client-side code.

Thus the client submits the four values as ordinary URL-encoded form fields, in the order `53301`, `71033`, `51033`, `onion`. This is the full client-side rule. It is not a cryptographic operation. The three square matrices themselves are preserved in the same participant repository's `stage07/magicsquares.txt`.

The exact byte string of a particular historical POST is **not** preserved: no request body, participant onion value, or exact textarea paste/whitespace is present in the archive. The schema and encoding are recoverable, but inventing the missing value bytes would not be a historical reproduction.

## Static successful response body is preserved; transaction/handler are not

The 2014 `stage10/squares` file is the participant archive's saved successful-response body:

- “Thank you for you submission.”
- links to `/107.jpg`, `/167.jpg`, and `/229.jpg`.

The exact body is **152 bytes**, with Git blob SHA-1 `d71303af76016c8e88ed5dcc8a18b08e6276a437` and SHA-256 `94e705cd5ab79e1c6b6dcfb98cf0b00aaebb48fc0dfecf2c3f93b31f9bf615aa`. It is a preserved response body, not a complete HTTP transaction. It contains no timestamp, echoed form values, generated per-submission data, square-use instruction, hidden fields, script, or handler. It therefore supplies no LP2 key, selector, or reversible operation.

The same exact Git blob later appears as iBotPeaches' `post2/index.html` and in the 2026 krisyotam mirror. Those later copies are derivative; the 2014 participant commit is the earliest surviving byte-preserving witness.

The iBotPeaches repository's form page is also a later copy. Its [PR #80](https://github.com/iBotPeaches/cicada_3301/pull/80), merged 2024-09-23, says it moves the four-image page to `pre` and uses `post` for the three images and square submission boxes. The 2014 participant archive is therefore the earlier source for the form, not the 2024 reconstruction.

## Historical participant record and endpoint distinction

The preserved participant transcript [“The complete story of onion 6”](https://github.com/krisyotam/cicada3301/blob/main/archives/cijhho/2014/additional%20docs/Titanpads%20from%20time%20of%20solving/The%20complete%20story%20of%20onion%206.txt) says the page was saved as `onion6_2.html`, records three square inputs plus one hidden-service URL field, and says posting the squares and address yielded the three rune JPGs. It does not preserve the POST body, response headers, or server logs. It records verification of the embedded Cicada signature; that signature authenticates the instruction text, not the surrounding form markup.

The signed Stage11 instruction's `/cgi-bin/upload` is a **different endpoint**, hosted by the participant. The Onion6 form's `/cgi-bin/squares` is Cicada-side. The archived `cgi.py` is a participant upload mock and is not the squares handler.

## LP1 Wisdom square is exactly the third historical 1033 submission candidate

A source-visible, concrete connection is established **cell for cell**. The original 2014 LP1 page 05 contains the 5×5 Wisdom table with twelve printed decimal values and thirteen GP rune-words. Its surrounding text says that primes and the totient function are sacred. Replace each rune-word by the sum of its authenticated Gematria Primus prime weights:

```text
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

**All 25 values in their printed cells exactly match the third matrix** in the 2014 participant-preserved [`magicsquares.txt`](../resources/cicada2014-openpuff-magic-squares.txt), the order-5 square with sum 1033. The earlier Stage04 reconstruction proved that LP1 p05's word-sum matrix equals the out-of-bounds embedded square in the same original artifact. This additional cross-artifact comparison connects it to the **third historically circulated OpenPuff square**. Every row, column and both diagonals equal 1033. The archived Stage10 form explicitly requests `name="51033"`, labelled "Order 5 Square, 1033". That is a **specific full-source numerical candidate**, stronger than an equal-size/sum coincidence.

The Stage10 instruction says "Please paste the magic squares", following distribution of the earlier three matrices. A contemporary player with those three matrices already had values fitting each form prompt. No preserved instruction says that the LP1 Wisdom table was the unique way to reconstruct the third one. The historical submitted POST, server handler and acceptance predicate are unavailable, so no particular accepted submission or LP2 key/plaintext is claimed.

Reproducer: [`lp1_wisdom_stage10_1033_square_sft.cjs`](../sims/lp1_wisdom_stage10_1033_square_sft.cjs). Same-image original reconstruction: [`2014-magic-square-direction-map.md`](2014-magic-square-direction-map.md); byte-level original source: [`cicada2014-stage04-256-p50-direct-identity-gate.md`](cicada2014-stage04-256-p50-direct-identity-gate.md).

## Independent participant corroboration and event-time bound

The [Uncovering Cicada Wiki's 2014 Onion6 record](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_8) transcribes the same signed form, identifies Onion6 as back online at **2014-02-06 08:55 GMT**, labels the page as the redirect after submission, and reproduces the same three-image response body. It also records a different empty-form response, “Please complete the form before submitting.” The wiki says the success page was generated on submission and refers to a creation timestamp, but does **not** preserve the timestamp value, response headers, or the request body. This is participant documentation, not a creator-side capture.

Connor Tumbleson's [2024 first-person reconstruction](https://connortumbleson.com/2024/12/23/the-cicada-3301-mystery-puzzle-3-solve-part-4/) explicitly says he pasted the squares and his onion address, received the same 152-byte response, and identifies the linked images as LP1 pages 14–16. It is useful corroboration of a successful submission, but is retrospective rather than a 2014 HTTP capture. The exact image identities are independently established by [the byte-comparison report](2014-stage10-three-images-lp1-source-handoff.md).

The response was already in the participant archive by commit **2014-02-13 18:23:37 UTC**; the participant wiki reports the site reactivated on 6 February. This bounds the surviving archive chronology but does not establish the exact submission time. The original request body, participant onion value, HTTP status/headers, and server-side acceptance predicate remain unavailable.

## What remains unknown

No original Cicada-side `/cgi-bin/squares` implementation, deployment bundle, byte-preserving POST/HTTP transaction (request body, status/headers and response together), or operator record has been recovered. The successful response body itself is preserved as the 152-byte `stage10/squares` file described above. The form and static response do not establish whether the handler checked row/column/diagonal sums, uniqueness, orientation, formatting, or any other predicate; nor do they establish whether the three image links were conditional on the submitted values. The response body itself contains no timestamp or square-use instruction. Do not infer a square-to-image mapping from the returned filenames.

**Completion boundary:** the client page is recovered and shown to be a plain form, so the client-transformation branch is closed. Reopen the server-side question only if a dated handler/deployment bundle, a byte-preserving request/response capture, or an operator record appears. This result supplies no LP2 key, cipher, or plaintext.

## Source pointers

- 2014 form at initial commit: https://github.com/micheloosterhof/cicada-2014/blob/3b15257c5a9efada85b8ccfdb876e2ec934d5b90/stage10/index.html
- 2014 form after rename: https://github.com/micheloosterhof/cicada-2014/blob/b1d7412afae69e4109223dd8561ae57b73ac4798/stage10/ut3qtzbrvs7dtvzp.onion/index.html
- 2014 stage10 README and static response: https://github.com/micheloosterhof/cicada-2014/tree/3b15257c5a9efada85b8ccfdb876e2ec934d5b90/stage10
- 2014 square values: https://github.com/micheloosterhof/cicada-2014/blob/master/stage07/magicsquares.txt
- Later iBotPeaches form mirror: https://github.com/iBotPeaches/cicada_3301/blob/master/onions/ut3qtzbrvs7dtvzp.onion/post/index.html
- Later static response mirror: https://github.com/iBotPeaches/cicada_3301/blob/df50c0cc88f0aee6de4bb0fd8361cefc6e9b0faf/onions/ut3qtzbrvs7dtvzp.onion/post2/index.html
- Signed later Stage11 message: resources/historical/cicada2014-stage11-message.asc
- Participant upload mock: https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/cgi/cgi.py
