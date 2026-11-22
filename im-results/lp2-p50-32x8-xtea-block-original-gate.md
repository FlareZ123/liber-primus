# Original 32×8 table and XTEA: full original-input key recovery and block-decryption gate

**Agent15, 22 November 2026. Classification: bounded negative, original 256-byte table. No authenticated secret key or unknown LP2 plaintext.**

## Human-motivated operation

Physical LP2 pp49–51 print a **32-row × 8-column** numeric table. A standard XTEA encryption is **32 full cycles of an eight-byte (64-bit) block** with a 128-bit secret key consisting of four 32-bit words. This creates two distinct human-readable interpretations of the authentic table shape: a trace of 32 successive intermediate block states, or a list of 32 separately encrypted blocks. The eight-byte/32-cycle alignment is genuine and source-visible. The original manuscript provides no signed author instruction selecting XTEA, any byte-endianness or a corresponding 128-bit key. Treat this as a motivated **one-cipher-family question**, not an established cipher identification.

The source bytes are exactly the printed 256 tokens, in 32×8 row-major order, under the repository's declared base60 byte convention. The three original printed pp49/50/51 fragments contribute 80/104/72 bytes; they are concatenated without artificial row resets at page breaks. This convention and table-to-byte mapping are themselves not authenticated by Cicada. No arbitrary row reordering, byte masks, key searches or ciphertext alteration are allowed.

## A 31-equation XTEA state-trace attack with no key search

For XTEA, with \(D=\mathtt{0x9E3779B9}\) and \(f(x)=((x\ll4)\oplus(x\gg5))+x\pmod{2^{32}}\), a full cycle from state \((u,v)\) to \((u',v')\) with round-sum \(s\) obeys:

\[
u' = u + \bigl(f(v)\oplus(s+K_{s\&3})\bigr)\pmod{2^{32}},\quad
v' = v + \bigl(f(u')\oplus(s+D+K_{(s+D)\gg11\&3})\bigr)\pmod{2^{32}}.
\]

Hence every adjacent pair of printed states directly **recovers two indexed 32-bit key words** by algebraic inversion of these equations. No guessing the 128-bit key is needed. A genuine 32-state trace must make all repeated observations in each of four key slots identical. Allow the two natural byte endiannesses, two possible half-block orders and two natural trace origins (row0 before cycle0, or row0 after cycle0), giving exactly **eight frozen original-state interpretations**.

For **all eight**, the 31 original adjacent-row transitions generate 62 inferred key observations partitioned across four slots (typically 14–17 observations per slot). Within each key slot **every derived 32-bit value is distinct**. The maximum candidate reuse is **one**, where a true XTEA trace requires every reuse to be equal. This is an algebraic disproof of all eight stated literal 32-round trace interpretations, independent of language models and without key brute force. Positive controls planted 32 successive actual XTEA states and recover exactly the four known 32-bit key words \([257,38,48,3301]\) across all 31 steps, including both start-cycle conventions and all byte/half orientations.

## A separate complete-block original decipherment consumer

If the table instead consists of 32 independent encrypted eight-byte blocks, there is no round-to-round state relation. A literal human candidate for the four-key-word field values comes from the three original p0 consecutive F-headed whole-word Gematria prime sums \([257,295,48]\), giving modulus257, reduced base38 and exponent48, plus the deterministic public value \(38^{48}\bmod257=225\). Freeze tuple **\([257,38,48,225]\)**. A second authored numeric clue, the red p39 coefficient15 (also \(38^{24}\bmod257=15\)), supplies a separately constrained fourth word, giving **\([257,38,48,15]\)**. Neither the tuple-to-XTEA association nor the use of the coefficient as a key slot is first-party established.

Test both complete original keys against **all 32 original blocks** in both byte endiannesses and both half-block orders, for eight full-256-byte reversible XTEA decryptions. Every output fails at the **first direct native-text criterion**: at most **41/256 bytes** represent valid GP29 symbol indices 0–28. At most **103/256** bytes are printable ASCII, and no result begins a readable narrative. No partial, fixed-width shift or post-hoc compression hypothesis is introduced to rescue the outputs. Each of the eight fixed variants exactly encrypts and recovers a genuine solved-p57 GP-native **256-byte repeated-text plant**. The decryption/reencryption property is a correctness control, not authentication of the guessed source key.

## Decision and scope

This eliminates a particularly concrete **32-round XTEA state trace** interpretation and two direct author-number-derived **XTEA block-decryption** interpretations of the original p50 table. It does *not* refute XTEA applied to a differently serialized or independently derived key, a compressed/encrypted intermediate, an unordered trace, or some other cipher family. Their selection would require a new original source clue; absent that, more numerical key mixing would be unrestricted fitting. Nothing here recovers a usable 128-bit private key, source-typed plaintext word, final page or continuation URL.

[Exact complete original-data CJS and all positive controls](../sims/lp2_p50_32x8_xtea_round_trace_original_sft.cjs) · [Windows Node22 PASS on source commit bf8a546](https://github.com/FlareZ123/liber-primus/actions/runs/44980210929). XTEA algorithm standard: [Moshe Rubin's Chaocipher is unrelated; do not infer that name or cipher from this test](https://en.wikipedia.org/wiki/XTEA).
