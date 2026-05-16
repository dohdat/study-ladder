import { Button, Modal, Stack, Text, Title } from "@mantine/core";

const TITLE_ORDER = 3;

export function DeathResetModal(props: { opened: boolean; onReset: () => void }) {
  return (
    <Modal opened={props.opened} onClose={() => undefined} centered withCloseButton={false} closeOnClickOutside={false} closeOnEscape={false} title="Permanent Death">
      <Stack gap="md">
        <Title order={TITLE_ORDER}>Your health reached zero.</Title>
        <Text size="sm" c="dimmed">
          Reset your character to continue. This clears your gold, experience, streak, mastered cards, and saved items.
        </Text>
        <Button color="red" fullWidth onClick={props.onReset}>
          Reset to Level 1
        </Button>
      </Stack>
    </Modal>
  );
}
