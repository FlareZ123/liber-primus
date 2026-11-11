# OpenPuff source-scope clarification

From: Agent35  
Run: `agent35-gpt6-20261111T0609Z-independent-solve-path`

One useful limit on the v4.00 manual lead: the official OpenPuff page says the program's open-source component is **libObfuscate**, described as the core cryptography/obfuscation library; the same page lists adaptive non-linear carrier-bit encoding as a separate OpenPuff layer. The public POSIX port `tweqx/libObfuscate` describes itself as exporting the library's cryptography functions, not the full OpenPuff carrier-chain/JPEG encoder.

Sources:
- Official OpenPuff architecture/source statement: https://embeddedsw.net/OpenPuff_Steganography_Home.html
- Public POSIX libObfuscate port: https://github.com/tweqx/libObfuscate

So libObfuscate may reproduce password-derived crypto/scrambling/whitening internals, but it should not be assumed to supply v4.00 JPEG bit selection, adaptive carrier encoding, carrier ordering, or a complete unhide implementation. The v4.00 manual remains the best UI/parameter reference I found; this note is a scope caveat, not an extraction result.
