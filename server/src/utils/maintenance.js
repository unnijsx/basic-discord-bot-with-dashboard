const SystemConfig = require('../models/SystemConfig');
const Guild = require('../models/Guild');

/**
 * Check if the bot or a specific guild is under maintenance.
 * @param {string} guildId - The ID of the guild to check.
 * @param {string} userId - The ID of the user attempting the action (to bypass if super admin).
 * @returns {Promise<{active: boolean, reason: string}>}
 */
const checkMaintenance = async (guildId, userId) => {
    try {
        // 1. Check Global Maintenance
        const sysConfig = await SystemConfig.findById('GLOBAL');
        if (sysConfig && sysConfig.maintenanceMode) {
            const isAllowedGuild = sysConfig.allowedGuilds.includes(guildId);
            const isSuperAdmin = sysConfig.superAdmins.includes(userId);

            if (!isAllowedGuild && !isSuperAdmin) {
                return {
                    active: true,
                    reason: sysConfig.maintenanceReason || 'System is under global maintenance.',
                    type: 'GLOBAL'
                };
            }
        }

        // 2. Check Guild-Specific Maintenance (only if guildId is provided)
        if (guildId) {
            const guildConfig = await Guild.findOne({ guildId });
            if (guildConfig && guildConfig.maintenanceMode) {
                // Here you might want to allow Guild Admins to bypass.
                // For now, we enforce it strictly unless you add a bypass logic.
                return {
                    active: true,
                    reason: guildConfig.maintenanceReason || 'This server is under maintenance.',
                    type: 'GUILD'
                };
            }
        }

        return { active: false };
    } catch (error) {
        console.error('Maintenance Check Error:', error);
        // Fail open or closed? Safe to fail open (allow commands) if DB is down,
        // or fail closed (block) if critical?
        // Let's fail open but log it, to avoid blocking users during partial DB outage.
        return { active: false, error: true };
    }
};

module.exports = { checkMaintenance };
