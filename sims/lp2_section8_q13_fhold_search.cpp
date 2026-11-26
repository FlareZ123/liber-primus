// Exact periodic plaintext-F hold feasibility. No score-based pruning.
#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
using U=uint32_t;
using I=uint64_t;
#ifndef PERIOD
#define PERIOD 13
#endif
constexpr int q=PERIOD;
constexpr U all=(1u<<q)-1;
struct Seg{int n=0;bool zero=false;array<U,q> seen{};};
struct Solve{
 vector<Seg> seg;
 vector<vector<U>> allow,depth,reach;
 array<int,q> K{},order{};
 array<vector<int>,q> domains;
 I tests=0,nodes=0,leaves=0;
 int lo,hi;
 Solve(const vector<int>& C,int l,int h):lo(l),hi(h){
  seg.emplace_back();
  for(int c:C)if(c==0){seg.back().zero=true;seg.emplace_back();}else{auto&s=seg.back();s.seen[s.n++%q]|=1u<<c;}
  int m=seg.size();allow.assign(q*29,vector<U>(m,all));depth.assign(q+1,vector<U>(m,all));reach.assign(q+1,vector<U>(m));
  for(int j=0;j<q;j++)for(int k=1;k<29;k++)for(int i=0;i<m;i++)for(int s=0;s<q;s++)if(seg[i].seen[(j-s+q)%q]&(1u<<k))allow[j*29+k][i]&=~(1u<<s);
  K.fill(-1);
 }
 static inline U rot(U x,int n){return ((x<<n)|(x>>(q-n)))&all;}
 bool extend(int d,int j,int k,U zero){
  ++tests;U st=1;auto&a=depth[d];auto&b=depth[d+1];auto&v=allow[j*29+k];auto&r=reach[d+1];
  int m=seg.size();
  for(int i=0;i<m;i++){
   U x=st&a[i]&v[i];if(!x)return false;r[i]=x;
   st=rot(x,seg[i].n%q);if(seg[i].zero)st|=rot(st&~zero,1);
  }
  // Trim all states to those on a complete relaxed path. Future assignments
  // only remove transitions, so no legal full-key path can be lost.
  U back=all;
  for(int i=m-1;i>=0;i--){
   U t=back;if(seg[i].zero)t|=rot(back,q-1)&~zero;
   int n=seg[i].n%q;back=r[i]&rot(t,n?q-n:0);b[i]=back;
  }
  return true;
 }
 void dfs(int d,U zero){
  ++nodes;
  if(d==q){++leaves;cout<<"K ";for(int x:K)cout<<"0123456789abcdefghijklmnopqrs"[x];cout<<'\n';return;}
  int j=order[d];for(int k:domains[j]){
   if(d==0&&(k<lo||k>hi))continue;
   U z=zero|(!k?(1u<<j):0);
   if(extend(d,j,k,z)){K[j]=k;dfs(d+1,z);}
  }K[j]=-1;
 }
 void run(){
  // As in Agent37's search, initial phase zero is without loss of generality.
  for(int j=0;j<q;j++){order[j]=j;for(int k=0;k<29;k++)if(extend(0,j,k,!k?(1u<<j):0))domains[j].push_back(k);}
  stable_sort(order.begin(),order.end(),[&](int a,int b){return domains[a].size()<domains[b].size();});
  auto start=chrono::steady_clock::now();dfs(0,0);
  cerr<<"complete=1 q="<<q<<" range="<<lo<<":"<<hi<<" leaves="<<leaves<<" nodes="<<nodes<<" tests="<<tests<<" elapsed="<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<'\n';
 }
};
int main(int argc,char**argv){ios::sync_with_stdio(false);cin.tie(nullptr);string s;cin>>s;vector<int> c;for(char x:s){int n=x<='9'?x-'0':x-'a'+10;if(n<0||n>=29)return 2;c.push_back(n);}if(argc!=3)return 2;Solve(c,stoi(argv[1]),stoi(argv[2])).run();}
