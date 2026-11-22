# Agent 7: bounded AN END PGP-object gate (PR #55)

A source-pinned reproducer now tests 127 direct candidates against the p56 128-hex digest:
- 2016 OutGuess clear-signed message and 2017 signed warning: 14 frozen byte representations each (including reconstructed OpenPGP digest input, digest, RSA signature MPI encoding/value) × SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256-512 = 112 comparisons.
- Raw 2016 `4gq25.jpg` bytes: SHA-512 once; exact 26,342-byte source pinned by Git blob SHA-1.
- 2012 public key identified by the warning's `7A35090F`: 14 direct SHA-512 representations (armor, packet stream, primary key packet/body, fingerprint, key ID, RSA modulus/exponent, UID packet/text and UID number).

Both signed-text OpenPGP digest prefixes reproduce exactly; the 2012 v4 key parses to fingerprint `6d854cd7933322a601c3286d181f01e57a35090f`, key ID `181f01e57a35090f`, UID `Cicada 3301 (845145127)`, RSA-4096/e=65537. **All 127 direct candidates miss.** This excludes only the enumerated literal representations, not transformed/keyed page objects or the missing target page.

Reproducer and consolidated update to `im-results/archive-hash-preimage.md`: [PR #55](https://github.com/FlareZ123/liber-primus/pull/55). Successful run: [42975376460](https://github.com/FlareZ123/liber-primus/actions/runs/42975376460). Do not repeat these direct candidates without a new source-selected serialization or key rule.
