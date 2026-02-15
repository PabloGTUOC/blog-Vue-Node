<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({
    galleryId: { type: String, required: true }
})

const emit = defineEmits(['imported', 'close'])
const authStore = useAuthStore()

const photos = ref([])
const nextToken = ref(null)
const loading = ref(false)
const importing = ref(false)
const selectedItems = ref([])
const hasScopeError = ref(false)

const handleReconnect = async () => {
    try {
        await authStore.login()
        hasScopeError.value = false
        await fetchPhotos()
    } catch (err) {
        console.error('Reconnect failed', err)
    }
}

const diagnosticSummary = ref('')
const tokenCopied = ref(false)
const currentSessionId = ref(localStorage.getItem('gp_session_id'))
const blobUrls = ref({}) // map photo ID to its authorized blob URL

const copyToken = async () => {
    try {
        await navigator.clipboard.writeText(authStore.googleAccessToken)
        tokenCopied.value = true
        setTimeout(() => tokenCopied.value = false, 2000)
    } catch (err) {
        alert('Failed to copy token: ' + authStore.googleAccessToken)
    }
}

const createPickerSession = async () => {
    loading.value = true
    diagnosticSummary.value = 'Creating secure picker session...'
    
    // Clear old state for fresh selection
    photos.value = []
    nextToken.value = null
    selectedItems.value = []

    try {
        const res = await axios.post('https://photospicker.googleapis.com/v1/sessions', {}, {
            headers: { Authorization: `Bearer ${authStore.googleAccessToken}` }
        })
        
        currentSessionId.value = res.data.id
        localStorage.setItem('gp_session_id', res.data.id)
        
        // Open the Google Picker in a new window
        window.open(res.data.pickerUri, '_blank', 'width=600,height=800')
        diagnosticSummary.value = 'PICKER OPENED. Please select your photos in the popup, click "Done", then click "FINISH IMPORT" here.'
    } catch (err) {
        console.error('Session Creation Failed:', err.response?.data)
        diagnosticSummary.value = 'Failed to create session: ' + (err.response?.data?.error?.message || err.message)
    } finally {
        loading.value = false
    }
}

const fetchPhotos = async () => {
    if (!currentSessionId.value) return

    loading.value = true
    diagnosticSummary.value = 'Fetching items from your selection...'
    try {
        const url = `https://photospicker.googleapis.com/v1/mediaItems?pageSize=50&sessionId=${currentSessionId.value}${nextToken.value ? '&pageToken=' + nextToken.value : ''}`
        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${authStore.googleAccessToken}` }
        })
        
        // MODERN Picker API uses 'mediaFile' property
        const newItems = (res.data.mediaItems || [])
            .map(item => {
                const media = item.mediaFile
                if (!media) {
                    console.warn('Item missing mediaFile details:', item)
                    return null
                }
                
                return {
                    id: item.id,
                    baseUrl: media.baseUrl,
                    filename: media.filename,
                    type: item.type,
                    // Map creationTime from mediaFileMetadata to mediaMetadata for backend compatibility
                    mediaMetadata: {
                        creationTime: media.mediaFileMetadata?.creationTime
                    }
                }
            })
            .filter(item => item !== null && item.baseUrl)

        console.log('PICKER ITEMS UNWRAPPED:', newItems)

        if (!nextToken.value) photos.value = [] // Clear if this is a fresh fetch
        photos.value = [...photos.value, ...newItems]
        nextToken.value = res.data.nextPageToken
        hasScopeError.value = false
        diagnosticSummary.value = photos.value.length > 0 ? '' : 'No photos picked yet. Click Launch again if needed.'
        
        // Fetch thumbnails securely
        loadThumbnails(newItems)
    } catch (err) {
        console.error('Picker Fetch Error Object:', err)
        const detailedMsg = err.response?.data?.error?.message || err.message || 'Unknown Network Error'
        diagnosticSummary.value = 'Error fetching selection: ' + detailedMsg
    } finally {
        loading.value = false
    }
}

const loadThumbnails = async (items) => {
    for (const item of items) {
        if (blobUrls.value[item.id]) continue
        try {
            const res = await axios.get(item.baseUrl + '=w200-h200-c', {
                headers: { Authorization: `Bearer ${authStore.googleAccessToken}` },
                responseType: 'blob'
            })
            blobUrls.value[item.id] = URL.createObjectURL(res.data)
        } catch (err) {
            console.error(`Failed to load thumb for ${item.id}`, err)
        }
    }
}

const toggleSelection = (item) => {
    const idx = selectedItems.value.findIndex(i => i.id === item.id)
    if (idx > -1) {
        selectedItems.value.splice(idx, 1)
    } else {
        selectedItems.value.push(item)
    }
}

const importSelected = async () => {
    if (selectedItems.value.length === 0) return

    importing.value = true
    try {
        const payload = {
            items: selectedItems.value.map(i => ({
                id: i.id || i.pickerItemId, // Flex for old vs new API IDs
                baseUrl: i.baseUrl,
                filename: i.filename,
                description: i.description,
                mediaMetadata: i.mediaMetadata
            })),
            galleryId: props.galleryId,
            googleAccessToken: authStore.googleAccessToken // Pass token for backend download
        }
        console.log('Sending Authenticated Import Payload:', payload)
        await api.importGoogleEntries(payload)
        emit('imported')
    } catch (err) {
        console.error('Import Error:', err)
        alert('Failed to import photos')
    } finally {
        importing.value = false
    }
}

// Global API reference (assuming we'll pass it in or import it)
import api from '../services/api'
import { onUnmounted } from 'vue'

onUnmounted(() => {
    // Revoke all blob URLs to prevent memory leaks
    Object.values(blobUrls.value).forEach(url => URL.revokeObjectURL(url))
})

onMounted(() => {
    fetchPhotos()
})
</script>

<template>
  <div class="google-picker-overlay" @click.self="$emit('close')">
    <div class="google-picker modal">
        <div class="modal-header">
            <h3>SELECT FROM GOOGLE PHOTOS</h3>
            <button @click="$emit('close')" class="close-x">X</button>
        </div>

        <div class="picker-controls" v-if="photos.length === 0 && !hasScopeError">
            <div class="instruction-card">
                <h4>STEP 1: SELECT YOUR PHOTOS</h4>
                <p>Google's new privacy rules require you to pick exactly which photos to share with the blog.</p>
                <button @click="createPickerSession" :disabled="loading" class="btn-launch">
                    🚀 LAUNCH GOOGLE SELECTOR
                </button>
            </div>
            
            <div v-if="currentSessionId" class="instruction-card secondary">
                <h4>STEP 2: BRING THEM TO BLOG</h4>
                <p>Once you click "Done" in the Google window, click the button below.</p>
                <button @click="fetchPhotos" :disabled="loading" class="btn-refresh">
                    📥 FETCH MY SELECTION
                </button>
            </div>
        </div>

        <div class="photo-grid" v-if="photos.length > 0">
            <div 
                v-for="photo in photos" 
                :key="photo.id" 
                class="photo-item"
                :class="{ selected: selectedItems.find(i => i.id === photo.id) }"
                @click="toggleSelection(photo)"
            >
                <img :src="blobUrls[photo.id]" v-if="blobUrls[photo.id]" />
                <div v-else class="img-placeholder"></div>
                <div class="checkmark" v-if="selectedItems.find(i => i.id === photo.id)">✓</div>
            </div>
        </div>
        
        <div class="modal-controls-relaunch" v-if="photos.length > 0">
            <button @click="createPickerSession" class="btn-relaunch">🔄 ADD MORE FROM GOOGLE</button>
        </div>
        
        <div v-if="hasScopeError" class="permission-error">
            <h4>⚠️ CONNECTION FAILED</h4>
            <p>Google is rejecting your login token. Diagnostic results:</p>
            
            <div class="diagnostic-info status-box">
                {{ diagnosticSummary }}
            </div>

            <button @click="copyToken" class="btn-copy">
                {{ tokenCopied ? 'TOKEN COPIED!' : '📋 COPY TOKEN FOR TEST' }}
            </button>
            <p class="playground-hint">Use this token at the <b>Google OAuth Playground</b> to verify your project.</p>

            <div class="btn-row">
                <button @click="handleReconnect" class="btn-fix">RE-AUTH BLOG</button>
            </div>
        </div>

        <div v-else-if="loading" class="empty-state">CONNECTING...</div>
        <div v-else-if="photos.length === 0" class="empty-state">NO PHOTOS FOUND.</div>

        <div class="modal-footer">
            <div class="selection-status">
                {{ selectedItems.length }} ITEMS SELECTED
            </div>
            <div class="actions">
                <button v-if="nextToken" @click="fetchPhotos" :disabled="loading" class="btn-more">
                    {{ loading ? '...' : 'LOAD MORE' }}
                </button>
                <button 
                    @click="importSelected" 
                    :disabled="importing || selectedItems.length === 0" 
                    class="btn-import"
                >
                    {{ importing ? 'IMPORTING...' : 'ARCHIVE SELECTED' }}
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.google-picker-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.9);
    z-index: 3000;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(8px);
}

.google-picker {
    width: 90%;
    max-width: 900px;
    height: 80vh;
    background: var(--color-bg);
    border: 3px solid var(--color-red);
    box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-blood);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 2px solid var(--color-maroon);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 { color: var(--color-teal); margin: 0; letter-spacing: 2px; }

.close-x {
    background: transparent; border: 1px solid var(--color-red);
    color: var(--color-red); cursor: pointer; padding: 0.3rem 0.6rem;
}

.photo-grid {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
}

.photo-item {
    position: relative;
    aspect-ratio: 1;
    border: 3px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    background: #111;
}

.photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(0.5);
}

.img-placeholder {
    width: 100%;
    height: 100%;
    background: #222;
    animation: pulse 1.5s infinite;
}

@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.8; } 100% { opacity: 0.5; } }

.photo-item:hover img { filter: grayscale(0); }

.photo-item.selected {
    border-color: var(--color-teal);
    transform: scale(0.95);
}

.photo-item.selected img { filter: grayscale(0); }

.checkmark {
    position: absolute;
    top: 5px;
    right: 5px;
    background: var(--color-teal);
    color: #000;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

.modal-footer {
    padding: 1.5rem;
    border-top: 2px solid var(--color-maroon);
    background: var(--color-surface);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.selection-status { font-family: monospace; color: var(--color-teal); font-weight: bold; }

.actions { display: flex; gap: 1rem; }

.btn-import {
    background: var(--color-red);
    color: #fff;
    border: none;
    padding: 0.8rem 1.5rem;
    font-weight: bold;
    font-family: var(--font-ui);
    cursor: pointer;
    box-shadow: 5px 5px 0px 0px var(--color-blood);
}

.btn-import:disabled { opacity: 0.5; box-shadow: none; cursor: not-allowed; }

.btn-more {
    background: transparent;
    border: 1px solid var(--color-teal);
    color: var(--color-teal);
    padding: 0.8rem 1.5rem;
    font-weight: bold;
    cursor: pointer;
}

.empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    color: var(--color-red);
    animation: blink 1s infinite;
}

.permission-error {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    background: rgba(255, 62, 68, 0.05);
}
.permission-error h4 { color: var(--color-red); margin-bottom: 1rem; font-size: 1.5rem; }
.permission-error p { color: var(--color-text-dim); margin-bottom: 2rem; max-width: 400px; }

.btn-fix, .btn-copy {
    border: none;
    padding: 1rem 2rem;
    font-weight: 900;
    font-family: var(--font-ui);
    cursor: pointer;
    box-shadow: 6px 6px 0px 0px var(--color-maroon);
    margin-bottom: 1rem;
    width: 300px;
}

.btn-fix { background: var(--color-teal); color: #000; }
.btn-copy { background: #333; color: var(--color-teal); border: 1px solid var(--color-teal); }

.playground-hint {
    font-size: 0.7rem; color: var(--color-text-dim); margin-bottom: 2rem;
}

.diagnostic-info {
    font-family: monospace;
    font-size: 0.7rem;
    color: var(--color-teal);
    background: #000;
    padding: 1rem;
    border: 1px dashed var(--color-maroon);
    margin-bottom: 1.5rem;
    max-width: 500px;
    word-break: break-all;
}

.status-box { border-style: solid; font-weight: bold; }

.btn-fix:hover, .btn-copy:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0px 0px var(--color-maroon); }

.btn-row { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }

.picker-controls {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
}

.instruction-card {
    background: var(--color-surface);
    border: 2px solid var(--color-maroon);
    border-radius: var(--radius-md);
    padding: 2rem;
    text-align: center;
    max-width: 400px;
    box-shadow: 4px 4px 0px 0px var(--color-maroon);
}

.instruction-card h4 { color: var(--color-teal); margin-bottom: 1rem; }
.instruction-card p { font-size: 0.9rem; margin-bottom: 1.5rem; color: var(--color-text-dim); }

.btn-launch, .btn-refresh {
    width: 100%;
    padding: 1rem;
    font-weight: 900;
    cursor: pointer;
    border: none;
    box-shadow: 4px 4px 0px 0px var(--color-blood);
}

.btn-launch { background: var(--color-red); color: #fff; }
.btn-refresh { background: var(--color-teal); color: #000; }

.btn-launch:hover, .btn-refresh:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0px 0px var(--color-blood); }

.modal-controls-relaunch {
    padding: 1rem;
    display: flex;
    justify-content: center;
    border-bottom: 1px dashed var(--color-maroon);
}

.btn-relaunch {
    background: transparent;
    border: 1px solid var(--color-teal);
    color: var(--color-teal);
    padding: 0.5rem 1rem;
    font-weight: bold;
    cursor: pointer;
    font-size: 0.8rem;
}

@media (max-width: 600px) {
    .photo-grid { grid-template-columns: repeat(3, 1fr); }
    .modal-footer { flex-direction: column; gap: 1rem; }
}
</style>
