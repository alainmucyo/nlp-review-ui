<!-- File: src/App.vue -->

<template>
  <div>
    <nav class="bg-gray-800 p-4">
      <div class="container mx-auto flex justify-between">
        <ul class="flex space-x-4">
          <li>
            <router-link to="/stakeholders" class="text-white hover:text-gray-300">Stakeholders</router-link>
          </li>
          <li>
            <router-link to="/ratings" class="text-white hover:text-gray-300">Ratings</router-link>
          </li>
        </ul>
        <span v-if="username" class="text-white ">Logged in as {{ username }}</span>
      </div>
    </nav>
    <div
        v-if="!username"
        class="fixed inset-0 bg-gray-900 bg-opacity-100 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded shadow-md">
        <h2 class="text-lg font-bold mb-4">Enter Your Username</h2>
        <input
            v-model="tempUsername"
            type="text"
            placeholder="Username"
            class="border p-2 w-full mb-4 rounded"
        />
        <button
            @click="setUsername"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Confirm
        </button>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: null,
      tempUsername: "",
    };
  },
  methods: {
    setUsername() {
      if (this.tempUsername.trim() === "") {
        alert("Username cannot be empty!");
        return;
      }
      this.username = this.tempUsername;
      localStorage.setItem("username", this.username); // Store in localStorage
    },
  },
  mounted() {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      this.username = storedUsername; // Retrieve username from localStorage
    }
  },
};
</script>

<style>
/* Add some styling for the modal */
</style>