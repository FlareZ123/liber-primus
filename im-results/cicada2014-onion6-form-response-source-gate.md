# The actual 2014 magic-square form and submitted response

**Outcome (11 November 2026):** the original 2014 Onion6 square-form protocol is recoverable from a later archived HTML snapshot, including the exact relative POST endpoint, four parameter names and the **response listing three numbered image links**. The response is an already documented **Liber Primus first-release continuation (LP1 pages 14–16)**. It supplies **no additional LP2 decrypting key, unreported destination, original-cipher transform or secret server validation algorithm**. Director issue [#200](https://github.com/FlareZ123/liber-primus/issues/200).

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

## Decision and exact reproduction

A human player would paste the squares, publish an onion upload service and receive the three first-release pages. That is the **complete surviving actionable route**. Any stronger assertion that the form also emitted an LP2 cryptographic key would require a different authenticated response capture or original server implementation; neither is supplied by the known form or the three-page follow-up.

The [single runnable source contract](../sims/cicada2014_onion6_form_response_sft.cjs) asserts the two stored original Git blob SHA-1s, source `method`/`action`, all four field names in source order, **all 3 image URLs**, and all three original numerical square orders, rows, columns and diagonals. No trial keys or cryptanalytic settings were searched.

**Research consequence:** retire the form POST as a missing LP2 key-generation dependency. The historical 7×7/5×5 squares are established as input to this online puzzle protocol. An LP2 decoding operation must have separate author-visible support and an independently verified original-cipher consequence.
