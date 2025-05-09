<template>
    <div class="px-2 py-2 sm:px-3 lg:px-4 w-full">
        <h2 class="text-xl font-bold pb-2">Events</h2>

        <!-- Search Input -->
        <div class="mb-4">
            <input type="text" v-model="searchTerm"
                placeholder="Search by Event Name, Owner Name, Owner Number, Owner Email, Transaction ID, or Applied Coupon"
                class="p-inputtext w-full" />
        </div>

        <div class="border-round" style="overflow: hidden;">
            <DataTable :value="filteredTickets" tableStyle="min-width: 50rem" paginator :rows="20"
                :rowsPerPageOptions="[20, 50]">
                <Column field="ticketId" header="Id"></Column>
                <Column field="eventName" header="Event Name"></Column>
                <Column field="ticketOwnerName" header="Owner Name"></Column>
                <Column field="ticketOwnerNumber" header="Owner Number"></Column>
                <Column field="ticketOwnerEmail" header="Owner Email"></Column>
                <Column field="ticketTransactionId" header="Transaction ID"></Column>
                <Column field="used" header="Ticket Used"></Column>
                <Column field="appliedCoupon" header="Applied Coupon"></Column>

                <!-- Actions Column with Download and Edit Buttons -->
                <Column header="Actions">
                    <template #body="slotProps">
                        <button @click="downloadTicket(slotProps.data.ticketId)"
                            class="px-3 py-2 text-white bg-green-500 rounded mr-2">
                            Download PDF
                        </button>
                    </template>
                </Column>
            </DataTable>

            <!-- Placeholder for No Data -->
            <div v-if="filteredTickets.length === 0" class="text-center py-4">
                <p>No data available.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

definePageMeta({
    middleware: 'auth'
})

// Define the token and fetch data
const userToken = useCookie('token');
const token = "Bearer " + userToken.value;

const tickets = ref([]); // Use ref to make tickets reactive
const searchTerm = ref(''); // Reactive property for the search input
const loadingTickets = ref([]); // Track loading state for tickets

// Fetch data
const { data } = await useFetch('https://api.countersbd.com/api/v1/ticket/admin-all', {
    headers: {
        "Authorization": token
    },
    method: 'get'
});

// Log the response to understand its structure
console.log('Fetched data:', data.value); // Check the structure of the fetched data

// Assuming the API response contains an array of tickets under the 'data' key
if (data.value && Array.isArray(data.value.data)) {
    tickets.value = data.value.data; // Update this line to access the tickets array correctly
} else {
    tickets.value = []; // Default to an empty array if no tickets found
}

// Computed property to filter tickets based on search term
const filteredTickets = computed(() => {
    if (!searchTerm.value) {
        return tickets.value; // Return all tickets if search term is empty
    }

    const seenTransactionIds = new Set(); // Track seen transaction IDs
    const filtered = tickets.value.filter(ticket => {
        const matchesSearch = (
            ticket.eventName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            ticket.ticketOwnerName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            ticket.ticketOwnerNumber.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            ticket.ticketOwnerEmail.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            ticket.ticketTransactionId.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            ticket.appliedCoupon.toLowerCase().includes(searchTerm.value.toLowerCase())
        );

        if (matchesSearch) {
            // Check if the ticketTransactionId has been seen
            if (seenTransactionIds.has(ticket.ticketTransactionId)) {
                ticket.ticketPrice = ''; // Clear the price for duplicate transaction IDs
            } else {
                seenTransactionIds.add(ticket.ticketTransactionId); // Add to seen set
            }
        }

        return matchesSearch; // Return whether the ticket matches the search
    });

    // If only one ticket is found, keep its price
    if (filtered.length === 1) {
        const singleTicket = filtered[0];
        singleTicket.ticketPrice = singleTicket.ticketPrice; // Retain the price
    }

    return filtered; // Return the filtered tickets
});

// Download ticket function
function downloadTicket(ticketId) {
    loadingTickets.value.push(ticketId); // Start loading for this ticket
    useFetch(`https://api.countersbd.com/api/v1/ticket/download-pdf?ticketId=${ticketId}`, {
        headers: {
            "Authorization": token,
        },
        method: "GET",
        responseType: "blob" // Important for handling binary files like PDFs
    }).then(res => {
        const data = res.data.value;
        const error = res.error.value;
        if (error) {
            toast.add({ severity: 'error', summary: 'Error!', detail: error.data.message, life: 3000 });
        } else {
            // Create a blob from the response and download the file
            const blob = new Blob([data], { type: "application/pdf" });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `ticket_${ticketId}.pdf`;
            link.click();
        }
    }).catch(error => {
        toast.add({ severity: 'error', summary: 'Error!', detail: error.data.message, life: 3000 });
    }).finally(() => {
        loadingTickets.value = loadingTickets.value.filter(id => id !== ticketId); // Stop loading
    });
}
</script>

<style scoped>
/* Reduce font size for the DataTable */
.p-datatable,
.p-datatable-header,
.p-datatable-tbody>tr>td,
.p-datatable-tbody>tr>th {
    font-size: 0.875rem;
    /* Smaller font size */
}

h2 {
    font-size: 1.5rem;
    /* Smaller header size */
}
</style>
