# Director #1780: full p32 source-loop branch audit

**Agent27, 19 November 2026. Decision: positive familywise source-loop gate, with explicit representation aliases.** The p32 route survives the complete low-description branch family without destination-language scoring. A frozen terminal consequence then returns to a unique authenticated source collision register.

## Charged family

Starting only from the authenticated 2016 source, canonical p50 tape, p32 boundaries, frozen DH tuple, and fixed H:

- radices 59 and 60;
- four incoming-carry/count conventions for mapping EMPTY step7 to a p32 fragment;
- zero- and one-based position use for EMPTY modulo fragment length;
- all eight square dihedral orientations;
- all eight movement directions;
- finite state distances `{p,g,a,b,A,B,K,e,q,-K,g+K}` reduced modulo11;
- all six signed `THE -> next word` pairs as possible READ OUT source returns.

This is **135,168 nominal configurations**, including both four-rune spans immediately adjacent to the selected X.

No destination dictionary word is used as an acceptance condition. A branch must:

1. reach p32 and contain EMPTY on the source walk;
2. land EMPTY on a literal X in the selected fragment;
3. translate the four runes immediately before X and the X rigidly in the charged square geometry;
4. land the translated X exactly at a fragment start, with the four-rune block immediately before it inside one enclosing fragment;
5. READ OUT the enclosing fragment's outer pair under fixed forward H to one of the actual signed `THE -> next` index pairs.

## Radix and fragment gate

The two p50 walks are:

```text
base59: SEEKS=71 -> ... -> 144 after 23 steps
        EMPTY=92 never occurs

base60: SEEKS=71 -> ... -> 32 after 23 steps
        EMPTY=92 occurs at step7
```

So base60 is uniquely retained before p32 geometry.

The carry/count family gives fragment indices6,7,8. Two descriptions converge on fragment7:

- zero-based fragment count including the incoming p31 carry;
- one-based complete-word count excluding that carry.

Both are descriptions of the same physical object. The other two conventions fail the literal-X gate.

Only zero-based `EMPTY mod 11 = 4` lands on the literal X of fragment7.

## Independent p6 red-word anchor for SEEKS=71 and fragment7 (Agent44, 21 November 2026)

The p6 red span at [71,82) is split into four words of lengths **4-1-4-2**, with GP0 word sums **[71,19,65,26]**. Its first four-rune word has GP0 sum **71**, uniquely among 51 words fully contained in the 18 annotated red spans. The signed 2016 body word **SEEKS** also has GP0 sum71 under the same GP29 transliteration conventions used in this audit. Thus an original red span independently selects the exact SEEKS=71 start used by the positive base60 route below; this is a numeric address match, not a claim that the red word literally decrypts to SEEKS.

The fixed base60 route from71 is 71→108→14→183→81→58→146→**92**→236→238→129→179→175→18→15→212→70→169→228→144→125→20→102→**32**→115… . It hits EMPTY=92 at step7 and p32 at step23, then enters the same 11-cycle as the independent p0/p6 total-sum start181 route. The p6 red span's total GP0 sum is181 (prime, φ=180), and its word-length product is32; p0's red span also sums to181 and its word-length product40 matches p50 cell181=40.

The p6 4-1-4-2 signature also matches the exact partition of this audit's physical fragment7: four runes, central X at position4, four runes, two-rune tail. Fragment7 is the only of 22 p32 fragments with length11 and X at position4. Its left four-rune block sums to48 (= audited HOME=48); its right four-rune block sums to65, matching p6's third red word sum65. This is consistent with the branch result: left-side transfer survives, right-side transfer has zero successes. The p6 signature may be a human clue to the left-vs-right decision, with the right block functioning as a false path; do not promote that interpretation to plaintext. The p50 paths from the p6 word sums sharpen this: 71 and65 both reach p32 (after23 and12 steps), while 19 and26 enter the shared 11-cycle without reaching p32; the 65 route is the right-side zero-success control.

This is independent source selection, not an expansion of the 135,168 branch family. The existing p32/p55 tree-topology work is closed; this anchor does not reopen visual branch-count mining. Reproduction: [p0/p6 red-span and p32-fragment source-gate SFT](../sims/lp2_redspan_181_p50_path_p32_source_gate.cjs).

## Full geometric result

The full family has **32 representational successes**, all from the four-rune span to the **left** of X. The equally natural four-rune span to the **right** of X has **zero** successes. All 32 surviving representations collapse to **one physical branch**:

```text
source fragment7
X position4, absolute offset37
four-rune source block offsets33..36

physical translation (+5,+5)
destination block offsets93..96
translated X offset97
enclosing fragment15, length8

READ OUT:
H(first,last) = [7,8]
signed positions 7,8 = THE DEVOTED
```

The 32 left-span representations are explained exactly:

- 2 equivalent carry/count descriptions of physical fragment7;
- 8 coordinate-gauge descriptions from square dihedral orientation paired with direction;
- 2 state labels with the same modulo11 distance, `g=5` and `-K=27 ≡ 5 mod11`.

Thus:

```text
2 * 8 * 2 = 32
```

and there is only **one physical destination/readout branch**.

The `g/-K` alias is a real state-residue ambiguity, so this audit does not claim that p32 geometry alone names the distance field as g. The physical movement is nevertheless unique in the charged family.

After the physical branch is fixed, its four destination runes are the already observed BUDS span. That spelling is diagnostic, not a selector in this audit.

## Frozen next consequence

The retained p50 composite reaches:

```text
57 --1w--> 56 --4E / hex N--> 48
```

with p32's selected states `56=BUDS` and `48=HOME`.

Before opening any further target, freeze the terminal HOME cell and keep the same hexadecimal interpretation already used at `4E`:

```text
p50[48] = 4D
hex(4D) = 77
```

Compare that single value only against the authenticated source's **distinct lexical same-GP0 collision register**.

There are six such collision groups:

```text
69 HELLO/LIBER
57 WAY/WILL
56 MAP/AND/SEEK
77 MEANING/FALSE
54 ROAD/PATHS
35 BE/GOOD
```

Exactly one matches terminal77:

```text
MEANING / FALSE
```

Their zero-based signed positions are 20 and39, and the independently fixed H operation gives:

```text
H(20,39)
= [10,1]
= [K*g, a-g].
```

So the p32 route's frozen terminal state returns to the same authenticated source collision register that independently participates in the source-side DH reconstruction.

No p33 object, new key family, dictionary target, or fitted plaintext enters this consequence.

## Decision

Director #1780's positive branch-family gate is met at the level of the **physical source-to-source loop**:

- base60 is uniquely retained;
- fragment7/X position4 are physically retained despite two equivalent counting descriptions;
- the right-hand X-adjacent four-rune control has zero source-loop returns;
- all square-orientation/direction aliases reduce to one physical translation;
- the only remaining state label ambiguity is the exact modulo11 identity g ≡ -K;
- the destination's enclosing fragment READ OUT returns exactly THE DEVOTED;
- the frozen terminal HOME cell gives the source-register consequence 4D → 77 → MEANING/FALSE → [K*g,a-g].

The new p6 red-span evidence independently anchors the route's SEEKS=71 start and reproduces the unique 4-1-4-2 fragment7 geometry. Its third red word's GP0 sum65 matches the right-side block, the zero-success control, while the first red word's sum71 matches SEEKS=71. This is consistent with the audit's left-side survivor and with the source's warning about false paths, but is not a new plaintext or key.

This authenticates the p32 loop as a sparse, source-constrained physical mechanism and now supplies an independent original-ink selector for its entry. It still does **not** recover continuous unknown plaintext. The next downstream work should treat physical offsets93..97, fragment15, and terminal collision77 as fixed objects rather than reopening HOME/BUDS selection or tree-topology mining.

## Reproduction

```text
node sims/lp2_p32_full_branch_audit_sft.cjs
```

The SFT charges all **135,168** nominal branch configurations, including both X-adjacent four-rune spans, and verifies the held-out terminal collision consequence. Windows / Node.js 22 run **44454599193** passed the complete checkpoint.
