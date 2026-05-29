<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const users = ref([])
const loading = ref(false)
const processingId = ref(null)

const fetchUsers = async () => {
    loading.value = true
    try {
        const res = await api.getAdminUsers()
        users.value = res.data
    } catch (e) { 
        console.error(e) 
    } finally {
        loading.value = false
    }
}

const updateStatus = async (userId, newStatus) => {
    processingId.value = userId
    try {
        await api.updateUserStatus(userId, newStatus)
        // Update local state instead of refetching
        const user = users.value.find(u => u._id === userId)
        if (user) user.status = newStatus
    } catch (e) {
        console.error(e)
        alert('Failed to update user status')
    } finally {
        processingId.value = null
    }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="admin-users">
    <h1>User Approval</h1>
    <p>Manage family member access levels.</p>
    <table>
        <thead>
            <tr><th>Email</th><th>Name</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
            <tr v-for="user in users" :key="user._id">
                <td>{{ user.email }}</td>
                <td>{{ user.name || 'N/A' }}</td>
                <td>
                    <span :class="['status-badge', user.status]">
                        {{ user.status }}
                    </span>
                </td>
                <td class="actions">
                    <button 
                        v-if="user.status !== 'approved'" 
                        class="btn-approve"
                        :disabled="processingId === user._id"
                        @click="updateStatus(user._id, 'approved')"
                    >
                        {{ processingId === user._id ? '...' : 'Approve' }}
                    </button>
                    <button 
                        v-if="user.status !== 'blocked'" 
                        class="btn-block"
                        :disabled="processingId === user._id"
                        @click="updateStatus(user._id, 'blocked')"
                    >
                        {{ processingId === user._id ? '...' : 'Block' }}
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-users { padding: 2rem 0; overflow-x: auto; }
h1 { color: var(--color-text); font-family: var(--font-display); margin-bottom: 1rem; }
p { color: var(--color-secondary); margin-bottom: 2rem; }

table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 2rem; background: #FFFFFF; border-radius: var(--radius-md); box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
th, td { padding: 1.2rem; text-align: left; border-bottom: 1px solid rgba(0,0,0,0.05); }
td { color: var(--color-text); }
th { color: var(--color-secondary); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; background: #F9F9F9; font-weight: bold; }

.status-badge {
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: bold;
    text-transform: uppercase;
    font-family: var(--font-ui);
}
.status-badge.approved { background: rgba(107, 112, 92, 0.1); color: var(--color-secondary); border: 1px solid var(--color-secondary); }
.status-badge.blocked { background: rgba(249, 65, 68, 0.1); color: var(--color-shadow3); border: 1px solid var(--color-shadow3); }
.status-badge.pending { background: rgba(243, 114, 44, 0.1); color: var(--color-shadow2); border: 1px solid var(--color-shadow2); }

.actions { display: flex; gap: 0.8rem; }

button {
    padding: 0.6rem 1.2rem;
    font-size: 0.75rem;
    border-radius: var(--radius-sm);
    box-shadow: none;
    transition: all 0.2s;
    font-weight: bold;
    font-family: var(--font-ui);
    text-transform: uppercase;
}

.btn-approve { background: var(--color-primary); color: #FFFFFF; border: none; }
.btn-approve:hover { box-shadow: var(--glow-primary); transform: translateY(-2px); filter: brightness(1.1); }
.btn-block { background: transparent; color: var(--color-shadow3); border: 1px solid var(--color-shadow3); }
.btn-block:hover { background: var(--color-shadow3); color: #FFFFFF; transform: translateY(-2px); }

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

@media (max-width: 600px) {
    th, td { padding: 0.8rem; font-size: 0.9rem; }
    .actions { flex-direction: column; }
}
</style>
