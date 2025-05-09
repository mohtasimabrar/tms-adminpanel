<template>
    <div class="flex flex-row">
        <div class="w-2">
            <MainMenu />
        </div>

        <slot />
    </div>
</template>

<script setup>
const userToken = useCookie('token')
const token = "Bearer " + userToken.value
console.log(token)
const { data: responseData } = await useFetch('https://api.countersbd.com/api/v1/admin/me', {
    headers: {
        "Authorization": token
    },
    method: 'get'
})
if (responseData.value === null) {
    console.log('not fine')
    navigateTo("/signin")
}
if (responseData.value.responseCode === 200) {
    console.log('fine from layout')
} else {
    console.log('not fine')
    navigateTo("/signin")
}

</script>

<style></style>