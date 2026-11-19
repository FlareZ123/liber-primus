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

## Recursive emergence exposes VERIFY OPENPGP and ROAD

The same literal operation has a second consequence that uses only printed word lengths.

Run the shedding simultaneously over all 16 complete p55 words. Whenever a word reaches one rune, treat that center as having **emerged** and remove it from the still-hidden pool. Even words vanish. Record the number of runes still hidden after each complete shedding round.

P55 gives:

~~~text
initial hidden runes      75
after shed round1         41
after shed round2         23
after shed round3          7
after shed round4          5
after shed round5          3
after final emergence      0
~~~

This is mechanically fixed by the original word lengths. No rune values enter the count.

The first transition has a source-selected interpretation already present elsewhere in the route:

~~~text
75 = GP0(OPENPGP)
41 = authenticated signed-source index VERIFY
~~~

P55's independently selected centered e^2 H shell had already produced the whole-branch label OPENPGP=75 before this recursive word-length test. After one literal circumference shed, the still-hidden count becomes 41, giving the signed instruction **VERIFY OPENPGP** without a key search. After the second round it becomes 23, the authenticated source index **ROAD**, matching the signed message's other central navigation noun.

The tail 7,5,3 also falls inside the authenticated source index range. It is preserved as raw output only; no semantic route is assigned to those values here.

### The hidden-count tail independently reconstructs the full DH state

The unique p55 tail reproduces the state coordinates used by the independent VERIFY/OpenPGP route:

~~~text
23 = ROAD = p
 7 = g + K
 5 = EPIPHANY = g
 3 = LIES = e
 0
~~~

The successive tail drops are:

~~~text
23 - 7 = 16 = native hexadecimal stride
 7 - 5 =  2 = K
 5 - 3 =  2 = K
 3 - 0 =  3 = e
~~~

The hexadecimal stride16 is independently selected by the p41 VERIFY word's inner core [10,16,19]. It was not chosen from the p55 length sequence.

Using only the p55 tail plus the already established DH/state equations:

~~~text
p = 23
g = 5
K = 7 - 5 = 2
e = 3

b = e^-1 mod (p-1) = 15
B = g^b mod p       = 19
B^a mod p = K       -> unique a = 6
A = g^a mod p       = 8
q = e + 1           = 4
~~~

This reconstructs the complete nine-field state:

~~~text
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4)
~~~

and every field returns to the independently authenticated 2016 source role:

~~~text
ROAD23    = p
EPIPHANY5 = g
SEEKS6    = a
WORDS15   = b
DEVOTED8  = A
THEIR19   = B
PATH2     = K
LIES3     = e
EMPTY4    = q
~~~

Thus the p55 word-length shedding route independently reconstructs the same full state previously obtained from the OpenPGP key-ID modulus ladder. The two routes use different original objects: one uses p55 printed word lengths, the other uses the authenticated key ID plus the numbered VERIFY receiver.

Of the two manuscript windows with the prefix 75 -> 41 -> 23, the other is physical p35 word14 with tail 9 -> 3 -> 0. Only p55 continues through 7 -> 5 -> 3 -> 0, so the fixed state tail distinguishes the p55 route without another target choice.

### Parity partition gives both numerical identities of OPENPGP

The same 16 original word lengths partition naturally under the recursive operation:

~~~text
total length of all complete words = 75
sum of even-word lengths           = 42
sum of odd-word lengths            = 33
~~~

The first two are the two independently used numerical identities of the authenticated word OPENPGP:

~~~text
GP0(OPENPGP)             = 75
signed source index OPENPGP = 42
~~~

The complementary odd-length total is source index33 = WILL, the independently active p33 numbered-route label. This is structural corroboration; it is not used to fit the recursive operation.

### Manuscript-wide length control

Charge the same simultaneous emergence process over all 2,039 page-local contiguous 16-word windows:

~~~text
initial total75:                         76
prefix 75 -> 41:                         18
prefix 75 -> 41 -> 23:                    2
full 75 -> 41 -> 23 -> 7 -> 5 -> 3 -> 0: 1
total75 plus even-length sum42:            4
full sequence plus emerged-core GP0=38:    1
~~~

The sole full sequence is physical p55 starting at its first complete word. It is also the sole full-sequence window whose final five emerged cores sum to WITHIN=38.

## The final surviving word recovers THE ROAD AND

The recursive count route itself selects a smaller ciphertext object before any language scoring.

After the hidden count reaches source/state ROAD=23 and the next shed is performed, every other active word has vanished or emitted its center. One seven-rune core remains, inside original p55 word7:

~~~text
[14,10,19,1,5,13,8]
~~~

Continue the already fixed outside-in H operation while literally shedding this last word's three remaining circumferences:

~~~text
H(14,8)  = [6,22]
H(10,13) = [26,23]
H(19,5)  = [14,24]
center    = 1
~~~

The H sum branch is therefore:

~~~text
[22,23,24]
~~~

Under the authenticated zero-based signed-source numbering fixed elsewhere, those values are the contiguous words:

~~~text
22 THE
23 ROAD
24 AND
~~~

So the independently selected p55 object yields the exact source fragment:

~~~text
THE ROAD AND
~~~

This is a direct ciphertext-to-source-word readout under two operations already fixed before the phrase was inspected: literal circumference shedding from solved p57 and the established outside-in H map.

### Complete branch and window charge

Charge every page-local contiguous 16-word window in the unknown manuscript. Whenever recursive shedding leaves exactly one active word for at least three consecutive paired layers, read both fixed H branches over each three-layer run.

Across all 2,039 windows there are only 49 such three-layer single-survivor sites.

~~~text
ascending consecutive triples on H sum branch:        1
ascending consecutive triples on H difference branch: 0
ascending consecutive triples on either branch:        1
exact [22,23,24] on H sum branch:                      1
exact [22,23,24] on H difference branch:               0
~~~

The sole consecutive triple is physical p55 word1's window, on original p55 word7 at recursive depths3–5. Its difference branch is [6,26,14], which is not consecutive.

This familywise control does not choose THE/ROAD/AND as targets first. It asks whether either fixed H branch forms any ascending three-step source-index run; the only such run is the p55 sum branch, and it happens to be exactly 22→23→24.

The remaining center value1 is preserved as raw output. A separate source-selected rule is required before using it to extend the phrase.

## AND24 directs to a new p24 THE WAY receiver

The newly recovered source fragment ends with authenticated zero-based index24, AND. The repository's already established numbered diagonal uses a source index as the physical page and its one-based ordinal as the canonical word number. Apply that unchanged rule to AND24:

~~~text
source index     24 = AND
physical page    p24
canonical word   25
ciphertext       [27,15]
~~~

The receiver is untouched before this route selects it.

Its raw GP0 is:

~~~text
27 + 15 = 42 = authenticated source index OPENPGP
~~~

Apply the same fixed two-rune H map:

~~~text
H(27,15) = [12,13]
~~~

Authenticated source indices12 and13 are:

~~~text
12 THE
13 WAY
~~~

so the directed p24 receiver yields:

~~~text
THE WAY
~~~

This creates a compact continuation from the p55 readout:

~~~text
p55 -> THE ROAD AND
AND24 -> p24 canonical word25
      -> H = THE WAY
      -> raw GP0 = OPENPGP42
~~~

The OPENPGP sum is corroborative rather than unique by itself: the full diagonal also has a p10 receiver with raw GP0=42.

### Complete numbered-diagonal control

Charge the established source-index/page/one-based-word diagonal for every authenticated source index0..42 whose directed canonical word exists. There are 42 valid receivers, including ten two-rune receivers.

For those ten two-rune receivers:

~~~text
ascending consecutive H source-index pairs:  1
descending consecutive H source-index pairs: 1
exact H=[12,13]:                              1
~~~

The sole ascending pair is p24 word25, [27,15] -> [12,13] = THE WAY. The sole descending pair is p11 word12, H=[26,25], the already active THEIR/NUMBERS object in the signed direction route.

No page, word, H orientation, or source-word target was changed to obtain the p24 hit.

## THE WAY numbers plus THEIR RISE recover THEIR25

The p24 receiver fixes the ordered authenticated source pair:

~~~text
12 THE
13 WAY
~~~

The repository already has two independent instructions needed to consume that pair:

~~~text
THEIR NUMBERS ARE THE DIRECTION
THEIR RISE
~~~

Follow the numbers12 and13 through the same numbered diagonal used above. Their untouched directed receivers are:

~~~text
THE12 -> p12 canonical word13
          [28,1,0,15,20]
          GP0 = 64

WAY13 -> p13 canonical word14
          [18,3,25,6,26,20]
          GP0 = 98
~~~

The H shell of p12 is a prospective state packet:

~~~text
H-shell(p12) = [8,19,15,16,0]
             = [A,B,b,hex-stride,0]
~~~

and its GP0 address64 points to p50 token22, whose two conventional base60 digits are exactly [K,K]=[2,2]. Across the full numbered diagonal, p12 is the sole receiver whose GP0 addresses token22.

The p13 H shell independently contains:

~~~text
[-K,9,a,0,B,K]
= [27,9,6,0,19,2]
~~~

The decisive operation is already source-authored by p33: THEIR RISE. The ordered receiver rise is:

~~~text
98 - 64 = 34
GP0(THEIR) = 34
~~~

So the p24 output THE WAY, treated as two directed source numbers, recovers THEIR without introducing a key or language score.

Because the upstream p55 fragment already ends at AND24, source context fixes the recovered occurrence as the immediately following second THEIR:

~~~text
22 THE
23 ROAD
24 AND
25 THEIR
~~~

This extends the p55 fragment to:

~~~text
THE ROAD AND THEIR
~~~

### Complete adjacent-diagonal rise control

Charge every adjacent pair on the same authenticated source-index/page/word diagonal. Forty adjacent pairs have both directed receivers available.

Exactly one has forward rise34, and exactly one has absolute rise34:

~~~text
THE12 -> WAY13
64 -> 98
rise = +34 = GP0(THEIR)
~~~

Thus the direction and rise operations are both fixed before the recovered word is read.

### Handoff to the existing p11 instruction

The independently established p11 receiver is the untouched two-rune object [11,14]. Its fixed sum/difference coordinates are [25,26], source THEIR/NUMBERS, and the authenticated increasing continuation gives THEIR NUMBERS ARE THE DIRECTION.

The new p55/p24/p12-p13 route therefore lands exactly on the p11 instruction's first word:

~~~text
p55 -> THE ROAD AND THEIR25
p11 -> THEIR25 NUMBERS26 -> ARE27 THE28 DIRECTION29
~~~

This links the recursive p55 shedding path to the already established p11/p27 ordering corridor with an exact word overlap rather than a semantic guess.

## THEIR25 used as the direction lands on DIRECTION29

The p11 instruction is now executable on the occurrence recovered by the p55 route:

~~~text
THEIR NUMBERS ARE THE DIRECTION
~~~

The p55/p24/p12-p13 path fixes the second authenticated occurrence:

~~~text
25 THEIR
~~~

Use its number25 as the direction through the same numbered diagonal:

~~~text
source THEIR25
 -> physical p25
 -> canonical word26
 -> ciphertext [20,9]
~~~

The untouched receiver's raw GP0 is:

~~~text
20 + 9 = 29
29 = authenticated source index DIRECTION
~~~

So THEIR25's number literally directs to a manuscript object whose number is DIRECTION29.

This also resolves the duplicate THEIR occurrence within this exact route. The first occurrence THEIR19 directs to p19 canonical word20 with GP0=114, while THEIR25 gives DIRECTION29.

Across all 42 valid numbered-diagonal receivers, p25 is the sole receiver with raw GP0=29.

The output can therefore hand off immediately to the independently established DIRECTION29 route:

~~~text
THEIR25
 -> p25 word26
 -> DIRECTION29
 -> project p29
 -> existing p29 DIRECTION state packet / WAY route
~~~

This provides a new first-party selector for DIRECTION29 from the p55 chain without relying on the p28 clause continuation.

## WAY13 has a direct numbered receiver to LIBER9

The p24 ciphertext independently recovers THE WAY and therefore fixes WAY13 before this local receiver is interpreted.

Follow WAY13 through the same numbered diagonal:

~~~text
WAY13
 -> p13 canonical word14
 -> [18,3,25,6,26,20]
~~~

Its fixed outer H pair is:

~~~text
H(18,20) = [27,9]
          = [-K, LIBER]
~~~

The sum coordinate is therefore authenticated source index9, LIBER. This gives a direct source-visible transition:

~~~text
WAY13 -> p13 -> LIBER9
~~~

Across all 42 valid numbered-diagonal receivers, p13 is the sole exact outer-H pair [27,9]. Only three receivers have outer H sum9 at all, and p13 is the only one whose difference coordinate is -K=27.

This is simpler than the previously published cube-e WAY13→LIBER9 bridge and uses a different original ciphertext object. It therefore supplies an independent local consumer for WAY rather than replacing or retuning the earlier route.

LIBER9 can immediately use its source number as the already established direction to p9. The independently preserved p9 packet splits under K=2 into authenticated DIRECTION29 | PATHS40. Its productive DIRECTION branch returns to the existing p29 WAY route:

~~~text
p24 -> THE WAY
 -> WAY13 -> p13 -> LIBER9
 -> p9 -> DIRECTION29
 -> p29 -> candidate WAY13
~~~

The p29 W+AY assembly retains its existing candidate-level caveat. The new p13 receiver strengthens the downstream WAY consumer and the source-number loop.

## Emergence chronology recovers GOOD LUCK BEWARE

The recursive p55 operation also fixes when each odd-word center emerges.

For the five p55 centers, the emergence batches are:

~~~text
shed round1: [11,18]  batch GP0 29
shed round3: [6,2]    batch GP0 8
shed round6: [1]      batch GP0 1
~~~

The cumulative GP0 before the final long-word center emerges is:

~~~text
11 + 18 + 6 + 2 = 37
~~~

After the final center1 emerges:

~~~text
37 + 1 = 38
~~~

The already fixed outside-in H on the complete five-center vector has both branch sums36. Therefore the literal shedding process produces the consecutive authenticated source indices:

~~~text
36  H branch GP0
37  cumulative emerged-core GP0 before final emergence
38  final emerged-core GP0

36 GOOD
37 LUCK
38 BEWARE
~~~

So p55 recovers another exact signed-source fragment:

~~~text
GOOD LUCK BEWARE
~~~

The final value38 retains its independent GP0 typing as WITHIN, so the same terminal state is simultaneously the solved instruction label WITHIN and source direction BEWARE38.

### Manuscript-wide chronology control

Charge all 2,039 page-local 16-word windows. For each window:

1. recursively identify every odd-word center and its deterministic emergence round;
2. compute both fixed H branch sums on the final center vector;
3. compute the cumulative center GP0 immediately before the last emergence round;
4. compute the final center GP0;
5. ask whether either H branch, pre-final cumulative GP0, and final GP0 form any ascending consecutive three-number run.

Across both H branches there are 4,078 charged branch cases.

Exactly two branch cases form any ascending consecutive triple. They are the two equal H branches of the same p55 window:

~~~text
p55 word1 window
difference branch: 36 -> 37 -> 38
sum branch:        36 -> 37 -> 38
~~~

No other 16-word window produces an ascending consecutive triple under this fixed chronology. The two branch hits are one physical result because p55's branch sums happen to coincide at36.

### External warning-corridor holdout

The recovered terminal source index BEWARE38 already has an independently selected strong local ciphertext candidate on p38, and source continuation p39/p40 has independently developed FALSE/PATHS structural candidates. Thus the new p55 output lands on a pre-existing warning corridor rather than requiring a new target family.

This does not make every warning-page local inverse transferable. Existing prospective transfer failures remain valid. The new result is the source-index selection and exact GOOD LUCK BEWARE chronology.

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

The five emerged center runes are not claimed as ordinary plaintext. Their direct transliteration is nonlinguistic, and no free substitution is licensed.

The established advance is operational and state-level. Literal recursive execution of SHED OUR OWN CIRCUMFERENCES on the independently selected p55 word object uniquely exposes WITHIN=38; the same word-length process yields VERIFY OPENPGP and independently reconstructs the complete authenticated DH state; the fixed H core branches then have a held-out external consumer at p36, where an independently committed reversible receiver recovers GOOD. The already established post-SHED p50 edge also returns WITHIN38 to CIRCUMFERENCES131.

No general body cipher or unknown sentence follows yet. The remaining high-value question is a source-selected reversible consumer for this reconstructed state on untouched ciphertext. Arbitrary additive keys, phases, substitutions, or unconstrained KDFs remain outside the evidence.

## Reproduction

~~~text
node sims/lp2_p55_recursive_word_core_sft.cjs
~~~
