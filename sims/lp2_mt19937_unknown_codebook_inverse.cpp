#include <array>
#include <cassert>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <chrono>
#include <random>
#include <vector>
#include <algorithm>
#include <iostream>
#include <string>

// Full-state F2-linear inversion of low two bits of tempered MT19937 output.
// Test first against an actual 32-bit-seeded std::mt19937 stream. The unknown
// 624x32 state is never restricted to any seed convention.
constexpr int N=624, BITS=N*32, MAP=28*2, WIDTH=BITS+MAP, LIMBS=(WIDTH+63)/64;
constexpr uint32_t MATRIX_A=0x9908b0dfu;
struct Bits { std::array<uint64_t,LIMBS> w{}; };
void xorsuffix(Bits& a,const Bits& b,int startlimb=0){
  for(int j=startlimb;j<LIMBS;j++)a.w[j]^=b.w[j];
}
int lowbit(const Bits& a,int from=0){
  for(int i=from/64;i<LIMBS;i++){
    auto x=a.w[i]; if(i==from/64)x &= ~0ull<<(from&63);
    if(x)return i*64+__builtin_ctzll(x);
  }
  return -1;
}
uint32_t temper(uint32_t y){
  y^=(y>>11);y^=(y<<7)&0x9d2c5680u;
  y^=(y<<15)&0xefc60000u;y^=(y>>18);return y;
}
struct SymbolicMT {
  std::vector<Bits> bit;
  int cursor=0;
  std::array<std::vector<int>,2> masks;
  SymbolicMT():bit(BITS){
    for(int i=0;i<BITS;i++)bit[i].w[i/64]=1ull<<(i&63);
    for(int raw=0;raw<32;raw++){
      auto y=temper(uint32_t(1)<<raw);
      for(int out=0;out<2;out++)if(y&(uint32_t(1)<<out))masks[out].push_back(raw);
    }
    std::fprintf(stderr,"masks %zu,%zu\n",masks[0].size(),masks[1].size());
  }
  void twist(){
    for(int i=0;i<N;i++){
      std::array<Bits,32> fresh;
      int far=(i+397)%N,next=(i+1)%N;
      for(int j=0;j<32;j++){
        fresh[j]=bit[far*32+j];
        if(j<30)xorsuffix(fresh[j],bit[next*32+j+1]);
        else if(j==30)xorsuffix(fresh[j],bit[i*32+31]);
        if((MATRIX_A>>j)&1u)xorsuffix(fresh[j],bit[next*32]);
      }
      for(int j=0;j<32;j++)bit[i*32+j]=std::move(fresh[j]);
    }
    cursor=0;
  }
  std::array<Bits,2> output(){
    if(cursor==N)twist();
    std::array<Bits,2> ret;
    for(int o=0;o<2;o++)for(int j:masks[o])xorsuffix(ret[o],bit[cursor*32+j]);
    cursor++;
    return ret;
  }
};
struct F2Solver {
  std::vector<Bits> pivot;
  std::vector<uint8_t> occupied;
  int rank=0;
  F2Solver():pivot(WIDTH),occupied(WIDTH){}
  bool mustBeZero(int idx) const {
    Bits row;
    row.w[idx/64]=1ull<<(idx&63);
    int k=0;
    while(true){
      const int at=lowbit(row,k);
      if(at<0)return true;
      if(!occupied[at])return false;
      xorsuffix(row,pivot[at],at/64);
      k=at+1;
    }
  }
  void add(Bits row){
    int k=0;
    while(true){
      int at=lowbit(row,k);
      if(at<0)return;
      if(!occupied[at]){
        occupied[at]=1;pivot[at]=std::move(row);rank++;
        return;
      }
      xorsuffix(row,pivot[at],at/64);
      k=at+1;
    }
  }
};
int main(){
  const std::string alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZab";
  std::string line;
  while(std::getline(std::cin,line)){
    if(line.empty())continue;
    auto delim=line.find('\t');
    if(delim==std::string::npos){std::fprintf(stderr,"bad input case\n");return 1;}
    std::string name=line.substr(0,delim),samples=line.substr(delim+1);
    std::mt19937 positive(0x3301);
    SymbolicMT symbolic;
    F2Solver original, planted;
    size_t observed=0;
    auto start=std::chrono::steady_clock::now();
    for(size_t i=0;i<samples.size();i++){
      const uint32_t draw=positive();
      auto rows=symbolic.output();
      if(samples[i]=='?')continue;
      auto originalSymbol=alphabet.find(samples[i]);
      if(originalSymbol==std::string::npos){std::fprintf(stderr,"bad character\n");return 2;}
      const size_t plantSymbol=(((draw%28)*5)+13)%28;
      observed++;
      for(int b=0;b<2;b++){
        Bits row=rows[b];
        row.w[(BITS+2*originalSymbol+b)/64]^=1ull<<((BITS+2*originalSymbol+b)&63);
        original.add(std::move(row));
        Bits pos=rows[b];
        pos.w[(BITS+2*plantSymbol+b)/64]^=1ull<<((BITS+2*plantSymbol+b)&63);
        planted.add(std::move(pos));
      }
    }
    int originalForced=0, plantForced=0;
    for(int j=0;j<MAP;j++){
      originalForced+=original.mustBeZero(BITS+j);
      plantForced+=planted.mustBeZero(BITS+j);
    }
    double sec=std::chrono::duration<double>(std::chrono::steady_clock::now()-start).count();
    std::printf("CASE %s observed %zu draws %zu original_rank %d original_nullity %d original_forcedzero %d planted_rank %d planted_nullity %d planted_forcedzero %d seconds %.3f\n",name.c_str(),observed,samples.size(),original.rank,WIDTH-original.rank,originalForced,planted.rank,WIDTH-planted.rank,plantForced,sec);
    std::fflush(stdout);
  }
  return 0;
}
