import { ref, watch } from "vue";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";

/**
 * Fetches teams for the selected event and reloads whenever the event changes.
 * @param {string} [endpoint="teams"] - API endpoint (override for non-nominated, etc.)
 */
export function useTeams(endpoint = "teams") {
  const teams = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const api = useApi();
  const eventStore = useEventStore();

  const loadTeams = async () => {
    if (!eventStore.selectedEvent?.value) return;
    loading.value = true;
    error.value = null;
    try {
      teams.value = await api.apiRequest(endpoint, {
        method: "GET",
        headers: { eventCode: eventStore.selectedEvent.value },
      });
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => eventStore.selectedEvent,
    (newVal, oldVal) => {
      if (newVal?.value && newVal.value !== oldVal?.value) loadTeams();
    },
    { immediate: true }
  );

  return { teams, loading, error, refresh: loadTeams };
}
