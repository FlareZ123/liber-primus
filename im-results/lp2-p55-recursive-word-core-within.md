# P55 recursive word shedding exposes WITHIN and reconstructs state

**Agent20, 19 November 2026. Classification: source-constrained held-out structural result. No unknown prose or manuscript-wide cipher is claimed.**

## Upstream selector

The p33 map independently selects physical p55 before this test:

~~~text
RISE GP0 = 47
p50[47] = 1G
base59 = 75
base60 = 76
~~~

Physical p55 is uniquely 76 runes with one incoming carry and therefore 75 locally owned runes.

The solved p57 instruction then supplies the operation:

~~~text
WE MUST SHED OUR OWN CIRCUMFERENCES.
FIND THE DIVINITY WITHIN AND EMERGE.
~~~

Earlier work removed one circumference from each complete p55 word to form a 43-rune strict interior. The test here follows the wording more literally and recursively: for every complete p55 word, repeatedly remove its first and last rune until the word either disappears or one central rune remains.

No key, phase, alphabet permutation, or language score is involved.

## Recursive word cores

P55 has 16 complete locally owned words. Repeated circumference shedding removes every even-length word and leaves the center of every odd-length word.

The five survivors, in printed word order, are:

~~~text
[1, 6, 2, 11, 18]
~~~

Three independent state relations appear in this previously unopened representation.

Their count is 5 = g. Their middle rune is 2 = K. Their raw GP0 sum is:

~~~text
1 + 6 + 2 + 11 + 18 = 38
GP0(WITHIN) = 38
~~~

Thus literal recursive shedding of the already selected p55 words exposes a five-rune object numerically typed WITHIN, exactly the word used by the independently reconstructed p33/p57 instruction FIND THE DIVINITY WITHIN.

## Fixed H map reconstructs more state

Use the already established outside-in map:

~~~text
H(x,y) = (x-y, x+y) mod 29
~~~

on the five emerged centers:

~~~text
H(1,18) = [12,19]
H(6,11) = [24,17]
center    = 2
~~~

The two H branch sums are both 36:

~~~text
12 + 24 = 36
19 + 17 = 36
~~~

The sum branch itself is [19,17] = [B,b+K], while the untouched center is K=2.

Authenticated source index36 is GOOD. The immediate significance is state reconstruction rather than a new body-plaintext claim: the recursively emerged object simultaneously carries g, K, B, b+K, and the independently selected WITHIN=38 label.

## Existing post-SHED p50 edge closes the circumference instruction

The p50 map already has the source-authenticated post-SHED base59 state. At address38:

~~~text
p50[38] = 2D
base59(2D) = 131
GP0(CIRCUMFERENCES) = 131
~~~

So the new held-out output plugs directly into a pre-existing edge:

~~~text
p55 complete words
 -> recursively SHED each word's CIRCUMFERENCE
 -> emerged cores GP0 = WITHIN38
 -> established post-SHED base59 p50 read
 -> CIRCUMFERENCES131
~~~

This gives the p57 wording a concrete, source-selected consumer without introducing another cipher family.

## Controls

### Whole-page control

Apply the same recursive word-core operation to every unknown physical page p0-p55, using complete page-local words only. P50 is the runeless numeric grid and contributes no word cores.

Only two pages have exactly five emerged centers:

~~~text
p49: [20,19,19,14,4], GP0=76
p55: [1,6,2,11,18],   GP0=38
~~~

P55 is the sole page whose recursive word cores sum to WITHIN=38.

### Sliding 16-word control

Charge every page-local contiguous 16-word window across the unknown manuscript. There are 2,039 such windows.

~~~text
windows with exactly five cores: 116
windows with core GP0=38:          6
windows also satisfying:
  H branch sums = [36,36]
  middle core = K=2:               1
~~~

The sole full hit is physical p55, starting at its first complete word.

This control was evaluated after p55 had already been selected by the independent RISE 75/76 receiver and after the recursive shedding rule was fixed by the solved p57 instruction.

## Held-out external consumer: both 36 branches land on p36 GOOD

The p55 result was committed at **05:45:03Z**, fixing both H branch sums at 36 before a separate p36 plaintext result existed in the authoritative synthesis.

At **05:45:23Z**, Agent4 independently committed a reversible decoder for p36 canonical word37. That receiver was already selected by the authenticated numbered route. Its exact operation removes the literal EMPTY center q=4 and subtracts one charged permutation of the authenticated direction-number atoms, reconstructing:

~~~text
original p36 word37 [2,22,4,1,20]
remove EMPTY center -> [2,22,1,20]
subtract [25,19,27,26]
-> [6,3,3,23]
-> GOOD
~~~

The authenticated source uses zero-based index36 for GOOD, and the established numbered route assigns that source position to project p36. Therefore each independently fixed p55 H branch now has a prospective external consumer:

~~~text
p55 recursive cores
 -> fixed H branch GP0 = 36
 -> authenticated source36 = GOOD / project p36
 -> independently committed p36 reversible receiver
 -> GOOD
~~~

Both p55 branches select the same destination. The p36 decoder uses a different ciphertext object and a different source-derived operation, so this is stronger than recognizing another state identity inside p55.

Chronology matters: the p55 output 36/36 was public in the Agent20 commit before Agent4's GOOD decoder commit. The bridge itself was recognized after both commits, so it is classified as a held-out cross-result convergence rather than a predeclared plaintext prediction.

## Evidence boundary

This result does not decrypt the five center runes as ordinary text. Their direct transliteration is nonlinguistic, and no free substitution is licensed.

The strong claim is narrower: a literal recursive execution of SHED OUR OWN CIRCUMFERENCES on the independently selected p55 word object uniquely exposes WITHIN=38, reconstructs several authenticated state values under the already fixed H map, and feeds the already established post-SHED p50 edge to CIRCUMFERENCES=131.

The next useful question is whether the emerged five-rune state object has a source-selected reversible consumer that yields unknown plaintext. Arbitrary additive keys, phases, or substitutions are outside this result.

## Reproduction

~~~text
node sims/lp2_p55_recursive_word_core_sft.cjs
~~~
