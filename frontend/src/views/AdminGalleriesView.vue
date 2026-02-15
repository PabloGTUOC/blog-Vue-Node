<script setup>
import { ref, onMounted } from 'vue'
import api, { BACKEND_URL } from '../services/api'

const galleries = ref([])
const allTags = ref([])
const showModal = ref(false)
const editingGallery = ref(null)
const form = ref({
    name: '',
    description: '',
    story: '',
    coverImage: '',
    isFamilyOnly: false,
    tags: [],
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
})

const getImageUrl = (path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${BACKEND_URL}${path}`
}

const fetchGalleries = async () => {
    try {
        const res = await api.getGalleries()
        galleries.value = res.data
    } catch (e) { console.error(e) }
}

const fetchTags = async () => {
    try {
        const res = await api.getTags()
        allTags.value = res.data
    } catch (e) { console.error(e) }
}

// ... rest of script ...

onMounted(() => {
    fetchGalleries()
    fetchTags()
})

const openCreate = () => {
    editingGallery.value = null
    form.value = { 
        name: '', 
        description: '', 
        story: '', 
        coverImage: '', 
        isFamilyOnly: false,
        tags: [],
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    }
    // Also clear file input if exists
    const fileInput = document.getElementById('gallery-cover')
    if (fileInput) fileInput.value = ''
    
    showModal.value = true
}

const openEdit = (gallery) => {
    editingGallery.value = gallery
    form.value = { 
        ...gallery,
        story: gallery.story || '',
        tags: gallery.tags ? gallery.tags.map(t => t._id || t) : [],
        year: gallery.year || new Date().getFullYear(),
        month: gallery.month || new Date().getMonth() + 1
    }
    showModal.value = true
}

const save = async () => {
    try {
        const payload = {
            name: form.value.name,
            description: form.value.description,
            story: form.value.story,
            isFamilyOnly: form.value.isFamilyOnly,
            tags: form.value.tags,
            year: form.value.year,
            month: form.value.month
        }

        let galleryId = null
        
        if (editingGallery.value) {
            galleryId = editingGallery.value._id
            await api.updateGallery(galleryId, payload)
        } else {
            const res = await api.createGallery(payload)
            galleryId = res.data._id
        }

        // Upload Cover Image Separately if selected
        const fileInput = document.getElementById('gallery-cover')
        if (fileInput && fileInput.files[0] && galleryId) {
            const formData = new FormData()
            formData.append('image', fileInput.files[0])
            await api.uploadGalleryCover(galleryId, formData)
        }

        showModal.value = false
        fetchGalleries()
    } catch (e) {
        console.error(e)
        const msg = e.response?.data?.message || e.message;
        alert('Error saving gallery: ' + msg)
    }
}

const deleteGallery = async (id) => {
    if (!confirm('Destroy this record?')) return
    try {
        await api.deleteGallery(id)
        fetchGalleries()
    } catch (e) {
        alert('Error deleting gallery')
    }
}
</script>

<template>
  <div class="admin-galleries">
    <div class="header">
        <h1>Gallery Archives</h1>
        <button @click="openCreate">+ New Gallery</button>
    </div>

    <table class="brutalist-table">
        <thead>
            <tr>
                <th>Classification</th>
                <th>Timeline</th>
                <th>Cover</th>
                <th>Access</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="gallery in galleries" :key="gallery._id">
                <td>
                    <RouterLink :to="`/admin/galleries/${gallery._id}`" class="gallery-link">
                        {{ gallery.name }}
                    </RouterLink>
                    <div class="desc">{{ gallery.description }}</div>
                </td>
                <td>
                    <span class="timeline-badge">{{ gallery.month }}/{{ gallery.year }}</span>
                </td>
                <td>
                    <img v-if="gallery.coverImage" :src="getImageUrl(gallery.coverImage)" 
                         style="width: 50px; height: 50px; object-fit: cover; border: 1px solid var(--color-red); border-radius: 4px;" />
                </td>
                <td>
                    <span :class="gallery.isFamilyOnly ? 'status-family' : 'status-public'">
                        {{ gallery.isFamilyOnly ? 'PRIVATE_FAMILY' : 'DEEP_PUBLIC' }}
                    </span>
                </td>
                <td>{{ new Date(gallery.createdAt).toLocaleDateString() }}</td>
                <td>
                    <div class="btn-group">
                        <button @click="openEdit(gallery)">Mod</button>
                        <button @click="deleteGallery(gallery._id)" class="btn-danger">Purge</button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
        <div class="modal">
            <h2>{{ editingGallery ? 'Modify Gallery' : 'New Gallery' }}</h2>
            <form @submit.prevent="save">
                <div class="field">
                    <label>Gallery Name</label>
                    <input v-model="form.name" required />
                </div>
                <div class="field">
                    <label>Short Description (Card)</label>
                    <textarea v-model="form.description"></textarea>
                </div>
                <div class="field">
                    <label>Full Story (Top of Page)</label>
                    <textarea v-model="form.story" style="min-height: 100px;"></textarea>
                </div>
                <div class="field">
                    <label>Cover Image</label>
                    <input type="file" id="gallery-cover" accept="image/*" />
                     <div v-if="editingGallery?.coverImage" style="font-size: 0.8rem; margin-top: 0.5rem; color: #888;">
                        Current: {{ editingGallery.coverImage }}
                    </div>
                </div>
                <div class="field-row">
                    <div class="field">
                        <label>Year</label>
                        <input type="number" v-model="form.year" required />
                    </div>
                    <div class="field">
                        <label>Month</label>
                        <select v-model="form.month" required>
                            <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label>Tags</label>
                    <select v-model="form.tags" multiple class="multi-select">
                        <option v-for="tag in allTags" :key="tag._id" :value="tag._id">
                            {{ tag.name }}
                        </option>
                    </select>
                </div>
                <div class="field-check">
                    <input type="checkbox" v-model="form.isFamilyOnly" id="famonly" />
                    <label for="famonly">Classified (Family Only)</label>
                </div>
                <div class="modal-actions">
                    <button type="submit">Commit</button>
                    <button type="button" @click="showModal = false">Abort</button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<style scoped>
.admin-galleries { padding: 2rem 0; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
.header h1 { color: var(--color-red); }

.brutalist-table {
    width: 100%;
    border-collapse: separate; /* Required for table border-radius */
    border-spacing: 0;
    background: var(--color-surface);
    border: var(--border-thickness) solid var(--color-red);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

th {
    background: var(--color-maroon);
    color: var(--color-red);
    text-transform: uppercase;
    font-size: 0.75rem;
    padding: 1rem;
    text-align: left;
    letter-spacing: 2px;
}

td {
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-maroon);
    vertical-align: top;
}

.gallery-link {
    color: var(--color-red);
    font-weight: 900;
    font-size: 1.1rem;
    text-transform: uppercase;
    text-decoration: none;
    display: inline-block;
    border-bottom: 2px solid transparent;
}
.gallery-link:hover {
    color: var(--color-teal);
    border-bottom: 2px solid var(--color-teal);
}

.desc { font-size: 0.8rem; color: var(--color-text-dim); margin-top: 0.5rem; }

.timeline-badge {
    background: var(--color-maroon);
    color: var(--color-white);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
}

.status-family { color: var(--color-red); font-weight: bold; border: 1px solid var(--color-red); padding: 2px 6px; font-size: 0.6rem; border-radius: 4px; }
.status-public { color: var(--color-teal); font-weight: bold; border: 1px solid var(--color-teal); padding: 2px 6px; font-size: 0.6rem; border-radius: 4px; }

.btn-group { display: flex; gap: 0.5rem; }
.btn-group button { padding: 0.4rem 1rem; font-size: 0.7rem; box-shadow: 3px 3px 0px 0px var(--color-blood); }

.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center;
    z-index: 1000;
}
.modal {
    background: var(--color-bg); padding: 3rem; width: 95%; max-width: 500px;
    border: 3px solid var(--color-red);
    box-shadow: 8px 8px 0px 0px var(--color-blood);
    border-radius: var(--radius-md);
}
.field { margin-bottom: 1.5rem; flex: 1; }
.field-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.field label { display: block; color: var(--color-teal); text-transform: uppercase; font-size: 0.8rem; margin-bottom: 0.5rem; font-weight: bold; }
.field-check { display: flex; align-items: center; gap: 0.8rem; margin-top: 2rem; color: var(--color-yellow); }
.modal-actions { display: flex; gap: 1rem; margin-top: 3rem; }

.multi-select {
    width: 100%;
    background: #000;
    border: var(--border-thickness) solid var(--color-maroon);
    border-radius: var(--radius-sm);
    color: var(--color-teal);
    font-family: var(--font-ui);
    padding: 0.5rem;
    height: 100px;
}
</style>
