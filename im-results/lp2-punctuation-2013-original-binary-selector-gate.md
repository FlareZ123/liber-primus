# 2013 Cicada whitespace binary and the LP2 punctuation-selector gate

**Director #892, Agent16, 14 November 2026.** Recoverable period-authored older decoder, **no independently selected LP2 punctuation decoder, unknown plaintext, key or destination.** This stops at the stipulated source-selector gate without running a Morse/ASCII grid sweep.

## A genuine previous Cicada operation

The archived [2013 Cicada signed carrier](https://github.com/krisyotam/cicada3301/blob/main/pgp/messages/2013-01-rune-table-morse.asc) contains four whitespace-only content lines. Its exact Git blob is `297c1dfee74ff79acc2d944952d06d1012928803`. Preserved line lengths **240, 200, 80, 32** yield **552 whitespace characters = 69 octets**. Map tabs to 1, spaces to 0, then read literal eight-bit ASCII in printed order:

```text
Come to emiwp4muu2ktwknf.onion
We shall await you there.
Good luck.
3301
```

The original 2013 account explicitly documents the same tab/space conversion and onion output: [recipient-side walkthrough](https://connortumbleson.com/2021/01/25/the-cicada-3301-mystery-puzzle-2/). [Source-pinned single-file reproducible positive](../sims/lp2_2013_whitespace_ascii_punctuation_selector_sft.cjs) passed [manual CI 43607023164](https://github.com/FlareZ123/liber-primus/actions/runs/43607023164), recovering the entire expected message. The archival filename `rune-table-morse` is misleading: **this is binary ASCII, not Morse**. The file's armored PGP signature is a distinct issue: the 552 symbol characters occur entirely as trailing spaces/tabs, which RFC4880 canonicalization removes before signing. The signature therefore does *not* authenticate those 552 bits. The complete 2013 onion instruction and independent original-period recollection establish the practical historical decoder, while the exact original whitespace bytes remain a source-witness claim.

## LP2 source gate and no-selected-decoder conclusion

The original-JPEG-audited LP2 punctuation inventory establishes **138** four-dot diamonds, **five** three-dot zigzags, **28** red thirteen-dot stencils and **three** ten-dot stencils among unknown pages, plus a small ambiguous glyph; separate image audits remove four editorial p15 marks and one absent p37 derivative stop. The source classes are **not literally tabs and spaces**. No author-signed 2012–2016 instruction fixes a four-dot-to-bit assignment, treatment of the three-dot zigzag, whether red ten/thirteen-dot ornaments clock state or delimit bytes, or the grouping interval. The 2016 signed `words are the map` message does not name a punctuation-code alphabet. Original solved p56 is an independent negative for a mandatory punctuation consumption/reset in its known prime-totient cipher: its inner ornaments are passed through to obtain all 85 runes.

The earlier [historical punctuation notation gate](lp2-punctuation-identity-stream.md#pre-2014-historical-notation-gate-issue-456) already tests pre-2014 Unicode/Menota candidate shapes: generic punctuation analogues without an operating rule. The **additional author-era binary transport precedent** above is stronger than a random Morse analogy, yet it selects only **literal tab/space** input for that earlier carrier. Using its code on LP2 would require fitting at least two missing inputs (bit classes and byte grouping), plus red ornament semantics. We therefore **retire the direct historical punctuation-code route as unselected**, with no ciphertext readout. Reopen only upon a first-party clue that fixes those missing inputs and predicts an entire held-out original-punctuation instruction or period-valid onion address. No parameter search is justified.
