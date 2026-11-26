#pragma once
#include <array>
#include <cstdint>
namespace moment7 {
constexpr int N=29;
constexpr uint32_t ALL=(1u<<N)-1;
constexpr int md(int x){return (x%N+N)%N;}
constexpr uint32_t rot(uint32_t x,int t){return t?((x<<t)|(x>>(N-t)))&ALL:x;}
constexpr auto inverses(){std::array<int,N> a{};for(int x=1;x<N;x++)for(int y=1;y<N;y++)if(x*y%N==1)a[x]=y;return a;}
constexpr auto inv=inverses();
struct Roots {int n=0;std::array<int,2> x{};};
constexpr auto roots(){std::array<Roots,N> a{};for(int x=0;x<N;x++){auto& r=a[x*x%N];r.x[r.n++]=x;}return a;}
constexpr auto sq=roots();
struct Moment{int n=0,s=0,q=0;};
inline Moment moment(uint32_t m){Moment r;while(m){int x=__builtin_ctz(m);m&=m-1;r.n++;r.s+=x;r.q+=x*x;}r.s%=N;r.q%=N;return r;}
constexpr Moment shifted(Moment a,int t){return {a.n,md(a.s+a.n*t),md(a.q+2*a.s*t+a.n*t*t)};}
constexpr Moment sum(Moment a,Moment b){return {a.n+b.n,md(a.s+b.s),md(a.q+b.q)};}
struct Pairs {int n=0;std::array<std::array<int,2>,2> x{};};
// a,b are nonempty disjoint-component offset masks (their relative masks may overlap).
// used is a nonempty set of already occupied field coordinates, with matching moments.
// Precondition: ma.n+mb.n+mu.n=29. Output contains ALL exact labelled placements.
inline Pairs solve(uint32_t a,Moment ma,uint32_t b,Moment mb,uint32_t used,Moment mu){
 const int S=md(-mu.s-ma.s-mb.s),T=md(-mu.q-ma.q-mb.q);
 const int u0=md(S*inv[mb.n]),u1=md(-ma.n*inv[mb.n]);
 const int A=md(ma.n+mb.n*u1*u1),B=md(2*ma.s+2*mb.n*u0*u1+2*mb.s*u1),C=md(mb.n*u0*u0+2*mb.s*u0-T);
 const auto& r=sq[md(B*B-4*A*C)];Pairs out;const uint32_t target=ALL^used;
 for(int i=0;i<r.n;i++){const int t=md((-B+r.x[i])*inv[md(2*A)]),u=md(u0+u1*t);const uint32_t x=rot(a,t),y=rot(b,u);if(!(x&y)&&(x|y)==target)out.x[out.n++]={t,u};}
 return out;
}
}
