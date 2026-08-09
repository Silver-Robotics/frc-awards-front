import { ref, computed, watch, onScopeDispose } from "vue";
import { useApi } from "./useApi";
import { useEventStore } from "@/stores/eventStore";
import { useSocket } from "@/composables/useSocket";

/**
 * Manages ceremony scripts for award winners.
 * Each script has: idScripts, awardName, teamNumber, teamName,
 *                  scriptText, status ('pending'|'accepted'|'rejected'),
 *                  submittedBy, createdAt, updatedAt
 */
export function useScripts() {
  const scripts = ref([]);
  const loading = ref(false);
  const api     = useApi();
  const eventStore = useEventStore();

  const load = async () => {
    if (!eventStore.selectedEvent?.value) return;
    loading.value = true;
    try {
      scripts.value = await api.apiRequest("scripts", {
        method: "GET",
        headers: { eventCode: eventStore.selectedEvent.value },
      });
    } catch {
      scripts.value = [];
    } finally {
      loading.value = false;
    }
  };

  // O(1) lookup: awardName → script
  const scriptByAward = computed(() => {
    const map = new Map();
    for (const s of scripts.value) map.set(s.awardName, s);
    return map;
  });

  const impactScript = computed(() => scriptByAward.value.get("Impact Award") ?? null);

  watch(
    () => eventStore.selectedEvent,
    (newVal, oldVal) => {
      if (newVal?.value !== oldVal?.value) load();
    },
    { immediate: true }
  );

  // Real-time: reload whenever an admin accepts/rejects or a judge submits
  const socket = useSocket();
  socket.on("scripts:changed", load);
  onScopeDispose(() => socket.off("scripts:changed", load));

  const eventHeaders = () => ({ eventCode: eventStore.selectedEvent?.value });

  const submit = async (awardName, teamNumber, teamName, scriptText) => {
    await api.apiRequest("scripts", {
      method: "POST",
      headers: eventHeaders(),
      body: JSON.stringify({ awardName, teamNumber, teamName, scriptText }),
    });
    await load();
  };

  const resubmit = async (scriptId, scriptText) => {
    await api.apiRequest(`scripts/${scriptId}`, {
      method: "PATCH",
      body: JSON.stringify({ scriptText }),
    });
    await load();
  };

  const updateWinner = async (scriptId, teamNumber, teamName) => {
    await api.apiRequest(`scripts/${scriptId}/winner`, {
      method: "PATCH",
      body: JSON.stringify({ teamNumber, teamName }),
    });
    await load();
  };

  const accept = async (scriptId) => {
    await api.apiRequest(`scripts/${scriptId}/accept`, { method: "PATCH" });
    await load();
  };

  const reject = async (scriptId) => {
    await api.apiRequest(`scripts/${scriptId}/reject`, { method: "PATCH" });
    await load();
  };

  return { scripts, scriptByAward, impactScript, loading, load, submit, resubmit, updateWinner, accept, reject };
}
