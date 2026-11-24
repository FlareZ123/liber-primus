# LP2 boundary-conditioned RAND / BASE29 packet capacity (#2490)

**Decision:** the signed 2013 octet-range packet grammar cannot directly explain the original unknown rune text with its printed words as integer fields, even allowing arbitrary secret digit permutations and arbitrary leading-zero padding. No packet or plaintext recovered. This is a specific structured-transport exclusion, not an exclusion of arbitrary binary payloads or layered encipherment.

## Independent source and explicit extension
The authenticated 2013 TCP challenge specifies RAND n: an acknowledgement, n independent random integers in 0..255, each on a separate line, and a terminal dot on its own line. BASE29 is a separate command converting an input integer to its canonical representation. See [signed historical protocol](../resources/external/2013-tcp-server-signed-source.md), [period witness](https://gist.github.com/navinpai/7837596), and the [participant log vectors](../resources/external/2013-tcp-live-test-vectors.json). The March 2013 log records RAND3 [151,207,64], RAND3 [91,172,47], RAND0 [], RAND1 [179], all positive controls for range and count. RAND itself uses decimal lines; combining its octet range and BASE29 is our hypothesized LP2 transfer, not a quoted author instruction.

Use the original unknown 12,956 GP indices, 2,896 complete printed words including 32 page-crossing words, physical large marks and confirmed four-dot full stops. Each word is an integer field; physical large marks or strict full stops terminate candidate packets. A generous variant stores the request count as the first field, requiring exactly that many subsequent octets. This embedded count is not part of the historical RAND response. No new alphabet fit, language score, coordinate search or secret state is assumed.

## Exact capacity theorem (new stronger padded range bound)
For any bijection of 29 glyphs to 0..28, a base29 integer <=255 must have all but its final two digits zero. Thus a field with n>=4 requires its first n-2 glyphs to be the *same glyph*, even if an adversary may choose an independent secret alphabet for every field. This is also sufficient for a single field: map the prefix glyph to zero and remaining distinct glyphs to small digits. A 1/2/3-rune word always has some individually chosen bijection that passes; for a 3-rune word its first symbol is forced zero.

For a **shared** secret alphabet within a packet, choose the zero glyph z. Retain eligible words with all prefix glyphs equal to z; singletons always fit. Group the other words by penultimate glyph. Every legal byte requires that glyph to be mapped to 0..8 (since 9*29>255). At most eight other glyph classes besides z may enter. Therefore the exact computable upper bound is the singleton count + eligible penultimate-z count + eight largest other eligible counts. Digit8 has one further constraint: its final glyph must map to 0..23. We test a constructive assignment of 8 and final high digits 24..28 to attain the bound; all original regions in this experiment have witnesses attaining it, so the reported maxima are exact. The original no-padding arbitrary-alphabet endpoint obstruction is already known; this is a range bound with padding allowed, including independent field alphabets.

## Results

| Condition | Whole book, valid fields / 2,896 |
|---|---:|
| Canonical GP order, no padding | 183 |
| Canonical GP order, arbitrary zero padding | 210 |
| Arbitrary independent field-specific alphabet, padding | 1,254 |
| Reverse-digit independent alphabet, padding | 1,255 |
| One shared arbitrary alphabet, padded (exact max) | **274** |
| Independent shared alphabet per large-mark packet (exact max) | **418** |
| Independent shared alphabet per strict full-stop packet (exact max) | **672** |

The global upper bound 274 is attained by z=0, eight low classes [25,24,8,9,12,28,11,18] with glyph25 assigned digit8 and [3,4,6,20,27] assigned digits24..28. The remaining choices may be arbitrary bijective assignments within their digit bands.

| Original boundary interpretation | Nonempty packets | Canonical/direct padded complete | Independent-field padded complete | Shared-alphabet complete |
|---|---:|---:|---:|---:|
| 31 large marks (2 empty fields from duplicate offsets) | 29 | 0 | 2 | 2 |
| 138 strict full stops + EOF | 139 | 0 | 3 | 1 |

The large-mark survivors are one-field three-rune spans [848,851), [9519,9522), not unique numeric messages. Every other nonempty large-mark packet fails even under independently secret word alphabets. No large-mark packet survives the embedded count plus payload test even with independent word alphabets. Small-stop fields are selected using the documented original-image audit, excluding indices57–60 (unprinted numeric row stops), 91 (ambiguous dot), 125 (absent) and 127 (comma-like). All tested boundaries are complete word boundaries.

## Native and random controls, and the only surviving short packet
Among 740 solved native GP words in the nine relikd solved records, conditioning empirical padding feasibility on the *exact unknown original word-length histogram* predicts 1,251 independently feasible fields, versus actual 1,254. Independent uniform GP29 predicts 1,269.08 (the exact probability for length n>=4 is 29^(3-n)). Thus the capacity failure is not a classifier separating enciphered prose from uniformly random digits; it rejects a particular typed octet format. Uniform random octets assigned to the pre-existing 83 singleton slots would all fit with probability (29/256)^83 ≈ 10^-78.505, conditional on lengths fixed independently of values; a value-adaptive length encoder is not subject to that probability. The four recorded RAND packets pass when their actual integers are encoded as two-digit base29, and also as padded four-digit fields. This ensures the range/length test admits genuine byte packets.

The sole strict-stop field surviving a shared alphabet is global rune [6990,6997), original GP word indices [[11],[1,6,28],[19],[12,24]]. Even adding the most favorable embedded count hypothesis (first field=3) fixes only glyph11=3 and glyph1=0. Exact enumeration of the remaining five distinct observed glyphs under the bijection and octet bounds yields **546,480 distinct three-byte payloads**, for example [33,5,64], [33,5,65], [33,5,66]. The second payload integer is a single digit, <=28, so neither actual recorded historical RAND3 tuple (middle byte207 or172) matches. No receiver or independent selector exists; do not promote this short survivor to a decoder.

Reproduction: [standalone CommonJS](../sims/lp2_rand_base29_boundary_capacity_sft.cjs), [complete exact output](lp2-rand-base29-boundary-capacity-output.json). Executed in isolated JS on the fetched repository sources. No CI claim. The exact range obstruction applies to direct one-word-per-octet transport even with independent padding and digit alphabets; it leaves variable-width *multiple* byte fields, arithmetic coding, unframed streams, encrypted structured packets and other independently selected mechanisms open.
