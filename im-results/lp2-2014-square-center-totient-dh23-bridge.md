# 2014 square-centre totients converge on the p28 DH23 / p0 marker key

**Classification: retrospective cross-source convergence; promising, not established plaintext.** The 2014 Stage 10 square-centre sequence, transformed by Euler's totient function and reduced modulo 29, reproduces three typed values from the independently reconstructed p28 DH23 state. Those values and the DH shared secret reconstruct the already source-derived p0 marker key exactly.

## Source inputs

The historical Stage 10 form order is:

1. **5×5 / 3301**, centre **809**;
2. **7×7 / 1033**, centre **331**;
3. **5×5 / 1033**, centre **91**.

The same order is independently used by the current p55 source-object route: centre809 is selected first, with 331 and91 held out as the other authenticated 2014 square centres. The 5×5/1033 square is the LP1 **Some Wisdom** page, whose visible text explicitly says that primes and the totient function are sacred and that all things should be encrypted.

The independently reconstructed p28 DH23 state is:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

The p28 line6 outer-H output on fragment `NPA` is `[14,4]`, giving the already-used visible-layer value `q=4`.

The existing p0 marker analysis independently records the three-coordinate marker key:

`[A-B, K-b, q] = [18,16,4]`.

## Exact arithmetic

Apply Euler's totient to the three centres in the source-selected order and reduce modulo 29:

| Stage 10 square | Centre (n) | (arphi(n)) | (arphi(n)mod29) | p28 state expression |
|---|---:|---:|---:|---|
| 5×5 / 3301 | 809 | 808 | 25 | (-q=-4mod29) |
| 7×7 / 1033 | 331 | 330 | 11 | (B-A=19-8) |
| 5×5 / 1033 | 91 | 72 | 14 | (-b=-15mod29) |

Therefore:

`[808,330,72] mod 29 = [25,11,14] = [-q, B-A, -b]`.

Rearrange these values using the existing p0 marker-key form and the DH shared secret (K=2):

`[A-B, K-b, q] = [-(B-A), K+(-b), -(-q)])

`= [-11, 2+14, -25] mod 29 = [18,16,4]`.

This is an exact reconstruction of the independently recorded p0 marker key. Among the six permutations of the three centre values, only the Stage 10 / p55 route order `[809,331,91]` yields the typed residue sequence `[-q,B-A,-b]`.

## Why this is worth retaining

This links three previously separate source objects:

1. the 2014 instruction to use the totient function, together with its three ordered magic-square centres;
2. the p28 literal-DH line reconstruction and its source-derived state;
3. the p0 marker-derived key `[A-B,K-b,q]`.

It supplies an independent historical source for the `q`, `B-A`, and `-b` components; the DH shared secret (K) completes the second marker coordinate. The result is more specific than a numerical coincidence because the operation, modulus, centres, and their order all have source context.

## Strongest objection and scope

The variable assignment `[-q,B-A,-b]` was recognized after the p28 state and p0 marker key were already known. The 2014 text names the totient function, and the square/form route selects the centres and their order, but no surviving first-party instruction explicitly labels the three totient residues as `-q`, `B-A`, and `-b`. This is therefore **retrospective cross-source corroboration**, not a blind prediction or proof of creator intent.

The bridge does not recover new LP2 plaintext, establish a general cipher, or validate the complete p0 13-coordinate key schedule. It should be used as a candidate source for the three marker-key atoms, not as permission to invent further per-page totient transforms.

## Decisive follow-up

- Ask the p28 DH reconstruction author to challenge the `q=4` typing and the mapping from the ordered centre residues to the DH variables.
- Seek a first-party instruction that makes the centre-to-state assignment prospective rather than retrospective.
- Test any proposed continuation on an independent source-derived key or marker without choosing the target after seeing the output.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_2014_square_center_totient_dh23_bridge_sft.cjs
```

The SFT computes all three totients, checks the unique matching centre order, verifies the typed DH residue triple, and reconstructs the exact p0 marker key.

Related source records:

- [2014 Stage 10 square/CGI source boundary](2014-stage10-squares-cgi-source-boundary.md)
- [p28 DH line6 source reconstruction](lp2-p28-dh-line6-source-reconstruction.md)
- [Authoritative p0 marker and 2014 centre synthesis](../results/README.md)
