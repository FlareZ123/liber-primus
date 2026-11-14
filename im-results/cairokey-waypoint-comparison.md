# CairoKey coordinate versus preserved Cicada waypoints

**Decision (14 November 2026): no match.** The January 2015 community-uploaded CairoKey screenshot coordinate is not equal, within source-printing precision, to any of the 21 preserved 2012–2013 Cicada coordinate/poster records examined. The nearest is the PGP-signed 2012 Warsaw point, **2,596.073 km** away; the runner-up is the 2013 Moscow point, **2,896.492 km** away. Retire the exact waypoint-match hypothesis. This is not evidence of an LP2 key, plaintext, or final destination.

## CairoKey source point and limitations

The original MediaWiki upload register identifies CairoKey.jpg as uploaded by **SSpeciosus on 29 January 2015 at 04:41:25 UTC**, File page/revision 15156/22580, original upload size **231,484 bytes**, source SHA-1 **fb170019b38a6cd5d2336320e616b5e6a52bf35f**. The visible Google Earth screenshot near Mostorod Bridge prints:

- Latitude: **30°07′46.3″N**
- Longitude: **31°17′20.0″E**
- Decimal: **30.129527777777778, 31.28888888888889**

This transcription and upload record are preserved in [Director Issue #929](https://github.com/FlareZ123/liber-primus/issues/929) and its [consolidated original-wiki report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-jan2015-fibonacci-pages-wiki-binary-original-gate.md). The screenshot is a community upload, not a PGP-signed Cicada instruction. Its upload postdates the anonymous 28 January 2015 Fibonacci/.bin claim. The available CDN representation was reencoded (216,134 bytes, SHA-256 61c8a5b2e4177c815b6d1990fb6a4b4c4c378bf969281aa21dc5d83f3ebb9123), so that digest is **not** an original-upload hash; original-byte steganography is outside this coordinate-only test.

## Comparison corpus and source grades

The frozen comparison contains 21 points:

1. **Twelve PGP-signed 2012 coordinates.** The exact list comes from [coordinate-payload.asc](https://github.com/FlareZ123/liber-primus/blob/main/im-results/2012-845145127/coordinate-payload.asc), whose signature is identified in the source report as created 8 January 2012 22:34:35 UTC. The signature verifies under the preserved Cicada key; its timestamp is signed metadata, not a trusted timestamp.
2. **Two 2012 webpage-only additions.** These are 37.577070, 126.813122 (the additional Seoul point) and 36.0665472222222, -94.1726416666667 (Fayetteville). They are listed in the unsigned coordinates webpage reconstruction, not in the signed 12-coordinate payload. The preserved source report explicitly keeps their provenance separate and notes uncertain city attribution for the Arkansas poster photograph. See [2012 coordinate/poster source assessment](https://github.com/FlareZ123/liber-primus/blob/main/im-results/cicada2012-two-unsigned-coordinates-poster-qr-recovery.md) and [2012 source inventory](https://github.com/FlareZ123/liber-primus/blob/main/resources/external/2012-845145127/README.md).
3. **Seven 2013 pklmx stage/poster locations.** The participant-archive reconstruction lists Dallas, Okinawa, Moscow, Little Rock, Annapolis, Portland and Columbus. The Okinawa (26.41968, 127.73254) and Annapolis (38.977845, -76.486451) coordinate bodies have preserved PGP-signed messages; the other five are retained participant poster/location-table records, not equivalent signed messages. See the [pklmx continuation report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/pklmx-2013-onion-continuation-gate.md) and [signed-page archive inventory](https://github.com/FlareZ123/liber-primus/blob/main/resources/historical/pklmx-2013/README.md).
4. **2014 check.** The preserved 2014 source map documents LP1 OutGuess/XOR image stages, and the 2014 Stage11 signed message gives an onion address; neither supplies a physical GPS/poster waypoint. No additional 2014 coordinate was added to the frozen list.

## Results

Distances are great-circle Haversine distances using mean Earth radius 6,371,008.8 m. Distances are rounded to 0.001 km. Source coordinates are retained in their printed decimal form.

### 2012 PGP-signed coordinate payload

| Point | Original coordinate | CairoKey distance |
|---|---:|---:|
| Warsaw | 52.216802, 21.018334 | 2,596.073 km |
| Paris 1 | 48.85057059876962, 2.406892329454422 | 3,202.466 km |
| Paris 2 | 48.85030144151387, 2.407538741827011 | 3,202.410 km |
| Seattle 1 | 47.664196, -122.313301 | 10,971.312 km |
| Seattle 2 | 47.637520, -122.346277 | 10,975.005 km |
| Seattle 3 | 47.622993, -122.312576 | 10,975.511 km |
| Seoul signed | 37.5196666666667, 126.995 | 8,479.819 km |
| California | 33.966808, -117.650488 | 12,177.254 km |
| Louisiana | 29.909098706850486, -89.99312818050384 | 10,895.981 km |
| Miami | 25.684702, -80.441289 | 10,460.393 km |
| Hawaii | 21.584069, -158.104211 | 14,177.757 km |
| Sydney | -33.90281, 151.18421 | 14,413.759 km |

### 2012 unsigned webpage-only additions

| Point | Original coordinate | CairoKey distance |
|---|---:|---:|
| Seoul page-only | 37.577070, 126.813122 | 8,462.652 km |
| Fayetteville | 36.0665472222222, -94.1726416666667 | 10,710.340 km |

### 2013 pklmx stage/poster locations

| Point | Original coordinate | Source grade | CairoKey distance |
|---|---:|---|---:|
| Dallas | 33.092817, -96.082650 | Participant poster/location table | 11,068.444 km |
| Okinawa | 26.419680, 127.732540 | PGP-signed coordinate message | 9,135.732 km |
| Moscow | 55.793765, 37.578608 | Participant poster/location table | 2,896.492 km |
| Little Rock | 34.747791, -92.269086 | Participant poster/location table | 10,688.889 km |
| Annapolis | 38.977845, -76.486451 | PGP-signed coordinate message | 9,302.252 km |
| Portland | 45.500920, -122.652512 | Participant poster/location table | 11,203.085 km |
| Columbus | 32.478944, -84.983674 | Participant poster/location table | 10,348.009 km |

**Outcome:** 0/21 coordinate matches. Warsaw is nearest at **2,596.073 km**. Moscow is second at **2,896.492 km**, a further 300.419 km away. The nearest Paris coordinate is 3,202.410 km away.

## Precision rule and decisive separation

CairoKey prints both axes to **0.1 arcsecond**. The comparison computes each candidate's rounding envelope from the decimal precision of its own latitude and longitude independently, then combines those component uncertainties with CairoKey's half-unit uncertainty in a local tangent-plane bound. This is a rounding-only bound, not a claim about GPS or survey accuracy. The largest pairwise envelope in the 21 comparisons is **49.446 m**, caused by the three-decimal longitude in the signed 2012 Seoul coordinate. The nearest point is over **2.59 million metres** away, so neither source rounding nor the conservative maximum envelope can create a match.

The exact source-selected test is therefore decisive without geocoding, searching around Cairo, or generating candidate locations. No coordinate is within its pairwise printed-precision envelope.

## Interpretation and stop condition

- The CairoKey coordinate is a community screenshot coordinate, not an authenticated Cicada waypoint.
- It does not coincide with any of the 21 preserved 2012–2013 coordinates/poster locations.
- The 2012 webpage-only additions were included as a separate lower-authenticity control, not silently promoted to signed evidence.
- The preserved 2014 source set adds no physical waypoint.
- This closes only the exact “CairoKey is an existing Cicada waypoint” hypothesis. It does not test hidden payloads in unavailable original CairoKey JPEG bytes, and it does not prove the uploader had no private or symbolic reason for choosing Cairo. There is no source-exact Cicada→Cairo→LP2 link in the inspected records.

**Director fork:** no follow-up location search or Cairo-centered geocoding is justified. Reopen only if a first-party, period-authenticated Cicada source explicitly links this coordinate or the Cairo screenshot to an LP2 operation, page, key or destination.

## Reproduction

Run with Node.js:

    node sims/cairokey_waypoint_comparison_sft.cjs

The script freezes all 21 source coordinate strings, asserts the 12/2/7 source counts, calculates all Haversine distances, derives the precision-specific rounding envelope, and asserts that every distance exceeds its envelope. It also asserts Warsaw is the nearest point. No external network, geocoder, randomized search or hidden candidate generation is used.
