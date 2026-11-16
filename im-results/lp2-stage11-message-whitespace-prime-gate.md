# 2014 Stage11 handoff whitespace: prime-run observation and bounded key test

**Status:** intermediate source observation; not a decryption, key recovery, or established instruction for LP2.

## Source observation

The raw clear-signed handoff is preserved at `resources/historical/cicada2014-stage11-message.asc`. Counting contiguous space runs in the signed-message body, including leading indentation, gives the nonzero sequence:

`2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37`.

This is the first twelve primes with 19 absent. The five-space run is **leading indentation** before `ky2khlqdf7qdznac.onion`; the other nonzero runs are trailing spaces on text or blank lines. Two visible lines have no trailing run. The cleartext-signature canonicalization removes trailing spaces/tabs, so those trailing counts are not authenticated by the PGP signature; the leading five-space indentation is retained. Treat the pattern as an observation in the preserved raw file, not as authenticated cipher instructions.

## Discriminating test

Hypothesis: the missing prime value 19 instructs the solver to omit 19 from the consecutive-prime key stream used by the solved p56 prime-totient cipher, while retaining its source-verified plaintext-F-transparent rule. For a plaintext-F symbol, emit F without consuming a key value; otherwise decrypt by subtracting `(p-1) mod 29`. This is the simplest direct use of the whitespace prime list as a global key-clock selection.

I applied the exact reachability dynamic program used by the p56 F-transparent control to the original `resources/liber-primus/lp2-corpus.json`, grouped into the eight unresolved source-visible chapters p0–2 through p40–53. I searched all 5,000 starting prime-key indices (0–4,999), allowing every legal plaintext-F nonconsuming branch.

- **Prime-totient stream with prime value 19 omitted:** zero complete legal inverses for all eight chapters.
- **Direct-prime stream with prime value 19 omitted** (the natural alternative if the whitespace counts are used as shifts rather than totients): also zero complete legal inverses for all eight chapters.

For the prime-totient variant, the best reachable prefixes were 674/729, 498/1,145, 524/1,729, 559/1,903, 553/1,021, 642/1,433, 594/1,680 and 648/3,008 runes respectively; none completed. At source start index zero the reachability vector was 235, 123, 80, 7, 0, 22, 31, 20, compared with 235, 22, 30, 10, 0, 95, 58, 38 for the unmodified prime-totient stream. The mixed changes are not plaintext evidence.

The positive control remains the independently verified p56 decryption; the full-prime 5,000-start negative is documented in [the existing F-transparent chapter gate](lp2-p56-native-F-transparent-ninechapter-impossibility.md) and its [reproducer](../sims/lp2_p56_phi_ftransparent_5000start_sft.cjs).

## Conclusion and next decision

The direct interpretation “omit prime 19 from the p56-style prime/totient stream” is rejected across the tested 5,000 start offsets. No unknown plaintext or key was recovered. The whitespace pattern may be a repeated prime-number motif or may select some other operation, but there is currently no source instruction connecting it to a page/rune/word indexing rule. Do not rescue this branch by adding arbitrary transformations; revisit only if independent evidence supplies such an operation.
