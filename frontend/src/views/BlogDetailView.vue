<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const post = ref(null)

onMounted(async () => {
  const id = route.params.id
  try {
    const res = await api.get(`/posts/${id}`)
    post.value = res.data
  } catch (err) {
    console.error(err)
  }
})
</script>

<template>
  <div class="blog-detail" v-if="post">
    <h1>{{ post.title }}</h1>
    <div class="content">{{ post.content }}</div>
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
  color: #f0f;
  margin-bottom: 2rem;
}

.content {
  line-height: 1.6;
  white-space: pre-wrap; /* Simple content rendering */
}
</style>
