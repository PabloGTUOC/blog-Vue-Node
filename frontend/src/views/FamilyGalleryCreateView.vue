<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const now = new Date()
const form = ref({
  name: '',
  description: '',
  story: '',
  year: now.getFullYear(),
  month: now.getMonth() + 1
})
const loading = ref(false)

const submit = async () => {
    loading.value = true
    try {
        // Simple create
        await api.createFamilyGallery(form.value)
        router.push('/family')
    } catch (e) {
        console.error('Gallery Create Error:', e);
        const msg = e.response?.data?.message || e.message || 'Error creating gallery';
        alert('Failed to create gallery: ' + msg);
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="create-gallery">
    <h1>Create New Gallery</h1>
    <form @submit.prevent="submit">
        <div class="field">
            <label>Gallery Name</label>
            <input v-model="form.name" required />
        </div>
        <div class="field">
            <label>Short Summary</label>
            <textarea v-model="form.description" placeholder="Brief summary for the gallery card..."></textarea>
        </div>

        <div class="field">
            <label>Full Story / Context</label>
            <textarea v-model="form.story" placeholder="Tell the story behind these photos (e.g. camera used, location, memories)..." style="min-height: 150px;"></textarea>
            <p class="hint-msg">💡 This text will appear at the top of the gallery detail page.</p>
        </div>

        <div class="field-row">
            <div class="field">
                <label>Year</label>
                <input v-model.number="form.year" type="number" required />
            </div>
            <div class="field">
                <label>Month</label>
                <select v-model.number="form.month" required>
                    <option v-for="m in 12" :key="m" :value="m">
                        {{ new Date(0, m - 1).toLocaleString('default', { month: 'long' }) }}
                    </option>
                </select>
            </div>
        </div>
        <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'STAGING ARCHIVE...' : 'CREATE NEW GALLERY' }}
        </button>
    </form>
  </div>
</template>

<style scoped>
.create-gallery {
    padding: 3rem 2rem;
    max-width: 600px;
    margin: 0 auto;
}

.field {
    margin-bottom: 2rem;
}

label {
    display: block;
    margin-bottom: 0.8rem;
    color: var(--color-teal);
    font-family: var(--font-ui);
    text-transform: uppercase;
    font-size: 0.85rem;
    font-weight: 900;
}

.field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

select {
    background: #000;
    border: var(--border-thickness) solid var(--color-maroon);
    border-radius: var(--radius-sm);
    color: #fff;
    padding: 0.8rem;
    font-family: var(--font-main);
    width: 100%;
    box-sizing: border-box;
}

select:focus {
    outline: none;
    border-color: var(--color-red);
}

.btn-primary {
    width: 100%;
    background: var(--color-red);
    color: #fff;
    border: none;
    padding: 1.2rem;
    font-weight: 950;
    font-family: var(--font-ui);
    cursor: pointer;
    box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-blood);
    transition: all 0.1s ease;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    letter-spacing: 2px;
}

.btn-primary:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0px 0px var(--color-blood);
    background: var(--color-blood);
}

.btn-primary:active {
    transform: translate(var(--hard-shadow-offset), var(--hard-shadow-offset));
    box-shadow: 0px 0px 0px 0px var(--color-blood);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
</style>
