import { Modal, Stack, Text, Title } from "@mantine/core";

import { HeroSiegeButton } from "./HeroSiegeUi";

const TITLE_ORDER = 3;
const MODAL_BG = "#17100c";
const MODAL_BORDER = "1px solid rgba(210, 168, 84, 0.62)";

export function DeathResetModal(props: { opened: boolean; onReset: () => void }) {
  return (
    <Modal
      opened={props.opened}
      onClose={() => undefined}
      centered
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      title="Permanent Death"
      styles={{
        body: { background: MODAL_BG },
        content: { background: MODAL_BG, border: MODAL_BORDER, borderRadius: 2 },
        header: { background: MODAL_BG, borderBottom: MODAL_BORDER },
        title: { color: "#ffe8a8", fontWeight: 900, textShadow: "0 1px 0 #000" }
      }}
    >
      <Stack gap="md">
        <Title order={TITLE_ORDER}>Your health reached zero.</Title>
        <Text size="sm" c="dimmed">
          Reset your run to continue. This clears your gold, streak, mastered cards, and saved items.
        </Text>
        <HeroSiegeButton fullWidth onClick={props.onReset}>
          Start New Run
        </HeroSiegeButton>
      </Stack>
    </Modal>
  );
}
