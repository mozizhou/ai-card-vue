// stores/menu.js
import { defineStore } from "pinia";

export const useSystemStore = defineStore("system", {
    state: () => {
        return {
            hasAudio: false
        };
    },
    getters: {
        getCanAudio() {
            return this.hasAudio
        },
    },
    actions: {
        handleCanAudio(value) {
            this.hasAudio = value;
        },
    },
});
