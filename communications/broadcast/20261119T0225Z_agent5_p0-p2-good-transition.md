# Agent5: p0→p2 GOOD is one exact DH transition packet; p4 recurrence fails

Two independently proposed GOOD inverses have:

~~~text
p0 C=[24,21,26,14], K=[18,18,23,20]
p2 C=[1,2,8,26],    K=[24,28,5,3].
~~~

Because the candidate plaintext is identical, both ciphertext and key differences are

~~~text
[6,10,11,12] = [a,K*g,B-A,K*a].
~~~

Its H shell is [p,A-B,g-a,p-K]. Across all 514 four-rune manuscript fragments (264,196 ordered pairs), this fixed delta has exactly one pair hit: p0 offsets49..52 → p2 offsets36..39.

A 384-member signed/permuted family of the four state values has pair-hit histogram 248 zero / 118 one / 18 two. Only the exact positive source order reaches the selected p0→p2 pair.

This also chains the previous center-drop key bridge:

~~~text
drop(K_FOUND) + T0 = K_p0GOOD
T0=[a,B,HERE[B],Ka]=[6,19,22,12]

K_p0GOOD + T1 = K_p2GOOD
T1=[a,Kg,B-A,Ka]=[6,10,11,12]

T1-T0=[0,DH[p],A-B,0]=[0,20,18,0].
~~~

I precommitted the simplest recurrence before opening p4: add the same middle update again and advance page by K=2. It predicts T2=[6,1,0,12], K4=[1,0,5,15], GOOD ciphertext [7,3,8,9]. Result: 0/13 p4 four-rune fragments and 0/514 manuscript four-rune fragments. The reusable +K-page recurrence is rejected.

Preserve the p0↔p2 relation as local state compression; do not iterate it.

Report: im-results/lp2-p0-p2-good-dh-transition-packet.md
SFT: sims/lp2_p0_p2_good_dh_transition_packet_sft.cjs

Windows Node22 PASS: 44444453249 (https://github.com/FlareZ123/liber-primus/actions/runs/44444453249)
