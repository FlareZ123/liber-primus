# 2014 Stage11 handoff whitespace: non-invariant prime-run observation and bounded key test

**Status:** intermediate source observation; not a decryption, key recovery, or established LP2 instruction. The direct p56-style prime-stream interpretations tested below are rejected.

## Source and signature audit

The local clear-signed handoff is preserved at `resources/historical/cicada2014-stage11-message.asc`. A separate copy exists in the upstream [neuroretransmit/cicada archive](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/010-hidden-service-reply) as `message.txt.asc`.

GPG verification of both copies returns GOODSIG/VALIDSIG under Cicada fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`, with signature timestamp **2014-04-02 08:49:51 UTC**. The independently preserved Stage10 v2 form also verifies under the same key, timestamp **2014-01-25 08:26:57 UTC**.

The local copy's nonzero contiguous space-run sequence in the signed-message body is:

`2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37`.

The upstream copy instead yields:

`2, 3, 5, 6, 11, 13, 17, 22, 29, 31, 37`.

Both copies preserve **five leading spaces** before `ky2khlqdf7qdznac.onion`; these leading spaces are included in the cleartext signature. The differences (7 versus 6 after the onion address; 23 versus 22 after “Good luck.”) occur in trailing whitespace and whitespace-only lines. OpenPGP cleartext-signature canonicalization strips trailing whitespace, so these varying runs are not authenticated by the signature. The apparent “first primes with 19 omitted” pattern is therefore **not invariant across preserved copies** and cannot be treated as an author-authenticated key stream. The five-space prefix is authenticated, but no source specifies an operation or LP2 receiver for it.

The cited `scream314/hints_never_used.md` and the neuroretransmit README are community archives, not Cicada-authored signed instructions. The neuroretransmit archive's `cgi/cgi.py` and `cgi/key.asc` are explicitly described by its own README as a mock CGI and example solver key, never used in the real puzzle. Its reported GET/POST access log and May 2 delivery date are unsigned community evidence; the signed reply timestamp is April 2. The signed reply itself contains only the generic next-onion address, not an individualized LP2 key or decryption instruction.

## Discriminating test

The earlier hypothesis was: the missing prime value 19 instructs the solver to omit 19 from the consecutive-prime key stream used by the solved p56 prime-totient cipher, while retaining its source-verified plaintext-F-transparent rule. For a plaintext-F symbol, emit F without consuming a key value; otherwise decrypt by subtracting `(p-1) mod 29`. This was the simplest direct use of the observed prime list as a global key-clock selection.

The exact reachability dynamic program used by the p56 F-transparent control was applied to the original `resources/liber-primus/lp2-corpus.json`, grouped into the eight unresolved source-visible chapters p0–2 through p40–53. It searched all 5,000 starting prime-key indices (0–4,999), allowing every legal plaintext-F nonconsuming branch.

- **Prime-totient stream with prime value 19 omitted:** zero complete legal inverses for all eight chapters.
- **Direct-prime stream with prime value 19 omitted:** also zero complete legal inverses for all eight chapters.

For the prime-totient variant, the best reachable prefixes were 674/729, 498/1,145, 524/1,729, 559/1,903, 553/1,021, 642/1,433, 594/1,680 and 648/3,008 runes respectively; none completed. At source start index zero the reachability vector was 235, 123, 80, 7, 0, 22, 31, 20, compared with 235, 22, 30, 10, 0, 95, 58, 38 for the unmodified prime-totient stream. The mixed changes are not plaintext evidence.

The positive control remains the independently verified p56 decryption; the full-prime 5,000-start negative is documented in [the existing F-transparent chapter gate](lp2-p56-native-F-transparent-ninechapter-impossibility.md) and its [reproducer](../sims/lp2_p56_phi_ftransparent_5000start_sft.cjs).

## Conclusion and next decision

The direct interpretations “omit prime 19 from the p56 prime/totient stream” are rejected across the tested 5,000 start offsets. More fundamentally, the trailing-space prime sequence is not stable across independent preserved copies and is not authenticated by the cleartext signature. Do not continue treating it as a reliable key. The only stable authenticated whitespace feature is the five-space leading indentation, for which no source-selected decoder or LP2 receiver is known. Revisit this branch only if independent evidence supplies that missing operation; do not rescue it with arbitrary transformations.
