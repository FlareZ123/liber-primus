# Rune-gram state-capacity bound without trusting LP2's printed word boundaries

**Agent21, 17 November 2026. Classification: new key-independent necessary-condition theorem and three original-input reference-register tests. No unknown LP2 plaintext, decryption key, author-selected cipher or destination is recovered.**

## The causal question

The 12,956 unsolved LP2 GP29 runes are close to uniformly distributed and contain only 86 original adjacent repeats. One economical hypothesis is a **deterministic finite-state GP rune transducer**, for example a rotor or a source-number-driven hidden alphabet, rather than a separately generated secret keystream. Earlier source-word graph bounds required each printed word to be a corresponding plaintext word. Since LP2's printed separators may be ciphertext framing, that alignment is an unproved prerequisite.

This test grants arbitrary plaintext word boundaries. It also grants the cipher **every possible unknown state transition, output substitution and state trajectory**. The sole frozen model restriction is a length-preserving deterministic sequential encoder which, from a hidden state and one input GP rune, emits exactly one ciphertext GP rune and updates its state; no independent absolute-time oracle, new nonce, external keystream or uncounted rekeying is available. More complicated keyed or variable-length constructions are outside the result.

## Exact mechanism-independent theorem

Let an encoder have `K` hidden states. For any fixed input string `u` of `L` GP runes, an occurrence beginning in state `s` has a *deterministically fixed* ciphertext output string `E_s(u)` of the same length. Hence the set of distinct ciphertext `L`-grams paired with that **same plaintext `L`-gram** has cardinality at most `K`.

For a proposed plaintext register `P`, aligned rune-for-rune with original ciphertext `C`, define

```
D_L(P,C;I) =
  max over all GP L-grams u:
    |{ C[i..i+L-1] : i in interval I, P[i..i+L-1] = u }|
```

where `I` contains only fully internal substrings. Then **every deterministic sequential K-state encoder of the described class must satisfy `K >= D_L`**. The proof is the pigeonhole principle: distinct output strings for the same input string require distinct incoming states. It does not assume a particular rotor, secret alphabet, previous-cipher rule, word dictionary, language score, or actual state schedule. Even independently chosen (and hypothetically adversarial) starting states at *every rune* cannot evade the necessary bound.

The inequality is necessary, not sufficient. It is relative to the supplied hypothetical `P`, and by itself cannot decide what the *actual* LP2 plaintext is.

## Original-source test and coherent controls

Original ciphertext is `resources/liber-primus/lp2-corpus.json`, all p0–p55 rune-bearing pages concatenated, with p50's zero-rune table excluded: **12,956 untouched GP29 runes across 55 physical pages**. Compute `D_L` for every `L=2,3,4` on the complete book. For each independently keyed original artwork chapter, compute `D_2` separately and take the highest across nine chapters with source-authentic lengths `729,1145,1729,1903,1021,1433,1680,3008,308`. As the most permissive visible scope, independently rekey all 55 original physical rune pages and take the maximum pagewise `D_2`.

The **hypothetical plaintext controls are coherent contiguous prose**, not independently sampled word-length-matched words. Encode the repository's pinned Shakespeare, Kahlil Gibran and Emerson controls using the previously used longest-match GP29 transliteration, with attested ING and IO compression and ordinary source-normalization spelling folds. Select **150 evenly spaced contiguous 12,956-rune windows in each source**. In each alignment compare the actual unchanged LP2 ciphertext to its full-length native-GP candidate. Discard literary punctuation and spaces for *both* sources: no LP2 printed word separators or lexical matching are used.

| Source-native coherent reference | Global `D₂` min / mean / max | Independently keyed nine chapters `max D₂` min / mean / max | Independently keyed 55 pages `max D₂` min / mean / max |
|---|---|---|---|
| Shakespeare (217,106 GP runes) | **176 / 221.78 / 265** | **46 / 62.49 / 96** | 10 / 12.99 / 20 |
| Gibran (62,492) | **214 / 285.49 / 354** | **53 / 83.31 / 119** | 11 / 15.75 / 25 |
| Emerson (321,327) | **205 / 246.16 / 310** | **52 / 67.91 / 95** | 10 / 13.05 / 19 |

Across the **450 specified original-alignment controls**:

- Under one bookwide deterministic transducer, **0/450** can be encoded by any **K <= 128** state machine, whatever its secret output tables or transition function; the smallest necessary `K` is **176**.
- Even if all nine original artwork chapters have independently keyed transducers, **0/450** can be encoded with **K <= 29** states per chapter; the smallest maximum chapter requirement is **46**.
- If all 55 physical rune pages receive entirely independent cipher tables, every tested control *passes this necessary inequality* for `K=29`. Thus **the bound does not exclude page-local 29-state machines**. A common 29-state machine merely resetting its state at pages remains excluded by the full-book bound.

For completeness, global `D₃` minima are Shakespeare **92**, Gibran **112**, Emerson **104**; global `D₄` minima are **35, 48, 24**, respectively. `D₂` supplies the strongest simple constraint here. These are explicit fixed reference controls, **not a universal theorem that every possible English book has the quoted minima**, nor a population p-value. A coherent source has repeated common rune pairs and the original ciphertext nearly always displays different two-rune outputs at their aligned occurrences.

### Exact minimum physical-page rekey capacity at 29 states

The nine published chapter boundaries exclude a 29-state encoder on every literary alignment, but a 29-way rotor might be **rekeyed at some additional original page breaks**. Grant all **54 possible between-rune-page cuts** as independent new codebook boundaries, even where the original illustration supplies no visual selector. Starting at the first printed page, keep adding complete pages to one domain for as long as the source-exact two-rune fanout is at most 29. On the first failure, rekey before that page, exclude the crossing bigram, then continue. Because adding more positions can never reduce fanout, the longest-valid-prefix greedy partition gives the **minimum number of contiguous page-key domains that can satisfy this necessary inequality**. It does not construct any actual compatible state-transition cipher.

| Hypothetical GP plaintext source | Exact windows | Minimum independent page-key domains | Mean domains | Maximum domains |
|---|---:|---:|---:|---:|
| Shakespeare | 150 | **9** | 11.527 | 14 |
| Gibran | 150 | **11** | 16.327 | 20 |
| Emerson | 150 | **11** | 12.287 | 15 |

A globally stable 29-state transducer fails. Nine *fixed original-artwork* key domains also fail. Passing even the relaxed necessary capacity on these literary controls would demand **9–20 independently keyed domains placed at additional or differently located physical page boundaries**, depending on the exact candidate plaintext; 29 states with entirely independent keys at each of 55 rune-bearing pages are not excluded. Actual deterministic encoding might require more domains. This provides a concrete constraint for an independently sourced key-refresh instruction without presenting a self-selected page-cut plan as a decryption.

### Genuine Cicada plaintext as the control register

The three literary sources above may differ stylistically from Cicada's actual authored text. To test that rival **without fitting any language model**, independently use the repository's already-solved LP1 and LP2 source-authored prose, [the first-party decoded reference](../resources/liber-primus/lp1-plaintext-reference.txt). It contains editor-normalized Latin transliterations but tracks the authenticated original solved messages. Avoid double-counting editorial continuation recaps on physical LP1 pp4,7,8, and discard numeric-only square rows, editorial commentary and p56's long hexadecimal hash. Encode its remaining natural-language text with the same fixed GP convention: **2,988 GP runes**. The source spans multiple original solved episodes, so its complete concatenation is a comparison register rather than one historically continuous 2,988-rune Cicada chapter.

Three original encrypted chapter lengths fit wholly inside that first-party 2,988-rune register. Exhaust **every contiguous possible position** of a known-source original-rune text segment of the exact chapter length, preserving GP order and ignoring plaintext word boundaries. Do not optimize a cipher key.

| Original unknown LP2 chapter | GP runes | First-party contiguous alignments | Minimum required K | Largest required K | Alignments compatible with K≤29 |
|---|---:|---:|---:|---:|---:|
| p8–p14 | 1,729 | 1,260 | **33** | 44 | **0** |
| p15–p22 | 1,903 | 1,086 | **37** | 47 | **0** |
| p33–p39 | 1,680 | 1,309 | **32** | 44 | **0** |

Thus the **same key-independent necessary bound also rejects a 29-state original-rune-preserving deterministic encoder for each of these 3,655 alignments to genuine solved Cicada material**, even when each of the three unknown chapters is allowed its own wholly unrelated secret codebook. This is a first-party register comparator, **not a test of every possible Cicada-like text**, and the available first-party prose is too short to cover the 3,008-rune p40–p53 chapter in full. Other shorter unknown chapters permit some 29-state comparisons. It cannot identify the actual unknown plaintext.

### Positive control of the full proposed architecture

A constructed, fully reversible GP29 Mealy cipher with exactly **29 states** uses `C_i = (P_i + s_i) mod 29` and `s_(i+1) = (s_i + P_i + 1) mod 29`, with original state 7. Its inverse recovers all **12,956 / 12,956** planted Shakespeare GP runes exactly. The identical two-rune certificate is **at most 29** on that genuine finite-state plant, confirming that the test does not reject the architecture by construction. The one-input/one-output positive also demonstrates state-feedback is permitted.

## Decision and relation to the previous source-word theorem

The earlier [source-word minimum-state result](lp2-wordstate-minimum-keycount-original-gate.md) needed original printed word boundaries and found finite-sample lower bounds 58–142 for **independently sampled exact-word-length** language models. This result is a different scope: **unknown word boundaries allowed, contiguous source prose, arbitrary letter-by-letter deterministic hidden state**. It strengthens the bookwide necessary bound to at least **176** on the present source controls and makes the nine-chapter-versus-page-local rekeying fork explicit.

**Research consequence:** a decipherment theory that claims to preserve GP rune count, operate with at most 29 reusable states and use only a deterministic changing substitution **cannot account for any of these 450 aligned native prose controls under only the nine obvious chapter keys**. This source-native test makes the key/state capacity issue concrete within the author's known diction. A new proponent must supply either a genuinely richer key/state, an independently rekeyed physical-page mechanism, alternative plaintext or a different segmentation/expansion rule. This favors searching for authentic changing key material or an explicitly page-local opcode over another generic global 29-way rotor. It does **not** establish that the manuscript's actual plaintext is ordinary native-GP English, or identify a correct cipher.

## Reproduction

- [Windows Node22 standalone CommonJS SFT](../sims/lp2_runegram_sequential_state_lowerbound_sft.cjs), pinned to the complete original LP2 GP29 source and three existing original-language controls. It checks all 450 literary alignments, all 3,655 source-native Cicada alignments, physical-page and chapter boundaries, the exact optimal K=29 page-rekey domain counts, `D₂/D₃/D₄`, assertions against reported minima, and exact 29-state forward/reverse control.
- [Manual Windows workflow](../.github/workflows/agent21-runegram-state-manual.yml), [successful original-source run 44132044652](https://github.com/FlareZ123/liber-primus/actions/runs/44135698179).

All language models here are conditional controls, and the original 56 LP2 encrypted pages remain unsolved.
