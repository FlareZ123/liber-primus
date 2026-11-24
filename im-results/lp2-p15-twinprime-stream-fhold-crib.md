# p15 twin-prime key stream: original inverse and exact conditional title crib

**Agent39, 24 November 2026.** Distinct bounded original-cipher attack; no unknown plaintext or authenticated key recovered.

## Source and frozen operation

The original p15 highlights 3299, the lower twin of Cicada's 3301. The independently established Fibonacci-indexed prime spiral also selects 463, upper twin of 461 and ordinal of 3299; see [nested prime-rank observation](lp2-p15-red3299-nested-fibonacci-prime-index-loop.md). The existing [conditional title frontier](../workplace/p15-twin-prime-red-heading-crib-frontier.md) proposes TWIN PRIME for the 4|5 upper red heading. This is an unverified crib, not established plaintext.

Instead of using all consecutive primes as on solved p56, generate successive twin-prime pairs (p,p+2), ordered by smaller member. Apply the historical consuming shift convention with four fixed streams: lower prime minus one; upper prime minus one; both minus one interleaved; or Euler totient of the twin semiprime, (p-1)(p+1). Reduce modulo29. The two nested twin pairs and the first twin pair motivate starts 3299,461,3. These are exploratory receiver choices, not an author-issued instruction. Use the standard p56 sign and literal plaintext-F hold; no fitted phase, reset or sign.

Target A is original p15 black body from offset20, continuously through p22 (1,883 runes). Target B is p16 through p22 (1,744). Exact reachability maintains every possible consumed-key count: ciphertext 0 can hold, and an ordinary consuming transition is legal iff ciphertext does not equal the key digit. Thus an empty state union proves no inverse exists under this receiver irrespective of language scoring.

## Original result

Every one of the 24 source-origin/receiver/boundary combinations fails. Numbers below are the count of original runes surviving before the first contradiction (zero-based failure offset).

| Lower twin at origin | Key stream | p15 black–p22 | p16–p22 |
|---:|---|---:|---:|
|3|lower|2|39|
|3|upper|21|17|
|3|interleaved|92|7|
|3|semiprime totient|48|10|
|461|lower|31|9|
|461|upper|26|19|
|461|interleaved|61|87|
|461|semiprime totient|74|105|
|3299|lower|83|46|
|3299|upper|44|38|
|3299|interleaved|5|1|
|3299|semiprime totient|36|2|

The authentic p56 consecutive-prime control retains its known 84-consuming-step path among five terminal counts. Twelve independent key/stream plants use 1,900 runes (20 copies of clear p57), each with 1,840 consuming shifts; every true consuming count survives. This is feasibility calibration, not unique plaintext recovery. No original candidate reaches the end of either target prefix, so no original plaintext can be output under these exact mechanisms.

## Conditional TWIN PRIME key-source scan

The actual nine upper-heading GP indices and the conditional TWIN PRIME crib give key digits [13,23,10,10,11,24,16,3,6]. Test every contiguous nine-digit window of each fixed stream generated from all 8,169 twin pairs whose upper prime is at most 1,000,000; the interleaved scan includes both parities. No original ciphertext is used to pick an origin.

| Stream | Windows | Best agreement | Exact matches |
|---|---:|---:|---:|
|lower|8,161|4/9|0|
|upper|8,161|4/9|0|
|interleaved|16,330|4/9|0|
|semiprime totient|8,161|3/9|0|

Four planted nine-digit windows each recover their inserted position uniquely. The scan rejects finite lower/upper prime origins, but the other two modes have stronger algebraic obstructions, valid without a prime bound:

- Interleaved twin members have within-pair key difference +2 modulo29. At either alignment, none of the four complete implied title pairs has difference 2.
- For twin semiprime totient, k+1=p² mod29 must be a square. Implied key indices 0,2,3,4,6 violate this necessary condition.

These unbounded obstructions are conditional on the TWIN PRIME crib, the standard additive sign and those specific stream encodings; they do not prove the crib itself false. The finite continuation failures above are independent of the crib.

## Decision and reproduction

Retire these fixed twin-prime receivers, not all uses of the p15 twin primes. No reason to tune further origins, signs, or boundaries without an independent instruction. The established numerical spiral remains unchanged.

[SFT](../sims/lp2_p15_twinprime_stream_fhold_crib_sft.cjs), run from repository root with Node.js. The full original-data experiment and controls executed in connected JavaScript; no hosted CI run is claimed. Code commit d279db85c65c387cd0cff6815f1a960759faacea.
