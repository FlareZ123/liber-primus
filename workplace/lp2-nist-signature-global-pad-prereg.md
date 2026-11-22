# LP2 NIST signature-global pad: preregistered gate

**Status:** hypothesis only; no decryption claim.

## Source-selected premise

The original Liber Primus `00.jpg` has an OpenPGP signature creation time of
2014-01-07T03:16:41Z (Unix 1389064601). The NIST Beacon V1 pulse immediately
preceding that timestamp is 2014-01-07T03:16:00Z (Unix 1389064560). The
historical Campaign XVIII C8 pipeline already uses this timestamp to fetch a
real NIST pulse and validates its skip-aware decoder on a known-plaintext
positive control. Its C8 lane did not test a continuous multi-pulse pad on
LP2; it rejected per-page timestamp indexing because LP2 pages have no
individual signatures.

## Hypothesis

A single signed front-page timestamp anchors a continuous NIST Beacon V1
keystream for the book. Concatenate consecutive 512-bit `outputValue`
records beginning at the pulse at-or-before the signature time, map each byte
to GP29 by `byte mod 29`, and decrypt the first 729 LP2 runes (pages 0–2)
continuously from offset zero using the exact `keyskip1` anti-repeat
transducer. The 2013 Cicada source's `RAND` command and the observed LP2
doublet deficit motivate the public-randomness and skip-filter components;
neither establishes that NIST was the intended source.

## Decisive test

1. Run the external C8 known-plaintext positive control. Abort if it fails.
2. Fetch 16 consecutive NIST pulses from 03:16:00Z; this yields 1,024 GP29
   symbols, enough for the 729-rune target plus a bounded skip margin.
3. Decode pages 0–2 as one continuous stream with exact preset
   `keyskip1` (max_skip=3, max_free=0, no start slack), byte-mod29 builder,
   sign=-1, and key offset zero.
4. Compare against two adjacent-pulse starts (03:15 and 03:17) and a
   deterministic random-key control (seed 3301).
5. Require the source-timestamp candidate to pass the full HITFN gate,
   controls to fail, and the winning path to consume only fetched beacon
   symbols (not decoder zero-padding).

## Completion / next action

- **PASS:** expand the same fixed rule to all LP2 pages 0–55 using enough
  consecutive pulses for the full ciphertext and skip overhead; independently
  verify the plaintext and preserve the full pulse chain.
- **NO_HIT / control failure:** reject this exact joint model. Do not tune
  offsets, alternative byte projections, page resets, signs, or other cipher
  families to rescue it. A different timestamp or pad construction requires
  a new source-derived premise.

## Important limitation

The timestamp is attached to the signed `00.jpg`, not to the LP2 corpus as a
whole. Treating it as a global LP2 pad anchor is the weakest premise. A
positive result would be a strong lead, not proof of author intent; a
negative result rejects only this exact construction.
