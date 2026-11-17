# No-modulus original-word-address map: completed source-native inverse gate

**Agent6, 17 November 2026. Status: bounded negative, no unknown plaintext or key.** The authenticated 2016 Cicada sentence "Its words are the map, their meaning is the road, and their numbers are the direction" motivates testing whether one printed rune-word's Gematria-prime value can serve directly as a one-based address of another printed word. This is one concrete conjectural reading of an authentic clue. The sentence **does not itself instruct** a reader to choose prime sums, an absolute word count, a key serialization, or a Vigenère decoder.

## Exact original input and bounded hypothesis

- Original source: `resources/liber-primus/lp2-transcription.txt` cross-checked against `resources/liber-primus/lp2-corpus.json` (all 58 physical pages including solved p56–57, rune-free p50); GP29 alphabet and weights from the canonical original chart. Splitting at true printed separators `-.&$§`, retaining `/` line continuations and `%` page continuations, yields **2,941** complete words, **13,136** runes, **2,896** unknown-page words and **45** solved-page words.
- For an original printed word `w_i`, let `S_i` be its ordinary, unreduced GP-prime sum. Define the candidate directed edge `i→S_i` with **one-based** word addresses in the original physical reading order. There is no modulus, reset, extra key, or rejected word.
- `2 ≤ S_i ≤ 933 < 2,941` on the authentic corpus, so all **2,941** edges are defined. This is structurally attractive as a directly readable address register, but the inequality alone does not prove the address convention was authored.
- The 2,941-node functional digraph has exactly **four** directed attractor cycles: length **37** (186 rune characters) with **2,240** source nodes in its basin, length **1** (9 runes) with **412** nodes, length **2** (9 runes) with **208** nodes, and length **3** (12 runes) with **81** nodes. These sizes are deterministic corpus facts **conditional on the proposed address grammar**; no numerical significance is claimed.
- Corrected original p0 begins with **two red words** of **8+5 runes**, prime sums **347** and **315**, before 716 black-body runes spanning p0–2. Beginning at one-based word1 (sum347) and word2 (sum315) yields original-key candidate paths of **49** and **50** distinct visited words, with tails of **12** and **13** word addresses and the same 37-word cycle. Both seeds reaching that cycle is **not** an independent signal of a key: this attractor already receives **2,240/2,941** starting words.

This is distinct from the previously analyzed 2016 `GPsum→(page=GPsum mod58, local word=floor(GPsum/58))` map and the independent p0 black-body 156-word `mod156` graph; neither is replayed here.

## Frozen original decoding decision

Take the complete untouched original **716-rune p0–2 black body** after the corrected red13 title, with the first black rune as phase zero. For each of the two original red seeds, compare:

1. All visited distinct word addresses before first repeat, or only the recurring 37-address cycle.
2. The concatenated native GP29 runes from visited words, or one GP-prime sum reduced modulo29 per visited word.
3. Both historical GP29 additive signs, at zero phase.

These **2×2×2×2 = 16 exact, finite** consumers are fully specified before reading candidate plaintext. Key lengths range **37–245**. The all-consuming decoder `P_i=(C_i±K_{i mod |K|}) mod29` has **maximum original IoC 0.03560964175489315**, scarcely above raw p0-body **0.034101652537406726** and far below original clear solved p57 **0.06270996640537514**. None yields coherent original prose.

The more historically faithful 2014/LP2-p56 **plaintext-F-transparent** model was tested without presupposing which ciphertext F's are bypasses: every ciphertext F can follow a bypass branch (plaintext F, no key consumption) or a legal encrypted non-F branch; any hypothesized *encrypted* plaintext F is impossible. Exact dynamic programming over all key-consumption offsets rejects **all 16 original 716-rune hypotheses**, with earliest dead end at original black-body rune offsets **2–247** (zero based). There is therefore no complete 716-rune inverse under any of these frozen key serializations and signs.

**Positive controls:** all 16 all-consuming source-native GP29 configurations encrypt/decrypt a separately known original 95-rune p57 text exactly. The same known p57 is then synthetically encrypted with the genuine transparent-F rule, including bypasses, and the ambiguity-aware dynamic decoder preserves the genuine consumed-key state for **all 16**. The positive control checks the decoder's F-skip logic. Correct reencryption alone does not identify any historical key.

## Source, code, limitation, and next decision

- **Reproducer:** [exact original-input Node.js 22 CommonJS SFT](../sims/lp2_2016_absolute_wordprime_map_direct_inverse_sft.cjs), including parsing invariants, graph basins, all sixteen decoders, original complete-body legal-state rejection and solved-source positive controls.
- **Windows Node22 execution:** [manual source workflow 44109970414](https://github.com/FlareZ123/liber-primus/actions/runs/44109970414) (check conclusion before citing it as a PASS).
- **First-party signed clue:** `resources/historical/cicada2016-4gq25-outguess.asc`.
- **Distinct prior map:** `sims/lp2_wordmap_global_plaintext_decision_sft.cjs`, and original 156-word cyclic map in `im-results/lp2-13x12-wordmap-23cycle-source-gate.md`.

**Fork:** retire these sixteen direct absolute-address-key-to-p0 decoders; the apparent convergence of the two heading seeds supplies no ciphertext plaintext. A genuinely new source instruction selecting the address grammar, output register, key/clock, or second stage would be required to revive this branch. Do not enlarge the mode/phase catalog by optimizing on near-uniform original output. The 56 unknown physical pages remain unsolved.
