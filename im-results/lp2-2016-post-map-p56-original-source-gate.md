# 2016 post-map / AN END target: no captured continuation in the original 4gq25 witness chain

**Source-acquisition decision, Agent49, 11 November 2026.** No previously missing LP2 plaintext, source-defined hash algorithm, authenticated page 56 target, original recipient-specific map response, or cryptographic key was recovered. This report addresses [director task #215](https://github.com/FlareZ123/liber-primus/issues/215). It is a **bounded historical witness negative**, not a proof that the unknown deep-web target never existed.

## Actual contemporaneous sequence

The 2016 Cicada Twitter post [status 684596461628223488](https://twitter.com/1231507051321/status/684596461628223488) (5 January 2016) pointed to the uploaded file **`https://infotomb.com/4gq25.jpg`**, not to an authenticated Tor map service. The original JPG is 26,342 bytes. Its default OutGuess extraction is a 1,136-byte PGP clearsigned message, signed 1 January 2016 and verified under Cicada's established `7A35090F` key; this message says the book's words are a map, meanings a road, and numbers the direction, but contains **no hash algorithm, address/host of a next target, URL path, HTTP form, input key, source-frozen coordinate grammar or additional file request**. The exact bytes, signature and independent mirror comparison are retained in [the pre-existing canonical 2016 source record](../resources/cicada2016-4gq25.md).

The *original* contemporaneous participant archive by [Michel Oosterhof, Jan 6 2016](https://github.com/micheloosterhof/cicada-2016/commits/master/stage01), provides only:

- `4gq25.jpg` (source image)
- `4gq25.jpg.outguess` (the signed message above)
- `README.md` (a three-step wget→OutGuess→GPG walkthrough)

The archive's commits for this directory are [2016-01-06 05:11:40 UTC (step1)](https://github.com/micheloosterhof/cicada-2016/commit/a4c72e7207e2dac8dc473b6e705e7ba75141e8b1), [05:13:11 UTC (outguess)](https://github.com/micheloosterhof/cicada-2016/commit/b065f188b0cff567995057861390be62012740ca), and [05:19:05 UTC (done)](https://github.com/micheloosterhof/cicada-2016/commit/187ae28d21a7e42a14637bf95b77286a2193a1b8). That final commit contains no subsequent captured HTTP map response or digest target. The distinct [scream314 original 2016 documentation](https://github.com/scream314/cicada3301/blob/master/2016.md) likewise ends at the *same* source image and extracted signed words; it gives the Jan 5 tweet ID and original `infotomb` link, with no independent post-map artifact. The broader [neuroretransmit archive's 2016 directory](https://github.com/neuroretransmit/cicada/tree/master/2016) contains only `4gq25.jpg` and `4gq25.jpg.asc`, the same 2016 message family.

## Independent contemporaneous negative and a concrete false path

The archived [Jan 7–8, 2016 /x/ participant thread](https://4chanarchives.com/board/x/thread/17183963/post-all-your-cicada-3301-clues-here) first repeats the original Jan 5 tweet and Infotomb URL. Its **Jan 8 18:42:09 UTC** source summary explicitly says the signed OutGuess message is the only confirmed clue they have and advises returning to Liber Primus. This is a *dated participant report*, not an omniscient certificate that no other observer had a response. It is independently consistent with the original Jan 6 archive containing no post-map service step. The same thread discusses an unrelated π-themed `.mobi` countdown and alleged `.onion` video. Those are **participant-introduced, unsigned third-party leads** lacking an original image/tweet link or original Cicada PGP authentication. Do not promote them to a p56 hash target or a GPS map continuation.

The [later public archive of the 2017 signed warning](https://github.com/iBotPeaches/cicada_3301/blob/master/messages/2017/beware-false-paths.asc) provides only a warning to verify the `7A35090F` signature. It does not identify the unknown p56 page, a digest algorithm or the address of a 2016 response.

## Exactly what remains missing

The solved [AN END p56 digest](../im-results/archive-hash-preimage.md) contains **128 hex characters**, specifying a value of 64 bytes, while the plaintext merely describes a page “that hashes to” those bytes. The 2016 JPG message supplies **neither the digest algorithm nor the target-page byte serialization**. Existing finite source-native hash comparisons against publicly held 2012–2014 blobs, table values and contemporary archive captures are negative; the external prior art already covers far more than the local small corpus. This issue deliberately **did not run new hashes**, enumerate onion names, guess URLs, infer a `.onion` address from digest bits, or call an unsigned 2016 `.mobi` site an answer.

To reopen this route, a dated original 2016 participant capture must provide at least one of: (a) an authenticated **post-map server response**, (b) the **byte-exact object** reportedly pointed to by p56 plus the creator-selected 512-bit digest algorithm/serialization, or (c) a **new PGP-signed instruction** fixing a unique LP2 page/word address and a reversible operation. Any such candidate should be checked once for the **full 128-character digest equality** when its algorithm is independently supplied and should produce actionable new content. The original Jan 6 preservation and Jan 8 participant witness do not contain one.

**Decision:** Close #215 at the finite historical-source threshold. This is not a newly solved page or destination. The residual dependency is a **missing independently authenticated target artifact or map-grammar response**, rather than further permutations of a public image or the existing signature.
