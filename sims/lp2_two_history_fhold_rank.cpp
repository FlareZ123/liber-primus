#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <queue>
#include <string>
#include <tuple>
#include <vector>
using namespace std;
constexpr int M=29, W=32, MAXST=4000, NEG=-1000000000;
int mod(int x){x%=M;return x<0?x+M:x;}
int pack(int x1,int x2,int c1,int c2){return x1|(x2<<5)|(c1<<10)|(c2<<15);}
struct alignas(64) Score { int s[W]; };
struct State { int z; Score v; };
vector<uint32_t> stamps(1<<20),where(1<<20);uint32_t epoch=0;
Score ls[29];
State Sbuf[MAXST],Tbuf[MAXST];
struct Result{array<int,28> best;int final,peak,death;uint64_t visits;};
Result rankone(const vector<int>& C,int a,int b,int d,bool nonstatic){
 State *S=Sbuf,*T=Tbuf;int sn=0,tn=0;
 for(int x1=1;x1<29;x1++)for(int x2=1;x2<29;x2++){
   if(nonstatic&&x1==C[1]&&x2==C[0])continue;
   State &v=S[sn++];v.z=pack(x1,x2,C[1],C[0]);for(int u=0;u<W;u++)v.v.s[u]=ls[x1].s[u]+ls[x2].s[u];
 }
 int shift[57][57];for(int x=0;x<57;x++)for(int c=0;c<57;c++)shift[x][c]=mod(-a*x-b*c-d);
 int peak=sn,death=-1;uint64_t visits=0;
 for(int i=2;i<(int)C.size();i++){
  int c=C[i];tn=0;++epoch;visits+=sn;
  auto add=[&](int z,const Score& from,const Score& inc){
    if(stamps[z]!=epoch){stamps[z]=epoch;where[z]=tn;assert(tn<MAXST);State &v=T[tn++];v.z=z;for(int u=0;u<W;u++)v.v.s[u]=from.s[u]+inc.s[u];}
    else{Score &v=T[where[z]].v;for(int u=0;u<W;u++)v.s[u]=max(v.s[u],from.s[u]+inc.s[u]);}
  };
  for(int i=0;i<sn;i++){const State &v=S[i];int z=v.z,x1=z&31,x2=(z>>5)&31,c1=(z>>10)&31,c2=(z>>15)&31;
    if(c==0)add(z,v.v,ls[0]);int x=c+shift[x1+x2][c1+c2];if(x>=29)x-=29;if(x!=0)add(pack(x,x1,c,c1),v.v,ls[x]);
  }
  swap(S,T);sn=tn;peak=max(peak,sn);if(!sn){death=i;break;}
 }
 Result r{};r.best.fill(NEG);r.final=sn;r.peak=peak;r.death=death;r.visits=visits;
 for(int i=0;i<sn;i++)for(int u=0;u<28;u++)r.best[u]=max(r.best[u],S[i].v.s[u]);return r;
}
int main(int argc,char**argv){
 if(argc<5)return 1;ifstream f(argv[1]),cf(argv[2]);string text;f>>text;vector<int>C;for(char c:text.substr(0,600))C.push_back(c<='9'?c-'0':c-'a'+10);assert(C.size()==600&&C[0]&&C[1]);
 array<int,29> cnt{};long long N=0;for(int &x:cnt){cf>>x;N+=x;}array<int,29> inv{};for(int u=1;u<29;u++)for(int x=1;x<29;x++)if(u*x%29==1)inv[u]=x;
 for(int x=0;x<29;x++)for(int u=0;u<W;u++){int p=x*inv[u%28+1]%29;ls[x].s[u]=int(lround(10000*log((cnt[p]+0.5)/(N+14.5))));}
 int lo=stoi(argv[3]),hi=stoi(argv[4]);using Row=tuple<int,int,int,int,int>;priority_queue<Row,vector<Row>,greater<Row>> Q;int passed=0,peak=0,latest=-1;uint64_t visits=0;
 for(int a=lo;a<hi;a++)for(int b=0;b<29;b++)for(int d=0;d<29;d++){
   bool cancellation=a!=0&&mod(a+b)==0&&d==0;
   auto r=rankone(C,a,b,d,cancellation);peak=max(peak,r.peak);latest=max(latest,r.death);visits+=r.visits;if(!r.final)continue;passed++;
   for(int u=1;u<29;u++){Row v{r.best[u-1],a,b,d,u};if(Q.size()<128)Q.push(v);else if(v>Q.top()){Q.pop();Q.push(v);}}
 }
 vector<Row> rows;while(!Q.empty()){rows.push_back(Q.top());Q.pop();}reverse(rows.begin(),rows.end());
 cout<<"summary "<<lo<<" "<<hi<<" "<<passed<<" "<<peak<<" "<<latest<<" "<<visits<<"\n";
 for(auto [score,a,b,d,u]:rows)cout<<score<<" "<<a<<" "<<b<<" "<<d<<" "<<u<<"\n";
}
