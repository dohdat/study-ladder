import { HeroSiegeRelicIcon } from "./HeroSiegeItemIcon";
import type { Relic } from "../types/study";

export function RelicIcon(props: { relic: Relic; size?: number; unframed?: boolean }) {
  return <HeroSiegeRelicIcon relic={props.relic} size={props.size} unframed={props.unframed} />;
}
