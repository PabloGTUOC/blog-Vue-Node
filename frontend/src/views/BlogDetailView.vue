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
  padding: 2rem 0;
  max-width: 1000px;
  margin: 0 auto;
}

.content-container {
  background: #FFFFFF;
  padding: 40px;
  border: 1px solid #1A1A1A;
  border-radius: 4px;
  box-shadow: 6px 6px 0px rgba(0,0,0,0.15);
  margin-top: 1rem;
}

h1 {
  color: #1A1A1A;
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 1.1;
  text-transform: uppercase;
  font-weight: 900;
  margin-top: 0;
  margin-bottom: 1.5rem;
  letter-spacing: 2px;
}

.tags {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.tag-label {
  background: var(--color-primary);
  color: #000;
  border: 2px solid #000;
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 900;
  padding: 4px 10px;
  text-transform: uppercase;
  box-shadow: 2px 2px 0 #000;
}

.cover-image {
  width: 100%;
  height: auto;
  max-height: 70vh;
  display: block;
  object-fit: cover;
  border: 1px solid #1A1A1A;
  border-radius: 2px;
  margin-bottom: 2rem;
  filter: sepia(0.2) contrast(1.1);
}

.content {
  line-height: 1.6;
  white-space: pre-wrap; 
  font-size: 1.1rem;
  color: #333;
  font-family: var(--font-main);
}
</style>
