<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import api, { BACKEND_URL } from '../services/api'

const getImageUrl = (url) => `${BACKEND_URL}${url}`

const route = useRoute()
const gallery = ref(null)
const entries = ref([])
const uploadStatus = ref('')
const uploadProgress = ref(0)

const fetchGallery = async () => {
    try {
        const res = await api.getGallery(route.params.id)
        gallery.value = res.data
    } catch (e) {
        console.error(e)
    }
}

const fetchEntries = async () => {
    try {
        const res = await api.getGalleryEntries(route.params.id)
        entries.value = res.data
    } catch (e) {
        console.error(e)
    }
}

const handleFileUpload = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    uploadStatus.value = 'Preparing upload...'
    let completed = 0
    uploadProgress.value = 0

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('image', file)
        formData.append('gallery', route.params.id)
        formData.append('title', file.name)
        
        try {
            uploadStatus.value = `Uploading ${i + 1}/${files.length}...`
            await api.uploadEntry(formData)
            completed++
            uploadProgress.value = Math.round((completed / files.length) * 100)
        } catch (e) {
            console.error(`Failed to upload ${file.name}`, e)
        }
    }

    uploadStatus.value = 'Upload complete!'
    setTimeout(() => { uploadStatus.value = '' }, 3000)
    fetchEntries()
}

const deleteEntry = async (id) => {
    if (!confirm('Delete this photo entry?')) return
    try {
        await api.deleteEntry(id) 
        fetchEntries()
    } catch (e) {
        alert('Error deleting entry')
    }
}

onMounted(async () => {
    await fetchGallery()
    await fetchEntries()
})
</script>

<template>
  <div class="gallery-detail-admin">
    <div class="header" v-if="gallery">
        <div>
            <router-link to="/admin/galleries" class="back-link">&larr; BACK TO ARCHIVES</router-link>
            <h1>{{ gallery.name }} <span class="sub">CONTENTS</span></h1>
        </div>
        <div class="upload-zone">
            <label class="upload-btn">
                + UPLOAD PHOTOGRAPHS
                <input type="file" multiple accept="image/*" @change="handleFileUpload" style="display: none" />
            </label>
            <div class="google-placeholder" title="Google Photos Integration Coming Soon">
                <span>G-PHOTOS LINK [OFFLINE]</span>
            </div>
        </div>
    </div>

    <div v-if="uploadStatus" class="status-bar">
        {{ uploadStatus }} ({{ uploadProgress }}%)
    </div>

    <div class="entries-grid">
        <div v-for="entry in entries" :key="entry._id" class="entry-card">
            <div class="img-wrapper">
                <img :src="getImageUrl(entry.imageUrl)" />
            </div>
            <div class="meta">
                <div class="filename">{{ entry.title }}</div>
                <button @click="deleteEntry(entry._id)" class="btn-del">DEL</button>
            </div>
        </div>
        <div v-if="entries.length === 0" class="empty-state">
            [ NO DATA ON TAPE ]
        </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-detail-admin { padding: 2rem 0; }
.back-link { 
    color: var(--color-teal); 
    text-decoration: none; 
    font-size: 0.8rem; 
    font-weight: bold; 
    letter-spacing: 1px;
    margin-bottom: 1rem;
    display: inline-block;
}
.header { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-end; 
    margin-bottom: 3rem; 
    border-bottom: 2px solid var(--color-maroon);
    padding-bottom: 2rem;
}
.header h1 { margin: 0; color: var(--color-red); font-size: 2.5rem; text-shadow: 0 0 10px rgba(230,62,68,0.3); }
.sub { font-size: 1rem; color: var(--color-text-dim); }

.upload-zone { display: flex; gap: 1rem; align-items: center; }

.upload-btn {
    background: var(--color-red);
    color: #fff;
    font-family: var(--font-ui);
    padding: 0.8rem 1.5rem;
    font-weight: bold;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: 2px solid var(--color-red);
    border-radius: var(--radius-sm);
    transition: all 0.2s;
}
.upload-btn:hover {
    background: var(--color-blood);
    box-shadow: 0 0 15px var(--color-red);
}

.google-placeholder {
    border: 1px dashed var(--color-text-dim);
    color: var(--color-text-dim);
    padding: 0.8rem 1.5rem;
    font-size: 0.8rem;
    cursor: not-allowed;
    opacity: 0.6;
    border-radius: var(--radius-sm);
}

.status-bar {
    background: var(--color-yellow);
    color: #000;
    padding: 0.5rem;
    text-align: center;
    font-weight: bold;
    margin-bottom: 2rem;
    text-transform: uppercase;
    border-radius: var(--radius-sm);
}

.entries-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
}

.entry-card {
    background: var(--color-surface);
    border: 1px solid var(--color-maroon);
    padding: 0.5rem;
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.img-wrapper {
    height: 150px;
    overflow: hidden;
    background: #000;
    margin-bottom: 0.5rem;
}
.img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-ui);
    font-size: 0.7rem;
}

.filename {
    color: var(--color-text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
}

.btn-del {
    background: transparent;
    border: 1px solid var(--color-red);
    color: var(--color-red);
    font-size: 0.6rem;
    padding: 2px 4px;
    cursor: pointer;
}
.btn-del:hover {
    background: var(--color-red);
    color: #fff;
}

.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 4rem;
    color: var(--color-text-dim);
    border: 1px dashed var(--color-maroon);
    border-radius: var(--radius-sm);
    font-family: monospace;
}
</style>
