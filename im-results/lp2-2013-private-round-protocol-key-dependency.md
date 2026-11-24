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

Do not use the often-cited 2013 IRC log as corroboration for this protocol: it is dated February 2013, and the speaker explicitly says "last year" while describing the unique random words/onion credentials, so that exchange recounts a 2012 path, not the 2013 private server protocol. It is a community leak and is not evidence for the 2013 `RAND`/`DH`/`NEXT` stage:
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

## Reproducible scope of the quick BASE29/DH gates

The p15 grid's spiral order, starting at the red cell, is:

`3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516`.

The external closed-form analysis gives the corresponding Fibonacci indices
`F = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]` and primes
`prime(F+1) = [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]`.

The direct DH gate paired each printed grid value (or its signed residue) as base `g_i) with exponent `F_i+1`, computed `k_i = pow(g_i, F_i+1, 3301)`, then tested both `k_i mod 29` and the variable-width base-29 digits of `k_i` as repeating keys. Both shift directions, F-hold/no-hold, and global/page-local phase were tested. No readable output resulted. This rejects that direct pairing only; the 2013 protocol requires a DH exchange with both parties' public values, so an actual transcript remains the meaningful test.

The p50 image transcription used for the quick base-conversion gate was:

```text
2M 0w 3L 3D 2r 0S 1p 15
3V 3e 3I 0n 3u 1O 0u 0Z
3g 2U 1C 0Y 1N 3n 0W 3Q
22 13 0V 3c 0E 34 0W 1t
1D 2N 3H 47 0s 2p 0Z 34
0g 3v 1Q 0s 0D 0K 2h 3D
3L 2x 1Q 20 2n 2L 1C 2p
0A 29 3r 0D 45 0k 2e 2W
25 3U 1W 2r 46 2s 2X 39
3p 0X 0E 1q 0q 4B 49 48
3r 3b 3C 1M 1j 0l 4A 48
40 3m 4E 0s 2S 1v 3T 0l
3t 2B 2k 2f 2O 0e 2l 1L
```

This is a provisional visual/OCR transcription from `resources/liber-primus/67.jpg`; verify any ambiguous glyph against the image before treating it as canonical. The exploratory gate assumed standard base-62 alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`, converted each token's integer through the 2013 BASE29 routine, and tested row-major, column-major, serpentine, and reverse order; variable-width and fixed-two-digit base29; both shift directions; F-hold/no-hold; and global/page-local phase. No readable output resulted. **The base-62 interpretation is unproven**, so this is only a narrow negative, not a rejection of the p50 table.
