#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <map>
#include <random>
#include <string>
#include <vector>
using namespace std;
constexpr int A=29;
struct Result { int best=-1,bound=-1,upper=-1,checked=0,skipped=0; vector<int> key; };
template<int Q,int K> struct DP {
 vector<array<int16_t,K*A*Q>> count; vector<int> len; array<int,K> s; int h;
 DP(const vector<int>& c,int hold,array<int,K> phase):s(phase),h(hold){
  count.emplace_back();len.push_back(0);
  for(int x:c){if(x==h){count.emplace_back();len.push_back(0);continue;}int i=len.back()++;for(int j=0;j<K;j++)count.back()[(j*A+x)*Q+(s[j]-i%Q+Q)%Q]++;}
  for(auto& n:len)n%=Q;
 }
 int eval(const array<int,K>& key)const{
  array<int16_t,Q> d{},e{};array<int,Q> add{};for(int j=0;j<K;j++)add[s[j]]=key[j]==h;
  for(size_t z=0;z<count.size();z++){e.fill(-30000);array<const int16_t*,K> p{};for(int j=0;j<K;j++)p[j]=count[z].data()+(j*A+key[j])*Q;
   for(int r=0;r<Q;r++){int v=d[r];for(int j=0;j<K;j++)v+=p[j][r];int a=(r+len[z])%Q;e[a]=max<int>(e[a],v);if(z+1<count.size()){int u=(a+1)%Q;e[u]=max<int>(e[u],v+add[a]);}}d=e;}
  return *max_element(d.begin(),d.end());
 }
};

template<int Q,int K> int legal(const DP<Q,K>&d,const array<int,K>&key,const array<int,K>&forbid){
 array<int16_t,Q> a{},b{};array<int,Q> add{},ban;ban.fill(-1);for(int j=0;j<K;j++){add[d.s[j]]=key[j]==d.h;ban[d.s[j]]=forbid[j];}
 for(size_t z=0;z<d.count.size();z++){b.fill(-30000);array<const int16_t*,K> p{},f{};for(int j=0;j<K;j++){p[j]=d.count[z].data()+(j*A+key[j])*Q;if(forbid[j]>=0)f[j]=d.count[z].data()+(j*A+forbid[j])*Q;}
  for(int r=0;r<Q;r++){if(a[r]<0)continue;int v=a[r];bool ok=true;for(int j=0;j<K;j++){if(f[j]&&f[j][r]){ok=false;break;}v+=p[j][r];}if(!ok)continue;int e=(r+d.len[z])%Q;b[e]=max<int>(b[e],v);if(z+1<d.count.size()&&ban[e]!=d.h){int u=(e+1)%Q;b[u]=max<int>(b[u],v+add[e]);}}a=b;
 }return *max_element(a.begin(),a.end());
}
template<int Q,int K> void tighten(const vector<int>&c,int h,array<int,K>s,int threshold){
 map<int,array<int16_t,A*A>> tables;struct Pair{int i,j;const array<int16_t,A*A>* table;};vector<Pair> pairs;
 for(int i=0;i<K;i++)for(int j=i+1;j<K;j++){int diff=(s[j]-s[i]+Q)%Q;if(!tables.count(diff)){DP<Q,2>d(c,h,{0,diff});auto&t=tables[diff];for(int x=0;x<A;x++)for(int y=0;y<A;y++)t[x*A+y]=d.eval({x,y});}pairs.push_back({i,j,&tables.at(diff)});}
 int total=1;for(int j=0;j<K;j++)total*=A;DP<Q,K>d(c,h,s);array<int,K>key{},f;int high=0,candidates=0,visits=0,survive=0,best=-1;vector<int> ks,fs;
 for(int id=0;id<total;id++){int x=id;for(int j=K-1;j>=0;j--){key[j]=x%A;x/=A;}int sum=0;array<int,K*(K-1)/2>vals{};int p=0;for(auto pair:pairs){int v=(*pair.table)[key[pair.i]*A+key[pair.j]];sum+=v;vals[p++]=v;}int upper=sum/(K-1);if constexpr(K==4)upper=min({upper,vals[0]+vals[5],vals[1]+vals[4],vals[2]+vals[3]});if(upper<threshold)continue;candidates++;if(d.eval(key)<threshold)continue;high++;f.fill(-1);
  auto visit=[&](auto&&self,int j)->void{if(j==K){survive++;int z=legal<Q,K>(d,key,f);if(z>best){best=z;ks.assign(key.begin(),key.end());fs.assign(f.begin(),f.end());}return;}for(int a=0;a<A;a++){if(a==key[j])continue;bool ok=true;for(int i=0;i<j;i++){if((key[i]==key[j])!=(f[i]==a)){ok=false;break;}}if(!ok)continue;f[j]=a;visits++;if(legal<Q,K>(d,key,f)>=threshold)self(self,j+1);f[j]=-1;}};visit(visit,0);
 }
 cout<<h<<" q="<<Q<<" threshold="<<threshold<<" pairCandidates="<<candidates<<" relaxedHigh="<<high<<" legalityDPs="<<visits<<" fullSurvivors="<<survive<<" best="<<best;for(int a:ks)cout<<' '<<a;cout<<" forbid";for(int a:fs)cout<<' '<<a;cout<<endl;
}
template<int Q,int K> Result solve(const vector<int>&c,int h,array<int,K> s){
 map<int,array<int16_t,A*A>> tables;struct Pair{int i,j;const array<int16_t,A*A>* table;};vector<Pair> pairs;
 for(int i=0;i<K;i++)for(int j=i+1;j<K;j++){int diff=(s[j]-s[i]+Q)%Q;if(!tables.count(diff)){DP<Q,2>d(c,h,{0,diff});auto&t=tables[diff];for(int x=0;x<A;x++)for(int y=0;y<A;y++)t[x*A+y]=d.eval({x,y});}pairs.push_back({i,j,&tables.at(diff)});}
 int total=1;for(int j=0;j<K;j++)total*=A;vector<vector<int>>bins(c.size()+1);Result out;array<int,K>key{};
 auto unpack=[&](int id){for(int j=K-1;j>=0;j--){key[j]=id%A;id/=A;}};
 for(int id=0;id<total;id++){unpack(id);int sum=0;array<int,K*(K-1)/2>vals{};int p=0;for(auto pair:pairs){int v=(*pair.table)[key[pair.i]*A+key[pair.j]];sum+=v;vals[p++]=v;}int upper=sum/(K-1);if constexpr(K==4)upper=min({upper,vals[0]+vals[5],vals[1]+vals[4],vals[2]+vals[3]});bins[upper].push_back(id);out.upper=max(out.upper,upper);}
 DP<Q,K>d(c,h,s);for(int u=out.upper;u>=0;u--){if(u<=out.best){out.skipped+=bins[u].size();continue;}for(int id:bins[u]){if(u<=out.best){out.skipped++;continue;}unpack(id);int v=d.eval(key);out.checked++;if(v>out.best){out.best=v;out.key.assign(key.begin(),key.end());}}}
 assert(out.checked+out.skipped==total);out.bound=Q*out.best/K;return out;
}
void print(const Result&r){cout<<r.best<<' '<<r.bound<<' '<<r.checked<<' '<<r.skipped<<' '<<r.upper;for(int x:r.key)cout<<' '<<x;}
template<int Q,int K> int direct(const vector<int>&c,int h,array<int,K>s,array<int,K>key){array<int,Q>d{},e{},t;t.fill(-1);for(int j=0;j<K;j++)t[s[j]]=key[j];for(int x:c){e.fill(-30000);for(int r=0;r<Q;r++){if(x==h)e[r]=max(e[r],d[r]);int u=(r+1)%Q;e[u]=max(e[u],d[r]+(t[r]==x));}d=e;}return *max_element(d.begin(),d.end());}
int main(int argc,char**argv){assert(argc>=2);ifstream f(argv[1]);string tape;f>>tape;vector<int>c;uint32_t hash=2166136261u;for(char x:tape){int v=x<='9'?x-'0':x-'a'+10;assert(v>=0&&v<A);c.push_back(v);hash=(hash^v)*16777619u;}assert(c.size()==3008&&hash==1862123327u);
 mt19937 gen(462029);for(int j=0;j<400;j++){vector<int>toy(30);for(int&x:toy)x=gen()%7;int h=gen()%7;array<int,3>k{int(gen()%7),int(gen()%7),int(gen()%7)};assert((DP<8,3>(toy,h,{0,2,4}).eval(k)==direct<8,3>(toy,h,{0,2,4},k)));}
 string mode=argc>2?argv[2]:"bound";int from=argc>3?stoi(argv[3]):0,to=argc>4?stoi(argv[4]):29;
 if(mode=="legal8"){for(int h: {0,10,11,16,22})tighten<8,3>(c,h,{0,2,4},117);return 0;}
 if(mode=="legal13"){for(int h=from;h<to;h++)tighten<13,4>(c,h,{0,2,4,6},96);return 0;}
 assert(mode=="bound");for(int h=from;h<to;h++){auto a=solve<8,3>(c,h,{0,2,4});auto b=solve<13,4>(c,h,{0,2,4,6});assert((direct<8,3>(c,h,{0,2,4},{a.key[0],a.key[1],a.key[2]})==a.best));assert((direct<13,4>(c,h,{0,2,4,6},{b.key[0],b.key[1],b.key[2],b.key[3]})==b.best));cout<<h<<' '<<count(c.begin(),c.end(),h)<<' ';print(a);cout<<" | ";print(b);cout<<endl;}
}
