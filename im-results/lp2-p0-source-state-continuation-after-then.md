# LP2 p0 source-state continuation after THEN

## Status

This report is **intermediate research**, not an authenticated Liber Primus
decryption. It extends the existing p0 post-DEATH source-state route with
source-selected nodes, placements, and prospective operation gates. The route
remains conditional on the upstream post-hoc grammar through
`...IDEA OF THE END IS DEATH SEE YOU SOON THEN`.

The main advance is that the continuation no longer depends on the external
Reports 01-06 coordinate fitter. Several operation choices are selected by the
existence and geometry of the *next* source before the current plaintext is
inspected. At the later YOU/GO transition, the external route becomes
inconsistent with the canonical 729-rune corpus; this report rejects those
coordinates and derives replacement canonical placements.

Canonical source: `resources/liber-primus/lp2-corpus.json`, pages 0-2
concatenated as the established 27x27 square.

## Continuation summary

| Block | Raw source | Selected operation/key | Canonical ciphertext | Source-side selector |
|---|---|---|---|---|
| THE after THEN | N-M-N | N-E-N | J(22,21), W(21,20) | THEN-coordinate totients reduce the raw family to I-M-I vs N-M-N; only N-M-N exists. Retained SOON state forces placement. |
| C/K-E-Y | TH-H-TH | R-TH-TH | N(21,4), L(20,4), EA(19,4) | THE endpoint mirror plus current radius/span selects TH-H-TH; endpoint traversal fixes start. |
| IS | W-I-W | R-W-W | X(18,7), OE(19,6) | Half-value cascade from selected KEY cells globally selects W-I-W. |
| TO | X-M-X | X-E-X | U(9,16), NG(8,17) | Reverse IS read by raw center; endpoint mirror derives X-M-X; stop links directly to selected key center. |
| GO | TH-G-TH | TH-TH-TH | H(9,20), C(9,21) | Current radius r=3 gives [phi(r),2r,phi(r)]; unique node. |
| TO | D-N-D | G-D-D | OE(12,23), Y(12,22) | GO stop mirror generates raw family; forced D handoff selects one of two D-N-D nodes. |
| THE | L-X-S | X-S-L, direct non-mirror | T(9,19), R(9,18) | Current radius6 generates ordered L-X-S; half-radius selects its placement. |
| EAST | E-O-D | O-D-E, direct non-mirror | TH(14,24), N(15,23), C(16,22) | Prior radius3 generates unique ordered E-O-D; incidence-role stop fixes three cells. |
| OF | H-T-H | H-H-H | J(6,12), H(7,13) | Current radius7 generates unique H-T-H; same-axis radius-7 stop. |
| THE | J-G-U | J-TH-U | P(20,12), L(20,13) | OF cells generate unique J-G-U. A bounded phase gate selects center-phi here, but that phase rule does not transfer and is not treated as general. |
| MAPLIFE | EO-X-I | X-I-EO, direct | R(19,11) .. O(13,17), 7 cells | Raw EO-X-I and geometry are source-selected. Direct operation is then selected prospectively because it predicts a linked T-OE-AE next source; center-phi predicts nonexistent EO-E-NG. |
| MAY | T-OE-AE | T-I-AE, center-phi | G(18,11), C(18,12), OE(18,13) | MAPLIFE direct gate selects T-OE-AE. MAY center-phi is selected prospectively because direct predicts nonexistent AE-IA-C; center-phi predicts P-S-C. |
| BE | P-S-C | P-S-C, direct | U(25,12), R(26,11) | Twice MAY radius selects P-S-C placement. Next-source center geometry selects direct BE and NG-A-EO. |
| THE | NG-A-EO | NG-A-EO, direct | D(11,11), P(11,12) | Retained MAY center and BE radius reconstruct next TH-G-OE; its center rune selects direct THE. |
| DEATH | TH-G-OE | G-OE-TH, direct | F(10,10), NG(11,9), R(12,8) | Retained MAY/BE state selects TH-G-OE; source radius gives three-cell geometry. |
| OF | AE-H-C | C-AE-R, center-phi | H(12,18), AE(12,17) | DEATH source values generate AE-H-C at radius equal endpoint R=4. Next radius-5 source gate rejects direct H-H-H and selects unique H-R-H. |
| YOU | H-R-H | TH-H-H | **EA(6,11), J(6,12), N(6,13)** | Canonical correction. OF state fixes start/direction/length. EA,J,N is globally unique as an adjacent straight triple and decrypts to Y,O,U. |
| GO | G-O-G | G-G-TH | **EO(17,19), N(18,18)** | Canonical correction. H-R-H state source-generates unique valid G-O-G at center(21,21); source geometry selects one of five EO,N pairs. |

## Key-source and placement results

### THEN -> THE

At THEN endpoint `W(25,27)`:

- `phi(25)=20=L`, `phi(27)=18=E`.
- Both `25-phi(27)` and `27-phi(25)` equal 7, the W index.
- The mean of the two totients is 19=M.
- Their half-values are 10=I and 9=N.
- The equal-outer graph contains zero `I-M-I` nodes and exactly one
  `N-M-N`: N(17,17)-M(20,17)-N(23,17), radius3.
- The lower N participates in `N-H-N` centered exactly on the retained SOON
  endpoint H(25,19), after which same-axis and unique-incidence handoffs force
  the THE ciphertext J(22,21),W(21,20).

Reproducer:
`sims/lp2_p0_then_nmn_endpoint_totient_selector_sft.cjs`
and `sims/lp2_p0_then_the_source_state_sft.cjs`.

### THE KEY IS TO GO

The blocks through the first GO are selected before decryption by local source
state:

- THE -> KEY:
  `sims/lp2_p0_the_key_source_state_sft.cjs`
- KEY -> IS:
  `sims/lp2_p0_key_is_source_state_sft.cjs`
- IS -> TO:
  `sims/lp2_p0_is_to_source_state_sft.cjs`
- TO -> GO:
  `sims/lp2_p0_to_go_source_state_sft.cjs`

These replace the external coordinate fitter for this phrase.

### Beyond the first GO

The same approach continues through:

- `sims/lp2_p0_go_to23_source_state_sft.cjs`
- `sims/lp2_p0_to23_the24_source_state_sft.cjs`
- `sims/lp2_p0_the24_east25_source_state_sft.cjs`
- `sims/lp2_p0_east25_of26_source_state_sft.cjs`
- `sims/lp2_p0_of26_the27_source_state_sft.cjs`
- `sims/lp2_p0_the27_maplife28_geometry_gate_sft.cjs`
- `sims/lp2_p0_maplife28_may29_source_state_sft.cjs`
- `sims/lp2_p0_may29_be30_source_state_sft.cjs`
- `sims/lp2_p0_be30_the31_death32_source_state_sft.cjs`

The most important methodological change is **prospective operation selection**.
For MAPLIFE, MAY, BE, THE, and OF, the current direct-vs-center-phi choice is
tested by what next source it predicts. Impossible/nonexistent sources or a
failed source-center prediction reject the wrong operation before the current
plaintext is used.

The short phase-preservation rule used at J-G-U is explicitly *not*
generalized. It fails at the very next EO-X-I transition.

## Canonical correction at YOU

The external report for its later YOU block claims ciphertext cells
`(2,10),(3,10),(4,10)` containing `D,P,L`.

On the canonical p0-p2 square, those cells contain `G,P,Y`, so that reported
placement is false for the repository source corpus.

The source-state route independently selects the next key source
`H-R-H`, radius5. Standard center-phi and phase alignment gives
`TH-H-H`.

Source geometry from the preceding OF fixes:

- start `EA(6,11)`;
- direction right;
- length 3;
- ciphertext `EA,J,N`.

`EA,J,N` occurs exactly once as an adjacent straight triple in all eight
directions of the full 27x27 square. Under `TH-H-H` it decrypts exactly to
`Y,O,U`.

Reproducer:
`sims/lp2_p0_death32_of33_you34_canonical_sft.cjs`.

This is stronger than merely finding another plaintext fit: the previous
external coordinates are directly falsified against the canonical corpus and
the replacement ciphertext is globally unique under the source-selected key.

## Canonical correction at GO

The next external GO report claims a `G-O-G` source centered at `(26,18)`,
radius3, which implies a second outer at row29. A 27x27 artifact has no row29,
so that placement is impossible.

The corrected YOU state source-generates the same raw key family without using
the invalid placement:

- current source center R=4, `phi(R)=2`;
- outer `R+phi(R)=6=G`;
- center `radius5-phi(R)=3=O`;
- therefore `G-O-G`.

There is exactly one valid `G-O-G` mirror in the canonical graph, centered at
`O(21,21)`, radius3, vertical.

Its own source geometry fixes ciphertext `EO(17,19),N(18,18)`. Standard
mirror alignment gives `G-G-TH`, which decrypts those cells to `G,O`.

Reproducer:
`sims/lp2_p0_you34_go35_canonical_sft.cjs`.

## Current frontier and strongest objection

The continuation is materially stronger than the original fitted route because
many node values, node placements, ciphertext placements, lengths, and key
operations are selected from prior source state before decryption. It also
makes two concrete canonical corrections where the external route is
impossible.

The strongest objection remains that the transition grammar was reconstructed
post hoc from many blocks and has multiple local state formulas. A genuine
intended mechanism should compress these formulas into a smaller reusable
state machine or be independently clued by the artifact.

The immediate post-GO zero-center source is now source-selected:

- from canonical `G-O-G`, radius3 and `phi(O)=2`;
- step `r-phi(O)=1`;
- outer `G-step=5=C`;
- center `O-r=0=F`;
- raw source `C-F-C`.

Because F has index0, the shared 479-node mirror graph intentionally excludes
such centers. Direct enumeration of all equally spaced straight triples finds
two C-F-C placements: radius3 horizontal at center F(4,10), and radius6
vertical at center F(13,9). Carrying the current GO radius3 uniquely selects
the horizontal source C(4,7)-F(4,10)-C(4,13).

Reproducer: `sims/lp2_p0_go35_cfc_zero_center_frontier_sft.cjs`.

The remaining open decision is the ciphertext placement from this zero-center
source. This is a useful test of whether the route's state machine naturally
handles the zero rune rather than hiding it behind the ordinary mirror-graph
filter.
