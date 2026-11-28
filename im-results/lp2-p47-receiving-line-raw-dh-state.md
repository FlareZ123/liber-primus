# P47 receiving line directly serializes the complete DH23 state

**Agent8, 28 November 2026. Classification: source-selected raw state serialization / navigation evidence; no unknown plaintext, body key, cipher inverse, or destination.**

## Decision

The existing p47 route fixes one source object before this result is read:

```text
cell115 literal 47
  -> physical p47
  -> page-local group47
  -> rune offsets206..211
  -> [19,1,10,27,11,3]
```

Agent7 showed that this selected six-rune group visibly crosses the original printed line9→line10 wrap as

```text
line9   [19]
line10  [1,10,27,11,3]
split   1 | 5
```

and that the selected group alone gives `a=6`, `g=5`, `B=19`, and `p=23`; ordinary DH closure was then used to recover `b=15,A=8,K=2,e=3,q=4`.

Opening **the complete receiving printed line10**, with no new page or word selection, removes that closure dependency. Its six visible line fragments are:

```text
[1,10,27,11,3]
[15,12,25,12,21,4]
[20,12,28]
[16,3,11]
[3,21,13]
[4,8]
```

The first fragment is the continuation of the already selected group47. The last fragment continues onto line11. The four middle groups are complete on line10. Reading only elementary visible descriptors gives:

```text
fragment lengths  = [5,6,3,3,3,2]
                  = [g,a,e,e,e,K]

GP0 sums mod29    = [23,2,2,1,8,12]
                  = [p,K,K,1,A,aK]

GP0 products mod29= [7,23,21,6,7,3]
                  = [g+K,p,-A,a,g+K,e].
```

The first complete group on line10 is `[15,12,25,12,21,4]`, so its printed endpoints directly give

```text
first = 15 = b
last  =  4 = q.
```

Together with the isolated line9 singleton `19=B`, the selected wrap plus its source-fixed receiving line therefore exposes the complete state **without modular exponentiation selecting any missing field**:

```text
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4).
```

The standard DH identities are now validation rather than derivation:

```text
5^6  mod23 = 8
5^15 mod23 = 19
19^6 mod23 = 2
15*3 mod22 = 1
q=e+1=4.
```

This materially strengthens the p47 source object: the previously inferred fields `b/A/K/e/q` are all present as direct low-complexity descriptors on the immediately selected receiving line.

## Exact printed-line charge

Charge the source-visible framing before using the descriptor values:

- exactly six visible rune fragments on a printed line;
- the first is a carry from the preceding line;
- the last carries into the following line;
- the four middle groups are complete on the line.

Across unknown physical p0–p55 there are **594** printed rune lines and **89** lines in this exact framing class.

Within those 89 lines:

```text
length vector [5,6,3,3,3,2]                 -> p47 line10 only
+ sum vector [23,2,2,1,8,12]                -> p47 line10 only
+ product vector [7,23,21,6,7,3]            -> p47 line10 only
+ first complete-group endpoints [15,4]      -> p47 line10 only
```

Thus the line is already a singleton under the **length vector alone** inside the matched framing class. The sums, products and endpoints are holdout structure on that same source-fixed line, not parameters used to choose it.

## Immediate-successor control

The first complete group after the selected group47 is the six-rune group at p47 offset212:

```text
[15,12,25,12,21,4]
length=6=a
sum=2=K
product=23=p
first=15=b
last=4=q.
```

Across the canonical **2,864** globally complete unknown-page words, **251** have length6. Exactly two six-rune words have `(sum,product)=(2,23)`: p28 offset26 and p47 offset212. Requiring the independently reconstructed state endpoints `(first,last)=(b,q)=(15,4)` leaves **p47 offset212 only**.

The successor is not chosen by this census; adjacency to the already selected group47 fixes it first.

## Evidence boundary

This observation was found after inspecting the p47 receiving-line context, so the state-expression labels are not a blind discovery probability. The exact line/source censuses prevent a free search from being hidden in the presentation, but they do not establish authorial intent by themselves.

What changes is narrower and causal: the current p47 route no longer needs modular DH closure to manufacture five unseen fields. A human following the already selected group47 can read the complete worked-DH state from the immediately visible line-wrap geometry and raw descriptors, then use the DH equations as checks.

What remains missing is unchanged: a first-party operation that consumes this state as a reversible rune-level decoder or selects an unknown ciphertext receiver. Do not turn the line descriptors into another unconstrained periodic key.

Related upstream result: [p47 line-wrap → p23 state line](lp2-p47-linewrap-p23-state-line.md).

## Reproduction

Run:

```text
node sims/lp2_p47_receiving_line_raw_dh_state_sft.cjs
```

The SFT reads only the canonical transcription/corpus, reconstructs the selected p47 group and receiving line, derives the complete state directly, verifies the DH equations, exhausts the 89-line matched framing class, and charges the immediate six-rune successor across all 251 complete six-rune unknown-page words.
