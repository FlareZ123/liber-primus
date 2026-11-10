# LP2 base-60 grid: exact expanded-key and hash-schedule exclusion

**Classification:** exact bounded cryptanalytic negative, independently checkable with the committed source. No plaintext or key recovered. Agent 25, 2026-11-10.

## Inversion question and why it matters

The three-page numeric table on LP2 pages 49–51 contains **256 two-character base-60 byte values**, with **161 distinct bytes**. If it is the expanded form of a standard cipher key or compression schedule, the original key block or message block can be recovered directly from its leading bytes. AES-128/192/256 expanded round keys are respectively 176/208/240 bytes; SHA-1 and SHA-256 first-64-word message schedules are 256 bytes; the first 32 words of a SHA-512 message schedule are likewise 256 bytes. Each exposes exact algebraic recurrences that random bytes cannot imitate.

This experiment tests those highly constrained encodings, **without trying to fit a language score or a secret key**. It uses the canonical derived byte rows in resources/liber-primus/base60-grid.json, so possible misread mixed-case glyphs in scans 66–68 are a source limitation.

## Exhaustive declared orientation search

Seven plausible byte traversals were tested: row-major, reverse row-major, column-major, reverse column-major, reverse of columns within each row, reverse of row order, and reverse of row order within each column. For each byte traversal, every one of 256 circular starting offsets was tested and each consecutive 4-byte group was read forward or byte-reversed.

Total: **7 × 256 × 2 = 3,584** presentations of the same original grid.

For each presentation:
- AES-128: check all **40** derived 4-byte words after the 16-byte key against the AES standard Rcon/SubWord/RotWord/XOR recurrence.
- AES-192: check **46** derived words after the 24-byte key.
- AES-256: check **52** derived words after the 32-byte key.
- SHA-1: check all **48** words numbered 16 through 63 against its XOR/left-rotate recurrence.
- SHA-256: check all **48** derived words against its SHA-256 lowercase-sigma/additive recurrence.
- SHA-512: interpret the grid as the first **32** 64-bit big-endian message-schedule words, checking the **16** recurrence relations at indices 16 through 31. This is a prefix check of SHA-512, not a claim to have its full 80-word expansion.

**Observed:** zero exact predicted-word matches for **every** family and **every** one of the 3,584 tested presentations. Total counts and largest counts are both zero in each family.

The script constructs synthetic genuine AES-128/192/256 expanded keys, checks an AES-128 NIST vector (d6aa74fd), a standard AES-256 vector (a573c29f), and checks fully expanded synthetic SHA-1, SHA-256 and 32-word SHA-512 schedules. Their expected derived-word match counts are respectively **40, 46, 52, 48, 48 and 16**. All planted-control assertions pass.

## Strength against a few transcription errors

Each checked SHA-1/256/512 recurrence involves its output word plus **four** input words, so changing one transcription byte can affect at most five tested equations. Because **all** 48 SHA-1 or SHA-256 equations fail, at least **ceil(48/5)=10 incorrect byte cells** would be required to turn any tested presentation into a genuine standard SHA-1/256 schedule. For the first 32 SHA-512 words, at least **ceil(16/5)=4 incorrect byte cells** would be required.

Each checked AES word depends on itself, its immediate predecessor and the predecessor one key-width earlier; one erroneous cell affects at most three checked equations. The corresponding lower bounds are **14, 16 and 18 incorrect byte cells** for AES-128/192/256. These are necessary lower bounds, not assertions that that number of corrections would suffice.

This makes the exclusion substantially less sensitive to one or two ambiguous scan glyphs than a simple candidate digest comparison.

## Interpretation and reproducibility

The 256-byte grid is **not an unmodified standard AES expanded key or SHA-1/SHA-256 schedule, nor the first 32 words of a standard SHA-512 schedule**, under the precise traversals, byte grouping and circular offsets specified above. This does not exclude the table being raw key material, ordinary encrypted ciphertext, an AES/SHA output, a KDF seed, a byte-permuted schedule, XOR-obscured schedule, a compressed payload, a custom generator, or a different orientation. It provides no plaintext.

Run the standalone CommonJS regression from the repository root: node sims/grid_expanded_schedule_screen.cjs. It reads the existing grid resource, runs the complete bounded search, and emits JSON with all counts and positive-control status. No dependency installation, workflow, or external network call is needed.

Reproducer: [grid_expanded_schedule_screen.cjs](../sims/grid_expanded_schedule_screen.cjs). The grid and original scanned page references are in [base60-grid.json](../resources/liber-primus/base60-grid.json).

**Research priority:** this narrow cryptographic-format gate is closed. Future effort should seek source-constrained key extraction or a decryption operation on LP2 ciphertext, rather than further orientation or hash-schedule variations without new independent evidence.
