<template>
  <div>
    <!-- ── Top action bar ─────────────────────────────────────────────────── -->
    <v-row align="center" no-gutters class="mb-4">
      <v-col class="d-flex" style="gap:8px">
        <v-btn
          size="small" variant="tonal" color="#007FBC"
          prepend-icon="mdi-calendar-plus"
          @click="addDayDialog = true"
        >Novo Dia</v-btn>
        <v-btn
          size="small" variant="tonal" color="#007FBC"
          prepend-icon="mdi-door-open"
          @click="addRoomDialog = true"
        >Nova Sala</v-btn>
      </v-col>
      <v-col class="text-right">
        <v-btn
          size="small" variant="flat" color="#c62828"
          prepend-icon="mdi-file-pdf-box"
          :loading="pdfLoading"
          :disabled="days.length === 0 || rooms.length === 0"
          @click="downloadPdf"
          style="color:#fff"
        >Baixar PDF</v-btn>
      </v-col>
    </v-row>

    <!-- ── Empty state ────────────────────────────────────────────────────── -->
    <v-card v-if="days.length === 0 || rooms.length === 0"
      variant="tonal" color="grey" class="pa-8 text-center"
    >
      <v-icon size="40" color="grey-lighten-1">mdi-calendar-clock</v-icon>
      <div class="mt-3 text-body-2 text-grey-darken-1">
        Adicione ao menos <strong>um dia</strong> e <strong>uma sala</strong>
        para começar a montar o cronograma.
      </div>
    </v-card>

    <template v-else>
      <!-- ── Day chips ────────────────────────────────────────────────────── -->
      <div class="label-row mb-2">
        <span class="dim-label">DIAS</span>
        <v-chip
          v-for="day in days" :key="day.idDay"
          :color="selectedDayId === day.idDay ? '#007FBC' : undefined"
          :variant="selectedDayId === day.idDay ? 'flat' : 'tonal'"
          size="small"
          class="selectable-chip"
          @click="selectDay(day.idDay)"
        >
          {{ day.label }}
          <v-icon size="12" class="ml-1" @click.stop="openRenameDay(day)">mdi-pencil</v-icon>
          <v-icon size="12" class="ml-1" @click.stop="confirmDeleteDay(day)">mdi-close-circle</v-icon>
        </v-chip>
      </div>

      <!-- ── Room chips ────────────────────────────────────────────────────── -->
      <div class="label-row mb-4">
        <span class="dim-label">SALAS</span>
        <v-chip
          v-for="room in rooms" :key="room.idRoom"
          :color="selectedRoomId === room.idRoom ? '#007FBC' : undefined"
          :variant="selectedRoomId === room.idRoom ? 'flat' : 'tonal'"
          size="small"
          class="selectable-chip"
          @click="selectRoom(room.idRoom)"
        >
          {{ room.name }}
          <v-icon size="12" class="ml-1" @click.stop="openRenameRoom(room)">mdi-pencil</v-icon>
          <v-icon size="12" class="ml-1" @click.stop="confirmDeleteRoom(room)">mdi-close-circle</v-icon>
        </v-chip>
      </div>

      <!-- ── Slot editor ───────────────────────────────────────────────────── -->
      <v-card v-if="selectedDayId && selectedRoomId" variant="outlined" class="pa-4">
        <!-- Editor header -->
        <div class="d-flex align-center mb-4">
          <v-icon icon="mdi-clock-outline" color="#007FBC" class="mr-2" />
          <span class="font-weight-bold">
            {{ selectedDay?.label }} · {{ selectedRoom?.name }}
          </span>
          <v-chip size="x-small" class="ml-3" color="grey">
            {{ sortedSlots.length }} horários
          </v-chip>
        </div>

        <!-- ── Add slot form ──────────────────────────────────────────────── -->
        <v-card variant="tonal" color="#007FBC" class="pa-3 mb-4">
          <v-row dense align="end">
            <v-col cols="12" sm="2">
              <v-text-field
                v-model="form.slotTime"
                label="Horário"
                placeholder="09:30"
                density="compact"
                variant="outlined"
                bg-color="white"
                hide-details
              />
            </v-col>

            <v-col cols="12" sm="3">
              <v-select
                v-model="form.slotType"
                :items="slotTypeOptions"
                item-title="label"
                item-value="value"
                label="Tipo"
                density="compact"
                variant="outlined"
                bg-color="white"
                hide-details
              />
            </v-col>

            <v-col v-if="form.slotType === 'team'" cols="12" sm="5">
              <v-autocomplete
                v-model="form.selectedTeam"
                :items="teamOptions"
                item-title="label"
                item-value="id"
                label="Equipe"
                density="compact"
                variant="outlined"
                bg-color="white"
                hide-details
                clearable
                return-object
                no-data-text="Nenhuma equipe encontrada"
              />
            </v-col>

            <v-col cols="12" :sm="form.slotType === 'team' ? 2 : 7" class="d-flex justify-end">
              <v-btn
                color="#007FBC"
                variant="flat"
                style="color:#fff"
                :disabled="!canAdd"
                :loading="addingSlot"
                @click="submitSlot"
              >
                <v-icon>mdi-plus</v-icon> Adicionar
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <!-- ── Slots list ─────────────────────────────────────────────────── -->
        <v-skeleton-loader v-if="loading" type="table-row@5" />

        <div v-else-if="sortedSlots.length === 0"
          class="text-center text-grey pa-6 text-body-2"
        >
          Nenhum horário cadastrado. Use o formulário acima para adicionar.
        </div>

        <v-table v-else density="compact" class="slot-table">
          <thead>
            <tr>
              <th style="width:90px">Horário</th>
              <th>Equipe / Tipo</th>
              <th style="width:48px"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="slot in sortedSlots" :key="slot.idSlot"
              :class="slot.slotType !== 'team' ? 'special-row' : ''"
            >
              <td class="font-weight-bold">{{ slot.slotTime }}</td>
              <td>
                <v-chip
                  v-if="slot.slotType === 'lunch'"
                  size="small" color="orange" variant="tonal"
                  prepend-icon="mdi-food-fork-drink"
                >LUNCH</v-chip>
                <v-chip
                  v-else-if="slot.slotType === 'break'"
                  size="small" color="blue-grey" variant="tonal"
                  prepend-icon="mdi-coffee-outline"
                >BREAK</v-chip>
                <span v-else>
                  <span class="font-weight-bold" style="color:#007FBC">#{{ slot.teamNumber }}</span>
                  <span class="ml-2 text-grey-darken-1">{{ slot.teamName }}</span>
                </span>
              </td>
              <td>
                <v-btn
                  icon size="x-small" variant="text" color="error"
                  @click="removeSlot(slot.idSlot)"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-card v-else variant="tonal" color="grey" class="pa-6 text-center text-body-2">
        Selecione um <strong>dia</strong> e uma <strong>sala</strong> para ver e editar os horários.
      </v-card>
    </template>

    <!-- ── Add Day dialog ──────────────────────────────────────────────────── -->
    <v-dialog v-model="addDayDialog" max-width="380">
      <v-card>
        <v-card-title class="pt-4 pb-2">Novo Dia</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newDayLabel"
            label="Nome do dia"
            placeholder="ex: Sexta-feira"
            variant="outlined"
            autofocus
            @keyup.enter="createDay"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="addDayDialog = false">Cancelar</v-btn>
          <v-btn
            color="#007FBC" variant="flat" style="color:#fff"
            :disabled="!newDayLabel.trim()" @click="createDay"
          >Criar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Add Room dialog ─────────────────────────────────────────────────── -->
    <v-dialog v-model="addRoomDialog" max-width="380">
      <v-card>
        <v-card-title class="pt-4 pb-2">Nova Sala</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newRoomName"
            label="Nome da sala"
            placeholder="ex: Room A"
            variant="outlined"
            autofocus
            @keyup.enter="createRoom"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="addRoomDialog = false">Cancelar</v-btn>
          <v-btn
            color="#007FBC" variant="flat" style="color:#fff"
            :disabled="!newRoomName.trim()" @click="createRoom"
          >Criar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Rename Day dialog ───────────────────────────────────────────────── -->
    <v-dialog v-model="renameDayDialog" max-width="380">
      <v-card>
        <v-card-title class="pt-4 pb-2">Renomear Dia</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="renameDayLabel"
            label="Novo nome"
            variant="outlined"
            autofocus
            @keyup.enter="saveRenameDay"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="renameDayDialog = false">Cancelar</v-btn>
          <v-btn
            color="#007FBC" variant="flat" style="color:#fff"
            :disabled="!renameDayLabel.trim()" @click="saveRenameDay"
          >Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Rename Room dialog ──────────────────────────────────────────────── -->
    <v-dialog v-model="renameRoomDialog" max-width="380">
      <v-card>
        <v-card-title class="pt-4 pb-2">Renomear Sala</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="renameRoomName"
            label="Novo nome"
            variant="outlined"
            autofocus
            @keyup.enter="saveRenameRoom"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="renameRoomDialog = false">Cancelar</v-btn>
          <v-btn
            color="#007FBC" variant="flat" style="color:#fff"
            :disabled="!renameRoomName.trim()" @click="saveRenameRoom"
          >Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useImpactSchedule }    from "@/composables/useImpactSchedule";
import { useImpactSchedulePdf } from "@/composables/useImpactSchedulePdf";
import { useApi }               from "@/composables/useApi";
import { useEventStore }        from "@/stores/eventStore";

const { apiRequest } = useApi();
const eventStore     = useEventStore();

const {
  days, rooms, slots, loading,
  fetchDays, addDay, renameDay, deleteDay,
  fetchRooms, addRoom, renameRoom, deleteRoom,
  fetchSlots, fetchSlotsRaw,
  addSlot, deleteSlot,
} = useImpactSchedule();

const { generate: generatePdf } = useImpactSchedulePdf();

// ── Selection ──────────────────────────────────────────────────────────────
const selectedDayId  = ref(null);
const selectedRoomId = ref(null);

const selectedDay  = computed(() => days.value.find(d => d.idDay   === selectedDayId.value));
const selectedRoom = computed(() => rooms.value.find(r => r.idRoom === selectedRoomId.value));

const selectDay  = (id) => { selectedDayId.value  = id; loadSlots(); };
const selectRoom = (id) => { selectedRoomId.value = id; loadSlots(); };

const loadSlots = () => {
  if (selectedDayId.value && selectedRoomId.value)
    fetchSlots(selectedDayId.value, selectedRoomId.value);
};

// Auto-select first when lists load
watch(days,  (v) => { if (v.length && !selectedDayId.value)  selectedDayId.value  = v[0].idDay; });
watch(rooms, (v) => { if (v.length && !selectedRoomId.value) selectedRoomId.value = v[0].idRoom; });
watch([selectedDayId, selectedRoomId], ([d, r]) => { if (d && r) fetchSlots(d, r); }, { immediate: true });

// ── Sorted slots ───────────────────────────────────────────────────────────
const toMin = (t = "0") => { const [h, m = 0] = t.split(":").map(Number); return h * 60 + m; };
const sortedSlots = computed(() =>
  [...slots.value].sort((a, b) => toMin(a.slotTime) - toMin(b.slotTime))
);

// ── Teams list ─────────────────────────────────────────────────────────────
const teamOptions = ref([]);
const loadTeams = async () => {
  if (!eventStore.selectedEvent?.value) return;
  try {
    const data = await apiRequest("teams", {
      headers: { eventCode: eventStore.selectedEvent.value },
    });
    teamOptions.value = (data ?? []).map(t => ({
      label: `#${t.value}  ${t.text}`,
      id:     t.idTeams,
      number: t.value,
      name:   t.text,
    }));
  } catch { teamOptions.value = []; }
};
loadTeams();

// ── Add slot form ──────────────────────────────────────────────────────────
const form = ref({ slotTime: "", slotType: "team", selectedTeam: null });
const addingSlot = ref(false);

const slotTypeOptions = [
  { label: "Equipe",    value: "team"  },
  { label: "Almoço",   value: "lunch" },
  { label: "Intervalo", value: "break" },
];

const canAdd = computed(() => {
  if (!form.value.slotTime.trim()) return false;
  if (form.value.slotType === "team" && !form.value.selectedTeam) return false;
  return true;
});

const submitSlot = async () => {
  addingSlot.value = true;
  try {
    await addSlot({
      slotTime:       form.value.slotTime.trim(),
      slotType:       form.value.slotType,
      teamNumber:     form.value.selectedTeam?.number ?? null,
      teamName:       form.value.selectedTeam?.name   ?? null,
      Teams_idTeams:  form.value.selectedTeam?.id     ?? null,
      dayId:          selectedDayId.value,
      roomId:         selectedRoomId.value,
    });
    form.value.slotTime     = "";
    form.value.selectedTeam = null;
    loadSlots();
  } finally { addingSlot.value = false; }
};

const removeSlot = async (id) => {
  await deleteSlot(id);
  loadSlots();
};

// ── Day CRUD ───────────────────────────────────────────────────────────────
const addDayDialog    = ref(false);
const newDayLabel     = ref("");
const renameDayDialog = ref(false);
const renameDayLabel  = ref("");
const renameDayTarget = ref(null);

const createDay = async () => {
  await addDay(newDayLabel.value.trim());
  newDayLabel.value = ""; addDayDialog.value = false;
};
const openRenameDay = (day) => {
  renameDayTarget.value = day;
  renameDayLabel.value  = day.label;
  renameDayDialog.value = true;
};
const saveRenameDay = async () => {
  await renameDay(renameDayTarget.value.idDay, renameDayLabel.value.trim());
  renameDayDialog.value = false;
};
const confirmDeleteDay = async (day) => {
  if (!confirm(`Excluir o dia "${day.label}"? Todos os horários deste dia serão removidos.`)) return;
  await deleteDay(day.idDay);
  if (selectedDayId.value === day.idDay)
    selectedDayId.value = days.value[0]?.idDay ?? null;
};

// ── Room CRUD ──────────────────────────────────────────────────────────────
const addRoomDialog    = ref(false);
const newRoomName      = ref("");
const renameRoomDialog = ref(false);
const renameRoomName   = ref("");
const renameRoomTarget = ref(null);

const createRoom = async () => {
  await addRoom(newRoomName.value.trim());
  newRoomName.value = ""; addRoomDialog.value = false;
};
const openRenameRoom = (room) => {
  renameRoomTarget.value = room;
  renameRoomName.value   = room.name;
  renameRoomDialog.value = true;
};
const saveRenameRoom = async () => {
  await renameRoom(renameRoomTarget.value.idRoom, renameRoomName.value.trim());
  renameRoomDialog.value = false;
};
const confirmDeleteRoom = async (room) => {
  if (!confirm(`Excluir a sala "${room.name}"?`)) return;
  await deleteRoom(room.idRoom);
  if (selectedRoomId.value === room.idRoom)
    selectedRoomId.value = rooms.value[0]?.idRoom ?? null;
};

// ── PDF ────────────────────────────────────────────────────────────────────
const pdfLoading = ref(false);
const downloadPdf = async () => {
  pdfLoading.value = true;
  try {
    await generatePdf({ days: days.value, rooms: rooms.value, fetchSlotsRaw });
  } finally { pdfLoading.value = false; }
};
</script>

<style scoped>
.label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dim-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #9e9e9e;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.selectable-chip {
  cursor: pointer;
  transition: transform 0.15s ease;
}
.selectable-chip:hover { transform: scale(1.04); }

.slot-table :deep(thead th) {
  font-weight: 700;
  color: #007FBC !important;
  border-bottom: 2px solid #007FBC !important;
}

.special-row td {
  background: #f5f5f5;
  font-style: italic;
  color: #666;
}
</style>
