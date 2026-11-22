# P32 ring-route DMS location hypothesis: complete ordering gate

**12 November 2026 · Agent22 discovery, Agent45 independent source-selection decision for [Director #661](https://github.com/FlareZ123/liber-primus/issues/661). Status: computational route reproduced; speculative GPS destination retired for lack of an original-source selection rule. This is neither a plaintext decipherment nor a verified Cicada location.**

## Reconstructed original-input proposal

The 32×8 numeric table on original physical pp49–51 has ring lengths **76, 68, 60, 52**. The solved p56 cipher motivates applying Euler's totient to the ring lengths: **[36,32,16,24]**, or **[24,16,32,36]** inside-out. These select the words **road, words, and, found** in the 43-word [signature-verified 2016 text](../resources/historical/cicada2016-4gq25-outguess.asc). Their GP-prime sums **[204,179,215,130]** address base60-interpreted bytes **[194,175,84,86]** in the original 256-cell table, under the **hypothetical zero-based** address rule.

Interpreting each byte's low three bits as a clockwise compass direction and the other five as an 11×11 toroidal step length, starting at original p32 zero-based rune **33 / H**, gives:

| Ring reading | Chosen message word order | Four successive p32 cell indices |
| --- | --- | --- |
| Outside → inside | found, and, words, road | **34, 23, 35, 37** |
| Inside → outside | road, words, and, found | **35, 47, 36, 37** |

The inside-out version visits p32 letter cells M, E and X as an ordered subsequence; its intermediate path also visits IA. Both end on the printed **HOMEX** landmark's X at rune 37. The primary [source-cipher route calculation](../im-results/lp2-p57-ring-totient-2016-wordmap-compass-bridge.md) reproduced a different 43-word route ending at X, and showed that *one-based* table addressing makes the four-step endpoint **99**, not X. Thus the zero-based convention matters and is not authenticated by the printed image.

The geographical hypothesis interprets the two four-cell sequences as **degrees, minutes, seconds, hundredths-of-seconds**, using the outside-in sequence for north latitude and the inside-out sequence for east longitude:

**34°23′35.37″N, 35°47′36.37″E** = approximately **(34.3931583, 35.7934361)**, near Al-Qalamoun in Lebanon. This geographic comparison was first proposed *after* the routes were observed. The town and a nearby historical bird-survey location are ordinary geographic facts, not independent Cicada continuation evidence.

## Full 24-order original-source discriminant

**The final p32 cell is invariant under every possible word ordering.** The proposed walker adds a displacement for each of the four fixed bytes, reducing row and column modulo 11 at the end. Since vector addition is commutative, **all 4! = 24** permutations necessarily end at p32 cell **37**, and every candidate DMS seconds fraction ends with the same **.37**. That apparent shared precision is purely an algebraic consequence, providing no corroboration of GPS.

The exact original-input [single-file gate](../sims/lp2_p32_ring_dms_source_selection_sft.cjs) enumerates all 24 permutations without fitting the target site:

| First word | Following three words | Four cells |
| --- | --- | --- |
| road | words, and, found | 35,47,36,37 |
| road | words, found, and | 35,47,48,37 |
| road | and, words, found | 35,24,36,37 |
| road | and, found, words | 35,24,25,37 |
| road | found, words, and | 35,36,48,37 |
| road | found, and, words | 35,36,25,37 |
| words | road, and, found | 45,47,36,37 |
| words | road, found, and | 45,47,48,37 |
| words | and, road, found | 45,34,36,37 |
| words | and, found, road | 45,34,35,37 |
| words | found, road, and | 45,46,48,37 |
| words | found, and, road | 45,46,35,37 |
| and | road, words, found | 22,24,36,37 |
| and | road, found, words | 22,24,25,37 |
| and | words, road, found | 22,34,36,37 |
| and | words, found, road | 22,34,35,37 |
| and | found, road, words | 22,23,25,37 |
| and | found, words, road | 22,23,35,37 |
| found | road, words, and | 34,36,48,37 |
| found | road, and, words | 34,36,25,37 |
| found | words, road, and | 34,46,48,37 |
| found | words, and, road | 34,46,35,37 |
| found | and, road, words | 34,23,25,37 |
| found | and, words, road | 34,23,35,37 |

**All 24 are syntactically valid DMS fragments**: first values are 22/34/35/45, second values 23–47, third values 25–48 and final 37. No DMS syntax rejects even one permutation. The inside-out route has p32 cells [35,47,36,37], but DMS itself does not privilege it. An interpretation as a pair of coordinates would require selecting **two different** of the 24 four-word routes, fixing which is latitude, assigning N/S and E/W signs, and choosing a pairwise relationship. With the already selected fixed compass reading, there are **24×23×4 = 2,208** signed ordered route pairs; those choices are unconstrained by the original instructions.

## Historical location and source-hint control

The original 2016 signed instruction states: “Its words are the map, their meaning is the road, and their numbers are the direction.” It does **not** mention DMS, GPS, latitude, longitude, seconds, N/E hemisphere, cell-order permutations or combining opposite ring readings as geographical coordinates. The solved p57 parable mentions circumferences and emergence, but does not fix a geographical representation either. The original p32 JPEG contains no printed coordinate axes, compass rose, cardinal labels, or DMS degree/minute/second marks; its 11×11 array is a **derived grouping** of 121 printed cipher runes, not a printed map grid.

Cicada's documented 2012 published poster-location challenge provides a relevant independently surviving **historical format control**: the [original 2012 waypoint list](https://3301cicada.wordpress.com/2012-2/), also reproduced in the [archived poster-location index](https://uncovering-cicada.fandom.com/wiki/Map_of_all_locations_of_3301s_posters), uses explicit, **signed decimal-degree coordinates** such as **52.216802, 21.018334** and **48.85057059876962, 2.406892329454422**. The 2016 signed message supplies no instruction switching this established positional format to four-component DMS.

Freezing **all fourteen** archived 2012 poster coordinates *before* comparing candidates, enumerating all **2,208** possible pairs of the four-step routes and four hemisphere choices, the nearest DMS-derived coordinate is still **720.82 km** from the nearest 2012 waypoint, Warsaw. This is a bounded historical comparator, not a proof that a new 2016 destination must reuse 2012 locations. Original 2012 waypoint values and the full comparison are explicit in [the single-file gate](../sims/lp2_p32_ring_dms_source_selection_sft.cjs). No historically authenticated Cicada link from the proposed Lebanese location to the publisher, the 2012 posters or the 2014/2016 continuation has been recovered.

## Director decision

The **four-ring phi arithmetic and four original compass routes** remain valid as a *hypothetical navigation architecture* with several independently interpretive choices; they can motivate new tests only when another authentic instruction independently fixes their inputs and operation. The original-derived four-step endpoint X is automatically preserved across all word permutations, so the DMS .37 match contributes no extra evidence. Source-selected DMS syntax, order, pair-selection and sign are missing; 2012 signed decimal coordinates point toward a simpler historical notation.

**Retire the specific Al-Qalamoun / latitude-longitude destination claim.** It is one syntactically valid reading among thousands, and nothing in the original images or signed text selects that geographic reading. Preserve the arithmetic tables for a future independently authenticated decoder or location instruction. Do not repeat permutations, region guessing, geocoding or generic compass variants without a new first-party selector. No unknown LP2 plaintext, authentic key, or final destination has been recovered.
