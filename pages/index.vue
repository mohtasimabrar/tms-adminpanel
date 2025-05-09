<template>
  <div class="px-4 py-4">
    <h2 class="text-2xl font-bold mb-6">Admin Dashboard</h2>

    <!-- Event Dropdown -->
    <div class="mb-6">
      <label for="eventDropdown" class="block text-lg font-semibold mb-2">Select Event</label>
      <select id="eventDropdown" v-model="selectedEvent" class="w-full p-3 border rounded shadow-sm">
        <option value="" disabled>Select an event</option>
        <option v-for="event in eventList" :key="event.eventId" :value="event.eventId">
          {{ event.eventName }}
        </option>
      </select>
    </div>

    <!-- Dashboard Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <!-- Tickets Purchased Card -->
      <div class="dashboard-card">
        <!-- Icon Container -->
        <div class="icon-container">
          <i class="pi pi-ticket icon"></i>
        </div>
        <!-- Text Content -->
        <div class="text-content">
          <h3 class="title">Tickets Purchased</h3>
          <p class="value">{{ totalTickets }}</p>
          <!-- <p class="subtitle">24 new since last visit</p> -->
        </div>
      </div>

      <!-- Total Revenue Card -->
      <div class="dashboard-card">
        <div class="icon-container bg-orange-100">
          <i class="pi pi-dollar icon text-orange-500"></i>
        </div>
        <div class="text-content">
          <h3 class="title">Total Revenue</h3>
          <p class="value">৳{{ totalRevenue }}</p>
          <!-- <p class="subtitle">24 new since last visit</p> -->
        </div>
      </div>

      <!-- Total Users Card -->
      <div class="dashboard-card">
        <div class="icon-container bg-cyan-100">
          <i class="pi pi-users icon text-cyan-500"></i>
        </div>
        <div class="text-content">
          <h3 class="title">Total Users</h3>
          <p class="value">{{ totalUsers }}</p>
          <!-- <p class="subtitle">24 new since last visit</p> -->
        </div>
      </div>
    </div>

    <!-- Category Sales Info -->
    <div v-if="selectedEvent" class="bg-white shadow-lg rounded-lg p-4">
      <h3 class="text-xl font-bold mb-4">Category Info</h3>
      <DataTable :value="products" :rows="5" :paginator="true" responsiveLayout="scroll" class="w-full">
        <Column field="categoryName" header="Category" style="width: 35%"></Column>
        <Column field="totalPurchasedTicket" header="Tickets Sold" style="width: 35%"></Column>
        <Column field="totalRevenue" header="Revenue" style="width: 30%">
          <template #body="slotProps">
            ৳{{ slotProps.data.totalRevenue }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const userToken = useCookie('token');
const token = "Bearer " + userToken.value;

const totalTickets = ref(0);
const totalRevenue = ref(0);
const totalUsers = ref(0);
const eventList = ref([]);
const selectedEvent = ref("");
const products = ref([]);

// Fetch Dashboard Data
const fetchDashboardData = async (eventId = '') => {
  try {
    const response = await $fetch(`https://api.countersbd.com/api/v1/admin/dashboard-info/${eventId}`, {
      headers: { Authorization: token },
    });
    totalTickets.value = response.data.totalPurchasedTicket;
    totalRevenue.value = response.data.totalRevenue;
    totalUsers.value = response.data.totalUser;
    products.value = response.data.categorySalesInfoList || [];
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

// Fetch Event List
const fetchEventList = async () => {
  try {
    const response = await $fetch('https://api.countersbd.com/api/v1/event/admin/all', {
      headers: { Authorization: token },
    });
    eventList.value = response.data;
  } catch (error) {
    console.error('Error fetching event list:', error);
  }
};

// Watch for Event Selection Changes
watch(selectedEvent, (newEventId) => {
  if (newEventId) fetchDashboardData(newEventId);
});

onMounted(() => {
  fetchDashboardData();
  fetchEventList();
});
</script>

<style scoped>
/* Card Styles */
.dashboard-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 170px;
}

/* Icon Container */
.icon-container {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  background-color: #e0f2fe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Icon Styles */
.icon {
  font-size: 1.5rem;
}

/* Text Content */
.text-content {
  margin-top: 60px;
}

.title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
}

.value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: bold;
  color: #1e293b;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #22c55e;
  margin-top: 4px;
}
</style>