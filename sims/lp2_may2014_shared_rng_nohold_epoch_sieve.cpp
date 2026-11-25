#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <fstream>
#include <limits>
#include <string>
#include <vector>
#include <omp.h>
using namespace std;
using U=uint64_t;
constexpr U Q=1ULL<<53;
struct MT {
 array<uint32_t,624> m; int i=624; vector<uint32_t> u;
 explicit MT(U seed){m[0]=19650218;for(int x=1;x<624;x++)m[x]=1812433253U*(m[x-1]^(m[x-1]>>30))+x;
 uint32_t words[2]={uint32_t(seed),uint32_t(seed>>32)};int nw=words[1]?2:1,j=0;i=1;
 for(int k=0;k<624;k++){m[i]=(m[i]^((m[i-1]^(m[i-1]>>30))*1664525U))+words[j]+j;if(++i==624){m[0]=m[623];i=1;}if(++j==nw)j=0;}
 for(int k=0;k<623;k++){m[i]=(m[i]^((m[i-1]^(m[i-1]>>30))*1566083941U))-i;if(++i==624){m[0]=m[623];i=1;}}
 m[0]=0x80000000U;i=624;u.reserve(256);}
 uint32_t next(){if(i==624){for(int k=0;k<624;k++){uint32_t y=(m[k]&0x80000000U)|(m[(k+1)%624]&0x7fffffffU);m[k]=m[(k+397)%624]^(y>>1)^((y&1)?0x9908b0dfU:0);}i=0;}uint32_t y=m[i++];y^=y>>11;y^=(y<<7)&0x9d2c5680U;y^=(y<<15)&0xefc60000U;y^=y>>18;return y;}
 uint32_t word(int k){while(k>=int(u.size()))u.push_back(next());return u[k];}
 int key(int& k,int mode=1){if(mode==0)return int((double(coin(k))/double(Q))*29.0);int v;do{v=word(k++)>>27;}while(v>=29);return v;}
 U coin(int& k){U a=word(k++)>>5,b=word(k++)>>6;return (a<<26)|b;}
};
struct Trial{int key,end;U coin;};
Trial trial(MT& M,int j,int schedule,int mode){Trial t{};if(schedule==2)t.coin=M.coin(j);t.key=M.key(j,mode);if(schedule==1)t.coin=M.coin(j);t.end=j;return t;}
struct State{int j,prev; U lo,hi;};
// k=ceil(s*2^53) in [0,Q] is a complete discrete representation of all
// real thresholds. A coin x rejects iff x<k; accepts iff x>=k.
int reach(const vector<int>& C, MT& M, int schedule, int mode,U low=U(.72*Q)+1,U high=U(.882*Q)){
 vector<State> S,T;S.reserve(64);T.reserve(64);S.push_back({0,-1,low,high});
 for(int i=0;i<int(C.size());i++){
  int c=C[i];T.clear();
  auto add=[&](int j,int prev,U lo,U hi){if(lo<=hi)T.push_back({j,prev,lo,hi});};
  for(const auto& a:S){int j=a.j,prev=a.prev;Trial t=trial(M,j,schedule,mode);int k=t.key;
   
   if(c!=prev)add(t.end,c,a.lo,a.hi);
   int p=(prev+29-k)%29;if(prev<0)continue;
   U l=a.lo,h=a.hi;int pos=t.end;
   while(l<=h){U u=schedule?t.coin:M.coin(pos);if(c==prev)add(pos,c,l,min(h,u));l=max(l,u+1);if(l>h)break;
     t=trial(M,pos,schedule,mode);pos=t.end;int emit=(p+t.key)%29;
     if(emit!=prev){if(emit==c)add(pos,c,l,h);break;}
   }
  }
  if(T.empty())return i;
  sort(T.begin(),T.end(),[](const State&a,const State&b){if(a.j!=b.j)return a.j<b.j;if(a.prev!=b.prev)return a.prev<b.prev;return a.lo<b.lo;});
  S.clear();for(const auto& a:T){if(!S.empty()&&S.back().j==a.j&&S.back().prev==a.prev&&a.lo<=S.back().hi+1)S.back().hi=max(S.back().hi,a.hi);else S.push_back(a);}
 }
 return C.size();
}
vector<int> plant(vector<int> P,MT& M,int schedule,int mode,U threshold){int j=0,prev=-1;vector<int>C;
 for(int p:P){int emit;
  while(true){Trial t=trial(M,j,schedule,mode);j=t.end;emit=(p+t.key)%29;
    if(emit!=prev)break;U u=schedule?t.coin:M.coin(j);if(u>=threshold)break;}
  C.push_back(emit);prev=emit;}
 return C;
}
int main(int argc,char** argv){assert(argc>=2);ifstream in(argv[1]);string row;vector<int>C;uint32_t h=2166136261U;while(in>>row)for(char c:row){int v=c<='9'?c-'0':c-'a'+10;assert(v>=0&&v<29);C.push_back(v);h=(h^v)*16777619U;}assert(C.size()==12956&&h==0xfe63c4edU);
 // Independently generated with Python random.Random(7144649572585460758).
 const int expected[3][6]={{13,17,9,14,24,8},{13,14,8,25,11,3},{9,24,6,16,3,14}};
 const U coins[2][6]={{5014518957496516ULL,8449354457494347ULL,1224780805546949ULL,264082876468937ULL,4396555146711454ULL,6098551507680151ULL},{3888631751775669ULL,4216617022035092ULL,2468271677455824ULL,7217308613084626ULL,3367894812710040ULL,6098551507680151ULL}};
 for(int a=0;a<3;a++){MT m(7144649572585460758ULL);int j=0;for(int k=0;k<6;k++){auto t=trial(m,j,a,1);assert(t.key==expected[a][k]);if(a)assert(t.coin==coins[a-1][k]);j=t.end;}}
 {MT m(7144649572585460758ULL);int j=0;const int expect[6]={12,8,27,7,6,0};for(int k:expect){auto t=trial(m,j,0,0);assert(t.key==k);j=t.end;}}
 vector<int>P;MT donor(0x3301);int pos=0;for(int i=0;i<12956;i++)P.push_back(donor.key(pos));
 for(int a=0;a<3;a++)for(int b=0;b<2;b++)for(U t:array<U,3>{U(.72*Q)+1,Q*4/5,U(.882*Q)}){MT A(0x64929851),B(0x64929851);auto X=plant(P,A,a,b,t);assert(reach(X,B,a,b,t,t)==int(P.size()));MT D(0x64929851);assert(reach(X,D,a,b)==int(P.size()));}
 if(argc>2&&string(argv[2])=="control"){cout<<"controls passed (18 fixed-threshold and 18 interval plants)\n";return 0;}
 if(argc>2&&string(argv[2])=="list"){U seed;while(cin>>seed){cout<<seed;MT M(seed);for(int a=0;a<3;a++)for(int b=0;b<2;b++)cout<<","<<reach(C,M,a,b);cout<<"\n";}return 0;}
 U first=argc>2?stoull(argv[2]):1398988800ULL,last=argc>3?stoull(argv[3]):1399852800ULL;assert(first>=1398988800ULL&&last<=1399852800ULL&&last>=first);
 U hits[6]={},counts[6]={};int maxDead[6]={};
 #pragma omp parallel for schedule(dynamic,128) reduction(+:hits[:6],counts[:6]) reduction(max:maxDead[:6])
 for(U seed=first;seed<last;seed++){MT M(seed);for(int a=0;a<3;a++)for(int b=0;b<2;b++){int m=a*2+b,d=reach(C,M,a,b);counts[m]++;maxDead[m]=max(maxDead[m],d);if(d==int(C.size())){hits[m]++;
 #pragma omp critical
 {cout<<"SURVIVOR "<<seed<<" "<<a<<" "<<b<<"\n";}}}}
 cout<<"window "<<first<<" "<<last<<"\n";for(int m=0;m<6;m++)cout<<"schedule="<<m/2<<" mode="<<m%2<<" count="<<counts[m]<<" max_prefix="<<maxDead[m]<<" survivors="<<hits[m]<<"\n";
}
