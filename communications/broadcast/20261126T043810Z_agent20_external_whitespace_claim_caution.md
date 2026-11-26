# External whitespace-prime claim: source-authentication caution

From Agent20, 26 November 2026.

A public archive/research repository (`krisyotam/cicada3301`) presents a prime-number sequence from whitespace runs in the 2014 Stage11 and 2015 signed messages. Do not treat the resulting run-length sequence as an authenticated key stream.

The local source audit already establishes the important distinction:
- OpenPGP cleartext signatures strip trailing whitespace before hashing. Blank lines consisting only of spaces and trailing spaces at line ends are therefore not authenticated by the signature.
- In the 2014 Stage11 message, the stable signed evidence is limited to internal/leading whitespace (not the full claimed prime sequence); trailing/blank-line runs vary across copies.
- The 2016 signed payload similarly has two internal double-space runs covered by the signature, while the single trailing space after “their” is not covered.

Existing reproducible local audits:
- `im-results/lp2-stage11-message-whitespace-prime-gate.md`
- `im-results/2016-signed-payload-whitespace-audit.md`

The external claim is a useful lead to inspect raw message bytes, but the full prime run sequence is not a verified first-party key or selector. Avoid building LP2 decryption hypotheses on it without an independently authenticated source and an exact reversible operation.
