import { ref, computed, watch } from "vue";
import { useApi } from "./useApi";
import { useEventStore } from "@/stores/eventStore";

/**
 * Fetches pairs for the selected event.
 * Each pair: { idPair, judges: [{idJudges, judgeName}], teams: [...] }
 *
 * Also exposes `pairOptions` — a display list ready for a v-combobox:
 *   { value: idPair, text: "Dupla 1 — Alice / Bruno" }
 */
export function usePairs() {
  const pairs = ref([]);
  const loading = ref(false);
  const api = useApi();
  const eventStore = useEventStore();

  const loadPairs = async () => {
    if (!eventStore.selectedEvent?.value) return;
    loading.value = true;
    try {
      pairs.value = await api.apiRequest("pairs", {
        method: "GET",
        headers: { eventCode: eventStore.selectedEvent.value },
      });
    } catch {
      pairs.value = [];
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => eventStore.selectedEvent,
    (newVal, oldVal) => {
      if (newVal?.value && newVal.value !== oldVal?.value) loadPairs();
    },
    { immediate: true }
  );

  /**
   * Ready-to-use options for selectors.
   * Each item: { value: idPair, text: "Alice / Bruno", type: 'mci' | 'ta' | null }
   */
  const pairOptions = computed(() =>
    pairs.value.map((pair, idx) => {
      const text = pair.judges.length
        ? pair.judges.map((j) => j.judgeName).join(" / ")
        : `Dupla ${idx + 1}`;
      return { value: pair.idPair, text, type: pair.type ?? null };
    })
  );

  return { pairs, pairOptions, loading, refresh: loadPairs };
}
