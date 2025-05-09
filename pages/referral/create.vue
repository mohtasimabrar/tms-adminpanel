<template>
    <div class="px-2 py-2 sm:px-3 lg:px-4 w-full">
        <h2 class="text-2xl font-bold">Create Referral</h2>

        <h3 class="pl-1 pt-3">Referral Information</h3>
        <div class="formgrid grid bg-white p-3 border-round pt-4 mx-1">
            <div class="field col-12 md:col-6">
                <label>Referral Code</label>
                <GlobalInputText v-model="referralInfo.referralCode" placeholder="Enter Referral Code" />
            </div>
            <div class="field col-12 md:col-6">
                <label>Referral Discount</label>
                <GlobalInputText v-model="referralInfo.referralDiscount" placeholder="Enter Referral Discount Amount" />
            </div>
            <div class="field col-12 md:col-6">
                <label>Event ID</label>
                <select v-model="referralInfo.eventId" class="p-inputtext p-component w-full">
                    <option v-for="event in events.data" :key="event.eventId" :value="event.eventId">
                        {{ event.eventName }}
                    </option>
                </select>
            </div>
            <div class="field col-12 md:col-6">
                <label>Referral Type</label>
                <br>
                <select v-model="referralInfo.referralType" class="p-inputtext p-component w-full">
                    <option value="1">Default</option>
                    <option value="2">Custom</option>
                </select>
            </div>

            <div class="field col-12 md:col-10"></div>
            <div class="field col-12 md:col-2">
                <GlobalButton title="Add Referral" class="mt-5" @buttonTapped="addReferral" />
            </div>

        </div>

    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})

/* generate a variable for this {
    "referralCode": "DHAKAVIBES350",
    "referralDiscount": 350,
    "eventId": "dhakavibes",
    "referralType": 2
} */

const referralInfo = ref({
    referralCode: "",
    referralDiscount: 0.0,
    eventId: "",
    referralType: 2
})

const userToken = useCookie('token')
const token = "Bearer " + userToken.value

const { data: events } = await useFetch('https://api.countersbd.com/api/v1/event/admin/all', {
    headers: {
        "Authorization": token
    },
    method: 'get'
})

console.log("eventesssssss");
console.log(events);


const addReferral = async () => {
    console.log(referralInfo)
    const { data: responseData } = await useFetch('https://api.countersbd.com/api/v1/referral/create', {
        headers: {
            "Authorization": token
        },
        method: 'post',
        body: referralInfo
    })
    console.log(responseData)
    if (responseData.value.responseCode === 200) {
        navigateTo("/referral")
    }
};
</script>