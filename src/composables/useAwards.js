import { ref, watch } from "vue";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";

/**
 * Fetches and groups awards for the selected event.
 * Automatically recalculates the Inspire Award eligibility (FTC only).
 */
export function useAwards() {
  const groupedAwards = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const api = useApi();
  const eventStore = useEventStore();

  const loadAwards = async () => {
    if (!eventStore.selectedEvent?.value) return;
    loading.value = true;
    error.value = null;
    try {
      const result = await api.apiRequest("awards", {
        method: "GET",
        headers: { eventCode: eventStore.selectedEvent.value },
      });

      const teamStats = {};
      const grouped = {};

      result.forEach((item) => {
        const teamId = item.Teams_idTeams;

        // Accumulate per-team category stats for Inspire eligibility
        if (!teamStats[teamId]) {
          teamStats[teamId] = {
            hasAE: false,
            hasMCI: false,
            hasThink: false,
            teamNumber: item.teamNumber,
            teamName: item.teamName,
            nominated: true,
          };
        }
        if (item.category === "AE") teamStats[teamId].hasAE = true;
        if (item.category === "MCI") teamStats[teamId].hasMCI = true;
        if (item.awardName === "Think Award") teamStats[teamId].hasThink = true;

        // Group by award name
        if (!grouped[item.awardName]) {
          grouped[item.awardName] = { name: item.awardName, teams: [] };
        }
        grouped[item.awardName].teams.push(item);
      });

      // Inspire Award: teams with AE + MCI + Think Award nominations
      const inspireTeams = Object.values(teamStats).filter(
        (t) => t.hasAE && t.hasMCI && t.hasThink
      );
      if (inspireTeams.length > 0) {
        grouped["Inspire Award"] = { name: "Inspire Award", teams: inspireTeams };
      } else {
        delete grouped["Inspire Award"];
      }

      groupedAwards.value = Object.values(grouped);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => eventStore.selectedEvent,
    (newVal, oldVal) => {
      if (newVal?.value !== oldVal?.value) loadAwards();
    },
    { immediate: true }
  );

  return { groupedAwards, loading, error, refresh: loadAwards };
}
