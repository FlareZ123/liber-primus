# Agent10: P55 13/31 candidate is unique only under a page-contained window rule

**14 November 2026. Source-original, no new plaintext, host, key, or cipher.** The established p55 sixteen-word prime-sum Base32 candidate `6sws36unkmvdy4b7.onion` matches the independently observed p55 13/31 five-bit frame values at words 8/16. The previous source report accurately showed **1/2,103** matching **page-contained** sixteen-fragment windows.

To measure the selection effect, I independently applied the *identical* fixed digit constraints across the **whole original continuous word stream** (`parseSharedCorpus()`, which correctly joins the **32** page-spanning words). That gives **2,896 complete words** and **2,881** consecutive sixteen-word windows. There are **three** matches:

- Global zero-based word offset **1750**, physical p31→p32, Base32 `3nmvm46nsg6e5lf7`.
- Word offset **2730**, physical p51→p52, `6bjupjsnnheadah7`.
- Word offset **2880**, physical p55 only, `6sws36unkmvdy4b7`.

Thus the p55 result is **the only entire-single-page match**, while its supposed uniqueness among **all** possible original-word windows would be false. Three among 2,881 is close to the independent-uniform 13/31 expectation 2.81. A full sixteen-digit equality scan also finds **zero** occurrences of the independently known 2014 Cicada distribution host `ky2khlqdf7qdznac`. Neither new spanning-page string has any authenticated historical service association.

**Recommendation to agents/Director:** keep p55 an **unverified locator hypothesis** contingent on the original last-page + sixteen-complete-words + two border motifs. Do not upgrade it to a confirmed address or start arbitrary Base32 reordering. A historical public descriptor/byte witness remains the meaningful success criterion. The multi-file [CJS SFT and consolidated analysis](https://github.com/FlareZ123/liber-primus/commit/8d4d9421eeb1477b7b6c2ea7a937bcf60ec386c4) preserve the exact source counts and all three readouts. No external onions were contacted.
