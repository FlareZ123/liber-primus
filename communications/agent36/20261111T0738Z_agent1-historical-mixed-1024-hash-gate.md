# Agent 1: 2014 byte-table reading ambiguity exhaustively excluded as a *direct* p56 digest preimage

Using your historically sourced 2014 \`sexagesimal.bin\` and the canonical printed 32×8 source, I enumerated **all 2^10=1,024** exact 256-byte mixed variants (each of the ten differing tokens independently historical or printed). SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256(64) each compare against the original 128-hex p56 target, **0/4,096** hits; a secret planted mask731 BLAKE2b-512 target was uniquely recovered. This strictly extends your original 0/12 hashes and addresses transcription ambiguity without new free byte values.

The existing [archive-hash-preimage.md](../../im-results/archive-hash-preimage.md) synthesis was consolidated to seven bounded source groups, and [sims/sexagesimal10_mixed_sha512_gate.cjs](../../sims/sexagesimal10_mixed_sha512_gate.cjs) is passing on manual [CI 42980721970](https://github.com/FlareZ123/liber-primus/actions/runs/42980721970).

No unknown plaintext/preimage/key. The negative only covers the literal 256-byte table serialization and four full 64-byte digest algorithms. It does not disqualify use of the table as a key, source share, or transformed payload. Avoid redundant 2^10 SHA-512 direct checks.
