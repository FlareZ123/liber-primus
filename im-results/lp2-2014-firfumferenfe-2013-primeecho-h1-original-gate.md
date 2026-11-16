# Authentic 2014 keyword × original 2013 prime_echo: exact H1 inverse gate

**Decision (16 November 2026, Director issue #1194):** A source-frozen two-layer GP29 additive key from the solved 13-rune LP1 keyword and original 464-event 2013 CicadaOS prime output cannot cover both intact original LP2 chapter openings under a single H1 collision-retry model with the authentic plaintext-F bypass. Two independently tested H1 collision-clock conventions have *exact source-cipher impossibilities before rune124*. This is a bounded conditional exclusion of this single composite key. There is still no recovered unknown LP2 plaintext, creator key or destination.

## Clue and one frozen inverse

The authentically solved LP1 second koan contains the exact 13-rune keyword **FIRFUMFERENFE**. The byte-preserved 2013 CicadaOS source, [original prime_echo](../resources/historical/cicada2013-os-original-prime-echo.sh), prints 464 consecutive prime events 2..3301 and uniquely pauses for two seconds immediately after 1033 (event174, index173), with a final pause after 3301. The source never instructs a solver to combine these separate historical stages; this is an explicitly provisional hypothesis.

Fix the entire Vigenère-style additive key before looking at unknown ciphertext:

**K(j) = (prime[(173+j) modulo 464] + GP(FIRFUMFERENFE)[j modulo 13]) modulo 29.**

The source tape begins at original prime 1033, the keyword begins at F, and both pointers start at zero at each selected chapter opening. Addition order is mathematically immaterial. Follow the independently solved original plaintext-F rule: F in plaintext emits ciphertext F and consumes no key, while encrypted non-F may also yield ciphertext F.

Two prior published H1 models provide the only collision conventions. **Skip** rejects 0..5 candidate symbols matching preceding ciphertext and advances to the next source key. **Coin** may perform its single redraw and consumes its defined pointer increments, including the two-term rule for repeated source ciphertext. A complete dynamic program retains **every reachable key-consumption count**, including every possible plaintext-F skip. The test requires no plaintext language scorer, fitted key phases, beam search, or selected rune substitution. Therefore the first point where the reachable set is empty cannot be rescued by an English prior under the same model.

Untouched 220-rune original windows:
- p0–2 first220, SHA-256 of GP29 index bytes: 5c4dffff24b3117cd4f155f8cb838ca3f48f2c80635788d45a615c8d20ca2cf4.
- p40–53 first220, SHA-256: 661802e2e90bda74bd6e395a3de2c74b9f81c694337d62d353e27c69b55a676e.

## Source-original results

| Fixed H1 model | p0 original | p40 original |
|---|---|---|
| Skip, 0..5 collision retries | All 220 reachable; five final key states | **Impossible at zero-based rune123** |
| Coin, one redraw | **Impossible at zero-based rune51** | All 220 reachable; six final key states |

Both failures precede any 464-prime source-list wrap, so neither is caused by the chosen periodic extension. The surviving windows have no authenticated plaintext and no identified final key clock. No *single* fixed tested model can decode both original chapters. Unspecified per-chapter mode switches, other prime transforms, arbitrary offsets, changing the F rule or keyword shifts would be distinct hypotheses requiring new original clues.

## Control, implementation and scope

The positive uses three copies of independently solved native GP29 **p57 PARABLE** plaintext (285 runes). They are forward-encrypted under the same composite source key. Each positive contains **nine literal plaintext Fs**; the skip model performs **10 true collision retries** and the coin model **17 redraws**. The complete inverse preserves 285/285 source-native rune positions under each model (13 and 23 final key states). The planted cipher SHA-256 values are skip dd8040eca0d4d4135c40959639effdc575c2fd9c2927cb2f90a5677dfd8d75e9 and coin 9a6e1b76a5b7453f84a8b26ad0c5c6849215fb5cc6e5e7e2616fc3b11bab0fa6.

Matched wrong-key/origin controls use exactly the same inverse with the keyword rotated by one, incorrect adjacent prime1031 and the other observed prime3301 pause. **Several wrong keys also pass the reachability positive.** This correctly establishes that path survival is *not* key identification. However the true frozen key's original impossibility is a valid exclusion even with this permissive inverse. The positive is a full source-known plaintext roundtrip under deterministic H1 encryption; the experiment is not evidence of historical LP2 encryption.

**Reproducer:** [read-only Node22 CommonJS SFT](../sims/lp2_kw13_prime464_h1_original_sft.cjs), using only unchanged resources/liber-primus/lp2-corpus.json and resources/historical/cicada2013-os-original-prime-echo.sh. **Windows CI PASS:** [run 43809706409](https://github.com/FlareZ123/liber-primus/actions/runs/43809706409). Prints original and all control observations in JSON; two exact original assertions, source parsing and both native plants pass.

**Decision:** Retire this particular history-derived composition and demand a first-party operation/key selector before varying symbols, source offsets or collision modes. An authentic >=150-rune plaintext, plus exact forward encryption and independent holdout, remains the standard for a new breakthrough.