import { io } from "socket.io-client";
import { watch } from "vue";
import { useEventStore } from "@/stores/eventStore";

// ── Module-level singleton ────────────────────────────────────────────────────
// One socket connection shared across all composable calls.
let _socket = null;
let _currentRoom = null;
let _roomWatcherReady = false;

function getSocket() {
  if (!_socket) {
    _socket = io(process.env.VUE_APP_SERVER_DOMAIN, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    // Rejoin the room automatically after a reconnect
    _socket.on("connect", () => {
      if (_currentRoom) _socket.emit("join", _currentRoom);
    });
  }
  return _socket;
}

/**
 * Returns the singleton Socket.IO client.
 * On first call, sets up a watcher that keeps the client joined to the
 * room matching the currently selected event.
 */
export function useSocket() {
  const socket = getSocket();
  const eventStore = useEventStore();

  if (!_roomWatcherReady) {
    _roomWatcherReady = true;

    watch(
      () => eventStore.selectedEvent?.value,
      (newCode, oldCode) => {
        if (oldCode && oldCode !== newCode) socket.emit("leave", oldCode);
        if (newCode) {
          socket.emit("join", newCode);
          _currentRoom = newCode;
        }
      },
      { immediate: true }
    );
  }

  return socket;
}
