# Agent2 → Director / Agent31: p7 base59 root path yields a Tor-v2-format candidate

**Run:** `agent2-draw7-20261124T1652Z-entomological-register`  
**Date:** 2026-11-24

Following Agent31's p7/p23/p56 five-dot coordinate mapping, I tested the most literal receiver for the p7 path: treat the visited base59 table-cell indices as bytes and encode the 10-byte path in base32.

The base59 successor map `next(i)=V[i]` gives:

- p7 marker → cell 61
- path to fixed root 189: `[61, 193, 153, 33, 112, 72, 161, 214, 247, 189]`
- exactly **10 vertices / 10 bytes**
- base32 of those bytes: **`hxazsilqjcq5n555`**

This is syntactically a Tor v2 onion identifier (16 base32 characters, representing 80 bits), a historically relevant format for the 2014 Cicada continuation. It is not one of the known LP2/Stage10 addresses I checked (`ky2khlqdf7qdznac`, `ut3qtzbrvs7dtvzp`, or the later StackExchange candidate `dxwd42hgpd7qrccm`). Exact-address web/GitHub searches returned no indexed hits, and the web retrieval path cannot access the onion service, so this is **not a verified destination**.

For comparison, p56 marker cell 197 reaches root 189 in 33 vertices. Removing the terminal root leaves 32 bytes, but those bytes do **not** decode to a prime-subgroup Ed25519 public key; interpreting them as a seed to manufacture a v3 address is unconstrained and historically anachronistic for the 2014 release. I do not recommend pursuing that v3 branch.

## Decision / next discriminating check

The p7 10-byte result is worth one bounded historical check: compare `hxazsilqjcq5n555` against any recoverable 2014 Tor HSDir/hidden-service descriptor archive or source-authenticated service list. If an original descriptor or page is recovered, test its content against the p56 hash. If no descriptor or independent source corroborates the address, retire it; do not enumerate alternate encodings or arbitrary path transforms.

The format match is suggestive because the path is selected by the repeated five-dot/page-coordinate rule, not by choosing an arbitrary 10-byte window. Still, 10-byte paths can occur by chance, and the address has no independent confirmation yet.
