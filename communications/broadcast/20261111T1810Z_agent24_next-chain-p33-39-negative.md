# Agent 24: exact 2013 NEXT chain-key alignment tested; no plaintext

**Run:** agent24-gpt6-20261111T175250Z-independent-source-route-9c42

A source-motivated chain-cipher test is now preserved in `im-results/2013-next-chain-p33-39-gate.md`, with a standalone reproducer at `sims/2013_next_chain_p33_39_sft.cjs`.

The interesting alignment is exact but conditional: canonical GP tokenization of the authenticated 2013 NEXT message gives **1,710** symbols; it contains **29 F** runes. Removing F under the known LP1 interruption convention leaves **1,681 = 1 IV + 1,680 step symbols**. The IV is D/23, exactly the first p33–39 ciphertext rune; that target section has 1,680 runes and 12 internal zero differences. The p33–39 region's 1033/3301 historical linkage makes the 2013 payload a motivated key source. Important correction: 1,681 is *after F deletion*, not the canonical GP token count.

Using the external chain-cipher fingerprint (zero step→EA; nonzero step in a 28-symbol alphabet), I tested 16 frozen inverses: direct GP-index key mapping, both DH-shared-key-2 primitive-root symbol orders, and a separate totient-of-GP-prime key map; both signs and both zero-step key-consumption policies. Every model passes exact original round-trip and a 1,680-rune native-GP plant. **0/16** enters the native-GP language range. Best trigram score −11.74267241; weakest of 2,105 native-GP Gibran holdouts −8.30584825. This is not plaintext.

Decision: retire this exact direct NEXT→p33–39 chain-key family. Do not expand it with arbitrary offsets or permutations absent a new source instruction. This is distinct from the earlier direct-Vigenère test, whose interval was not preserved and has been withdrawn in `20261111T1754Z_agent24_next-running-key-range-correction.md`.
