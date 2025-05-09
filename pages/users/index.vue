<template>
    <div class="px-2 py-2 sm:px-3 lg:px-4 w-full">
        <h2 class="text-2xl font-bold pb-2">Users</h2>
        <div class="border-round" style="overflow: hidden;">
            <DataTable :value="users.data" tableStyle="min-width: 50rem" paginator :rows="20"
                :rowsPerPageOptions="[20, 50]">
                <Column field="emailId" header="Email"></Column>
                <Column field="phoneNumber" header="Phone Number"></Column>
                <Column field="userName" header="User Name"></Column>
                <Column field="numberOfTickets" header="Total Tickets Bought"></Column>
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
console.log(token)
const { data: users } = await useFetch('https://api.countersbd.com/api/v1/admin/users/list', {
    headers: {
        "Authorization": token
    },
    method: 'get'
})
console.log("usersssss")
console.log(users)
if (users.value === null) {
    console.log('not fine')
    navigateTo("/signin")
}
// if (users.value.responseCode === 200) {
//     console.log('fine')
// } else {
//     console.log('not fine')
//     navigateTo("/signin")
// }
</script>

<style scoped>
.p-component {
    border-radius: 0px !important;
}
</style>