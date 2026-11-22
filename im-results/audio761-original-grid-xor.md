# The historical 2013 audio XOR applied directly to the LP2 numerical grid

**Agent 9, 12 November 2026. Original-source binary experiment, negative for direct readable output. No unknown LP2 plaintext, key, decipherment, or destination recovered.**

## Specific human-solver rationale and frozen operation

An archived 2013 Cicada stage actually uses the complete 4,010,732-byte `761.MP3` file as a bytewise XOR operand to recover a JPEG from the Twitter binary. That audio's ID3 metadata already contains the *PARABLE* subsequently reprinted on solved LP2 p57. The original LP2 pp49–51 show a conspicuous 32×8 numerical table which, **conditionally** interpreting each printed two-digit base60 token as a byte, provides one 256-byte potential binary cipher target. This creates a cross-round rationale for exactly one simple transfer, but no LP2 source explicitly commands it.

The original MP3 has SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`, pinned to [2013 original audio archive](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3). Historical positive recovery establishes that the XOR starts at **file byte zero**, including the ID3 header, instead of after the 206-byte tag ([source-validated 2013 operation](lp2-p27-2013-761mp3-original-jpeg-xor-gate.md)).

Freeze `P[i]=G[i] XOR audio[i]` for every `0<=i<256`, with `G` the unmodified row-major 256-byte LP2 grid ([canonical numeric source](../resources/liber-primus/lp2-grid-256.json)), SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. There is no offset search, seed, additional cipher layer, byte permutation, or fitted key.

## Original result and genuine-language positive

[Successful original-input GitHub Actions run **43138221209**](https://github.com/FlareZ123/liber-primus/actions/runs/43138221209) executed the [standalone CJS source and exact inverse](../sims/audio761_original_grid_xor_sft.cjs), using the complete pinned MP3.

- The **256-byte XOR output** has SHA-256 `7e43bc10e03f44ae24b7da637ff3006ff1993ffefb3f7f1aedfdca42c4867c63`, first 32 bytes (hex) `82a394b961ed7eb75dbdc886af5cb7d479460f2166d95a250ca4c17cb673a1b0`.
- It has **101/256** ordinary printable/whitespace ASCII bytes, longest printable run **5**, only **23/256** direct rune ordinals 0–28, and sample byte entropy **7.2828594725 bits/byte**. No recognized leading JPEG, PNG, GIF, ZIP, gzip, PDF, 7z, PGP, MP3, RIFF, Ogg, ELF, or SQLite signature. Original unchanged table had **106/256** printable bytes and longest printable run **5**.
- XORing the output with the original MP3 returns all **256 original grid bytes exactly**. An independent synthetic ciphertext formed by applying the identical MP3 XOR to the first **256 actual readable bytes** of solved LP1 text is decoded to **256/256 identical bytes**. This checks the operation, source and inverse, while appropriately leaving the source-selection hypothesis unproven.

**Decision:** The historically exact unshifted MP3-XOR operation supplies neither native-GP plaintext nor ASCII prose nor a recognizable standard container from the as-printed 256-byte grid. The audio's 2013 key role and cross-round poem are authentic clues, but do not select an LP2 application. Preserve this single bounded negative; do not re-run it under arbitrary byte offsets or alternate packings without a new independent LP2-visible selector. An opaque binary payload or a differently specified operation remains logically possible, but this experiment offers no reason to spend resources searching those unconstrained variants.
