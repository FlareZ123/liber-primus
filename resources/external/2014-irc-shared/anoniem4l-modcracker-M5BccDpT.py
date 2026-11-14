our = [ 71, 79, 89, 107, 5, 47, 31, 71 ]
want = [ 89, 31, 11, 63, 13, 59, 107, 29 ] # = D-I-R-E-C-T-IO-N, change them for different attempts.

bigset = []
for number in enumerate(our):
    smallset = []
    for i in range(1, 331):
        mod = number[1] % i
        print "With i as [" + str(i) + "] for [" + str(number[1]) + "]: " + str(want[number[0]] - mod)
        smallset.append(want[number[0]] - mod)
    bigset.append(smallset)    
    print "---------------------------- Continueing to next number --------------------"

#print bigset
#print len(bigset)

for i in range(0, 330):
    if bigset[0][i] == bigset[1][i] and bigset[2][i] and bigset[3][i] and bigset[4][i] and bigset[5][i] and bigset[6][i] and bigset[7][i]:
        print "Cracked!!"
        print bigset[0][i]

print "Exiting."