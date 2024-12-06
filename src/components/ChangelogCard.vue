<template>
  <div class="bg-white shadow-lg rounded-lg p-4 overflow-y-auto" style="max-height: 600px">
    <h2 class="text-xl font-bold mb-4">Changelogs</h2>
    <ul>
      <li v-for="log in changelogs" :key="log.id" class="mb-3">
        <div class="flex justify-between items-center">
          <p class="text-gray-800">{{ formatMessage(log) }}</p>
          <span class="text-sm text-gray-500">{{ formatTime(log.timestamp) }}</span>
        </div>
        <hr class="mt-2">
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default {
  name: 'ChangelogCard',
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      changelogs: [],
      socket: null,
      reconnectionInterval: null,
    };
  },
  methods: {
    /**
     * Fetch initial changelogs for the project.
     */
    async fetchChangelogs() {
      try {
        const response = await axios.get(`https://nlp-review-wild-sunset-3976.fly.dev/api/v1/projects/${this.projectId}/changelogs`, {
          params: {
            limit: 50,   // Adjust as needed
            offset: 0,   // Adjust as needed
          },
        });
        this.changelogs = response.data.changelogs;
        console.log('Fetched changelogs:', this.changelogs);
      } catch (error) {
        console.error('Failed to fetch changelogs:', error);
      }
    },

    /**
     * Format the changelog message based on action type.
     * @param {Object} log - Changelog entry.
     * @returns {String} - Formatted message.
     */
    formatMessage(log) {
      const { user_id, action_type, action_details } = log;
      let message = '';

      // Determine the type: 'person' or 'rating'
      const type = action_details.type;

      switch (action_type) {
        case 'approve':
          if (type === 'person') {
            if (action_details.data && action_details.data.name) {
              message = `${user_id} approved stakeholder ${action_details.data.name}.`;
            } else {
              message = `${user_id} approved a stakeholder.`;
            }
          } else if (type === 'rating') {
            if (action_details.data && action_details.data.value && typeof action_details.data.rating === 'number') {
              message = `${user_id} approved rating "${action_details.data.value}" with a score of ${action_details.data.rating}.`;
            } else {
              message = `${user_id} approved a rating.`;
            }
          }
          break;
        case 'reject':
          if (type === 'person') {
            if (action_details.data && action_details.data.name) {
              message = `${user_id} rejected stakeholder ${action_details.data.name}.`;
            } else {
              message = `${user_id} rejected a stakeholder.`;
            }
          } else if (type === 'rating') {
            if (action_details.data && action_details.data.value && typeof action_details.data.rating === 'number') {
              message = `${user_id} rejected rating "${action_details.data.value}" with a score of ${action_details.data.rating}.`;
            } else {
              message = `${user_id} rejected a rating.`;
            }
          }
          break;
        case 'merge':
          if (type === 'person') {
            if (action_details.merged_segments && action_details.merged_segments.length > 0) {
              const names = action_details.merged_segments.map(seg => seg.data.name).join(', ');
              message = `${user_id} merged stakeholders ${names}.`;
            } else {
              message = `${user_id} merged stakeholders.`;
            }
          } else if (type === 'rating') {
            if (action_details.merged_segments && action_details.merged_segments.length > 0) {
              const values = action_details.merged_segments.map(seg => `"${seg.data.value}"`).join(', ');
              message = `${user_id} merged ratings ${values}.`;
            } else {
              message = `${user_id} merged ratings.`;
            }
          }
          break;
        case 'unmerge':
          if (type === 'person') {
            if (action_details.restored_ids && action_details.restored_ids.length > 0) {
              // Assuming you have a way to fetch restored names based on IDs
              message = `${user_id} unmerged stakeholders ${action_details.data.name}.`;
            } else {
              message = `${user_id} unmerged a stakeholder.`;
            }
          } else if (type === 'rating') {
            if (action_details.restored_ids && action_details.restored_ids.length > 0) {
              // Assuming you have a way to fetch restored values based on IDs
              message = `${user_id} unmerged value ${action_details.data.value}.`;
            } else {
              message = `${user_id} unmerged a rating.`;
            }
          }
          break;
        default:
          message = `${user_id} performed an action: ${action_type}.`;
      }

      return message;
    },
    /**
     * Format the timestamp to a relative time string.
     * @param {String} timestamp - ISO timestamp.
     * @returns {String} - Relative time (e.g., "2 hours ago").
     */
    formatTime(timestamp) {
      return dayjs(timestamp).fromNow();
    },

    /**
     * Handle incoming WebSocket messages.
     * @param {MessageEvent} event - WebSocket message event.
     */
    handleWebSocketMessage(event) {
      const message = JSON.parse(event.data);
      const action = message.action;

      if (action == "changelog"){
        this.changelogs.unshift(message.changelog);
        if (this.changelogs.length > 50) {
          this.changelogs.pop();
        }
      }
    },

    /**
     * Establish WebSocket connection for real-time updates.
     */
    connectWebSocket() {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `wss://nlp-review-wild-sunset-3976.fly.dev/ws`;
      this.socket = new WebSocket(wsUrl);

      // Listen for messages
      this.socket.addEventListener('message', this.handleWebSocketMessage);

      // Handle connection open
      this.socket.addEventListener('open', () => {
        console.log('WebSocket connection established (ChangelogCard)');
        // Optionally, subscribe to project-specific updates
        this.socket.send(JSON.stringify({ action: 'subscribe', project_id: this.projectId }));
        if (this.reconnectionInterval) {
          clearInterval(this.reconnectionInterval);
          this.reconnectionInterval = null;
        }
      });

      // Handle connection close
      this.socket.addEventListener('close', () => {
        console.log('WebSocket connection closed (ChangelogCard), attempting to reconnect...');
        this.scheduleReconnection();
      });

      // Handle errors
      this.socket.addEventListener('error', (error) => {
        console.error('WebSocket error (ChangelogCard):', error);
        this.socket.close();
      });
    },

    /**
     * Schedule WebSocket reconnection attempts.
     */
    scheduleReconnection() {
      if (!this.reconnectionInterval) {
        this.reconnectionInterval = setInterval(() => {
          console.log('Attempting to reconnect WebSocket (ChangelogCard)...');
          this.connectWebSocket();
        }, 5000); // Reconnect every 5 seconds
      }
    },
  },
  mounted() {
    this.fetchChangelogs();
    this.connectWebSocket();
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.close();
    }
    if (this.reconnectionInterval) {
      clearInterval(this.reconnectionInterval);
    }
  },
};
</script>

<style scoped>
/* Optional: Add custom styles if needed */
</style>