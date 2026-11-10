// Exhaust every unknown starting state of Parable-derived modular squaring
// against historical onion-2 inter-arrival-clocked bytes (positions 152..168).
// C++17, no external packages; original bytes and intervals independently
// pinned in resources/cicada2014-onion2-timing.json.
#include <algorithm>
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <vector>

static const int original[17] = {0x26,0xe1,0x97,0x83,0x99,0x56,0x92,0x1d,0xab,
  0x29,0x72,0x4c,0xd4,0x8e,0x1a,0x81,0xfc};
static const int interval[17] = {1,4,1,2,3,3,2,1,5,3,3,1,4,1,4,1,1};

static int byte(uint64_t x, uint64_t M, bool high8) {
  return high8 ? static_cast<int>(256*x/M) : static_cast<int>(x&255);
}
static int ticks(int targetIndex, int clock) {
  const int k=interval[targetIndex];
  if (clock==0) return 1;
  if (clock==1) return k;
  if (clock==2) return k+1;
  if (clock==3) return 2*k;
  return 2*k+1;
}
struct Match {int longest; uint64_t full; uint64_t trueSeedRecovered;};
static Match screen(const std::vector<int>& target, uint64_t M, bool high8, int clock,
                    uint64_t controlSeed=UINT64_MAX) {
  const uint64_t lo=high8?(uint64_t(target[0])*M+255)/256:uint64_t(target[0]);
  const uint64_t hi=high8?(uint64_t(target[0]+1)*M+255)/256:M;
  const uint64_t step=high8?1:256;
  Match best{0,0,0};
  for (uint64_t s=lo;s<hi;s+=step) {
    uint64_t x=s;
    size_t n=0;
    for (;n<target.size();++n) {
      if (byte(x,M,high8)!=target[n])break;
      if (n+1==target.size())continue;
      for (int j=0;j<ticks(static_cast<int>(n+1),clock);++j)x=x*x%M;
    }
    best.longest=std::max(best.longest,static_cast<int>(n));
    if (n==target.size()) {
      ++best.full;
      if (s==controlSeed)++best.trueSeedRecovered;
    }
  }
  return best;
}
static std::vector<int> generate(uint64_t s, uint64_t M, bool high8, int clock) {
  std::vector<int> out;
  uint64_t x=s;
  for (int n=0;n<17;n++) {
    out.push_back(byte(x,M,high8));
    if(n<16) for(int j=0;j<ticks(n+1,clock);j++)x=x*x%M;
  }
  return out;
}
int main() {
  try {
    const std::vector<int> data(original,original+17);
    if(data.size()!=17||data[0]!=38||data[16]!=252)
      throw std::runtime_error("Source byte slice changed");
    for (uint64_t M:{1259ULL*1031,1259ULL*1031*1229})
      for(bool high8:{false,true}) {
        for(int clock=0;clock<5;clock++) {
          Match m=screen(data,M,high8,clock);
          std::cout<<"source=onion2-pos152:168 M="<<M<<" projection="
                   <<(high8?"rescale8":"low8")<<" clock="<<clock
                   <<" max="<<m.longest<<" of17 exact17="<<m.full<<'\n';
          if(m.full!=0||m.longest>=5)
            throw std::runtime_error("Original unexpectedly matched full source generator");
        }
        const int plantedClock=2;
        const uint64_t hiddenState=3301;
        Match positive=screen(generate(hiddenState,M,high8,plantedClock),
          M,high8,plantedClock,hiddenState);
        if(positive.longest!=17||positive.trueSeedRecovered!=1)
          throw std::runtime_error("Planted hidden-source state not recovered");
        std::cout<<"positive M="<<M<<" projection="<<(high8?"rescale8":"low8")
                 <<" clock=k+1 full17="<<positive.full
                 <<" trueStateRecovered="<<positive.trueSeedRecovered<<'\n';
      }
  } catch(const std::exception& e) {
    std::cerr<<"FAIL "<<e.what()<<'\n';return 1;
  }
}