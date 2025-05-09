<template>
    <div class="px-2 py-2 sm:px-3 lg:px-4 w-full">
        <h2 class="text-2xl font-bold">Create Ticket</h2>

        <h3 class="pl-1 pt-3">Ticket Information</h3>
        <div class="formgrid grid bg-white p-3 border-round pt-4 mx-1">
            <!-- Event Selection -->
            <div class="field col-12 md:col-6">
                <label>Event</label>
                <select v-model="selectedEventId" @change="fetchCategoriesAndReferrals"
                    class="p-inputtext p-component w-full">
                    <option value="" disabled>Select an Event</option>
                    <option v-for="event in events" :key="event.eventId" :value="event.eventId">
                        {{ event.eventName }}
                    </option>
                </select>
            </div>

            <!-- Category Selection -->
            <div class="field col-12 md:col-6" v-if="categories.length > 0">
                <label>Category</label>
                <select v-model="selectedCategoryId" @change="updateCategory" class="p-inputtext p-component w-full">
                    <option value="" disabled>Select a Category</option>
                    <option v-for="category in categories" :key="category.categoryId" :value="category.categoryId">
                        {{ category.categoryName }} ({{ category.discountedPrice || category.categoryPrice }} BDT)
                    </option>
                </select>
            </div>

            <!-- Referral Selection -->
            <div class="field col-12 md:col-6" v-if="validCoupons.length > 0">
                <label>Referral</label>
                <select v-model="selectedReferralCode" @change="updateReferral" class="p-inputtext p-component w-full">
                    <option value="" disabled>Select a Referral</option>
                    <option v-for="referral in validCoupons" :key="referral.referralCode"
                        :value="referral.referralCode">
                        {{ referral.referralCode }}
                    </option>
                </select>
            </div>

            <!-- Number of Tickets -->
            <div class="field col-12 md:col-6">
                <label>Number of Tickets</label>
                <select v-model="ticketCount" @change="populateTicketOwners" class="p-inputtext p-component w-full">
                    <option v-for="num in 10" :key="num" :value="num">{{ num }}</option>
                </select>
            </div>

            <!-- Dynamic Ticket Owner Information -->
            <div class="col-12" v-for="(owner, index) in ticketOwners" :key="index">
                <!-- Header Row -->
                <div class="field col-12">
                    <h4>Ticket Owner {{ index + 1 }}</h4>
                </div>
                <!-- Input Fields Row -->
                <div class="grid align-items-center">
                    <div class="field col-12 md:col-4">
                        <label>Name</label>
                        <GlobalInputText v-model="owner.ticketOwnerName" placeholder="Enter Name" />
                    </div>
                    <div class="field col-12 md:col-4">
                        <label>Phone Number</label>
                        <GlobalInputText v-model="owner.ticketOwnerNumber" placeholder="Enter Phone Number" />
                    </div>
                    <div class="field col-12 md:col-4">
                        <label>Email</label>
                        <GlobalInputText v-model="owner.ticketOwnerEmail" placeholder="Enter Email" />
                    </div>
                </div>
            </div>

            <!-- Submit Button -->
            <div class="field col-12 md:col-10"></div>
            <div class="field col-12 md:col-2">
                <GlobalButton title="Add Ticket" class="mt-5" @buttonTapped="addTicket" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

definePageMeta({
    middleware: 'auth'
})

// Standalone fields for ticket information
const selectedEventId = ref("") // Stores the selected event ID
const selectedCategoryId = ref("") // Stores the selected category ID
const selectedReferralCode = ref("") // Stores the selected referral ID
const selectedEvent = ref(null) // Stores the selected event object
const selectedCategory = ref(null) // Stores the selected category object
const selectedReferral = ref(null) // Stores the selected referral object
const ticketPrice = ref(0.0) // Stores the ticket price
const ticketCount = ref(1) // Stores the number of tickets, default is 1

// Dynamic array for ticket owner information
const ticketOwners = ref([
    {
        ticketOwnerName: "",
        ticketOwnerNumber: "",
        ticketOwnerEmail: ""
    }
]) // Stores the list of ticket owner information, default is one user

// State for fetched data
const events = ref([]) // Stores the list of events
const categories = ref([]) // Stores the list of categories for the selected event
const validCoupons = ref([]) // Stores the list of valid referrals for the selected event

const toast = useToast() // For showing error/success notifications
const token = "Bearer " + useCookie('token').value // Auth token

// Fetch events on component load
const fetchEvents = async () => {
    try {
        const { data, error } = await useFetch('https://api.countersbd.com/api/v1/event/admin/all', {
            headers: {
                "Authorization": token
            },
            method: 'GET'
        });

        if (error.value) {
            toast.add({ severity: 'error', summary: 'Error!', detail: error.value.data.message, life: 3000 });
        } else {
            events.value = data.value?.data || [];
            console.log("Fetched Events:", events.value);
        }
    } catch (err) {
        console.error("API call failed", err);
        toast.add({ severity: 'error', summary: 'Error!', detail: 'Failed to fetch events', life: 3000 });
    }
};

// Fetch categories and referrals based on selected event
const fetchCategoriesAndReferrals = async () => {
    // Reset referral and category selections
    selectedReferralCode.value = ""; // Reset referral code
    selectedCategoryId.value = ""; // Reset category
    selectedCategory.value = null; // Clear selected category data
    selectedReferral.value = null; // Clear selected referral data
    ticketPrice.value = 0.0; // Reset ticket price

    // Find selected event
    selectedEvent.value = events.value.find(event => event.eventId === selectedEventId.value);

    if (selectedEvent.value) {
        // Fetch categories
        categories.value = selectedEvent.value.categoryList || [];

        // Fetch referrals
        await fetchReferral();
    } else {
        categories.value = [];
        validCoupons.value = [];
    }
};

// Fetch referrals for the selected event
const fetchReferral = async () => {
    console.log("Fetching referrals for event:", selectedEvent.value);
    try {
        const { data, error } = await useFetch(`https://api.countersbd.com/api/v1/referral/all?eventId=${selectedEvent.value.eventId}`, {
            headers: {
                "Authorization": token
            },
            method: "GET"
        });

        if (error.value) {
            toast.add({ severity: 'error', summary: 'Error!', detail: error.value.data.message, life: 3000 });
        } else if (data.value && data.value.responseCode === 200) {
            validCoupons.value = data.value.data.map((coupon) => ({
                id: coupon.id,
                referralCode: coupon.referralCode,
                referralDiscount: coupon.referralDiscount
            }));
        } else {
            toast.add({ severity: 'error', summary: 'Error!', detail: data.value.message, life: 3000 });
        }
    } catch (err) {
        console.error("API call failed", err);
        toast.add({ severity: 'error', summary: 'Error!', detail: 'Failed to fetch referrals', life: 3000 });
    }
};

const updateReferral = () => {
    selectedReferral.value = validCoupons.value.find(referral => referral.referralCode === selectedReferralCode.value) || null;
    console.log("Selected Referral:", selectedReferral.value);
};

// Populate ticket owner information dynamically
const populateTicketOwners = () => {
    ticketOwners.value = Array.from({ length: ticketCount.value }, () => ({
        ticketOwnerName: "",
        ticketOwnerNumber: "",
        ticketOwnerEmail: ""
    }));
};

// Update category
const updateCategory = () => {
    selectedCategory.value = categories.value.find(cat => cat.categoryId === selectedCategoryId.value);
    ticketPrice.value = selectedCategory.value?.discountedPrice || selectedCategory.value?.categoryPrice || 0.0;
};

// Add a ticket
const addTicket = async () => {
    const ticketData = {
        eventId: selectedEventId.value,
        ticketCategory: selectedCategoryId.value,
        referralId: selectedReferralCode.value, // Include referral ID in ticket data
        totalPrice: ticketPrice.value * ticketCount.value,
        couponCode: selectedReferral?.value?.referralCode || "", // Handle case when referral is null
        ticketOwnerInformation: ticketOwners.value
    };

    try {
        const { data, error } = await useFetch('https://api.countersbd.com/api/v1/ticket/admin/create', {
            headers: {
                "Authorization": token
            },
            method: 'POST',
            body: ticketData
        });

        if (error.value) {
            // Show error toast if API call fails
            toast.add({ severity: 'error', summary: 'Error!', detail: error.value.data.message, life: 3000 });
        } else if (data.value?.responseCode === 200) {
            // Show success message
            toast.add({ severity: 'success', summary: 'Success!', detail: data.value.message, life: 3000 });
            // Navigate to /online-tickets
            navigateTo("/online-tickets");
        } else {
            // Handle unexpected response
            toast.add({ severity: 'error', summary: 'Error!', detail: data.value.message, life: 3000 });
        }
    } catch (err) {
        // Handle any unexpected errors
        console.error("API call failed", err);
        toast.add({ severity: 'error', summary: 'Error!', detail: 'Failed to create ticket', life: 3000 });
    }
};

// Ensure fetchEvents is called when the component is mounted
onMounted(() => {
    fetchEvents();
    populateTicketOwners(); // Ensure default ticket owner is set on load
});

// Watch ticketCount to populate ticket owners dynamically
watch(ticketCount, populateTicketOwners);
</script>
