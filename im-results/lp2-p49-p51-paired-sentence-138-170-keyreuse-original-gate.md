# The intact p48–52 sentence pair does not support an aligned reused additive GP29 key

**Evidence class:** new source-anchored, exact finite-cipher-family exclusion with positive plants and a separate original-input language diagnostic, 17 November 2026. **No unknown LP2 plaintext, authentic key, or continuation is recovered.**

## Why these two sentences, and what to test

The source prints a complete **138-rune / 33-word sentence**, formed from the final 72 runes of physical p48 and all 66 runes of p49. A red ten-dot mark and the original **32×8 numerical table** intervene. The next complete **170-rune / 40-word sentence** begins with all 92 runes of p51 and finishes in the first 78 runes of p52. The p49 opening is a continuation of a word from p48, so a p49-only analysis would misplace the start and original printed word grammar.

An observer can notice that **170 − 138 = 32**, the table's original row count. The first 32 runes of the posttable sentence are eight complete printed words; its first 138 runes end at a word boundary too. That yields two fixed, source-natural pairings with the 138-rune pretable sentence: **start-to-start**, using posttable runes 0–137 and reserving the last 32 as a holdout, and **end-to-end**, using posttable runes 32–169. This arithmetic and the natural boundaries motivate a controlled experiment, but the manuscript has no authenticated instruction that these sentences share a keystream.

Competing interpretation: the two sentences are different prose messages about the table, and the 256 cells are an independent cipher object. Previous issue #1099 addressed longer plaintext/key recovery and partial table consumers; this experiment isolates the *fully unknown reused-key* family without selecting keys or generating new table transforms.

## Exact key cancellation without guessing the key

Let A_i and B_i denote paired **original GP29 rune indices**. Under one position-wise reused additive key K_i,

C1_i = (P1_i + K_i) mod 29; C2_i = (P2_i + K_i) mod 29.

Therefore **(C1_i − C2_i) mod 29 = (P1_i − P2_i) mod 29** for every aligned position, whatever the 138 unknown key values. The claim is conditional on key reuse in the same 29-element index alphabet with the original separators preserved as plaintext word boundaries.

The test builds **32,081 distinct GP-native dictionary words** from three pinned literary controls, Shakespeare, Gibran and Emerson, plus the pinned TextBlob/Norvig spelling-frequency word list. Orthography is frozen from the existing repository native-GP conventions: QU→CW, V→U, K→C, Z→S, ING→NG, then longest-match 29-token GP mapping. Trie states represent pairs of current words; at each rune the difference relation fixes the second plaintext symbol once the first is chosen. All 29 choices, all possible keys, and every dictionary-compatible word sequence are retained; only duplicate states are merged. The procedure is exact for this finite lexicon and these original source-layout premises. There is no beam width, fitted key, chosen plaintext, shifted start, or guessed cipher phase.

| Original alignment | Fixed posttable interval | First rune with no admissible plaintext pair | Peak trie-state count |
| --- | --- | ---: | ---: |
| Start-to-start | runes 0–137 of 170 | **14** | 74 |
| End-to-end | runes 32–169 of 170 | **5** | 71 |

The test fails before any long-sequence multiple-testing problem. Two independent positive plants preserve the **exact original 33-/40-word runic length profiles**, encrypt both synthetic native-GP English messages with a matching 138-symbol additive key at the designated alignment, and pass the full 138-rune joint inverse. Start alignment explicitly includes a 32-rune held-out suffix encrypted under the repeated 138-state key. The end-aligned plant likewise produces the full 170-rune B text with its key phase fixed at B's 32-rune boundary. Both controls return one surviving full-length state and exact source-designed inverses, demonstrating that the implementation does not categorically reject this design.

## Independent, grammar-free test

To avoid mistaking a dictionary hole for an invariant of English, independently calibrate the *distribution of aligned ciphertext differences* without consulting word boundaries or lexicon membership.

The original source controls provide **603,423 GP-indexed letters** after the same orthographic conversion. Let p(x) be the pooled GP unigram frequency and q(d)=Σ_x p(x)p(x−d mod29) the predicted difference probability for independently selected English passages. Score each 138-rune original difference against independent uniform-pad differences by **Σ_i log(29q(d_i))**. A positive value favors English-minus-English; a negative value favors a uniformly random difference.

| Input | Difference log likelihood ratio |
| --- | ---: |
| Original start-to-start | **−3.7078414077** |
| Original end-to-end | **−5.7275321125** |
| Mean of 10,000 literary English/English control pairs | **+3.2370045578** |
| Mean of 10,000 matching English/randomly padded controls | **−3.0387267475** |

From those 10,000 fixed-seed pairs, only **37/10,000** genuine English/English difference samples score at or below the original start pairing, and only **3/10,000** at or below the original end pairing. The matched independent-pad null fractions are **3,934/10,000** and **1,312/10,000** respectively. These are empirical diagnostic tail counts under that specified GP-English model, **not** formal authorship-independent p-values; an atypical original author's rune unigram mix could weaken the contrast. It nevertheless supports the exact dictionary contradiction rather than suggesting a shared additive key that merely uses proper names unseen in the dictionary.

## Reproduction and scientific boundary

- Source: unchanged repository resources/liber-primus/lp2-corpus.json (explicit physical p50 runeless page), resources/lp2-transcription.txt (57 rune-bearing sections), and four pinned control files in resources/control/.
- Standalone Windows-compatible Node22 CommonJS SFT: [paired sentence original-source test](../sims/lp2_p49_p51_138_170_sharedpad_original_sft.cjs). It asserts exact original page-index correspondence, complete sentence/word lengths, original impossibility runes, two full planted positive examples, and empirical frequency diagnostics using fixed LCG seeds.
- Independent Windows GitHub Actions verification: [successful run 44160176186](https://github.com/FlareZ123/liber-primus/actions/runs/44160176186). Its job log explicitly names this SFT and outputs all values quoted above; reused pre-existing manual-only workflow, no commit-triggered CI.

**Decision:** Retire **both natural reset alignments of a common additive 138-rune GP29 stream with English dictionary-word-preserving plaintext**. The grammar-free difference diagnostic independently disfavors the same model under broad English statistics. Additional guesses at the shared key cannot salvage a model already contradicted by the key-free equation. This does **not** exclude the table supplying a different key, a nonlinear or multiple-layer cipher, distinct key clocks, non-native text, word-boundary changes, or an independently authored 32-symbol instruction. A new route requires an original-source selector specifying an alternative reversible rule or true plaintext material.

The raw 32×8 table remains untouched; no numerical coincidence has been promoted to a cipher method. The table's placement beside two complete sentences is authentic, while its causal role in decoding is still unknown.
