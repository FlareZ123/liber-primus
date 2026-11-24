# 2013 private-round protocol as a possible missing LP2 key dependency

**Status:** intermediate historical finding; the LP2 connection is a hypothesis, not an established decryption.

## What the contemporaneous protocol says

A 2013-12-07 Gist reproducing a Cicada private-round instruction (it points back to Pastebin `CrRvGrkT`) describes a participant-hosted TCP server exposed as a Tor hidden service. The protocol includes:

- `RAND n`: return `n` cryptographically random integers in `[0,255]`.
- `BASE29 n`: convert an integer to base 29.
- `DH p`: perform a Diffie–Hellman exchange using a prime modulus `p`.
- `NEXT`: receive a PGP-signed message from Cicada and save it as the next instructions.

The last item matters most: the protocol explicitly anticipates a further, signed instruction payload after the server interaction. The server is participant-hosted, and the participant must send its onion address through GPG-encrypted email.

Source: https://gist.github.com/navinpai/0f12e2f2c10a4f6b13e8

The Gist's sample Python implementation uses `os.urandom(1)` for `RAND` and Python's `random.randint(2,p)` for DH parameter selection. **That is sample implementation code, not proof of Cicada's own PRNG or of the implementation used by every participant.** The protocol specification requires cryptographically random output for `RAND`; it does not prescribe a particular generator.

A separate community archive of a participant implementation records test commands including `rand 3`, `rand 0`, `rand 1`, `dh 3301`, and `next`. Treat this as corroborating community material, not an authenticated Cicada transcript:
https://github.com/neuroretransmit/cicada/tree/main/2013/007-fourth-onion

A leaked 2013 IRC transcript also describes successful participants receiving individual random words and onion credentials. This is anecdotal and should not be promoted to fact without an authenticated primary copy:
https://github.com/Dukotah/cicada3301/blob/master/corpus/C-community/irc/2013_winners-leak_irc-log.txt

## Why this is relevant to Liber Primus

There are several cross-round correspondences worth testing together:

1. LP2 uses the 29-symbol Gematria Primus alphabet; the 2013 protocol explicitly includes a `BASE29` operation.
2. LP2 page 15 contains a 4×4 numeric grid whose values have been independently described as `|3301 - prime(F+1)|` along a Fibonacci spiral; the 2013 protocol's DH operation uses a prime modulus, and surviving test logs include `DH 3301`.
3. LP2 page 57 explicitly echoes the 2013 audio title *The Instar Emergence*.
4. The 2013 protocol includes both random-byte generation and a DH exchange. This is a plausible historical route to key material that would not be recoverable from the public ciphertext alone if a participant-specific exchange or subsequent instruction was required.

These correspondences do **not** prove that LP2 uses the 2013 protocol. In particular, do not conflate the LP2 page-50 table with a 256-byte `RAND` output: the original LP2 p50 image (repository image `67.jpg`, since the image set starts at LP2 p0 = image 17) contains a 13×8 table of 104 mixed-case two-character tokens. Its encoding has not been established.

## Small direct tests already made

- Applying the 2013 `BASE29` conversion directly to the p15 grid values, then using the resulting symbols as a repeating GP29 key with either shift direction and the known F-hold convention, produced no readable output.
- Interpreting the 104 p50 tokens as base-62 integers, converting each through the 2013 `BASE29` routine, and using the result as a repeating key also produced no readable output under row-major, column-major, serpentine, and reverse orderings.
- Pairing p15 grid values with the corresponding Fibonacci exponents and computing `g_i^(F_i+1) mod 3301`, then using the residues/base-29 digits as a repeating key, was likewise negative.

These are narrow negative results only. They reject simple repeating-key readings of those tables; they do not reject a DH exchange, a participant-specific key, a stateful stream, or a missing `NEXT` payload.

## Highest-value next decision

Do not launch another unconstrained PRNG or cipher-family sweep yet. First try to recover the missing historical input that the protocol itself says should exist:

1. Search for a participant's received PGP-signed `NEXT` payload, server transcript, email attachment, or preserved private-round mailbox.
2. Search specifically for the actual request/response data for `DH 3301`, not just evidence that the command was issued.
3. If a `RAND n` transcript is recovered, compare its exact byte sequence with candidate LP2 numeric material. Do not assume p50 is the same output.
4. If a DH transcript is recovered, reproduce the shared secret from the recorded parameters and test only source-supported derivations from that secret.
5. If no `NEXT` payload or participant-specific transcript survives, record that the intended key path may depend on missing historical material; do not disguise that blocker as evidence for a particular cipher.

## Evidence classification

- **Directly stated by the 2013 protocol mirror:** participant-hosted Tor server; `RAND`, `BASE29`, `DH`, and `NEXT` commands; PGP-signed next instructions.
- **Observed in a participant implementation/archive:** sample implementations and test-command traces, including `DH 3301`; not an authenticated Cicada-side transcript.
- **Observed in LP2:** 29-symbol alphabet, p15 3301-derived grid, p50 104-token table, p57's 2013 audio echo.
- **Hypothesis:** a private-round `NEXT` message, RAND output, or DH transcript supplied key material for LP2.
