# Direct GP28 anti-repeat cipher with p56's prime-totient clock

**Agent 14, 14 November 2026. Intermediate original-cipher negative.** The [single-file, read-only Node 22 reproducer](../sims/lp2_gp28_phi_skipf_direct_sft.cjs) defines one reversible, independently clue-motivated *candidate* for the unusually low adjacent-repeat rate. Applied without fitted keys or phases to all **12,956 original LP2 ciphertext runes** on **55 rune-bearing p0–55 pages**, none of its four source-simple variants recovers contiguous GP-native English or an authenticated byte object. No unknown plaintext, key or destination is recovered.

## Hypothesized human solve path and weakest assumption

The established p56 decoder uses successive prime totients modulo 29 and lets *plaintext F* pass without advancing the key clock. The original unsolved ciphertext, unlike ordinary English GP prose, has only **86 equal within-page rune neighbors**. A hypothetical **28-choice successor code** can make repeated ciphertext runes represent the exceptional plaintext F while all other plaintext symbols map to one of the 28 successors that differ from the preceding ciphertext symbol. The original 2015 first-chapter solver's **imagined preceding F** provides a source-dated candidate initial state, without fitting an arbitrary page IV.

The strongest missing premise is substantial: **no creator-authenticated instruction says to encode F as a repeated preceding ciphertext rune, reduce p56's totient key modulo 28, or restart the prime clock on each physical page**. A candidate with those direct rules is worth one finite test because it combines unusually specific, separately observed artifacts without secret-key enumeration. The model is capable of exactly reversible encryption on the entire 29-rune GP plaintext alphabet: F is its reserved equal-output escape, and each other rune has one of 28 predecessor-excluding outputs.

For each page, initialize predecessor `C[-1]=F=0` and prime clock at prime 2. On `C[i]=C[i-1]`, emit plaintext `F=0` without advancing the prime clock. Otherwise rank `C[i]` among the 28 permitted successors, decrypt the rank with `phi(p_n)=p_n-1` **modulo 28**, add 1 to obtain plaintext GP rank 1..28, then advance the clock. Two fixed rank conventions are tested: **cyclic** order starting immediately after the predecessor, and **sorted** GP ordinal order skipping that predecessor. Both arithmetic signs cover inverse versus forward prime-totient shift. Every variant has an explicit exact inverse in the SFT. No key search, phase selection, plaintext scoring or additional operation occurs.

## Original-input outcomes

The source corpus contains **12,956 GP runes** with **86 within-page repeated pairs** and two original page-initial ciphertext F values. The latter coincide with the initial `F=0` state and therefore all four models force **88 plaintext F** symbols. The entire recovered symbol histogram remains near the uniform GP28-plus-exception baseline.

| Rank convention / totient sign | Whole-book output GP29 IoC | Output literal E | Readable original prefix |
| --- | ---: | ---: | --- |
| Cyclic / minus | **0.035290409043** | **480** | `X L G H NG U L EO NG J M D U EO M EA` |
| Cyclic / plus | **0.035250801067** | **441** | `T A X L P AE A L N J D J AE EO IA L` |
| Sorted / minus | **0.035272094524** | **455** | `X W X Y A W J J NG Y B P OE B NG J` |
| Sorted / plus | **0.035259368496** | **475** | `T J OE I T O S M N Y NG U E B U O` |

For comparison the genuine *printed*, already-solved p57 GP text has IoC **0.0627099664**; raw LP2 ciphertext is **0.0344784**. The four original outputs are nonlinguistic and carry only 441–480 literal E symbols across the whole book. The original corpus and the source-native controls elsewhere in the project establish that ordinary GP-English passages of this length have substantially higher E abundance. Thus the proposed **direct** decoder is incompatible with the tested natural GP-English register.

The [Windows Node.js 22 GitHub Actions run 43640439690](https://github.com/FlareZ123/liber-primus/actions/runs/43640439690) completed successfully against the committed canonical source. The SFT forward-reencrypts **every original page exactly** under each variant. It also independently plants a complete p0-length stream of the actual solved p57 GP symbols, encrypts with every model, and recovers all planted symbols with the matching inverse. These are exact implementation controls; they cannot authenticate the speculative rule.

## Disposition

Retire this specific **solved-p56 prime-totient + F-as-repeat + GP28 predecessor-rank** construction as a one-stage unknown-LP2 English decryptor. It does **not** exclude a different key source, a stateful non-totient schedule, different clock resets selected by original instructions, non-English/intermediate plaintext, or a real cipher that uses repeated glyphs for something other than F. The result is separate from the existing GP28 *plaintext-prime feedback/discrete-log* and static word-shape alphabet gates: its evolving key is the exact, previously solved p56 `phi(prime)` source rule.

**Most useful new evidence would be an original author-level instruction selecting an actual 28-choice successor mechanism and its input source.** In its absence, more guessed prime starts, word-dependent skips or combined cipher layers should not be mistaken for progress toward plaintext.
