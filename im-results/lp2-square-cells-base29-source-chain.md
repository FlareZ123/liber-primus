# BASE29 square-cell chain: the four-edge alignment survives both word origins

**Agent16 audit, 20 November 2026. Classification: a real numerical pattern in the preserved square transcription, but not a unique p0 selector or a decryption.**

## Numerical result

The three Stage10 square transcriptions contain 99 cell occurrences and 50 distinct integer values. The earlier full-cell scan found a four-edge run of consecutive BASE29 word indices at values 91, 121, 151 and 181:

| Value | BASE29 digits | Zero-based pair | One-based pair |
|---:|---|---|---|
| 91 | [3,4] | LIES EMPTY | PATH LIES |
| 121 | [4,5] | EMPTY EPIPHANY | LIES EMPTY |
| 151 | [5,6] | EPIPHANY SEEKS | EMPTY EPIPHANY |
| 181 | [6,7] | SEEKS THE | EPIPHANY SEEKS |

The zero-based overlapping chain is:

~~~text
LIES EMPTY EPIPHANY SEEKS THE
~~~

The one-based overlapping chain is:

~~~text
PATH LIES EMPTY EPIPHANY SEEKS
~~~

Both are contiguous substrings of the signed 2016 source message. The source does not number the word register, and the BASE29 instruction does not specify how its digits index that register. The chain therefore does not select one of these readings.

The phrase EPIPHANY SEEKS appears under both origins, but it is selected by different square values: 151 under zero-based indexing and 181 under one-based indexing. It is not a unique cell-to-plaintext prediction.

## The chain is not a source-fixed traversal

The values interleave the two 1033 objects in the form: 91 is the centre of the third/5×5 square; 121 occurs in the second/7×7 square; 151 occurs in the third/5×5 square; 181 occurs in the second/7×7 square. The Stage10 form order is 7×7 then 5×5. No surviving instruction says to interleave the two geometries in the order 5×5-centre → 7×7-inner → 5×5-outer → 7×7-outer.

The solved p57 wording about shedding circumferences and emerging is suggestive of a centre/circumference operation, but it does not select a starting ray, handedness, coordinate origin, or a rule for combining the two different 1033 squares. The four-edge chain is a numerical alignment found in the cell set, not a uniquely specified walk.

The next overlapping pair would be [7,8] = THE DEVOTED, integer 211. Value 211 is absent from the three square transcriptions; the chain stops.

## Consequence

The prior radix scan still makes BASE29 the only tested radix with this four-edge numerical chain. That is worth preserving as an intermediate observation. It does not establish a source-fixed word origin, a unique traversal, a p0 plaintext selector, or a reversible cipher/key. Do not promote the chain to plaintext or use it to justify a new key search.

No p0 ciphertext or p0 residual was used in this audit. This invocation was already unblinded to the candidate phrase in prior synthesis.

## Reproduction

- Original full-cell numeric scan: sims/lp2_square_cells_base29_source_chain_sft.cjs
- Both-origin source-only audit: sims/issue1940_word_origin_audit_sft.cjs
