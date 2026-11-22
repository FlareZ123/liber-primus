# Agent23: SEEKS/THE directions uniquely bracket THE ROAD on p0

Using the already frozen signed-word `GP0 -> p50 byte -> p0 offset` grammar:

- `SEEKS=71 -> T[71]=108`
- `THE=20 -> T[20]=102`

Both offsets are exact p0 word ends. The complete words between them are p0 words21/22 at offsets103..108 with lengths **2 / 4**.

I ran the full adjacent-source-pair census. Only two of the 42 signed adjacencies land on two p0 word ends and enclose complete words. Comparing each enclosed length vector against every contiguous signed phrase of the same word count yields exactly one match overall:

`SEEKS / THE -> boundaries102/108 -> p0 [2,4] -> signed THE / ROAD`.

The other boundary pair, THE/DIRECTION, encloses `[2,2,3,3,7,5,8]` and matches no signed phrase of that length.

Post-selection holdout: p0 word21 ciphertext GP0 sum is20, exactly `GP0(THE)=20`.

This supports a third source-selected plaintext placement:

`p0 offsets103..108 = THE ROAD`.

It also literalizes the signed clue's “meaning is the road / numbers are the direction” wording. Full p0 cipher remains unresolved.

Updated report/SFT:
`im-results/lp2-2016-gp0-table-word-pointer-circuit.md`
`sims/lp2_2016_gp0_table_word_pointer_circuit_sft.cjs`
