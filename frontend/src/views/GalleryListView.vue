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
    <div class="section-title-wrapper">
      <h1>PHOTO GALLERIES</h1>
      <div class="title-line"></div>
    </div>
    
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
  max-width: 1000px;
  margin: 0 auto;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  gap: 1rem;
}

h1 {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: #001A33;
  text-shadow: 2px 2px 0px rgba(0, 240, 255, 0.5);
  margin: 0;
  font-weight: 900;
  letter-spacing: 2px;
}

.title-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #00F0FF, #FF007A);
  position: relative;
}
.title-line::after {
  content: ">>";
  position: absolute;
  right: -25px;
  top: -8px;
  color: #FF007A;
  font-family: var(--font-display);
  font-weight: bold;
}

.filters {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 4rem;
    background: #FFFFFF;
    padding: 1.5rem;
    border: 1px solid #1A1A1A;
    border-radius: 4px;
    box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.15);
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
    color: var(--color-secondary);
    letter-spacing: 1px;
}

select {
    background: #FFFFFF;
    border: 1px solid #1A1A1A;
    color: var(--color-text);
    padding: 0.5rem 1rem;
    border-radius: 2px;
    font-family: var(--font-ui);
    min-width: 140px;
}

select:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 5px var(--glow-accent);
}

.reset-btn {
    background: transparent;
    border: 1px solid var(--color-accent);
    color: var(--color-accent);
    font-size: 0.7rem;
    padding: 0.6rem 1rem;
    cursor: pointer;
    border-radius: 2px;
    font-family: var(--font-display);
    text-transform: uppercase;
    font-weight: bold;
    transition: all 0.2s ease;
}
.reset-btn:hover {
    background: var(--color-accent);
    color: #fff;
}

.empty-results {
    text-align: center;
    padding: 4rem;
    color: var(--color-secondary);
    font-family: var(--font-display);
    font-size: 1.5rem;
    border: 2px dashed var(--color-secondary);
    border-radius: var(--radius-md);
    text-transform: uppercase;
    letter-spacing: 2px;
}
</style>
