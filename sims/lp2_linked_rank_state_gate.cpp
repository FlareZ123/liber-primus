// Exact anonymous-label quotient for a continuous insertion-rank cipher.
// An oracle provides S and R, NOT the initial permutation. No language model.
#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <memory>
#include <numeric>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;
using Tape=vector<int>; using States=unordered_set<string>;
uint32_t rng=3183;
int randn(int n){rng^=rng<<13;rng^=rng>>17;rng^=rng<<5;return rng%n;}
Tape perm(int q){Tape x(q);iota(x.begin(),x.end(),0);for(int i=q-1;i>0;--i)swap(x[i],x[randn(i+1)]);return x;}
Tape rmap(int q){Tape x(q);for(auto&v:x)v=randn(q);return x;}
string moved(string s,int i,int k,char c){s.erase(i,1);s.insert(s.begin()+k,c);return s;}
struct Plant {int q;Tape p,c,S,R,A,inv; bool roleP; vector<string> trueState;};
Plant plant(Tape p,bool roleP,int q=29){Plant a; a.q=q;a.p=p;a.roleP=roleP;a.S=perm(q);a.R=rmap(q);a.A=perm(q);a.inv.resize(q);for(int i=0;i<q;++i)a.inv[a.S[i]]=i;string s;for(int v:a.A)s+=char(v);a.trueState.push_back(s);for(int v:p){int j=a.S[v],c=s[j];a.c.push_back(c);s=moved(s,j,a.R[roleP?v:c],char(c));a.trueState.push_back(s);}return a;}
struct Filter {
    // Exact compatibility of two partial permutations: common labels at
    // identical ranks, and disjoint occupied ranks for exclusive labels.
    int q;uint32_t common,revOnly,fwdOnly;
    unordered_map<string,vector<uint32_t>> table;
    pair<string,uint32_t> signature(const string&s,uint32_t only) const {
       string key(__builtin_popcount(common),char(q));uint32_t mask=0;
       for(int i=0;i<q;++i){int x=s[i];if(x==q)continue;uint32_t b=1u<<x;if(common&b)key[__builtin_popcount(common&(b-1))]=char(i);else if(only&b)mask|=1u<<i;}
       return {key,mask};
    }
    Filter(int q_,uint32_t f,uint32_t r,const States& states):q(q_),common(f&r),revOnly(r&~f),fwdOnly(f&~r){
      for(auto&s:states){auto [k,m]=signature(s,revOnly);table[k].push_back(m);}
      for(auto&[k,vs]:table){sort(vs.begin(),vs.end());vs.erase(unique(vs.begin(),vs.end()),vs.end());}
    }
    bool accepts(const string&s) const {auto [k,m]=signature(s,fwdOnly);auto it=table.find(k);if(it==table.end())return false;for(uint32_t b:it->second)if(!(b&m))return true;return false;}
};
struct Step {size_t states; int unseen; uint32_t mask; bool anchor;};
struct Result {vector<Step> steps; bool capped=false; int cap_at=-1; uint64_t transitions=0,pruned=0; size_t peak=1; vector<pair<int,size_t>> filters; States end; States atFreeze; int freeze=-1;};
vector<uint32_t> prefixSeen(const Tape& c){vector<uint32_t> f{0};for(int x:c)f.push_back(f.back()|(1u<<x));return f;}
string quotient(string s,int q,uint32_t seen){for(char&x:s)if(!(seen&(1u<<int(x))))x=char(q);return s;}
// Start from unconstrained terminal permutation, enumerate exact reverse
// partial-state sets up to one preceding anchor block. Discard any capped
// layer: an incomplete reverse set must never prune a forward hypothesis.
vector<unique_ptr<Filter>> makeFilters(const Plant&a,const vector<int>&anchor,size_t cap,vector<pair<int,size_t>>&sizes){
 int q=a.q,n=a.c.size();auto prefix=prefixSeen(a.c);vector<unique_ptr<Filter>> out(n+1);
 for(int end=1;end<=n;++end){if(anchor[end-1]<0||(end<n&&anchor[end]>=0))continue;
   int start=end-1;while(start>0&&anchor[start-1]>=0)--start;
   int prev=start;while(prev>0&&anchor[prev-1]<0)--prev;
   States states{string(q,char(q))},next;uint32_t seen=0;
   for(int t=end-1;t>=prev;--t){int c=a.c[t];bool was=seen&(1u<<c);seen|=1u<<c;int want=anchor[t]<0?-1:a.S[anchor[t]];next.clear();bool capped=false;
     for(auto&s:states){int actual=was?int(s.find(char(c))):-1;auto f=[&](int j){int p=a.inv[j],d=a.R[a.roleP?p:c];if(was?actual!=d:s[d]!=char(q))return;next.insert(moved(s,d,j,char(c)));};if(want>=0)f(want);else for(int j=0;j<q;++j)f(j);
        if(next.size()>cap){capped=true;break;}
     }
     if(capped)break;
     assert(!next.empty());assert(next.count(quotient(a.trueState[t],q,seen)));states.swap(next);
     // Filtering at t means the forward state BEFORE event t.
     if(!out[t]){out[t]=make_unique<Filter>(q,prefix[t],seen,states);sizes.push_back({t,states.size()});}
   }
 }
 return out;
}
Result linked(const Plant&a,const vector<int>& anchors,size_t cap,size_t reverseCap=0){
    int q=a.q,n=a.c.size();States states{string(q,char(q))},next;uint32_t seen=0;Result out;
    vector<unique_ptr<Filter>> filters(n+1);if(reverseCap)filters=makeFilters(a,anchors,reverseCap,out.filters);
    for(int t=0;t<n;++t){int c=a.c[t];bool was=seen&(1u<<c);seen|=1u<<c;int want=anchors[t]<0?-1:a.S[anchors[t]];uint32_t mask=0;next.clear();
      for(const string& s:states){
        auto f=[&](int j){if(want>=0&&j!=want)return;int p=a.inv[j];string candidate=moved(s,j,a.R[a.roleP?p:c],char(c));++out.transitions;if(filters[t+1]&&!filters[t+1]->accepts(candidate)){++out.pruned;return;}mask|=1u<<p;next.insert(std::move(candidate));};
        if(was){auto j=s.find(char(c));assert(j!=string::npos);f(int(j));}
        else if(want>=0){if(s[want]==char(q))f(want);}
        else for(int j=0;j<q;++j)if(s[j]==char(q))f(j);
        if(next.size()>cap){out.capped=true;out.cap_at=t;return out;}
      }
      assert(!next.empty());assert(next.count(quotient(a.trueState[t+1],q,seen)));assert(mask&(1u<<a.p[t]));
      states.swap(next);out.peak=max(out.peak,states.size());out.steps.push_back({states.size(),q-__builtin_popcount(seen),mask,want>=0});
      if(want>=0&&find_if(anchors.begin()+t+1,anchors.end(),[](int v){return v>=0;})==anchors.end()){out.freeze=t+1;out.atFreeze=states;}
    }out.end=std::move(states);return out;
}
struct Held {size_t count=0;uint64_t concrete=0;vector<array<int,3>> queries;bool capped=false;};
Held heldQueries(const Plant&a,const Result&r,size_t cap=2000000){
 Held out;if(r.capped||r.freeze<0)return out;int n=a.c.size(),q=a.q,t0=r.freeze;auto prefix=prefixSeen(a.c);uint32_t seen=prefix[t0];Tape unused;for(int x=0;x<q;++x)if(!(seen&(1u<<x)))unused.push_back(x);States seqs;
 // Enumerate complete state lists only at freeze. Unseen labels are still
 // arbitrary; all completions are valid and will be independently decoded.
 for(auto&s:r.atFreeze){Tape order=unused;do{string a0=s;int k=0;for(char&c:a0)if(c==char(q))c=char(order[k++]);string state=a0,p;for(int t=t0;t<n;++t){int c=a.c[t],j=state.find(char(c)),v=a.inv[j];p+=char(v);state=moved(state,j,a.R[a.roleP?v:c],char(c));}seqs.insert(p);if(++out.concrete>cap){out.capped=true;return out;}}while(next_permutation(order.begin(),order.end()));}
 string truth;for(int t=t0;t<n;++t)truth+=char(a.p[t]);assert(seqs.count(truth));out.count=seqs.size();
 // Adaptive acquisition: choose position minimizing largest remaining bucket,
 // ties by sum of squares of bucket sizes, then earliest position. Choice
 // depends only on the candidate set; reveal truth afterwards.
 while(seqs.size()>1){int best=-1;size_t worst=seqs.size();uint64_t sumsq=UINT64_MAX;for(int i=0;i<n-t0;++i){array<size_t,29> counts{};for(auto&s:seqs)++counts[int(s[i])];size_t w=*max_element(counts.begin(),counts.end());uint64_t sq=0;for(size_t c:counts)sq+=uint64_t(c)*c;if(w<worst||(w==worst&&sq<sumsq)){best=i;worst=w;sumsq=sq;}}assert(best>=0&&worst<seqs.size());int v=truth[best];for(auto it=seqs.begin();it!=seqs.end();)if((*it)[best]!=v)it=seqs.erase(it);else ++it;out.queries.push_back({t0+best,v,int(seqs.size())});}
 return out;
}
void print(const string&name,const Plant&a,const vector<int>& anchors,const Result&r){
    cout<<"{\"name\":\""<<name<<"\",\"role\":\""<<(a.roleP?"P":"C")<<"\",\"n\":"<<a.p.size()<<",\"capped\":"<<(r.capped?"true":"false")<<",\"cap_at\":"<<r.cap_at<<",\"peak\":"<<r.peak<<",\"transitions\":"<<r.transitions<<",\"pruned\":"<<r.pruned<<",\"filters\":[";
    for(int i=0;i<(int)r.filters.size();++i){if(i)cout<<',';cout<<'['<<r.filters[i].first<<','<<r.filters[i].second<<']';}cout<<"],\"steps\":[";
    for(int i=0;i<(int)r.steps.size();++i){if(i)cout<<',';auto s=r.steps[i];cout<<'['<<s.states<<','<<s.unseen<<','<<s.mask<<','<<(s.anchor?1:0)<<']';}auto held=heldQueries(a,r);cout<<"],\"held\":{\"distinct\":"<<held.count<<",\"concrete\":"<<held.concrete<<",\"capped\":"<<(held.capped?"true":"false")<<",\"queries\":[";for(int i=0;i<(int)held.queries.size();++i){if(i)cout<<',';auto z=held.queries[i];cout<<'['<<z[0]<<','<<z[1]<<','<<z[2]<<']';}cout<<"]},\"S\":[";for(int i=0;i<a.q;++i){if(i)cout<<',';cout<<a.S[i];}cout<<"],\"R\":[";for(int i=0;i<a.q;++i){if(i)cout<<',';cout<<a.R[i];}cout<<"],\"A\":[";for(int i=0;i<a.q;++i){if(i)cout<<',';cout<<a.A[i];}cout<<"],\"C\":[";for(int i=0;i<(int)a.c.size();++i){if(i)cout<<',';cout<<a.c[i];}cout<<"]}"<<endl;
}
// Exhaustive full-permutation oracle on small alphabets. Compare complete
// final state quotient and every post-last-anchor output support, not just
// retention of truth.
void toyTest(){int cases=0;uint64_t full=0;for(int q:{4,5,6})for(int rep=0;rep<40;++rep)for(bool roleP:{true,false}){Tape p(22);for(int&x:p)x=randn(q);auto a=plant(p,roleP,q);vector<int> anchor(p.size(),-1);for(int i:{0,1,5,6,10,11,12})anchor[i]=p[i];auto r=linked(a,anchor,100000,100000);assert(!r.capped);Tape initial(q);iota(initial.begin(),initial.end(),0);States final;vector<uint32_t> masks(p.size());auto prefix=prefixSeen(a.c);do{++full;string s;for(int x:initial)s+=char(x);Tape dec;bool legal=true;for(int t=0;t<(int)p.size();++t){int c=a.c[t],j=s.find(char(c)),v=a.inv[j];if(anchor[t]>=0&&anchor[t]!=v){legal=false;break;}dec.push_back(v);s=moved(s,j,a.R[roleP?v:c],char(c));}if(legal){final.insert(quotient(s,q,prefix.back()));for(int i=13;i<(int)p.size();++i)masks[i]|=1u<<dec[i];}}while(next_permutation(initial.begin(),initial.end()));assert(final==r.end);for(int i=13;i<(int)p.size();++i)assert(masks[i]==r.steps[i].mask);++cases;}cerr<<"toy exact oracle: "<<cases<<" cases, "<<full<<" initial permutations\n";}
int main(int argc,char**argv){size_t cap=argc>1?stoull(argv[1]):1000000,reverseCap=argc>2?stoull(argv[2]):1000000;toyTest();rng=3183;int n;string name;while(cin>>name>>n){Tape p(n);for(int&i:p)cin>>i;for(bool roleP:{true,false}){auto a=plant(p,roleP);vector<int> anchors(n,-1);int starts[]={0,20,40,60},lens[]={8,5,4,3};for(int j=0;j<4;++j)for(int i=starts[j];i<min(n,starts[j]+lens[j]);++i)anchors[i]=p[i];auto r=linked(a,anchors,cap,reverseCap);print(name,a,anchors,r);}}}
