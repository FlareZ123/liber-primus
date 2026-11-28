# Exact p56-clock noncommutative affine inverse on the 28 non-F GP runes

**Agent30, 28 November 2026; Director #3300.** This report gives a fully reversible, genuinely noncommutative prime-clock action with an exact **all-336-initial-key original-cipher exclusion** under the solved-native language register. **No unknown LP2 plaintext, authentic key or continuation destination was recovered.** Self-contained CJS reproducer: [sims/lp2_primeclock_agl28_noncommutative_sft.cjs](../sims/lp2_primeclock_agl28_noncommutative_sft.cjs).

## Authenticated source constraint and competing hypothesis

The independently solved p56 mechanism uses successive prime numbers and a literal plaintext F that is emitted as ciphertext F without advancing the key clock. The 2013 signed Gematria Primus alphabet has 29 rune indices. An affine transformation on GF29 constrained to fix F (index0) at every step consists only of scalings and cannot be noncommutative, unlike the requested moving affine action. To retain the authentic F interruption **and** a genuine noncommuting composition, treat the 28 other GP labels (indices 1…28) as the ring Z/28Z by subtracting one. Its unit multiplier group has 12 elements; adding a 28-way translation yields a nonabelian 336-element affine group.

This ring representation, multiplier and composition are **our explicitly frozen exploratory hypotheses, not first-party Cicada instructions**. The base 3 is the smallest prime invertible modulo28 (2 is not a unit). We do not tune the base, sign, original prime ordinal, holds, page resets or hidden alphabet. Preflight: #3161's full-GF29 shift/Atbash conjugation is ordinary affine feedback, and #2913 exhausts a different one-lag affine recurrence; #3284 is an independently claimed prime-chart nonlinear-composition project, not used here.

For the i-th *consumed* source rune, with q_i the i-th ordinary prime starting 2, define

\[
A_i(z)=3^{q_i}z+(q_i-1)\pmod {28},\quad
T_i=A_i\circ T_{i-1},\quad T_0(z)=uz+v.
\]

Here u ranges over all 12 units modulo28, v over all 28 residues. For plaintext P in indices 1…28 emit ciphertext index

\[
C_i=1+\big[T_i(P_i-1)\bmod28\big].
\]

For plaintext F=0, emit F and do not advance i or T. Every key gives a full, deterministic, invertible 29-symbol mapping for each clock position; the ciphertext itself reveals the exact F holds. Applying T_i inverse at each non-F cipher token gives the original plaintext and exact forward replay.

**The actions really do not commute:** first two primes give A_1(z)=9z+1 and A_2(z)=27z+2 modulo28. A_2(A_1(0))=**1**, whereas A_1(A_2(0))=**19**. The chosen left-composition order is fixed. The multiplier sequence 3^{q_i} has period6 as a function of q_i mod6, and is a permutation at every step.

## All 336 secret keys eliminated by one exact invariant

Let G_i=A_i∘…∘A_1, determined *entirely by public primes*. Then T_i=G_i∘T_0. Define the unrolled non-F ciphertext Z_i=1+[G_i^{-1}(C_i−1) mod28], retaining F as0. The original plaintext is

\[
P_i=1+[u^{-1}(Z_i-1-v)\bmod28]
\]

at non-F positions, and0 for F. Varying u,v therefore applies only a **fixed bijection to the 28 non-F plaintext labels**. This exactly preserves the complete 29-bin frequency multiset, and especially the integer pair collision count Σ n_j(n_j−1), for **every** possible initial affine state. No source-language scoring or choice among 336 keys can improve the index of coincidence (IoC).

Every original cipher rune in the following six complete source scopes is decoded and re-encoded under all 336 legal keys, with integer collision invariance asserted. No guessed plaintext or truncated input is used. Native comparisons use the independent 2,979-rune nine-section *solved plaintext* compilation at resources/external/relikd-solved-gp29-native-v1.json. Some windows bridge authentic section boundaries, an overgenerous control.

| Exact original scope | Runes | Original cipher IoC | Decoded IoC, identical for 336 keys | Native control length / windows | Minimum native IoC |
|---|---:|---:|---:|---:|---:|
| p0–2 | 729 | .034083 | **.034768** | 729 / 2,251 | .057715 |
| p3–7 | 1,145 | .034634 | **.034376** | 1,145 / 1,835 | .059755 |
| p8–14 | 1,729 | .034460 | **.034208** | 1,729 / 1,251 | .060415 |
| p15–22 | 1,903 | .034502 | **.034728** | 1,903 / 1,077 | .060843 |
| p0–7, continuous without reset | 1,874 | .034531 | **.034662** | 1,874 / 1,106 | .060848 |
| p40–53 | 3,008 | .034543 | **.034530** | first 1,874 / 1,106 | .060848 |

The p40–53 fixed first-1,874-rune decoded prefix has IoC **.034542430**, since no 3,008-rune native control exists in the 2,979-rune compilation. All **8,626 native reference windows** in the six stated comparisons have IoC above .045; every tested original inverse yields IoC below .035. Thus no initial key yields a long original passage resembling the authenticated source-native GP label distribution. The source-fixed identity seed's p0–2 output starts **E M O G J EO L F Y J NG R H N T N L …**, without coherent full text. A key only permutes those non-F labels.

The p0–7 continuous receiver **does not restart at the physical p2→p3 seam**, retaining a locked 1,874-rune continuation of the same public action and unknown initial key. The independently reset p3–7 test is only a supplemental sensitivity check.

## Positive solved-page and long plaintext controls

Use actual *solved p56 plaintext* (**85 GP runes**, not the original encrypted p56 page indices), clear p57 (**95 GP runes**), and **1,874 real solved-source GP runes**. For each input encrypt under each of three frozen seeds (identity, u11/v7, u27/v26), then decode and re-encrypt. **All 9/9 native frames recover 100% of every rune and all literal F positions**, and replay the ciphertext exactly. The 1,874-rune real native source is a concatenation of source records with original GP spelling, not a synthetic repeated phrase; the generated encrypted distribution becomes nearly uniform as a working cipher can indeed produce.

Separate exact original-cipher reencryption of **all 336 keys in each of six original scopes** also passes. This validates the algebraic inverse; it does not select a genuine key, since reencryption is automatic for bijective wrong keys. The **key-invariant native concentration failure** is the discriminator.

## Decision and limits

**Retire this one frozen left-composed GP28 affine prime-clock action** as a direct source-native LP2 decoder. The actual original texts' IoCs are 0.0342–0.0348 rather than the >0.0577 solved-reference levels, for every possible key. This is a finite-register/native-language exclusion, not a universal impossibility for every hypothetical unusual plaintext register. The original historical instructions do not themselves choose multiplication by3 or the 28-residue representation, and a coherent recovered plaintext would have needed an independent selector and withheld original prediction. An alternative non-affine action, a source-specified changing plaintext register, or a genuinely different external key are not refuted.

Avoid another 336-key search or the previously excluded full-GF29 affine conjugacy merely to repair this finite failed original receiver.
