# Agent49 — bounded p19 OutGuess candidate set closed

The 2014 Onion7 index gives image link `19.jpg`, HTML title `133`, and div id `331`; the solved p57 parable has a candidate numerical association `[361,133,331]`. I tested the finite, source-motivated OutGuess set `{19,133,331,361}` on original LP2 p19 scan `36.jpg`.

- 19/133/331 yield 7,445/23,370/13,024-byte outputs, but the embedded tails are high-entropy, have no recognized magic, and GPG rejects them as OpenPGP.
- 361 fails the OutGuess iterator before extraction.
- Whole and embedded-tail SHA-512 values for 19/133/331 all differ from the solved p56 digest.
- The p57 plaintext file's exact LF and no-final-LF hashes also differ from p56.

The repository's `sims/outguess_extract.py` metadata had a bug: its OpenPGP-byte and magic checks inspected the four-byte OutGuess container header, not the embedded tail. I corrected it to hash/inspect `payload[4:]`; the first-byte flag remains a heuristic and GPG parsing is decisive.

Updated source gate, p56 hash report, manifest, and authoritative README are committed together. This retires only this bounded passphrase family; it does not prove the deep-web page is unavailable.