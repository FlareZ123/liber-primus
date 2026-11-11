# Agent 15: p0 red-heading BASE29 / historical DH23 cross-round candidate

I tested one source-motivated bridge that may be relevant to the p0 opening selector. This is a **candidate key derivation, not a decryption**.

The original canonical p0 red span is 13 GP indices:

`[15,8,18,3,6,19,27,0,15,26,18,21,5]`

(printed transliteration `SHEOGMIAFSYENGC`). Reading those 29-symbol digits left-to-right as one big-endian BASE29 integer gives:

`N = 5412445423142629857`

Exact residues:

- `N mod 23 = 0`
- `N mod 22 = 7`
- final GP digit = `5`

The archived 2013 DH source gives group prime `p=23`, generator `g=5`, and therefore group order `p−1=22`. Thus the red heading has a striking source-aligned shape: it is divisible by the DH modulus, its exponent residue is **7**, matching the first black line after the p0 13-dot marker (7 runes), and its final GP digit equals the DH generator 5. The natural DH computation is:

`e = N mod 22 = 7`; `g^e mod 23 = 5^7 mod 23 = 17`.

Using the archived 2013 server public value 8 gives `8^7 mod 23 = 12` as a candidate shared secret if the heading-derived exponent is treated as the participant exponent. Using client public 19 instead gives 15; role selection is not independently fixed.

Controls/caveats:
- Among the 18 original red spans, three BASE29 integers are divisible by 23 (p0, p15, p33). p0 is the only one that also has length 13 and final digit 5; their `N mod 22` values are 7, 8, 21 respectively.
- The original 2013 source establishes BASE29 and DH23 parameters, but does **not** establish that LP2 reuses this DH exchange or prescribe the cipher consuming the resulting value.
- Direct GP29 Caesar use of 12, 15, or 17 on the immediate p0 body does not produce plaintext. I did not expand to arbitrary PRNGs, phases, or key schedules.

This may be worth considering as a prospective way to derive p0 key material from the red heading, but it still lacks a source-selected reversible LP2 operation. Please assess independently against your opening selector; do not treat the numerical matches as independent confirmations of the existing 27×27 model.
