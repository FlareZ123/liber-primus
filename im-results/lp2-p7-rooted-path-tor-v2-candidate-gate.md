# p7→189 Tor-v2 serialization candidate: matched-null and archive decision

**Agent11, 24 November 2026. Classification: negative for this specific destination claim; no plaintext or key recovered.** This evaluates only the frozen candidate **hxazsilqjcq5n555**. No alternate path encodings, address fishing, active service contact, or network probing were performed.

## Frozen source path

The input is the original 32×8, 256-cell table in [base60-grid.json](../resources/liber-primus/base60-grid.json). The conditional base59 reading removes lowercase f from the printed alphabet because f is absent from all 256 original tokens. This is not a globally authenticated radix: the conventional base60 reading remains a competing interpretation.

Under the frozen successor map, next(i) = decoded value at table address i, the p7 five-dot coordinate proposal gives start address 61 = 7×8+5. Its base59 path is:

**61 → 193 → 153 → 33 → 112 → 72 → 161 → 214 → 247 → 189 → 189**

The ten distinct visited values, in order, are the bytes **3d c1 99 21 70 48 a1 d6 f7 bd**. RFC 4648 Base32 encodes those ten bytes as **hxazsilqjcq5n555**. The same start under conventional base60 instead has an 18-vertex path, so the ten-byte candidate depends on the conditional base59 parse and the previously inferred p7 row/column mapping. Neither the radix nor the serialization operation is explicitly authenticated by the original manuscript.

## The Tor-v2 format match is automatic, not validation

The historical [Tor v2 specification](https://torproject.gitlab.io/torspec/rend-spec-v2.html) defines a .onion hostname as a 16-character Base32 encoding of a 10-octet value: the first 80 bits of the hash of the hidden service's public key (section 1.5). Thus **every arbitrary ten-byte sequence** produces a 16-character string of the right length and alphabet. The format supplies no checksum that authenticates these path bytes.

To establish an actual historical service, the candidate would need an associated public key or descriptor whose public-key hash begins with these exact 80 bits, or a source-authenticated Cicada artifact naming the exact hostname. No such key, descriptor, signature, or response body was found.

## Path-length controls

The original base59 map has **8 of 256** starting addresses whose path contains exactly ten distinct vertices before its first repeat. The p7 start is one of those eight. The ten-vertex length is therefore not unique in the original map.

Two deterministic, source-matched controls were run:

| Control | Trials | Observed quantity | Null result |
| --- | ---: | --- | ---: |
| Uniform permutations of the exact 256-value target multiset, Fisher–Yates with rejection-sampled indices, seed 0x33012423 | 250,000 | Number of starts with path length 10; observed 8 | Mean 8.3511, SD 7.0473; 51.2068% of controls had at least 8 |
| Same fixed multiset, conditioned on the proposed fixed root 189, via uniformly shuffled Prüfer sequences for the exact induced tree degree sequence, seed 0x33012424 | 100,000 | Number of vertices at depth 9; observed 8 | Mean 8.8324, SD 5.0468; 54.072% of controls had at least 8 |

For the particular start 61, path length 10 occurred in **3.0796%** of the unrestricted multiset controls and at depth 9 in **3.261%** of the root-189 tree controls. These are post-discovery diagnostics, not familywise p-values. They show that the observed count of eight ten-vertex paths is ordinary under both matched controls, and that the p7 path length is not a highly discriminating signature. In the conditional tree control, the exact original target multiplicities are preserved: c[189] = 4; the Prüfer sequence contains c[v] copies for v ≠ 189 and c[189]−2 copies of root 189.

The full deterministic implementation is [lp2_p7_rooted_path_tor_v2_candidate_gate_sft.cjs](../sims/lp2_p7_rooted_path_tor_v2_candidate_gate_sft.cjs). It asserts the original path, byte serialization, competing base60 path, and both null experiments.

## Passive historical archive check

The pinned [pnotisdev Phase52 Wayback CDX export](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase52/cdx_results.json) (commit 15200c67abee106913ba01ff504c5b6e88d16cc7; blob d7cb7122b06d55dcd83a0793879284b9aa43acc1) was parsed in full. It contains 862 query keys, 15,289 CDX rows, 71 URL hosts, and 34 candidate 16-character onion labels. **hxazsilqjcq5n555 appears in neither a query key nor any URL value.** This is a Wayback CDX metadata export, not a Tor hidden-service descriptor archive.

The preserved [signed 2014 Stage11 message](../resources/historical/cicada2014-stage11-message.asc) names **ky2khlqdf7qdznac.onion**, a different service. The associated [original Stage11 page index](../resources/external/cicada2014-stage11-onion7-original-index.html) contains image filenames, not the candidate hostname.

The Tor Project's [CollecTor documentation](https://metrics.torproject.org/collector.html#tor-hidden-service-descriptors) explicitly says hidden-service descriptors are **not formally archived**. Consequently, there is no official historical descriptor archive in which to authenticate this candidate. The negative CDX result does not prove that the address never existed; it establishes only that the checked public index and authenticated 2014 source do not corroborate it.

## Solve-path assessment and decision

The human-solver hypothesis was plausible enough to test: a solver notices the p7 five-dot mark, follows the conditional p50 base59 successor map, obtains ten bytes, and recognizes the historical 80-bit Tor-v2 identifier format. A real Cicada continuation would be distinguished by an authentic public key/descriptor matching the bytes or a signed source naming the address. The affordable decisive tests were the fixed-multiset path-length controls and a passive query of the pinned historical CDX/service sources. Neither produced independent authentication.

**Retire the exact p7→189→Base32 address hypothesis as a Cicada destination.** The 16-character format follows automatically from the ten-byte output; the path-length event is not discriminating under the matched controls; the candidate is absent from the checked historical index and authenticated 2014 message; and no public key or descriptor exists to verify the required hash. Do not search alternative encodings or addresses, or contact the unknown service. No unknown LP2 plaintext, key, complete cipher, or intended destination follows from this candidate.

This is a scoped negative for this receiver, not proof that no other historical service or continuation exists. It addresses the frozen test in Director Issue [#2614](https://github.com/FlareZ123/liber-primus/issues/2614); the issue remains for the Director/claimant to adjudicate.
