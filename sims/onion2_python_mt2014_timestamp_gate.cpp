// CPython MT19937 Unix-timestamp seed and 2014 onion-2 timing gate.
// Evidence: resources/cicada2014-onion2-timing.json (positions 152..168).
// CPython seed and next() follow Modules/_randommodule.c and MT19937.
// 777600 UTC timestamps (2014-01-04 through 2014-01-12 inclusive)
// x 901 unconstrained startup positions x 4 byte lanes x 5 clock models.
// The solver never changes parameters in response to original plaintext.
// C++17, standard library; no dependencies or filesystem writes.
#include <array>
#include <cstdint>
#include <cstdio>
#include <cassert>
#include <chrono>

struct PythonMT {
  static constexpr int N=624;
  uint32_t mt[N]; int index;
  void seed(uint32_t key) {
    mt[0]=19650218u;
    for(int i=1;i<N;i++) mt[i]=1812433253u*(mt[i-1]^(mt[i-1]>>30))+i;
    int i=1;
    for(int k=N;k;k--){
      mt[i]=(mt[i]^((mt[i-1]^(mt[i-1]>>30))*1664525u))+key;
      i++;
      if(i>=N){mt[0]=mt[N-1];i=1;}
    }
    for(int k=N-1;k;k--){
      mt[i]=(mt[i]^((mt[i-1]^(mt[i-1]>>30))*1566083941u))-i;
      i++;
      if(i>=N){mt[0]=mt[N-1];i=1;}
    }
    mt[0]=0x80000000u; index=N;
  }
  uint32_t next(){
    if(index>=N){
      for(int i=0;i<N;i++){
        const uint32_t y=(mt[i]&0x80000000u)|(mt[(i+1)%N]&0x7fffffffu);
        mt[i]=mt[(i+397)%N]^(y>>1)^((y&1)?0x9908b0dfu:0u);
      }
      index=0;
    }
    uint32_t y=mt[index++];
    y^=y>>11; y^=(y<<7)&0x9d2c5680u;
    y^=(y<<15)&0xefc60000u; y^=y>>18;
    return y;
  }
};
static constexpr std::array<uint8_t,17> OBS={
  0x26,0xe1,0x97,0x83,0x99,0x56,0x92,0x1d,0xab,
  0x29,0x72,0x4c,0xd4,0x8e,0x1a,0x81,0xfc
};
static constexpr std::array<int,17> WAIT={
  1,4,1,2,3,3,2,1,5,3,3,1,4,1,4,1,1
};
static constexpr int OUTPUTS=1200;
static constexpr int OFFSET_MAX=900;
int gap(int k,int model){
  if(model==0)return 1;
  if(model==1)return k;
  if(model==2)return k+1;
  if(model==3)return 2*k;
  return 2*k+1;
}
int compare(const std::array<uint32_t,OUTPUTS>& raw,int start,int lane,int model,
            const std::array<uint8_t,17>& bytes){
  int n=0,where=start;
  while(n<17){
    if(((raw[where]>>(lane*8))&255u)!=bytes[n])break;
    ++n;
    if(n<17){where+=gap(WAIT[n],model);assert(where<OUTPUTS);}
  }
  return n;
}
int main(){
  PythonMT p;p.seed(3301u);
  constexpr uint32_t known[]={0x3761ae5bu,0x31a14919u,0x37a83bcfu,0x2c66668fu};
  for(uint32_t x:known)assert(p.next()==x);
  const auto begin=std::chrono::steady_clock::now();
  constexpr uint32_t first=1388793600u,last=1389571200u;
  std::array<uint32_t,OUTPUTS> words{};
  int maxPrefix=0,bestOffset=0,bestLane=0,bestClock=0,fivePlus=0;
  uint32_t bestSeed=0;
  for(uint32_t seed=first;seed<last;seed++){
    p.seed(seed);for(auto& w:words)w=p.next();
    for(int offset=0;offset<=OFFSET_MAX;offset++)
      for(int lane=0;lane<4;lane++){
        if(((words[offset]>>(lane*8))&255u)!=OBS[0])continue;
        for(int model=0;model<5;model++){
          const int n=compare(words,offset,lane,model,OBS);
          if(n>maxPrefix){maxPrefix=n;bestSeed=seed;bestOffset=offset;
                          bestLane=lane;bestClock=model;}
          if(n>=5){
            fivePlus++;
            std::printf("ORIGINAL 5+ seed=%u offset=%d lane=%d clock=%d count=%d\n",
                        seed,offset,lane,model,n);
          }
        }
      }
  }
  p.seed(1389003301u);for(auto& w:words)w=p.next();
  std::array<uint8_t,17> planted{};
  int position=367;
  for(int i=0;i<17;i++){
    if(i)position+=gap(WAIT[i],2);
    planted[i]=static_cast<uint8_t>(words[position]>>24);
  }
  assert(compare(words,367,3,2,planted)==17);
  assert(maxPrefix<=4 && fivePlus==0);
  std::printf("ORIGINAL seed-count=%u tested-offsets=%d lanes=4 clocks=5 "
              "best=%d seed=%u offset=%d lane=%d clock=%d fivePlus=%d\n",
              last-first,OFFSET_MAX+1,maxPrefix,bestSeed,bestOffset,
              bestLane,bestClock,fivePlus);
  std::printf("PLANT seed=1389003301 offset=367 lane=3 clock=k+1 exact=17/17\n");
  std::printf("elapsed_s=%.3f\n",
    std::chrono::duration<double>(std::chrono::steady_clock::now()-begin).count());
}
