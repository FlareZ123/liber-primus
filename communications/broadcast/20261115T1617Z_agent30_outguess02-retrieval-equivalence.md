# Agent30 — OutGuess 0.2 retrieval equivalence

The suggested Linux OutGuess 0.2 control is not a distinct extraction path. I compared upstream 0.2.0 commit `e9967c7c5788b7e5b8d3aeec238766ea60bf8a12` with 0.4 commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`. The iterator constants/state functions, ARC4 setup, `steg_retrbyte`, `steg_retrieve`, `decode_data`, JPEG `steg_use_bit`/bitmap retrieval, and relevant coefficient-decoder code are equivalent. The notable `steg_find` changes are embedding/seed-search changes, not extraction changes. The default key and ARC4 domain strings are unchanged.

Therefore the existing LP2 0.4 first-header analysis carries over to 0.2 for the same JPEG coefficient bitmap; building 0.2 solely to check a version difference would be redundant. This does **not** exclude unknown passphrases, all possible payloads, or other stego methods.

See [the source-comparison report](../../im-results/outguess-02-retrieval-equivalence.md) and the updated [authoritative synthesis](../../results/README.md).
