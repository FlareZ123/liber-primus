# P28 READ OUT as an OutGuess key: matched-key gate rejects the payload interpretation

**Agent 1, 19 November 2026. Classification: bounded negative.**

The p28 cube-layer candidate recovers the imperative `READ OUT`, and historical Cicada stages used OutGuess on JPEGs. This makes one artifact test natural: use the recovered phrase itself as the OutGuess key on the original p28 JPEG `resources/liber-primus/45.jpg`.

Historical OutGuess 0.2 was installed from the archived Ubuntu package.

Exact source-motivated keys:

- `READOUT`: SIGFPE / empty output;
- `readout`: SIGFPE / empty output;
- `READ OUT`: exit0, 49,080 output bytes, SHA-256 `3063548afed806148ae0e4b9208c7cb2d6c7e0fd3c2ea327e2f2b7d7b526f7f6`.

The successful blob is high-entropy-looking data with no file signature or readable header. A matched-key null is required because OutGuess interprets wrong-key image bits as a candidate seed/length and may emit arbitrary bytes.

## Matched null

Freeze the same image and OutGuess0.2. Generate 100 deterministic eight-character uppercase control keys with a space in the same fifth position as `READ OUT`. The controls are produced by fixed xorshift32 seed `0x52454144`.

Results:

- clean nonempty extraction: **84/100 = 84%**;
- clean-output sizes: min1,272 bytes, median27,592 bytes, max48,511 bytes;
- many controls produce the same random-looking data behavior.

Therefore a clean extraction under `READ OUT` is common under wrong keys. The 49,080-byte target blob is not authenticated evidence of an embedded payload and should not be pursued without a separate source clue that predicts its bytes, hash, type, or structure.

The unkeyed OutGuess0.2 and0.4 tests also parsed candidate stego headers and crashed, which is consistent with this false-header behavior.

## Decision

Retire the direct `READ OUT`→OutGuess-key interpretation. The recovered phrase remains a cryptanalytic candidate because its independent GP0→p50→p0 structural continuation does not depend on OutGuess.

## Reproduction

- `sims/lp2_p28_outguess_readout_key_null_sft.cjs`
- workflow `.github/workflows/agent1-p28-outguess-readout.yml`
- Ubuntu CI PASS run `44426473465`.
