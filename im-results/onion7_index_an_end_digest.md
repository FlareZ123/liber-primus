# Archived seventh-onion HTML and its id=331 content are not the direct AN END digest preimage

**Decision (16 November 2026):** a source-motivated extension of the original seventh-onion page test remains negative. No unknown plaintext, algorithm, secret key, or intended destination was recovered.

## Why this page is a motivated candidate

The archived 2014 distribution index has title **133**, a containing element with **id=331**, and 58 sequential JPEG references. Those two numbers recur in the solved p57 parable's word-sum structure; the 2014 5×5/3301 NUMBER-factor reading also yields the phrase **TOWARD ID**. This makes the original page and its id=331 element a reasonable, tightly bounded candidate for the p56 deep-web page—not proof that this distribution index is the requested page.

The exact source is [resources/cicada2014-onion7-index.html](../resources/cicada2014-onion7-index.html): **1,640 original LF-terminated bytes**, Git blob SHA-1 `303db130705f0ef9be2a738f4336d5cfcebde80c`. The solved p56 source prints:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

## Frozen candidates and results

The source HTML itself, its DOM element, and the actual image payloads provide three distinct page representations. The 58 referenced files are tested in exact display order: index references 0.jpg–57.jpg map to the repository's original LP2 images 17.jpg–74.jpg.

| Candidate bytes | Length | SHA-512 |
|---|---:|---|
| Exact original HTML | 1,640 | `83e50c118edb70dc34c9c760e332830a066b82006ebbbdcc7347b818d1961a571f32ef5a3717e98e282754d4a004dc0f7f0d99fb3824bb1b281a947c7ba70a31` |
| HTML with CRLF line endings | 1,705 | `bda44471e7351f8d4912ffc9658aa26609ac682c6b4a49e1b63071c18f81bcf88ebb2f392f6c65306892634d702f6bbf78073eef977218dbee39a157b8d679a5` |
| HTML with trailing whitespace trimmed | 1,639 | `3f32f72b777371ca9c1aa6c240a7b6b05e820f123fb4c534ef7150426258acdbf576057132c32ce826679a726515302479f9ef4229fe897334283b39c618f36b` |
| id=331 div, inclusive | 1,577 | `f0241399337616cb25f3b59ec19a351418da61945a0ea85a6f8d79f796a4a0406f00be860871c06aa5cbe3688619e544baf53d3b52e7e778eadd4636e465c684` |
| id=331 inner HTML | 1,557 | `a92b0a7928dcf89009e937cfc70b75b2a975e0c05df32399c23ddb09169ca1abd24f290f1543ad51b20544dcbebd99cc875596a34085c1da9c3e7f83af72edbb` |
| 58 JPEG payloads concatenated in display order | 35,362,230 | `527c81dcf2b0efb4e62c1fad28cd80c86723c8ded52b39a07742bcc300604a3205bb60080d51aa1d70dce82ac5394d2fec3758b242362c8ac57ef0473d1fcc50` |

All six byte candidates fail **SHA-512, SHA3-512, and BLAKE2b-512**: **18 exact comparisons, zero matches**. The concatenated-image serialization is a plausible page-content interpretation, not a claim that browsers or the original server used this as a canonical byte representation.

The exact gate [sims/onion7_index_an_end_digest_sft.cjs](../sims/onion7_index_an_end_digest_sft.cjs) asserts the source HTML fingerprint, DOM-fragment lengths, all 58 image inputs, the concatenated image fingerprint, all 18 digest results, and zero target matches.

## Scope and next useful input

This excludes the direct interpretation that p56 hashes the original seventh-onion index, its id=331 element/inner HTML, or the 58 referenced JPEG payloads concatenated in display order, under these three common 512-bit algorithms. It does **not** exclude a different downstream page, another page containing id=331, an original HTTP response with headers/transfer encoding, a distinct serialization, another hash algorithm, or a secret transformation. The manuscript still does not specify the digest algorithm or byte contract.

The most useful remaining test is not another serialization of this same page. It is a source-dated raw response from the private 2016 crawl, checked for the p56 digest and for the independently motivated title/id markers. That request remains subject to maintainer approval; no contact has been made.

**Reproduce:** run `node sims/onion7_index_an_end_digest_sft.cjs` from the repository root. The existing manual workflow is [onion7-page-index-manual.yml](../.github/workflows/onion7-page-index-manual.yml).
