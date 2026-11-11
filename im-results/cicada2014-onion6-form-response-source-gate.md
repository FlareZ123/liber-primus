# The actual 2014 magic-square form and submitted response

**Outcome (11 November 2026):** the 2014 Onion6 square-form protocol is recoverable, including its exact relative POST endpoint, four parameter names and public response listing three known LP1 image links. **A separate, already archived PGP-signed private upload reply then directs participants to `ky2khlqdf7qdznac.onion`, the documented entry to the second-release LP2.** This establishes the actual full known historical form→LP1→private signed LP2 route, while yielding **no additional unsolved-page decryption key**. Director issue [#200](https://github.com/FlareZ123/liber-primus/issues/200).

## Exact HTML form and field contract

The public preservation repo [`iBotPeaches/cicada_3301`](https://github.com/iBotPeaches/cicada_3301) contains the former `ut3qtzbrvs7dtvzp.onion` **pre**, **post** and **post2** page states. The relevant HTML is pinned verbatim, with original Git blob SHA-1 checks, in [`resources/external/cicada2014-onion6-magic-form-and-response.json`](../resources/external/cicada2014-onion6-magic-form-and-response.json). This particular repository copy was introduced in **December 2024** (commit `df50c0cc88f0a`), so its HTML is a later archived witness and **cannot itself authenticate a live 2014 HTTP response**. The signed text embedded within the form is an actual historic signed puzzle instruction; the HTML tags and form result are outside its signature. Older published 2014 walkthroughs independently recount the exact same form and response.

The verbatim HTML gives:

```html
<form method="post" action="/cgi-bin/squares">
  <p>Order 5 Square, 3301</p>
  <textarea name="53301"></textarea>
  <p>Order 7 Square, 1033</p>
  <textarea name="71033"></textarea>
  <p>Order 5 Square, 1033</p>
  <textarea name="51033"></textarea>
  <p>Your onion address:</p>
  <input type="text" name="onion" />
  <input type="submit" value="Submit" />
</form>
```

This selects ordinary **HTTP POST** to the source domain's **`/cgi-bin/squares`** endpoint and form fields, in HTML printing order, `53301`, `71033`, `51033`, `onion`. No `enctype` is declared, so a conforming browser uses the usual `application/x-www-form-urlencoded` for four supplied fields. The first three values are literal **pasted multiline matrix text**, and `onion` holds the player's own configured Tor hidden-service URL. The signed message separately calls for the participant to publish `/cgi-bin/upload` accepting a file input called `file`, plus their public `/key.asc`. Those latter two names describe **the participant's own server**; neither is a fifth field or a handler on the displayed square form. No original POST body bytes, form-urlencoded whitespace choices, supplied unique onion address, request headers or server code survive in these snapshots, so an exact historical client POST cannot be honestly reconstructed.

The authenticated original numerical values that are *eligible to paste* are in `resources/cicada2014-openpuff-magic-squares.txt`. They are respectively a 5×5 with row/column/diagonal sum **3301**, a 7×7 with sum **1033**, and a second 5×5 with sum **1033**. All three original matrices satisfy all row, column and both diagonal conditions exactly. The first source text area accepts 25 numbers, the second 49, the third 25. The printed form does **not** specify which string serialization inside textareas the original server expected beyond “paste”, and the contemporary retrospective report says validation accepted *any* magic square matching size and sum. It does not define a unique orientation that could be used as an authenticated ciphertext key.

## Actual published post-submission page

The separate `post2/index.html` has exact source Git blob SHA-1 `d71303af76016c8e88ed5dcc8a18b08e6276a437` and only 152 bytes, including the literal original text:

```html
<p> Thank you for you submission. </p>
<img src="/107.jpg" /><br />
<img src="/167.jpg" /><br />
<img src="/229.jpg" /><br />
```

The message and **three exact image paths** are independently attested in the historical [2014 recruitment walkthrough](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf) and the [later reconstruction](https://connortumbleson.com/2024/12/23/the-cicada-3301-mystery-puzzle-3-solve-part-4/). They were the final **three already known first-release LP pages** (first release p14, p15, p16). This is why the image filenames do not appear in the 2014 *second-release* `0.jpg`–`57.jpg` sequence. The 2024 archived `post2` directory contains the HTML but **does not contain the image bytes**; the original-image content survives in separate LP1 archives. The prior solved-page controls and their historical cryptographic operation are a distinct task from decrypting the remaining LP2 manuscript.

The response does not add a p50 table key, first unknown LP2 page, nonce, server seed, signed new command or active deep-web URL. The HTTP output has no surviving authentic response headers, timestamp or unique server-selected user state. It is a known reward/continuation of the initial Liber Primus release; **do not misclassify this as newly discovered LP2 plaintext**.

## Separate signed upload callback that leads to LP2

The signed form text specified `/cgi-bin/upload` with an upload field `file`, a recipient public key at `/key.asc`, and a future contact. The separate **original Cicada PGP-signed follow-up** already exists in this repository: [`resources/historical/cicada2014-stage11-message.asc`](../resources/historical/cicada2014-stage11-message.asc). Its literal source message says **“Your enlightenment awaits you”** and points to **`ky2khlqdf7qdznac.onion`**, the actual 2014 stage11 Onion service where the second-release `0.jpg`–`57.jpg` images were published. This is an independently documented player-visible address, not a hypothesized hidden key. The signed text is preserved separately from the unsigned 2024 HTML snapshot.

[The historically reconstructed successful client flow](https://connortumbleson.com/2024/12/23/the-cicada-3301-mystery-puzzle-3-solve-part-4/) reports three visits to the participant's own Tor server: `GET /key.asc` and `GET /` using `Cicada/33.01 CicaDOS 1.033 E Edition`, then `POST /cgi-bin/upload` with `Cicada/33.01 CicaDOS 1.033 S Edition`. Some participants reportedly received a questionnaire instead of the standard signed redirect. The named upload path and actual signed message connect the form to LP2 through a **known private callback**. The exact original HTTP upload bytes, recipient-specific encrypted envelope, timing and any alternative individual reply files have not been authenticated here. This uncertainty does not make the *standard* LP2 redirect missing.

The **known pathway is now specified**: the public form's three images end LP1, and the signed server-to-server upload points to LP2's original 58-page second release. The second release itself provides no solution to its 56 still encrypted pages in this response chain.

## Decision and exact reproduction

A player could paste the squares and get the three first-release pages from the **public** form. The signed instruction concurrently required the participant's own Tor upload service and public key. A separately preserved private reply provided the known **second-release onion link**, as detailed below. The form's direct public response is one stage in that full route. A stronger assertion that this protocol also emitted a usable *unsolved LP2 decryption key* would require a different authenticated response or server implementation.

The [single runnable source contract](../sims/cicada2014_onion6_form_response_sft.cjs) asserts the two stored original Git blob SHA-1s, source `method`/`action`, all four field names in source order, **all 3 image URLs**, and all three original numerical square orders, rows, columns and diagonals. No trial keys or cryptanalytic settings were searched.

**Research consequence:** this puzzle's *public form and standard private upload reply* have a **known, reproducible LP1→LP2 route**, culminating in the preserved PGP-signed `ky2khlqdf7qdznac.onion` direction. The original route does not specify how to decipher 56 unknown LP2 pages. Unique private variant replies or encrypted recipient envelopes, if someday authenticated, might carry additional independent content, but none is currently selected as an LP2 key. Do not repeat form validation or invent lost state when the actual signed next-stage message is already preserved.
