# P50 raw-value / 256-rune cycle-boundary state gate

**Agent 1, 28 November 2026. Classification: exploratory original-cipher structural result with source-native controls. No plaintext, key or reversible opcode recovered.**

## Question

Existing p50 work fixes a 256-cell row-major object, a continuous phase-zero rune clock and a self-transition association. The stronger full-256-residue T7 conditional gate shows that arbitrary stationary repeat probabilities per table residue still cannot explain which cycle occurrence fires. This test therefore adds the missing coordinate without fitting plaintext.

For transition position `i`, define residue `r=i mod256`, cycle `c=floor(i/256)`, and printed p50 numeric value `B[r]`. The 12,956-rune unknown tape spans cycle indices 0..50. Test the two direct numbering conventions `B=c` and `B=c+1`; their adjacent-cycle union is `c in {B-1,B}`, equivalently `B-c in {0,1}`.

The union was inspected after the two numbering conventions, so a full adjacent-offset familywise calibration is reported.

## Original LP2

Use the canonical 12,901 within-page transitions and 86 adjacent-equal events. For inference, condition on each of the 256 residues' **exact observed event count** and randomize only which cycle occurrence of that residue fires. This removes every stationary one-cell p50 hazard.

Conventional base60 boundary band:

- opportunities: **83**
- repeat hits: **6**
- conditional expectation: **0.9002240896**
- exact conditional upper tail: **0.00015674868**

| global site | cycle | residue | token | value | repeated GP |
| ---: | ---: | ---: | :---: | ---: | :---: |
| 781 | 3 | 13 | `04` | 4 | L / ᛚ |
| 1037 | 4 | 13 | `04` | 4 | G / ᚷ |
| 4773 | 18 | 165 | `0I` | 18 | D / ᛞ |
| 9916 | 38 | 188 | `0c` | 38 | I / ᛁ |
| 10165 | 39 | 181 | `0e` | 40 | W / ᚹ |
| 11598 | 45 | 78 | `0k` | 46 | P / ᛈ |

The repeated runes do not form source-natural plaintext and are not promoted as a payload.

### Temporal replication

Condition residue counts separately in disjoint cycle halves:

- cycles 0..24: 40 repeats, 35 band opportunities, **3 hits**, expectation 0.52, exact tail **0.00906309**
- cycles 25..50: 46 repeats, 48 opportunities, **3 hits**, expectation 0.666154, exact tail **0.02332418**

### Hotspot sensitivity

Residue13 / `04` contributes two hits on the cycles adjacent to value4. Removing that residue entirely leaves 84 repeats, 81 band opportunities, **4 hits**, expectation 0.821793 and exact tail **0.00746677**.

### Radix robustness

Under the documented drop-`f` radix59-compatible reading, the **same six sites** remain in the band: 85 opportunities, expectation 0.939440, exact conditional tail **0.000202713**. The `0k` cell shifts from value46 to45 while its event lies on cycle45. The relation therefore survives the repository's base60/base59 parser ambiguity.

## Full offset-family calibration

For each event let `d=B[r]-c`. Across the source opportunities there are 305 observed integer offset values. Original LP2 has three events at `d=0`, three at `d=1`, and no other single offset with more than two. Among all adjacent bands `{k,k+1}`, **k=0 is the unique maximum with six**.

A deterministic 50,000-draw conditional simulation (seed `0x3301b0ad`) preserves every residue's event count and scans the maximum adjacent-band count on each draw:

- source band >=6: 6/50,000; add-one tail **0.0001399972**
- any adjacent band >=6: 676/50,000; add-one familywise tail **0.0135397292**

The familywise evidence is suggestive rather than decisive and is not a discovery-wide p-value across historical LP2 research.

## Source-native GP controls

Apply the identical table, global clock, LP2 page-seam geometry and residue-conditioned statistic to 88 source-native English GP29 windows produced with the repository's calibrated orthography encoder: 32 Shakespeare, 8 Gibran and 48 Emerson windows, each 12,956 runes with half-window stride.

- **0/88** controls have a conditional tail <= original LP2's **0.00015674868**
- smallest control tail: **0.00085435056** (Shakespeare start0; 9 band hits among 412 repeats; conditional expectation 2.59243)
- next smallest: **0.00149013070** (Emerson start291510; 8/347; expectation 2.27350)
- 4/88 controls have raw hit count >=6, showing why conditioning on each window's residue-repeat profile matters

## Direct consumers: negative

The simplest GP29 payload readings at all 86 equality events do not identify the repeated rune:

- `B mod29`: 3/86
- `(B+cycle) mod29`: 1/86
- `(B-cycle) mod29`: 2/86

Physical page naming is ordinary after residue conditioning: `B=current page` gives 2 hits / 42 opportunities with tail about 0.0744; the one-based page variant gives 1/43 and about 0.348.

## Decision

Preserve this as an **exploratory candidate for the cycle-dependent state missing from the full-256-residue T7 model**. It is a raw-value rule selecting *which cycle occurrence* of a residue is exceptional, survives both documented numeral readings, replicates across temporal halves, survives hotspot removal, and is more selective on unknown LP2 than 88 native-GP controls.

Do not treat it as plaintext or a key. The missing causal step is still a first-party reason that a printed value should name adjacent global 256-rune cycles and a reversible ciphertext consequence. A useful successor should predict a held subset of these six sites or derive an explicit inverse without fitting receiver choices.

Reproducer: `sims/lp2_p50_byte_cycle_boundary_band_sft.cjs`.
