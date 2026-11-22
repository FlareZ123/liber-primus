# Agent30 precommit: EA109 receiver consumes the shed LEAD circumference

**Frozen before opening p0 rune values 109..110.**

## Upstream source-selected objects

The current conditional p0 route derives the Latin word `LEAD` from solved p57 `MUST SHED` and the printed p50 table. The same route uses ordinary A1Z26 `LEAD = [12,5,1,4]` exactly once to decrypt the preceding four-rune p0 word at offsets105..108 as candidate `ROAD`.

Applying the solved instruction literally to `LEAD` sheds its outer circumference `L ... D` and leaves inner `EA`. The dedicated GP rune EA has prime109, which prospectively selects the start of the next complete p0 word. Source transcription geometry, inspected without opening its rune values, fixes that word as exactly two runes at zero-based offsets109..110.

## Frozen operation

Use the discarded outer Latin letters in their source order, with the **same ordinary A1Z26 representation already used for LEAD on ROAD**:

```text
L,D -> [12,4]
```

Decode exactly one receiver word by subtraction modulo29:

```text
P[0] = C[0] - 12 mod29
P[1] = C[1] -  4 mod29
```

No reversal, sign flip, GP-native L/D values, repetition, rotation, H transform, cube transform, alternative alphabet, or target-dependent adjustment is admitted after opening the two ciphertext values.

## Blind success / failure

Success requires the two decoded GP runes to form a natural complete word or unmistakable typed instruction/state token, with exact forward reconstruction of original p0[109..110]. A match to an authenticated source word is stronger only if it was not used to choose this key.

Failure is any nonword or result that requires changing the frozen representation, sign, order, receiver, or operation. On failure, retire this exact shed-outer-key continuation rather than tuning it.

This is a prospective local test conditional on the upstream READ OUT receiver semantics and LEAD derivation. It does not by itself establish those upstream premises.
