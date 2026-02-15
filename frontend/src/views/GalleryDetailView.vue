<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import api, { BACKEND_URL } from '../services/api'
import EntryCard from '../components/EntryCard.vue'
import { useAuthStore } from '../stores/authStore'
import GooglePhotosPicker from '../components/GooglePhotosPicker.vue'

const authStore = useAuthStore()

const route = useRoute()
const gallery = ref(null)
const entries = ref([])
const selectedEntry = ref(null)

const showUploadForm = ref(false)
const showGooglePicker = ref(false)
const uploading = ref(false)
const uploadForm = ref({
    description: ''
})
const updatingCover = ref(false)
const coverUpdated = ref(false)

const getImageUrl = (url) => {
  if (url.startsWith('http')) return url
  return `${BACKEND_URL}${url}`
}

const openLightbox = (entry) => {
    selectedEntry.value = entry
    document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
    selectedEntry.value = null
    document.body.style.overflow = ''
}

const currentIndex = computed(() => {
    if (!selectedEntry.value) return -1
    return entries.value.findIndex(e => e._id === selectedEntry.value._id)
})

const nextEntry = () => {
    if (currentIndex.value < entries.value.length - 1) {
        selectedEntry.value = entries.value[currentIndex.value + 1]
    }
}

const prevEntry = () => {
    if (currentIndex.value > 0) {
        selectedEntry.value = entries.value[currentIndex.value - 1]
    }
}

const handleKey = (e) => {
    if (!selectedEntry.value) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextEntry()
    if (e.key === 'ArrowLeft') prevEntry()
}

const fetchEntries = async () => {
    const id = route.params.id
    try {
        const entriesRes = await api.getGalleryEntries(id)
        entries.value = entriesRes.data
    } catch (err) {
        console.error(err)
    }
}

const selectedFilesCount = ref(0)
const isFolderMode = ref(false)

const onFileChange = (e) => {
    selectedFilesCount.value = e.target.files.length
}

const handleUpload = async () => {
    const inputId = isFolderMode.value ? 'family-upload-folder' : 'family-upload'
    const fileInput = document.getElementById(inputId)
    
    if (!fileInput || !fileInput.files.length) {
        alert('Please select at least one image')
        return
    }

    uploading.value = true
    try {
        const formData = new FormData()
        
        let imageCount = 0
        for (const file of fileInput.files) {
            // SKIP NON-IMAGES (especially for folder mode)
            if (!file.type.startsWith('image/')) {
                console.log('Skipping non-image file:', file.name)
                continue
            }
            formData.append('images', file)
            imageCount++
        }

        if (imageCount === 0) {
            alert('No valid images found in your selection.')
            uploading.value = false
            return
        }
        
        formData.append('title', uploadForm.value.title)
        formData.append('description', uploadForm.value.description)
        formData.append('gallery', gallery.value._id)

        await api.uploadFamilyEntry(formData)
        
        // Reset
        uploadForm.value = { title: '', description: '' }
        fileInput.value = ''
        selectedFilesCount.value = 0
        showUploadForm.value = false
        
        await fetchEntries()
    } catch (err) {
        console.error(err)
        alert('Upload failed: ' + (err.response?.data?.message || err.message))
    } finally {
        uploading.value = false
    }
}

const onGoogleImported = () => {
    showGooglePicker.value = false
    fetchEntries()
}

const setAsCover = async (entry) => {
    if (!gallery.value) return
    updatingCover.value = true
    try {
        await api.updateGallery(gallery.value._id, { coverImage: entry.imageUrl })
        coverUpdated.value = true
        setTimeout(() => coverUpdated.value = false, 3000)
    } catch (err) {
        console.error('Failed to set cover:', err)
        alert('Failed to set gallery cover')
    } finally {
        updatingCover.value = false
    }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKey)
  const id = route.params.id
  try {
    const galleryRes = await api.getGallery(id)
    gallery.value = galleryRes.data
    await fetchEntries()
  } catch (err) {
    console.error(err)
  }
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKey)
})
</script>

<template>
  <div class="gallery-detail" v-if="gallery">
    <div class="header">
        <h1>{{ gallery.name }}</h1>
        <div class="timeline-meta" v-if="gallery.year">{{ gallery.month }}/{{ gallery.year }}</div>
        <div class="gallery-story" v-if="gallery.story">
            <p v-for="(paragraph, index) in gallery.story.split('\n')" :key="index">
                {{ paragraph }}
            </p>
        </div>
        <p v-else class="gallery-description">{{ gallery.description }}</p>

        <!-- Upload Toggle for family members -->
        <div v-if="authStore.user" class="upload-section">
            <div class="upload-actions">
                <button @click="showUploadForm = !showUploadForm; showGooglePicker = false" class="btn-toggle-upload">
                    {{ showUploadForm ? 'CANCEL' : '+ ADD LOCAL PHOTOS' }}
                </button>
                <button @click="showGooglePicker = true; showUploadForm = false" class="btn-toggle-google">
                    🌌 IMPORT FROM GOOGLE PHOTOS
                </button>
            </div>

            <form v-if="showUploadForm" @submit.prevent="handleUpload" class="upload-form">
                <div class="form-grid">
                    <div class="field">
                        <label>Upload Mode</label>
                        <div class="upload-modes">
                            <button type="button" :class="{ active: !isFolderMode }" @click="isFolderMode = false; selectedFilesCount = 0">
                                FILES
                            </button>
                            <button type="button" :class="{ active: isFolderMode }" @click="isFolderMode = true; selectedFilesCount = 0">
                                FULL FOLDER
                            </button>
                        </div>
                    </div>

                    <div class="field">
                        <label>{{ isFolderMode ? 'Select Folder' : 'Select Images' }}</label>
                        
                        <!-- Separate inputs to prevent attribute sticking -->
                        <input 
                            v-if="!isFolderMode"
                            type="file" 
                            id="family-upload" 
                            accept="image/*" 
                            multiple 
                            @change="onFileChange"
                            required 
                        />
                        <input 
                            v-else
                            type="file" 
                            id="family-upload-folder" 
                            accept="image/*" 
                            webkitdirectory
                            directory
                            @change="onFileChange"
                            required 
                        />

                        <div v-if="selectedFilesCount > 0" class="file-count">
                            {{ selectedFilesCount }} items staged for archiving
                        </div>
                        <div class="hint">
                            {{ isFolderMode ? 'Selecting a folder will stage all images within it.' : 'Hold Shift or Cmd/Ctrl to select multiple files.' }}
                        </div>
                    </div>
                    <div class="field">
                        <label>Title (Optional)</label>
                        <input v-model="uploadForm.title" placeholder="A brief title" />
                    </div>
                    <div class="field full-width">
                        <label>Description (Optional)</label>
                        <textarea v-model="uploadForm.description" placeholder="The story behind this memory..."></textarea>
                    </div>
                </div>
                <button type="submit" class="btn-submit" :disabled="uploading">
                    {{ uploading ? 'UPLOADING...' : 'COMMIT TO ARCHIVES' }}
                </button>
            </form>
        </div>
    </div>
    
    <div class="masonry-grid">
      <EntryCard 
        v-for="entry in entries" 
        :key="entry._id" 
        :entry="entry" 
        @click="openLightbox(entry)" 
      />
    </div>

    <!-- Lightbox -->
    <div v-if="selectedEntry" class="lightbox" @click.self="closeLightbox">
        <button class="btn-close" @click="closeLightbox">CLOSE [ESC]</button>
        
        <div class="lightbox-content">
            <button class="nav-btn prev" v-if="currentIndex > 0" @click.stop="prevEntry">&lt;</button>
            
            <div class="img-container">
                <img :src="getImageUrl(selectedEntry.imageUrl)" />
                <div class="caption">
                    <h3>{{ selectedEntry.title }}</h3>
                    <p>{{ selectedEntry.description }}</p>
                    
                    <div class="caption-actions" v-if="authStore.user">
                        <button 
                            @click="setAsCover(selectedEntry)" 
                            :disabled="updatingCover"
                            class="btn-set-cover"
                            :class="{ success: coverUpdated }"
                        >
                            {{ coverUpdated ? '✓ COVER UPDATED' : 'SET AS GALLERY COVER' }}
                        </button>
                    </div>

                    <span class="index-indicator">{{ currentIndex + 1 }} / {{ entries.length }}</span>
                </div>
            </div>

            <button class="nav-btn next" v-if="currentIndex < entries.length - 1" @click.stop="nextEntry">&gt;</button>
        </div>
    </div>
  </div>
  <div v-else class="loading">SYSTEM LOADING...</div>

  <!-- Google Photos Picker Modal -->
  <GooglePhotosPicker 
    v-if="showGooglePicker" 
    :galleryId="gallery._id"
    @imported="onGoogleImported"
    @close="showGooglePicker = false"
  />
</template>

<style scoped>
.gallery-detail {
  padding: 2rem 0;
}

.header {
  margin-bottom: 3rem;
  text-align: center;
}

h1 {
  color: var(--color-red);
  text-shadow: var(--glow-red);
  margin-bottom: 1rem;
}

.header p {
  color: var(--color-text-dim);
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.timeline-meta {
    font-family: monospace;
    color: var(--color-teal);
    font-weight: bold;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    letter-spacing: 2px;
}

.masonry-grid {
  column-count: 3;
  column-gap: 1.5rem;
}

.loading {
    color: var(--color-red);
    text-align: center;
    margin-top: 4rem;
    font-family: var(--font-display);
    animation: blink 1s infinite;
}

/* Lightbox Styles */
.lightbox {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(10, 5, 5, 0.95);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
}

.btn-close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    background: var(--color-surface);
    border: 2px solid var(--color-red);
    color: var(--color-red);
    padding: 0.8rem 1.5rem;
    font-weight: bold;
    cursor: pointer;
    font-family: var(--font-ui);
    transition: all 0.1s ease;
    z-index: 2010;
    box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-maroon);
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    letter-spacing: 1px;
}
.btn-close:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0px 0px var(--color-maroon);
    background: var(--color-blood);
    color: #fff;
}
.btn-close:active {
    transform: translate(var(--hard-shadow-offset), var(--hard-shadow-offset));
    box-shadow: 0px 0px 0px 0px var(--color-maroon);
}

.lightbox-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 1rem;
}

.img-container {
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    width: fit-content; /* Shrink to image width */
    margin: 0 auto;
    border: var(--border-thickness) solid var(--color-red);
    background: var(--color-surface); /* Use surface color instead of black */
    box-shadow: 0 0 50px rgba(0,0,0,0.9);
    border-radius: var(--radius-md);
    overflow: hidden;
}

.img-container img {
    max-width: 100%;
    max-height: 75vh;
    display: block;
    height: auto;
}

.caption {
    padding: 1rem;
    background: var(--color-surface);
    border-top: 2px solid var(--color-red);
    color: var(--color-white);
    min-width: 300px;
}
.caption h3 { color: var(--color-red); margin: 0; font-size: 1.2rem; }
.caption p { color: var(--color-text-dim); font-size: 0.9rem; margin-top: 0.5rem; }
.index-indicator { 
    display: block; 
    margin-top: 1.5rem; 
    font-family: monospace; 
    font-size: 0.8rem; 
    color: var(--color-teal);
    text-align: right; 
}

.caption-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-start;
}

.btn-set-cover {
    background: transparent;
    border: 1px solid var(--color-teal);
    color: var(--color-teal);
    font-family: var(--font-ui);
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.6rem 1rem;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: var(--radius-sm);
    box-shadow: 3px 3px 0px 0px var(--color-maroon);
}

.btn-set-cover:hover {
    background: var(--color-teal);
    color: #000;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px 0px var(--color-maroon);
}

.btn-set-cover.success {
    background: var(--color-teal);
    color: #000;
    border-color: var(--color-teal);
    box-shadow: none;
    transform: none;
}

.nav-btn {
    background: transparent;
    border: none;
    color: var(--color-text-dim);
    font-size: 4rem;
    cursor: pointer;
    font-family: var(--font-display);
    padding: 0 2rem;
    transition: color 0.2s;
}
.nav-btn:hover {
    color: var(--color-red);
    text-shadow: 0 0 10px var(--color-red);
}

/* Upload Section Styling */
.upload-section {
    margin-top: 2rem;
    padding: 2rem;
    border-top: 1px solid var(--color-maroon);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.upload-actions {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

.btn-toggle-upload, .btn-toggle-google {
    background: var(--color-surface);
    padding: 0.8rem 1.8rem;
    font-weight: 800;
    font-family: var(--font-ui);
    cursor: pointer;
    box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-maroon);
    transition: all 0.1s ease;
    letter-spacing: 1px;
    border-radius: var(--radius-sm);
}

.btn-toggle-upload {
    border: 2px solid var(--color-teal);
    color: var(--color-teal);
}

.btn-toggle-google {
    border: 2px solid var(--color-red);
    color: var(--color-red);
}

.btn-toggle-upload:hover { 
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0px 0px var(--color-maroon);
    background: var(--color-teal); 
    color: #000; 
}
.btn-toggle-google:hover { 
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0px 0px var(--color-maroon);
    background: var(--color-red); 
    color: #fff; 
}

.btn-toggle-upload:active, .btn-toggle-google:active {
    transform: translate(var(--hard-shadow-offset), var(--hard-shadow-offset));
    box-shadow: 0px 0px 0px 0px var(--color-maroon);
}

.upload-form {
    margin-top: 2.5rem;
    width: 100%;
    max-width: 700px;
    background: var(--color-bg);
    padding: 2rem;
    border: 3px solid var(--color-red);
    box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-blood);
    border-radius: var(--radius-md);
    text-align: left;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.field.full-width {
    grid-column: span 2;
}

.field label {
    display: block;
    font-family: var(--font-ui);
    text-transform: uppercase;
    font-size: 0.8rem;
    font-weight: bold;
    color: var(--color-teal);
    margin-bottom: 0.5rem;
}

.upload-modes {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}
.upload-modes button {
    flex: 1;
    background: transparent;
    border: 1px solid var(--color-maroon);
    color: var(--color-text-dim);
    padding: 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    font-family: var(--font-ui);
    transition: all 0.2s;
}
.upload-modes button.active {
    background: var(--color-maroon);
    color: var(--color-white);
    border-color: var(--color-teal);
    box-shadow: 0 0 10px rgba(0, 168, 168, 0.3);
}

.file-count {
    margin-top: 0.5rem;
    font-family: monospace;
    font-size: 0.8rem;
    color: var(--color-red);
    font-weight: bold;
}

.hint {
    margin-top: 0.3rem;
    font-size: 0.7rem;
    color: var(--color-text-dim);
    font-style: italic;
}

.btn-submit {
    width: 100%;
    background: var(--color-red);
    color: #fff;
    border: none;
    padding: 1.2rem;
    font-weight: 900;
    font-family: var(--font-ui);
    cursor: pointer;
    box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-blood);
    transition: all 0.1s ease;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    letter-spacing: 2px;
}

.btn-submit:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0px 0px var(--color-blood);
    background: var(--color-blood);
}

.btn-submit:active {
    transform: translate(var(--hard-shadow-offset), var(--hard-shadow-offset));
    box-shadow: 0px 0px 0px 0px var(--color-blood);
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

@media (max-width: 768px) {
  .masonry-grid { column-count: 2; }
  .img-container { max-width: 95vw; }
  .nav-btn { font-size: 2rem; padding: 0 0.5rem; }
  .form-grid { grid-template-columns: 1fr; }
  .field.full-width { grid-column: span 1; }
}

@media (max-width: 480px) {
  .masonry-grid { column-count: 1; }
}
</style>
