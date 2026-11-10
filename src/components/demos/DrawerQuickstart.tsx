import * as Drawer from "@drawerdeck/react";
import "./demos.css";

const SETTINGS = [
  "Appearance",
  "Notifications",
  "Privacy",
  "Security",
  "Accounts",
  "Language and region",
  "Accessibility",
  "Storage and data",
  "Connected apps",
  "About",
];

export default function DrawerQuickstart() {
  return (
    <div className="demo not-prose">
      <div className="demo-drawer">
        <Drawer.Root snapPoints={[0.5, 1]}>
          <Drawer.Trigger className="demo-button">Open drawer</Drawer.Trigger>
          <Drawer.Popup>
            <Drawer.Backdrop className="demo-drawer__backdrop" />
            <Drawer.Viewport>
              <Drawer.Panel className="demo-drawer__panel">
                <Drawer.Handle className="demo-drawer__handle" />
                <Drawer.Title className="demo-drawer__title">
                  Settings
                </Drawer.Title>
                <Drawer.Content className="demo-drawer__content">
                  <ul className="demo-drawer__list">
                    {SETTINGS.map(setting => (
                      <li key={setting}>{setting}</li>
                    ))}
                  </ul>
                </Drawer.Content>
                <Drawer.Close className="demo-button">Done</Drawer.Close>
              </Drawer.Panel>
            </Drawer.Viewport>
          </Drawer.Popup>
        </Drawer.Root>
      </div>
      <p className="demo-caption">
        Drag it between half and full, flick it closed, or press Escape. On a
        phone, try it with a busy page behind it.
      </p>
    </div>
  );
}
