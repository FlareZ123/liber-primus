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
constexpr int W=19,H=91,N=W*H;
using Bits=bitset<128>;
using Tape=array<int,N>;
using Order=array<int,W>;
using Clock=array<int,N>;
Clock primeclock(){Clock k{};int i=0;for(int n=2;i<N;n++){bool p=true;for(int d=2;d*d<=n;d++)if(n%d==0){p=false;break;}if(p)k[i++]=(n-1)%29;}return k;}
Tape decode(const string&s){Tape a{};if(s.size()!=N)throw runtime_error("bad length");for(int i=0;i<N;i++){a[i]=s[i]>='a'?s[i]-'a'+10:s[i]-'0';if(a[i]<0||a[i]>=29)throw runtime_error("bad rune");}return a;}
Tape encrypt(const Tape&p,const Order&order,const Clock&k){Tape c{};int q=0;for(int r=0;r<H;r++)for(int t=0;t<W;t++){int v=p[r*W+t];c[order[t]*H+r]=v?(v+k[q++])%29:0;}return c;}
struct Search {
 const Tape&c; const Clock&k; int budget; bool full29; int rows; uint64_t limit,nodes=0,solutions=0; bool stopped=false; bool firstOnly=false;
 array<uint64_t,W+1> visits{}; Order prefix{},winner{}; array<unsigned,H> zmask{};
 vector<Bits> mask,rare;
 Search(const Tape&c,const Clock&k,int budget,int rows,uint64_t limit,bool first):c(c),k(k),budget(max(0,budget)),full29(budget<0),rows(rows),limit(limit),firstOnly(first),mask(H*W*W),rare(H*W*W){
  int cumulative=0;
  for(int r=0;r<H;r++){
   for(int j=0;j<W;j++)if(c[j*H+r]==0)zmask[r]|=1u<<j;
   cumulative+=popcount(zmask[r]);
   if(cumulative>=128)throw runtime_error("hold capacity");
   for(int t=0;t<W;t++)for(int j=0;j<W;j++)for(int h=0;h<=min(cumulative,r*W+t);h++){
    int p=(c[j*H+r]-k[r*W+t-h]+29)%29;
    if(!full29&&(p==12||p==22))rare[(r*W+t)*W+j].set(h);else if(p!=0)mask[(r*W+t)*W+j].set(h);
   }
  }
 }
 bool feasible(int d,unsigned selected)const{
  vector<Bits> s(budget+1);s[0].set(0);
  for(int r=0;r<rows;r++){
   for(int t=0;t<d;t++){
    int j=prefix[t],i=(r*W+t)*W+j; bool any=false;
    // Descending budget preserves previous-step states in s[e-1].
    for(int e=budget;e>=0;e--){Bits next=s[e]&mask[i];if(e)next|=s[e-1]&rare[i];if(c[j*H+r]==0)next|=s[e]<<1;s[e]=next;any|=next.any();}
    if(!any)return false;
   }
   // Unknown suffix may consume arbitrary runes at zero rare cost. Only physical
   // zero cells can hold the clock, so permit every count of suffix holds 0..z.
   int z=popcount(zmask[r]&~selected);
   for(int i=0;i<z;i++)for(auto&v:s)v|=v<<1;
  }
  return true;
 }
 void dfs(int d,unsigned selected){
  if(stopped)return;
  if(nodes==limit){stopped=true;return;}
  nodes++;visits[d]++;
  if(!feasible(d,selected))return;
  if(d==W){solutions++;winner=prefix;if(firstOnly)stopped=true;return;}
  for(int j=0;j<W;j++)if(!(selected&(1u<<j))){prefix[d]=j;dfs(d+1,selected|(1u<<j));if(stopped)return;}
 }
};
int main(int argc,char**argv){
 if(argc!=7){cerr<<"usage: xix input rows node-limit original|plant budget(-1=GP29) first|all\n";return 2;}
 ifstream in(argv[1]);string a,b;in>>a>>b;auto c=decode(a),p=decode(b);auto k=primeclock();int rows=stoi(argv[2]);uint64_t limit=stoull(argv[3]);
 const Order truth={18,16,15,9,2,1,11,12,0,17,13,7,5,14,8,4,6,3,10};
 bool plant=string(argv[4])=="plant";if(plant)c=encrypt(p,truth,k);
 int budget=stoi(argv[5]);if(rows<1||rows>H||budget< -1)throw runtime_error("bad parameters");
 Search s(c,k,budget,rows,limit,string(argv[6])=="first");if(plant){s.prefix=truth;if(!s.feasible(W,(1u<<W)-1))throw runtime_error("plant excluded");}
 auto start=chrono::steady_clock::now();s.dfs(0,0);cout<<"rows "<<rows<<" nodes "<<s.nodes<<" solutions "<<s.solutions<<" stopped "<<s.stopped<<" seconds "<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<"\nvisits ";for(auto n:s.visits)cout<<n<<' ';cout<<'\n';if(s.solutions){cout<<"order ";for(auto j:s.winner)cout<<j<<' ';cout<<'\n';}if(plant){cout<<"truth ";for(auto j:truth)cout<<j<<' ';cout<<'\n';}
}
