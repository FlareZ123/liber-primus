# LP2 p50 plaintext-prime byte-state cipher: 256-seed synchronization gate

**Agent 19, 22 November 2026. Result:** source-constrained, reversible cipher hypothesis exhaustively rejected for standard GP29 English. All **2,048** original-cipher inverses are nonlinguistic; every one of the eight variants **forgets all 256 unknown starting keys** within the first **2,862** original runes. No recovered unknown-page plaintext, authentic creator key or continuation destination. [Executable Node22 CommonJS SFT](../sims/lp2_p50_plaintextprime_256state_exhaustive_sft.cjs), [independent Windows Actions PASS #44996184365](https://github.com/FlareZ123/liber-primus/actions/runs/44996184365).

## Human-selectable hypothesis and explicit inverse

The authentic signed 2016 Cicada sentence says the book's *words* are its map and its *numbers* the direction. The intact p49–51 numeric plate has exactly **256 source-ordered two-character tokens** in 32 rows × 8 columns, yielding a natural byte-address state 0..255. Gematria Primus assigns exactly one published prime value to every 29-rune letter. A low-description-length, **plaintext-driven byte pointer** is therefore a concrete candidate distinct from prior *ciphertext*-word eight-compass shifts or 29-state previous-plaintext-word Caesar feedback.

Starting from an unknown byte address \`s∈0..255\`, read table byte \`T[s]\`, set \`k=T[s] mod29\`, and decode each untouched original GP ciphertext glyph \`C\` as

\[
P=(C+\epsilon k)\bmod29,\qquad \epsilon\in\{-1,+1\}.
\]

Advance the byte state by the **decoded plaintext** GP prime weight \`π[P]\`:

\[
s'=(s+\pi[P])\bmod256.
\]

Two separately source-visible clocks are frozen. **Rune clock:** update state after *each* decoded rune and reread the table for the next glyph. **Word clock:** hold the table-derived key constant for each of the **2,896 exact printed words**; update the state once at its end by the **sum of all decoded word-rune prime values modulo256**. Both are exactly reversible via \`C=(P−εk) mod29\` using identical plaintext-derived state updates. Test both established interpretations of original tokens, radix60 as printed and radix59 deleting the source-absent glyph \`f\`, plus both additive signs. The complete finite family has **2 radices × 2 clocks × 2 signs × all256 initial byte states = 2,048 original full-book decryptions**, no tuned offsets, unknown key text, skipped source characters, altered page breaks or added cipher layers.

The original inputs are \`resources/liber-primus/lp2-corpus.json\`, \`lp2-transcription.txt\`, \`lp2-grid-256.json\`, and [the nine original solved GP29 source sections](../resources/external/relikd-solved-gp29-native-v1.json). All 12,956 original p0–55 glyphs exactly reconstruct from the 2,896 continuous printed words; source page carries are joined, and the blank p50 rune page consumes no state. The model assumes a **single register across the manuscript**, since no source instruction selects chapter resets.

## Full-state collapse and original receiver

For each original source glyph, propagate the next byte address for **all 256 initial secrets in parallel**. This is a direct state-machine calculation using only published GP-prime weights and source ciphertext; it does not assume English or rank candidate plaintext. In each of the eight variants, the 256 trajectories coalesce to **one exact state**, so the later decoded runes are identical under all initial keys. The first source-exact coalescence, including if it occurs midword, is:

| Radix | Clock | Decrypt sign | First all-seed merge | Earliest locked original-rune position | Range of **full** normalized GP29 IoC over all256 seeds |
| ---: | --- | :---: | ---: | ---: | ---: |
| 60 | Rune | − | rune **796** | 796 | 0.999779–1.000206 |
| 60 | Rune | + | rune **299** | 299 | 0.999385–0.999755 |
| 60 | Word | − | word **614** | 2793 | 1.000503–1.001331 |
| 60 | Word | + | word **360** | 1652 | 0.999620–1.000671 |
| 59 | Rune | − | rune **383** | 383 | 1.000160–1.000482 |
| 59 | Rune | + | rune **172** | 172 | 0.999320–0.999776 |
| 59 | Word | − | word **365** | 1671 | 0.999373–0.999917 |
| 59 | Word | + | word **628** | 2862 | 0.998802–1.000096 |

Thus even the slowest candidate has **at least 10,094 completely seed-independent original runes**. The precise first merged pointer positions are immutable consequences of the source byte table, ciphertext and frozen inverse. Every complete original decrypt remains near the random GP29 normalized-IoC reference **1.00**; the best *source-train-selected* first729-rune IC across all2,048 initial seed/operation variants is only **1.017682**. The nine authentic solved GP29 texts have native language concentration far larger; their pooled native register repeated to the original 12,956-rune shape exceeds **1.65**, before any original cipher is decoded.

An exact positive control is important here: using all **2,979** source-solved native runes, cyclically extended into 12,956 source-shaped positions, independently encrypt **three hidden starts** 0,81,255 under **every one** of the eight stated models, then decrypt and require byte-exact recovery. **24/24 native full-register plants pass**; 24 separate unchanged original-source inversions also exactly reencrypt the 12,956 ciphertext runes. This proves algorithmic reversibility, while the seed-invariant nonsense receiver proves the actual original cannot be decoded to normal GP29 English by this family. Reencryption alone is never treated as plaintext evidence.

## Decision

Retire precisely the **256-address byte-table GP29 additive cipher whose state advances by the published GP-prime value of the *recovered* plaintext**, under its source-natural global word and rune clocks, both signs, both digit radices, and every initial secret byte. Testing more start seeds cannot rescue the forced output because **all seeds synchronize**. This inference is stronger than the generic “best language score low”: the full key has been eliminated before decoding the overwhelmingly large original suffix.

A different authentic operation could depend on encoded *ciphertext*, a second state, a page/chapter reset, a cryptographic private key, repeated-symbol exceptions or table digits read in a source-selected different way. None is justified by the tested source operands, and this result does not exclude those different mechanisms. Keep attention on independent clues that actually select a reversible decoder or recover historical key material.
