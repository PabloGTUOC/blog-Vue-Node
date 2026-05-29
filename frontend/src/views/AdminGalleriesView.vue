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
    month: new Date().getMonth() + 1,
    type: 'family',
    camera: '',
    film: '',
    lab: ''
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
        month: new Date().getMonth() + 1,
        type: 'family',
        camera: '',
        film: '',
        lab: ''
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
        month: gallery.month || new Date().getMonth() + 1,
        type: gallery.type || 'family',
        camera: gallery.camera || '',
        film: gallery.film || '',
        lab: gallery.lab || ''
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
            month: form.value.month,
            type: form.value.type,
            camera: form.value.camera,
            film: form.value.film,
            lab: form.value.lab
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
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
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
                    <label>Gallery Type</label>
                    <select v-model="form.type" required>
                        <option value="family">Shared Family Gallery</option>
                        <option value="analog">Analog Gallery</option>
                    </select>
                </div>
                <div v-if="form.type === 'analog'" class="analog-fields" style="background: #f0f0f0; padding: 1rem; border: 1px solid #1A1A1A; border-radius: 4px; margin-bottom: 1.5rem;">
                    <div class="field">
                        <label>Camera Type</label>
                        <input v-model="form.camera" placeholder="e.g. Canon AE-1" />
                    </div>
                    <div class="field">
                        <label>Film Type</label>
                        <input v-model="form.film" placeholder="e.g. Kodak Portra 400" />
                    </div>
                    <div class="field" style="margin-bottom: 0;">
                        <label>Lab</label>
                        <input v-model="form.lab" placeholder="e.g. Local Lab" />
                    </div>
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
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header h1 { color: var(--color-text); font-family: var(--font-display); }

.brutalist-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: #FFFFFF;
    border: none;
    border-radius: var(--radius-md);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

th {
    background: #F9F9F9;
    color: var(--color-secondary);
    text-transform: uppercase;
    font-size: 0.8rem;
    padding: 1.2rem;
    text-align: left;
    font-weight: bold;
    letter-spacing: 1px;
}

td {
    padding: 1.5rem 1.2rem;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    vertical-align: top;
    color: var(--color-text);
}

.gallery-link {
    color: #1A1A1A;
    font-weight: 900;
    font-size: 1.1rem;
    font-family: var(--font-display);
    text-transform: uppercase;
    text-decoration: none;
    display: inline-block;
    transition: color 0.2s;
}
.gallery-link:hover {
    color: var(--color-primary);
}

.desc { font-size: 0.85rem; color: var(--color-secondary); margin-top: 0.5rem; line-height: 1.4; }

.timeline-badge {
    background: rgba(107, 112, 92, 0.1);
    color: var(--color-secondary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: bold;
    font-family: var(--font-display);
}

.status-family { color: var(--color-shadow3); font-weight: bold; border: 1px solid var(--color-shadow3); padding: 3px 8px; font-size: 0.65rem; border-radius: 4px; background: rgba(249, 65, 68, 0.1); }
.status-public { color: var(--color-secondary); font-weight: bold; border: 1px solid var(--color-secondary); padding: 3px 8px; font-size: 0.65rem; border-radius: 4px; background: rgba(107, 112, 92, 0.1); }

.btn-group { display: flex; gap: 0.5rem; }
.btn-group button { padding: 0.5rem 1rem; font-size: 0.75rem; background: var(--color-primary); color: #FFF; border: none; }
.btn-group button:hover { transform: translateY(-2px); box-shadow: var(--glow-primary); }
.btn-group .btn-danger { background: transparent; border: 1px solid var(--color-shadow3); color: var(--color-shadow3); box-shadow: none; }
.btn-group .btn-danger:hover { background: var(--color-shadow3); color: #FFF; transform: translateY(-2px); }

.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
}
.modal {
    background: #FFFFFF; padding: 3rem; width: 95%; max-width: 500px;
    border: none;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    border-radius: var(--radius-md);
    max-height: 90vh;
    overflow-y: auto;
}
.modal h2 { font-family: var(--font-display); color: var(--color-text); margin-bottom: 2rem; }
.field { margin-bottom: 1.5rem; flex: 1; }
.field-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.field label { display: block; color: #1A1A1A; text-transform: uppercase; font-size: 0.85rem; margin-bottom: 0.5rem; font-weight: 900; font-family: var(--font-display); }
.field-check { display: flex; align-items: center; gap: 0.8rem; margin-top: 2rem; color: #1A1A1A; font-weight: bold; font-family: var(--font-ui); }
.modal-actions { display: flex; gap: 1rem; margin-top: 3rem; }
.modal-actions button[type="button"] { background: var(--color-secondary); }

.multi-select {
    width: 100%;
    background: #F9F9F9;
    border: 2px solid #1A1A1A;
    border-radius: var(--radius-sm);
    color: #1A1A1A;
    font-family: var(--font-ui);
    padding: 0.5rem;
    height: 100px;
    box-shadow: 2px 2px 0px rgba(0,0,0,0.1);
}
</style>
