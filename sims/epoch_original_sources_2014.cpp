// Original 2014 Cicada source-byte epoch-seed generator gate.
// Standard C++17, no external dependencies, read-only.
// g++ -O3 -std=c++17 -o epoch_original_sources_2014 epoch_original_sources_2014.cpp
// Research record: im-results/lp2-2014-epochseed-two-original256-gate.md
#include <cassert>
#include <cstdint>
#include <cstdio>
#include <random>

static constexpr uint8_t G[6]={203,231,167,186,97,237};
static constexpr uint8_t T[6]={99,66,146,186,73,254};
static constexpr uint64_t A=0x5DEECE66DULL, MASK=(1ULL<<48)-1;
static constexpr uint32_t START=1388534400U,END=1399248000U;
inline uint32_t javaNext(uint64_t &state, int bits){
 state=(state*A+11ULL)&MASK;
 return uint32_t(state>>(48-bits));
}
inline uint32_t msNext(uint32_t &state){
 state=214013U*state+2531011U;
 return (state>>16)&32767U;
}
inline uint32_t drandNext(uint64_t &state){
 state=(state*A+11ULL)&MASK;
 return uint32_t(state>>40);
}
int main(){
 // Independent published integer-generator reference vectors.
 {std::mt19937 m(5489U);assert(m()==3499211612U);}
 {uint64_t j=A;assert(javaNext(j,32)==0xbb20b460U);}
 {uint32_t m=1;assert(msNext(m)==41U);}
 unsigned long long hit[14]={};
 for(uint32_t seed=START;seed<END;++seed){
   // First byte cheap rejection, then exact five more consecutive bytes.
   {
     std::mt19937 mt(seed);
     uint32_t x=mt();
     bool gh=(x>>24)==G[0], gl=(x&255)==G[0];
     bool th=(x>>24)==T[0], tl=(x&255)==T[0];
     if(gh||gl||th||tl){
       for(int k=1;k<6 && (gh||gl||th||tl);++k){
         x=mt();
         gh=gh && (x>>24)==G[k];
         gl=gl && (x&255)==G[k];
         th=th && (x>>24)==T[k];
         tl=tl && (x&255)==T[k];
       }
       if(gh){hit[0]++;printf("HIT grid mt-high seed=%u\n",seed);}
       if(gl){hit[1]++;printf("HIT grid mt-low seed=%u\n",seed);}
       if(th){hit[2]++;printf("HIT tape mt-high seed=%u\n",seed);}
       if(tl){hit[3]++;printf("HIT tape mt-low seed=%u\n",seed);}
     }
   }
   // Java java.util.Random.nextInt(256).
   {
     uint64_t state=(uint64_t(seed)^A)&MASK;
     uint32_t x=javaNext(state,31)>>23;
     bool g=x==G[0],t=x==T[0];
     for(int k=1;k<6 && (g||t);++k){
       x=javaNext(state,31)>>23;
       g &= x==G[k];t &= x==T[k];
     }
     if(g){hit[4]++;printf("HIT grid JavaInt seed=%u\n",seed);}
     if(t){hit[5]++;printf("HIT tape JavaInt seed=%u\n",seed);}
   }
   // Java java.util.Random.nextBytes(): low-order bytes of nextInt,
   // four bytes at a time in little-endian order.
   {
     uint64_t state=(uint64_t(seed)^A)&MASK;
     uint32_t x=javaNext(state,32);
     bool g=1,t=1;
     for(int k=0;k<6 && (g||t);++k){
       if(k==4)x=javaNext(state,32);
       uint32_t b=(x>>((k%4)*8))&255;
       g &= b==G[k];t &= b==T[k];
     }
     if(g){hit[6]++;printf("HIT grid JavaBytes seed=%u\n",seed);}
     if(t){hit[7]++;printf("HIT tape JavaBytes seed=%u\n",seed);}
   }
   // Historical libc drand48, floor(256*drand48()).
   {
     uint64_t state=(uint64_t(seed)<<16)|0x330eULL;
     uint32_t x=drandNext(state);
     bool g=x==G[0],t=x==T[0];
     for(int k=1;k<6 && (g||t);++k){
       x=drandNext(state);
       g &= x==G[k];t &= x==T[k];
     }
     if(g){hit[8]++;printf("HIT grid drand48 seed=%u\n",seed);}
     if(t){hit[9]++;printf("HIT tape drand48 seed=%u\n",seed);}
   }
   // Microsoft Visual C++ rand(), 15-bit outputs, both top 8 bits and mod 256.
   {
     uint32_t state=seed;
     uint32_t x=msNext(state);
     bool gh=((x>>7)==G[0]),gl=((x&255)==G[0]);
     bool th=((x>>7)==T[0]),tl=((x&255)==T[0]);
     for(int k=1;k<6 && (gh||gl||th||tl);++k){
       x=msNext(state);
       gh &= ((x>>7)==G[k]);gl &= ((x&255)==G[k]);
       th &= ((x>>7)==T[k]);tl &= ((x&255)==T[k]);
     }
     if(gh){hit[10]++;printf("HIT grid msvc-scaled seed=%u\n",seed);}
     if(gl){hit[11]++;printf("HIT grid msvc-mod seed=%u\n",seed);}
     if(th){hit[12]++;printf("HIT tape msvc-scaled seed=%u\n",seed);}
     if(tl){hit[13]++;printf("HIT tape msvc-mod seed=%u\n",seed);}
   }
 }
 printf("SEEDS %u..%u exclusive: %u\n",START,END,END-START);
 for(int k=0;k<14;k++)printf("HITCOUNT %d %llu\n",k,hit[k]);
}
