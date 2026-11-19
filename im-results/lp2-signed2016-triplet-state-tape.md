# Signed-2016 triplet state tape and OpenPGP checksum

**Agent14, 19 November 2026. Classification: new first-party state/navigation structure, with two direct-consumer hypotheses prospectively rejected.** A fixed extraction from the authenticated 2016 sentence and the original p50 table reconstructs the complete DH/state register redundantly. The final `VERIFY OPENPGP 7A35090F` identifier decomposes bytewise into the same register and supplies the only basic field absent from the triplet tape, `a=6`. The extraction was discovered while deriving the p33/p38/p40 source-local key shells, so the operator itself is retrospective. Its output is nevertheless source-only and sharply self-consistent.

## 1. Source instruction and fixed extraction

Use the authenticated words11..40:

```text
IS THE WAY
ITS WORDS ARE
THE MAP THEIR
MEANING IS THE
ROAD AND THEIR
NUMBERS ARE THE
DIRECTION SEEK AND
YOU WILL BE
FOUND GOOD LUCK
BEWARE FALSE PATHS
```

This is exactly 30 words, naturally divided into ten consecutive three-word clauses.

Decode each numbered p50 token to byte `B_i`, then uniquely decompose:

```text
B_i = 29*h_i + l_i
0 <= l_i < 29.
```

For every clause beginning at source word `i`, emit:

```text
T(i) = [l_i - h_(i+2), l_(i+1) - h_(i+2)] mod29.
```

No LP2 ciphertext enters this calculation.

The ten clause outputs are:

```text
11 IS THE WAY          -> [19,15] = [B,b]
14 ITS WORDS ARE       -> [ 5, 5] = [g,g]
17 THE MAP THEIR       -> [27,14] = [-K,-b]
20 MEANING IS THE      -> [13,19] = [b-K,B]
23 ROAD AND THEIR      -> [23,16] = [p,K-b]
26 NUMBERS ARE THE     -> [23,20] = [p,DH[p]]
29 DIRECTION SEEK AND  -> [ 4,21] = [q,p-K]
32 YOU WILL BE         -> [22,21] = [p-1,p-K]
35 FOUND GOOD LUCK     -> [ 8,23] = [A,p]
38 BEWARE FALSE PATHS  -> [15, 3] = [b,e].
```

Thus the source sentence itself exposes, with redundancy:

```text
p=23
g=5
b=15
A=8
B=19
K=2
e=3
q=4
DH[p]=20
```

plus the independent checks `-K=27`, `-b=14`, `b-K=13`, `K-b=16`, `p-K=21`, and `p-1=22`.

The only basic DH register field not yet exposed directly is `a`.

## 2. VERIFY OPENPGP completes the register

The signed message ends literally:

```text
VERIFY OpenPGP 7A35090F.
```

Interpret the supplied eight-hex identifier as four bytes and apply the same base29 quotient/remainder decomposition:

```text
0x7A = 122 = 29*4 +  6 -> [4,6]  = [q,a]
0x35 =  53 = 29*1 + 24 -> [1,24] = [a-g,-g]
0x09 =   9 = 29*0 +  9 -> [0,9]  = [0,a+e]
0x0F =  15 = 29*0 + 15 -> [0,15] = [0,b].
```

The first byte therefore verifies the tape's `q=4` and supplies:

```text
a=6.
```

The remaining bytes independently echo `a-g=1`, `-g=24`, `a+e=9`, and `b=15`.

This gives a direct first-party source for the entire register:

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4).
```

## 3. The final two source words complete an 11-pair tape

The prose has two words after the ten three-word clauses:

```text
41 VERIFY
42 OPENPGP
```

Use the first identifier byte's high coordinate `q=4` as the missing third high coordinate in the same subtraction:

```text
[l_41-q, l_42-q]
=
[26-4,28-4]
=
[22,24]
=
[p-1,-g].
```

The complete 22-value source tape is therefore:

```text
[
19,15,
5,5,
27,14,
13,19,
23,16,
23,20,
4,21,
22,21,
8,23,
15,3,
22,24
].
```

Its length is itself `p-1=22`.

## 4. Window control

Fix a prior state vocabulary consisting of:

- the nine established register fields and their negatives;
- the already named derived quantities `b-K`, `K-b`, `p-K`, `p-1`, and `DH[p]`.

This is 20 distinct GP29 residues.

There are 14 possible 30-word windows in the 43-word signed source. Split each window into ten consecutive triples and apply the same extractor. The window beginning at word11 is the **only** window whose 20 extracted coordinates all lie in this fixed state vocabulary.

This is a descriptive source-structure control. The extractor was discovered retrospectively, so this is not a calibrated chance probability.

## 5. Direct additive-key consumer was sealed and rejected

Before opening the full target line under this construction, commit:

`workplace/agent14-signed-triplet-state-tape-p28-line7-precommit.md`
at `3e107afc6f2e96c40d1210d951a52a41c0f4e48a`.

The independently selected p28 object is:

- line6 begins literal `DH` and has `p=23` runes;
- immediately following line7 has exactly `p-1=22` runes;
- the source tape has exactly22 values.

The frozen test allowed only:

```text
plaintext = p28_line7 - tape mod29.
```

Reveal:

```text
output transliteration
CIGNFSYEAMEOXNHJXWOEAAEOT
```

This is not coherent GP plaintext. The direct additive-key consumer is rejected. No rotation, sign flip, H transform or alternate line is permitted as a rescue.

## 6. Direct page/word-coordinate consumer was also sealed and rejected

The tape consists of eleven pairs, all in `0..28`, so a second source-native interpretation was frozen in:

`workplace/agent14-signed-triplet-state-tape-page-word-precommit.md`
at `d64522f97897ac8ff9a7884fb72ec4cd0b580745`.

Each pair was read exactly as:

```text
[physical page, zero-based complete printed-word index].
```

The only allowed readout labeled a selected word when its `(GP length,GP0)` uniquely identified an authenticated 2016 spelling.

All eleven coordinates exist. Exactly **zero** produce a unique authenticated source label.

The page/word-coordinate readout is therefore rejected.

## 7. Why the tape still matters

The two sealed failures remove the obvious consumers without weakening the source structure itself.

The triplet tape and OpenPGP identifier provide a much simpler source route to the register previously reconstructed through more abstract topology:

```text
signed words
-> their numbered p50 cells
-> simple base29 quotient/remainder
-> clause triplet subtraction
-> complete DH/state register
-> source-local p33/p38/p40 key-shell generator.
```

This aligns closely with the authenticated wording that the words are the map and their numbers are the direction. It also explains why the source-local shell construction for `WILL BE` and `BEWARE FALSE PATHS` lands on the same state fields.

The remaining causal question is the consumer of this 11-pair state schedule. The two simplest consumers are now ruled out. Future work should require an original artifact clue that selects a state-clock or coordinate use before applying the tape to more ciphertext.

## Reproduction

- SFT: `sims/lp2_signed2016_triplet_state_tape_sft.cjs`
- Source-shell generator: `sims/lp2_signed2016_p50_source_shell_generator_sft.cjs`
