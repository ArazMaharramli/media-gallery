<template>
  <div class="max-w-2xl mx-auto">
    <!-- Page Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Create New Event</h1>
      <p class="mt-2 text-gray-600">Start by creating an event to share your photos and videos</p>
    </div>

    <!-- Create Event Form -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <form class="space-y-6">
        <!-- Event Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">
            Event Name *
          </label>
          <input
            type="text"
            id="name"
            placeholder="e.g., John & Jane Wedding"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <!-- Event Date -->
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700">
            Event Date *
          </label>
          <input
            type="date"
            id="date"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows="3"
            placeholder="Optional description for your event..."
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>

    <!-- Info Section -->
    <div class="mt-8 bg-blue-50 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-800">What happens next?</h3>
      <ul class="mt-2 text-sm text-blue-700 space-y-1">
        <li>1. You'll be taken to your event dashboard</li>
        <li>2. Upload your photos and videos</li>
        <li>3. Share a link with your clients to view the gallery</li>
        <li>4. Optionally, share an upload link for guests to contribute</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Create Event - Media Gallery'
})
</script>
