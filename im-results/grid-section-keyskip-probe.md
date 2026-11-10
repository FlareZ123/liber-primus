# AES/ChaCha grid-column keys with hidden collision skips at section starts

**Status: bounded, executable negative, no LP2 plaintext or key recovered. Agent 45, 2026-11-10.**

This experiment extends [direct section-continuous stream decoding](grid-section-column-keys.md). The 32×8 LP2 base-60 grid provides eight 32-byte vertical keys. Rather than assuming one key byte consumed per output rune, it explicitly models a **collision-activated extra key consumption**: for a plaintext rune P and current pad position j, emit C=(P+sign·K_j) mod29. If a trial C would equal the immediately preceding emitted rune, the algorithm can discard that draw and retry the same P with K_(j+1), consuming up to two extra key positions. The Viterbi decoder allows up to three draws per rune, using a 3.5-unit score penalty per rejected key draw.

The hypotheses searched are: AES-256-CTR or ChaCha20 with all-zero 16-byte IV, each of eight raw grid columns independently as 32-byte seed, forward/reversed key, byte mod29/scaled29 reduction, and both arithmetic signs, **128 candidates per text-section head**. For each of the eight section groups (all original 12,956 runes accounted for), score the first 24 runes under the strict skip-aware model, retain the best 24, and decode the first 220 runes using the Shakespeare-trained GP trigram language model and the exact decoder. Both key-stream and language models are unchanged between control and real ciphertext.

## Actual test, positive control and null

[Successful manual GitHub Actions run 42753423517](https://github.com/FlareZ123/liber-primus/actions/runs/42753423517) on Node 22:

- **Positive:** encrypt 220 genuine, separately sourced LP1-solved runes under the actual AES-256-CTR first grid column, forward key, mod29, positive encryption sign. With seed 0x452301c2 and 82% probability of re-keying after an adjacent repeat proposal, the generator consumed **nine extra pad bytes**. The true key ranked **first of all 128** at the 24-rune head and the decoder recovered **220/220 plaintext runes** and exactly **nine skips**, score **−2.537283 per rune**. The selected winner was the exact planted configuration.
- **Actual LP2:** the best surviving 220-rune decode scores across section groups 0–7 were **−5.520081, −5.431117, −5.484182, −5.435149, −5.645129, −5.541933, −5.495925, −5.403382**. None yields a stable English-like GP passage, and the strongest 24-rune head improvements disappear with more ciphertext. For example group 2's best 24-rune score was −3.283457 but its 220-rune score fell to −5.484182.
- **Wrong-key null (group 0):** 40 independent, seed-fixed within-column byte-order shuffles, each re-tested through the complete 128-key head selection and best-24 full decoder. Observed winner **−5.520081** against shuffled mean maximum **−5.533953** and shuffled maximum **−5.364663**. Corrected upper-tail empirical **p=0.39024**.

The evidence does not support this AES/ChaCha section-key family with a one/two-collision-retry pointer. In particular, the planted control establishes that the 24-head/24-survivor screen can recover the correct underlying key with nine unobserved extra draws. The null covers only group 0; other seven real groups were screened directly against the planted control's recovery standard, without separate null p-values.

The experiment cannot exclude an unknown key offset beyond section start, extra key draws unrelated to a ciphertext repeat, a different cipher mode/IV, arbitrary outer rune permutations, independently varied modes by section, a non-English-language register, or a longer retry budget. Its useful conclusion is that this additional concrete mechanism fails to produce a plausible, reproducible plaintext from the original table.

**Reproduce:** 'node sims/grid_section_keyskip_probe.cjs' using the committed original grid and LP2 transcription; manual workflow '.github/workflows/grid-section-keyskip-probe.yml'. Exact results are printed as PLANT / REAL / NULL JSON records. This is an opt-in workflow, with no on-push trigger.
