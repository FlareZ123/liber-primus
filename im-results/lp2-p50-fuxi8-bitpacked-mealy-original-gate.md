# Original LP2 32×8 table as a 5+3-bit eight-state cipher: finite gate

**Agent 5, 18 November 2026. Original-input result; no unknown plaintext recovered.**

## Why this specific operation was tested

The manuscript prints a 256-cell byte-valued grid in exactly **32 rows × 8 columns** on physical pp49–51. The alphabet contains **29 GP rune symbols**, fitting five binary bits, while eight columns can designate a three-bit state. The independently reported 2016 Fu-Xi reference could suggest trigrams (eight three-bit states), **but the exact original Fu-Xi primary page remains unacquired**; neither the phrase nor the table explicitly instructs a byte-packed Mealy cipher. This is a concrete, executable *candidate*, not authenticated creator intent.

Freeze each 8-bit cell as either `[3-bit successor state | 5-bit keystream mask]` or `[5-bit keystream mask | 3-bit successor state]`. The table is indexed by the previous GP29 rune (row 0–28) and current state (column 0–7); row input is either published predecessor ciphertext or decoded predecessor plaintext. Decode one original ciphertext rune by adding or subtracting the five-bit mask modulo29 and update the three-bit state. The initial predecessor is F/GP0, with all eight states tried openly, and the state either runs across the book or restarts at each physical page. Those **2 packings × 2 causal predecessor registers × 2 directions × 2 reset clocks × 8 initial states = 128** completely specified reversible original-cipher models use exactly the original data, without free alphabet tables or key searches.

## Decisive original-input result

- The complete **12,956** authentic unknown runes (55 rune-bearing physical pages) have IoC **0.03447839786450569**.
- Across all 128 modeled inverses, decoded whole-book GP29 IoC ranges only **0.03445890368600836–0.03451370425257878**. The best is *ciphertext-predecessor*, high-three/low-five packing, subtraction, continuous book clock, starting state4 or6. All remain extremely flat compared with the genuinely clear p57 GP29 control **0.06270996640537514**. None yielded coherent unknown-page prose.
- Every model **exactly decrypts and reencripts all 12,956 original symbols**. Every model also recovers a separate 12,956-rune native-p57-tiled plaintext planted through its own encoder, exactly **12,956/12,956**. The original reencryption check is only a correctness invariant; it cannot establish a historical key.
- More fundamentally, treating the five-bit cell field as a **direct output GP29 symbol** fails key-independent local reversibility. Among the 29 row inputs of each state, the low-five packing has only **15,18,18,20,17,19,21,16** distinct outputs and **14 invalid symbols 29–31** overall. The high-five packing has only **21,20,17,18,16,18,17,20** distinct outputs and **23 invalid symbols**. Thus neither packing is a one-symbol-per-step permutation of all 29 GP symbols. In the keystream models these invalid mask values are instead reduced modulo29, preserving invertibility of the additive step.

The experiment uses **all eight starts** and both orientations without selecting a favorable output. The statistical result rejects the tested direct GP-native-prose receivers; the local permutation defect independently rejects the simplest direct-output reading. English-like IoC is a useful gate and not proof against arbitrary non-English plaintext.

## Decision and scope

Retire **only** the literal 32×8 table-as-eight-state, 5+3-bit additive predecessor-feedback decoder and direct-symbol lookup under the specified clocks. A true Fu-Xi instruction selecting a different input word, state update, byte serialization, nonadditive receiver, or hidden key remains untested. This result should not spawn an arbitrary catalog of bitfield rotations or newly tuned state conventions without independent authored evidence. The original 2016 Fu-Xi primary page is still the missing source selector.

**Exact reproducer:** [read-only Windows-compatible Node22 SFT](../sims/lp2_p50_fuxi8_bitpacked_mealy_original_sft.cjs), source inputs `resources/liber-primus/lp2-grid-256.json` and `lp2-corpus.json`. **Original GitHub Actions PASS:** [run 44258282832](https://github.com/FlareZ123/liber-primus/actions/runs/44258282832), with all 128 native-source and planted-positive assertions passing.
