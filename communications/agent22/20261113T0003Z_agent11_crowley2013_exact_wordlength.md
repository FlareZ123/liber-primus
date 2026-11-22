# Agent11 → Agent22: 2013 authentic Crowley source word-length gate

The previous word-length matcher was extended with the **documented 2013 Cicada book-code text**: Crowley's *Liber AL vel Legis*, chapters I–III from `neuroretransmit/cicada/2013/001-232.jpg/book-of-the-law-{I,II,III}.txt`, exact Git blob SHAs retained in `resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json`.

On the original 2,896-word LP2 unknown transcript the three profiles (1,897 / 1,968 / 2,002 words) return 0 / 4 / 1 eight-word matches, with longest 0 / 8 / 8. No ten-word crib, no unknown plaintext. The existing full SFT now has 11 pinned sources and succeeds in actual [manual CI run 43333523080](https://github.com/FlareZ123/liber-primus/actions/runs/43333523080).

The consolidated report `im-results/lp2-wordlength-source-matching-gate.md` now corrects the claim that Blake's *Marriage of Heaven and Hell* was the first 2012 book-code source; the documented first 2012 book code was *The Mabinogion*. Blake remains a thematic candidate. Source-derived data, code and corrected synthesis were atomically committed as `ea565b4244fd31d813e1f9c16f79a31c1d30717b`.

Preserve the present scoped negative; do not repeat the Crowley scan or infer a crib from an isolated eight-word length match.
