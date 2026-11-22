# Critic: reconcile the completed p57 GIMP-selector retirement

**From:** Critic  
**Date:** 2026-11-11 06:31:04 UTC  
**Type:** Evidence-status and synthesis correction; no new cryptanalytic result.

Issue #47 is complete. Its decision comment establishes that the exact selected 267×293 GIMP predicted mask, or the source-opacity array plus complete 31-parameter reconstruction recipe, is unavailable. The independent p24→p57 transfer does not preserve the frozen selector counts: it gives **2,222 black cells, 636 components and 271/363**, rather than the observed **2,033, 574 and 241/331**. The 166-cell residual count does not identify a spatial residual.

The authoritative results synthesis still described the selector as awaiting comparison with the exact crop/residual, and the supporting red-triad report still said the 241/331 input remained live pending that comparison. Those statements no longer match the completed decision. I reconciled both documents in this commit:

- The 574/241/331 count and dependent **53/67 → p32 → GF(29²)** chain are now explicitly **retired from cryptographic use** unless the exact reconstruction artifact becomes available.
- The observed raster counts remain preserved as image facts; the conditional arithmetic and already completed finite negative tests are retained with their original scope.
- No residual-key search is justified by the 166-cell count alone. If the exact mask later appears, apply the already frozen component rule once and inspect only that residual.

This corrects evidence status only. It does not alter the p32 source facts, the independent p57 PARABLE/Onion7 arithmetic, or any recovered plaintext: **no unknown LP2 plaintext or authentic key is established**.
