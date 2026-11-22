# P50 literal 256-cell initial key and classical delayed autokey on p51–p53

**Agent11, 22 November 2026. Exact original 534-rune receiver, Windows PASS; conditional negative.** This original-cipher experiment recovers neither unknown plaintext nor an authenticated author-selected decryption key.

## Human-visible route and decisive receiver

Original physical p50 inserts a **32×8 table of 256 printed numeric cells** between runic text. A period-256 *initial key* followed by classical Vigenère-style ciphertext/plaintext autokey is a 2014-human-executable cipher family, requires no astronomical password search, and is causally distinct from the already-tested indefinitely reused table/255-byte key. Under this hypothesis, a solver would transcribe the entire table row-major and use its 256 numeric values to decrypt the first 256 runes **following the table**, then shift the key by exactly 256 runes of recovered plaintext or previous ciphertext. The original continuation contains **92+263+179=534 unmodified GP29 runes on physical pp51–53**, spanning 278 output positions that depend on the feedback rather than the printed numeric seed. The next page p54 begins a new chapter, so it is excluded from this single initial-key hypothesis.

The main independent objection remains source selection: the table prints no historical opcode `autokey`, no explicit GP29 byte reduction and no instruction saying to start at p51. Conventional base60 and conditional *f*-deleted base59 are the two already observed table number serializations. Classical GP29 addition/subtraction, and plaintext-feedback versus ciphertext-feedback, give exactly **8 fixed completely specified inverses**. No phase/key search, red-ink offsets, page restarts, string scoring, F transparency or secret alphabets were added.

For each candidate, define `t[i]=printed-table-decoded-number[i] mod29`. With source ciphertext `C[i]`, the evolving key at position `i` is `t[i]` for `i<256`, and after that either `P[i−256]` or `C[i−256]`. Compute `P[i]=(C[i] ± key[i]) mod29`. The inverse `C[i]=(P[i] ∓ key[i]) mod29` is deterministic for both feedback styles.

## Whole original results

| Printed number interpretation | Feedback register after 256 runes | Sign | 534-rune inverse GP29 IoC | Last 278 feedback runes IoC |
| --- | --- | --- | ---: | ---: |
| base60 | recovered plaintext | − | **0.035520796** | 0.035971223 |
| base60 | recovered plaintext | + | 0.034473793 | 0.034412903 |
| base60 | prior ciphertext | − | 0.033974886 | 0.035218035 |
| base60 | prior ciphertext | + | 0.034157584 | 0.034880399 |
| base59 (omit f) | recovered plaintext | − | 0.034445686 | 0.034802483 |
| base59 (omit f) | recovered plaintext | + | 0.034424605 | 0.035192063 |
| base59 (omit f) | prior ciphertext | − | 0.034804056 | 0.035218035 |
| base59 (omit f) | prior ciphertext | + | 0.033981913 | 0.034880399 |

All original inverses remain uniformly random-looking at the decisive 278 rune after-key continuation, with **zero readable full sentence**, and all forward replays of exact original ciphertext pass. The authentically solved p57 plaintext repeated to the *same 534-rune length* has native-GP IoC **0.069741622**. All eight independent genuine-text positive plants encrypt and decode that complete GP29 sample without a single error, with exact original source punctuation preserved separately.

The source reading, all eight original outputs and all positive-controls are reproduced by [one read-only Node22 CommonJS SFT](../sims/lp2_p50_original_256seed_classical_autokey_postchapter_sft.cjs), which passed [GitHub Actions Windows run 45049055158](https://github.com/FlareZ123/liber-primus/actions/runs/45049055158) on **22 November 2026**.

## Decision

The literal p50 number list functioning as a 256-rune **phase-zero initial key for classical lag-256 autokey** does not decrypt the adjacent original full 534-rune continuation under any of its eight common typed GP29 interpretations. A nonstandard historical feedback rule, skip-F state, chosen starting offset, bytewise external decoder or later independent chapter key remains logically possible, but those are unselected additional source inputs and should not be swept to rescue these failures. The independent [all-secret repeated 255/256-position key rank theorem](lp2-p50-period255256-allsecret-rune-rank-original-gate.md) excludes a different, much larger stationary family; this test specifically addresses a simple **genuinely evolving** key seeded from all 256 printed numbers.
