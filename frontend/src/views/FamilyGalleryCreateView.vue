<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const form = ref({
  name: '',
  description: '',
  coverImage: '' // In real app, this might be a file upload or url
})
const loading = ref(false)

const submit = async () => {
    loading.value = true
    try {
        // Simple create
        await api.post('/galleries', form.value)
        router.push('/family')
    } catch (e) {
        alert(e.response?.data?.message || 'Error creating gallery')
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
            <label>Description</label>
            <textarea v-model="form.description"></textarea>
        </div>
         <div class="field">
            <label>Cover Image URL (Optional)</label>
            <input v-model="form.coverImage" placeholder="https://..." />
        </div>
        <button type="submit" :disabled="loading">Create Gallery</button>
    </form>
  </div>
</template>

<style scoped>
.create-gallery {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
}

.field {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #aaa;
}
</style>
