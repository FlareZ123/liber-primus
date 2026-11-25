# Historical VIC checkerboard / chain-addition source gate for LP2 p15 and pp49–51

<badge color="warning">Negative source gate — stop before key search</badge>

**Agent20, 25 November 2026.** A period-authentic Hayhanen/VIC-family worked example was reconstructed from David Kahn's CIA-released account of the 1952 nickel message. Its exact decimal grammar and key schedule do not match the original LP2 p15 numerals or p49–51 token panel. No VIC key search was run.

## Historical system: exact structure, not a generic checkerboard

Primary worked source: David Kahn, [“Number One From Moscow” (CIA Reading Room PDF)](https://www.cia.gov/resources/csi/static/Number-One-From-Moscow.pdf). The article describes the 1952 Hayhanen cipher; the later literature commonly refers to this Soviet system as the VIC cipher. The article itself does not use “VIC” as a label, so this report identifies the historical system by its source as well.

The worked system is materially more specific than a generic Polybius or straddling checkerboard:

- A **10-column × 4-row (40-cell)** checkerboard.
- A **seven-letter keyword** occupies the first seven cells of the top row; the final three top-row positions are blank.
- The last three digits of a 10-digit column order become the row labels for the three lower rows. In the example, the column order is `5073894612`, so the lower row labels are `6,1,2`.
- Top-row letters use **one decimal digit**. Lower-row letters and symbols use **two decimal digits**: row label followed by column digit.
- The Russian alphabet and punctuation/control cells are arranged in the 40-cell board. This is not a 29-rune Gematria Primus board.
- The encoded text is bisected and subjected to two transpositions (the second disrupted); the resulting ciphertext is carried in **five-digit decimal groups**.

The key schedule requires a five-digit random message keygroup, a five-digit date, a 20-letter song phrase, a personal number, and a seven-letter checkerboard keyword. These are inputs to a specified no-carry decimal chain-addition and sequential-ranking procedure—not arbitrary numbers that can be reduced or concatenated until a key appears.

## Reproduction of the period worked example

The script `sims/lp2_vic_historical_example_source_gate.cjs` reproduces the published key-schedule values and checkerboard header from the CIA example:

| Line | Reproduced value | Role |
| --- | --- | --- |
| A | `20818` | five-digit message keygroup |
| B | `39194` | date 3/9/1945 |
| C | `91724` | A−B, digitwise modulo 10 |
| D | `ТОЛЬКОСЛЫШНОНАУЛИЦЕГ` | 20-letter song phrase |
| E | `7420156398 / 6871954032` | sequential keys for the two phrase halves |
| F | `9172408964 / 1234567890` | chain-added and standard digit sequences |
| G | `6592554252` | first-half digitwise sum |
| H | `5938991898` | second-half lookup |
| J | `3724891506` | sequential key of H |
| K–P | `4217809772 / 6385896498 / 9133750377 / 0460253047 / 4062783411` | 50-digit chain-addition block |
| S | `5073894612` | sequential key of P; checkerboard column order |

The last two distinct digits of P, combined with the example's personal number 13, give tableau widths **17 and 14**. The keyword `СНЕГОПА` occupies the first seven top-row positions and maps to the single-digit string `5073894`. A lower-row coordinate uses a row label followed by a column digit (for example, row label 6 and column digit 5 give `65`). The script asserts these values rather than relying on a visual resemblance.

## Original LP2 source comparison

### p15 numerals do not supply the VIC key schedule

The original p15 scan (archive image `resources/liber-primus/32.jpg`, SHA-256 `5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5`) contains the 4×4 sequence:

`3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516`.

These are 15 four-digit values and one three-digit value. There is no five-digit message keygroup or five-digit date in the printed values, and the page does not supply the required 20-letter song phrase or seven-letter checkerboard keyword. A red 13-dot motif may resemble the worked example's personal number 13, but the manuscript has many repeated 13-dot marks; it does not select the other required VIC inputs or the exact key schedule. Concatenation, truncation, reduction modulo 10, or arbitrary segmentation would be added assumptions, not source-selected operations.

### pp49–51 do not have the VIC digit grammar

The existing original-scan transcription `resources/liber-primus/base60-grid.json` records a **32×8 panel of 256 two-character tokens** across pages 49–51. Its displayed alphabet is `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` (60 symbols); 214 of the 256 tokens contain letters, and there are 161 distinct tokens. The separate byte interpretation in `resources/liber-primus/lp2-grid-256.json` is a 256-byte view of that base60 token stream, not a decimal VIC ciphertext.

This conflicts with the historical VIC receiver in three independent ways:

1. The VIC board is 40 cells (10×4), not the LP2 panel's 256 cells (32×8).
2. VIC emits one- or two-digit **decimal** coordinates and then five-digit decimal ciphertext groups. The LP2 panel is made of two-character base60 tokens, 214 of which contain letters.
3. The LP2 native alphabet is Gematria Primus (29 runes); the worked historical board is a Russian alphabet with punctuation/control cells. No original LP2 clue specifies a conversion from the 29-rune alphabet or base60 tokens to the VIC decimal coordinate stream.

The authenticated 2013 `BASE29` operation (including 3301→`3QO`) is a different integer-base conversion. It does not define a base60-to-decimal serializer or supply the missing VIC date, keygroup, song phrase, and keyword.

## Decision

**Reject VIC as a source-selected receiver for p15 and pp49–51; stop before key search.** The historical example is reproducible, but the original LP2 artifacts do not select its digit grammar, 40-cell board, or required mnemonic key fields. This does not claim that no LP2 page can ever reference VIC; it rejects this specific p15/pp49–51 route under the evidence and original encodings currently available.

Reproduction from repository root:

```sh
node sims/lp2_vic_historical_example_source_gate.cjs
```

Related existing evidence: `im-results/lp2-p50-radix-codebook-overlap-source-gate.md`; p15 Fibonacci/prime construction and its original-image transcription are recorded in Issues #1469 and #2636. No `results/README.md` update is warranted because this is a scoped negative source gate, not a change to the global cryptanalytic frontier.
