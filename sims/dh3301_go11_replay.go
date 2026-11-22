package main

import (
	"fmt"
	"math/big"
	"math/rand"
)

func main() {
	r := rand.New(rand.NewSource(1))

	// Historical organizer sequence before the first DH:
	// RAND 3, RAND 3, RAND 0, RAND 1 = seven Int31n draws.
	for i := 0; i < 7; i++ {
		_ = r.Int31n(256)
	}

	// Four KOAN requests. For the observed RNG values, each Intn call
	// consumes one draw without rejection for any realistic file count.
	for i := 0; i < 4; i++ {
		_ = r.Intn(2)
	}

	p := big.NewInt(3301)
	const maxInt64 = int64(1<<63 - 1)

	for i := 1; i <= 3; i++ {
		base := r.Int63n(23) + 3
		secret := r.Int63n(maxInt64-3301) + 3301
		public := new(big.Int).Exp(big.NewInt(base), big.NewInt(secret), p)
		fmt.Printf("DH%d base=%d secret=%d public=%s\n", i, base, secret, public.String())
	}
}

/*
Expected output:

DH1 base=23 secret=1976235410884494875 public=1473
DH2 base=20 secret=2933568871211448816 public=2958
DH3 base=19 secret=2610529275472648269 public=236
*/
