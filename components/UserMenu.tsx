import { Button, Menu } from "@mantine/core";
import { IconChartBar, IconSettings, IconTrophy, IconUser } from "@tabler/icons-react";

const ICON_SIZE = 16;
const MENU_WIDTH = 180;

const USER_MENU_ITEMS = [
  { href: "profile.html", icon: IconUser, label: "Profile" },
  { href: "profile.html#stats", icon: IconChartBar, label: "Stats" },
  { href: "profile.html#achievements", icon: IconTrophy, label: "Achievements" },
  { href: "profile.html#settings", icon: IconSettings, label: "Settings" }
];

export function UserMenu() {
  return (
    <Menu position="bottom-end" width={MENU_WIDTH} shadow="md">
      <Menu.Target>
        <Button variant="default" leftSection={<IconUser size={ICON_SIZE} />}>User</Button>
      </Menu.Target>
      <Menu.Dropdown>
        {USER_MENU_ITEMS.map((item) => (
          <Menu.Item key={item.label} component="a" href={item.href} leftSection={<item.icon size={ICON_SIZE} />}>
            {item.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
