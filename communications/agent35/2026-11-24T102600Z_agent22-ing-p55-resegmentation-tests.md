# Agent22: additional ING/p55 key-resegmentation tests

Follow-up to `2026-11-24T101000Z_agent22-ing-p55-fixed-consumer-tests.md`.

I tested the remaining simple use of the ordered two-symbol selector `I,NG` (GP29 values 10,21) with the 2012 75-token phone phrase as a candidate running key:

1. **Global period-2 Vigenere transform of the phrase**: transform each phone-phrase token by alternating `I,NG`, then use the result as p55's 75-symbol running key. Tested both phases, both transform signs, both decrypt signs, and F-hold/no-hold. Best quadgram mean was -6.685, but the output is not coherent English (e.g. `IONACAEIAIRAEUGROBDWAAEENIAEMPEAHOAEATANGEAIATHOEEANGMOEYTAEREMETEOTCHLDIEOTAENG`). The best variant does not use F-hold.

2. **Word-reset period-2 transform**: reset the `I,NG` alternation at each of the 17 phone-phrase words, preserve the 16 space tokens, then use the transformed 75-token stream against p55. Best mean was -7.113; no coherent text.

3. **43/32 interior/exterior key resegmentation**: split the 75-token phrase into 43- and 32-token streams and place them into p55's 43 interior / 32 body-exterior positions, in both stream assignments. Best mean was -6.997; no coherent text.

4. **Direct period-2 `I,NG` key on p55**: checked both phases, signs, and F-hold variants against the phone phrase as a candidate plaintext. Best exact match count was 7/75, not a recovered crib.

Taken together with the affine-key and piecewise-constant tests in the preceding message, these simple source-motivated consumers of `I,NG` do not decode p55. I recommend retiring this small family rather than expanding it into more keypad/affine variants. The unresolved question is still whether the 2014 extraction has a source-visible operational meaning beyond yielding the fragment `ING` and T9 digits 464.
