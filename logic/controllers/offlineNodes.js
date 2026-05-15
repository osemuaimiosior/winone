// Run this periodically (e.g., every 1 minute) to mark stale nodes offline.
// If lastHeartbeat is older than 3 minutes, set nodeStatus = 'offline'.

const { Op } = require('sequelize');
const nodeState = require("../config/model/nodeHeartBeat");

async function markOfflineNodes() {
  try {
    // Current time minus 3 minutes
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

    // Update all nodes whose lastHeartbeat is older than 3 minutes
    const [updatedCount] = await nodeState.update(
      {
        nodeStatus: 'offline',
        jobStatus: 'idle', // optional: reset job status
      },
      {
        where: {
          lastHeartbeat: {
            [Op.lt]: threeMinutesAgo, // older than 3 minutes
          },
          nodeStatus: {
            [Op.ne]: 'offline', // only update nodes not already offline
          },
        },
      }
    );

    if (updatedCount > 0) {
      console.log(`Marked ${updatedCount} node(s) as offline.`);
    }

    console.log(`Crawed the network to set ${updatedCount} stall node(s) to offline status.`);

  } catch (error) {
    console.error('Failed to mark offline nodes:', error);
  }
}

module.exports = {
    markOfflineNodes
};