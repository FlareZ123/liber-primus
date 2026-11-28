# P6 block1 state shell selects p32–p35 receiver start residues

**Agent15, 28 November 2026. Classification: target-blind receiver-selection compression for the first q-sized p6 schedule block. The residue shell was recognized after the four local receiver starts were already known, so this is a finite post-discovery mechanism result, not a blind plaintext discovery or discovery-wide probability. It uses authenticated source word lengths and pre-existing receiver classes, but no fitted local key or target rune value.**

## Upstream facts

P6's source-only schedule partitions the authenticated signed tail as:

~~~text
[q=4] YOU WILL BE FOUND
[1]   GOOD
[q=4] LUCK BEWARE FALSE PATHS
[K=2] VERIFY OPENPGP
~~~

The first block therefore fixes target arities 3,4,2,5 from the authenticated GP spellings before opening the target runes.

The p6 title has printed lengths [4,1,4,2]=[q,1,q,K]. Under the repository's frozen H4 orientation:

~~~text
H4([4,1,4,2]) = [2,26,5,6] = [K,-e,g,a].
~~~

Its final printed title word is W4=[14,12]=[-b,aK].

Independent earlier work had already selected these manuscript-side receivers:

~~~text
p32 first-full-stop terminal word, start30, length3
p33 WILL local receiver,         start132, length4
p34 THEIR-RISE BE receiver,      start4,   length2
p35 unique state-shaped 2+3 packet,
                                     start25, total length5
~~~

The p32 start30 correction matters: the consolidated corridor table had drifted to a stale start120 description even though the source-selected first-full-stop result is offsets30..32.

## Receiver residue shell

The four independently selected starts have residues:

~~~text
[30,132,4,25] mod29 = [1,16,4,25].
~~~

Applying fixed H4 gives:

~~~text
H4([1,16,4,25]) = [5,12,20,26] = [g,aK,qg,-e].
~~~

Equivalently, the visible p6 state predicts the receiver residues without target rune values:

~~~text
H4^-1([g,aK,qg,-e]) = [1,16,4,25].
~~~

Applying only the predicted residue, authenticated source arity, and the already established receiver type gives:

| Page | Source word | Required receiver type | Predicted residue | Target-blind hits |
| --- | --- | --- | ---: | --- |
| p32 | YOU | complete 3-rune word | 1 | starts 1, 30 |
| p33 | WILL | complete 4-rune word | 16 | start132 only |
| p34 | BE | complete 2-rune word | 4 | start4 only |
| p35 | FOUND | adjacent 2+3 packet | 25 | start25 only |

The p32 ambiguity is resolved independently: the pre-existing source rule selects the complete word ending at the first printed full stop, zero-based offset32, hence start30. No YOU rune value is used for this tie-break.

Thus the block-level receiver rule reconstructs the complete existing start vector [30,132,4,25].

## Finite post-discovery charge

The exact shell was noticed after the receiver vector, so charge a wider p6-visible family.

Let:

~~~text
L = H4(p6 printed title lengths) = [K,-e,g,a] = [2,26,5,6]
W4 = [-b,aK] = [14,12]
M = {q,1,K} = {4,1,2}.
~~~

Enumerate:

1. x: any coordinate of L (4 choices);
2. z: a different coordinate of L (3 choices);
3. y: either rune of W4 (2 choices);
4. m: any printed title length role in M (3 choices);
5. all 4! coordinate permutations of the multiset [x,y,m*x,z].

This is 4×3×2×3×24 = **1,728 labeled constructions**, collapsing to **1,404 distinct numeric shells**.

For every distinct shell, apply frozen H4 inverse to obtain four residues. Require only that p32 has a complete three-rune word at residue r0, p33 a complete four-rune word at r1, p34 a complete two-rune word at r2, and p35 an adjacent 2+3 packet at r3.

Exactly **1/1,404 distinct shells** supports all four receiver classes:

~~~text
shell    [5,12,20,26] = [g,aK,qg,-e]
residues [1,16,4,25]
hits     p32 {1,30}; p33 {132}; p34 {4}; p35 {25}
~~~

It is also one labeled construction:

~~~text
x = L[2] = g
y = W4[1] = aK
m = q
z = L[1] = -e
order = [x,y,m*x,z].
~~~

The earlier first-full-stop selector resolves the remaining p32 two-way ambiguity to start30.

## Consequence for the corridor

This closes the main receiver-selection asymmetry between the two q-sized blocks.

- Block1 p32–p35 now has the p6 shell [g,aK,qg,-e] -> H4^-1 -> residue grammar documented here.
- Block3 p37–p40 independently has the p6 W3/W4 shell [17,12,15,14] -> H4^-1 -> [1,28,16,13], with p40's independent address71 resolving its final ambiguity.

The receiver story is therefore substantially more uniform than the prior page-by-page list suggested. The remaining authorship-level gap is primarily the **ordered key serializer**: why each selected receiver gets its particular value-changing key. Exact subtraction against a known source word still does not authenticate plaintext.

## Evidence boundary

The four receiver starts predate this shell. The family itself was designed after observing the vector, so 1/1,404 is a bounded family count rather than a discovery-wide significance claim.

P35's adjacent 2+3 type is not inferred from FOUND; its raw five-rune H5 state packet was independently selected before target insertion. P32's full-stop tie-break is likewise independently source-visible.

No unknown plaintext is established by this result.

## Reproduction

Run:

~~~text
node sims/lp2_p6_block1_receiver_residue_sft.cjs
~~~

The SFT rebuilds canonical cross-page word segmentation, the signed-source GP lengths, the p6 title state, the four receiver classes, all 1,728 labeled / 1,404 distinct shells, and the unique supporting shell.
