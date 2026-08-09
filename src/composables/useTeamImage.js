import { computed } from "vue";
import standardImg from "@/assets/fotos_times/standard.webp";

/**
 * Returns a computed image src for a team, preferring the server-hosted
 * imageLink and falling back to a static placeholder.
 *
 * Replaces the old require()-based pattern that was copy-pasted across
 * ListTeams, NonNominated, and Visits.
 *
 * @param {import('vue').Ref<Array>} teams - reactive teams array
 * @param {import('vue').Ref<number>} index - current selected index
 */
export function useTeamImage(teams, index) {
  const teamImageSrc = computed(() => {
    const team = teams.value[index.value];
    if (!team) return standardImg;
    return team.imageLink || standardImg;
  });

  return { teamImageSrc };
}
