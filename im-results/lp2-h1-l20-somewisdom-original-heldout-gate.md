# Original LP2 H1 L20 “some wisdom” screen spike: source-locked original re-decode

**Decision (17 November 2026):** A high-score original H1 screen spike in the ongoing L14–20 campaign does not produce intelligible GP English, and the independently reproduced 10-EM verification decoder reduces its score below the preregistered candidate floor **1.6**. Its untouched 150-rune same-chapter continuation remains ciphertext-like under the screen-fitted 20-column key. This is a rejected **specific original candidate**, not completion of the still-running full L14–20 search.

## Original input and historical source

- [H1 campaign #1338](https://github.com/FlareZ123/liber-primus/issues/1338), [distributed run 44018360123](https://github.com/FlareZ123/liber-primus/actions/runs/44018360123), completed `h1-shard-10` original and matched-null artifacts, at offset band 1000–1099 of the entire L14–20 experiment. This early artifact was read before merging the still-running other shards. A null maximum computed from only one or two shards cannot substitute for the whole 581-stream matched-null campaign.
- The observed screen cell is stream **`md5-ctr mod :some wisdom`**, 32-bit big-endian MD5 counter appended to lowercase ASCII `some wisdom`, every hash output byte reduced modulo 29; stream offset **1009**, keyword length **20**, anti-repeat model **0** (skip), original window **`seg0.12`** (GP global offset **5506**, source previous GP ciphertext rune index **14**), source period-20 keyword *inferred* by the H1 EM decoder.
- Independent original receiver: 300 GP29 ciphertext runes at original global positions 5506–5805, and the **next 150 untouched runes** at 5806–5955 from the exact same original chapter. The source is [canonical 12,956-rune LP2 corpus](../resources/liber-primus/lp2-corpus.json), no synthetic source replacement.
- Reference semantics from [pnotisdev/cicada3301 pinned 15200c67](https://github.com/pnotisdev/cicada3301/tree/15200c67abee106913ba01ff504c5b6e88d16cc7/work/h5slice): source GP-English unigram model, nats-marginalized pointer initializer (beam 12), collision-consistent skip beam 24, keyword-column ML-estimation and five EM iterations. Exact forward re-encryption uses the same combined key and pointer.

## Decisive original result

| Test | Result | Interpretation |
|---|---:|---|
| Original campaign screening periodic IoC | **1.753942** | Screen triage only |
| Independently reproduced five-EM periodic IoC | **1.753942308** | Reproduces original source and original implementation semantics |
| Prespecified wider **ten-EM verification** periodic IoC | **1.547463370** | Falls below even the fixed 1.6 IoC gate |
| First 300 original runes overall IoC after five EM | **1.275741360** | Not coherent GP29 language |
| Next **150 untouched original runes** overall IoC, key and pointer carried forward | **1.110693512** | Near-uniform nonprose; no heldout confirmation |
| Next 150 log-language likelihood per rune | **−4.040727910** | Below ordinary native-GP text under the fixed source model |

Five-EM inferred keyword (GP indices) **`[28,25,11,16,19,20,6,0,19,14,10,9,3,26,27,21,11,15,9,23]`**. Its period-20 IoC changes nonmonotonically across EM iterations; the high score is sensitive to stopping after five. Ten iterations give the independently reproduced **1.547463370**. The full held-out original continuation decoded under the five-EM key is:

```text
BOYYRIANDGMEATYBAWTHBEAGLBAENIAIAAMLXJAEOLMUSEOOESTHDFUBTGHEODYMTHCRJFGDNMWFMGIAHYMBUHNUBEAMTHIAAMBIAELOETHPEONGMSBTRLTHGEAEOBDRNNGNFBSFGEPAEGXPOETHUYEOHDAYGTHEOASRBUNNSOCNGUJFXNGBLEY
```

This is a GP transliteration without inserted word breaks. No >150 consecutive intelligible runes, source-selected 20-rune keyword, independently heldout chapter, or authentic plaintext has emerged. A high periodic-IoC maximum is not itself plaintext.

## Reproducer and decision

[Deterministic, standard-library Python SFT](../sims/agent37_h1_somewisdom_heldout_sft.py) regenerates the exact MD5-counter stream from the pinned external source algorithm, reads original 12,956 GP29 ciphertext indices, implements the source nats initialization and collision-consistent 5/10-round decoder, checks exact forward re-encryption and the original screening score, then freezes the five-EM keyword and validates the following 150 original runes without re-fitting. No network access or dependency installation is necessary. A queued Windows Python SFT CI run may independently confirm execution.

Reject this **specific** original cell. Preserve the full longer-key campaign until all 20 real and matched-null shards finish; only then determine whether any other candidate survives its full 581-stream null floor. The finite H1 screen has limited long-key planted-positive power, and its negative result cannot reject arbitrary unseen keystreams, different clocks or other cipher laws.
