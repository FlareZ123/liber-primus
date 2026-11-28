# P6 block1 artifact geometry selects full p32–p35 base29 receiver addresses

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

At the residue-only stage p32 has a genuine two-way ambiguity. The pre-existing first-full-stop rule independently selects start30, but the block now has a second p6-only address coordinate that resolves the same ambiguity without that rule; see the base29 quotient section below.

## Direct p6 artifact serializer and finite charge

The state labels above are not needed to construct the successful shell. Each coordinate has a concrete, typed source on p6 itself:

~~~text
H4(title lengths)[2]                =  5
terminal rune of terminal word W4  = 12
unique black width appearing
  exactly once above and below
  the red title                     = 20
GP0(W4) mod29                       = 26
~~~

Thus the source object directly exposes

~~~text
[5,12,20,26],
~~~

and the already frozen H4 inverse converts it to the receiver residues

~~~text
[1,16,4,25].
~~~

This is a more literal human-scale route than the first algebraic description `[g,aK,qg,-e]`: the four numbers are read from title-length geometry, the terminal red rune, physical black-line width, and the terminal red word sum.

Because this typed readout was recognized after the receiver vector, charge the source choices broadly rather than holding the successful coordinates fixed. Let:

- `A` be any of the four coordinates of `H4([4,1,4,2])=[2,26,5,6]`;
- `B` be either rune of the terminal title word `W4=[14,12]`;
- `C` be either black line width that occurs on both sides of the red title, `{20,24}`;
- `D` be any title-word GP0 modulo29, `{13,19,7,26}`;
- and allow all 24 coordinate orders of `[A,B,C,D]`.

This gives **1,536 labeled constructions**, collapsing to **1,488 distinct numeric shells**. For each distinct shell, apply the frozen H4 inverse and require only the four pre-existing receiver classes:

- p32: a complete three-rune word at residue r0;
- p33: a complete four-rune word at residue r1;
- p34: a complete two-rune word at residue r2;
- p35: an adjacent 2+3 packet at residue r3.

Exactly **1/1,488 distinct shells** supports all four classes:

~~~text
shell    [5,12,20,26]
residues [1,16,4,25]
hits     p32 {1,30}; p33 {132}; p34 {4}; p35 {25}
~~~

The successful typed choices are also the source-most constrained members of their categories: 20 is the only shared width that occurs exactly once on each side; 12 is the marked terminal rune; 26 is the sum of that same terminal word. The earlier first-full-stop selector independently resolves the p32 two-way ambiguity to start30.

For audit continuity, the earlier state-expression discovery family remains reproducible: 1,728 labeled / 1,404 distinct shells built from transformed title-length fields, W4, and printed length multipliers also leaves the same sole supporting shell. The typed artifact charge above is the stronger interpretation because it removes the invented product coordinate from the causal route.

## Base29 quotient shell closes the complete block1 addresses

Write each local receiver start as

~~~text
start = 29 * quotient + residue.
~~~

For the selected vector:

~~~text
[30,132,4,25]
= 29 * [1,4,0,0] + [1,16,4,25].
~~~

The quotient vector is also a literal p6 title-length construction. Its H4 image is:

~~~text
H4([1,4,0,0]) = [1,4,4,1] = [1,q,q,1].
~~~

That shell is the adjacent printed title-length pair `[1,q]` mirrored around its boundary:

~~~text
title lengths [q,1,q,K]
middle adjacent pair [1,q]
mirror             -> [1,q,q,1]
H4^-1              -> [1,q,0,0].
~~~

This predicts the four base29 quotients. In particular, the two p32 residue-compatible starts have:

~~~text
start1  -> quotient0
start30 -> quotient1,
~~~

so only start30 satisfies the p6 quotient vector. The earlier first-full-stop selector is now independent corroboration rather than a dependency.

### Finite quotient and joint address charge

Because the mirrored-pair construction was recognized after the receiver vector, charge every adjacent title-length pair and both orientations:

~~~text
[q,1], [1,q], [q,K]
and their reversals.
~~~

Mirroring each oriented pair as `[x,y,y,x]` and applying H4 inverse gives **6 labeled / 4 distinct** quotient vectors:

~~~text
[q,1,0,0]
[1,q,0,0]
[q,K,0,0]
[K,q,0,0].
~~~

Cross those four distinct quotient vectors with all **1,488 distinct** typed-artifact residue shells above:

~~~text
1,488 * 4 = 5,952 distinct p6-only address grammars.
~~~

For each joint grammar, require the authenticated source arity / pre-existing receiver type and require both predicted base29 coordinates of every receiver. Exactly **1/5,952** supports a complete four-page receiver vector:

~~~text
residue shell [5,12,20,26]
residues      [1,16,4,25]

quotient shell [1,q,q,1]
quotients      [1,4,0,0]

starts         [30,132,4,25].
~~~

The successful numeric quotient shell has two equivalent printed-pair labels because `[1,q]` occurs as W1/W2 reversed and W2/W3 forward. They are one numeric address rule.

This remains a post-discovery finite-family result, not a discovery-wide significance estimate.

## Consequence for the corridor

This closes the main receiver-selection asymmetry between the two q-sized blocks.

- Block1 p32–p35 has the typed p6 residue shell [g,aK,qg,-e] plus the mirrored adjacent-length quotient shell [1,q,q,1], jointly selecting full starts [30,132,4,25].
- Block3 p37–p40 independently has the p6 W3/W4 residue shell plus its title/H(title) quotient splice, jointly selecting full starts [146,57,132,71].

The receiver story is therefore substantially more uniform than the prior page-by-page list suggested. The remaining authorship-level gap is primarily the **ordered key serializer**: why each selected receiver gets its particular value-changing key. Exact subtraction against a known source word still does not authenticate plaintext.

## Evidence boundary

The four receiver starts predate both address constructions. The typed residue family and mirrored-adjacent quotient family were designed after observing the vector, so 1/5,952 is a bounded joint-family count rather than a discovery-wide significance claim.

P35's adjacent 2+3 type is not inferred from FOUND; its raw five-rune H5 state packet was independently selected before target insertion. P32's full-stop endpoint is independently source-visible and now corroborates the p6 quotient prediction rather than resolving it.

No unknown plaintext is established by this result.

## Reproduction

Run:

~~~text
node sims/lp2_p6_block1_receiver_residue_sft.cjs
~~~

The SFT rebuilds canonical cross-page word segmentation, signed-source GP lengths, p6 title fields, color-separated line geometry, the four receiver classes, 1,488 distinct residue shells, the 6-labeled / 4-distinct mirrored-adjacent quotient family, and all 5,952 distinct joint address grammars. It asserts the sole joint receiver vector [30,132,4,25] and retains the earlier 1,728 / 1,404 algebraic residue family as an audit control.
