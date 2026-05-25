import { useEffect, useState } from "react";
import { ActionIcon, Badge, Box, Button, Group, MultiSelect, NumberInput, Popover, Stack, Text, TextInput, ThemeIcon, Tooltip } from "@mantine/core";
import { IconCheck, IconPencil, IconSettings, IconTrash } from "@tabler/icons-react";

import tabSquareBg from "../assets/hero_siege_inventory/tab-square.png";
import { AchievementTrackerStrip } from "./AchievementTrackerStrip";
import { HeroSiegeModeSwitch } from "./HeroSiegeUi";
import { PlayerStatus } from "./PlayerStatus";
import { UserMenu, USER_MENU_SHORTCUTS } from "./UserMenu";
import type { UserMenuSection } from "./UserMenu";
import { STUDY_BLOCKER_MS_PER_MINUTE, useStudyBlockerSettings } from "../hooks/useStudyBlocker";
import { requestCodexQuestionVariant } from "../lib/hintPrompt";
import { retargetCurrentSpireRoomQuestions } from "../lib/spireMapCore";
import { applyCodingCompanyProfile, clearCodingCompanyProfile, getAvailableCodingTags, normalizeCodingCompanyProfiles, normalizeCodingMinRating, normalizeCodingTagWeights, normalizeCodingTags } from "../lib/studyCore";
import type { ActiveWarriorSkillId, CodingCompanyProfile, StudyState } from "../types/study";
import type { CombatImpactVisual } from "./MonsterEncounter";

const PROGRESS_MAX = 100;
const ICON_SIZE = 16;
const NO_COMPANY_PROFILE_ID = "__none__";
const MINUTES_DECIMAL_PLACES = 1;
const TODAY_PROGRESS_WIDTH = 330;
const TODAY_PANEL_HEIGHT = 58;
const TODAY_PROGRESS_HEIGHT = 14;
const HERO_TEXT = "#ffe8a8";
const HERO_DIM = "#c7b081";
const HERO_PANEL_BG = "linear-gradient(180deg, rgba(35, 8, 10, 0.98), rgba(9, 5, 4, 0.98))";
const HERO_PANEL_BORDER = "1px solid rgba(157, 114, 38, 0.72)";
const HERO_PANEL_SHADOW = "inset 0 0 0 1px #050403, inset 0 0 18px rgba(114, 36, 20, 0.22), 0 8px 16px rgba(0, 0, 0, 0.34)";
const HERO_PROGRESS_BG = "linear-gradient(180deg, #050406, #131018 48%, #050406)";
const TODAY_PROGRESS_FILL = "linear-gradient(180deg, #53b8ff 0%, #167bdd 55%, #063c8f 100%)";
const CODING_TAG_PANEL_BG = "linear-gradient(180deg, rgba(25, 10, 8, 0.98), rgba(10, 6, 4, 0.98))";
const CODING_TAG_PANEL_BORDER = "1px solid rgba(214, 166, 66, 0.82)";
const CODING_TAG_ICON_SIZE = 24;
const CODING_MIN_RATING_STEP = 50;
const CODING_TOPIC_WEIGHT_STEP = 5;
const CODING_TOPIC_WEIGHT_MIN = 0;
const CODING_TOPIC_WEIGHT_MAX = 100;
const COMPANY_PROFILE_ID_RADIX = 36;
const COMPANY_PROFILE_PANEL_WIDTH = 620;
const COMPANY_PROFILE_ROW_BG = "linear-gradient(180deg, rgba(35, 19, 12, 0.96), rgba(13, 8, 5, 0.98))";
const COMPANY_PROFILE_ROW_ACTIVE_BG = "linear-gradient(180deg, rgba(73, 33, 20, 0.98), rgba(24, 11, 7, 0.99))";
const COMPANY_PROFILE_ROW_BORDER = "1px solid rgba(210, 168, 84, 0.62)";
const COMPANY_PROFILE_SUGGESTION_ID = "company-profile-suggestion";
type CompanyProfilePanelMode = "select" | "create" | "edit";

export function AppHeader(props: {
  canRetargetActiveRoom?: boolean;
  coins: number;
  health: number;
  hidePlayerStatus?: boolean;
  maxHealth: number;
  modeValue: string;
  onRestartRun?: () => void;
  playerImpact?: CombatImpactVisual | null;
  rating: number;
  state: StudyState;
  setState: React.Dispatch<React.SetStateAction<StudyState>>;
  useActiveSkill: (skillId: ActiveWarriorSkillId) => void;
}) {
  const [activeSection, setActiveSection] = useState<UserMenuSection | null>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat || isEditableShortcutTarget(event.target)) {
        return;
      }
      const shortcut = USER_MENU_SHORTCUTS.find((item) => item.key === event.key.toLowerCase());
      if (!shortcut) {
        return;
      }
      event.preventDefault();
      setActiveSection(shortcut.section);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Group justify="space-between" align="flex-start" wrap="wrap">
      <Group align="flex-start" gap="md" wrap="wrap">
        {!props.hidePlayerStatus && (
          <PlayerStatus
            coins={props.coins}
            health={props.health}
            maxHealth={props.maxHealth}
            onOpenStats={() => setActiveSection("profile")}
            playerImpact={props.playerImpact}
            rating={props.rating}
            state={props.state}
            useActiveSkill={props.useActiveSkill}
          />
        )}
        <TodayProgress />
        <AchievementTrackerStrip state={props.state} onOpenAchievements={() => setActiveSection("achievements")} />
      </Group>
      <Group>
        <ModeControl
          canRetargetActiveRoom={props.canRetargetActiveRoom}
          modeValue={props.modeValue}
          setState={props.setState}
          state={props.state}
        />
        <UserMenu activeSection={activeSection} canRetargetActiveRoom={props.canRetargetActiveRoom} onRestartRun={props.onRestartRun} setActiveSection={setActiveSection} state={props.state} setState={props.setState} />
      </Group>
    </Group>
  );
}

function ModeControl(props: { canRetargetActiveRoom?: boolean; modeValue: string; setState: React.Dispatch<React.SetStateAction<StudyState>>; state: StudyState }) {
  const [opened, setOpened] = useState(false);
  const codingTagOptions = getAvailableCodingTags().map((tag) => ({ label: tag, value: tag }));
  const activeProfileName = getActiveCodingProfileName(props.state);
  const [draftProfiles, setDraftProfiles] = useState<CodingCompanyProfile[]>(() => normalizeCodingCompanyProfiles(props.state.profile.codingProfiles));
  const [draftActiveProfileId, setDraftActiveProfileId] = useState<string | null>(() => props.state.profile.activeCodingProfileId);
  const [panelMode, setPanelMode] = useState<CompanyProfilePanelMode>("select");
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileTags, setProfileTags] = useState<string[]>([]);
  const [profileTagWeights, setProfileTagWeights] = useState<Record<string, number>>({});
  const [profileMinRating, setProfileMinRating] = useState<number | string>(0);
  const [profileSuggestionError, setProfileSuggestionError] = useState("");
  const [profileSuggestionLoading, setProfileSuggestionLoading] = useState(false);
  const resetDraft = () => {
    setDraftProfiles(normalizeCodingCompanyProfiles(props.state.profile.codingProfiles));
    setDraftActiveProfileId(props.state.profile.activeCodingProfileId);
    setPanelMode("select");
    setEditingProfileId(null);
    setProfileName("");
    setProfileTags([]);
    setProfileTagWeights({});
    setProfileMinRating(0);
    setProfileSuggestionError("");
    setProfileSuggestionLoading(false);
  };
  const closeAndReset = () => {
    resetDraft();
    setOpened(false);
  };
  const confirmDraft = () => {
    props.setState((previous) => {
      const withProfiles = { ...previous, profile: { ...previous.profile, codingProfiles: draftProfiles } };
      const next = draftActiveProfileId
        ? applyCodingCompanyProfile(withProfiles, draftActiveProfileId)
        : clearCodingCompanyProfile(withProfiles);
      return props.canRetargetActiveRoom ? retargetCurrentSpireRoomQuestions(next) : next;
    });
    setOpened(false);
  };
  return (
    <Box
      className="mode-control"
      style={{ position: "relative" }}
      onMouseEnter={(event) => {
        const icon = event.currentTarget.querySelector<HTMLElement>(".coding-tag-settings");
        if (icon) {
          icon.style.opacity = "1";
          icon.style.pointerEvents = "auto";
        }
      }}
      onMouseLeave={(event) => {
        if (opened) {
          return;
        }
        const icon = event.currentTarget.querySelector<HTMLElement>(".coding-tag-settings");
        if (icon) {
          icon.style.opacity = "0";
          icon.style.pointerEvents = "none";
        }
      }}
    >
      <HeroSiegeModeSwitch
        codingLabel={activeProfileName ? `Coding: ${activeProfileName}` : "Coding"}
        codingAccessory={
          <Popover opened={opened} onChange={(nextOpened) => {
            if (nextOpened) {
              resetDraft();
            }
            setOpened(nextOpened);
          }} position="bottom-end" width={COMPANY_PROFILE_PANEL_WIDTH} withArrow shadow="lg">
            <Popover.Target>
              <Tooltip label="Company profile" withArrow>
                <Box
                  aria-label="Company profile settings"
                  className="coding-tag-settings"
                  component="button"
                  onClick={() => {
                    if (!opened) {
                      resetDraft();
                    }
                    setOpened((current) => !current);
                  }}
                  style={{
                    alignItems: "center",
                    background: "transparent",
                    border: 0,
                    boxShadow: "none",
                    color: "#ffe8a8",
                    cursor: "pointer",
                    display: "flex",
                    height: CODING_TAG_ICON_SIZE,
                    justifyContent: "center",
                    opacity: opened ? 1 : 0,
                    padding: 0,
                    pointerEvents: opened ? "auto" : "none",
                    position: "absolute",
                    right: 9,
                    top: "50%",
                    transform: "translateY(-50%)",
                    transition: "opacity 120ms ease",
                    width: CODING_TAG_ICON_SIZE,
                    zIndex: 5
                  }}
                  type="button"
                >
                  <IconSettings size={14} />
                </Box>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown style={{ background: CODING_TAG_PANEL_BG, border: CODING_TAG_PANEL_BORDER, boxShadow: HERO_PANEL_SHADOW }}>
              <Stack gap="sm">
                {panelMode === "select" ? (
                  <>
                    <Group justify="space-between" align="center">
                      <Text size="sm" fw={700}>Apply company profile</Text>
                      <Group gap="xs">
                        <Badge variant="light">{getCompanyProfileSummary({ activeProfileId: draftActiveProfileId, profiles: draftProfiles })}</Badge>
                        <Button size="xs" variant="light" onClick={() => setPanelMode("create")}>Add profile</Button>
                      </Group>
                    </Group>
                    {draftProfiles.length > 0 ? (
                      <Stack gap="xs">
                        <CompanyProfileRow
                          selected={draftActiveProfileId === null}
                          profile={{
                            id: NO_COMPANY_PROFILE_ID,
                            name: "No profile",
                            codingTags: [],
                            codingTagWeights: {},
                            codingMinRating: 0
                          }}
                          onDelete={undefined}
                          onSelect={() => setDraftActiveProfileId(null)}
                        />
                        {draftProfiles.map((profile) => (
                          <CompanyProfileRow
                            key={profile.id}
                            selected={draftActiveProfileId === profile.id}
                            profile={profile}
                            onDelete={() => {
                              setDraftProfiles((current) => current.filter((candidate) => candidate.id !== profile.id));
                              if (draftActiveProfileId === profile.id) {
                                setDraftActiveProfileId(null);
                              }
                            }}
                            onEdit={() => {
                              setEditingProfileId(profile.id);
                              setPanelMode("edit");
                              setProfileName(profile.name);
                              setProfileTags(profile.codingTags);
                              setProfileTagWeights(normalizeCodingTagWeights(profile.codingTags, profile.codingTagWeights));
                              setProfileMinRating(profile.codingMinRating);
                              setProfileSuggestionError("");
                            }}
                            onSelect={() => setDraftActiveProfileId(profile.id)}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Box style={{ border: COMPANY_PROFILE_ROW_BORDER, padding: "12px 10px" }}>
                        <Text size="sm" c="dimmed">No saved profiles</Text>
                      </Box>
                    )}
                    <Group justify="flex-end" mt="xs">
                      <Button variant="default" onClick={closeAndReset}>Cancel</Button>
                      <Button onClick={confirmDraft}>Confirm</Button>
                    </Group>
                  </>
                ) : (
                  <>
                    <Group justify="space-between" align="center">
                      <Text size="sm" fw={700}>{panelMode === "edit" ? "Edit company profile" : "Add company profile"}</Text>
                      <Button
                        disabled={!profileName.trim()}
                        loading={profileSuggestionLoading}
                        size="xs"
                        variant="light"
                        onClick={() => suggestCompanyProfile({
                          companyName: profileName,
                          setError: setProfileSuggestionError,
                          setLoading: setProfileSuggestionLoading,
                          setMinRating: setProfileMinRating,
                          setTagWeights: setProfileTagWeights,
                          setTags: setProfileTags,
                          tags: codingTagOptions.map((option) => option.value)
                        })}
                      >
                        Codex suggest
                      </Button>
                    </Group>
                    <TextInput
                      label="Profile name"
                      placeholder="Roblox"
                      value={profileName}
                      onChange={(event) => setProfileName(event.currentTarget.value)}
                    />
                    <MultiSelect
                      clearable
                      data={codingTagOptions}
                      label="Tags"
                      placeholder="All coding tags"
                      searchable
                      value={profileTags}
                      onChange={(value) => {
                        const nextTags = normalizeCodingTags(value);
                        setProfileTags(nextTags);
                        setProfileTagWeights((current) => syncDraftCodingTagWeights(nextTags, current));
                      }}
                    />
                    <TopicWeightControls tags={profileTags} weights={profileTagWeights} setWeights={setProfileTagWeights} />
                    <NumberInput
                      allowDecimal={false}
                      label="Minimum rating"
                      min={0}
                      step={CODING_MIN_RATING_STEP}
                      value={profileMinRating}
                      onChange={(value) => setProfileMinRating(value)}
                    />
                    {profileSuggestionError && <Text size="xs" c="red.3">{profileSuggestionError}</Text>}
                    <Group justify="flex-end" gap="xs" mt="xs">
                      <Button
                        variant="default"
                        onClick={() => {
                          setPanelMode("select");
                          setEditingProfileId(null);
                          setProfileName("");
                          setProfileTags([]);
                          setProfileTagWeights({});
                          setProfileMinRating(0);
                          setProfileSuggestionError("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          const saved = createCodingCompanyProfile(profileName, profileTags, profileTagWeights, profileMinRating, editingProfileId);
                          setDraftProfiles((current) => [...current.filter((profile) => profile.id !== saved.id), saved]);
                          setPanelMode("select");
                          setEditingProfileId(null);
                          setProfileName("");
                          setProfileTags([]);
                          setProfileTagWeights({});
                          setProfileMinRating(0);
                          setProfileSuggestionError("");
                        }}
                      >
                        {panelMode === "edit" ? "Save changes" : "Save profile"}
                      </Button>
                    </Group>
                  </>
                )}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        }
        mode={props.modeValue}
        onChange={(mode) => props.setState((previous) => ({ ...previous, mode }))}
      />
    </Box>
  );
}

function createCodingCompanyProfile(name: string, codingTags: string[], tagWeights: Record<string, number>, minRating: string | number, existingId?: string | null): CodingCompanyProfile {
  const normalizedTags = normalizeCodingTags(codingTags);
  return {
    id: existingId || `company-profile-${Date.now().toString(COMPANY_PROFILE_ID_RADIX)}`,
    name: name.trim() || "Company profile",
    codingTags: normalizedTags,
    codingTagWeights: normalizeCodingTagWeights(normalizedTags, tagWeights),
    codingMinRating: normalizeCodingMinRating(minRating)
  };
}

function TopicWeightControls(props: { setWeights: React.Dispatch<React.SetStateAction<Record<string, number>>>; tags: string[]; weights: Record<string, number> }) {
  if (!props.tags.length) {
    return null;
  }
  const total = props.tags.reduce((sum, tag) => sum + normalizeDraftTopicWeight(props.weights[tag]), 0);
  return (
    <Stack gap={6}>
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500}>Topic percentages</Text>
        <Badge color={total === 100 ? "green" : "yellow"} variant="light">{total}%</Badge>
      </Group>
      {props.tags.map((tag) => (
        <Group key={tag} justify="space-between" gap="sm" wrap="nowrap">
          <Text size="sm" truncate>{tag}</Text>
          <NumberInput
            allowDecimal={false}
            aria-label={`${tag} percentage`}
            max={CODING_TOPIC_WEIGHT_MAX}
            min={CODING_TOPIC_WEIGHT_MIN}
            step={CODING_TOPIC_WEIGHT_STEP}
            value={normalizeDraftTopicWeight(props.weights[tag])}
            onChange={(value) => props.setWeights((current) => setDraftTopicWeight(props.tags, current, tag, value))}
            styles={{ input: { width: 92 } }}
          />
        </Group>
      ))}
    </Stack>
  );
}

function setDraftTopicWeight(tags: string[], current: Record<string, number>, tag: string, value: string | number) {
  const target = normalizeDraftTopicWeight(value);
  const otherTags = tags.filter((candidate) => candidate !== tag);
  if (!otherTags.length) {
    return { [tag]: CODING_TOPIC_WEIGHT_MAX };
  }
  const remaining = CODING_TOPIC_WEIGHT_MAX - target;
  const otherTotal = otherTags.reduce((sum, candidate) => sum + normalizeDraftTopicWeight(current[candidate]), 0);
  const balanced = distributeDraftTopicWeights(
    otherTags,
    otherTotal > 0
      ? Object.fromEntries(otherTags.map((candidate) => [candidate, normalizeDraftTopicWeight(current[candidate]) / otherTotal]))
      : Object.fromEntries(otherTags.map((candidate) => [candidate, 1 / otherTags.length])),
    remaining
  );
  return { ...balanced, [tag]: target };
}

function distributeDraftTopicWeights(tags: string[], ratios: Record<string, number>, total: number) {
  let remaining = total;
  return Object.fromEntries(tags.map((tag, index) => {
    const value = index === tags.length - 1
      ? remaining
      : Math.min(remaining, Math.max(CODING_TOPIC_WEIGHT_MIN, Math.round((ratios[tag] || 0) * total)));
    remaining -= value;
    return [tag, value];
  }));
}

function syncDraftCodingTagWeights(tags: string[], current: Record<string, number>) {
  const seeded = Object.fromEntries(tags.map((tag) => [tag, current[tag] ?? CODING_TOPIC_WEIGHT_MAX / Math.max(1, tags.length)]));
  return normalizeCodingTagWeights(tags, seeded);
}

function normalizeDraftTopicWeight(value: string | number | undefined) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(CODING_TOPIC_WEIGHT_MIN, Math.min(CODING_TOPIC_WEIGHT_MAX, Math.round(numeric))) : CODING_TOPIC_WEIGHT_MIN;
}

async function suggestCompanyProfile(params: {
  companyName: string;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  setMinRating: (rating: number) => void;
  setTagWeights: (weights: Record<string, number>) => void;
  setTags: (tags: string[]) => void;
  tags: string[];
}) {
  const companyName = params.companyName.trim();
  if (!companyName) {
    params.setError("Enter a company name first.");
    return;
  }
  params.setError("");
  params.setLoading(true);
  try {
    const response = await requestCodexQuestionVariant(COMPANY_PROFILE_SUGGESTION_ID, createCompanyProfileSuggestionPrompt(companyName, params.tags));
    if (!response.ok || !response.text) {
      params.setError(response.error || "Codex could not suggest a profile.");
      return;
    }
    const suggestion = parseCompanyProfileSuggestion(response.text, params.tags);
    if (!suggestion.tags.length) {
      params.setError("Codex did not return matching tags.");
      return;
    }
    params.setTags(suggestion.tags);
    params.setTagWeights(normalizeCodingTagWeights(suggestion.tags, suggestion.tagWeights));
    params.setMinRating(suggestion.minRating);
  } catch (error) {
    params.setError(error instanceof Error ? error.message : "Codex suggestion failed.");
  } finally {
    params.setLoading(false);
  }
}

function createCompanyProfileSuggestionPrompt(companyName: string, tags: string[]) {
  return [
    "Suggest a coding interview practice profile for this company.",
    "Return JSON only with this exact shape: {\"tags\":[\"DFS\"],\"tagWeights\":{\"DFS\":100},\"minRating\":2000}",
    "Rules:",
    "- tags must be exact strings from the available tags list.",
    "- choose 2 to 5 tags.",
    "- tagWeights must use the selected tag strings as keys and integer percentages totaling 100.",
    "- minRating must be an integer multiple of 50 between 0 and 3500.",
    "- bias toward common interview patterns for the company.",
    "",
    `Company: ${companyName}`,
    `Available tags: ${tags.join(", ")}`
  ].join("\n");
}

function parseCompanyProfileSuggestion(text: string, availableTags: string[]) {
  const parsed = JSON.parse(extractJsonObject(text)) as { minRating?: unknown; tagWeights?: unknown; tags?: unknown; weights?: unknown };
  const available = new Set(availableTags);
  const tags = Array.isArray(parsed.tags)
    ? normalizeCodingTags(parsed.tags.filter((tag): tag is string => typeof tag === "string" && available.has(tag)))
    : [];
  const tagWeights = normalizeCodingTagWeights(tags, parsed.tagWeights ?? parsed.weights);
  const minRating = normalizeCodingMinRating(parsed.minRating);
  return { minRating, tagWeights, tags };
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Codex did not return JSON.");
  }
  return match[0];
}

function CompanyProfileRow(props: { onDelete?: () => void; onEdit?: () => void; onSelect: () => void; profile: CodingCompanyProfile; selected: boolean }) {
  return (
    <Box
      aria-label={`Select ${props.profile.name} company profile`}
      component="div"
      onClick={props.onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          props.onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      style={getCompanyProfileRowStyle(props.selected)}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          <ThemeIcon size={26} radius={0} color={props.selected ? "yellow" : "dark"} variant={props.selected ? "light" : "outline"}>
            {props.selected ? <IconCheck size={ICON_SIZE} /> : null}
          </ThemeIcon>
          <Box style={{ minWidth: 0 }}>
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" fw={800} truncate>{props.profile.name}</Text>
              {props.selected && <Badge size="xs" variant="light" color="yellow">Selected</Badge>}
            </Group>
            <Text size="xs" c="dimmed" truncate>{getCodingProfileSummary(props.profile)}</Text>
          </Box>
        </Group>
        {props.onDelete || props.onEdit ? (
          <Group gap={4} wrap="nowrap">
            {props.onEdit && (
              <ActionIcon
                aria-label={`Edit ${props.profile.name}`}
                color="blue"
                onClick={(event) => {
                  event.stopPropagation();
                  props.onEdit?.();
                }}
                variant="subtle"
              >
                <IconPencil size={ICON_SIZE} />
              </ActionIcon>
            )}
            {props.onDelete && (
              <ActionIcon
                aria-label={`Delete ${props.profile.name}`}
                color="red"
                onClick={(event) => {
                  event.stopPropagation();
                  props.onDelete?.();
                }}
                variant="subtle"
              >
                <IconTrash size={ICON_SIZE} />
              </ActionIcon>
            )}
          </Group>
        ) : (
          <Box style={{ width: 60 }} />
        )}
      </Group>
    </Box>
  );
}

function getCompanyProfileRowStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? COMPANY_PROFILE_ROW_ACTIVE_BG : COMPANY_PROFILE_ROW_BG,
    border: active ? "1px solid rgba(246, 211, 112, 0.82)" : COMPANY_PROFILE_ROW_BORDER,
    boxShadow: active ? "inset 0 0 0 1px rgba(0, 0, 0, 0.82), 0 0 12px rgba(246, 211, 112, 0.12)" : "inset 0 0 0 1px rgba(0, 0, 0, 0.72)",
    color: HERO_TEXT,
    cursor: "pointer",
    display: "block",
    padding: "9px 10px",
    textAlign: "left",
    width: "100%"
  };
}

function getCompanyProfileSummary(props: { activeProfileId: string | null; profiles: CodingCompanyProfile[] }) {
  const activeProfile = props.profiles.find((profile) => profile.id === props.activeProfileId);
  if (activeProfile) {
    return activeProfile.name;
  }
  return "No profile";
}

function getCodingProfileSummary(profile: CodingCompanyProfile) {
  if (profile.id === NO_COMPANY_PROFILE_ID) {
    return "Use all coding questions without a saved company profile";
  }
  const minRating = normalizeCodingMinRating(profile.codingMinRating);
  const tags = profile.codingTags.length ? getCodingTagWeightSummary(profile.codingTags, profile.codingTagWeights) : "All tags";
  return `${tags} | ${minRating ? `${minRating}+` : "Any rating"}`;
}

function getCodingTagWeightSummary(tags: string[], weights: unknown) {
  const normalizedWeights = normalizeCodingTagWeights(tags, weights);
  return tags.map((tag) => `${tag} ${normalizedWeights[tag] ?? 0}%`).join(", ");
}

function getActiveCodingProfileName(state: StudyState) {
  return state.profile.codingProfiles.find((profile) => profile.id === state.profile.activeCodingProfileId)?.name || "";
}

function isEditableShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || ["input", "select", "textarea"].includes(tagName) || Boolean(target.closest("[contenteditable='true'], [role='textbox'], .monaco-editor"));
}

function TodayProgress() {
  const { progress, settings } = useStudyBlockerSettings();
  const studiedMinutes = progress.studiedMs / STUDY_BLOCKER_MS_PER_MINUTE;
  const progressValue = settings.dailyMinutes > 0 ? (studiedMinutes / settings.dailyMinutes) * PROGRESS_MAX : PROGRESS_MAX;
  const clampedProgress = Math.min(PROGRESS_MAX, Math.max(0, progressValue));
  return (
    <Box
      style={{
        background: HERO_PANEL_BG,
        border: HERO_PANEL_BORDER,
        borderRadius: 2,
        boxShadow: HERO_PANEL_SHADOW,
        display: "flex",
        flexDirection: "column",
        gap: 7,
        height: TODAY_PANEL_HEIGHT,
        imageRendering: "pixelated",
        minWidth: TODAY_PROGRESS_WIDTH,
        padding: "8px 12px",
        position: "relative"
      }}
    >
      <Group justify="space-between" wrap="nowrap" style={{ minHeight: 18 }}>
        <Text size="sm" fw={900} style={{ color: HERO_TEXT, lineHeight: 1, textShadow: "0 2px 0 #000" }}>Today</Text>
        <Text size="sm" fw={900} style={{ color: HERO_TEXT, fontVariantNumeric: "tabular-nums", lineHeight: 1, textShadow: "0 2px 0 #000" }}>{studiedMinutes.toFixed(MINUTES_DECIMAL_PLACES)} / {settings.dailyMinutes} min</Text>
      </Group>
      <Box
        aria-label={`Daily study progress ${Math.round(clampedProgress)}%`}
        role="progressbar"
        style={{
          background: HERO_PROGRESS_BG,
          border: "1px solid rgba(0, 0, 0, 0.94)",
          boxShadow: "inset 0 0 0 1px rgba(255, 232, 168, 0.12), 0 2px 0 rgba(0, 0, 0, 0.7)",
          height: TODAY_PROGRESS_HEIGHT,
          overflow: "hidden",
          padding: 2,
          position: "relative"
        }}
      >
        <Box
          style={{
            background: TODAY_PROGRESS_FILL,
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.32), inset 0 -1px 0 rgba(0, 0, 0, 0.48), 0 0 8px rgba(58, 151, 255, 0.42)",
            height: "100%",
            minWidth: clampedProgress > 0 ? 6 : 0,
            position: "relative",
            zIndex: 1,
            width: `${clampedProgress}%`
          }}
        />
        <Box
          aria-hidden="true"
          style={{
            backgroundImage: `url(${tabSquareBg})`,
            backgroundPosition: "center",
            backgroundSize: "100% 100%",
            inset: 0,
            opacity: 0.16,
            position: "absolute"
          }}
        />
      </Box>
    </Box>
  );
}
