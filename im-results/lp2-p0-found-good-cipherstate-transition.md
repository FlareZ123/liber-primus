# P0 FOUND→GOOD: dimension-changing DH/HERE cipher-state transition

**Agent5, 19 November 2026. Classification: retrospective mechanism compression on two independently selected p0 receivers. This supplies a compact source-state FOUND→GOOD transition outside Director #1738's uniform grammar, while it does not establish a reusable cipher or a prospective fourth plaintext.**

## Result

The existing p28 reconstruction fixes

~~~text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3
H(x,y)=(x-y,x+y) mod29.
~~~

The independently selected original p0 receivers are

~~~text
FOUND receiver C_F = [12,2,11,10,2]   offsets117..121
GOOD  receiver C_G = [24,21,26,14]    offsets49..52
~~~

FOUND is five runes while GOOD is four. Under the frozen outside-in H shell, the odd coordinate is the unique unpaired center. Remove it before comparing the two original ciphertexts:

~~~text
drop_center(C_F) = [12,2,10,2]
H_shell          = [10,14,21,12]

H_shell(C_G)     = [10, 9,24,18]

difference       = [0,24,3,6]
                 = [0,-g,e,a] mod29.
~~~

Because H is linear and invertible,

~~~text
H^-1([0,-g,e,a])
= [12,19,16,12]
= [K*a, B, H(K,b)[0], K*a].
~~~

Applying that rune-space delta to the center-dropped original FOUND receiver predicts the complete original GOOD receiver exactly:

~~~text
[12,2,10,2] + [12,19,16,12]
= [24,21,26,14].
~~~

## Exact key-state bridge

The published additive keys are

~~~text
K_FOUND = [12,28,10,1,8]
K_GOOD  = [18,18,23,20].
~~~

Delete FOUND's unique center key coordinate together with the removed ciphertext/plaintext center:

~~~text
drop_center(K_FOUND) = [12,28,1,8].
~~~

Physical p28 line1 is the already selected HERE carrier. Its one-based state position B=19 is original rune value22. Therefore the source object fixes

~~~text
[a, B, HERE[B], K*a] = [6,19,22,12].
~~~

That vector advances the center-dropped FOUND key exactly to the published GOOD key:

~~~text
[12,28,1,8] + [6,19,22,12]
= [18,18,23,20].
~~~

The corresponding candidate-plaintext change is

~~~text
drop_center(FOUND) = [0,3,9,23]
GOOD               = [6,3,3,23]
difference         = [a,0,-a,0].
~~~

The plaintext and key deltas sum positionwise to the observed ciphertext delta [12,19,16,12].

A bounded calibration does not privilege the discovered source-vector order. Permute the four distinct terms [a,B,HERE[B],K*a], allow either sign, apply all 48 candidate key updates to the fixed GOOD receiver, and compare only with the nine distinct four-GP-rune words in the authenticated 2016 carrier. Exactly one configuration hits any target: source order, positive sign, published GOOD key, yielding GOOD.

## Whole-manuscript original-input charge

Apply exactly one frozen transform to every page-local five-rune unknown fragment:

1. remove its H-shell center;
2. add [0,-g,e,a] in four-coordinate H space;
3. invert H;
4. ask whether the predicted four-rune sequence occurs anywhere among the page-local unknown four-rune fragments.

The established page-local convention contains 318 five-rune and 514 four-rune fragments, 163,452 ordered source/target pairs. There is exactly one hit:

~~~text
p0 offsets117..121 -> p0 offsets49..52
FOUND receiver      -> GOOD receiver.
~~~

The stricter continuous-word parser gives 317 five-rune and 513 four-rune words and the same single hit.

For scale, broaden the post-discovery shell vector while retaining its unchanged first coordinate. Let each of the other three coordinates be any signed value from the eight primitive state values {p,g,a,b,A,B,K,e}. This produces 14 distinct signed residues and 14^3=2,744 numeric vectors. Across the same manuscript pairs, 537 vectors produce at least one match and there are 592 total pair hits. The exact [0,-g,e,a] vector contributes one. This broader family shows why the exact one-hit result is mechanism compression rather than a stand-alone authorship probability.

## Related ciphertext invariant

The original FOUND, GOOD and LUCK receivers all have outer H difference

~~~text
first - last = 10 = K*g.
~~~

PATHS has outer difference16 and breaks the invariant. Manuscript-wide the condition is not rare enough to authenticate anything by itself: 31/832 page-local four- or five-rune fragments satisfy it, including 5/16 on p0.

## Relation to Director #1738

Director #1738 tested 37,200 uniform rules required to map both FOUND→GOOD and GOOD→LUCK with the same transform and found zero survivors. This result does not contradict that negative.

The present operation is narrower: it changes dimension by deleting the unique H-shell center, uses a nonuniform four-coordinate update, explains FOUND→GOOD only, and is not claimed to map GOOD→LUCK. Agent22's separate GOOD→LUCK shell update remains the current compression for that step.

## Decision

Preserve this as a source-connected FOUND→GOOD mechanism-compression result. It materially reduces the earlier statement that FOUND and GOOD require unrelated post-label key grammars: the two exact keys are linked by one compact p28 DH/HERE state vector, and the same transition acts exactly on the original ciphertexts.

The vector/order was recognized after both candidate keys and receivers were known. Do not call this a recovered cipher or established plaintext. The decisive next gate is a prospective untouched consumer or an independent source instruction selecting this center-drop transition before its target is opened.

## Reproduction

~~~text
node sims/lp2_p0_found_good_cipherstate_transition_sft.cjs
~~~
