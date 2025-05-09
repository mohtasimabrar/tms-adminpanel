<template>
    <div class="px-2 py-2 sm:px-3 lg:px-4 w-full">
        <h2 class="text-2xl font-bold pb-2">Events</h2>
        <div class="border-round" style="overflow: hidden;">
            <DataTable :value="events.data" tableStyle="min-width: 50rem" paginator :rows="20"
                :rowsPerPageOptions="[20, 50]">
                <Column field="eventId" header="Id"></Column>
                <Column field="eventName" header="Event Name"></Column>
                <Column field="eventCapacity" header="Event Capacity"></Column>
                <Column field="eventAvailableTickets" header="Available Tickets"></Column>
                <Column field="eventStartDate" header="Start Date"></Column>
                <Column field="eventEndDate" header="End Date"></Column>
                <Column field="categoryList" header="Categories">
                    <template #body="{ data }">
                        <DataTable :value="data.categoryList" tableStyle="min-width: 20rem" size="small" showGridlines>
                            <Column field="categoryName" header="Name"></Column>
                            <Column field="categoryDescription" header="Desc"></Column>
                            <Column field="categoryCapacity" header="Capacity"></Column>
                            <Column field="categoryAvailableCount" header="Available"></Column>
                            <Column field="categoryPrice" header="Price"></Column>
                        </DataTable>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})

const userToken = useCookie('token')
const token = "Bearer " + userToken.value

const { data: events } = await useFetch('https://api.countersbd.com/api/v1/event/admin/all', {
    headers: {
        "Authorization": token
    },
    method: 'get'
})
</script>

<style scoped>
.p-component {
    border-radius: 0px !important;
}
</style>