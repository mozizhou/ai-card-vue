// stores/menu.js
import { defineStore } from "pinia";

export const useMenuStore = defineStore("menu", {
    state: () => {
        return {
            showMenu: false, showLoading: false, showMore: false, showPay: false, showReSocket: false,
            showWeb: false, webUrl: '', showPcHint: false,
            showGlobalNotify: false,
            showLogin: false,
        };
    },
    actions: {
        handleShowMenu(value) {
            this.showMenu = value;
        },
        handleShowLoading(value) {
            this.showLoading = value
        },
        handleShowMore(value) {
            this.showMore = value
        },
        HandleShowPay(value) {
            this.showPay = value
        },
        HandleShowWeb(value) {
            this.showWeb = value
        },
        HandleShowReSocket(value) {
            this.showReSocket = value
        },
        HandleWebUrl(value) {
            this.webUrl = value
        },
        HandleShowPcHint(value) {
            this.showPcHint = value
        },
        HandleShowNotify(value) {
            this.showGlobalNotify = value
        },
        HandleShowLogin(value) {
            this.showLogin = value
        }
    },
});
