#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <sstream>
#include <string>
#include <unordered_set>
#include <unordered_map>
#include <vector>
using namespace std;
constexpr int Q=29;
using W=vector<uint8_t>; using A=array<uint8_t,Q>;
const string symbols="0123456789ABCDEFGHIJKLMNOPQRS";
W word(const string&s){W w;for(char c:s)w.push_back(symbols.find(c));return w;}
string str(const W&w){string s;for(auto x:w)s+=symbols[x];return s;}
vector<W> words(const string&s){istringstream f(s);string w;vector<W> v;while(f>>w)v.push_back(word(w));return v;}
vector<int> primekey(int n){vector<int> k;for(int x=2;(int)k.size()<n;x++){bool yes=true;for(int y=2;y*y<=x;y++)if(x%y==0){yes=false;break;}if(yes)k.push_back((x-1)%Q);}return k;}
vector<int> K;
struct Node {array<int,Q> next; bool term=false; Node(){next.fill(-1);}};
vector<Node> trie(1);
void insert(const W&w){int v=0;for(int x:w){int q=trie[v].next[x];if(q<0){q=trie.size();trie[v].next[x]=q;trie.emplace_back();}v=q;}trie[v].term=true;}
A alphabet(const W&w,bool reverse){W order;uint32_t seen=0;auto add=[&](int x){if(!(seen&(1u<<x))){seen|=1u<<x;order.push_back(x);}};for(int x:w)add(x);for(int i=0;i<Q;i++)add(reverse?Q-1-i:i);A p;for(int i=0;i<Q;i++)p[order[i]]=i;int a=p[0];for(auto&x:p)x=(x+Q-a)%Q;return p;}
struct Key{A p;string name;bool rev;};
struct Map{array<A,Q> d;Map(const A&p,int sign){A inv;for(int i=0;i<Q;i++)inv[p[i]]=i;for(int k=0;k<Q;k++)for(int c=0;c<Q;c++)d[k][c]=inv[(p[c]-sign*k+Q)%Q];}};
struct Edge{int s,t;W p;};
bool test(const W&c,const Map&m,int i,int s,int v){if(i==(int)c.size())return trie[v].term;int x=c[i];if(x==0){int q=trie[v].next[0];if(q>=0&&test(c,m,i+1,s,q))return true;}int p=m.d[K[s]][x];if(p==0)return false;int q=trie[v].next[p];return q>=0&&test(c,m,i+1,s+1,q);}
void edges(const W&c,const Map&m,int i,int s,int start,int v,W&p,vector<Edge>&out){if(i==(int)c.size()){if(trie[v].term)out.push_back({start,s,p});return;}int x=c[i];if(x==0){int q=trie[v].next[0];if(q>=0){p.push_back(0);edges(c,m,i+1,s,start,q,p,out);p.pop_back();}}int a=m.d[K[s]][x];if(a){int q=trie[v].next[a];if(q>=0){p.push_back(a);edges(c,m,i+1,s+1,start,q,p,out);p.pop_back();}}}
W encode(const W&p,const A&pi,int s,int sign){A inv;for(int i=0;i<Q;i++)inv[pi[i]]=i;W c;for(int a:p)c.push_back(a?inv[(pi[a]+sign*K[s++]+Q)%Q]:0);return c;}
int consuming(const W&w){return count_if(w.begin(),w.end(),[](int x){return x!=0;});}
int maxwindow(const vector<vector<Edge>>&es,int maxorigin,int R,int&bestorigin){vector<int> diff(maxorigin+2);for(auto&v:es){vector<pair<int,int>> ints;for(auto&e:v){int lo=max(0,e.t-R),hi=min(maxorigin,e.s);if(lo<=hi)ints.push_back({lo,hi});}sort(ints.begin(),ints.end());int lo=-1,hi=-2;auto finish=[&]{if(lo>=0){diff[lo]++;diff[hi+1]--;}};for(auto [a,b]:ints){if(a>hi+1){finish();lo=a;hi=b;}else hi=max(hi,b);}finish();}int cur=0,best=0;bestorigin=0;for(int s=0;s<=maxorigin;s++){cur+=diff[s];if(cur>best){best=cur;bestorigin=s;}}return best;}
int main(int argc,char**argv){string dir=argc>1?argv[1]:".";int target=argc>2?stoi(argv[2]):0;int maxorigin=argc>3?stoi(argv[3]):3301;int R=308;K=primekey(maxorigin+R+20);ifstream fd(dir+"/dict.txt"),fi(dir+"/input.txt");string s;vector<W> dict;while(fd>>s){W w=word(s);dict.push_back(w);insert(w);}vector<vector<W>> input;while(getline(fi,s))input.push_back(words(s));vector<W> c=input[0];A truth{};int truesign=1;vector<int> starts(c.size());if(target){mt19937 rng(3301+target);string seed=target==1?"5A451J0I4I95I":"A9FG415GR9";truth=alphabet(word(seed),target==2);truesign=target==1?1:-1;int cursor=target==1?1033:3301; if(cursor>maxorigin)cursor=maxorigin;vector<int> order(c.size());iota(order.begin(),order.end(),0);shuffle(order.begin(),order.end(),rng);for(int i:order){starts[i]=cursor;c[i]=encode(input[target][i],truth,cursor,truesign);cursor+=consuming(input[target][i]);}cerr<<"plant start "<<*min_element(starts.begin(),starts.end())<<" end "<<cursor<<"\n";}
vector<Key> keys;unordered_set<string> seen;for(bool rev:{false,true})for(auto&w:dict){A p=alphabet(w,rev);string id(p.begin(),p.end());if(seen.insert(id).second)keys.push_back({p,str(w),rev});}cerr<<"keys="<<keys.size()<<" trie="<<trie.size()<<"\n";
vector<int> anchors;for(int i=0;i<(int)c.size();i++)if(c[i].size()>=8)anchors.push_back(i);stable_sort(anchors.begin(),anchors.end(),[&](int a,int b){return c[a].size()>c[b].size();});int required=anchors.size()-3;long long examined=0,survive=0,windowpass=0,truthpass=0;vector<long long> reject(anchors.size()+1),covered(anchors.size()+1);int best=0,bestwin=0;auto t0=chrono::steady_clock::now();for(auto&key:keys)for(int sign:{1,-1}){examined++;Map m(key.p,sign);int hit=0,miss=0,checked=0;for(int a:anchors){bool found=false;for(int j=0;j<maxorigin+R;j++)if(test(c[a],m,0,j,0)){found=true;break;}checked++;if(found)hit++;else miss++;if(miss>3)break;}reject[checked]++;if(miss>3)continue;survive++;best=max(best,hit);covered[hit]++;vector<vector<Edge>> es;int truehits=0;for(int a:anchors){es.emplace_back();W w;for(int j=0;j<maxorigin+R;j++)edges(c[a],m,0,j,j,0,w,es.back());for(auto&e:es.back()){if(e.t>maxorigin+R)continue;if(encode(e.p,key.p,e.s,sign)!=c[a]){cerr<<"replay failed\n";return 2;}if(target&&e.s==starts[a]&&e.p==input[target][a])truehits++;}}int origin=0,win=maxwindow(es,maxorigin,R,origin);bestwin=max(bestwin,win);if(win>=required){windowpass++;bool correct=target&&key.p==truth&&sign==truesign;if(correct)truthpass++;cout<<"CANDIDATE name="<<key.name<<" reverse="<<key.rev<<" sign="<<sign<<" hits="<<hit<<" window="<<win<<" origin="<<origin<<" truth="<<correct<<" trueedges="<<truehits<<"\n";for(size_t i=0;i<es.size();i++){cout<<"  group="<<anchors[i]<<" edges="<<es[i].size();for(auto&e:es[i])if(e.s>=origin&&e.t<=origin+R)cout<<" "<<e.s<<":"<<str(e.p);cout<<"\n";}}}
cout<<"target="<<target<<" examined="<<examined<<" relaxed_pass="<<survive<<" window_pass="<<windowpass<<" true_pass="<<truthpass<<" best_relaxed="<<best<<" best_window="<<bestwin<<" reject_stages=";for(auto n:reject)cout<<n<<",";cout<<" elapsed="<<chrono::duration<double>(chrono::steady_clock::now()-t0).count()<<"s\n";
}
