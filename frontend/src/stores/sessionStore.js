import { defineStore } from 'pinia';
import api from '../services/api';

export const useSessionStore = defineStore('session', {
    state: () => ({
        adminUser: null,
        familyUser: null
    }),
    actions: {
        async checkAdminSession() {
            try {
                const res = await api.getAdminSession();
                this.adminUser = res.data;
                return true;
            } catch (err) {
                this.adminUser = null;
                return false;
            }
        },
        async checkFamilyStatus() {
            try {
                const res = await api.getFamilySession();
                this.familyUser = res.data;
                return this.familyUser;
            } catch (err) {
                this.familyUser = null;
                return null;
            }
        },
        async adminLogin(username, password) {
            await api.adminLogin({ username, password });
            await this.checkAdminSession();
        },
        async adminLogout() {
            await api.adminLogout();
            this.adminUser = null;
        }
    }
});
