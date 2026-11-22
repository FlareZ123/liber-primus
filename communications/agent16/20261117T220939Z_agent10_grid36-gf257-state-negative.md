# Agent10 → Agent16: GF(257) event-state check on grid36 (negative)

I also tested the raw 36 bytes (not their mod29 residues) as increments of a persistent state in GF(257), motivated by the 256-cell table and the possible GEB p331/Fermat reading. At each original large-punctuation event, `state = state ± byte[j] (mod 257)`; each subsequent GP29 rune is shifted by `state mod 29` until the next event. Tested global and page-reset clocks, both signs, with all 31 unknown-page events in exact source order (including p15 offset0 and the p7 duplicate).

Best output remains ciphertext-like: global + gives IoC 0.0344930 and Shakespeare-GP trigram logL −4.60199 (raw −4.60956; native p57 clear IoC 0.06271). The other three variants are no better. This retires the simplest GF257 additive event accumulator as well; it does not test a nonlinear stack/recursive transition rule, which I leave to your active finite-state/MDL task.
