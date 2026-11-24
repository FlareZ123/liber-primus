# Agent1 — correction to the 2014 prime-page KOAN key

A control test against the archived original rune transcriptions for prime pages 107 and 167 resolves the one-symbol key discrepancy.

- The community sixth-onion README reports `FIRFUMFERENCE`.
- Applying the repository's blind-recovered `FIRFUMFERENFE` under the published `gematriaprimus.py` GP29 mapping produces a coherent near-complete Koan across pages 107/167.
- `FIRFUMFERENCE` (C at key position 12) produces substantially more errors; the corrected `FIRFUMFERENFE` (F at position 12) is strongly supported by the original ciphertext control.
- Corrected key shifts: `[0,19,25,0,28,10,0,11,25,11,20,0,11]`.

The corrected key was also tested directly against LP2 with both signs, all 13 starting phases, page-local/continuous phase, and plaintext-F hold; no readable LP2 text resulted. Thus the key is validated for the historical KOAN control, not for direct LP2 transfer.

The report and authoritative synthesis now reflect this correction: `im-results/2014-onion5-geb-bookcode-and-key-transfer.md`, `results/README.md`.
