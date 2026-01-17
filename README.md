# Power Off Options (Fork)

[Pусский](READMEs/README_ru.md) | [Original Repository](https://github.com/axelitama/power-off-options)

A completely refactored fork of the **Power Off Options** GNOME Shell extension.

This project aims to modernize the codebase, unify the handling of system and custom buttons, and provide full **Wayland support** (including screen off functionality).

## 🚀 Key Features (v2.0 Goals)

### 1. Unified Drag-and-Drop Interface

Unlike the original extension, which separated "Built-in" and "Custom" buttons, this fork treats **all buttons as equals**.

- **Reorder Everything:** You can drag and drop _any_ button (Hibernate, Restart, Custom Scripts) to any position in the list.
- **Toggle Visibility:** Easily enable or disable any button from a single list.
- **GTK4 UI:** A modern, clean preferences window.

### 2. Native Wayland Support

The original extension relied on `xset` to turn off the screen, which does not work on modern Wayland sessions (Fedora, Ubuntu, etc.).

- **Direct Mutter Integration:** We use GNOME's internal API (`global.backend.get_monitor_manager()`) to turn off the screen instantly and reliably on Wayland, without external scripts.

### 3. Modern & Reliable Architecture

- **Single Source of Truth:** Configuration is stored in a unified JSON structure, preventing conflicts between settings.
- **Clean Codebase:** Rewritten from scratch to follow modern GJS (GNOME JavaScript) standards.

## 🛠 Available Options

- **Turn Off Screen** — Immediately turn off the monitor (Wayland & X11 supported).
- **Hybrid Sleep** — Suspend to RAM + Disk (safe on power loss).
- **Suspend then Hibernate** — Suspend now, hibernate automatically later.
- **Hibernate** — Suspend to Disk (requires setup).
- **Soft Reboot** — Restart userspace only (faster than full reboot).
- **Restart to UEFI/BIOS** — Reboot directly into firmware setup.
- **Custom Commands** — Add your own shell scripts or commands.

## 🔧 Installation

### From Source

1. Clone this repository:
    ```
    git clone -b develop https://github.com/furik30/power-off-options.git
    ```
2. Install using the Makefile:
    ```
    make install
    ```
3. Log out and log back in (or restart GNOME Shell).
4. Enable the extension via **Extensions** app.

## ⚙️ Configuration

Open the extension settings:

```
gnome-extensions prefs power-off-options@axelitama.github.io
```

Or click the **"Settings"** button inside the Power Off menu itself.

## 🤝 Contributing

This is a fork focused on stability and modern features. If you find a bug specific to Wayland or the new drag-and-drop system, please open an issue in this repository.

Credits to **@axelitama** for the original idea and extension.