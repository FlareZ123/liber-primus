# Literal word-circumference shedding: exact GP29 partition and decision

**Agent40 · 16 November 2026 · Director Issue #1266.** This is a bounded original-cipher negative. The clear physical p57 PARABLE instructs readers to “shed our own circumferences” and “find the divinity within.” A human-visible application is to each **printed word**: discard its exterior first/last GP29 runes and read the interior. That operation is exact and unparameterized. No independently authored rule here says how the discarded shell transforms the interior or how a plaintext key is to be reconstructed.

## Source and reversible accounting

The original ciphertext input is `resources/liber-primus/lp2-transcription.txt`, independently checked rune-for-rune against `resources/liber-primus/lp2-corpus.json` for all 55 rune-bearing unknown physical pages p0–p55 (p50 contains no runes). A word continues across a printed line or page and ends only at source word/punctuation separators `-`, `.`, `&`, `$`; the 32 carried words are retained as **single words**. Every one of the 29 GP symbols is preserved, including `ᚠ` (F). The verified **138 small four-dot stops** remain untouched in the original punctuation source; the transcription's 175 period characters must not be misidentified as 175 physical small stops.

For one word `w` of length `n`: if `n=1`, its shell is `w` and the interior is empty. For `n≥2`, its shell is `w[0] + w[n−1]` and its interior is `w[1..n−2]`. The exact inverse is `shell[0] + interior + shell[1]` for length-two shells, and `shell` for length-one shells. Applying the inverse to all source words, and then retaining the original punctuation/page/line boundaries, reconstructs **all 12,956 original GP29 rune indices exactly**. This is a positional identity, not evidence for a historical cipher.

The [exact 2,896-slot ordered tapes](lp2-word-circumference-tapes.json) include one shell and one interior for every authentic word, **531 explicitly empty interior slots**, and the 32 carried-word indices/page memberships. The [read-only source-native CommonJS SFT](../sims/lp2_word_circumference_sft.cjs) asserts page/count parity, complete reconstruction, synthetic one-letter/two-letter/F/carry restoration, literal readout statistics, and the p57 cleartext control. It requires only Node's built-in modules and the pinned source corpus.

| Source partition | Word slots | GP29 runes | Index of coincidence |
| --- | ---: | ---: | ---: |
| All unknown original words | 2,896 | 12,956 | 0.03447840 |
| All exterior shells, retaining one-letter words | 2,896 | 5,709 | 0.03448286 |
| All interiors, including 531 empty slots | 2,896 | 7,247 | **0.03447346** |
| p0–2 literal interiors | 158 | 418 | **0.03413537** |
| p40–53 literal interiors, disjoint test | 669 | 1,683 | **0.03456259** |
| Genuine clear p57 before shedding | 20 | 95 | 0.06270997 |
| Genuine clear p57 after shedding, interiors | 20 | 55 | **0.07138047** |

The section counts include any original word whose source page membership intersects that section; carried words are not cut and a boundary word can contribute from an adjoining page. The p0–2 section has 729 total rune positions and 311 shell positions; p40–53 has 3,008 original positions and 1,325 shell positions. The source rune alphabet's uniform baseline is 1/29 = **0.03448276**.

## Actual readout and causal decision

The first p0–2 interior words transliterate `HEOGMIA-YENG-JG-J-N-EWBASOEEOING-AEGI-BN-B-J-NGY`; the p40–53 control starts `N-GDAE-PXY-EAO-NG-ITTH-AC-ROEGEANAEBUEB-F-S`. These are literal source-derived runes after one peel, before any cipher search. Neither readout yields a contiguous recovered GP-native plaintext. Their large-sample IoCs remain essentially uniform, whereas even the 55 interior runes extracted by the identical procedure from the independently **clear** p57 remain distinctly nonuniform.

**Rejected in this bounded decision:** the direct assertion that p57's shedding instruction exposes ordinary GP29 prose by deleting the first and last original rune of each printed ciphertext word, with existing word order and word divisions preserved. The exterior channel itself is likewise uniform in its pooled symbol frequencies. For 83 one-rune and 448 two-rune original words, literal shedding leaves **no interior word whatsoever**; those 531 slots cannot directly supply the corresponding plaintext words under a one-for-one word-boundary-preserving inverse.

### The authentic DIVINITY key applied inside each original word (Agent48, 17 November 2026)

A new, narrowly source-selected candidate combines both original solved p57 instructions: “shed our own circumferences” selects each printed GP29 word's strict interior, while “find the divinity within” supplies the authenticated **DIVINITY** keyword from solved LP1. The test preserves the first/last original runes, all **2,896** actual printed words, the **32 page-carried words** and all **7,247** interiors. The GP29 key restarts at the first interior rune of every word; both additive directions are frozen. No per-word fitted key, variable phase, reordering or extra layer is introduced.

The exact source gives these GP29 Shakespeare bigram scores across **4,882 adjacent pairs within the printed-word interiors**:

| Receiver | Interior bigram log-score per pair | Overall interior IoC |
| --- | ---: | ---: |
| Original minus DIVINITY | **−4.580545** | **0.03443552** |
| Original plus DIVINITY | **−4.539053** | **0.03445876** |
| Matched native-GP Gibran control | **−2.628306** | **0.07296240** |

An independently sampled English GP29 plant preserving **all 2,896 exact original word lengths** reencrypts and recovers every one of its **7,247** interiors using this key-reset program, leaving outer shells unchanged. The untouched original **p0–2** interior (418 runes, 293 internal bigrams) scores **−4.608639** in the subtractive direction. The disjoint original **p40–53** interior (1,818 runes, 1,221 internal bigrams) scores **−4.544330**. The source interior remains near-uniform and nonprose in both orientations.

**Decision:** Retire this *specific word-shell-preserving, local-restart DIVINITY Vigenère* under the original literal word breaks and ordinary GP-native English. This is a new named historical-key follow-up to the earlier unkeyed peel, supported by [a read-only Node22 CommonJS full-source SFT](../sims/lp2_word_inside_divinity_vigenere_sft.cjs). A different printed-word semantics, clock, output language or independently source-selected shell consumer remains open. No original plaintext was recovered.

### Global two-channel LP1-key transfer (Agent24, 24 November 2026)

**Correct source boundary.** The p0 original-source adjudication says the 13-rune red heading and 13-dot marker are outside the black-body ciphertext register; black-body text begins at offset 13. The first two entries in the 2,896-word tape are exactly the red heading: `SHEOGMIAF` (8 runes) and `SYENGC` (5 runes). They must not consume either body key clock. An earlier phase-zero test that included these two words and failed at `ONTH` is superseded; it is not a valid exclusion of the source-correct body-only construction. See the [p0 red-heading source adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md).

The p57 wording motivates two direct tests: (1) shed each body's word shell and run the recovered LP1 `DIUINITY` key continuously over the concatenated interiors; and (2) add the independently recovered LP1 `FIRFUMFERENFE` key continuously over the shell stream while `DIUINITY` runs over the interior stream. Both clocks start at phase zero at the first black-body word and use the LP1 additive GP29 rule `C=P+K (mod 29)`, with plaintext F=0 transparent and non-consuming. The key recoveries are documented in the [LP1 blind key-recovery study](agent15-periodic-fhold-blind-key-recovery.md) and [WELCOME blind control](agent1-lp1-welcome-blind-comparison.md). This key-to-channel assignment remains a hypothesis, not established author intent.

The source-native SFT reconstructs all **12,956 original unknown runes** and **2,896 words** exactly. Excluding the 13-rune heading leaves **2,894 body words / 12,943 body runes**, comprising **5,705 shell** and **7,238 interior** runes. The independently reconstructed p55 split remains **33 shell / 43 interior**. The clear p57 Latin reference tokenizes to all **95/95** canonical runes, and a synthetic p57 plant encrypted with the same keys and F-hold rule has a legal inverse path.

The source-correct body-only interior stream has a unique phase path through its first 11 symbols (none is ciphertext F). Its 12th symbol is `ᛁ` (GP29 value **10**), the eighth interior rune of original word index 5, `NEWBASOEEOINGU`. After 11 advances the `DIUINITY` clock is at phase **3**, whose key value is also **10**. Decryption therefore requires plaintext F=0 at ciphertext `ᛁ`; transparent plaintext F can only emit ciphertext F=0. No legal transition exists. The two-channel version fails at the same rune; its only surviving phase pairs are shell phases **6** and **7**, both with interior phase **3**, so adding the shell key does not rescue the interior contradiction. This is a finite-state algebraic failure, independent of language scoring.

**Decision:** retire the direct continuous body-only `DIUINITY`-on-interior reading and the corresponding `FIRFUMFERENFE)-shell/`DIUINITY)-interior assignment. Neither recovers LP2 plaintext or a key. This does not test other source-defined receivers or independently justified key schedules; do not rescue the rejected clocks with arbitrary phase offsets. Reproduction: [source-native Node22 SFT](../sims/agent24_circumference_dual_key_gate.cjs), runnable with the existing [manual read-only CommonJS runner](../.github/workflows/manual-readonly-commonjs-sft.yml) using input `sims/agent24_circumference_dual_key_gate.cjs`.

### P57 shell as a per-word 29-to-28 exception channel (Agent4, 24 November 2026)

**Source-selected premise.** The solved p57 text says to “shed our own circumferences” and “find the divinity within.” After excluding p0's separately adjudicated 13-rune red heading, the exact source gives 2,894 body word units, 5,705 shell runes and 7,238 interior runes. The interiors contain 33 within-word repeat transitions in 33 words; another 11 first-interior symbols repeat the left shell rune. Thus a left-boundary state plus one right-shell exception symbol per word is a concrete, finite side-information interpretation worth testing. The 32 carried words remain intact across page seams.

Two receivers were frozen with no fitted key, per-word search, arbitrary alphabet permutation or tuned offset:

1. **Order-preserving rank:** the left shell rune initializes the previous ciphertext symbol; the right shell rune is the omitted plaintext symbol `q`. A repeated ciphertext symbol emits `q`. Otherwise, rank the ciphertext symbol in GP29 with the previous ciphertext symbol removed, then select the same rank in GP29 with `q` removed.
2. **Cyclic GP29 difference:** use `d=(ciphertext−previousCiphertext) mod 29`; `d=0` emits `q`, while `d=1..28` maps to ranks `0..27` in GP29 with `q` removed. The same left/right shell roles are retained.

Both forward encoders reproduce every original interior rune exactly. The resulting plaintext candidates do not resemble native GP prose:

| Receiver | Full IoC | Full trigram, flat / within-word | p0–2 (409 runes) | p16–21 (886 runes) | Within-word shuffles at least as good |
| --- | ---: | ---: | ---: | ---: | ---: |
| Order-preserving rank | 0.034485 | −3.433282 / −3.426662 | −3.425702 | −3.437684 | 25/128 |
| Cyclic GP29 difference | 0.034559 | −3.434718 / −3.426627 | −3.441155 | −3.438012 | 23/128 |

The two target windows are selected by original word page-membership, retaining complete carried words. Native controls under the same target-excluded trigram model score **−2.778925** (WELCOME, 515 runes; IoC 0.059416) and **−2.648701** (second KOAN, 319 runes; IoC 0.069813). The candidate scores are near the uniform 1/29 IoC baseline and are ordinary under the 128 deterministic within-word shuffle nulls. The output heads are nonlinguistic.

**Decision:** reject these two exact shell-carried 29-to-28 receivers. This is a new bounded negative, not a capacity impossibility: the p57 wording selects a shell/interior partition but does not select the rank map, cyclic map, initial-state semantics or omitted-symbol schedule. It recovers no unknown plaintext or key. Reproduce with [the source-native SFT](../sims/lp2_circumference_shell_no_repeat_sft.cjs).

## Per-word circumference as a two-symbol key (bounded negative; 24 November 2026)

**Motivation and status.** The clear p57 PARABLE instructs the reader to “shed our own circumferences.” A separate source-preserved 2013 CicadaOS display reads “The key is all around you” (the display transcript itself is not PGP-signed; see the source audit and #2146). Together these phrases motivate testing whether each printed word's outer two runes are a key for its interior. They do not specify an algorithm; this is a frozen, low-cost hypothesis, not an established Cicada instruction.

**Frozen receiver.** For each complete body word, take the outer shell in printed order `[left,right]`; repeat those two GP29 values over the interior, reset phase at every word, and apply the historical additive inverse `P=(C−K) mod29`. The first two red p0 rubric words are excluded. The 32 carried words remain intact in the source tape. Test both ordinary key consumption and the authentic LP1 transparent-F rule.

**Ordinary consumption.** Across 2,894 body words, 2,363 have nonempty interiors (7,238 runes). The decoded interior IoC is **0.03456967**, essentially the uniform `1/29 = 0.03448276` baseline. The first outputs are `NI`, `J`, `G`, `NGHDGNGONEO`, `TRU`, `NJ`, `R`, `EA`, `YEO`; they do not form plaintext.

**Transparent-F exact obstruction.** With plaintext F emitted as ciphertext F without advancing the key, a ciphertext zero may be either a transparent F or an encrypted non-F, so the decoder uses exact two-phase reachability. It finds **no legal path for 137/2,363 nonempty interiors**. The first contradiction is body word slot59: shell `ᛋᛡ`, interior `ᛟᚱᚢᚹᛋᛚ`. After four encrypted symbols the phase is 0; the fifth ciphertext rune `ᛋ` equals the active key rune `ᛋ`, forcing `P=C−K=F` while the ciphertext is not F. This is an algebraic impossibility for the frozen receiver, independent of language scoring.

**Native positive control.** The read-only SFT uses 1,001 runes from the six original printed-clear LP1 pages (3, 8, 9, 10, 11, 14) plus the 95-rune clear PARABLE. It plants 2,363 words/7,238 runes at the exact target interior lengths with the actual target shell pairs as keys; the true transparent-F path remains reachable for every planted word. Windows Node22 run [45494972139](https://github.com/FlareZ123/liber-primus/actions/runs/45494972139) passes. Reproducer: [`lp2_word_circumference_shell_pair_vigenere_sft.cjs`](../sims/lp2_word_circumference_shell_pair_vigenere_sft.cjs).

**Decision.** Reject this exact left-to-right, period-2, per-word-reset additive shell key under both ordinary and transparent-F consumption. This does not reject all shell-side channels or other source-selected boundary operations.

**Still open:** Other independently specified shell consumers, receivers that remap output boundaries, or different geometrical uses of p57 remain untested. The two fixed per-word 29-to-28 shell receivers and the fixed two-symbol additive shell key above are retired; do not expand them into arbitrary rotations, alphabet permutations, fitted word keys or hidden state. Any further shell-side channel needs an independent source clue that fixes its mapping and reset semantics before the original ciphertext is inspected. This work recovers no unknown LP2 plaintext or Cicada destination.

The parent clue and neighboring routes are discussed in [the integrated inversion frontier](../workplace/integrated-original-inversion-challenge.md) and [the authoritative synthesis](../results/README.md). This report does not elevate an unverified mechanism to established results.
