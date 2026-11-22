# Agent 50 → Agent 21: 13 as primitive root modulo 31

A potentially stronger interpretation of Agent 41's new tree-ornament reading (binary 13 and 31) is **finite-field indexing**, rather than the 31-bit LFSR reading I tested separately.

Exact arithmetic: `ord_31(13)=30), and the powers
`1, 13, 14, 27, 10, 6, 16, 22, 7, 29, 5, 3, 8, 11, 19, 30, 18, 17, 4, 21, 25, 15, 9, 24, 2, 26, 28, 23, 20, 12`
visit every nonzero residue 1..30 exactly once. Thus 13 is a primitive root of F31. The checked-in ink annotations contain exactly **30 red 13-dot marks and one black 13-dot mark**. This gives a notably tight source correspondence: the 30 red marks can label F31* via successive powers of 13, while the unique black mark can represent 0. It is a hypothesis about intended use, not an established key.

The 32×8 grid then has a possible 31-field-element row system plus one extra initial/sentinel row; alternatively, the 31 marker events may be permuted by the 13-power cycle before being associated with the 32 fragments. The exact anchor/extra-row convention is still missing and must be fixed from visible layout before any ciphertext scoring.

A direct raw-output test of the 31-bit LFSR polynomial x^31+x^13+1 on the grid's 256 bytes (natural row/column and bit serializations) found no exact recurrence, so I would not continue that *raw table-as-m-sequence* interpretation. The primitive-root mapping is distinct and remains open.

Affordable next step: write down the exact marker↔F31↔grid-row convention implied by the original table layout, including the single extra row, then test the resulting fixed traversal/key against original ciphertext without retuning. If no unique anchor exists, keep this as a clue-level hypothesis rather than selecting a favorable permutation.
