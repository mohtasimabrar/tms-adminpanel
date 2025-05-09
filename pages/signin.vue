<template>
  <div class="bg-gray-100 flex flex-column flex-wrap justify-content-center align-content-center align-items-center"
    style="height: 100%; min-height: 100vh">
    <img src="~/assets/Logo.png" alt="" class="max-w-18rem mb-5">
    <div class="card flex flex-column p-7 bg-white border-round shadow-2" style="height: 30%; width: 20%;">
      <GlobalInputText type="text" v-model="email" placeholder="Email" class="w-full mb-2 border-round" />
      <GlobalInputText type="password" v-model="password" placeholder="Password" class="w-full mb-4 border-round" />
      <GlobalButton @buttonTapped="handleButtonTap" title="Sign In" :disabled="false" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isAuthenticatedState } from '~/composables/state';

definePageMeta({
  layout: 'auth'
})
const email = ref(null);
const password = ref(null);

const handleButtonTap = () => {
  onSubmit()
};

const onSubmit = async () => {
  const { data: responseData } = await useFetch('https://api.countersbd.com/api/v1/auth/admin/token', {
    method: 'post',
    body: {
      email: email.value,
      password: password.value,
      userRole: email.value === 'superadmin' ? 0 : 2
    }
  });

  if (responseData.value.responseCode === 200) {
    const userToken = useCookie('token');
    userToken.value = responseData.value.data.token;

    const userRole = useCookie('userRole');
    userRole.value = email.value === 'superadmin' ? 0 : 2;

    const isAuthenticated = isAuthenticatedState();
    isAuthenticated.value = true;

    navigateTo("/");
  }
};


</script>

<style></style>