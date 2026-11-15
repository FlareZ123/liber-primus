# Terminal 256: known-180 plaintext attack on a shared binary keystream

**Research class: bounded original-input negative, with end-to-end plaintext-recovery positive plant.** No actual unknown LP2 rune has been decrypted. A 32×8 source table and a solved instruction yield a specific potential key-recovery architecture that can be tested algebraically before attempting page 55 plaintext.

## Human source route and fixed alignment

The original 2014 Liber Primus pages p49–51 (JPEG 66–68) print a **32-row by 8-column numeric table**, interpreted in the existing corpus as 256 bytes. A one-cell-thick border contains **76 cells**, and the rectangle inside contains **180 cells**. The final encrypted page p55 has **76 runes**. The solved p56 has **85 plaintext GP29 runes**, immediately followed by **95 unencrypted p57 runes**: together those provide **180 known GP29 values**. P57 explicitly says to shed our circumferences and find the divinity within. This makes a border/inner rectangular alignment plausible to a contemporary human, though it does not prove that the text and numbers are paired.

Freeze interior mapping **in printed row-major order**: rows 2–31, columns 2–7 each contain six bytes, matched to the already authentic 85+95 GP runes in book order. Treat p55's 76 runes as the potential unknown border plaintext. The external known-p56 decoding is the established prime-totient result; its 85 GP positions are the confirmed source words beginning AN END WITHIN THE DEEP WEB. No original unknown rune is substituted for training.

## Algebraic, key-independent attack

A simple hidden state machine might mask each plaintext rune into the corresponding byte with a binary linear-feedback shift register (LFSR). This is motivated by the printed 32-row geometry and the corpus's earlier 32-state/circle clue hypotheses; neither object explicitly selects an LFSR. Use each GP rune's canonical **index**, **prime weight**, or **prime totient** as its byte input. Allow literal byte **XOR**, byte addition and byte subtraction modulo256, then recover the hypothetical keystream byte by byte from the 180 known plaintext positions. Read each byte's bits MSB-first or LSB-first. These yield **18 fully specified direct models**.

A binary LFSR of length L obeys a homogeneous, fixed-coefficient recurrence. Each interior source row supplies **48 consecutive keystream bits**, regardless of the two unknown border bytes. For L=46, each row yields two independent linear equations in the *same 46 unknown taps*, for **60 original linear equations** overall. This even allows each row to begin with an independently arbitrary secret state. Any LFSR of at most 46 stages necessarily induces some valid order-46 recurrence on these source runs, so a contradiction at 46 excludes **all smaller orders** too.

Exact GF(2) elimination on the unaltered original table reports a contradictory row in **all 18** input-register/operator/bit-order combinations. First contradiction appears among the 60 equations at zero-based equation indices **42–50**, at original interior rows **22–26**. No trained language score, guessed seed, guessed LFSR taps, or free cipher phase enters this rejection.

The independently generated positive plant fills all **256 source-shaped positions** with a real 32-stage LFSR byte pad, authentic solved-p56+p57 values in the 180 interior cells, and known GP-English p57 values on the 76-cell border. The exact same row-equation solver recovers **all 32 taps**, then recovers the full **256-byte keystream** from 32 consecutive inner key bits by forward and backward recurrence. It finally unmasks **180/180 known interior runes and 76/76 hidden border runes**. The test therefore demonstrates an operational route to recovering p55 if this low-complexity cipher actually generated the source.

## Decision

**Reject the direct inner-known/rim-unknown GP29 masking model under a common binary LFSR of at most 46 stages, for all 18 source-natural register, byte operation and bit-order choices.** This includes a 32-stage generator with independent per-row reset states. A longer or nonlinear generator, different byte-to-rune correspondence, or a different positioning of the known text remains possible. The exact geometry alone does not select the missing operation. Do not broaden to arbitrary higher-order states without additional creator-selected evidence; the result recovers no original plaintext, authentic key or destination.

**Reproduce:** [standalone original-source CommonJS test and full planted recovery](../sims/lp2_terminal256_known180_lfsr_sft.cjs). Source files are the unchanged original-cipher corpus at resources/liber-primus/lp2-corpus.json and original table at resources/liber-primus/lp2-grid-256.json. The source-key connection is adjacent to earlier negative direct tests but this is a distinct known-plaintext state-recovery test.
