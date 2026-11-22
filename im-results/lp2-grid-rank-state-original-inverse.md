# Source-byte-ranked 32-state GP29 inverse: full original-cipher decision

**10 November 2026, Agent13, Issue #16. Classification: complete original-input negative for one explicitly specified, lossless grid/state architecture. No authentic unknown LP2 plaintext, key, mechanism or continuation recovered.** [Executed source/positive SFT](../sims/lp2_grid_rank_state_original_inverse.cjs) · [passing manual grid CI 42898964666](https://github.com/FlareZ123/liber-primus/actions/runs/42898964666).

## The constructive repair and why this was tried

The source-printed LP2 p49–51 table is **32 rows × 8 bytes**. All eight byte values within each actual printed row are distinct. A proposed earlier **5+3 bit split** discards necessary GP-rune information after two steps: for example, two distinct nonrepeat rune-difference inputs `[12,0]` and `[13,0]` produce the same emitted outputs `[25,4]` and identical terminal state 0, even with initial state0. The [complete two-rune noninjection certificate](grid-byte-split-transducer-noninjection.md) excludes both split variants and both column orders for every starting state, without using English scoring.

A distinct **exactly reversible** candidate uses the same source geometry with no extra external key: order the eight source bytes in each row numerically; map this ordering back to eight input classes `q=0..7` in historical PATIENCE column order **[6,5,3,0,2,4,7,1]**. Input ranks `0..27` form seven groups of four (`x=4q+h`); the 29th rank `x=28` represents a repeated published rune. Each sorted row yields a 29-symbol bijection by expanding every ordered ordinary class into four residuals `h=0..3` and the repeat class into one symbol. The row selected for the next rune is the low five bits of the table byte in the current state and selected column. Every original rune can be transformed uniquely, including all 86 adjacent identical outputs.

The original ciphertext's GP predecessor-rank `x` is **28** for a repeated rune, otherwise the 0-based ordinal of the current printed GP rune among the other 28 runes after removing the previous printed GP value. For source table `T`, current state `s`, column `j=PATIENCE[q(x)]`, and the 29-symbol sorted-row permutation `π_s`:

```text
ciphertext → plaintext:     P_i = π_s(x_i)
ciphertext state feedback:  s_(i+1) = T[s_i][j] mod 32
recover printed ciphertext: x_i = π_s^(-1)(P_i)
                             C_i = C_(i-1) if x_i=28,
                             otherwise x_i + [x_i >= C_(i-1)]
```

Because all 29 outputs are permuted in every state, no two plaintext GP symbols collapse within any fixed state. Both forward and inverse update the same state from the published ciphertext. This *repairs losslessness as a mathematical construction*, while the ordering, feedback and initial state remain source-motivated hypotheses rather than Cicada instructions. The existence of one constructed reversible cipher does not imply it is the original encryption system.

## Authentic original-cipher and independently planted controls

The **single fixed forward/inverse model** uses the unmodified canonical printed table, the fixed PATIENCE column order, low-five-bit feedback, initial row state `s0=0` and initial previous-ciphertext GP rune index `0` for the continuous 12,956-rune original stream. A separate source-anchored **p49 + p51 rune-only clock** concatenates 66 original p49 runes and 92 original p51 runes, skipping all 256 nonrune grid bytes, with initial row0 and the actual preceding p48 final GP rune. The p56 authentic prime-totient solved-cipher clock independently ignores the digest bytes separated by the same ten-dot stencil; extending that rule to unsolved pages is an explicitly *provisional* transfer.

The program also creates independent native-GP plaintext from a held-out **12,956-rune** Shakespeare passage beyond the first 100,000 GP symbols in the pinned source and encrypts it using precisely this same table, source ordering, feedback and initialization. It asserts exact decoder recovery of every planted rune. On real original text it likewise exactly reenciphers, which tests implementation only and is not evidence of a correct key.

| Frozen evidence | Original LP2 under candidate | Native-GP positive |
| --- | ---: | ---: |
| Rune count | 12,956 | 12,956 |
| IoC | **0.0345886186170** | **0.0598323167008** |
| Exact forward/inverse equality | 12,956/12,956 | 12,956/12,956 |
| Separately decoded p49/p51 bridge | 158 runes; IoC **0.0373296783036** | Not used for model selection |

The independent English control is strongly nonuniform and recovered exactly. The actual candidate-decoded manuscript remains essentially uniform over 29 GP symbols, with no recognizable native-GP prose, including on the 158-rune bridge. This rejects **this specific source-fixed direct GP29 rank/state model** as a useful reading of the original book, subject to the customary caveat that the unknown true plaintext might not be native-GP English. No alternative byte orientation, initial row, symbol order, or state update was fit to the real plaintext in this primary test.

## An exact state-search reduction

Since the state transition is driven entirely by the **observable published ciphertext predecessor-rank**, every hypothetical initial state can be propagated without guessing plaintext. Starting from the full set `{0,...,31}` of initial states, all 32 paths coalesce to **one** state after **129 real GP runes** under the whole-book clock. For the separately reset 158-rune p49/p51 bridge, all 32 paths coalesce after **38 runes**. This is an exact, original-source observation for the declared update function, asserted in the executable test.

Once two paths share the same state, both output the same future GP values for every identical ciphertext suffix. Consequently, no initial-state search under this particular ciphertext-driven feedback can recover a distinct long-range key, and the original post-coalescence results are seed-independent. Reset choices could affect short leading portions, but cannot repair the original continuous near-uniform full-book output. This is useful for avoiding exhaustive searches of variants in this closed architecture.

## Handoff and decision

This work supplies a concrete lossless alternative to the previously noninjective 5+3 proposal and a genuinely executed original-input test, with a native-GP plant. It does **not** yield unknown plaintext. Agent5 and Issue #16 should now seek **source-indicated nonperiodic state or independently selected plaintext-dependent feedback**, an extra authenticated visible control, or an operation that makes a prospectively testable prediction on original p49/p51 and adjacent original pages. Do not repeat more 5-bit initial-state sweeps or present exact re-encryption as cryptographic authentication.

Run `node sims/lp2_grid_rank_state_original_inverse.cjs` (Node.js 22, CommonJS, no third-party dependencies) on the unchanged repository. The existing manual `grid-256-tests.yml` workflow now checks this and the two-rune noninjectivity certificate; [successful action 42898964666](https://github.com/FlareZ123/liber-primus/actions/runs/42898964666) includes both actual original and positive-control output.
