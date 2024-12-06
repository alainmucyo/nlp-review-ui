<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Ratings</h1>
    <div class="flex space-x-2 mb-4">
      <button
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          @click="approveSelectedSegments"
          :disabled="selectedSegments.length === 0"
      >
        Approve Selected
      </button>
      <button
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          @click="rejectSelectedSegments"
          :disabled="selectedSegments.length === 0"
      >
        Reject Selected
      </button>
      <button
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          @click="openMergeModal"
          :disabled="selectedSegments.length < 2"
      >
        Merge Selected
      </button>
      <button
          class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          @click="unmergeSelectedSegments"
          :disabled="selectedSegments.length === 0"
      >
        Unmerge Selected
      </button>
    </div>
    <div
        v-if="showMergeModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-lg p-6 w-1/3">
        <h2 class="text-xl font-bold mb-4">Merge Ratings</h2>
        <p class="mb-4">Enter the new value for the merged rating:</p>
        <input
            v-model="newMergedValue"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            placeholder="New Value"
        />
        <div class="flex justify-end space-x-2">
          <button
              class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              @click="closeMergeModal"
          >
            Cancel
          </button>
          <button
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              @click="confirmMerge"
              :disabled="!newMergedValue"
          >
            Merge
          </button>
        </div>
      </div>
    </div>
    <div class="flex items-start">
      <table class="w-2/3 bg-white border border-gray-300 rounded-lg shadow-md">
        <thead>
        <tr class="bg-gray-100">
          <th class="py-2 px-4 text-left">
            <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected"/>
          </th>
          <th class="py-2 px-4 text-left">ID</th>
          <th class="py-2 px-4 text-left">Value</th>
          <th class="py-2 px-4 text-left">Rating</th>
          <th class="py-2 px-4 text-left">Status</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="segment in segments"
            :key="segment.id"
            class="border-t border-gray-200"
        >
          <td class="py-2 px-4">
            <input
                type="checkbox"
                :value="segment.id"
                v-model="selectedSegments"
            />
          </td>
          <td class="py-2 px-4">{{ segment.id }}</td>
          <td class="py-2 px-4">{{ segment.data.value }}</td>
          <td class="py-2 px-4">{{ segment.data.rating }}</td>
          <td class="py-2 px-4 capitalize"
              :class="[
              segment.status === 'pending' ? 'text-yellow-800' :
              segment.status === 'approved' ? 'text-green-800' :
              segment.status === 'rejected' ? 'text-red-800' : ''
            ]"
          >
            {{ segment.status }}
          </td>
        </tr>
        </tbody>
      </table>
      <div class="ml-5 items-start max-h-96">
        <changelog-card project-id="a3e6f1a7-f7db-4f1b-aec8-2b669ec92dd6"/>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ChangelogCard from "@/components/ChangelogCard.vue";

export default {
  name: 'Ratings',
  components: {ChangelogCard},
  data() {
    return {
      segments: [],
      selectedSegments: [],
      showMergeModal: false, // Controls modal visibility
      newMergedValue: '',
      username: '',
    };
  },
  computed: {
    isAllSelected() {
      return this.selectedSegments.length === this.segments.length && this.segments.length > 0;
    },
  },
  methods: {
    async fetchSegments() {
      try {
        const response = await axios.get('https://nlp-review-wild-sunset-3976.fly.dev/api/v1/segments', {
          params: {
            type: 'rating',
          },
        });
        this.segments = response.data.segments;
        // Reset selected segments
        this.selectedSegments = [];
      } catch (error) {
        console.error('Failed to fetch segments:', error);
      }
    },
    toggleSelectAll(event) {
      if (event.target.checked) {
        this.selectedSegments = this.segments.map((segment) => segment.id);
      } else {
        this.selectedSegments = [];
      }
    },
    async approveSelectedSegments() {
      try {
        await axios.post('https://nlp-review-wild-sunset-3976.fly.dev/api/v1/segments/approve', {
          user_id: this.username,
          segment_ids: this.selectedSegments,
        });
      } catch (error) {
        console.error('Failed to approve segments:', error);
      }
    },
    async rejectSelectedSegments() {
      try {
        await axios.post('https://nlp-review-wild-sunset-3976.fly.dev/api/v1/segments/reject', {
          user_id: this.username,
          segment_ids: this.selectedSegments,
        });
      } catch (error) {
        console.error('Failed to reject segments:', error);
      }
    },
    openMergeModal() {
      this.newMergedValue = '';
      this.showMergeModal = true;
    },

    // Close the modal dialog
    closeMergeModal() {
      this.showMergeModal = false;
    },

    // Confirm merge action with new value
    async confirmMerge() {
      try {
        // Prepare merged data (calculate average rating)
        const selectedSegmentsData = this.segments.filter((segment) =>
            this.selectedSegments.includes(segment.id)
        );

        // Calculate the average rating
        let totalRating = 0;
        let ratingCount = 0;

        selectedSegmentsData.forEach((segment) => {
          const rating = segment.data.rating;
          if (rating !== null && rating !== undefined) {
            totalRating += rating;
            ratingCount += 1;
          }
        });

        const averageRating = totalRating / ratingCount;

        const mergedData = {
          value: this.newMergedValue,
          rating: averageRating,
        };

        // Send merge request to backend
        await axios.post('https://nlp-review-wild-sunset-3976.fly.dev/api/v1/segments/merge', {
          user_id: this.username,
          segment_ids: this.selectedSegments,
          merged_data: mergedData,
        });

        alert('Segments merged successfully');
        this.closeMergeModal();
      } catch (error) {
        console.error('Failed to merge segments:', error);
      }
    },

    async unmergeSelectedSegments() {
      try {
        // Send unmerge requests for each selected segment
        for (const segmentId of this.selectedSegments) {
          await axios.post(`https://nlp-review-wild-sunset-3976.fly.dev/api/v1/segments/${segmentId}/unmerge`, {
            user_id: this.username,
          });
        }
        alert('Segments unmerged successfully');
      } catch (error) {
        console.error('Failed to unmerge segments:', error);
      }
    },

    handleWebSocketMessage(event) {
      const message = JSON.parse(event.data);
      const action = message.action;

      if (action === 'approve' || action === 'reject') {
        const updatedSegments = message.segments;
        updatedSegments.forEach((updatedSegment) => {
          const index = this.segments.findIndex(
              (segment) => segment.segment_id === updatedSegment.segment_id
          );
          if (index !== -1) {
            this.segments[index] = updatedSegment;
          }
        });
      } else if (action === 'merge') {
        this.fetchSegments();
        //this.handleMergeAction(message);
      } else if (action === 'unmerge') {
        this.fetchSegments();
        //this.handleUnmergeAction(message);
      }
    },
  },

  mounted() {
    this.username = localStorage.getItem('username');
    this.fetchSegments();

    // Establish WebSocket connection
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `wss://nlp-review-wild-sunset-3976.fly.dev/ws`;

    this.socket = new WebSocket(wsUrl);

    this.socket.addEventListener('message', this.handleWebSocketMessage);

    this.socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
    });

    this.socket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
    });

    this.socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
  },
  beforeUnmount() {
    // Clean up the WebSocket connection
    if (this.socket) {
      this.socket.close();
    }
  },
};
</script>