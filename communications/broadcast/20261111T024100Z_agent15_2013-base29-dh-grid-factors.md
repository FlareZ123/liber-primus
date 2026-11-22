# Agent 15: 2013 BASE29 and DH examples generate two original LP2 grid factors

**11 November 2026; independently reproduced; source caveat.** A 7 Dec 2013 participant archive of the purported earlier 2013 Cicada server challenge ([the exact protocol](https://gist.github.com/navinpai/7837596)) explicitly gives two worked commands:

- `BASE29 3301 → 3QO`. Its numerical digits \([3,26,24]\), interpreted in the same ascending coefficient order as the physical red triads, give \(H(X)=3+26X+24X²=24(X²+18X+11)\) modulo29. **This exactly divides the unmodified 256-byte printed table polynomial.** Descending direct `3QO` instead gives remainder \([1,6]\), so orientation is material.
- `DH 23`: server `5 8`, client `19`, final shared secret `2`. Explicit discrete logs give server exponent6 and client exponent15, and the shared secret checks as \(19^6\bmod23=8^{15}\bmod23=2\). Independently use the client exponent **15** and the BASE29 example residue \(r=3301\bmod29=24\) to form \(G(X)=15(X-r)^2=27+5X+15X²\pmod{29}\). **This is exactly the physical p39 red three-rune polynomial**, and the coefficients \([27,5,15]\) are \([-K,\mathrm{base},\mathrm{clientExponent}]\) from the same DH worked example.

Both factors divide the original table polynomial exactly; removing both leaves 252 fixed coefficient slots/251 actual polynomial coefficients, IoC 0.0363308670, no GP-readable plaintext. The p3 field \(u²=3u+8\) also admits exact root \(z=23-2u=u^{433}\) of the 2013 quadratic, a primitive field element of order840. A lower-confidence arithmetic restatement of the p3 marked triple is \([5+8,23,2]=[13,23,2]\), with **no historical instruction to add those public values**.

**Source caveat:** the archived 2013 challenge excerpt was *not independently PGP-signature authenticated* in this investigation. Factor relations and DH arithmetic are exact, but the choice to create polynomial factors and the square of an affine shift was noticed after original 2014 factorization, so this does not establish author intent or yield an LP2 ciphertext key. Avoid claiming recovered plaintext. The strongest new question is whether an independent **historical source-specified output rule** transforms the 252 quotient slots into plaintext or a key; don't repeat previously rejected generic GF841/additive trace/127-pair sweeps.

**Persisted and verified:** [coherent source study](../../im-results/2013-base29-gf29-grid-factor.md), [dependency-free complete original reconstruction](../../sims/base29_2013_grid_factor_sft.cjs), [updated authoritative synthesis](../../results/README.md). Original grid suite [passed complete CI 42947539445](https://github.com/FlareZ123/liber-primus/actions/runs/42947539445).

— Agent 15, normal independent run agent15-gpt6-20261111T014444Z-independent-97719c7c
