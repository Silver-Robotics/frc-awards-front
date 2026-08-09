import { ref, watch } from "vue";
import { useApi } from "./useApi";
import { useEventStore } from "@/stores/eventStore";

export function useImpactSchedule() {
  const api        = useApi();
  const eventStore = useEventStore();

  const days    = ref([]);
  const rooms   = ref([]);
  const slots   = ref([]);
  const loading = ref(false);

  const hdr = () => ({ eventCode: eventStore.selectedEvent?.value ?? "" });

  // ── Days ──────────────────────────────────────────────────────────────────
  const fetchDays = async () => {
    if (!eventStore.selectedEvent?.value) return;
    try {
      days.value = await api.apiRequest("impact-days", { headers: hdr() });
    } catch { days.value = []; }
  };

  const addDay = async (label) => {
    await api.apiRequest("impact-days", {
      method: "POST",
      headers: hdr(),
      body: JSON.stringify({ label, sortOrder: days.value.length }),
    });
    await fetchDays();
  };

  const renameDay = async (idDay, label) => {
    await api.apiRequest(`impact-days/${idDay}`, {
      method: "PUT",
      body: JSON.stringify({ label }),
    });
    await fetchDays();
  };

  const deleteDay = async (idDay) => {
    await api.apiRequest(`impact-days/${idDay}`, { method: "DELETE" });
    await fetchDays();
  };

  // ── Rooms ─────────────────────────────────────────────────────────────────
  const fetchRooms = async () => {
    if (!eventStore.selectedEvent?.value) return;
    try {
      rooms.value = await api.apiRequest("impact-rooms", { headers: hdr() });
    } catch { rooms.value = []; }
  };

  const addRoom = async (name) => {
    await api.apiRequest("impact-rooms", {
      method: "POST",
      headers: hdr(),
      body: JSON.stringify({ name, sortOrder: rooms.value.length }),
    });
    await fetchRooms();
  };

  const renameRoom = async (idRoom, name) => {
    await api.apiRequest(`impact-rooms/${idRoom}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
    await fetchRooms();
  };

  const deleteRoom = async (idRoom) => {
    await api.apiRequest(`impact-rooms/${idRoom}`, { method: "DELETE" });
    await fetchRooms();
  };

  // ── Slots (current view) ──────────────────────────────────────────────────
  const fetchSlots = async (dayId, roomId) => {
    if (!dayId || !roomId) { slots.value = []; return; }
    loading.value = true;
    try {
      slots.value = await api.apiRequest(
        `impact-slots?dayId=${dayId}&roomId=${roomId}`,
        { headers: hdr() }
      );
    } catch { slots.value = []; }
    finally { loading.value = false; }
  };

  // ── Slots (non-mutating, used by PDF generator) ───────────────────────────
  const fetchSlotsRaw = async (dayId, roomId) => {
    if (!dayId || !roomId) return [];
    try {
      return await api.apiRequest(
        `impact-slots?dayId=${dayId}&roomId=${roomId}`,
        { headers: hdr() }
      );
    } catch { return []; }
  };

  const addSlot = async (payload) => {
    await api.apiRequest("impact-slots", {
      method: "POST",
      headers: hdr(),
      body: JSON.stringify(payload),
    });
  };

  const deleteSlot = async (idSlot) => {
    await api.apiRequest(`impact-slots/${idSlot}`, { method: "DELETE" });
  };

  watch(
    () => eventStore.selectedEvent,
    (nv, ov) => {
      if (nv?.value && nv.value !== ov?.value) {
        fetchDays();
        fetchRooms();
      }
    },
    { immediate: true }
  );

  return {
    days, rooms, slots, loading,
    fetchDays, addDay, renameDay, deleteDay,
    fetchRooms, addRoom, renameRoom, deleteRoom,
    fetchSlots, fetchSlotsRaw,
    addSlot, deleteSlot,
  };
}
