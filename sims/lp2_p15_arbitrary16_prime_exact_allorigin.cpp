#include <algorithm>
#include <array>
#include <bit>
#include <bitset>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;
#if defined(LP_P8_SEVEN)
constexpr int W=7,N=1729;
#elif defined(LP_P33_CHAPTER)
constexpr int W=14,N=1680;
#else
constexpr int W=16,N=1883;
#endif
constexpr int H=N/W,T=N%W,ORIGINS=3302;
using Bits=bitset<128>;using Tape=array<int,N>;using Order=array<int,W>;
vector<int> primeclock(){vector<int> k;for(int n=2;k.size()<ORIGINS+N;n++){bool p=true;for(int d=2;d*d<=n;d++)if(n%d==0){p=false;break;}if(p)k.push_back((n-1)%29);}return k;}
Tape decode(const string&s){Tape a{};if(s.size()!=N)throw runtime_error("bad length");for(int i=0;i<N;i++){a[i]=s[i]>='a'?s[i]-'a'+10:s[i]-'0';if(a[i]<0||a[i]>=29)throw runtime_error("rune");}return a;}
Tape encrypt(const Tape&p,const Order&o,const vector<int>&k,int origin){Tape c{};int q=origin;for(int i=0;i<N;i++){int v=p[i],j=i<H*W?(i/W)*W+o[i%W]:i;c[j]=v?(v+k[q++])%29:0;}return c;}
struct Tables{vector<array<Bits,29>> good,rare;Tables(const vector<int>&k,bool gp29=false):good(k.size()),rare(k.size()){
 // Bit h at q is allowed iff the key at q-h permits this transition.
 // Sliding windows amortize all origins and positions in one table.
 for(int q=0;q<(int)k.size();q++)for(int c=0;c<29;c++){
  if(q){good[q][c]=good[q-1][c]<<1;rare[q][c]=rare[q-1][c]<<1;}
  int p=(c-k[q]+29)%29;if(p==12||p==22){if(gp29)good[q][c].set(0);else rare[q][c].set(0);}else if(p)good[q][c].set(0);
 }
}};
struct Search{
 const Tape&c; const Tables&m;int origin,budget;uint64_t limit,nodes=0,solutions=0;bool stopped=false,first=false;Order a{},winner{};array<unsigned,H> zero{};array<uint64_t,W+1> visits{};
 Search(const Tape&c,const Tables&m,int o,int b,uint64_t l,bool f):c(c),m(m),origin(o),budget(b),limit(l),first(f){int z=0;for(int r=0;r<H;r++)for(int j=0;j<W;j++)if(!c[r*W+j]){zero[r]|=1u<<j;z++;}for(int i=H*W;i<N;i++)z+=!c[i];if(z>=128)throw runtime_error("hold capacity");}
 bool feasible0(int d,unsigned selected)const{
  Bits s(1);int left=(d+1)/2,right=W-d/2;
  for(int r=0;r<H;r++){
   auto step=[&](int t){int v=c[r*W+a[t]];Bits n=s&m.good[origin+r*W+t][v];if(!v)n|=s<<1;s=n;return s.any();};
   for(int t=0;t<left;t++)if(!step(t))return false;
   // Unassigned middle may consume arbitrary symbols and add at most its
   // observed number of zero cells to the hold count. This is a relaxation.
   int z=popcount(zero[r]&~selected);for(int k=0;k<z;k++)s|=s<<1;
   for(int t=right;t<W;t++)if(!step(t))return false;
  }
  for(int i=H*W;i<N;i++){int v=c[i];Bits n=s&m.good[origin+i][v];if(!v)n|=s<<1;s=n;if(s.none())return false;}return true;
 }
 bool feasibleBudget(int d,unsigned selected)const{
  vector<Bits>s(budget+1);s[0].set(0);int left=(d+1)/2,right=W-d/2;
  auto step=[&](int i,int v){bool any=false;for(int e=budget;e>=0;e--){Bits n=s[e]&m.good[origin+i][v];if(e)n|=s[e-1]&m.rare[origin+i][v];if(!v)n|=s[e]<<1;s[e]=n;any|=n.any();}return any;};
  for(int r=0;r<H;r++){
   for(int t=0;t<left;t++)if(!step(r*W+t,c[r*W+a[t]]))return false;
   int z=popcount(zero[r]&~selected);for(int k=0;k<z;k++)for(auto&v:s)v|=v<<1;
   for(int t=right;t<W;t++)if(!step(r*W+t,c[r*W+a[t]]))return false;
  }
  for(int i=H*W;i<N;i++)if(!step(i,c[i]))return false;return true;
 }
 bool feasible(int d,unsigned selected)const{return budget?feasibleBudget(d,selected):feasible0(d,selected);}
 void dfs(int d,unsigned selected){if(stopped)return;if(nodes==limit){stopped=true;return;}nodes++;visits[d]++;if(!feasible(d,selected))return;if(d==W){solutions++;winner=a;if(first)stopped=true;return;}int slot=d%2?W-1-d/2:d/2;for(int j=0;j<W;j++)if(!(selected&(1u<<j))){a[slot]=j;dfs(d+1,selected|(1u<<j));if(stopped)return;}}
};
int main(int argc,char**argv){if(argc!=9){cerr<<"usage: input start-origin end-origin node-cap original|plant rare-budget(-1 full29) first|all plant-origin\n";return 2;}ifstream f(argv[1]);string x,y;f>>x>>y;Tape raw=decode(x),p=decode(y);auto k=primeclock();int start=stoi(argv[2]),end=stoi(argv[3]),b=stoi(argv[6]),plantOrigin=stoi(argv[8]);uint64_t cap=stoull(argv[4]);bool plant=string(argv[5])=="plant",first=string(argv[7])=="first";if(start<0||end>=ORIGINS||start>end||b< -1||plantOrigin<0||plantOrigin>=ORIGINS)throw runtime_error("parameters");
#if defined(LP_P8_SEVEN)
const Order truth={3,1,6,0,5,2,4};
#elif defined(LP_P33_CHAPTER)
const Order truth={2,8,9,1,12,13,11,4,5,7,3,0,6,10};
#else
const Order truth={5,10,12,14,6,0,15,11,2,7,1,8,3,4,13,9};
#endif
if(plant)raw=encrypt(p,truth,k,plantOrigin);Tables table(k,b<0);auto t=chrono::steady_clock::now();uint64_t total=0,solutions=0,capped=0,maxNodes=0;int maxOrigin=-1;for(int o=start;o<=end;o++){Search s(raw,table,o,max(0,b),cap,first);if(plant&&o==plantOrigin){s.a=truth;if(!s.feasible(W,(1u<<W)-1))throw runtime_error("plant excluded");}s.dfs(0,0);total+=s.nodes;solutions+=s.solutions;capped+=s.stopped&&s.nodes==cap;if(s.nodes>maxNodes){maxNodes=s.nodes;maxOrigin=o;}if(s.solutions||s.stopped){cout<<"origin "<<o<<" nodes "<<s.nodes<<" solutions "<<s.solutions<<" stopped "<<s.stopped<<" order ";if(s.solutions)for(int v:s.winner)cout<<v<<' ';cout<<'\n';}}
cout<<"origins "<<start<<".."<<end<<" total nodes "<<total<<" max nodes "<<maxNodes<<" at "<<maxOrigin<<" solutions "<<solutions<<" capped "<<capped<<" seconds "<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<'\n';}
