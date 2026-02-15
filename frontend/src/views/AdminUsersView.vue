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
h1 { color: var(--color-red); text-shadow: var(--glow-red); margin-bottom: 2rem; }

table { width: 100%; border-collapse: collapse; margin-top: 2rem; background: var(--color-surface); border: 2px solid var(--color-maroon); }
th, td { padding: 1.2rem; text-align: left; border-bottom: 1px solid var(--color-maroon); }
th { color: var(--color-teal); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; background: rgba(0, 168, 168, 0.05); }

.status-badge {
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: bold;
    text-transform: uppercase;
}
.status-badge.approved { background: rgba(0, 168, 168, 0.2); color: var(--color-teal); border: 1px solid var(--color-teal); }
.status-badge.blocked { background: rgba(230, 62, 68, 0.2); color: var(--color-red); border: 1px solid var(--color-red); }
.status-badge.pending { background: rgba(240, 180, 41, 0.2); color: var(--color-yellow); border: 1px solid var(--color-yellow); }

.actions { display: flex; gap: 0.8rem; }

button {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    box-shadow: 3px 3px 0px 0px var(--color-maroon);
}

.btn-approve { background: var(--color-teal); color: #000; border-color: #000; }
.btn-approve:hover { background: #0ff; }
.btn-block { background: var(--color-blood); color: #fff; border-color: var(--color-red); }
.btn-block:hover { background: var(--color-red); }

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: translate(3px, 3px);
}

@media (max-width: 600px) {
    th, td { padding: 0.8rem; font-size: 0.9rem; }
    .actions { flex-direction: column; }
}
</style>
