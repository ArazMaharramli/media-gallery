<template>
  <div class="max-w-2xl mx-auto">
    <!-- Page Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Create New Event</h1>
      <p class="mt-2 text-gray-600">Start by creating an event to share your photos and videos</p>
    </div>

    <!-- Create Event Form -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Event Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">
            Event Name *
          </label>
          <input
            v-model="form.name"
            type="text"
            id="name"
            placeholder="e.g., John & Jane Wedding"
            maxlength="100"
            required
            class="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
            :class="errors.name
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          <p class="mt-1 text-xs text-gray-500">{{ form.name.length }}/100 characters</p>
        </div>

        <!-- Event Date -->
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700">
            Event Date *
          </label>
          <input
            v-model="form.date"
            type="date"
            id="date"
            required
            class="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
            :class="errors.date
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'"
          />
          <p v-if="errors.date" class="mt-1 text-sm text-red-600">{{ errors.date }}</p>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            v-model="form.description"
            id="description"
            rows="3"
            placeholder="Optional description for your event..."
            maxlength="500"
            class="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
            :class="errors.description
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'"
          ></textarea>
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
          <p class="mt-1 text-xs text-gray-500">{{ form.description.length }}/500 characters</p>
        </div>

        <!-- Error Message -->
        <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-md p-4">
          <p class="text-sm text-red-600">{{ submitError }}</p>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Creating...' : 'Create Event' }}
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
const router = useRouter()

const form = reactive({
  name: '',
  date: '',
  description: ''
})

const errors = reactive({
  name: '',
  date: '',
  description: ''
})

const isSubmitting = ref(false)
const submitError = ref('')

function validate(): boolean {
  let isValid = true

  // Reset errors
  errors.name = ''
  errors.date = ''
  errors.description = ''

  // Validate name
  if (!form.name.trim()) {
    errors.name = 'Event name is required'
    isValid = false
  } else if (form.name.length > 100) {
    errors.name = 'Event name must be 100 characters or less'
    isValid = false
  }

  // Validate date
  if (!form.date) {
    errors.date = 'Event date is required'
    isValid = false
  }

  // Validate description
  if (form.description.length > 500) {
    errors.description = 'Description must be 500 characters or less'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const response = await $fetch('/api/events', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        date: form.date,
        description: form.description.trim() || null
      }
    })

    // Redirect to event dashboard (response.data contains the created event)
    await router.push(`/event/${response.data.id}`)
  } catch (error: any) {
    submitError.value = error.data?.error?.message || 'Failed to create event. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

useHead({
  title: 'Create Event - Media Gallery'
})
</script>
