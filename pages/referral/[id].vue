<template>
    <div class="px-2 py-2 sm:px-3 lg:px-4 w-full">
        <h2 class="text-2xl font-bold">Create Referral</h2>

        <h3 class="pl-1 pt-3">Referral Information</h3>
        <div class="formgrid grid bg-white p-3 border-round pt-4 mx-1">
            <!-- Referral Code - Non-editable -->
            <div class="field col-12 md:col-6">
                <label>Referral Code</label>
                <GlobalInputText v-model="referralCode" placeholder="Enter Referral Code" readonly />
            </div>

            <!-- Referral Discount - Editable -->
            <div class="field col-12 md:col-6">
                <label>Referral Discount</label>
                <GlobalInputText v-model="referralDiscount" placeholder="Enter Referral Discount Amount" />
            </div>

            <!-- Event - Non-editable -->
            <div class="field col-12 md:col-6">
                <label>Event</label>
                <select v-model="eventId" class="p-inputtext p-component w-full" disabled>
                    <option v-for="event in events.data" :key="event.eventId" :value="event.eventId">
                        {{ event.eventName }}
                    </option>
                </select>
            </div>

            <div class="field col-12 md:col-6">
                <label>Referral Type</label>
                <br>
                <select v-model="referralType" class="p-inputtext p-component w-full">
                    <option value="1">Default</option>
                    <option value="2">Custom</option>
                </select>
            </div>

            <div class="field col-12 md:col-6">
                <label>Active</label>
                <br>
                <select v-model="isActive" class="p-inputtext p-component w-full">
                    <option value=true>True</option>
                    <option value=false>False</option>
                </select>
            </div>

            <div class="field col-12 md:col-10"></div>
            <div class="field col-12 md:col-2">
                <GlobalButton title="Update Referral" class="mt-5" @buttonTapped="addReferral" />
            </div>

        </div>
    </div>
</template>

<script setup>
// Get the ID from the route parameters
const { id } = useRoute().params

// Define the token and fetch data
const userToken = useCookie('token')
const token = "Bearer " + userToken.value

const referralCode = ref("")
const referralDiscount = ref(0.0)
const referralType = ref(2)
const isActive = ref(true)
const eventId = ref("")

// Fetch the referrals and events data
const { data: referrals } = await useFetch('https://api.countersbd.com/api/v1/referral/admin-all', {
    headers: {
        "Authorization": token
    },
    method: 'get'
})

const { data: events } = await useFetch('https://api.countersbd.com/api/v1/event/all')

// Find the selected referral by ID
const selectedReferral = ref()
if (id !== null) {
    selectedReferral.value = referrals.value.data.find((r) => r.id == id)
    if (selectedReferral.value) {
        referralCode.value = selectedReferral.value.referralCode
        referralDiscount.value = selectedReferral.value.referralDiscount
        referralType.value = selectedReferral.value.referralType
        isActive.value = selectedReferral.value.isActive
        eventId.value = selectedReferral.value.eventId
    }
}

const addReferral = async () => {
    const referralInfo = {
        id: selectedReferral.value.id,
        referralCode: referralCode.value,
        referralDiscount: referralDiscount.value,
        eventId: eventId.value,
        referralType: referralType.value,
        isActive: isActive.value
    }

    const { data: responseData } = await useFetch('https://api.countersbd.com/api/v1/referral/update', {
        headers: {
            "Authorization": token
        },
        method: 'post',
        body: referralInfo
    })

    if (responseData.value.responseCode === 200) {
        navigateTo("/referral")
    }
}
</script>
