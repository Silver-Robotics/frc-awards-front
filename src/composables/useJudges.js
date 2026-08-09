import { ref, watch } from "vue";
import { useApi } from "./useApi";
import { useEventStore } from "@/stores/eventStore";

/**
 * Fetches judges (with their conflict teams) for the selected event.
 * Each judge object: { idJudges, judgeName, conflicts: [{ idTeams, value, text }] }
 */
export function useJudges() {
  const judges = ref([]);
  const loading = ref(false);
  const api = useApi();
  const eventStore = useEventStore();

  const loadJudges = async () => {
    if (!eventStore.selectedEvent?.value) return;
    loading.value = true;
    try {
      judges.value = await api.apiRequest("judges", {
        method: "GET",
        headers: { eventCode: eventStore.selectedEvent.value },
      });
    } catch {
      judges.value = [];
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => eventStore.selectedEvent,
    (newVal, oldVal) => {
      if (newVal?.value && newVal.value !== oldVal?.value) loadJudges();
    },
    { immediate: true }
  );

  return { judges, loading, refresh: loadJudges };
}
