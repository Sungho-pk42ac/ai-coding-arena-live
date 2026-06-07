/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint는 빌드 게이트에서 제외(타입체크 tsc가 정적 게이트 담당)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // 외부 썸네일/이미지 도메인 허용(타깃 스크린샷 폴백)
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};
export default nextConfig;
