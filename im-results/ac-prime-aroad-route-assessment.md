# Ac-prime / A-road route hypothesis: source-constrained assessment

**Status:** intermediate assessment; no plaintext or cipher mechanism recovered.

## Question

A candidate derived from the p54 oversized **Ac** rune and the solved p56 prime-totient operation is:

`Ac → Rad → Eolh → Thorn → Gyfu → Ethel`

with GP prime values / proposed British A-road numbers:

`A97 → A11 → A47 → A5 → A17 → A83`.

This note tests whether the road-number interpretation is selective, whether the sequence is a literal connected route, and whether the proposed Inveraray endpoint is independently real. The candidate sequence and its 2016-clue motivation were supplied by Agent18; this note does not authenticate the disputed image-to-clue connection or independently establish that Ac is the intended starting rune.

## Findings

### 1. Prime-to-A-road mapping is not selective

The 29 Gematria Primus prime values are:

`2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109`.

Each has an extant Great Britain A-road designation:

`A2, A3, A5, A7, A11, A13, A17, A19, A23, A29, A31, A37, A41, A43, A47, A53, A59, A61, A67, A71, A73, A79, A83, A89, A97, A101, A103, A107, A109`.

Thus **29/29** possible GP symbols map to an A-road number. The mapping alone does not select this six-rune path or distinguish any one rune from another.

The British A/B-road numbering scheme is geographic: Great Britain is divided into nine zones, and the leading digit identifies the zone (with A1–A9 as the principal radial roads / boundaries). That is not a direct compass-bearing or travel-direction code. A-road numbers help identify routes, but their numeric values do not by themselves specify a direction of travel.

### 2. The totient walk has no natural stop at Ethel

The proposed walk is the state map

`T±(x) = x ± (p_x − 1) mod 29`,

where `p_x` is the GP prime attached to rune index `x`. This is a newly tested walk hypothesis, **not the p56 cipher itself**.

With addition, the Ac path is:

`Ac → Rad → Eolh → Thorn → Gyfu → Ethel → Beorc → Mannaz → Thorn …`

It has a preperiod of 3 and then enters the 5-cycle:

`Thorn → Gyfu → Ethel → Beorc → Mannaz → Thorn`.

Ethel is therefore a node inside a cycle, not a mathematical terminal. Stopping at Ethel requires an external stop rule (for example, selecting it because its gloss suggests an estate); the arithmetic does not stop there.

Exhausting all 29 starting runes gives three addition cycles: fixed-point Tiwaz (basin 1), Ur→Os→Nyd→Haegl→Ur (basin 8), and Thorn→Gyfu→Ethel→Beorc→Mannaz→Thorn (basin 20). **20/29** starting runes eventually enter the same five-cycle as Ac.

Subtraction is also a natural direction to test because the solved p56 decryption subtracts `φ(p)=p−1`. Under subtraction, Ac instead follows:

`Ac → Sigel → Ing → Ur → Ear → Wynn → Eh → Is → Nyd → Is …`

It enters the 2-cycle Is↔Nyd after a preperiod of 7. Across all starts, that cycle has basin **28/29**; Tiwaz is the sole fixed point. Thus the source material presently supplied does not select the positive direction over the negative one. Since every GP prime value already has an A-road counterpart, both signs produce road-number labels; the A-road mapping cannot resolve this ambiguity.

Reproduction: `node sims/gp_prime_totient_rune_walk.cjs`. The script asserts the Ac paths, preperiods, periods, and cycle-basin sizes for both signs.

### 3. The proposed six-road sequence is not a connected route

| Road | Grounded route facts | Consequence for the proposed sequence |
|---|---|---|
| A97 | Runs Banff–Dinnet in Aberdeenshire; its major junctions are A98, A96 and A93. | No direct A97–A11 junction; these are geographically separate. |
| A11 | Main route between London and Norwich; meets A47 at Thickthorn near Norwich. | A11–A47 is a direct transition. |
| A47 | Runs across the Midlands/East Anglia; meets A5 at Nuneaton and A17 at King's Lynn. | A47–A5 is direct; A47–A17 is also direct, but it is not the next pair in the proposed sequence. |
| A5 | Runs London–Holyhead through the Midlands and Wales. | No direct A5–A17 junction is listed on either road's route/junction record. |
| A17 | Runs Newark–King's Lynn; its western end meets A1/A46 and its eastern end meets A47. | Does not directly meet A83. |
| A83 | Runs Tarbet (at A82)–Campbeltown in Argyll and Bute. | No direct A17–A83 junction. |

For the five consecutive pairs in the proposed order, direct road adjacency is:

- A97 → A11: **no**
- A11 → A47: **yes**
- A47 → A5: **yes**
- A5 → A17: **no**
- A17 → A83: **no**

Only **2 of 5** consecutive transitions are direct junctions. A47 does also meet A17 at King's Lynn, but the proposed order puts A5 between them; reaching A17 after A5 would require an unspecified connector or backtracking. A journey could of course be routed between any two roads using other roads, but the sequence itself does not specify those connectors and is not a literal chain of successive A-road junctions.

### 4. Inveraray is a genuine thematic endpoint, but not yet a unique one

Historic Environment Scotland confirms that the A83 runs along Loch Fyne beside the Inveraray Castle designed landscape. Its inventory describes the **Oak Walk** as the primary northward axial route through the estate towards **Carloonan Dovecot**. This is a real and unusually close thematic fit to an Ac/oak → Ethel/estate interpretation at the A83 endpoint.

There is also a second Scottish estate/dovecot association at the A97 end: the A97 runs by the Duff House designed landscape near Banff, and the Historic Environment Scotland inventory records the Sandyhills Dovecote and historic wooded walks there. This makes the A97/A83 estate motif worth retaining, but also shows that an estate-plus-dovecot match is not unique to Inveraray.

The geographic coincidences are evidence for a possible landscape/destination clue, not evidence of decryption or proof that the 2016 clue intended this route.

## Decision

- **Reject** the strict interpretation that `A97 → A11 → A47 → A5 → A17 → A83` is a single connected sequence of successive A-road junctions.
- **Reject** Ethel as a mathematically determined stopping point: it is inside the positive walk's five-cycle, and the opposite sign produces a different walk.
- **Do not treat** prime-to-A-road mapping as evidence by itself: all 29 GP prime values have A-road counterparts.
- **Retain provisionally** the Inveraray endpoint motif (A83, Oak Walk, Carloonan Dovecot) and the A97/Duff House comparison as an unverified historical/geographic lead.
- Do not promote this to `results/`; no ciphertext has been decrypted and no source-selected sign, stop rule, or connector rule has been recovered.

## Most discriminating next test

If this line is continued, freeze a source-derived rule before scoring destinations. It must specify (a) why Ac is the start, (b) whether the step is plus or minus, (c) why and where the walk stops, (d) whether transitions require direct junctions or which connector roads are permitted, and (e) what counts as a destination match. Apply the same rule to all 29 starting runes and compare the resulting paths against a predeclared set of estate/oak/dovecot features. Without those controls, selecting the positive sign and stopping at Ethel after noticing Inveraray's Oak Walk is vulnerable to post-selection.

## Sources

- British road numbering zones and the regional meaning of A-road numbers: https://www.roads.org.uk/articles/road-numbers/numbers-and-b-roads
- Great Britain A-road zone lists (confirming the 29 prime-valued road numbers): https://en.wikipedia.org/wiki/A_roads_in_Zone_1_of_the_Great_Britain_numbering_scheme ; https://en.wikipedia.org/wiki/A_roads_in_Zone_2_of_the_Great_Britain_numbering_scheme ; https://en.wikipedia.org/wiki/A_roads_in_Zone_3_of_the_Great_Britain_numbering_scheme ; https://en.wikipedia.org/wiki/A_roads_in_Zone_4_of_the_Great_Britain_numbering_scheme ; https://en.wikipedia.org/wiki/A_roads_in_Zone_5_of_the_Great_Britain_numbering_scheme ; https://en.wikipedia.org/wiki/A_roads_in_Zone_6_of_the_Great_Britain_numbering_scheme ; https://en.wikipedia.org/wiki/A_roads_in_Zone_7_of_the_Great_Britain_numbering_scheme ; https://en.wikipedia.org/wiki/A_roads_in_Zone_8_of_the_Great_Britain_numbering_scheme ; https://en.wikipedia.org/wiki/A_roads_in_Zone_9_of_the_Great_Britain_numbering_scheme
- A97 route and junctions: https://en.wikipedia.org/wiki/A97_road
- A11/A47 Thickthorn junction: https://nationalhighways.co.uk/roads-and-travel/road-projects/east/a47-thickthorn-junction-near-norwich/
- A47 route, including its A5 and A17 junctions: https://en.wikipedia.org/wiki/A47_road
- A5 route: https://en.wikipedia.org/wiki/A5_road_(Great_Britain)
- A17 route and endpoints: https://en.wikipedia.org/wiki/A17_road_(England)
- A83 route: https://www.transport.gov.scot/projects/access-to-argyll-and-bute-a83/project-details/
- Inveraray Castle designed landscape, A83 setting, Oak Walk and Carloonan Dovecot: https://portal.historicenvironment.scot/apex/f?p=1505:300:::::VIEWTYPE,VIEWREF:designation,GDL00223
- Duff House designed landscape, A97 setting and Sandyhills Dovecote: https://portal.historicenvironment.scot/apex/f?p=1505:300:::::VIEWTYPE,VIEWREF:designation,GDL00148
