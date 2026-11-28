// C++20 port of shared-alphabet forbidden-label search. Input nine GP0 base29 chapter lines.
#include <algorithm>
#include <array>
#include <bit>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <string>
#include <vector>
using namespace std;using U=uint32_t;using I=uint64_t;
constexpr int q=13;constexpr U all=(1u<<q)-1;
struct Seg{int n=0;bool zero=false;array<U,q> seen{};};
struct Solve{
 vector<vector<int>> rows;vector<Seg> seg;vector<int> starts,ends,shift;
 vector<vector<U>> allow,depth,reach;array<array<U,q>,q*29> pairs{};array<U,q> domain{};
 array<int,q> K{};array<I,q+1> hist{};I tests=0,nodes=0,leaves=0;bool free,body;
 Solve(vector<vector<int>> c,bool f,bool b):rows(move(c)),free(f),body(b){
  if(body){int H[]={13,16,12,20,16,19,10,8,9};for(int i=0;i<9;i++)rows[i].erase(rows[i].begin(),rows[i].begin()+H[i]);}
  stable_sort(rows.begin(),rows.end(),[](auto&a,auto&b){return a.size()>b.size();});
  for(auto&row:rows){starts.push_back(seg.size());seg.emplace_back();for(int x:row)if(x==0){seg.back().zero=true;seg.emplace_back();}else{auto&s=seg.back();s.seen[s.n++%q]|=1u<<x;}ends.push_back(seg.size());}
  int m=seg.size();allow.assign(q*29,vector<U>(m,all));depth.assign(q+1,vector<U>(m,all));reach.assign(q+1,vector<U>(m));for(auto&s:seg)shift.push_back(s.n%q);
  for(int j=0;j<q;j++)for(int k=1;k<29;k++)for(int i=0;i<m;i++)for(int s=0;s<q;s++)if(seg[i].seen[(j-s+q)%q]&(1u<<k))allow[j*29+k][i]&=~(1u<<s);
  for(auto&p:pairs)p.fill((1u<<29)-1);K.fill(-1);
 }
 static inline U rot(U x,int n){return ((x<<n)|(x>>(q-n)))&all;}
 bool extend(int d,int j,int k,U zero){
  ++tests;auto&a=depth[d];auto&b=depth[d+1];auto&v=allow[j*29+k];auto&r=reach[d+1];
  for(int f=0;f<(int)rows.size();f++){U st=free&&f?all:1;for(int i=starts[f];i<ends[f];i++){U x=st&a[i]&v[i];if(!x)return false;r[i]=x;st=rot(x,shift[i]);if(seg[i].zero)st|=rot(st&~zero,1);}}
  for(int f=0;f<(int)rows.size();f++){U back=all;for(int i=ends[f]-1;i>=starts[f];i--){U x=back;if(seg[i].zero)x|=rot(back,q-1)&~zero;back=r[i]&rot(x,shift[i]?q-shift[i]:0);b[i]=back;}}
  return true;
 }
 void dfs(int d,U zero,U used,const array<U,q>& dm){
  ++nodes;++hist[d];if(d==q){++leaves;cout<<"K ";for(int x:K)cout<<"0123456789abcdefghijklmnopqrs"[x];cout<<'\n';return;}
  int j=-1,best=30;for(int l=0;l<q;l++)if(!(used&(1u<<l))){int n=popcount(dm[l]);if(n<best){j=l;best=n;}}if(!best)return;
  U nextUsed=used|(1u<<j);for(U v=dm[j];v;v&=v-1){int k=countr_zero(v);bool possible=true;auto nd=dm;for(int l=0;l<q;l++)if(!(nextUsed&(1u<<l))){nd[l]&=pairs[j*29+k][l];if(!nd[l]){possible=false;break;}}if(!possible)continue;U z=zero|(k==0?1u<<j:0);if(extend(d,j,k,z)){K[j]=k;dfs(d+1,z,nextUsed,nd);}if(!d){cerr<<"root "<<j<<":"<<k<<" tests="<<tests<<" nodes="<<nodes<<" leaves="<<leaves<<'\n';}}
  K[j]=-1;
 }
 void run(){
  for(int j=0;j<q;j++)for(int k=0;k<29;k++)if(extend(0,j,k,k==0?1u<<j:0))domain[j]|=1u<<k;
  for(int j=0;j<q;j++)for(U a=domain[j];a;a&=a-1){int k=countr_zero(a);extend(0,j,k,k==0?1u<<j:0);for(int l=j+1;l<q;l++){U m=0;for(U v=domain[l];v;v&=v-1){int x=countr_zero(v);if(extend(1,l,x,(k==0?1u<<j:0)|(x==0?1u<<l:0)))m|=1u<<x;else pairs[l*29+x][j]&=~(1u<<k);}pairs[j*29+k][l]=m;}}
  auto t=chrono::steady_clock::now();dfs(0,0,0,domain);cerr<<"complete=1 free="<<free<<" body="<<body<<" tests="<<tests<<" nodes="<<nodes<<" leaves="<<leaves<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<" hist=";for(auto n:hist)cerr<<n<<",";cerr<<'\n';
 }
};
int main(int argc,char**argv){vector<vector<int>> rows;string s;while(cin>>s){vector<int> v;for(char c:s){int x=c<='9'?c-'0':c-'a'+10;if(x<0||x>=29)return 2;v.push_back(x);}rows.push_back(move(v));}if(rows.size()!=9)return 3;Solve(move(rows),argc>1&&string(argv[1])=="free",argc>2&&string(argv[2])=="body").run();}
