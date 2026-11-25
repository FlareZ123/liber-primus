# Backward whole-word autokey: exact affine and prime-coordinate original inverse

**24 November 2026 — no new LP2 plaintext or authentic key.** The continuous backward next-plaintext-word model with authentic transparent plaintext F is exactly excluded for every nonzero map in the 24,389-member GP29/prime-coordinate family below, even with a completely unknown terminal seed. Independent artwork-chapter parameters do not rescue seven of nine chapters. The two nontrivial terminal-chapter maps selected by the actual known p56 AN seed produce 24 legal but nonlinguistic complete inverses. A distinct, source-anchored reverse traversal with latent word boundaries is also negative in the 25 November extension below. No further unconstrained word-autokey variants are justified.

## Model and historical motivation

The signed 2016 clue mentions words and direction, and p56's genuine plaintext opens AN END. A backward word traversal can therefore test a concrete plaintext seed, AN = [24,9] in the canonical GP0 alphabet. Solved p56 uses successive prime-minus-one shifts; earlier LP1 shows additive encryption with a transparent plaintext-F hold. These are genuine independent source features, but no first-party instruction transfers AN as a cyclic key into p55 or selects this recurrence. The forward comparison is [the all-key word-fed affine/prime report](lp2-affine-wordfed-autokey-allkey-original-gate.md), extending Director #2503.

For each original complete printed group i in decreasing order, use the next recovered plaintext group P_(i+1) as the cyclic key. Reset the within-group key phase t=0 and preserve the printed order within each word. Define a stationary map

    f(x) = a*x + b + c*(prime[x]-1) mod 29

with a,b,c independently in 0..28. For plaintext rune P=0 (F), emit C=0 without consuming the key. Otherwise emit C=(P+f(K[t mod |K|])) mod29 and increment t. The affine subset c=0 has 841 parameter triples; c!=0 has 23,548. The zero map (0,0,0) is the identity emitter. When C=0, enumerate both the literal F and ordinary nonzero preimage if legal. When C!=0 equals the active transformed key, no preimage exists.

## Original-input inversion and result

Join the genuine line/page carries before parsing the 12,956 original runes into 2,896 complete printed groups, including 83 singletons. The independent flat page-index tape is checked exactly. For each parameter triple, propagate the complete set of legal plaintext-word states backward, merging identical states; all accepted branches are exactly re-emitted. No lexical restriction is imposed at this stage.

| Family | Parameter triples | Complete survivors, actual AN terminal anchor | Complete survivors, all 29 last-singleton plaintext seeds |
|---|---:|---:|---:|
| GP0 affine, c=0 | 841 | 1 (identity only) | 1 (identity only) |
| Mixed GP0/prime-minus-one, c!=0 | 23,548 | 0 | 0 |

The last singleton is word2856. Granting all 29 possible values there is a superset of every possible terminal seed and preceding branch history. Every nonzero affine map dies after at most 390 attempted original runes; every mixed map dies after at most 515. The actual AN anchor's longest affine survivor dies at word2841 (262 attempted runes); its longest mixed survivors (18,3,19) and (19,12,21) die at word2828 (312 attempted runes). The largest exact state-set size is 29 for free seeds, and 4 for AN. Thus no initial secret keyword can rescue the continuous model. Arbitrary additional resets or different key laws are outside scope.

The original identity-key specialization (a,b,c)=(1,0,0) remains independently informative: the actual AN seed dies at word2890, offset12928, after 28 attempted runes. Its ciphertext [28,18,10,6,14,6,15] has sole key [20,19,14,6,4,22,17]; the fourth nonzero ciphertext rune6 equals its key6. All 83/83 independent free singleton starts fail. Shortest witness word2451→2439 (p45→44), 53 attempted runes, ciphertext [6,3,24,1] and both possible keys have second rune3. Last singleton word2856 dies at word2823 after147 runes. [Original specialization SFT](../sims/lp2_next_plaintext_word_autokey_fhold_sft.cjs).

## Independent chapter-private keys and all legal paths

Grant independent parameters and all possible plaintext values at the last complete singleton of each artwork chapter. Test backward to the first complete printed group wholly in that chapter. The suffix after that singleton is not asserted decoded. This deliberately relaxes all cross-chapter dependence.

| Physical span | Tested runes | Nonidentity affine survivors | Mixed-map survivors |
|---|---:|---:|---:|
| p0–2 | 644 | 1 | 2 |
| p3–7 | 1085 | 0 | 0 |
| p8–14 | 1473 | 0 | 0 |
| p15–22 | 1733 | 0 | 0 |
| p23–26 | 750 | 0 | 0 |
| p27–32 | 1254 | 0 | 0 |
| p33–39 | 1595 | 0 | 0 |
| p40–53 | 2614 | 0 | 0 |
| p54–55 | 122 | 445 | 6552 |

The exact native+TextBlob GP29 lexicon from the forward study has 29,081 forms. Among **all** surviving trajectories, dynamic programming maximizes the total rune coverage in matched printed groups of length at least four, retaining the best path per complete plaintext-word state. This is exact for the fixed vocabulary and objective; no beam truncation. Counts include all possible singleton seeds and distinct legal trajectories under each key, even if different maps produce identical paths.

| Span/family | Total legal trajectories | Eligible groups | Maximum matched groups/runes |
|---|---:|---:|---:|
| p0–2 affine | 16,384 | 80 | 1 / 5 |
| p0–2 mixed | 43,392 | 80 | 0 / 0 |
| p54–55 affine | 1,352 | 16 | 1 / 5 |
| p54–55 mixed | 38,686 | 16 | 2 / 8 |

The short terminal singleton-to-chapter-start tests leave many partial paths, but no coherent prose. Do not interpret isolated dictionary words as key recovery.

### Full p54–55 chapter from the authentic AN anchor

Only two nonidentity maps survive all 308 original runes of p54–55 (66 complete groups as framed by the canonical parse). Both fail upon continuing toward earlier chapters; treating p54–55 as a privately keyed chapter grants them every advantage.

| (a,b,c) | Complete legal paths | Maximum matched groups/runes |
|---|---:|---:|
| (18,3,19) | 16 | 0 / 0 |
| (19,12,21) | 8 | 0 / 0 |

Their optimum paths begin respectively `AE BLUWUCNB YNEOLTGDC NSU WIAPOUR HR` and `AE EAXRTSXOETH JEOACMEHH MCTH XNGLYHIA EOP`. The SFT outputs both full original-input inverses and checks exact re-encryption. No authentic plaintext or author-selected key emerges. Reencryption verifies the implementation, not the historical key.

## Ordinary no-hold affine emitter

For the ordinary emitter, the inverse is deterministic given any singleton seed and (a,b). The affine coordinate recurrence propagates exact triples representing each recovered rune as x*s+y*b+z modulo29. Enumerating all 29^3 combinations on all 83 original singleton groups yields distinct singleton-type counts:

| Distinct types | Parameter/seed combinations |
|---:|---:|
| 23 | 29 |
| 24 | 116 |
| 25 | 1,044 |
| 26 | 2,958 |
| 27 | 6,931 |
| 28 | 9,454 |
| 29 | 3,857 |

Every ordinary affine inverse needs at least 23 different one-rune plaintext types if printed groups are words. This is a strong conditional native-prose objection, not a language-independent algebraic exclusion. The ordinary mixed-prime law was not tested.

## Reproduction and controls

[Runnable CommonJS SFT](../sims/lp2_backward_wordfed_affine_prime_allkey_sft.cjs), latest implementation commit b7477915f9e0b1eefc03705abe9c87e8a75b4c18. The exact function in that file was executed in the connected JavaScript runtime using the fetched canonical corpus, original transcription, solved GP29 donors and frozen TextBlob lexicon; **no Windows CI run is claimed**. Three disjoint 150-word native-prose plants retain the true branch at every step under (3,7,0), (17,21,1), (28,12,11), with 612/597/611 encrypted runes and terminal reachable-state counts 3/4/1. Every accepted branch and chosen original best path is forward-checked. These are known-parameter synthetic controls and do not establish blind key recovery.

Run from repository root: `node sims/lp2_backward_wordfed_affine_prime_allkey_sft.cjs`.

**Decision:** retire this entire specified continuous backward family, including the authentic AN anchor, and its independently private artwork-chapter variants as a whole-book explanation. Preserve partial chapter legality survivors as explicitly nonprose rather than inferred keys. Arbitrary additional reset laws, altered printed segmentation, nonlinear state and independently authenticated key/operation remain outside the experiment. All 56 unknown LP2 pages remain unresolved.


## Reverse traversal with latent boundaries and the known AN seed (Agent15, 25 November)

**Decision:** the fixed reverse-traversal direct whole-word feedback receiver is not supported on original p54–55, even when the printed word separators are ignored. This is separate from the preceding backward traversal, which retained forward rune order inside each printed group. No authored clue specifies either receiver.

Freeze the 308 original runes from physical p54 (232) and p55 (76), reverse the complete tape, and set the first key to the reversed known p56 opening AN, [9,24]. In traversal order, a plaintext word is itself read backwards. For each inferred word, reset key position to zero, emit literal F without consumption, and otherwise apply GP29 addition with the previous recovered traversal-word as the cyclic key. The first unknown word therefore uses NA. Word boundaries and F holds are latent; no ciphertext ordering, key or starting phase is fitted. This is the full reverse reading of a forward word-fed encoder, not the prior decreasing-group/forward-internal-order model.

The receiver reuses the earlier marginal semi-Markov DP and scoring convention, reversing both source donor words and their word order. The pinned broad register has 35,800 forms, including all GP singletons; maximum word length 24, at most eight character-backoff word components, and 384 retained states per offset. An extension keeps only A/I/O/T as one-rune words (the actual solved-source census gives A=19,I=8,T=1; O is granted as an extra), and permits a backoff component even for the first word. All cases share the known two-rune NA seed. Three target-excluded literary GP29 controls come from the reversed held-out Gibran/Shakespeare/Emerson donor ends; these are constructed encryptions, not original Cicada ciphertext. Control windows are selected for exact 308-rune length and a lexical first word. The control first-word assumption remains a sampling limitation even when the extension allows first-word OOV. Compare the first 76 traversal runes (p55) and the next 232 (p54); the latter score is the incremental marginal log likelihood, not a distinct historically unseen page.

| Register / case | p55-length prefix nats/rune | continuation nats/rune | Recovery |
|---|---:|---:|---|
| Broad, fixed NA, three true-law controls | −1.752 / −1.679 / −2.030 | −1.744 / −1.840 / −1.713 | 696/696 continuation runes and all continuation boundaries |
| Broad, three mismatched continuous-key controls | −4.975 / −4.641 / no path | −6.759 / −6.858 / no path | 19/232, 11/232, no path |
| Broad, original | −4.935 | −6.844 | Incoherent exact replay; eight backoff components |
| A/I/O/T, initial OOV allowed, three true-law controls | −1.751 / −1.679 / −2.030 | −1.744 / −1.840 / −1.713 | 696/696 continuation runes and all continuation boundaries |
| A/I/O/T, three mismatched continuous-key controls | −5.086 / −4.935 / no path | no path | maximum retained complete boundaries 119/125/0 |
| A/I/O/T, original | −5.076 | no path | maximum retained complete boundary 109 |

The broad lexical-only variant has 29 complete end states and zero clipping, but the best candidate is fragmented into implausible isolated letters and words. Its full marginal score is −2202.969 (−7.153 nats/rune). Exact replay checks the proposed law, not its truth.

The strict lexical-only original path dies after six traversal runes, without clipping. A more useful **exact prefix OOV lower bound** grants arbitrary character-backoff components, including at the initial word, up to length24 and allows the p55/p54 seam to cut an incomplete word. With budgets 0/1/2, the last reachable complete word boundaries are 6/27/55, and no complete or partial path reaches 76. Budget3 first admits a path to 76 (24 complete end states, maximum 2,313 intermediate states). All four searches had zero clipping. Thus at least three backoff word components are necessary to explain even p55 in this finite grammar; this is not an unconditional language-independent contradiction. The strict full 308-rune budget8 beam dies at 109, but **it clipped** and is not an exact all-path exclusion. Exact zero-OOV calibration succeeds only on the control with no true OOV forms; the other two have 2 and 3 true OOVs, and the relaxed receiver recovers both.

Reproduction: [SFT](../sims/lp2_reverse_latent_nextword_an_sft.cjs), [broad controls and original](lp2-reverse-latent-nextword-an-output.json), [strict controls and original](lp2-reverse-latent-nextword-an-native-singletons.json), [exact prefix OOV support](lp2-reverse-latent-nextword-an-prefix-oov.json). Core experiment executed against actual repository inputs in the connected JS runtime; no standalone Windows Node/CI execution claimed. From repository root use `node sims/lp2_reverse_latent_nextword_an_sft.cjs` for the broad model, add `--native-singletons --first-oov` for the strict model, or `original --native-singletons --first-oov --prefix-only --budget=3` for exact prefix support (verify clipping count zero).

Retire this fixed known-AN reverse-direction receiver, under its calibrated native register and finite backoff assumptions. The art/parable does not select the AN key transfer, and different feedback functions, different terminal keys or clocks remain outside the test. Do not expand these variants merely to rescue the hypothesis.
