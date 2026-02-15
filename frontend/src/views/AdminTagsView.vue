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
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
.header h1 { color: var(--color-red); }

.tags-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.tag-card {
    background: var(--color-surface);
    border: var(--border-thickness) solid var(--color-maroon);
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.1s;
    box-shadow: 4px 4px 0px 0px var(--color-blood);
    border-radius: var(--radius-sm);
}

.tag-card:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px var(--color-blood);
    border-color: var(--color-red);
}

.tag-info h3 { margin: 0 0 0.5rem 0; font-size: 1.2rem; color: var(--color-text); }
.tag-info code { color: var(--color-teal); font-family: monospace; }

.btn-danger {
    padding: 0.5rem 1rem;
    font-size: 0.7rem;
    border: 1px solid var(--color-red);
    color: var(--color-red);
    background: transparent;
    cursor: pointer;
    text-transform: uppercase;
    border-radius: var(--radius-sm);
}
.btn-danger:hover { background: var(--color-blood); color: #fff; }

.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center;
    z-index: 1000;
}
.modal {
    background: var(--color-bg); padding: 3rem; width: 95%; max-width: 400px;
    border: 3px solid var(--color-red);
    box-shadow: 0 0 30px rgba(139, 0, 0, 0.4);
    border-radius: var(--radius-md);
}
.field { margin-bottom: 2rem; }
.field label { display: block; color: var(--color-teal); text-transform: uppercase; font-size: 0.8rem; margin-bottom: 0.5rem; }
.modal-actions { display: flex; gap: 1rem; }
</style>
