# One original terminal-table plaintext-feedback inverse: all-256-state contradiction

**Agent26, 15 November 2026; Director #1167. Classification:** a frozen, exactly invertible, source-motivated **nonlinear 256-state GP29 codec** that fails the authentic 85-rune known-text gate. **No unknown p55 plaintext, key, or Cicada-authored decoder recovered.** This is a bounded rejection of one concrete table consumer; it is not an exclusion of stateful table ciphers in general.

## Original inputs and causal hypothesis

The original printed p49–51 numeral field has 256 tokens, conventionally decoded into 256 bytes; physical p55 holds 76 unknown GP29 symbols, followed by p56's 85 genuinely deciphered GP runes and p57's 95 clear GP runes. These **76+85+95=256** counts also match the 76-cell perimeter plus 180-cell interior of a 32×8 rectangle. The signed 2016 “words/map, numbers/direction” instruction and p57's “shed our own circumferences” text motivate a possible *numeric address-state consumer*; neither authorizes the specific cipher below. The already tested terminal direct lookup, byte stream, linear/Hill and ring-algebra models do not uniquely prescribe one.

The independent *actual* p56 decoder subtracts successive prime totients modulo29, with one unchanged **F** at local rune offset56 that consumes no prime. We freeze this native **F transparency** as an exact lossless 29-letter condition. Consider a byte state `s` addressing the source table `T[s]`. For each plaintext GP29 `p`:

- If `p=0` (F), output ciphertext `c=0` and leave `s` unchanged.
- Otherwise output `c=1+((p−1+(T[s] mod28)) mod28)`, then update `s=T[(s+p) mod256]`.

At decryption, literal ciphertext zero maps back to F with no state advance; otherwise `p=1+((c−1−(T[s] mod28)) mod28)`, with the same plaintext-dependent state update. **The update is a nonlinear lookup**, uses no learned 29-entry alphabet and is exactly reversible for every GP29 input. The source *does not* explicitly choose the modulus28 reduction, plus sign, plaintext-feedback addition, or reset rule. The experiment is a finite architectural test, not evidence of creator selection.

Because p55's unknown text could leave **any** byte state at the start of p56, the test grants all **256** possible p56 entry states. Nothing is optimized against p55. For each state, encrypt the independently solved 85 p56 plaintext runes and compare with all 85 original p56 ciphertext runes. **Only a fully matching state** would be allowed to predict the 95 clear p57 runes as the untouched holdout. We do not change the table order, byte interpretation, sign, transition or missing-rune rule after seeing results.

## Exact original test and positive

Original table bytes SHA-256: `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. There are 161 distinct table bytes. The genuine p56 plaintext is the independent published **AN END WITHIN THE DEEP WEB … SEEC OUT THIS PAGE**, 85/85 checked against its authentic prime-totient cipher with the sole F skip at offset56. P57's 95 GP runes are read unchanged from the original clear source.

| Original-cipher exact criterion | Outcome |
| --- | ---: |
| Distinct p56 entry states exhaustively tested | **256** |
| States disagreeing at the very first p56 symbol | **246** |
| States matching exactly the first one then disagreeing | **8** |
| States matching exactly the first two then disagreeing at third | **2** |
| States matching **all 85** authentic p56 pairs | **0** |
| Maximum matches anywhere in the 85-pair test | **8/85** |
| Best two-prefix states | **70** and **132** |

Those last two initial states still fail at original p56 rune index2. Continuing them speculatively across p57 produces only **5/95** identity matches each. That is a diagnostic, **not** an independent successful holdout: neither state earned access past the failed p56 gate. A **180-rune GP-native positive plant** containing the complete authentic p56 plaintext and clear p57 exactly encrypts and decrypts **180/180** for both of those original-source byte states. The inverse handles the transparent F and reconstructs the identical forward ciphertext.

## Decision

**Reject the specific plaintext-feedback table update `s←T[(s+p) mod256]` with fixed F-transparent non-F rank shift `T[s] mod28`.** No possible 8-bit post-p55 state survives the first three authentic p56 rune pairs. This contradiction is independent of the unknown p55 ciphertext, a language-model score, or fitted page-boundary key phase. It cannot be rescued by choosing a different initial state or reversing the cipher after examining the output. Any fundamentally different nonlinearity, GP29/byte transport or state selection requires a **new first-party opcode or operand**. The source counts and ring geometry remain unsolved clues, and p57 is an independently clear register; demanding one shared per-rune encryption law across p55/p56/p57 is itself a hypothesis rather than a verified author design.

**Original-input SFT:** [sims/lp2_terminal256_plainfeedback_lookup_allstate_sft.cjs](../sims/lp2_terminal256_plainfeedback_lookup_allstate_sft.cjs). Standalone Windows-compatible Node.js 22 CommonJS; validates the original table digest, 256-state exhaustive gate, authentic p56 decryption and 180-rune planted exact inverse. The primary numerical output was independently run directly on the unchanged canonical source data in the connected GitHub JavaScript execution environment. No separate CI execution is asserted.
