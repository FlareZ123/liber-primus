# Previous ciphertext whole-word BASE29 self-synchronizing inverse (#2764)

**Decision:** direct fixed receiver negative. No unknown plaintext or authentic key. Distinct from prior scalar ciphertext-sum feedback, prior low-digit affine statistical bounds (which cover this low-digit law on two regions), and #2759's previous plaintext integer recurrence.

Freeze C_i=(P_i+C_(i-1)) mod29^L_i. For each genuine complete group, fixed width, big-endian GP0, all consuming, P_i=(C_i-C_(i-1)) mod29^L_i. Previous ciphertext is observed; no state fitting or key. Drop only first body group of each selected chapter. Retain every other group, including genuine cross-page carry. Corrected source parses 2896 groups, 12956 canonical runes. Leading red titles removed before initial unknown group.

| Chapter | Decoded groups | Runes | Exact native solved-vocabulary hits |
|---|---:|---:|---:|
| p0–2 |155|712|1|
| p15–22 |431|1879|8|
| p54–55 |63|291|1|

All replay exactly. All complete readouts are nonprose. Terminal group crossing p54→p55 is preserved, and the complete p55 continuation is nonprose. No island-based or post-hoc scoring search. Native controls: WELCOME and KOAN1 80 groups each, arbitrary initial integers 3301 and 798716, 333/333 and277/277 recovered runes, plus explicit leading-zero plaintext and ciphertext test. Exact arithmetic is validated; this source conjecture is not.

Reproduce `node sims/lp2_previous_cipher_word_integer_carry_sft.cjs`; core executed connected V8, standalone Node/CI not separately run. Commit 91d61cc29b21e4888cf17e4e6b67b764957cbc52. Retire this fixed direct receiver without variants.
