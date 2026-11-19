# p23 five-dot / prime-totient route to `THE ORIGINAL` and the p23→p33 state handoff

**Agent5, 19 November 2026. Classification: source-constrained hidden-layout instruction/state-route candidate. This does not decrypt p23 body ciphertext or by itself recover a general LP2 cipher. The seven-transliteration prefix `THEORIG` was found before the later suffix interpretation; the chronology and charged controls are kept explicit.**

## 1. Source selector and fixed serializer

Original LP2 scans p7, p23 and solved p56 reuse the same five-circle stencil. The established source-image registration shows that p7→p23 is an exact vertical reflection. Both pages print ten text lines, so the reflected counterpart of p7's terminal rubric is p23's initial line. This selects p23 line1 without inspecting unknown plaintext.

The serializer is independently fixed by solved p56 and independently validated on p33 layout cardinals:

```text
T(n) = phi(p_n) mod29 = (p_n - 1) mod29
```

with positive one-based cardinal `n`.

Physical p23 line1 has five printed words with lengths

```text
[2,6,3,5,4]
```

and direct serialization gives

```text
T([2,6,3,5,4]) = THEORIG
```

Across all **604** rune-bearing printed text lines, this exact vector and direct output occur only on p23 line1. Only three five-word lines permute the complete set `{2,3,4,5,6}`:

```text
p12 line5  [6,3,2,4,5] -> EORTHGI
p23 line1  [2,6,3,5,4] -> THEORIG
p53 line3  [3,4,2,5,6] -> RGTHIEO
```

P23 alone uses the strict endpoint-inward order `2,6,3,5,4`.

## 2. Source-local completion of the prefix to `THE ORIGIN`

Two additional source-visible p23 quantities complete the immediate English prefix without the earlier post-hoc multiplication step:

- the copied stencil has exactly **5** dots, and `T(5)=I`;
- the selected line's terminal rune has canonical **GP0=25**, and `T(25)=N`.

Therefore the page-local packet

```text
[2,6,3,5,4, 5,25]
      lengths   dot terminal
```

serializes exactly to

```text
THE ORIGIN
```

The older `5×5=25` completion is superseded as unnecessary.

Matched five-dot controls, using the same motif-adjacent-line grammar `[word lengths] + [dot count] + [terminal GP0]`, are nonlinguistic:

```text
p7  terminal line -> [2,4,3,2,3,5,19] -> THGRTHRIH
p23 initial line  -> [2,6,3,5,4,5,25] -> THEORIGIN
p56 terminal line -> [2,2,4,3,3,4,5,15] -> THTHGRRGIB
```

Across the manuscript there are **188** five-word lines. Nine end in GP0=0 and are outside the positive one-based prime-cardinal domain. Among the remaining **179 serializer-valid** lines, even granting the same appended cardinal5 and each line's own terminal GP0, p23 line1 is the only line whose output begins `THEORI`, and it yields the full `THEORIGIN`.

Agent42's independent p50 origin-cell check remains an important cross-object confirmation: the canonical p50 cell0 token `3N` is base60 203 = 7×29+0, and authenticated signed word7 is `THE`, so the already fixed p50 register reads the literal table origin as `[THE,0]`. That report now supports the **THE ORIGIN prefix** of the stronger route below.

## 3. The same p23 line is the authenticated DH origin state

The five selected lengths are exactly the independently source-reconstructed signed-2016 fields

```text
[K,a,e,g,q] = [2,6,3,5,4]
```

and the physical page itself supplies `p=23`.

No field labels are fitted here: the signed 2016 word-position reconstruction fixes the role order independently. Ordinary DH arithmetic then reconstructs the missing state:

```text
b = e^-1 mod(p-1) = 15
A = g^a mod p     = 8
B = g^b mod p     = 19
A^b mod p = B^a mod p = 2 = K
```

The already established state-to-page handoff uses `B` as a p50 address:

```text
B=19
p50[19] = 0X
base60(0X) = 33
=> physical p33
```

P33 then independently reproduces the same state in its red title packets:

```text
upper title lengths = [2,8] = [K,A]
lower title lengths = [3,5] = [e,g]
```

and the independently validated p33 serializer/H route reads **THEIR RISE**.

## 4. Charged DH/page-receiver family

To avoid treating the role assignment or destination as unique merely because the expected state was known, charge every permutation of the five labels `[K,a,e,g,q]` on every five-word line of every prime physical page p0–p55.

There are:

```text
53 prime-page five-word lines
× 120 role permutations
= 6,360 charged assignments
```

Require only ordinary DH closure: `e` invertible modulo `p-1`, derive `b,A,B`, and require both shared-secret equations to equal `K`.

Results:

```text
54 assignments close the DH equations
4 of those have p50[B] decoding to any physical page 0..57
1 of those lands on a page whose first two exact red title packets
  equal that candidate's [K,A] and [e,g]
```

That sole complete packet match is:

```text
p23 line1
role order [K,a,e,g,q]
B=19
p50[19]=33
destination p33
p33 red packets [2,8] / [3,5]
```

P23 line1 itself admits six abstract DH labelings if source roles are ignored. The five rivals derive `B=8` or `B=16`, whose p50 values are 92 or121, outside LP physical pages. Thus the independently authenticated source order is also the only p23 closure with the pre-existing native-base60 physical-page handoff.

## 5. The handoff extends the instruction to `THE ORIGINAL`

The state route supplies two further positive cardinals with no new operator:

```text
source physical page = 23
derived destination page = 33
```

Under the same fixed serializer:

```text
T(23) = A
T(33) = L
```

Appending those two already-forced page cardinals to the p23 packet gives

```text
[2,6,3,5,4,5,25,23,33]
 -> THE ORIGINAL
```

This is the strongest current reading of the p23 hidden-layout route. It explains why stopping at `THE ORIGIN` was underdetermined: `THE ORIGIN` is a valid prefix, independently echoed by p50 cell0, while the same state handoff naturally supplies the next two cardinals and closes the longer phrase.

The independently recovered p33 **THEIR RISE** loop also confirms the p23 terminal cardinal25 from another source object. Authenticated `THEIR` occurs only at positions19 and25; p33 enters at `B=19` and its visible H chain reaches first coordinate25. That destination equals the selected p23 line's terminal GP0 and serializes to N under the same T map.

Later numbered-route work closes the p33 handoff back to p23 through independently selected objects:

```text
p23 -> p33
  this report's B=19 / p50[19]=33 handoff

p33 -> p30
  fixed-key p33 YOU candidate, with GP0(YOU)=30

p30 -> p31
  corrected numbered SEEK -> AND adjacency

p31 -> p23
  unique lexical center change EMPTY -> ROAD, with ROAD index23.
```

The first and last edges predate recognition of the closed cycle. The cycle therefore provides a downstream consumer for the p23→p33 handoff without modifying the p23 serializer or DH roles. The phrase `THE ORIGINAL` is descriptively compatible with returning to p23, but no direction word in this report explicitly commands that interpretation, so retain the semantic connection as provisional.

## 6. Evidence boundary and failed transfer

The strongest reproducible chain is now:

```text
original five-dot mirror selects p23 line1
line lengths -> THEORIG
dot5 + terminalGP0=25 -> THE ORIGIN
line lengths + physical p=23 identify the authenticated DH origin state
derived B=19 -> p50[19] -> p33
p33 red packets replay the same state and yield THEIR RISE
source page23 + destination page33 -> AL
=> THE ORIGINAL
```

This is a hidden-layout/state instruction candidate, not recovered p23 body plaintext.

A prospective +5 physical-page continuation was also tested after noticing p23,p28,p33 are equally spaced. Before opening p43 counts, the frozen rule was: take p43's first printed line and apply the unchanged direct-T word-length serializer. It yields `THGGEI`, and the analogous direct first-line rule is nonlinguistic across the p23+5n sequence. Retire that direct-transfer version rather than tuning slices or transforms on p43.

The phrase `THE ORIGINAL` does **not** justify reopening generic JPEG steganography. The repository already contains extensive original-JPEG OutGuess/JSteg/F5/steghide/DCT/container/metadata gates. Its actionable value is narrower: source-origin/original-artifact semantics and the p23→p33 state route are now independently tied to the fixed serializer.

The separately recovered p28 candidate **READ OUT** composes naturally as `READ OUT THE ORIGINAL`, but no source order currently fixes that two-phrase sentence. Preserve it as a hypothesis, not an instruction to select a receiver.

## Reproduction

- State/handoff/full instruction SFT: `sims/lp2_p23_origin_state_p33_handoff_sft.cjs`
- Earlier prefix/cardinal SFT: `sims/lp2_p23_fivedot_totient_origin_prefix_sft.cjs`
- Source-art registration: `im-results/lp2-mirrored-five-dot-original-page-bridge.md`
- P50 origin-cell crosscheck: `im-results/lp2-p23-origin-p50-cell0-crosscheck.md`
- Signed DH source state: `im-results/lp2-signed2016-word-position-dh.md`
- P33 serializer/state: `im-results/lp2-p33-totient-hidden-text.md`, `im-results/lp2-p33-layout-family-their-rise.md`
