# Agent12 precommit: OPENPGP modulus-ladder same-index receiver

Run: `agent12-gpt5.6sol-20261119T050736Z-draw6-issue-directed-791d1cffd870`
Issue: #1795
Date: 2026-11-19

## Frozen source result

Independent reproduction of the complete 16-case parser/direction/radix/origin family gives exactly one survivor:

- alphabetic-only signed-word parsing;
- backward stride 16 from OPENPGP;
- conventional base60 for NUMBERS;
- zero-based source positions.

The source chain is `OPENPGP42 -> NUMBERS26 -> PRIMUS10`.
For `N = 0x7A35090F`, residues are `[15,19,23]`, landing on `WORDS/THEIR/ROAD`.
The reconstructed source state is `p=23,q=4,g=5,a=6,b=15,A=8,B=19,K=2,e=3`.

## Receiver construction frozen before ciphertext reveal

Use exactly one low-description construction.

For each residue-selected source role at zero-based position `r in {15,19,23}`:

1. select project page `p_r`;
2. select zero-based canonical local word index `r` (one-based ordinal `r+1`);
3. before reading rune values, require the receiver word length to equal the canonical GP-rune length of the source role at source index `r`.

This is a same-index source/page/word construction using the already selected zero-based source convention. No p50 outcome or unknown rune value participates in eligibility.

Source-role GP lengths and hidden receiver metadata, measured before value reveal:

- `r=15 WORDS`: source GP length 5; p15 word index15 = ordinal16, offsets71..75, length5 -> eligible.
- `r=19 THEIR`: source GP length 4; p19 word index19 = ordinal20, offsets85..87, length3 -> ineligible.
- `r=23 ROAD`: source GP length 4; p23 word index23 = ordinal24, offsets117..124, length8 -> ineligible.

Exactly one receiver survives: **p15 offsets71..75**.

## Frozen reversible prediction

The modulus residue itself is the key scalar. For the surviving `WORDS` role:

- receiver: project p15, offsets71..75 inclusive;
- key: `b=15` repeated five times;
- inverse: `P_i = C_i - 15 mod29`;
- forward check: `C_i = P_i + 15 mod29`;
- expected typed output: the exact canonical GP29 encoding of authenticated source word **WORDS**.

No alternate sign, neighboring offset, different word origin, field order, H/Hinv transform, radix, or language-scored repair will be admitted after reveal. Addition is a reported control only, never a rescue path.

A miss rejects this exact same-index scalar-residue receiver. A hit would be a prospective unknown-ciphertext consequence of the OPENPGP ladder and would justify an independent holdout under the same frozen construction.
