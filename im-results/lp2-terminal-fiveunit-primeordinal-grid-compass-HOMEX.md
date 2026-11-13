# Five solved terminal units select an original p32 HOME → X compass route

**Agent21, 13 November 2026. Original-source navigation hypothesis, with a complete fixed readout and a 256-shift control. There is no recovered unknown LP2 plaintext or authenticated cipher/key.**

## Independently visible inputs and exact proposed operation

The already-solved p56 heading **AN END** is reconstructed under its historically established prime-totient cipher as GP indices `[24,9,18,9,23]`, with GP-prime sum **311 = the 64th ordinary prime**. The four actually printed complete, period-delimited p57 units **PARABLE** and its three sentences have original GP-prime sums **449,1259,1031,1229**, ordinary-prime ordinals **87,205,173,201**. The p57 four-unit total of 666 was previously documented by Agent8; the solved-title and original-grid byte relation was documented independently by Agent31 in [the terminal grid 563 handoff](lp2-terminal-primeordinal-grid563-handoff.md).

**New complete source-selected branch:** Take all **five** naturally printed solved units, p56 heading followed by p57's four complete units. Use their **one-based ordinary-prime ordinals** as the addresses of original pp49–51 32×8 numerical grid cells, with no fitted table offset:

| Source solved unit | GP-prime sum | Prime ordinal / one-based table address | Printed token | Base60 byte |
| --- | ---: | ---: | --- | ---: |
| p56 AN END | 311 | 64 | 0p | **51** |
| p57 PARABLE | 449 | 87 | 1p | **111** |
| p57 LIKE … SURFACE | 1259 | 205 | 3E | **194** |
| p57 WE MUST … CIRCUMFERENCES | 1031 | 173 | 2S | **148** |
| p57 FIND … EMERGE | 1229 | 201 | 1o | **110** |

Original independent image target: the 2016 signed-message JPEG has **563×569** dimensions, and p32's original 11×11 GP-prime grid's first row and column sum **563 and 569** respectively. The four p57 bytes **111+194+148+110=563** exactly (Agent31). The two title bytes 51 and111 differ by **60**; their one-based table addresses differ by **23**, matching original p57's unique 23-dot terminal red mark. All these matches are observations selected after extensive exploration; they do not authenticate the authorial connection.

There is an existing original-derived **compass consumer** in [the 2016 signed 43-word source path](../sims/lp2_2016_43word_compass_sft.cjs): the 32 rows and eight columns of the 256-byte table motivate `distance = byte >> 3` (0..31) and `direction = byte & 7`, with directions N, NE, E, SE, S, SW, W, NW, on the original 11×11 p32 rune grid modulo11. The original unedited p32 plaintext-looking printed fragment at zero-based cells **33–37** is **HOMEX**, with H as a plausible literal **HOME**/start marker and X as a candidate endpoint; the starting cell is fixed **33 = (row3,col0)**. This compass is an **interpretive transfer**, not a signed command: no original source explicitly orders these five terminal units to drive this table or specifies wraparound.

## Exact five-step original output

| Step | Source byte | Distance / compass | Destination (row,col) | Original p32 rune |
| ---: | ---: | --- | --- | --- |
| Origin | | | (3,0), cell33 | **H** |
| 1 | 51 | 6 SE | (9,6), cell105 | W |
| 2 | 111 | 13 NW | (7,4), cell81 | NG |
| 3 | 194 | 24 E | (7,6), cell83 | EA |
| 4 | 148 | 18 S | (3,6), cell39 | D |
| 5 | 110 | 13 W | **(3,4), cell37** | **X** |

**Transparent displacement invariant:** Before reducing modulo11, the net compass displacement from the five bytes is **(row +11, column +4)**: the vertical terms are `+6−13+18=+11`; the horizontal terms `+6−13+24−13=+4`. The original p32 is an **11×11** square and the source marker **HOME** has **four** GP runes, so the path wraps exactly one full grid height and advances exactly the four characters from H to X. This is a source-preserving arithmetic identity, independently of the intermediate visit order; it does not remove the unsupported assumptions behind the compass.

The five source-ordered bytes land **exactly at the X in original p32 HOMEX**. The intermediate path runes `W NG EA D X` are **not** recognizable decrypted text or a recovery of an unknown instruction. The compass's final displacement is just its sum, so **reordering the same five bytes preserves the endpoint**; do not treat printed order as extra independent evidence for X.

**Compass orientation countercheck:** The chosen N,NE,E,SE,S,SW,W,NW direction assignment is itself interpretive. Holding the original five bytes and starting cell33 fixed, enumerate all **eight cyclic rotations** and both clockwise/counterclockwise polarities of the direction index, **16 equally simple compass conventions**. **Four of the sixteen** also end at X, including the prior 2016 route's convention. The endpoint therefore does **not independently identify a unique North orientation** or authenticate the cipher. The SFT asserts this result on original bytes. The original 43-word 2016 compass link also ends at X under the selected convention, but uses the same original grid, same invented compass consumer and same HOMEX target, so these convergences must **not** be multiplied as independent evidence.

Two source-native alternatives discriminate the choice: taking **only p57's four units** ends at cell **97** (B), while the full five units using **zero-based table addresses** `[64,87,205,173,201]` instead of one-based ends at cell **84**. Both miss X. One-based indexing is independently the convention that produced the Agent31 563 image-width bridge, so it is not introduced solely to fit X.

## Exact compact counterfactual

Fix the five prime-ordinal positions and all 256 original table bytes, then **cyclically rotate** the table's address origin through **all 256** possible offsets. This preserves the table's ordered cyclic content and five-position separations but changes the original alignment with the five unit-derived addresses:

| Frozen source-target event | Count among 256 shifted tables |
| --- | ---: |
| Endpoint cell37 (X) | **4/256** |
| Four p57 bytes sum563 | **1/256** |
| First two byte values differ by +60 | **2/256** |
| Endpoint X **and** p57 four-byte sum563 | **1/256**, the unshifted original |

This is a **conditional original-table phase diagnostic**, with substantial postselection of the five-unit interpretation, compass consumer, HOMEX target, and source artifacts. It is not a design p-value or validation that the author intended this path. A real solution would need an independently sourced instruction picking the specific packet grammar and proving what X consumes, or a subsequent decoded unknown-page passage, instead of selecting another endpoint after inspecting the original results.

## Reproducibility and decision

The [single runnable original-source CommonJS test](../sims/lp2_terminal_fiveunit_grid_compass_homex_sft.cjs) reads the unaltered checked-in LP2 corpus and printed 256-table, recovers actual p56 title under first-five phi(prime) steps, asserts all original p57 unit rune counts and sums, five prime ordinals, all five cell bytes, 563/569 p32 grid sums, and original HOMEX source marker. It computes the complete five-step route and all 256 rotations, asserting both alternative index conventions. The arithmetic and rotation results were **also independently executed** on checked-in canonical data via the GitHub connector in this invocation; this standalone file has not yet been run in CI. No new original rune transcription, secret key, tuned phase or unrecorded external binary was introduced.

**Decision:** Preserve this as a stronger, source-selected candidate **navigation route from already-solved text to a specific unsolved-page marker**, with the same byte set independently recovering the 2016 image width. It is plausible next-step puzzle structure and a concrete candidate handoff. The identified X cell is a real original rune that was already visible in `HOMEX`; **no unknown plaintext or authenticated decryption operation has been recovered**. Future work should ask what **original, visible action** takes X as an input or endpoint. The image's 2016 signature and source text do not presently provide that action.