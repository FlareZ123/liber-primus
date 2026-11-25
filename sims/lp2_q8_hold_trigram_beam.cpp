#include <algorithm>
#include <array>
#include <cstdint>
#include <cmath>
#include <fstream>
#include <iostream>
#include <limits>
#include <memory>
#include <unordered_map>
#include <vector>
using namespace std;
constexpr int N=29,Q=8,H=30,START=29;
constexpr uint64_t QMASK=(1ULL<<40)-1;
struct Node{int pos;shared_ptr<Node> prev;};
struct State{double ll;shared_ptr<Node> path;};
struct Result{uint64_t key;State state;size_t peak,last;bool cap;};
using Map=unordered_map<uint64_t,State>;
array<int,N> f;double lm[H][H][N];
void add(Map&out,uint64_t key,double ll,const shared_ptr<Node>&p,int pos=-1){auto it=out.find(key);if(it!=out.end()&&it->second.ll>=ll)return;State s{ll,pos<0?p:make_shared<Node>(Node{pos,p})};if(it==out.end())out.emplace(key,move(s));else it->second=move(s);}
Result dp(const vector<int>&ct,int a,int b,uint64_t initial,size_t cap){Map cur,nxt;cur.emplace(initial,State{0,{}});size_t peak=1;for(int i=a;i<b;i++){int c=ct[i];nxt.clear();for(const auto&[key,s]:cur){uint64_t q=key&QMASK;int x=(key>>40)&31,y=(key>>45)&31;if(c==0){uint64_t k=q|(uint64_t(0)<<40)|(uint64_t(x)<<45);add(nxt,k,s.ll+lm[y][x][0],s.path,i);}int p=(c-int(q&31)+N)%N;if(p!=0){uint64_t q2=(q>>5)|(uint64_t(f[p])<<35);uint64_t k=q2|(uint64_t(p)<<40)|(uint64_t(x)<<45);add(nxt,k,s.ll+lm[y][x][p],s.path);}}if(nxt.size()>cap){vector<pair<uint64_t,double>> rank;rank.reserve(nxt.size());for(auto&[key,state]:nxt)rank.emplace_back(key,state.ll);nth_element(rank.begin(),rank.begin()+cap,rank.end(),[](auto&a,auto&b){return a.second>b.second||(a.second==b.second&&a.first<b.first);});for(size_t j=cap;j<rank.size();j++)nxt.erase(rank[j].first);}if(nxt.empty())return {0,{},peak,0,false};peak=max(peak,nxt.size());cur.swap(nxt);}auto it=max_element(cur.begin(),cur.end(),[](const auto&a,const auto&b){return a.second.ll<b.second.ll;});return {it->first,it->second,peak,cur.size(),false};}
vector<int> decode(const vector<int>&ct,int a,int b,uint64_t key,const shared_ptr<Node>&path){vector<bool> hold(b-a);for(auto n=path;n;n=n->prev)hold[n->pos-a]=true;uint64_t q=key&QMASK;vector<int>p(b-a);for(int i=a;i<b;i++){if(hold[i-a]){if(ct[i]!=0)exit(4);continue;}int x=(ct[i]-int(q&31)+N)%N;if(!x)exit(4);p[i-a]=x;q=(q>>5)|(uint64_t(f[x])<<35);}return p;}
int main(int argc,char**argv){if(argc!=7)return 2;ifstream ci(argv[1]),ki(argv[2]),iv(argv[3]),li(argv[4]);vector<int>ct;int x;while(ci>>x)ct.push_back(x);for(int&v:f)ki>>v;uint64_t q=0;for(int j=0;j<Q;j++){iv>>x;q|=uint64_t(x)<<(5*j);}for(auto&a:lm)for(auto&b:a)for(double&v:b)li>>v;int fit=stoi(argv[5]);size_t cap=stoull(argv[6]);uint64_t init=q|(uint64_t(START)<<40)|(uint64_t(START)<<45);auto t=dp(ct,0,fit,init,cap);cout<<"fitPeak="<<t.peak<<" fitEnd="<<t.last<<" fitCap="<<t.cap<<" fitLL="<<t.state.ll;if(t.cap||!t.last){cout<<"\n";return 0;}auto h=dp(ct,fit,ct.size(),t.key,cap);cout<<" holdPeak="<<h.peak<<" holdEnd="<<h.last<<" holdCap="<<h.cap<<" holdLL="<<h.state.ll<<"\n";if(h.cap||!h.last)return 0;auto p=decode(ct,0,fit,init,t.state.path),p2=decode(ct,fit,ct.size(),t.key,h.state.path);for(int x:p)cout<<"0123456789abcdefghijklmnopqrs"[x];for(int x:p2)cout<<"0123456789abcdefghijklmnopqrs"[x];cout<<"\n";}