// 랜덤 닉네임(기본) — 사용자가 수정 가능

const ADJ = ["빠른", "용감한", "교활한", "전설의", "야심찬", "냉철한", "불꽃", "그림자", "황금", "강철", "번개", "고요한"];
const NOUN = ["코드뉴비", "프롬프터", "빌더", "해커", "디자이너", "마에스트로", "위자드", "파이터", "장인", "루키", "타이쿤", "닌자"];

export function randomNickname(seed?: number): string {
  const r = seed === undefined ? Math.random() : ((seed * 2654435761) % 4294967296) / 4294967296;
  const a = ADJ[Math.floor(r * ADJ.length) % ADJ.length];
  const n = NOUN[Math.floor(r * 997 + 13) % NOUN.length];
  const num = Math.floor((r * 9000 + 1000)) % 9000 + 1000;
  return `${a}${n}${num}`;
}
