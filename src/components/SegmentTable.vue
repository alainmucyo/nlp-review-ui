<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Segments</h1>
    <table class="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
      <thead>
      <tr class="bg-gray-100">
        <th class="py-2 px-4 text-left">ID</th>
        <th class="py-2 px-4 text-left">Type</th>
        <th class="py-2 px-4 text-left">Status</th>
        <th class="py-2 px-4 text-left">Data</th>
        <th class="py-2 px-4 text-left">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="segment in segments" :key="segment.id" class="border-t border-gray-200">
        <td class="py-2 px-4">{{ segment.id }}</td>
        <td class="py-2 px-4">{{ segment.type }}</td>
        <td class="py-2 px-4">{{ segment.status }}</td>
        <td class="py-2 px-4">
          <pre class="text-sm bg-gray-100 rounded p-2">{{ segment.data | json }}</pre>
        </td>
        <td class="py-2 px-4">
          <SegmentActions
              :segment-id="segment.id"
              :current-status="segment.status"
              @updated="fetchSegments"
          />
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
import SegmentActions from './SegmentActions.vue';

export default {
  components: {
    SegmentActions,
  },
  data() {
    return {
      segments: [],
    };
  },
  filters: {
    json(value) {
      return JSON.stringify(value, null, 2);
    },
  },
  methods: {
    async fetchSegments() {
      try {
        const response = await axios.get('https://nlp-review-wild-sunset-3976.fly.dev/api/v1/segments');
        this.segments = response.data.segments;
      } catch (error) {
        console.error('Failed to fetch segments:', error);
      }
    },
  },
  created() {
    this.fetchSegments();
  },
};
</script>