import { HeroSiegeRelicIcon } from "./HeroSiegeItemIcon";
import type { Relic } from "../types/study";

export function RelicIcon(props: { relic: Relic; size?: number }) {
  return <HeroSiegeRelicIcon relic={props.relic} size={props.size} />;
}
