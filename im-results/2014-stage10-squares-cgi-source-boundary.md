# 2014 Onion6 /cgi-bin/squares: client form recovered; server handler remains unknown

**Decision:** close the bounded client-source search. A contemporaneous participant archive preserves the 73-line Onion6 form page in a commit dated 13 February 2014. The page is plain HTML: it contains no JavaScript, stylesheet, hidden field, or client-side transformation. Its browser submission schema is recoverable; the exact historical request bytes and Cicada-side handler are not.

## Newly recovered first-party-live *handler listing* (6–11 February 2014)

The original, source-byte-verified [2014 Freenode channel export](../resources/external/2014-cicadasolvers-freenode-log-corpus.md) preserves direct first-person observations absent from the 2014 participant repository's static mirror. The original Git blob `bdd277c14f94c34b5ae714cd00c238065beeed4e` of `#cicadasolvers.freenode.log` (18,487,233 bytes) and the independent `#33012014.freenode.log` are checked by [the exact-byte original source witness SFT](../sims/lp2_2014_onion6_square_cgi_original_irc_sft.cjs), which completed in [run 43668289063](https://github.com/FlareZ123/liber-primus/actions/runs/43668289063). This is a historical participant-observation record, not an authenticated copy of the hidden-service operator's code.

**New actionable discovery:** On **10 February 2014 at 17:38–17:55** (original L114812–25, L114895–905), participant `JeSuisPasCicada` described browsing the live `ut3qtzbrvs7dtvzp.onion/cgi-bin/` directory and asked how to read the contents of an entry named **`squares*`, displayed as size `965`**, because they wanted to see how it was scripted. Two other participants immediately answered that executable CGI script source is unavailable unless the server is misconfigured (L114903–05). The same exchange includes the source-visible directory background HTML `BGCOLOR="#99cc99"` (L114821) and identifies the web server as **thttpd**, with contemporary observed HTTP banner **`thttpd/2.25b 29dec2003`** (L114966), distinguishing this from a later mirrored HTML text. The `965` is a **reported directory-list entry size**, not original bytes downloaded into the repository; `*` is part of the participant's reported display and may indicate executable permissions in the server's index. Neither the HTTP method nor the program language can be inferred from that label and length.

Two further contemporaneous method observations: on **6 February L105972**, `gonflynn` reports getting the exact success-message text; on **6 February L107066**, `NiceLurk` describes a different response when `/cgi-bin/squares` is opened directly or refreshed, versus the submitted page. This is evidence that the endpoint *may distinguish an actual POST from a direct GET*, while its complete behavior and request bytes remain absent. Another participant `lakmann420` conjectures on **11 February L116904** that the server does no input validation. This statement is expressly conversational speculation without a paired arbitrary/malformed-square POST or its response. The widely circulated later wiki claim that any square meeting dimensions and sums worked is similarly **not** a preserved original method-specific positive/negative request pair. The original messages do not establish whether all squares were checked or their precise acceptance predicate.

**Source recovery decision:** The first-person original 2014 directory listing provides the *most concrete recoverable backend target*: a **965-size `squares*` entry** on the original thttpd Onion6 CGI index. No contemporaneous source download, original executable bytes, remote-side deployment, or byte-matched POST/response test appears in the searched historical channel excerpts, in the independent February 2014 participant Git capture, or in exact-key GitHub repository search for the original URL and CGI path. The two original IRC files have no claim of successfully reading that code. Future retrieval should target a screenshot, saved CGI directory index, or preserved original `squares` binary/script of the reported size, then inspect its real parser before inferring a square-to-key method. This independent source-side lead is now specific; a blind replacement 965-byte CGI reconstruction would prove nothing about Cicada's actual operation. **No LP2 cryptographic key, hidden cipher operation or recovered unknown plaintext follows.**

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

The specific missing-log lead was also checked. The 2014 repository's `tools/check-onions.sh` changes into `~/cicada-2014/stage10/tmp`, appends a date, then runs `torify wget -r --mirror -S http://ut3qtzbrvs7dtvzp.onion >> log 2>&1` (along with the other onion roots). This is a recursive **GET mirror**; it does not POST to `/cgi-bin/squares` or submit any square fields. The script is preserved, but the full 2014 repository tree contains no `stage10/tmp/log`; GitHub's commit history for that path is empty, and the current Liber Primus repository tree also contains no such file. Even if that missing log were recovered, it could corroborate the GET form/headers and fetched assets, not the successful square-submission POST or its answer body.

## What remains unknown

**Additional independent archive boundary, 16 November 2026 (Agent18, Director #1228).** The separately published [2026 Wayback CDX result collection](https://github.com/pnotisdev/cicada3301/blob/main/work/phase52/cdx_results.json) queried fourteen clearnet/Tor2web URL variants for the exact `ut3qtzbrvs7dtvzp` host. Its **only 19 returned records** are all `ut3qtzbrvs7dtvzp.tor2web.org` captures dated **March–November 2016**: root `/`, `/robots.txt` and `/favicon.ico`. None names `/cgi-bin/` or a `squares` endpoint, and none predates the February 2014 live-server interval. This is a useful *independent published archive index*, not a recovered 2014 Tor capture and not a guarantee about archives it did not query. The [Common Crawl collection index](https://index.commoncrawl.org/collinfo.json) likewise has no February 2014 crawl: the 2013-48 crawl ended December 2013, and the next 2014-10 crawl starts **7 March 2014**, after the participant-observed **11 February 2014** site shutdown. Thus the public 2014 Common Crawl schedule does not cover the actual 6–11 February service window. Original-program targeted GitHub code queries return copied client forms and retrospective descriptions, without a matching size-965 CGI executable; archive.today's rendered-page snapshots are not an executable source store. This evidence retires the specific independent Wayback/Common-Crawl/ordinary GitHub recovery avenues, while leaving private contemporaneous backups or raw signed operator traces untested.

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
