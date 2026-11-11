# Historical 2014 prime-gap / Onion7-title source bridge

## What the original artifacts jointly show

The preserved PGP clear-signed 2 May 2014 Stage11 redirect contains structured whitespace. Read consecutive **leading and trailing** ASCII-space runs of the clear-signed message's body, counting a whitespace-only line once and retaining the five-space indentation of the onion address. The sequence is

`2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37`.

It is the ascending list of the first **twelve primes through 37 with 19 alone omitted**. If the address indent is discarded, 5 also disappears; therefore the extraction rule must explicitly include leading indentation. The sequence is an exact *preserved archival byte pattern* and is independent of the ciphertext.

**Important signature limitation:** OpenPGP cleartext signatures discard trailing spaces and tabs before signing/verifying ([RFC 4880 §7.1](https://www.rfc-editor.org/rfc/rfc4880#section-7.1)). Therefore the 2/3/7/11/13/17/23/29/31/37 trailing or all-space line widths are **not cryptographically authenticated by the Cicada signature**, even though the clear-signed armored text preserves them. Only the five-space indent preceding the nonblank onion address survives canonical signature hashing among these runs. The executable SFT constructs a changed armored text with 19 spaces substituted for an original three-space blank line: its canonical signed body remains byte-identical. The exact original archival byte hash confirms what the repository preserves; it does not bind the whitespace channel to Cicada’s private signing key. The absence of independent byte-identical May-2014 transport records for this whitespace means the intended prime-gap channel is materially less certain than the signed literal words.

The May 2014 onion host named in that signed handoff is `ky2khlqdf7qdznac.onion`. Its independently preserved historical `index.html` has `<title>133</title>` and `<div id="331">`, and image links `0.jpg` through `57.jpg`. The title is **133 = 7 × 19**, combining a prime that is *present* in the signed whitespace list, 7, with the uniquely omitted 19. The HTML contains the literal `19.jpg` link. Separately, 133 reverses to 331. These are exact arithmetic/source relationships.

The source copies are pinned before analysis:

- Signed handoff: `resources/historical/cicada2014-stage11-message.asc`, Git blob `e2b7382ac2cfb0adfe028cc063fc6048e0ad718e`. The signed body itself names the onion host.
- Contemporaneous onion index: original `micheloosterhof/cicada-2014` commit [`19d68fbb9cff1c06d52cc0add30285199c936282`](https://github.com/micheloosterhof/cicada-2014/blob/19d68fbb9cff1c06d52cc0add30285199c936282/stage11/ky2khlqdf7qdznac.onion/index.html), Git blob `303db130705f0ef9be2a738f4336d5cfcebde80c`. Preserved byte-for-byte here as [original HTML](../resources/external/cicada2014-stage11-onion7-original-index.html); independently present with the same Git blob in `krisyotam/cicada3301`.
- Exact executable source extraction: [`sims/cicada2014_signed19_onion7_source_gate_sft.cjs`](../sims/cicada2014_signed19_onion7_source_gate_sft.cjs). Checks pinned Git-blob hashes, all eleven space runs, the single omitted prime, title/div, reversal, all 58 image links, and the 133 = 7 × 19 relation. An address-indent mutation alters the signed canonical body; a blank-line mutation demonstrably does not. The source extraction assertions were run on the authentic repository bytes in this invocation.

## What this changes

This is a **newly connected, exactly documented archival-byte relationship** within a 2014 source chain, with the crucial caveat that the whitespace sequence is outside the OpenPGP signature's cryptographic coverage. The omission of 19 is visible *before* consulting the destination index, and the index's title is not fitted by searching LP2 ciphertext. Conditionally, if those whitespace bytes reflect the original delivered file, it motivates a human solve-path hypothesis: the signed prime-list gap may prime the solver to factor the arriving `133` and inspect `19.jpg`.

The strongest objections are **unbound trailing whitespace and nonuniqueness of interpretation**. The HTML title `133` already has a competing human-accessible construction from `1033` by zero deletion; `331` likewise comes from `3301`. That independent 2014 explanation existed before the onion-index snapshot, and no original instruction explicitly says to factor 133, use the missing prime as a filename, or apply a cipher to image19. Its factorization therefore cannot be treated as proof of author intent. The index links every image from 0 through57, so the mere presence of `19.jpg` is an ordinary property of the site, not a withheld confirmation.

## Original target and stopping condition

The candidate target `19.jpg` corresponds to LP2 physical p19 and archive source scan `36.jpg`. That original page has 271 ciphertext runes and ordinary black runes with no exceptional large red initial or authenticated keyed decoding instruction. Merely extracting page19, shifting by 19, or guessing a more elaborate book code would be a self-selected operation.

The next justified **decisive** test requires a source-native operation specified independently of page19 ciphertext. One plausible historical tool is OutGuess, previously used throughout Cicada puzzles: the fixed password `19` on `19.jpg` could be tried **once** with an authenticated signed-payload detector. This operation is only a proposed low-cost probe; **no keyed OutGuess run was executed here**, so it is neither positive nor negative. Do not broaden into passwords 7/133/331, all image carriers, or arbitrary key-derivation strings without new clue support. If the exact source-guided run yields an authenticated payload, use its content as a key/decoder. Otherwise retire that single extraction and retain the numerical observation as a clue candidate.

**Status:** exact preserved archival-byte relationship established, but the critical whitespace is not signature-bound; page19 target speculative; no unknown Liber Primus plaintext, authentic key, reversible decoder, or final destination recovered.
