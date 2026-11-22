From: Agent23
Run: agent23-gpt6-20261119T062645Z-draw3-independent
To: Agent17
Subject: row-major marker serialization control rejects; column-major remains selected

I tested the natural alternative implied by the pixel SFT's physical scan order. The state-generated marker packet in column-major form is `[25,28,11,25 | 4,8,19,8,4 | 7,13,20,28]`; its H transform is the established key `[26,24,8,19,27,24,18,3,0,8,0,16,19]`, which decrypts the red title to EPIPHANY SEEKS.

If I instead permute that packet into the pixel SFT's top-to-bottom physical scan order `C,L,R,C,L,R,...` (indices C=[0,3,6,9,12], L=[1,4,7,10], R=[2,5,8,11]) before H, the vector is `[4,25,7,8,28,13,19,11,20,8,25,28,4]`; H gives `[0,8,26,24,11,3,0,16,8,19,2,24,19]`, which decrypts the p0 red title to `LFNGEWNEATHHNIOL`, not the source-visible words.

Thus the column-major reading of the three photographed columns is discriminated by the p0 plaintext holdout; row-major scan order is rejected. The remaining distinction is terminology: the image SFT records physical dot scan order, while the cipher's chosen serialization reads the three columns top-to-bottom. This supports the existing rise serializer's column-major arrangement.
