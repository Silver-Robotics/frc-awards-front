import { ref, watch } from "vue";
import { useApi } from "./useApi";
import { useEventStore } from "@/stores/eventStore";
import { MCI_DEFAULTS, TA_DEFAULTS } from "@/constants/awards";

/**
 * Manages Day-2 award → group assignments for the selected event.
 *
 * Internal key format: "<pairType>:<awardName>"
 *   e.g. "mci:Autonomous" → "A", "ta:Imagery" → "C"
 */

// Built once at module level so the very first synchronous render already has
// sensible default counts — no flash of zeros while the async load is in flight.
function buildDefaults() {
  const map = {};
  for (const [a, g] of Object.entries(MCI_DEFAULTS)) map[`mci:${a}`] = g;
  for (const [a, g] of Object.entries(TA_DEFAULTS))  map[`ta:${a}`]  = g;
  return map;
}

export function useAwardGroups() {
  // Pre-seeded with defaults — correct counts are visible immediately.
  const assignments = ref(buildDefaults());
  const loading     = ref(false);
  const saving      = ref(false);
  const { apiRequest } = useApi();
  const eventStore  = useEventStore();

  const load = async () => {
    if (!eventStore.selectedEvent?.value) return;
    loading.value = true;
    try {
      const data = await apiRequest("award-groups", {
        method: "GET",
        headers: { eventCode: eventStore.selectedEvent.value },
      });
      const map = buildDefaults();
      for (const { awardName, pairType, day2Group } of data) {
        // Only override a default when the DB value is an actual group letter.
        // Null values (stale or manually cleared rows) must not silently erase defaults.
        if (day2Group != null) {
          map[`${pairType}:${awardName}`] = day2Group;
        }
      }
      assignments.value = map;
    } catch {
      assignments.value = buildDefaults();
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => eventStore.selectedEvent,
    (newVal, oldVal) => {
      if (newVal?.value && newVal.value !== oldVal?.value) load();
    },
    { immediate: true }
  );

  /** Get the Day-2 group assigned to a specific award. */
  const getGroup = (pairType, awardName) =>
    assignments.value[`${pairType}:${awardName}`] ?? null;

  /**
   * Set the Day-2 group for a specific award, then persist the full
   * assignments map to the backend.
   */
  const setGroup = async (pairType, awardName, day2Group) => {
    const key  = `${pairType}:${awardName}`;
    const prev = assignments.value[key];
    assignments.value[key] = day2Group;

    saving.value = true;
    try {
      await apiRequest("award-groups", {
        method: "PUT",
        headers: { eventCode: eventStore.selectedEvent.value },
        body: JSON.stringify({
          assignments: Object.entries(assignments.value).map(([k, v]) => {
            const colonIdx = k.indexOf(":");
            return {
              pairType:  k.slice(0, colonIdx),
              awardName: k.slice(colonIdx + 1),
              day2Group: v,
            };
          }),
        }),
      });
    } catch (err) {
      assignments.value[key] = prev;
      console.error("Failed to save award groups:", err);
    } finally {
      saving.value = false;
    }
  };

  return { assignments, loading, saving, getGroup, setGroup, refresh: load };
}
