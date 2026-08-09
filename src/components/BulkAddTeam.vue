<template>
  <v-container class="center-button">
    <CardTitlePage
      titulo="Adicionar Times"
      icon="mdi-folder-check"
      body="Adiciona todos os times que estão no FRC EVENTS ao sistema."
    />

    <Loader :overlay="loader" />

    <v-btn
      class="add-button"
      color="#007FBC"
      variant="outlined"
      elevation="3"
      @click="checkEventState"
      :loading="loader"
    >
      Adicionar Times
    </v-btn>
  </v-container>
</template>

<style scoped>
.center-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Roboto', sans-serif;
  text-align: center;
  padding-top: 3rem;
}

.add-button {
  margin-top: 2rem;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.25s ease;
  border-color: #007FBC;
  color: #007FBC;
}

.add-button:hover {
  background-color: #007FBC;
  color: white;
  transform: scale(1.03);
}
</style>

<script>
import CardTitlePage from "./CardTitlePage.vue";
import Loader from "./Loader.vue";
import { useEventStore } from "@/stores/eventStore";


export default {
  components: { CardTitlePage, Loader },
  

  data() {
    return {
      loader: false,
      serverDomain: process.env.VUE_APP_SERVER_DOMAIN,
    };
  },

  methods: {

    checkEventState: () => {
      console.log("Check")
      const eventStore = useEventStore();
      console.log("Evento atual:", eventStore.selectedEvent);
    },  

    async bulkAddTeam() {
      try {
        this.loader = true;
        const response = await fetch(`${this.serverDomain}/teams?bulk=true`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.SqlError) {
          if (result.SqlError.errno === 1062) {
            throw new Error("Alguns times já estão cadastrados.");
          } else if (result.SqlError.errno === 1162) {
            throw new Error("Erro de validação de dados.");
          }
        }

        alert("Times adicionados com sucesso!");
      } catch (err) {
        alert("Erro ao adicionar times: " + err.message);
      } finally {
        this.loader = false;
      }
    },
  },
};
</script>