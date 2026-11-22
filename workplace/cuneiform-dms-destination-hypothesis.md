# Cuneiform pairs as a geographic DMS destination — source-selector audit

**Status: RETIRED as an unselected interpretation.** No Cicada destination, key, plaintext, or geographic instruction has been established by this reading. The cuneiform numerals and their other source-supported uses remain valid research inputs.

## Observation

The repeated cuneiform/sexagesimal seal on original LP2 pp33–39 represents the values **1033** and **3301**, equivalently the Babylonian sexagesimal pairs **(17,13)** and **(55,1)**. Interpreting those pairs as degrees and minutes, then supplying latitude-first and positive hemispheres, yields **17°13′N, 55°01′E** = **17.2166667, 55.0166667**, in Dhofar Governorate, Oman, near Sadah.

That conversion is mathematically valid but the geographic interpretation adds information not present in the source: neither original seal marks degrees/minutes, latitude/longitude, axis order, or N/E signs. The Oman coordinate is one convention-dependent reading, not a uniquely encoded destination.

## Source-selector audit

- The exact 2016 Cicada-signed payload says: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” It does **not** say GPS, latitude, longitude, degrees, minutes, DMS, Oman, or provide hemisphere/axis labels. See [the preserved signed payload](../resources/historical/cicada2016-4gq25-outguess.asc).
- Cicada's known physical-poster coordinate stages used explicit decimal-degree latitude/longitude pairs and named poster locations. The 2012 archived page explicitly says to find the symbol at the nearest listed location; its list covers Poland, France, South Korea, the United States, and Australia, not Oman. The 2013 stage likewise used an explicit GPS list for physical posters in named cities. These establish historical use of geographic coordinates, not this DMS grammar or this site. See the [archived 2012 coordinate page](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/main/2012/websites/the%20GPS%20coordinates%20website/845145127.html) and the [2013 chain summary](https://github.com/Dukotah/cicada3301/blob/master/research/02-puzzle-2013.md).
- The signed 2013 “knock on the sky and listen to the sound” clue has a concrete historical ICMP-echo/ping route. The preserved packet/payload reconstruction documents the participant-reported ping responder and the signed onion response; it does not select astronomical coordinates. See [the 2013 ICMP reconstruction](../im-results/2013-icmp-echo-packet-reconstruction.md) and [the signed clue](../resources/historical/cicada2013-second-onion-everything-you-need.asc).
- The original Cicada 2013 prime_echo script (../resources/historical/cicada2013-os-original-prime-echo.sh) prints prime values and pauses **2 seconds at exactly 1033 and 3301**. This is an authenticated historical role for the same integers, independent of any DMS conversion. Closed [#1388](https://github.com/FlareZ123/liber-primus/issues/1388) already tested the available first-party number-service and prime-echo navigation routes: they do not supply an LP2 recipient, complete start/stop range, or reversible rune receiver.
- Closed [#1393](https://github.com/FlareZ123/liber-primus/issues/1393) separately tested the exact page:word interpretation (17,13) and (55,1). The addressed ciphertext words exist, but no first-party selector or operation consumes them. That negative does not rule out every other use of the numbers; it does show that valid coordinates alone do not establish an LP2 route.

## Existing alternatives already exhausted

Do not conflate this geographic reading with the 2013 prime_echo or ICMP branches. The exact 2013 prime_echo timing is fully explained by the original 464-event executable; the 16×29 floral-page row-key consumer and direct prime-totient blocks were tested and rejected. The recovered ICMP stream and its prime-ID-to-LP2-fragment readout were also tested without recovering unknown plaintext. Relevant syntheses: [prime_echo source selector](../im-results/lp2-2013-prime-echo-source-selector-gate.md), [floral-page row key](../im-results/lp2-2013-primeecho-floral16-source-rowkey-gate.md), [ICMP reconstruction](../im-results/2013-icmp-echo-packet-reconstruction.md), and [ICMP fragment readout](../im-results/lp2-2013-icmp28-inkfragment-original-gate.md).

## Decision

No first-party artifact or documented Cicada physical-puzzle record anchors the candidate to Dhofar, Sadah, Oman, or a geographic DMS convention. The nearby mapped point is generic geography, not puzzle evidence. The alternative astronomical reading is not selected, and the historical “knock” clue already has an ICMP interpretation.

**Retire the Oman/DMS destination branch.** Do not search alternative hemispheres, reverse coordinate order, query nearby POIs, or invent landmark wordplay. Reopen only if a new first-party source supplies an explicit geographic DMS selector, hemisphere/axis information, or a site-specific link. This decision does not retire the cuneiform numbers, their prime_echo relationship, or the unresolved question of whether they select some other source object.

This is an intermediate source-selector decision only. It does not change results/README.md or the established cryptanalytic conclusions.
