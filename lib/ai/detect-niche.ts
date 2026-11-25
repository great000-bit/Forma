import type { NicheSlug } from "@/lib/niches";

/** Keyword match on the first answer, so the interview never waits on AI. */
const RULES: [NicheSlug, RegExp][] = [
  ["ux-research", /\bux research|user research/i],
  ["ui-ux-design", /\bui\s*\/?\s*ux|ux\s*\/?\s*ui|ux designer|ui designer|interface design/i],
  ["product-design", /product design/i],
  ["brand-identity", /brand(ing)? (design|identity)|logo design/i],
  ["motion-design", /motion|animat/i],
  ["video-editing", /video|editor|premiere|davinci|final cut/i],
  ["3d-art", /\b3d\b|blender|cinema ?4d|maya\b/i],
  ["illustration", /illustrat/i],
  ["photography", /photograph|photo/i],
  ["graphic-design", /graphic/i],
  ["ml-ai-engineering", /machine learning|\bml\b|\bai engineer|deep learning|\bllm/i],
  ["data-science", /data scien/i],
  ["data-analysis", /data analy|analyst|power bi|tableau|excel/i],
  ["cybersecurity", /cyber|security|pentest|soc analyst/i],
  ["cloud-devops", /devops|cloud|aws|azure|kubernetes|sre\b/i],
  ["mobile-development", /mobile|android|ios dev|flutter|react native|swift|kotlin/i],
  ["game-development", /game/i],
  ["technical-writing", /technical writ|documentation/i],
  ["product-management", /product manag|\bpm\b/i],
  ["qa-testing", /\bqa\b|quality assurance|tester|testing/i],
  ["blockchain", /blockchain|web3|solidity|smart contract|crypto/i],
  ["embedded-iot", /embedded|iot|firmware|arduino/i],
  ["ar-vr", /\bar\b|\bvr\b|augmented|virtual reality|xr\b/i],
  ["social-media-management", /social media/i],
  ["copywriting", /copywrit|content writ|writer/i],
  ["web-development", /developer|engineer|frontend|front-end|backend|back-end|full ?stack|web dev|react|next\.?js|javascript|python|php/i],
];

export function detectNiche(text: string): NicheSlug | null {
  for (const [slug, re] of RULES) if (re.test(text)) return slug;
  return null;
}
