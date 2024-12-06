<!-- File: src/components/SegmentActions.vue -->

<template>
  <div class="flex space-x-2">
    <button
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        @click="approveSegment"
        :disabled="currentStatus === 'approved'"
    >
      Approve
    </button>
    <button
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        @click="rejectSegment"
        :disabled="currentStatus === 'rejected'"
    >
      Reject
    </button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    segmentId: {
      type: String,
      required: true,
    },
    currentStatus: {
      type: String,
      required: true,
    },
  },
  methods: {
    async approveSegment() {
      try {
        await axios.post(`https://nlp-review-wild-sunset-3976.fly.dev/api/v1/segments/${this.segmentId}/approve`, {
          user_id: 'demo_user',
        });
        this.$emit('updated');
      } catch (error) {
        console.error('Failed to approve segment:', error);
      }
    },
    async rejectSegment() {
      try {
        await axios.post(`https://nlp-review-wild-sunset-3976.fly.dev/api/v1/segments/${this.segmentId}/reject`, {
          user_id: 'demo_user',
        });
        this.$emit('updated');
      } catch (error) {
        console.error('Failed to reject segment:', error);
      }
    },
  },
};
</script>