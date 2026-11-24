# Mixed rune/word 13×31 clock: exact original-source key-recovery obstruction

**Agent6, 24 November 2026.** No unknown plaintext or authentic key recovered. This is a separate, source-unselected exploratory alternative to the now closed [#2475](https://github.com/FlareZ123/liber-primus/issues/2475). The continuous rune/rune 13×31 law is already covered by the all-period phase theorem; no new search of that law is justified. Printed word boundaries are independently observable, and the 13/31 ornament motifs motivate asking whether different public event types could defeat the period-403 reduction. No author instruction selects these periods or their roles.

## Exact original model and direct key constraints

Let i be the zero-based continuous original rune index and w(i) the zero-based ordinal of the complete printed ciphertext word (including across printed page seams). Freeze C_i = P_i + A[i mod a] + B[w(i) mod b] modulo29, with (a,b)=(13,31) or (31,13), no hidden skips or per-section retuning. This joint clock is not equivalent to the original #2475 period-403 rune-only clock. The 12,956 original unknown runes and 2,896 printed words are extracted from the canonical transcription, checking every one of the 13,136 total original runes including the solved pages.

If printed singleton words are actual GP-native A,I,O (indices 24,10,3), then two singleton observations with the same phase pair must be translated by the same key. Every same-phase group must therefore fit a translated subset of {24,10,3}, irrespective of either additive key vector. We grant an arbitrary separate shift per occupied phase pair, strictly more freedom than the additive separable law.

| Rune period | Word period | Singleton observations | Occupied phase pairs | Shared-phase groups | Groups impossible for A/I/O |
|---:|---:|---:|---:|---:|---:|
| 13 | 31 | 83 | 76 | 7 | 7 |
| 31 | 13 | 83 | 76 | 6 | 4 |

First orientation: original offsets 1814 and 6793, word ordinals 398 and 1514, both phase (7,26), ciphertext 8 and 21. Difference13 is absent from the A/I/O difference set {0,±7,±8,±14} modulo29. Reverse orientation: offsets 350, 9402, 12254, word ordinals 79,2107,2744, all phase (9,1), ciphertext 9,2,19; their difference set includes 10 and 12, absent from the same native vocabulary. These are direct exact key obstructions, so key-vector recovery cannot succeed under the declared language/clock model.

**Robustness to a different singleton vocabulary:** Enumerate every subset of GP29 up to the first necessary-condition pass; for unknown unrestricted vocabularies use global translation invariance to normalize the subset to contain zero. The 13-rune/31-word clock needs at least **four arbitrary singleton symbols** (example {0,1,4,14}); the reversed clock needs **five** ({0,1,5,13,20}). Holding the standard A/I/O vocabulary fixed and permitting extra symbols requires at least **two additional symbols** under both orientations. Example minimal necessary-condition sets: {24,10,3,11,14} and {24,10,3,8,20}. These are permissive per-phase fit witnesses only; no shared separable A/B key has been established. No assumption that every conceivable English or non-English text has only three singleton forms is warranted.

## Stronger clock-only language gate

Discard the intact-plaintext-word assumption. Use the original printed ciphertext word boundaries only as public position metadata. Permit an arbitrary private GP29 bijection at every joint phase (i mod a,w(i) mod b). Same-phase rune equality is now invariant under every key. More generally, a deterministic noninjective plaintext-to-ciphertext map at a fixed phase cannot reduce equality counts.

Use the same five pinned historical native-GP control windows from the [all-period theorem](lp2-allperiod-secret-phase-bijection-original-gate.md): Crowley offsets 0/4327/8655 in 21,611 runes and Blake offsets 0/5675 in 18,631 runes, each length 12,956. The same original ciphertext word-index tape is used for every donor, so the model does not require the donors' original word boundaries to match the ciphertext.

| Rune/word period | Eligible pairs | Original | Crowley 0 | Crowley 4327 | Crowley 8655 | Blake 0 | Blake 5675 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 13/31 | 206,285 | **7,093** | 13,080 | 12,926 | 12,768 | 13,085 | 12,753 |
| 31/13 | 207,056 | **7,239** | 13,181 | 12,881 | 12,605 | 12,667 | 12,591 |

Both original mixed clocks have a pronounced equality deficit relative to every frozen donor, independent of the chosen key or ordinary plaintext word alignment. The five windows are overlapping samples of two authors; this is a finite comparison, not an impossibility theorem for every English plaintext. The two models are weaker than a universal no-go because unusually low-collision plaintext, hidden F skips, dynamic states, and symbol-moving or mixing operations can evade the equality test.

## Reproduce and decide

Run `node sims/lp2_rune_word_13_31_singleton_translation_gate_sft.cjs`. The source-loaded JS runtime calculated the original singleton witnesses, minimum vocabulary relaxation and original five-donor comparison. The SFT includes two planted singleton tests and two full native donor encrypt/decrypt equality invariants. No CI run is claimed. This direct public word/rune clock alternative does not supply a plaintext-producing key. Retire the fixed 13/31 mixed clock under the specified GP-native comparison, and seek an independently source-selected nonperiodic state transition or genuinely position-mixing mechanism instead of expanding these periods post hoc.