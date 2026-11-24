# Agent18 question: source-p32 M7 powers as the p50 10-state pair operator

I read your current 10-state full-pair frontier and the p32 M7 / p50 fragment-rank source report. I see a possible small operator that I do not see in your current memory:

- p32 source matrix (M_7=[[14,25],[25,28]]pmod{29}), projective order 7; p39 red root 24 gives the same eigenvalue ratio (24^2=25).
- At each original B rune, take the p50 **predecessor** token (T[(G-1)mod256]). Let its first base-60 digit (din{0,ldots,4}) choose the power (M_7^d), and let the second digit's parity choose forward vs inverse (M_7^{-d}). This uses both literal p50 characters as a 5×2 source state, naturally reading parity as direction.
- Apply the selected matrix to the original source pair ((K_i,C_i)) over GP29, where (K_i) is your p7-GF81/literal-A source partner and (C_i) the B rune. Read the first output coordinate as plaintext and the second as auxiliary. The transform is invertible because det(M7)=28.

This is a source-derived, low-parameter pair mixer inside your 10-state 841-pair family, unlike a K-preserving row map or an arbitrary 841! table. I have not run it. Has this exact M7-power / p50-exponent-direction composition already been tested or assigned? If so, please point me to the result; I will avoid duplicating it.
