<script setup>
import { ref, onMounted } from 'vue'
import api, { BACKEND_URL } from '../services/api'

const posts = ref([])
const allTags = ref([])
const showModal = ref(false)
const editingPost = ref(null)
const form = ref({
  title: '',
  content: '',
  summary: '',
  isPublished: false,
  tags: []
})

const getImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${BACKEND_URL}${url}`
}

const fetchPosts = async () => {
    try {
        const res = await api.getAdminPosts() 
        posts.value = res.data.posts || res.data
    } catch (e) {
        console.error(e)
    }
}

const fetchTags = async () => {
    try {
        const res = await api.getTags()
        allTags.value = res.data
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    fetchPosts()
    fetchTags()
})

const openCreate = () => {
    editingPost.value = null
    form.value = { title: '', content: '', summary: '', isPublished: false, tags: [] }
    showModal.value = true
}

const openEdit = (post) => {
    editingPost.value = post
    // Map tag objects to IDs for the form
    form.value = { 
        ...post, 
        tags: post.tags ? post.tags.map(t => t._id || t) : [] 
    }
    showModal.value = true
}

// ... save/deletePost ...

const save = async () => {
    try {
        // ... formData setup ...
        const formData = new FormData()
        formData.append('title', form.value.title)
        formData.append('summary', form.value.summary)
        formData.append('content', form.value.content)
        formData.append('isPublished', form.value.isPublished)
        
        // Tags need to be handled carefully with FormData
        form.value.tags.forEach(tagId => {
            formData.append('tags[]', tagId)
        })
        
        const fileInput = document.getElementById('post-image')
        if (fileInput && fileInput.files[0]) {
            formData.append('image', fileInput.files[0])
        }

        if (editingPost.value) {
            await api.updatePost(editingPost.value._id, formData)
        } else {
            await api.createPost(formData)
        }
        showModal.value = false
        fetchPosts()
    } catch (e) {
        console.error(e)
        alert('Error saving post: ' + (e.response?.data?.message || e.message))
    }
}

const deletePost = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
        await api.deletePost(id)
        fetchPosts()
    } catch (e) {
        alert('Error deleting post')
    }
}
</script>

<template>
  <div class="admin-posts">
    <div class="header">
        <h1>Manage Posts</h1>
        <button @click="openCreate">+ New Post</button>
    </div>

    <table>
        <thead>
            <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="post in posts" :key="post._id">
                <td>
                    <img v-if="post.coverImage" :src="getImageUrl(post.coverImage)" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                </td>
                <td>{{ post.title }}</td>
                <td>
                    <span :class="post.isPublished ? 'status-pub' : 'status-draft'">
                        {{ post.isPublished ? 'Published' : 'Draft' }}
                    </span>
                </td>
                <td>{{ new Date(post.createdAt).toLocaleDateString() }}</td>
                <td>
                    <button @click="openEdit(post)">Edit</button>
                    <button @click="deletePost(post._id)" class="btn-danger">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Simple Modal -->
    <div v-if="showModal" class="modal-overlay">
        <div class="modal">
            <h2>{{ editingPost ? 'Edit Post' : 'New Post' }}</h2>
            <form @submit.prevent="save">
                <div class="field">
                    <label>Title</label>
                    <input v-model="form.title" required />
                </div>
                <div class="field">
                    <label>Cover Image</label>
                    <input type="file" id="post-image" accept="image/*" />
                    <div v-if="editingPost?.coverImage" style="font-size: 0.8rem; margin-top: 0.5rem; color: #888;">
                        Current: {{ editingPost.coverImage }}
                    </div>
                </div>
                <div class="field">
                    <label>Summary</label>
                    <input v-model="form.summary" />
                </div>
                <div class="field">
                    <label>Content</label>
                    <textarea v-model="form.content" rows="10" required></textarea>
                </div>
                <div class="field">
                    <label>Tags (Select Multiple)</label>
                    <select v-model="form.tags" multiple class="multi-select">
                        <option v-for="tag in allTags" :key="tag._id" :value="tag._id">
                            {{ tag.name }}
                        </option>
                    </select>
                    <small style="color: var(--color-text-dim); margin-top: 0.5rem; display: block;">
                        Hold Ctrl/Cmd to select multiple categories.
                    </small>
                </div>
                <div class="field-check">
                    <input type="checkbox" v-model="form.isPublished" id="pub" />
                    <label for="pub">Published</label>
                </div>
                <div class="modal-actions">
                    <button type="submit">Save</button>
                    <button type="button" @click="showModal = false">Cancel</button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<style scoped>
.admin-posts { padding: 2rem 0; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header h1 { color: var(--color-red); text-shadow: var(--glow-red); }

table { 
    width: 100%; 
    border-collapse: separate; 
    border-spacing: 0;
    background: var(--color-surface); 
    margin-top: 1rem; 
    border: var(--border-thickness) solid var(--color-maroon);
    border-radius: var(--radius-sm);
    overflow: hidden;
}
th, td { padding: 1.2rem; text-align: left; border-bottom: 1px solid var(--color-maroon); }
th { color: var(--color-teal); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; }

.status-pub { color: var(--color-teal); font-weight: bold; }
.status-draft { color: var(--color-orange); opacity: 0.7; }

.btn-danger { border-color: var(--color-blood); color: var(--color-red); margin-left: 0.5rem; }
.btn-danger:hover { background: var(--color-blood); color: #fff; }

/* Modal Styles */
.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
}
.modal {
    background: var(--color-bg); padding: 2.5rem; width: 95%; max-width: 800px;
    border: 3px solid var(--color-blood);
    box-shadow: var(--glow-red);
    border-radius: var(--radius-md);
    max-height: 90vh;
    overflow-y: auto;
}
.field { margin-bottom: 1.5rem; }
.field label { display: block; color: var(--color-teal); text-transform: uppercase; font-size: 0.8rem; margin-bottom: 0.5rem; }
.field-check { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 2rem; color: var(--color-yellow); }
.modal-actions { display: flex; gap: 1rem; }

.modal-actions { display: flex; gap: 1rem; }

.multi-select {
    width: 100%;
    background: var(--color-surface);
    border: 1px solid var(--color-maroon);
    border-radius: var(--radius-sm);
    color: var(--color-teal);
    font-family: var(--font-ui);
    padding: 0.5rem;
    height: 120px;
}

.multi-select option {
    padding: 0.5rem;
    cursor: pointer;
}

.multi-select option:checked {
    background: var(--color-red);
    color: #fff;
}
</style>
