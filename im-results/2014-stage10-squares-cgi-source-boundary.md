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

## Static confirmation page is not the handler

The 2014 `stage10/squares` file is only:

- “Thank you for you submission.”
- links to `/107.jpg`, `/167.jpg`, and `/229.jpg`.

It is a static response body, not executable CGI code. The same blob later appears as iBotPeaches' `post2/index.html` and in the 2026 krisyotam mirror. Those later copies are not the first surviving witness: the 2014 participant commit already contains it.

The iBotPeaches repository's form page is also a later copy. Its [PR #80](https://github.com/iBotPeaches/cicada_3301/pull/80), merged 2024-09-23, says it moves the four-image page to `pre` and uses `post` for the three images and square submission boxes. The 2014 participant archive is therefore the earlier source for the form, not the 2024 reconstruction.

## Historical participant record and endpoint distinction

The preserved participant transcript [“The complete story of onion 6”](https://github.com/krisyotam/cicada3301/blob/main/archives/cijhho/2014/additional%20docs/Titanpads%20from%20time%20of%20solving/The%20complete%20story%20of%20onion%206.txt) says the page was saved as `onion6_2.html`, records three square inputs plus one hidden-service URL field, and says posting the squares and address yielded the three rune JPGs. It does not preserve the POST body, response headers, or server logs. It records verification of the embedded Cicada signature; that signature authenticates the instruction text, not the surrounding form markup.

The signed Stage11 instruction's `/cgi-bin/upload` is a **different endpoint**, hosted by the participant. The Onion6 form's `/cgi-bin/squares` is Cicada-side. The archived `cgi.py` is a participant upload mock and is not the squares handler.

## What remains unknown

No original Cicada-side `/cgi-bin/squares` implementation, deployment bundle, byte-preserving POST/HTTP exchange, response headers, or operator record has been recovered. The form and static response do not establish whether the handler checked row/column/diagonal sums, uniqueness, orientation, formatting, or any other predicate; nor do they establish whether the three image links were conditional on the submitted values. Do not infer a square-to-image mapping from the returned filenames.

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
