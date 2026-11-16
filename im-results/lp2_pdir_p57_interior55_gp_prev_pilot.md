# p57 circumference-key gates: interior-55 pointer and one-edge-75 p55

**Status:** bounded original-cipher negative for the full 729-rune first chapter and independent 3,008-rune floral holdout under the source-fixed p57 interior-55 / previous-ciphertext-word direction cipher. Original p57 and LP1 GP-native positive plants recover exactly. Earlier 300-rune pilots and the one-edge-75 p55 F-transparent inverse remain as scoped predecessors. No previously unknown LP2 plaintext or original key was recovered.

## Human solve-path hypothesis

The clear p57 PARABLE has 20 printed words and 95 runes. Removing the first and last rune of each word, following its circumference language, yields a 55-symbol candidate key: five interior title runes followed by fifty interior body runes. The signed 2016 instruction that words supply a map and their numbers supply direction motivates a small cyclic key-pointer experiment. LP1 p05's prime/Möbius emphasis makes prime-based word numbers one plausible reading; word length is the simpler literal alternative.

This is a hypothesis, not evidence that p57 actually supplies a key. The frozen conventions are key pointer 0, cyclic repetition of the 55 symbols, continuous pointer across words/pages, no page reset, and no fitted offset. Candidate key encodings are direct GP indices or GP-prime values modulo 29; both title-first and body-first order, both additive signs, and both direction polarities are screened.

## Correct source word segmentation

The original transcription's '%' marks physical page boundaries, not automatic word boundaries. Hyphens, periods, and ampersands separate printed words; line and page breaks do not. Parsing each page independently splits words that continue across a page.

- p0–p2 contain **729 runes and 158 words** when page segments are joined. Parsing each page separately gives 160 words, introducing two false word boundaries.
- Across the 57 rune-bearing page segments, joined parsing gives **2,941 words**; pagewise parsing gives 2,973, a difference of 32 cross-page carries. The 2,941 includes 45 clear words on p56–p57, leaving the established 2,896 unknown p0–p55 words.
- The first 300-rune screen contains 66 word segments, with the final segment truncated only by the screen boundary. The p57 key itself remains 20 words / 95 runes / 55 interiors.

The former pilot split at '%'. Its reported best score of 1.152887 is superseded and must not be reused. The corrected parser is asserted against the canonical p0–p2 rune corpus in the reproducer.

## Full 2016-word-direction original-cipher decision (Agent50, 16 November 2026)

The [PGP-preserved first-party 2016 instruction](../resources/historical/cicada2016-4gq25-outguess.asc) says that the book's words are the map, their meaning the road and their numbers the direction. Clear original PARABLE instructs solvers to shed circumferences. A finite, unauthenticated interpretation removes the first and last GP29 rune from each of p57's twenty words, yielding **55 original key indices**: five title interiors and fifty body interiors. The first target word traverses forward; each subsequent word traverses the key forward when the preceding **ciphertext** word's GP-prime sum is prime, otherwise backward. This schedule is causal for both enciphering and deciphering.

The exact test locks title-first ordering, source GP indices or GP-prime residues mod29, both additive signs, a cyclic length-55 key and the original pilot's conv000 predecessor-comparison rule. It tests direct additive GP29 plus the legacy skip and coin collision models with a 160-state word-trigram beam. The language model is trained only on solved LP1 GP transliterations. Original punctuation, 32 page-carrying words and original rune values remain intact. Every candidate inverse is forward-checked with its recovered key-read positions. Collision paths are generally nonunique without extra branch information; this is an explicitly bounded candidate family.

### Exact complete-source gate

| Source-fixed test | Result |
| --- | --- |
| Original opening pp0–2 | **729 runes**, **158 joined printed words** |
| Disjoint floral pp40–53 | **3,008 runes**, **669 joined printed words**; physical p50 is runeless |
| Key | **55** original p57 word interiors; source p57 itself is **95** runes in **20** words |
| P57 original clear control | GP29 IoC **0.06270997**, heldout model log score **−1.94191 nats/rune** |
| Repeated original p57 planted under skip and coin | **285/285 exact original plaintext recovery** under both |
| LP1-sourced GP-native plaintext plant under skip and coin | **429/429 exact recovery** under both |
| Best original opening model | GP indices, negative sign, coin: log **−4.24221**, IoC **0.03534497**; begins IEOPLYFON UPPOEX JLWL TYTH HMOE |
| Matched key-order null, twelve 55-rune shuffles with all four sign/encoding combinations and both collision models | Median best **−4.24965**, maximum **−4.17209**, empirical familywise upper-tail **5/13 = 0.384615** |
| Untouched floral p40–53 with the opening-selected model | Log **−4.30123**, IoC **0.03532648**, no coherent GP-native prose |
| Exact forward recovery of selected original inverse paths | **729/729** original opening runes and **3,008/3,008** original floral runes |

The native solved-source controls demonstrate that the implementation can recover full grammatical GP29 text under the tested cipher. The unknown chapters remain ungrammatical, statistically close to noise, and do not beat the matched shuffled-key model-selection null. All selected paths can re-encrypt by construction, which alone cannot distinguish a real cipher.

This retires the exact p57-interior55 / previous-ciphertext-word prime-direction / conv000 candidate as an immediate LP2 plaintext route. The signed 2016 text does not identify a GP-prime-sum direction opcode, key representation or branch semantics. Other source-specified keys and independently indicated state machines remain outside this test. The 66-rule and 18-convention external pointer campaign is not being opened merely because this finite candidate fails.

**Reproduce:** [complete original-source Node22 SFT](../sims/lp2_p57_pdir_prevword_fullsource_sft.cjs), [successful Windows runner 43949605928](https://github.com/FlareZ123/liber-primus/actions/runs/43949605928). The reproducer asserts source boundaries, authentic native positive controls and complete exact forward return of both original unknown chapters.

## Gate A — previous-ciphertext GP-prime-sum direction

For each word, the preceding ciphertext word's GP-prime-value sum selects forward if prime and backward otherwise; the first word starts forward. The corrected first-300-rune p0–p2 screen uses the original one-step skip/coin pilot, conv000, beam width 16, and all 32 combinations of key order/encoding, key sign, direction polarity, and collision model.

- Corrected best scaled IoC: **1.115385** (body-first GP-prime-mod-29 key, coin branch, negative key sign, forward prime polarity).
- Across 24 matched random permutations of the 55-symbol key multiset, with the same 5/50 split and the same full variant family: median best **1.108919**, maximum **1.155474**.
- Empirical upper-tail p-value: **0.44**. The candidate is ordinary under the matched key-order null; no plaintext-like register appears.

This is a corrected screen of one source-selected key, not the full 66-rule / 581-stream pdir campaign.

## Gate B — causal current-word length direction

The 2016 wording can be read literally as the current word's number determining its own direction. Word length is known to the encryptor and preserved by the cipher, so this is causal. Two low-parameter mappings were frozen: odd/even length and prime/composite length. The full reference-style coin collision model was used, with beam width 800, the same key encodings/orders/signs, and both direction polarities.

- Best scaled IoC: **1.145128** (prime-length rule, prime length forward, title-first direct GP key, negative key sign).
- Across 12 matched shuffled-key permutations with the same 5/50 partition and all 32 variants: median best **1.147068**, maximum **1.170346**.
- Empirical upper-tail p-value: **0.615**. The best decoded transliteration is not readable prose.
- Positive control: the p57 clear text repeated three times (285 runes), planted under the same coin model/key/rule, is recovered exactly at beam width 800.

The tested deterministic multi-skip alternative did **not** recover its positive control under this beam, so it is not counted as a negative result.

## Gate C — causal previous-plaintext-word prime direction

A more literal causal reading is that, after decoding a word, its GP-prime-value sum selects the direction for the next word. Prime selects forward and composite backward; the opposite polarity is also tested. This requires the decoder to carry the previous decoded word's prime/composite state. The same reference-style coin model and beam width 800 were used.

- Best scaled IoC: **1.125730** (body-first GP-prime-mod-29 key, negative key sign, prime forward).
- Across 16 matched shuffled-key permutations with the same 5/50 partition and all 16 variants: median best **1.121204**, maximum **1.160647**.
- Empirical upper-tail p-value: **0.412**. No plaintext-like register appears.
- Positive control: the p57 clear text repeated three times (285 runes), planted under this causal rule, is recovered exactly at beam width 800.

## Independent gate D — one p57 word edge removed, exact p55 75-rune receiver

A separate, tighter same-source interpretation uses the **95 clear GP29 runes in p57's 20 authentic printed words**. Removing **one endpoint per word** leaves exactly **75 transmitted runes**. Physical p55 has **76 runes**, of which its very first rune continues the final p54 word, leaving **75 local runes**. The 2016 signed words/numbers guidance and p57's "shed our own circumferences" suggest the operation, but **neither explicitly commands one-sided peeling or GP29 addition**. This numerical correspondence is independently source-visible; no parameter is selected from candidate language scores.

The frozen full-page test strips either the first or the last rune of each p57 word in printed order, forms one non-cyclic 75-rune key, and applies both GP29 addition signs to unchanged p55 local rune offsets 1–75. Each variant uses the **authentic solved p56/LP1 plaintext-F-transparent** operation: plaintext F (GP index 0) emits F without advancing the key; non-F plaintext consumes one rune; a ciphertext F can represent either branch. Exact dynamic programming tests all valid skip histories and verifies forward recovery; no beam or key offset is fitted.

| p57 key rule | Encrypt sign | Complete original p55 inverses | First mathematically impossible rune of p55 local 75 | Candidate GP29 IoC |
| --- | ---: | ---: | ---: | --- |
| Remove first rune of each word | − | **2** | none | **0.03135; 0.03712** |
| Remove first rune of each word | + | **0** | **54** | none |
| Remove last rune of each word | − | **0** | **8** | none |
| Remove last rune of each word | + | **0** | **66** | none |

Both surviving complete 75-rune originals in the first case are nonlinguistic; they begin LDCAGGAARUSNELFTHAE... and have no sustained GP English words. The source-clear p57 75-rune control has **IoC 0.05946**. For all four exact modes, encrypting the complete authentic p57 first 75 runes as a planted plaintext and blindly inverting them with the same branching decoder recovers **75/75 original runes**. Every surviving original branch also forward re-encrypts to the exact unchanged ciphertext. Thus the three impossibility outcomes do not arise from broken F handling, and the surviving branch is an implementation-valid negative rather than a plaintext claim.

**Decision:** retire this source-frozen one-sided p57 word-edge key as a direct, single-use historical F-transparent p55 cipher. A different word-clocking role, secret restoration of p54's carried rune, other ciphers or additional keys would be new hypotheses requiring an independent original clue. The bare 95−20=75 equality does not authenticate such a mechanism. [Exact original-input CJS SFT](../sims/lp2_p57_oneedge75_p55_ftransparent_sft.cjs).

## Decision

The p57 interior-55 previous-ciphertext prime-sum direction has now been tested on the complete 729-rune first chapter and an untouched 3,008-rune floral section as described above. Those original inverses remain nonprose and statistically ordinary under matched shuffled keys, despite full native positive recoveries. The current-word length and causal previous-plaintext direction models retain only their 300-rune negative scope.

Retire these specific p57-key/simple-direction readings and the distinct one-edge-75 F-transparent p55 reading in gate D. Do not expand them into arbitrary word statistics, offsets, or conventions without a new independent clue. The deterministic multi-skip model remains unassessed because its positive-control recovery gate failed. The broader pdir key-stream campaign is a separate question and is not excluded here.

## Reproduction

- node im-results/lp2_pdir_p57_interior55_gp_prev_pilot.cjs — corrected GP_prev screen and matched null.
- node im-results/lp2_p57_interior55_causal_direction_gate.cjs — causal word-length and previous-plaintext coin gates with positive controls.
- node sims/lp2_p57_oneedge75_p55_ftransparent_sft.cjs — exact p57 word-edge-75 to p55 complete-page historical F-transparent inverse and native solved source plants.
