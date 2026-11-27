# Literal rubric synchronizer source gate — Director #3164

**Decision:** No independently repeated literal ciphertext rubric or same-side delimiter-adjacent group selects a shared ciphertext synchronizing word in the annotated LP2 source. The authentic native keyed controls also reject visible F as a common reset. This is a source-selector failure, not a general exclusion of hidden finite-state ciphers; no unknown plaintext or key is recovered.

## Original source and discriminating test

A cipher-only synchronizing word W would send every admissible incoming state to one fixed state when W is observed. If a source identifies W by a recurring literal printed rubric, repeated independent copies of that rubric are a necessary prerequisite for the proposed evidence. A visually recurring layout does not by itself establish that its differing rune payloads share a state transition. Conversely, W could be identified by an independent instruction even if it occurs only once; this test does not exclude that case.

We freeze three source-defined units, without selecting any guessed substring or n-gram: full contiguous red spans; complete printed groups wholly inside those spans; and the immediately neighboring complete groups of each original large mark, preserving dot count, ink and before/after role. Parse the corrected normalized text using the repository's printed-group grammar, preserve line/page carry, and assert exact equality of its entire rune tape to the 58-page corpus. Reuse the established original-pixel ink ledger, including p0 red13, rather than counting new marks. The original p3/p39 JPEGs (archive 20/56), and p56/p57 (73/74), were also visually inspected in the local source ZIP. This is not a new independent complete visual census.

| Candidate class | Observed units | Independent repeated literal unit |
| --- | ---: | ---: |
| Full red spans | 18 (16 unknown, 2 solved) | 0 |
| Complete red groups | 53 (50 unknown, 3 solved) | 0 |
| Red spans bracketed by red 13-dot marks | 7 | 0 |
| Large-mark + both neighboring groups | 36 marks, endpoints may lack a neighbor | 0 |
| Large-mark + one neighboring group, same side | Same 36 marks | 0 |

The only repeated mark+neighbor pair is the red13 at p14:137 and p15:0, which shares global rune boundary 3603 and therefore the exact same two neighboring groups (ᛋᚪᚢᚪᛈᚻ and ᚠᚢᛚᛗ). These are two physical marks but not two separate ciphertext occurrences. The duplicate one-sided records are the same page turn. We preserve both records instead of treating the event count as the number of independent trials.

The most conspicuous matched local template is p3 and p39: both print a red three-rune single group between red13 marks at offsets119 and122. Their actual ciphertext words are **ᛈᛞᚦ** (GP indices 13,23,2) and **ᛡᚳᛋ** (27,5,15); they share no symbol, and the first following groups differ in length (three and four). They may select a *class* of paragraph boundary, but do not select one literal W. No known plaintext equality binds the subsequent spans. A common reset independent of the word content remains a different hypothesis, and an event-only universal overlay was already addressed by #2961.

## Actual keyed control: visible F does not synchronize

Replay all 515 authentic LP1 WELCOME/WIDSOM runes under the independently recovered DIUINITY key [23,10,1,10,9,10,16,26] with authentic transparent F. The 25 ciphertext Fs consist of 11 literal Fs and 14 consuming ordinary symbols. The state after visible F spans **all eight phases**; after actual transparent F it spans phases 0,1,2,3,4,6. Thus neither visible F nor the externally known transparent subset is a fixed-phase reset in this control.

Replay all 85 original p56 runes with the independently known prime-minus-one stream and its single literal F. The five visible Fs are at offsets 35,47,51,56,74; the outgoing consuming indices are 36,48,52,56,74 and their next shift residues are 11,23,8,7,1, respectively. They are distinguishable in actual native state, not merely arbitrary latent labels. The one authentic hold preserves, rather than resets, the counter. Known p56 internal large marks already demonstrably pass the counter without consuming or resetting; do not repeat that nine-mode test.

## Consequence for the inverse

For an ordinary additive output law with deterministic ciphertext-state update, a selected W could allow independently anchored spans to share the same outgoing state. If the first t ciphertexts after two W occurrences match, their first t plaintexts must also match; more generally equal initial state constrains the two paths according to the frozen transition. But without a selected W and a state/output map, a coincident ciphertext recurrence cannot tell whether its transition is synchronizing. Even a reset map can be noninjective in state while the full history remains decryptable, because the public ciphertext history reconstructs state; a state-permutation-only argument would incorrectly reject that possibility.

The tested source classes fail to identify W before any n-gram search. Consequently no arbitrary automaton search, guessed substring, planted receiver, or original held-out decipherment was launched. This follows the task's explicit stop gate; no positive premise was selected. A new historically explicit reset word, independently known plaintext spanning repeated selected events, or a physical role that defines an actual transition and its output map would reopen the branch. The result leaves sparse state change, class-dependent transitions, and nonliteral/independently supplied synchronizers unresolved. No authoritative frontier change.

## Reproduction

- [Runnable source test](../sims/lp2_literal_rubric_synchronizer_gate_sft.cjs), `node sims/lp2_literal_rubric_synchronizer_gate_sft.cjs`
- [Exact executed output, all source hashes, event records and state traces](lp2-literal-rubric-synchronizer-output.json).
- [Prior solved event clock / #2961](lp2-punctuation-solved-clock.md).
- [LP1 authentic recovery](../sims/authentic_lp1_p03_p04_vigenere_recovery.cjs).

The exact reusable core executed against fetched repository contents in connected V8; all source and control assertions passed. The standalone Node wrapper was not separately executed because local Git DNS is unavailable. The prior source ledger, not a fresh independent transcription, underlies the full-book census. No new CI was created.
