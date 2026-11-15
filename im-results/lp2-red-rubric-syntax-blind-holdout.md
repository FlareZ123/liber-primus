# Red-ink rubric syntax: p0–39 grammar and p53 blind exception

**Decision, 15 November 2026, Director #1172.** A source-frozen two-form grammar describes all **13 red-rune spans on physical LP2 pp0–39**, but fails on **one of three untouched pp40–55 spans**: the original p53 51-rune red passage at local offset128 has neither a page-initial position nor an opening red 13-dot mark. The two solved red headings demonstrate that identical typographic roles can be encrypted under different registers. This source syntax yields **no author-selected opcode, key, reset state or black-rune inverse**. No previously unsolved rune was deciphered.

This rejects the specific two-form instruction grammar. It does not demonstrate that p53 is meaningless or that no unknown-page rubric could carry an instruction.

## Fixed source and semantic controls

Original JPEGs are LP2 physical p0–57 = scans 17.jpg–74.jpg. The derived [original-ink annotations](../resources/liber-primus/lp2-ink-annotations.json) were validated against the complete [GP29 corpus](../resources/liber-primus/lp2-corpus.json). The register holds **18 red spans, 225 red runes, 30 red 13-dot marks, one black 13-dot mark, four red 10-dot marks and one red 23-dot mark**. Original [stencil geometry](lp1-lp2-red-stencil-cross-release.md) independently establishes distinct punctuation shapes. A [read-only CommonJS SFT](../sims/lp2_red_rubric_syntax_holdout_sft.cjs) validates all source glyphs and counts; the identical classification and its assertions **passed in memory on freshly fetched source JSON**.

The first **p0–39** section alone determines the syntactic productions:

- **HEADER:** red text begins at page-local rune offset zero; a following red 13-dot may occur but is optional.
- **ASIDE:** a noninitial red span has a red 13-dot at both its exact beginning and ending offsets.

Both are plausible visual treatments of headings or separate rubrics. Neither grammar production includes a value-changing GP29 opcode, finite key or initial cipher state.

## Blind holdout

| Source division | HEADER | ASIDE | Unparsed | Total |
| --- | ---: | ---: | ---: | ---: |
| Unsolved p0–39, syntax frozen here | 7 | 6 | 0 | 13 |
| Unsolved p40–55, untouched syntax holdout | 2 | 0 | **1** | 3 |
| Authentically solved p56–57, semantic controls | 2 | 0 | 0 | 2 |
| **Total** | **11** | **6** | **1** | **18** |

The one holdout exception is original **70.jpg**, physical p53: a long **51-rune** red verse begins after **128 black runes**, ends at offset179 in a red 13-dot mark, and has **no red 13-dot at its beginning**. The original image visibly confirms the separate red verse. P40 and p54 have page-initial red headings. The original p8 and p40 headings also lack a trailing red 13-dot, so 13-dot cannot be a mandatory delimiter for *all* red spans.

None of the four red 10-dot marks touches the start or end of any red span. Original source positions are **p36:99, p38:186, p49:66, p56:45**. They delimit numbered paragraphs or transitions into a numerical table or digest, as separately documented in the source stencil audit. Thus a universal red command framed by an opening 13-dot and a closing 10-dot has **zero original instances**.

## Solved-register objection to an executable opcode grammar

Solved p56 has a five-rune red printed title **AEJOESR** corresponding to known plaintext **AN END**, encrypted under the actual prime/totient system with plaintext-F handling. Solved p57 has a seven-rune red printed title **PARABLE**, itself directly readable plaintext. Both red titles are followed by a red 13-dot separator. Their different known cipher treatments prevent identifying a uniform red-code alphabet or cipher-mode reset merely from red color or punctuation.

The two isolated p3/p39 red triples have already been tested under genuine solved LP1 Atbash to provisional readings **SCY** (possible SKY) and **UDP**. Prior [complete red Atbash tests](lp2-all-red-original-atbash-gate.md) find no third independent command, and the [red119 source analysis](lp2-p3-p39-red119-atbash-sky-udp.md) has no recovered key. Those patterns were not retuned here.

## Cryptanalytic decision

The two productions parse all training material but cannot process the original p53 red passage without an additional syntactic class. Allowing arbitrary unmarked red spans admits every example while **providing no opcode framing, argument layout or finite key**. Even a perfect color-label parser is not an instruction decoder. A concrete executable grammar would require an **independent author-supplied mapping** from a complete original rubric to a reversible GP29 operation with a finite key/clock, then coherent withheld black-rune plaintext and exact forward re-encryption. No such mapping is currently present.

Reproduction: [sims/lp2_red_rubric_syntax_holdout_sft.cjs](../sims/lp2_red_rubric_syntax_holdout_sft.cjs) checks every source red span and its exact GP indices, mark counts, the frozen 13/3/2 split, p53 failure, and both solved title glyphs. No automatic CI trigger or speculative decrypt was added.
