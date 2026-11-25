#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <set>
#include <stdexcept>
#include <string>
#include <vector>

// Exact meet-in-the-middle for every affine GF(29) filter with <=4 nonzero
// displacement weights on the printed 32x8 torus. The public grid is input;
// output may be a plaintext or an additive pad. No p55 value used in fitting.
constexpr int Q=29, N=256, FIT=60, D=7, BITS=13, LO=707281, HI=24389;
constexpr uint64_t MASK=(1ull<<(2*BITS))-1;
using Tape=std::array<int,N>;
using Small=std::array<int,D>;
using Key=std::array<int,N+1>; // bias at index N
int mod(int x){x%=Q;return x<0?x+Q:x;}
int shifted(int i,int j){return ((i/8+j/8)%32)*8+(i%8+j%8)%8;}
std::vector<int> shells(){std::vector<int> s;for(int d=0;d<4;d++){int r0=d,r1=31-d,c0=d,c1=7-d;for(int c=c0;c<=c1;c++)s.push_back(r0*8+c);for(int r=r0+1;r<=r1;r++)s.push_back(r*8+c1);for(int c=c1-1;c>=c0;c--)s.push_back(r1*8+c);for(int r=r1-1;r>r0;r--)s.push_back(r*8+c0);}if(s.size()!=256||std::set<int>(s.begin(),s.end()).size()!=256)throw std::runtime_error("shell order");return s;}
int predict(const Tape& g,const Key& k,int i){int v=k[N];for(int j=0;j<N;j++)if(k[j])v+=k[j]*g[shifted(i,j)];return mod(v);}
uint64_t pack(const Small& x){uint64_t v=0;for(int i=D-1;i>=0;i--)v=v*Q+x[i];return v;}
uint64_t mix(uint64_t x){x^=x>>30;x*=0xbf58476d1ce4e5b9ULL;x^=x>>27;x*=0x94d049bb133111ebULL;return x^(x>>31);}
class PairIndex {
public:
 const Tape& g;const std::vector<int>& s;
 std::vector<Small> terms;
 std::vector<uint64_t> entries,hash;
 static constexpr size_t HS=1ull<<26;
 PairIndex(const Tape& grid,const std::vector<int>& order):g(grid),s(order),terms(1+N*(Q-1)),hash(HS){
  for(int j=0;j<N;j++)for(int a=1;a<Q;a++){auto& t=terms[1+j*(Q-1)+a-1];for(int d=0;d<D;d++)t[d]=mod(a*(g[shifted(s[77+d],j)]-g[shifted(s[76],j)]));}
  entries.reserve(1+N*(Q-1)+N*(N-1)/2*(Q-1)*(Q-1));
  add(0,0);for(int a=1;a<int(terms.size());a++)add(0,a);
  for(int a=1;a<int(terms.size());a++)for(int b=1+((a-1)/(Q-1)+1)*(Q-1);b<int(terms.size());b++)add(a,b);
  if(entries.size()!=25596929)throw std::runtime_error("pair count");
 }
 void add(int a,int b){Small x;for(int d=0;d<D;d++){int v=terms[a][d]+terms[b][d];x[d]=v>=Q?v-Q:v;}uint64_t fp=pack(x),e=(fp<<(2*BITS))|(uint64_t(a)<<BITS)|b;entries.push_back(e);size_t h=mix(fp)&(HS-1);while(hash[h])h=(h+1)&(HS-1);hash[h]=e+1;}
 void accumulate(Key& k,uint64_t e)const{int a=(e>>BITS)&((1<<BITS)-1),b=e&((1<<BITS)-1);for(int x:{a,b})if(x){--x;int j=x/(Q-1),v=x%(Q-1)+1;k[j]=mod(k[j]+v);}}
 static std::vector<int> comp(int target,int size,int digits){std::vector<int> out(size);for(int i=0;i<size;i++){int x=i,y=target,k=1,v=0;for(int d=0;d<digits;d++){v+=mod(y%Q-x%Q)*k;k*=Q;x/=Q;y/=Q;}out[i]=v;}return out;}
 std::set<Key> solve(const std::array<int,180>& y,const std::string& label){
  Small t;for(int d=0;d<D;d++)t[d]=mod(y[1+d]-y[0]);uint64_t target=pack(t);
  auto low=comp(target%LO,LO,4),high=comp(target/LO,HI,3);
  std::set<Key> keys;uint64_t matches=0,fitMatches=0;
  for(uint64_t e:entries){uint64_t fp=e>>(2*BITS),wanted=low[fp%LO]+uint64_t(LO)*high[fp/LO];size_t h=mix(wanted)&(HS-1);
   while(hash[h]){uint64_t e2=hash[h++]-1;h&=HS-1;if((e2>>(2*BITS))!=wanted||e2<e)continue;matches++;
    Key k{};accumulate(k,e);accumulate(k,e2);k[N]=mod(y[0]-predict(g,k,s[76]));
    bool ok=true;for(int n=8;n<FIT;n++)if(predict(g,k,s[76+n])!=y[n]){ok=false;break;}
    if(ok){for(int n=0;n<8;n++)if(predict(g,k,s[76+n])!=y[n])throw std::runtime_error("fingerprint check");fitMatches++;keys.insert(k);}
   }
  }
  std::cout<<label<<" projected_pairs="<<matches<<" fit_pair_decompositions="<<fitMatches<<" unique_fit_keys="<<keys.size()<<"\n";
  for(const auto& k:keys){int valid56=0,valid57=0;for(int n=FIT;n<85;n++)valid56+=predict(g,k,s[76+n])==y[n];for(int n=85;n<180;n++)valid57+=predict(g,k,s[76+n])==y[n];std::cout<<"  bias="<<k[N]<<" taps=";for(int j=0;j<N;j++)if(k[j])std::cout<<j<<":"<<k[j]<<",";std::cout<<" hold56="<<valid56<<"/25 hold57="<<valid57<<"/95\n";}
  return keys;
 }
};
int main(){
 Tape b{};std::array<int,76> c55{};std::array<int,85> c56{};std::array<int,95> c57{};std::array<int,180> p{};
 for(auto& x:b)if(!(std::cin>>x))return 1;for(auto& x:c55)std::cin>>x;for(auto& x:c56)std::cin>>x;for(auto& x:c57)std::cin>>x;for(auto& x:p)std::cin>>x;if(!std::cin)throw std::runtime_error("missing input");
 std::array<int,180> mask{};std::vector<int> primes;for(int n=2;primes.size()<85;n++){bool yes=true;for(int q:primes)if(n%q==0){yes=false;break;}if(yes)primes.push_back(n);}int tick=0;
 for(int i=0;i<85;i++){mask[i]=mod(c56[i]-p[i]);int expected=p[i]==0?0:mod(primes[tick++]-1);if(mask[i]!=expected)throw std::runtime_error("p56 replay");}if(tick!=84)throw std::runtime_error("p56 clock");for(int i=0;i<95;i++)if(c57[i]!=p[85+i])throw std::runtime_error("p57 replay");
 auto s=shells();
 for(int radix:{59,60}){Tape g{};for(int i=0;i<N;i++){int hi=b[i]/60,lo=b[i]%60;if(radix==59&&lo==41)throw std::runtime_error("unexpected f");g[i]=mod(radix*hi+lo-(radix==59&&lo>41));}
  PairIndex ix(g,s);std::cout<<"radix="<<radix<<" pairs="<<ix.entries.size()<<"\n"<<std::flush;
  Key hidden{};hidden[N]=7;hidden[3]=5;hidden[47]=13;hidden[128]=21;hidden[249]=28;
  std::array<int,180> target{};for(int i=0;i<180;i++)target[i]=predict(g,hidden,s[76+i]);
  auto plant=ix.solve(target,"mechanical-4tap-plant");if(plant.size()!=1||!plant.count(hidden))throw std::runtime_error("plant key");int rim=0;for(int i=0;i<76;i++)rim+=predict(g,*plant.begin(),s[i])==predict(g,hidden,s[i]);std::cout<<"  planted border="<<rim<<"/76\n"<<std::flush;
  for(int type=0;type<2;type++){const auto& y=type?mask:p;auto candidates=ix.solve(y,type?"original-additive-pad":"original-direct-plaintext");for(const auto& k:candidates){bool ok=true;for(int i=FIT;i<180;i++)if(predict(g,k,s[76+i])!=y[i]){ok=false;break;}if(ok){std::cout<<"  frozen p55 candidate=";for(int i=0;i<76;i++){int v=predict(g,k,s[i]);std::cout<<(type?mod(c55[i]-v):v)<<",";}std::cout<<"\n";}}std::cout<<std::flush;}
 }
}
