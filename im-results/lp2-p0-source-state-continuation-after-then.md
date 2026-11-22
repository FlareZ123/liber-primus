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
inspected. At YOU, a replacement three-rune candidate is source-placed. A later attempted GO extension was then checked against the canonical corpus and rejected; this report records that rejection, and the post-THEN chain stops at YOU.

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
| attempted GO | G-O-G (rejected) | — | — | Canonical grid has zero G-O-G nodes; alleged source cells are P-I-H and alleged ciphertext cells are C-IA. No GO plaintext. |

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

## Rejected GO continuation (18 November canonical audit)

The attempted replacement GO candidate is false on the canonical source, not
merely on the external report's out-of-bounds row-29 placement.

A fresh exhaustive scan of the canonical 27×27 p0–p2 grid, over all four
unoriented straight axes and every in-bounds radius, finds **zero**
G-O-G source triples. The alleged replacement source coordinates
(18,21), (21,21), (24,21) contain **P-I-H**, not G-O-G. The alleged GO
ciphertext coordinates (17,19), (18,18) contain **C-IA**, not EO-N.
Consequently the claimed G-G-TH key alignment and plaintext GO have no valid
original-cipher input and must be withdrawn.

The earlier external placement centered at (26,18), radius3 is independently
out of bounds because its second outer would be on row29. The later attempted
canonical replacement at (21,21) does not repair that error.

The preceding YOU candidate remains a separate, three-rune conditional result:
the H-R-H source at center (21,22), radius5 selects aligned key TH-H-H; the
source-derived geometry places EA,J,N at (6,11)–(6,13), which decrypts to
Y,O,U in sims/lp2_p0_death32_of33_you34_canonical_sft.cjs. This is not an
authenticated LP2 plaintext: its upstream post-hoc source-state grammar
remains the dominant objection.

## Bounded sign-family alternative, not a decoder

From the same H-R-H state, raw center R has GP index4, phi(4)=2, and the
radius is5. The four literal sign combinations of those two source terms
produce the following exhaustive canonical mirror counts:

| Candidate source | Count |
|---|---:|
| G-O-G | 0 |
| G-W-G | 0 |
| TH-O-TH | 0 |
| TH-W-TH | 1 |

The sole TH-W-TH node is first (11,22), center (15,18), second
(19,14), radius4 on axis [1,-1]. This is only a surviving raw-source node in
a four-member family. No independent clue selects its sign combination, no
ciphertext placement is derived, and no key stream or reversible operation
has been established. Do not treat it as a successor plaintext or expand it
into another geometry menu.

## The dependent C-F-C continuation is retired

The earlier C-F-C arithmetic was derived from the now-rejected G-O-G state, so
it is not a live successor. Independently, the canonical grid contains exactly
three C-F-C straight triples, at radii1,2,7; none has radius3. The previously
claimed (4,7)–(4,10)–(4,13) triple is physically TH-Y-C, not C-F-C.

The updated rejection reproducer is
sims/lp2_p0_you34_go35_canonical_sft.cjs. It asserts the original
ciphertext values, the zero G-O-G count, the four-way sign-family result, and
the C-F-C counterexample without scoring language.

## Current frontier and strongest objection

This source-state continuation stops at the provisional YOU candidate. The
earlier post-THEN transitions remain intermediate constructions, not an
authenticated decipherment. The repository-wide temporal and all-grid audits
in results/README.md show why: the post-hoc transition grammar leaves many
admissible source/cipher choices and does not uniquely select unseen original
transitions before language scoring.

Do not continue the local edge/totient grammar unless a new original LP2 or
authenticated first-party Cicada clue fixes the transition, key/state, and
ciphertext placement before plaintext inspection, and produces a blind
held-out prediction. No unknown plaintext, authentic key, or complete
original-cipher inverse is recovered.
