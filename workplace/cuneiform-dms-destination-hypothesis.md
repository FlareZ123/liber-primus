# Cuneiform pairs as a geographic DMS destination — exploratory hypothesis

**Status:** unverified lead; not an established Cicada destination, key, or plaintext. This is separate from the page:word test closed in #1393.

## Observation

The repeated cuneiform/sexagesimal pairs on LP2 p33–39 are read as `(17,13)` and `(55,1)`. A natural geographic reading is degrees and minutes: 17°13′ latitude and 55°01′ longitude. With conventional latitude-first, positive-hemisphere interpretation this gives **17°13′N, 55°01′E** = **17.2166667, 55.0166667**, in Dhofar Governorate, Oman, near Sadah. A structured POI lookup placed a mapped tourist attraction about 0.9 km away, but that is generic map evidence, not a Cicada connection.

Map: https://www.openstreetmap.org/?mlat=17.2166667&mlon=55.0166667#map=12/17.2166667/55.0166667

## Why one bounded test is justified

- The 2016 Cicada-signed payload says: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.”
- Earlier Cicada rounds demonstrably used GPS coordinates to direct solvers to physical posters. The 2012 and 2013 coordinate lists are preserved in public historical sources; their known poster sites do not include Oman.
- The page:word interpretation of the same pairs is separately tested and remains unselected (#1393). The decimal values 1033 and 3301 also have the independent 2013 `prime_echo` connection.
- The 2013 signed clue “Sometimes one must knock on the sky and listen to the sound” leaves an astronomical/radio reading (17h13m, +55°01′) conceivable; it may also simply refer to ICMP echo. No named radio source is established at that position.

## Existing alternatives already exhausted

Do not conflate this geographic reading with the 2013 prime_echo or ICMP branches. The exact 2013 `prime_echo` timing is fully explained by the original 464-event executable; the 16×29 floral-page row-key consumer and direct prime-totient blocks were tested and rejected. The recovered ICMP stream and its prime-ID-to-LP2-fragment readout were also tested without recovering unknown plaintext. Relevant syntheses: `im-results/lp2-2013-prime-echo-source-selector-gate.md`, `im-results/lp2-2013-primeecho-floral16-source-rowkey-gate.md`, `im-results/2013-icmp-echo-packet-reconstruction.md`, and `im-results/lp2-2013-icmp28-inkfragment-original-gate.md`.

## Strongest objection

No first-party source supplies N/E signs, says “latitude/longitude,” or connects Cicada to Dhofar/Sadah/Oman. The 2012/2013 poster locations do not include Oman. The nearby POI is not independent puzzle evidence. A valid coordinate and a nearby attraction can be coincidence.

## Decisive test and stop condition

Look only for an independent first-party anchor to this exact region or to a geographic DMS interpretation: an original LP2/2016 image clue, a signed Cicada message, or a documented historical physical-puzzle record naming Dhofar/Sadah/Oman or a site at this coordinate. Do not sweep hemispheres, reverse coordinate order, query arbitrary nearby POIs, or invent road/landmark wordplay. If no such independent anchor is found, retire this as an attractive but unselected interpretation.

This note is exploratory only. It does not change `results/README.md` or established cryptanalytic conclusions.
