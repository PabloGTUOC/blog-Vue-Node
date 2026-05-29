<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const tags = ref([])
const showModal = ref(false)
const form = ref({
    name: '',
    slug: ''
})

const fetchTags = async () => {
    try {
        const res = await api.getTags()
        tags.value = res.data
    } catch (e) {
        console.error(e)
    }
}

onMounted(fetchTags)

const openCreate = () => {
    form.value = { name: '', slug: '' }
    showModal.value = true
}

const save = async () => {
    try {
        // Auto-generate slug if empty
        if (!form.value.slug) {
            form.value.slug = form.value.name.toLowerCase().replace(/\s+/g, '-')
        }
        await api.createTag(form.value)
        showModal.value = false
        fetchTags()
    } catch (e) {
        alert('Error saving tag: ' + (e.response?.data?.message || e.message))
    }
}

const deleteTag = async (id) => {
    if (!confirm('Permanently delete this tag?')) return
    try {
        await api.deleteTag(id)
        fetchTags()
    } catch (e) {
        alert('Error deleting tag')
    }
}
</script>

<template>
  <div class="admin-tags">
    <div class="header">
        <h1>Tag Taxonomy</h1>
        <button @click="openCreate">+ New Tag</button>
    </div>

    <div class="tags-list">
        <div v-for="tag in tags" :key="tag._id" class="tag-card">
            <div class="tag-info">
                <h3>{{ tag.name }}</h3>
                <code>{{ tag.slug }}</code>
            </div>
            <button @click="deleteTag(tag._id)" class="btn-danger">DELETE</button>
        </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
        <div class="modal">
            <h2>New Tag Entry</h2>
            <form @submit.prevent="save">
                <div class="field">
                    <label>Tag Name</label>
                    <input v-model="form.name" required placeholder="e.g. Photography" />
                </div>
                <div class="field">
                    <label>Slug (Optional)</label>
                    <input v-model="form.slug" placeholder="e.g. photography" />
                </div>
                <div class="modal-actions">
                    <button type="submit">Create</button>
                    <button type="button" @click="showModal = false">Cancel</button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<style scoped>
.admin-tags { padding: 2rem 0; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header h1 { color: var(--color-text); font-family: var(--font-display); }

.tags-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.tag-card {
    background: #FFFFFF;
    border: none;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    border-radius: var(--radius-md);
}

.tag-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--glow-primary);
}

.tag-info h3 { margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #1A1A1A; font-family: var(--font-display); }
.tag-info code { color: var(--color-secondary); font-family: var(--font-display); background: rgba(107, 112, 92, 0.1); padding: 2px 6px; border-radius: 4px; }

.btn-danger {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    border: 1px solid var(--color-shadow3);
    color: var(--color-shadow3);
    background: transparent;
    cursor: pointer;
    text-transform: uppercase;
    border-radius: var(--radius-sm);
    transition: all 0.2s;
    font-weight: bold;
    font-family: var(--font-ui);
}
.btn-danger:hover { background: var(--color-shadow3); color: #FFF; transform: translateY(-2px); }

.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
}
.modal {
    background: #FFFFFF; padding: 3rem; width: 95%; max-width: 400px;
    border: none;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    border-radius: var(--radius-md);
}
.modal h2 { font-family: var(--font-display); color: var(--color-text); margin-bottom: 2rem; }
.field { margin-bottom: 1.5rem; }
.field label { display: block; color: #1A1A1A; text-transform: uppercase; font-size: 0.85rem; margin-bottom: 0.5rem; font-weight: 900; font-family: var(--font-display); }
.modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.modal-actions button[type="button"] { background: var(--color-secondary); }
</style>
