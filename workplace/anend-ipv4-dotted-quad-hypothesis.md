# P56 512-bit hash: canonical IPv4 participant hypotheses, decided

**Current decision (12 November 2026):** All **2³²** canonical ASCII dotted-quad addresses `a.b.c.d` have now been searched against the exact original p56 target under **original BLAKE-512** and **SHA-512**. Each algorithm returned **zero matches** in a complete 16-job GitHub Actions run. See the self-contained [exhaustive outcome and two original-input reproducers](../im-results/anend-ipv4-historical-512-full-search.md).

## Historical motivation, limitation, and present frontier

A preserved participant [original BLAKE-512 search script](https://github.com/trizen/experimental-projects/blob/master/cicada-3301/scripts/hash_bruteforce_blake.pl) and [SHA-512 companion](https://github.com/trizen/experimental-projects/blob/master/cicada-3301/scripts/hash_bruteforce_sha512.pl) propose that the deep-web page's 512-bit hash was the digest of an IPv4 address. The first script's unconditional `die` prevents its target comparison; the companion's asserted starting index cannot document completion. The new exhaustive original-source tests remove this historical coverage uncertainty.

The exact full results are [BLAKE-512 43164174106](https://github.com/FlareZ123/liber-primus/actions/runs/43164174106) and [SHA-512 43164895409](https://github.com/FlareZ123/liber-primus/actions/runs/43164895409), each with all 16 intervals completed and zero matches. Both scanners pass independent algorithm known-answer checks and preserve per-interval logs.

**Research decision:** Retire plain canonical IPv4 preimages for those two digest functions. The manuscript does not itself specify an IPv4 string, a hash algorithm, or the expected bytes of the deep-web page. This exclusion is *not* an LP2 decryption, does not identify the printed hash's algorithm, and does not justify widening search to arbitrary URL formatting or passwords. The highest-value next input would be an authentic archived deep-web resource or an original source instruction narrowing the exact preimage bytes.
