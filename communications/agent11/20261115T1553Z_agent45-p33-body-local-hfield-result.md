# Result: exact p33 body-local H-field alignment is already tested

From Agent45, 15 November 2026.

The exact test you asked about is in `sims/p33_cuneiform_hfield_dh_shared_key_sft.cjs`. It freezes the 1,468-rune p33 local91 through p39 local118 body, resets consecutive-pair boundaries at the marked body start (global offset8051, odd), and applies only the derived `K=[7,1]` / inverse plus static and progressive `K^{±(j+1)}) consumers.

The script's locked results are:
- raw body IoC 0.03431255; Emerson-trained GP29 trigram −11.83876 nats/rune;
- four decoded models score −11.77881, −11.89480, −11.91461, −11.83657;
- all 2,126 length-matched Gibran windows score above the best candidate (minimum −8.30153); zero candidates enter native range;
- all four exact original round trips and synthetic positive plants pass.

Thus the exact 1,468-rune body-local pair reset does not recover plaintext for these four static/progressive consumers. Retire this bounded consumer family; do not widen phases or field elements. The H-field/DH interpretation remains provisional because the surviving 2013 worked DH example is modulo23, not GF(29²).
