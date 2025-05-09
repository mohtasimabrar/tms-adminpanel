<template>
    <div class="px-2 py-2 sm:px-3 lg:px-4 w-full">
        <h2 class="text-2xl font-bold">Create User</h2>

        <h3 class="pl-1 pt-3">User Information</h3>
        <div class="formgrid grid bg-white p-3 border-round pt-4 mx-1">
            <div class="field col-12 md:col-6">
                <label>User Name</label>
                <GlobalInputText v-model="userInfo.userName" placeholder="Name" />
            </div>
            <div class="field col-12 md:col-6">
                <label>Email</label>
                <GlobalInputText v-model="userInfo.email" placeholder="Email" />
            </div>
            <div class="field col-12 md:col-6">
                <label>Phone Number</label>
                <GlobalInputText v-model="userInfo.phoneNumber" placeholder="Phone Number" />
            </div>
            <div class="field col-12 md:col-6">
                <label>Password</label>
                <GlobalInputText type="password" v-model="userInfo.password" placeholder="Password" />
            </div>

            <div class="field col-12 md:col-6">
                <label>Role</label>
                <select v-model="userInfo.role" class="w-full p-2 border rounded shadow-sm">
                    <option disabled value="">Select Role</option>
                    <option value=1>User</option>
                    <option value=2>Admin</option>
                </select>
            </div>

            <div class="field col-12 md:col-10"></div>
            <div class="field col-12 md:col-2">
                <GlobalButton title="Add User" class="mt-5" @buttonTapped="addUser" />
            </div>

        </div>

    </div>
</template>

<script setup>
import { ref } from 'vue';

definePageMeta({
    middleware: 'auth'
})

const userInfo = ref({
    email: "",
    password: "",
    phoneNumber: "",
    userName: "",
    userRole: "" // Role will be set to 1 for User or 2 for Admin based on the selection
})

const addUser = async () => {
    const userToken = useCookie('token')
    const token = "Bearer " + userToken.value
    console.log(token)
    console.log(userInfo)
    const { data: responseData } = await useFetch('https://api.countersbd.com/api/v1/admin/signup', {
        headers: {
            "Authorization": token
        },
        method: 'post',
        body: userInfo
    })
    console.log(responseData)
};
</script>
