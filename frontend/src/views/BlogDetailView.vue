<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api, { BACKEND_URL } from '../services/api'

const route = useRoute()
const post = ref(null)

onMounted(async () => {
  const id = route.params.id
  try {
    const res = await api.getPost(id)
    post.value = res.data
  } catch (err) {
    console.error(err)
  }
})

const getImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${BACKEND_URL}${url}`
}
</script>

<template>
  <div class="blog-detail" v-if="post">
    <div class="content-container">
      <h1>{{ post.title }}</h1>
      <div class="tags" v-if="post.tags && post.tags.length">
        <span v-for="tag in post.tags" :key="tag._id" class="tag-label">
          {{ tag.name }}
        </span>
      </div>
      <img v-if="post.coverImage" :src="getImageUrl(post.coverImage)" class="cover-image" />
      <div class="content">{{ post.content }}</div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<style scoped>
.blog-detail {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: var(--color-red);
  text-shadow: 0 0 10px rgba(230, 62, 68, 0.4);
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  line-height: 1.1;
}

.tags {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.tag-label {
  border: 1px solid var(--color-red);
  color: var(--color-red);
  font-family: var(--font-ui);
  font-size: 0.65rem;
  font-weight: bold;
  padding: 4px 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
}

.cover-image {
  width: 100%;
  height: auto;
  max-height: 90vh;
  display: block;
  border-bottom: 4px solid var(--color-blood);
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
  border-radius: var(--radius-md);
}

.content {
  line-height: 1.8;
  white-space: pre-wrap; 
  font-size: 1.2rem;
  color: var(--color-text);
  letter-spacing: 0.5px;
}
</style>
