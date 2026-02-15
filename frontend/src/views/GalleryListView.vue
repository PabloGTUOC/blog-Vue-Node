<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import GalleryGrid from '../components/GalleryGrid.vue'

const lobbies = ref([]) // all galleries
const filterYear = ref('')
const filterMonth = ref('')

onMounted(async () => {
  try {
    const res = await api.getGalleries()
    lobbies.value = res.data
  } catch (err) {
    console.error(err)
  }
})

// Extract available years/months for the filter options
const availableYears = computed(() => {
  const years = lobbies.value.map(g => g.year).filter(Boolean)
  return [...new Set(years)].sort((a, b) => b - a)
})

const availableMonths = computed(() => {
  const months = lobbies.value.map(g => g.month).filter(Boolean)
  return [...new Set(months)].sort((a, b) => a - b)
})

const filteredGalleries = computed(() => {
  return lobbies.value.filter(g => {
    const matchYear = !filterYear.value || g.year === Number(filterYear.value)
    const matchMonth = !filterMonth.value || g.month === Number(filterMonth.value)
    return matchYear && matchMonth
  })
})

const resetFilters = () => {
  filterYear.value = ''
  filterMonth.value = ''
}

const getMonthName = (m) => {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return months[m - 1] || m;
}
</script>

<template>
  <div class="gallery-list">
    <h1>Photo Galleries</h1>
    
    <!-- Filters Section -->
    <div class="filters">
        <div class="filter-group">
            <label>Year</label>
            <select v-model="filterYear">
                <option value="">All Years</option>
                <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}
                </option>
            </select>
        </div>
        
        <div class="filter-group">
            <label>Month</label>
            <select v-model="filterMonth">
                <option value="">All Months</option>
                <option v-for="month in availableMonths" :key="month" :value="month">
                    {{ getMonthName(month) }}
                </option>
            </select>
        </div>

        <button v-if="filterYear || filterMonth" @click="resetFilters" class="reset-btn">
            Clear Filters
        </button>
    </div>

    <div v-if="filteredGalleries.length > 0">
        <GalleryGrid :galleries="filteredGalleries" />
    </div>
    <div v-else class="empty-results">
        [ NO RECORDS FOUND FOR THIS TIMELINE ]
    </div>
  </div>
</template>

<style scoped>
.gallery-list {
  padding: 2rem 0;
}
h1 {
  color: var(--color-red);
  text-shadow: var(--glow-red);
  margin-bottom: 2rem;
  text-align: center;
}

.filters {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 4rem;
    background: var(--color-surface);
    padding: 1.5rem;
    border: 1px solid var(--color-maroon);
    border-radius: var(--radius-md);
    flex-wrap: wrap;
    align-items: flex-end;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-group label {
    font-family: var(--font-ui);
    text-transform: uppercase;
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--color-teal);
    letter-spacing: 1px;
}

select {
    background: #000;
    border: 1px solid var(--color-maroon);
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    font-family: var(--font-ui);
    min-width: 140px;
}

select:focus {
    outline: none;
    border-color: var(--color-red);
}

.reset-btn {
    background: transparent;
    border: 1px solid var(--color-red);
    color: var(--color-red);
    font-size: 0.7rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: var(--radius-sm);
}
.reset-btn:hover {
    background: var(--color-red);
    color: #fff;
}

.empty-results {
    text-align: center;
    padding: 4rem;
    color: var(--color-text-dim);
    font-family: monospace;
    border: 1px dashed var(--color-maroon);
    border-radius: var(--radius-md);
}
</style>
